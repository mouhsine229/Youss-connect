// Console KYA. L'accès est un compte YOUSS CONNECT autorisé, pas un code public.
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc } = UI;
  const NAV = [
    { id: "opsHome", label: "Vue d'ensemble", icon: "space_dashboard" },
    { id: "opsUsers", label: "Utilisateurs", icon: "group" },
    { id: "opsIdentity", label: "Pièces d'identité", icon: "badge" },
    { id: "opsSupport", label: "Assistance", icon: "support_agent" },
    { id: "opsRestaurants", label: "Restaurants", icon: "restaurant" }
  ];
  const DOC = { cni: "Carte d'identité", passeport: "Passeport", permis: "Permis de conduire" };
  const ST = { pending: "En revue", approved: "Acceptée", rejected: "Refusée" };
  let openThread = "";
  let opsPoll = null;
  let issued = null;

  function gateOn() { const v = sessionStorage.getItem("yc-ops") || ""; return v.indexOf("ok:") === 0; }
  function gateSet(v) { if (v) sessionStorage.setItem("yc-ops", "ok:" + Date.now()); else sessionStorage.removeItem("yc-ops"); }
  window.YCGate = window.YCGate || {};
  YCGate.ops = gateOn;
  YCGate.setOps = gateSet;

  function db() { return window.YCBackend && YCBackend.api ? YCBackend.api() : null; }
  function when(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }
  function layout(active, title, body) {
    const item = (n) => `<a href="#/${n.id}" onclick="event.preventDefault();App.nav('${n.id}')" class="ops-nav ${active === n.id ? "on" : ""}">${icon(n.icon, "text-[18px]")}<span>${n.label}</span></a>`;
    document.getElementById("app").innerHTML = `
      <div class="min-h-dvh lg:flex bg-[#0F1115] text-white">
        <aside class="hidden lg:flex flex-col w-[240px] sticky top-0 h-dvh border-r border-white/10 px-3 py-5">
          <div class="px-2 mb-6"><p class="t-caption text-gold">KYA CORPORATION</p><p class="t-title mt-1">Console interne</p></div>
          <nav class="space-y-0.5 flex-1">${NAV.map(item).join("")}</nav>
          <button type="button" onclick="Screens._opsOut()" class="ops-nav text-white/50">${icon("logout", "text-[18px]")}<span>Quitter</span></button>
        </aside>
        <div class="flex-1 min-w-0 min-h-dvh flex flex-col bg-surface text-ink">
          <header class="sticky top-0 z-20 bg-surface/95 backdrop-blur border-b border-line">
            <div class="px-4 lg:px-8 h-14 flex items-center justify-between gap-3">
              <div class="min-w-0"><h1 class="t-h3 truncate">${esc(title)}</h1><p class="t-caption truncate">Comptes et restaurants</p></div>
              <button type="button" onclick="Screens._opsOut()" class="lg:hidden t-small font-semibold">Quitter</button>
            </div>
            <nav class="lg:hidden flex flex-wrap gap-1 px-3 pb-2">${NAV.map((n) => `<button type="button" onclick="App.nav('${n.id}')" class="chip ${active === n.id ? "on" : ""}">${n.label}</button>`).join("")}</nav>
          </header>
          <main class="flex-1 px-4 lg:px-8 py-5 lg:py-8 space-y-5 max-w-[1100px] w-full">${body}</main>
        </div>
      </div>`;
  }
  function still(id) { return !!(window.App && App.current && App.current.id === id); }
  function enter(active, title, draw) {
    const api = db();
    if (!api || !window.YCBackend || !YCBackend.isLive()) { gateSet(false); App.replace("opsLogin"); return; }
    layout(active, title, `<p class="t-body text-ink-2">Chargement…</p>`);
    YCBackend.claimConsole().then(function (res) {
      if (!still(active)) return;
      if (!res || !res.ok) { gateSet(false); App.replace("opsLogin"); return; }
      draw(api);
    });
  }
  function claimMessage(status) {
    if (status === "denied") return "La console a déjà un accès. Entrez avec ce compte-là.";
    return "Accès console impossible pour le moment.";
  }
  function afterClaim(res) {
    if (!res || !res.ok) { UI.showError("ops-err", claimMessage(res && res.status)); return; }
    gateSet(true);
    App.resetTo("opsHome");
  }

  Screens.opsLogin = function (container) {
    const live = window.YCBackend && YCBackend.isLive();
    container.innerHTML = `<div class="min-h-dvh bg-[#0F1115] text-white flex items-center justify-center px-5 py-10">
      <div class="w-full max-w-[400px]">
        <p class="t-caption text-gold">Accès réservé</p>
        <h1 class="t-h1 mt-2">Console KYA</h1>
        <p class="t-small text-white/55 mt-2">Connectez-vous avec le compte YOUSS CONNECT qui doit tenir la console. Le premier compte qui entre devient l'accès.</p>
        <form class="card p-5 mt-8 space-y-3 text-ink" onsubmit="event.preventDefault();Screens._opsLogin()">
          ${live ? `<button type="button" onclick="Screens._opsUseCurrent()" class="btn btn-lg btn-secondary btn-block">Continuer avec ce compte</button>` : ""}
          ${UI.field("ops-mail", "E-mail du compte", { type: "email", autocomplete: "username" })}
          ${UI.field("ops-pass", "Mot de passe", { type: "password", placeholder: "••••••••", autocomplete: "current-password" })}
          ${UI.error("ops-err")}
          <button type="submit" class="btn btn-lg btn-primary btn-block">Entrer</button>
        </form>
      </div>
    </div>`;
  };
  Screens.opsOtp = function () { App.replace("opsLogin"); };
  Screens._opsUseCurrent = function () {
    if (!window.YCBackend) return;
    YCBackend.claimConsole().then(afterClaim);
  };
  Screens._opsLogin = function () {
    const mail = ((document.getElementById("ops-mail") || {}).value || "").trim();
    const pass = (document.getElementById("ops-pass") || {}).value || "";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail) || pass.length < 8) { UI.showError("ops-err", "Indiquez l'e-mail et le mot de passe du compte."); return; }
    if (!window.YCBackend || !YCBackend.isReady()) { UI.showError("ops-err", "La console est momentanément indisponible."); return; }
    YCBackend.signIn(mail, pass).then(function (res) {
      if (res && res.error) { UI.showError("ops-err", YCBackend.explain(res.error)); return; }
      return YCBackend.claimConsole().then(afterClaim);
    });
  };
  Screens._opsOut = function () {
    if (opsPoll) { clearInterval(opsPoll); opsPoll = null; }
    issued = null;
    gateSet(false);
    App.resetTo("opsLogin");
  };

  Screens.opsHome = function () {
    enter("opsHome", "Vue d'ensemble", function (api) {
      Promise.all([
        api.from("profiles").select("id", { count: "exact", head: true }),
        api.from("identity_documents").select("id", { count: "exact", head: true }).eq("status", "pending"),
        api.from("support_threads").select("id", { count: "exact", head: true }).eq("status", "open")
      ]).then(function (rows) {
        if (!still("opsHome")) return;
        const n = rows.map(function (r) { return r && typeof r.count === "number" ? r.count : 0; });
        layout("opsHome", "Vue d'ensemble", `<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button type="button" onclick="App.nav('opsUsers')" class="card p-5 text-left"><p class="t-caption text-ink-3">Comptes</p><p class="t-h2 mt-1">${n[0]}</p></button>
          <button type="button" onclick="App.nav('opsIdentity')" class="card p-5 text-left"><p class="t-caption text-ink-3">Pièces en revue</p><p class="t-h2 mt-1">${n[1]}</p></button>
          <button type="button" onclick="App.nav('opsSupport')" class="card p-5 text-left"><p class="t-caption text-ink-3">Assistances ouvertes</p><p class="t-h2 mt-1">${n[2]}</p></button>
          <button type="button" onclick="App.nav('opsRestaurants')" class="card p-5 text-left"><p class="t-caption text-ink-3">Restaurants</p><p class="t-title mt-2">Créer un compte cuisine</p></button>
        </div><div class="card p-5"><p class="t-body text-ink-2">Les restaurants se créent ici. Chaque compte reçoit un identifiant et un mot de passe, à remettre en PDF. Les événements, chauffeurs et prix restent des exemples.</p></div>`);
      });
    });
  };

  Screens.opsUsers = function () {
    enter("opsUsers", "Utilisateurs", function (api) {
      api.from("profiles").select("id,full_name,phone,email,city,country,created_at").order("created_at", { ascending: false }).limit(100).then(function (res) {
        if (!still("opsUsers")) return;
        const rows = (res.data || []).map(function (u) {
          return `<div class="p-4"><p class="t-title">${esc(u.full_name || "Sans nom")}</p><p class="t-small text-ink-2">${esc(u.email || "")}${u.phone ? " · " + esc(u.phone) : ""}</p><p class="t-small text-ink-3">${esc(u.city || "")}${u.country ? ", " + esc(u.country) : ""} · ${esc(when(u.created_at))}</p></div>`;
        }).join("");
        layout("opsUsers", "Utilisateurs", rows ? `<div class="card divide-y divide-line">${rows}</div>` : `<div class="card p-5"><p class="t-body text-ink-2">Aucun compte pour le moment.</p></div>`);
      });
    });
  };

  Screens.opsIdentity = function () {
    enter("opsIdentity", "Pièces d'identité", function (api) {
      api.from("identity_documents").select("id,doc_type,storage_path,status,note,created_at,profiles(full_name,phone,email)").order("created_at", { ascending: false }).limit(50).then(function (res) {
        if (!still("opsIdentity")) return;
        const list = res.data || [];
        list.sort(function (a, b) { return (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1); });
        const cards = list.map(function (doc) {
          const person = doc.profiles || {};
          const pdf = /\.pdf$/i.test(doc.storage_path || "");
          const pending = doc.status === "pending";
          return `<article class="card p-5 space-y-3"><div class="flex items-start justify-between gap-3"><div><p class="t-title">${esc(person.full_name || "Compte")}</p><p class="t-small text-ink-2">${esc(DOC[doc.doc_type] || doc.doc_type)} · ${esc(person.email || person.phone || "")}</p><p class="t-small text-ink-3">${esc(when(doc.created_at))}</p></div>${UI.badge(ST[doc.status] || doc.status, doc.status === "approved" ? "success" : doc.status === "rejected" ? "warn" : "gold")}</div>
            <div id="ops-file-${esc(doc.id)}"><button type="button" class="btn btn-sm btn-secondary" onclick="Screens._opsPreview(${esc(JSON.stringify(doc.id))},${esc(JSON.stringify(doc.storage_path))},${pdf ? "true" : "false"})">Voir le document</button></div>
            ${doc.note ? `<p class="t-small text-ink-2">${esc(doc.note)}</p>` : ""}
            ${pending ? `<textarea id="ops-note-${esc(doc.id)}" class="input min-h-[72px]" maxlength="300" placeholder="Note pour le compte, facultative"></textarea><div class="flex gap-2"><button type="button" class="btn btn-primary" onclick="Screens._opsReview(${esc(JSON.stringify(doc.id))},'approved')">Accepter</button><button type="button" class="btn btn-secondary" onclick="Screens._opsReview(${esc(JSON.stringify(doc.id))},'rejected')">Refuser</button></div>` : ""}
          </article>`;
        }).join("");
        layout("opsIdentity", "Pièces d'identité", cards || `<div class="card p-5"><p class="t-body text-ink-2">Aucun document envoyé.</p></div>`);
      });
    });
  };
  Screens._opsPreview = function (id, path, pdf) {
    const api = db();
    if (!/^[0-9a-f-]{36}$/i.test(String(id || "")) || !/^[0-9a-f-]{36}\/[A-Za-z0-9._-]{1,80}$/.test(String(path || ""))) return;
    const box = document.getElementById("ops-file-" + id);
    if (!api || !box) return;
    api.storage.from("identity").createSignedUrl(path, 90).then(function (res) {
      const url = res.data && res.data.signedUrl;
      if (!url) { box.innerHTML = `<p class="t-small text-danger">Document introuvable.</p>`; return; }
      box.innerHTML = pdf
        ? `<a class="btn btn-sm btn-secondary" href="${esc(url)}" target="_blank" rel="noopener">Ouvrir le PDF</a>`
        : `<img src="${esc(url)}" alt="Pièce d'identité" class="max-h-72 rounded-xl border border-line bg-surface-low"/>`;
    });
  };
  Screens._opsReview = function (id, status) {
    const api = db();
    if (!api || !/^[0-9a-f-]{36}$/i.test(String(id || "")) || (status !== "approved" && status !== "rejected")) return;
    const note = ((document.getElementById("ops-note-" + id) || {}).value || "").trim().slice(0, 300);
    api.from("identity_documents").update({ status: status, note: note, reviewed_at: new Date().toISOString() }).eq("id", id).then(function (res) {
      if (res.error) { UI.toast("Mise à jour impossible.", "error"); return; }
      UI.toast(status === "approved" ? "Document accepté." : "Document refusé.", "success");
      App.replace("opsIdentity");
    });
  };

  function paintThread(api, threadId) {
    api.from("support_messages").select("id,body,from_staff,created_at").eq("thread_id", threadId).order("created_at", { ascending: true }).limit(100).then(function (res) {
      const box = document.getElementById("ops-chat");
      if (!box) return;
      const rows = res.data || [];
      box.innerHTML = rows.length ? rows.map(function (m) {
        return `<div class="max-w-[85%] ${m.from_staff ? "ml-auto" : ""}"><div class="rounded-2xl px-3 py-2 ${m.from_staff ? "bg-ink text-white" : "bg-surface-low"}"><p class="t-body whitespace-pre-wrap">${esc(m.body)}</p></div><p class="t-caption text-ink-3 mt-1 ${m.from_staff ? "text-right" : ""}">${m.from_staff ? "Console" : "Compte"} · ${esc(when(m.created_at))}</p></div>`;
      }).join("") : `<p class="t-small text-ink-2">Aucun message.</p>`;
      box.scrollTop = box.scrollHeight;
    });
  }
  Screens.opsSupport = function () {
    enter("opsSupport", "Assistance", function (api) {
      api.from("support_threads").select("id,subject,status,updated_at,profiles(full_name,email)").eq("status", "open").order("updated_at", { ascending: false }).limit(40).then(function (res) {
        if (!still("opsSupport")) return;
        const threads = res.data || [];
        if (!openThread && threads[0]) openThread = threads[0].id;
        const list = threads.map(function (t) {
          const person = t.profiles || {};
          return `<button type="button" onclick="Screens._opsOpenThread(${esc(JSON.stringify(t.id))})" class="w-full text-left p-3 ${t.id === openThread ? "bg-gold-soft" : ""}"><p class="t-title">${esc(person.full_name || "Compte")}</p><p class="t-small text-ink-2">${esc(person.email || t.subject || "")} · ${esc(when(t.updated_at))}</p></button>`;
        }).join("");
        layout("opsSupport", "Assistance", `<div class="grid lg:grid-cols-[280px_1fr] gap-4 items-start">
          <div class="card divide-y divide-line overflow-hidden">${list || `<p class="p-4 t-small text-ink-2">Aucune assistance ouverte.</p>`}</div>
          <div class="card p-4 space-y-3">${openThread ? `<div id="ops-chat" class="min-h-[240px] max-h-[420px] overflow-y-auto space-y-3"></div><form class="flex gap-2" onsubmit="event.preventDefault();Screens._opsReply()"><input id="ops-reply" class="input flex-1" maxlength="2000" placeholder="Réponse de la console" autocomplete="off"/><button type="submit" class="btn btn-primary">Envoyer</button></form>` : `<p class="t-body text-ink-2">Choisissez une conversation.</p>`}</div>
        </div>`);
        if (openThread) {
          paintThread(api, openThread);
          if (opsPoll) clearInterval(opsPoll);
          opsPoll = setInterval(function () {
            if (!App.current || App.current.id !== "opsSupport" || !openThread) { clearInterval(opsPoll); opsPoll = null; return; }
            const live = db();
            if (live) paintThread(live, openThread);
          }, 4000);
        }
      });
    });
  };
  Screens._opsOpenThread = function (id) { openThread = id; App.replace("opsSupport"); };
  Screens._opsReply = function () {
    const api = db();
    const input = document.getElementById("ops-reply");
    const text = input ? input.value.trim() : "";
    if (!api || !openThread || !text || !window.YCBackend) return;
    YCBackend.sendSupport(openThread, text, true).then(function (res) {
      if (!res || res.ok === false) { UI.toast((res && res.message) || "Envoi impossible.", "error"); return; }
      if (input) input.value = "";
      paintThread(api, openThread);
    });
  };

  function suggestLogin(name, city) {
    let raw = (String(name || "") + "-" + String(city || "")).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (raw.length < 4) raw = (raw + "REST").replace(/^-+|-+$/g, "");
    return raw.slice(0, 24).replace(/-+$/g, "");
  }
  function cityOptions(code) {
    const country = YCData.countryOf(code || "BJ");
    return country.cities.map(function (name) { return `<option value="${esc(name)}">${esc(name)}</option>`; }).join("");
  }
  function sheetCard() {
    if (!issued) return "";
    return `<div class="card p-5 space-y-3 border-gold">
      <p class="t-title">Fiche à remettre</p>
      <p class="t-small text-ink-2">Le mot de passe s'affiche une seule fois. Téléchargez le PDF, puis quittez cet écran.</p>
      <p class="t-body"><span class="t-caption">Restaurant</span><br>${esc(issued.name)} · ${esc(issued.city || "")}</p>
      <p class="t-body"><span class="t-caption">Identifiant</span><br><span class="font-extrabold">${esc(issued.loginId)}</span></p>
      <p class="t-body"><span class="t-caption">Mot de passe</span><br><span class="font-extrabold break-all">${esc(issued.password)}</span></p>
      <button type="button" onclick="Screens._opsPdf()" class="btn btn-primary btn-block">Télécharger la fiche PDF</button>
    </div>`;
  }
  Screens.opsRestaurants = function () {
    enter("opsRestaurants", "Restaurants", function (api) {
      api.from("partner_places").select("id,name,city,area,paused,partner_access(login_id)").order("created_at", { ascending: false }).limit(80).then(function (res) {
        if (!still("opsRestaurants")) return;
        const rows = (res.data || []).map(function (p) {
          const access = Array.isArray(p.partner_access) ? p.partner_access[0] : p.partner_access;
          const login = access && access.login_id ? access.login_id : "";
          return `<div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3"><div class="min-w-0 flex-1"><p class="t-title truncate">${esc(p.name)}</p><p class="t-small text-ink-2">${esc(p.area || "")}${p.area ? ", " : ""}${esc(p.city)} · ${esc(login || "sans identifiant")}${p.paused ? " · en pause" : ""}</p></div><button type="button" class="btn btn-sm btn-secondary" onclick='Screens._opsReset(${JSON.stringify(p.id)})'>Nouveau mot de passe</button></div>`;
        }).join("");
        const country = ACState.user.countryCode || "BJ";
        layout("opsRestaurants", "Restaurants", `
          ${sheetCard()}
          <form class="card p-5 space-y-3" onsubmit="event.preventDefault();Screens._opsCreateRestaurant()">
            <p class="t-title">Nouveau restaurant</p>
            ${UI.field("opr-name", "Nom", { maxlength: "80", placeholder: "Chez Maman", attrs: "oninput=\"Screens._opsRestSuggest()\"" })}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="block"><span class="label">Pays</span><select id="opr-country" class="select" onchange="Screens._opsRestCountry(this.value)">${YCData.COUNTRIES.map(function (c) { return `<option value="${c.code}" ${c.code === country ? "selected" : ""}>${esc(c.name)}</option>`; }).join("")}</select></label>
              <label class="block"><span class="label">Ville</span><select id="opr-city" class="select" onchange="Screens._opsRestSuggest()">${cityOptions(country)}</select></label>
            </div>
            ${UI.field("opr-area", "Quartier", { maxlength: "80" })}
            ${UI.field("opr-address", "Adresse", { maxlength: "160" })}
            ${UI.field("opr-phone", "Téléphone", { maxlength: "24" })}
            ${UI.field("opr-hours", "Horaires", { maxlength: "80", value: "11:00 – 22:00" })}
            ${UI.field("opr-login", "Identifiant de connexion", { maxlength: "24", placeholder: "MAMAN-COTONOU", autocomplete: "off", attrs: "oninput=\"this.dataset.touched='1'\"" })}
            <p class="t-small text-ink-3">4 à 24 caractères : lettres, chiffres et tirets. Le mot de passe est créé ici et n'est pas conservé.</p>
            ${UI.error("opr-err")}
            <button type="submit" class="btn btn-primary btn-block">Créer le compte et la fiche</button>
          </form>
          ${rows ? `<div class="card divide-y divide-line">${rows}</div>` : `<div class="card p-5"><p class="t-body text-ink-2">Aucun restaurant créé pour le moment.</p></div>`}`);
      });
    });
  };
  Screens._opsRestCountry = function (code) {
    const sel = document.getElementById("opr-city");
    if (!sel) return;
    sel.innerHTML = cityOptions(code);
    Screens._opsRestSuggest();
  };
  Screens._opsRestSuggest = function () {
    const id = document.getElementById("opr-login");
    if (!id || id.dataset.touched === "1") return;
    const name = (document.getElementById("opr-name") || {}).value || "";
    const city = (document.getElementById("opr-city") || {}).value || "";
    if (name.trim().length < 2) return;
    id.value = suggestLogin(name, city);
  };
  Screens._opsCreateRestaurant = function () {
    if (!window.YCBackend || !YCBackend.callFunction) return;
    const body = {
      action: "create",
      name: ((document.getElementById("opr-name") || {}).value || "").trim(),
      countryCode: (document.getElementById("opr-country") || {}).value || "",
      city: (document.getElementById("opr-city") || {}).value || "",
      area: ((document.getElementById("opr-area") || {}).value || "").trim(),
      address: ((document.getElementById("opr-address") || {}).value || "").trim(),
      phone: ((document.getElementById("opr-phone") || {}).value || "").trim(),
      hours: ((document.getElementById("opr-hours") || {}).value || "").trim(),
      loginId: ((document.getElementById("opr-login") || {}).value || "").trim()
    };
    if (body.name.length < 2) { UI.showError("opr-err", "Indiquez le nom du restaurant."); return; }
    YCBackend.callFunction("partner-account", body).then(function (res) {
      if (!res || !res.ok) { UI.showError("opr-err", (res && res.message) || "Création impossible."); return; }
      issued = { placeId: res.placeId, loginId: res.loginId, password: res.password, name: res.name, city: res.city, area: res.area || "" };
      if (window.YCKitchen) YCKitchen.loadCatalog();
      UI.toast("Compte créé. Téléchargez la fiche avant de quitter.", "success");
      App.replace("opsRestaurants");
    });
  };
  Screens._opsReset = function (placeId) {
    if (!window.YCBackend || !/^[0-9a-f-]{36}$/i.test(String(placeId || ""))) return;
    YCBackend.callFunction("partner-account", { action: "reset", placeId: placeId }).then(function (res) {
      if (!res || !res.ok) { UI.toast((res && res.message) || "Nouveau mot de passe impossible.", "error"); return; }
      issued = { placeId: res.placeId, loginId: res.loginId, password: res.password, name: res.name, city: res.city, area: res.area || "" };
      UI.toast("Nouveau mot de passe créé. Téléchargez la fiche.", "success");
      App.replace("opsRestaurants");
    });
  };
  Screens._opsPdf = function () {
    if (!issued || !window.YCSheet) return;
    YCSheet.restaurant(issued);
  };
  function later(container, id, title) {
    if (!gateOn()) { App.replace("opsLogin"); return; }
    layout(id, title, `<div class="card p-5"><p class="t-body text-ink-2">Les événements, tarifs et retraits affichés dans l'application restent des exemples. Les restaurants se créent dans l'onglet Restaurants.</p></div>`);
  }
  Screens.opsMerchants = function (c) { later(c, "opsMerchants", "Prestataires"); };
  Screens.opsEvents = function (c) { later(c, "opsEvents", "Événements"); };
  Screens.opsEventNew = function (c) { later(c, "opsEvents", "Événements"); };
  Screens.opsCulture = function (c) { later(c, "opsCulture", "Culture"); };
  Screens.opsWallet = function (c) { later(c, "opsWallet", "Wallet"); };
  Screens.opsCities = function (c) { later(c, "opsCities", "Villes et tarifs"); };
  Screens.opsSettings = function (c) { later(c, "opsSettings", "Sécurité"); };
})();
