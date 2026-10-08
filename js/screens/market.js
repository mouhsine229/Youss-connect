(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const PRODUCTS = {
    p1: { id: "p1", name: "Robe Wax contemporaine", price: 12000, seller: "Atelier Ayélé", cat: "Mode" },
    p2: { id: "p2", name: "Beurre de karité pur", price: 3500, seller: "Coopérative Femmes du Nord", cat: "Beauté" },
    p3: { id: "p3", name: "Céramique terracotta artisanale", price: 8000, seller: "Poterie Bohicon", cat: "Maison" },
    p4: { id: "p4", name: "Bijou perles africaines", price: 5000, seller: "Atelier Ayélé", cat: "Mode" }
  };
  const favorites = new Set();

  Screens.market = function (container) {
    const topbar = UI.topBar({ title: "Youss Market", subtitle: "Artisanat & produits locaux", back: "App.nav('home')" });
    const body = `
    <section class="grid grid-cols-4 gap-2">
      ${["Tout", "Mode", "Accessoires", "Beauté", "Artisanat", "Maison", "Alimentation", "Produits locaux", "Électronique"].map((c, i) => `<span class="px-2 h-8 flex items-center justify-center rounded-full font-label-sm text-label-sm text-center whitespace-nowrap ${i === 0 ? "bg-black text-white" : "bg-white border border-outline-variant/30"}">${c}</span>`).join("")}
    </section>
    <section class="grid grid-cols-2 gap-3">
      ${Object.values(PRODUCTS).map(p => `
      <div class="rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest">
        <div onclick="App.nav('productDetail', {id:'${p.id}'})" class="h-24 bg-surface-container-low flex items-center justify-center text-primary-container cursor-pointer">${UI.icon("storefront", "text-[28px]")}</div>
        <div class="p-space-12">
          <h3 class="font-title-md text-title-md truncate">${p.name}</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${p.seller}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="font-label-md text-label-md text-primary font-bold">${ACStore.fmtFCFA(p.price)}</span>
            <button onclick="Screens._marketAdd('${p.id}')" class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center">${UI.icon("add", "text-[16px]")}</button>
          </div>
        </div>
      </div>`).join("")}
    </section>
    ${marketCartFooter()}`;
    Shell.render(container, { topbar, body, nav: false });
  };

  function marketCartFooter() {
    const n = ACState.cart.market.reduce((s, i) => s + i.qty, 0);
    if (!n) return "";
    return `<div class="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[350px]">
      <button onclick="App.nav('cartMarket')" class="w-full h-14 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-lg flex items-center justify-between px-space-20">
        <span>Panier Market (${n})</span><span>${ACStore.fmtFCFA(marketTotal())}</span>
      </button></div>`;
  }
  function marketTotal() { return ACState.cart.market.reduce((s, i) => s + i.price * i.qty, 0); }

  Screens.productDetail = function (container, params) {
    const p = PRODUCTS[params.id] || Object.values(PRODUCTS)[0];
    const fav = favorites.has(p.id);
    const topbar = UI.topBar({ title: p.name, back: "App.back()" });
    const body = `
    <section class="h-40 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container relative">
      ${UI.icon("storefront", "text-[48px]")}
      <button onclick="Screens._toggleFav('${p.id}')" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-container-lowest/90 flex items-center justify-center ${fav ? "text-error" : "text-on-surface-variant"}">${UI.icon("favorite", "", fav)}</button>
    </section>
    <section class="flex flex-col space-y-2">
      <h2 class="font-headline-md text-headline-md font-bold">${p.name}</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Vendu par ${p.seller} · ${p.cat}</p>
      <span class="font-display-lg text-display-lg text-primary">${ACStore.fmtFCFA(p.price)}</span>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Ajouter au panier", `Screens._marketAdd('${p.id}')`, { icon: "add_shopping_cart" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._toggleFav = function (id) {
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    App.replace(App.current.id, App.current.params);
  };
  Screens._marketAdd = function (id) {
    const p = PRODUCTS[id];
    const existing = ACState.cart.market.find(i => i.id === id);
    if (existing) existing.qty++;
    else ACState.cart.market.push({ id, name: p.name, price: p.price, qty: 1 });
    UI.toast("Ajouté au panier Market.", "success");
    App.replace(App.current.id, App.current.params);
  };

  Screens.cartMarket = function (container) {
    const topbar = UI.topBar({ title: "Panier Market", back: "App.back()" });
    const total = marketTotal();
    const body = !ACState.cart.market.length ? UI.emptyState({ icon: "shopping_cart", title: "Panier vide", body: "Ajoutez des produits Youss Market pour continuer.", actionLabel: "Voir Youss Market", actionOnclick: "App.resetTo('market')" }) : `
    <section class="flex flex-col space-y-2">
      ${ACState.cart.market.map(i => `
      <div class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16">
        <div class="flex flex-col"><span class="font-title-md text-title-md">${i.name}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${ACStore.fmtFCFA(i.price)} x ${i.qty}</span></div>
        <div class="flex items-center space-x-2">
          <button onclick="Screens._marketQty('${i.id}',-1)" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">${UI.icon("remove", "text-[16px]")}</button>
          <span class="font-label-lg text-label-lg w-4 text-center">${i.qty}</span>
          <button onclick="Screens._marketQty('${i.id}',1)" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">${UI.icon("add", "text-[16px]")}</button>
        </div>
      </div>`).join("")}
    </section>
    <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center justify-between">
      <span class="font-title-md text-title-md">Total</span><span class="font-label-lg text-label-lg font-bold text-primary">${ACStore.fmtFCFA(total)}</span>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Payer avec Youss Wallet", "Screens._payMarket()", { icon: "account_balance_wallet" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._marketQty = function (id, delta) {
    const item = ACState.cart.market.find(i => i.id === id);
    item.qty += delta;
    if (item.qty <= 0) ACState.cart.market = ACState.cart.market.filter(i => i.id !== id);
    App.replace("cartMarket");
  };
  Screens._payMarket = function () {
    const total = marketTotal();
    ACStore.whenPaid(
      ACStore.payFromWallet({ amount: total, label: "Achat Youss Market", service: "market", pointsEarned: Math.round(total / 100) }),
      function () {
        ACState.cart.market = [];
        UI.toast("Commande Market confirmée.", "success");
        App.resetTo("orderTracking", { service: "market", label: "Youss Market" });
      },
      function (res) { App.nav("paymentFailed", { retry: "cartMarket", amount: total, reason: res.reason }); }
    );
  };
})();
