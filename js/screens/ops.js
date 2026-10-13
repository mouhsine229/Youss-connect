// Console KYA, le back-office interne. Accessible sur #/kya-ops
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
              <div class="min-w-0"><h1 class="t-h3 truncate">${title}</h1><p class="t-caption">Session nominative · accès démo</p></div>
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
        <p class="t-small text-white/40 mt-6">Démo : mot de passe kya-ops, puis code 1234.</p>
      </div>
    </div>`;
  };
  Screens._opsLogin = function () {
    const mail = (document.getElementById("ops-mail") || {}).value || "";
    const pass = (document.getElementById("ops-pass") || {}).value || "";
    if (!mail.includes("@")) { UI.showError("ops-err", "E-mail professionnel requis."); return; }
    if (pass !== "kya-ops") { UI.showError("ops-err", "Mot de passe incorrect (démo : kya-ops)."); return; }
    try { sessionStorage.setItem("yc-ops-pending", "1"); } catch (e) { /* no-op */ }
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
    try { sessionStorage.removeItem("yc-ops-pending"); } catch (e) { /* no-op */ }
    gateSet(true);
    App.resetTo("opsHome");
  };
  Screens._opsOut = function () { gateSet(false); App.resetTo("opsLogin"); };

  function opsSeed() {
    return {
      hiddenEvents: [],
      queue: [
        { id: "q1", title: "Commande Chez Maman Bénin", meta: "Cuisine · il y a 4 min" },
        { id: "q2", title: "Course Haie Vive", meta: "Chauffeur assigné" },
        { id: "q3", title: "Signalement livraison", meta: "Support" },
        { id: "q4", title: "Nouvel événement saisi", meta: "À publier" }
      ],
      users: [
        { id: "u1", name: ACState.user.fullName, phone: ACState.user.phone, city: ACState.user.city, status: "Vérifié" },
        { id: "u2", name: "Fatou Diallo", phone: "+221 77 00 00 00", city: "Dakar", status: "Vérifié" },
        { id: "u3", name: "Kossi Agbeko", phone: "+228 90 00 00 00", city: "Lomé", status: "KYC en cours" },
        { id: "u4", name: "Ama Mensah", phone: "+233 20 000 0000", city: "Accra", status: "Bloqué" }
      ],
      merchants: [
        { id: "m1", name: "Chez Maman Bénin", kind: "Restaurant · Cotonou", status: "Actif" },
        { id: "m2", name: "Atelier Ayélé", kind: "Market · Cotonou", status: "Actif" },
        { id: "m3", name: "Youss Live", kind: "Événements", status: "En revue" }
      ],
      sites: YCData.SITES.slice(0, 8).map((s) => ({ id: s.id, name: s.name, place: s.place })),
      withdrawals: [
        { id: "w1", who: "Alassane Koffi", amount: "45 000 FCFA", status: "En attente" }
      ],
      tickets: [
        { id: "t1", title: "SOS position partagée", kind: "Urgent", status: "Ouvert" },
        { id: "t2", title: "Colis non reçu", kind: "Livraison", status: "En cours" },
        { id: "t3", title: "PIN oublié", kind: "Compte", status: "Clos" }
      ],
      cities: YCData.DESTINATIONS.map((c, i) => ({ id: "c" + (i + 1), name: c, country: YCData.CITIES[c].country, fare: "1 500 FCFA + 350 / km" })),
      staff: [
        { id: "s1", mail: "ops@kyacorp.africa", role: "Admin" },
        { id: "s2", mail: "support@kyacorp.africa", role: "Support" }
      ]
    };
  }
  function bag() {
    const c = ACState.content;
    if (!c.ops) c.ops = opsSeed();
    const s = opsSeed();
    Object.keys(s).forEach((k) => { if (!c.ops[k]) c.ops[k] = s[k]; });
    return c.ops;
  }
  function val(id) { const el = document.getElementById(id); return el ? String(el.value || "").trim() : ""; }
  function addBar(label, onclick) {
    return `<div class="flex flex-wrap items-center justify-between gap-3">${UI.primaryButton(label, onclick, { icon: "add", block: false })}</div>`;
  }
  function delBtn(key, id) {
    return `<button type="button" class="t-small font-semibold text-danger whitespace-nowrap" onclick="Screens._opsAskDel('${key}','${id}')">Supprimer</button>`;
  }
  function emptyRow(msg) {
    return `<p class="p-6 t-small text-ink-2 text-center">${msg}</p>`;
  }
  function formSheet(title, fields, saveCall) {
    UI.openSheet(`<h3 class="t-h3 mb-4">${title}</h3><div class="space-y-3">${fields}${UI.primaryButton("Enregistrer", saveCall, { size: "lg" })}</div>`);
  }
  Screens._opsAskDel = function (key, id) {
    UI.confirm({
      title: "Supprimer ?",
      body: "La ligne disparaît de la console. En maquette, rien n'est envoyé à un serveur.",
      okLabel: "Supprimer",
      danger: true,
      icon: "delete",
      onOk: `Screens._opsRemove(${JSON.stringify(key)},${JSON.stringify(id)})`
    });
  };
  Screens._opsRemove = function (key, id) {
    const b = bag();
    b[key] = (b[key] || []).filter((x) => x.id !== id);
    ACStore.emit();
    UI.toast("Ligne supprimée.", "info");
  };
  Screens._opsPush = function (key, row, msg) {
    bag()[key].unshift(row);
    UI.closeSheet();
    ACStore.emit();
    UI.toast(msg || "Ajouté.", "success");
  };

  Screens.opsHome = function () {
    const kpis = [
      ["Utilisateurs actifs", String((bag().users || []).length), "Comptes de la console"],
      ["Courses (7 j)", "1 204", "Flotte YOUSS"],
      ["Commandes resto", "638", "12 en attente cuisine"],
      ["Litiges ouverts", String((bag().tickets || []).filter((t) => t.status !== "Clos").length), "Support"]
    ];
    const queue = bag().queue || [];
    layout("opsHome", "Vue d'ensemble", `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${kpis.map((k) => `<div class="kpi"><p class="t-caption">${k[0]}</p><p class="t-h2 mt-1">${k[1]}</p><p class="t-small text-ink-2">${k[2]}</p></div>`).join("")}</div>
      <div class="grid lg:grid-cols-2 gap-4">
        <div class="card p-5">
          <div class="flex items-center justify-between gap-3 mb-3"><p class="t-title">File du jour</p>${UI.primaryButton("Ajouter", "Screens._opsQueueForm()", { icon: "add", block: false, size: "sm" })}</div>
          ${queue.length ? queue.map((r) => `<div class="flex items-center justify-between gap-3 py-2.5 border-b border-line last:border-0"><div class="min-w-0"><p class="t-small font-semibold">${esc(r.title)}</p><p class="t-caption">${esc(r.meta)}</p></div>${delBtn("queue", r.id)}</div>`).join("") : emptyRow("File vide.")}
        </div>
        <div class="card p-5"><p class="t-title mb-2">Rappel</p><p class="t-body text-ink-2">Wallet, Mobile Money et partenaires VTC sont en démo. Rien n'est branché sur une banque ou WeDrive / Gozem / inDrive.</p></div>
      </div>`);
  };
  Screens._opsQueueForm = function () {
    formSheet("Ajouter à la file", UI.field("oq-title", "Intitulé", { placeholder: "Ex. Commande en retard" }) + UI.field("oq-meta", "Détail", { placeholder: "Cuisine · maintenant" }), "Screens._opsQueueSave()");
  };
  Screens._opsQueueSave = function () {
    if (!val("oq-title")) { UI.toast("Intitulé requis.", "error"); return; }
    Screens._opsPush("queue", { id: ACStore.uid("q"), title: val("oq-title"), meta: val("oq-meta") || "Console" }, "Ajouté à la file.");
  };

  Screens.opsUsers = function () {
    const rows = bag().users || [];
    layout("opsUsers", "Utilisateurs", `
      ${addBar("Ajouter un utilisateur", "Screens._opsUserForm()")}
      <div class="card overflow-x-auto"><table class="w-full text-left t-small min-w-[560px]"><thead class="t-caption text-ink-3 border-b border-line"><tr>${["Nom", "Téléphone", "Ville", "Statut", ""].map((h) => `<th class="p-3 font-semibold">${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.length ? rows.map((r) => `<tr class="border-b border-line last:border-0"><td class="p-3 t-title">${esc(r.name)}</td><td class="p-3">${esc(r.phone)}</td><td class="p-3">${esc(r.city)}</td><td class="p-3">${esc(r.status)}</td><td class="p-3">${delBtn("users", r.id)}</td></tr>`).join("") : `<tr><td colspan="5">${emptyRow("Aucun utilisateur.")}</td></tr>`}</tbody></table></div>`);
  };
  Screens._opsUserForm = function () {
    formSheet("Nouvel utilisateur",
      UI.field("ou-name", "Nom", { placeholder: "Prénom Nom" }) +
      UI.field("ou-phone", "Téléphone", { placeholder: "+229 97 00 00 00" }) +
      UI.select("ou-city", "Ville", YCData.DESTINATIONS, ACState.user.city) +
      UI.select("ou-status", "Statut", ["Vérifié", "KYC en cours", "Bloqué"], "Vérifié"),
      "Screens._opsUserSave()");
  };
  Screens._opsUserSave = function () {
    if (!val("ou-name") || !val("ou-phone")) { UI.toast("Nom et téléphone requis.", "error"); return; }
    Screens._opsPush("users", { id: ACStore.uid("u"), name: val("ou-name"), phone: val("ou-phone"), city: val("ou-city"), status: val("ou-status") }, "Utilisateur ajouté.");
  };

  Screens.opsMerchants = function () {
    const invite = location.origin + location.pathname + "#/pro/rejoindre?t=YC-PRO-MAMAN";
    const list = bag().merchants || [];
    layout("opsMerchants", "Prestataires", `
      ${addBar("Ajouter un prestataire", "Screens._opsMerchantForm()")}
      <div class="card p-5"><p class="t-title">Lien d'invitation restaurant</p><p class="t-small text-ink-2 mt-1">À envoyer au gérant. Jeton : YC-PRO-MAMAN</p>
        <div class="mt-3 flex flex-col sm:flex-row gap-2"><input class="input" readonly value="${esc(invite)}"/><button type="button" onclick="UI.copy(${UI.js(invite)},'Lien copié.')" class="btn btn-dark sm:w-auto">Copier</button></div>
      </div>
      <div class="card divide-y divide-line">${list.length ? list.map((m) => `<div class="p-4 flex items-center justify-between gap-3"><div class="min-w-0"><p class="t-title">${esc(m.name)}</p><p class="t-small text-ink-2">${esc(m.kind)}</p></div><div class="flex items-center gap-3">${UI.badge(m.status, m.status === "Actif" ? "success" : "warn")}${delBtn("merchants", m.id)}</div></div>`).join("") : emptyRow("Aucun prestataire.")}</div>`);
  };
  Screens._opsMerchantForm = function () {
    formSheet("Nouveau prestataire",
      UI.field("om-name", "Nom", { placeholder: "Raison sociale" }) +
      UI.field("om-kind", "Activité", { placeholder: "Restaurant · Cotonou" }) +
      UI.select("om-status", "Statut", ["Actif", "En revue", "Suspendu"], "Actif"),
      "Screens._opsMerchantSave()");
  };
  Screens._opsMerchantSave = function () {
    if (!val("om-name")) { UI.toast("Nom requis.", "error"); return; }
    Screens._opsPush("merchants", { id: ACStore.uid("m"), name: val("om-name"), kind: val("om-kind") || "Prestataire", status: val("om-status") }, "Prestataire ajouté.");
  };

  Screens.opsEvents = function () {
    const hidden = bag().hiddenEvents || [];
    const extra = ACState.content.events || [];
    const all = extra.concat(YCData.EVENTS.filter((e) => hidden.indexOf(e.id) < 0));
    layout("opsEvents", "Événements", `
      ${addBar("Nouvel événement", "App.nav('opsEventNew')")}
      <div class="card divide-y divide-line">${all.length ? all.map((e) => `<div class="p-4 flex items-center justify-between gap-3"><div class="min-w-0"><p class="t-title truncate">${esc(e.name)}</p><p class="t-small text-ink-2">${esc(e.city)} · ${esc(e.date)} · ${esc(e.cat)}</p></div><button type="button" onclick="Screens._opsDelEvent('${e.id}')" class="t-small text-danger font-semibold">Supprimer</button></div>`).join("") : emptyRow("Aucun événement.")}</div>`);
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
    const name = val("oe-name");
    const price = parseInt(val("oe-price"), 10) || 0;
    if (!name || !price) { UI.toast("Titre et prix requis.", "error"); return; }
    const city = val("oe-city");
    const c = YCData.cityOf(city);
    ACState.content.events = ACState.content.events || [];
    ACState.content.events.unshift({
      id: "ev_ops_" + Date.now(), ops: true, name, cat: val("oe-cat"), city, country: c.country,
      place: val("oe-place") || city, date: val("oe-date"), time: val("oe-time"),
      img: YCData.IMG + "services/svc-events.jpg", lat: c.lat, lng: c.lng, organizer: "KYA CORPORATION",
      body: "Événement ajouté depuis la console interne.", program: ["Ouverture des portes"],
      tickets: [{ id: "t_ops", label: "Entrée", price, left: 200 }]
    });
    ACStore.emit();
    UI.toast("Événement publié. Visible dans l'app client.", "success");
    App.nav("opsEvents");
  };
  Screens._opsDelEvent = function (id) {
    UI.confirm({
      title: "Supprimer cet événement ?",
      body: "Il disparaît du catalogue client et de la console.",
      okLabel: "Supprimer",
      danger: true,
      icon: "delete",
      onOk: `Screens._opsDelEventGo(${JSON.stringify(id)})`
    });
  };
  Screens._opsDelEventGo = function (id) {
    const extra = ACState.content.events || [];
    if (extra.some((e) => e.id === id)) ACState.content.events = extra.filter((e) => e.id !== id);
    else {
      const h = bag().hiddenEvents;
      if (h.indexOf(id) < 0) h.push(id);
    }
    ACStore.emit();
    UI.toast("Événement retiré.", "info");
  };

  Screens.opsCulture = function () {
    const list = bag().sites || [];
    layout("opsCulture", "Culture", `
      ${addBar("Ajouter un lieu", "Screens._opsSiteForm()")}
      <div class="card divide-y divide-line">${list.length ? list.map((s) => `<div class="p-4 flex items-center justify-between gap-3"><div class="min-w-0"><p class="t-title">${esc(s.name)}</p><p class="t-small text-ink-2">${esc(s.place)}</p></div>${delBtn("sites", s.id)}</div>`).join("") : emptyRow("Aucun lieu.")}</div>`);
  };
  Screens._opsSiteForm = function () {
    formSheet("Nouveau lieu", UI.field("os-name", "Nom", { placeholder: "Site, musée, monument" }) + UI.field("os-place", "Lieu", { placeholder: "Ville, pays" }), "Screens._opsSiteSave()");
  };
  Screens._opsSiteSave = function () {
    if (!val("os-name")) { UI.toast("Nom requis.", "error"); return; }
    Screens._opsPush("sites", { id: ACStore.uid("site"), name: val("os-name"), place: val("os-place") || "Lieu à préciser" }, "Lieu ajouté.");
  };

  Screens.opsWallet = function () {
    const list = bag().withdrawals || [];
    layout("opsWallet", "Wallet", `
      <div class="card p-5"><p class="t-title">Plafonds (démo)</p><p class="t-small text-ink-2 mt-1">Recharge max / jour : 200 000 FCFA · retrait : sur validation KYC.</p></div>
      ${addBar("Ajouter un retrait", "Screens._opsWdForm()")}
      <div class="card divide-y divide-line">${list.length ? list.map((w) => `<div class="p-4 flex items-center justify-between gap-3"><div><p class="t-title">${esc(w.who)}</p><p class="t-small text-ink-2">${esc(w.amount)} · ${esc(w.status)}</p></div>${delBtn("withdrawals", w.id)}</div>`).join("") : emptyRow("Aucune demande de retrait.")}</div>`);
  };
  Screens._opsWdForm = function () {
    formSheet("Demande de retrait",
      UI.field("ow-who", "Titulaire", { placeholder: "Nom du compte" }) +
      UI.field("ow-amount", "Montant", { placeholder: "25 000 FCFA" }) +
      UI.select("ow-status", "Statut", ["En attente", "Validé", "Refusé"], "En attente"),
      "Screens._opsWdSave()");
  };
  Screens._opsWdSave = function () {
    if (!val("ow-who") || !val("ow-amount")) { UI.toast("Titulaire et montant requis.", "error"); return; }
    Screens._opsPush("withdrawals", { id: ACStore.uid("w"), who: val("ow-who"), amount: val("ow-amount"), status: val("ow-status") }, "Demande ajoutée.");
  };

  Screens.opsSupport = function () {
    const list = bag().tickets || [];
    layout("opsSupport", "Support", `
      ${addBar("Nouveau ticket", "Screens._opsTicketForm()")}
      <div class="card divide-y divide-line">${list.length ? list.map((t) => `<div class="p-4 flex justify-between gap-3"><div class="min-w-0"><p class="t-title">${esc(t.title)}</p><p class="t-small text-ink-2">${esc(t.kind)}</p></div><div class="flex items-center gap-3">${UI.badge(t.status, "neutral")}${delBtn("tickets", t.id)}</div></div>`).join("") : emptyRow("Aucun ticket.")}</div>`);
  };
  Screens._opsTicketForm = function () {
    formSheet("Nouveau ticket",
      UI.field("ot-title", "Sujet", { placeholder: "Ex. Colis non reçu" }) +
      UI.select("ot-kind", "Catégorie", ["Urgent", "Livraison", "Compte", "Paiement", "Autre"], "Compte") +
      UI.select("ot-status", "Statut", ["Ouvert", "En cours", "Clos"], "Ouvert"),
      "Screens._opsTicketSave()");
  };
  Screens._opsTicketSave = function () {
    if (!val("ot-title")) { UI.toast("Sujet requis.", "error"); return; }
    Screens._opsPush("tickets", { id: ACStore.uid("t"), title: val("ot-title"), kind: val("ot-kind"), status: val("ot-status") }, "Ticket ouvert.");
  };

  Screens.opsCities = function () {
    const list = bag().cities || [];
    layout("opsCities", "Villes et tarifs", `
      ${addBar("Ajouter une ville", "Screens._opsCityForm()")}
      <div class="grid sm:grid-cols-2 gap-3">${list.length ? list.map((c) => `<div class="card p-4 flex items-start justify-between gap-3"><div><p class="t-title">${esc(c.name)}</p><p class="t-small text-ink-2">${esc(c.country)} · ${esc(c.fare)}</p></div>${delBtn("cities", c.id)}</div>`).join("") : emptyRow("Aucune ville.")}</div>`);
  };
  Screens._opsCityForm = function () {
    formSheet("Nouvelle ville",
      UI.field("oc-name", "Ville", { placeholder: "Parakou" }) +
      UI.field("oc-country", "Pays", { placeholder: "Bénin" }) +
      UI.field("oc-fare", "Tarif course", { placeholder: "1 500 FCFA + 350 / km" }),
      "Screens._opsCitySave()");
  };
  Screens._opsCitySave = function () {
    if (!val("oc-name")) { UI.toast("Ville requise.", "error"); return; }
    Screens._opsPush("cities", { id: ACStore.uid("c"), name: val("oc-name"), country: val("oc-country") || "Pays à préciser", fare: val("oc-fare") || "Tarif à définir" }, "Ville ajoutée.");
  };

  Screens.opsSettings = function () {
    const list = bag().staff || [];
    layout("opsSettings", "Sécurité", `
      <div class="card p-5 space-y-3">
        <p class="t-title">Règles de la console</p>
        <p class="t-body text-ink-2">Comptes nominatifs, 2FA obligatoire, session limitée à l'onglet, journal des actions. Pas d'URL magique : le domaine ops sera séparé de l'app client.</p>
        <p class="t-small text-ink-3">Maquette : la session ops n'est pas écrite dans le stockage long. Fermer l'onglet déconnecte.</p>
      </div>
      ${addBar("Ajouter un accès", "Screens._opsStaffForm()")}
      <div class="card divide-y divide-line">${list.length ? list.map((s) => `<div class="p-4 flex items-center justify-between gap-3"><div><p class="t-title">${esc(s.mail)}</p><p class="t-small text-ink-2">${esc(s.role)}</p></div>${delBtn("staff", s.id)}</div>`).join("") : emptyRow("Aucun accès.")}</div>`);
  };
  Screens._opsStaffForm = function () {
    formSheet("Nouvel accès console",
      UI.field("oa-mail", "E-mail professionnel", { type: "email", placeholder: "prenom@kyacorp.africa" }) +
      UI.select("oa-role", "Rôle", ["Admin", "Support", "Lecture"], "Support"),
      "Screens._opsStaffSave()");
  };
  Screens._opsStaffSave = function () {
    if (!val("oa-mail").includes("@")) { UI.toast("E-mail professionnel requis.", "error"); return; }
    Screens._opsPush("staff", { id: ACStore.uid("s"), mail: val("oa-mail"), role: val("oa-role") }, "Accès ajouté.");
  };
})();
