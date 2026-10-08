/* Accueil — centre de l'application */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;
  const IMG = YCData.IMG;

  const SERVICES = [
    { id: "transport", label: "svc_transport", icon: "directions_car", img: IMG + "services/svc-transport.jpg", sub: "Course en 2 min" },
    { id: "delivery", label: "svc_delivery", icon: "local_shipping", img: IMG + "services/svc-delivery.jpg", sub: "Colis, repas, documents" },
    { id: "restaurants", label: "svc_restaurants", icon: "restaurant", img: IMG + "food/rest-maman-benin.jpg", sub: "Commandez, suivez" },
    { id: "events", label: "svc_events", icon: "confirmation_number", img: IMG + "services/svc-events.jpg", sub: "Billets avec QR Code" },
    { id: "market", label: "svc_market", icon: "storefront", img: IMG + "services/svc-market.jpg", sub: "Produits locaux" },
    { id: "culture", label: "svc_culture", icon: "account_balance", img: IMG + "places/site-amazone.jpg", sub: "Scanner un monument" }
  ];

  function serviceCard(s) {
    return `<button type="button" onclick="App.nav('${s.id}')" class="relative rounded-2xl overflow-hidden text-left h-28 sm:h-32 lg:h-40 card-press group">
      ${UI.img(s.img, "", "img-cover transition-transform duration-500 group-hover:scale-105")}
      <div class="absolute inset-0 gradient-up"></div>
      <span class="absolute top-2.5 left-2.5 w-9 h-9 rounded-full bg-white/95 text-ink flex items-center justify-center">${icon(s.icon, "text-[20px]")}</span>
      <div class="absolute bottom-2.5 left-3 right-3 text-white"><h3 class="t-title lg:t-h3 leading-tight">${I18N.t(s.label)}</h3><p class="t-small text-white/75 hidden sm:block">${s.sub}</p></div>
    </button>`;
  }

  function recommendations() {
    const city = ACState.user.city;
    const recos = [];
    const lastRest = ACState.activities.find((a) => a.service === "restaurant");
    const rest = YCData.restaurantsIn(city)[0];
    if (rest) recos.push({ icon: "restaurant", img: rest.img, title: lastRest ? "Recommander chez " + rest.name : rest.name, sub: rest.cat + " · " + rest.time, onclick: go("restaurantDetail", { id: rest.id }) });
    const ticket = ACState.tickets[0];
    if (ticket) recos.push({ icon: "directions_car", img: ticket.img, title: "Course vers " + ticket.place.split(",")[0], sub: "Billet " + YCData.fmtDateShort(ticket.date) + " · arrivez à l'heure", onclick: `Screens._transportPreset({toName:${UI.js(ticket.place)}});App.nav('transport')` });
    const site = YCData.sitesIn(city)[0];
    if (site) recos.push({ icon: "qr_code_scanner", img: site.img, title: "Scanner " + site.name, sub: "Histoire, audio-guide, lieux à proximité", onclick: go("culturalScanner") });
    const prod = YCData.PRODUCTS.find((p) => p.old);
    if (prod) recos.push({ icon: "storefront", img: prod.img, title: prod.name, sub: "Offre Youss Market · " + ACStore.fmtFCFA(prod.price), onclick: go("productDetail", { id: prod.id }) });
    return recos.slice(0, 4);
  }

  Screens.home = function (container) {
    const city = ACState.user.city;
    const cityData = YCData.cityOf(city);
    const nearbyList = []
      .concat(YCData.restaurantsIn(city).slice(0, 2).map((r) => ({ img: r.img, title: r.name, meta: "Restaurant · " + r.km + " km · " + r.rating + " ★", onclick: go("restaurantDetail", { id: r.id }) })))
      .concat(YCData.sitesIn(city).slice(0, 1).map((s) => ({ img: s.img, title: s.name, meta: YCData.siteType(s.type).label + " · " + s.place, onclick: go("cultureDetail", { id: s.id }) })))
      .concat(YCData.eventsIn(city).slice(0, 1).map((e) => ({ img: e.img, title: e.name, meta: "Événement · " + YCData.fmtDateShort(e.date), onclick: go("eventDetail", { id: e.id }) })));
    const events = YCData.EVENTS.slice().sort((a, b) => a.date.localeCompare(b.date)).filter((e) => e.date >= "2026-10-07").slice(0, 4);
    const recos = recommendations();
    const active = ACState.orders.filter((o) => !ACStore.orderStep(o).done)[0];

    const body = `
      <!-- Recherche + bannière -->
      <section class="lg:hidden">
        <button type="button" onclick="App.nav('explorer',{focus:1})" class="w-full h-12 card flex items-center gap-3 px-4 text-left text-ink-3"><span class="ms text-[22px]">search</span><span class="t-body">${I18N.t("search")}</span></button>
      </section>
      ${active ? `<button type="button" onclick="${go("orderTracking", { id: active.id })}" class="w-full card-dark p-4 flex items-center gap-3 text-left">
        <span class="w-11 h-11 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center animate-pulse-ring">${icon(ACStore.orderStep(active).current.icon, "text-[22px]")}</span>
        <span class="min-w-0 flex-1"><span class="block t-caption text-gold">Commande en cours · ${esc(active.number)}</span><span class="block t-title truncate">${ACStore.orderStep(active).current.label} · ${esc(active.title)}</span></span>
        ${icon("chevron_right", "text-white/60")}
      </button>` : ""}

      <section class="grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-8">
        <div class="space-y-6 lg:space-y-8 min-w-0">
          <div>
            <div class="hidden lg:block mb-4"><h2 class="t-h1">Que souhaitez-vous faire aujourd'hui ?</h2><p class="t-body text-ink-2 mt-1">${esc(cityData.tagline)}</p></div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">${SERVICES.map(serviceCard).join("")}</div>
          </div>

          <div>${UI.sectionTitle(I18N.t("nearby"), I18N.t("see_all"), go("explorer", { near: 1 }), "Autour de vous à " + esc(city))}
            <div class="grid sm:grid-cols-2 gap-3">${nearbyList.map((n) => `<button type="button" onclick="${n.onclick}" class="card card-press p-2.5 flex items-center gap-3 text-left">
              <span class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-card-high">${UI.img(n.img, n.title)}</span>
              <span class="min-w-0 flex-1"><span class="block t-title truncate">${n.title}</span><span class="block t-small text-ink-2 truncate">${n.meta}</span></span>${icon("chevron_right", "text-ink-3")}
            </button>`).join("")}</div>
          </div>

          <div>${UI.sectionTitle(I18N.t("recos"), null, null, "Selon vos habitudes et votre ville")}
            <div class="hscroll lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-3">${recos.map((r) => `<button type="button" onclick="${r.onclick}" class="card card-press overflow-hidden text-left w-[230px] lg:w-auto">
              <span class="block h-24 lg:h-28 bg-card-high relative">${UI.img(r.img, "")}<span class="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/95 text-ink flex items-center justify-center">${icon(r.icon, "text-[18px]")}</span></span>
              <span class="block p-3"><span class="block t-title truncate">${r.title}</span><span class="block t-small text-ink-2 truncate">${r.sub}</span></span>
            </button>`).join("")}</div>
          </div>

          <div>${UI.sectionTitle(I18N.t("upcoming"), I18N.t("see_all"), "App.nav('events')")}
            <div class="hscroll lg:grid lg:grid-cols-2 gap-3 lg:gap-4">${events.map((e) => UI.eventCard(e, true)).join("")}</div>
          </div>

          <div>${UI.sectionTitle(I18N.t("discover"), I18N.t("explore"), "App.nav('culture')", "Destinations, monuments et expériences culturelles")}
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${YCData.DESTINATIONS.map((c) => UI.destinationCard(c, false)).join("")}</div>
          </div>
        </div>

        <!-- Colonne latérale desktop : Wallet, Bonus, Business -->
        <aside class="space-y-4 lg:sticky lg:top-24 self-start">
          <button type="button" onclick="App.nav('wallet')" class="w-full card-dark p-5 text-left relative overflow-hidden">
            <span class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gold/20 blur-2xl"></span>
            <span class="t-caption text-gold">${I18N.t("wallet")}</span>
            <span class="block t-h1 mt-1">${ACStore.fmtFCFA(ACState.wallet.balance)}</span>
            <span class="block t-small text-white/70 mt-1">${I18N.t("balance")} · ${esc(ACState.user.fullName)}</span>
            <span class="mt-4 wallet-quick-grid">${[["north_east", "Envoyer", "walletSend"], ["qr_code_scanner", "QR Pay", "walletQrPay"], ["add", "Recharger", "walletTopup"]].map((a) => `<span role="button" tabindex="0" onclick="event.stopPropagation();App.nav('${a[2]}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();App.nav('${a[2]}')}" class="wallet-quick-btn">${icon(a[0])}<span class="truncate max-w-full">${a[1]}</span></span>`).join("")}</span>
          </button>
          <button type="button" onclick="App.nav('rewards')" class="w-full card p-4 text-left flex items-center gap-3">
            <span class="w-11 h-11 rounded-full bg-gold-soft text-gold-deep flex items-center justify-center">${icon("workspace_premium", "text-[24px]", true)}</span>
            <span class="min-w-0 flex-1"><span class="block t-title">${ACState.rewards.points.toLocaleString("fr-FR")} points Youss Bonus</span><span class="block t-small text-ink-2">Niveau ${YCData.tierFor(ACState.rewards.points).id}${YCData.nextTier(ACState.rewards.points) ? " · " + (YCData.nextTier(ACState.rewards.points).min - ACState.rewards.points).toLocaleString("fr-FR") + " pts avant " + YCData.nextTier(ACState.rewards.points).id : ""}</span></span>${icon("chevron_right", "text-ink-3")}
          </button>
          <button type="button" onclick="App.nav('business')" class="w-full card p-4 text-left flex items-center gap-3">
            <span class="w-11 h-11 rounded-full bg-surface-low text-ink flex items-center justify-center">${icon("business_center", "text-[24px]")}</span>
            <span class="min-w-0 flex-1"><span class="block t-title">Youss Business</span><span class="block t-small text-ink-2">Gérez votre activité : produits, commandes, statistiques</span></span>${icon("chevron_right", "text-ink-3")}
          </button>
          <button type="button" onclick="Demo.openMenu()" class="hidden lg:flex w-full card p-4 text-left items-center gap-3 border-dashed">
            <span class="w-11 h-11 rounded-full bg-surface-low text-ink flex items-center justify-center">${icon("play_circle", "text-[24px]")}</span>
            <span class="min-w-0 flex-1"><span class="block t-title">${I18N.t("demo_tour")}</span><span class="block t-small text-ink-2">Transport, restaurant, événement, commerce, culture</span></span>
          </button>
        </aside>
      </section>`;
    Shell.render(container, { homeHeader: true, body, nav: "home" });
  };
})();
