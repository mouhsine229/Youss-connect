/* Profil, édition, adresses, moyens de paiement, sécurité, langues, aide, paramètres */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;

  function menuRow(ic, label, onclick, opts) {
    opts = opts || {};
    return `<button type="button" onclick="${onclick}" class="menu-row ${opts.danger ? "!border-danger/30" : ""}"><span class="flex items-center gap-3 min-w-0"><span class="menu-icon ${opts.danger ? "!bg-danger-soft !text-danger" : ""}">${icon(ic)}</span><span class="min-w-0"><span class="block t-title ${opts.danger ? "text-danger" : ""}">${label}</span>${opts.sub ? `<span class="block t-small text-ink-2 truncate">${opts.sub}</span>` : ""}</span></span>${opts.right || icon("chevron_right", "text-ink-3")}</button>`;
  }

  Screens.profile = function (container) {
    const u = ACState.user, pts = ACState.rewards.points, tier = YCData.tierFor(pts);
    const counts = { rides: ACState.activities.filter((a) => a.service === "transport").length, orders: ACState.activities.filter((a) => a.service === "restaurant" || a.service === "market").length, tickets: ACState.tickets.length };
    const body = `
      <div class="grid lg:grid-cols-[380px_1fr] gap-6 lg:gap-8 items-start">
        <div class="space-y-4 lg:sticky lg:top-24">
          <section class="card p-5 lg:p-6">
            <div class="flex items-center gap-4">${UI.avatar(u, "w-20 h-20")}<div class="min-w-0"><h2 class="t-h2 truncate flex items-center gap-1.5">${esc(u.fullName)}${u.verified ? icon("verified", "text-gold text-[20px]", true) : ""}</h2><p class="t-small text-ink-2">Membre depuis ${u.since} · ${u.verified ? "compte vérifié" : "à vérifier"}</p><button type="button" onclick="App.nav('editProfile')" class="t-small font-bold text-gold-deep dark:text-gold mt-1">Modifier mon profil</button></div></div>
            <div class="mt-5 space-y-2.5 t-small">${[["call", u.phone], ["mail", u.email], ["flag", u.country], ["location_city", u.city]].map((x) => `<p class="flex items-center gap-2.5"><span class="text-ink-3">${icon(x[0], "text-[18px]")}</span><span class="truncate">${esc(x[1])}</span></p>`).join("")}</div>
            <div class="grid grid-cols-3 gap-2 mt-5 text-center">${[["Courses", counts.rides, "activities", { f: "transport" }], ["Commandes", counts.orders, "activities", { f: "restaurant" }], ["Billets", counts.tickets, "myTickets", {}]].map((s) => `<button type="button" onclick="${go(s[2], s[3])}" class="rounded-xl bg-surface-low p-3 hover:bg-card-high"><p class="t-h3">${s[1]}</p><p class="t-caption text-ink-3">${s[0]}</p></button>`).join("")}</div>
          </section>
          <button type="button" onclick="App.nav('rewards')" class="w-full card-dark p-5 text-left relative overflow-hidden"><span class="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-gold/25 blur-2xl"></span><p class="t-caption text-gold">Youss Bonus · niveau ${tier.id}</p><p class="t-h1 mt-1">${pts.toLocaleString("fr-FR")} pts</p><p class="t-small text-white/70 mt-1">${YCData.nextTier(pts) ? (YCData.nextTier(pts).min - pts).toLocaleString("fr-FR") + " pts avant " + YCData.nextTier(pts).id : "Niveau maximum"}</p></button>
        </div>
        <div class="space-y-5">
          <section><p class="t-caption text-ink-3 mb-2">Mon compte</p><div class="grid sm:grid-cols-2 gap-2.5">
            ${menuRow("person", "Modifier mon profil", "App.nav('editProfile')")}${menuRow("restaurant", "Mes commandes", go("activities", { f: "restaurant" }))}${menuRow("directions_car", "Mes courses", go("activities", { f: "transport" }))}${menuRow("qr_code_2", "Mes billets", "App.nav('myTickets')", { sub: ACState.tickets.length + " billet(s)" })}${menuRow("home_pin", "Mes adresses", "App.nav('addresses')", { sub: ACState.addresses.length + " adresse(s)" })}${menuRow("credit_card", "Moyens de paiement", "App.nav('paymentMethods')")}${menuRow("bookmark", "Lieux sauvegardés", "App.nav('savedPlaces')", { sub: ACState.saved.length + " lieu(x)" })}${menuRow("workspace_premium", "Youss Bonus", "App.nav('rewards')", { sub: pts.toLocaleString("fr-FR") + " points" })}</div></section>
          <section><p class="t-caption text-ink-3 mb-2">Professionnel</p>${menuRow("business_center", "Youss Business", "App.nav('business')", { sub: "Espace professionnel · " + esc(ACState.business.profile.name) })}</section>
          <section><p class="t-caption text-ink-3 mb-2">Réglages</p><div class="grid sm:grid-cols-2 gap-2.5">
            ${menuRow("security", I18N.t("security"), "App.nav('security')")}${menuRow("language", "Langues", "App.nav('languages')", { sub: (I18N.LANGS.find((l) => l.id === I18N.lang) || {}).label })}${menuRow("notifications", "Notifications", "App.nav('notificationPrefs')")}${menuRow(ACState.prefs.theme === "dark" ? "dark_mode" : "light_mode", I18N.t("theme"), "Screens._toggleTheme()", { sub: ACState.prefs.theme === "dark" ? I18N.t("theme_dark") : I18N.t("theme_light"), right: UI.toggle(ACState.prefs.theme === "dark", "event.stopPropagation();Screens._toggleTheme()", "Thème sombre") })}${menuRow("help", I18N.t("help"), "App.nav('help')")}${menuRow("settings", I18N.t("settings"), "App.nav('settings')")}</div></section>
          ${menuRow("logout", I18N.t("logout"), "Screens._logout()", { danger: true })}
          <p class="t-caption text-ink-3 text-center">YOUSS CONNECT v2.0 · Portée par KYA CORPORATION</p>
        </div>
      </div>`;
    Shell.render(container, { title: I18N.t("nav_profile"), subtitle: esc(u.fullName), body, nav: "profile" });
  };
  Screens._toggleTheme = () => { UI.setTheme(ACState.prefs.theme === "dark" ? "light" : "dark"); };
  Screens._logout = () => UI.confirm({ title: "Se déconnecter ?", body: "Vous devrez vous reconnecter pour accéder à nouveau à YOUSS CONNECT. Vos données de démonstration sont conservées sur cet appareil.", okLabel: I18N.t("logout"), danger: true, icon: "logout", onOk: "Screens._confirmLogout()" });
  Screens._confirmLogout = () => { const done = () => { ACState.session.authenticated = false; ACStore.emit(); App.resetTo("login"); }; if (window.YCBackend) YCBackend.signOut().then(done, done); else done(); };

  /* ---------- Édition ---------- */
  Screens.editProfile = function (container) {
    const u = ACState.user; const c = YCData.countryOf(u.countryCode);
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card p-5 flex items-center gap-4">${UI.avatar(u, "w-16 h-16")}<div class="flex-1"><p class="t-title">Photo de profil</p><p class="t-small text-ink-2">JPG ou PNG, 2 Mo max</p></div><label class="btn btn-sm btn-outline cursor-pointer">Changer<input type="file" accept="image/*" class="hidden" onchange="Screens._avatarFile(this)"/></label></div>
      <div class="card p-5 space-y-3">
        <div class="grid grid-cols-2 gap-3">${UI.field("ep-first", "Prénom", { value: u.name })}${UI.field("ep-last", "Nom", { value: u.fullName.split(" ").slice(1).join(" ") })}</div>
        ${UI.field("ep-phone", "Téléphone", { value: u.phone, type: "tel", icon: "call" })}${UI.field("ep-email", "E-mail", { value: u.email, type: "email", icon: "mail" })}
        <div class="grid grid-cols-2 gap-3">${UI.select("ep-country", "Pays", YCData.COUNTRIES.map((x) => ({ value: x.code, label: x.flag + " " + x.name })), c.code, "Screens._epCities()")}${UI.select("ep-city", "Ville", c.cities, u.city)}</div>
      </div>
      ${UI.primaryButton(I18N.t("save"), "Screens._saveProfile()", { size: "lg", icon: "save" })}</div>`;
    Shell.render(container, { title: "Modifier mon profil", back: true, body, nav: false, showNav: true });
  };
  Screens._epCities = () => { const c = YCData.countryOf(document.getElementById("ep-country").value); document.getElementById("ep-city").innerHTML = c.cities.map((x) => `<option>${x}</option>`).join(""); };
  Screens._avatarFile = (input) => { const f = input.files && input.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { ACState.user.avatar = r.result; ACStore.emit(); UI.toast("Photo mise à jour.", "success"); }; r.readAsDataURL(f); };
  Screens._saveProfile = function () {
    const g = (id) => (document.getElementById(id) || {}).value || "";
    const first = g("ep-first").trim(), last = g("ep-last").trim(), email = g("ep-email").trim();
    if (!first) { UI.toast("Le prénom est requis.", "error"); return; }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { UI.toast("E-mail invalide.", "error"); return; }
    const c = YCData.countryOf(g("ep-country"));
    Object.assign(ACState.user, { name: first, fullName: (first + " " + last).trim(), phone: g("ep-phone").trim() || ACState.user.phone, email, country: c.name, countryCode: c.code, dial: c.dial, city: g("ep-city") });
    const finish = () => { ACStore.emit(); UI.toast("Profil mis à jour.", "success"); App.nav("profile"); };
    if (window.YCBackend && YCBackend.isLive()) { YCBackend.saveProfile(ACState.user).then((res) => { if (res && res.ok === false) UI.toast(res.message || "Enregistrement impossible.", "error"); else finish(); }); return; }
    finish();
  };

  /* ---------- Adresses ---------- */
  Screens.addresses = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="space-y-2.5">${ACState.addresses.map((a) => `<div class="card p-4 flex items-center gap-3"><span class="menu-icon">${icon(a.icon || "place")}</span><div class="flex-1 min-w-0"><p class="t-title flex items-center gap-2">${esc(a.label)}${a.isDefault ? UI.badge("Par défaut", "gold") : ""}</p><p class="t-small text-ink-2 truncate">${esc(a.detail)}</p></div>
        <div class="flex gap-1">${!a.isDefault ? `<button type="button" onclick="Screens._defaultAddress('${a.id}')" class="icon-btn w-9 h-9" title="Par défaut" aria-label="Définir par défaut">${icon("star", "text-[18px]")}</button>` : ""}<button type="button" onclick="Screens._removeAddress('${a.id}')" class="icon-btn w-9 h-9 !text-danger" aria-label="Supprimer">${icon("delete", "text-[18px]")}</button></div></div>`).join("") || `<p class="t-small text-ink-2 text-center py-6">Aucune adresse enregistrée.</p>`}</div>
      ${UI.primaryButton("Ajouter une adresse", "App.nav('addAddress')", { size: "lg", icon: "add" })}</div>`;
    Shell.render(container, { title: "Mes adresses", subtitle: "Livraisons et points de départ", back: true, body, nav: false, showNav: true });
  };
  Screens._removeAddress = (id) => { ACState.addresses = ACState.addresses.filter((a) => a.id !== id); ACStore.emit(); UI.toast("Adresse supprimée.", "info"); };
  Screens._defaultAddress = (id) => { ACState.addresses.forEach((a) => { a.isDefault = a.id === id; }); ACStore.emit(); UI.toast("Adresse par défaut mise à jour.", "success"); };
  Screens.addAddress = function (container, params) {
    const c = YCData.cityOf(ACState.user.city);
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4"><div class="card p-5 space-y-3">
      <div class="flex gap-2">${[["home", "Domicile"], ["work", "Travail"], ["place", "Autre"]].map((x, i) => `<button type="button" onclick="document.getElementById('na-label').value='${x[1] === "Autre" ? "" : x[1]}';document.getElementById('na-icon').value='${x[0]}'" class="chip ${i === 0 ? "on" : ""}">${icon(x[0], "text-[16px]")}${x[1]}</button>`).join("")}</div><input type="hidden" id="na-icon" value="home"/>
      ${UI.field("na-label", "Nom", { value: "Domicile", placeholder: "Ex. Domicile" })}${UI.field("na-detail", "Adresse", { placeholder: "Quartier, rue, repère…", icon: "location_on" })}${UI.select("na-city", "Ville", YCData.DESTINATIONS, c.name)}${UI.field("na-note", "Instructions (optionnel)", { placeholder: "Portail noir, 2e étage…" })}
      <div class="card overflow-hidden"><div id="na-map" class="h-40 bg-surface-low"></div><p class="t-small text-ink-2 p-3">Touchez la carte pour positionner précisément l'adresse.</p></div></div>
      ${UI.primaryButton("Enregistrer l'adresse", `Screens._saveAddress('${esc(params.back || "addresses")}')`, { size: "lg", icon: "save" })}</div>`;
    let picked = null;
    Shell.render(container, { title: "Nouvelle adresse", back: true, body, nav: false, showNav: true, onMount: () => { const m = YCMap.create("na-map", { interactive: true, zoomControl: false }); if (!m) return; m.onClick((p) => { picked = p; m.setPin("to", [p.lat, p.lng]); UI.toast("Position enregistrée.", "success"); }); Screens._naPicked = () => picked; } });
  };
  Screens._saveAddress = (back) => {
    const label = document.getElementById("na-label").value.trim(), detail = document.getElementById("na-detail").value.trim(), city = document.getElementById("na-city").value, note = document.getElementById("na-note").value.trim();
    if (!label || !detail) { UI.toast("Nom et adresse requis.", "error"); return; }
    const p = Screens._naPicked && Screens._naPicked(); const c = YCData.cityOf(city);
    ACState.addresses.push({ id: ACStore.uid("addr"), label, detail: detail + ", " + city + (note ? " · " + note : ""), icon: document.getElementById("na-icon").value || "place", lat: p ? p.lat : c.lat + (Math.random() - 0.5) * 0.02, lng: p ? p.lng : c.lng + (Math.random() - 0.5) * 0.02 });
    ACStore.emit(); UI.toast("Adresse ajoutée.", "success"); App.resetTo(back || "addresses");
  };

  /* ---------- Moyens de paiement ---------- */
  Screens.paymentMethods = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="space-y-2.5">${ACState.paymentMethods.map((m) => `<button type="button" onclick="Screens._defaultMethod('${m.type}')" class="w-full card p-4 flex items-center gap-3 text-left ${ACState.prefs.paymentMethod === m.type ? "ring-2 ring-gold" : ""}"><span class="menu-icon">${icon(m.icon)}</span><span class="flex-1 min-w-0"><span class="t-title flex items-center gap-2">${m.label}${ACState.prefs.paymentMethod === m.type ? UI.badge("Par défaut", "gold") : ""}</span><span class="block t-small text-ink-2">${m.sub}${m.type === "wallet" ? " · " + ACStore.fmtFCFA(ACState.wallet.balance) : ""}</span></span>${ACState.prefs.paymentMethod === m.type ? icon("check_circle", "text-gold", true) : icon("radio_button_unchecked", "text-ink-3")}</button>`).join("")}</div>
      ${UI.secondaryButton("Ajouter un moyen de paiement", "Screens._addPaymentInfo()", { icon: "add" })}
      <p class="t-small text-ink-3 text-center">${I18N.t("conceptual")}</p></div>`;
    Shell.render(container, { title: "Moyens de paiement", back: true, body, nav: false, showNav: true });
  };
  Screens._defaultMethod = (t) => { ACState.prefs.paymentMethod = t; ACStore.emit(); UI.toast("Moyen de paiement par défaut mis à jour.", "success"); };
  Screens._addPaymentInfo = () => UI.openSheet(`<h3 class="t-h3 mb-1">Ajouter un moyen de paiement</h3><p class="t-small text-ink-2 mb-4">L'ajout de cartes et de comptes mobiles sera disponible après vérification d'identité (KYC) et selon les partenariats financiers de chaque pays.</p>${UI.field("pm-card", "Numéro de carte (démo)", { placeholder: "•••• •••• •••• ••••", icon: "credit_card", inputmode: "numeric" })}<div class="mt-4">${UI.primaryButton("Vérifier mon identité", "UI.closeSheet();App.nav('verifyAccount')", { icon: "verified_user" })}</div>`);

  /* ---------- Lieux sauvegardés ---------- */
  Screens.savedPlaces = function (container) {
    const sites = ACState.saved.map((id) => YCData.site(id)).filter(Boolean), favs = ACState.favorites.map((id) => YCData.restaurant(id) || YCData.product(id)).filter(Boolean);
    const body = sites.length || favs.length ? `${sites.length ? `<section>${UI.sectionTitle("Lieux culturels")}<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">${sites.map((s) => UI.siteCard(s)).join("")}</div></section>` : ""}${favs.length ? `<section>${UI.sectionTitle("Favoris")}<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">${favs.map((x) => x.menu ? UI.restaurantCard(x) : UI.productCard(x)).join("")}</div></section>` : ""}` : UI.emptyState({ icon: "bookmark", title: "Aucun lieu sauvegardé", body: "Sauvegardez des monuments, restaurants et produits pour les retrouver ici.", actionLabel: "Découvrir l'Afrique", actionOnclick: "App.nav('culture')" });
    Shell.render(container, { title: "Lieux sauvegardés", back: true, body, nav: false, showNav: true });
  };

  /* ---------- Sécurité ---------- */
  Screens.security = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card-dark p-5 flex items-center gap-4"><span class="w-14 h-14 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center">${icon("shield", "text-[30px]", true)}</span><div class="flex-1"><p class="t-caption text-gold">Niveau de protection</p><p class="t-h2">Élevé</p><p class="t-small text-white/70">Compte vérifié, PIN actif, biométrie ${ACState.prefs.biometric === false ? "désactivée" : "activée"}</p></div></div>
      <div class="space-y-2.5">
        ${menuRow("verified_user", "Vérification du compte", "App.nav('verifyAccount')", { sub: ACState.user.verified ? "Identité vérifiée" : "Vérification requise", right: UI.badge(ACState.user.verified ? "Vérifié" : "À faire", ACState.user.verified ? "success" : "warn") })}
        ${menuRow("password", "Code PIN", "App.nav('securityPin',{action:'changePin'})", { sub: "Modifier le code à 4 chiffres" })}
        ${menuRow("fingerprint", "Biométrie", "Screens._toggleBio()", { sub: "Empreinte ou visage pour les paiements", right: UI.toggle(ACState.prefs.biometric !== false, "event.stopPropagation();Screens._toggleBio()", "Biométrie") })}
        ${menuRow("devices", "Appareils connectés", "App.nav('devices')", { sub: "3 appareils" })}
        ${menuRow("history", "Historique des connexions", "App.nav('loginHistory')", { sub: "Dernière : aujourd'hui, " + esc(ACState.user.city) })}
        ${menuRow("report", "Signalement", "App.nav('report')", { sub: "Signaler un chauffeur, un vendeur, un incident" })}
        ${menuRow("support_agent", "Assistance", "App.nav('help')", { sub: "Centre d'aide 24h/24" })}
        ${menuRow("sos", "SOS", "App.nav('sos')", { sub: "Alerte immédiate avec partage de position", danger: true })}
      </div></div>`;
    Shell.render(container, { title: I18N.t("security"), subtitle: "Sécurité et confiance", back: true, body, nav: false, showNav: true });
  };
  Screens._toggleBio = () => { ACState.prefs.biometric = ACState.prefs.biometric === false; ACStore.emit(); UI.toast("Biométrie " + (ACState.prefs.biometric === false ? "désactivée" : "activée") + ".", "success"); };
  Screens.verifyAccount = function (container) {
    const steps = [{ label: "Numéro de téléphone vérifié", icon: "call" }, { label: "E-mail confirmé", icon: "mail" }, { label: "Pièce d'identité", icon: "badge" }, { label: "Selfie de vérification", icon: "face" }];
    const done = ACState.user.verified ? 4 : 2;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4"><div class="card p-5">${UI.timeline(steps, done)}</div>
      ${!ACState.user.verified ? `<div class="card p-5 text-center"><span class="w-16 h-16 rounded-2xl bg-surface-low flex items-center justify-center mx-auto text-gold">${icon("badge", "text-[32px]")}</span><p class="t-title mt-3">Pièce d'identité</p><p class="t-small text-ink-2 mt-1">CNI, passeport ou permis. Les documents sont chiffrés et traités selon la réglementation de chaque pays.</p>${UI.primaryButton("Prendre une photo du document", "Screens._verifyDone()", { icon: "photo_camera", cls: "mt-4" })}</div>` : `<div class="card p-5 text-center">${icon("verified", "text-gold text-[40px]", true)}<p class="t-title mt-2">Votre compte est vérifié</p><p class="t-small text-ink-2">Plafonds Wallet étendus et accès à Youss Business.</p></div>`}</div>`;
    Shell.render(container, { title: "Vérification du compte", back: true, body, nav: false, showNav: true });
  };
  Screens._verifyDone = () => { ACState.user.verified = true; ACStore.addNotification("Compte vérifié", "Votre identité a été validée. Plafonds Wallet étendus.", "wallet", "security"); ACStore.emit(); UI.toast("Documents reçus · compte vérifié (démo).", "success"); };
  Screens.devices = function (container) {
    const list = [{ name: "Ce téléphone", sub: navigator.platform || "Mobile", icon: "smartphone", current: true, when: "Actif maintenant" }, { name: "Ordinateur portable", sub: "Chrome · " + ACState.user.city, icon: "laptop", when: "Hier, 21:14" }, { name: "Tablette", sub: "Safari · " + ACState.user.city, icon: "tablet", when: "Il y a 6 jours" }];
    const body = `<div class="max-w-narrow mx-auto w-full space-y-3">${list.map((d, i) => `<div class="card p-4 flex items-center gap-3"><span class="menu-icon">${icon(d.icon)}</span><div class="flex-1 min-w-0"><p class="t-title flex items-center gap-2">${d.name}${d.current ? UI.badge("Cet appareil", "gold") : ""}</p><p class="t-small text-ink-2">${d.sub} · ${d.when}</p></div>${!d.current ? `<button type="button" onclick="this.closest('.card').remove();UI.toast('Appareil déconnecté.','success')" class="btn btn-sm btn-outline">Déconnecter</button>` : ""}</div>`).join("")}${UI.secondaryButton("Déconnecter tous les autres appareils", "UI.toast('Tous les autres appareils ont été déconnectés.','success')", { icon: "logout" })}</div>`;
    Shell.render(container, { title: "Appareils connectés", back: true, body, nav: false, showNav: true });
  };
  Screens.loginHistory = function (container) {
    const rows = [["Aujourd'hui 09:12", ACState.user.city, "Ce téléphone", true], ["Hier 21:14", ACState.user.city, "Chrome · ordinateur", true], ["Lundi 08:40", ACState.user.city, "Ce téléphone", true], ["Samedi 19:02", "Lagos, Nigeria", "Appareil inconnu", false]];
    const body = `<div class="max-w-narrow mx-auto w-full space-y-3"><div class="card divide-y divide-line">${rows.map((r) => `<div class="p-4 flex items-center gap-3"><span class="menu-icon ${r[3] ? "" : "!bg-danger-soft !text-danger"}">${icon(r[3] ? "check" : "warning")}</span><div class="flex-1 min-w-0"><p class="t-title">${r[0]}</p><p class="t-small text-ink-2">${r[1]} · ${r[2]}</p></div>${r[3] ? "" : `<button type="button" onclick="App.nav('report')" class="btn btn-sm btn-outline">Ce n'est pas moi</button>`}</div>`).join("")}</div><p class="t-small text-ink-3">Une connexion inhabituelle déclenche une vérification par code OTP.</p></div>`;
    Shell.render(container, { title: "Historique des connexions", back: true, body, nav: false, showNav: true });
  };
  Screens.report = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4"><div class="card p-5 space-y-3">${UI.select("rp-type", "Objet du signalement", ["Comportement d'un chauffeur", "Problème de livraison", "Vendeur ou produit", "Transaction suspecte", "Connexion inhabituelle", "Autre"], "Problème de livraison")}${UI.select("rp-ref", "Activité concernée", ["Aucune"].concat(ACState.activities.slice(0, 6).map((a) => a.title)), "Aucune")}<label class="block"><span class="label">Description</span><textarea id="rp-desc" class="textarea" placeholder="Décrivez ce qui s'est passé…"></textarea></label><div class="rounded-xl border border-dashed border-line p-4 text-center t-small text-ink-2">${icon("attach_file", "text-[22px] text-ink-3")}<p>Joindre une capture ou une photo</p></div></div>
      ${UI.primaryButton("Envoyer le signalement", "Screens._sendReport()", { size: "lg", icon: "send" })}<p class="t-small text-ink-3 text-center">Réponse sous 24 h. En cas d'urgence, utilisez le bouton SOS.</p></div>`;
    Shell.render(container, { title: "Signalement", back: true, body, nav: false, showNav: true });
  };
  Screens._sendReport = () => { const d = document.getElementById("rp-desc").value.trim(); if (d.length < 10) { UI.toast("Décrivez le problème en quelques mots.", "error"); return; } ACStore.addNotification("Signalement reçu", "Référence YC-SR-" + Math.floor(1000 + Math.random() * 8999) + ". Notre équipe vous répond sous 24 h.", "wallet", "help"); ACStore.emit(); UI.toast("Signalement transmis. Merci.", "success"); App.back(); };

  /* ---------- Langues ---------- */
  Screens.languages = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="space-y-2.5">${I18N.LANGS.map((l) => { const on = I18N.lang === l.id; return `<button type="button" onclick="UI.setLang('${l.id}')" class="w-full card p-4 flex items-center gap-3 text-left ${on ? "ring-2 ring-gold" : ""}"><span class="menu-icon font-extrabold text-[13px]">${l.id.toUpperCase()}</span><span class="flex-1 min-w-0"><span class="t-title flex items-center gap-2">${l.label}${l.partial ? UI.badge("Partiel · démo", "warn") : ""}</span><span class="block t-small text-ink-2">${l.native} · interface traduite à ${l.coverage} %</span></span>${on ? icon("check_circle", "text-gold", true) : icon("radio_button_unchecked", "text-ink-3")}</button>`; }).join("")}</div>
      <div class="card p-5"><p class="t-title">Autres langues africaines</p><p class="t-small text-ink-2 mt-1">L'architecture prévoit l'ajout progressif d'autres langues (yoruba, éwé, twi, haoussa, lingala…). Les traductions fon et wolof sont des exemples à valider par des locuteurs.</p><div class="flex flex-wrap gap-2 mt-3">${["Yoruba", "Éwé", "Twi", "Haoussa", "Bambara", "Lingala"].map((l) => `<span class="chip">${l} · bientôt</span>`).join("")}</div>${UI.secondaryButton("Proposer une langue ou contribuer", "UI.toast('Merci ! Votre proposition a été transmise à KYA CORPORATION.','success')", { icon: "translate", cls: "mt-4" })}</div></div>`;
    Shell.render(container, { title: "Langues", subtitle: "Français · English · Wolof · Fon", back: true, body, nav: false, showNav: true });
  };

  /* ---------- Aide ---------- */
  Screens.help = function (container) {
    const faq = [["Comment payer une course ?", "Choisissez Youss Wallet, espèces ou paiement mobile lors de la confirmation. Le prix est fixe, calculé sur l'itinéraire."], ["Où retrouver mes billets ?", "Dans Profil → Mes billets, ou depuis la fiche de l'événement. Chaque billet a un QR Code à présenter à l'entrée."], ["Comment fonctionne Youss Bonus ?", "Chaque course, commande, achat ou billet crédite des points échangeables contre des récompenses."], ["Youss Wallet est-il un vrai portefeuille ?", "Dans cette maquette, Youss Wallet est conceptuel. Son déploiement réel dépend des autorisations réglementaires et de partenariats financiers."], ["Comment devenir vendeur ?", "Ouvrez Youss Business, créez votre profil professionnel et publiez vos produits ou services."]];
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="grid grid-cols-2 gap-3">${[["chat", "Chat avec l'assistance", "Réponse en quelques minutes", "UI.toast('Un conseiller vous répond dans quelques instants (démo).','success')"], ["call", "Appeler", "Du lundi au samedi, 8h – 20h", "UI.toast('Appel du support (démo).','info')"], ["play_circle", I18N.t("demo_tour"), "5 parcours guidés", "Demo.openMenu()"], ["sos", "Urgence SOS", "Alerte immédiate", "App.nav('sos')"]].map((x) => `<button type="button" onclick="${x[3]}" class="card card-press p-4 text-left"><span class="text-gold">${icon(x[0], "text-[26px]")}</span><p class="t-title mt-2">${x[1]}</p><p class="t-small text-ink-2">${x[2]}</p></button>`).join("")}</div>
      <section><p class="t-caption text-ink-3 mb-2">Questions fréquentes</p><div class="card divide-y divide-line">${faq.map((q, i) => `<details class="group"><summary class="flex items-center justify-between gap-3 p-4 cursor-pointer list-none t-title">${q[0]}${icon("expand_more", "text-ink-3 transition-transform group-open:rotate-180")}</summary><p class="px-4 pb-4 t-body text-ink-2">${q[1]}</p></details>`).join("")}</div></section>
      <div class="card p-5"><p class="t-caption text-ink-3">À propos</p><p class="t-title mt-1">YOUSS CONNECT · version 2.0 (maquette)</p><p class="t-small text-ink-2 mt-1">Une seule application pour vivre l'Afrique au quotidien. Portée par KYA CORPORATION. Données de démonstration · aucun partenaire officiel.</p><div class="flex gap-2 mt-3">${UI.button("Présentation", "App.nav('about')", { variant: "outline", block: false, size: "sm" })}${UI.button("Conditions d'utilisation", "UI.toast('CGU disponibles dans la version finale.','info')", { variant: "outline", block: false, size: "sm" })}</div></div></div>`;
    Shell.render(container, { title: I18N.t("help"), subtitle: "Assistance YOUSS CONNECT", back: true, body, nav: false, showNav: true });
  };

  /* ---------- Paramètres ---------- */
  Screens.settings = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <section><p class="t-caption text-ink-3 mb-2">Apparence</p><div class="card divide-y divide-line">
        <div class="flex items-center gap-3 p-4"><span class="menu-icon">${icon(ACState.prefs.theme === "dark" ? "dark_mode" : "light_mode")}</span><div class="flex-1"><p class="t-title">${I18N.t("theme")}</p><p class="t-small text-ink-2">${ACState.prefs.theme === "dark" ? I18N.t("theme_dark") : I18N.t("theme_light")}</p></div>${UI.toggle(ACState.prefs.theme === "dark", "Screens._toggleTheme()", "Thème sombre")}</div>
        <button type="button" onclick="App.nav('languages')" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon">${icon("language")}</span><div class="flex-1"><p class="t-title">Langue</p><p class="t-small text-ink-2">${(I18N.LANGS.find((l) => l.id === I18N.lang) || {}).label}</p></div>${icon("chevron_right", "text-ink-3")}</button>
        <button type="button" onclick="Shell.openCityPicker()" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon">${icon("location_on")}</span><div class="flex-1"><p class="t-title">Ville</p><p class="t-small text-ink-2">${esc(ACState.user.city)}, ${esc(ACState.user.country)}</p></div>${icon("chevron_right", "text-ink-3")}</button></div></section>
      <section><p class="t-caption text-ink-3 mb-2">Notifications et confidentialité</p><div class="card divide-y divide-line">
        <button type="button" onclick="App.nav('notificationPrefs')" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon">${icon("notifications")}</span><div class="flex-1"><p class="t-title">Préférences de notifications</p></div>${icon("chevron_right", "text-ink-3")}</button>
        <div class="flex items-center gap-3 p-4"><span class="menu-icon">${icon("my_location")}</span><div class="flex-1"><p class="t-title">Localisation</p><p class="t-small text-ink-2">Pendant l'utilisation de l'application</p></div>${UI.toggle(true, "this.classList.toggle('on');UI.toast('Préférence enregistrée.','success')", "Localisation")}</div>
        <div class="flex items-center gap-3 p-4"><span class="menu-icon">${icon("analytics")}</span><div class="flex-1"><p class="t-title">Recommandations personnalisées</p><p class="t-small text-ink-2">Basées sur vos habitudes</p></div>${UI.toggle(true, "this.classList.toggle('on');UI.toast('Préférence enregistrée.','success')", "Recommandations")}</div></div></section>
      <section><p class="t-caption text-ink-3 mb-2">Démonstration</p><div class="card divide-y divide-line">
        <button type="button" onclick="Demo.openMenu()" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon">${icon("play_circle")}</span><div class="flex-1"><p class="t-title">${I18N.t("demo_tour")}</p><p class="t-small text-ink-2">Transport, restaurant, événement, commerce, culture</p></div>${icon("chevron_right", "text-ink-3")}</button>
        <button type="button" onclick="Screens._resetDemo()" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon !bg-danger-soft !text-danger">${icon("restart_alt")}</span><div class="flex-1"><p class="t-title text-danger">Réinitialiser la démo</p><p class="t-small text-ink-2">Solde, panier, billets, activités et notifications d'origine</p></div></button></div></section>
      <p class="t-caption text-ink-3 text-center">YOUSS CONNECT v2.0 · KYA CORPORATION</p></div>`;
    Shell.render(container, { title: I18N.t("settings"), back: true, body, nav: false, showNav: true });
  };
  Screens._resetDemo = () => UI.confirm({ title: "Réinitialiser la démo ?", body: "Toutes les données de démonstration reviendront à leur état d'origine.", okLabel: "Réinitialiser", danger: true, icon: "restart_alt", onOk: "ACStore.reset();ACState.session.authenticated=true;ACState.session.onboardingSeen=true;ACStore.emit();UI.toast('Démo réinitialisée.','success');App.resetTo('home')" });
})();
