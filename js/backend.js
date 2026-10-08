/* YOUSS CONNECT — client Supabase
   Session, OTP téléphone, wallet, courses et réservations.
   Sans clés dans js/config.js, isLive() reste faux et la démo locale continue. */
(function () {
  "use strict";

  var cfg = window.YC_CONFIG || {};
  var client = null;
  var ready = false;

  function configured() {
    var url = (cfg.supabaseUrl || "").trim();
    var key = (cfg.supabaseAnonKey || "").trim();
    return url.indexOf("https://") === 0 && key.length > 20;
  }

  function isLive() {
    return !!(ready && client && window.ACState && ACState.session && ACState.session.remote);
  }

  function toE164(phone) {
    var d = String(phone || "").replace(/\D/g, "");
    if (d.indexOf("229") === 0) return "+" + d;
    return "+229" + d;
  }

  function explain(error) {
    var msg = (error && (error.message || error.error_description)) || "Erreur inconnue";
    if (/phone provider|unsupported phone|sms/i.test(msg)) {
      return "Activez Phone (Twilio) dans Supabase → Authentication → Providers.";
    }
    if (/expired|invalid.*(otp|token)/i.test(msg)) return "Code incorrect ou expiré. Demandez-en un nouveau.";
    if (/rate limit/i.test(msg)) return "Trop de tentatives. Réessayez dans quelques minutes.";
    if (/schema|relation|PGRST|could not find/i.test(msg)) {
      return "Exécutez supabase/schema.sql dans le SQL Editor Supabase.";
    }
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
      if (profile.full_name) {
        user.fullName = profile.full_name;
        user.name = profile.full_name.split(" ")[0] || user.name;
      }
      if (profile.phone) user.phone = profile.phone;
      if (profile.email) user.email = profile.email;
      if (profile.city) user.city = profile.city;
      if (profile.country) user.country = profile.country;
    }
    if (wallet) {
      ACState.wallet.balance = wallet.balance;
      ACState.wallet.currency = wallet.currency || "FCFA";
      ACState.rewards.points = wallet.points || 0;
      if (wallet.points >= ACState.rewards.nextTierAt) ACState.rewards.tier = "Gold";
    }
    ACState.wallet.transactions = (txRows || []).map(function (t) {
      return {
        id: t.id,
        label: t.label,
        amount: t.amount,
        type: t.kind,
        date: relDate(t.created_at)
      };
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
      var profile = rows[0].data;
      var wallet = rows[1].data;
      if (!profile) {
        return client.from("profiles").insert({
          id: uid,
          phone: session.user.phone || "",
          full_name: (session.user.user_metadata && session.user.user_metadata.full_name) || ""
        }).select("*").single().then(function (ins) {
          profile = ins.data;
          return wallet;
        }).then(function () {
          applyAccount(profile, wallet, rows[2].data);
        });
      }
      applyAccount(profile, wallet, rows[2].data);
    });
  }

  function goHomeIfWaiting() {
    if (!window.App || !App.current) return;
    if (App.current.id === "onboarding" || App.current.id === "splash") App.resetTo("home");
  }

  function init() {
    if (!configured() || !window.supabase || !window.supabase.createClient) {
      return Promise.resolve(false);
    }
    client = window.supabase.createClient(cfg.supabaseUrl.trim(), cfg.supabaseAnonKey.trim(), {
      auth: { persistSession: true, storageKey: "youss-auth", detectSessionInUrl: false }
    });
    ready = true;
    return client.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      if (!session) return true;
      return hydrate(session).then(function () {
        goHomeIfWaiting();
        return true;
      });
    }).catch(function (err) {
      console.error("Supabase", err);
      if (window.UI) UI.toast(explain(err), "error");
      return false;
    });
  }

  function sendOtp(phone, fullName) {
    if (!client) return Promise.resolve({ error: { message: "Supabase non configuré" } });
    return client.auth.signInWithOtp({
      phone: toE164(phone),
      options: { channel: "sms", data: { full_name: fullName || "" } }
    });
  }

  function verifyOtp(phone, token) {
    return client.auth.verifyOtp({
      phone: toE164(phone),
      token: String(token || "").trim(),
      type: "sms"
    }).then(function (res) {
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
      if (opts.pointsEarned > 0) {
        ACState.rewards.history.unshift({ id: ACStore.uid("rwd"), label: opts.label, points: opts.pointsEarned, date: "Aujourd'hui" });
      }
      if (ACState.rewards.points >= ACState.rewards.nextTierAt && ACState.rewards.tier === "Silver") {
        ACState.rewards.tier = "Gold";
      }
    }
    ACState.wallet.transactions.unshift({
      id: ACStore.uid("txn"), label: opts.label, amount: -opts.amount, type: "debit", date: "À l'instant"
    });
    ACStore.addActivity({ service: opts.service, title: opts.label, amount: opts.amount, status: "Terminé", icon: ACStore.iconForService(opts.service) });
    ACStore.addNotification("Paiement confirmé", opts.label + " a été réglé via Youss Wallet (" + ACStore.fmtFCFA(opts.amount) + ").", "wallet");
    ACStore.emit();
  }

  function pay(opts) {
    opts = opts || {};
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return Promise.resolve({ ok: false, reason: "offline" });
    }
    return client.rpc("wallet_pay", {
      p_amount: Math.round(opts.amount),
      p_label: opts.label || "Paiement",
      p_service: opts.service || "wallet",
      p_points: opts.pointsEarned || 0,
      p_meta: opts.meta || {}
    }).then(function (res) {
      if (res.error) return { ok: false, reason: "error", message: explain(res.error) };
      var body = res.data || { ok: false, reason: "error" };
      if (!body.ok) return body;
      mirrorDebit(opts, body);
      return { ok: true, balance: body.balance };
    });
  }

  function topup(amount, label) {
    return client.rpc("wallet_topup", {
      p_amount: Math.round(amount),
      p_label: label || "Rechargement"
    }).then(function (res) {
      if (res.error) return { ok: false, reason: "error", message: explain(res.error) };
      var body = res.data || { ok: false };
      if (!body.ok) return body;
      ACState.wallet.balance = body.balance;
      ACState.wallet.transactions.unshift({
        id: ACStore.uid("txn"), label: label, amount: amount, type: "credit", date: "À l'instant"
      });
      ACStore.addNotification("Rechargement réussi", label + " (" + ACStore.fmtFCFA(amount) + ") a été ajouté à votre solde.", "wallet");
      ACStore.emit();
      return { ok: true, balance: body.balance };
    });
  }

  function saveProfile(fields) {
    if (!isLive() || !client) return Promise.resolve({ ok: true });
    return client.auth.getSession().then(function (res) {
      var uid = res.data.session && res.data.session.user.id;
      if (!uid) return { ok: false };
      return client.from("profiles").update({
        full_name: fields.fullName,
        email: fields.email || "",
        city: fields.city || ""
      }).eq("id", uid).then(function (upd) {
        return { ok: !upd.error, message: upd.error ? explain(upd.error) : "" };
      });
    });
  }

  window.YCBackend = {
    configured: configured,
    isLive: isLive,
    init: init,
    sendOtp: sendOtp,
    verifyOtp: verifyOtp,
    signOut: signOut,
    pay: pay,
    topup: topup,
    saveProfile: saveProfile,
    explain: explain
  };
})();
