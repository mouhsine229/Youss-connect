/* =========================================================
   YOUSS CONNECT — DONNÉES DE DÉMONSTRATION
   Données fictives mais réalistes. Villes : Cotonou (ville de l'utilisateur),
   Dakar, Lomé, Accra. Aucune marque, banque ou opérateur n'est présenté
   comme partenaire officiel.
   ========================================================= */
(function () {
  "use strict";

  const IMG = "./assets/img/";

  const COUNTRIES = [
    { code: "BJ", name: "Bénin", dial: "+229", flag: "🇧🇯", currency: "FCFA", cities: ["Cotonou", "Porto-Novo", "Ouidah", "Abomey", "Parakou"] },
    { code: "SN", name: "Sénégal", dial: "+221", flag: "🇸🇳", currency: "FCFA", cities: ["Dakar", "Saint-Louis", "Thiès", "Mbour"] },
    { code: "TG", name: "Togo", dial: "+228", flag: "🇹🇬", currency: "FCFA", cities: ["Lomé", "Kara", "Sokodé", "Kpalimé"] },
    { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭", currency: "GHS", cities: ["Accra", "Kumasi", "Takoradi", "Cape Coast"] }
  ];

  /* Villes de démonstration (destinations + bases Transport/Livraison) */
  const CITIES = {
    "Cotonou": {
      name: "Cotonou", country: "Bénin", code: "BJ", lat: 6.3703, lng: 2.3912, zoom: 12,
      hero: IMG + "places/city-cotonou.jpg",
      tagline: "Capitale économique du Bénin, entre lagune et océan.",
      intro: "Cotonou concentre l'énergie du Bénin : le marché Dantokpa, l'un des plus grands d'Afrique de l'Ouest, la Place de l'Amazone, la plage de Fidjrossè et, à moins d'une heure, Ouidah, Porto-Novo et le village lacustre de Ganvié.",
      practical: { langue: "Français, fon, yoruba", monnaie: "Franc CFA (FCFA)", indicatif: "+229", periode: "Novembre à mars (saison sèche)", fuseau: "GMT+1", transport: "Zémidjans (moto-taxis), taxis, VTC" },
      poi: [
        { name: "Haie Vive", lat: 6.3570, lng: 2.3910, kind: "quartier" },
        { name: "Aéroport de Cotonou (Cadjèhoun)", lat: 6.3572, lng: 2.3844, kind: "aeroport" },
        { name: "Marché Dantokpa", lat: 6.3705, lng: 2.4335, kind: "marche" },
        { name: "Place de l'Amazone", lat: 6.3654, lng: 2.4183, kind: "monument" },
        { name: "Ganhi", lat: 6.3600, lng: 2.4290, kind: "quartier" },
        { name: "Cadjèhoun", lat: 6.3620, lng: 2.3960, kind: "quartier" },
        { name: "Plage de Fidjrossè", lat: 6.3515, lng: 2.3690, kind: "plage" },
        { name: "Akpakpa", lat: 6.3650, lng: 2.4600, kind: "quartier" },
        { name: "Stade de l'Amitié", lat: 6.3814, lng: 2.4082, kind: "stade" },
        { name: "Palais des Congrès", lat: 6.3560, lng: 2.4150, kind: "lieu" },
        { name: "Université d'Abomey-Calavi", lat: 6.4167, lng: 2.3500, kind: "universite" },
        { name: "Ganvié (embarcadère d'Abomey-Calavi)", lat: 6.4480, lng: 2.3560, kind: "lieu" }
      ]
    },
    "Dakar": {
      name: "Dakar", country: "Sénégal", code: "SN", lat: 14.6928, lng: -17.4467, zoom: 12,
      hero: IMG + "places/city-dakar.jpg",
      tagline: "La pointe la plus occidentale de l'Afrique, ville de la Teranga.",
      intro: "Dakar mêle corniches atlantiques, art contemporain et mémoire : l'île de Gorée, le Monument de la Renaissance africaine, le Musée des Civilisations noires et les marchés du Plateau. La scène musicale et la biennale Dak'Art en font une capitale culturelle.",
      practical: { langue: "Français, wolof", monnaie: "Franc CFA (FCFA)", indicatif: "+221", periode: "Novembre à mai", fuseau: "GMT", transport: "Taxis, VTC, bus, BRT" },
      poi: [
        { name: "Plateau", lat: 14.6711, lng: -17.4367, kind: "quartier" },
        { name: "Almadies", lat: 14.7440, lng: -17.5170, kind: "quartier" },
        { name: "Monument de la Renaissance africaine", lat: 14.7224, lng: -17.4934, kind: "monument" },
        { name: "Marché Sandaga", lat: 14.6730, lng: -17.4380, kind: "marche" },
        { name: "Marché Kermel", lat: 14.6745, lng: -17.4320, kind: "marche" },
        { name: "Corniche Ouest", lat: 14.6900, lng: -17.4650, kind: "lieu" },
        { name: "Point E", lat: 14.6920, lng: -17.4610, kind: "quartier" },
        { name: "Ngor", lat: 14.7500, lng: -17.5150, kind: "quartier" },
        { name: "Stade Léopold Sédar Senghor", lat: 14.7420, lng: -17.4530, kind: "stade" },
        { name: "Université Cheikh Anta Diop", lat: 14.6880, lng: -17.4620, kind: "universite" },
        { name: "Embarcadère de Gorée", lat: 14.6700, lng: -17.4300, kind: "lieu" },
        { name: "Aéroport Blaise Diagne (AIBD)", lat: 14.6710, lng: -17.0730, kind: "aeroport" }
      ]
    },
    "Lomé": {
      name: "Lomé", country: "Togo", code: "TG", lat: 6.1319, lng: 1.2228, zoom: 13,
      hero: IMG + "places/city-lome.jpg",
      tagline: "Une capitale au bord de l'océan, à taille humaine.",
      intro: "Lomé s'étire le long du golfe de Guinée : plages bordées de cocotiers, Grand Marché et ses « Nana Benz », Palais de Lomé transformé en centre d'art, Monument de l'Indépendance et le singulier marché des féticheurs d'Akodessewa.",
      practical: { langue: "Français, éwé, kabyè", monnaie: "Franc CFA (FCFA)", indicatif: "+228", periode: "Novembre à février", fuseau: "GMT", transport: "Zémidjans, taxis, VTC" },
      poi: [
        { name: "Grand Marché de Lomé", lat: 6.1310, lng: 1.2250, kind: "marche" },
        { name: "Monument de l'Indépendance", lat: 6.1290, lng: 1.2170, kind: "monument" },
        { name: "Plage de Lomé", lat: 6.1230, lng: 1.2300, kind: "plage" },
        { name: "Aéroport Gnassingbé Eyadéma", lat: 6.1656, lng: 1.2545, kind: "aeroport" },
        { name: "Palais de Lomé", lat: 6.1280, lng: 1.2270, kind: "monument" },
        { name: "Akodessewa", lat: 6.1370, lng: 1.2560, kind: "quartier" },
        { name: "Bè", lat: 6.1350, lng: 1.2420, kind: "quartier" },
        { name: "Tokoin", lat: 6.1500, lng: 1.2200, kind: "quartier" },
        { name: "Université de Lomé", lat: 6.1730, lng: 1.2130, kind: "universite" },
        { name: "Stade de Kégué", lat: 6.1930, lng: 1.2340, kind: "stade" },
        { name: "Hôtel 2 Février", lat: 6.1296, lng: 1.2149, kind: "lieu" },
        { name: "Agoè", lat: 6.2200, lng: 1.2000, kind: "quartier" }
      ]
    },
    "Accra": {
      name: "Accra", country: "Ghana", code: "GH", lat: 5.6037, lng: -0.1870, zoom: 12,
      hero: IMG + "places/city-accra.jpg",
      tagline: "Créative, océane, en mouvement.",
      intro: "Accra vibre entre Jamestown et ses fresques, la Place de l'Indépendance, le mausolée de Kwame Nkrumah, le marché de Makola et la plage de Labadi. Scène afrobeats, mode kente et cuisine de rue en font une étape incontournable.",
      practical: { langue: "Anglais, twi, ga", monnaie: "Cedi (GHS) — prix de démonstration affichés en FCFA", indicatif: "+233", periode: "Novembre à mars", fuseau: "GMT", transport: "Taxis, VTC, tro-tros" },
      poi: [
        { name: "Osu (Oxford Street)", lat: 5.5560, lng: -0.1830, kind: "quartier" },
        { name: "Black Star Square", lat: 5.5478, lng: -0.1920, kind: "monument" },
        { name: "Mausolée Kwame Nkrumah", lat: 5.5465, lng: -0.2010, kind: "monument" },
        { name: "Phare de Jamestown", lat: 5.5330, lng: -0.2120, kind: "monument" },
        { name: "Marché de Makola", lat: 5.5480, lng: -0.2070, kind: "marche" },
        { name: "Plage de Labadi", lat: 5.5580, lng: -0.1480, kind: "plage" },
        { name: "Aéroport de Kotoka", lat: 5.6052, lng: -0.1668, kind: "aeroport" },
        { name: "Accra Mall", lat: 5.6220, lng: -0.1740, kind: "lieu" },
        { name: "East Legon", lat: 5.6350, lng: -0.1550, kind: "quartier" },
        { name: "University of Ghana (Legon)", lat: 5.6500, lng: -0.1870, kind: "universite" },
        { name: "Accra Sports Stadium", lat: 5.5510, lng: -0.1900, kind: "stade" },
        { name: "National Theatre", lat: 5.5520, lng: -0.2000, kind: "lieu" }
      ]
    }
  };
  const DESTINATIONS = ["Cotonou", "Dakar", "Lomé", "Accra"];

  /* ---------- Restaurants ---------- */
  const RESTAURANTS = [
    {
      id: "rest1", name: "Chez Maman Bénin", city: "Cotonou", area: "Haie Vive", cat: "Afrique", tags: ["Cuisine béninoise", "Fait maison"],
      rating: 4.7, reviews: 318, km: 1.2, avg: 4500, time: "25–35 min", fee: 500, hours: "11h00 – 22h00", open: [11, 22],
      lat: 6.3575, lng: 2.3925, img: IMG + "food/rest-maman-benin.jpg",
      body: "Cuisine béninoise généreuse : pâte, sauce d'arachide, poisson braisé et igname pilée, préparés comme à la maison.",
      menu: [
        { id: "d1", name: "Poisson braisé", desc: "Dorade entière, attiéké, tomates, oignons, piment", price: 4500, img: IMG + "food/rest-maman-benin.jpg", group: "Plats", pop: true },
        { id: "d2", name: "Pâte sauce d'arachide", desc: "Pâte de maïs, sauce arachide, poisson fumé", price: 2500, img: IMG + "food/dish-pate-arachide.jpg", group: "Plats" },
        { id: "d3", name: "Igname pilée", desc: "Igname, sauce tomate, viande de bœuf", price: 3000, img: IMG + "food/dish-igname-pilee.jpg", group: "Plats" },
        { id: "d3b", name: "Bissap maison", desc: "Hibiscus, gingembre, menthe", price: 1000, img: IMG + "food/rest-cafe-ganhi.jpg", group: "Boissons" }
      ],
      comments: [
        { name: "Fatou D.", rating: 5, text: "Le poisson braisé est parfait, livraison rapide à Haie Vive.", date: "Il y a 2 jours" },
        { name: "Marc A.", rating: 4, text: "Portions généreuses, sauce arachide authentique.", date: "La semaine dernière" }
      ]
    },
    {
      id: "rest2", name: "Fast Cotonou", city: "Cotonou", area: "Ganhi", cat: "Fast-food", tags: ["Burgers", "Rapide"],
      rating: 4.4, reviews: 512, km: 0.9, avg: 3200, time: "15–25 min", fee: 400, hours: "10h00 – 23h00", open: [10, 23],
      lat: 6.3605, lng: 2.4285, img: IMG + "food/rest-fast-cotonou.jpg",
      body: "Burgers, brochettes et frites maison à emporter ou livrés en moins de 25 minutes.",
      menu: [
        { id: "d4", name: "Burger poulet croustillant", desc: "Pain brioché, poulet croustillant, sauce maison", price: 3500, img: IMG + "food/rest-fast-cotonou.jpg", group: "Plats", pop: true },
        { id: "d5", name: "Brochettes mixtes", desc: "Bœuf et poulet, oignons grillés", price: 2800, img: IMG + "food/dish-brochettes.jpg", group: "Plats" },
        { id: "d6", name: "Frites maison", desc: "Portion généreuse, sauce piquante", price: 1200, img: IMG + "food/dish-frites.jpg", group: "Accompagnements" }
      ],
      comments: [{ name: "Jean K.", rating: 4, text: "Toujours chaud, toujours rapide.", date: "Hier" }]
    },
    {
      id: "rest3", name: "Table Océan", city: "Cotonou", area: "Fidjrossè", cat: "International", tags: ["Fruits de mer", "Vue mer"],
      rating: 4.6, reviews: 204, km: 2.1, avg: 8000, time: "35–45 min", fee: 800, hours: "12h00 – 23h00", open: [12, 23],
      lat: 6.3520, lng: 2.3700, img: IMG + "food/rest-table-ocean.jpg",
      body: "Cuisine internationale face à l'Atlantique. Idéal après un événement ou une visite de la plage de Fidjrossè.",
      menu: [
        { id: "d7", name: "Pasta fruits de mer", desc: "Crevettes, calamars, crème légère", price: 7500, img: IMG + "food/rest-table-ocean.jpg", group: "Plats", pop: true },
        { id: "d8", name: "Grillade de bœuf", desc: "Pièce grillée, légumes rôtis", price: 8500, img: IMG + "food/dish-grillade-boeuf.jpg", group: "Plats" },
        { id: "d9", name: "Salade Méditerranée", desc: "Tomate, feta, olives, herbes", price: 4200, img: IMG + "food/dish-salade-med.jpg", group: "Entrées" }
      ],
      comments: [{ name: "Aïcha B.", rating: 5, text: "Le coucher de soleil depuis la terrasse est magique.", date: "Il y a 3 jours" }]
    },
    {
      id: "rest4", name: "Café Ganhi", city: "Cotonou", area: "Ganhi", cat: "Boissons", tags: ["Jus locaux", "Café"],
      rating: 4.5, reviews: 167, km: 0.7, avg: 2000, time: "10–20 min", fee: 300, hours: "08h00 – 20h00", open: [8, 20],
      lat: 6.3598, lng: 2.4275, img: IMG + "food/rest-cafe-ganhi.jpg",
      body: "Cafés, jus locaux et thés au cœur de Cotonou. Une pause entre deux courses ou après le marché.",
      menu: [
        { id: "d10", name: "Bissap frais", desc: "Hibiscus, gingembre, menthe", price: 1500, img: IMG + "food/rest-cafe-ganhi.jpg", group: "Boissons", pop: true },
        { id: "d11", name: "Gingembre maison", desc: "Épicé, rafraîchissant", price: 1200, img: IMG + "food/dish-jus-ananas.jpg", group: "Boissons" },
        { id: "d12", name: "Jus d'ananas pressé", desc: "Ananas du jour", price: 1800, img: IMG + "food/dish-jus-ananas.jpg", group: "Boissons" }
      ],
      comments: [{ name: "Nadia S.", rating: 4, text: "Le bissap est le meilleur du quartier.", date: "Il y a 5 jours" }]
    },
    {
      id: "rest5", name: "Douceurs d'Akpakpa", city: "Cotonou", area: "Akpakpa", cat: "Desserts", tags: ["Pâtisserie", "Glaces"],
      rating: 4.8, reviews: 96, km: 2.4, avg: 2800, time: "25–35 min", fee: 600, hours: "12h00 – 21h00", open: [12, 21],
      lat: 6.3655, lng: 2.4590, img: IMG + "food/rest-douceurs-akpakpa.jpg",
      body: "Pâtisseries et desserts à partager après un spectacle ou une soirée à Cotonou.",
      menu: [
        { id: "d13", name: "Beignets coco", desc: "Noix de coco, cannelle, sucre glace", price: 1500, img: IMG + "food/rest-douceurs-akpakpa.jpg", group: "Desserts", pop: true },
        { id: "d14", name: "Tarte chocolat", desc: "Part individuelle, chocolat noir", price: 2800, img: IMG + "food/rest-douceurs-akpakpa.jpg", group: "Desserts" },
        { id: "d15", name: "Glace vanille-baobab", desc: "Deux boules", price: 2200, img: IMG + "food/rest-douceurs-akpakpa.jpg", group: "Desserts" }
      ],
      comments: [{ name: "Léa T.", rating: 5, text: "Les beignets coco, une tuerie.", date: "Il y a 1 semaine" }]
    },
    {
      id: "rest6", name: "Teranga Plateau", city: "Dakar", area: "Plateau", cat: "Afrique", tags: ["Cuisine sénégalaise", "Thiéboudienne"],
      rating: 4.7, reviews: 421, km: 1.5, avg: 5000, time: "25–40 min", fee: 600, hours: "11h30 – 22h30", open: [11, 22],
      lat: 14.6715, lng: -17.4360, img: IMG + "food/rest-teranga-dakar.jpg",
      body: "La cuisine sénégalaise dans sa version la plus généreuse : thiéboudienne, yassa et mafé servis au cœur du Plateau.",
      menu: [
        { id: "d16", name: "Thiéboudienne", desc: "Riz rouge, poisson, légumes du jour", price: 4500, img: IMG + "food/rest-teranga-dakar.jpg", group: "Plats", pop: true },
        { id: "d17", name: "Yassa poulet", desc: "Oignons confits au citron, olives, riz blanc", price: 4000, img: IMG + "food/dish-yassa-poulet.jpg", group: "Plats" },
        { id: "d18", name: "Jus de bouye", desc: "Fruit de baobab, lait, vanille", price: 1200, img: IMG + "food/rest-cafe-ganhi.jpg", group: "Boissons" }
      ],
      comments: [{ name: "Ousmane N.", rating: 5, text: "Le thiéb de ma grand-mère, ou presque.", date: "Il y a 2 jours" }]
    },
    {
      id: "rest7", name: "Lomé Grill – Chez Koffi", city: "Lomé", area: "Bè", cat: "Afrique", tags: ["Grillades", "Cuisine togolaise"],
      rating: 4.5, reviews: 233, km: 1.8, avg: 3800, time: "20–35 min", fee: 500, hours: "11h00 – 23h00", open: [11, 23],
      lat: 6.1352, lng: 1.2425, img: IMG + "food/rest-lome-grill.jpg",
      body: "Poulet braisé koklo mémé, akoumé et brochettes au feu de bois, à deux pas de la plage.",
      menu: [
        { id: "d19", name: "Koklo mémé", desc: "Poulet braisé, sauce tomate-oignons épicée, akoumé", price: 3800, img: IMG + "food/rest-lome-grill.jpg", group: "Plats", pop: true },
        { id: "d20", name: "Brochettes de bœuf", desc: "Marinées, oignons, piment", price: 2500, img: IMG + "food/dish-brochettes.jpg", group: "Plats" },
        { id: "d21", name: "Frites de plantain", desc: "Alloco, sauce tomate", price: 1500, img: IMG + "food/dish-kelewele.jpg", group: "Accompagnements" }
      ],
      comments: [{ name: "Essi A.", rating: 4, text: "Le poulet est parfaitement grillé.", date: "Il y a 4 jours" }]
    },
    {
      id: "rest8", name: "Jollof House", city: "Accra", area: "Osu", cat: "Afrique", tags: ["Jollof", "Street food"],
      rating: 4.6, reviews: 389, km: 1.1, avg: 4200, time: "20–30 min", fee: 500, hours: "11h00 – 22h00", open: [11, 22],
      lat: 5.5565, lng: -0.1835, img: IMG + "food/rest-accra-jollof.jpg",
      body: "Le jollof ghanéen dans toutes ses déclinaisons, kelewele et poulet grillé, au cœur d'Osu.",
      menu: [
        { id: "d22", name: "Jollof poulet grillé", desc: "Riz jollof, poulet grillé, plantain", price: 4200, img: IMG + "food/rest-accra-jollof.jpg", group: "Plats", pop: true },
        { id: "d23", name: "Kelewele", desc: "Plantain épicé, arachides grillées", price: 1500, img: IMG + "food/dish-kelewele.jpg", group: "Accompagnements" },
        { id: "d24", name: "Sobolo", desc: "Boisson à l'hibiscus et au gingembre", price: 1000, img: IMG + "food/rest-cafe-ganhi.jpg", group: "Boissons" }
      ],
      comments: [{ name: "Kofi M.", rating: 5, text: "Best jollof in Osu, no debate.", date: "Il y a 1 jour" }]
    }
  ];
  const RESTAURANT_CATS = ["Afrique", "Fast-food", "International", "Boissons", "Desserts"];

  /* ---------- Youss Market ---------- */
  const SELLERS = {
    s1: { id: "s1", name: "Atelier Ayélé", city: "Cotonou", rating: 4.8, reviews: 142, since: "2021", desc: "Mode contemporaine en wax, pièces cousues à la main à Cotonou.", verified: true },
    s2: { id: "s2", name: "Coopérative Femmes du Nord", city: "Parakou", rating: 4.9, reviews: 388, since: "2018", desc: "Karité, baobab et produits naturels transformés par une coopérative de femmes.", verified: true },
    s3: { id: "s3", name: "Poterie Bohicon", city: "Bohicon", rating: 4.6, reviews: 57, since: "2022", desc: "Céramiques et luminaires artisanaux en terre cuite.", verified: false },
    s4: { id: "s4", name: "Maison Teranga Design", city: "Dakar", rating: 4.7, reviews: 211, since: "2019", desc: "Maroquinerie et vannerie contemporaine made in Dakar.", verified: true },
    s5: { id: "s5", name: "Kente & Co", city: "Accra", rating: 4.8, reviews: 176, since: "2020", desc: "Textiles kente tissés à la main et produits du cacao ghanéen.", verified: true },
    s6: { id: "s6", name: "Tech Lomé Store", city: "Lomé", rating: 4.4, reviews: 98, since: "2023", desc: "Électronique et accessoires garantis, retrait possible en boutique.", verified: true },
    s7: { id: "s7", name: "Vannerie du Mono", city: "Lomé", rating: 4.7, reviews: 64, since: "2021", desc: "Paniers et objets tressés en fibres naturelles.", verified: false }
  };
  const PRODUCTS = [
    { id: "p1", name: "Robe wax contemporaine", price: 12000, old: 15000, seller: "s1", cat: "Mode", rating: 4.8, reviews: 64, stock: 7, img: IMG + "products/prod-robe-wax.jpg", desc: "Robe mi-longue en wax 100 % coton, coupe droite et poches latérales. Confection à la main à Cotonou. Tailles S à XL.", specs: { Matière: "Coton wax", Entretien: "Lavage à 30°", Origine: "Cotonou, Bénin" } },
    { id: "p2", name: "Beurre de karité pur", price: 3500, seller: "s2", cat: "Beauté", rating: 4.9, reviews: 221, stock: 48, img: IMG + "products/prod-karite.jpg", desc: "Beurre de karité brut non raffiné, 250 g. Hydratation intense pour la peau et les cheveux. Produit par une coopérative de femmes du nord Bénin.", specs: { Contenance: "250 g", Composition: "100 % karité", Origine: "Parakou, Bénin" } },
    { id: "p3", name: "Vase terracotta artisanal", price: 8000, seller: "s3", cat: "Maison", rating: 4.6, reviews: 23, stock: 5, img: IMG + "products/prod-ceramique.jpg", desc: "Vase en terre cuite tourné à la main, motifs géométriques gravés. Pièce unique, hauteur 32 cm.", specs: { Hauteur: "32 cm", Matière: "Terre cuite", Origine: "Bohicon, Bénin" } },
    { id: "p4", name: "Collier perles de traite", price: 5000, seller: "s1", cat: "Accessoires", rating: 4.7, reviews: 41, stock: 12, img: IMG + "products/prod-bijou-perles.jpg", desc: "Collier en perles de verre et laiton, longueur réglable. Monté à la main.", specs: { Longueur: "45–55 cm", Matière: "Verre, laiton", Origine: "Cotonou, Bénin" } },
    { id: "p5", name: "Sac cabas raphia & cuir", price: 18000, seller: "s4", cat: "Accessoires", rating: 4.7, reviews: 88, stock: 9, img: IMG + "products/prod-sac-raphia.jpg", desc: "Cabas tressé en raphia naturel avec anses en cuir pleine fleur. Fabriqué à Dakar.", specs: { Dimensions: "40 × 32 cm", Matière: "Raphia, cuir", Origine: "Dakar, Sénégal" } },
    { id: "p6", name: "Sandales cuir tressé", price: 9500, seller: "s4", cat: "Mode", rating: 4.5, reviews: 52, stock: 0, img: IMG + "products/prod-sandales-cuir.jpg", desc: "Sandales en cuir tanné végétal, semelle caoutchouc. Pointures 37 à 45.", specs: { Matière: "Cuir", Semelle: "Caoutchouc", Origine: "Dakar, Sénégal" } },
    { id: "p7", name: "Huile de baobab bio", price: 6000, seller: "s2", cat: "Beauté", rating: 4.8, reviews: 97, stock: 30, img: IMG + "products/prod-huile-baobab.jpg", desc: "Huile de graines de baobab pressée à froid, 50 ml. Nourrit et apaise.", specs: { Contenance: "50 ml", Extraction: "Pression à froid", Origine: "Bénin" } },
    { id: "p8", name: "Chemise kente tissée", price: 22000, seller: "s5", cat: "Mode", rating: 4.9, reviews: 73, stock: 6, img: IMG + "products/prod-chemise-kente.jpg", desc: "Chemise en kente tissé main (or, noir, vert), col mao. Tailles M à XXL.", specs: { Matière: "Coton kente", Entretien: "Lavage à la main", Origine: "Accra, Ghana" } },
    { id: "p9", name: "Enceinte Bluetooth nomade", price: 24000, seller: "s6", cat: "Électronique", rating: 4.4, reviews: 134, stock: 15, img: IMG + "products/prod-enceinte.jpg", desc: "Enceinte portable 20 W, autonomie 12 h, étanche IPX6. Garantie 12 mois, retrait possible à Lomé.", specs: { Puissance: "20 W", Autonomie: "12 h", Garantie: "12 mois" } },
    { id: "p10", name: "Lampe en calebasse", price: 14000, seller: "s3", cat: "Maison", rating: 4.7, reviews: 19, stock: 4, img: IMG + "products/prod-lampe-calebasse.jpg", desc: "Suspension en calebasse gravée et ajourée, douille E27 incluse. Lumière chaude et motifs projetés.", specs: { Diamètre: "28 cm", Douille: "E27", Origine: "Bohicon, Bénin" } },
    { id: "p11", name: "Chocolat noir 70 % du Ghana", price: 4500, seller: "s5", cat: "Alimentation", rating: 4.8, reviews: 156, stock: 60, img: IMG + "products/prod-cacao.jpg", desc: "Coffret de 3 tablettes de chocolat noir 70 % bean-to-bar, fèves de la région d'Ashanti.", specs: { Poids: "3 × 80 g", Cacao: "70 %", Origine: "Ghana" } },
    { id: "p12", name: "Trio de paniers tressés", price: 11000, seller: "s7", cat: "Produits locaux", rating: 4.7, reviews: 38, stock: 10, img: IMG + "products/prod-paniers.jpg", desc: "Trois paniers de rangement en fibres naturelles teintées, anses en cuir.", specs: { Tailles: "S, M, L", Matière: "Fibres végétales, cuir", Origine: "Lomé, Togo" } }
  ];
  const PRODUCT_CATS = ["Mode", "Accessoires", "Beauté", "Artisanat", "Maison", "Alimentation", "Produits locaux", "Électronique"];

  /* ---------- Événements ---------- */
  const EVENTS = [
    { id: "ev1", name: "Festival international des Arts Vodoun", cat: "Festivals", city: "Ouidah", country: "Bénin", place: "Route des Esclaves, Ouidah", date: "2027-01-10", time: "09:00", img: IMG + "places/site-ouidah-porte.jpg", lat: 6.3167, lng: 2.0833,
      organizer: "Comité du Festival Vodoun Days", body: "Célébration annuelle du patrimoine vodoun : processions, danses masquées, arts vivants et cérémonies sur la Route des Esclaves jusqu'à la Porte du Non-Retour.", program: ["09:00 Processions des couvents", "14:00 Danses Egungun et Zangbeto", "19:00 Concert de clôture sur la plage"],
      tickets: [{ id: "t1", label: "Pass journée", price: 5000, left: 320 }, { id: "t2", label: "Pass VIP (tribune)", price: 15000, left: 24 }] },
    { id: "ev2", name: "Concert au Stade de l'Amitié", cat: "Concerts", city: "Cotonou", country: "Bénin", place: "Stade de l'Amitié, Kouhounou", date: "2026-11-21", time: "20:00", img: IMG + "services/svc-events.jpg", lat: 6.3814, lng: 2.4082,
      organizer: "Youss Live", body: "Grande soirée musicale au cœur de Cotonou : têtes d'affiche afrobeats et artistes béninois sur une scène 360°.", program: ["18:00 Ouverture des portes", "20:00 Premières parties", "22:00 Tête d'affiche"],
      tickets: [{ id: "t3", label: "Pelouse", price: 8000, left: 1500 }, { id: "t4", label: "Tribune", price: 15000, left: 240 }, { id: "t5", label: "Carré VIP", price: 40000, left: 18 }] },
    { id: "ev3", name: "Nuit culturelle à Ganvié", cat: "Activités culturelles", city: "Cotonou", country: "Bénin", place: "Village lacustre de Ganvié, lac Nokoué", date: "2026-12-05", time: "17:00", img: IMG + "places/site-ganvie.jpg", lat: 6.4667, lng: 2.4167,
      organizer: "Office du tourisme de Sô-Ava", body: "Balade en pirogue au coucher du soleil, contes et spectacles traditionnels tofinu dans la « Venise de l'Afrique ».", program: ["17:00 Départ en pirogue d'Abomey-Calavi", "18:30 Spectacle sur l'eau", "20:00 Dîner lacustre"],
      tickets: [{ id: "t6", label: "Entrée", price: 3500, left: 80 }, { id: "t7", label: "Pack famille (4 pers.)", price: 10000, left: 20 }] },
    { id: "ev4", name: "Biennale de l'art africain contemporain", cat: "Activités culturelles", city: "Dakar", country: "Sénégal", place: "Ancien Palais de Justice, Cap Manuel", date: "2026-11-14", time: "10:00", img: IMG + "events/ev-biennale.jpg", lat: 14.6560, lng: -17.4330,
      organizer: "Secrétariat général de la Biennale", body: "Exposition internationale d'art contemporain africain : installations, peinture, vidéo et performances dans tout Dakar.", program: ["10:00 Exposition internationale", "15:00 Visite guidée", "18:00 Performance"],
      tickets: [{ id: "t8", label: "Entrée journée", price: 2000, left: 999 }, { id: "t9", label: "Pass semaine", price: 8000, left: 150 }] },
    { id: "ev5", name: "Lomé Beach Festival", cat: "Festivals", city: "Lomé", country: "Togo", place: "Plage de Lomé, boulevard du Mono", date: "2026-11-28", time: "16:00", img: IMG + "events/ev-lome-fest.jpg", lat: 6.1230, lng: 1.2300,
      organizer: "Lomé Events", body: "Trois scènes sur le sable, DJ sets, afro-house et artistes togolais face à l'océan.", program: ["16:00 Ouverture", "19:00 Live togolais", "22:00 DJ sets"],
      tickets: [{ id: "t10", label: "Pass soirée", price: 5000, left: 600 }, { id: "t11", label: "Pass 2 jours", price: 8000, left: 200 }] },
    { id: "ev6", name: "Chale Wote Street Art Festival", cat: "Festivals", city: "Accra", country: "Ghana", place: "Jamestown, Accra", date: "2027-08-21", time: "11:00", img: IMG + "events/ev-chale-wote.jpg", lat: 5.5330, lng: -0.2120,
      organizer: "ACCRA [dot] ALT", body: "Fresques géantes, performances de rue, défilés et musique dans les rues historiques de Jamestown.", program: ["11:00 Parade d'ouverture", "14:00 Live painting", "20:00 Scène principale"],
      tickets: [{ id: "t12", label: "Accès libre (don)", price: 1000, left: 9999 }, { id: "t13", label: "Pass expériences", price: 7000, left: 120 }] },
    { id: "ev7", name: "Africa Tech Summit Cotonou", cat: "Conférences", city: "Cotonou", country: "Bénin", place: "Palais des Congrès de Cotonou", date: "2026-11-12", time: "08:30", img: IMG + "events/ev-conf-tech.jpg", lat: 6.3560, lng: 2.4150,
      organizer: "KYA CORPORATION & partenaires", body: "Deux jours de conférences sur la fintech, la mobilité et les super applications africaines. Pitchs de startups et networking.", program: ["08:30 Accueil", "09:30 Keynote d'ouverture", "14:00 Pitchs startups"],
      tickets: [{ id: "t14", label: "Pass visiteur", price: 10000, left: 300 }, { id: "t15", label: "Pass pro (2 jours)", price: 35000, left: 60 }] },
    { id: "ev8", name: "Derby de Dakar — Jaraaf vs Casa Sports", cat: "Événements sportifs", city: "Dakar", country: "Sénégal", place: "Stade Léopold Sédar Senghor", date: "2026-10-30", time: "17:00", img: IMG + "events/ev-football.jpg", lat: 14.7420, lng: -17.4530,
      organizer: "Ligue sénégalaise de football professionnel", body: "Affiche du championnat : ambiance garantie dans les tribunes du stade LSS.", program: ["15:00 Ouverture des portes", "17:00 Coup d'envoi"],
      tickets: [{ id: "t16", label: "Virage", price: 1500, left: 4000 }, { id: "t17", label: "Tribune couverte", price: 5000, left: 800 }] },
    { id: "ev9", name: "Agojié — spectacle de danse", cat: "Spectacles", city: "Cotonou", country: "Bénin", place: "Palais des Congrès de Cotonou", date: "2026-11-15", time: "19:30", img: IMG + "events/ev-nuit-culturelle.jpg", lat: 6.3560, lng: 2.4150,
      organizer: "Compagnie Walô", body: "Création chorégraphique inspirée des guerrières du Dahomey, percussions live et costumes contemporains.", program: ["19:30 Spectacle (1h20)", "21:00 Rencontre avec la compagnie"],
      tickets: [{ id: "t18", label: "Orchestre", price: 7000, left: 180 }, { id: "t19", label: "Balcon", price: 4000, left: 220 }] }
  ];
  const EVENT_CATS = ["Concerts", "Festivals", "Conférences", "Spectacles", "Activités culturelles", "Événements sportifs"];

  /* ---------- Culture & Tourisme ---------- */
  const SITE_TYPES = [
    { id: "monument", label: "Monuments", icon: "account_balance" },
    { id: "palais", label: "Palais", icon: "castle" },
    { id: "musee", label: "Musées", icon: "museum" },
    { id: "histoire", label: "Sites historiques", icon: "history_edu" },
    { id: "tradition", label: "Traditions", icon: "diversity_3" },
    { id: "nature", label: "Nature & plages", icon: "beach_access" },
    { id: "activite", label: "Activités culturelles", icon: "theater_comedy" }
  ];
  const SITES = [
    { id: "c1", name: "Palais royaux d'Abomey", city: "Cotonou", near: "Abomey", country: "Bénin", type: "palais", place: "Abomey, Zou · Bénin", lat: 7.1829, lng: 1.9912, img: IMG + "places/site-abomey.jpg", epoch: "XVIIe – XIXe siècle", unesco: true,
      body: "Site du patrimoine mondial de l'UNESCO depuis 1985, les palais des rois du Dahomey abritent aujourd'hui le Musée historique d'Abomey.",
      history: "Entre 1625 et 1900, douze rois se sont succédé à la tête du puissant royaume du Dahomey. Chacun, à l'exception d'Akaba, a fait bâtir son propre palais dans l'enceinte royale, sur une quarantaine d'hectares. Les bas-reliefs polychromes qui ornent les murs racontent les hauts faits des souverains et constituent une véritable archive visuelle du royaume.",
      importance: "Témoignage majeur d'un royaume africain pré-colonial organisé, de son art et de sa mémoire. Les trônes, les bas-reliefs et les tentures appliquées sont des références de l'art béninois.",
      visit: { hours: "09h00 – 17h00", price: "2 500 FCFA (guide inclus)", duration: "1h30 – 2h", tips: "Prévoir une visite guidée : les bas-reliefs ne se comprennent qu'avec les récits." } },
    { id: "c2", name: "Porte du Non-Retour", city: "Cotonou", near: "Ouidah", country: "Bénin", type: "histoire", place: "Plage de Ouidah · Bénin", lat: 6.3167, lng: 2.0833, img: IMG + "places/site-ouidah-porte.jpg", epoch: "1995 (mémorial)",
      body: "Monument situé au bout de la Route des Esclaves, point d'embarquement des captifs déportés vers les Amériques.",
      history: "Érigée en 1995 avec le soutien de l'UNESCO, l'arche monumentale clôt la Route des Esclaves, un parcours de quatre kilomètres jalonné de stations de mémoire : la place aux enchères, l'arbre de l'oubli, la case Zomaï. Ouidah fut, aux XVIIe et XVIIIe siècles, l'un des principaux ports de la traite atlantique.",
      importance: "Haut lieu de mémoire de la traite négrière et de la diaspora africaine. Le site accueille chaque 10 janvier des cérémonies lors de la fête du Vodoun.",
      visit: { hours: "Accès libre", price: "Gratuit (musées de la Route : 1 000 – 2 000 FCFA)", duration: "2h avec la Route des Esclaves", tips: "Commencer par le Musée d'histoire de Ouidah, puis suivre la Route à pied ou en zémidjan." } },
    { id: "c3", name: "Place de l'Amazone", city: "Cotonou", country: "Bénin", type: "monument", place: "Boulevard de la Marina, Cotonou", lat: 6.3654, lng: 2.4183, img: IMG + "places/site-amazone.jpg", epoch: "2022",
      body: "Esplanade dominée par une statue de bronze de 30 mètres rendant hommage aux Agojié, guerrières du royaume du Dahomey.",
      history: "Inaugurée le 30 juillet 2022 pour les 62 ans de l'indépendance, la statue monumentale représente une Amazone du Dahomey. Ces femmes soldats, recrutées dès le XVIIIe siècle, formaient un corps d'élite redouté jusqu'à la conquête coloniale de 1892.",
      importance: "Symbole contemporain de l'identité béninoise et de la place des femmes dans l'histoire du pays. Point de rendez-vous des Cotonois en soirée.",
      visit: { hours: "Accès libre, esplanade éclairée la nuit", price: "Gratuit", duration: "30 – 45 min", tips: "À voir au coucher du soleil, puis dîner sur la Marina." } },
    { id: "c4", name: "Village lacustre de Ganvié", city: "Cotonou", country: "Bénin", type: "tradition", place: "Lac Nokoué · Bénin", lat: 6.4667, lng: 2.4167, img: IMG + "places/site-ganvie.jpg", epoch: "XVIIe siècle",
      body: "Surnommé la « Venise de l'Afrique », Ganvié est un village sur pilotis où vivent près de 30 000 Tofinu.",
      history: "Fondé au XVIIe siècle par des populations fuyant les razzias du royaume du Dahomey, dont les guerriers n'avaient pas le droit d'entrer dans l'eau, Ganvié s'est développé sur le lac Nokoué. Maisons, école, marché flottant : toute la vie s'organise en pirogue.",
      importance: "Exemple unique d'adaptation humaine à un milieu lacustre et de résistance culturelle. Inscrit sur la liste indicative de l'UNESCO.",
      visit: { hours: "08h00 – 18h00", price: "Pirogue : 5 000 – 8 000 FCFA", duration: "Demi-journée", tips: "Partir tôt d'Abomey-Calavi, prévoir chapeau et eau." } },
    { id: "c5", name: "Marché Dantokpa", city: "Cotonou", country: "Bénin", type: "tradition", place: "Dantokpa, Cotonou", lat: 6.3705, lng: 2.4335, img: IMG + "places/site-dantokpa.jpg", epoch: "1963",
      body: "L'un des plus grands marchés à ciel ouvert d'Afrique de l'Ouest, le long de la lagune de Cotonou.",
      history: "Ouvert en 1963 sur une vingtaine d'hectares, Dantokpa (« au bord de l'eau », en fon) brasse chaque jour des dizaines de milliers de commerçants et visiteurs. Tissus wax, vivres, artisanat, pièces détachées : chaque allée a sa spécialité.",
      importance: "Poumon économique du pays et vitrine du commerce régional, animé par les célèbres commerçantes du wax.",
      visit: { hours: "07h00 – 19h00", price: "Gratuit", duration: "1h – 2h", tips: "Garder son sac devant soi, négocier avec le sourire." } },
    { id: "c6", name: "Musée Honmé", city: "Cotonou", near: "Porto-Novo", country: "Bénin", type: "musee", place: "Porto-Novo · Bénin", lat: 6.4969, lng: 2.6283, img: IMG + "places/site-honme.jpg", epoch: "XVIIIe siècle",
      body: "Ancien palais royal de Porto-Novo transformé en musée consacré à l'histoire et aux traditions du royaume de Hogbonou.",
      history: "Résidence des rois de Porto-Novo depuis le roi Tê-Agbanlin (XVIIIe siècle), le palais Honmé a conservé ses cours successives, la salle du trône et les appartements royaux. Il est devenu musée en 1990.",
      importance: "Clé de lecture de la capitale politique du Bénin et de son architecture afro-brésilienne environnante.",
      visit: { hours: "09h00 – 18h00", price: "1 500 FCFA", duration: "1h", tips: "Combiner avec la Grande Mosquée et le quartier afro-brésilien." } },
    { id: "c7", name: "Grande Mosquée de Porto-Novo", city: "Cotonou", near: "Porto-Novo", country: "Bénin", type: "monument", place: "Porto-Novo · Bénin", lat: 6.4950, lng: 2.6250, img: IMG + "places/site-mosquee-porto-novo.jpg", epoch: "1925 – 1935",
      body: "Édifice emblématique d'inspiration afro-brésilienne, aux façades colorées rappelant les églises baroques de Bahia.",
      history: "Construite dans l'entre-deux-guerres par des descendants d'esclaves revenus du Brésil (les Agudas), la mosquée reprend le vocabulaire des églises baroques brésiliennes, témoignant d'un métissage architectural unique.",
      importance: "Symbole du dialogue des cultures et de l'héritage afro-brésilien du golfe de Guinée.",
      visit: { hours: "Extérieur libre ; intérieur hors prières", price: "Gratuit", duration: "30 min", tips: "Tenue correcte exigée." } },
    { id: "c8", name: "Plage de Fidjrossè", city: "Cotonou", country: "Bénin", type: "nature", place: "Fidjrossè, Cotonou", lat: 6.3515, lng: 2.3690, img: IMG + "places/site-fidjrosse.jpg", epoch: "—",
      body: "Littoral populaire de Cotonou : paillotes, sport le matin, coucher de soleil le soir.",
      history: "Longtemps simple rivage de pêcheurs, Fidjrossè est devenue la plage de loisirs des Cotonois avec l'aménagement de la Route des Pêches, qui relie Cotonou à Ouidah par la côte.",
      importance: "Lieu de vie et de détente, point de départ de la Route des Pêches.",
      visit: { hours: "Accès libre", price: "Gratuit", duration: "1h – demi-journée", tips: "Baignade prudente (courants). Restaurants de poisson sur place." } },
    { id: "c9", name: "Temple des Pythons", city: "Cotonou", near: "Ouidah", country: "Bénin", type: "tradition", place: "Ouidah · Bénin", lat: 6.3630, lng: 2.0870, img: IMG + "places/site-ouidah-python.jpg", epoch: "XVIIIe siècle",
      body: "Sanctuaire vodoun dédié à Dangbé, le python royal, face à la basilique de Ouidah.",
      history: "Le culte du python, divinité protectrice des Houéda, remonte au XVIIIe siècle. Le temple abrite des dizaines de pythons royaux, inoffensifs, que les visiteurs peuvent approcher.",
      importance: "Illustration vivante du vodoun, religion reconnue au Bénin et célébrée chaque 10 janvier.",
      visit: { hours: "09h00 – 18h00", price: "1 000 FCFA + photo", duration: "30 min", tips: "Idéal avant la Route des Esclaves." } },
    { id: "c10", name: "Parc national de la Pendjari", city: "Cotonou", near: "Natitingou", country: "Bénin", type: "nature", place: "Atacora · Bénin", lat: 10.9000, lng: 1.5000, img: IMG + "places/site-pendjari.jpg", epoch: "1961", unesco: true,
      body: "L'une des dernières grandes réserves d'Afrique de l'Ouest : éléphants, lions, buffles et hippopotames.",
      history: "Créé en 1961 et intégré au complexe W-Arly-Pendjari inscrit à l'UNESCO, le parc s'étend sur plus de 4 800 km² au pied de la chaîne de l'Atacora.",
      importance: "Sanctuaire de biodiversité et destination phare du tourisme de nature au Bénin.",
      visit: { hours: "Décembre à mai", price: "Entrée + guide : à partir de 10 000 FCFA", duration: "2 – 3 jours", tips: "Réserver un lodge et un guide agréé." } },
    { id: "d1", name: "Monument de la Renaissance africaine", city: "Dakar", country: "Sénégal", type: "monument", place: "Collines des Mamelles, Dakar", lat: 14.7224, lng: -17.4934, img: IMG + "places/site-renaissance.jpg", epoch: "2010",
      body: "Statue de bronze de 52 mètres dominant l'Atlantique, la plus haute d'Afrique.",
      history: "Inauguré le 3 avril 2010 pour le cinquantenaire de l'indépendance, le monument représente un homme, une femme et un enfant tendus vers l'horizon. Un ascenseur mène à un belvédère dans la tête de l'homme.",
      importance: "Symbole panafricain de la renaissance du continent, visible de toute la presqu'île.",
      visit: { hours: "09h00 – 19h00", price: "6 500 FCFA (avec ascenseur)", duration: "1h", tips: "Monter les 198 marches au coucher du soleil." } },
    { id: "d2", name: "Maison des Esclaves de Gorée", city: "Dakar", country: "Sénégal", type: "histoire", place: "Île de Gorée", lat: 14.6672, lng: -17.3983, img: IMG + "places/site-goree.jpg", epoch: "1776", unesco: true,
      body: "Maison-musée de l'île de Gorée, mémorial de la traite atlantique classé au patrimoine mondial.",
      history: "Construite en 1776, la maison avec sa « porte du voyage sans retour » est devenue en 1962 un musée sous l'impulsion du conservateur Boubacar Joseph Ndiaye. L'île de Gorée est inscrite à l'UNESCO depuis 1978.",
      importance: "Lieu de mémoire universel, visité par des chefs d'État du monde entier.",
      visit: { hours: "10h00 – 18h00 (fermé lundi matin)", price: "Chaloupe 5 200 FCFA + entrée 500 FCFA", duration: "Demi-journée", tips: "Prendre la chaloupe tôt, flâner dans les ruelles colorées." } },
    { id: "d3", name: "Mosquée de la Divinité", city: "Dakar", country: "Sénégal", type: "monument", place: "Ouakam, Dakar", lat: 14.7230, lng: -17.5020, img: IMG + "places/site-divinite.jpg", epoch: "1997",
      body: "Mosquée aux deux minarets blancs et verts posée au creux d'une crique de la corniche de Ouakam.",
      history: "Achevée en 1997 à l'initiative de Mohamed Seyni Guèye, elle est édifiée face à l'océan, à l'endroit où, selon le récit de son fondateur, elle lui serait apparue en rêve.",
      importance: "Un des sites les plus photographiés de Dakar, lieu de recueillement et de promenade.",
      visit: { hours: "Extérieur libre", price: "Gratuit", duration: "30 min", tips: "Belle lumière en fin d'après-midi." } },
    { id: "d4", name: "Lac Rose (lac Retba)", city: "Dakar", country: "Sénégal", type: "nature", place: "Niaga, à 35 km de Dakar", lat: 14.8386, lng: -17.2290, img: IMG + "places/site-lac-rose.jpg", epoch: "—",
      body: "Lagune salée dont l'eau vire au rose sous l'effet d'une micro-algue, bordée de dunes et de l'océan.",
      history: "Longtemps arrivée mythique du rallye Paris-Dakar, le lac est exploité par des récolteurs de sel qui travaillent le corps enduit de beurre de karité.",
      importance: "Curiosité naturelle et économie du sel traditionnelle.",
      visit: { hours: "Toute l'année (rose plus intense en saison sèche)", price: "Pirogue 5 000 FCFA", duration: "Demi-journée", tips: "Combiner avec les dunes en quad ou à cheval." } },
    { id: "d5", name: "Musée des Civilisations noires", city: "Dakar", country: "Sénégal", type: "musee", place: "Autoroute Prolongée, Dakar", lat: 14.6744, lng: -17.4365, img: IMG + "places/site-civilisations.jpg", epoch: "2018",
      body: "Musée de 14 000 m² consacré à l'apport des civilisations noires au patrimoine de l'humanité.",
      history: "Projet rêvé par Léopold Sédar Senghor dès 1966, le musée a ouvert en décembre 2018. Son architecture circulaire s'inspire des cases à impluvium de Casamance.",
      importance: "Institution de référence sur le continent, lieu d'accueil des œuvres restituées.",
      visit: { hours: "10h00 – 19h00 (fermé lundi)", price: "3 000 FCFA", duration: "2h", tips: "Expositions temporaires à vérifier avant la visite." } },
    { id: "d6", name: "Marché Sandaga", city: "Dakar", country: "Sénégal", type: "tradition", place: "Plateau, Dakar", lat: 14.6730, lng: -17.4380, img: IMG + "places/site-sandaga.jpg", epoch: "1933",
      body: "Marché historique du Plateau, bâtiment néo-soudanais et dédale d'étals de tissus et d'artisanat.",
      history: "Inauguré en 1933 dans un style néo-soudanais, Sandaga est resté le cœur commerçant du centre-ville malgré plusieurs projets de rénovation.",
      importance: "Vitrine du commerce dakarois : bazins, bijoux, cuir et électronique.",
      visit: { hours: "08h00 – 19h00", price: "Gratuit", duration: "1h", tips: "Marché Kermel à 5 minutes pour les fleurs et l'artisanat." } },
    { id: "l1", name: "Monument de l'Indépendance", city: "Lomé", country: "Togo", type: "monument", place: "Place de l'Indépendance, Lomé", lat: 6.1290, lng: 1.2170, img: IMG + "places/site-independance-lome.jpg", epoch: "1960",
      body: "Monument blanc en forme de main ouverte vers le ciel, érigé pour l'indépendance du Togo.",
      history: "Inauguré en 1960, il représente la rupture des chaînes de la colonisation. L'esplanade accueille les cérémonies nationales du 27 avril.",
      importance: "Symbole national du Togo indépendant.",
      visit: { hours: "Accès libre", price: "Gratuit", duration: "20 min", tips: "À deux pas de l'Hôtel 2 Février et du Palais des Congrès." } },
    { id: "l2", name: "Palais de Lomé", city: "Lomé", country: "Togo", type: "palais", place: "Boulevard de la République, Lomé", lat: 6.1280, lng: 1.2270, img: IMG + "places/site-palais-lome.jpg", epoch: "1905",
      body: "Ancien palais des gouverneurs devenu centre d'art et de culture, au cœur d'un parc botanique de 11 hectares.",
      history: "Édifié entre 1898 et 1905 par l'administration allemande, résidence des gouverneurs puis des présidents, le palais a été restauré et rouvert en 2019 comme centre d'art contemporain.",
      importance: "Premier centre d'art de cette ampleur au Togo, vitrine de la création ouest-africaine.",
      visit: { hours: "10h00 – 18h00 (fermé lundi)", price: "2 000 FCFA", duration: "1h30", tips: "Parcourir le jardin botanique après l'exposition." } },
    { id: "l3", name: "Marché des féticheurs d'Akodessewa", city: "Lomé", country: "Togo", type: "tradition", place: "Akodessewa, Lomé", lat: 6.1370, lng: 1.2560, img: IMG + "places/site-akodessewa.jpg", epoch: "XIXe siècle",
      body: "Le plus grand marché vodoun d'Afrique de l'Ouest, où se fournissent guérisseurs et prêtres.",
      history: "Installé par des commerçants venus du Bénin, le marché rassemble ingrédients, amulettes et statuettes utilisés dans les pratiques vodoun et la pharmacopée traditionnelle.",
      importance: "Fenêtre sur une spiritualité vivante, à aborder avec respect.",
      visit: { hours: "08h00 – 18h00", price: "Visite guidée ~3 000 FCFA", duration: "45 min", tips: "Photos uniquement avec autorisation." } },
    { id: "l4", name: "Grand Marché de Lomé", city: "Lomé", country: "Togo", type: "tradition", place: "Centre-ville, Lomé", lat: 6.1310, lng: 1.2250, img: IMG + "places/site-grand-marche-lome.jpg", epoch: "1966 (bâtiment)",
      body: "Royaume des « Nana Benz », commerçantes de pagnes qui ont fait la réputation de Lomé.",
      history: "Autour de la cathédrale du Sacré-Cœur, le Grand Marché est depuis le XXe siècle la plaque tournante du commerce de wax hollandais en Afrique de l'Ouest.",
      importance: "Haut lieu de l'entrepreneuriat féminin africain.",
      visit: { hours: "07h00 – 18h00", price: "Gratuit", duration: "1h", tips: "Les pagnes se vendent par « demi-pièce » de 6 yards." } },
    { id: "l5", name: "Plage de Lomé", city: "Lomé", country: "Togo", type: "nature", place: "Boulevard du Mono, Lomé", lat: 6.1230, lng: 1.2300, img: IMG + "places/site-plage-lome.jpg", epoch: "—",
      body: "Longue plage urbaine bordée de cocotiers, de paillotes et de terrains de football improvisés.",
      history: "La plage longe le boulevard du Mono jusqu'au port autonome ; elle est le lieu de promenade favori des Loméens le dimanche.",
      importance: "Espace de vie sociale et de loisirs au centre de la capitale.",
      visit: { hours: "Accès libre", price: "Gratuit", duration: "1h – demi-journée", tips: "Courants forts : préférer les piscines des hôtels pour nager." } },
    { id: "a1", name: "Black Star Square", city: "Accra", country: "Ghana", type: "monument", place: "Independence Avenue, Accra", lat: 5.5478, lng: -0.1920, img: IMG + "places/site-black-star.jpg", epoch: "1961",
      body: "Place de l'Indépendance et son arche surmontée de l'étoile noire, symbole du Ghana libre.",
      history: "Aménagée en 1961 sous Kwame Nkrumah pour la visite de la reine Élisabeth II, la place accueille les défilés du 6 mars, jour de l'indépendance (1957), première d'Afrique subsaharienne.",
      importance: "Symbole du panafricanisme et de l'indépendance du continent.",
      visit: { hours: "Accès libre", price: "Gratuit", duration: "30 min", tips: "Enchaîner avec le mausolée Nkrumah à 10 minutes à pied." } },
    { id: "a2", name: "Mausolée Kwame Nkrumah", city: "Accra", country: "Ghana", type: "histoire", place: "High Street, Accra", lat: 5.5465, lng: -0.2010, img: IMG + "places/site-nkrumah.jpg", epoch: "1992",
      body: "Parc mémorial et musée consacrés au premier président du Ghana et figure du panafricanisme.",
      history: "Inauguré en 1992 sur l'ancien polo ground où Nkrumah proclama l'indépendance en 1957, le mausolée de marbre abrite sa dépouille et celle de son épouse Fathia. Rénové en 2023.",
      importance: "Lieu de pèlerinage panafricain et clé de l'histoire des indépendances.",
      visit: { hours: "10h00 – 17h00", price: "~ 3 000 FCFA (équivalent)", duration: "1h", tips: "Le musée expose les effets personnels et photos de Nkrumah." } },
    { id: "a3", name: "Phare de Jamestown", city: "Accra", country: "Ghana", type: "histoire", place: "Jamestown, Accra", lat: 5.5330, lng: -0.2120, img: IMG + "places/site-jamestown.jpg", epoch: "1871 / 1930",
      body: "Phare rouge et blanc dominant le plus vieux quartier d'Accra, ses forts et son port de pêche.",
      history: "Le premier phare date de 1871 ; le phare actuel de 28 mètres, reconstruit dans les années 1930, veille sur le port de pêche et les forts James et Ussher, vestiges de la période coloniale.",
      importance: "Cœur historique d'Accra et épicentre du festival de street art Chale Wote.",
      visit: { hours: "09h00 – 17h00", price: "Pourboire au gardien", duration: "45 min", tips: "Monter pour la vue sur le port, puis parcourir les fresques." } },
    { id: "a4", name: "Marché de Makola", city: "Accra", country: "Ghana", type: "tradition", place: "Kojo Thompson Road, Accra", lat: 5.5480, lng: -0.2070, img: IMG + "places/site-makola.jpg", epoch: "1924",
      body: "Le marché le plus animé d'Accra : tissus, épices, perles et tout ce qui se vend sous le soleil.",
      history: "Fondé en 1924, Makola a été au centre de l'histoire économique et politique du Ghana ; il reste dominé par les « market queens » qui organisent le commerce.",
      importance: "Institution économique et sociale, royaume des commerçantes.",
      visit: { hours: "08h00 – 18h00", price: "Gratuit", duration: "1h", tips: "Les perles krobo se trouvent côté Rawlings Park." } },
    { id: "a5", name: "Musée national du Ghana", city: "Accra", country: "Ghana", type: "musee", place: "Barnes Road, Accra", lat: 5.5580, lng: -0.2000, img: IMG + "places/site-national-museum-ghana.jpg", epoch: "1957",
      body: "Plus ancien musée du pays : archéologie, ethnographie et art, du kente aux poids à peser l'or ashanti.",
      history: "Ouvert le 5 mars 1957, veille de l'indépendance, et rénové en 2022, le musée raconte l'histoire du Ghana des origines à la période contemporaine.",
      importance: "Référence pour comprendre les cultures akan, ga et ewe.",
      visit: { hours: "09h00 – 16h30 (fermé lundi)", price: "~ 2 500 FCFA (équivalent)", duration: "1h30", tips: "Collection de poids à peser l'or à ne pas manquer." } },
    { id: "a6", name: "Plage de Labadi", city: "Accra", country: "Ghana", type: "nature", place: "La, Accra", lat: 5.5580, lng: -0.1480, img: IMG + "places/site-labadi.jpg", epoch: "—",
      body: "La plage la plus populaire d'Accra : balades à cheval, musique live et street food le week-end.",
      history: "Appelée aussi La Pleasure Beach, elle est depuis les années 1980 le lieu de sortie des Accréens, avec concerts et festivals de reggae en soirée.",
      importance: "Lieu de loisirs emblématique de la capitale ghanéenne.",
      visit: { hours: "08h00 – 22h00", price: "Entrée ~ 1 500 FCFA (équivalent)", duration: "2h – demi-journée", tips: "Le dimanche après-midi pour l'ambiance." } }
  ];

  /* ---------- Chauffeurs & livreurs ---------- */
  const DRIVERS = [
    { id: "dr1", name: "Koffi Adjovi", city: "Cotonou", vehicle: "car", car: "Toyota Corolla · Grise", plate: "RB-4821-A", rating: 4.8, rides: 1240, phone: "+229 97 11 22 33", avatar: IMG + "avatars/avatar-driver-koffi.jpg" },
    { id: "dr2", name: "Aminata Ndiaye", city: "Dakar", vehicle: "car", car: "Hyundai Accent · Blanche", plate: "DK-3310-AB", rating: 4.9, rides: 2105, phone: "+221 77 123 45 67", avatar: IMG + "avatars/avatar-driver-aminata.jpg" },
    { id: "dr3", name: "Kossi Mensah", city: "Lomé", vehicle: "moto", car: "Haojue 125 · Noire", plate: "TG-5521-C", rating: 4.7, rides: 860, phone: "+228 90 12 34 56" },
    { id: "dr4", name: "Kwame Boateng", city: "Accra", vehicle: "car", car: "Toyota Vitz · Bleue", plate: "GR-2210-23", rating: 4.8, rides: 1530, phone: "+233 24 123 4567" },
    { id: "dr5", name: "Sènan Houngbédji", city: "Cotonou", vehicle: "moto", car: "Honda CG 125 · Rouge", plate: "RB-7733-M", rating: 4.6, rides: 2210, phone: "+229 96 55 44 33" },
    { id: "dr6", name: "Ibrahim Sarr", city: "Dakar", vehicle: "premium", car: "Toyota Camry · Noire", plate: "DK-9001-AC", rating: 5.0, rides: 640, phone: "+221 78 987 65 43" }
  ];
  const COURIERS = [
    { id: "co1", name: "Espoir Dossou", city: "Cotonou", vehicle: "Moto", rating: 4.8, deliveries: 980, phone: "+229 97 44 55 66", avatar: IMG + "avatars/avatar-courier-espoir.jpg" },
    { id: "co2", name: "Moussa Fall", city: "Dakar", vehicle: "Moto", rating: 4.9, deliveries: 1320, phone: "+221 76 456 78 90" },
    { id: "co3", name: "Yawo Agbeko", city: "Lomé", vehicle: "Vélo cargo", rating: 4.7, deliveries: 540, phone: "+228 91 23 45 67" },
    { id: "co4", name: "Ama Owusu", city: "Accra", vehicle: "Moto", rating: 4.8, deliveries: 1105, phone: "+233 20 765 4321" }
  ];

  /* ---------- Youss Bonus ---------- */
  const REWARDS = [
    { id: "r1", label: "Course offerte", sub: "Jusqu'à 2 000 FCFA sur votre prochaine course", cost: 500, icon: "directions_car", service: "transport" },
    { id: "r2", label: "-10 % Youss Market", sub: "Sur une commande de votre choix", cost: 300, icon: "storefront", service: "market" },
    { id: "r3", label: "Boisson offerte", sub: "Dans un restaurant partenaire de la maquette", cost: 150, icon: "local_cafe", service: "restaurant" },
    { id: "r4", label: "Billet -20 %", sub: "Sur un événement de la billetterie", cost: 700, icon: "confirmation_number", service: "evenement" },
    { id: "r5", label: "Livraison gratuite", sub: "Une livraison standard offerte", cost: 250, icon: "local_shipping", service: "livraison" },
    { id: "r6", label: "Visite guidée offerte", sub: "Un site culturel au choix", cost: 900, icon: "museum", service: "culture" }
  ];
  const TIERS = [
    { id: "Bronze", min: 0 }, { id: "Argent", min: 5000 }, { id: "Or", min: 20000 }, { id: "Platine", min: 50000 }
  ];

  /* ---------- Helpers ---------- */
  function distanceKm(aLat, aLng, bLat, bLng) {
    const R = 6371, toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  function nearby(lat, lng, list, n, excludeId) {
    return list.filter((x) => x.id !== excludeId && x.lat != null)
      .map((x) => Object.assign({ dist: distanceKm(lat, lng, x.lat, x.lng) }, x))
      .sort((a, b) => a.dist - b.dist).slice(0, n || 4);
  }
  const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const byId = (list, id) => list.find((x) => x.id === id);
  const fmtDate = (iso, opts) => {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("fr-FR", opts || { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };
  const fmtDateShort = (iso) => fmtDate(iso, { day: "numeric", month: "short" });
  const minPrice = (ev) => Math.min.apply(null, ev.tickets.map((t) => t.price));
  const cityOf = (name) => CITIES[name] || CITIES["Cotonou"];
  const countryOf = (code) => COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
  const siteType = (id) => SITE_TYPES.find((t) => t.id === id) || SITE_TYPES[0];

  /* Index de recherche global : construit depuis les données réelles */
  function searchIndex() {
    const out = [];
    RESTAURANTS.forEach((r) => {
      out.push({ kind: "restaurant", title: r.name, sub: r.cat + " · " + r.area + ", " + r.city, icon: "restaurant", img: r.img, route: "restaurantDetail", params: { id: r.id }, keys: [r.name, r.cat, r.area, r.city, r.tags.join(" ")].join(" "), rating: r.rating, price: r.avg, city: r.city, lat: r.lat, lng: r.lng, open: r.open });
      r.menu.forEach((d) => out.push({ kind: "plat", title: d.name, sub: r.name + " · " + r.city, icon: "lunch_dining", img: d.img, route: "restaurantDetail", params: { id: r.id, dish: d.id }, keys: [d.name, d.desc, r.name].join(" "), rating: r.rating, price: d.price, city: r.city, lat: r.lat, lng: r.lng }));
    });
    PRODUCTS.forEach((p) => out.push({ kind: "produit", title: p.name, sub: SELLERS[p.seller].name + " · " + p.cat, icon: "shopping_bag", img: p.img, route: "productDetail", params: { id: p.id }, keys: [p.name, p.cat, SELLERS[p.seller].name, p.desc].join(" "), rating: p.rating, price: p.price, city: SELLERS[p.seller].city, available: p.stock > 0 }));
    EVENTS.forEach((e) => out.push({ kind: "evenement", title: e.name, sub: e.cat + " · " + e.city + " · " + fmtDateShort(e.date), icon: "confirmation_number", img: e.img, route: "eventDetail", params: { id: e.id }, keys: [e.name, e.cat, e.city, e.place, e.organizer].join(" "), rating: 4.8, price: minPrice(e), city: e.city, lat: e.lat, lng: e.lng }));
    SITES.forEach((s) => out.push({ kind: "lieu", title: s.name, sub: siteType(s.type).label + " · " + s.place, icon: siteType(s.type).icon, img: s.img, route: "cultureDetail", params: { id: s.id }, keys: [s.name, s.place, s.type, siteType(s.type).label, s.city, s.near || ""].join(" "), rating: 4.7, price: 0, city: s.city, lat: s.lat, lng: s.lng }));
    DESTINATIONS.forEach((c) => out.push({ kind: "destination", title: c, sub: CITIES[c].country + " · Destination", icon: "travel_explore", img: CITIES[c].hero, route: "destination", params: { city: c }, keys: [c, CITIES[c].country, "destination tourisme ville"].join(" "), rating: 4.9, price: 0, city: c }));
    [
      { title: "Transport", sub: "Réserver une course", icon: "directions_car", route: "transport", keys: "transport course taxi moto zem vtc" },
      { title: "Livraison", sub: "Envoyer un colis ou un repas", icon: "local_shipping", route: "delivery", keys: "livraison colis coursier document" },
      { title: "Youss Wallet", sub: "Solde, envoi, QR Pay", icon: "account_balance_wallet", route: "wallet", keys: "wallet portefeuille solde argent payer envoyer" },
      { title: "Youss Bonus", sub: "Points et récompenses", icon: "workspace_premium", route: "rewards", keys: "bonus points fidelite recompense" },
      { title: "Youss Business", sub: "Espace professionnel", icon: "business_center", route: "business", keys: "business pro entreprise vendeur commerce" },
      { title: "Scanner un monument", sub: "Culture & Tourisme", icon: "qr_code_scanner", route: "culturalScanner", keys: "scanner monument camera culture" }
    ].forEach((s) => out.push(Object.assign({ kind: "service", params: {}, rating: 5, price: 0, city: "" }, s)));
    return out;
  }
  let _index = null;
  function search(q, filters) {
    if (!_index) _index = searchIndex();
    const words = norm(q).trim().split(/\s+/).filter(Boolean);
    const f = filters || {};
    return _index.filter((item) => {
      if (words.length) {
        const hay = norm(item.title + " " + item.sub + " " + (item.keys || ""));
        if (!words.every((w) => hay.includes(w))) return false;
      }
      if (f.kind && f.kind !== "all" && item.kind !== f.kind) return false;
      if (f.city && item.city && item.city !== f.city) return false;
      if (f.rating && (item.rating || 0) < f.rating) return false;
      if (f.maxPrice && item.price && item.price > f.maxPrice) return false;
      if (f.available && item.available === false) return false;
      if (f.maxKm && item.lat != null && f.from) {
        if (distanceKm(f.from.lat, f.from.lng, item.lat, item.lng) > f.maxKm) return false;
      }
      return true;
    });
  }

  window.YCData = {
    IMG, COUNTRIES, CITIES, DESTINATIONS, RESTAURANTS, RESTAURANT_CATS, SELLERS, PRODUCTS, PRODUCT_CATS,
    EVENTS, EVENT_CATS, SITE_TYPES, SITES, DRIVERS, COURIERS, REWARDS, TIERS,
    distanceKm, nearby, norm, byId, fmtDate, fmtDateShort, minPrice, cityOf, countryOf, siteType, search,
    restaurant: (id) => byId(RESTAURANTS, id), product: (id) => byId(PRODUCTS, id), event: (id) => byId(EVENTS, id), site: (id) => byId(SITES, id),
    seller: (id) => SELLERS[id], driverFor: (city, vehicle) => DRIVERS.find((d) => d.city === city && d.vehicle === vehicle) || DRIVERS.find((d) => d.city === city) || DRIVERS[0],
    courierFor: (city) => COURIERS.find((c) => c.city === city) || COURIERS[0],
    restaurantsIn: (city) => RESTAURANTS.filter((r) => r.city === city), eventsIn: (city) => EVENTS.filter((e) => e.city === city || (CITIES[city] && e.country === CITIES[city].country)),
    sitesIn: (city) => SITES.filter((s) => s.city === city), productsBy: (sellerId) => PRODUCTS.filter((p) => p.seller === sellerId),
    tierFor: (points) => { let t = TIERS[0]; TIERS.forEach((x) => { if (points >= x.min) t = x; }); return t; },
    nextTier: (points) => TIERS.find((x) => x.min > points) || null
  };
})();
