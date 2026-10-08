(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const CATS = [
    { id: "restaurants", label: "Restaurants", icon: "restaurant" },
    { id: "transport", label: "Transport", icon: "directions_car" },
    { id: "events", label: "Événements", icon: "confirmation_number" },
    { id: "market", label: "Commerces", icon: "storefront" },
    { id: "market", label: "Produits", icon: "shopping_bag" },
    { id: "culture", label: "Tourisme", icon: "travel_explore" },
    { id: "culture", label: "Culture", icon: "account_balance" },
    { id: "activities", label: "Activités", icon: "event" }
  ];

  Screens.explorer = function (container) {
    const filters = ["Distance", "Prix", "Catégorie", "Note", "Disponibilité"];
    const topbar = UI.topBar({ title: "Explorer", subtitle: "Moteur de découverte" });
    const body = `
    <div onclick="App.nav('search')" class="w-full h-12 bg-white rounded-2xl border border-outline-variant/40 shadow-sm flex items-center px-space-16 gap-3 cursor-pointer">
      ${UI.icon("search", "text-outline")}<span class="font-body-md text-body-md text-outline">Rechercher dans YOUSS CONNECT</span>
    </div>
    <section class="flex gap-2 overflow-x-auto no-scrollbar">
      ${filters.map(f => `<span class="px-3 h-8 rounded-full bg-white border border-outline-variant/30 font-label-sm text-label-sm flex items-center">${f}</span>`).join("")}
    </section>
    <section class="grid grid-cols-2 gap-3">
      ${CATS.map(c => `
      <button type="button" onclick="App.nav('${c.id}')" class="yc-card yc-card-press p-space-16 text-left">
        ${UI.icon(c.icon, "text-secondary text-[24px]")}
        <p class="font-title-md text-title-md font-bold mt-2">${c.label}</p>
      </button>`).join("")}
    </section>`;
    Shell.render(container, { topbar, body, nav: "explorer" });
  };

  Screens.search = function (container, params) {
    const q = (params.q || "").toLowerCase();
    const topbar = `
    <div class="w-full px-space-20 py-space-12 flex items-center space-x-3 bg-surface flex-shrink-0">
      <button onclick="App.back()" class="w-9 h-9 rounded-full bg-white border border-outline-variant/30 flex items-center justify-center">${UI.icon("arrow_back")}</button>
      <input id="global-search" autofocus value="${params.q || ""}" oninput="Screens._searchType(this.value)" placeholder="Rechercher dans YOUSS CONNECT" class="flex-1 h-11 bg-white rounded-xl border border-outline-variant/40 px-space-16 font-body-md text-body-md focus:outline-none"/>
    </div>`;
    const results = q ? window.ACSearch.run(q) : [];
    const body = `
    <section class="w-full flex flex-col space-y-2">
      ${!q ? UI.emptyState({ icon: "search", title: "Recherchez sur YOUSS CONNECT", body: "Restaurants, transport, événements, commerces, produits, tourisme et culture." }) : (
        results.length ? results.map(r => `
        <div onclick="App.nav('${r.route}', ${JSON.stringify(r.params || {}).replace(/"/g, "&quot;")})" class="flex items-center justify-between bg-white border border-outline-variant/30 rounded-xl p-space-16 cursor-pointer">
          <div class="flex items-center space-x-3"><div class="w-9 h-9 rounded-full bg-surface-container-low text-secondary flex items-center justify-center">${UI.icon(r.icon)}</div>
          <div class="flex flex-col"><span class="font-title-md text-title-md">${r.title}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${r.subtitle}</span></div></div>
          ${UI.icon("chevron_right", "text-outline")}
        </div>`).join("") : UI.emptyState({ icon: "search_off", title: "Aucun résultat", body: "Essayez un autre mot-clé." })
      )}
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._searchType = function (val) {
    App.replace("search", { q: val });
    setTimeout(() => { const el = document.getElementById("global-search"); if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; } }, 0);
  };

  window.ACSearch = {
    run(q) {
      const all = [
        { title: "Chez Maman Bénin", subtitle: "Restaurant · Haie Vive", icon: "restaurant", route: "restaurantDetail", keys: "restaurant repas africain maman", params: { id: "rest1" } },
        { title: "Fast Cotonou", subtitle: "Fast-food · Ganhi", icon: "restaurant", route: "restaurantDetail", keys: "restaurant fast food burger", params: { id: "rest2" } },
        { title: "Robe Wax contemporaine", subtitle: "Youss Market · Mode", icon: "storefront", route: "productDetail", keys: "market produit wax mode", params: { id: "p1" } },
        { title: "Beurre de karité pur", subtitle: "Youss Market · Beauté", icon: "storefront", route: "productDetail", keys: "market karite beaute", params: { id: "p2" } },
        { title: "Festival des Arts Vodoun", subtitle: "Événement · Ouidah", icon: "confirmation_number", route: "eventDetail", keys: "evenement festival vodoun ouidah", params: { id: "ev1" } },
        { title: "Palais royaux d'Abomey", subtitle: "Culture · Abomey", icon: "explore", route: "cultureDetail", keys: "culture musee palais abomey", params: { id: "c1" } },
        { title: "Musée Honmé", subtitle: "Culture · Porto-Novo", icon: "museum", route: "cultureDetail", keys: "culture musee honme porto-novo", params: { id: "c6" } },
        { title: "Transport", subtitle: "Réserver une course", icon: "directions_car", route: "transport", keys: "transport course taxi moto" },
        { title: "Youss Wallet", subtitle: "Voir mon solde", icon: "account_balance_wallet", route: "wallet", keys: "wallet portefeuille solde argent" }
      ];
      return all.filter(x => x.keys.includes(q) || x.title.toLowerCase().includes(q));
    }
  };
})();
