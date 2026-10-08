(function () {
  "use strict";
  window.Screens = window.Screens || {};

  Screens.activities = function (container) {
    const topbar = UI.topBar({ title: "Activités", subtitle: "Historique unifié de tous vos services", back: "App.nav('home')" });
    const groups = groupByService(ACState.activities);
    const body = `
    <section class="w-full flex space-x-2 overflow-x-auto no-scrollbar">
      ${["Tous", "Transport", "Restaurant", "Livraison", "Market", "Événement", "Wallet"].map((f, i) => `
        <span class="px-space-16 h-8 flex items-center rounded-full font-label-md text-label-md flex-shrink-0 ${i === 0 ? "bg-primary-container text-on-primary" : "bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant"}">${f}</span>`).join("")}
    </section>
    <section class="w-full flex flex-col space-y-3">
      ${ACState.activities.length ? ACState.activities.map(activityRow).join("") : UI.emptyState({ icon: "schedule", title: "Aucune activité pour le moment", body: "Toutes vos courses, commandes et paiements apparaîtront ici automatiquement.", actionLabel: "Explorer les services", actionOnclick: "App.nav('explorer')" })}
    </section>`;
    Shell.render(container, { topbar, body, nav: "activities" });
  };

  function activityRow(a) {
    const done = a.status !== "En cours";
    return `
    <div onclick="App.nav('activityDetail', {id:'${a.id}'})" class="yc-card yc-card-press p-space-16 flex items-center justify-between cursor-pointer">
      <div class="flex items-center space-x-3 min-w-0">
        <div class="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center flex-shrink-0">${UI.icon(a.icon || "receipt_long", "text-[20px]")}</div>
        <div class="flex flex-col min-w-0">
          <span class="font-title-md text-title-md font-semibold truncate">${a.title}</span>
          <span class="font-body-sm text-body-sm text-on-surface-variant truncate">${a.subtitle || ""}</span>
        </div>
      </div>
      <div class="flex flex-col items-end flex-shrink-0 pl-3">
        ${a.amount != null ? `<span class="font-label-lg text-label-lg font-bold text-on-surface">${ACStore.fmtFCFA(a.amount)}</span>` : ""}
        ${UI.badge(a.status || "—", done ? "success" : "primary")}
      </div>
    </div>`;
  }

  function groupByService(list) {
    return list.reduce((acc, a) => { (acc[a.service] = acc[a.service] || []).push(a); return acc; }, {});
  }

  Screens.activityDetail = function (container, params) {
    const a = ACState.activities.find(x => x.id === params.id);
    const topbar = UI.topBar({ title: "Détail de l'activité", back: "App.back()" });
    const body = a ? `
    <section class="w-full flex flex-col items-center text-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-24 space-y-space-8">
      <div class="w-14 h-14 rounded-full bg-surface-container-low text-primary-container flex items-center justify-center">${UI.icon(a.icon, "text-[28px]")}</div>
      <h2 class="font-headline-md text-headline-md font-bold">${a.title}</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">${a.subtitle}</p>
      ${a.amount != null ? `<span class="font-display-lg text-display-lg text-primary">${ACStore.fmtFCFA(a.amount)}</span>` : ""}
      ${UI.badge(a.status, a.status === "En cours" ? "primary" : "success")}
    </section>
    <section class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 flex flex-col space-y-3">
      <div class="flex items-center justify-between"><span class="font-body-sm text-body-sm text-on-surface-variant">Service</span><span class="font-title-md text-title-md capitalize">${a.service}</span></div>
      <div class="flex items-center justify-between"><span class="font-body-sm text-body-sm text-on-surface-variant">Référence</span><span class="font-body-sm text-body-sm">${a.id}</span></div>
    </section>
    <div class="pt-space-8">${UI.secondaryButton("Retour aux activités", "App.nav('activities')")}</div>
    ` : UI.emptyState({ icon: "search_off", title: "Activité introuvable", body: "Cette activité n'existe plus." });
    Shell.render(container, { topbar, body, nav: false });
  };
})();
