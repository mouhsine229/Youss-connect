// Traductions. Le français est la référence, l'anglais est complet.
// Fon et wolof ne couvrent que la navigation et les actions courantes, à faire relire par des locuteurs.
// Une clé absente retombe sur le français.
(function () {
  "use strict";

  const FR = {
    // Navigation
    nav_home: "Accueil", nav_explorer: "Explorer", nav_activities: "Activités", nav_wallet: "Wallet", nav_profile: "Profil",
    nav_services: "Services", nav_more: "Plus", nav_tickets: "Mes billets", nav_business: "Youss Business", nav_rewards: "Youss Bonus", nav_about: "Présentation",
    // Services
    svc_transport: "Transport", svc_delivery: "Livraison", svc_restaurants: "Restaurants", svc_events: "Événements", svc_market: "Youss Market", svc_culture: "Culture & Tourisme",
    // Accueil
    hello: "Bonjour", search: "Rechercher", nearby: "À proximité", recos: "Pour vous", upcoming: "Événements", discover: "Culture et tourisme",
    see_all: "Voir tout", explore: "Explorer", your_city: "Votre ville",
    // Actions
    back: "Retour", next: "Suivant", skip: "Passer", start: "Commencer", confirm: "Confirmer", cancel: "Annuler", add: "Ajouter", save: "Enregistrer", continue: "Continuer",
    pay: "Payer", order: "Commander", close: "Fermer", retry: "Réessayer", share: "Partager", call: "Appeler", message: "Message", home_btn: "Retour à l'accueil",
    // Auth
    login: "Connexion", signup: "Créer un compte", phone: "Numéro de téléphone", password: "Mot de passe", forgot: "Mot de passe oublié", otp: "Vérification OTP",
    // Wallet
    wallet: "Youss Wallet", balance: "Solde disponible", send: "Envoyer", receive: "Recevoir", topup: "Recharger", withdraw: "Retirer", qrpay: "QR Pay", recent: "Transactions récentes",
    // Divers
    lang_title: "Langue", lang_done: "Langue : Français", settings: "Paramètres", notifications: "Notifications", security: "Sécurité", help: "Aide", logout: "Déconnexion",
    theme: "Thème", theme_light: "Clair", theme_dark: "Sombre", demo_tour: "Parcours de démo", next_steps: "Et ensuite",
    empty_results: "Aucun résultat", empty_results_body: "Changez le mot-clé ou la catégorie.",
    conceptual: "Fonction de démonstration. Son lancement réel dépendra des agréments obtenus dans chaque pays."
  };

  const EN = {
    nav_home: "Home", nav_explorer: "Explore", nav_activities: "Activity", nav_wallet: "Wallet", nav_profile: "Profile",
    nav_services: "Services", nav_more: "More", nav_tickets: "My tickets", nav_business: "Youss Business", nav_rewards: "Youss Bonus", nav_about: "Overview",
    svc_transport: "Rides", svc_delivery: "Delivery", svc_restaurants: "Restaurants", svc_events: "Events", svc_market: "Youss Market", svc_culture: "Culture & Tourism",
    hello: "Hello", search: "Search", nearby: "Nearby", recos: "For you", upcoming: "Events", discover: "Culture and tourism",
    see_all: "See all", explore: "Explore", your_city: "Your city",
    back: "Back", next: "Next", skip: "Skip", start: "Get started", confirm: "Confirm", cancel: "Cancel", add: "Add", save: "Save", continue: "Continue",
    pay: "Pay", order: "Order", close: "Close", retry: "Retry", share: "Share", call: "Call", message: "Message", home_btn: "Back to home",
    login: "Log in", signup: "Create an account", phone: "Phone number", password: "Password", forgot: "Forgot password", otp: "OTP verification",
    wallet: "Youss Wallet", balance: "Available balance", send: "Send", receive: "Receive", topup: "Top up", withdraw: "Withdraw", qrpay: "QR Pay", recent: "Recent transactions",
    lang_title: "Language", lang_done: "Language: English", settings: "Settings", notifications: "Notifications", security: "Security", help: "Help", logout: "Log out",
    theme: "Theme", theme_light: "Light", theme_dark: "Dark", demo_tour: "Demo walkthroughs", next_steps: "What's next",
    empty_results: "No results", empty_results_body: "Try another keyword or category.",
    conceptual: "Demo feature. Going live depends on the licences granted in each country."
  };

  // Fon, partiel
  const FON = {
    nav_home: "Aigba", nav_explorer: "Kpɔ́n", nav_activities: "Azɔ lɛɛ", nav_wallet: "Wallet", nav_profile: "Nyɛ",
    hello: "Nú mi", search: "Étɛ wè nɔ ɖi ?", nearby: "Ɖo nɔwiwa", recos: "Nú ɖó wè", upcoming: "Hunxwé lɛɛ", discover: "Kpɔ́n Afrika",
    lang_title: "Gbè", lang_done: "Gbè : Fon", back: "Lɛkɔ", next: "Bɔ dó", confirm: "Yí gbè", cancel: "Jó dó"
  };

  // Wolof, partiel
  const WO = {
    nav_home: "Kër", nav_explorer: "Seet", nav_activities: "Jëf", nav_wallet: "Wallet", nav_profile: "Profil",
    hello: "Salaam", search: "Looy wut ?", nearby: "Ci wetu", recos: "Ngir yaw", upcoming: "Ay eveneman", discover: "Xam Afrik",
    lang_title: "Làkk", lang_done: "Làkk : Wolof", back: "Dellu", next: "Topp", confirm: "Dëggal", cancel: "Bàyyi"
  };

  const PACKS = { fr: FR, en: EN, fon: FON, wo: WO };
  const LANGS = [
    { id: "fr", label: "Français", native: "Français", coverage: 100 },
    { id: "en", label: "English", native: "English", coverage: 100 },
    { id: "wo", label: "Wolof", native: "Wolof", coverage: 20, partial: true },
    { id: "fon", label: "Fon", native: "Fɔngbè", coverage: 20, partial: true }
  ];

  let current = "fr";
  try { current = localStorage.getItem("yc-lang") || "fr"; } catch (e) { /* navigation privée */ }
  if (!PACKS[current]) current = "fr";

  function t(key) {
    const pack = PACKS[current] || FR;
    return pack[key] || FR[key] || key;
  }
  function set(id) {
    if (!PACKS[id]) return false;
    current = id;
    try { localStorage.setItem("yc-lang", id); } catch (e) { /* no-op */ }
    document.documentElement.lang = id === "en" ? "en" : "fr";
    return true;
  }
  window.I18N = { t, set, get lang() { return current; }, LANGS };
})();
