(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const SERVICES = [
    { id: "transport", label: "Transport", icon: "directions_car" },
    { id: "delivery", label: "Livraison", icon: "local_shipping" },
    { id: "restaurants", label: "Restaurants", icon: "restaurant" },
    { id: "events", label: "Événements", icon: "confirmation_number" },
    { id: "market", label: "Youss Market", icon: "storefront" },
    { id: "culture", label: "Culture & Tourisme", icon: "account_balance" }
  ];

  const NEARBY = [
    { title: "Chez Maman Bénin", meta: "Restaurant · 0,8 km", route: "restaurantDetail", params: { id: "rest1" } },
    { title: "Festival des Arts Vodoun", meta: "Événement · Ouidah", route: "eventDetail", params: { id: "ev1" } },
    { title: "Robe Wax contemporaine", meta: "Youss Market", route: "productDetail", params: { id: "p1" } }
  ];

  Screens.home = function (container) {
    const unread = ACState.notifications.filter(n => !n.read).length;
    const topbar = `
    <div class="w-full px-space-20 pt-space-12 pb-space-8 flex items-center justify-between bg-surface flex-shrink-0">
      <div class="min-w-0">
        <h1 class="font-headline-sm text-headline-sm font-bold text-on-surface truncate">${UI.t("hello")}, ${ACState.user.name}</h1>
        <p class="font-body-sm text-body-sm text-on-surface-variant truncate flex items-center gap-1">${UI.icon("location_on", "text-[14px] text-secondary")}${ACState.user.city}, ${ACState.user.country}</p>
      </div>
      <button type="button" onclick="App.nav('notifications')"
        class="relative w-11 h-11 rounded-full bg-white border border-outline-variant/30 shadow-sm flex items-center justify-center">
        ${UI.icon("notifications")}
        ${unread ? '<span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary"></span>' : ""}
      </button>
    </div>`;

    const body = `
    <section class="w-full">
      <button type="button" onclick="App.nav('search')" class="w-full h-12 bg-white rounded-2xl border border-outline-variant/40 shadow-sm flex items-center px-space-16 gap-3 text-left">
        ${UI.icon("search", "text-outline")}<span class="font-body-md text-body-md text-outline">${UI.t("search")}</span>
      </button>
    </section>

    <section class="grid grid-cols-2 gap-3">
      ${SERVICES.map(s => `
      <button type="button" onclick="App.nav('${s.id}')"
        class="yc-card yc-card-press p-space-16 text-left flex items-center gap-3">
        <span class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style="background:#F4E4B3;color:#0A0A0A">${UI.icon(s.icon, "text-[22px]")}</span>
        <span class="font-title-md text-title-md font-bold leading-tight">${s.label}</span>
      </button>`).join("")}
    </section>

    <section class="w-full space-y-3">
      <h2 class="font-headline-sm text-headline-sm font-bold">${UI.t("nearby")}</h2>
      ${NEARBY.map(n => `
      <button type="button" onclick="App.nav('${n.route}', ${JSON.stringify(n.params).replace(/"/g, "&quot;")})"
        class="w-full yc-card yc-card-press p-space-16 flex items-center justify-between text-left">
        <div><p class="font-title-md text-title-md font-semibold">${n.title}</p><p class="font-body-sm text-body-sm text-on-surface-variant">${n.meta}</p></div>
        ${UI.icon("chevron_right", "text-outline")}
      </button>`).join("")}
    </section>

    <section class="w-full space-y-3">
      <h2 class="font-headline-sm text-headline-sm font-bold">${UI.t("recos")}</h2>
      <button type="button" onclick="App.nav('transport')" class="w-full rounded-2xl bg-black text-white p-space-16 text-left">
        <p class="font-label-sm text-label-sm text-secondary">Pour vous</p>
        <p class="font-title-md text-title-md font-bold mt-1">Course vers Haie Vive · 8 min</p>
      </button>
    </section>

    <section class="w-full space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="font-headline-sm text-headline-sm font-bold">${UI.t("upcoming")}</h2>
        <button type="button" onclick="App.nav('events')" class="font-label-md text-label-md text-secondary font-semibold">Voir tout</button>
      </div>
      <button type="button" onclick="App.nav('eventDetail', {id:'ev2'})" class="w-full yc-card overflow-hidden text-left">
        <div class="h-28 bg-zinc-900 text-white p-space-16 flex flex-col justify-end">
          <p class="font-label-sm text-label-sm text-secondary">21 sept. 2026 · Cotonou</p>
          <p class="font-title-md text-title-md font-bold">Concert au Stade de l'Amitié</p>
        </div>
      </button>
    </section>

    <section class="w-full space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="font-headline-sm text-headline-sm font-bold">${UI.t("discover")}</h2>
        <button type="button" onclick="App.nav('culture')" class="font-label-md text-label-md text-secondary font-semibold">Explorer</button>
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${["Cotonou", "Porto-Novo", "Ouidah", "Abomey"].map(city => `
        <button type="button" onclick="App.nav('culture', {city:'${city}'})"
          class="h-24 rounded-2xl bg-zinc-900 text-white p-space-12 text-left flex flex-col justify-end">
          <span class="font-title-md text-title-md font-bold">${city}</span>
        </button>`).join("")}
      </div>
    </section>`;

    Shell.render(container, { topbar, body, nav: "home" });
  };
})();
