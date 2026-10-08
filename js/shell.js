/* =========================================================
   YOUSS CONNECT — SHELL RESPONSIVE
   Mobile / tablette : en-tête + contenu défilant + navigation basse.
   Desktop (≥ 1024 px) : barre latérale + en-tête de page + contenu large.
   Un même écran fournit title/back/body ; le shell choisit la mise en page.
   ========================================================= */
(function () {
  "use strict";

  const t = (k) => I18N.t(k);
  const icon = (n, c, f) => UI.icon(n, c, f);

  const TAB_IDS = { home: 1, explorer: 1, activities: 1, wallet: 1, profile: 1 };
  const TABS = [
    { id: "home", label: "nav_home", icon: "home" },
    { id: "explorer", label: "nav_explorer", icon: "explore" },
    { id: "activities", label: "nav_activities", icon: "receipt_long" },
    { id: "wallet", label: "nav_wallet", icon: "account_balance_wallet" },
    { id: "profile", label: "nav_profile", icon: "person" }
  ];
  const SERVICES = [
    { id: "transport", label: "svc_transport", icon: "directions_car" },
    { id: "delivery", label: "svc_delivery", icon: "local_shipping" },
    { id: "restaurants", label: "svc_restaurants", icon: "restaurant" },
    { id: "events", label: "svc_events", icon: "confirmation_number" },
    { id: "market", label: "svc_market", icon: "storefront" },
    { id: "culture", label: "svc_culture", icon: "account_balance" }
  ];
  const MORE = [
    { id: "rewards", label: "nav_rewards", icon: "workspace_premium" },
    { id: "business", label: "nav_business", icon: "business_center" },
    { id: "myTickets", label: "nav_tickets", icon: "qr_code_2" },
    { id: "about", label: "nav_about", icon: "auto_awesome" }
  ];

  /* L'onglet « actif » de la barre latérale dépend de la section courante */
  function activeFor(nav, screenId) {
    if (nav) return nav;
    const map = {
      transport: "transport", transportConfirm: "transport", transportSearching: "transport", transportDriverFound: "transport", transportInRide: "transport", transportEnd: "transport",
      delivery: "delivery", deliveryConfirm: "delivery", deliverySearching: "delivery", deliveryCourierFound: "delivery", deliveryTracking: "delivery", deliveryDone: "delivery",
      restaurants: "restaurants", restaurantDetail: "restaurants", cartRestaurant: "restaurants", checkoutRestaurant: "restaurants",
      events: "events", eventDetail: "events", eventCheckout: "events", ticketConfirmed: "events", myTickets: "myTickets", ticketDetail: "myTickets",
      market: "market", productDetail: "market", sellerProfile: "market", cartMarket: "market", checkoutMarket: "market",
      culture: "culture", destination: "culture", cultureDetail: "culture", culturalScanner: "culture", scannerAnalyzing: "culture", scannerResult: "culture", exploreAround: "culture",
      rewards: "rewards", rewardRedeem: "rewards", myRewards: "rewards",
      business: "business", businessProfile: "business", businessCatalogue: "business", businessServices: "business", businessOrders: "business", businessBookings: "business", businessStats: "business", businessAddProduct: "business", businessOrderDetail: "business",
      notifications: "home", about: "about"
    };
    return map[screenId] || "";
  }

  function sidebar(active) {
    const user = ACState.user;
    const item = (s, extra) => `<a href="#/${s.id}" onclick="event.preventDefault();App.nav('${s.id}')" class="nav-item ${active === s.id ? "on" : ""}" ${active === s.id ? 'aria-current="page"' : ""}>${icon(s.icon, "text-[22px]", active === s.id)}<span>${t(s.label)}</span>${extra || ""}</a>`;
    const unread = ACStore.unread();
    return `<aside class="hidden lg:flex flex-col w-[264px] h-dvh sticky top-0 bg-card border-r border-line px-4 py-5 overflow-y-auto flex-shrink-0">
      <a href="#/home" onclick="event.preventDefault();App.nav('home')" class="flex items-center gap-3 px-2 mb-6">
        <img src="./assets/youss-logo-transparent.png" alt="YOUSS CONNECT" class="w-11 h-11 object-contain" width="44" height="44"/>
        <span class="leading-tight"><span class="block font-extrabold tracking-tight text-[15px]">YOUSS CONNECT</span><span class="block t-caption text-ink-3">KYA CORPORATION</span></span>
      </a>
      <nav class="space-y-1" aria-label="Navigation principale">
        ${TABS.map((s) => item(s, s.id === "home" && unread ? `<span class="ml-auto w-2 h-2 rounded-full bg-gold"></span>` : "")).join("")}
      </nav>
      <p class="t-caption text-ink-3 px-3 mt-6 mb-2">${t("nav_services")}</p>
      <nav class="space-y-1">${SERVICES.map((s) => item(s)).join("")}</nav>
      <p class="t-caption text-ink-3 px-3 mt-6 mb-2">${t("nav_more")}</p>
      <nav class="space-y-1">${MORE.map((s) => item(s)).join("")}</nav>
      <div class="mt-auto pt-6 space-y-3">
        <button type="button" onclick="Shell.openDemoMenu()" class="w-full card-dark p-3.5 text-left flex items-center gap-3 hover:opacity-95">
          <span class="w-9 h-9 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center">${icon("play_arrow", "text-[22px]", true)}</span>
          <span class="min-w-0"><span class="block t-title">${t("demo_tour")}</span><span class="block t-small text-white/70 truncate">5 parcours reliés</span></span>
        </button>
        <button type="button" onclick="App.nav('profile')" class="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-low text-left">
          ${UI.avatar(user, "w-10 h-10")}
          <span class="min-w-0"><span class="block t-title truncate">${UI.esc(user.fullName)}</span><span class="block t-small text-ink-2 truncate">${UI.esc(user.city)}, ${UI.esc(user.country)}</span></span>
          ${icon("chevron_right", "ml-auto text-ink-3")}
        </button>
      </div>
    </aside>`;
  }

  function header(o, screenId) {
    const unread = ACStore.unread();
    const user = ACState.user;
    const bell = `<button type="button" onclick="App.nav('notifications')" class="icon-btn relative" aria-label="${t("notifications")}">${icon("notifications")}${unread ? `<span class="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-[#0A0A0A] text-[10px] font-extrabold flex items-center justify-center">${unread}</span>` : ""}</button>`;
    const cityBtn = `<button type="button" onclick="Shell.openCityPicker()" class="hidden sm:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full border border-line bg-card t-small font-semibold hover:bg-surface-low">${icon("location_on", "text-gold text-[18px]", true)}${UI.esc(user.city)}${icon("expand_more", "text-[18px] text-ink-3")}</button>`;
    const searchBtn = `<button type="button" onclick="App.nav('explorer', {focus:1})" class="hidden lg:flex items-center gap-2 h-10 w-[300px] xl:w-[360px] px-4 rounded-full border border-line bg-surface-low text-ink-3 t-body hover:border-ink-3 text-left"><span class="ms text-[20px]">search</span><span class="truncate">${t("search")}</span><kbd class="ml-auto t-caption px-1.5 py-0.5 rounded border border-line bg-card">/</kbd></button>`;

    if (o.homeHeader) {
      return `<header class="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-line/70">
        <div class="max-w-content mx-auto px-5 lg:px-10 h-[68px] lg:h-[76px] flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <button type="button" onclick="App.nav('profile')" class="lg:hidden flex-shrink-0">${UI.avatar(user, "w-11 h-11")}</button>
            <div class="min-w-0">
              <h1 class="t-h3 lg:t-h2 truncate">${t("hello")}, ${UI.esc(user.name)}</h1>
              <button type="button" onclick="Shell.openCityPicker()" class="t-small text-ink-2 flex items-center gap-1 truncate">${icon("location_on", "text-[15px] text-gold", true)}${UI.esc(user.city)}, ${UI.esc(user.country)}${icon("expand_more", "text-[16px]")}</button>
            </div>
          </div>
          <div class="flex items-center gap-2">${searchBtn}${cityBtn}${bell}</div>
        </div></header>`;
    }
    const showBack = o.back && !(o.nav && TAB_IDS[o.nav]);
    return `<header class="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-line/70">
      <div class="max-w-content mx-auto px-4 lg:px-10 h-[60px] lg:h-[76px] flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          ${showBack ? `<button type="button" onclick="${o.back === true ? "App.back()" : o.back}" class="icon-btn flex-shrink-0" aria-label="${t("back")}">${icon("arrow_back")}</button>` : ""}
          <div class="min-w-0">
            <h1 class="t-h3 lg:t-h2 truncate">${o.title || ""}</h1>
            ${o.subtitle ? `<p class="t-small text-ink-2 truncate">${o.subtitle}</p>` : ""}
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          ${o.right || ""}
          <span class="hidden lg:contents">${o.hideSearch ? "" : searchBtn}${cityBtn}${bell}</span>
        </div>
      </div></header>`;
  }

  function bottomNav(active) {
    const unread = ACStore.unread();
    return `<nav class="lg:hidden sticky bottom-0 z-30 bg-card/95 backdrop-blur-md border-t border-line safe-bottom" aria-label="Navigation">
      <div class="flex items-stretch max-w-[640px] mx-auto">
        ${TABS.map((s) => `<a href="#/${s.id}" onclick="event.preventDefault();App.nav('${s.id}')" class="tab-item ${active === s.id ? "on" : ""} relative" ${active === s.id ? 'aria-current="page"' : ""}>
          ${icon(s.icon, "text-[24px]", active === s.id)}<span class="t-caption">${t(s.label)}</span>
          ${s.id === "home" && unread ? `<span class="absolute top-1.5 right-[calc(50%-14px)] w-2 h-2 rounded-full bg-gold"></span>` : ""}
        </a>`).join("")}
      </div></nav>`;
  }

  /**
   * Rendu standard.
   * o: { title, subtitle, back, right, body, nav, fill, full, narrow, homeHeader, hideSearch, onMount }
   */
  function render(container, o) {
    o = o || {};
    const screenId = App.current ? App.current.id : "";
    const active = activeFor(o.nav, screenId);
    if (o.full) {
      container.innerHTML = `<div class="min-h-dvh flex flex-col screen-enter">${o.body}</div>${Demo.bar()}`;
    } else {
      const wrap = o.fill
        ? `<main id="main" class="flex-1 min-h-0 flex flex-col relative screen-enter">${o.body}</main>`
        : `<main id="main" class="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden screen-enter"><div class="${o.narrow ? "max-w-narrow" : "max-w-content"} mx-auto w-full min-w-0 max-w-full px-5 lg:px-10 py-5 lg:py-8 space-y-6 lg:space-y-8 pb-10">${o.body}</div></main>`;
      container.innerHTML = `<div class="lg:flex min-h-dvh">
        ${sidebar(active)}
        <div class="flex-1 min-w-0 flex flex-col h-dvh">
          ${header(o, screenId)}
          ${wrap}
          ${o.nav === false && !o.showNav ? "" : bottomNav(active)}
        </div>
      </div>${Demo.bar()}`;
    }
    if (o.onMount) requestAnimationFrame(() => o.onMount());
  }

  /* ---------- Sélecteur de ville (change la base de tous les services) ---------- */
  function openCityPicker() {
    UI.openSheet(`<h3 class="t-h3 mb-1">${t("your_city")}</h3><p class="t-small text-ink-2 mb-4">Les services, la carte et les suggestions s'adaptent à la ville choisie.</p>
      <div class="grid grid-cols-2 gap-3">${YCData.DESTINATIONS.map((c) => {
        const city = YCData.CITIES[c]; const on = ACState.user.city === c;
        return `<button type="button" onclick="Shell.pickCity('${c}')" class="relative h-28 rounded-2xl overflow-hidden text-left ${on ? "ring-2 ring-gold" : ""}">
          ${UI.img(city.hero, c)}<div class="absolute inset-0 gradient-up"></div>
          <div class="absolute bottom-2.5 left-3 text-white"><p class="t-caption text-gold">${city.country}</p><p class="t-h3">${c}</p></div>
          ${on ? `<span class="absolute top-2 right-2 badge badge-gold">${icon("check", "text-[14px]")}Actuelle</span>` : ""}
        </button>`;
      }).join("")}</div>`);
  }
  function pickCity(name) {
    UI.closeSheet();
    if (ACState.user.city === name) return;
    ACStore.setCity(name);
    UI.toast("Ville : " + name + " · services mis à jour", "success");
  }

  function openDemoMenu() { Demo.openMenu(); }

  window.Shell = { render, openCityPicker, pickCity, openDemoMenu, TABS, SERVICES };
})();
