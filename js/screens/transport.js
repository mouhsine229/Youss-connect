/* Transport — carte, destination, véhicule, confirmation, chauffeur, suivi, fin de course */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;
  const M = () => window.YCMap;

  const FARE = { base: 1500, perKm: 350, min: 2000 };
  const VEHICLES = [
    { id: "moto", label: "Moto", sub: "Zémidjan · 1 passager", icon: "two_wheeler", mult: 0.65, etaMult: 0.7, avail: "2 min", seats: 1 },
    { id: "car", label: "Voiture", sub: "Confort · 4 places", icon: "directions_car", mult: 1, etaMult: 1, avail: "5 min", seats: 4 },
    { id: "premium", label: "Premium", sub: "Berline climatisée · 4 places", icon: "airport_shuttle", mult: 1.55, etaMult: 0.95, avail: "8 min", seats: 4 }
  ];

  /* État du trajet (persisté légèrement dans ACState.trip) */
  const trip = { from: null, to: null, vehicle: "car", route: null, km: 0, sec: 0, price: 0, driver: null, method: "wallet", pickMode: "to", status: "idle", rating: 5, comment: "", startedAt: null };
  if (ACState.trip && ACState.trip.from) Object.assign(trip, ACState.trip, { route: null });
  function syncTrip() { ACState.trip = { from: trip.from, to: trip.to, vehicle: trip.vehicle, km: trip.km, sec: trip.sec, price: trip.price, driver: trip.driver, method: trip.method, status: trip.status, startedAt: trip.startedAt }; }

  let map = null, suggestTimer = null, suggestReq = 0, lastSuggestions = [], suggestRole = "to", blurTimer = null, routeReq = 0;

  const vehicleOf = () => VEHICLES.find((v) => v.id === trip.vehicle) || VEHICLES[1];
  function priceFor(v, km) {
    const base = Math.max(FARE.min, Math.round((FARE.base + (km || 0) * FARE.perKm) / 100) * 100);
    return Math.round((base * v.mult) / 100) * 100;
  }
  function etaSec(km) { return trip.sec && trip.km ? Math.max(60, Math.round(trip.sec)) : Math.max(60, Math.round(((km || 1) / M().URBAN_SPEED_KMH) * 3600)); }
  function updateDistance() {
    if (!trip.from || !trip.to) { trip.km = 0; trip.sec = 0; return; }
    if (trip.route && trip.route.key === routeKey()) { trip.km = Math.round(trip.route.km * 10) / 10; trip.sec = trip.route.sec; }
    else { const est = M().straightRoute(trip.from, trip.to); trip.km = Math.round(est.km * 10) / 10; trip.sec = est.sec; }
    trip.price = priceFor(vehicleOf(), trip.km);
  }
  function routeKey() { return trip.from && trip.to ? [trip.from.lat, trip.from.lng, trip.to.lat, trip.to.lng].map((v) => Number(v).toFixed(5)).join("|") : null; }
  function loadRoute() {
    const key = routeKey();
    if (!key) return Promise.resolve(null);
    if (trip.route && trip.route.key === key) return Promise.resolve(trip.route);
    const req = ++routeReq;
    return M().fetchRoute(trip.from, trip.to).then((route) => {
      if (req !== routeReq || key !== routeKey()) return trip.route;
      trip.route = route; updateDistance(); syncTrip();
      if (map && App.current && App.current.id === "transport") { map.drawRoute(route.coords); map.fit(route.coords, fitPad()); }
      refreshPanel();
      return route;
    });
  }
  function fitPad() {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const sheet = document.getElementById("tr-sheet");
    return desktop ? { paddingTopLeft: [60, 60], paddingBottomRight: [60, 60] } : { paddingTopLeft: [40, 80], paddingBottomRight: [40, (sheet ? sheet.offsetHeight : 260) + 24] };
  }

  /* Préréglage utilisé par le mode démo et les ponts (« Y aller ») */
  Screens._transportPreset = function (o) {
    o = o || {};
    const city = YCData.cityOf(ACState.user.city);
    const find = (name) => { if (!name) return null; const n = YCData.norm(name); return city.poi.find((p) => YCData.norm(p.name).includes(n) || n.includes(YCData.norm(p.name).split(" (")[0])) || null; };
    if (o.fromLatLng) trip.from = o.fromLatLng; else if (o.from) { const p = find(o.from); if (p) trip.from = { name: p.name, lat: p.lat, lng: p.lng }; }
    if (o.toLatLng) trip.to = o.toLatLng; else if (o.to) { const p = find(o.to); if (p) trip.to = { name: p.name, lat: p.lat, lng: p.lng }; } else if (o.toName) { const p = find(o.toName); trip.to = p ? { name: p.name, lat: p.lat, lng: p.lng } : { name: o.toName, lat: city.lat + 0.01, lng: city.lng + 0.01 }; }
    if (!trip.from) { const home = ACState.addresses[0]; trip.from = home && home.lat ? { name: home.label + " · " + home.detail.split(",")[0], lat: home.lat, lng: home.lng } : { name: city.poi[0].name, lat: city.poi[0].lat, lng: city.poi[0].lng }; }
    if (o.vehicle) trip.vehicle = o.vehicle;
    trip.route = null; trip.status = "idle"; trip.driver = null; updateDistance(); syncTrip();
  };

  /* ---------- Écran principal ---------- */
  Screens.transport = function (container) {
    const city = YCData.cityOf(ACState.user.city);
    if (!trip.from) Screens._transportPreset({});
    updateDistance();
    const chips = city.poi.slice(0, 6).map((p) => `<button type="button" onclick="Screens._pickPoi(${UI.js(p)})" class="chip">${icon(p.kind === "aeroport" ? "flight" : "place", "text-[15px]")}${esc(p.name.split("(")[0].trim())}</button>`).join("");
    const panel = `
      <div class="p-4 lg:p-6 space-y-4">
        <p class="hidden lg:block t-small text-ink-2">${esc(city.name)} · itinéraire routier réel, prix fixe au kilomètre</p>
        <div class="card p-1 relative">
          <div class="flex items-center gap-3 h-12 px-3">
            <span class="w-2.5 h-2.5 rounded-full bg-gold flex-shrink-0"></span>
            <input id="from-input" value="${esc(trip.from ? trip.from.name : "")}" placeholder="Point de départ" autocomplete="off" spellcheck="false" enterkeyhint="next" onfocus="Screens._placeFocus('from')" oninput="Screens._placeInput('from', this.value)" onkeydown="Screens._placeKey(event)" onblur="Screens._placeBlur()" class="flex-1 bg-transparent t-title outline-none min-w-0"/>
            <button type="button" onclick="Screens._useMyPosition()" class="text-ink-3 hover:text-ink flex-shrink-0" title="Ma position" aria-label="Utiliser ma position">${icon("my_location", "text-[20px]")}</button>
          </div>
          <div class="h-px bg-line ml-8 mr-3"></div>
          <div class="flex items-center gap-3 h-12 px-3">
            <span class="w-2.5 h-2.5 rounded-sm bg-ink flex-shrink-0"></span>
            <input id="dest-input" value="${esc(trip.to ? trip.to.name : "")}" placeholder="Où allez-vous ?" autocomplete="off" spellcheck="false" enterkeyhint="search" onfocus="Screens._placeFocus('to')" oninput="Screens._placeInput('to', this.value)" onkeydown="Screens._placeKey(event)" onblur="Screens._placeBlur()" class="flex-1 bg-transparent t-title outline-none min-w-0"/>
            <button type="button" onclick="Screens._swapTripPoints()" class="text-ink-3 hover:text-ink flex-shrink-0" title="Inverser" aria-label="Inverser départ et destination">${icon("swap_vert", "text-[20px]")}</button>
          </div>
          <div id="place-suggestions" class="hidden absolute left-0 right-0 top-full mt-1 card overflow-hidden z-20 max-h-[280px] overflow-y-auto shadow-float"></div>
        </div>
        <div class="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">${chips}</div>
        <p id="pick-hint" class="t-small text-ink-2 flex items-center gap-2">${icon("touch_app", "text-[16px] text-gold")}Touchez la carte pour placer ${trip.pickMode === "from" ? "le départ" : "la destination"}</p>
        <div id="tr-summary" class="flex items-center justify-between gap-3"></div>
        <div id="tr-vehicles" class="space-y-2"></div>
        <p class="t-small text-ink-3">Tarif : ${ACStore.fmtFCFA(FARE.base)} + ${ACStore.fmtFCFA(FARE.perKm)}/km · minimum ${ACStore.fmtFCFA(FARE.min)} · estimation hors trafic exceptionnel</p>
        <button type="button" id="request-btn" onclick="Screens._transportContinue()" class="btn btn-lg btn-dark btn-block">${I18N.t("continue")}</button>
      </div>`;
    const body = `
      <div class="flex-1 min-h-0 relative lg:grid lg:grid-cols-[440px_1fr]">
        <aside id="tr-sheet" class="absolute bottom-0 inset-x-0 z-20 max-h-[58%] overflow-y-auto bg-card rounded-t-3xl shadow-float lg:static lg:max-h-none lg:rounded-none lg:shadow-none lg:border-r lg:border-line lg:overflow-y-auto lg:h-full">
          <div class="w-10 h-1.5 bg-line rounded-full mx-auto mt-2 lg:hidden"></div>${panel}
        </aside>
        <div class="absolute inset-0 lg:static lg:h-full">
          <div id="tr-map" class="absolute inset-0 lg:relative lg:h-full w-full"></div>
          <div class="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <button type="button" onclick="Screens._useMyPosition()" class="icon-btn shadow-md" title="Ma position" aria-label="Ma position">${icon("my_location")}</button>
            <button type="button" onclick="Shell.openCityPicker()" class="icon-btn shadow-md" title="Changer de ville" aria-label="Changer de ville">${icon("public")}</button>
          </div>
        </div>
      </div>`;
    Shell.render(container, { title: "Transport", subtitle: "Où allez-vous ?", back: "App.nav('home')", body, nav: false, fill: true, onMount: initMainMap });
  };

  function initMainMap() {
    map = M().create("tr-map", { interactive: true, zoomPosition: "bottomright" });
    if (!map) return;
    refreshMarkers();
    map.onClick((p) => Screens._setTripPoint(trip.pickMode, { name: "Point sur la carte (" + p.lat.toFixed(4) + ", " + p.lng.toFixed(4) + ")", lat: p.lat, lng: p.lng }));
    M().locate((pos) => { if (map) map.setUser([pos.lat, pos.lng]); });
    refreshPanel();
    loadRoute();
  }
  function refreshMarkers() {
    if (!map) return;
    map.setPin("from", trip.from ? [trip.from.lat, trip.from.lng] : null, trip.from && trip.from.name);
    map.setPin("to", trip.to ? [trip.to.lat, trip.to.lng] : null, trip.to && trip.to.name);
    if (trip.from && trip.to) {
      if (trip.route && trip.route.key === routeKey()) { map.drawRoute(trip.route.coords); map.fit(trip.route.coords, fitPad()); }
      else { map.drawPending(trip.from, trip.to); map.fit([[trip.from.lat, trip.from.lng], [trip.to.lat, trip.to.lng]], fitPad()); }
    } else if (trip.from) map.setView(trip.from.lat, trip.from.lng, 14);
  }
  function refreshPanel() {
    updateDistance();
    const sum = document.getElementById("tr-summary"), veh = document.getElementById("tr-vehicles"), btn = document.getElementById("request-btn"), hint = document.getElementById("pick-hint");
    const hasRoute = trip.route && trip.route.key === routeKey();
    if (sum) sum.innerHTML = trip.km ? `<div><p class="t-title">Votre course</p><p class="t-small text-ink-2">${M().fmtKm(trip.km)} ${hasRoute ? (trip.route.real ? "par la route" : "estimés") : "· calcul de l'itinéraire…"}</p></div><div class="text-right"><p class="t-h3 text-gold-deep dark:text-gold leading-none">≈ ${M().fmtEta(etaSec(trip.km))}</p><p class="t-small text-ink-2">durée estimée</p></div>`
      : `<p class="t-small text-ink-2">Indiquez un départ et une destination pour voir les prix.</p>`;
    if (veh) veh.innerHTML = VEHICLES.map((v) => {
      const sel = trip.vehicle === v.id; const p = priceFor(v, trip.km);
      return `<button type="button" onclick="Screens._pickVehicle('${v.id}')" class="w-full rounded-2xl border p-3 flex items-center justify-between gap-3 text-left transition-colors ${sel ? "border-gold bg-gold/10" : "border-line bg-card hover:bg-surface-low"}" aria-pressed="${sel}">
        <span class="flex items-center gap-3 min-w-0"><span class="w-11 h-11 rounded-xl ${sel ? "bg-gold text-[#0A0A0A]" : "bg-surface-low text-ink"} flex items-center justify-center flex-shrink-0">${icon(v.icon, "text-[24px]")}</span>
          <span class="min-w-0"><span class="block t-title">${v.label} <span class="t-small text-ink-3 font-normal">· ${v.sub}</span></span><span class="block t-small text-ink-2">${icon("schedule", "text-[13px]")} ${v.avail} · ${trip.km ? M().fmtEta(Math.round(etaSec(trip.km) * v.etaMult)) : "—"} · <span class="text-success font-semibold">Disponible</span></span></span></span>
        <span class="t-title font-extrabold whitespace-nowrap">${trip.km ? ACStore.fmtFCFA(p) : "—"}</span></button>`;
    }).join("");
    if (btn) btn.innerHTML = `${I18N.t("continue")}${trip.km ? " · " + ACStore.fmtFCFA(trip.price) : ""}${icon("arrow_forward", "text-[20px]")}`;
    if (hint) hint.innerHTML = `${icon("touch_app", "text-[16px] text-gold")}Touchez la carte pour placer ${trip.pickMode === "from" ? "le départ" : "la destination"}`;
    const fi = document.getElementById("from-input"), di = document.getElementById("dest-input");
    if (fi && document.activeElement !== fi) fi.value = trip.from ? trip.from.name : "";
    if (di && document.activeElement !== di) di.value = trip.to ? trip.to.name : "";
  }

  /* ---------- Saisie et suggestions ---------- */
  function renderSuggestions(list, opts) {
    const box = document.getElementById("place-suggestions"); if (!box) return;
    lastSuggestions = list;
    if (!list.length && !(opts && opts.loading)) {
      box.innerHTML = `<p class="px-4 py-4 t-small text-ink-2">${opts && opts.query ? "Aucun lieu trouvé pour « " + esc(opts.query) + " »" : "Saisissez une adresse, un quartier ou un lieu"}</p>`;
    } else {
      box.innerHTML = list.map((s, i) => `<button type="button" onmousedown="event.preventDefault()" onclick="Screens._pickSuggestion(${i})" class="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-surface-low border-b border-line last:border-0">
        <span class="w-9 h-9 rounded-full bg-surface-low text-ink flex items-center justify-center flex-shrink-0">${icon(s.icon || "place", "text-[18px]")}</span>
        <span class="min-w-0 flex-1"><span class="block t-small font-semibold truncate">${esc(s.name)}</span><span class="block t-small text-ink-3 truncate">${esc(s.detail)}</span></span>${icon("north_west", "text-[16px] text-ink-3")}
      </button>`).join("") + (opts && opts.loading ? `<p class="px-4 py-2.5 t-small text-ink-3 flex items-center gap-2 border-t border-line">${UI.spinner("!w-4 !h-4 !border-2")}Recherche en cours…</p>` : "");
    }
    box.classList.remove("hidden");
  }
  const hideSuggestions = () => { const b = document.getElementById("place-suggestions"); if (b) b.classList.add("hidden"); };
  Screens._placeFocus = function (role) { clearTimeout(blurTimer); suggestRole = role; trip.pickMode = role; const el = document.getElementById(role === "from" ? "from-input" : "dest-input"); if (el) el.select(); renderSuggestions(M().localPlaces("", ACState.user.city)); const h = document.getElementById("pick-hint"); if (h) h.innerHTML = `${icon("touch_app", "text-[16px] text-gold")}Touchez la carte pour placer ${role === "from" ? "le départ" : "la destination"}`; };
  Screens._placeInput = function (role, value) {
    suggestRole = role; clearTimeout(suggestTimer);
    const q = (value || "").trim(); const local = M().localPlaces(q, ACState.user.city);
    if (q.length < 2) { renderSuggestions(local); return; }
    renderSuggestions(local, { loading: true, query: q });
    const req = ++suggestReq;
    suggestTimer = setTimeout(() => M().geocode(q, ACState.user.city).then((remote) => {
      if (req !== suggestReq) return;
      const names = {}; const merged = local.concat(remote).filter((s) => { const k = YCData.norm(s.name); if (names[k]) return false; names[k] = true; return true; });
      renderSuggestions(merged.slice(0, 7), { query: q });
    }), 350);
  };
  Screens._placeKey = function (ev) { if (ev.key === "Enter") { ev.preventDefault(); if (lastSuggestions.length) Screens._pickSuggestion(0); } else if (ev.key === "Escape") { hideSuggestions(); ev.target.blur(); } };
  Screens._placeBlur = function () { clearTimeout(blurTimer); blurTimer = setTimeout(() => { hideSuggestions(); refreshPanel(); }, 180); };
  Screens._pickSuggestion = function (i) {
    const s = lastSuggestions[i]; if (!s) return; hideSuggestions();
    const role = suggestRole; const el = document.getElementById(role === "from" ? "from-input" : "dest-input"); if (el) el.blur();
    Screens._setTripPoint(role, { name: s.name, lat: s.lat, lng: s.lng });
    if (role === "from" && !trip.to) { const d = document.getElementById("dest-input"); if (d) setTimeout(() => d.focus(), 60); }
  };
  Screens._setTripPoint = function (role, place) {
    if (role === "from") { trip.from = place; if (trip.pickMode === "from") trip.pickMode = "to"; } else trip.to = place;
    trip.route = null; updateDistance(); syncTrip(); refreshMarkers(); refreshPanel(); loadRoute();
  };
  Screens._pickPoi = function (p) { Screens._setTripPoint(trip.pickMode, { name: p.name, lat: p.lat, lng: p.lng }); UI.toast((trip.pickMode === "to" && trip.to && trip.to.name === p.name ? "Destination : " : "Départ : ") + p.name.split("(")[0].trim(), "info"); };
  Screens._swapTripPoints = function () { const f = trip.from; trip.from = trip.to; trip.to = f; trip.route = null; updateDistance(); syncTrip(); refreshMarkers(); refreshPanel(); loadRoute(); };
  Screens._pickVehicle = function (id) { trip.vehicle = id; updateDistance(); syncTrip(); refreshPanel(); };
  Screens._useMyPosition = function () {
    UI.toast("Localisation en cours…", "info");
    M().locate((pos) => {
      Screens._setTripPoint("from", { name: pos.ok ? "Ma position actuelle" : "Ma position (estimée)", lat: pos.lat, lng: pos.lng });
      trip.pickMode = "to"; if (map) { map.setUser([pos.lat, pos.lng]); map.setView(pos.lat, pos.lng, 14); }
      UI.toast("Départ = votre position", "success");
    });
  };

  Screens._transportContinue = function () {
    if (!trip.from) { UI.toast("Indiquez d'où vous partez.", "error"); const el = document.getElementById("from-input"); if (el) el.focus(); return; }
    if (!trip.to) { UI.toast("Indiquez où vous allez.", "error"); const el = document.getElementById("dest-input"); if (el) el.focus(); return; }
    const proceed = () => { updateDistance(); syncTrip(); if (App.current && App.current.id === "transport") App.nav("transportConfirm"); };
    if (trip.route && trip.route.key === routeKey()) { proceed(); return; }
    UI.toast("Calcul de l'itinéraire et du prix…", "info");
    let done = false; const finish = () => { if (done) return; done = true; proceed(); };
    loadRoute().then(finish, finish); setTimeout(finish, 4000);
  };

  /* ---------- Confirmation ---------- */
  Screens.transportConfirm = function (container) {
    if (!trip.from || !trip.to) { App.resetTo("transport"); return; }
    updateDistance();
    const v = vehicleOf();
    const methods = ACState.paymentMethods;
    const body = `
      <div class="grid lg:grid-cols-[1fr_380px] gap-6">
        <div class="space-y-4">
          <div class="card overflow-hidden"><div id="cf-map" class="h-52 lg:h-72 w-full bg-surface-low"></div>
            <div class="p-4 space-y-3">
              <div class="flex gap-3"><span class="w-2.5 h-2.5 rounded-full bg-gold mt-1.5 flex-shrink-0"></span><div class="min-w-0"><p class="t-caption text-ink-3">Départ</p><p class="t-title truncate">${esc(trip.from.name)}</p></div></div>
              <div class="flex gap-3"><span class="w-2.5 h-2.5 rounded-sm bg-ink mt-1.5 flex-shrink-0"></span><div class="min-w-0"><p class="t-caption text-ink-3">Destination</p><p class="t-title truncate">${esc(trip.to.name)}</p></div></div>
            </div></div>
          <div class="card p-4">
            <p class="t-caption text-ink-3 mb-2">Véhicule</p>
            <div class="flex items-center gap-3"><span class="w-12 h-12 rounded-xl bg-gold text-[#0A0A0A] flex items-center justify-center">${icon(v.icon, "text-[26px]")}</span><div class="flex-1"><p class="t-title">${v.label}</p><p class="t-small text-ink-2">${v.sub} · arrivée en ${v.avail}</p></div><button type="button" onclick="App.back()" class="t-small font-bold text-gold-deep dark:text-gold">Modifier</button></div>
          </div>
          <div class="card p-4">
            <p class="t-caption text-ink-3 mb-2">Moyen de paiement</p>
            <div class="space-y-2">${methods.map((m) => `<button type="button" onclick="Screens._tripMethod('${m.type}')" class="w-full flex items-center gap-3 rounded-xl border p-3 text-left ${trip.method === m.type ? "border-gold bg-gold/10" : "border-line"}">
              <span class="menu-icon">${icon(m.icon)}</span><span class="flex-1 min-w-0"><span class="block t-title">${m.label}${m.type === "wallet" ? ` <span class="t-small text-ink-2 font-normal">· ${ACStore.fmtFCFA(ACState.wallet.balance)}</span>` : ""}</span><span class="block t-small text-ink-2 truncate">${m.sub}</span></span>${trip.method === m.type ? icon("check_circle", "text-gold", true) : ""}
            </button>`).join("")}</div>
          </div>
          <div class="card p-4 flex items-center gap-3"><span class="menu-icon">${icon("sell")}</span><input id="promo" class="flex-1 bg-transparent outline-none t-body" placeholder="Code promo (ex. YOUSS10)"/><button type="button" onclick="Screens._applyPromo()" class="t-small font-bold text-gold-deep dark:text-gold">Appliquer</button></div>
        </div>
        <aside class="space-y-4 lg:sticky lg:top-24 self-start">
          <div class="card-dark p-5">
            <p class="t-caption text-gold">Récapitulatif</p>
            ${UI.row("Distance", M().fmtKm(trip.km))}${UI.row("Durée estimée", "≈ " + M().fmtEta(etaSec(trip.km)))}${UI.row("Tarif", v.label)}
            ${trip.promo ? UI.row("Code promo", "-" + ACStore.fmtFCFA(trip.promo)) : ""}
            <div class="divider border-white/15 my-2"></div>
            <div class="flex items-center justify-between"><span class="t-title">Prix de la course</span><span class="t-h2">${ACStore.fmtFCFA(Math.max(FARE.min, trip.price - (trip.promo || 0)))}</span></div>
            <p class="t-small text-white/60 mt-2">Prix fixe calculé sur l'itinéraire routier. Pas de surprise à l'arrivée.</p>
          </div>
          ${UI.primaryButton("Confirmer la course", "Screens._transportRequest()", { size: "lg", iconRight: "arrow_forward" })}
          <p class="t-small text-ink-3 text-center">Annulation gratuite avant l'arrivée du chauffeur.</p>
        </aside>
      </div>`;
    Shell.render(container, { title: "Confirmation", subtitle: "Vérifiez votre course", back: true, body, nav: false, onMount: () => {
      const m = M().create("cf-map", { interactive: false, zoomControl: false });
      if (!m) return;
      m.setPin("from", [trip.from.lat, trip.from.lng]); m.setPin("to", [trip.to.lat, trip.to.lng]);
      const coords = trip.route && trip.route.key === routeKey() ? trip.route.coords : [[trip.from.lat, trip.from.lng], [trip.to.lat, trip.to.lng]];
      m.drawRoute(coords); m.fit(coords, { paddingTopLeft: [30, 30], paddingBottomRight: [30, 30] });
    } });
  };
  Screens._tripMethod = function (type) { trip.method = type; syncTrip(); App.replace("transportConfirm"); };
  Screens._applyPromo = function () { const v = (document.getElementById("promo").value || "").trim().toUpperCase(); if (v === "YOUSS10") { trip.promo = Math.round(trip.price * 0.1 / 100) * 100; UI.toast("Code appliqué : -10 %", "success"); App.replace("transportConfirm"); } else UI.toast("Code promo inconnu (essayez YOUSS10).", "error"); };

  Screens._transportRequest = function () {
    trip.status = "searching"; trip.driver = null; syncTrip();
    App.nav("transportSearching");
  };

  /* ---------- Recherche ---------- */
  Screens.transportSearching = function (container) {
    if (!trip.to) { App.resetTo("transport"); return; }
    const body = `<div class="flex-1 flex flex-col items-center justify-center text-center py-16 max-w-narrow mx-auto">
      <div class="relative w-32 h-32 rounded-full bg-gold/10 flex items-center justify-center"><div class="absolute inset-0 rounded-full animate-pulse-ring"></div><div class="absolute inset-4 rounded-full border-2 border-gold/30 animate-ping"></div>${icon(vehicleOf().icon, "text-gold text-[52px]")}</div>
      <h2 class="t-h1 mt-8">Recherche d'un chauffeur…</h2>
      <p class="t-body text-ink-2 mt-2 max-w-[320px]">${esc(trip.from.name)} → ${esc(trip.to.name)}${trip.km ? " · " + M().fmtKm(trip.km) : ""}</p>
      <p id="search-status" class="t-small text-ink-3 mt-6">Envoi de la demande aux chauffeurs ${vehicleOf().label.toLowerCase()} à proximité…</p>
      <button type="button" onclick="Screens._cancelSearch()" class="btn btn-outline mt-10">Annuler la demande</button>
    </div>`;
    Shell.render(container, { title: "Recherche", back: "App.nav('transportConfirm')", body, nav: false, hideSearch: true });
    const msgs = ["3 chauffeurs contactés…", "Un chauffeur a accepté. Vérification…"];
    msgs.forEach((m, i) => setTimeout(() => { const el = document.getElementById("search-status"); if (el && App.current.id === "transportSearching") el.textContent = m; }, 900 * (i + 1)));
    setTimeout(() => { if (App.current && App.current.id === "transportSearching") { Screens._transportAssignDriver(); App.replace("transportDriverFound"); } }, 2600);
  };
  Screens._cancelSearch = function () { trip.status = "idle"; syncTrip(); UI.toast("Demande annulée. Aucun montant débité.", "info"); App.resetTo("transport"); };
  Screens._transportAssignDriver = function () {
    const d = YCData.driverFor(ACState.user.city, trip.vehicle === "premium" ? "premium" : trip.vehicle);
    trip.driver = Object.assign({}, d, { car: trip.vehicle === "moto" && d.vehicle !== "moto" ? "Honda CG 125 · Noire" : d.car, etaMin: trip.vehicle === "moto" ? 2 : trip.vehicle === "premium" ? 6 : 4 });
    trip.status = "assigned"; trip.startedAt = Date.now(); syncTrip();
    ACStore.addNotification("Chauffeur trouvé", trip.driver.name + " arrive dans " + trip.driver.etaMin + " min · " + trip.driver.car + " · " + trip.driver.plate, "transport", "transportDriverFound");
    ACStore.emit();
  };

  /* ---------- Chauffeur trouvé ---------- */
  Screens.transportDriverFound = function (container) {
    if (!trip.driver) { App.resetTo("transport"); return; }
    const d = trip.driver;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      ${UI.successHero({ icon: "verified", title: "Chauffeur trouvé", body: "Votre chauffeur arrive. Vous recevrez une notification à son arrivée." })}
      <div class="card p-5 flex flex-col items-center text-center">
        ${UI.avatar(d, "w-24 h-24")}
        <h3 class="t-h2 mt-3">${esc(d.name)}</h3>
        <p class="t-small text-ink-2 mt-0.5">${UI.rating(d.rating, d.rides + " courses")} · membre vérifié</p>
        <div class="grid grid-cols-3 gap-2 w-full mt-5">
          <div class="rounded-xl bg-surface-low p-3"><p class="t-caption text-ink-3">Véhicule</p><p class="t-small font-bold mt-0.5">${esc(d.car)}</p></div>
          <div class="rounded-xl bg-surface-low p-3"><p class="t-caption text-ink-3">Plaque</p><p class="t-small font-bold mt-0.5 tracking-wider">${esc(d.plate)}</p></div>
          <div class="rounded-xl bg-gold-soft p-3"><p class="t-caption text-gold-deep">Arrivée</p><p class="t-small font-bold mt-0.5 text-gold-deep" id="df-eta">${d.etaMin} min</p></div>
        </div>
        <div class="flex gap-2 w-full mt-4">
          <a href="tel:${esc(d.phone)}" class="btn btn-outline flex-1">${icon("call", "text-[20px]")}${I18N.t("call")}</a>
          <button type="button" onclick="Screens._tripChat()" class="btn btn-outline flex-1">${icon("chat", "text-[20px]")}${I18N.t("message")}</button>
        </div>
      </div>
      <div class="card p-4 space-y-2">${UI.row("Trajet", esc(trip.from.name.split("(")[0]) + " → " + esc(trip.to.name.split("(")[0]))}${UI.row("Prix", ACStore.fmtFCFA(Math.max(FARE.min, trip.price - (trip.promo || 0))), true)}${UI.row("Paiement", (ACState.paymentMethods.find((m) => m.type === trip.method) || {}).label || "Youss Wallet")}</div>
      ${UI.primaryButton("Suivre la course", "App.replace('transportInRide')", { size: "lg", icon: "near_me" })}
      <button type="button" onclick="Screens._cancelRide()" class="w-full t-small text-danger font-semibold py-2">Annuler la course</button>
    </div>`;
    Shell.render(container, { title: "Chauffeur trouvé", back: "App.nav('home')", body, nav: false, hideSearch: true });
    let left = d.etaMin * 60 - 20;
    const tick = setInterval(() => { const el = document.getElementById("df-eta"); if (!el || App.current.id !== "transportDriverFound") { clearInterval(tick); return; } left -= 7; el.textContent = M().fmtEta(left); }, 1000);
  };
  Screens._cancelRide = function () {
    UI.confirm({ title: "Annuler la course ?", body: "L'annulation est gratuite avant l'arrivée du chauffeur.", okLabel: "Annuler la course", danger: true, icon: "cancel", onOk: "Screens._cancelSearch()" });
  };

  /* ---------- Messagerie ---------- */
  Screens._tripChat = function () {
    const d = trip.driver || {};
    const canned = ["Je suis au point de départ", "J'arrive dans 2 minutes", "Pouvez-vous m'attendre ?", "Appelez-moi en arrivant"];
    UI.openSheet(`<div class="flex items-center gap-3 mb-4">${UI.avatar(d, "w-11 h-11")}<div><p class="t-title">${esc(d.name || "Chauffeur")}</p><p class="t-small text-success font-semibold">En ligne</p></div></div>
      <div id="chat-log" class="space-y-2 max-h-[260px] overflow-y-auto mb-3">
        <div class="max-w-[80%] rounded-2xl rounded-bl-md bg-surface-low p-3 t-small">Bonjour ${esc(ACState.user.name)}, je suis en route. ${esc((d.car || "").split("·")[0])}</div>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">${canned.map((c) => `<button type="button" onclick="Screens._chatSend(${UI.js(c)})" class="chip">${c}</button>`).join("")}</div>
      <form onsubmit="event.preventDefault();Screens._chatSend(document.getElementById('chat-input').value)" class="flex gap-2 mt-2"><input id="chat-input" class="input flex-1" placeholder="Votre message…"/><button type="submit" class="btn btn-primary !w-12 !px-0" aria-label="Envoyer">${icon("send")}</button></form>`);
  };
  Screens._chatSend = function (text) {
    text = (text || "").trim(); if (!text) return;
    const log = document.getElementById("chat-log"); const input = document.getElementById("chat-input"); if (input) input.value = "";
    if (!log) return;
    log.insertAdjacentHTML("beforeend", `<div class="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-inverse text-inverse-ink p-3 t-small">${esc(text)}</div>`);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => { if (!document.getElementById("chat-log")) return; log.insertAdjacentHTML("beforeend", `<div class="max-w-[80%] rounded-2xl rounded-bl-md bg-surface-low p-3 t-small">D'accord, à tout de suite 👍</div>`); log.scrollTop = log.scrollHeight; }, 900);
  };

  /* ---------- Suivi en course ---------- */
  Screens.transportInRide = function (container) {
    if (!trip.driver || !trip.to) { App.resetTo("transport"); return; }
    const d = trip.driver;
    updateDistance();
    const sheet = `
      <div class="p-4 lg:p-6 space-y-4">
        <div class="flex items-center justify-between gap-3"><span class="badge badge-gold" id="ride-chip">${icon("verified_user", "text-[14px]")}Chauffeur en route</span><button type="button" onclick="App.nav('sos')" class="btn btn-sm btn-danger !rounded-full">SOS</button></div>
        <div>
          <div class="flex items-end justify-between gap-3"><div><p class="t-small text-ink-2" id="ride-label">${esc(d.name.split(" ")[0])} arrive</p><p class="t-h1 text-gold-deep dark:text-gold leading-none" id="ride-eta">…</p></div><div class="text-right"><p class="t-small text-ink-2 truncate" id="ride-meta">${M().fmtKm(trip.km)} · ${esc(trip.to.name.split("(")[0])}</p><p class="t-small font-semibold" id="ride-arrival"></p></div></div>
          <div class="h-1.5 rounded-full bg-card-high overflow-hidden mt-3"><div id="ride-progress" class="h-full rounded-full bg-gold transition-[width] duration-200" style="width:0%"></div></div>
        </div>
        <div class="flex items-center gap-3">${UI.avatar(d, "w-12 h-12")}<div class="flex-1 min-w-0"><p class="t-title truncate">${esc(d.name)} · ★ ${d.rating}</p><p class="t-small text-ink-2 truncate">${esc(d.car)} · ${esc(d.plate)}</p></div>
          <a href="tel:${esc(d.phone)}" class="icon-btn" aria-label="Appeler">${icon("call")}</a><button type="button" onclick="Screens._tripChat()" class="icon-btn" aria-label="Message">${icon("chat")}</button><button type="button" onclick="Screens._shareRide()" class="icon-btn" aria-label="Partager">${icon("share")}</button></div>
        <div class="flex items-center justify-between"><span class="t-body text-ink-2">Montant</span><span class="t-title font-extrabold">${ACStore.fmtFCFA(Math.max(FARE.min, trip.price - (trip.promo || 0)))}</span></div>
        <button type="button" id="finish-btn" onclick="Screens._transportFinish()" class="btn btn-lg btn-dark btn-block">Terminer la course</button>
      </div>`;
    const body = `<div class="flex-1 min-h-0 relative lg:grid lg:grid-cols-[440px_1fr]">
      <aside id="tr-sheet" class="absolute bottom-0 inset-x-0 z-20 bg-card rounded-t-3xl shadow-float lg:static lg:rounded-none lg:shadow-none lg:border-r lg:border-line lg:h-full lg:overflow-y-auto"><div class="w-10 h-1.5 bg-line rounded-full mx-auto mt-2 lg:hidden"></div>${sheet}</aside>
      <div class="absolute inset-0 lg:static lg:h-full"><div id="ride-map" class="absolute inset-0 lg:relative lg:h-full w-full"></div></div>
    </div>`;
    Shell.render(container, { title: "Suivi de la course", back: "App.nav('home')", body, nav: false, fill: true, hideSearch: true, onMount: startRide });
  };
  function setRideUI(o) {
    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.textContent = v; };
    set("ride-label", o.label); set("ride-eta", o.title); set("ride-meta", o.meta); set("ride-arrival", o.arrival);
    const bar = document.getElementById("ride-progress"); if (bar && o.progress != null) bar.style.width = Math.round(o.progress * 100) + "%";
    const chip = document.getElementById("ride-chip"); if (chip && o.chip) chip.innerHTML = icon("verified_user", "text-[14px]") + o.chip;
  }
  function startRide() {
    map = M().create("ride-map", { interactive: true, zoomControl: false });
    if (!map) return;
    const first = trip.driver.name.split(" ")[0];
    const kind = trip.vehicle === "moto" ? "moto" : "car";
    map.setPin("from", [trip.from.lat, trip.from.lng], trip.from.name); map.setPin("to", [trip.to.lat, trip.to.lng], trip.to.name);
    const brg = M().bearingDeg(trip.from.lat, trip.from.lng, trip.to.lat, trip.to.lng);
    const start = M().destinationPoint(trip.from.lat, trip.from.lng, (brg + 150) % 360, 1.1);
    setRideUI({ label: first + " arrive", title: "…", meta: "Calcul de l'itinéraire du chauffeur…", progress: 0, chip: "Chauffeur en route" });
    Promise.all([M().fetchRoute(start, trip.from), loadRoute()]).then(([approach]) => {
      if (!map || !App.current || App.current.id !== "transportInRide") return;
      const rideCoords = (trip.route && trip.route.coords) || [[trip.from.lat, trip.from.lng], [trip.to.lat, trip.to.lng]];
      map.map && L.polyline(rideCoords, { color: "#0A0A0A", weight: 5, opacity: 0.3, dashArray: "6 10" }).addTo(map.map);
      map.drawRoute(approach.coords, { color: "#C9A227", weight: 5, opacity: 0.9, dashArray: "1 8" });
      map.fit(approach.coords.concat([[trip.from.lat, trip.from.lng]]), fitPad());
      map.animate(approach.coords, {
        visualSec: trip.fastDemo ? 6 : 20, realSec: Math.max(90, approach.sec), kind,
        onTick: (t, km, sec) => setRideUI({ title: M().fmtEta(sec), meta: first + " est à " + M().fmtKm(km) + " · " + trip.driver.car.split("·")[0], arrival: "Prise en charge " + M().clockIn(sec), progress: t }),
        onDone: () => {
          UI.toast(first + " est arrivé au point de départ", "success");
          if (navigator.vibrate) { try { navigator.vibrate([40, 60, 40]); } catch (e) { /* no-op */ } }
          setRideUI({ label: "Chauffeur sur place", title: "Départ imminent", meta: "Installez-vous, la course démarre…", arrival: "", progress: 1, chip: "Prise en charge" });
          map.after(2000, () => {
            if (!map || App.current.id !== "transportInRide") return;
            map.clearVehicle();
            const total = trip.km || 1, real = etaSec(total), visual = trip.fastDemo ? 10 : Math.min(80, Math.max(30, total * 7));
            map.drawRoute(rideCoords); map.fit(rideCoords, fitPad());
            setRideUI({ label: "Temps restant", chip: "En course", progress: 0 });
            trip.status = "riding"; syncTrip();
            map.animate(rideCoords, {
              visualSec: visual, realSec: real, kind,
              onTick: (t, km, sec) => setRideUI({ title: t >= 1 ? "Arrivé" : M().fmtEta(sec), meta: t >= 1 ? "Destination atteinte" : M().fmtKm(km) + " restants · " + trip.to.name.split("(")[0], arrival: t >= 1 ? "" : "Arrivée prévue " + M().clockIn(sec), progress: t }),
              onDone: () => { setRideUI({ label: "Course terminée", chip: "Arrivé" }); trip.status = "arrived"; syncTrip(); UI.toast("Vous êtes arrivé à destination", "success"); const b = document.getElementById("finish-btn"); if (b) b.classList.add("btn-primary"); }
            });
          });
        }
      });
    });
  }
  Screens._shareRide = function () {
    const text = "Je suis en course YOUSS CONNECT avec " + trip.driver.name + " (" + trip.driver.plate + ") vers " + trip.to.name + ".";
    if (navigator.share) navigator.share({ title: "Ma course YOUSS CONNECT", text }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => UI.toast("Lien de suivi copié.", "success")); else UI.toast("Lien de suivi partagé.", "success");
  };
  Screens._transportMarkArrived = function () { trip.status = "arrived"; trip.fastDemo = true; syncTrip(); };
  Screens._transportFinish = function () { trip.status = "arrived"; syncTrip(); App.nav("transportEnd"); };

  /* ---------- Fin de course ---------- */
  Screens.transportEnd = function (container) {
    if (!trip.driver) { App.resetTo("transport"); return; }
    const d = trip.driver;
    const total = Math.max(FARE.min, trip.price - (trip.promo || 0));
    const durationMin = Math.max(3, Math.round(etaSec(trip.km) / 60));
    const method = ACState.paymentMethods.find((m) => m.type === trip.method) || ACState.paymentMethods[0];
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      ${UI.successHero({ icon: "flag", title: "Course terminée", body: "Merci d'avoir voyagé avec YOUSS CONNECT." })}
      <div class="card p-5">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="rounded-xl bg-surface-low p-3"><p class="t-caption text-ink-3">Prix</p><p class="t-h3 mt-0.5">${ACStore.fmtFCFA(total)}</p></div>
          <div class="rounded-xl bg-surface-low p-3"><p class="t-caption text-ink-3">Durée</p><p class="t-h3 mt-0.5">${durationMin} min</p></div>
          <div class="rounded-xl bg-surface-low p-3"><p class="t-caption text-ink-3">Distance</p><p class="t-h3 mt-0.5">${M().fmtKm(trip.km)}</p></div>
        </div>
        <div class="mt-4 space-y-1">${UI.row("Départ", esc(trip.from.name.split("(")[0]))}${UI.row("Arrivée", esc(trip.to.name.split("(")[0]))}${UI.row("Véhicule", vehicleOf().label + " · " + esc(d.car))}${UI.row("Paiement", method.label)}</div>
      </div>
      <div class="card p-5 text-center">
        <div class="flex items-center justify-center gap-3 mb-3">${UI.avatar(d, "w-12 h-12")}<div class="text-left"><p class="t-title">${esc(d.name)}</p><p class="t-small text-ink-2">Comment s'est passée votre course ?</p></div></div>
        <div class="flex justify-center gap-1.5">${[1, 2, 3, 4, 5].map((i) => `<button type="button" onclick="Screens._setRating(${i})" class="p-1" aria-label="${i} étoiles">${icon("star", "text-[36px] " + (i <= trip.rating ? "text-gold" : "text-line"), i <= trip.rating)}</button>`).join("")}</div>
        <div class="flex flex-wrap justify-center gap-2 mt-3">${["Conduite prudente", "Ponctuel", "Véhicule propre", "Sympathique"].map((c) => `<button type="button" onclick="Screens._ratingTag(this)" class="chip chip-gold">${c}</button>`).join("")}</div>
        <textarea id="ride-comment" class="textarea mt-3" placeholder="Un commentaire (optionnel)">${esc(trip.comment || "")}</textarea>
        <div class="flex items-center justify-center gap-2 mt-3"><span class="t-small text-ink-2">Pourboire :</span>${[0, 200, 500, 1000].map((v) => `<button type="button" onclick="Screens._setTip(${v})" class="chip ${(trip.tip || 0) === v ? "on" : ""}">${v ? ACStore.fmtFCFA(v) : "Aucun"}</button>`).join("")}</div>
      </div>
      ${UI.primaryButton((trip.method === "cash" ? "Terminer · payé en espèces " : "Payer ") + ACStore.fmtFCFA(total + (trip.tip || 0)), "Screens._transportPay()", { size: "lg", icon: trip.method === "cash" ? "check" : "account_balance_wallet" })}
    </div>`;
    Shell.render(container, { title: "Fin de course", back: "App.nav('home')", body, nav: false, hideSearch: true });
  };
  Screens._setRating = function (v) { trip.rating = v; trip.comment = (document.getElementById("ride-comment") || {}).value || ""; App.replace("transportEnd"); };
  Screens._setTip = function (v) { trip.tip = v; trip.comment = (document.getElementById("ride-comment") || {}).value || ""; App.replace("transportEnd"); };
  Screens._ratingTag = function (btn) { btn.classList.toggle("on"); };
  Screens._transportPay = function () {
    const total = Math.max(FARE.min, trip.price - (trip.promo || 0)) + (trip.tip || 0);
    trip.comment = (document.getElementById("ride-comment") || {}).value || "";
    const dest = trip.to.name.split("(")[0].trim();
    ACStore.whenPaid(ACStore.pay({
      amount: total, label: "Course · " + dest, service: "transport", pointsEarned: 25, method: trip.method,
      meta: { from: trip.from.name, to: trip.to.name, km: String(trip.km || "") },
      activity: { detail: { from: trip.from.name, to: trip.to.name, km: trip.km, driver: trip.driver.name, rating: trip.rating, vehicle: vehicleOf().label, duration: Math.round(etaSec(trip.km) / 60) } }
    }), function () {
      const city = ACState.user.city;
      trip.status = "done"; trip.driver = null; trip.promo = 0; trip.tip = 0; trip.fastDemo = false; syncTrip();
      const rest = YCData.nearby(trip.to.lat, trip.to.lng, YCData.restaurantsIn(city), 1)[0];
      App.resetTo("paymentSuccess", { amount: total, title: "Course payée", body: "+25 points Youss Bonus ajoutés. Merci " + ACState.user.name + " !", next: "transport", rest: rest ? rest.id : "" });
    }, function (res) { App.nav("paymentFailed", { retry: "transportEnd", amount: total, reason: res.reason }); });
  };

  /* ---------- SOS (partagé avec Sécurité) ---------- */
  Screens.sos = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full flex-1 flex flex-col items-center justify-center text-center py-8 space-y-5">
      <div class="w-24 h-24 rounded-full bg-danger-soft text-danger flex items-center justify-center animate-pulse-ring">${icon("sos", "text-[44px]")}</div>
      <h2 class="t-h1">Besoin d'aide immédiate ?</h2>
      <p class="t-body text-ink-2 max-w-[360px]">Votre position${trip.driver ? ", les détails de votre course et l'identité du chauffeur" : ""} seront partagés avec l'assistance YOUSS CONNECT et vos contacts de confiance.</p>
      <div class="w-full space-y-3">
        ${UI.button("Alerter l'assistance YOUSS CONNECT", "Screens._sosAlert()", { variant: "danger", size: "lg", icon: "campaign" })}
        <a href="tel:117" class="btn btn-outline btn-lg btn-block">${icon("call")}Appeler les secours</a>
        ${UI.secondaryButton("Partager ma position", "Screens._shareRide()", { icon: "share" })}
        <button type="button" onclick="App.back()" class="w-full t-small text-ink-2 py-2">Retour</button>
      </div></div>`;
    Shell.render(container, { title: "Assistance SOS", back: true, body, nav: false, hideSearch: true });
  };
  Screens._sosAlert = function () {
    ACStore.addNotification("Alerte SOS envoyée", "L'assistance YOUSS CONNECT a été notifiée et vous rappelle immédiatement.", "transport", "security");
    ACStore.emit(); UI.toast("Assistance alertée. Restez en ligne.", "success"); App.back();
  };

  Screens.transportEstimate = Screens.transport;
})();
