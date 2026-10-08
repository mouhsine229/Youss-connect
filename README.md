# YOUSS CONNECT — maquette interactive v2

**Une seule application pour vivre l'Afrique au quotidien.** Portée par KYA CORPORATION.

Maquette mobile-first et desktop de la super application africaine : Transport, Livraison, Restaurants, Événements, Youss Market, Culture & Tourisme, Youss Wallet, Youss Bonus et Youss Business, reliés par un seul compte et un état partagé (payer une course débite le Wallet, crédite des points, crée une activité et une notification).

Villes de démonstration : **Cotonou** (ville de l'utilisateur), **Dakar**, **Lomé**, **Accra**. Données fictives mais réalistes ; aucune banque, opérateur ou entreprise n'est présenté comme partenaire officiel.

## Lancer en local

```bash
npm install          # une seule fois (Tailwind + vendors)
npm run dev          # compile le CSS puis sert sur http://127.0.0.1:4173
```

Ou simplement servir le dossier avec n'importe quel serveur statique (`npx serve .`, `python3 -m http.server`). Le CSS compilé (`css/app.css`) est versionné : le site fonctionne tel quel sur GitHub Pages sans étape de build.

Après une modification de `src/styles.css`, de `tailwind.config.js` ou de classes dans `js/**`, relancer `npm run build:css` (ou `npm run watch:css` pendant le développement).

**Compte démo** : n'importe quel numéro · code OTP `1234` · code PIN `0000` · bouton « Explorer la démo sans compte » sur l'écran de connexion.

## Déploiement GitHub Pages

Dépôt de publication : https://github.com/mouhsine229/Youss-connect — le site est à la racine de la branche `main` et GitHub Pages est configuré en « Deploy from a branch » (main, dossier `/`). Chaque push sur `main` redéploie https://mouhsine229.github.io/Youss-connect/ en une à deux minutes. Le fichier `.nojekyll` désactive le traitement Jekyll. Tout est statique : aucune étape de build n'est nécessaire côté GitHub.

## Architecture

| Fichier | Rôle |
|---|---|
| `index.html` | Coquille, chargement des scripts, thème avant premier rendu |
| `src/styles.css` → `css/app.css` | Tokens de design (variables CSS, thème clair/sombre), composants (`.btn`, `.card`, `.chip`, `.input`…), Tailwind compilé |
| `js/data.js` | Données de démonstration : pays, villes et points d'intérêt, restaurants et menus, produits et vendeurs, événements, sites culturels, chauffeurs, livreurs, récompenses, index de recherche |
| `js/state.js` | État central persisté (`localStorage`) : session, utilisateur, Wallet, Youss Bonus, adresses, moyens de paiement, activités, notifications, paniers, commandes, billets, Youss Business ; paiement unifié `ACStore.pay()` |
| `js/i18n.js` | Français, English (complets), Fon et Wolof (partiels, à valider par des locuteurs) |
| `js/ui.js` | Kit UI : boutons, cartes métier, badges, formulaires, feuilles, toasts, états vides, squelettes, « Et ensuite ? » |
| `js/shell.js` | Mise en page responsive : barre latérale + en-tête (desktop), en-tête + navigation basse (mobile), sélecteur de ville |
| `js/router.js` | Routage par hash (`#/ecran?param=…`), bouton Retour du navigateur, liens profonds (`#/culture/<id>`), garde d'authentification |
| `js/map.js` | Moteur carte Leaflet : tuiles OSM, itinéraires OSRM (repli hors ligne), géocodage Photon biaisé sur la ville, animation de véhicule |
| `js/scanner.js` | Caméra + lecture QR (BarcodeDetector / jsQR), génération de QR |
| `js/demo.js` | Parcours de démonstration guidés (transport, restaurant, événement, commerce, culture) |
| `js/screens/*.js` | Un module par domaine : `auth`, `home`, `explorer`, `transport`, `delivery`, `restaurants`, `orders`, `events`, `market`, `culture`, `wallet`, `rewards`, `business`, `activities`, `notifications`, `profile` |
| `sw.js` | Service worker : app shell précaché, images en cache, polices et tuiles en stale-while-revalidate |
| `supabase/schema.sql`, `js/backend.js`, `js/config.js` | Backend optionnel (Supabase) : OTP SMS, wallet serveur, RPC sécurisées. Sans clés, la maquette reste 100 % locale |

## Parcours démontrables

- **Transport** : Accueil → Transport → Départ / Destination (carte, suggestions, itinéraire réel) → Véhicule → Confirmation (prix, paiement) → Recherche → Chauffeur trouvé → Suivi animé → Fin de course (durée, distance, notation, pourboire) → Paiement → Et ensuite ?
- **Restaurant** : Restaurants → Fiche (menu, avis, infos) → Panier → Adresse → Paiement → Confirmation → Suivi en direct jusqu'à « Livrée ».
- **Événement** : Événements → Fiche → Billet → Paiement → Billet confirmé → Billet numérique avec QR Code réel → Mes billets.
- **Commerce** : Youss Market → Produit (galerie, vendeur, stock) → Panier → Adresse → Livraison → Paiement → Confirmation → Suivi.
- **Culture** : Explorer → Culture → Destination → Monument (Aperçu / Histoire / Visite / Infos, audio-guide, vidéo) → Scanner → Résultat → Lieux à proximité → Explorer autour de moi.
- **Livraison** : catégorie → adresses → estimation → paiement → recherche → livreur trouvé → suivi sur carte (étapes) → preuve de remise.

Menu **Paramètres → Parcours de démonstration** (ou le bouton dans la barre latérale) enchaîne automatiquement les écrans de chaque parcours avec les données préparées.

## États couverts

Chargement, succès, erreur, paiement réussi / en attente / échoué (avec reprise), recherche chauffeur, chauffeur trouvé, commande confirmée, livraison en cours, commande livrée, panier vide, aucun résultat, aucune notification, aucune activité, hors ligne, écran introuvable.

## Crédits

- Photos de lieux réels : Wikimedia Commons, auteurs et licences dans `assets/img/CREDITS.md`.
- Autres visuels (plats, produits, services, illustrations d'onboarding, portraits) : images de synthèse générées pour la maquette.
- Cartes : © OpenStreetMap contributors ; itinéraires : OSRM ; géocodage : Photon (Komoot).

## Limites assumées

- Youss Wallet est conceptuel : aucun flux financier réel, aucun partenaire engagé.
- La reconnaissance d'image du scanner culturel est simulée ; la lecture de QR Code est réelle.
- Les itinéraires et tuiles de carte nécessitent une connexion la première fois (mis en cache ensuite).
- Fon et Wolof : traductions partielles de démonstration.
