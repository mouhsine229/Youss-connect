(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const biz = {
    catalogue: [
      { id: "bp1", name: "Panier de légumes bio", price: 4000, stock: 12 },
      { id: "bp2", name: "Sac tissé artisanal", price: 6500, stock: 5 }
    ],
    orders: [
      { id: "bo1", client: "Fatou D.", item: "Panier de légumes bio", amount: 4000, status: "Nouvelle" },
      { id: "bo2", client: "Kossi A.", item: "Sac tissé artisanal", amount: 6500, status: "En traitement" }
    ]
  };

  Screens.business = function (container) {
    const topbar = UI.topBar({ title: "Youss Business", subtitle: "Espace professionnel", back: "App.nav('profile')" });
    const revenue = biz.orders.reduce((s, o) => s + o.amount, 0);
    const body = `
    <section class="grid grid-cols-3 gap-3">
      ${statCard(ACStore.fmtFCFA(revenue), "Chiffre d'affaires")}
      ${statCard(biz.orders.length.toString(), "Commandes")}
      ${statCard(biz.catalogue.length.toString(), "Produits")}
    </section>
    <section class="flex flex-col space-y-2">
      ${menu("inventory_2", "Catalogue & stocks", "App.nav('businessCatalogue')")}
      ${menu("receipt_long", "Gestion des commandes", "App.nav('businessOrders')")}
      ${menu("verified_user", "Vérification du compte pro", "Screens._bizVerify()")}
      ${menu("person", "Repasser en mode particulier", "Screens._bizSwitch()")}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  function statCard(v, l) { return `<div class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-12 flex flex-col items-center"><span class="font-title-md text-title-md font-bold text-primary">${v}</span><span class="font-label-sm text-label-sm text-on-surface-variant text-center">${l}</span></div>`; }
  function menu(icon, label, onclick) {
    return `<div onclick="${onclick}" class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 cursor-pointer">
      <div class="flex items-center space-x-3"><div class="w-9 h-9 rounded-full bg-surface-container-low text-primary flex items-center justify-center">${UI.icon(icon)}</div><span class="font-title-md text-title-md">${label}</span></div>
      ${UI.icon("chevron_right", "text-outline")}
    </div>`;
  }
  Screens._bizVerify = function () { UI.toast("Dossier de vérification envoyé au support KYA.", "success"); };
  Screens._bizSwitch = function () { ACState.session.mode = "particulier"; UI.toast("Mode particulier activé.", "info"); App.nav("profile"); };

  Screens.businessCatalogue = function (container) {
    const topbar = UI.topBar({ title: "Catalogue & stocks", back: "App.back()" });
    const body = `
    <section class="flex flex-col space-y-2">
      ${biz.catalogue.map(p => `
      <div class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16">
        <div class="flex flex-col"><span class="font-title-md text-title-md">${p.name}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${ACStore.fmtFCFA(p.price)} · Stock : ${p.stock}</span></div>
        <div class="flex items-center space-x-2">
          <button onclick="Screens._bizEditStock('${p.id}',1)" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">${UI.icon("add", "text-[16px]")}</button>
          <button onclick="Screens._bizEditStock('${p.id}',-1)" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">${UI.icon("remove", "text-[16px]")}</button>
          <button onclick="Screens._bizDeleteProduct('${p.id}')" class="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center">${UI.icon("delete", "text-[16px]")}</button>
        </div>
      </div>`).join("")}
    </section>
    <div class="pt-space-8">${UI.primaryButton("Ajouter un produit", "App.nav('businessAddProduct')", { icon: "add" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._bizEditStock = function (id, delta) {
    const p = biz.catalogue.find(x => x.id === id);
    p.stock = Math.max(0, p.stock + delta);
    App.replace("businessCatalogue");
  };
  Screens._bizDeleteProduct = function (id) {
    biz.catalogue = biz.catalogue.filter(p => p.id !== id);
    UI.toast("Produit supprimé.", "info");
    App.replace("businessCatalogue");
  };
  Screens.businessAddProduct = function (container) {
    const topbar = UI.topBar({ title: "Nouveau produit", back: "App.back()" });
    const body = `
    ${f("bp-name", "Nom du produit")}${f("bp-price", "Prix (FCFA)")}${f("bp-stock", "Stock initial")}
    <div class="pt-space-8">${UI.primaryButton("Ajouter au catalogue", "Screens._bizAddProduct()")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  function f(id, label) { return `<label class="flex flex-col space-y-1"><span class="font-label-md text-label-md text-on-surface-variant">${label}</span><input id="${id}" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none"/></label>`; }
  Screens._bizAddProduct = function () {
    const name = document.getElementById("bp-name").value.trim();
    const price = parseInt(document.getElementById("bp-price").value, 10);
    const stock = parseInt(document.getElementById("bp-stock").value, 10) || 0;
    if (!name || !price) { UI.toast("Veuillez renseigner un nom et un prix.", "error"); return; }
    biz.catalogue.push({ id: ACStore.uid("bp"), name, price, stock });
    UI.toast("Produit ajouté au catalogue.", "success");
    App.nav("businessCatalogue");
  };

  Screens.businessOrders = function (container) {
    const topbar = UI.topBar({ title: "Gestion des commandes", back: "App.back()" });
    const body = `
    <section class="flex flex-col space-y-2">
      ${biz.orders.map(o => `
      <div onclick="App.nav('businessOrderDetail', {id:'${o.id}'})" class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 cursor-pointer">
        <div class="flex flex-col"><span class="font-title-md text-title-md">${o.item}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${o.client}</span></div>
        <div class="flex flex-col items-end"><span class="font-label-lg text-label-lg font-bold">${ACStore.fmtFCFA(o.amount)}</span>${UI.badge(o.status, o.status === "Nouvelle" ? "primary" : "neutral")}</div>
      </div>`).join("")}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens.businessOrderDetail = function (container, params) {
    const o = biz.orders.find(x => x.id === params.id);
    const topbar = UI.topBar({ title: "Détail commande", back: "App.back()" });
    if (!o) {
      Shell.render(container, { topbar, body: UI.emptyState({ icon: "receipt_long", title: "Commande introuvable", body: "Cette commande n'existe plus.", actionLabel: "Retour aux commandes", actionOnclick: "App.resetTo('businessOrders')" }), nav: false });
      return;
    }
    const stages = ["Nouvelle", "En traitement", "Expédiée", "Livrée"];
    const idx = stages.indexOf(o.status);
    const body = `
    <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex flex-col space-y-2">
      <div class="flex items-center justify-between"><span class="font-body-sm text-body-sm text-on-surface-variant">Client</span><span class="font-title-md text-title-md">${o.client}</span></div>
      <div class="flex items-center justify-between"><span class="font-body-sm text-body-sm text-on-surface-variant">Article</span><span>${o.item}</span></div>
      <div class="flex items-center justify-between font-label-lg text-label-lg font-bold"><span>Montant</span><span class="text-primary">${ACStore.fmtFCFA(o.amount)}</span></div>
    </section>
    <div class="flex space-x-2">
      ${stages.map(s => `<span class="flex-1 text-center py-2 rounded-lg font-label-sm text-label-sm ${stages.indexOf(s) <= idx ? "bg-primary-container text-on-primary" : "bg-surface-container-high text-on-surface-variant"}">${s}</span>`).join("")}
    </div>
    ${idx < stages.length - 1 ? `<div class="pt-space-8">${UI.primaryButton("Faire avancer la commande", `Screens._advanceOrder('${o.id}')`)}</div>` : `<div class="pt-space-8">${UI.badge("Commande terminée", "success")}</div>`}`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._advanceOrder = function (id) {
    const o = biz.orders.find(x => x.id === id);
    const stages = ["Nouvelle", "En traitement", "Expédiée", "Livrée"];
    const idx = stages.indexOf(o.status);
    o.status = stages[Math.min(stages.length - 1, idx + 1)];
    UI.toast("Statut mis à jour : " + o.status, "success");
    App.replace("businessOrderDetail", { id });
  };
})();
