(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const RESTAURANTS = {
    rest1: {
      id: "rest1", name: "Chez Maman Bénin", tag: "Cuisine africaine · Haie Vive", rating: 4.7, delivery: "1,2 km", avg: "4 500 F",
      cats: ["Afrique"], hours: "11h – 22h",
      body: "Cuisine béninoise généreuse : pâte, sauce d'arachide, poisson braisé et igname pilée.",
      menu: [
        { id: "d1", name: "Pâte sauce d'arachide", desc: "Pâte de maïs, sauce arachide, poisson", price: 2500 },
        { id: "d2", name: "Poisson braisé", desc: "Dorade, attiéké, piment", price: 4500 },
        { id: "d3", name: "Ignames pilées", desc: "Igname, sauce tomate", price: 3000 }
      ]
    },
    rest2: {
      id: "rest2", name: "Fast Cotonou", tag: "Fast-food · Ganhi", rating: 4.4, delivery: "0,9 km", avg: "3 200 F",
      cats: ["Fast-food"], hours: "10h – 23h",
      body: "Burgers, brochettes et frites à emporter, livrés en moins de 25 minutes.",
      menu: [
        { id: "d4", name: "Burger poulet", desc: "Pain brioché, poulet croustillant", price: 3500 },
        { id: "d5", name: "Brochettes mixtes", desc: "Bœuf et poulet, oignons", price: 2800 },
        { id: "d6", name: "Frites maison", desc: "Portion généreuse", price: 1200 }
      ]
    },
    rest3: {
      id: "rest3", name: "Table Océan", tag: "International · Marina", rating: 4.6, delivery: "2,1 km", avg: "8 000 F",
      cats: ["International"], hours: "12h – 23h",
      body: "Cuisine internationale face à l'Atlantique. Idéal après un événement ou une course.",
      menu: [
        { id: "d7", name: "Pasta fruits de mer", desc: "Crevettes, calamars, crème", price: 7500 },
        { id: "d8", name: "Grillade de bœuf", desc: "Pièce grillée, légumes", price: 8500 },
        { id: "d9", name: "Salade Méditerranée", desc: "Tomate, feta, olives", price: 4200 }
      ]
    },
    rest4: {
      id: "rest4", name: "Café Ganhi", tag: "Boissons · Ganhi, Cotonou", rating: 4.5, delivery: "0,7 km", avg: "2 000 F",
      cats: ["Boissons"], hours: "8h – 20h",
      body: "Cafés, jus locaux et thés au cœur de Cotonou. Idéal entre deux courses ou après le marché.",
      menu: [
        { id: "d10", name: "Bissap frais", desc: "Hibiscus, gingembre", price: 1500 },
        { id: "d11", name: "Gingembre maison", desc: "Épicé, rafraîchissant", price: 1200 },
        { id: "d12", name: "Jus d'ananas local", desc: "Pressé du jour", price: 1800 }
      ]
    },
    rest5: {
      id: "rest5", name: "Douceurs d'Akpakpa", tag: "Desserts · Akpakpa", rating: 4.8, delivery: "2,4 km", avg: "2 800 F",
      cats: ["Desserts"], hours: "12h – 21h",
      body: "Pâtisseries et desserts béninois à partager après un spectacle ou une soirée à Cotonou.",
      menu: [
        { id: "d13", name: "Beignets coco", desc: "Noix de coco, cannelle", price: 1500 },
        { id: "d14", name: "Tarte chocolat", desc: "Part individuelle", price: 2800 },
        { id: "d15", name: "Glace vanille-baobab", desc: "Deux boules", price: 2200 }
      ]
    }
  };

  const CATS = ["Tout", "Afrique", "Fast-food", "International", "Boissons", "Desserts"];
  const search = { q: "", cat: "Tout" };
  const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  function filtered() {
    const q = norm(search.q).trim();
    const words = q ? q.split(/\s+/) : [];
    return Object.values(RESTAURANTS).filter((r) => {
      if (search.cat !== "Tout" && !(r.cats || []).includes(search.cat)) return false;
      if (!words.length) return true;
      const hay = norm([r.name, r.tag, r.body, r.menu.map((m) => m.name).join(" ")].join(" "));
      return words.every((w) => hay.includes(w));
    });
  }

  function card(r) {
    return `
      <div onclick="App.nav('restaurantDetail', {id:'${r.id}'})" class="yc-card yc-card-press rounded-2xl overflow-hidden cursor-pointer">
        <div class="h-28 bg-zinc-900 text-white p-space-16 flex flex-col justify-end">
          <p class="font-title-md text-title-md font-bold">${r.name}</p>
          <p class="font-label-sm text-label-sm text-white/70">★ ${r.rating} · ${r.delivery} · ${r.avg}</p>
        </div>
        <div class="p-space-12">
          <p class="font-body-sm text-body-sm text-on-surface-variant">${r.tag}</p>
        </div>
      </div>`;
  }

  Screens.restaurants = function (container) {
    const list = filtered();
    const topbar = UI.topBar({ title: "Restaurants", subtitle: "Cotonou & environs · Bénin", back: "App.nav('home')" });
    const body = `
    <section class="w-full">
      <label class="h-12 rounded-2xl border border-outline-variant/40 bg-white px-space-12 flex items-center gap-2">
        ${UI.icon("search", "text-outline")}
        <input type="search" value="${search.q.replace(/"/g, "&quot;")}" placeholder="Rechercher un restaurant ou un plat"
          oninput="Screens._hotelSearch(this.value)" class="flex-1 font-body-md text-body-md bg-transparent outline-none"/>
      </label>
    </section>
    <section class="flex gap-2 overflow-x-auto no-scrollbar">
      ${CATS.map((c) => `<button type="button" onclick="Screens._hotelCat('${c}')" class="px-3 h-8 rounded-full font-label-sm text-label-sm font-semibold ${c === search.cat ? "bg-black text-white" : "bg-white border border-outline-variant/30"}">${c}</button>`).join("")}
    </section>
    <section class="flex flex-col space-y-3">
      ${list.length ? list.map(card).join("") : UI.emptyState({ icon: "restaurant", title: "Aucun résultat", body: "Essayez une autre catégorie ou un autre mot-clé.", actionLabel: "Réinitialiser", actionOnclick: "Screens._hotelReset()" })}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._hotelSearch = function (value) { search.q = value || ""; App.replace("restaurants"); };
  Screens._hotelCat = function (cat) { search.cat = CATS.includes(cat) ? cat : "Tout"; App.replace("restaurants"); };
  Screens._hotelReset = function () { search.q = ""; search.cat = "Tout"; App.replace("restaurants"); };

  Screens.restaurantDetail = function (container, params) {
    const r = RESTAURANTS[params.id] || Object.values(RESTAURANTS)[0];
    const topbar = UI.topBar({ title: r.name, subtitle: r.tag, back: "App.back()", right: cartBadge() });
    const body = `
    <section class="h-36 rounded-2xl bg-zinc-900 text-white p-space-16 flex flex-col justify-end">
      <p class="font-label-sm text-label-sm text-secondary">★ ${r.rating} · ${r.hours}</p>
      <h2 class="font-headline-sm text-headline-sm font-bold">${r.name}</h2>
    </section>
    <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${r.body}</p>
    <section class="flex flex-col space-y-3">
      <h2 class="font-headline-sm text-headline-sm font-bold">Menu</h2>
      ${r.menu.map(d => `
      <div class="yc-card p-space-16 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-title-md text-title-md font-bold">${d.name}</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">${d.desc}</p>
          <p class="font-label-md text-label-md text-secondary font-bold mt-1">${ACStore.fmtFCFA(d.price)}</p>
        </div>
        <button onclick="Screens._addToCart('${r.id}','${d.id}')" class="h-9 px-3 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold flex-shrink-0">Ajouter</button>
      </div>`).join("")}
    </section>
    ${cartFooter()}`;
    Shell.render(container, { topbar, body, nav: false });
  };

  function cartBadge() {
    const n = ACState.cart.items.reduce((s, i) => s + i.qty, 0);
    return n ? `<button onclick="App.nav('cartRestaurant')" class="relative w-9 h-9 rounded-full bg-white border border-outline-variant/30 flex items-center justify-center">${UI.icon("shopping_cart")}<span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary text-[10px] flex items-center justify-center">${n}</span></button>` : "";
  }
  function cartFooter() {
    const n = ACState.cart.items.reduce((s, i) => s + i.qty, 0);
    if (!n) return "";
    const total = ACState.cart.items.reduce((s, i) => s + i.price * i.qty, 0);
    return `<div class="pt-space-8">${UI.primaryButton("Voir le panier · " + ACStore.fmtFCFA(total), "App.nav('cartRestaurant')", { icon: "shopping_cart" })}</div>`;
  }

  Screens._addToCart = function (restId, dishId) {
    const r = RESTAURANTS[restId];
    const d = r.menu.find(x => x.id === dishId);
    if (!d) return;
    if (ACState.cart.restaurant && ACState.cart.restaurant !== restId && ACState.cart.items.length) {
      UI.toast("Videz d'abord le panier d'un autre restaurant.", "error");
      return;
    }
    ACState.cart.restaurant = restId;
    const existing = ACState.cart.items.find(i => i.id === dishId);
    if (existing) existing.qty += 1;
    else ACState.cart.items.push({ id: dishId, name: d.name, price: d.price, qty: 1 });
    ACStore.emit();
    UI.toast(d.name + " ajouté", "success");
    App.replace("restaurantDetail", { id: restId });
  };

  Screens.cartRestaurant = function (container) {
    const r = RESTAURANTS[ACState.cart.restaurant];
    const items = ACState.cart.items;
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
    const fee = items.length ? 500 : 0;
    const topbar = UI.topBar({ title: "Panier", subtitle: r ? r.name : "", back: "App.back()" });
    const body = !items.length ? UI.emptyState({ icon: "shopping_cart", title: "Panier vide", body: "Ajoutez un plat pour commander.", actionLabel: "Voir les restaurants", actionOnclick: "App.resetTo('restaurants')" }) : `
    <section class="flex flex-col space-y-2">
      ${items.map(i => `
      <div class="flex items-center justify-between yc-card p-space-16">
        <div><p class="font-title-md text-title-md">${i.name}</p><p class="font-body-sm text-body-sm text-on-surface-variant">${ACStore.fmtFCFA(i.price)} × ${i.qty}</p></div>
        <div class="flex items-center gap-2">
          <button onclick="Screens._cartQty('${i.id}',-1)" class="w-8 h-8 rounded-full border">${UI.icon("remove")}</button>
          <span class="w-4 text-center font-bold">${i.qty}</span>
          <button onclick="Screens._cartQty('${i.id}',1)" class="w-8 h-8 rounded-full border">${UI.icon("add")}</button>
        </div>
      </div>`).join("")}
    </section>
    <section class="yc-card p-space-16 space-y-2">
      <div class="flex justify-between"><span class="text-on-surface-variant">Sous-total</span><span>${ACStore.fmtFCFA(sub)}</span></div>
      <div class="flex justify-between"><span class="text-on-surface-variant">Frais de livraison</span><span>${ACStore.fmtFCFA(fee)}</span></div>
      <div class="flex justify-between font-bold border-t pt-2"><span>Total</span><span class="text-secondary">${ACStore.fmtFCFA(sub + fee)}</span></div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Commander", "App.nav('checkoutRestaurant')")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._cartQty = function (id, delta) {
    const item = ACState.cart.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) ACState.cart.items = ACState.cart.items.filter(i => i.id !== id);
    if (!ACState.cart.items.length) ACState.cart.restaurant = null;
    ACStore.emit();
    App.replace("cartRestaurant");
  };

  Screens.checkoutRestaurant = function (container) {
    const total = ACState.cart.items.reduce((s, i) => s + i.price * i.qty, 0) + 500;
    const addr = ACState.addresses[0];
    const topbar = UI.topBar({ title: "Confirmer la commande", back: "App.back()" });
    const body = `
    <section class="yc-card p-space-16 space-y-3">
      <p class="font-label-sm text-label-sm text-on-surface-variant">Adresse de livraison</p>
      <p class="font-title-md text-title-md font-bold">${addr ? addr.label : "Domicile"}</p>
      <p class="font-body-sm text-body-sm text-on-surface-variant">${addr ? addr.detail : "Cotonou"}</p>
      <button type="button" onclick="App.nav('addresses')" class="font-label-md text-label-md text-secondary">Choisir l'adresse</button>
    </section>
    <section class="yc-card p-space-16 space-y-2">
      <p class="font-label-sm text-label-sm text-on-surface-variant">Paiement</p>
      <p class="font-title-md text-title-md font-bold">Youss Wallet</p>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Fonctionnalité conceptuelle de l'écosystème.</p>
    </section>
    <p class="font-headline-sm text-headline-sm font-bold">Total ${ACStore.fmtFCFA(total)}</p>
    ${UI.primaryButton("Confirmer la commande", "Screens._payRestaurant(" + total + ")")}`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._payRestaurant = function (amount) {
    ACStore.whenPaid(
      ACStore.payFromWallet({ amount: amount, label: "Commande restaurant", service: "restaurant", pointsEarned: 40 }),
      function () {
        ACState.cart.items = [];
        ACState.cart.restaurant = null;
        App.resetTo("orderTracking");
      },
      function () { App.nav("paymentFailed"); }
    );
  };

  Screens.orderTracking = function (container) {
    const topbar = UI.topBar({ title: "Suivi de commande", back: "App.nav('home')" });
    const body = `
    <div class="flex flex-col items-center text-center space-y-space-16 py-space-16">
      <div class="w-16 h-16 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">${UI.icon("check_circle", "text-[36px]", true)}</div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Commande confirmée</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Préparation · récupération · livraison</p>
    </div>
    <section class="yc-card p-space-16 space-y-3 text-left">
      ${["Commande confirmée", "En préparation", "Récupérée", "En livraison"].map((s, i) => `
      <div class="flex items-center gap-3"><span class="w-2.5 h-2.5 rounded-full ${i < 2 ? "bg-secondary" : "bg-outline-variant"}"></span><span>${s}</span></div>`).join("")}
    </section>
    <div class="pt-space-16">${UI.primaryButton("Retour à l'accueil", "App.resetTo('home')")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
})();
