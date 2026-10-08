(function () {
  "use strict";
  window.Screens = window.Screens || {};

  /* Points d'intérêt réels du Bénin */
  const POIS = [
    { id: "haie-vive", name: "Haie Vive", lat: 6.3570, lng: 2.3910 },
    { id: "aeroport", name: "Aéroport de Cotonou (Gantin)", lat: 6.3572, lng: 2.3844 },
    { id: "dantokpa", name: "Marché Dantokpa", lat: 6.3705, lng: 2.4335 },
    { id: "amazone", name: "Place de l'Amazone", lat: 6.3654, lng: 2.4183 },
    { id: "ganvie", name: "Ganvié", lat: 6.4667, lng: 2.4167 },
    { id: "ouidah", name: "Ouidah · Porte du Non-Retour", lat: 6.3167, lng: 2.0833 },
    { id: "abomey", name: "Abomey · Palais royaux", lat: 7.1829, lng: 1.9912 },
    { id: "porto-novo", name: "Porto-Novo", lat: 6.4969, lng: 2.6283 },
    { id: "parakou", name: "Parakou", lat: 9.3372, lng: 2.6303 }
  ];

  /* Villes affichées sur la vue pays */
  const CITIES = [
    { name: "Cotonou", lat: 6.3703, lng: 2.3912 },
    { name: "Porto-Novo", lat: 6.4969, lng: 2.6283 },
    { name: "Ouidah", lat: 6.3667, lng: 2.0833 },
    { name: "Abomey", lat: 7.1829, lng: 1.9912 },
    { name: "Bohicon", lat: 7.1782, lng: 2.0667 },
    { name: "Lokossa", lat: 6.6383, lng: 1.7167 },
    { name: "Savalou", lat: 7.9281, lng: 1.9756 },
    { name: "Parakou", lat: 9.3372, lng: 2.6303 },
    { name: "Djougou", lat: 9.7085, lng: 1.6660 },
    { name: "Natitingou", lat: 10.3042, lng: 1.3796 },
    { name: "Kandi", lat: 11.1342, lng: 2.9386 },
    { name: "Malanville", lat: 11.8681, lng: 3.3833 }
  ];

  /* Frontière du Bénin (simplifiée, source OpenStreetMap/Nominatim) */
  const BENIN_BORDER = [[10.377,0.777],[9.995,1.355],[9.647,1.374],[9.542,1.338],[9.486,1.361],[9.488,1.391],[9.321,1.417],[9.17,1.567],[9.015,1.625],[8.548,1.625],[8.492,1.661],[8.369,1.613],[8.358,1.635],[7.532,1.656],[6.996,1.642],[6.997,1.559],[6.905,1.606],[6.799,1.594],[6.761,1.625],[6.688,1.575],[6.651,1.616],[6.613,1.610],[6.555,1.698],[6.504,1.694],[6.475,1.753],[6.289,1.809],[6.242,1.630],[6.040,1.673],[6.133,2.172],[6.178,2.738],[6.512,2.705],[6.570,2.751],[6.637,2.729],[6.748,2.792],[6.784,2.735],[6.926,2.742],[6.951,2.713],[7.043,2.761],[7.105,2.740],[7.133,2.773],[7.424,2.745],[7.438,2.796],[7.497,2.792],[7.546,2.737],[7.612,2.717],[7.767,2.734],[7.882,2.677],[8.188,2.755],[8.321,2.693],[8.422,2.708],[8.449,2.750],[8.524,2.769],[8.784,2.729],[8.812,2.766],[9.067,2.780],[9.102,3.088],[9.284,3.158],[9.441,3.133],[9.659,3.267],[9.659,3.314],[9.703,3.358],[9.806,3.332],[9.871,3.463],[9.862,3.520],[9.957,3.598],[10.079,3.614],[10.114,3.663],[10.177,3.679],[10.212,3.608],[10.272,3.577],[10.412,3.602],[10.462,3.683],[10.408,3.782],[10.433,3.802],[10.594,3.845],[10.686,3.837],[10.817,3.746],[10.924,3.770],[11.027,3.725],[11.133,3.725],[11.129,3.694],[11.438,3.476],[11.575,3.525],[11.694,3.609],[11.729,3.552],[11.775,3.565],[11.787,3.522],[11.858,3.485],[11.89,3.312],[12.016,3.269],[12.406,2.840],[12.351,2.762],[12.363,2.734],[12.279,2.685],[12.306,2.669],[12.303,2.598],[12.254,2.388],[12.112,2.391],[11.980,2.465],[11.931,2.392],[11.875,2.404],[11.791,2.376],[11.734,2.305],[11.680,2.315],[11.419,1.997],[11.408,1.917],[11.450,1.847],[11.393,1.624],[11.478,1.554],[11.451,1.531],[11.481,1.448],[11.444,1.388],[11.389,1.382],[11.367,1.327],[11.293,1.333],[11.327,1.269],[11.250,1.263],[11.279,1.146],[11.248,1.130],[11.170,1.165],[11.177,1.117],[11.132,1.050],[11.121,1.087],[11.032,1.115],[11.094,0.987],[11.035,0.945],[10.992,0.978],[10.996,0.912],[10.800,0.879],[10.714,0.802],[10.377,0.777]];

  const COTONOU = { lat: 6.3703, lng: 2.3912, zoom: 12 };
  const BENIN = { lat: 9.3, lng: 2.3, zoom: 7 };

  /* Tarification (démo) : base + prix au km routier */
  const FARE = { base: 1500, perKm: 350, min: 2000 };
  const VEHICLES = [
    { id: "moto", label: "Moto", icon: "two_wheeler", mult: 0.65, etaMult: 0.7, avail: "2 min" },
    { id: "car", label: "Voiture", icon: "directions_car", mult: 1, etaMult: 1, avail: "5 min" },
    { id: "premium", label: "Premium", icon: "airport_shuttle", mult: 1.55, etaMult: 0.95, avail: "8 min" }
  ];
  const URBAN_SPEED_KMH = 27;

  const trip = {
    from: POIS[0].name,
    to: POIS[1].name,
    fromLat: POIS[0].lat,
    fromLng: POIS[0].lng,
    toLat: POIS[1].lat,
    toLng: POIS[1].lng,
    km: 0,
    vehicle: "car",
    sec: 0,
    route: null,       /* { key, coords:[[lat,lng]], km, sec, real } */
    pickMode: "from",
    price: 3800,
    driver: null
  };

  let mapInst = null;
  let fromMarker = null;
  let toMarker = null;
  let routeLine = null;
  let doneLine = null;
  let userMarker = null;
  let carMarker = null;
  let beninLayer = null;
  let cityLayer = null;
  let mapInteractive = true;
  let animRaf = null;
  let phaseTimer = null;
  let geoWatchId = null;
  let routeReqId = 0;
  let routeInflight = null;
  const routeCache = {};
  const userPos = { lat: null, lng: null, ok: false };

  /* ---------- Itinéraire routier réel (OSRM, sans clé) ---------- */
  function routeKeyFor(aLat, aLng, bLat, bLng) {
    return [aLat, aLng, bLat, bLng].map((v) => Number(v).toFixed(5)).join("|");
  }

  function straightRoute(aLat, aLng, bLat, bLng) {
    const km = haversineKm(aLat, aLng, bLat, bLng) * 1.3; /* détour routier moyen */
    return { coords: [[aLat, aLng], [bLat, bLng]], km, sec: (km / URBAN_SPEED_KMH) * 3600, real: false };
  }

  function fetchRoute(aLat, aLng, bLat, bLng) {
    const key = routeKeyFor(aLat, aLng, bLat, bLng);
    if (routeCache[key]) return Promise.resolve(routeCache[key]);
    if (!navigator.onLine) return Promise.resolve(Object.assign({ key }, straightRoute(aLat, aLng, bLat, bLng)));
    const url = "https://router.project-osrm.org/route/v1/driving/" +
      aLng + "," + aLat + ";" + bLng + "," + bLat + "?overview=full&geometries=geojson&alternatives=false&steps=false";
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then((r) => r.json())
      .then((j) => {
        if (!j || j.code !== "Ok" || !j.routes || !j.routes.length) throw new Error("no route");
        const r = j.routes[0];
        const res = {
          key,
          coords: r.geometry.coordinates.map((c) => [c[1], c[0]]),
          km: r.distance / 1000,
          sec: r.duration * 1.15, /* trafic urbain */
          real: true
        };
        routeCache[key] = res;
        return res;
      })
      .catch(() => Object.assign({ key }, straightRoute(aLat, aLng, bLat, bLng)))
      .finally(() => { if (timer) clearTimeout(timer); });
  }

  function pathCumulative(coords) {
    const cum = [0];
    for (let i = 1; i < coords.length; i++) {
      cum.push(cum[i - 1] + haversineKm(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]));
    }
    return cum;
  }

  /* Position + cap à une fraction t (0..1) du tracé */
  function pointAlong(coords, cum, t) {
    const total = cum[cum.length - 1] || 0;
    if (coords.length < 2 || total === 0) {
      const p = coords[coords.length - 1] || [0, 0];
      return { lat: p[0], lng: p[1], bearing: 0, index: coords.length - 1 };
    }
    const target = Math.min(total, Math.max(0, t * total));
    let i = 1;
    while (i < cum.length - 1 && cum[i] < target) i++;
    const segLen = cum[i] - cum[i - 1] || 1e-9;
    const f = (target - cum[i - 1]) / segLen;
    const a = coords[i - 1];
    const b = coords[i];
    return {
      lat: lerp(a[0], b[0], f),
      lng: lerp(a[1], b[1], f),
      bearing: bearingDeg(a[0], a[1], b[0], b[1]),
      index: i
    };
  }

  /* Point situé à `km` d'un lieu selon un cap (pour positionner le chauffeur) */
  function destinationPoint(lat, lng, bearing, km) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const br = toRad(bearing);
    const la1 = toRad(lat);
    const lo1 = toRad(lng);
    const d = km / R;
    const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(br));
    const lo2 = lo1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
    return { lat: toDeg(la2), lng: toDeg(lo2) };
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function currentRouteKey() {
    if (trip.fromLat == null || trip.toLat == null) return null;
    return routeKeyFor(trip.fromLat, trip.fromLng, trip.toLat, trip.toLng);
  }

  /* Distance du trajet : routière si l'itinéraire est connu, sinon estimation */
  function updateTripDistance() {
    if (trip.fromLat == null || trip.toLat == null) {
      trip.km = 0;
      trip.sec = 0;
      return 0;
    }
    const key = currentRouteKey();
    if (trip.route && trip.route.key === key) {
      trip.km = Math.round(trip.route.km * 10) / 10;
      trip.sec = trip.route.sec;
    } else {
      const est = straightRoute(trip.fromLat, trip.fromLng, trip.toLat, trip.toLng);
      trip.km = Math.round(est.km * 10) / 10;
      trip.sec = est.sec;
    }
    return trip.km;
  }

  function vehicleOf() {
    return VEHICLES.find(function (v) { return v.id === trip.vehicle; }) || VEHICLES[1];
  }

  function priceFromDistance() {
    const km = updateTripDistance() || 5;
    const v = vehicleOf();
    const base = Math.max(FARE.min, Math.round((FARE.base + km * FARE.perKm) / 100) * 100);
    return Math.round((base * v.mult) / 100) * 100;
  }

  function fmtKm(km) {
    return (Math.round((km || 0) * 10) / 10).toFixed(1).replace(".", ",") + " km";
  }

  function destroyMap() {
    stopRideAnimation();
    stopGeoWatch();
    if (mapInst) {
      try { mapInst.stop(); } catch (e) { /* no-op */ }
      mapInst.off();
      try { mapInst.remove(); } catch (e) { /* déjà détaché du DOM */ }
      mapInst = null;
    }
    fromMarker = null;
    toMarker = null;
    routeLine = null;
    doneLine = null;
    userMarker = null;
    carMarker = null;
    beninLayer = null;
    cityLayer = null;
  }

  function stopRideAnimation() {
    if (animRaf) {
      cancelAnimationFrame(animRaf);
      animRaf = null;
    }
    if (phaseTimer) {
      clearTimeout(phaseTimer);
      phaseTimer = null;
    }
  }

  function stopGeoWatch() {
    if (geoWatchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(geoWatchId);
      geoWatchId = null;
    }
  }

  function pinIcon(role) {
    const isFrom = role === "from";
    const cls = isFrom ? "yc-map-pin--from" : "yc-map-pin--to";
    const letter = isFrom ? "A" : "B";
    return L.divIcon({
      className: "",
      html: `<div class="yc-map-pin ${cls}" aria-label="${isFrom ? "Départ" : "Destination"}">
        <span class="yc-map-pin__head">${letter}</span>
        <span class="yc-map-pin__tip"></span>
        <span class="yc-map-pin__pulse"></span>
      </div>`,
      iconSize: [40, 52],
      iconAnchor: [20, 50],
      popupAnchor: [0, -44]
    });
  }

  function userIcon() {
    return L.divIcon({
      className: "",
      html: `<span class="yc-map-user"></span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
  }

  /* Voiture vue du dessus (SVG), orientée selon le cap */
  function carIcon(bearing) {
    const rot = Math.round(bearing || 0);
    return L.divIcon({
      className: "",
      html: `<div class="yc-car-icon" style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;transform:rotate(${rot}deg)">
        <svg width="26" height="44" viewBox="0 0 26 44" style="filter:drop-shadow(0 3px 5px rgba(0,0,0,.45))">
          <rect x="3" y="2" width="20" height="40" rx="7" fill="#0A0A0A"/>
          <rect x="4.5" y="3.5" width="17" height="37" rx="6" fill="#171717"/>
          <rect x="6" y="10" width="14" height="9" rx="2.5" fill="#F4E4B3" opacity=".95"/>
          <rect x="6" y="26" width="14" height="7" rx="2.5" fill="#C9A227" opacity=".85"/>
          <rect x="7" y="4" width="4" height="3" rx="1" fill="#F4E4B3"/>
          <rect x="15" y="4" width="4" height="3" rx="1" fill="#F4E4B3"/>
          <rect x="7" y="38" width="4" height="2.5" rx="1" fill="#52525B"/>
          <rect x="15" y="38" width="4" height="2.5" rx="1" fill="#52525B"/>
        </svg>
      </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
  }

  function driverStartIcon() {
    return L.divIcon({
      className: "",
      html: `<span style="display:block;width:12px;height:12px;border-radius:50%;background:#fff;border:3px solid #C9A227;box-shadow:0 1px 4px rgba(0,0,0,.3)"></span>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  }

  function bearingDeg(lat1, lng1, lat2, lng2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* Temps restant en minutes (comme Google Maps / Uber) */
  function formatEta(totalSec) {
    const s = Math.max(0, Math.round(totalSec));
    if (s < 60) return "< 1 min";
    const m = Math.ceil(s / 60);
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const r = m % 60;
      return h + " h" + (r ? " " + String(r).padStart(2, "0") : "");
    }
    return m + " min";
  }

  function arrivalClock(remainSec) {
    const d = new Date(Date.now() + Math.max(0, remainSec) * 1000);
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  function etaSecondsFromKm(km) {
    if (trip.sec && trip.km) return Math.max(60, Math.round(trip.sec));
    const hours = (km || 1) / URBAN_SPEED_KMH;
    return Math.max(60, Math.round(hours * 3600));
  }

  function updateUserMarker() {
    if (!mapInst || userPos.lat == null) return;
    if (userMarker) userMarker.setLatLng([userPos.lat, userPos.lng]);
    else {
      userMarker = L.marker([userPos.lat, userPos.lng], { icon: userIcon(), zIndexOffset: 400 })
        .addTo(mapInst)
        .bindPopup("<b>Ma position</b>");
    }
  }

  function startGeoWatch(onUpdate) {
    stopGeoWatch();
    if (!navigator.geolocation) {
      /* Fallback démo près de Haie Vive si GPS indisponible */
      userPos.lat = 6.3585;
      userPos.lng = 2.3930;
      userPos.ok = false;
      if (onUpdate) onUpdate();
      return;
    }
    geoWatchId = navigator.geolocation.watchPosition(
      function (pos) {
        userPos.lat = pos.coords.latitude;
        userPos.lng = pos.coords.longitude;
        userPos.ok = true;
        if (onUpdate) onUpdate();
      },
      function () {
        if (userPos.lat == null) {
          userPos.lat = 6.3585;
          userPos.lng = 2.3930;
          userPos.ok = false;
          if (onUpdate) onUpdate();
        }
      },
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 10000 }
    );
  }

  function syncInputs() {
    const fromEl = document.getElementById("from-input");
    const destEl = document.getElementById("dest-input");
    /* Ne pas écraser le texte pendant la saisie */
    if (fromEl && document.activeElement !== fromEl) fromEl.value = trip.from;
    if (destEl && document.activeElement !== destEl) destEl.value = trip.to;
    updateTripDistance();
    const hasRoute = !!(trip.route && trip.route.key === currentRouteKey());
    const kmEl = document.getElementById("trip-km");
    if (kmEl) {
      kmEl.textContent = trip.km
        ? fmtKm(trip.km) + (hasRoute ? (trip.route.real ? " par la route" : " estimés") : " · calcul de l'itinéraire…")
        : "Choisissez départ et destination";
    }
    const etaEl = document.getElementById("trip-eta");
    if (etaEl) {
      etaEl.textContent = trip.km ? "≈ " + formatEta(etaSecondsFromKm(trip.km)) : "—";
    }
    const price = priceFromDistance();
    const priceEl = document.getElementById("trip-price");
    if (priceEl) priceEl.textContent = trip.km ? ACStore.fmtFCFA(price) : "—";
    const formula = document.getElementById("price-formula");
    if (formula) {
      formula.textContent = trip.km
        ? FARE.base.toLocaleString("fr-FR") + " + " + FARE.perKm + " FCFA/km × " + fmtKm(trip.km)
        : "Tarif : " + ACStore.fmtFCFA(FARE.base) + " + " + ACStore.fmtFCFA(FARE.perKm) + " par km";
    }
    const btn = document.getElementById("request-btn");
    if (btn) btn.textContent = "Confirmer la course" + (trip.km ? " · " + ACStore.fmtFCFA(price) : "");
    const hint = document.getElementById("pick-hint");
    if (hint) {
      const isFrom = trip.pickMode === "from";
      hint.className = "yc-pick-hint pointer-events-none" + (isFrom ? "" : " yc-pick-hint--to");
      hint.innerHTML = `<span class="yc-pick-hint__dot"></span><span>${isFrom
        ? "Touchez la carte pour placer le départ"
        : "Touchez la carte pour placer la destination"}</span>`;
    }
  }

  /* ---------- Saisie d'adresse + suggestions (lieux locaux + géocodage Bénin) ---------- */
  function escAttr(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function escHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  const normTxt = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  let suggestTimer = null;
  let suggestReq = 0;
  let lastSuggestions = [];
  let suggestRole = "from";
  let blurTimer = null;
  const geocodeCache = {};

  function localPlaces(q) {
    const n = normTxt(q).trim();
    const all = POIS.map((p) => ({ name: p.name, detail: "Lieu populaire · Bénin", lat: p.lat, lng: p.lng, icon: "star" }))
      .concat(CITIES.map((c) => ({ name: c.name, detail: "Ville · Bénin", lat: c.lat, lng: c.lng, icon: "location_city" })));
    if (!n) return all.slice(0, 6);
    return all.filter((p) => normTxt(p.name).includes(n)).slice(0, 4);
  }

  function geocodeBenin(q) {
    const key = normTxt(q).trim();
    if (geocodeCache[key]) return Promise.resolve(geocodeCache[key]);
    const url = "https://photon.komoot.io/api/?q=" + encodeURIComponent(q) +
      "&lat=" + COTONOU.lat + "&lon=" + COTONOU.lng + "&limit=8&lang=fr";
    return fetch(url).then((r) => r.json()).then((j) => {
      const seen = {};
      const out = [];
      (j.features || []).forEach((f) => {
        const p = f.properties || {};
        if (p.countrycode && p.countrycode !== "BJ") return;
        const name = p.name || [p.housenumber, p.street].filter(Boolean).join(" ") || p.city || p.county;
        if (!name) return;
        const detail = [p.street && p.street !== name ? p.street : null, p.district, p.city && p.city !== name ? p.city : null, p.state]
          .filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ") || "Bénin";
        const k = normTxt(name + "|" + detail);
        if (seen[k]) return;
        seen[k] = true;
        out.push({ name, detail, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], icon: p.osm_value === "city" || p.osm_value === "town" ? "location_city" : "place" });
      });
      geocodeCache[key] = out.slice(0, 6);
      return geocodeCache[key];
    }).catch(() => []);
  }

  function renderSuggestions(list, opts) {
    const box = document.getElementById("place-suggestions");
    if (!box) return;
    lastSuggestions = list;
    if (!list.length && !(opts && opts.loading)) {
      box.innerHTML = `<div class="px-4 py-4 flex items-start gap-3">
        <span class="w-9 h-9 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center flex-shrink-0">${UI.icon("search", "text-[18px]")}</span>
        <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed pt-1">${opts && opts.query ? "Aucun lieu trouvé pour « " + escHtml(opts.query) + " »" : "Saisissez une adresse, un quartier ou une ville"}</p>
      </div>`;
      box.classList.remove("hidden");
      return;
    }
    box.innerHTML = list.map((s, i) => `
      <button type="button" onmousedown="event.preventDefault()" onclick="Screens._pickSuggestion(${i})"
        class="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-zinc-50 active:bg-[#F4E4B3]/40 border-b border-zinc-100 last:border-0">
        <span class="w-9 h-9 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center flex-shrink-0">${UI.icon(s.icon || "place", "text-[18px]")}</span>
        <span class="min-w-0 flex-1">
          <span class="block font-label-md text-label-md font-semibold text-on-surface truncate">${escHtml(s.name)}</span>
          <span class="block font-label-sm text-label-sm text-zinc-500 truncate mt-0.5">${escHtml(s.detail)}</span>
        </span>
        ${UI.icon("north_west", "text-[16px] text-zinc-400 flex-shrink-0")}
      </button>`).join("") + (opts && opts.loading ? `<p class="px-4 py-2.5 font-label-sm text-label-sm text-zinc-500 flex items-center gap-2 border-t border-zinc-100"><span class="w-3.5 h-3.5 rounded-full border-2 border-secondary/30 border-t-secondary animate-spin"></span>Recherche en cours…</p>` : "");
    box.classList.remove("hidden");
  }

  function hideSuggestions() {
    const box = document.getElementById("place-suggestions");
    if (box) box.classList.add("hidden");
  }

  Screens._placeFocus = function (role) {
    clearTimeout(blurTimer);
    suggestRole = role;
    trip.pickMode = role;
    const el = document.getElementById(role === "from" ? "from-input" : "dest-input");
    /* Champ vidé au focus : le placeholder apparaît tout de suite.
       Si rien n'est confirmé, _placeBlur restaure le dernier lieu validé. */
    if (el) el.value = "";
    syncInputs();
    renderSuggestions(localPlaces(""));
  };

  Screens._placeInput = function (role, value) {
    suggestRole = role;
    trip.pickMode = role;
    clearTimeout(suggestTimer);
    const q = (value || "").trim();
    const local = localPlaces(q);
    if (q.length < 2) { renderSuggestions(local); return; }
    renderSuggestions(local, { loading: true, query: q });
    const reqId = ++suggestReq;
    suggestTimer = setTimeout(() => {
      geocodeBenin(q).then((remote) => {
        if (reqId !== suggestReq) return;
        const names = {};
        const merged = local.concat(remote).filter((s) => { const k = normTxt(s.name); if (names[k]) return false; names[k] = true; return true; });
        renderSuggestions(merged.slice(0, 7), { query: q });
      });
    }, 380);
  };

  Screens._placeKey = function (ev, role) {
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (lastSuggestions.length) Screens._pickSuggestion(0);
      else UI.toast("Choisissez un lieu dans la liste.", "info");
    } else if (ev.key === "Escape") {
      hideSuggestions();
      ev.target.blur();
    }
  };

  Screens._placeBlur = function () {
    clearTimeout(blurTimer);
    blurTimer = setTimeout(() => {
      hideSuggestions();
      syncInputs(); /* remet le dernier lieu validé si la saisie n'a pas été confirmée */
    }, 180);
  };

  Screens._pickSuggestion = function (i) {
    const s = lastSuggestions[i];
    if (!s) return;
    hideSuggestions();
    const role = suggestRole;
    const el = document.getElementById(role === "from" ? "from-input" : "dest-input");
    if (el) el.blur();
    Screens._setTripPoint(role, { name: s.name + (s.detail && s.detail !== "Bénin" && !/Lieu populaire|Ville/.test(s.detail) ? " · " + s.detail.split(",")[0] : ""), lat: s.lat, lng: s.lng }, false);
    /* Enchaîner sur la destination si le départ vient d'être saisi */
    if (role === "from" && (trip.toLat == null || !trip.to)) {
      const dest = document.getElementById("dest-input");
      if (dest) setTimeout(() => dest.focus(), 50);
    }
  };

  function refreshMarkers() {
    if (!mapInst) return;
    if (trip.fromLat != null) {
      if (fromMarker) {
        fromMarker.setLatLng([trip.fromLat, trip.fromLng]);
        fromMarker.setIcon(pinIcon("from"));
      } else {
        fromMarker = L.marker([trip.fromLat, trip.fromLng], { icon: pinIcon("from"), zIndexOffset: 500 }).addTo(mapInst);
      }
      fromMarker.bindPopup("<b style='font-family:Plus Jakarta Sans,sans-serif'>Départ</b><br><span style='color:#52525B'>" + escHtml(trip.from) + "</span>");
    }
    if (trip.toLat != null) {
      if (toMarker) {
        toMarker.setLatLng([trip.toLat, trip.toLng]);
        toMarker.setIcon(pinIcon("to"));
      } else {
        toMarker = L.marker([trip.toLat, trip.toLng], { icon: pinIcon("to"), zIndexOffset: 520 }).addTo(mapInst);
      }
      toMarker.bindPopup("<b style='font-family:Plus Jakarta Sans,sans-serif'>Destination</b><br><span style='color:#52525B'>" + escHtml(trip.to) + "</span>");
    }
    drawRouteLine();
    syncInputs();
    loadTripRoute();
  }

  /* Trace l'itinéraire : routier si connu, sinon ligne d'attente pointillée */
  function drawRouteLine() {
    if (!mapInst) return;
    if (routeLine) {
      mapInst.removeLayer(routeLine);
      routeLine = null;
    }
    if (trip.fromLat == null || trip.toLat == null) return;
    const key = currentRouteKey();
    if (trip.route && trip.route.key === key) {
      routeLine = L.polyline(trip.route.coords, { color: "#0A0A0A", weight: 5, opacity: 0.9, lineJoin: "round", lineCap: "round" }).addTo(mapInst);
    } else {
      routeLine = L.polyline(
        [[trip.fromLat, trip.fromLng], [trip.toLat, trip.toLng]],
        { color: "#C9A227", weight: 4, opacity: 0.65, dashArray: "8 10" }
      ).addTo(mapInst);
    }
  }

  /* Charge l'itinéraire routier réel et met à jour tracé, distance, prix */
  function loadTripRoute() {
    const key = currentRouteKey();
    if (!key) return Promise.resolve(null);
    if (trip.route && trip.route.key === key) return Promise.resolve(trip.route);
    if (routeInflight && routeInflight.key === key) return routeInflight.promise;
    const reqId = ++routeReqId;
    const promise = fetchRoute(trip.fromLat, trip.fromLng, trip.toLat, trip.toLng).then((route) => {
      if (routeInflight && routeInflight.key === key) routeInflight = null;
      if (reqId !== routeReqId || key !== currentRouteKey()) return trip.route;
      trip.route = route;
      updateTripDistance();
      if (mapInst && mapInteractive) {
        drawRouteLine();
        fitTripBounds();
      }
      syncInputs();
      return route;
    });
    routeInflight = { key, promise };
    return promise;
  }

  /* Hauteur de la feuille inférieure → marge pour que le tracé reste visible */
  function sheetPad() {
    const sheet = document.querySelector(".yc-gmap-sheet");
    return (sheet ? sheet.offsetHeight : 260) + 24;
  }

  function routeBounds() {
    if (trip.route && trip.route.key === currentRouteKey() && trip.route.coords.length > 1) {
      return L.latLngBounds(trip.route.coords);
    }
    return L.latLngBounds([trip.fromLat, trip.fromLng], [trip.toLat, trip.toLng]);
  }

  function fitTripBounds() {
    if (!mapInst) return;
    if (trip.fromLat != null && trip.toLat != null) {
      mapInst.fitBounds(routeBounds(), { paddingTopLeft: [40, 130], paddingBottomRight: [40, sheetPad()], maxZoom: 16, animate: false });
    } else if (trip.fromLat != null) {
      mapInst.setView([trip.fromLat, trip.fromLng], 13);
    } else if (trip.toLat != null) {
      mapInst.setView([trip.toLat, trip.toLng], 13);
    }
  }

  /* ---------- Vue pays : frontière + villes ---------- */
  function addBeninLayers() {
    if (!mapInst) return;
    beninLayer = L.polygon(BENIN_BORDER, {
      color: "#0A0A0A", weight: 2, opacity: 0.7, fillColor: "#C9A227", fillOpacity: 0.05, interactive: false
    }).addTo(mapInst);

    cityLayer = L.layerGroup();
    CITIES.forEach((c) => {
      const m = L.circleMarker([c.lat, c.lng], {
        radius: c.name === "Cotonou" ? 7 : 5, color: "#fff", weight: 2, fillColor: "#0A0A0A", fillOpacity: 1
      }).bindTooltip(c.name, { permanent: true, direction: "right", offset: [8, 0], className: "yc-city-label" });
      if (mapInteractive) {
        m.on("click", function () {
          Screens._setTripPoint(trip.pickMode, { name: c.name, lat: c.lat, lng: c.lng }, false);
        });
      }
      cityLayer.addLayer(m);
    });
    syncCountryLayers();
    mapInst.on("zoomend", syncCountryLayers);
  }

  function syncCountryLayers() {
    if (!mapInst || !cityLayer) return;
    const z = mapInst.getZoom();
    const show = z <= 9;
    if (show && !mapInst.hasLayer(cityLayer)) cityLayer.addTo(mapInst);
    if (!show && mapInst.hasLayer(cityLayer)) mapInst.removeLayer(cityLayer);
    if (beninLayer) {
      /* Frontière visible uniquement sur la vue pays/région */
      const visible = z <= 11;
      if (visible && !mapInst.hasLayer(beninLayer)) beninLayer.addTo(mapInst);
      if (!visible && mapInst.hasLayer(beninLayer)) mapInst.removeLayer(beninLayer);
      beninLayer.setStyle({ weight: z <= 8 ? 2.5 : 1.5, fillOpacity: z <= 8 ? 0.07 : 0.02 });
    }
  }

  function initTransportMap(elId, opts) {
    opts = opts || {};
    mapInteractive = opts.interactive !== false;
    const showUser = opts.showUser !== false;
    const animateCar = !!opts.animateCar;
    destroyMap();
    const el = document.getElementById(elId);
    if (!el || typeof L === "undefined") return;

    mapInst = L.map(elId, {
      zoomControl: false,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: true,
      tapTolerance: 15
    }).setView([COTONOU.lat, COTONOU.lng], COTONOU.zoom);

    L.control.zoom({ position: "bottomright" }).addTo(mapInst);

    /* Tuiles gratuites sans clé. OSM bloque souvent les webviews intégrées
       (403 / "access blocked") : on bascule alors sur le miroir OSM-FR,
       puis sur HOT. tileerror ne se déclenche qu'en cas d'échec réseau réel. */
    const tileProviders = [
      { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
      { url: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", attr: '&copy; OpenStreetMap France' },
      { url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", attr: '&copy; OpenStreetMap, HOT' }
    ];
    let tileIdx = 0;
    function mountTiles() {
      const p = tileProviders[Math.min(tileIdx, tileProviders.length - 1)];
      const layer = L.tileLayer(p.url, { maxZoom: 19, attribution: p.attr, subdomains: "abc" });
      let failed = 0;
      layer.on("tileerror", function () {
        failed++;
        if (failed >= 3 && tileIdx < tileProviders.length - 1 && mapInst && mapInst.hasLayer(layer)) {
          mapInst.removeLayer(layer);
          tileIdx++;
          mountTiles();
        }
      });
      layer.addTo(mapInst);
    }
    mountTiles();

    addBeninLayers();
    refreshMarkers();
    fitTripBounds();

    if (mapInteractive) {
      mapInst.on("click", function (e) {
        const place = {
          name: "Point sur la carte (" + e.latlng.lat.toFixed(4) + ", " + e.latlng.lng.toFixed(4) + ")",
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        Screens._setTripPoint(trip.pickMode, place, false);
      });
    }

    if (showUser) {
      startGeoWatch(function () {
        updateUserMarker();
      });
    }

    if (animateCar) {
      startRideAnimation();
    }

    setTimeout(function () {
      if (mapInst) {
        mapInst.invalidateSize();
        fitTripBounds();
      }
    }, 80);
  }

  /* ---------- Animation du trajet en 2 phases ----------
     1. Le chauffeur s'approche du point de départ (itinéraire réel)
     2. Course jusqu'à la destination (itinéraire réel)
     Le temps affiché est le temps réel estimé ; l'animation est accélérée. */
  function setRideUI(o) {
    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.textContent = v; };
    set("ride-phase-label", o.label);
    set("ride-eta-title", o.title);
    set("ride-eta-meta", o.meta);
    set("ride-arrival", o.arrival);
    const bar = document.getElementById("ride-progress");
    if (bar && o.progress != null) bar.style.width = Math.round(o.progress * 100) + "%";
    if (bar && o.color) bar.style.background = o.color;
    const chip = document.getElementById("ride-status-chip");
    if (chip && o.chip) chip.textContent = o.chip;
  }

  function panToFollow(latlng) {
    if (!mapInst) return;
    const inner = mapInst.getBounds().pad(-0.25);
    if (!inner.contains(latlng)) mapInst.panTo(latlng, { animate: true, duration: 0.6 });
  }

  function animateAlong(coords, opts) {
    /* opts: { visualSec, realSec, totalKm, color, onTick(t, remainKm, remainSec), onDone } */
    const cum = pathCumulative(coords);
    const totalKm = opts.totalKm || cum[cum.length - 1] || 0.5;
    const start = performance.now();
    let lastBearing = null;

    if (!carMarker) {
      const p0 = pointAlong(coords, cum, 0);
      carMarker = L.marker([p0.lat, p0.lng], { icon: carIcon(p0.bearing), zIndexOffset: 600 }).addTo(mapInst);
    }

    function tick(now) {
      if (!mapInst || !carMarker) return;
      const t = Math.min(1, (now - start) / (opts.visualSec * 1000));
      const p = pointAlong(coords, cum, t);
      carMarker.setLatLng([p.lat, p.lng]);
      if (lastBearing == null || Math.abs(p.bearing - lastBearing) > 2) {
        carMarker.setIcon(carIcon(p.bearing));
        lastBearing = p.bearing;
      }

      /* Portion parcourue */
      if (doneLine) { mapInst.removeLayer(doneLine); doneLine = null; }
      const done = coords.slice(0, p.index).concat([[p.lat, p.lng]]);
      if (done.length > 1) {
        doneLine = L.polyline(done, { color: opts.color || "#C9A227", weight: 6, opacity: 0.95, lineJoin: "round", lineCap: "round" }).addTo(mapInst);
      }
      /* Portion restante (ligne principale) */
      if (routeLine) {
        const remain = [[p.lat, p.lng]].concat(coords.slice(p.index));
        routeLine.setLatLngs(remain.length > 1 ? remain : [[p.lat, p.lng], [p.lat, p.lng]]);
      }

      panToFollow(L.latLng(p.lat, p.lng));

      const remainKm = Math.max(0, totalKm * (1 - t));
      const remainSec = Math.max(0, opts.realSec * (1 - t));
      if (opts.onTick) opts.onTick(t, remainKm, remainSec);

      if (t < 1) {
        animRaf = requestAnimationFrame(tick);
      } else {
        animRaf = null;
        if (opts.onDone) opts.onDone();
      }
    }
    animRaf = requestAnimationFrame(tick);
  }

  function startRideAnimation() {
    stopRideAnimation();
    if (!mapInst || trip.fromLat == null || trip.toLat == null) return;
    const driverName = (trip.driver && trip.driver.name.split(" ")[0]) || "Le chauffeur";

    /* Le chauffeur démarre à ~1,2 km du point de départ, à l'opposé de la destination */
    const brgToDest = bearingDeg(trip.fromLat, trip.fromLng, trip.toLat, trip.toLng);
    const driverStart = destinationPoint(trip.fromLat, trip.fromLng, (brgToDest + 150) % 360, 1.2);
    const startDot = L.marker([driverStart.lat, driverStart.lng], { icon: driverStartIcon(), zIndexOffset: 300 }).addTo(mapInst);

    setRideUI({
      label: driverName + " arrive",
      title: "…",
      meta: "Calcul de l'itinéraire du chauffeur…",
      arrival: "",
      progress: 0,
      color: "#C9A227",
      chip: "Chauffeur en route"
    });

    /* Phase 1 : approche */
    Promise.all([
      fetchRoute(driverStart.lat, driverStart.lng, trip.fromLat, trip.fromLng),
      loadTripRoute()
    ]).then(([approach]) => {
      if (!mapInst || !App.current || App.current.id !== "transportInRide") return;

      /* Approche or + course prévue en pointillé noir */
      if (routeLine) { mapInst.removeLayer(routeLine); routeLine = null; }
      const rideCoords = (trip.route && trip.route.coords) || [[trip.fromLat, trip.fromLng], [trip.toLat, trip.toLng]];
      const ridePreview = L.polyline(rideCoords, { color: "#0A0A0A", weight: 5, opacity: 0.35, dashArray: "6 10" }).addTo(mapInst);
      routeLine = L.polyline(approach.coords, { color: "#C9A227", weight: 5, opacity: 0.95, dashArray: "1 8", lineCap: "round" }).addTo(mapInst);

      mapInst.fitBounds(L.latLngBounds(approach.coords).extend([trip.fromLat, trip.fromLng]), {
        paddingTopLeft: [40, 80], paddingBottomRight: [40, sheetPad()], maxZoom: 16, animate: false
      });

      const approachReal = Math.max(90, approach.sec);
      animateAlong(approach.coords, {
        visualSec: 22,
        realSec: approachReal,
        totalKm: approach.km,
        color: "#C9A227",
        onTick: function (t, remainKm, remainSec) {
          setRideUI({
            title: formatEta(remainSec),
            meta: driverName + " est à " + fmtKm(remainKm) + " · " + (trip.driver ? trip.driver.car + " · " + trip.driver.plate : ""),
            arrival: "Prise en charge " + arrivalClock(remainSec),
            progress: t
          });
        },
        onDone: function () {
          if (!mapInst) return;
          mapInst.removeLayer(startDot);
          if (routeLine) { mapInst.removeLayer(routeLine); routeLine = null; }
          if (doneLine) { mapInst.removeLayer(doneLine); doneLine = null; }
          mapInst.removeLayer(ridePreview);
          UI.toast(driverName + " est arrivé au point de départ", "success");
          if (navigator.vibrate) { try { navigator.vibrate([40, 60, 40]); } catch (e) { /* no-op */ } }
          setRideUI({
            label: "Chauffeur sur place",
            title: "Départ imminent",
            meta: "Installez-vous, la course démarre…",
            arrival: "",
            progress: 1,
            chip: "Prise en charge"
          });
          phaseTimer = setTimeout(startTripPhase, 2200);
        }
      });
    });

    /* Phase 2 : course */
    function startTripPhase() {
      phaseTimer = null;
      if (!mapInst || !App.current || App.current.id !== "transportInRide") return;
      updateTripDistance();
      const coords = (trip.route && trip.route.coords) || [[trip.fromLat, trip.fromLng], [trip.toLat, trip.toLng]];
      const totalKm = trip.km || 1;
      const realEtaSec = etaSecondsFromKm(totalKm);
      const visualSec = Math.min(90, Math.max(35, totalKm * 8));

      routeLine = L.polyline(coords, { color: "#0A0A0A", weight: 6, opacity: 0.95, lineJoin: "round", lineCap: "round" }).addTo(mapInst);
      mapInst.fitBounds(L.latLngBounds(coords), { paddingTopLeft: [40, 80], paddingBottomRight: [40, sheetPad()], maxZoom: 16, animate: true });

      setRideUI({ label: "Temps restant", color: "#C9A227", chip: "En course", progress: 0 });

      animateAlong(coords, {
        visualSec: visualSec,
        realSec: realEtaSec,
        totalKm: totalKm,
        color: "#C9A227",
        onTick: function (t, remainKm, remainSec) {
          setRideUI({
            title: t >= 1 ? "Arrivé" : formatEta(remainSec),
            meta: t >= 1 ? "Destination atteinte · " + trip.to.split("·")[0].trim() : fmtKm(remainKm) + " restants · " + trip.to.split("·")[0].trim(),
            arrival: t >= 1 ? "" : "Arrivée prévue " + arrivalClock(remainSec),
            progress: t
          });
        },
        onDone: function () {
          setRideUI({ label: "Course terminée", chip: "Arrivé" });
          UI.toast("Vous êtes arrivé à destination", "success");
          if (navigator.vibrate) { try { navigator.vibrate(80); } catch (e) { /* no-op */ } }
        }
      });
    }
  }

  /* Écran 3 — Transport (format type Google Maps) */
  Screens.transport = function (container) {
    updateTripDistance();
    const body = `
    <div class="yc-gmap-wrap">
      <div id="yc-transport-map" class="yc-gmap-canvas"></div>

      <div class="absolute top-0 left-0 right-0 z-[600] p-3 space-y-2 pointer-events-none">
        <div class="flex items-start gap-2 pointer-events-auto">
          <button type="button" onclick="App.nav('home')"
            class="w-11 h-11 mt-1 rounded-full bg-white border border-black/5 shadow-[0_6px_18px_rgba(0,0,0,.12)] flex items-center justify-center text-on-surface flex-shrink-0">
            ${UI.icon("arrow_back")}
          </button>
          <div class="yc-gmap-card flex-1 relative px-3 py-1">
            <div id="place-row-from" class="flex items-center gap-3 h-11">
              <span class="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0"></span>
              <input id="from-input" value="${escAttr(trip.from)}" placeholder="Point de départ" autocomplete="off" spellcheck="false" enterkeyhint="next"
                onfocus="Screens._placeFocus('from')" oninput="Screens._placeInput('from', this.value)"
                onkeydown="Screens._placeKey(event, 'from')" onblur="Screens._placeBlur()"
                class="yc-gmap-input truncate"/>
            </div>
            <div class="h-px bg-zinc-200 ml-5"></div>
            <div id="place-row-to" class="flex items-center gap-3 h-11">
              <span class="w-2.5 h-2.5 rounded-sm bg-black flex-shrink-0"></span>
              <input id="dest-input" value="${escAttr(trip.to)}" placeholder="Où allez-vous ?" autocomplete="off" spellcheck="false" enterkeyhint="search"
                onfocus="Screens._placeFocus('to')" oninput="Screens._placeInput('to', this.value)"
                onkeydown="Screens._placeKey(event, 'to')" onblur="Screens._placeBlur()"
                class="yc-gmap-input truncate"/>
              <button type="button" onclick="Screens._swapTripPoints()" class="text-zinc-400 flex-shrink-0" title="Inverser">${UI.icon("swap_vert", "text-[20px]")}</button>
            </div>
          </div>
        </div>
        <div id="place-suggestions" class="hidden yc-gmap-card overflow-hidden pointer-events-auto max-h-[280px] overflow-y-auto" style="margin-left:52px"></div>
        <div class="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto" style="padding-left:52px">
          ${POIS.slice(0, 6).map((p) => `
            <button type="button" onclick="Screens._pickPoi('${p.id}')" class="yc-place-chip">
              ${p.name.split("·")[0].trim()}
            </button>`).join("")}
        </div>
        <div id="pick-hint" class="yc-pick-hint pointer-events-none ${trip.pickMode === "to" ? "yc-pick-hint--to" : ""}" style="margin-left:52px">
          <span class="yc-pick-hint__dot"></span>
          <span>${trip.pickMode === "from" ? "Touchez la carte pour placer le départ" : "Touchez la carte pour placer la destination"}</span>
        </div>
      </div>

      <div class="absolute right-3 z-[600] flex flex-col gap-2" style="bottom: calc(42% + 16px)">
        <button type="button" onclick="Screens._useMyPosition()" class="yc-map-fab" title="Ma position">${UI.icon("my_location")}</button>
        <button type="button" onclick="Screens._mapZoomCotonou()" class="yc-map-fab" title="Cotonou">${UI.icon("near_me")}</button>
        <button type="button" onclick="Screens._mapZoomBenin()" class="yc-map-fab" title="Bénin">${UI.icon("public")}</button>
      </div>

      <div class="absolute bottom-0 left-0 right-0 z-[600] yc-gmap-sheet p-4 space-y-3 max-h-[46%] overflow-y-auto">
        <div class="w-10 h-1 rounded-full bg-outline-variant/50 mx-auto"></div>
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="font-title-md text-title-md font-bold">Votre course</p>
            <p class="font-label-sm text-label-sm text-on-surface-variant truncate" id="trip-km">${trip.km ? fmtKm(trip.km) + " · calcul de l'itinéraire…" : "Indiquez départ et destination"}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="font-headline-sm text-headline-sm font-bold text-secondary leading-none" id="trip-eta">${trip.km ? "≈ " + formatEta(etaSecondsFromKm(trip.km)) : "—"}</p>
            <p class="font-label-sm text-label-sm text-on-surface-variant">durée estimée</p>
          </div>
        </div>
        <div class="space-y-2">
          ${VEHICLES.map(function (v) {
            const sel = trip.vehicle === v.id;
            const p = Math.round((Math.max(FARE.min, Math.round((FARE.base + (trip.km || 5) * FARE.perKm) / 100) * 100) * v.mult) / 100) * 100;
            return `<button type="button" onclick="Screens._pickVehicle('${v.id}')" class="w-full rounded-2xl border p-3 flex items-center justify-between ${sel ? "border-secondary bg-secondary/10" : "border-outline-variant/30 bg-white"}">
              <div class="flex items-center gap-3 min-w-0">
                ${UI.icon(v.icon, "text-[22px]")}
                <div class="text-left min-w-0">
                  <p class="font-label-md text-label-md font-bold">${v.label}</p>
                  <p class="font-label-sm text-label-sm text-on-surface-variant">${v.avail} · ${trip.km ? formatEta(Math.round(etaSecondsFromKm(trip.km) * v.etaMult)) : "—"}</p>
                </div>
              </div>
              <p class="font-title-md text-title-md font-extrabold">${trip.km ? ACStore.fmtFCFA(p) : "—"}</p>
            </button>`;
          }).join("")}
        </div>
        <p class="font-label-sm text-label-sm text-on-surface-variant truncate" id="price-formula">Tarif de base : ${ACStore.fmtFCFA(FARE.base)} + ${ACStore.fmtFCFA(FARE.perKm)}/km</p>
        <p class="hidden" id="trip-price">${trip.km ? ACStore.fmtFCFA(priceFromDistance()) : "—"}</p>
        <button type="button" id="request-btn" onclick="Screens._transportRequest()"
          class="w-full h-12 rounded-full bg-black text-white font-label-lg text-label-lg font-bold shadow-md active:scale-[0.99]">
          Confirmer la course${trip.km ? " · " + ACStore.fmtFCFA(priceFromDistance()) : ""}
        </button>
      </div>
    </div>`;
    Shell.render(container, { topbar: "", body, nav: false, fill: true });
    initTransportMap("yc-transport-map", { interactive: true, showUser: true });
  };

  Screens._useMyPosition = function () {
    function apply() {
      if (userPos.lat == null) {
        UI.toast("Position indisponible. Autorisez la localisation.", "error");
        return;
      }
      Screens._setTripPoint("from", {
        name: userPos.ok ? "Ma position actuelle" : "Ma position (estimée)",
        lat: userPos.lat,
        lng: userPos.lng
      }, false);
      trip.pickMode = "to";
      syncInputs();
      if (mapInst) mapInst.setView([userPos.lat, userPos.lng], 14);
      UI.toast("Départ = votre position", "success");
    }
    if (userPos.lat != null) {
      apply();
      return;
    }
    let applied = false;
    UI.toast("Localisation en cours…", "info");
    startGeoWatch(function () {
      updateUserMarker();
      if (!applied && userPos.lat != null) {
        applied = true;
        apply();
      }
    });
  };

  Screens._mapZoomBenin = function () {
    if (!mapInst) return;
    mapInst.fitBounds(L.latLngBounds(BENIN_BORDER), { paddingTopLeft: [16, 130], paddingBottomRight: [16, sheetPad()], animate: true });
    UI.toast("Touchez une ville pour la choisir", "info");
  };

  Screens._mapZoomCotonou = function () {
    if (mapInst) mapInst.setView([COTONOU.lat, COTONOU.lng], COTONOU.zoom);
  };

  Screens._setTripPoint = function (role, place, replace) {
    if (role === "from") {
      trip.from = place.name;
      trip.fromLat = place.lat;
      trip.fromLng = place.lng;
      if (trip.pickMode === "from") trip.pickMode = "to";
    } else {
      trip.to = place.name;
      trip.toLat = place.lat;
      trip.toLng = place.lng;
    }
    updateTripDistance();
    if (replace) {
      App.replace("transport");
    } else {
      refreshMarkers();
      fitTripBounds();
      syncInputs();
      UI.toast((role === "from" ? "Départ : " : "Destination : ") + place.name.split("(")[0].trim(), "info");
    }
  };

  Screens._pickPoi = function (id) {
    const p = POIS.find((x) => x.id === id);
    if (!p) return;
    Screens._setTripPoint(trip.pickMode, p, false);
  };

  Screens._swapTripPoints = function () {
    const f = { name: trip.from, lat: trip.fromLat, lng: trip.fromLng };
    trip.from = trip.to;
    trip.fromLat = trip.toLat;
    trip.fromLng = trip.toLng;
    trip.to = f.name;
    trip.toLat = f.lat;
    trip.toLng = f.lng;
    updateTripDistance();
    refreshMarkers();
    fitTripBounds();
    syncInputs();
  };

  Screens._pickVehicle = function (id) {
    trip.vehicle = id;
    App.replace("transport");
  };

  Screens._transportRequest = function () {
    if (trip.fromLat == null || trip.fromLng == null) {
      UI.toast("Indiquez d'où vous partez.", "error");
      const el = document.getElementById("from-input");
      if (el) el.focus();
      return;
    }
    if (trip.toLat == null || trip.toLng == null || !trip.to) {
      UI.toast("Indiquez où vous allez.", "error");
      const el = document.getElementById("dest-input");
      if (el) el.focus();
      return;
    }
    const proceed = function () {
      /* Un seul prix fixe, calculé sur la distance routière */
      trip.price = priceFromDistance();
      UI.toast("Prix de la course : " + ACStore.fmtFCFA(trip.price), "success");
      Screens._transportSearch();
    };
    const key = currentRouteKey();
    if (trip.route && trip.route.key === key) { proceed(); return; }
    UI.toast("Calcul de l'itinéraire et du prix…", "info");
    let done = false;
    const finish = function () { if (done) return; done = true; if (App.current && App.current.id === "transport") proceed(); };
    loadTripRoute().then(finish, finish);
    setTimeout(finish, 4000);
  };

  Screens._transportSearch = function () {
    destroyMap();
    App.nav("transportSearching");
    setTimeout(() => {
      if (App.current && App.current.id === "transportSearching") {
        trip.driver = {
          name: "Koffi Adjovi",
          car: trip.vehicle === "moto" ? "Honda CG 125" : trip.vehicle === "premium" ? "Toyota Camry" : "Toyota Corolla",
          plate: "RB-4821-A",
          rating: 4.8,
          phone: "+229 97 11 22 33",
          avatar: "https://i.pravatar.cc/100?u=koffi-adjovi"
        };
        App.replace("transportDriverFound");
      }
    }, 2200);
  };

  Screens.transportDriverFound = function (container) {
    const d = trip.driver || { name: "Koffi Adjovi", car: "Toyota Corolla", plate: "RB-4821-A", rating: 4.8, avatar: "https://i.pravatar.cc/100?u=koffi-adjovi" };
    const topbar = UI.topBar({ title: "Chauffeur trouvé", back: "App.nav('home')" });
    const body = `
    <section class="yc-card p-space-20 flex flex-col items-center text-center space-y-3">
      <img class="w-20 h-20 rounded-full object-cover" src="${d.avatar}" alt=""/>
      <h2 class="font-headline-sm text-headline-sm font-bold">${d.name}</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">★ ${d.rating} · ${d.car} · ${d.plate}</p>
      <p class="font-title-md text-title-md font-bold text-secondary">Arrivée dans 3 min</p>
    </section>
    <div class="pt-space-16">${UI.primaryButton("Suivre la course", "App.replace('transportInRide')")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.transportSearching = function (container) {
    destroyMap();
    const topbar = UI.topBar({ title: "Recherche", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-20 py-space-40">
      <div class="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full pulse-ring"></div>
        ${UI.icon("directions_car", "text-primary text-[40px]")}
      </div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Recherche d'un chauffeur...</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">${trip.from} → ${trip.to}${trip.km ? " · " + trip.km.toFixed(1).replace(".", ",") + " km" : ""}</p>
      <button type="button" onclick="App.nav('home')" class="font-label-md text-label-md text-error">Annuler</button>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  /* Écran 5 — Trajet en cours (format type Google Maps) */
  Screens.transportInRide = function (container) {
    if (!trip.driver) { App.resetTo("transport"); return; }
    const d = trip.driver;
    updateTripDistance();
    const etaSec = etaSecondsFromKm(trip.km || 6);
    const body = `
    <div class="yc-gmap-wrap">
      <div id="yc-inride-map" class="yc-gmap-canvas"></div>

      <div class="absolute top-3 left-3 right-3 z-[600] flex justify-between items-start pointer-events-none">
        <button type="button" onclick="App.nav('home')"
          class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center pointer-events-auto">${UI.icon("close")}</button>
        <div class="flex gap-2 pointer-events-auto">
          <span class="inline-flex items-center gap-1 h-10 px-3 rounded-full bg-white text-on-surface font-label-sm text-label-sm font-bold shadow-md">
            ${UI.icon("verified_user", "text-[14px] text-secondary")} <span id="ride-status-chip">Chauffeur en route</span>
          </span>
          <button type="button" onclick="Screens._transportSOS()"
            class="h-10 px-3 rounded-full bg-[#EA4335] text-white font-label-sm text-label-sm font-bold shadow-md">SOS</button>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 z-[600] yc-gmap-sheet p-4 space-y-3">
        <div class="w-10 h-1 rounded-full bg-outline-variant/50 mx-auto"></div>
        <div class="space-y-1.5">
          <div class="flex justify-between items-end gap-2">
            <div class="min-w-0">
              <p class="font-label-sm text-label-sm text-on-surface-variant" id="ride-phase-label">${d.name.split(" ")[0]} arrive</p>
              <p class="font-headline-md text-headline-md font-bold text-secondary leading-none" id="ride-eta-title">…</p>
            </div>
            <div class="text-right min-w-0">
              <p class="font-body-sm text-body-sm text-on-surface-variant truncate" id="ride-eta-meta">${fmtKm(trip.km)} · ${trip.to.split("·")[0].trim()}</p>
              <p class="font-label-sm text-label-sm font-semibold text-on-surface" id="ride-arrival"></p>
            </div>
          </div>
          <div class="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div id="ride-progress" class="h-full rounded-full transition-[width] duration-200" style="width:0%;background:#C9A227"></div>
          </div>
          <p class="font-label-sm text-label-sm text-on-surface-variant">${fmtKm(trip.km)} par la route · ≈ ${formatEta(etaSec)} · ${ACStore.fmtFCFA(FARE.base)} + ${ACStore.fmtFCFA(FARE.perKm)}/km</p>
        </div>
        <div class="flex items-center gap-3">
          <img class="w-12 h-12 rounded-full object-cover" src="${d.avatar}" alt=""/>
          <div class="flex-1 min-w-0">
            <p class="font-title-md text-title-md font-bold truncate">${d.name} · ★ ${d.rating}</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${d.car} · ${d.plate}</p>
          </div>
          <a href="tel:${d.phone}" class="w-11 h-11 rounded-full bg-zinc-100 text-on-surface flex items-center justify-center">${UI.icon("call")}</a>
          <button type="button" onclick="UI.toast('Lien de suivi partagé', 'success')"
            class="w-11 h-11 rounded-full bg-zinc-100 text-on-surface flex items-center justify-center">${UI.icon("share")}</button>
        </div>
        <div class="flex items-center justify-between px-1">
          <span class="font-body-md text-body-md text-on-surface-variant">Montant</span>
          <span class="font-label-lg text-label-lg font-bold">${ACStore.fmtFCFA(trip.price)}</span>
        </div>
        <button type="button" onclick="Screens._transportFinish()"
          class="w-full h-12 rounded-full bg-black text-white font-label-lg text-label-lg font-bold shadow-md">
          Terminer la course
        </button>
      </div>
    </div>`;
    Shell.render(container, { topbar: "", body, nav: false, fill: true });
    initTransportMap("yc-inride-map", { interactive: false, showUser: false, animateCar: true });
  };

  Screens._transportSOS = function () { App.nav("sos"); };

  Screens.sos = function (container) {
    destroyMap();
    const topbar = UI.topBar({ title: "Assistance SOS", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-20 py-space-24">
      <div class="w-20 h-20 rounded-full bg-error-container flex items-center justify-center text-on-error-container">${UI.icon("sos", "text-[36px]")}</div>
      <h2 class="font-headline-md text-headline-md font-bold">Besoin d'aide immédiate ?</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">Votre position et les détails de votre course seront partagés avec le support YOUSS CONNECT.</p>
      <div class="w-full space-y-3">
        ${UI.primaryButton("Alerter le support", "Screens._sosAlert()", { icon: "campaign" })}
        ${UI.secondaryButton("Retour à la course", "App.back()")}
      </div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._sosAlert = function () {
    ACStore.addNotification("Alerte SOS envoyée", "Le support YOUSS CONNECT a été notifié.", "transport");
    ACStore.emit();
    UI.toast("Support alerté. Restez en ligne.", "success");
    App.back();
  };

  Screens._transportFinish = function () {
    destroyMap();
    App.nav("transportRating");
  };

  let ratingValue = 5;
  Screens.transportRating = function (container) {
    destroyMap();
    if (!trip.driver) { App.resetTo("transport"); return; }
    const topbar = UI.topBar({ title: "Course terminée" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-16">
      <div class="w-16 h-16 rounded-full bg-yc-green/15 text-yc-green flex items-center justify-center">${UI.icon("check_circle", "text-[36px]", true)}</div>
      <h2 class="font-headline-md text-headline-md font-bold">Trajet terminé</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Comment s'est passée votre course avec ${trip.driver.name} ?</p>
      <div class="flex space-x-2">
        ${[1, 2, 3, 4, 5].map((i) => `<button type="button" onclick="Screens._setRating(${i})" class="text-[32px] ${i <= ratingValue ? "text-yc-green" : "text-outline-variant"}">${UI.icon("star", "", i <= ratingValue)}</button>`).join("")}
      </div>
      <div class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center justify-between">
        <span class="font-body-md text-body-md">Total à payer</span>
        <span class="font-label-lg text-label-lg font-bold text-primary">${ACStore.fmtFCFA(trip.price)}</span>
      </div>
      <div class="w-full pt-space-8">${UI.primaryButton("Payer avec Youss Wallet", "Screens._transportPay()", { icon: "account_balance_wallet" })}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._setRating = function (v) { ratingValue = v; App.replace("transportRating"); };

  Screens._transportPay = function () {
    ACStore.whenPaid(ACStore.payFromWallet({
      amount: trip.price,
      label: "Course · " + trip.to,
      service: "transport",
      pointsEarned: 25,
      meta: { from: trip.from, to: trip.to, km: String(trip.km || "") }
    }), function () {
      UI.toast("Paiement réussi · +25 Youss Bonus", "success");
      App.resetTo("home");
    }, function () {
      App.nav("paymentFailed");
    });
  };

  Screens.paymentFailed = function (container) {
    destroyMap();
    const topbar = UI.topBar({ title: "Paiement", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-16 py-space-40">
      ${UI.icon("error", "text-error text-[48px]")}
      <h2 class="font-headline-sm text-headline-sm font-bold">Paiement impossible</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">Solde insuffisant ou hors ligne. Rechargez Youss Wallet.</p>
      ${UI.primaryButton("Recharger", "App.nav('walletTopup')", { green: true })}
      ${UI.secondaryButton("Retour", "App.back()")}
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  /* Compat anciennes routes */
  Screens.transportEstimate = Screens.transport;
})();
