/* Explorer — moteur de découverte : recherche globale, catégories, filtres, carte */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;

  const f = { q: "", kind: "all", maxKm: 0, maxPrice: 0, rating: 0, available: false, view: "list", city: "" };
  const KINDS = [["all", "Tout", "apps"], ["restaurant", "Restaurants", "restaurant"], ["service", "Transport & services", "directions_car"], ["evenement", "Événements", "confirmation_number"], ["produit", "Produits", "shopping_bag"], ["lieu", "Tourisme & culture", "account_balance"], ["destination", "Destinations", "travel_explore"], ["plat", "Plats", "lunch_dining"]];
  const KIND_LABEL = { restaurant: "Restaurants", plat: "Plats", produit: "Produits", evenement: "Événements", lieu: "Lieux culturels", destination: "Destinations", service: "Services" };
  const TRENDING = ["Poisson braisé", "Concert", "Wax", "Gorée", "Jollof", "Musée", "Karité", "Plage"];

  function results() {
    const c = YCData.cityOf(ACState.user.city);
    const list = YCData.search(f.q, { kind: f.kind, city: f.city || null, rating: f.rating || null, maxPrice: f.maxPrice || null, available: f.available, maxKm: f.maxKm || null, from: f.maxKm ? { lat: c.lat, lng: c.lng } : null });
    const groups = {}; list.forEach((r) => { (groups[r.kind] = groups[r.kind] || []).push(r); });
    return { list, groups };
  }
  const activeFilters = () => [f.maxKm ? "≤ " + f.maxKm + " km" : null, f.maxPrice ? "≤ " + ACStore.fmtFCFA(f.maxPrice) : null, f.rating ? "≥ " + f.rating + " ★" : null, f.available ? "Disponible" : null, f.city ? f.city : null].filter(Boolean);

  Screens.explorer = function (container, params) {
    params = params || {};
    if (params.q != null) f.q = params.q;
    if (params.kind) f.kind = params.kind;
    if (params.near) { f.maxKm = 5; f.city = ACState.user.city; }
    const body = `
      <div class="flex flex-col lg:flex-row gap-3">
        <label class="relative flex-1">${icon("search", "absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 text-[22px] pointer-events-none")}<input id="ex-q" type="search" value="${esc(f.q)}" placeholder="Rechercher dans YOUSS CONNECT" oninput="Screens._exType(this.value)" class="input input-lg pl-12 pr-12" autocomplete="off"/>${f.q ? `<button type="button" onclick="Screens._exClear()" class="absolute right-3 top-1/2 -translate-y-1/2 icon-btn w-8 h-8 border-0 shadow-none" aria-label="Effacer">${icon("close", "text-[18px]")}</button>` : ""}</label>
        <div class="flex gap-2">
          <button type="button" onclick="Screens._exFilters()" class="btn btn-outline !w-auto relative">${icon("tune", "text-[20px]")}Filtres${activeFilters().length ? `<span class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-[#0A0A0A] text-[10px] font-extrabold flex items-center justify-center">${activeFilters().length}</span>` : ""}</button>
          <div class="flex rounded-2xl border border-line overflow-hidden"><button type="button" onclick="Screens._exView('list')" class="h-12 px-4 ${f.view === "list" ? "bg-inverse text-inverse-ink" : "bg-card"}" aria-label="Liste">${icon("view_list")}</button><button type="button" onclick="Screens._exView('map')" class="h-12 px-4 ${f.view === "map" ? "bg-inverse text-inverse-ink" : "bg-card"}" aria-label="Carte">${icon("map")}</button></div>
        </div>
      </div>
      <div class="hscroll">${KINDS.map((k) => UI.chip(k[1], `Screens._exKind('${k[0]}')`, f.kind === k[0], { icon: k[2] })).join("")}</div>
      ${activeFilters().length ? `<div class="flex flex-wrap items-center gap-2 t-small"><span class="text-ink-2">Filtres :</span>${activeFilters().map((x) => `<span class="badge badge-dark">${x}</span>`).join("")}<button type="button" onclick="Screens._exResetFilters()" class="font-bold text-gold-deep dark:text-gold">Effacer</button></div>` : ""}
      <div id="ex-results"></div>`;
    Shell.render(container, { title: I18N.t("nav_explorer"), subtitle: "Moteur de découverte · " + esc(ACState.user.city), body, nav: "explorer", hideSearch: true, onMount: () => { renderResults(); if (params.focus) { const el = document.getElementById("ex-q"); if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; } } } });
  };
  Screens.search = (container, params) => Screens.explorer(container, Object.assign({ focus: 1 }, params || {}));

  function resultCard(r) {
    return `<button type="button" onclick="${go(r.route, r.params)}" class="card card-press p-2.5 flex items-center gap-3 text-left w-full">
      <span class="w-16 h-16 rounded-xl overflow-hidden bg-surface-low flex items-center justify-center flex-shrink-0 text-gold">${r.img ? UI.img(r.img, r.title) : icon(r.icon, "text-[28px]")}</span>
      <span class="flex-1 min-w-0"><span class="block t-title truncate">${esc(r.title)}</span><span class="block t-small text-ink-2 truncate">${esc(r.sub)}</span><span class="flex items-center gap-2 t-small mt-0.5">${r.rating && r.kind !== "service" ? `<span class="inline-flex items-center gap-0.5">${icon("star", "text-gold text-[14px]", true)}${r.rating}</span>` : ""}${r.price ? `<span class="font-semibold">${ACStore.fmtFCFA(r.price)}</span>` : ""}${r.available === false ? UI.badge("Rupture", "danger") : ""}</span></span>${icon("chevron_right", "text-ink-3")}</button>`;
  }
  function renderResults() {
    const el = document.getElementById("ex-results"); if (!el) return;
    YCMap.destroyAll();
    const { list, groups } = results();
    if (!f.q && f.kind === "all" && !activeFilters().length && f.view === "list") {
      const c = ACState.user.city;
      el.innerHTML = `
        <section class="mb-6"><p class="t-caption text-ink-3 mb-2">Recherches populaires</p><div class="flex flex-wrap gap-2">${TRENDING.map((t) => `<button type="button" onclick="Screens._exSet(${UI.js(t)})" class="chip">${icon("trending_up", "text-[15px] text-gold")}${t}</button>`).join("")}</div></section>
        <section class="mb-6">${UI.sectionTitle("Catégories")}<div class="grid grid-cols-2 md:grid-cols-4 gap-3">${[["restaurant", "Restaurants", "restaurant", YCData.RESTAURANTS[0].img], ["directions_car", "Transport", "transport", YCData.IMG + "services/svc-transport.jpg"], ["confirmation_number", "Événements", "events", YCData.IMG + "services/svc-events.jpg"], ["storefront", "Commerces & produits", "market", YCData.IMG + "services/svc-market.jpg"], ["travel_explore", "Tourisme", "culture", YCData.IMG + "places/city-dakar.jpg"], ["account_balance", "Culture", "culture", YCData.IMG + "places/site-abomey.jpg"], ["local_shipping", "Livraison", "delivery", YCData.IMG + "services/svc-delivery.jpg"], ["theater_comedy", "Activités", "exploreAround", YCData.IMG + "places/site-ganvie.jpg"]].map((k) => `<button type="button" onclick="App.nav('${k[2]}')" class="relative h-24 lg:h-28 rounded-2xl overflow-hidden text-left card-press group">${UI.img(k[3], "", "img-cover transition-transform duration-500 group-hover:scale-105")}<span class="absolute inset-0 gradient-up"></span><span class="absolute bottom-2.5 left-3 text-white flex items-center gap-1.5 t-title">${icon(k[0], "text-[18px] text-gold")}${k[1]}</span></button>`).join("")}</div></section>
        <section class="mb-6">${UI.sectionTitle("À proximité", "Voir sur la carte", "Screens._exView('map')", "Autour de " + esc(c))}<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">${YCData.nearby(YCData.cityOf(c).lat, YCData.cityOf(c).lng, YCData.RESTAURANTS.concat(YCData.SITES), 6).map((x) => x.menu ? UI.restaurantCard(x) : UI.siteCard(x)).join("")}</div></section>
        <section>${UI.sectionTitle("Destinations")}<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${YCData.DESTINATIONS.map((d) => UI.destinationCard(d)).join("")}</div></section>`;
      return;
    }
    if (f.view === "map") {
      el.innerHTML = `<div class="card overflow-hidden"><div id="ex-map" class="h-[55vh] lg:h-[60vh]"></div></div><p class="t-small text-ink-2 mt-3">${list.filter((r) => r.lat != null).length} résultat(s) géolocalisé(s)${f.q ? " pour « " + esc(f.q) + " »" : ""}</p>`;
      requestAnimationFrame(() => {
        const c = YCData.cityOf(f.city || ACState.user.city);
        const m = YCMap.create("ex-map", { interactive: true, lat: c.lat, lng: c.lng, zoom: 12 }); if (!m) return;
        const pts = [];
        list.filter((r) => r.lat != null).slice(0, 60).forEach((r) => { pts.push([r.lat, r.lng]); m.addPoi([r.lat, r.lng], r.icon, `<b>${esc(r.title)}</b><br>${esc(r.sub)}`, () => App.nav(r.route, r.params)); });
        m.setUser([c.lat, c.lng]);
        if (pts.length > 1) m.fit(pts, { paddingTopLeft: [30, 30], paddingBottomRight: [30, 30], maxZoom: 14 });
      });
      return;
    }
    if (!list.length) { el.innerHTML = UI.emptyState({ icon: "search_off", title: I18N.t("empty_results"), body: "Aucun résultat pour « " + esc(f.q) + " ». Essayez un autre mot-clé, une autre catégorie ou retirez des filtres.", actionLabel: "Effacer les filtres", actionOnclick: "Screens._exResetFilters()" }); return; }
    const order = ["restaurant", "plat", "evenement", "produit", "lieu", "destination", "service"];
    el.innerHTML = `<p class="t-small text-ink-2 mb-3">${list.length} résultat${list.length > 1 ? "s" : ""}${f.q ? " pour « " + esc(f.q) + " »" : ""}</p>` + order.filter((k) => groups[k]).map((k) => `<section class="mb-6"><div class="flex items-center justify-between mb-2"><h2 class="t-h3">${KIND_LABEL[k]} <span class="t-small text-ink-3 font-normal">(${groups[k].length})</span></h2>${f.kind === "all" && groups[k].length > 4 ? `<button type="button" onclick="Screens._exKind('${k}')" class="t-small font-bold text-gold-deep dark:text-gold">Voir tout</button>` : ""}</div><div class="grid md:grid-cols-2 gap-2.5">${(f.kind === "all" ? groups[k].slice(0, 4) : groups[k]).map(resultCard).join("")}</div></section>`).join("");
  }
  Screens._exType = (v) => { f.q = v; renderResults(); };
  Screens._exSet = (v) => { f.q = v; App.replace("explorer", { q: v }); };
  Screens._exClear = () => { f.q = ""; App.replace("explorer"); };
  Screens._exKind = (k) => { f.kind = k; App.replace("explorer", { kind: k, q: f.q }); };
  Screens._exView = (v) => { f.view = v; App.replace("explorer", { q: f.q, kind: f.kind }); };
  Screens._exResetFilters = () => { f.maxKm = 0; f.maxPrice = 0; f.rating = 0; f.available = false; f.city = ""; f.kind = "all"; f.q = ""; App.replace("explorer"); };
  Screens._exFilters = function () {
    const opt = (name, values, cur, fmt) => `<div class="flex flex-wrap gap-2">${values.map((v) => `<button type="button" onclick="Screens._exF('${name}',${JSON.stringify(v)})" class="chip ${cur === v ? "on" : ""}">${fmt(v)}</button>`).join("")}</div>`;
    UI.openSheet(`<h3 class="t-h3 mb-4">Filtres</h3>
      <div class="space-y-5">
        <div><p class="t-caption text-ink-3 mb-2">Distance</p>${opt("maxKm", [0, 2, 5, 10, 50], f.maxKm, (v) => v ? "≤ " + v + " km" : "Toutes")}</div>
        <div><p class="t-caption text-ink-3 mb-2">Prix maximum</p>${opt("maxPrice", [0, 2000, 5000, 10000, 25000], f.maxPrice, (v) => v ? "≤ " + v.toLocaleString("fr-FR") + " F" : "Tous")}</div>
        <div><p class="t-caption text-ink-3 mb-2">Note minimale</p>${opt("rating", [0, 4, 4.5, 4.8], f.rating, (v) => v ? "≥ " + v + " ★" : "Toutes")}</div>
        <div><p class="t-caption text-ink-3 mb-2">Ville</p>${opt("city", [""].concat(YCData.DESTINATIONS), f.city, (v) => v || "Toutes")}</div>
        <div class="flex items-center justify-between"><span class="t-title">Disponible uniquement</span>${UI.toggle(f.available, "Screens._exF('available',!" + f.available + ")", "Disponible")}</div>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-6">${UI.secondaryButton("Réinitialiser", "UI.closeSheet();Screens._exResetFilters()")}${UI.primaryButton("Voir les résultats", "UI.closeSheet();App.replace('explorer',{q:" + JSON.stringify(f.q) + ",kind:'" + f.kind + "'})")}</div>`);
  };
  Screens._exF = (name, v) => { f[name] = v; Screens._exFilters(); };
})();
