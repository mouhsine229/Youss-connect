/* =========================================================
   YOUSS CONNECT — MOTEUR CARTE (Leaflet)
   Tuiles OpenStreetMap, itinéraires routiers OSRM (sans clé, repli
   géodésique), géocodage Photon biaisé sur la ville courante,
   animation de véhicule le long d'un tracé. Utilisé par Transport,
   Livraison, Explorer et Culture.
   ========================================================= */
(function () {
  "use strict";

  const URBAN_SPEED_KMH = 26;
  const routeCache = {};
  const geocodeCache = {};
  const instances = [];

  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const lerp = (a, b, t) => a + (b - a) * t;
  const haversineKm = YCData.distanceKm;

  function bearingDeg(lat1, lng1, lat2, lng2) {
    const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }
  function destinationPoint(lat, lng, bearing, km) {
    const R = 6371, br = toRad(bearing), la1 = toRad(lat), lo1 = toRad(lng), d = km / R;
    const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(br));
    const lo2 = lo1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
    return { lat: toDeg(la2), lng: toDeg(lo2) };
  }
  function straightRoute(a, b) {
    const km = haversineKm(a.lat, a.lng, b.lat, b.lng) * 1.3;
    /* légère courbe pour un rendu plus naturel */
    const mid = { lat: (a.lat + b.lat) / 2 + (b.lng - a.lng) * 0.08, lng: (a.lng + b.lng) / 2 - (b.lat - a.lat) * 0.08 };
    return { coords: [[a.lat, a.lng], [mid.lat, mid.lng], [b.lat, b.lng]], km, sec: (km / URBAN_SPEED_KMH) * 3600, real: false };
  }
  function routeKey(a, b) { return [a.lat, a.lng, b.lat, b.lng].map((v) => Number(v).toFixed(5)).join("|"); }

  /* Itinéraire routier réel (OSRM public) avec repli hors ligne */
  function fetchRoute(a, b) {
    const key = routeKey(a, b);
    if (routeCache[key]) return Promise.resolve(routeCache[key]);
    if (!navigator.onLine) return Promise.resolve(Object.assign({ key }, straightRoute(a, b)));
    const url = "https://router.project-osrm.org/route/v1/driving/" + a.lng + "," + a.lat + ";" + b.lng + "," + b.lat + "?overview=full&geometries=geojson&alternatives=false&steps=false";
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then((r) => r.json())
      .then((j) => {
        if (!j || j.code !== "Ok" || !j.routes || !j.routes.length) throw new Error("no route");
        const r = j.routes[0];
        const res = { key, coords: r.geometry.coordinates.map((c) => [c[1], c[0]]), km: r.distance / 1000, sec: r.duration * 1.15, real: true };
        routeCache[key] = res;
        return res;
      })
      .catch(() => Object.assign({ key }, straightRoute(a, b)))
      .finally(() => { if (timer) clearTimeout(timer); });
  }

  /* Géocodage : lieux locaux de la ville + Photon (OpenStreetMap) limité aux 4 pays */
  const norm = YCData.norm;
  function localPlaces(q, city) {
    const c = YCData.cityOf(city);
    const n = norm(q).trim();
    const all = c.poi.map((p) => ({ name: p.name, detail: kindLabel(p.kind) + " · " + c.name, lat: p.lat, lng: p.lng, icon: kindIcon(p.kind) }))
      .concat(ACState.addresses.map((a) => ({ name: a.label, detail: a.detail, lat: a.lat || c.lat, lng: a.lng || c.lng, icon: a.icon || "place" })))
      .concat(YCData.restaurantsIn(c.name).map((r) => ({ name: r.name, detail: "Restaurant · " + r.area, lat: r.lat, lng: r.lng, icon: "restaurant" })))
      .concat(YCData.sitesIn(c.name).filter((s) => haversineKm(s.lat, s.lng, c.lat, c.lng) < 60).map((s) => ({ name: s.name, detail: "Lieu culturel · " + s.place, lat: s.lat, lng: s.lng, icon: "account_balance" })));
    if (!n) return all.slice(0, 7);
    return all.filter((p) => norm(p.name + " " + p.detail).includes(n)).slice(0, 5);
  }
  function kindLabel(k) { return { quartier: "Quartier", aeroport: "Aéroport", marche: "Marché", monument: "Monument", plage: "Plage", stade: "Stade", universite: "Université", lieu: "Lieu" }[k] || "Lieu"; }
  function kindIcon(k) { return { quartier: "location_city", aeroport: "flight", marche: "storefront", monument: "account_balance", plage: "beach_access", stade: "stadium", universite: "school", lieu: "place" }[k] || "place"; }
  function geocode(q, city) {
    const c = YCData.cityOf(city);
    const key = c.name + "|" + norm(q).trim();
    if (geocodeCache[key]) return Promise.resolve(geocodeCache[key]);
    if (!navigator.onLine) return Promise.resolve([]);
    const url = "https://photon.komoot.io/api/?q=" + encodeURIComponent(q) + "&lat=" + c.lat + "&lon=" + c.lng + "&limit=8&lang=fr";
    return fetch(url).then((r) => r.json()).then((j) => {
      const seen = {}, out = [];
      (j.features || []).forEach((f) => {
        const p = f.properties || {};
        if (p.countrycode && ["BJ", "SN", "TG", "GH"].indexOf(p.countrycode) < 0) return;
        const name = p.name || [p.housenumber, p.street].filter(Boolean).join(" ") || p.city || p.county;
        if (!name) return;
        const detail = [p.street && p.street !== name ? p.street : null, p.district, p.city && p.city !== name ? p.city : null, p.country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
        const k = norm(name + "|" + detail);
        if (seen[k]) return; seen[k] = true;
        out.push({ name, detail, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], icon: /city|town|village/.test(p.osm_value || "") ? "location_city" : "place" });
      });
      geocodeCache[key] = out.slice(0, 6);
      return geocodeCache[key];
    }).catch(() => []);
  }

  /* ---------- Icônes ---------- */
  function pinIcon(role, letter) {
    return L.divIcon({ className: "", html: `<div class="yc-pin yc-pin--${role}"><span class="yc-pin__head">${letter || (role === "from" ? "A" : "B")}</span><span class="yc-pin__tip"></span></div>`, iconSize: [40, 52], iconAnchor: [20, 50], popupAnchor: [0, -44] });
  }
  function poiIcon(name) {
    return L.divIcon({ className: "", html: `<div class="yc-pin yc-pin--poi"><span class="yc-pin__head"><span class="ms">${name || "place"}</span></span><span class="yc-pin__tip"></span></div>`, iconSize: [40, 52], iconAnchor: [20, 44], popupAnchor: [0, -40] });
  }
  function userIcon() { return L.divIcon({ className: "", html: `<span class="yc-map-user"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] }); }
  function vehicleIcon(kind, bearing) {
    const rot = Math.round(bearing || 0);
    const svg = kind === "moto" || kind === "courier"
      ? `<svg width="22" height="40" viewBox="0 0 22 40" style="filter:drop-shadow(0 3px 5px rgba(0,0,0,.45))"><rect x="7" y="2" width="8" height="36" rx="4" fill="#0A0A0A"/><rect x="4" y="8" width="14" height="10" rx="3" fill="${kind === "courier" ? "#C9A227" : "#F4E4B3"}"/><rect x="8" y="20" width="6" height="10" rx="2" fill="#C9A227"/><circle cx="11" cy="4" r="2" fill="#F4E4B3"/></svg>`
      : `<svg width="26" height="44" viewBox="0 0 26 44" style="filter:drop-shadow(0 3px 5px rgba(0,0,0,.45))"><rect x="3" y="2" width="20" height="40" rx="7" fill="#0A0A0A"/><rect x="4.5" y="3.5" width="17" height="37" rx="6" fill="#171717"/><rect x="6" y="10" width="14" height="9" rx="2.5" fill="#F4E4B3" opacity=".95"/><rect x="6" y="26" width="14" height="7" rx="2.5" fill="#C9A227" opacity=".85"/><rect x="7" y="4" width="4" height="3" rx="1" fill="#F4E4B3"/><rect x="15" y="4" width="4" height="3" rx="1" fill="#F4E4B3"/></svg>`;
    return L.divIcon({ className: "", html: `<div class="yc-vehicle" style="transform:rotate(${rot}deg)">${svg}</div>`, iconSize: [44, 44], iconAnchor: [22, 22] });
  }

  /* ---------- Instance de carte ---------- */
  function create(elId, opts) {
    opts = opts || {};
    const el = document.getElementById(elId);
    if (!el || typeof L === "undefined") return null;
    /* Double rendu rapide (rAF) sur le même élément : on libère l'instance précédente */
    if (el._leaflet_id) {
      const old = instances.find((i) => i.map && i.map.getContainer() === el);
      if (old) old.destroy(); else { try { delete el._leaflet_id; } catch (e) { el._leaflet_id = undefined; } el.innerHTML = ""; }
    }
    const city = YCData.cityOf(opts.city || ACState.user.city);
    /* Contexte d'empilement isolé : les calques Leaflet (z 400-1000) ne passent plus au-dessus des feuilles et boutons de l'écran */
    el.style.isolation = "isolate"; el.style.zIndex = "0";
    if (!el.style.position && getComputedStyle(el).position === "static") el.style.position = "relative";
    const map = L.map(el, { zoomControl: false, attributionControl: true, dragging: opts.interactive !== false, scrollWheelZoom: opts.interactive !== false, tapTolerance: 15 })
      .setView([opts.lat || city.lat, opts.lng || city.lng], opts.zoom || city.zoom || 12);
    if (opts.zoomControl !== false) L.control.zoom({ position: opts.zoomPosition || "bottomright" }).addTo(map);
    const providers = [
      { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
      { url: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", attr: "&copy; OpenStreetMap France" },
      { url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", attr: "&copy; OpenStreetMap, HOT" }
    ];
    let idx = 0;
    (function mount() {
      const p = providers[Math.min(idx, providers.length - 1)];
      const layer = L.tileLayer(p.url, { maxZoom: 19, attribution: p.attr, subdomains: "abc" });
      let failed = 0;
      layer.on("tileerror", () => { failed++; if (failed >= 3 && idx < providers.length - 1 && map.hasLayer(layer)) { map.removeLayer(layer); idx++; mount(); } });
      layer.addTo(map);
    })();

    const inst = {
      map, markers: {}, layers: [], anim: null, timers: [],
      setPin(role, latlng, label) {
        if (!latlng) { if (this.markers[role]) { map.removeLayer(this.markers[role]); delete this.markers[role]; } return; }
        if (this.markers[role]) this.markers[role].setLatLng(latlng);
        else this.markers[role] = L.marker(latlng, { icon: pinIcon(role), zIndexOffset: role === "from" ? 500 : 520 }).addTo(map);
        if (label) this.markers[role].bindPopup(`<b>${role === "from" ? "Départ" : "Destination"}</b><br><span style="color:#52525B">${UI.esc(label)}</span>`);
      },
      addPoi(latlng, iconName, popup, onClick) {
        const m = L.marker(latlng, { icon: poiIcon(iconName), zIndexOffset: 300 }).addTo(map);
        if (popup) m.bindPopup(popup);
        if (onClick) m.on("click", onClick);
        this.layers.push(m); return m;
      },
      setUser(latlng) {
        if (!latlng) return;
        if (this.markers.user) this.markers.user.setLatLng(latlng);
        else this.markers.user = L.marker(latlng, { icon: userIcon(), zIndexOffset: 400 }).addTo(map).bindPopup("<b>Ma position</b>");
      },
      drawRoute(coords, style) {
        if (this.markers.route) map.removeLayer(this.markers.route);
        this.markers.route = L.polyline(coords, Object.assign({ color: "#0A0A0A", weight: 5, opacity: 0.9, lineJoin: "round", lineCap: "round" }, style || {})).addTo(map);
        return this.markers.route;
      },
      drawPending(a, b) { this.drawRoute([[a.lat, a.lng], [b.lat, b.lng]], { color: "#C9A227", weight: 4, opacity: 0.65, dashArray: "8 10" }); },
      fit(coords, pad) {
        if (!coords || coords.length < 2) return;
        map.fitBounds(L.latLngBounds(coords), Object.assign({ paddingTopLeft: [40, 60], paddingBottomRight: [40, 60], maxZoom: 16, animate: false }, pad || {}));
      },
      setView(lat, lng, z) { map.setView([lat, lng], z || 14); },
      invalidate() { setTimeout(() => { try { map.invalidateSize(); } catch (e) { /* no-op */ } }, 60); },
      onClick(fn) { if (opts.interactive !== false) map.on("click", (e) => fn({ lat: e.latlng.lat, lng: e.latlng.lng })); },
      /* Anime un véhicule le long d'un tracé. opts: {visualSec, realSec, kind, color, onTick, onDone} */
      animate(coords, o) {
        this.stopAnim();
        const cum = [0];
        for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + haversineKm(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]));
        const total = cum[cum.length - 1] || 0.5;
        const start = performance.now();
        const self = this;
        if (!this.markers.vehicle) {
          const p0 = pointAlong(coords, cum, 0);
          this.markers.vehicle = L.marker([p0.lat, p0.lng], { icon: vehicleIcon(o.kind, p0.bearing), zIndexOffset: 600 }).addTo(map);
        }
        if (this.markers.done) { map.removeLayer(this.markers.done); this.markers.done = null; }
        let lastBearing = null;
        function tick(now) {
          if (!self.map || !self.markers.vehicle) return;
          const t = Math.min(1, (now - start) / ((o.visualSec || 30) * 1000));
          const p = pointAlong(coords, cum, t);
          self.markers.vehicle.setLatLng([p.lat, p.lng]);
          if (lastBearing == null || Math.abs(p.bearing - lastBearing) > 2) { self.markers.vehicle.setIcon(vehicleIcon(o.kind, p.bearing)); lastBearing = p.bearing; }
          if (self.markers.done) map.removeLayer(self.markers.done);
          const done = coords.slice(0, p.index).concat([[p.lat, p.lng]]);
          if (done.length > 1) self.markers.done = L.polyline(done, { color: o.color || "#C9A227", weight: 6, opacity: 0.95, lineJoin: "round", lineCap: "round" }).addTo(map);
          if (self.markers.route) { const remain = [[p.lat, p.lng]].concat(coords.slice(p.index)); self.markers.route.setLatLngs(remain.length > 1 ? remain : [[p.lat, p.lng], [p.lat, p.lng]]); }
          const inner = map.getBounds().pad(-0.25);
          if (o.follow !== false && !inner.contains(L.latLng(p.lat, p.lng))) map.panTo([p.lat, p.lng], { animate: true, duration: 0.6 });
          if (o.onTick) o.onTick(t, Math.max(0, total * (1 - t)), Math.max(0, (o.realSec || 600) * (1 - t)));
          if (t < 1) self.anim = requestAnimationFrame(tick); else { self.anim = null; if (o.onDone) o.onDone(); }
        }
        this.anim = requestAnimationFrame(tick);
      },
      stopAnim() { if (this.anim) { cancelAnimationFrame(this.anim); this.anim = null; } this.timers.forEach(clearTimeout); this.timers = []; },
      after(ms, fn) { const id = setTimeout(fn, ms); this.timers.push(id); return id; },
      clearVehicle() { if (this.markers.vehicle) { map.removeLayer(this.markers.vehicle); this.markers.vehicle = null; } if (this.markers.done) { map.removeLayer(this.markers.done); this.markers.done = null; } },
      destroy() {
        this.stopAnim();
        try { map.off(); map.remove(); } catch (e) { /* déjà retirée */ }
        this.map = null;
        const i = instances.indexOf(this); if (i >= 0) instances.splice(i, 1);
      }
    };
    instances.push(inst);
    inst.invalidate();
    return inst;
  }
  function pointAlong(coords, cum, t) {
    const total = cum[cum.length - 1] || 0;
    if (coords.length < 2 || total === 0) { const p = coords[coords.length - 1] || [0, 0]; return { lat: p[0], lng: p[1], bearing: 0, index: coords.length - 1 }; }
    const target = Math.min(total, Math.max(0, t * total));
    let i = 1; while (i < cum.length - 1 && cum[i] < target) i++;
    const f = (target - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1e-9);
    const a = coords[i - 1], b = coords[i];
    return { lat: lerp(a[0], b[0], f), lng: lerp(a[1], b[1], f), bearing: bearingDeg(a[0], a[1], b[0], b[1]), index: i };
  }
  function destroyAll() { instances.slice().forEach((i) => i.destroy()); }

  /* Géolocalisation : repli sur le centre de la ville courante */
  function locate(cb) {
    const c = YCData.cityOf(ACState.user.city);
    const fallback = { lat: c.lat + 0.004, lng: c.lng + 0.003, ok: false };
    if (!navigator.geolocation) { cb(fallback); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        /* Si l'utilisateur est loin de la ville démo (desktop en Europe…), on reste sur la ville */
        const far = haversineKm(pos.coords.latitude, pos.coords.longitude, c.lat, c.lng) > 150;
        cb(far ? fallback : { lat: pos.coords.latitude, lng: pos.coords.longitude, ok: true });
      },
      () => cb(fallback), { enableHighAccuracy: true, maximumAge: 8000, timeout: 6000 }
    );
  }

  /* Formats */
  function fmtKm(km) { return (Math.round((km || 0) * 10) / 10).toFixed(1).replace(".", ",") + " km"; }
  function fmtEta(sec) {
    const s = Math.max(0, Math.round(sec)); if (s < 60) return "< 1 min";
    const m = Math.ceil(s / 60); if (m >= 60) { const h = Math.floor(m / 60), r = m % 60; return h + " h" + (r ? " " + String(r).padStart(2, "0") : ""); }
    return m + " min";
  }
  function clockIn(sec) { const d = new Date(Date.now() + Math.max(0, sec) * 1000); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }

  /* Les écrans libèrent leurs cartes à la navigation */
  document.addEventListener("yc:navigate", destroyAll);
  window.addEventListener("resize", () => instances.forEach((i) => i.invalidate()));

  window.YCMap = { create, destroyAll, fetchRoute, straightRoute, geocode, localPlaces, locate, bearingDeg, destinationPoint, haversineKm, fmtKm, fmtEta, clockIn, URBAN_SPEED_KMH };
})();
