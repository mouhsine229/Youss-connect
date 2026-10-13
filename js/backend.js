// Client Supabase, optionnel : session, OTP téléphone, wallet, courses et réservations.
// Sans clés dans js/config.js, isLive() reste faux et tout tourne en local.
// Le SDK n'est chargé que si une configuration existe.
(function () {
  "use strict";

  var cfg = window.YC_CONFIG || {};
  var client = null;
  var ready = false;
  var SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.js";
  var SDK_SRI = "sha384-rwykjmWNwVxboyFmvK9OXN0wj9hnMHA2aAHtits54DuACyCq0M2PrSNxhRb+hvXT";
  var PROFILE_COLS = "id,phone,full_name,email,city,country,created_at";
  var listFingerprints = {};
  var listsReady = false;
  var listTimer = null;

  function configured() {
    var url = (cfg.supabaseUrl || "").trim();
    var key = (cfg.supabaseAnonKey || "").trim();
    return url.indexOf("https://") === 0 && key.length > 20;
  }
  function isReady() { return ready && !!client; }
  function isLive() { return !!(ready && client && window.ACState && ACState.session && ACState.session.remote); }
  function reader() { return ready && client ? client : null; }

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
    if (/invalid login/i.test(msg)) return "E-mail ou mot de passe incorrect.";
    if (/phone provider|unsupported phone|sms/i.test(msg)) return "Le code SMS n'est pas encore ouvert. Connectez-vous avec votre e-mail.";
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

  function dropSeed(list, prefix) {
    return (list || []).filter(function (row) { return !row || String(row.id || "").indexOf(prefix) !== 0; });
  }
  function isSeedId(id) {
    var s = String(id || "");
    return s.indexOf("_seed") >= 0 || s === "addr_home" || s === "addr_work";
  }
  function mergeRows(serverList, localList) {
    var seen = {};
    var out = [];
    (serverList || []).forEach(function (item) {
      if (!item || !item.id || isSeedId(item.id)) return;
      seen[String(item.id)] = 1;
      out.push(item);
    });
    (localList || []).forEach(function (item) {
      if (!item || !item.id || isSeedId(item.id) || seen[String(item.id)]) return;
      out.push(item);
    });
    return out.slice(0, 30);
  }
  function mergeIds(serverList, localList) {
    var seen = {};
    var out = [];
    function add(id) {
      id = String(id || "");
      if (!id || isSeedId(id) || seen[id]) return;
      seen[id] = 1;
      out.push(id);
    }
    (serverList || []).forEach(function (item) { add(item && (item.id || item)); });
    (localList || []).forEach(add);
    return out.slice(0, 40);
  }
  function applyAccount(profile, wallet, txRows, records, keys, identity, pinSet, recordsOk) {
    var user = ACState.user;
    if (profile) {
      if (profile.full_name) { user.fullName = profile.full_name; user.name = profile.full_name.split(" ")[0] || user.name; }
      if (profile.phone) user.phone = profile.phone;
      if (profile.email) user.email = profile.email;
      if (profile.city) user.city = profile.city;
      if (profile.country) user.country = profile.country;
    }
    if (ACState.prefs) delete ACState.prefs.pinHash;
    ACState.prefs.pinSet = !!pinSet;
    user.verified = true;
    if (keys) {
      user.biometricEnrolled = keys.length > 0;
      ACState.prefs.biometric = user.biometricEnrolled;
      ACState.prefs.sensorKind = keys[0] ? keys[0].kind : "";
    }
    if (identity) {
      var doc = identity[0];
      user.identityStatus = doc ? doc.status : "";
      user.identityType = doc ? doc.doc_type : "";
    }
    if (wallet) {
      ACState.wallet.balance = wallet.balance;
      ACState.wallet.currency = wallet.currency || "FCFA";
      ACState.rewards.points = wallet.points || 0;
    }
    ACState.wallet.transactions = (txRows || []).map(function (t) {
      return { id: t.id, label: t.label, amount: t.amount, type: t.kind, status: "success", service: t.service, date: relDate(t.created_at), ref: "SB-" + String(t.id).slice(0, 8).toUpperCase(), at: new Date(t.created_at).getTime() };
    });
    if (recordsOk) {
      var grouped = { activity: [], ticket: [], order: [], notification: [], address: [], reward: [], favorite: [], saved: [] };
      var serverFp = {};
      (records || []).forEach(function (row) {
        if (!row || !grouped[row.kind] || !row.payload) return;
        grouped[row.kind].push(row.payload);
        var lid = (row.payload && row.payload.id) || row.local_id || "";
        if (lid) serverFp[row.kind + "\n" + lid] = JSON.stringify(row.payload);
      });
      ACState.activities = mergeRows(grouped.activity, ACState.activities);
      ACState.tickets = mergeRows(grouped.ticket, ACState.tickets);
      ACState.orders = mergeRows(grouped.order, ACState.orders);
      ACState.notifications = mergeRows(grouped.notification, ACState.notifications);
      ACState.addresses = mergeRows(grouped.address, ACState.addresses);
      if (ACState.rewards) ACState.rewards.history = mergeRows(grouped.reward, ACState.rewards.history);
      ACState.favorites = mergeIds(grouped.favorite, ACState.favorites);
      ACState.saved = mergeIds(grouped.saved, ACState.saved);
      listsReady = true;
    }
    ACState.rewards.history = dropSeed(ACState.rewards.history, "rwd_seed");
    if (recordsOk) {
      var kept = {};
      collectLists().forEach(function (row) {
        var key = row.kind + "\n" + row.local_id;
        if (Object.prototype.hasOwnProperty.call(serverFp, key)) kept[key] = serverFp[key];
      });
      listFingerprints = kept;
    }
    (ACState.paymentMethods || []).forEach(function (m) {
      if (m.type === "wallet") m.sub = "Solde du compte";
      if (m.type === "mobile") m.sub = "Pas encore ouvert";
    });
    ACState.session.authenticated = true;
    ACState.session.remote = true;
    ACState.session.onboardingSeen = true;
    ACStore.emit();
  }

  function hydrate(session) {
    var uid = session.user.id;
    return Promise.all([
      client.from("profiles").select(PROFILE_COLS).eq("id", uid).maybeSingle(),
      client.from("wallets").select("*").eq("user_id", uid).maybeSingle(),
      client.from("wallet_transactions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(40),
      client.from("user_records").select("kind,local_id,payload,updated_at").order("updated_at", { ascending: false }).limit(300),
      client.from("device_keys").select("id,kind").limit(5),
      client.from("identity_documents").select("status,doc_type").order("created_at", { ascending: false }).limit(1),
      client.rpc("pin_status")
    ]).then(function (rows) {
      var failed = rows.slice(0, 3).filter(function (r) { return r.error; })[0];
      if (failed) throw failed.error;
      var profile = rows[0].data, wallet = rows[1].data;
      var recordsOk = !!(rows[3] && !rows[3].error);
      var records = recordsOk ? (rows[3].data || []) : [];
      var keys = rows[4] && !rows[4].error ? (rows[4].data || []) : null;
      var identity = rows[5] && !rows[5].error ? (rows[5].data || []) : null;
      var pinSet = !!(rows[6] && rows[6].data === true);
      if (!profile) {
        return client.from("profiles").insert({ id: uid, phone: session.user.phone || "", full_name: (session.user.user_metadata && session.user.user_metadata.full_name) || "" }).select(PROFILE_COLS).single()
          .then(function (ins) { applyAccount(ins.data, wallet, rows[2].data, records, keys, identity, pinSet, recordsOk); });
      }
      applyAccount(profile, wallet, rows[2].data, records, keys, identity, pinSet, recordsOk);
    });
  }

  function loadSdk() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = SDK_URL;
      s.integrity = SDK_SRI;
      s.crossOrigin = "anonymous";
      s.async = true;
      s.onload = resolve; s.onerror = function () { reject(new Error("SDK Supabase indisponible")); };
      document.head.appendChild(s);
    });
  }

  function init() {
    listsReady = false;
    listFingerprints = {};
    if (!configured()) return Promise.resolve(false);
    if (window.ACState && ACState.session) ACState.session.authenticated = false;
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

  function signIn(email, password) {
    if (!client) return Promise.resolve({ error: { message: "Compte indisponible." } });
    return client.auth.signInWithPassword({ email: String(email || "").trim().toLowerCase(), password: password }).then(function (res) {
      if (res.error) return res;
      return hydrate(res.data.session).then(function () { return res; });
    });
  }
  function signUp(fields) {
    fields = fields || {};
    var root = (cfg.supabaseUrl || "").replace(/\/$/, "");
    return fetch(root + "/functions/v1/create-account", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: cfg.supabaseAnonKey, Authorization: "Bearer " + cfg.supabaseAnonKey },
      body: JSON.stringify({ email: fields.email, password: fields.password, fullName: fields.fullName, phone: fields.phone, city: fields.city, country: fields.country })
    }).then(function (r) {
      return r.json().then(function (body) { return { ok: r.ok && body && body.ok === true, message: body && body.message }; }, function () { return { ok: false, message: "Création du compte impossible." }; });
    }).then(function (res) {
      if (!res.ok) return { error: { message: res.message || "Création du compte impossible." } };
      return signIn(fields.email, fields.password);
    }).catch(function () { return { error: { message: "Création du compte impossible. Vérifiez la connexion." } }; });
  }
  function updatePassword(next) {
    if (!client) return Promise.resolve({ ok: false, message: "Compte indisponible." });
    return client.auth.updateUser({ password: next }).then(function (res) {
      return res.error ? { ok: false, message: explain(res.error) } : { ok: true };
    });
  }
  function signOutOthers() {
    if (!client) return Promise.resolve({ ok: false });
    return client.auth.signOut({ scope: "others" }).then(function (res) {
      return { ok: !res.error, message: res.error ? explain(res.error) : "" };
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
    listsReady = false;
    listFingerprints = {};
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
    return client.rpc("wallet_pay", { p_amount: Math.round(opts.amount), p_label: opts.label || "Paiement", p_service: opts.service || "wallet", p_points: Math.min(Math.max(Math.round(opts.pointsEarned || 0), 0), Math.round(opts.amount / 100)), p_meta: opts.meta || {} }).then(function (res) {
      if (res.error) return { ok: false, reason: "error", message: explain(res.error) };
      var body = res.data || { ok: false, reason: "error" };
      if (!body.ok) return body;
      mirrorDebit(opts, body);
      return { ok: true, balance: body.balance };
    });
  }
  function collectLists() {
    var rows = [];
    function pushObjects(kind, list) {
      (list || []).slice(0, 30).forEach(function (item) {
        if (!item || !item.id || isSeedId(item.id)) return;
        rows.push({ kind: kind, local_id: String(item.id).slice(0, 80), payload: item });
      });
    }
    function pushIds(kind, list) {
      (list || []).slice(0, 40).forEach(function (id) {
        id = String(id || "");
        if (!id || isSeedId(id)) return;
        rows.push({ kind: kind, local_id: id.slice(0, 80), payload: { id: id } });
      });
    }
    if (!window.ACState) return rows;
    pushObjects("activity", ACState.activities);
    pushObjects("ticket", ACState.tickets);
    pushObjects("order", ACState.orders);
    pushObjects("notification", ACState.notifications);
    pushObjects("address", ACState.addresses);
    pushObjects("reward", ACState.rewards && ACState.rewards.history);
    pushIds("favorite", ACState.favorites);
    pushIds("saved", ACState.saved);
    return rows;
  }
  function flushLists() {
    if (!isLive() || !client || !listsReady || !window.ACState) return;
    var rows = collectLists();
    var next = {};
    var changed = [];
    rows.forEach(function (row) {
      var key = row.kind + "\n" + row.local_id;
      var fp = JSON.stringify(row.payload);
      next[key] = fp;
      if (listFingerprints[key] !== fp) changed.push(row);
    });
    var drop = [];
    Object.keys(listFingerprints).forEach(function (key) {
      if (next[key]) return;
      var cut = key.indexOf("\n");
      drop.push({ kind: key.slice(0, cut), local_id: key.slice(cut + 1) });
    });
    if (!changed.length && !drop.length) { listFingerprints = next; return; }
    var batch = changed.slice(0, 40);
    var batchDrop = drop.slice(0, 40);
    client.rpc("save_records", { p_rows: batch, p_drop: batchDrop }).then(function (res) {
      if (!res || res.error) return;
      batch.forEach(function (row) { listFingerprints[row.kind + "\n" + row.local_id] = JSON.stringify(row.payload); });
      batchDrop.forEach(function (row) { delete listFingerprints[row.kind + "\n" + row.local_id]; });
      if (changed.length > batch.length || drop.length > batchDrop.length) {
        clearTimeout(listTimer);
        listTimer = setTimeout(flushLists, 400);
      }
    });
  }
  function saveLists() {
    if (!isLive() || !client || !listsReady) return;
    clearTimeout(listTimer);
    listTimer = setTimeout(flushLists, 1000);
  }
  function topup() {
    return Promise.resolve({ ok: false, reason: "error", message: "La recharge en ligne attend le prestataire de paiement." });
  }
  function saveProfile(fields) {
    if (!isLive() || !client) return Promise.resolve({ ok: true });
    return client.auth.getSession().then(function (res) {
      var uid = res.data.session && res.data.session.user.id;
      if (!uid) return { ok: false };
      var patch = { full_name: fields.fullName, email: fields.email || "", city: fields.city || "", country: fields.country || "" };
      if (fields.phone) patch.phone = fields.phone;
      return client.from("profiles").update(patch).eq("id", uid)
        .then(function (upd) { return { ok: !upd.error, message: upd.error ? explain(upd.error) : "" }; });
    });
  }

  function callFunction(name, body) {
    if (!client || !/^[a-z0-9-]{3,40}$/.test(String(name || ""))) return Promise.resolve({ ok: false, message: "Action indisponible." });
    return client.auth.getSession().then(function (res) {
      var token = res.data.session && res.data.session.access_token;
      if (!token) return { ok: false, message: "Connectez-vous à la console." };
      var root = (cfg.supabaseUrl || "").replace(/\/$/, "");
      return fetch(root + "/functions/v1/" + name, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: cfg.supabaseAnonKey, Authorization: "Bearer " + token },
        body: JSON.stringify(body || {})
      }).then(function (r) {
        return r.json().catch(function () { return { ok: false, message: "Réponse invalide." }; });
      }).catch(function () { return { ok: false, message: "Connexion impossible." }; });
    });
  }
  function deviceAuth(body) {
    if (!client) return Promise.resolve({ ok: false, message: "Compte indisponible." });
    return client.auth.getSession().then(function (res) {
      var token = res.data.session && res.data.session.access_token;
      if (!token) return { ok: false, message: "Connectez-vous." };
      var root = (cfg.supabaseUrl || "").replace(/\/$/, "");
      return fetch(root + "/functions/v1/device-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: cfg.supabaseAnonKey, Authorization: "Bearer " + token },
        body: JSON.stringify(body || {})
      }).then(function (r) {
        return r.json().catch(function () { return { ok: false, message: "Réponse invalide." }; });
      }).catch(function () { return { ok: false, message: "Vérification impossible. Vérifiez la connexion." }; });
    });
  }
  function applyPin(pin, next, grant) {
    if (!client) return Promise.resolve({ ok: false, message: "Connectez-vous." });
    return client.rpc("apply_pin", { p_pin: String(pin || ""), p_next: next || null, p_grant: !!grant }).then(function (res) {
      if (res.error) return { ok: false, message: explain(res.error) };
      var body = res.data || { ok: false, message: "Code PIN incorrect." };
      if (body.ok && window.ACState && window.ACStore) {
        ACStore.quietly(function () {
          ACState.prefs.pinSet = true;
          if (ACState.prefs.pinHash) delete ACState.prefs.pinHash;
        });
      }
      return body;
    });
  }
  function staffNote(action, subject) {
    if (!client) return Promise.resolve();
    return client.rpc("staff_note", { p_action: action, p_subject: String(subject || "").slice(0, 120) }).then(function () {}, function () {});
  }
  function claimConsole() {
    if (!client) return Promise.resolve({ ok: false, status: "denied" });
    return client.rpc("claim_console").then(function (res) {
      if (res.error) return { ok: false, status: "denied", message: explain(res.error) };
      var status = res.data;
      return { ok: status === "created" || status === "member", status: status };
    });
  }
  function uploadIdentity(file, docType) {
    if (!client) return Promise.resolve({ ok: false, message: "Connectez-vous." });
    var types = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf" };
    var allowed = { cni: 1, passeport: 1, permis: 1 };
    if (!allowed[docType]) return Promise.resolve({ ok: false, message: "Choisissez le type de document." });
    return client.auth.getSession().then(function (res) {
      var uid = res.data.session && res.data.session.user && res.data.session.user.id;
      if (!uid) return { ok: false, message: "Connectez-vous." };
      var ext = String((file && file.name || "").split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!types[ext]) return { ok: false, message: "Format accepté : photo JPG, PNG, WebP ou PDF." };
      var path = uid + "/" + (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())) + "." + ext;
      return client.storage.from("identity").upload(path, file, { contentType: file.type || types[ext], upsert: false }).then(function (up) {
        if (up.error) return { ok: false, message: explain(up.error) };
        return client.from("identity_documents").insert({ doc_type: docType, storage_path: path }).then(function (ins) {
          if (ins.error) return { ok: false, message: explain(ins.error) };
          if (window.ACState) {
            ACState.user.identityStatus = "pending";
            ACState.user.identityType = docType;
            ACStore.emit();
          }
          return { ok: true };
        });
      });
    });
  }
  function removeBiometric() {
    if (!client) return Promise.resolve({ ok: false });
    return client.auth.getSession().then(function (res) {
      var uid = res.data.session && res.data.session.user && res.data.session.user.id;
      if (!uid) return { ok: false };
      return client.from("device_keys").delete().eq("user_id", uid).then(function (del) {
        if (!del.error && window.ACState) {
          ACState.user.biometricEnrolled = false;
          ACState.prefs.biometric = false;
          ACState.prefs.sensorKind = "";
          ACStore.emit();
        }
        return { ok: !del.error, message: del.error ? explain(del.error) : "" };
      });
    });
  }
  function openSupport() {
    if (!client) return Promise.resolve("");
    return client.auth.getSession().then(function (res) {
      var uid = res.data.session && res.data.session.user && res.data.session.user.id;
      if (!uid) return "";
      return client.from("support_threads").select("id").eq("user_id", uid).eq("status", "open").maybeSingle().then(function (found) {
        if (found.data) return found.data.id;
        return client.from("support_threads").insert({ user_id: uid, subject: "Assistance" }).select("id").single().then(function (ins) {
          if (ins.data) return ins.data.id;
          return client.from("support_threads").select("id").eq("user_id", uid).eq("status", "open").maybeSingle().then(function (again) {
            return again.data ? again.data.id : "";
          });
        });
      });
    });
  }
  function loadMessages(threadId) {
    if (!client || !threadId) return Promise.resolve([]);
    return client.from("support_messages").select("id,body,from_staff,created_at").eq("thread_id", threadId).order("created_at", { ascending: true }).limit(100).then(function (res) {
      return res.data || [];
    });
  }
  function sendSupport(threadId, text, fromStaff) {
    if (!client) return Promise.resolve({ ok: false, message: "Connectez-vous." });
    var body = String(text || "").trim().slice(0, 2000);
    if (!threadId || !body) return Promise.resolve({ ok: false, message: "Écrivez un message." });
    return client.auth.getSession().then(function (res) {
      var uid = res.data.session && res.data.session.user && res.data.session.user.id;
      if (!uid) return { ok: false, message: "Connectez-vous." };
      return client.from("support_messages").insert({ thread_id: threadId, user_id: uid, body: body, from_staff: !!fromStaff }).then(function (ins) {
        return { ok: !ins.error, message: ins.error ? explain(ins.error) : "" };
      });
    });
  }

  window.YCBackend = { configured: configured, isReady: isReady, isLive: isLive, init: init, signIn: signIn, signUp: signUp, updatePassword: updatePassword, signOutOthers: signOutOthers, sendOtp: sendOtp, verifyOtp: verifyOtp, signOut: signOut, pay: pay, topup: topup, saveProfile: saveProfile, saveLists: saveLists, applyPin: applyPin, staffNote: staffNote, explain: explain, api: function () { return isLive() ? client : null; }, reader: reader, callFunction: callFunction, deviceAuth: deviceAuth, claimConsole: claimConsole, uploadIdentity: uploadIdentity, removeBiometric: removeBiometric, openSupport: openSupport, loadMessages: loadMessages, sendSupport: sendSupport };
})();
