/* Youss Market — marketplace, fiche produit, vendeur, panier, commande */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;

  const f = { q: "", cat: "Tout", sort: "pertinence" };
  const CATS = ["Tout"].concat(YCData.PRODUCT_CATS);
  const SHIPPING = [
    { id: "standard", label: "Standard", sub: "48 h · livreur Youss", price: 1000, eta: "48 h", icon: "local_shipping" },
    { id: "express", label: "Express", sub: "Aujourd'hui · moto", price: 2500, eta: "3 h", icon: "bolt" },
    { id: "pickup", label: "Retrait chez le vendeur", sub: "Gratuit · sur rendez-vous", price: 0, eta: "Dès demain", icon: "storefront" }
  ];

  function list() {
    const q = YCData.norm(f.q).trim(), words = q ? q.split(/\s+/) : [];
    let out = YCData.PRODUCTS.filter((p) => {
      if (f.cat !== "Tout" && p.cat !== f.cat && !(f.cat === "Artisanat" && ["Maison", "Produits locaux", "Accessoires"].indexOf(p.cat) >= 0)) return false;
      if (!words.length) return true;
      const hay = YCData.norm([p.name, p.cat, YCData.seller(p.seller).name, YCData.seller(p.seller).city, p.desc].join(" "));
      return words.every((w) => hay.includes(w));
    });
    if (f.sort === "prix-asc") out = out.slice().sort((a, b) => a.price - b.price);
    if (f.sort === "prix-desc") out = out.slice().sort((a, b) => b.price - a.price);
    if (f.sort === "note") out = out.slice().sort((a, b) => b.rating - a.rating);
    return out;
  }
  const total = () => ACState.cart.market.reduce((s, i) => s + i.price * i.qty, 0);

  Screens.market = function (container, params) {
    if (params && params.cat) f.cat = params.cat;
    if (params && params.q != null) f.q = params.q;
    const body = `
      <div class="flex flex-col sm:flex-row gap-3">
        <label class="relative flex-1">${icon("search", "absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 text-[22px] pointer-events-none")}<input id="mk-q" type="search" value="${esc(f.q)}" placeholder="Rechercher un produit, un vendeur…" oninput="Screens._mkType(this.value)" class="input input-lg pl-12"/></label>
        <select class="select sm:w-56" onchange="Screens._mkSort(this.value)" aria-label="Trier">${[["pertinence", "Pertinence"], ["note", "Meilleures notes"], ["prix-asc", "Prix croissant"], ["prix-desc", "Prix décroissant"]].map((o) => `<option value="${o[0]}" ${f.sort === o[0] ? "selected" : ""}>${o[1]}</option>`).join("")}</select>
      </div>
      <div class="hscroll">${CATS.map((c) => UI.chip(c, `Screens._mkCat('${c}')`, f.cat === c)).join("")}</div>
      ${f.cat === "Tout" && !f.q ? `<section class="relative rounded-3xl overflow-hidden h-40 lg:h-56 bg-[#0A0A0A] text-white">${UI.img(YCData.IMG + "services/svc-market.jpg", "", "img-cover opacity-60")}<div class="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent"></div><div class="absolute inset-0 p-5 lg:p-8 flex flex-col justify-center max-w-[520px]"><span class="badge badge-gold w-max mb-2">Sélection de la semaine</span><h2 class="t-h2 lg:t-h1">Artisanat et produits locaux de 4 pays</h2><p class="t-small text-white/75 mt-1 hidden sm:block">Vendeurs vérifiés, livraison par les livreurs YOUSS CONNECT, paiement Youss Wallet.</p></div></section>` : ""}
      <div id="mk-list"></div>
      ${marketCartBar()}`;
    Shell.render(container, { title: "Youss Market", subtitle: "Mode, beauté, artisanat, maison, produits locaux, électronique", back: "App.nav('home')", body, nav: false, showNav: true, right: cartBtn() });
    renderList();
  };
  function renderList() {
    const el = document.getElementById("mk-list"); if (!el) return;
    if (!sessionStorage.getItem("yc-seen-mk")) { sessionStorage.setItem("yc-seen-mk", "1"); el.innerHTML = UI.skeletonList(6, "grid"); setTimeout(renderList, 450); return; }
    const items = list();
    el.innerHTML = items.length ? `<p class="t-small text-ink-2 mb-3">${items.length} produit${items.length > 1 ? "s" : ""}</p><div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">${items.map(UI.productCard).join("")}</div>` : UI.emptyState({ icon: "shopping_bag", title: I18N.t("empty_results"), body: I18N.t("empty_results_body"), actionLabel: "Réinitialiser", actionOnclick: "Screens._mkReset()" });
  }
  Screens._mkType = (v) => { f.q = v; renderList(); };
  Screens._mkSort = (v) => { f.sort = v; renderList(); };
  Screens._mkCat = (c) => { f.cat = c; App.replace("market"); };
  Screens._mkReset = () => { f.q = ""; f.cat = "Tout"; App.replace("market"); };
  function cartBtn() { const n = ACStore.marketCount(); return `<button type="button" onclick="App.nav('cartMarket')" class="icon-btn relative" aria-label="Panier Market">${icon("shopping_cart")}${n ? `<span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-[#0A0A0A] text-[10px] font-extrabold flex items-center justify-center">${n}</span>` : ""}</button>`; }
  function marketCartBar() {
    const n = ACStore.marketCount(); if (!n) return "";
    return `<div class="fixed bottom-[72px] lg:bottom-6 inset-x-4 lg:inset-x-auto lg:right-6 lg:w-[380px] z-20">${UI.primaryButton(`Panier Market (${n}) · ${ACStore.fmtFCFA(total())}`, "App.nav('cartMarket')", { size: "lg", icon: "shopping_cart", cls: "shadow-float" })}</div>`;
  }

  /* ---------- Fiche produit ---------- */
  const gal = { idx: 0 };
  Screens.productDetail = function (container, params) {
    const p = YCData.product(params.id) || YCData.PRODUCTS[0];
    const s = YCData.seller(p.seller);
    const fav = ACState.favorites.indexOf(p.id) >= 0;
    const similar = YCData.PRODUCTS.filter((x) => x.id !== p.id && (x.cat === p.cat || x.seller === p.seller)).slice(0, 4);
    const positions = ["center", "20% 30%", "80% 70%"];
    const inCart = (ACState.cart.market.find((i) => i.id === p.id) || {}).qty || 0;
    const body = `
      <div class="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
        <div class="space-y-3 lg:sticky lg:top-24">
          <div class="relative ratio-1-1 rounded-3xl overflow-hidden bg-card-high">${UI.img(p.img, p.name, "img-cover", { eager: true })}
            ${p.old ? `<span class="absolute top-4 left-4 badge badge-gold">-${Math.round(100 - (p.price / p.old) * 100)} %</span>` : ""}
            <button type="button" onclick="Screens._toggleFavorite('${p.id}')" class="absolute top-4 right-4 icon-btn" aria-label="Favori">${icon("favorite", fav ? "text-danger" : "", fav)}</button>
            <style>#pd-main{object-position:${positions[gal.idx]}}</style>
          </div>
          <div class="grid grid-cols-4 gap-2">${positions.map((pos, i) => `<button type="button" onclick="Screens._pdGal(${i},'${p.id}')" class="ratio-1-1 rounded-xl overflow-hidden border-2 ${gal.idx === i ? "border-gold" : "border-transparent"}"><img src="${p.img}" alt="" class="img-cover" style="object-position:${pos}"/></button>`).join("")}<button type="button" onclick="UI.toast('Vidéo produit disponible dans la version finale.','info')" class="ratio-1-1 rounded-xl bg-inverse text-inverse-ink flex flex-col items-center justify-center t-caption">${icon("play_circle", "text-[24px]")}Vidéo</button></div>
        </div>
        <div class="space-y-5">
          <div><span class="badge badge-neutral">${p.cat}</span><h2 class="t-h1 mt-2">${p.name}</h2>
            <div class="flex flex-wrap items-center gap-3 mt-2">${UI.rating(p.rating, p.reviews + " avis")}<span class="t-small ${p.stock === 0 ? "text-danger" : p.stock < 6 ? "text-warn" : "text-success"} font-semibold">${p.stock === 0 ? "Rupture de stock" : p.stock < 6 ? "Plus que " + p.stock + " en stock" : "En stock"}</span></div>
            <div class="flex items-end gap-3 mt-3"><span class="t-display">${ACStore.fmtFCFA(p.price)}</span>${p.old ? `<span class="t-body text-ink-3 line-through mb-1.5">${ACStore.fmtFCFA(p.old)}</span>` : ""}</div></div>
          <div class="grid grid-cols-2 gap-3">
            ${inCart ? `<div class="btn btn-lg btn-outline justify-between">${UI.qtyControl(inCart, `Screens._marketQty('${p.id}',-1)`, `Screens._marketQty('${p.id}',1)`, true)}</div>` : UI.button("Ajouter au panier", `Screens._marketAdd('${p.id}')`, { variant: "outline", size: "lg", icon: "add_shopping_cart", disabled: p.stock === 0 })}
            ${UI.button("Acheter maintenant", `Screens._buyNow('${p.id}')`, { variant: "primary", size: "lg", icon: "bolt", disabled: p.stock === 0 })}
          </div>
          <div class="grid grid-cols-3 gap-2 t-small text-center">${[["local_shipping", "Livraison 48 h", "dès 1 000 F"], ["verified_user", "Paiement sécurisé", "Youss Wallet"], ["replay", "Retour 7 jours", "sous conditions"]].map((x) => `<div class="card p-3"><span class="text-gold">${icon(x[0], "text-[22px]")}</span><p class="font-semibold mt-1">${x[1]}</p><p class="text-ink-3">${x[2]}</p></div>`).join("")}</div>
          <button type="button" onclick="${go("sellerProfile", { id: s.id })}" class="card card-press p-4 flex items-center gap-3 w-full text-left">${UI.avatar({ name: s.name }, "w-12 h-12")}<span class="flex-1 min-w-0"><span class="flex items-center gap-1.5 t-title">${s.name}${s.verified ? icon("verified", "text-gold text-[18px]", true) : ""}</span><span class="block t-small text-ink-2">${s.city} · ${UI.rating(s.rating, s.reviews)} · depuis ${s.since}</span></span>${icon("chevron_right", "text-ink-3")}</button>
          <div><h3 class="t-h3 mb-2">Description</h3><p class="t-body text-ink-2 leading-relaxed">${p.desc}</p></div>
          <div><h3 class="t-h3 mb-2">Caractéristiques</h3><div class="card divide-y divide-line">${Object.keys(p.specs).map((k) => `<div class="flex justify-between p-3 t-small"><span class="text-ink-2">${k}</span><span class="font-semibold text-right">${p.specs[k]}</span></div>`).join("")}</div></div>
          <div><h3 class="t-h3 mb-2">Avis clients</h3><div class="space-y-2">${[{ n: "Fatou D.", r: 5, t: "Qualité au rendez-vous, livré en 2 jours à Cadjèhoun." }, { n: "Kossi A.", r: 4, t: "Conforme à la photo, emballage soigné." }].map((c) => `<div class="card p-3.5"><div class="flex items-center gap-2">${UI.avatar({ name: c.n }, "w-8 h-8")}<span class="t-title flex-1">${c.n}</span>${UI.stars(c.r)}</div><p class="t-small text-ink-2 mt-2">${c.t}</p></div>`).join("")}</div></div>
        </div>
      </div>
      ${similar.length ? `<section>${UI.sectionTitle("Produits similaires")}<div class="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">${similar.map(UI.productCard).join("")}</div></section>` : ""}
      ${marketCartBar()}`;
    Shell.render(container, { title: p.name, subtitle: s.name, back: true, body, nav: false, showNav: true, right: cartBtn() });
  };
  Screens._pdGal = (i, id) => { gal.idx = i; App.replace("productDetail", { id }); };
  Screens._marketAdd = function (id) {
    const p = YCData.product(id); if (!p || p.stock === 0) return;
    const ex = ACState.cart.market.find((i) => i.id === id);
    if (ex) ex.qty++; else ACState.cart.market.push({ id, name: p.name, price: p.price, qty: 1, img: p.img, seller: p.seller });
    ACStore.emit(); UI.toast(p.name + " ajouté au panier Market.", "success");
    App.replace(App.current.id, App.current.params);
  };
  Screens._marketSeed = (ids) => { ACState.cart.market = ids.map((id) => { const p = YCData.product(id); return { id, name: p.name, price: p.price, qty: 1, img: p.img, seller: p.seller }; }); ACStore.emit(); };
  Screens._marketQty = function (id, d) {
    const it = ACState.cart.market.find((i) => i.id === id); if (!it) return;
    it.qty += d; if (it.qty <= 0) ACState.cart.market = ACState.cart.market.filter((i) => i.id !== id);
    ACStore.emit(); App.replace(App.current.id, App.current.params);
  };
  Screens._buyNow = (id) => { if (!ACState.cart.market.find((i) => i.id === id)) { const p = YCData.product(id); ACState.cart.market.push({ id, name: p.name, price: p.price, qty: 1, img: p.img, seller: p.seller }); ACStore.emit(); } App.nav("checkoutMarket", { step: 0 }); };

  Screens.sellerProfile = function (container, params) {
    const s = YCData.seller(params.id) || YCData.SELLERS.s1;
    const prods = YCData.productsBy(s.id);
    const body = `<div class="card p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-4">${UI.avatar({ name: s.name }, "w-20 h-20 text-2xl")}<div class="flex-1"><h2 class="t-h1 flex items-center gap-2">${s.name}${s.verified ? icon("verified", "text-gold", true) : ""}</h2><p class="t-body text-ink-2 mt-1">${s.desc}</p><div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 t-small"><span>${UI.rating(s.rating, s.reviews + " avis")}</span><span>${icon("location_on", "text-[15px]")} ${s.city}</span><span>${icon("storefront", "text-[15px]")} ${prods.length} produits</span><span>Depuis ${s.since}</span></div></div><div class="flex gap-2">${UI.button("Contacter", "UI.toast('Message envoyé au vendeur.','success')", { variant: "outline", block: false, icon: "chat" })}${UI.button("Suivre", "UI.toast('Vous suivez ce vendeur.','success')", { variant: "dark", block: false, icon: "add" })}</div></div>
      <section>${UI.sectionTitle("Produits de " + s.name)}<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">${prods.map(UI.productCard).join("")}</div></section>
      <section class="card p-5 flex flex-col sm:flex-row items-center gap-4"><span class="w-12 h-12 rounded-full bg-gold-soft text-gold-deep flex items-center justify-center">${icon("business_center", "text-[24px]")}</span><div class="flex-1"><p class="t-title">Vous êtes commerçant, artisan ou entrepreneur ?</p><p class="t-small text-ink-2">Ouvrez votre boutique sur Youss Market avec Youss Business.</p></div>${UI.button("Découvrir Youss Business", "App.nav('business')", { variant: "primary", block: false })}</section>
      ${marketCartBar()}`;
    Shell.render(container, { title: s.name, subtitle: "Vendeur " + (s.verified ? "vérifié" : ""), back: true, body, nav: false, showNav: true, right: cartBtn() });
  };

  /* ---------- Panier ---------- */
  Screens.cartMarket = function (container) {
    const items = ACState.cart.market, sub = total();
    const sellers = {}; items.forEach((i) => { (sellers[i.seller] = sellers[i.seller] || []).push(i); });
    const body = !items.length ? UI.emptyState({ icon: "shopping_cart", title: "Panier vide", body: "Ajoutez des produits Youss Market pour continuer.", actionLabel: "Voir Youss Market", actionOnclick: "App.resetTo('market')" }) : `
      <div class="grid lg:grid-cols-[1fr_380px] gap-6"><div class="space-y-4">
        ${Object.keys(sellers).map((sid) => `<div class="card"><div class="p-3 border-b border-line flex items-center gap-2 t-small font-semibold">${icon("storefront", "text-[18px] text-gold")}${YCData.seller(sid).name} <span class="text-ink-3 font-normal">· ${YCData.seller(sid).city}</span></div><div class="divide-y divide-line">${sellers[sid].map((i) => `<div class="p-3 flex items-center gap-3"><span class="w-16 h-16 rounded-xl overflow-hidden bg-card-high flex-shrink-0">${UI.img(i.img, i.name)}</span><span class="flex-1 min-w-0"><span class="block t-title truncate">${esc(i.name)}</span><span class="block t-small text-ink-2">${ACStore.fmtFCFA(i.price)} l'unité</span></span><span class="t-title font-bold hidden sm:block">${ACStore.fmtFCFA(i.price * i.qty)}</span>${UI.qtyControl(i.qty, `Screens._marketQty('${i.id}',-1)`, `Screens._marketQty('${i.id}',1)`, true)}</div>`).join("")}</div></div>`).join("")}
        <button type="button" onclick="App.nav('market')" class="t-small font-bold text-gold-deep dark:text-gold">${icon("add", "text-[16px]")} Continuer mes achats</button></div>
      <aside class="space-y-4 lg:sticky lg:top-24 self-start"><div class="card p-5">${UI.row("Sous-total (" + ACStore.marketCount() + " art.)", ACStore.fmtFCFA(sub))}${UI.row("Livraison", "dès 1 000 FCFA")}<div class="divider my-2"></div>${UI.row("Total estimé", ACStore.fmtFCFA(sub + 1000), true)}<p class="t-small text-ink-3 mt-2">+${Math.round(sub / 100)} points Youss Bonus</p></div>${UI.primaryButton("Passer la commande", "App.nav('checkoutMarket',{step:0})", { size: "lg", iconRight: "arrow_forward" })}</aside></div>`;
    Shell.render(container, { title: "Panier Market", subtitle: items.length ? ACStore.marketCount() + " article(s)" : "", back: true, body, nav: false, showNav: true });
  };

  /* ---------- Commande : Adresse → Livraison → Paiement → Confirmation ---------- */
  const co = { step: 0, address: null, shipping: "standard", method: null };
  Screens.checkoutMarket = function (container, params) {
    const items = ACState.cart.market;
    if (!items.length) { App.resetTo("cartMarket"); return; }
    if (params.step != null) co.step = parseInt(params.step, 10) || 0;
    if (!co.address) co.address = (ACState.addresses.find((a) => a.isDefault) || ACState.addresses[0] || {}).id;
    if (!co.method) co.method = ACState.prefs.paymentMethod || "wallet";
    const ship = SHIPPING.find((s) => s.id === co.shipping), addr = ACState.addresses.find((a) => a.id === co.address), method = ACState.paymentMethods.find((m) => m.type === co.method);
    const sub = total(), tot = sub + ship.price;
    const steps = ["Adresse", "Livraison", "Paiement", "Confirmation"];
    const nav = (prev, next, label) => `<div class="flex gap-3">${prev != null ? UI.secondaryButton(I18N.t("back"), `Screens._mcStep(${prev})`) : ""}${UI.primaryButton(label || I18N.t("continue"), next === "pay" ? `Screens._payMarket(${tot})` : `Screens._mcStep(${next})`, { size: "lg", iconRight: next === "pay" ? "lock" : "arrow_forward" })}</div>`;
    let html = "";
    if (co.step === 0) html = `<div class="card p-4 space-y-2"><p class="t-caption text-ink-3 mb-1">Adresse de livraison</p>${ACState.addresses.map((a) => `<button type="button" onclick="Screens._mcAddress('${a.id}')" class="w-full flex items-center gap-3 rounded-xl border p-3 text-left ${co.address === a.id ? "border-gold bg-gold/10" : "border-line"}"><span class="menu-icon">${icon(a.icon || "place")}</span><span class="flex-1 min-w-0"><span class="block t-title">${esc(a.label)}</span><span class="block t-small text-ink-2 truncate">${esc(a.detail)}</span></span>${co.address === a.id ? icon("check_circle", "text-gold", true) : ""}</button>`).join("")}<button type="button" onclick="App.nav('addAddress',{back:'checkoutMarket'})" class="w-full flex items-center gap-3 rounded-xl border border-dashed border-line p-3 text-left text-ink-2"><span class="menu-icon">${icon("add")}</span><span class="t-title">Nouvelle adresse</span></button></div>${nav(null, 1)}`;
    else if (co.step === 1) html = `<div class="card p-4 space-y-2"><p class="t-caption text-ink-3 mb-1">Mode de livraison</p>${SHIPPING.map((s) => `<button type="button" onclick="Screens._mcShip('${s.id}')" class="w-full flex items-center gap-3 rounded-xl border p-3 text-left ${co.shipping === s.id ? "border-gold bg-gold/10" : "border-line"}"><span class="menu-icon">${icon(s.icon)}</span><span class="flex-1"><span class="block t-title">${s.label}</span><span class="block t-small text-ink-2">${s.sub}</span></span><span class="t-title font-bold">${s.price ? ACStore.fmtFCFA(s.price) : "Gratuit"}</span></button>`).join("")}</div>${nav(0, 2)}`;
    else if (co.step === 2) html = `<div class="card p-4 space-y-2"><p class="t-caption text-ink-3 mb-1">Paiement</p>${ACState.paymentMethods.map((m) => `<button type="button" onclick="Screens._mcMethod('${m.type}')" class="w-full flex items-center gap-3 rounded-xl border p-3 text-left ${co.method === m.type ? "border-gold bg-gold/10" : "border-line"}"><span class="menu-icon">${icon(m.icon)}</span><span class="flex-1"><span class="block t-title">${m.label}${m.type === "wallet" ? ` <span class="t-small text-ink-2 font-normal">· ${ACStore.fmtFCFA(ACState.wallet.balance)}</span>` : ""}</span><span class="block t-small text-ink-2">${m.sub}</span></span>${co.method === m.type ? icon("check_circle", "text-gold", true) : ""}</button>`).join("")}</div>${nav(1, 3)}`;
    else html = `<div class="card p-4 space-y-3">
        <div class="flex items-center gap-3"><span class="menu-icon">${icon("location_on")}</span><div class="flex-1 min-w-0"><p class="t-caption text-ink-3">Livraison</p><p class="t-title truncate">${esc(addr ? addr.label + " · " + addr.detail : "")}</p></div><button type="button" onclick="Screens._mcStep(0)" class="t-small font-bold text-gold-deep dark:text-gold">Modifier</button></div>
        <div class="flex items-center gap-3"><span class="menu-icon">${icon(ship.icon)}</span><div class="flex-1"><p class="t-caption text-ink-3">Mode</p><p class="t-title">${ship.label} · ${ship.eta}</p></div><button type="button" onclick="Screens._mcStep(1)" class="t-small font-bold text-gold-deep dark:text-gold">Modifier</button></div>
        <div class="flex items-center gap-3"><span class="menu-icon">${icon(method.icon)}</span><div class="flex-1"><p class="t-caption text-ink-3">Paiement</p><p class="t-title">${method.label}</p></div><button type="button" onclick="Screens._mcStep(2)" class="t-small font-bold text-gold-deep dark:text-gold">Modifier</button></div>
        <div class="divider"></div>${items.map((i) => `<div class="flex justify-between t-small"><span>${i.qty} × ${esc(i.name)}</span><span>${ACStore.fmtFCFA(i.price * i.qty)}</span></div>`).join("")}</div>${nav(2, "pay", "Confirmer la commande · " + ACStore.fmtFCFA(tot))}`;
    const body = `<div class="grid lg:grid-cols-[1fr_380px] gap-6"><div class="space-y-5">${UI.stepper(steps, co.step)}${html}</div><aside class="card p-5 lg:sticky lg:top-24 self-start"><p class="t-h3 mb-3">Votre commande</p>${items.map((i) => `<div class="flex items-center gap-3 py-1.5"><span class="w-10 h-10 rounded-lg overflow-hidden bg-card-high">${UI.img(i.img, i.name)}</span><span class="flex-1 t-small truncate">${i.qty} × ${esc(i.name)}</span><span class="t-small font-semibold">${ACStore.fmtFCFA(i.price * i.qty)}</span></div>`).join("")}<div class="divider my-2"></div>${UI.row("Sous-total", ACStore.fmtFCFA(sub))}${UI.row("Livraison " + ship.label.toLowerCase(), ship.price ? ACStore.fmtFCFA(ship.price) : "Gratuite")}<div class="divider my-2"></div>${UI.row("Total", ACStore.fmtFCFA(tot), true)}</aside></div>`;
    Shell.render(container, { title: "Commande Market", subtitle: steps[co.step], back: co.step > 0 ? `Screens._mcStep(${co.step - 1})` : true, body, nav: false });
  };
  Screens._mcStep = (s) => { co.step = s; App.replace("checkoutMarket", { step: s }); };
  Screens._mcAddress = (id) => { co.address = id; App.replace("checkoutMarket", { step: 0 }); };
  Screens._mcShip = (id) => { co.shipping = id; App.replace("checkoutMarket", { step: 1 }); };
  Screens._mcMethod = (t) => { co.method = t; App.replace("checkoutMarket", { step: 2 }); };
  Screens._payMarket = function (tot) {
    const items = ACState.cart.market.slice(), ship = SHIPPING.find((s) => s.id === co.shipping), addr = ACState.addresses.find((a) => a.id === co.address);
    const sellerNames = Array.from(new Set(items.map((i) => YCData.seller(i.seller).name))).join(", ");
    ACStore.whenPaid(ACStore.pay({ amount: tot, label: "Achat Youss Market · " + sellerNames, service: "market", pointsEarned: Math.round(tot / 100), method: co.method, activity: false }), function () {
      const first = YCData.seller(items[0].seller);
      const from = YCData.restaurantsIn(ACState.user.city)[0] || YCData.cityOf(ACState.user.city);
      const order = ACStore.createOrder({ type: "market", title: "Youss Market · " + sellerNames, img: items[0].img, items, total: tot, address: co.shipping === "pickup" ? "Retrait chez " + first.name + " · " + first.city : (addr ? addr.label + " · " + addr.detail : ""), method: co.method, eta: ship.eta, shipping: ship.label, from: { lat: from.lat, lng: from.lng }, to: addr && addr.lat ? { lat: addr.lat, lng: addr.lng } : null, courier: YCData.courierFor(ACState.user.city) });
      ACStore.addActivity({ service: "market", title: "Achat Youss Market · " + items.map((i) => i.name).join(", "), amount: tot, status: "En cours", icon: "storefront", orderId: order.id, detail: { items: items.map((i) => i.name + " × " + i.qty), seller: sellerNames, shipping: ship.label } });
      items.forEach((i) => { const p = YCData.product(i.id); if (p) p.stock = Math.max(0, p.stock - i.qty); });
      ACStore.addNotification("Commande confirmée", "Youss Market · " + order.number + " · livraison " + ship.label.toLowerCase() + " (" + ship.eta + ").", "market", "orderTracking?id=" + order.id);
      ACState.cart.market = []; co.step = 0; ACStore.emit();
      App.resetTo("orderConfirmed", { id: order.id });
    }, function (res) { App.nav("paymentFailed", { retry: "checkoutMarket", amount: tot, reason: res.reason }); });
  };
})();
