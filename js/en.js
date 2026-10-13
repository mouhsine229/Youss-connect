// Passe l'interface en anglais quand la langue choisie est English.
// Le français reste la source des écrans ; ce fichier traduit le texte affiché.
(function () {
  "use strict";
  if (!window.I18N) return;

  const EXACT = {
    "Accueil": "Home", "Explorer": "Explore", "Activités": "Activity", "Profil": "Profile",
    "Services": "Services", "Plus": "More", "Mes billets": "My tickets", "Présentation": "Overview",
    "Livraison": "Delivery", "Restaurants": "Restaurants", "Événements": "Events",
    "Culture & Tourisme": "Culture & Tourism", "Culture & tourisme": "Culture & tourism",
    "Culture et tourisme": "Culture and tourism", "Bonjour": "Hello", "Rechercher": "Search",
    "À proximité": "Nearby", "Pour vous": "For you", "Voir tout": "See all", "Votre ville": "Your city",
    "Retour": "Back", "Suivant": "Next", "Passer": "Skip", "Commencer": "Get started",
    "Confirmer": "Confirm", "Annuler": "Cancel", "Ajouter": "Add", "Enregistrer": "Save",
    "Continuer": "Continue", "Payer": "Pay", "Commander": "Order", "Fermer": "Close",
    "Réessayer": "Try again", "Partager": "Share", "Appeler": "Call", "Message": "Message",
    "Retour à l'accueil": "Back to home", "Connexion": "Log in", "Créer un compte": "Create an account",
    "Numéro de téléphone": "Phone number", "Mot de passe": "Password", "Mot de passe oublié": "Forgot password",
    "Vérification OTP": "OTP verification", "Solde disponible": "Available balance",
    "Envoyer": "Send", "Recevoir": "Receive", "Recharger": "Top up", "Retirer": "Withdraw",
    "Transactions récentes": "Recent transactions", "Langue": "Language", "Paramètres": "Settings",
    "Notifications": "Notifications", "Sécurité": "Security", "Aide": "Help", "Déconnexion": "Log out",
    "Thème": "Theme", "Clair": "Light", "Sombre": "Dark", "Parcours de démo": "Demo walkthroughs",
    "Aussi près d'ici": "Nearby", "Aucun résultat": "No results",
    "Changez le mot-clé ou la catégorie.": "Try another keyword or category.",
    "Fonction de démonstration. Son lancement réel dépendra des agréments obtenus dans chaque pays.": "Demo feature. Going live depends on the licences granted in each country.",
    "Langue : Français": "Language: French", "Langue : English": "Language: English",
    "Français · English": "French · English",

    "Voiture ou moto": "Car or motorcycle", "Colis et repas": "Parcels and meals",
    "Menu et livraison": "Menu and delivery", "Billets QR": "QR tickets",
    "Artisanat, produits": "Crafts and goods", "Sites et visites": "Sites and tours",
    "Produits, commandes, stats": "Products, orders, stats",
    "Transport, restaurant, événement, commerce, culture": "Rides, restaurants, events, shopping, culture",
    "Histoire, audio-guide, lieux à proximité": "History, audio guide, nearby places",
    "5 parcours": "5 tours", "5 parcours guidés": "5 guided tours",

    "Se déplacer facilement": "Get around easily",
    "Voiture, moto ou véhicule premium. Vous commandez, vous suivez le trajet en direct et vous payez depuis l'application, partout en ville.": "Car, motorcycle or premium vehicle. You book, follow the trip live and pay in the app, anywhere in the city.",
    "Mobilité": "Mobility",
    "Livraison, restaurants, commerce": "Delivery, restaurants, shopping",
    "Faites livrer un colis, commandez un repas ou achetez un produit local depuis la même application, avec le même compte.": "Send a parcel, order a meal or buy a local product from the same app, with the same account.",
    "Événements et activités": "Events and activities",
    "Concerts, festivals, conférences, spectacles et sport. Vous réservez et votre billet numérique vous attend dans l'application.": "Concerts, festivals, conferences, shows and sport. You book and your digital ticket is waiting in the app.",
    "Culture et tourisme africain": "African culture and tourism",
    "Destinations, monuments, musées et un scanner culturel qui raconte l'histoire de chaque lieu que vous visitez.": "Destinations, monuments, museums and a cultural scanner that tells the story of every place you visit.",
    "Culture": "Culture",
    "Tout au même endroit": "Everything in one place",
    "Transport, services, commerce, événements, culture, Wallet et Bonus. YOUSS CONNECT réunit tout cela à Cotonou, Dakar, Lomé et Accra.": "Rides, services, shopping, events, culture, Wallet and Bonus. YOUSS CONNECT brings all of that together in Cotonou, Dakar, Lomé and Accra.",
    "Écosystème": "Ecosystem",
    "J'ai déjà un compte": "I already have an account", "Se connecter": "Log in",
    "Pour la démo, entrez n'importe quel numéro. Le code OTP est 1234.": "For the demo, enter any phone number. The OTP code is 1234.",
    "Rester connecté": "Stay signed in", "Pas encore de compte ?": "No account yet?",
    "Explorer la démo sans compte": "Explore the demo without an account",
    "En continuant, vous acceptez les conditions d'utilisation de la maquette YOUSS CONNECT.": "By continuing, you accept the YOUSS CONNECT demo terms of use.",
    "ou": "or", "Indicatif": "Dial code",
    "Une seule application pour vivre l'Afrique au quotidien.": "One app for everyday life in Africa.",
    "Maquette interactive · données de démonstration": "Interactive demo · sample data",
    "Portée par KYA CORPORATION": "By KYA CORPORATION",
    "YOUSS CONNECT nécessite JavaScript.": "YOUSS CONNECT needs JavaScript.",

    "Concerts, festivals, conférences, spectacles, sport": "Concerts, festivals, conferences, shows, sport",
    "Rechercher un événement, un lieu…": "Search an event or a venue…",
    "Ville": "City", "Toutes": "All", "Tous": "All", "Tout": "All", "Tout afficher": "Show all",
    "À la une": "Featured", "Billets": "Tickets", "Quantité": "Quantity", "Total": "Total",
    "Acheter un billet": "Buy a ticket",
    "Billet nominatif avec QR Code · remboursable jusqu'à 48 h avant.": "Named ticket with a QR code · refundable up to 48 h before.",
    "À propos": "About", "Programme": "Schedule", "Organisateur": "Organiser", "Contacter": "Contact",
    "Date": "Date", "Heure": "Time", "Lieu": "Place", "Date & heure": "Date & time",
    "Participant": "Guest", "N° de billet": "Ticket no.",
    "Récapitulatif": "Summary", "Billetterie": "Ticketing",
    "Paiement": "Payment", "Frais de service": "Service fee", "Offerts": "Free",
    "Nom sur le billet": "Name on the ticket", "E-mail de réception": "Receipt email",
    "Billet confirmé": "Ticket confirmed",
    "Votre billet numérique est prêt. Il a aussi été envoyé par e-mail (démo).": "Your digital ticket is ready. It was also sent by email (demo).",
    "Voir mon billet et le QR Code": "View my ticket and QR code",
    "Réserver un transport": "Book a ride", "Restaurants à proximité": "Nearby restaurants",
    "Dîner avant le spectacle": "Dinner before the show", "Ajouter au calendrier": "Add to calendar",
    "Mes billets": "My tickets", "Billets numériques": "Digital tickets",
    "À venir": "Upcoming", "Passés": "Past", "Aucun billet": "No tickets",
    "Aucun billet à venir.": "No upcoming tickets.",
    "Découvrir d'autres événements": "Discover more events",
    "Découvrir les événements": "Discover events",
    "Vos billets d'événements apparaîtront ici après achat, avec leur QR Code.": "Your event tickets will appear here after purchase, with their QR code.",
    "Billet numérique": "Digital ticket",
    "Présentez ce code à l'entrée.": "Show this code at the entrance.",
    "Valide": "Valid", "Partager": "Share", "Calendrier": "Calendar",
    "Y aller en transport": "Get there by ride", "Restaurants autour": "Restaurants nearby",
    "Avant ou après": "Before or after",
    "Aucun événement dans cette catégorie pour le moment.": "No events in this category yet.",
    "Dîner avant ou après": "Dinner before or after",
    "Transport, restaurants et hébergements à proximité.": "Rides, restaurants and stays nearby.",
    "Plus que": "Only", "places": "seats left",

    "Où allez-vous ?": "Where to?", "Confirmation": "Confirmation", "Vérifiez votre course": "Check your ride",
    "Recherche": "Searching", "Chauffeur trouvé": "Driver found",
    "Votre chauffeur arrive. Vous recevrez une notification à son arrivée.": "Your driver is on the way. You will be notified on arrival.",
    "Suivre la course": "Track the ride", "Suivi de la course": "Trip tracking",
    "Course terminée": "Trip completed", "Fin de course": "End of trip",
    "Merci d'avoir voyagé avec YOUSS CONNECT.": "Thanks for riding with YOUSS CONNECT.",
    "Annuler la course": "Cancel the ride", "Annuler la course ?": "Cancel the ride?",
    "L'annulation est gratuite avant l'arrivée du chauffeur.": "Cancellation is free before the driver arrives.",
    "Chauffeur en route": "Driver on the way", "Chauffeur sur place": "Driver arrived",
    "Départ imminent": "Leaving shortly", "Installez-vous, la course démarre…": "Hop in, the trip is starting…",
    "Prise en charge": "Pickup", "Destination atteinte": "You have arrived",
    "Arrivé": "Arrived", "Arrivée prévue": "ETA",
    "Course payée": "Ride paid", "Assistance SOS": "SOS help",
    "Lien de suivi copié.": "Tracking link copied.", "Lien de suivi partagé.": "Tracking link shared.",
    "Départ": "Pickup", "Destination": "Drop-off", "Véhicule": "Vehicle",
    "Voiture": "Car", "Moto": "Motorcycle", "Premium": "Premium",
    "Code promo": "Promo code", "Appliquer": "Apply",
    "Maintenant": "Now", "Plus tard": "Later", "Pour moi": "For me",
    "Réserver": "Book", "Commander la course": "Request ride",

    "Que souhaitez-vous faire livrer ?": "What should we deliver?",
    "Recherche d'un livreur": "Looking for a courier", "Livreur trouvé": "Courier found",
    "Votre livreur se dirige vers le point de récupération.": "Your courier is heading to the pickup point.",
    "Suivre la livraison": "Track the delivery", "Suivi de livraison": "Delivery tracking",
    "Livraison terminée": "Delivery completed", "Preuve de livraison": "Proof of delivery",
    "Colis récupéré": "Parcel picked up", "En route": "On the way",
    "Le livreur est chez le destinataire": "The courier is at the recipient",
    "Livraison prévue": "Delivery by", "Récupération": "Pickup",
    "Point de récupération": "Pickup point", "Destinataire": "Recipient",
    "Description du colis": "Parcel description", "Envoyer un colis": "Send a parcel",

    "Votre panier": "Your cart", "Votre panier est vide": "Your cart is empty",
    "Ajoutez des plats depuis le menu.": "Add dishes from the menu.",
    "Panier": "Cart", "Panier vide": "Empty cart",
    "Ajouter des plats": "Add dishes", "Vider le panier": "Clear cart",
    "Note pour le restaurant": "Note for the restaurant",
    "Sous-total": "Subtotal", "Frais de livraison": "Delivery fee", "Frais de service": "Service fee",
    "Voir les restaurants": "See restaurants",
    "Ajoutez un plat pour commander. Vos restaurants préférés sont à portée de main.": "Add a dish to order. Your favourite restaurants are close by.",
    "Menu": "Menu", "Avis": "Reviews", "Infos": "Info",
    "Réserver une table": "Book a table", "Confirmer la réservation": "Confirm the booking",
    "Jour": "Day", "Personnes": "People", "Aujourd'hui": "Today", "Demain": "Tomorrow",
    "Table réservée": "Table booked", "Favori": "Favourite",
    "Ajouté aux favoris": "Added to favourites", "Retiré des favoris": "Removed from favourites",
    "Remplacer le panier ?": "Replace the cart?",
    "Vider et ajouter": "Clear and add",
    "Adresse": "Address", "Livraison": "Delivery", "À emporter": "Pickup",
    "Confirmation": "Confirmation", "Commande confirmée": "Order confirmed",
    "Suivi de commande": "Order tracking", "Noter": "Rate",
    "Merci pour votre note !": "Thanks for your rating!",
    "En préparation": "Preparing", "Prêt": "Ready", "Livré": "Delivered",
    "Commande": "Order", "Commandes": "Orders",

    "Ajouter au panier": "Add to cart", "Acheter maintenant": "Buy now",
    "En stock": "In stock", "Rupture": "Sold out", "Rupture de stock": "Out of stock",
    "Description": "Description", "Caractéristiques": "Details", "Avis clients": "Customer reviews",
    "Produits similaires": "Similar products", "Panier Market": "Market cart",
    "Panier vide": "Empty cart",
    "Ajoutez des produits Youss Market pour continuer.": "Add Youss Market products to continue.",
    "Voir Youss Market": "Browse Youss Market", "Continuer mes achats": "Continue shopping",
    "Passer la commande": "Checkout", "Sous-total": "Subtotal",
    "Livraison": "Delivery", "Total estimé": "Estimated total",
    "Adresse": "Address", "Paiement": "Payment", "Confirmation": "Confirmation",
    "Vendeur vérifié": "Verified seller", "Contacter": "Contact", "Suivre": "Follow",
    "Paiement sécurisé": "Secure payment", "Retour 7 jours": "7-day returns", "sous conditions": "conditions apply",
    "Livraison 48 h": "Delivery in 48 h",

    "Villes": "Cities", "Lieux à visiter": "Places to visit",
    "Monuments, musées et traditions": "Monuments, museums and traditions",
    "Toutes les villes": "All cities", "Près de": "Near", "Carte": "Map",
    "Scanner un monument": "Scan a monument",
    "Histoire, audio-guide, lieux à proximité": "History, audio guide, nearby places",
    "Aucun lieu de ce type dans cette ville.": "No place of this type in this city.",
    "Infos pratiques": "Practical info", "Se déplacer à": "Get around",
    "Explorer autour": "Explore around", "Explorer autour de moi": "Explore around me",
    "Lieux à proximité": "Nearby places", "Autour de ce lieu": "Around this place",
    "Restaurants autour": "Restaurants nearby", "Y aller en transport": "Ride there",
    "Événements à": "Events in", "Page complète de la ville": "Full city page",
    "Votre ville": "Your city", "Destination": "Destination",
    "Aperçu": "Overview", "Histoire": "History", "Visite": "Visit",
    "Pourquoi c'est là": "Why it matters", "Époque": "Period", "Horaires": "Hours", "Tarif": "Price",
    "Durée conseillée": "Suggested time", "Conseil": "Tip",
    "Audio-guide": "Audio guide", "Écouter l'histoire · 1 min": "Listen to the story · 1 min",
    "Vidéo de présentation": "Intro video", "Aperçu immersif · 45 s": "Immersive preview · 45 s",
    "Réserver une visite guidée": "Book a guided tour", "Visite guidée": "Guided tour",
    "Langue du guide": "Guide language", "Langues du guide": "Guide languages",
    "Patrimoine mondial UNESCO": "UNESCO World Heritage", "Patrimoine": "Heritage",
    "Type": "Type", "Coordonnées": "Coordinates",
    "QR Code du site": "Site QR code",
    "À afficher sur place pour tester le scanner": "Show it on site to try the scanner",
    "Résultat du scan": "Scan result", "Monument reconnu": "Monument recognised",
    "Rescanner": "Scan again", "Analyse": "Analysis",
    "Pointez un monument, un musée ou un site": "Point at a monument, museum or site",
    "Reconnaître le monument": "Recognise the monument", "Caméra": "Camera", "Galerie": "Gallery",
    "Sites culturels": "Cultural sites", "Autour de": "Around",
    "Palais": "Palace", "Musées": "Museums", "Sites historiques": "Historic sites",
    "Traditions": "Traditions", "Nature & plages": "Nature & beaches",
    "Activités culturelles": "Cultural activities", "Monument": "Monument",
    "Utiliser": "Use",

    "Mes activités": "My activity", "Historique unifié de tous vos services": "One history for every service",
    "Aucune activité": "No activity",
    "Toutes vos courses, commandes, livraisons, billets et paiements apparaîtront ici automatiquement.": "Your rides, orders, deliveries, tickets and payments will appear here automatically.",
    "Aucune activité dans cette catégorie pour le moment.": "Nothing in this category yet.",
    "Explorer les services": "Explore services", "Activité": "Activity",
    "Activité introuvable": "Activity not found", "Cette activité n'existe plus.": "This activity no longer exists.",
    "Détail de l'activité": "Activity details",
    "Annuler la réservation": "Cancel the booking", "Annuler la réservation ?": "Cancel the booking?",
    "L'établissement sera prévenu immédiatement.": "The venue will be notified right away.",
    "Réservation annulée.": "Booking cancelled.",
    "Terminé": "Completed", "Annulé": "Cancelled", "En attente": "Pending", "Réussi": "Successful", "Échoué": "Failed",

    "Toutes": "All", "Non lues": "Unread", "Tout est lu": "All caught up",
    "Aucune notification": "No notifications", "Vous êtes à jour.": "You are up to date.",
    "Marquer comme lu": "Mark as read", "Tout marquer comme lu": "Mark all as read",

    "Points et réductions": "Points and discounts", "Échanger une récompense": "Redeem a reward",
    "Aucune récompense": "No rewards",
    "Les points s'échangent contre une course, une réduction resto ou un billet.": "Points can be exchanged for a ride, a restaurant discount or a ticket.",
    "Voir les récompenses": "See rewards", "Mes récompenses": "My rewards",
    "points disponibles": "points available", "Échanger": "Redeem",

    "Gérez votre activité": "Run your business", "Profil professionnel": "Business profile",
    "Produits & stocks": "Products & stock", "Supprimer ce produit ?": "Delete this product?",
    "Il ne sera plus visible sur Youss Market.": "It will no longer appear on Youss Market.",
    "Supprimer": "Delete", "Produit supprimé.": "Product deleted.",
    "Nouveau produit": "New product", "Prestations proposées": "Services you offer",
    "Aucune commande": "No orders", "Aucune commande dans cet état.": "No orders in this state.",
    "Réservations": "Bookings", "Statistiques": "Statistics",
    "7 jours": "7 days", "30 jours": "30 days",

    "Modifier mon profil": "Edit my profile", "Compte vérifié": "Verified account",
    "à vérifier": "to verify", "Réglages": "Settings", "Moyens de paiement": "Payment methods",
    "Vérification du compte": "Account verification", "Appareils connectés": "Connected devices",
    "Historique des connexions": "Login history", "Se déconnecter ?": "Log out?",
    "Les données de démo restent sur cet appareil.": "Demo data stays on this device.",
    "Questions fréquentes": "FAQ", "Signalement": "Report",
    "Envoyer le signalement": "Send the report", "Objet du signalement": "Report topic",
    "Activité concernée": "Related activity", "Aucune": "None", "Description": "Description",
    "Décrivez ce qui s'est passé…": "Describe what happened…",
    "Joindre une capture ou une photo": "Attach a screenshot or a photo",
    "Thème sombre": "Dark theme", "Par défaut": "Default",
    "Réinitialiser la démo": "Reset the demo", "Réinitialiser la démo ?": "Reset the demo?",
    "Chat avec l'assistance": "Chat with support", "Urgence SOS": "SOS emergency",
    "Alerte immédiate": "Immediate alert", "Appeler": "Call",
    "Du lundi au samedi, 8h - 20h": "Monday to Saturday, 8am – 8pm",
    "Réponse en quelques minutes": "A reply within minutes",

    "30 derniers jours": "Last 30 days", "Solde de démo": "Demo balance",
    "Entrées": "Money in", "Sorties": "Money out", "En attente": "Pending",
    "Relevé": "Statement", "Aucune transaction": "No transactions",
    "Vos opérations apparaîtront ici.": "Your transactions will appear here.",
    "Détail de la transaction": "Transaction details", "Transaction introuvable": "Transaction not found",
    "Référence": "Reference", "Service": "Service", "Moyen": "Method", "Statut": "Status",
    "Reçu PDF": "PDF receipt", "Signaler": "Report", "Réessayer le paiement": "Try the payment again",
    "Annuler": "Cancel", "Confirmer": "Confirm",
    "Recharger mon Wallet": "Top up my Wallet", "Montant": "Amount",
    "Ou montant personnalisé (FCFA)": "Or a custom amount (FCFA)", "Méthode": "Method",
    "Envoyer de l'argent": "Send money", "Recevoir de l'argent": "Receive money",
    "Code PIN": "PIN code", "Payer": "Pay", "Retirer": "Withdraw",
    "Paiement réussi": "Payment successful", "Paiement en attente": "Payment pending",
    "Opération confirmée": "Transaction confirmed", "Solde insuffisant": "Insufficient balance",
    "Masquer les informations": "Hide details", "Afficher les informations": "Show details",
    "Masquer le solde": "Hide balance",
    "Confirmer l'envoi": "Confirm the transfer", "Confirmer avec mon code PIN": "Confirm with my PIN",
    "Gratuit": "Free", "Note (optionnel)": "Note (optional)",
    "Note": "Note", "Frais": "Fee", "Montant": "Amount",
    "Générer": "Generate", "Partager mon code": "Share my code", "Copier le lien": "Copy the link",
    "Code copié.": "Code copied.", "QR Pay": "QR Pay",
    "Paiement mobile": "Mobile money", "Carte bancaire": "Bank card",
    "Agent YOUSS CONNECT": "YOUSS CONNECT agent",
    "Dépôt en espèces chez un agent": "Cash deposit with an agent",
    "Opérateur à définir · conceptuel": "Operator to be defined · conceptual",
    "Visa / Mastercard · conceptuel": "Visa / Mastercard · conceptual",
    "Youss Wallet · conceptuel": "Youss Wallet · conceptual",
    "Tout": "All", "Non attribuée": "Not assigned",

    "Recherches populaires": "Popular searches", "Catégories": "Categories",
    "Commerces & produits": "Shops & products", "Tourisme": "Tourism",
    "Transport & services": "Rides & services", "Produits": "Products", "Plats": "Dishes",
    "Lieux culturels": "Cultural places", "Destinations": "Destinations",
    "Effacer les filtres": "Clear filters", "Filtres": "Filters", "Résultats": "Results",
    "Voir sur la carte": "View on the map", "Liste": "List", "Carte": "Map",

    "Bienvenue": "Welcome", "mode démo": "demo mode",
    "Change la ville des restos, des courses et de la carte.": "Changes the city for restaurants, rides and the map.",
    "Actuelle": "Current",
    "Vous êtes maintenant à": "You are now in",

    "Moins": "Less", "Plus": "More", "Favori": "Favourite",
    "Ajouter": "Add", "Retirer des favoris": "Removed from favourites",
    "Lieu sauvegardé": "Place saved", "Retiré de vos lieux sauvegardés": "Removed from saved places",
    "Lieux sauvegardés": "Saved places",
    "Lecture de l'audio-guide…": "Playing the audio guide…",
    "Audio-guide indisponible sur ce navigateur (démo).": "Audio guide is not available in this browser (demo).",
    "Visite réservée": "Tour booked",
    "Message envoyé à l'organisateur.": "Message sent to the organiser.",
    "Message envoyé au vendeur.": "Message sent to the seller.",
    "Lien copié.": "Link copied.", "Billet copié.": "Ticket copied.",
    "Événement ajouté au calendrier.": "Event added to the calendar.",
    "Code promo inconnu (essayez YOUSS10).": "Unknown promo code (try YOUSS10).",
    "Code appliqué : -10 %": "Code applied: -10%",
    "Montant minimum : 500 FCFA.": "Minimum amount: 500 FCFA.",
    "Indiquez un destinataire.": "Enter a recipient.",
    "Indiquez un montant valide (100 FCFA minimum).": "Enter a valid amount (100 FCFA minimum).",
    "Code PIN incorrect (démo : 0000).": "Wrong PIN (demo: 0000).",
    "Code PIN mis à jour.": "PIN updated.",
    "Empreinte reconnue (simulation).": "Fingerprint recognised (simulation).",
    "Nouveau code envoyé (démo : 1234).": "A new code was sent (demo: 1234).",
    "Préférence enregistrée.": "Preference saved.",
    "Merci ! Votre proposition a été transmise à KYA CORPORATION.": "Thank you! Your suggestion was sent to KYA CORPORATION.",
    "Documents reçus · compte vérifié (démo).": "Documents received · account verified (demo).",
    "Signalement transmis. Merci.": "Report sent. Thank you.",
    "Décrivez le problème en quelques mots.": "Describe the problem in a few words.",
    "Un conseiller vous répond dans quelques instants (démo).": "An agent will reply in a moment (demo).",
    "Appel du support (démo).": "Support call (demo).",
    "Reçu envoyé par e-mail (démo).": "Receipt sent by email (demo).",
    "Relevé PDF envoyé par e-mail (démo).": "PDF statement sent by email (demo).",
    "Vidéo produit disponible dans la version finale.": "A product video will be available in the final version.",
    "Vous suivez ce vendeur.": "You are now following this seller.",
    "Écran introuvable": "Screen not found",
    "Chargement": "Loading",
    "Afrique": "African", "International": "International", "Boissons": "Drinks", "Desserts": "Desserts",
    "Fast-food": "Fast food", "Cuisine béninoise": "Beninese cuisine", "Cuisine sénégalaise": "Senegalese cuisine",
    "Fait maison": "Homemade", "Plats": "Mains", "Accompagnements": "Sides", "Entrées": "Starters",
    "Quartier": "Neighbourhood", "Aéroport": "Airport", "Marché": "Market", "Plage": "Beach",
    "Stade": "Stadium", "Université": "University", "Lieu": "Place",
    "langue": "Language", "monnaie": "Currency", "indicatif": "Dial code", "periode": "Best time",
    "fuseau": "Time zone", "transport": "Transport",
    "Langue": "Language", "Monnaie": "Currency", "Indicatif": "Dial code", "Periode": "Best time", "Fuseau": "Time zone", "Transport": "Transport"
  };

  if (window.YC_EN_PACK) {
    Object.keys(window.YC_EN_PACK).forEach(function (k) {
      if (!EXACT[k]) EXACT[k] = window.YC_EN_PACK[k];
    });
  }

  const RULES = [
    [/^(\d+)\s+lieux? dans (.+)$/, function (m) { return (m[1] === "1" ? "1 place in " : m[1] + " places in ") + m[2]; }],
    [/^(\d+)\s+événements?$/, function (m) { return m[1] === "1" ? "1 event" : m[1] + " events"; }],
    [/^(\d+)\s+billet(s)?$/, function (m) { return m[1] === "1" ? "1 ticket" : m[1] + " tickets"; }],
    [/^(\d+)\s+article\(s\)$/, function (m) { return m[1] + " item(s)"; }],
    [/^(\d+)\s+points Youss Bonus$/, function (m) { return m[1] + " Youss Bonus points"; }],
    [/^Niveau (\S+) · (.+) pts avant (\S+)$/, function (m) { return "Level " + m[1] + " · " + m[2] + " pts until " + m[3]; }],
    [/^Niveau (\S+)$/, function (m) { return "Level " + m[1]; }],
    [/^dès (.+)$/, function (m) { return "from " + m[1]; }],
    [/^Course vers (.+)$/, function (m) { return "Ride to " + m[1]; }],
    [/^Scanner (.+)$/, function (m) { return "Scan " + m[1]; }],
    [/^Billet (.+)$/, function (m) { return "Ticket " + m[1]; }],
    [/^Restaurant · (.+)$/, function (m) { return "Restaurant · " + m[1]; }],
    [/^Événement · (.+)$/, function (m) { return "Event · " + m[1]; }],
    [/^Commande en cours · (.+)$/, function (m) { return "Order in progress · " + m[1]; }],
    [/^Se déplacer à (.+)$/, function (m) { return "Get around " + m[1]; }],
    [/^Utiliser (.+) comme ville$/, function (m) { return "Use " + m[1] + " as your city"; }],
    [/^Près de (.+)$/, function (m) { return "Near " + m[1]; }],
    [/^Autour de (.+)$/, function (m) { return "Around " + m[1]; }],
    [/^Événements à (.+)$/, function (m) { return "Events in " + m[1]; }],
    [/^Destination (.+)$/, function (m) { return "Destination " + m[1]; }],
    [/^(.+) · Destination$/, function (m) { return m[1] + " · Destination"; }],
    [/^Vers (.+)$/, function (m) { return "To " + m[1]; }],
    [/^Y aller en transport$/, function () { return "Get there by ride"; }],
    [/^Il y a (\d+) min$/, function (m) { return m[1] + " min ago"; }],
    [/^Il y a (\d+) h$/, function (m) { return m[1] + " h ago"; }],
    [/^Il y a (\d+) j$/, function (m) { return m[1] + " d ago"; }],
    [/^Hier à (.+)$/, function (m) { return "Yesterday at " + m[1]; }],
    [/^Aujourd'hui à (.+)$/, function (m) { return "Today at " + m[1]; }],
    [/^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche) à (.+)$/, function (m) {
      const days = { Lundi: "Monday", Mardi: "Tuesday", Mercredi: "Wednesday", Jeudi: "Thursday", Vendredi: "Friday", Samedi: "Saturday", Dimanche: "Sunday" };
      return days[m[1]] + " at " + m[2];
    }],
    [/^Il y a (\d+) jours?$/, function (m) { return m[1] === "1" ? "1 day ago" : m[1] + " days ago"; }],
    [/^Il y a (\d+) semaines?$/, function (m) { return m[1] === "1" ? "1 week ago" : m[1] + " weeks ago"; }],
    [/^La semaine dernière$/, function () { return "Last week"; }],
    [/^Hier$/, function () { return "Yesterday"; }],
    [/^Dans (\d+) min$/, function (m) { return "In " + m[1] + " min"; }],
    [/^Dans (\d+) h$/, function (m) { return "In " + m[1] + " h"; }],
    [/^Dans (\d+) jours?$/, function (m) { return m[1] === "1" ? "In 1 day" : "In " + m[1] + " days"; }],
    [/^(.+) points avant le niveau (.+)$/, function (m) { return m[1] + " points until level " + m[2]; }],
    [/^(.+) points Youss Bonus$/, function (m) { return m[1] + " Youss Bonus points"; }],
    [/^Plus que (\d+) places$/, function (m) { return "Only " + m[1] + " seats left"; }],
    [/^(\d+) places$/, function (m) { return m[1] + " seats"; }],
    [/^Payer (.+)$/, function (m) { return "Pay " + m[1]; }],
    [/^Recharger · (.+)$/, function (m) { return "Top up · " + m[1]; }],
    [/^Commander · (.+)$/, function (m) { return "Order · " + m[1]; }],
    [/^Voir le panier · (.+)$/, function (m) { return "View cart · " + m[1]; }],
    [/^(.+) points disponibles$/, function (m) { return m[1] + " points available"; }],
    [/^(.+) en attente$/, function (m) { return m[1] + " pending"; }],
    [/^(.+) au total$/, function (m) { return m[1] + " in total"; }],
    [/^Bienvenue (.+), vous êtes en mode démo\.$/, function (m) { return "Welcome " + m[1] + ", you are in demo mode."; }],
    [/^Vous êtes maintenant à (.+)\.$/, function (m) { return "You are now in " + m[1] + "."; }],
    [/ ajouté au panier\.?$/, function (m, all) { return all.replace(/ ajouté au panier\.?$/, " added to cart."); }],
    [/ ajouté au panier Market\.$/, function (m, all) { return all.replace(/ ajouté au panier Market\.$/, " added to the Market cart."); }]
  ];

  let phraseKeys = null;
  function frenchBits(core) {
    return /[àâäéèêëïîôùûüçœÀÂÉÈÊËÎÏÔÙÛÜÇŒ]/.test(core) || /\b(le|la|les|des|une|pour|avec|votre|vous|dans|cette|cet|est|sont|pas)\b/i.test(core);
  }
  function fillPhrases(core) {
    if (!phraseKeys) {
      phraseKeys = Object.keys(EXACT).filter(function (k) { return k.length >= 14; });
      phraseKeys.sort(function (a, b) { return b.length - a.length; });
    }
    let s = core;
    for (let i = 0; i < phraseKeys.length; i++) {
      const fr = phraseKeys[i];
      if (s.indexOf(fr) === -1) continue;
      s = s.split(fr).join(EXACT[fr]);
      if (!frenchBits(s)) break;
    }
    return s;
  }
  function translateCore(core) {
    if (EXACT[core]) return EXACT[core];
    if (core.indexOf(" · ") !== -1) {
      const bits = core.split(" · ");
      let changed = false;
      const next = bits.map(function (bit) {
        const t = EXACT[bit] || runRules(bit);
        if (t !== bit) changed = true;
        return t;
      });
      if (changed) return next.join(" · ");
    }
    const ruled = runRules(core);
    if (ruled !== core) return ruled;
    if (!frenchBits(core)) return core;
    return fillPhrases(core);
  }
  function runRules(core) {
    for (let i = 0; i < RULES.length; i++) {
      const m = core.match(RULES[i][0]);
      if (m) return RULES[i][1](m, core);
    }
    return core;
  }
  function applyText(raw) {
    if (!I18N.lang || I18N.lang !== "en" || raw == null) return raw == null ? "" : String(raw);
    const s = String(raw);
    const core = s.trim();
    if (!core) return s;
    const next = translateCore(core);
    if (next === core) return s;
    return s.replace(core, next);
  }
  function apply(root) {
    if (!root || I18N.lang !== "en") return;
    const skip = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, OPTION: 1 };
    const attrs = ["placeholder", "aria-label", "title", "alt"];
    function walk(node) {
      if (node.nodeType === 3) {
        const next = applyText(node.nodeValue);
        if (next !== node.nodeValue) node.nodeValue = next;
        return;
      }
      if (node.nodeType !== 1 || skip[node.tagName]) return;
      attrs.forEach(function (attr) {
        if (!node.hasAttribute(attr)) return;
        const v = node.getAttribute(attr);
        const next = applyText(v);
        if (next !== v) node.setAttribute(attr, next);
      });
      for (let i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
    }
    walk(root);
  }

  const prev = window.I18N;
  window.I18N = {
    t: prev.t, set: prev.set, LANGS: prev.LANGS, apply: apply, applyText: applyText,
    get lang() { return prev.lang; }
  };
})();
