// Traductions. Le français est la référence, l'anglais est complet.
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
    pwa_install_title: "Installer YOUSS CONNECT", pwa_install_body: "Installez l'application officielle sur votre appareil : lancement plein écran, icône YOUSS CONNECT et accès même avec une connexion limitée.",
    pwa_install_ios_body: "Sur iPhone ou iPad : touchez Partager, puis « Sur l'écran d'accueil ». YOUSS CONNECT s'ouvrira comme une application, sans barre du navigateur.",
    pwa_install_action: "Installer", pwa_install_later: "Plus tard", pwa_install_ios_ok: "J'ai compris",
    pwa_install_progress: "YOUSS CONNECT est en cours d'installation.", pwa_install_done: "YOUSS CONNECT est installée.",
    pwa_install_unavailable: "L'installation n'est pas proposée par ce navigateur pour le moment.", pwa_install_menu: "Installer l'application",
    empty_results: "Aucun résultat", empty_results_body: "Changez le mot-clé ou la catégorie.",
    conceptual: ""
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
    pwa_install_title: "Install YOUSS CONNECT", pwa_install_body: "Install the official app on your device: full-screen launch, YOUSS CONNECT icon, and access even with a limited connection.",
    pwa_install_ios_body: "On iPhone or iPad: tap Share, then \"Add to Home Screen\". YOUSS CONNECT opens as an app without the browser bar.",
    pwa_install_action: "Install", pwa_install_later: "Not now", pwa_install_ios_ok: "Got it",
    pwa_install_progress: "YOUSS CONNECT is installing.", pwa_install_done: "YOUSS CONNECT is installed.",
    pwa_install_unavailable: "Install is not available in this browser right now.", pwa_install_menu: "Install the app",
    empty_results: "No results", empty_results_body: "Try another keyword or category.",
    conceptual: ""
  };

  const PACKS = { fr: FR, en: EN };
  const LANGS = [
    { id: "fr", label: "Français", native: "Français", coverage: 100 },
    { id: "en", label: "English", native: "English", coverage: 100 }
  ];

  let current = "fr";
  try { current = localStorage.getItem("yc-lang") || "fr"; } catch (e) { /* navigation privée */ }
  if (!PACKS[current]) {
    current = "fr";
    try { localStorage.setItem("yc-lang", "fr"); } catch (e) { /* no-op */ }
  }

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

  document.documentElement.lang = current === "en" ? "en" : "fr";

  /* Phrases entières, les plus longues d'abord, pour que « Se déplacer facilement »
     ne soit pas découpé mot à mot. Les mots outils trop courts ne remplacent
     qu'un libellé isolé, sinon « pour » casserait une phrase non répertoriée. */
  const STOP = new Set("le la les des une un du au aux pour avec sans dans sur sous pas plus est sont cette cet ces vous nous votre que qui dont et ou en par se ce son sa ses mon ma mes ne tout tous toute toutes chez vers des entre comme mais donc car elle il ils elles je tu on bien fait son sa".split(" "));
  let entries = [];
  const textOriginal = new WeakMap();
  const attrOriginal = new WeakMap();
  const ATTRS = ["placeholder", "aria-label", "title", "alt"];
  let applying = 0;

  function isWordChar(ch) {
    return !!ch && /[\p{L}\p{N}]/u.test(ch);
  }
  function addPhrases(map) {
    const byFr = new Map(entries.map(function (e) { return [e.fr, e]; }));
    Object.keys(map || {}).forEach(function (fr) {
      const en = map[fr];
      if (!fr || typeof en !== "string" || !en || fr === en) { byFr.delete(fr); return; }
      byFr.set(fr, {
        fr: fr,
        en: en,
        n: fr.length,
        start: /^[\p{L}\p{N}]/u.test(fr),
        end: /[\p{L}\p{N}]$/u.test(fr),
        stop: STOP.has(fr.toLowerCase()) && fr.indexOf(" ") === -1
      });
    });
    entries = Array.from(byFr.values()).sort(function (a, b) { return b.n - a.n; });
  }
  function overlap(ranges, a, b) {
    for (let i = 0; i < ranges.length; i++) if (a < ranges[i][1] && b > ranges[i][0]) return true;
    return false;
  }
  function neutralGap(g) {
    if (!g) return true;
    let t = g.replace(/\b(FCFA|GHS|QR|PIN|OTP|KYC|SMS|PDF|GPS|VIP|ID|YOUSS|KYA|WeDrive|Gozem|inDrive|Wallet|Bonus|Market|Business|Ride|Connect|Youss|points|point|pts|min|km|kg|OK)\b/gi, " ");
    t = t.replace(/(^|[^\p{L}\p{N}])[\p{Lu}][\p{L}'’.-]*/gu, "$1");
    t = t.replace(/[^\p{L}]/gu, "");
    return t.length === 0;
  }
  function gapsOk(s, hits) {
    const sorted = hits.slice().sort(function (a, b) { return a.i - b.i; });
    let pos = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (!neutralGap(s.slice(pos, sorted[i].i))) return false;
      pos = sorted[i].i + sorted[i].n;
    }
    return neutralGap(s.slice(pos));
  }
  function polish(str) {
    if (current !== "en" || str == null) return str;
    return String(str).replace(/(^|[\s(])dès(?=\s+\d)/gi, "$1from");
  }
  function translate(raw) {
    if (current !== "en" || raw == null) return raw;
    const s0 = String(raw);
    if (!s0 || !entries.length) return polish(s0);
    const lead = (s0.match(/^\s*/) || [""])[0];
    const trail = (s0.match(/\s*$/) || [""])[0];
    const s = s0.trim().replace(/\s+/g, " ");
    if (!s || /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(s)) return polish(s0);
    if (EXACT[s]) return lead + EXACT[s] + trail;
    const screen = window.App && App.current ? String(App.current.id || "") : "";
    if (screen.indexOf("wallet") === 0 && s === "Entrées") return lead + "In" + trail;
    if (screen.indexOf("wallet") === 0 && s === "Sorties") return lead + "Out" + trail;
    const ranges = [];
    const hits = [];
    let exact = null;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (e.n < 4 || e.stop) {
        if (s === e.fr) exact = e.en;
        continue;
      }
      if (s.length < e.n || s.indexOf(e.fr) === -1) continue;
      let from = 0;
      while (from <= s.length - e.n) {
        const idx = s.indexOf(e.fr, from);
        if (idx < 0) break;
        const ok = (!e.start || !isWordChar(s.charAt(idx - 1))) && (!e.end || !isWordChar(s.charAt(idx + e.n)));
        if (ok && !overlap(ranges, idx, idx + e.n)) {
          ranges.push([idx, idx + e.n]);
          hits.push({ i: idx, n: e.n, en: e.en });
          from = idx + e.n;
        } else from = idx + 1;
      }
    }
    let use = hits;
    if (!gapsOk(s, hits)) use = hits.filter(function (h) { return h.n >= 16; });
    if (!use.length) return polish(exact == null ? s0 : lead + exact + trail);
    use.sort(function (a, b) { return b.i - a.i; });
    let out = s;
    use.forEach(function (h) { out = out.slice(0, h.i) + h.en + out.slice(h.i + h.n); });
    return polish(lead + out + trail);
  }

  function skipEl(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.tagName === "SCRIPT" || el.tagName === "STYLE" || el.tagName === "NOSCRIPT" || el.tagName === "TEXTAREA" || el.tagName === "CODE" || el.tagName === "OPTION") return true;
    if (el.dataset && el.dataset.i18nSkip === "1") return true;
    if (el.classList && (el.classList.contains("ms") || el.classList.contains("material-symbols-outlined"))) return true;
    return false;
  }
  function translateTextNode(node) {
    const parent = node.parentElement;
    if (!parent || skipEl(parent) || (parent.closest && parent.closest(".ms, .material-symbols-outlined, script, style, textarea, [data-i18n-skip]"))) return;
    let original = textOriginal.get(node);
    if (original == null) {
      original = node.nodeValue;
      textOriginal.set(node, original);
    }
    const next = current === "en" ? translate(original) : original;
    if (next != null && node.nodeValue !== next) node.nodeValue = next;
  }
  function translateAttrs(el) {
    let bag = attrOriginal.get(el);
    if (!bag) { bag = {}; attrOriginal.set(el, bag); }
    ATTRS.forEach(function (name) {
      if (!el.hasAttribute(name)) return;
      if (bag[name] == null) bag[name] = el.getAttribute(name);
      const next = current === "en" ? translate(bag[name]) : bag[name];
      if (next != null && el.getAttribute(name) !== next) el.setAttribute(name, next);
    });
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { translateTextNode(root); return; }
    if (root.nodeType !== 1 || skipEl(root)) return;
    translateAttrs(root);
    const kids = root.childNodes;
    for (let i = 0; i < kids.length; i++) {
      const n = kids[i];
      if (n.nodeType === 3) translateTextNode(n);
      else if (n.nodeType === 1) walk(n);
    }
  }
  function apply(root) {
    if (applying) return;
    applying = 1;
    const obsOn = !!obs;
    if (obsOn) obs.disconnect();
    try { walk(root || document.body); }
    finally {
      applying = 0;
      if (obsOn && document.body) observe();
    }
  }
  let titleFr = "";
  function rememberTitle(fr) { titleFr = fr || ""; }
  function applyTitle() {
    if (!titleFr) return;
    const next = current === "en" ? translate(titleFr) : titleFr;
    if (next && document.title !== next) document.title = next;
  }

  const CORE = {};
  Object.keys(FR).forEach(function (k) {
    if (FR[k] && EN[k] && FR[k] !== EN[k]) CORE[FR[k]] = EN[k];
  });
  const EXTRA = {
    "Se déplacer facilement": "Get around easily",
    "Voiture, moto ou véhicule premium. Vous commandez, vous suivez le trajet en direct et vous payez depuis l'application, partout en ville.": "Car, motorcycle or premium vehicle. You book, follow the trip live and pay in the app, anywhere in the city.",
    "Livraison, restaurants, commerce": "Delivery, restaurants, shopping",
    "Faites livrer un colis, commandez un repas ou achetez un produit local depuis la même application, avec le même compte.": "Send a parcel, order a meal or buy a local product from the same app, with the same account.",
    "Événements et activités": "Events and activities",
    "Concerts, festivals, conférences, spectacles et sport. Vous réservez et votre billet numérique vous attend dans l'application.": "Concerts, festivals, conferences, shows and sport. You book and your digital ticket waits in the app.",
    "Culture et tourisme africain": "African culture and tourism",
    "Destinations, monuments, musées et un scanner culturel qui raconte l'histoire de chaque lieu que vous visitez.": "Destinations, monuments, museums and a cultural scanner that tells the story of every place you visit.",
    "Tout au même endroit": "Everything in one place",
    "Un compte pour le transport, les commandes, les sorties, le Wallet et les Bonus. Cotonou, Dakar, Lomé, Accra.": "One account for rides, orders, nights out, Wallet and Bonus. Cotonou, Dakar, Lomé, Accra.",
    "Portée par KYA CORPORATION": "Backed by KYA CORPORATION",
    "Se déplacer, commander, sortir et payer. Quatre villes.": "Get around, order, go out and pay. Four cities.",
    "Mobilité": "Mobility",
    "Compte unique": "One account",
    "Voiture ou moto": "Car or motorcycle",
    "Colis et repas": "Parcels and meals",
    "Menu et livraison": "Menu and delivery",
    "Billets QR": "QR tickets",
    "Artisanat, produits": "Crafts and goods",
    "Sites et visites": "Sites and visits",
    "Commande en cours": "Order in progress",
    "points Youss Bonus": "Youss Bonus points",
    "Niveau": "Level",
    "pts avant": "pts until",
    "Niveau maximum": "Top level",
    "Produits, commandes, stats": "Products, orders, stats",
    "Transport, restaurant, événement, commerce, culture": "Rides, restaurants, events, shopping, culture",
    "Écran introuvable": "Screen not found",
    "Hors ligne. Certaines actions sont indisponibles.": "You are offline. Some actions are unavailable.",
    "Change la ville des restos, des courses et de la carte.": "Changes the city for restaurants, rides and the map.",
    "Vous êtes maintenant à": "You are now in",
    "Actuelle": "Current",
    "Invitation resto": "Restaurant invite",
    "Console KYA": "KYA console",
    "Entrées": "Starters",
    "Maison": "Home goods",
    "Mes commandes": "My orders",
    "Mes courses": "My rides",
    "Chiffre d'affaires 7 j": "Revenue, 7 days",
    "billet(s)": "ticket(s)",
    "adresse(s)": "address(es)",
    "lieu(x)": "place(s)",
    "Il vous manque": "You still need",
    "Publier sur Youss Market": "Publish on Youss Market",
    "Nom du produit": "Product name",
    "Stock initial": "Opening stock",
    "Ex. Sac en raphia": "E.g. raffia bag",
    "bientôt": "coming soon",
    "éléments": "items",
    "élément": "item",
    "Écologique": "Eco-friendly",
    "Aéroport de Cotonou": "Cotonou Airport",
    "· bientôt": "· coming soon",
    "Éwé · bientôt": "Ewe · coming soon",
    "Historique des transactions": "Transaction history",
    "Masquer le solde": "Hide balance",
    "Afficher le solde": "Show balance",
    "Télécharger le reçu": "Download receipt",
    "Partager le reçu": "Share receipt",
    "Télécharger le relevé": "Download statement",
    "Conditions d'utilisation": "Terms of use",
    "Politique de confidentialité": "Privacy policy",
    "Ajouter une carte bancaire": "Add a bank card",
    "Coordonnées de la carte": "Card details",
    "Enregistrer la carte": "Save card",
    "Enregistrer l'empreinte": "Enroll fingerprint",
    "Enregistrer votre empreinte": "Enroll your fingerprint",
    "Utiliser l'empreinte": "Use fingerprint",
    "Confirmer le paiement": "Confirm payment",
    "Aucun débit bancaire réel n'a été effectué.": "No real bank charge was made.",
    "Le reçu a été téléchargé sur cet appareil.": "The receipt was downloaded on this device.",
    "Tout le réseau": "Whole network",
    "Payer et trouver un livreur": "Pay and find a courier",
    "Confidentialité": "Privacy",
    "Le détail des opérations n'est pas affiché sur cet écran. Ouvrez l'historique pour le consulter, le télécharger ou le partager.": "Transaction details are not shown on this screen. Open the history to review, download or share them.",
    "Démo · le numéro complet n'est pas enregistré": "Demo · the full number is not stored",
    "Continuer avec le code PIN uniquement": "Continue with PIN only",
    "Utiliser ma position actuelle": "Use my current location",
    "Demande l'accès à votre position": "Asks for access to your location",
    "Position actuelle": "Current location",
    "Autour de moi": "Around me",
    "Demande d'accès à votre position…": "Asking for access to your location…",
    "Accès refusé. Autorisez la position dans votre navigateur, puis réessayez.": "Access denied. Allow location in your browser, then try again.",
    "Votre position est en dehors du pays choisi. Les destinations restent dans ce pays.": "Your position is outside the selected country. Destinations stay in this country.",
    "Ce point est en dehors du pays choisi.": "This point is outside the selected country.",
    "Ce lieu est en dehors du pays choisi.": "This place is outside the selected country.",
    "Départ placé sur votre position.": "Pickup set to your location.",
    "Destination placée sur votre position.": "Destination set to your location.",
    "Position indisponible. Réessayez.": "Location unavailable. Try again.",
    "Démo locale · aucun paiement réel · données gardées sur cet appareil": "Local demo · no real payment · data stays on this device",
    "Ce lieu est en dehors du pays choisi. Changez de ville pour y aller.": "This place is outside the selected country. Change city to go there.",
    "Partenariat en cours. YOUSS Ride assure la course.": "Partnership in progress. YOUSS Ride runs the trip.",
    "Demande notée sur cet appareil. YOUSS Ride reste disponible.": "Request saved on this device. YOUSS Ride is still available.",
    "Me prévenir": "Notify me",
    "Noté": "Saved",
    "Démo : cette proposition reste sur cet appareil. Elle n'est pas envoyée.": "Demo: this suggestion stays on this device. It is not sent.",
    "Démo : l'import du logo n'est pas branché.": "Demo: logo upload is not connected.",
    "Démo : pas de vidéo produit.": "Demo: no product video.",
    "Aperçu du lieu.": "Preview of the place.",
    "Voiture ou moto": "Car or motorcycle",
    "Colis et repas": "Parcels and meals",
    "Menu et livraison": "Menu and delivery",
    "Billets QR": "QR tickets",
    "Artisanat, produits": "Crafts, products",
    "Sites et visites": "Sites and visits",
    "Prête au restaurant": "Ready at the restaurant",
    "Espace de démonstration. Rien n'est envoyé. Mot de passe quelconque, 8 caractères, puis le code 1234.": "Demo space. Nothing is sent. Any password, 8 characters, then code 1234.",
    "Code de la maquette : 1234. Il n'est pas envoyé par e-mail.": "Mock code: 1234. It is not emailed.",
    "Maquette. Le code n'est pas envoyé. Il est 1234.": "Mock. The code is not sent. It is 1234.",
    "Démo sur cet appareil · pas un accès réel": "Demo on this device · not real access",
    "Billet": "Ticket",
    "Lieux à visiter": "Places to visit",
    "Monuments, musées et sites": "Monuments, museums and sites",
    "Scanner un monument": "Scan a monument",
    "Histoire, audio-guide, lieux à proximité": "History, audio guide, nearby places",
    "Culture & tourisme": "Culture and tourism",
    "Depuis un restaurant ou un domicile": "From a restaurant or a home",
    "Jusqu'à 25 kg": "Up to 25 kg",
    "Enveloppe, dossier, contrat": "Envelope, file, contract",
    "Achats, courses, Youss Market": "Shopping, errands, Youss Market",
    "Histoire, audio-guide, alentours": "History, audio guide, nearby",
    "Aucun lieu de ce type dans cette ville.": "No place of this type in this city.",
    "Fragile / manipuler avec soin": "Fragile / handle with care",
    "Entrez l'e-mail et le mot de passe de votre compte YOUSS CONNECT.": "Enter the email and password of your YOUSS CONNECT account.",
    "Créer mon compte": "Create my account",
    "Le code par SMS n'est pas encore ouvert. Le compte s'ouvre avec l'e-mail et le mot de passe.": "SMS codes are not open yet. The account opens with email and password.",
    "Le message n'est pas encore ouvert.": "Messaging is not open yet.",
    "Les avis ne sont pas encore enregistrés.": "Reviews are not saved yet.",
    "La note n'est pas encore enregistrée.": "Ratings are not saved yet.",
    "Le suivi des vendeurs n'est pas encore ouvert.": "Following a seller is not open yet.",
    "Les pièces jointes ne sont pas encore ouvertes.": "Attachments are not open yet.",
    "Ajoutez une photo du produit.": "Add a product photo.",
    "Produit enregistré.": "Product saved.",
    "Enregistrer le produit": "Save the product",
    "Événement ou lieu": "Event or place",
    "Produit ou vendeur": "Product or seller",
    "Restaurant ou plat": "Restaurant or dish",
    "Restaurant, concert, lieu": "Restaurant, concert, place",
    "Concerts et festivals": "Concerts and festivals",
    "Produits locaux": "Local products",
    "Courses, commandes, billets": "Rides, orders, tickets",
    "Colis et repas": "Parcels and meals",
    "L'appel n'est pas encore ouvert.": "Calling is not open yet.",
    "Ce message reste sur cet appareil. Le chauffeur ne le reçoit pas.": "This message stays on this device. The driver does not receive it.",
    "Sur cet appareil": "On this device",
    "Elle sera marquée annulée sur cet appareil. L'établissement n'est pas prévenu.": "It will be marked cancelled on this device. The venue is not notified.",
    "Réservation marquée annulée sur cet appareil.": "Reservation marked cancelled on this device.",
    "Les réservations restent dans cet espace.": "Bookings stay in this space.",
    "Télécharger le rapport": "Download the report",
    "Rapport enregistré sur cet appareil.": "Report saved on this device.",
    "Exemple sur cet appareil. Ces chiffres ne viennent pas des ventes YOUSS CONNECT.": "Example on this device. These figures do not come from YOUSS CONNECT sales.",
    "Texte de la course copié.": "Ride text copied.",
    "Le partage n'est pas disponible sur cet appareil.": "Sharing is not available on this device.",
    "Artisanat et produits locaux": "Crafts and local products",
    "Comptes et assistance": "Accounts and support",
    "Aller à la connexion": "Go to log in",
    "E-mail ou mot de passe incorrect.": "Incorrect email or password.",
    "Un compte existe déjà avec cet e-mail.": "An account already exists with this email.",
    "Solde du compte": "Account balance",
    "Pas encore ouvert": "Not open yet",
    "Choisissez un code PIN à 4 chiffres. Il confirmera vos paiements.": "Choose a 4-digit PIN. It will confirm your payments.",
    "Saisissez votre code PIN.": "Enter your PIN.",
    "Code PIN incorrect.": "Incorrect PIN.",
    "Code PIN enregistré.": "PIN saved.",
    "Le rechargement n'a pas abouti.": "The top-up did not go through.",
    "Le retrait n'a pas abouti.": "The withdrawal did not go through.",
    "Choisissez Youss Wallet, la carte, le paiement mobile ou les espèces.": "Card and mobile payment are not collected yet. Choose Youss Wallet or cash.",
    "Mot de passe mis à jour.": "Password updated.",
    "Quatre villes": "Four cities",
    "Envoyez une carte, un passeport ou un permis.": "Send an identity card, a passport or a driving licence.",
    "Document envoyé, en attente de relecture.": "Document sent, waiting for review.",
    "Pièce d'identité acceptée.": "Identity document accepted.",
    "Document refusé. Vous pouvez en envoyer un autre.": "Document rejected. You can send another one.",
    "À envoyer": "To send",
    "En revue": "In review",
    "Acceptée": "Accepted",
    "Refusée": "Rejected",
    "iPhone : Face ID. Android : empreinte. Le code PIN reste disponible.": "iPhone: Face ID. Android: fingerprint. The PIN stays available.",
    "Face ID confirme les paiements. Le code PIN reste en secours.": "Face ID confirms payments. The PIN stays as backup.",
    "L'empreinte confirme les paiements. Le code PIN reste en secours.": "The fingerprint confirms payments. The PIN stays as backup.",
    "Connectez-vous pour enregistrer Face ID ou l'empreinte.": "Sign in to enroll Face ID or the fingerprint.",
    "Biométrie retirée. Les paiements demanderont le code PIN.": "Biometrics removed. Payments will ask for the PIN.",
    "Chat avec l'assistance": "Chat with support",
    "Écrire à KYA": "Write to KYA",
    "Envoyer le document": "Send the document",
    "Pièce d'identité": "Identity document",
    "Vérification du compte": "Account verification",
    "Document envoyé. La console KYA va le relire.": "Document sent. The KYA console will review it.",
    "Choisissez une photo ou un PDF.": "Choose a photo or a PDF.",
    "Le document doit faire moins de 5 Mo.": "The document must be under 5 MB.",
    "Ou le code PIN, en secours.": "Or the PIN, as backup.",
    "Confirmer avec Face ID": "Confirm with Face ID",
    "Confirmer avec l'empreinte": "Confirm with fingerprint",
    "Sur cet appareil, confirmez avec le code PIN. Face ID et l'empreinte restent sur le téléphone enregistré.": "On this device, confirm with the PIN. Face ID and the fingerprint stay on the enrolled phone.",
    "Confirmation requise": "Confirmation required",
    "Confirmez avec Face ID, l'empreinte ou le code PIN avant ce paiement. Aucun montant n'a été débité.": "Confirm with Face ID, fingerprint or PIN before this payment. No amount was debited.",
    "Écrivez votre message. La console KYA répond ici.": "Write your message. The KYA console replies here.",
    "Votre message": "Your message",
    "Message à KYA CORPORATION": "Message to KYA CORPORATION",
    "Connectez-vous avec le compte de KYA CORPORATION. La console n'ouvre pas un nouveau compte.": "Sign in with the KYA CORPORATION account. The console does not open a new account.",
    "Connexion cuisine": "Kitchen sign-in",
    "Identifiant": "Login ID",
    "Mot de passe": "Password",
    "J'ai mes identifiants": "I have my login details",
    "Je n'ai pas encore de compte": "I don't have an account yet",
    "La cuisine s'ouvre avec un compte": "The kitchen opens with an account",
    "KYA CORPORATION crée le compte, puis remet l'identifiant et le mot de passe au restaurant.": "KYA CORPORATION creates the account, then gives the login ID and password to the restaurant.",
    "Utilisez l'identifiant et le mot de passe remis par KYA. Le compte client YOUSS CONNECT reste séparé.": "Use the login ID and password given by KYA. The YOUSS CONNECT customer account stays separate.",
    "Identifiant ou mot de passe incorrect.": "Incorrect login ID or password.",
    "Restaurant en pause. Les clients ne commandent plus.": "Restaurant paused. Customers can no longer order.",
    "Restaurant ouvert.": "Restaurant open.",
    "Aucune commande pour le moment.": "No orders yet.",
    "Aucun plat pour le moment. Ajoutez la carte ci-dessous.": "No dishes yet. Add the menu below.",
    "Ajouter un plat": "Add a dish",
    "Publier sur la carte": "Publish on the menu",
    "Plat ajouté à la carte.": "Dish added to the menu.",
    "Plat retiré de la carte.": "Dish removed from the menu.",
    "Horaires enregistrés.": "Hours saved.",
    "Encaissé enregistré": "Recorded takings",
    "Les montants des commandes livrées sont enregistrés ici.": "Amounts from delivered orders are recorded here.",
    "Nouveau mot de passe": "New password",
    "Télécharger la fiche PDF": "Download the PDF sheet",
    "Compte restaurant": "Restaurant account",
    "Connectez-vous pour commander dans ce restaurant.": "Sign in to order from this restaurant.",
    "Commande envoyée à la cuisine": "Order sent to the kitchen",
    "La réservation de table n'est pas encore envoyée au restaurant.": "The table booking is not sent to the restaurant yet.",
    "Demande enregistrée": "Request saved",
    "Gozem, inDrive et WeDrive ne sont pas encore branchés. Aucun chauffeur n'est envoyé et aucun montant n'est débité.": "Gozem, inDrive and WeDrive are not connected yet. No driver is sent and no amount is charged.",
    "La demande est enregistrée. Le suivi s'affiche dès qu'un livreur est attribué.": "No courier is connected yet. No amount is charged.",
    "Gozem, inDrive et WeDrive ne sont pas encore branchés. La demande est enregistrée et aucun montant n'est débité.": "Gozem, inDrive and WeDrive are not connected yet. The request is saved and no amount is charged.",
    "Enregistrer la demande": "Save the request",
    "Le statut vient de la cuisine.": "The status comes from the kitchen. No courier is connected yet.",
    "Cuisine du restaurant": "Restaurant kitchen",
    "Les restaurants se créent ici. Chaque compte reçoit un identifiant et un mot de passe, à remettre en PDF. Les événements, chauffeurs et prix restent des exemples.": "Restaurants are created here. Each account receives a login ID and a password, to hand over as a PDF. Events, drivers and prices stay examples.",
    "Créer un compte cuisine": "Create a kitchen account",
    "Comptes et restaurants": "Accounts and restaurants",
    "Fiche à remettre": "Sheet to hand over",
    "Le mot de passe s'affiche une seule fois. Téléchargez le PDF, puis quittez cet écran.": "The password is shown only once. Download the PDF, then leave this screen.",
    "Compte créé. Téléchargez la fiche avant de quitter.": "Account created. Download the sheet before leaving.",
    "Nouveau mot de passe créé. Téléchargez la fiche.": "New password created. Download the sheet.",
    "Pas encore d'avis": "No reviews yet",
    "Les avis de ce restaurant s'afficheront ici lorsqu'ils seront enregistrés.": "Reviews for this restaurant will appear here once they are saved.",
    "Youss Wallet ou espèces": "Youss Wallet or cash",
    "Merci de nous rejoindre.": "Thank you for joining us.",
    "Chargement du restaurant…": "Loading the restaurant…",
    "Ce compte n'ouvre pas la console. Utilisez le compte de KYA CORPORATION.": "This account does not open the console. Use the KYA CORPORATION account.",
    "Le mot de passe doit contenir au moins 10 caractères, avec une lettre et un chiffre.": "The password must contain at least 10 characters, with a letter and a digit.",
    "Choisissez un code moins simple.": "Choose a less simple code.",
    "Choisissez un code différent.": "Choose a different code.",
    "Saisissez d'abord le code actuel.": "Enter the current code first.",
    "Choisissez le nouveau code PIN.": "Choose the new PIN.",
    "Trop de codes incorrects. Réessayez dans une heure.": "Too many incorrect codes. Try again in an hour.",
    "Trop de comptes créés depuis ce réseau. Réessayez dans une heure.": "Too many accounts created from this network. Try again in an hour.",
    "10 caractères min.": "10 characters min.",
    "Journal de la console": "Console log",
    "Aucune action enregistrée.": "No action recorded.",
    "Pièce acceptée": "Document accepted",
    "Pièce refusée": "Document rejected",
    "Restaurant créé": "Restaurant created",
    "Mot de passe cuisine renouvelé": "Kitchen password renewed"
  };
  const EXACT = { "Cuisine": "Kitchen" };
  function lockCore() { addPhrases(CORE); addPhrases(EXTRA); }
  lockCore();

  let obs = null;
  function observe() {
    if (!document.body || !obs) return;
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  function onMutations(muts) {
    if (current !== "en" || applying) return;
    obs.disconnect();
    try {
      muts.forEach(function (m) {
        if (m.type === "characterData" && m.target) {
          textOriginal.set(m.target, m.target.nodeValue);
          translateTextNode(m.target);
        } else if (m.type === "attributes" && m.target && m.attributeName) {
          const bag = attrOriginal.get(m.target);
          if (bag) bag[m.attributeName] = m.target.getAttribute(m.attributeName);
          translateAttrs(m.target);
        } else if (m.type === "childList") {
          m.addedNodes.forEach(function (n) { walk(n); });
        }
      });
    } finally { observe(); }
  }
  if (typeof MutationObserver === "function") {
    obs = new MutationObserver(onMutations);
    if (document.body) observe();
    else document.addEventListener("DOMContentLoaded", observe);
  }

  window.I18N = {
    t: t, set: set, translate: translate, apply: apply, applyTitle: applyTitle, rememberTitle: rememberTitle, addPhrases: addPhrases, lockCore: lockCore,
    get lang() { return current; }, LANGS: LANGS
  };
})();
