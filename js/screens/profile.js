/* Profil, édition, adresses, moyens de paiement, sécurité, langues, aide, paramètres */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;

  function menuRow(ic, label, onclick, opts) {
    opts = opts || {};
    const body = `<span class="flex items-center gap-3 min-w-0 flex-1"><span class="menu-icon ${opts.danger ? "!bg-danger-soft !text-danger" : ""}">${icon(ic)}</span><span class="min-w-0 text-left"><span class="block t-title ${opts.danger ? "text-danger" : ""}">${label}</span>${opts.sub ? `<span class="block t-small text-ink-2 truncate">${opts.sub}</span>` : ""}</span></span>`;
    /* L'interrupteur ne doit pas être imbriqué dans le bouton : le navigateur le sort de la ligne. */
    if (opts.right) {
      return `<div class="menu-row !p-2 ${opts.danger ? "!border-danger/30" : ""}"><button type="button" onclick="${onclick}" class="flex-1 flex items-center min-w-0 rounded-xl px-2 py-2 text-left">${body}</button><span class="flex-shrink-0 pr-2">${opts.right}</span></div>`;
    }
    return `<button type="button" onclick="${onclick}" class="menu-row ${opts.danger ? "!border-danger/30" : ""}">${body}${icon("chevron_right", "text-ink-3")}</button>`;
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
          <button type="button" onclick="App.nav('rewards')" class="w-full card-dark p-5 text-left"><p class="t-caption text-gold">Youss Bonus · niveau ${tier.id}</p><p class="t-h1 mt-1">${pts.toLocaleString("fr-FR")} pts</p><p class="t-small opacity-70 mt-1">${YCData.nextTier(pts) ? (YCData.nextTier(pts).min - pts).toLocaleString("fr-FR") + " pts avant " + YCData.nextTier(pts).id : "Niveau maximum"}</p></button>
        </div>
        <div class="space-y-5">
          <section><p class="t-caption text-ink-3 mb-2">Mon compte</p><div class="grid sm:grid-cols-2 gap-2.5">
            ${menuRow("person", "Modifier mon profil", "App.nav('editProfile')")}${menuRow("restaurant", "Mes commandes", go("activities", { f: "restaurant" }))}${menuRow("directions_car", "Mes courses", go("activities", { f: "transport" }))}${menuRow("qr_code_2", "Mes billets", "App.nav('myTickets')", { sub: ACState.tickets.length + " billet(s)" })}${menuRow("home_pin", "Mes adresses", "App.nav('addresses')", { sub: ACState.addresses.length + " adresse(s)" })}${menuRow("credit_card", "Moyens de paiement", "App.nav('paymentMethods')")}${menuRow("bookmark", "Lieux sauvegardés", "App.nav('savedPlaces')", { sub: ACState.saved.length + " lieu(x)" })}${menuRow("workspace_premium", "Youss Bonus", "App.nav('rewards')", { sub: pts.toLocaleString("fr-FR") + " points" })}</div></section>
          <section><p class="t-caption text-ink-3 mb-2">Réglages</p><div class="grid sm:grid-cols-2 gap-2.5">
            ${menuRow("security", I18N.t("security"), "App.nav('security')")}${menuRow("language", "Langues", "App.nav('languages')", { sub: (I18N.LANGS.find((l) => l.id === I18N.lang) || {}).label })}${menuRow("notifications", "Notifications", "App.nav('notificationPrefs')")}${menuRow(ACState.prefs.theme === "dark" ? "dark_mode" : "light_mode", I18N.t("theme"), "Screens._toggleTheme()", { sub: ACState.prefs.theme === "dark" ? I18N.t("theme_dark") : I18N.t("theme_light"), right: UI.toggle(ACState.prefs.theme === "dark", "Screens._toggleTheme()", "Thème sombre") })}${menuRow("help", I18N.t("help"), "App.nav('help')")}${menuRow("settings", I18N.t("settings"), "App.nav('settings')")}${menuRow("gavel", "Conditions d'utilisation", "App.nav('terms')")}${menuRow("privacy_tip", "Politique de confidentialité", "App.nav('privacy')")}</div></section>
          ${menuRow("logout", I18N.t("logout"), "Screens._logout()", { danger: true })}
          <p class="t-caption text-center">YOUSS CONNECT v2.0 · KYA CORPORATION</p>
        </div>
      </div>`;
    Shell.render(container, { title: I18N.t("nav_profile"), subtitle: u.fullName, body, nav: "profile" });
  };
  Screens._toggleTheme = () => { UI.setTheme(ACState.prefs.theme === "dark" ? "light" : "dark"); };
  Screens._logout = () => UI.confirm({ title: "Se déconnecter ?", body: "Les données de démo restent sur cet appareil.", okLabel: I18N.t("logout"), danger: true, icon: "logout", onOk: "Screens._confirmLogout()" });
  Screens._confirmLogout = () => { const done = () => { ACState.session.authenticated = false; ACStore.emit(); App.resetTo("login"); }; if (window.YCBackend) YCBackend.signOut().then(done, done); else done(); };

  // Édition
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
  Screens._avatarFile = (input) => {
    const f = input.files && input.files[0];
    input.value = "";
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(f.type) || f.size > 1500000) { UI.toast("Image JPG, PNG ou WebP, 1,5 Mo max.", "error"); return; }
    const r = new FileReader();
    r.onload = () => {
      const data = String(r.result || "");
      if (!/^data:image\/(jpeg|png|webp|gif);base64,/i.test(data)) { UI.toast("Fichier image invalide.", "error"); return; }
      ACState.user.avatar = data; ACStore.emit(); UI.toast("Photo mise à jour.", "success");
    };
    r.readAsDataURL(f);
  };
  Screens._saveProfile = function () {
    const g = (id) => (document.getElementById(id) || {}).value || "";
    const first = g("ep-first").trim(), last = g("ep-last").trim(), email = g("ep-email").trim();
    if (!first) { UI.toast("Le prénom est requis.", "error"); return; }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { UI.toast("E-mail invalide.", "error"); return; }
    const code = g("ep-country"), city = g("ep-city");
    Object.assign(ACState.user, { name: first, fullName: (first + " " + last).trim(), phone: g("ep-phone").trim() || ACState.user.phone, email });
    ACStore.setPlace(code, city);
    const finish = () => { ACStore.emit(); UI.toast("Profil mis à jour.", "success"); App.nav("profile"); };
    if (window.YCBackend && YCBackend.isLive()) { YCBackend.saveProfile(ACState.user).then((res) => { if (res && res.ok === false) UI.toast(res.message || "Enregistrement impossible.", "error"); else finish(); }); return; }
    finish();
  };

  // Adresses
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
    const picked = Screens._naPicked && Screens._naPicked(); const iconName = document.getElementById("na-icon").value || "place";
    const save = (p) => {
      ACState.addresses.push({ id: ACStore.uid("addr"), label, detail: detail + ", " + city + (note ? " · " + note : ""), icon: iconName, lat: p.lat, lng: p.lng });
      ACStore.emit(); UI.toast("Adresse ajoutée.", "success"); App.resetTo(back || "addresses");
    };
    // position tapée sur la carte en priorité, sinon on cherche l'adresse écrite
    if (picked) { save(picked); return; }
    YCMap.resolveTyped(detail, city).then((p) => save(p || YCData.cityOf(city)));
  };

  // Moyens de paiement
  Screens.paymentMethods = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="space-y-2.5">${ACState.paymentMethods.map((m) => `<button type="button" onclick="Screens._defaultMethod('${m.type}')" class="w-full card p-4 flex items-center gap-3 text-left ${ACState.prefs.paymentMethod === m.type ? "ring-2 ring-gold" : ""}"><span class="menu-icon">${icon(m.icon)}</span><span class="flex-1 min-w-0"><span class="t-title flex items-center gap-2">${m.label}${ACState.prefs.paymentMethod === m.type ? UI.badge("Par défaut", "gold") : ""}</span><span class="block t-small text-ink-2">${m.sub}${m.type === "wallet" ? " · " + ACStore.fmtFCFA(ACState.wallet.balance) : ""}</span></span>${ACState.prefs.paymentMethod === m.type ? icon("check_circle", "text-gold", true) : icon("radio_button_unchecked", "text-ink-3")}</button>`).join("")}</div>
      ${UI.primaryButton("Ajouter une carte bancaire", "Screens._openAddCard()", { icon: "add_card" })}
      ${(ACState.wallet.cards || []).length ? UI.secondaryButton("Retirer la carte enregistrée", "Screens._removeCard()", { icon: "delete" }) : ""}
      <p class="t-small text-ink-3 text-center">${I18N.t("conceptual")}</p></div>`;
    Shell.render(container, { title: "Moyens de paiement", back: true, body, nav: false, showNav: true });
  };
  Screens._defaultMethod = (t) => { ACState.prefs.paymentMethod = t; ACStore.emit(); UI.toast("Moyen de paiement par défaut mis à jour.", "success"); };
  Screens._removeCard = function () {
    ACState.wallet.cards = [];
    ACState.prefs.cardId = "";
    if (ACState.prefs.paymentMethod === "card") ACState.prefs.paymentMethod = "wallet";
    if (Screens._syncCardMethods) Screens._syncCardMethods();
    ACStore.emit();
    UI.toast("Carte retirée de cet appareil.", "info");
  };

  // Lieux sauvegardés
  Screens.savedPlaces = function (container) {
    const sites = ACState.saved.map((id) => YCData.site(id)).filter(Boolean), favs = ACState.favorites.map((id) => YCData.restaurant(id) || YCData.product(id)).filter(Boolean);
    const body = sites.length || favs.length ? `${sites.length ? `<section>${UI.sectionTitle("Lieux culturels")}<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">${sites.map((s) => UI.siteCard(s)).join("")}</div></section>` : ""}${favs.length ? `<section>${UI.sectionTitle("Favoris")}<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">${favs.map((x) => x.menu ? UI.restaurantCard(x) : UI.productCard(x)).join("")}</div></section>` : ""}` : UI.emptyState({ icon: "bookmark", title: "Aucun lieu sauvegardé", body: "Sauvegardez des monuments, restaurants et produits pour les retrouver ici.", actionLabel: "Voir les lieux", actionOnclick: "App.nav('culture')" });
    Shell.render(container, { title: "Lieux sauvegardés", back: true, body, nav: false, showNav: true });
  };

  // Sécurité
  Screens.security = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card-dark p-5 flex items-center gap-4"><span class="w-14 h-14 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center">${icon("shield", "text-[30px]", true)}</span><div class="flex-1"><p class="t-caption text-gold">Niveau de protection</p><p class="t-h2">${ACState.session.remote ? "Compte ouvert" : "Élevé"}</p><p class="t-small opacity-80">${ACState.session.remote ? "E-mail, mot de passe et code PIN." : "Compte vérifié, PIN actif, biométrie " + (ACState.prefs.biometric === false || ACState.user.biometricEnrolled === false ? "désactivée" : "activée")}</p></div></div>
      <div class="space-y-2.5">
        ${menuRow("verified_user", "Vérification du compte", "App.nav('verifyAccount')", { sub: identitySub(), right: UI.badge(identityBadge()[0], identityBadge()[1]) })}
        ${menuRow("password", "Code PIN", "App.nav('securityPin',{action:'changePin'})", { sub: ACState.prefs.pinHash ? "Modifier le code à 4 chiffres" : "Choisir le code à 4 chiffres" })}
        ${menuRow("key", "Mot de passe", "App.nav('accountPassword')", { sub: "Changer le mot de passe du compte" })}
        ${menuRow(bioIcon(), "Biométrie", "Screens._toggleBio()", { sub: bioSub(), right: UI.toggle(!!(ACState.user.biometricEnrolled && ACState.prefs.biometric !== false), "Screens._toggleBio()", "Biométrie") })}
        ${menuRow("devices", "Appareils connectés", "App.nav('devices')", { sub: "Cet appareil" })}
        ${menuRow("history", "Historique des connexions", "App.nav('loginHistory')", { sub: "Session en cours" })}
        ${menuRow("report", "Signalement", "App.nav('report')", { sub: "Signaler un chauffeur, un vendeur, un incident" })}
        ${menuRow("support_agent", "Assistance", "App.nav('help')", { sub: "Centre d'aide 24h/24" })}
        ${menuRow("sos", "SOS", "App.nav('sos')", { sub: "Alerte immédiate avec partage de position", danger: true })}
      </div></div>`;
    Shell.render(container, { title: I18N.t("security"), subtitle: "PIN, biométrie, appareils", back: true, body, nav: false, showNav: true });
  };
  function identitySub() {
    const st = ACState.user.identityStatus;
    if (st === "pending") return "Document envoyé, en attente de relecture.";
    if (st === "approved") return "Pièce d'identité acceptée.";
    if (st === "rejected") return "Document refusé. Vous pouvez en envoyer un autre.";
    return "Envoyez une carte, un passeport ou un permis.";
  }
  function identityBadge() {
    const st = ACState.user.identityStatus;
    if (st === "approved") return ["Acceptée", "success"];
    if (st === "pending") return ["En revue", "gold"];
    if (st === "rejected") return ["Refusée", "warn"];
    return ["À envoyer", "warn"];
  }
  function bioIcon() {
    return ACState.prefs.sensorKind === "face" ? "face" : "fingerprint";
  }
  function bioSub() {
    if (ACState.user.biometricEnrolled && ACState.prefs.biometric !== false) {
      return ACState.prefs.sensorKind === "face" ? "Face ID confirme les paiements. Le code PIN reste en secours." : "L'empreinte confirme les paiements. Le code PIN reste en secours.";
    }
    return "iPhone : Face ID. Android : empreinte. Le code PIN reste disponible.";
  }
  Screens._toggleBio = function () {
    if (!ACState.session.remote) { UI.toast("Connectez-vous pour enregistrer Face ID ou l'empreinte.", "info"); return; }
    if (ACState.user.biometricEnrolled && ACState.prefs.biometric !== false) {
      if (!window.YCBackend) return;
      YCBackend.removeBiometric().then(function (res) {
        if (!res || res.ok === false) { UI.toast((res && res.message) || "Retrait impossible.", "error"); return; }
        UI.toast("Biométrie retirée. Les paiements demanderont le code PIN.", "info");
        App.replace("security");
      });
      return;
    }
    App.nav("biometricSetup", { next: "security" });
  };
  Screens.verifyAccount = function (container) {
    const steps = [{ label: "E-mail du compte", icon: "mail" }, { label: "Numéro de téléphone", icon: "call" }, { label: "Pièce d'identité", icon: "badge" }];
    const st = ACState.user.identityStatus;
    const done = st === "approved" ? 3 : st ? 2 : ACState.session.remote ? 1 : 0;
    const note = st === "pending" ? "Document reçu. La console KYA le relit. Le compte n'est pas encore marqué vérifié." : st === "approved" ? "Pièce acceptée." : st === "rejected" ? "Le dernier document a été refusé. Vous pouvez en envoyer un autre." : "Photo ou PDF, 5 Mo maximum. Le document reste privé jusqu'à la relecture.";
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4"><div class="card p-5">${UI.timeline(steps, done)}</div>
      <form class="card p-5 space-y-3" onsubmit="event.preventDefault();Screens._sendIdentity()">
        <p class="t-title">Pièce d'identité</p>
        <p class="t-small text-ink-2">${note}</p>
        <label class="block"><span class="t-small font-semibold">Type</span><select id="id-type" class="input mt-1">${[["cni", "Carte d'identité"], ["passeport", "Passeport"], ["permis", "Permis de conduire"]].map((o) => `<option value="${o[0]}">${o[1]}</option>`).join("")}</select></label>
        <label class="block"><span class="t-small font-semibold">Document</span><input id="id-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="input mt-1"/></label>
        ${UI.error("id-error")}
        <button id="id-send" type="submit" class="btn btn-lg btn-primary btn-block">Envoyer le document</button>
      </form></div>`;
    Shell.render(container, { title: "Vérification du compte", back: true, body, nav: false, showNav: true });
  };
  Screens._sendIdentity = function () {
    const input = document.getElementById("id-file");
    const type = (document.getElementById("id-type") || {}).value || "cni";
    const file = input && input.files && input.files[0];
    if (!ACState.session.remote || !window.YCBackend) return UI.showError("id-error", "Connectez-vous pour envoyer le document.");
    if (!file) return UI.showError("id-error", "Choisissez une photo ou un PDF.");
    if (file.size > 5 * 1024 * 1024) return UI.showError("id-error", "Le document doit faire moins de 5 Mo.");
    const btn = document.getElementById("id-send");
    if (btn) btn.disabled = true;
    YCBackend.uploadIdentity(file, type).then(function (res) {
      if (btn) btn.disabled = false;
      if (!res || res.ok === false) return UI.showError("id-error", (res && res.message) || "Envoi impossible.");
      UI.toast("Document envoyé. La console KYA va le relire.", "success");
      App.replace("verifyAccount");
    });
  };
  Screens.accountPassword = function (container) {
    const body = `<form class="max-w-narrow mx-auto w-full space-y-4" onsubmit="event.preventDefault();Screens._savePassword()">
      ${UI.field("pw-1", "Nouveau mot de passe", { type: "password", placeholder: "8 caractères min.", autocomplete: "new-password" })}
      ${UI.field("pw-2", "Confirmation", { type: "password", placeholder: "••••••••", autocomplete: "new-password" })}
      ${UI.error("pw-error")}
      ${UI.primaryButton("Enregistrer", "Screens._savePassword()", { size: "lg", icon: "lock" })}
    </form>`;
    Shell.render(container, { title: "Mot de passe", back: true, body, nav: false, showNav: true });
  };
  Screens._savePassword = function () {
    const a = document.getElementById("pw-1").value, b = document.getElementById("pw-2").value;
    if (a.length < 8) return UI.showError("pw-error", "Le mot de passe doit contenir au moins 8 caractères.");
    if (a !== b) return UI.showError("pw-error", "Les mots de passe ne correspondent pas.");
    if (!window.YCBackend || !YCBackend.isLive()) return UI.showError("pw-error", "Connectez-vous pour changer le mot de passe.");
    YCBackend.updatePassword(a).then(function (res) {
      if (!res || res.ok === false) return UI.showError("pw-error", (res && res.message) || "Changement impossible.");
      UI.toast("Mot de passe mis à jour.", "success");
      App.resetTo("security");
    });
  };
  Screens.devices = function (container) {
    const remote = ACState.session.remote;
    const list = remote
      ? [{ name: "Cet appareil", sub: navigator.platform || "Navigateur", icon: "smartphone", current: true, when: "Actif maintenant" }]
      : [{ name: "Ce téléphone", sub: navigator.platform || "Mobile", icon: "smartphone", current: true, when: "Actif maintenant" }];
    const body = `<div class="max-w-narrow mx-auto w-full space-y-3">${list.map((d) => `<div class="card p-4 flex items-center gap-3"><span class="menu-icon">${icon(d.icon)}</span><div class="flex-1 min-w-0"><p class="t-title flex items-center gap-2">${d.name}${d.current ? UI.badge("Cet appareil", "gold") : ""}</p><p class="t-small text-ink-2">${d.sub} · ${d.when}</p></div></div>`).join("")}${remote ? UI.secondaryButton("Fermer les autres sessions", "Screens._signOutOthers()", { icon: "logout" }) : ""}</div>`;
    Shell.render(container, { title: "Appareils connectés", back: true, body, nav: false, showNav: true });
  };
  Screens._signOutOthers = function () {
    if (!window.YCBackend || !YCBackend.signOutOthers) return;
    YCBackend.signOutOthers().then(function (res) {
      UI.toast(res && res.ok ? "Les autres sessions sont fermées." : ((res && res.message) || "Fermeture impossible."), res && res.ok ? "success" : "error");
    });
  };
  Screens.loginHistory = function (container) {
    const rows = ACState.session.remote
      ? [["Maintenant", ACState.user.city, "Cet appareil", true]]
      : [["Aujourd'hui 09:12", ACState.user.city, "Ce téléphone", true]];
    const body = `<div class="max-w-narrow mx-auto w-full space-y-3"><div class="card divide-y divide-line">${rows.map((r) => `<div class="p-4 flex items-center gap-3"><span class="menu-icon">${icon("check")}</span><div class="flex-1 min-w-0"><p class="t-title">${r[0]}</p><p class="t-small text-ink-2">${r[1]} · ${r[2]}</p></div></div>`).join("")}</div><p class="t-small text-ink-3">${ACState.session.remote ? "Seule la session ouverte sur cet appareil est affichée." : "Historique local."}</p></div>`;
    Shell.render(container, { title: "Historique des connexions", back: true, body, nav: false, showNav: true });
  };
  Screens.report = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4"><div class="card p-5 space-y-3">${UI.select("rp-type", "Objet du signalement", ["Comportement d'un chauffeur", "Problème de livraison", "Vendeur ou produit", "Transaction suspecte", "Connexion inhabituelle", "Autre"], "Problème de livraison")}${UI.select("rp-ref", "Activité concernée", ["Aucune"].concat(ACState.activities.slice(0, 6).map((a) => a.title)), "Aucune")}<label class="block"><span class="label">Description</span><textarea id="rp-desc" class="textarea" placeholder="Décrivez ce qui s'est passé…"></textarea></label><div class="rounded-xl border border-dashed border-line p-4 text-center t-small text-ink-2">${icon("attach_file", "text-[22px] text-ink-3")}<p>Les pièces jointes ne sont pas encore ouvertes.</p></div></div>
      ${UI.primaryButton("Envoyer le signalement", "Screens._sendReport()", { size: "lg", icon: "send" })}<p class="t-small text-ink-3 text-center">Le signalement reste sur cet appareil. L'envoi à l'équipe n'est pas encore ouvert. En cas d'urgence, utilisez le bouton SOS.</p></div>`;
    Shell.render(container, { title: "Signalement", back: true, body, nav: false, showNav: true });
  };
  Screens._sendReport = () => { const d = document.getElementById("rp-desc").value.trim(); if (d.length < 10) { UI.toast("Décrivez le problème en quelques mots.", "error"); return; } UI.toast("Signalement noté sur cet appareil. L'envoi à l'équipe n'est pas encore ouvert.", "info"); App.back(); };

  // Langues
  Screens.languages = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="space-y-2.5">${I18N.LANGS.map((l) => { const on = I18N.lang === l.id; return `<button type="button" onclick="UI.setLang('${l.id}')" class="w-full card p-4 flex items-center gap-3 text-left ${on ? "ring-2 ring-gold" : ""}"><span class="menu-icon font-extrabold text-[13px]">${l.id.toUpperCase()}</span><span class="flex-1 min-w-0"><span class="t-title flex items-center gap-2">${l.label}${l.partial ? UI.badge("Partiel · démo", "warn") : ""}</span><span class="block t-small text-ink-2">${l.native} · interface traduite à ${l.coverage} %</span></span>${on ? icon("check_circle", "text-gold", true) : icon("radio_button_unchecked", "text-ink-3")}</button>`; }).join("")}</div>
      <div class="card p-5"><p class="t-title">Autres langues</p><p class="t-small text-ink-2 mt-1">Yoruba, éwé, twi, haoussa, lingala : pas encore.</p><div class="flex flex-wrap gap-2 mt-3">${["Yoruba", "Éwé", "Twi", "Haoussa", "Bambara", "Lingala"].map((l) => `<span class="chip">${l} · bientôt</span>`).join("")}</div>${UI.secondaryButton("Proposer une langue ou contribuer", "UI.toast('Démo : cette proposition reste sur cet appareil. Elle n\\'est pas envoyée.','info')", { icon: "translate", cls: "mt-4" })}</div></div>`;
    Shell.render(container, { title: "Langues", subtitle: "Français · English", back: true, body, nav: false, showNav: true });
  };

  // Aide
  Screens.help = function (container) {
    const faq = [["Comment payer une course ?", "Youss Wallet ou espèces, au moment de confirmer. Le prix vient de l'itinéraire. La carte et le paiement mobile ne sont pas encore encaissés."], ["Où sont mes billets ?", "Profil, puis Mes billets. Le QR s'affiche aussi sur la fiche de l'événement."], ["Youss Bonus ?", "Un paiement par Youss Wallet ajoute des points, dans la limite du montant."], ["Le wallet est-il réel ?", "Le solde est celui du compte. La recharge n'est pas encore ouverte : elle attend un prestataire de paiement."], ["Vendre sur l'app ?", "La vente n'est pas proposée dans le compte personnel. Cette version montre l'achat, le transport et le portefeuille."]];
    const actions = [["chat", "Chat avec l'assistance", "Écrire à KYA", "App.nav('helpChat')"], ["call", "Appeler", "Pas encore ouvert", "UI.toast('L\\'appel d\\'assistance n\\'est pas encore ouvert.','info')"], ["sos", "Urgence SOS", "Alerte immédiate", "App.nav('sos')"]];
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${actions.map((x) => `<button type="button" onclick="${x[3]}" class="card card-press p-4 text-left"><span class="text-gold">${icon(x[0], "text-[26px]")}</span><p class="t-title mt-2">${x[1]}</p><p class="t-small text-ink-2">${x[2]}</p></button>`).join("")}</div>
      <section><p class="t-caption text-ink-3 mb-2">Questions fréquentes</p><div class="card divide-y divide-line">${faq.map((q, i) => `<details class="group"><summary class="flex items-center justify-between gap-3 p-4 cursor-pointer list-none t-title">${q[0]}${icon("expand_more", "text-ink-3 transition-transform group-open:rotate-180")}</summary><p class="px-4 pb-4 t-body text-ink-2">${q[1]}</p></details>`).join("")}</div></section>
      <div class="card p-5"><p class="t-caption">À propos</p><p class="t-title mt-1">YOUSS CONNECT</p><p class="t-small text-ink-2 mt-1">KYA CORPORATION. Les prix, chauffeurs et événements affichés sont des exemples. Aucun partenaire officiel.</p><div class="flex flex-wrap gap-2 mt-3">${UI.button("Présentation", "App.nav('about')", { variant: "outline", block: false, size: "sm" })}${UI.button("Conditions d'utilisation", "App.nav('terms')", { variant: "outline", block: false, size: "sm" })}${UI.button("Confidentialité", "App.nav('privacy')", { variant: "outline", block: false, size: "sm" })}</div></div></div>`;
    Shell.render(container, { title: I18N.t("help"), subtitle: "FAQ et contact", back: true, body, nav: false, showNav: true });
  };
  let helpPoll = null;
  function paintHelp(threadId) {
    if (!window.YCBackend) return;
    YCBackend.loadMessages(threadId).then(function (rows) {
      const box = document.getElementById("help-chat");
      if (!box) return;
      box.innerHTML = rows.length ? rows.map(function (m) {
        return `<div class="max-w-[85%] ${m.from_staff ? "" : "ml-auto"}"><div class="rounded-2xl px-3 py-2 ${m.from_staff ? "bg-surface-low" : "bg-ink text-white"}"><p class="t-body whitespace-pre-wrap">${esc(m.body)}</p></div><p class="t-caption text-ink-3 mt-1 ${m.from_staff ? "" : "text-right"}">${m.from_staff ? "Assistance" : "Vous"}</p></div>`;
      }).join("") : `<p class="t-small text-ink-2">Écrivez votre message. La console KYA répond ici.</p>`;
      box.scrollTop = box.scrollHeight;
    });
  }
  Screens.helpChat = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full flex flex-col gap-3" style="min-height:60dvh"><div id="help-chat" class="card p-4 flex-1 space-y-3 overflow-y-auto max-h-[60dvh]"><p class="t-small text-ink-2">Ouverture de la conversation…</p></div><form class="flex gap-2" onsubmit="event.preventDefault();Screens._helpSend()"><input id="help-text" class="input flex-1" maxlength="2000" placeholder="Votre message" autocomplete="off"/><button type="submit" class="btn btn-primary">Envoyer</button></form></div>`;
    Shell.render(container, { title: "Assistance", subtitle: "Message à KYA CORPORATION", back: true, body, nav: false, showNav: true });
    if (!window.YCBackend || !YCBackend.isLive()) {
      const box = document.getElementById("help-chat");
      if (box) box.innerHTML = `<p class="t-small text-ink-2">Connectez-vous pour écrire à l'assistance.</p>`;
      return;
    }
    YCBackend.openSupport().then(function (threadId) {
      if (!threadId) {
        const box = document.getElementById("help-chat");
        if (box) box.innerHTML = `<p class="t-small text-ink-2">La conversation n'a pas pu s'ouvrir.</p>`;
        return;
      }
      Screens._helpThread = threadId;
      paintHelp(threadId);
      if (helpPoll) clearInterval(helpPoll);
      helpPoll = setInterval(function () {
        if (!App.current || App.current.id !== "helpChat") { clearInterval(helpPoll); helpPoll = null; return; }
        paintHelp(threadId);
      }, 4000);
    });
  };
  Screens._helpSend = function () {
    const input = document.getElementById("help-text");
    const text = input ? input.value.trim() : "";
    const threadId = Screens._helpThread;
    if (!text || !threadId || !window.YCBackend) return;
    YCBackend.sendSupport(threadId, text, false).then(function (res) {
      if (!res || res.ok === false) { UI.toast((res && res.message) || "Envoi impossible.", "error"); return; }
      if (input) input.value = "";
      paintHelp(threadId);
    });
  };

  // Paramètres
  Screens.settings = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <section><p class="t-caption text-ink-3 mb-2">Apparence</p><div class="card divide-y divide-line">
        <div class="flex items-center gap-3 p-4"><span class="menu-icon">${icon(ACState.prefs.theme === "dark" ? "dark_mode" : "light_mode")}</span><div class="flex-1"><p class="t-title">${I18N.t("theme")}</p><p class="t-small text-ink-2">${ACState.prefs.theme === "dark" ? I18N.t("theme_dark") : I18N.t("theme_light")}</p></div>${UI.toggle(ACState.prefs.theme === "dark", "Screens._toggleTheme()", "Thème sombre")}</div>
        <button type="button" onclick="App.nav('languages')" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon">${icon("language")}</span><div class="flex-1"><p class="t-title">Langue</p><p class="t-small text-ink-2">${(I18N.LANGS.find((l) => l.id === I18N.lang) || {}).label}</p></div>${icon("chevron_right", "text-ink-3")}</button>
        <button type="button" onclick="Shell.openCityPicker()" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon">${icon("location_on")}</span><div class="flex-1"><p class="t-title">Ville</p><p class="t-small text-ink-2">${esc(ACState.user.city)}, ${esc(ACState.user.country)}</p></div>${icon("chevron_right", "text-ink-3")}</button></div></section>
      <section><p class="t-caption text-ink-3 mb-2">Notifications et confidentialité</p><div class="card divide-y divide-line">
        <button type="button" onclick="App.nav('notificationPrefs')" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon">${icon("notifications")}</span><div class="flex-1"><p class="t-title">Préférences de notifications</p></div>${icon("chevron_right", "text-ink-3")}</button>
        <div class="flex items-center gap-3 p-4"><span class="menu-icon">${icon("my_location")}</span><div class="flex-1"><p class="t-title">Localisation</p><p class="t-small text-ink-2">Pendant l'utilisation de l'application</p></div>${UI.toggle(ACState.prefs.location !== false, "Screens._togglePrefFlag('location')", "Localisation")}</div>
        <div class="flex items-center gap-3 p-4"><span class="menu-icon">${icon("analytics")}</span><div class="flex-1"><p class="t-title">Recommandations personnalisées</p><p class="t-small text-ink-2">Basées sur vos habitudes</p></div>${UI.toggle(ACState.prefs.recs !== false, "Screens._togglePrefFlag('recs')", "Recommandations")}</div></div></section>
      <section><p class="t-caption text-ink-3 mb-2">${ACState.session.remote ? "Cet appareil" : "Démonstration"}</p><div class="card divide-y divide-line">
        ${ACState.session.remote ? "" : `<button type="button" onclick="Demo.openMenu()" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon">${icon("play_circle")}</span><div class="flex-1"><p class="t-title">${I18N.t("demo_tour")}</p><p class="t-small text-ink-2">Transport, restaurant, événement, commerce, culture</p></div>${icon("chevron_right", "text-ink-3")}</button>`}
        <button type="button" onclick="Screens._resetDemo()" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon !bg-danger-soft !text-danger">${icon("restart_alt")}</span><div class="flex-1"><p class="t-title text-danger">${ACState.session.remote ? "Effacer les données de cet appareil" : "Réinitialiser la démo"}</p><p class="t-small text-ink-2">${ACState.session.remote ? "Le compte YOUSS CONNECT reste ouvert. Seul cet appareil est vidé." : "Solde, panier, billets, activités et notifications d'origine"}</p></div></button></div></section>
      <section><p class="t-caption text-ink-3 mb-2">Informations légales</p><div class="card divide-y divide-line">
        <button type="button" onclick="App.nav('terms')" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon">${icon("gavel")}</span><div class="flex-1"><p class="t-title">Conditions d'utilisation</p></div>${icon("chevron_right", "text-ink-3")}</button>
        <button type="button" onclick="App.nav('privacy')" class="w-full flex items-center gap-3 p-4 text-left"><span class="menu-icon">${icon("privacy_tip")}</span><div class="flex-1"><p class="t-title">Politique de confidentialité</p></div>${icon("chevron_right", "text-ink-3")}</button>
      </div></section>
      <p class="t-caption text-ink-3 text-center">YOUSS CONNECT v2.0 · KYA CORPORATION</p></div>`;
    Shell.render(container, { title: I18N.t("settings"), back: true, body, nav: false, showNav: true });
  };
  Screens._togglePrefFlag = (k) => { ACState.prefs[k] = ACState.prefs[k] === false; ACStore.emit(); };
  Screens._resetDemo = () => UI.confirm({ title: ACState.session.remote ? "Effacer cet appareil ?" : "Réinitialiser la démo ?", body: ACState.session.remote ? "Les données affichées sur cet appareil seront effacées. Le compte et le solde restent sur YOUSS CONNECT." : "Toutes les données de démonstration reviendront à leur état d'origine.", okLabel: "Effacer", danger: true, icon: "restart_alt", onOk: ACState.session.remote ? "ACStore.reset();if(window.YCBackend)YCBackend.signOut();App.resetTo('login')" : "ACStore.reset();ACState.session.authenticated=true;ACState.session.onboardingSeen=true;ACStore.emit();UI.toast('Démo réinitialisée.','success');App.resetTo('home')" });
})();
