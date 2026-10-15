// Livraison : catégories, adresses, estimation, livreur, suivi sur carte, preuve
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc } = UI;
  const M = () => window.YCMap;

  const CATS = [
    { id: "repas", label: "Repas", icon: "lunch_dining", hint: "Depuis un restaurant ou un domicile", vehicles: ["moto", "velo"] },
    { id: "colis", label: "Colis", icon: "package_2", hint: "Jusqu'à 25 kg", vehicles: ["moto", "velo", "voiture"] },
    { id: "documents", label: "Documents", icon: "description", hint: "Enveloppe, dossier, contrat", vehicles: ["moto", "velo"] },
    { id: "produits", label: "Produits", icon: "shopping_bag", hint: "Achats, courses, Youss Market", vehicles: ["moto", "voiture"] }
  ];
  const VEHICLES = [
    { id: "velo", label: "Vélo", icon: "pedal_bike", base: 700, perKm: 150, speed: 14, note: "Écologique · < 5 kg" },
    { id: "moto", label: "Moto", icon: "two_wheeler", base: 1000, perKm: 250, speed: 24, note: "Le plus rapide" },
    { id: "voiture", label: "Voiture", icon: "directions_car", base: 2000, perKm: 350, speed: 22, note: "Volumineux · fragile" }
  ];
  const SIZES = [{ id: "S", label: "Petit", sub: "Sac à main" }, { id: "M", label: "Moyen", sub: "Carton 40 cm" }, { id: "L", label: "Grand", sub: "Valise" }];

  const parcel = { cat: "colis", from: null, to: null, recipient: "", recipientPhone: "", size: "M", fragile: false, note: "", vehicle: "moto", method: "wallet", km: 0, price: 0, eta: 0, courier: null, status: "idle", route: null, code: null };
  let activeField = null, suggestTimer = null, map = null;

  const vehicleOf = () => VEHICLES.find((v) => v.id === parcel.vehicle) || VEHICLES[1];
  function estimate() {
    if (!parcel.from || !parcel.to) { parcel.km = 0; parcel.price = 0; parcel.eta = 0; return; }
    parcel.km = Math.round(M().haversineKm(parcel.from.lat, parcel.from.lng, parcel.to.lat, parcel.to.lng) * 1.3 * 10) / 10;
    const v = vehicleOf();
    let p = v.base + parcel.km * v.perKm;
    if (parcel.size === "L") p += 500; if (parcel.fragile) p += 300;
    parcel.price = Math.max(800, Math.round(p / 100) * 100);
    parcel.eta = Math.round((parcel.km / v.speed) * 60) + 8;
  }
  function defaults() {
    const city = YCData.cityOf(ACState.user.city);
    if (!parcel.from || parcel.from.city !== city.name) { const p = city.poi.find((x) => x.kind === "marche") || city.poi[0]; parcel.from = { name: p.name, lat: p.lat, lng: p.lng, city: city.name }; }
    if (!parcel.to || parcel.to.city !== city.name) { const a = ACState.addresses[0]; parcel.to = a && a.lat && ACState.user.city === "Cotonou" ? { name: a.label + " · " + a.detail, lat: a.lat, lng: a.lng, city: city.name } : { name: city.poi[4].name, lat: city.poi[4].lat, lng: city.poi[4].lng, city: city.name }; }
  }

  Screens.delivery = function (container) {
    defaults(); estimate();
    const cat = CATS.find((c) => c.id === parcel.cat);
    if (cat.vehicles.indexOf(parcel.vehicle) < 0) parcel.vehicle = cat.vehicles[0];
    const body = `
      <div class="grid lg:grid-cols-[1fr_380px] gap-6 min-w-0">
        <div class="space-y-5 min-w-0">
          <section><p class="t-caption mb-2">Type d'envoi</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">${CATS.map((c) => `<button type="button" onclick="Screens._dlCat('${c.id}')" class="min-w-0 rounded-2xl border p-3.5 text-left transition-colors ${parcel.cat === c.id ? "border-gold bg-gold/10" : "border-line bg-card hover:bg-surface-low"}" aria-pressed="${parcel.cat === c.id}">
              <span class="w-10 h-10 rounded-xl ${parcel.cat === c.id ? "bg-gold text-[#0A0A0A]" : "bg-surface-low"} flex items-center justify-center mb-2">${icon(c.icon, "text-[22px]")}</span><span class="block t-title">${c.label}</span><span class="block t-small text-ink-2 break-words">${c.hint}</span></button>`).join("")}</div>
          </section>
          <section class="card p-4 space-y-3 relative">
            <p class="t-caption text-ink-3">Adresses</p>
            ${addrField("from", "Adresse de récupération", parcel.from.name, "radio_button_checked", "text-gold")}
            ${addrField("to", "Adresse de livraison", parcel.to.name, "location_on", "text-ink")}
            <div id="dl-suggest" class="hidden absolute left-4 right-4 card z-20 max-h-[240px] overflow-y-auto"></div>
            <div class="flex gap-2 overflow-x-auto no-scrollbar min-w-0 max-w-full">${ACState.addresses.map((a) => `<button type="button" onclick="Screens._dlUseAddress('${a.id}')" class="chip">${icon(a.icon || "place", "text-[15px]")}Livrer à ${esc(a.label)}</button>`).join("")}<button type="button" onclick="Screens._dlSwap()" class="chip">${icon("swap_vert", "text-[15px]")}Inverser</button></div>
          </section>
          <section class="card p-4 space-y-3">
            <p class="t-caption text-ink-3">Destinataire</p>
            <div class="grid sm:grid-cols-2 gap-3">${UI.field("dl-recipient", "Nom", { value: parcel.recipient, placeholder: "Ex. Fatou Diallo", icon: "person" })}${UI.field("dl-phone", "Téléphone", { value: parcel.recipientPhone, placeholder: ACState.user.dial + " …", type: "tel", icon: "call" })}</div>
          </section>
          <section class="card p-4 space-y-3">
            <p class="t-caption text-ink-3">Informations sur ${cat.label.toLowerCase() === "repas" ? "le repas" : cat.label.toLowerCase() === "documents" ? "les documents" : "le colis"}</p>
            ${parcel.cat !== "documents" ? `<div class="grid grid-cols-3 gap-2">${SIZES.map((s) => `<button type="button" onclick="Screens._dlSize('${s.id}')" class="rounded-xl border p-3 text-left ${parcel.size === s.id ? "border-gold bg-gold/10" : "border-line"}"><span class="block t-title">${s.label}</span><span class="block t-small text-ink-2">${s.sub}</span></button>`).join("")}</div>` : ""}
            <div class="flex items-center justify-between"><span class="t-body">Fragile / manipuler avec soin</span>${UI.toggle(parcel.fragile, "Screens._dlFragile()", "Fragile")}</div>
            <textarea id="dl-note" class="textarea" placeholder="Instructions pour le livreur (étage, code, horaire…)">${esc(parcel.note)}</textarea>
          </section>
          <section><p class="t-caption text-ink-3 mb-2">Véhicule</p>
            <div class="grid sm:grid-cols-3 gap-2.5">${VEHICLES.filter((v) => cat.vehicles.indexOf(v.id) >= 0).map((v) => `<button type="button" onclick="Screens._dlVehicle('${v.id}')" class="rounded-2xl border p-3.5 text-left ${parcel.vehicle === v.id ? "border-gold bg-gold/10" : "border-line bg-card"}">
              <span class="flex items-center justify-between"><span class="w-10 h-10 rounded-xl ${parcel.vehicle === v.id ? "bg-gold text-[#0A0A0A]" : "bg-surface-low"} flex items-center justify-center">${icon(v.icon, "text-[22px]")}</span><span class="t-title font-extrabold">${parcel.km ? ACStore.fmtFCFA(Math.max(800, Math.round((v.base + parcel.km * v.perKm + (parcel.size === "L" ? 500 : 0) + (parcel.fragile ? 300 : 0)) / 100) * 100)) : "..."}</span></span>
              <span class="block t-title mt-2">${v.label}</span><span class="block t-small text-ink-2">${v.note} · ≈ ${Math.round((parcel.km / v.speed) * 60) + 8} min</span></button>`).join("")}</div>
          </section>
        </div>
        <aside class="space-y-4 lg:sticky lg:top-24 self-start">
          <div class="card overflow-hidden"><div id="dl-map" class="h-44 lg:h-56 bg-surface-low"></div>
            <div class="p-4">
              <p class="t-caption text-gold-deep dark:text-gold">Estimation</p>
              <div class="flex items-end justify-between mt-1"><div><p class="t-h1">${ACStore.fmtFCFA(parcel.price)}</p><p class="t-small text-ink-2">${M().fmtKm(parcel.km)} · ${vehicleOf().label}</p></div><div class="text-right"><p class="t-h3">≈ ${parcel.eta} min</p><p class="t-small text-ink-2">délai estimé</p></div></div>
              <div class="mt-3 space-y-0.5">${UI.row("Base " + vehicleOf().label, ACStore.fmtFCFA(vehicleOf().base))}${UI.row("Distance", M().fmtKm(parcel.km) + " × " + vehicleOf().perKm + " F")}${parcel.size === "L" ? UI.row("Grand format", "+500 FCFA") : ""}${parcel.fragile ? UI.row("Fragile", "+300 FCFA") : ""}</div>
            </div></div>
          ${UI.primaryButton("Confirmer la livraison", "Screens._deliveryContinue()", { size: "lg", iconRight: "arrow_forward" })}
          <p class="t-small text-ink-3 text-center">Suivi en direct, preuve de remise et assurance jusqu'à 100 000 FCFA.</p>
        </aside>
      </div>`;
    Shell.render(container, { title: "Livraison", subtitle: "Colis et repas", back: "App.nav('home')", body, nav: false, onMount: () => {
      map = M().create("dl-map", { interactive: false, zoomControl: false });
      drawMiniMap();
    } });
  };
  function drawMiniMap() {
    if (!map || !map.map) return;
    map.setPin("from", [parcel.from.lat, parcel.from.lng]); map.setPin("to", [parcel.to.lat, parcel.to.lng]);
    map.drawPending(parcel.from, parcel.to); map.fit([[parcel.from.lat, parcel.from.lng], [parcel.to.lat, parcel.to.lng]], { paddingTopLeft: [30, 30], paddingBottomRight: [30, 30] });
    M().fetchRoute(parcel.from, parcel.to).then((r) => { parcel.route = r; if (map && map.map && App.current.id === "delivery") { map.drawRoute(r.coords); map.fit(r.coords, { paddingTopLeft: [30, 30], paddingBottomRight: [30, 30] }); } });
  }
  function addrField(role, label, value, ic, cls) {
    return `<label class="block"><span class="label">${label}</span><span class="relative block"><span class="absolute left-3.5 top-1/2 -translate-y-1/2 ${cls}">${icon(ic, "text-[20px]")}</span>
      <input id="dl-${role}" value="${esc(value)}" placeholder="Quartier, lieu, adresse…" autocomplete="off" spellcheck="false" enterkeyhint="done" class="input pl-11" onfocus="Screens._dlFocus('${role}')" oninput="Screens._dlInput('${role}', this.value)" onblur="Screens._dlBlur('${role}')" onkeydown="Screens._dlKey(event, '${role}')"/></span></label>`;
  }
  function saveFields() {
    const r = document.getElementById("dl-recipient"), p = document.getElementById("dl-phone"), n = document.getElementById("dl-note");
    if (r) parcel.recipient = r.value.trim(); if (p) parcel.recipientPhone = p.value.trim(); if (n) parcel.note = n.value.trim();
  }
  const rerender = () => { saveFields(); App.replace("delivery"); };
  Screens._dlCat = (id) => { parcel.cat = id; rerender(); };
  Screens._dlSize = (id) => { parcel.size = id; rerender(); };
  Screens._dlFragile = () => { parcel.fragile = !parcel.fragile; rerender(); };
  Screens._dlVehicle = (id) => { parcel.vehicle = id; rerender(); };
  Screens._dlSwap = () => { const f = parcel.from; parcel.from = parcel.to; parcel.to = f; rerender(); };
  Screens._dlUseAddress = (id) => { const a = ACState.addresses.find((x) => x.id === id); if (!a) return; const c = YCData.cityOf(ACState.user.city); parcel.to = { name: a.label + " · " + a.detail, lat: a.lat || c.lat, lng: a.lng || c.lng, city: c.name }; rerender(); };
  let lastList = [];
  function showSuggest(list) {
    const box = document.getElementById("dl-suggest"); if (!box) return;
    lastList = list;
    const field = document.getElementById("dl-" + activeField);
    if (field) { const sec = box.offsetParent || box.parentElement; const fr = field.getBoundingClientRect(), sr = sec.getBoundingClientRect(); box.style.top = (fr.bottom - sr.top + 6) + "px"; }
    const here = `<button type="button" onmousedown="event.preventDefault()" onclick="Screens._dlUseHere()" class="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-surface-low border-b border-line"><span class="menu-icon !w-9 !h-9 !bg-gold-soft !text-gold-deep">${icon("my_location", "text-[18px]")}</span><span class="min-w-0"><span class="block t-small font-semibold truncate">Utiliser ma position actuelle</span><span class="block t-small text-ink-3 truncate">Demande l'accès à votre position · ${esc(ACState.user.country)}</span></span></button>`;
    const rows = list.length ? list.map((s, i) => `<button type="button" onmousedown="event.preventDefault()" onclick="Screens._dlPick(${i})" class="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-surface-low border-b border-line last:border-0"><span class="menu-icon !w-9 !h-9">${icon(s.icon || "place", "text-[18px]")}</span><span class="min-w-0"><span class="block t-small font-semibold truncate">${esc(s.name)}</span><span class="block t-small text-ink-3 truncate">${esc(s.detail)}</span></span></button>`).join("") : `<p class="px-4 py-3 t-small text-ink-2">Aucun lieu dans ${esc(ACState.user.country)}. Validez avec Entrée pour garder une adresse de ce pays.</p>`;
    box.innerHTML = here + rows;
    box.classList.remove("hidden");
  }
  const hideSuggest = () => { const b = document.getElementById("dl-suggest"); if (b) b.classList.add("hidden"); };
  Screens._dlFocus = (role) => { activeField = role; const f = document.getElementById("dl-" + role); if (f) f.select(); showSuggest(M().localPlaces("", ACState.user.city)); };
  Screens._dlInput = (role, v) => { activeField = role; clearTimeout(suggestTimer); const local = M().localPlaces(v, ACState.user.city); showSuggest(local); if (v.trim().length >= 2) suggestTimer = setTimeout(() => M().geocode(v, ACState.user.city).then((remote) => { if (activeField === role) showSuggest(local.concat(remote).slice(0, 7)); }), 350); };
  Screens._dlKey = (ev, role) => {
    if (ev.key === "Escape") { hideSuggest(); ev.target.blur(); return; }
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    if (lastList.length) { Screens._dlPick(0); return; }
    const v = ev.target.value; picking = true; ev.target.blur(); picking = false; hideSuggest();
    commitTyped(role, v);
  };
  // Si l'utilisateur a tapé une adresse sans choisir de suggestion, on la garde quand même.
  let pendingRerender = false;
  function commitTyped(role, text) {
    const t = String(text || "").trim();
    const cur = parcel[role];
    const otherFocused = () => { const a = document.activeElement; return a && /^dl-(from|to)$/.test(a.id) && a.id !== "dl-" + role; };
    if (!t || (cur && t === cur.name)) {
      const f = document.getElementById("dl-" + role); if (f && cur) f.value = cur.name;
      if (pendingRerender && !otherFocused()) { pendingRerender = false; rerender(); }
      return;
    }
    const before = cur ? cur.name : null;
    M().resolveTyped(t, ACState.user.city).then((p) => {
      if (!p || !App.current || App.current.id !== "delivery") return;
      if ((parcel[role] ? parcel[role].name : null) !== before) return; // choisi ailleurs entre-temps
      if (p.outside) { UI.toast("Ce lieu est en dehors du pays choisi.", "info"); const f = document.getElementById("dl-" + role); if (f) f.value = before || ""; return; }
      parcel[role] = { name: p.name, lat: p.lat, lng: p.lng, city: ACState.user.city, approx: !!p.approx };
      parcel.route = null;
      if (p.approx) UI.toast("Adresse enregistrée dans " + ACState.user.country + ". Le livreur confirmera la position exacte avec vous.", "info");
      // si l'utilisateur est déjà en train de taper dans l'autre champ, on ne casse pas sa saisie
      if (otherFocused()) { pendingRerender = true; const f = document.getElementById("dl-" + role); if (f) f.value = p.name; estimate(); drawMiniMap(); return; }
      pendingRerender = false; rerenderKeepFocus();
    });
  }
  // Re-rendu sans perdre le champ en cours de saisie (nom, téléphone, note)
  function rerenderKeepFocus() {
    const a = document.activeElement; const id = a && /^(INPUT|TEXTAREA)$/.test(a.tagName) ? a.id : null;
    const pos = id ? a.selectionStart : null;
    rerender();
    if (!id) return;
    const el = document.getElementById(id);
    if (el) { el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch (e) {} }
  }
  let picking = false;
  Screens._dlBlur = (role) => { clearTimeout(suggestTimer); if (picking) return; setTimeout(() => { hideSuggest(); const f = document.getElementById("dl-" + role); if (f) commitTyped(role, f.value); }, 160); };
  Screens._dlPick = (i) => {
    const s = lastList[i]; if (!s) return;
    if (YCData.countryCodeAt(s.lat, s.lng) !== ACState.user.countryCode) { UI.toast("Ce lieu est en dehors du pays choisi.", "info"); return; }
    hideSuggest(); picking = true; parcel[activeField] = { name: s.name, lat: s.lat, lng: s.lng, city: ACState.user.city }; parcel.route = null; rerender(); picking = false;
  };
  Screens._dlUseHere = function () {
    const role = activeField || "from";
    UI.toast("Demande d'accès à votre position…", "info");
    M().locate((pos) => {
      if (!pos.ok) {
        if (pos.denied) UI.toast("Accès refusé. Autorisez la position dans votre navigateur, puis réessayez.", "error");
        else if (pos.outside) UI.toast("Votre position est en dehors du pays choisi. Les destinations restent dans ce pays.", "info");
        else UI.toast("Position indisponible. Réessayez.", "error");
        return;
      }
      hideSuggest(); picking = true;
      parcel[role] = { name: "Position actuelle", lat: pos.lat, lng: pos.lng, city: ACState.user.city };
      parcel.route = null; rerender(); picking = false;
      UI.toast(role === "from" ? "Départ placé sur votre position." : "Destination placée sur votre position.", "success");
    });
  };

  Screens._deliveryContinue = function () {
    saveFields();
    if (!parcel.recipient) { UI.toast("Indiquez le nom du destinataire.", "error"); const el = document.getElementById("dl-recipient"); if (el) el.focus(); return; }
    if (parcel.recipientPhone.replace(/\D/g, "").length < 8) { UI.toast("Indiquez un téléphone valide pour le destinataire.", "error"); const el = document.getElementById("dl-phone"); if (el) el.focus(); return; }
    estimate(); App.nav("deliveryConfirm");
  };

  // Récapitulatif + paiement
  Screens.deliveryConfirm = function (container) {
    if (!parcel.from || !parcel.to) { App.resetTo("delivery"); return; }
    estimate();
    const cat = CATS.find((c) => c.id === parcel.cat), v = vehicleOf();
    const body = `<div class="grid lg:grid-cols-[1fr_380px] gap-6">
      <div class="space-y-4">
        <div class="card p-4 space-y-3">
          <div class="flex items-center gap-3"><span class="menu-icon">${icon(cat.icon)}</span><div><p class="t-title">${cat.label}${parcel.cat !== "documents" ? " · format " + parcel.size : ""}${parcel.fragile ? " · fragile" : ""}</p><p class="t-small text-ink-2">${v.label} · ${M().fmtKm(parcel.km)} · ≈ ${parcel.eta} min</p></div></div>
          <div class="divider"></div>
          <div class="flex gap-3"><span class="w-2.5 h-2.5 rounded-full bg-gold mt-1.5 flex-shrink-0"></span><div><p class="t-caption text-ink-3">Récupération</p><p class="t-title">${esc(parcel.from.name)}</p></div></div>
          <div class="flex gap-3"><span class="w-2.5 h-2.5 rounded-sm bg-ink mt-1.5 flex-shrink-0"></span><div><p class="t-caption text-ink-3">Livraison</p><p class="t-title">${esc(parcel.to.name)}</p><p class="t-small text-ink-2">${esc(parcel.recipient)} · ${esc(parcel.recipientPhone)}</p></div></div>
          ${parcel.note ? `<p class="t-small text-ink-2 bg-surface-low rounded-xl p-3">${icon("sticky_note_2", "text-[15px]")} ${esc(parcel.note)}</p>` : ""}
        </div>
        <div class="card p-4"><p class="t-caption text-ink-3 mb-2">Moyen de paiement</p><div class="space-y-2">${ACState.paymentMethods.map((m) => `<button type="button" onclick="Screens._dlMethod('${m.type}')" class="w-full flex items-center gap-3 rounded-xl border p-3 text-left ${parcel.method === m.type ? "border-gold bg-gold/10" : "border-line"}"><span class="menu-icon">${icon(m.icon)}</span><span class="flex-1"><span class="block t-title">${m.label}</span><span class="block t-small text-ink-2">${m.sub}</span></span>${parcel.method === m.type ? icon("check_circle", "text-gold", true) : ""}</button>`).join("")}</div></div>
      </div>
      <aside class="space-y-4 lg:sticky lg:top-24 self-start">
        <div class="card-dark p-5"><p class="t-caption text-gold">Total</p>${UI.row("Livraison " + v.label, ACStore.fmtFCFA(parcel.price))}${UI.row("Assurance", "Incluse")}<div class="divider border-white/15 my-2"></div><div class="flex items-center justify-between"><span class="t-title">À payer</span><span class="t-h2">${ACStore.fmtFCFA(parcel.price)}</span></div></div>
        ${UI.primaryButton("Confirmer la livraison", "Screens._payDelivery()", { size: "lg", icon: "lock", id: "yc-pay-delivery" })}
      </aside></div>`;
    Shell.render(container, { title: "Récapitulatif", subtitle: "Livraison", back: true, body, nav: false });
  };
  Screens._dlMethod = (t) => { parcel.method = t; if (t === "card" && Screens.needCard("card")) return; App.replace("deliveryConfirm", {}, { keepScroll: true }); };
  Screens._payDelivery = function () {
    if (!parcel.from || !parcel.to || !parcel.price) { UI.toast("Complétez la livraison avant de payer.", "error"); return; }
    if (window.YCBackend && YCBackend.isLive() && window.YCProviders && !YCProviders.ride.connected) {
      parcel.status = "searching";
      parcel.holdId = "";
      App.resetTo("deliverySearching");
      return;
    }
    if (Screens._preferCard) { parcel.method = "card"; Screens._preferCard = false; }
    if (Screens.needCard(parcel.method)) return;
    Screens.requirePay("Livraison · " + ACStore.fmtFCFA(parcel.price), function () { Screens._payDeliveryNow(); });
  };
  Screens._deliveryReceipt = function () {
    const r = window.YCReceipt && YCReceipt.current();
    if (!r) { UI.toast("Aucun reçu disponible.", "info"); return; }
    YCReceipt.download(r);
    UI.toast("Reçu téléchargé.", "success");
  };
  Screens._payDeliveryNow = function () {
    const cat = CATS.find((c) => c.id === parcel.cat);
    ACStore.whenPaid(ACStore.pay({ amount: parcel.price, label: "Livraison " + (cat ? cat.label.toLowerCase() : "colis") + " vers " + parcel.to.name.split("·")[0].trim(), service: "livraison", pointsEarned: 15, method: parcel.method, activity: { status: "En cours", detail: { from: parcel.from.name, to: parcel.to.name, recipient: parcel.recipient, km: parcel.km } } }),
      function (res) {
        parcel.status = "searching"; parcel.code = String(Math.floor(1000 + Math.random() * 8999));
        if (window.YCReceipt) YCReceipt.deliver(res && res.tx, { title: "Reçu livraison" });
        App.resetTo("deliverySearching");
      },
      function (res) { App.nav("paymentFailed", { retry: "deliveryConfirm", amount: parcel.price, reason: res.reason }); });
  };

  Screens.deliverySearching = function (container) {
    if (!parcel.from || !parcel.to) { App.resetTo("delivery"); return; }
    const body = `<div class="flex-1 flex flex-col items-center justify-center text-center py-16 max-w-narrow mx-auto">
      <div class="relative w-32 h-32 rounded-full bg-gold/10 flex items-center justify-center"><div class="absolute inset-0 rounded-full animate-pulse-ring"></div>${icon("local_shipping", "text-gold text-[52px]")}</div>
      <h2 class="t-h1 mt-8">Recherche d'un livreur…</h2><p class="t-body text-ink-2 mt-2">Demande créée · de ${esc(parcel.from.name.split("·")[0])} vers ${esc(parcel.to.name.split("·")[0])}</p>
      <div class="mt-8 w-full max-w-[360px] text-left">${UI.timeline([{ label: "Demande créée", icon: "check" }, { label: "Recherche d'un livreur", icon: "search" }, { label: "Livreur trouvé", icon: "person" }, { label: "Colis récupéré", icon: "inventory_2" }, { label: "Livraison en cours", icon: "near_me" }, { label: "Livraison terminée", icon: "home" }], 1)}</div>
    </div>`;
    const liveHold = window.YCBackend && YCBackend.isLive() && window.YCProviders && !YCProviders.ride.connected;
    if (liveHold) {
      const held = `<div class="flex-1 flex flex-col items-center justify-center text-center py-16 max-w-narrow mx-auto px-4">
        <div class="relative w-32 h-32 rounded-full bg-gold/10 flex items-center justify-center">${icon("local_shipping", "text-gold text-[52px]")}</div>
        <h2 class="t-h1 mt-8">Demande enregistrée</h2>
        <p class="t-body text-ink-2 mt-2 max-w-[360px]">De ${esc(parcel.from.name.split("·")[0])} vers ${esc(parcel.to.name.split("·")[0])}. La demande est enregistrée. Le suivi s'affiche dès qu'un livreur est attribué.</p>
        <button type="button" onclick="App.resetTo('delivery')" class="btn btn-outline mt-10">Retour</button>
      </div>`;
      Shell.render(container, { title: "Recherche d'un livreur", back: "App.nav('home')", body: held, nav: false, hideSearch: true });
      if (!parcel.holdSaved) {
        parcel.holdSaved = true;
        YCProviders.saveRequest("delivery", { from: parcel.from, to: parcel.to, vehicle: parcel.vehicle, price: parcel.price, method: parcel.method }).then(function (res) {
          parcel.holdId = res && res.id ? res.id : "";
          if (!res || !res.ok) UI.toast((res && res.message) || "La demande n'a pas pu être enregistrée.", "error");
        });
      }
      return;
    }
    Shell.render(container, { title: "Recherche d'un livreur", back: "App.nav('home')", body, nav: false, hideSearch: true });
    setTimeout(() => { if (App.current && App.current.id === "deliverySearching") { parcel.courier = YCData.courierFor(ACState.user.city); parcel.status = "found"; ACStore.addNotification("Livreur trouvé", parcel.courier.name + " arrive au point de récupération.", "livraison", "deliveryTracking"); ACStore.emit(); App.replace("deliveryCourierFound"); } }, 2400);
  };

  Screens.deliveryCourierFound = function (container) {
    if (!parcel.courier) { App.resetTo("delivery"); return; }
    const c = parcel.courier;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      ${UI.successHero({ icon: "verified", title: "Livreur trouvé", body: "Votre livreur se dirige vers le point de récupération." })}
      <div class="card p-5 flex flex-col items-center text-center">${UI.avatar(c, "w-24 h-24")}<h3 class="t-h2 mt-3">${esc(c.name)}</h3><p class="t-small text-ink-2">${UI.rating(c.rating, c.deliveries + " livraisons")} · ${c.vehicle}</p>
        <div class="grid grid-cols-2 gap-2 w-full mt-5"><div class="rounded-xl bg-surface-low p-3"><p class="t-caption text-ink-3">Code de remise</p><p class="t-h3 tracking-[0.3em] mt-0.5">${parcel.code}</p></div><div class="rounded-xl bg-gold-soft p-3"><p class="t-caption text-gold-deep">Arrivée estimée</p><p class="t-h3 text-gold-deep mt-0.5">${parcel.eta} min</p></div></div>
        <p class="t-small text-ink-3 mt-3">Communiquez le code au destinataire : il sera demandé par le livreur à la remise.</p>
        <div class="flex gap-2 w-full mt-4"><button type="button" onclick="Screens._placeCall(${UI.js(c.phone || '')})" class="btn btn-outline flex-1">${icon("call", "text-[20px]")}Appeler</button><button type="button" onclick="App.nav('helpChat')" class="btn btn-outline flex-1">${icon("chat", "text-[20px]")}Message</button></div>
      </div>
      ${UI.primaryButton("Suivre la livraison", "App.replace('deliveryTracking')", { size: "lg", icon: "near_me" })}
    </div>`;
    Shell.render(container, { title: "Livreur trouvé", back: "App.nav('home')", body, nav: false, hideSearch: true });
  };

  // Suivi sur carte
  const STEPS = [{ label: "Demande créée", icon: "check" }, { label: "Recherche d'un livreur", icon: "search" }, { label: "Livreur trouvé", icon: "person" }, { label: "Colis récupéré", icon: "inventory_2" }, { label: "Livraison en cours", icon: "near_me" }, { label: "Livraison terminée", icon: "home" }];
  Screens.deliveryTracking = function (container) {
    if (!parcel.courier) { App.resetTo("delivery"); return; }
    const c = parcel.courier;
    const sheet = `<div class="p-4 lg:p-6 space-y-4">
      <div class="flex items-end justify-between gap-3"><div><p class="t-small text-ink-2" id="dl-label">${esc(c.name.split(" ")[0])} se dirige vers le point de récupération</p><p class="t-h1 text-gold-deep dark:text-gold leading-none" id="dl-eta">…</p></div><div class="text-right"><p class="t-small text-ink-2" id="dl-meta"></p><p class="t-small font-semibold" id="dl-arrival"></p></div></div>
      <div class="h-1.5 rounded-full bg-card-high overflow-hidden"><div id="dl-progress" class="h-full bg-gold transition-[width] duration-200" style="width:0%"></div></div>
      <div id="dl-steps">${UI.timeline(STEPS, 2)}</div>
      <div class="flex items-center gap-3">${UI.avatar(c, "w-12 h-12")}<div class="flex-1 min-w-0"><p class="t-title truncate">${esc(c.name)} · ★ ${c.rating}</p><p class="t-small text-ink-2">${c.vehicle} · code de remise <b class="tracking-widest">${parcel.code}</b></p></div><button type="button" onclick="Screens._placeCall(${UI.js(c.phone || '')})" class="icon-btn" aria-label="Appeler">${icon("call")}</button><button type="button" onclick="App.nav('helpChat')" class="icon-btn" aria-label="Message">${icon("chat")}</button></div>
      <button type="button" id="dl-confirm" onclick="App.nav('deliveryDone')" class="btn btn-lg btn-dark btn-block opacity-50" disabled>Confirmer la réception</button>
    </div>`;
    const body = `<div class="flex-1 min-h-0 relative lg:grid lg:grid-cols-[440px_1fr]">
      <aside class="absolute bottom-0 inset-x-0 z-20 max-h-[62%] overflow-y-auto bg-card border-t border-line rounded-t-3xl lg:static lg:max-h-none lg:rounded-none lg:border-t-0 lg:border-r lg:border-line lg:h-full"><div class="w-10 h-1.5 bg-line rounded-full mx-auto mt-2 lg:hidden"></div>${sheet}</aside>
      <div class="absolute inset-0 lg:static lg:h-full"><div id="dl-track-map" class="absolute inset-0 lg:relative lg:h-full w-full"></div></div></div>`;
    Shell.render(container, { title: "Suivi de livraison", back: "App.nav('home')", body, nav: false, fill: true, hideSearch: true, onMount: startTracking });
  };
  function setDl(o) {
    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.textContent = v; };
    set("dl-label", o.label); set("dl-eta", o.title); set("dl-meta", o.meta); set("dl-arrival", o.arrival);
    const bar = document.getElementById("dl-progress"); if (bar && o.progress != null) bar.style.width = Math.round(o.progress * 100) + "%";
    if (o.step != null) { const s = document.getElementById("dl-steps"); if (s) s.innerHTML = UI.timeline(STEPS, o.step); }
  }
  function startTracking() {
    map = M().create("dl-track-map", { interactive: true, zoomControl: false });
    if (!map) return;
    const first = parcel.courier.name.split(" ")[0];
    map.setPin("from", [parcel.from.lat, parcel.from.lng], parcel.from.name); map.setPin("to", [parcel.to.lat, parcel.to.lng], parcel.to.name);
    const brg = M().bearingDeg(parcel.from.lat, parcel.from.lng, parcel.to.lat, parcel.to.lng);
    const start = M().destinationPoint(parcel.from.lat, parcel.from.lng, (brg + 160) % 360, 0.9);
    Promise.all([M().fetchRoute(start, parcel.from), M().fetchRoute(parcel.from, parcel.to)]).then(([approach, route]) => {
      if (!map || App.current.id !== "deliveryTracking") return;
      parcel.route = route;
      map.map && L.polyline(route.coords, { color: "#0A0A0A", weight: 5, opacity: 0.3, dashArray: "6 10" }).addTo(map.map);
      map.drawRoute(approach.coords, { color: "#C9A227", weight: 5, opacity: 0.9, dashArray: "1 8" });
      map.fit(approach.coords.concat([[parcel.from.lat, parcel.from.lng]]), { paddingTopLeft: [40, 80], paddingBottomRight: [40, 320] });
      setDl({ step: 2, progress: 0 });
      map.animate(approach.coords, { visualSec: 12, realSec: Math.max(120, approach.sec), kind: "courier",
        onTick: (t, km, sec) => setDl({ title: M().fmtEta(sec), meta: first + " à " + M().fmtKm(km) + " du point de récupération", arrival: "Récupération " + M().clockIn(sec), progress: t * 0.35 }),
        onDone: () => {
          setDl({ label: "Colis récupéré", title: "En route", meta: "Vérification du colis…", step: 3, progress: 0.4 });
          UI.toast("Colis récupéré par " + first, "success");
          map.after(1800, () => {
            if (!map || App.current.id !== "deliveryTracking") return;
            map.clearVehicle(); map.drawRoute(route.coords); map.fit(route.coords, { paddingTopLeft: [40, 80], paddingBottomRight: [40, 320] });
            setDl({ label: "Livraison en cours", step: 4 });
            const real = Math.max(180, route.sec);
            map.animate(route.coords, { visualSec: Math.min(60, Math.max(22, route.km * 6)), realSec: real, kind: "courier",
              onTick: (t, km, sec) => setDl({ title: t >= 1 ? "Arrivé" : M().fmtEta(sec), meta: t >= 1 ? "Le livreur est chez le destinataire" : M().fmtKm(km) + " restants", arrival: t >= 1 ? "" : "Livraison prévue " + M().clockIn(sec), progress: 0.4 + t * 0.6 }),
              onDone: () => { setDl({ label: "Livreur arrivé", step: 5, progress: 1 }); const b = document.getElementById("dl-confirm"); if (b) { b.disabled = false; b.classList.remove("opacity-50"); b.classList.add("btn-primary"); } ACStore.addNotification("Livreur arrivé", first + " est arrivé à " + parcel.to.name.split("·")[0] + ". Code de remise : " + parcel.code, "livraison", "deliveryTracking"); ACStore.emit(); UI.toast("Le livreur est arrivé. Code : " + parcel.code, "success"); }
            });
          });
        }
      });
    });
  }

  Screens.deliveryDone = function (container) {
    const c = parcel.courier || {};
    const act = ACState.activities.find((a) => a.service === "livraison" && a.status === "En cours");
    if (act) { act.status = "Livré"; ACStore.emit(); }
    const city = ACState.user.city;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      ${UI.successHero({ icon: "task_alt", title: "Livraison terminée", body: "Remis à " + esc(parcel.recipient || "destinataire") + " · " + esc((parcel.to || {}).name || "") })}
      <div class="card p-5 space-y-3">
        <div class="flex items-center gap-3">${UI.avatar(c, "w-12 h-12")}<div class="flex-1"><p class="t-title">${esc(c.name || "Livreur")}</p><p class="t-small text-ink-2">Preuve de remise · code ${parcel.code} vérifié · ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p></div>${UI.badge("Vérifié", "success")}</div>
        <div class="rounded-xl bg-surface-low p-3 flex items-center gap-3"><span class="w-14 h-14 rounded-lg bg-card-high flex items-center justify-center">${icon("photo_camera", "text-ink-3")}</span><div><p class="t-small font-semibold">Photo de remise</p><p class="t-small text-ink-2">Prise par le livreur à la livraison</p></div></div>
        <div class="text-center pt-1"><p class="t-small text-ink-2 mb-2">Notez votre livreur</p><div class="flex justify-center gap-1">${[1, 2, 3, 4, 5].map(() => `<button type="button" onclick="UI.toast('Merci pour votre note.','success')" class="p-1">${icon("star", "text-[32px] text-ink-3")}</button>`).join("")}</div></div>
      </div>
      ${UI.nextSteps([
        { icon: "workspace_premium", label: "+15 points Youss Bonus", sub: "Voir mes récompenses", onclick: "App.nav('rewards')" },
        { icon: "receipt_long", label: "Télécharger le reçu", sub: "Fichier sur cet appareil", onclick: "Screens._deliveryReceipt()" },
        { icon: "storefront", label: "Commander sur Youss Market", sub: "Livraison incluse", onclick: "App.nav('market')" }
      ])}
      ${UI.secondaryButton(I18N.t("home_btn"), "App.resetTo('home')")}
    </div>`;
    Shell.render(container, { title: "Preuve de livraison", back: "App.nav('home')", body, nav: false, hideSearch: true });
    parcel.status = "done"; parcel.courier = null;
  };
})();
