// Face ID (iPhone) et empreinte (Android) via le capteur de l'appareil.
// On enregistre la clé publique WebAuthn, jamais une image du visage ou du doigt.
(function () {
  "use strict";

  function sensor() {
    var ua = navigator.userAgent || "";
    var iOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (iOS) return { kind: "face", icon: "face", name: "Face ID", confirm: "Confirmer avec Face ID", enroll: "Enregistrer Face ID" };
    if (/Android/i.test(ua)) return { kind: "fingerprint", icon: "fingerprint", name: "l'empreinte", confirm: "Confirmer avec l'empreinte", enroll: "Enregistrer l'empreinte" };
    return null;
  }
  function enrolled() {
    return !!(window.ACState && ACState.user.biometricEnrolled && ACState.prefs.biometric !== false);
  }
  function b64urlToBuf(value) {
    var s = String(value || "");
    var pad = "=".repeat((4 - (s.length % 4)) % 4);
    var b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }
  function bufToB64url(buf) {
    var bytes = new Uint8Array(buf);
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  function credJSON(cred) {
    if (cred.toJSON) return cred.toJSON();
    var r = cred.response;
    var json = {
      id: cred.id,
      rawId: bufToB64url(cred.rawId),
      type: cred.type,
      response: { clientDataJSON: bufToB64url(r.clientDataJSON) },
      clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {},
      authenticatorAttachment: cred.authenticatorAttachment || "platform"
    };
    if (r.attestationObject) json.response.attestationObject = bufToB64url(r.attestationObject);
    if (r.authenticatorData) json.response.authenticatorData = bufToB64url(r.authenticatorData);
    if (r.signature) json.response.signature = bufToB64url(r.signature);
    if (r.userHandle) json.response.userHandle = bufToB64url(r.userHandle);
    return json;
  }
  function fail(err) {
    if (err && err.ok === false) return err;
    var name = err && err.name;
    if (name === "NotAllowedError" || name === "AbortError") return { ok: false, message: "Confirmation annulée." };
    return { ok: false, message: "La biométrie de l'appareil n'a pas abouti." };
  }
  function call(body) {
    if (!window.YCBackend || !YCBackend.deviceAuth) return Promise.resolve({ ok: false, message: "Connectez-vous pour enregistrer cet appareil." });
    return YCBackend.deviceAuth(body);
  }
  function enroll() {
    var kind = sensor();
    if (!kind) return Promise.resolve({ ok: false, message: "Cet ordinateur n'a pas Face ID ni d'empreinte. Le code PIN confirme les paiements. Ouvrez le compte sur l'iPhone ou l'Android pour l'enregistrer." });
    if (!window.PublicKeyCredential || !navigator.credentials || !navigator.credentials.create) return Promise.resolve({ ok: false, message: "Ce navigateur ne propose pas la biométrie de l'appareil." });
    return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(function (yes) {
      if (!yes) return { ok: false, message: "Activez " + kind.name + " dans les réglages du téléphone, puis réessayez." };
      return call({ action: "begin-register", origin: location.origin, kind: kind.kind }).then(function (opt) {
        if (!opt || opt.ok === false) return opt || { ok: false, message: "Enregistrement impossible." };
        return navigator.credentials.create({
          publicKey: {
            challenge: b64urlToBuf(opt.challenge),
            rp: { name: "YOUSS CONNECT", id: opt.rpId },
            user: { id: b64urlToBuf(opt.userId), name: opt.userName || "compte", displayName: opt.displayName || "YOUSS CONNECT" },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
            timeout: 60000,
            attestation: "none",
            authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "preferred" },
            excludeCredentials: (opt.exclude || []).map(function (id) { return { type: "public-key", id: b64urlToBuf(id) }; })
          }
        }).then(function (cred) {
          return call({ action: "finish-register", kind: kind.kind, credential: credJSON(cred) });
        }).then(function (res) {
          if (res && res.ok && window.ACState) {
            ACState.user.biometricEnrolled = true;
            ACState.prefs.biometric = true;
            ACState.prefs.sensorKind = kind.kind;
            ACStore.emit();
          }
          return res;
        });
      });
    }).catch(fail);
  }
  function confirm() {
    var kind = sensor();
    if (!kind) return Promise.resolve({ ok: false, message: "Sur cet appareil, confirmez avec le code PIN." });
    if (!navigator.credentials || !navigator.credentials.get) return Promise.resolve({ ok: false, message: "Ce navigateur ne propose pas la biométrie." });
    return call({ action: "begin-confirm", origin: location.origin }).then(function (opt) {
      if (!opt || opt.ok === false) return opt || { ok: false, message: "Confirmation impossible." };
      return navigator.credentials.get({
        publicKey: {
          challenge: b64urlToBuf(opt.challenge),
          rpId: opt.rpId,
          allowCredentials: (opt.allow || []).map(function (id) { return { type: "public-key", id: b64urlToBuf(id) }; }),
          userVerification: "required",
          timeout: 60000
        }
      }).then(function (cred) {
        return call({ action: "finish-confirm", credential: credJSON(cred) });
      });
    }).catch(fail);
  }
  function grantPin(pin) {
    return call({ action: "pin", pin: String(pin || "") });
  }

  window.YCBiometric = { sensor: sensor, enrolled: enrolled, enroll: enroll, confirm: confirm, grantPin: grantPin };
})();
