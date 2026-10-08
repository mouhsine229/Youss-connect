(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const SERVICE_ROUTE = {
    wallet: "wallet", rewards: "rewards", transport: "activities",
    livraison: "activities", restaurant: "activities", market: "activities",
    evenement: "activities", culture: "culture", business: "business"
  };

  Screens.notifications = function (container) {
    const topbar = UI.topBar({
      title: "Notifications", back: "App.back()",
      right: ACState.notifications.some(n => !n.read) ? `<button onclick="Screens._markAllRead()" class="font-label-md text-label-md text-primary">Tout lire</button>` : ""
    });
    const body = `
    <section class="w-full flex flex-col space-y-2">
      ${ACState.notifications.length ? ACState.notifications.map(n => `
      <div onclick="Screens._openNotif('${n.id}')" class="flex items-start space-x-3 bg-surface-container-lowest border ${n.read ? "border-outline-variant/30" : "border-primary-container/40 bg-surface-container-low"} rounded-xl p-space-16 cursor-pointer relative">
        ${!n.read ? `<span class="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary-container"></span>` : ""}
        <div class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">${UI.icon(ACStore.iconForService(n.service))}</div>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="font-title-md text-title-md truncate">${n.title}</span>
          <span class="font-body-sm text-body-sm text-on-surface-variant">${n.body}</span>
          <span class="font-label-sm text-label-sm text-outline mt-1">${n.date}</span>
        </div>
        <button onclick="event.stopPropagation();Screens._deleteNotif('${n.id}')" class="text-outline flex-shrink-0">${UI.icon("close", "text-[18px]")}</button>
      </div>`).join("") : UI.emptyState({ icon: "notifications_off", title: "Aucune notification", body: "Vous êtes à jour ! Vos prochaines notifications apparaîtront ici." })}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._markAllRead = function () { ACState.notifications.forEach(n => n.read = true); ACStore.emit(); };
  Screens._deleteNotif = function (id) {
    ACState.notifications = ACState.notifications.filter(n => n.id !== id);
    ACStore.emit();
  };
  Screens._openNotif = function (id) {
    const n = ACState.notifications.find(x => x.id === id);
    if (!n) return;
    n.read = true;
    App.nav(SERVICE_ROUTE[n.service] || "home");
  };
})();
