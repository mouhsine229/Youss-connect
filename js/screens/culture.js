/* Culture & Tourisme — Découvrez l'Afrique, destinations, sites, scanner culturel, exploration autour */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;

  const f = { type: "all", city: "all" };

  /* ---------- Hub ---------- */
  Screens.culture = function (container, params) {
    if (params && params.city) f.city = params.city;
    if (params && params.type) f.type = params.type;
    const sites = YCData.SITES.filter((s) => (f.type === "all" || s.type === f.type) && (f.city === "all" || s.city === f.city));
    const city = ACState.user.city;
    const near = YCData.nearby(YCData.cityOf(city).lat, YCData.cityOf(city).lng, YCData.SITES, 3);
    const body = `
      <section class="relative rounded-3xl overflow-hidden bg-[#0A0A0A] text-white min-h-[200px] lg:min-h-[280px] flex items-end">
        ${UI.img(YCData.IMG + "places/site-ouidah-porte.jpg", "", "img-cover opacity-70", { eager: true })}<div class="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent"></div>
        <div class="relative p-5 lg:p-8 w-full flex flex-col lg:flex-row lg:items-end gap-4">
          <div class="flex-1"><p class="t-caption text-gold">Culture & Tourisme</p><h2 class="t-h1 lg:t-display">${I18N.t("discover")}</h2><p class="t-body text-white/80 mt-1 max-w-[560px]">Monuments, palais, musées, sites historiques, traditions et activités culturelles à Cotonou, Dakar, Lomé et Accra.</p></div>
          <button type="button" onclick="App.nav('culturalScanner')" class="card-dark !bg-white/10 hover:!bg-white/15 border border-white/15 p-4 flex items-center gap-3 text-left lg:w-[320px]"><span class="w-12 h-12 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center animate-pulse-ring">${icon("qr_code_scanner", "text-[26px]")}</span><span><span class="block t-title">Scanner un monument</span><span class="block t-small text-white/70">Histoire, audio-guide, lieux à proximité</span></span></button>
        </div>
      </section>
      <section>${UI.sectionTitle("Destinations", null, null, "Chaque ville a sa page : lieux, restaurants, événements, infos pratiques")}<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">${YCData.DESTINATIONS.map((c) => UI.destinationCard(c, true)).join("")}</div></section>
      <section>${UI.sectionTitle("Près de vous", "Explorer autour", go("exploreAround", {}), "À " + esc(city))}<div class="grid sm:grid-cols-3 gap-3">${near.map((s) => UI.siteCard(s)).join("")}</div></section>
      <section>${UI.sectionTitle("Monuments, musées et traditions")}
        <div class="flex flex-col lg:flex-row gap-3 mb-4">
          <div class="hscroll flex-1">${UI.chip("Tous", "Screens._cuType('all')", f.type === "all")}${YCData.SITE_TYPES.map((t) => UI.chip(t.label, `Screens._cuType('${t.id}')`, f.type === t.id, { icon: t.icon })).join("")}</div>
          <select class="select lg:w-52" onchange="Screens._cuCity(this.value)" aria-label="Ville"><option value="all" ${f.city === "all" ? "selected" : ""}>Toutes les villes</option>${YCData.DESTINATIONS.map((c) => `<option value="${c}" ${f.city === c ? "selected" : ""}>${c}</option>`).join("")}</select>
        </div>
        ${sites.length ? `<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">${sites.map((s) => UI.siteCard(s)).join("")}</div>` : UI.emptyState({ icon: "museum", title: I18N.t("empty_results"), body: "Aucun lieu de ce type dans cette ville.", actionLabel: "Tout afficher", actionOnclick: "Screens._cuType('all');" })}
      </section>`;
    Shell.render(container, { title: "Culture & Tourisme", subtitle: I18N.t("discover"), back: "App.nav('home')", body, nav: false, showNav: true });
  };
  Screens._cuType = (t) => { f.type = t; App.replace("culture"); };
  Screens._cuCity = (c) => { f.city = c; App.replace("culture"); };

  /* ---------- Page destination ---------- */
  Screens.destination = function (container, params) {
    const c = YCData.cityOf(params.city);
    const sites = YCData.sitesIn(c.name), rests = YCData.restaurantsIn(c.name), events = YCData.eventsIn(c.name), activities = sites.filter((s) => s.type === "nature" || s.type === "tradition" || s.type === "activite");
    const isHome = ACState.user.city === c.name;
    const body = `
      <section class="relative rounded-3xl overflow-hidden h-64 lg:h-[400px] bg-card-high">${UI.img(c.hero, c.name, "img-cover", { eager: true })}<div class="absolute inset-0 gradient-up"></div>
        <div class="absolute bottom-5 left-5 right-5 lg:bottom-8 lg:left-8 text-white"><p class="t-caption text-gold">${c.country} · Destination</p><h2 class="t-display">${c.name}</h2><p class="t-body text-white/85 mt-1 max-w-[600px]">${c.tagline}</p></div>
        ${!isHome ? `<button type="button" onclick="Shell.pickCity('${c.name}')" class="absolute top-4 right-4 btn btn-sm bg-white/95 text-ink">${icon("swap_horiz", "text-[18px]")}Utiliser ${c.name} comme ville</button>` : `<span class="absolute top-4 right-4 badge badge-gold">Votre ville</span>`}
      </section>
      <div class="grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
        <div class="space-y-8 min-w-0">
          <p class="t-body lg:text-[16px] lg:leading-[26px] text-ink-2">${c.intro}</p>
          <section>${UI.sectionTitle("Lieux à visiter", "Scanner un monument", "App.nav('culturalScanner')")}<div class="grid sm:grid-cols-2 gap-3 lg:gap-4">${sites.slice(0, 6).map((s) => UI.siteCard(s)).join("")}</div></section>
          ${rests.length ? `<section>${UI.sectionTitle("Restaurants", "Voir tout", `Screens._cityRestaurants('${c.name}')`)}<div class="grid sm:grid-cols-2 gap-3 lg:gap-4">${rests.slice(0, 4).map((r) => UI.restaurantCard(r)).join("")}</div></section>` : ""}
          ${events.length ? `<section>${UI.sectionTitle("Événements", "Voir tout", `Screens._cityEvents('${c.name}')`)}<div class="grid sm:grid-cols-2 gap-3 lg:gap-4">${events.slice(0, 4).map((e) => UI.eventCard(e)).join("")}</div></section>` : ""}
          ${activities.length ? `<section>${UI.sectionTitle("Activités et traditions")}<div class="hscroll lg:grid lg:grid-cols-3">${activities.slice(0, 6).map((s) => UI.siteCard(s, true)).join("")}</div></section>` : ""}
        </div>
        <aside class="space-y-4 lg:sticky lg:top-24">
          <div class="card p-5"><p class="t-h3 mb-3">Infos pratiques</p>${Object.keys(c.practical).map((k) => `<div class="py-2 border-b border-line last:border-0"><p class="t-caption text-ink-3">${k.charAt(0).toUpperCase() + k.slice(1)}</p><p class="t-small font-semibold mt-0.5">${c.practical[k]}</p></div>`).join("")}</div>
          <div class="card overflow-hidden"><div id="dest-map" class="h-48 bg-surface-low"></div><div class="p-4 space-y-2">${UI.button("Se déplacer à " + c.name, `Shell.pickCity('${c.name}');App.nav('transport')`, { variant: "dark", icon: "directions_car" })}${UI.button("Explorer autour", go("exploreAround", { city: c.name }), { variant: "outline", icon: "travel_explore" })}</div></div>
        </aside>
      </div>`;
    Shell.render(container, { title: c.name, subtitle: c.country + " · Destination", back: true, body, nav: false, showNav: true, onMount: () => { const m = YCMap.create("dest-map", { interactive: false, zoomControl: false, lat: c.lat, lng: c.lng, zoom: 11 }); if (m) sites.filter((s) => YCData.distanceKm(s.lat, s.lng, c.lat, c.lng) < 40).forEach((s) => m.addPoi([s.lat, s.lng], YCData.siteType(s.type).icon, "<b>" + esc(s.name) + "</b>", () => App.nav("cultureDetail", { id: s.id }))); } });
  };
  Screens._cityRestaurants = (c) => { Shell.pickCity(c); App.nav("restaurants"); };
  Screens._cityEvents = (c) => { App.nav("events"); };

  /* ---------- Fiche site (Aperçu / Histoire / Visite / Infos) ---------- */
  const st = { tab: "overview" };
  const TABS = [["overview", "Aperçu"], ["history", "Histoire"], ["visit", "Visite"], ["info", "Infos"]];
  Screens.cultureDetail = function (container, params) {
    const s = YCData.site(params.id) || YCData.SITES[0];
    if (params.tab) st.tab = params.tab;
    const type = YCData.siteType(s.type);
    const scanned = !!params.scanned;
    const near = YCData.nearby(s.lat, s.lng, YCData.SITES, 4, s.id);
    const rests = YCData.nearby(s.lat, s.lng, YCData.RESTAURANTS, 2);
    const saved = ACState.saved.indexOf(s.id) >= 0;
    const gallery = [s.img].concat(near.slice(0, 2).map((n) => n.img));
    const tabContent = {
      overview: `<p class="t-body lg:text-[16px] lg:leading-[26px] text-ink-2">${s.body}</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">${[["history_edu", "Époque", s.epoch], ["location_on", "Lieu", s.place.split("·")[0]], ["schedule", "Horaires", s.visit.hours.split("(")[0]], ["payments", "Tarif", s.visit.price.split("(")[0]]].map((x) => `<div class="card p-3"><span class="text-gold">${icon(x[0], "text-[20px]")}</span><p class="t-caption text-ink-3 mt-1">${x[1]}</p><p class="t-small font-semibold">${x[2]}</p></div>`).join("")}</div>
        <div class="mt-5"><h3 class="t-h3 mb-2">Importance culturelle</h3><p class="t-body text-ink-2">${s.importance}</p></div>`,
      history: `<div class="card-dark p-5"><p class="t-caption text-gold">${s.epoch}</p><p class="t-body lg:text-[16px] lg:leading-[27px] text-white/90 mt-2">${s.history}</p></div>
        <div class="mt-4 grid sm:grid-cols-2 gap-3">
          <button type="button" onclick="Screens._audioGuide('${s.id}')" class="card card-press p-4 flex items-center gap-3 text-left"><span id="audio-btn" class="w-12 h-12 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center">${icon("play_arrow", "text-[26px]", true)}</span><span><span class="block t-title">Audio-guide</span><span class="block t-small text-ink-2">Écouter l'histoire · 1 min</span></span></button>
          <button type="button" onclick="Screens._videoPreview('${s.id}')" class="card card-press p-4 flex items-center gap-3 text-left"><span class="w-12 h-12 rounded-full bg-inverse text-inverse-ink flex items-center justify-center">${icon("movie", "text-[24px]")}</span><span><span class="block t-title">Vidéo de présentation</span><span class="block t-small text-ink-2">Aperçu immersif · 45 s</span></span></button>
        </div>`,
      visit: `<div class="card divide-y divide-line">${[["schedule", "Horaires", s.visit.hours], ["payments", "Tarif", s.visit.price], ["timer", "Durée conseillée", s.visit.duration], ["tips_and_updates", "Conseil", s.visit.tips]].map((x) => `<div class="p-4 flex gap-3"><span class="menu-icon">${icon(x[0])}</span><div><p class="t-caption text-ink-3">${x[1]}</p><p class="t-body font-semibold">${x[2]}</p></div></div>`).join("")}</div>
        <div class="mt-4 grid sm:grid-cols-2 gap-3">${UI.button("Y aller en transport", `Screens._transportPreset({toLatLng:{name:${UI.js(s.name)},lat:${s.lat},lng:${s.lng}}});App.nav('transport')`, { variant: "dark", icon: "directions_car" })}${UI.button("Réserver une visite guidée", `Screens._bookVisit('${s.id}')`, { variant: "primary", icon: "tour" })}</div>`,
      info: `<div class="card overflow-hidden"><div id="site-map" class="h-56 bg-surface-low"></div><div class="p-4">${UI.row("Adresse", s.place)}${UI.row("Coordonnées", s.lat.toFixed(4) + ", " + s.lng.toFixed(4))}${UI.row("Type", type.label)}${s.unesco ? UI.row("Patrimoine", "UNESCO") : ""}${UI.row("Langues du guide", "Français, English, Fon, Wolof")}</div></div>
        <button type="button" onclick="Screens._showSiteQr('${s.id}')" class="mt-3 w-full card p-4 flex items-center gap-3 text-left"><span class="menu-icon">${icon("qr_code_2")}</span><span class="flex-1"><span class="block t-title">QR Code du site</span><span class="block t-small text-ink-2">À afficher sur place pour tester le scanner</span></span>${icon("chevron_right", "text-ink-3")}</button>`
    };
    const body = `
      ${scanned ? `<div class="card-dark p-4 flex items-center gap-3 animate-screen-in"><span class="w-11 h-11 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center animate-pop">${icon("center_focus_strong", "text-[24px]")}</span><div class="flex-1"><p class="t-caption text-gold">Résultat du scan</p><p class="t-title">Monument reconnu · correspondance ${params.score || 97} %</p></div><button type="button" onclick="App.nav('culturalScanner')" class="btn btn-sm bg-white/10 text-white">Rescanner</button></div>` : ""}
      <section class="grid lg:grid-cols-[1.4fr_1fr] gap-3">
        <div class="relative rounded-3xl overflow-hidden h-64 lg:h-[420px] bg-card-high">${UI.img(gallery[0], s.name, "img-cover", { eager: true })}<div class="absolute inset-0 gradient-up"></div>
          <div class="absolute bottom-5 left-5 right-5 text-white"><div class="flex flex-wrap gap-2 mb-2"><span class="badge bg-white/95 text-ink">${icon(type.icon, "text-[14px]")}${type.label}</span>${s.unesco ? `<span class="badge badge-gold">Patrimoine mondial UNESCO</span>` : ""}</div><h2 class="t-h1 lg:t-display">${s.name}</h2><p class="t-body text-white/85 mt-1">${icon("location_on", "text-[16px]")} ${s.place}</p></div>
          <button type="button" onclick="Screens._toggleSaveSite('${s.id}')" class="absolute top-4 right-4 icon-btn" aria-label="Sauvegarder">${icon("bookmark", saved ? "text-gold" : "", saved)}</button>
        </div>
        <div class="hidden lg:grid grid-rows-2 gap-3 h-[420px]">${gallery.slice(1, 3).map((g, i) => `<div class="relative rounded-3xl overflow-hidden bg-card-high min-h-0"><img src="${g}" alt="" class="absolute inset-0 w-full h-full object-cover img-fade" loading="lazy"/>${i === 1 ? `<button type="button" onclick="Screens._videoPreview('${s.id}')" class="absolute inset-0 flex items-center justify-center bg-black/30 text-white"><span class="w-14 h-14 rounded-full bg-white/90 text-ink flex items-center justify-center">${icon("play_arrow", "text-[32px]", true)}</span></button>` : ""}</div>`).join("")}</div>
      </section>
      <div class="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
        <div class="space-y-5 min-w-0">
          <div class="flex gap-1 border-b border-line overflow-x-auto no-scrollbar">${TABS.map((t) => `<button type="button" onclick="Screens._cuTab('${t[0]}','${s.id}',${scanned ? 1 : 0})" class="h-11 px-3.5 t-title whitespace-nowrap border-b-2 -mb-px ${st.tab === t[0] ? "border-gold text-ink" : "border-transparent text-ink-3 hover:text-ink"}">${t[1]}</button>`).join("")}</div>
          <div>${tabContent[st.tab] || tabContent.overview}</div>
          <section>${UI.sectionTitle("Lieux à proximité", "Explorer autour de moi", go("exploreAround", { id: s.id }))}<div class="grid sm:grid-cols-2 gap-3">${near.map((n) => `<button type="button" onclick="${go("cultureDetail", { id: n.id })}" class="card card-press p-2.5 flex items-center gap-3 text-left"><span class="w-16 h-16 rounded-xl overflow-hidden bg-card-high flex-shrink-0">${UI.img(n.img, n.name)}</span><span class="flex-1 min-w-0"><span class="block t-title truncate">${n.name}</span><span class="block t-small text-ink-2">${YCData.siteType(n.type).label} · ${YCMap.fmtKm(n.dist)}</span></span>${icon("chevron_right", "text-ink-3")}</button>`).join("")}</div></section>
        </div>
        <aside class="space-y-4 lg:sticky lg:top-24">
          ${UI.nextSteps([
            { icon: "restaurant", label: "Restaurants autour", sub: rests[0] ? rests[0].name + " · " + YCMap.fmtKm(rests[0].dist) : "Voir les restaurants", onclick: rests[0] ? go("restaurantDetail", { id: rests[0].id }) : "App.nav('restaurants')" },
            { icon: "directions_car", label: "Y aller en transport", sub: "Course vers " + esc(s.name.split(" ").slice(0, 3).join(" ")), onclick: `Screens._transportPreset({toLatLng:{name:${UI.js(s.name)},lat:${s.lat},lng:${s.lng}}});App.nav('transport')` },
            { icon: "confirmation_number", label: "Événements à " + esc(s.city), sub: "Concerts, festivals, spectacles", onclick: "App.nav('events')" },
            { icon: "travel_explore", label: "Destination " + esc(s.city), sub: "Page complète de la ville", onclick: go("destination", { city: s.city }) }
          ], "Continuer l'expérience")}
          <div class="card p-4"><p class="t-caption text-ink-3 mb-2">Langue du contenu</p><div class="grid grid-cols-4 gap-2">${I18N.LANGS.map((l) => `<button type="button" onclick="UI.setLang('${l.id}')" class="chip justify-center ${I18N.lang === l.id ? "on" : ""}">${l.id.toUpperCase()}</button>`).join("")}</div><p class="t-small text-ink-3 mt-2">Fon et Wolof : traduction partielle de démonstration.</p></div>
        </aside>
      </div>`;
    Shell.render(container, { title: s.name, subtitle: type.label + " · " + s.city, back: true, body, nav: false, showNav: true, onMount: () => { if (st.tab === "info") { const m = YCMap.create("site-map", { interactive: false, zoomControl: false, lat: s.lat, lng: s.lng, zoom: 14 }); if (m) m.addPoi([s.lat, s.lng], type.icon, "<b>" + esc(s.name) + "</b>"); } } });
  };
  Screens._cuTab = (tab, id, scanned) => { st.tab = tab; App.replace(App.current.id, Object.assign({}, App.current.params, { tab })); };
  Screens._toggleSaveSite = (id) => { const i = ACState.saved.indexOf(id); if (i >= 0) ACState.saved.splice(i, 1); else ACState.saved.push(id); UI.toast(i >= 0 ? "Retiré de vos lieux sauvegardés" : "Lieu sauvegardé", "success"); ACStore.emit(); };
  Screens._bookVisit = (id) => {
    const s = YCData.site(id);
    UI.openSheet(`<h3 class="t-h3 mb-1">Visite guidée</h3><p class="t-small text-ink-2 mb-4">${esc(s.name)} · ${s.visit.duration}</p><div class="grid grid-cols-2 gap-3">${UI.select("vg-day", "Jour", ["Demain", "Samedi", "Dimanche"], "Samedi")}${UI.select("vg-time", "Heure", ["09:00", "10:30", "14:00", "16:00"], "10:30")}</div><div class="mt-3">${UI.select("vg-lang", "Langue du guide", ["Français", "English", "Fon", "Wolof"], "Français")}</div><div class="mt-5">${UI.primaryButton("Réserver (" + s.visit.price.split("(")[0].trim() + ")", `Screens._bookVisitConfirm('${id}')`, { icon: "tour" })}</div>`);
  };
  Screens._bookVisitConfirm = (id) => { const s = YCData.site(id); const when = document.getElementById("vg-day").value + " " + document.getElementById("vg-time").value; UI.closeSheet(); ACStore.addActivity({ service: "reservation", title: "Visite guidée · " + s.name, amount: null, status: "À venir", icon: "tour", detail: { when, place: s.place } }); ACStore.addNotification("Visite réservée", s.name + " · " + when + ". Votre guide vous attendra à l'entrée.", "culture", "activities"); ACStore.emit(); UI.toast("Visite réservée · " + when, "success"); };

  /* Audio-guide : synthèse vocale du navigateur (repli : message) */
  let speaking = false;
  Screens._audioGuide = function (id) {
    const s = YCData.site(id);
    const btn = document.getElementById("audio-btn");
    if (!("speechSynthesis" in window)) { UI.toast("Audio-guide indisponible sur ce navigateur (démo).", "info"); return; }
    if (speaking) { speechSynthesis.cancel(); speaking = false; if (btn) btn.innerHTML = icon("play_arrow", "text-[26px]", true); return; }
    const u = new SpeechSynthesisUtterance(s.name + ". " + s.history + " " + s.importance);
    u.lang = I18N.lang === "en" ? "en-GB" : "fr-FR"; u.rate = 0.98;
    const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(u.lang.slice(0, 2)));
    if (voices.length) u.voice = voices[0];
    u.onend = () => { speaking = false; const b = document.getElementById("audio-btn"); if (b) b.innerHTML = icon("play_arrow", "text-[26px]", true); };
    speechSynthesis.speak(u); speaking = true;
    if (btn) btn.innerHTML = icon("pause", "text-[26px]", true);
    UI.toast("Lecture de l'audio-guide…", "info");
  };
  document.addEventListener("yc:navigate", () => { if (speaking && "speechSynthesis" in window) { speechSynthesis.cancel(); speaking = false; } });
  Screens._videoPreview = function (id) {
    const s = YCData.site(id);
    UI.openSheet(`<div class="relative rounded-2xl overflow-hidden bg-black aspect-video"><img src="${s.img}" alt="" class="w-full h-full object-cover animate-kenburns opacity-90"/><div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div class="absolute bottom-4 left-4 right-4 text-white"><p class="t-caption text-gold">Aperçu vidéo · démonstration</p><p class="t-h3">${esc(s.name)}</p><div class="h-1 rounded-full bg-white/25 mt-2 overflow-hidden"><div class="h-full bg-gold" style="width:0%;transition:width 45s linear" id="vid-bar"></div></div></div></div>
      <p class="t-small text-ink-2 mt-3">La version finale intégrera des vidéos produites avec les offices du tourisme et les acteurs culturels locaux.</p>`, { wide: true });
    requestAnimationFrame(() => { const b = document.getElementById("vid-bar"); if (b) b.style.width = "100%"; });
  };
  Screens._showSiteQr = function (id) {
    const s = YCData.site(id); if (!s) return;
    const payload = "youss:site:" + s.id;
    UI.openSheet(`<div class="flex flex-col items-center text-center space-y-3"><h3 class="t-h3">${esc(s.name)}</h3><p class="t-small text-ink-2">${esc(s.place)}</p><div id="yc-site-qr" class="w-[200px] h-[200px] bg-white rounded-xl border border-line flex items-center justify-center p-2">${UI.spinner()}</div><p class="t-small text-ink-2">Scannez ce code avec YOUSS CONNECT pour ouvrir la fiche du site.</p><code class="t-small bg-surface-low px-2 py-1 rounded">${payload}</code></div>`);
    YCScanner.render("yc-site-qr", payload, { size: 184, cell: 6 });
  };

  /* ---------- Scanner culturel ---------- */
  const SCAN_MESSAGES = { unsupported: "Ce navigateur ne permet pas d'accéder à la caméra.", insecure: "La caméra nécessite une connexion sécurisée (HTTPS).", denied: "Accès à la caméra refusé. Vous pouvez utiliser le mode démo.", nocamera: "Aucune caméra détectée. Utilisez le mode démo.", busy: "La caméra est utilisée par une autre application.", error: "Impossible de démarrer la caméra." };
  function siteFromText(text) {
    const p = YCScanner.parse(text);
    if (p.type === "site" && YCData.site(p.id)) return YCData.site(p.id);
    const t = YCData.norm(p.raw);
    return YCData.SITES.find((s) => t.includes(YCData.norm(s.name)) || YCData.norm(s.name).includes(t)) || null;
  }
  Screens.culturalScanner = function (container) {
    const city = ACState.user.city;
    const demoSite = YCData.sitesIn(city)[0] || YCData.SITES[2];
    const body = `
      <div class="flex-1 min-h-0 bg-[#0A0A0A] text-white flex flex-col overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-[1fr_400px]">
        <div class="relative h-[62vh] flex-shrink-0 lg:h-full overflow-hidden">
          <img id="yc-scan-bg" class="absolute inset-0 w-full h-full object-cover opacity-50 animate-kenburns" src="${demoSite.img}" alt=""/>
          <video id="yc-scan-video" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300" autoplay muted playsinline></video>
          <div id="yc-scan-shade" class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80 transition-opacity duration-300"></div>
          <div class="absolute inset-0 scan-grid opacity-40 pointer-events-none"></div>
          <header class="absolute top-0 inset-x-0 p-4 flex items-center justify-end gap-2 z-10">
            <span class="badge bg-black/40 text-white border border-white/10">${icon("center_focus_strong", "text-[14px] text-gold")}Scanner culturel · ${esc(city)}</span>
            <button type="button" id="yc-scan-torch" onclick="Screens._scanTorch()" class="icon-btn !bg-black/40 !border-white/10 !text-white hidden" aria-label="Lampe">${icon("flashlight_on")}</button>
          </header>
          <div class="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none">
            <div class="relative w-[260px] h-[260px] lg:w-[340px] lg:h-[340px]">
              <span class="scan-corner top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl"></span><span class="scan-corner top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl"></span><span class="scan-corner bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl"></span><span class="scan-corner bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"></span>
              <div id="yc-scan-line" class="absolute left-4 right-4 h-0.5 bg-gold shadow-[0_0_16px_#C9A227] animate-scan"></div>
              <div id="yc-scan-tag" class="absolute -bottom-12 inset-x-0 text-center hidden"><span class="badge badge-gold">${icon("check", "text-[14px]")}<span id="yc-scan-tag-txt">Monument détecté</span></span></div>
            </div>
            <p id="yc-scan-status" class="mt-16 text-center t-body text-white/90 max-w-[320px]">Démarrage de la caméra…</p>
          </div>
        </div>
        <aside class="relative z-10 p-5 lg:p-6 space-y-3 bg-[#0A0A0A] lg:border-l lg:border-white/10 lg:overflow-y-auto">
          <div class="hidden lg:block mb-2"><p class="t-caption text-gold">Scanner un monument</p><h1 class="t-h2">Pointez un monument, un musée ou un site</h1><p class="t-small text-white/60 mt-1">La reconnaissance d'image sera entraînée sur les sites partenaires. En maquette : reconnaissance simulée, lecture de QR Code réelle.</p></div>
          <button type="button" id="yc-scan-recognize" onclick="Screens._recognize()" class="btn btn-lg btn-primary btn-block">${icon("center_focus_strong", "text-[22px]")}Reconnaître le monument</button>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" id="yc-scan-retry" onclick="Screens._startCameraScan()" class="btn bg-white/10 text-white">${icon("photo_camera", "text-[20px]")}Caméra</button>
            <label class="btn bg-white/10 text-white cursor-pointer">${icon("image", "text-[20px]")}Galerie<input type="file" accept="image/*" class="hidden" onchange="Screens._scanFromFile(this)"/></label>
          </div>
          <div class="pt-2"><p class="t-caption text-white/50 mb-2">Sites reconnaissables à ${esc(city)}</p><div class="space-y-1.5">${YCData.sitesIn(city).slice(0, 4).map((s) => `<button type="button" onclick="Screens._runScan('${s.id}')" class="w-full flex items-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 p-2 text-left"><span class="w-11 h-11 rounded-lg overflow-hidden bg-white/10">${UI.img(s.img, s.name)}</span><span class="flex-1 min-w-0"><span class="block t-small font-semibold truncate">${s.name}</span><span class="block t-caption text-white/50">${YCData.siteType(s.type).label}</span></span>${icon("play_circle", "text-gold")}</button>`).join("")}</div></div>
        </aside>
      </div>`;
    Shell.render(container, { title: "Scanner un monument", back: true, body, nav: false, fill: true, hideSearch: true, onMount: () => Screens._startCameraScan() });
  };
  function setScanStatus(text, tone) { const el = document.getElementById("yc-scan-status"); if (!el) return; el.textContent = text; el.className = "mt-16 text-center t-body max-w-[320px] " + (tone === "error" ? "text-[#FCA5A5]" : "text-white/90"); }
  function showCameraFallback(message) {
    const v = document.getElementById("yc-scan-video"), bg = document.getElementById("yc-scan-bg"), shade = document.getElementById("yc-scan-shade");
    if (v) v.classList.add("opacity-0"); if (bg) bg.classList.remove("hidden"); if (shade) shade.style.opacity = "1";
    setScanStatus(message + " Le mode démo reconnaît les sites listés.", "error");
  }
  Screens._startCameraScan = function () {
    const v = document.getElementById("yc-scan-video"); if (!v) return;
    setScanStatus("Autorisez la caméra dans la fenêtre du navigateur…");
    YCScanner.start(v, { onResult: Screens._onScanResult }).then((info) => {
      if (!App.current || App.current.id !== "culturalScanner") { YCScanner.stop(); return; }
      v.classList.remove("opacity-0");
      const bg = document.getElementById("yc-scan-bg"), shade = document.getElementById("yc-scan-shade"); if (bg) bg.classList.add("hidden"); if (shade) shade.style.opacity = "0.35";
      setScanStatus("Cadrez le monument ou un QR Code YOUSS CONNECT, puis appuyez sur « Reconnaître ».");
      const torch = document.getElementById("yc-scan-torch"); if (torch && info && info.torch) torch.classList.remove("hidden");
    }).catch((err) => showCameraFallback(SCAN_MESSAGES[err && err.code] || SCAN_MESSAGES.error));
  };
  Screens._scanTorch = () => YCScanner.toggleTorch().then((on) => { const b = document.getElementById("yc-scan-torch"); if (b) b.innerHTML = icon(on ? "flashlight_off" : "flashlight_on"); });
  Screens._scanFromFile = function (input) {
    const file = input.files && input.files[0]; input.value = ""; if (!file) return;
    setScanStatus("Analyse de l'image…");
    YCScanner.scanFile(file).then((text) => { if (!text) { Screens._recognize(); return; } YCScanner.stop(); Screens._onScanResult(text); }).catch(() => UI.toast("Image illisible.", "error"));
  };
  Screens._onScanResult = function (text) {
    const p = YCScanner.parse(text);
    if (p.type === "pay" && Screens._qrPayFromScan) { Screens._qrPayFromScan(p); return; }
    const site = siteFromText(text);
    if (site) { Screens._runScan(site.id); return; }
    if (p.type === "url") UI.toast("Lien détecté : " + p.url.replace(/^https?:\/\//, "").slice(0, 40), "info"); else UI.toast("QR non reconnu : " + p.raw.slice(0, 40), "error");
    setTimeout(() => { if (App.current && App.current.id === "culturalScanner") Screens._startCameraScan(); }, 1400);
  };
  /* Reconnaissance simulée : surcouche « détection » puis analyse */
  Screens._recognize = function () {
    const city = ACState.user.city; const s = YCData.sitesIn(city)[0] || YCData.SITES[2];
    const tag = document.getElementById("yc-scan-tag"), txt = document.getElementById("yc-scan-tag-txt"), btn = document.getElementById("yc-scan-recognize");
    if (btn) { btn.disabled = true; btn.innerHTML = UI.spinner("!w-5 !h-5 !border-2 !border-black/20 !border-t-black") + "Analyse en cours…"; }
    setScanStatus("Analyse des formes et des textures…");
    setTimeout(() => { if (tag) tag.classList.remove("hidden"); if (txt) txt.textContent = "Structure détectée"; setScanStatus("Comparaison avec les sites de " + city + "…"); }, 700);
    setTimeout(() => { if (txt) txt.textContent = "Correspondance : " + s.name; }, 1400);
    setTimeout(() => { if (App.current && App.current.id === "culturalScanner") Screens._runScan(s.id); }, 2000);
  };
  Screens._runScan = function (id) {
    YCScanner.stop();
    App.nav("scannerAnalyzing", { id });
  };
  Screens.scannerAnalyzing = function (container, params) {
    const s = YCData.site(params.id) || YCData.SITES[2];
    const body = `<div class="flex-1 flex items-center justify-center bg-[#0A0A0A] text-white relative overflow-hidden">
      ${UI.img(s.img, "", "absolute inset-0 w-full h-full object-cover opacity-30 animate-kenburns")}<div class="absolute inset-0 scan-grid opacity-30"></div>
      <div class="relative text-center px-6 max-w-[420px]">
        <div class="relative w-40 h-40 mx-auto"><div class="absolute inset-0 rounded-full border-2 border-gold/30"></div><div class="absolute inset-0 rounded-full border-t-4 border-gold animate-spin"></div><div class="absolute inset-4 rounded-full overflow-hidden">${UI.img(s.img, "")}</div></div>
        <p class="t-caption text-gold mt-8">Reconnaissance du site</p>
        <h2 class="t-h1 mt-1">${esc(s.name)}</h2>
        <p id="an-step" class="t-body text-white/70 mt-2">Extraction des points caractéristiques…</p>
        <div class="h-1.5 rounded-full bg-white/15 overflow-hidden mt-5"><div id="an-bar" class="h-full bg-gold transition-[width] duration-300" style="width:8%"></div></div>
        <p id="an-score" class="t-small text-white/60 mt-2">Correspondance : 12 %</p>
      </div></div>`;
    Shell.render(container, { title: "Analyse", back: "App.nav('culturalScanner')", body, nav: false, fill: true, hideSearch: true });
    const steps = [["Extraction des points caractéristiques…", 25, 34], ["Comparaison avec la base patrimoniale…", 55, 71], ["Vérification de la géolocalisation…", 80, 89], ["Monument identifié", 100, 97]];
    steps.forEach((st2, i) => setTimeout(() => { if (!App.current || App.current.id !== "scannerAnalyzing") return; const e = document.getElementById("an-step"), b = document.getElementById("an-bar"), sc = document.getElementById("an-score"); if (e) e.textContent = st2[0]; if (b) b.style.width = st2[1] + "%"; if (sc) sc.textContent = "Correspondance : " + st2[2] + " %"; }, 500 + i * 550));
    setTimeout(() => { if (App.current && App.current.id === "scannerAnalyzing") { if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { /* no-op */ } } ACStore.addActivity({ service: "culture", title: "Scan · " + s.name, amount: null, status: "Terminé", icon: "center_focus_strong", detail: { place: s.place } }); ACStore.emit(); App.replace("scannerResult", { id: s.id, scanned: 1, score: 97 }); } }, 2900);
  };
  Screens.scannerResult = function (container, params) { Screens.cultureDetail(container, Object.assign({}, params, { scanned: 1 })); };

  /* ---------- Explorer autour de moi ---------- */
  Screens.exploreAround = function (container, params) {
    const origin = params.id ? YCData.site(params.id) : null;
    const c = YCData.cityOf(params.city || (origin ? origin.city : ACState.user.city));
    const center = origin ? { lat: origin.lat, lng: origin.lng, name: origin.name } : { lat: c.lat, lng: c.lng, name: c.name };
    const sites = YCData.nearby(center.lat, center.lng, YCData.SITES, 8, origin ? origin.id : null).filter((s) => s.dist < 80);
    const rests = YCData.nearby(center.lat, center.lng, YCData.RESTAURANTS, 4).filter((r) => r.dist < 80);
    const events = YCData.nearby(center.lat, center.lng, YCData.EVENTS, 3).filter((e) => e.dist < 80);
    const rowItem = (x, kind) => `<button type="button" onclick="${kind === "site" ? go("cultureDetail", { id: x.id }) : kind === "rest" ? go("restaurantDetail", { id: x.id }) : go("eventDetail", { id: x.id })}" class="card card-press p-2.5 flex items-center gap-3 text-left w-full"><span class="w-14 h-14 rounded-xl overflow-hidden bg-card-high flex-shrink-0">${UI.img(x.img, x.name)}</span><span class="flex-1 min-w-0"><span class="block t-title truncate">${x.name}</span><span class="block t-small text-ink-2 truncate">${kind === "site" ? YCData.siteType(x.type).label : kind === "rest" ? x.cat + " · " + x.rating + " ★" : YCData.fmtDateShort(x.date) + " · " + x.cat}</span></span><span class="t-small font-bold whitespace-nowrap">${YCMap.fmtKm(x.dist)}</span></button>`;
    const body = `<div class="flex-1 min-h-0 lg:grid lg:grid-cols-[420px_1fr] flex flex-col">
      <aside class="order-2 lg:order-1 lg:h-full lg:overflow-y-auto border-t lg:border-t-0 lg:border-r border-line bg-surface p-4 lg:p-6 space-y-5 max-h-[55%] overflow-y-auto lg:max-h-none">
        <div><p class="t-caption text-gold-deep dark:text-gold">Autour de</p><h2 class="t-h2">${esc(center.name)}</h2><p class="t-small text-ink-2">${sites.length + rests.length + events.length} lieux dans un rayon de 80 km</p></div>
        ${sites.length ? `<div><p class="t-caption text-ink-3 mb-2">Sites culturels</p><div class="space-y-2">${sites.map((s) => rowItem(s, "site")).join("")}</div></div>` : ""}
        ${rests.length ? `<div><p class="t-caption text-ink-3 mb-2">Restaurants</p><div class="space-y-2">${rests.map((r) => rowItem(r, "rest")).join("")}</div></div>` : ""}
        ${events.length ? `<div><p class="t-caption text-ink-3 mb-2">Événements</p><div class="space-y-2">${events.map((e) => rowItem(e, "event")).join("")}</div></div>` : ""}
      </aside>
      <div class="order-1 lg:order-2 relative flex-1 min-h-[45%] lg:min-h-0 lg:h-full"><div id="around-map" class="absolute inset-0"></div></div></div>`;
    Shell.render(container, { title: "Explorer autour de moi", subtitle: esc(center.name), back: true, body, nav: false, fill: true, onMount: () => {
      const m = YCMap.create("around-map", { interactive: true, lat: center.lat, lng: center.lng, zoom: 12 });
      if (!m) return;
      m.setUser([center.lat, center.lng]);
      const all = [];
      sites.forEach((s) => { all.push([s.lat, s.lng]); m.addPoi([s.lat, s.lng], YCData.siteType(s.type).icon, `<b>${esc(s.name)}</b><br>${YCData.siteType(s.type).label}`, () => App.nav("cultureDetail", { id: s.id })); });
      rests.forEach((r) => { all.push([r.lat, r.lng]); m.addPoi([r.lat, r.lng], "restaurant", `<b>${esc(r.name)}</b><br>${r.cat}`, () => App.nav("restaurantDetail", { id: r.id })); });
      events.forEach((e) => { all.push([e.lat, e.lng]); m.addPoi([e.lat, e.lng], "confirmation_number", `<b>${esc(e.name)}</b>`, () => App.nav("eventDetail", { id: e.id })); });
      if (all.length > 1) m.fit(all.concat([[center.lat, center.lng]]), { paddingTopLeft: [40, 40], paddingBottomRight: [40, 40], maxZoom: 13 });
    } });
  };
})();
