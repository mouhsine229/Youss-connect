/* =========================================================
   YOUSS CONNECT — MODE DÉMONSTRATION GUIDÉE
   Cinq parcours reliés (transport, restaurant, événement, commerce,
   culture) pilotés par une barre « coach » : chaque étape prépare
   l'état nécessaire puis ouvre l'écran correspondant.
   ========================================================= */
(function () {
  "use strict";

  const TOURS = [
    {
      id: "transport", label: "Parcours Transport", icon: "directions_car", sub: "Accueil → Destination → Véhicule → Chauffeur → Suivi → Fin de course",
      steps: [
        { screen: "home", hint: "Depuis l'accueil, le service Transport est à un tap." },
        { screen: "transport", hint: "Départ, destination, itinéraire réel et prix au kilomètre.", prepare: () => Screens._transportPreset && Screens._transportPreset({ from: "Haie Vive", to: "Aéroport de Cotonou (Cadjèhoun)", vehicle: "car" }) },
        { screen: "transportConfirm", hint: "Récapitulatif : trajet, véhicule, prix et moyen de paiement." },
        { screen: "transportSearching", hint: "Recherche d'un chauffeur en temps réel (simulation)." },
        { screen: "transportDriverFound", hint: "Chauffeur trouvé : photo, note, véhicule, plaque, arrivée.", prepare: () => Screens._transportAssignDriver && Screens._transportAssignDriver() },
        { screen: "transportInRide", hint: "Suivi sur carte : approche du chauffeur puis course animée." },
        { screen: "transportEnd", hint: "Fin de course : prix, durée, distance, notation, paiement Wallet.", prepare: () => Screens._transportMarkArrived && Screens._transportMarkArrived() }
      ]
    },
    {
      id: "restaurant", label: "Parcours Restaurant", icon: "restaurant", sub: "Restaurants → Fiche → Panier → Adresse → Paiement → Suivi",
      steps: [
        { screen: "restaurants", hint: "Recherche, catégories et restaurants de la ville." },
        { screen: "restaurantDetail", params: { id: "rest1" }, hint: "Fiche : photos, horaires, avis, menu avec ajout au panier.", prepare: () => Screens._cartSeed && Screens._cartSeed("rest1", ["d1", "d2"]) },
        { screen: "cartRestaurant", hint: "Panier : quantités, frais de livraison, total." },
        { screen: "checkoutRestaurant", hint: "Adresse, moyen de paiement, confirmation." },
        { screen: "orderConfirmed", hint: "Commande confirmée, numéro et estimation.", prepare: () => Screens._demoOrder && Screens._demoOrder("restaurant") },
        { screen: "orderTracking", hint: "Suivi en direct : préparation → livraison → livrée." }
      ]
    },
    {
      id: "event", label: "Parcours Événement", icon: "confirmation_number", sub: "Événements → Fiche → Billet → Paiement → QR Code",
      steps: [
        { screen: "events", hint: "Concerts, festivals, conférences, spectacles, sport." },
        { screen: "eventDetail", params: { id: "ev2" }, hint: "Affiche, programme, organisateur, catégories de billets." },
        { screen: "eventCheckout", params: { id: "ev2" }, hint: "Récapitulatif et paiement.", prepare: () => Screens._ticketPreset && Screens._ticketPreset("ev2", "t4", 2) },
        { screen: "ticketConfirmed", hint: "Billet confirmé + ponts vers transport et restaurants.", prepare: () => Screens._demoTicket && Screens._demoTicket("ev2", "t4", 2) },
        { screen: "ticketDetail", hint: "Billet numérique avec QR Code réel et numéro.", prepare: () => Screens._lastTicketParams && Screens._lastTicketParams() }
      ]
    },
    {
      id: "market", label: "Parcours Commerce", icon: "storefront", sub: "Youss Market → Produit → Panier → Livraison → Paiement → Suivi",
      steps: [
        { screen: "market", hint: "Marketplace : recherche, catégories, vendeurs notés." },
        { screen: "productDetail", params: { id: "p1" }, hint: "Galerie, vendeur, disponibilité, description.", prepare: () => Screens._marketSeed && Screens._marketSeed(["p1", "p2"]) },
        { screen: "cartMarket", hint: "Panier Market." },
        { screen: "checkoutMarket", hint: "Adresse → mode de livraison → paiement → confirmation." },
        { screen: "orderConfirmed", hint: "Commande confirmée + points Youss Bonus.", prepare: () => Screens._demoOrder && Screens._demoOrder("market") },
        { screen: "orderTracking", hint: "Suivi : préparation, expédition, livraison." }
      ]
    },
    {
      id: "culture", label: "Parcours Culture", icon: "account_balance", sub: "Explorer → Culture → Destination → Monument → Scanner → Résultat → À proximité",
      steps: [
        { screen: "explorer", hint: "Le moteur de découverte de YOUSS CONNECT." },
        { screen: "culture", hint: "Découvrez l'Afrique : destinations, monuments, traditions." },
        { screen: "destination", params: { city: "Cotonou" }, hint: "Page destination : lieux, restaurants, événements, infos pratiques." },
        { screen: "cultureDetail", params: { id: "c3" }, hint: "Fiche du monument : histoire, visite, audio-guide." },
        { screen: "culturalScanner", hint: "Scanner culturel : caméra ou mode démo." },
        { screen: "scannerResult", params: { id: "c3", scanned: 1 }, hint: "Résultat du scan : reconnaissance, histoire, lieux à proximité." },
        { screen: "exploreAround", params: { id: "c3" }, hint: "Explorer autour de moi : carte et lieux proches." }
      ]
    }
  ];

  let active = null; // { tour, index }

  function start(id) {
    const tour = TOURS.find((x) => x.id === id);
    if (!tour) return;
    active = { tour, index: -1 };
    UI.closeSheet();
    next();
  }
  function goStep(i) {
    const step = active.tour.steps[i];
    active.index = i;
    try { if (step.prepare) step.prepare(); } catch (e) { console.error(e); }
    const params = (step.prepare && step.prepare.__params) || step.params || {};
    App.nav(step.screen, Object.assign({}, params, Screens._demoParamsFor ? Screens._demoParamsFor(step.screen) : {}));
  }
  function next() {
    if (!active) return;
    if (active.index + 1 >= active.tour.steps.length) { stop(true); return; }
    goStep(active.index + 1);
  }
  function prev() { if (active && active.index > 0) goStep(active.index - 1); }
  function stop(done) {
    active = null;
    if (done) UI.toast("Parcours terminé. Les services sont reliés par un seul écosystème.", "success");
    if (App.current) App.replace(App.current.id, App.current.params);
  }

  function bar() {
    if (!active) return "";
    const s = active.tour.steps[active.index];
    const n = active.tour.steps.length;
    return `<div class="fixed z-[800] left-3 right-3 bottom-[88px] lg:left-auto lg:right-6 lg:bottom-6 lg:w-[420px] card-dark p-3.5 shadow-float animate-screen-in" role="status">
      <div class="flex items-start gap-3">
        <span class="w-10 h-10 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center flex-shrink-0">${UI.icon(active.tour.icon, "text-[22px]")}</span>
        <div class="min-w-0 flex-1">
          <p class="t-caption text-gold">${active.tour.label} · étape ${active.index + 1}/${n}</p>
          <p class="t-small text-white/90 mt-0.5">${s.hint}</p>
        </div>
        <button type="button" onclick="Demo.stop()" class="text-white/60 hover:text-white" aria-label="Quitter la démo">${UI.icon("close", "text-[20px]")}</button>
      </div>
      <div class="flex items-center gap-2 mt-3">
        <div class="flex-1 h-1 rounded-full bg-white/15 overflow-hidden"><div class="h-full bg-gold" style="width:${Math.round(((active.index + 1) / n) * 100)}%"></div></div>
        ${active.index > 0 ? `<button type="button" onclick="Demo.prev()" class="btn btn-sm bg-white/10 text-white">${UI.icon("arrow_back", "text-[16px]")}</button>` : ""}
        <button type="button" onclick="Demo.next()" class="btn btn-sm btn-primary">${active.index + 1 >= n ? "Terminer" : "Étape suivante"}${UI.icon("arrow_forward", "text-[16px]")}</button>
      </div>
    </div>`;
  }

  function openMenu() {
    UI.openSheet(`<h3 class="t-h3 mb-1">${I18N.t("demo_tour")}</h3>
      <p class="t-small text-ink-2 mb-4">Pour une présentation : chaque parcours enchaîne les écrans réels et prépare les données nécessaires.</p>
      <div class="space-y-2">${TOURS.map((tr) => `<button type="button" onclick="Demo.start('${tr.id}')" class="menu-row">
        <span class="flex items-center gap-3 min-w-0"><span class="menu-icon">${UI.icon(tr.icon)}</span><span class="min-w-0"><span class="block t-title">${tr.label}</span><span class="block t-small text-ink-2 truncate">${tr.sub}</span></span></span>${UI.icon("play_circle", "text-gold flex-shrink-0")}
      </button>`).join("")}</div>`);
  }

  window.Demo = { TOURS, start, next, prev, stop, bar, openMenu, get active() { return active; } };
})();
