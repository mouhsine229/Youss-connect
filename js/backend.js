/* YOUSS CONNECT — client Supabase (optionnel)
   Session, OTP téléphone, wallet, courses et réservations.
   Sans clés dans js/config.js, isLive() reste faux et la démo locale continue.
   Le SDK n'est chargé que si une configuration est présente. */
(function () {
  "use strict";

  var cfg = window.YC_CONFIG || {};
  var client = null;
  var ready = false;
  var SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.js";

  function configured() {
    var url = (cfg.supabaseUrl || "").trim();
    var key = (cfg.supabaseAnonKey || "").trim();
    return url.indexOf("https://") === 0 && key.length > 20;
  }
  function isReady() { return ready && !!client; }
  function isLive() { return !!(ready && client && window.ACState && ACState.session && ACState.session.remote); }

  /* E.164 selon l'indicatif choisi par l'utilisateur (+229, +221, +228, +233) */
  function toE164(phone) {
    var raw = String(phone || "").trim();
    if (raw.indexOf("+") === 0) return "+" + raw.replace(/\D/g, "");
    var d = raw.replace(/\D/g, "");
    var dial = (ACState.user.dial || "+229").replace("+", "");
    if (d.indexOf(dial) === 0) return "+" + d;
    return "+" + dial + d;
  }

  function explain(error) {
    var msg = (error && (error.message || error.error_description)) || "Erreur inconnue";
    if (/phone provider|unsupported phone|sms/i.test(msg)) return "Activez Phone (Twilio) dans Supabase → Authentication → Providers.";
    if (/expired|invalid.*(otp|token)/i.test(msg)) return "Code incorrect ou expiré. Demandez-en un nouveau.";
    if (/rate limit/i.test(msg)) return "Trop de tentatives. Réessayez dans quelques minutes.";
    if (/schema|relation|PGRST|could not find/i.test(msg)) return "Exécutez supabase/schema.sql dans le SQL Editor Supabase.";
    return msg;
  }
  function relDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  function applyAccount(profile, wallet, txRows) {
    var user = ACState.user;
    if (profile) {
      if (profile.full_name) { user.fullName = profile.full_name; user.name = profile.full_name.split(" ")[0] || user.name; }
      if (profile.phone) user.phone = profile.phone;
      if (profile.email) user.email = profile.email;
      if (profile.city) user.city = profile.city;
      if (profile.country) user.country = profile.country;
    }
    if (wallet) {
      ACState.wallet.balance = wallet.balance;
      ACState.wallet.currency = wallet.currency || "FCFA";
      ACState.rewards.points = wallet.points || 0;
    }
    ACState.wallet.transactions = (txRows || []).map(function (t) {
      return { id: t.id, label: t.label, amount: t.amount, type: t.kind, status: "success", service: t.service, date: relDate(t.created_at), ref: "SB-" + String(t.id).slice(0, 8).toUpperCase() };
    });
    ACState.session.authenticated = true;
    ACState.session.remote = true;
    ACState.session.onboardingSeen = true;
    ACStore.emit();
  }

  function hydrate(session) {
    var uid = session.user.id;
    return Promise.all([
      client.from("profiles").select("*").eq("id", uid).maybeSingle(),
      client.from("wallets").select("*").eq("user_id", uid).maybeSingle(),
      client.from("wallet_transactions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(40)
    ]).then(function (rows) {
      var failed = rows.filter(function (r) { return r.error; })[0];
      if (failed) throw failed.error;
      var profile = rows[0].data, wallet = rows[1].data;
      if (!profile) {
        return client.from("profiles").insert({ id: uid, phone: session.user.phone || "", full_name: (session.user.user_metadata && session.user.user_metadata.full_name) || "" }).select("*").single()
          .then(function (ins) { applyAccount(ins.data, wallet, rows[2].data); });
      }
      applyAccount(profile, wallet, rows[2].data);
    });
  }

  function loadSdk() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = SDK_URL; s.async = true;
      s.onload = resolve; s.onerror = function () { reject(new Error("SDK Supabase indisponible")); };
      document.head.appendChild(s);
    });
  }

  function init() {
    if (!configured()) return Promise.resolve(false);
    return loadSdk().then(function () {
      client = window.supabase.createClient(cfg.supabaseUrl.trim(), cfg.supabaseAnonKey.trim(), { auth: { persistSession: true, storageKey: "youss-auth", detectSessionInUrl: false } });
      ready = true;
      return client.auth.getSession();
    }).then(function (res) {
      var session = res && res.data && res.data.session;
      if (!session) return true;
      return hydrate(session).then(function () { return true; });
    }).catch(function (err) {
      console.error("Supabase", err);
      if (window.UI) UI.toast(explain(err), "error");
      return false;
    });
  }

  function sendOtp(phone, fullName) {
    if (!client) return Promise.resolve({ error: { message: "Supabase non configuré" } });
    return client.auth.signInWithOtp({ phone: toE164(phone), options: { channel: "sms", data: { full_name: fullName || "" } } });
  }
  function verifyOtp(phone, token) {
    return client.auth.verifyOtp({ phone: toE164(phone), token: String(token || "").trim(), type: "sms" }).then(function (res) {
      if (res.error) return res;
      var pending = sessionStorage.getItem("yc-pending-name");
      var session = res.data && res.data.session;
      if (pending && session) {
        return client.from("profiles").update({ full_name: pending }).eq("id", session.user.id)
          .then(function () { sessionStorage.removeItem("yc-pending-name"); return hydrate(session); })
          .then(function () { return res; });
      }
      return hydrate(session).then(function () { return res; });
    });
  }
  function signOut() {
    ACState.session.remote = false;
    ACState.session.authenticated = false;
    if (!client) return Promise.resolve();
    return client.auth.signOut();
  }

  function mirrorDebit(opts, body) {
    ACState.wallet.balance = body.balance;
    if (typeof body.points === "number") {
      ACState.rewards.points = body.points;
      if (opts.pointsEarned > 0) ACState.rewards.history.unshift({ id: ACStore.uid("rwd"), label: opts.label, points: opts.pointsEarned, date: "Aujourd'hui" });
    }
    ACStore.addTransaction({ label: opts.label, amount: -opts.amount, type: "debit", service: opts.service });
    if (opts.activity !== false) ACStore.addActivity(Object.assign({ service: opts.service, title: opts.label, amount: opts.amount, status: "Terminé", icon: ACStore.iconForService(opts.service) }, opts.activity || {}));
    ACStore.addNotification("Paiement confirmé", opts.label + " réglé via Youss Wallet (" + ACStore.fmtFCFA(opts.amount) + ").", "wallet", "wallet");
    ACStore.emit();
  }
  function pay(opts) {
    opts = opts || {};
    if (typeof navigator !== "undefined" && navigator.onLine === false) return Promise.resolve({ ok: false, reason: "offline" });
    return client.rpc("wallet_pay", { p_amount: Math.round(opts.amount), p_label: opts.label || "Paiement", p_service: opts.service || "wallet", p_points: opts.pointsEarned || 0, p_meta: opts.meta || {} }).then(function (res) {
      if (res.error) return { ok: false, reason: "error", message: explain(res.error) };
      var body = res.data || { ok: false, reason: "error" };
      if (!body.ok) return body;
      mirrorDebit(opts, body);
      return { ok: true, balance: body.balance };
    });
  }
  function topup(amount, label) {
    return client.rpc("wallet_topup", { p_amount: Math.round(amount), p_label: label || "Rechargement" }).then(function (res) {
      if (res.error) return { ok: false, reason: "error", message: explain(res.error) };
      var body = res.data || { ok: false };
      if (!body.ok) return body;
      ACState.wallet.balance = body.balance;
      ACStore.addTransaction({ label: label, amount: amount, type: "credit", service: "wallet" });
      ACStore.addNotification("Rechargement réussi", label + " (" + ACStore.fmtFCFA(amount) + ") ajouté à votre solde.", "wallet", "wallet");
      ACStore.emit();
      return { ok: true, balance: body.balance };
    });
  }
  function saveProfile(fields) {
    if (!isLive() || !client) return Promise.resolve({ ok: true });
    return client.auth.getSession().then(function (res) {
      var uid = res.data.session && res.data.session.user.id;
      if (!uid) return { ok: false };
      return client.from("profiles").update({ full_name: fields.fullName, email: fields.email || "", city: fields.city || "", country: fields.country || "" }).eq("id", uid)
        .then(function (upd) { return { ok: !upd.error, message: upd.error ? explain(upd.error) : "" }; });
    });
  }

  window.YCBackend = { configured: configured, isReady: isReady, isLive: isLive, init: init, sendOtp: sendOtp, verifyOtp: verifyOtp, signOut: signOut, pay: pay, topup: topup, saveProfile: saveProfile, explain: explain };
})();
