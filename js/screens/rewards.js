(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const CATALOG = [
    { id: "r1", label: "Course gratuite (jusqu'à 2000 FCFA)", cost: 500, icon: "directions_car" },
    { id: "r2", label: "Réduction 10% Youss Market", cost: 300, icon: "storefront" },
    { id: "r3", label: "Boisson offerte partenaire restaurant", cost: 150, icon: "restaurant" },
    { id: "r4", label: "Billet événement -20%", cost: 700, icon: "confirmation_number" }
  ];

  Screens.rewards = function (container) {
    const r = ACState.rewards;
    const progress = Math.min(100, Math.round((r.points / r.nextTierAt) * 100));
    const topbar = UI.topBar({ title: "Youss Bonus", subtitle: "Mes points", back: "App.nav('home')" });
    const body = `
    <section class="w-full rounded-xl bg-primary-container text-on-primary p-space-20 flex flex-col space-y-space-8">
      <span class="font-label-md text-label-md opacity-80">Statut ${r.tier}</span>
      <span class="font-display-lg text-display-lg">${r.points.toLocaleString("fr-FR")} pts</span>
      <div class="w-full h-2 bg-white/25 rounded-full overflow-hidden">
        <div class="h-full bg-white" style="width:${progress}%"></div>
      </div>
      <span class="font-body-sm text-body-sm opacity-90">${Math.max(0, r.nextTierAt - r.points)} points avant le statut ${r.nextTier}</span>
    </section>
    <section class="w-full flex flex-col space-y-space-12">
      <h2 class="font-headline-sm text-headline-sm font-bold">Comment gagner des points</h2>
      <div class="grid grid-cols-3 gap-2 text-center">
        ${howTo("directions_car", "Course terminée", "+25 pts")}
        ${howTo("restaurant", "Commande livrée", "+1 pt / 100 FCFA")}
        ${howTo("storefront", "Achat Market", "+1 pt / 100 FCFA")}
      </div>
    </section>
    <section class="w-full flex flex-col space-y-space-12">
      <div class="flex items-center justify-between">
        <h2 class="font-headline-sm text-headline-sm font-bold">Catalogue de récompenses</h2>
      </div>
      <div class="flex flex-col space-y-2">
        ${CATALOG.map(c => `
        <div class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-12">
          <div class="flex items-center space-x-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container flex-shrink-0">${UI.icon(c.icon)}</div>
            <span class="font-title-md text-title-md truncate">${c.label}</span>
          </div>
          <button onclick="App.nav('rewardRedeem', {id:'${c.id}'})" class="px-space-16 h-9 rounded-xl ${r.points >= c.cost ? "bg-primary-container text-on-primary" : "bg-surface-container-high text-on-surface-variant"} font-label-md text-label-md flex-shrink-0">${c.cost} pts</button>
        </div>`).join("")}
      </div>
    </section>
    <section class="w-full flex flex-col space-y-space-12">
      <div class="flex items-center justify-between">
        <h2 class="font-headline-sm text-headline-sm font-bold">Historique des points</h2>
      </div>
      <div class="flex flex-col space-y-2">
        ${r.history.slice(0, 8).map(h => `
        <div class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-12">
          <div class="flex flex-col"><span class="font-title-md text-title-md">${h.label}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${h.date}</span></div>
          <span class="font-label-lg text-label-lg font-bold text-tertiary">+${h.points} pts</span>
        </div>`).join("")}
      </div>
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  function howTo(icon, label, val) {
    return `<div class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-12 flex flex-col items-center space-y-1">
      <div class="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container">${UI.icon(icon)}</div>
      <span class="font-label-sm text-label-sm">${label}</span>
      <span class="font-label-sm text-label-sm text-primary font-bold">${val}</span>
    </div>`;
  }

  Screens.rewardRedeem = function (container, params) {
    const c = CATALOG.find(x => x.id === (params && params.id));
    if (!c) { App.resetTo("rewards"); return; }
    const canAfford = ACState.rewards.points >= c.cost;
    const topbar = UI.topBar({ title: "Échanger une récompense", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-16">
      <div class="w-16 h-16 rounded-xl bg-surface-container-low text-primary-container flex items-center justify-center">${UI.icon(c.icon, "text-[32px]")}</div>
      <h2 class="font-headline-md text-headline-md font-bold">${c.label}</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Coût : ${c.cost} points · Solde actuel : ${ACState.rewards.points} points</p>
      ${!canAfford ? `<p class="font-body-sm text-body-sm text-error">Il vous manque ${c.cost - ACState.rewards.points} points pour cette récompense.</p>` : ""}
      <div class="w-full px-space-20">${UI.primaryButton("Confirmer l'échange", "Screens._doRedeem('" + c.id + "')", { disabled: !canAfford, icon: "redeem" })}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._doRedeem = function (id) {
    const c = CATALOG.find(x => x.id === id);
    if (ACState.rewards.points < c.cost) return;
    ACState.rewards.points -= c.cost;
    ACState.rewards.history.unshift({ id: ACStore.uid("rwd"), label: "Échange : " + c.label, points: -c.cost, date: "Aujourd'hui" });
    ACStore.addNotification("Récompense débloquée", c.label + " a été ajoutée à votre compte.", "rewards");
    ACStore.emit();
    UI.toast("Récompense débloquée !", "success");
    App.resetTo("rewards");
  };
})();
