/* Console KYA — back-office interne. Accès : #/kya-ops */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc } = UI;
  const NAV = [
    { id: "opsHome", label: "Vue d'ensemble", icon: "space_dashboard" },
    { id: "opsUsers", label: "Utilisateurs", icon: "group" },
    { id: "opsMerchants", label: "Prestataires", icon: "storefront" },
    { id: "opsEvents", label: "Événements", icon: "confirmation_number" },
    { id: "opsCulture", label: "Culture", icon: "museum" },
    { id: "opsWallet", label: "Wallet", icon: "account_balance_wallet" },
    { id: "opsSupport", label: "Support", icon: "support_agent" },
    { id: "opsCities", label: "Villes et tarifs", icon: "map" },
    { id: "opsSettings", label: "Sécurité", icon: "shield" }
  ];

  function gateOn() { return sessionStorage.getItem("yc-ops") === "1"; }
  function gateSet(v) { if (v) sessionStorage.setItem("yc-ops", "1"); else sessionStorage.removeItem("yc-ops"); }
  window.YCGate = window.YCGate || {};
  YCGate.ops = gateOn;
  YCGate.setOps = gateSet;

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
              <div class="min-w-0"><h1 class="t-h3 truncate">${title}</h1><p class="t-caption">Session nominative · 2FA actif (démo)</p></div>
              <button type="button" onclick="Screens._opsOut()" class="lg:hidden t-small font-semibold">Quitter</button>
            </div>
            <nav class="lg:hidden flex gap-1 overflow-x-auto no-scrollbar px-3 pb-2">${NAV.map((n) => `<button type="button" onclick="App.nav('${n.id}')" class="chip ${active === n.id ? "on" : ""} whitespace-nowrap">${n.label}</button>`).join("")}</nav>
          </header>
          <main class="flex-1 px-4 lg:px-8 py-5 lg:py-8 space-y-5 max-w-[1100px] w-full">${body}</main>
        </div>
      </div>`;
  }

  Screens.opsLogin = function (container) {
    if (gateOn()) { App.replace("opsHome"); return; }
    container.innerHTML = `<div class="min-h-dvh bg-[#0F1115] text-white flex items-center justify-center px-5 py-10">
      <div class="w-full max-w-[400px]">
        <p class="t-caption text-gold">Accès réservé</p>
        <h1 class="t-h1 mt-2">Console KYA</h1>
        <p class="t-small text-white/55 mt-2">Compte nominatif. Mot de passe + code à 4 chiffres. Lien : #/kya-ops</p>
        <form class="card p-5 mt-8 space-y-3 text-ink" onsubmit="event.preventDefault();Screens._opsLogin()">
          ${UI.field("ops-mail", "E-mail professionnel", { type: "email", value: "ops@kyacorp.africa", autocomplete: "username" })}
          ${UI.field("ops-pass", "Mot de passe", { type: "password", placeholder: "••••••••", autocomplete: "current-password" })}
          ${UI.error("ops-err")}
          <button type="submit" class="btn btn-lg btn-primary btn-block">Continuer</button>
        </form>
        <p class="t-small text-white/40 mt-6">Démo : n'importe quel mot de passe, puis code 1234.</p>
      </div>
    </div>`;
  };
  Screens._opsLogin = function () {
    const mail = (document.getElementById("ops-mail") || {}).value || "";
    if (!mail.includes("@")) { UI.showError("ops-err", "E-mail professionnel requis."); return; }
    App.nav("opsOtp", { mail });
  };
  Screens.opsOtp = function (container, params) {
    container.innerHTML = `<div class="min-h-dvh bg-[#0F1115] text-white flex items-center justify-center px-5 py-10">
      <div class="w-full max-w-[400px]">
        <p class="t-caption text-gold">Deuxième facteur</p>
        <h1 class="t-h1 mt-2">Code de confirmation</h1>
        <p class="t-small text-white/55 mt-2">Envoyé à ${esc((params && params.mail) || "ops@kyacorp.africa")}. Démo : 1234.</p>
        <div class="card p-5 mt-6 text-ink">${UI.field("ops-otp", "Code", { inputmode: "numeric", maxlength: 4, placeholder: "1234" })}${UI.error("ops-otp-err")}
        <button type="button" onclick="Screens._opsOtpOk()" class="btn btn-lg btn-primary btn-block mt-4">Entrer</button></div>
      </div>
    </div>`;
  };
  Screens._opsOtpOk = function () {
    const c = (document.getElementById("ops-otp") || {}).value || "";
    if (c !== "1234") { UI.showError("ops-otp-err", "Code incorrect."); return; }
    gateSet(true);
    App.resetTo("opsHome");
  };
  Screens._opsOut = function () { gateSet(false); App.resetTo("opsLogin"); };

  Screens.opsHome = function () {
    const kpis = [
      ["Utilisateurs actifs", "12 480", "Cotonou, Dakar, Lomé, Accra"],
      ["Courses (7 j)", "1 204", "Flotte YOUSS"],
      ["Commandes resto", "638", "12 en attente cuisine"],
      ["Litiges ouverts", "7", "Support"]
    ];
    layout("opsHome", "Vue d'ensemble", `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${kpis.map((k) => `<div class="kpi"><p class="t-caption">${k[0]}</p><p class="t-h2 mt-1">${k[1]}</p><p class="t-small text-ink-2">${k[2]}</p></div>`).join("")}</div>
      <div class="grid lg:grid-cols-2 gap-4">
        <div class="card p-5"><p class="t-title mb-3">File du jour</p>
          ${[["Commande Chez Maman Bénin", "Cuisine · il y a 4 min"], ["Course Haie Vive", "Chauffeur assigné"], ["Signalement livraison", "Support"], ["Nouvel événement saisi", "À publier"]].map((r) => `<div class="flex items-center justify-between py-2.5 border-b border-line last:border-0"><span class="t-small font-semibold">${r[0]}</span><span class="t-caption">${r[1]}</span></div>`).join("")}
        </div>
        <div class="card p-5"><p class="t-title mb-2">Rappel</p><p class="t-body text-ink-2">Wallet, Mobile Money et partenaires VTC sont en démo. Rien n'est branché sur une banque ou Yango / Gozem / inDrive.</p></div>
      </div>`);
  };

  Screens.opsUsers = function () {
    const rows = [
      [ACState.user.fullName, ACState.user.phone, ACState.user.city, "Vérifié"],
      ["Fatou Diallo", "+221 77 00 00 00", "Dakar", "Vérifié"],
      ["Kossi Agbeko", "+228 90 00 00 00", "Lomé", "KYC en cours"],
      ["Ama Mensah", "+233 20 000 0000", "Accra", "Bloqué"]
    ];
    layout("opsUsers", "Utilisateurs", `
      <div class="card overflow-x-auto"><table class="w-full text-left t-small min-w-[520px]"><thead class="t-caption text-ink-3 border-b border-line"><tr>${["Nom", "Téléphone", "Ville", "Statut", ""].map((h) => `<th class="p-3 font-semibold">${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr class="border-b border-line last:border-0"><td class="p-3 t-title">${r[0]}</td><td class="p-3">${r[1]}</td><td class="p-3">${r[2]}</td><td class="p-3">${r[3]}</td><td class="p-3"><button type="button" class="t-small font-bold text-gold-deep" onclick="UI.toast('Action enregistrée au journal (démo).','info')">Journal</button></td></tr>`).join("")}</tbody></table></div>
      <p class="t-small text-ink-3">Blocage, reset PIN et KYC passent par le journal. Aucune action irréversible en maquette.</p>`);
  };

  Screens.opsMerchants = function () {
    const invite = location.origin + location.pathname + "#/pro/rejoindre?t=YC-PRO-MAMAN";
    layout("opsMerchants", "Prestataires", `
      <div class="card p-5"><p class="t-title">Lien d'invitation restaurant</p><p class="t-small text-ink-2 mt-1">À envoyer au gérant. Expire en démo après usage. Jeton : YC-PRO-MAMAN</p>
        <div class="mt-3 flex flex-col sm:flex-row gap-2"><input class="input" readonly value="${esc(invite)}"/><button type="button" onclick="navigator.clipboard&&navigator.clipboard.writeText(${UI.js(invite)});UI.toast('Lien copié.','success')" class="btn btn-dark sm:w-auto">Copier</button></div>
      </div>
      <div class="card divide-y divide-line">
        ${[["Chez Maman Bénin", "Restaurant · Cotonou", "Actif"], ["Atelier Ayélé", "Market · Cotonou", "Actif"], ["Youss Live", "Événements", "En revue"]].map((m) => `<div class="p-4 flex items-center justify-between gap-3"><div><p class="t-title">${m[0]}</p><p class="t-small text-ink-2">${m[1]}</p></div><span class="badge ${m[2] === "Actif" ? "badge-success" : "badge-warn"}">${m[2]}</span></div>`).join("")}
      </div>`);
  };

  Screens.opsEvents = function () {
    const extra = ACState.content.events || [];
    const all = extra.concat(YCData.EVENTS).slice(0, 12);
    layout("opsEvents", "Événements", `
      ${UI.primaryButton("Nouvel événement", "App.nav('opsEventNew')", { icon: "add", block: false })}
      <div class="card divide-y divide-line mt-4">${all.map((e) => `<div class="p-4 flex items-center justify-between gap-3"><div class="min-w-0"><p class="t-title truncate">${esc(e.name)}</p><p class="t-small text-ink-2">${esc(e.city)} · ${e.date} · ${e.cat}</p></div>${e.ops ? `<button type="button" onclick="Screens._opsDelEvent('${e.id}')" class="t-small text-danger font-semibold">Retirer</button>` : `<span class="t-caption">Catalogue</span>`}</div>`).join("")}</div>`);
  };
  Screens.opsEventNew = function () {
    layout("opsEvents", "Nouvel événement", `
      <div class="card p-5 space-y-3 max-w-narrow">
        ${UI.field("oe-name", "Titre", { placeholder: "Nom de l'événement" })}
        <div class="grid grid-cols-2 gap-3">${UI.select("oe-cat", "Catégorie", YCData.EVENT_CATS, "Concerts")}${UI.select("oe-city", "Ville", YCData.DESTINATIONS, ACState.user.city)}</div>
        <div class="grid grid-cols-2 gap-3">${UI.field("oe-date", "Date", { type: "date", value: "2026-12-20" })}${UI.field("oe-time", "Heure", { value: "20:00" })}</div>
        ${UI.field("oe-place", "Lieu", { placeholder: "Salle, stade, adresse" })}
        ${UI.field("oe-price", "Prix d'entrée (FCFA)", { type: "number", placeholder: "5000" })}
        ${UI.primaryButton("Publier", "Screens._opsSaveEvent()", { size: "lg", icon: "publish" })}
      </div>`);
  };
  Screens._opsSaveEvent = function () {
    const name = (document.getElementById("oe-name") || {}).value.trim();
    const price = parseInt((document.getElementById("oe-price") || {}).value, 10) || 0;
    if (!name || !price) { UI.toast("Titre et prix requis.", "error"); return; }
    const city = document.getElementById("oe-city").value;
    const c = YCData.cityOf(city);
    ACState.content.events = ACState.content.events || [];
    ACState.content.events.unshift({
      id: "ev_ops_" + Date.now(), ops: true, name, cat: document.getElementById("oe-cat").value, city, country: c.country,
      place: document.getElementById("oe-place").value.trim() || city, date: document.getElementById("oe-date").value, time: document.getElementById("oe-time").value,
      img: YCData.IMG + "services/svc-events.jpg", lat: c.lat, lng: c.lng, organizer: "KYA CORPORATION",
      body: "Événement ajouté depuis la console interne.", program: ["Ouverture des portes"],
      tickets: [{ id: "t_ops", label: "Entrée", price, left: 200 }]
    });
    ACStore.emit();
    UI.toast("Événement publié. Visible dans l'app client.", "success");
    App.nav("opsEvents");
  };
  Screens._opsDelEvent = function (id) {
    ACState.content.events = (ACState.content.events || []).filter((e) => e.id !== id);
    ACStore.emit();
    UI.toast("Retiré du catalogue.", "info");
  };

  Screens.opsCulture = function () {
    layout("opsCulture", "Culture", `<div class="card divide-y divide-line">${YCData.SITES.slice(0, 8).map((s) => `<div class="p-4"><p class="t-title">${esc(s.name)}</p><p class="t-small text-ink-2">${esc(s.place)}</p></div>`).join("")}</div><p class="t-small text-ink-3">Fiches et QR se gèrent ici en production. Catalogue actuel en lecture.</p>`);
  };
  Screens.opsWallet = function () {
    layout("opsWallet", "Wallet", `
      <div class="card p-5"><p class="t-title">Plafonds (démo)</p><p class="t-small text-ink-2 mt-1">Recharge max / jour : 200 000 FCFA · retrait : sur validation KYC.</p></div>
      <div class="card p-5"><p class="t-title">File de retraits</p><p class="t-small text-ink-2 mt-1">Aucune demande. Les vrais flux exigent un agrément local.</p></div>`);
  };
  Screens.opsSupport = function () {
    layout("opsSupport", "Support", `<div class="card divide-y divide-line">${[["SOS position partagée", "Urgent", "Ouvert"], ["Colis non reçu", "Livraison", "En cours"], ["PIN oublié", "Compte", "Clos"]].map((t) => `<div class="p-4 flex justify-between gap-3"><div><p class="t-title">${t[0]}</p><p class="t-small text-ink-2">${t[1]}</p></div><span class="badge badge-neutral">${t[2]}</span></div>`).join("")}</div>`);
  };
  Screens.opsCities = function () {
    layout("opsCities", "Villes et tarifs", `<div class="grid sm:grid-cols-2 gap-3">${YCData.DESTINATIONS.map((c) => `<div class="card p-4"><p class="t-title">${c}</p><p class="t-small text-ink-2">${YCData.CITIES[c].country} · course : 1 500 FCFA + 350 / km</p></div>`).join("")}</div>`);
  };
  Screens.opsSettings = function () {
    layout("opsSettings", "Sécurité", `
      <div class="card p-5 space-y-3">
        <p class="t-title">Règles de la console</p>
        <p class="t-body text-ink-2">Comptes nominatifs, 2FA obligatoire, session limitée à l'onglet, journal des actions. Pas d'URL magique : le domaine ops sera séparé de l'app client.</p>
        <p class="t-small text-ink-3">Maquette : la session ops n'est pas écrite dans le stockage long. Fermer l'onglet déconnecte.</p>
      </div>`);
  };
})();
