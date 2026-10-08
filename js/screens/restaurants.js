/* Restaurants — liste, fiche (menu / avis / infos), panier, commande */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;

  const filters = { q: "", cat: "Tout", sort: "pertinence", allCities: false };
  const CATS = ["Tout"].concat(YCData.RESTAURANT_CATS);

  function list() {
    const q = YCData.norm(filters.q).trim(), words = q ? q.split(/\s+/) : [];
    let out = YCData.RESTAURANTS.filter((r) => {
      if (!filters.allCities && r.city !== ACState.user.city) return false;
      if (filters.cat !== "Tout" && r.cat !== filters.cat) return false;
      if (!words.length) return true;
      const hay = YCData.norm([r.name, r.cat, r.area, r.city, r.tags.join(" "), r.menu.map((m) => m.name).join(" ")].join(" "));
      return words.every((w) => hay.includes(w));
    });
    if (filters.sort === "note") out = out.slice().sort((a, b) => b.rating - a.rating);
    if (filters.sort === "distance") out = out.slice().sort((a, b) => a.km - b.km);
    if (filters.sort === "prix") out = out.slice().sort((a, b) => a.avg - b.avg);
    return out;
  }
  function isOpen(r) { const h = new Date().getHours(); return h >= r.open[0] && h < r.open[1]; }

  Screens.restaurants = function (container, params) {
    if (params && params.cat) filters.cat = params.cat;
    const body = `
      <div class="flex flex-col sm:flex-row gap-3">
        <label class="flex-1 relative">${icon("search", "absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 text-[22px] pointer-events-none")}<input id="rs-q" type="search" value="${esc(filters.q)}" placeholder="Rechercher un restaurant ou un plat" oninput="Screens._rsType(this.value)" class="input input-lg pl-12"/></label>
        <div class="flex gap-2">
          <select class="select w-auto" onchange="Screens._rsSort(this.value)" aria-label="Trier">${[["pertinence", "Pertinence"], ["note", "Meilleures notes"], ["distance", "Les plus proches"], ["prix", "Prix croissant"]].map((o) => `<option value="${o[0]}" ${filters.sort === o[0] ? "selected" : ""}>${o[1]}</option>`).join("")}</select>
          <button type="button" onclick="Screens._rsCities()" class="chip h-12 ${filters.allCities ? "on" : ""}">${icon("public", "text-[16px]")}${filters.allCities ? "4 villes" : esc(ACState.user.city)}</button>
        </div>
      </div>
      <div class="hscroll">${CATS.map((c) => UI.chip(c, `Screens._rsCat('${c}')`, filters.cat === c)).join("")}</div>
      <div id="rs-list"></div>`;
    Shell.render(container, { title: "Restaurants", subtitle: (filters.allCities ? "Cotonou · Dakar · Lomé · Accra" : esc(ACState.user.city)) + " · livraison et à emporter", back: "App.nav('home')", body, nav: false, showNav: true, right: cartButton() });
    renderList();
  };
  function renderList() {
    const el = document.getElementById("rs-list"); if (!el) return;
    if (!sessionStorage.getItem("yc-seen-rs")) { sessionStorage.setItem("yc-seen-rs", "1"); el.innerHTML = UI.skeletonList(6, "grid"); setTimeout(renderList, 450); return; }
    const items = list();
    el.innerHTML = items.length
      ? `<p class="t-small text-ink-2 mb-3">${items.length} restaurant${items.length > 1 ? "s" : ""}</p><div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">${items.map(card).join("")}</div>`
      : UI.emptyState({ icon: "restaurant", title: I18N.t("empty_results"), body: filters.allCities ? I18N.t("empty_results_body") : "Aucun restaurant ne correspond à " + esc(ACState.user.city) + ". Essayez les 4 villes.", actionLabel: "Réinitialiser", actionOnclick: "Screens._rsReset()" });
  }
  function card(r) {
    const open = isOpen(r);
    return `<button type="button" onclick="${go("restaurantDetail", { id: r.id })}" class="card card-press overflow-hidden text-left">
      <div class="relative ratio-16-10 bg-card-high overflow-hidden">${UI.img(r.img, r.name)}
        <span class="absolute top-2.5 left-2.5 badge ${open ? "badge-success" : "badge-neutral"}">${open ? "Ouvert" : "Fermé"} · ${r.time}</span>
        <span class="absolute top-2.5 right-2.5 badge bg-white/95 text-ink">${icon("star", "text-gold text-[14px]", true)}${r.rating} <span class="text-ink-3 font-normal">(${r.reviews})</span></span>
      </div>
      <div class="p-4"><div class="flex items-start justify-between gap-2"><h3 class="t-h3 truncate">${r.name}</h3><span class="t-small text-ink-2 whitespace-nowrap mt-1">${r.km} km</span></div>
        <p class="t-small text-ink-2 mt-0.5">${r.cat} · ${r.area}, ${r.city}</p>
        <div class="flex items-center gap-3 mt-2 t-small"><span class="font-semibold">~${ACStore.fmtFCFA(r.avg)}</span><span class="text-ink-3">·</span><span class="text-ink-2">Livraison ${ACStore.fmtFCFA(r.fee)}</span></div>
        <div class="flex gap-1.5 mt-2.5">${r.tags.map((tg) => `<span class="badge badge-neutral">${tg}</span>`).join("")}</div></div>
    </button>`;
  }
  /* Mise à jour en place : le champ garde le focus */
  Screens._rsType = (v) => { filters.q = v; renderList(); };
  Screens._rsSort = (v) => { filters.sort = v; renderList(); };
  Screens._rsCat = (c) => { filters.cat = c; App.replace("restaurants"); };
  Screens._rsCities = () => { filters.allCities = !filters.allCities; App.replace("restaurants"); };
  Screens._rsReset = () => { filters.q = ""; filters.cat = "Tout"; filters.allCities = true; App.replace("restaurants"); };

  function cartButton() {
    const n = ACStore.cartCount();
    return `<button type="button" onclick="App.nav('cartRestaurant')" class="icon-btn relative" aria-label="Panier">${icon("shopping_bag")}${n ? `<span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-[#0A0A0A] text-[10px] font-extrabold flex items-center justify-center">${n}</span>` : ""}</button>`;
  }

  /* ---------- Fiche restaurant ---------- */
  const tabState = { tab: "menu" };
  Screens.restaurantDetail = function (container, params) {
    const r = YCData.restaurant(params.id) || YCData.RESTAURANTS[0];
    if (params.tab) tabState.tab = params.tab;
    const open = isOpen(r);
    const groups = {}; r.menu.forEach((d) => { (groups[d.group] = groups[d.group] || []).push(d); });
    const inCart = (id) => (ACState.cart.restaurant === r.id ? (ACState.cart.items.find((i) => i.id === id) || {}).qty || 0 : 0);
    const dish = (d) => `<div id="dish-${d.id}" class="card p-3 flex gap-3 ${params.dish === d.id ? "ring-2 ring-gold" : ""}">
      <div class="w-24 h-24 lg:w-28 lg:h-28 rounded-xl overflow-hidden bg-card-high flex-shrink-0">${UI.img(d.img, d.name)}</div>
      <div class="flex-1 min-w-0 flex flex-col"><div class="flex items-start justify-between gap-2"><h4 class="t-title">${d.name}</h4>${d.pop ? UI.badge("Populaire", "gold") : ""}</div><p class="t-small text-ink-2 line-clamp-2 mt-0.5">${d.desc}</p>
        <div class="mt-auto pt-2 flex items-center justify-between"><span class="t-title font-extrabold">${ACStore.fmtFCFA(d.price)}</span>
          ${inCart(d.id) ? UI.qtyControl(inCart(d.id), `Screens._cartQty('${d.id}',-1,'${r.id}')`, `Screens._cartQty('${d.id}',1,'${r.id}')`, true) : `<button type="button" onclick="Screens._addToCart('${r.id}','${d.id}')" class="btn btn-sm btn-primary !rounded-full">${icon("add", "text-[18px]")}${I18N.t("add")}</button>`}
        </div></div></div>`;
    const menuHtml = Object.keys(groups).map((g) => `<div><h3 class="t-h3 mb-3">${g}</h3><div class="grid md:grid-cols-2 gap-3">${groups[g].map(dish).join("")}</div></div>`).join("");
    const reviewsHtml = `<div class="card p-5 flex flex-col sm:flex-row sm:items-center gap-5"><div class="text-center sm:text-left"><p class="t-display">${r.rating}</p>${UI.stars(r.rating)}<p class="t-small text-ink-2 mt-1">${r.reviews} avis</p></div>
        <div class="flex-1 space-y-1.5">${[5, 4, 3, 2, 1].map((n) => `<div class="flex items-center gap-2 t-small"><span class="w-3">${n}</span>${icon("star", "text-[12px] text-gold", true)}<div class="flex-1 h-2 rounded-full bg-card-high overflow-hidden"><div class="h-full bg-gold" style="width:${n === 5 ? 68 : n === 4 ? 22 : n === 3 ? 7 : n === 2 ? 2 : 1}%"></div></div></div>`).join("")}</div></div>
      <div class="space-y-3 mt-4">${r.comments.map((c) => `<div class="card p-4"><div class="flex items-center gap-3">${UI.avatar({ name: c.name }, "w-9 h-9")}<div class="flex-1"><p class="t-title">${c.name}</p><p class="t-small text-ink-3">${c.date}</p></div>${UI.stars(c.rating)}</div><p class="t-body text-ink-2 mt-3">${c.text}</p></div>`).join("")}
        <button type="button" onclick="UI.toast('Merci ! Votre avis sera publié après vérification de votre commande.','success')" class="btn btn-outline">${icon("rate_review")}Laisser un avis</button></div>`;
    const infoHtml = `<div class="card overflow-hidden"><div id="rs-map" class="h-48 lg:h-64 bg-surface-low"></div>
        <div class="p-4 space-y-2">${UI.row("Adresse", r.area + ", " + r.city)}${UI.row("Horaires", r.hours + " · " + (open ? '<span class="text-success font-semibold">ouvert</span>' : '<span class="text-danger font-semibold">fermé</span>'))}${UI.row("Livraison", ACStore.fmtFCFA(r.fee) + " · " + r.time)}${UI.row("Prix moyen", ACStore.fmtFCFA(r.avg) + " / personne")}${UI.row("Paiement", "Youss Wallet, espèces, mobile")}
          <div class="flex gap-2 pt-2">${UI.button("Y aller en transport", `Screens._transportPreset({toLatLng:{name:${UI.js(r.name)},lat:${r.lat},lng:${r.lng}}});App.nav('transport')`, { variant: "dark", icon: "directions_car" })}${UI.button("Réserver une table", `Screens._bookTable('${r.id}')`, { variant: "outline", icon: "event_seat" })}</div></div></div>`;
    const tabs = [["menu", "Menu"], ["avis", "Avis (" + r.reviews + ")"], ["infos", "Infos"]];
    const body = `
      <section class="relative rounded-3xl overflow-hidden h-56 lg:h-80 bg-card-high">${UI.img(r.img, r.name, "img-cover", { eager: true })}<div class="absolute inset-0 gradient-up"></div>
        <div class="absolute bottom-4 left-5 right-5 text-white"><div class="flex flex-wrap gap-2 mb-2"><span class="badge ${open ? "badge-success" : "badge-neutral"}">${open ? "Ouvert" : "Fermé"}</span>${r.tags.map((tg) => `<span class="badge bg-white/20 text-white">${tg}</span>`).join("")}</div>
          <h2 class="t-h1">${r.name}</h2><p class="t-body text-white/80 flex flex-wrap items-center gap-x-3 mt-1"><span>${icon("star", "text-gold text-[16px]", true)} ${r.rating} (${r.reviews})</span><span>${r.km} km</span><span>${r.time}</span><span>Livraison ${ACStore.fmtFCFA(r.fee)}</span></p></div>
        <button type="button" onclick="Screens._toggleFavorite('${r.id}')" class="absolute top-4 right-4 icon-btn" aria-label="Favori">${icon("favorite", ACState.favorites.indexOf(r.id) >= 0 ? "text-danger" : "", ACState.favorites.indexOf(r.id) >= 0)}</button>
      </section>
      <p class="t-body text-ink-2 max-w-[760px]">${r.body}</p>
      <div class="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div class="space-y-5 min-w-0">
          <div class="flex gap-2 border-b border-line">${tabs.map((tb) => `<button type="button" onclick="Screens._rsTab('${tb[0]}','${r.id}')" class="h-11 px-3 t-title border-b-2 -mb-px ${tabState.tab === tb[0] ? "border-gold text-ink" : "border-transparent text-ink-3 hover:text-ink"}">${tb[1]}</button>`).join("")}</div>
          <div class="space-y-6">${tabState.tab === "menu" ? menuHtml : tabState.tab === "avis" ? reviewsHtml : infoHtml}</div>
        </div>
        <aside class="lg:sticky lg:top-24">${cartPanel(r)}</aside>
      </div>`;
    Shell.render(container, { title: r.name, subtitle: r.cat + " · " + r.area, back: true, body, nav: false, showNav: true, right: cartButton(), onMount: () => {
      if (tabState.tab === "infos") { const m = YCMap.create("rs-map", { interactive: false, zoomControl: false, lat: r.lat, lng: r.lng, zoom: 15 }); if (m) m.addPoi([r.lat, r.lng], "restaurant", "<b>" + esc(r.name) + "</b>"); }
      if (params.dish) { const el = document.getElementById("dish-" + params.dish); if (el) el.scrollIntoView({ block: "center", behavior: "smooth" }); }
    } });
  };
  function cartPanel(r) {
    const items = ACState.cart.restaurant === r.id ? ACState.cart.items : [];
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
    if (!items.length) return `<div class="hidden lg:block card p-5 text-center"><div class="w-14 h-14 rounded-full bg-surface-low text-gold flex items-center justify-center mx-auto mb-3">${icon("shopping_bag", "text-[28px]")}</div><p class="t-title">Votre panier est vide</p><p class="t-small text-ink-2 mt-1">Ajoutez des plats depuis le menu.</p></div>`;
    return `<div class="fixed bottom-[72px] lg:bottom-auto inset-x-4 lg:inset-x-auto lg:static z-20 card lg:p-5 p-3 shadow-float lg:shadow-card">
      <div class="hidden lg:block"><p class="t-h3 mb-3">Votre panier</p><div class="space-y-2 mb-3 max-h-[260px] overflow-y-auto">${items.map((i) => `<div class="flex items-center justify-between gap-2 t-small"><span class="truncate">${i.qty} × ${esc(i.name)}</span><span class="font-semibold whitespace-nowrap">${ACStore.fmtFCFA(i.price * i.qty)}</span></div>`).join("")}</div>${UI.row("Sous-total", ACStore.fmtFCFA(sub))}${UI.row("Livraison", ACStore.fmtFCFA(r.fee))}<div class="divider my-2"></div>${UI.row("Total", ACStore.fmtFCFA(sub + r.fee), true)}</div>
      ${UI.primaryButton(`Voir le panier · ${ACStore.fmtFCFA(sub + r.fee)}`, "App.nav('cartRestaurant')", { icon: "shopping_bag", cls: "lg:mt-3" })}</div>`;
  }
  Screens._rsTab = (tab, id) => { tabState.tab = tab; App.replace("restaurantDetail", { id, tab }); };
  Screens._toggleFavorite = (id) => { const i = ACState.favorites.indexOf(id); if (i >= 0) ACState.favorites.splice(i, 1); else ACState.favorites.push(id); UI.toast(i >= 0 ? "Retiré des favoris" : "Ajouté aux favoris", "success"); ACStore.emit(); };
  Screens._bookTable = (id) => {
    const r = YCData.restaurant(id);
    UI.openSheet(`<h3 class="t-h3 mb-1">Réserver une table</h3><p class="t-small text-ink-2 mb-4">${esc(r.name)} · ${r.hours}</p>
      <div class="grid grid-cols-2 gap-3">${UI.select("bk-day", "Jour", ["Aujourd'hui", "Demain", "Samedi", "Dimanche"], "Demain")}${UI.select("bk-time", "Heure", ["12:00", "12:30", "13:00", "19:30", "20:00", "20:30", "21:00"], "20:00")}</div>
      <div class="mt-3">${UI.select("bk-pers", "Personnes", ["1", "2", "3", "4", "5", "6"], "2")}</div>
      <div class="mt-5">${UI.primaryButton("Confirmer la réservation", `Screens._bookConfirm('${id}')`, { icon: "event_seat" })}</div>`);
  };
  Screens._bookConfirm = (id) => {
    const r = YCData.restaurant(id);
    const when = document.getElementById("bk-day").value + " " + document.getElementById("bk-time").value, pers = document.getElementById("bk-pers").value;
    UI.closeSheet();
    ACStore.addActivity({ service: "reservation", title: "Réservation · " + r.name + " (" + pers + " pers.)", amount: null, status: "À venir", icon: "event_seat", detail: { when, restaurant: r.name } });
    ACStore.addNotification("Réservation confirmée", r.name + " · " + when + " · " + pers + " personnes.", "restaurant", "activities");
    ACStore.emit(); UI.toast("Table réservée · " + when, "success");
  };

  /* ---------- Panier ---------- */
  Screens._addToCart = function (restId, dishId) {
    const r = YCData.restaurant(restId), d = r.menu.find((x) => x.id === dishId); if (!d) return;
    if (ACState.cart.restaurant && ACState.cart.restaurant !== restId && ACState.cart.items.length) {
      UI.confirm({ title: "Remplacer le panier ?", body: "Votre panier contient des plats d'un autre restaurant. Voulez-vous le vider pour commander chez " + esc(r.name) + " ?", okLabel: "Vider et ajouter", icon: "shopping_bag", onOk: `ACState.cart.items=[];ACState.cart.restaurant=null;Screens._addToCart('${restId}','${dishId}')` });
      return;
    }
    ACState.cart.restaurant = restId;
    const ex = ACState.cart.items.find((i) => i.id === dishId);
    if (ex) ex.qty += 1; else ACState.cart.items.push({ id: dishId, name: d.name, price: d.price, qty: 1, img: d.img });
    ACStore.emit(); UI.toast(d.name + " ajouté au panier", "success");
    if (App.current && App.current.id === "restaurantDetail") App.replace("restaurantDetail", App.current.params);
  };
  Screens._cartSeed = function (restId, dishIds) { ACState.cart.restaurant = restId; ACState.cart.items = []; const r = YCData.restaurant(restId); dishIds.forEach((id) => { const d = r.menu.find((x) => x.id === id); if (d) ACState.cart.items.push({ id: d.id, name: d.name, price: d.price, qty: 1, img: d.img }); }); ACStore.emit(); };
  Screens._cartQty = function (id, delta, restId) {
    const it = ACState.cart.items.find((i) => i.id === id); if (!it) return;
    it.qty += delta; if (it.qty <= 0) ACState.cart.items = ACState.cart.items.filter((i) => i.id !== id);
    if (!ACState.cart.items.length) ACState.cart.restaurant = null;
    ACStore.emit();
    App.replace(App.current.id, App.current.params);
  };
  Screens.cartRestaurant = function (container) {
    const r = YCData.restaurant(ACState.cart.restaurant), items = ACState.cart.items;
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0), fee = r ? r.fee : 0, service = items.length ? 200 : 0;
    const body = !items.length || !r ? UI.emptyState({ icon: "shopping_bag", title: "Panier vide", body: "Ajoutez un plat pour commander. Vos restaurants préférés sont à portée de main.", actionLabel: "Voir les restaurants", actionOnclick: "App.resetTo('restaurants')" }) : `
      <div class="grid lg:grid-cols-[1fr_380px] gap-6">
        <div class="space-y-4">
          <button type="button" onclick="${go("restaurantDetail", { id: r.id })}" class="card p-3 flex items-center gap-3 w-full text-left"><span class="w-14 h-14 rounded-xl overflow-hidden bg-card-high">${UI.img(r.img, r.name)}</span><span class="flex-1 min-w-0"><span class="block t-title truncate">${r.name}</span><span class="block t-small text-ink-2">${r.cat} · ${r.time} · ${r.km} km</span></span><span class="t-small font-bold text-gold-deep dark:text-gold">Ajouter des plats</span></button>
          <div class="card divide-y divide-line">${items.map((i) => `<div class="p-3 flex items-center gap-3"><span class="w-16 h-16 rounded-xl overflow-hidden bg-card-high flex-shrink-0">${UI.img(i.img, i.name)}</span><span class="flex-1 min-w-0"><span class="block t-title truncate">${esc(i.name)}</span><span class="block t-small text-ink-2">${ACStore.fmtFCFA(i.price)} l'unité</span></span><span class="t-title font-bold whitespace-nowrap hidden sm:block">${ACStore.fmtFCFA(i.price * i.qty)}</span>${UI.qtyControl(i.qty, `Screens._cartQty('${i.id}',-1)`, `Screens._cartQty('${i.id}',1)`, true)}</div>`).join("")}</div>
          <div class="card p-4"><label class="label">Note pour le restaurant</label><textarea id="cart-note" class="textarea" placeholder="Sans piment, couverts en plus…" onchange="ACState.cart.note=this.value">${esc(ACState.cart.note || "")}</textarea></div>
        </div>
        <aside class="space-y-4 lg:sticky lg:top-24 self-start">
          <div class="card p-5">${UI.row("Sous-total", ACStore.fmtFCFA(sub))}${UI.row("Frais de livraison", ACStore.fmtFCFA(fee))}${UI.row("Frais de service", ACStore.fmtFCFA(service))}<div class="divider my-2"></div>${UI.row("Total", ACStore.fmtFCFA(sub + fee + service), true)}<p class="t-small text-ink-3 mt-2">+${Math.round((sub + fee) / 100)} points Youss Bonus avec cette commande.</p></div>
          ${UI.primaryButton(I18N.t("order") + " · " + ACStore.fmtFCFA(sub + fee + service), "App.nav('checkoutRestaurant')", { size: "lg", iconRight: "arrow_forward" })}
          <button type="button" onclick="Screens._clearCart()" class="w-full t-small text-ink-2 py-1">Vider le panier</button>
        </aside></div>`;
    Shell.render(container, { title: "Panier", subtitle: r ? r.name : "", back: true, body, nav: false, showNav: true });
  };
  Screens._clearCart = () => { ACState.cart.items = []; ACState.cart.restaurant = null; ACState.cart.note = ""; ACStore.emit(); App.replace("cartRestaurant"); };

  /* ---------- Commande : adresse → paiement → confirmation ---------- */
  const co = { step: 0, address: null, method: null, mode: "delivery" };
  Screens.checkoutRestaurant = function (container, params) {
    const r = YCData.restaurant(ACState.cart.restaurant), items = ACState.cart.items;
    if (!r || !items.length) { App.resetTo("cartRestaurant"); return; }
    if (params.step != null) co.step = parseInt(params.step, 10) || 0;
    if (!co.address) co.address = (ACState.addresses.find((a) => a.isDefault) || ACState.addresses[0] || {}).id;
    if (!co.method) co.method = ACState.prefs.paymentMethod || "wallet";
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0), fee = co.mode === "pickup" ? 0 : r.fee, service = 200, total = sub + fee + service;
    const addr = ACState.addresses.find((a) => a.id === co.address), method = ACState.paymentMethods.find((m) => m.type === co.method);
    const steps = ["Adresse", "Paiement", "Confirmation"];
    let stepHtml = "";
    if (co.step === 0) stepHtml = `
      <div class="card p-4 space-y-3">
        <div class="flex gap-2">${[["delivery", "Livraison", "local_shipping"], ["pickup", "À emporter", "storefront"]].map((m) => `<button type="button" onclick="Screens._coMode('${m[0]}')" class="chip flex-1 justify-center h-11 ${co.mode === m[0] ? "on" : ""}">${icon(m[2], "text-[16px]")}${m[1]}</button>`).join("")}</div>
        ${co.mode === "delivery" ? `<p class="t-caption text-ink-3 pt-1">Choisir l'adresse</p><div class="space-y-2">${ACState.addresses.map((a) => `<button type="button" onclick="Screens._coAddress('${a.id}')" class="w-full flex items-center gap-3 rounded-xl border p-3 text-left ${co.address === a.id ? "border-gold bg-gold/10" : "border-line"}"><span class="menu-icon">${icon(a.icon || "place")}</span><span class="flex-1 min-w-0"><span class="block t-title">${esc(a.label)}</span><span class="block t-small text-ink-2 truncate">${esc(a.detail)}</span></span>${co.address === a.id ? icon("check_circle", "text-gold", true) : ""}</button>`).join("")}
          <button type="button" onclick="App.nav('addAddress',{back:'checkoutRestaurant'})" class="w-full flex items-center gap-3 rounded-xl border border-dashed border-line p-3 text-left text-ink-2"><span class="menu-icon">${icon("add")}</span><span class="t-title">Nouvelle adresse</span></button></div>` : `<p class="t-small text-ink-2">Retrait chez ${esc(r.name)} · ${r.area}, ${r.city} · prêt en ${r.time.split("–")[0].trim()} min.</p>`}
        <label class="block pt-1"><span class="label">Horaire</span><div class="flex gap-2">${["Dès que possible", "Dans 30 min", "Dans 1 h"].map((h, i) => `<button type="button" onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('on'));this.classList.add('on')" class="chip ${i === 0 ? "on" : ""}">${h}</button>`).join("")}</div></label>
      </div>
      ${UI.primaryButton(I18N.t("continue"), "Screens._coStep(1)", { size: "lg", iconRight: "arrow_forward" })}`;
    else if (co.step === 1) stepHtml = `
      <div class="card p-4 space-y-2"><p class="t-caption text-ink-3 mb-1">Choisir le paiement</p>${ACState.paymentMethods.map((m) => `<button type="button" onclick="Screens._coMethod('${m.type}')" class="w-full flex items-center gap-3 rounded-xl border p-3 text-left ${co.method === m.type ? "border-gold bg-gold/10" : "border-line"}"><span class="menu-icon">${icon(m.icon)}</span><span class="flex-1 min-w-0"><span class="block t-title">${m.label}${m.type === "wallet" ? ` <span class="t-small text-ink-2 font-normal">· solde ${ACStore.fmtFCFA(ACState.wallet.balance)}</span>` : ""}</span><span class="block t-small text-ink-2">${m.sub}</span></span>${co.method === m.type ? icon("check_circle", "text-gold", true) : ""}</button>`).join("")}
        ${co.method === "wallet" && ACState.wallet.balance < total ? `<p class="t-small text-danger font-semibold">Solde insuffisant (${ACStore.fmtFCFA(total)} requis). <button type="button" onclick="App.nav('walletTopup')" class="underline">Recharger</button></p>` : ""}</div>
      <div class="flex gap-3">${UI.secondaryButton(I18N.t("back"), "Screens._coStep(0)")}${UI.primaryButton(I18N.t("continue"), "Screens._coStep(2)", { size: "lg", iconRight: "arrow_forward" })}</div>`;
    else stepHtml = `
      <div class="card p-4 space-y-3">
        <div class="flex items-center gap-3"><span class="menu-icon">${icon(co.mode === "pickup" ? "storefront" : "location_on")}</span><div class="flex-1 min-w-0"><p class="t-caption text-ink-3">${co.mode === "pickup" ? "Retrait" : "Livraison"}</p><p class="t-title truncate">${co.mode === "pickup" ? esc(r.name) + " · " + r.area : esc(addr ? addr.label + " · " + addr.detail : "")}</p></div><button type="button" onclick="Screens._coStep(0)" class="t-small font-bold text-gold-deep dark:text-gold">Modifier</button></div>
        <div class="flex items-center gap-3"><span class="menu-icon">${icon(method.icon)}</span><div class="flex-1"><p class="t-caption text-ink-3">Paiement</p><p class="t-title">${method.label}</p></div><button type="button" onclick="Screens._coStep(1)" class="t-small font-bold text-gold-deep dark:text-gold">Modifier</button></div>
        <div class="divider"></div>${items.map((i) => `<div class="flex justify-between t-small"><span>${i.qty} × ${esc(i.name)}</span><span>${ACStore.fmtFCFA(i.price * i.qty)}</span></div>`).join("")}
      </div>
      <div class="flex gap-3">${UI.secondaryButton(I18N.t("back"), "Screens._coStep(1)")}${UI.primaryButton("Confirmer la commande · " + ACStore.fmtFCFA(total), `Screens._payRestaurant(${total})`, { size: "lg", icon: "check" })}</div>`;
    const body = `<div class="grid lg:grid-cols-[1fr_380px] gap-6"><div class="space-y-5">${UI.stepper(steps, co.step)}${stepHtml}</div>
      <aside class="card p-5 lg:sticky lg:top-24 self-start"><p class="t-h3 mb-3">${esc(r.name)}</p>${UI.row("Sous-total", ACStore.fmtFCFA(sub))}${UI.row(co.mode === "pickup" ? "À emporter" : "Livraison", ACStore.fmtFCFA(fee))}${UI.row("Service", ACStore.fmtFCFA(service))}<div class="divider my-2"></div>${UI.row("Total", ACStore.fmtFCFA(total), true)}<p class="t-small text-ink-3 mt-2">Livraison estimée : ${r.time}</p></aside></div>`;
    Shell.render(container, { title: "Commander", subtitle: steps[co.step], back: co.step > 0 ? `Screens._coStep(${co.step - 1})` : true, body, nav: false, narrow: false });
  };
  Screens._coStep = (s) => { co.step = s; App.replace("checkoutRestaurant", { step: s }); };
  Screens._coMode = (m) => { co.mode = m; App.replace("checkoutRestaurant", { step: 0 }); };
  Screens._coAddress = (id) => { co.address = id; App.replace("checkoutRestaurant", { step: 0 }); };
  Screens._coMethod = (t) => { co.method = t; App.replace("checkoutRestaurant", { step: 1 }); };
  Screens._payRestaurant = function (total) {
    const r = YCData.restaurant(ACState.cart.restaurant);
    const items = ACState.cart.items.slice();
    const addr = ACState.addresses.find((a) => a.id === co.address);
    ACStore.whenPaid(ACStore.pay({ amount: total, label: "Commande " + r.name, service: "restaurant", pointsEarned: Math.round(total / 100), method: co.method, activity: false }), function () {
      const order = ACStore.createOrder({ type: "restaurant", title: r.name, img: r.img, items, total, address: co.mode === "pickup" ? "À emporter · " + r.name : (addr ? addr.label + " · " + addr.detail : ""), method: co.method, eta: r.time, from: { lat: r.lat, lng: r.lng }, to: addr && addr.lat ? { lat: addr.lat, lng: addr.lng } : null, note: ACState.cart.note, restaurantId: r.id, courier: YCData.courierFor(r.city) });
      ACStore.addActivity({ service: "restaurant", title: "Commande " + r.name, amount: total, status: "En cours", icon: "restaurant", orderId: order.id, detail: { items: items.map((i) => i.name + " × " + i.qty), address: order.address } });
      ACStore.addNotification("Commande confirmée", r.name + " a reçu votre commande " + order.number + ". Préparation en cours.", "restaurant", "orderTracking?id=" + order.id);
      ACState.cart.items = []; ACState.cart.restaurant = null; ACState.cart.note = ""; co.step = 0;
      ACStore.emit();
      App.resetTo("orderConfirmed", { id: order.id });
    }, function (res) { App.nav("paymentFailed", { retry: "checkoutRestaurant", amount: total, reason: res.reason }); });
  };
  Screens._demoOrder = function (type) {
    if (type === "restaurant") { const r = YCData.restaurant("rest1"); const o = ACStore.createOrder({ type, title: r.name, img: r.img, items: [{ name: "Poisson braisé", qty: 1, price: 4500 }, { name: "Pâte sauce d'arachide", qty: 1, price: 2500 }], total: 7700, address: "Domicile · Cadjèhoun, Cotonou", method: "wallet", eta: r.time, from: { lat: r.lat, lng: r.lng }, to: { lat: 6.3620, lng: 2.3960 }, restaurantId: r.id, courier: YCData.courierFor("Cotonou") }); Screens._demoOrderId = o.id; }
    else { const p = YCData.product("p1"); const o = ACStore.createOrder({ type: "market", title: "Youss Market · " + YCData.seller(p.seller).name, img: p.img, items: [{ name: p.name, qty: 1, price: p.price }], total: p.price + 1000, address: "Domicile · Cadjèhoun, Cotonou", method: "wallet", eta: "48 h", shipping: "Standard", to: { lat: 6.3620, lng: 2.3960 }, from: { lat: 6.3575, lng: 2.3925 }, courier: YCData.courierFor("Cotonou") }); Screens._demoOrderId = o.id; }
    ACState.cart.items = []; ACState.cart.restaurant = null; ACState.cart.market = []; ACStore.emit();
  };
  Screens._demoParamsFor = function (screen) { if ((screen === "orderConfirmed" || screen === "orderTracking") && Screens._demoOrderId) return { id: Screens._demoOrderId }; return {}; };
})();
