(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const parcel = { from: "Marché Dantokpa", to: "Ganhi", size: "moto", recipient: "Ami · 97 00 00 00", mode: "colis" };
  const SIZES = [
    { id: "moto", label: "Moto", icon: "two_wheeler", price: 1500 },
    { id: "velo", label: "Vélo", icon: "pedal_bike", price: 1000 },
    { id: "voiture", label: "Voiture", icon: "directions_car", price: 2500 }
  ];

  Screens.delivery = function (container) {
    const topbar = UI.topBar({ title: "Livraison", subtitle: "Que souhaitez-vous faire livrer ?", back: "App.nav('home')" });
    const body = `
    <section class="grid grid-cols-2 gap-2">
      ${["repas", "colis", "documents", "produits"].map(function (m) {
        const labels = { repas: "Repas", colis: "Colis", documents: "Documents", produits: "Produits" };
        return `<button type="button" onclick="Screens._dlMode('${m}')" class="h-11 rounded-2xl font-label-md text-label-md font-semibold ${parcel.mode === m ? "bg-black text-white" : "bg-white border border-outline-variant/30"}">${labels[m]}</button>`;
      }).join("")}
    </section>
    <section class="flex flex-col space-y-3">
      <label class="flex flex-col space-y-1"><span class="font-label-md text-label-md text-on-surface-variant">Adresse de récupération</span>
        <input id="dl-from" value="${parcel.from}" placeholder="Point de départ" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none"/></label>
      <label class="flex flex-col space-y-1"><span class="font-label-md text-label-md text-on-surface-variant">Adresse de livraison</span>
        <input id="dl-to" value="${parcel.to}" placeholder="Destination" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none"/></label>
      <label class="flex flex-col space-y-1"><span class="font-label-md text-label-md text-on-surface-variant">Destinataire</span>
        <input id="dl-recipient" value="${parcel.recipient}" placeholder="Nom et téléphone" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none"/></label>
    </section>
    <section class="flex flex-col space-y-2">
      <h2 class="font-headline-sm text-headline-sm font-bold">Véhicule</h2>
      <div class="flex gap-2 overflow-x-auto no-scrollbar">
        ${SIZES.map((s) => `
        <button type="button" onclick="Screens._pickSize('${s.id}')"
          class="min-w-[110px] rounded-2xl p-space-12 border-2 text-left ${parcel.size === s.id ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-surface-container-lowest"}">
          ${UI.icon(s.icon, "text-primary text-[28px]")}
          <p class="font-title-md text-title-md font-bold mt-2">${s.label}</p>
          <p class="font-label-md text-label-md text-yc-green font-semibold">${ACStore.fmtFCFA(s.price)}</p>
        </button>`).join("")}
      </div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Confirmer la livraison", "Screens._deliverySummary()", { icon: "local_shipping" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._dlMode = function (mode) { parcel.mode = mode; App.replace("delivery"); };
  Screens._pickSize = function (id) { parcel.size = id; App.replace("delivery"); };
  Screens._deliverySummary = function () {
    parcel.from = document.getElementById("dl-from").value.trim();
    parcel.to = document.getElementById("dl-to").value.trim();
    parcel.recipient = document.getElementById("dl-recipient").value.trim();
    if (!parcel.from || !parcel.to || !parcel.recipient) { UI.toast("Veuillez remplir tous les champs.", "error"); return; }
    App.nav("deliverySummary");
  };

  Screens.deliverySummary = function (container) {
    const size = SIZES.find(s => s.id === parcel.size);
    const topbar = UI.topBar({ title: "Récapitulatif", back: "App.back()" });
    const body = `
    <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex flex-col space-y-2">
      ${row("Départ", parcel.from)}${row("Arrivée", parcel.to)}${row("Destinataire", parcel.recipient)}${row("Colis", size.label)}
      <div class="flex items-center justify-between font-label-lg text-label-lg font-bold border-t border-outline-variant/30 pt-2"><span>Total</span><span class="text-primary">${ACStore.fmtFCFA(size.price)}</span></div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Payer et trouver un coursier", `Screens._payDelivery(${size.price})`, { icon: "account_balance_wallet" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  function row(l, v) { return `<div class="flex items-center justify-between"><span class="font-body-sm text-body-sm text-on-surface-variant">${l}</span><span class="font-body-md text-body-md">${v}</span></div>`; }

  Screens._payDelivery = function (price) {
    ACStore.whenPaid(
      ACStore.payFromWallet({ amount: price, label: "Livraison de colis vers " + parcel.to, service: "livraison", pointsEarned: 15 }),
      function () { App.resetTo("deliverySearching"); },
      function (res) { App.nav("paymentFailed", { retry: "deliverySummary", amount: price, reason: res.reason }); }
    );
  };
  Screens.deliverySearching = function (container) {
    const topbar = UI.topBar({ title: "Recherche d'un coursier" });
    const body = `
    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-space-20 py-space-40">
      <div class="relative w-24 h-24 rounded-full bg-primary-container/10 flex items-center justify-center"><div class="absolute inset-0 rounded-full pulse-ring"></div>${UI.icon("local_shipping", "text-primary-container text-[40px]")}</div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Recherche d'un livreur...</h2>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
    setTimeout(() => { if (App.current.id === "deliverySearching") App.replace("deliveryTracking"); }, 2000);
  };
  Screens.deliveryTracking = function (container) {
    const topbar = UI.topBar({ title: "Suivi de livraison", back: "App.nav('home')" });
    const body = `
    <section class="h-40 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon("map", "text-[48px]")}</section>
    <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex items-center space-x-space-12">
      <div class="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary">${UI.icon("person")}</div>
      <div class="flex flex-col"><span class="font-title-md text-title-md">Coursier : Espoir D.</span><span class="font-body-sm text-body-sm text-on-surface-variant">Moto · En route vers ${parcel.to}</span></div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Confirmer la réception", "App.nav('deliveryProof')", { icon: "task_alt" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens.deliveryProof = function (container) {
    const topbar = UI.topBar({ title: "Preuve de livraison" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-24">
      <div class="w-16 h-16 rounded-full bg-tertiary-container/10 text-tertiary flex items-center justify-center">${UI.icon("check_circle", "text-[36px]", true)}</div>
      <h2 class="font-headline-md text-headline-md font-bold">Colis livré avec succès</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Remis à ${parcel.recipient} à ${parcel.to}.</p>
      <div class="w-full px-space-20">${UI.secondaryButton("Retour à l'accueil", "App.resetTo('home')")}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
})();
