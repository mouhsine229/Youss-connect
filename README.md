# YOUSS CONNECT

Maquette interactive de KYA CORPORATION : transport, livraison, restos, sorties, achats, culture et paiement, à Cotonou, Dakar, Lomé et Accra.

Tout tourne dans le navigateur, sans backend : les données sont fictives, l'état est gardé en localStorage, et les services se parlent entre eux. Payer une course débite le wallet, crédite des points, crée une activité et une notification.

Aucune banque, aucun opérateur ni aucune entreprise n'est présenté comme partenaire officiel.

## Lancer en local

```bash
npm install
npm run dev
```

`npm run dev` compile le CSS puis sert le dossier sur http://127.0.0.1:4173. N'importe quel serveur statique fait aussi l'affaire (`npx serve .`, `python3 -m http.server`), le CSS compilé `css/app.css` est versionné.

Si vous touchez à `src/styles.css`, `tailwind.config.js` ou aux classes utilisées dans `js/**`, relancez `npm run build:css` (ou laissez `npm run watch:css` tourner).

Pour entrer : n'importe quel numéro de téléphone, code OTP `1234`, code PIN `0000`. Il y a aussi un bouton "Explorer la démo sans compte" sur l'écran de connexion.

## Déploiement

Dépôt : https://github.com/mouhsine229/Youss-connect
Site : https://mouhsine229.github.io/Youss-connect/

GitHub Pages sert la branche `gh-pages`. Le workflow `.github/workflows/gh-pages.yml` y recopie `main` à chaque push, comptez une ou deux minutes puis rechargez sans cache. Le `.nojekyll` évite que Jekyll ne touche aux fichiers.

Deux espaces internes ne sont pas dans le menu client :

- la console KYA : https://mouhsine229.github.io/Youss-connect/#/kya-ops
- la cuisine d'un restaurant, par lien d'invitation : https://mouhsine229.github.io/Youss-connect/#/pro/rejoindre?t=YC-PRO-MAMAN

## Comment c'est organisé

Pas de bundler, pas de framework. Chaque fichier expose un objet global et `index.html` les charge dans l'ordre.

- `index.html` : la coquille. Charge les scripts et pose le thème sombre avant le premier rendu.
- `src/styles.css` : variables de design, thème clair/sombre et composants (`.btn`, `.card`, `.chip`, `.input`...). Compilé par Tailwind vers `css/app.css`.
- `js/data.js` : pays, villes, restaurants et menus, produits, événements, sites culturels, chauffeurs, livreurs, récompenses, index de recherche.
- `js/state.js` : l'état central et sa persistance. Session, utilisateur, wallet, points, adresses, paniers, commandes, billets, espace pro. Le paiement commun passe par `ACStore.pay()`.
- `js/i18n.js` : français et anglais.
- `js/ui.js` : boutons, cartes, badges, formulaires, feuilles, toasts, états vides, squelettes.
- `js/shell.js` : la mise en page. Barre latérale et en-tête sur desktop, en-tête et navigation basse sur mobile, sélecteur de ville.
- `js/router.js` : routage par hash (`#/ecran?param=...`), bouton Retour, liens profonds comme `#/culture/<id>`, garde d'authentification.
- `js/map.js` : Leaflet, tuiles OSM, itinéraires OSRM avec repli hors ligne, géocodage Photon, animation du véhicule.
- `js/scanner.js` : caméra, lecture de QR (BarcodeDetector ou jsQR) et génération de QR.
- `js/demo.js` : les parcours guidés.
- `js/screens/*.js` : un fichier par domaine (`auth`, `home`, `explorer`, `transport`, `delivery`, `restaurants`, `orders`, `events`, `market`, `culture`, `wallet`, `rewards`, `business`, `activities`, `notifications`, `profile`, `ops`, `pro`).
- `sw.js` : service worker. Shell précaché, images en cache, polices et tuiles en stale-while-revalidate.
- `supabase/schema.sql`, `js/backend.js`, `js/config.js` : backend Supabase optionnel (OTP par SMS, wallet côté serveur). Tant que `js/config.js` est vide, tout reste local.

## Ce qu'on peut montrer

Les parcours guidés se lancent depuis Paramètres, ou depuis le bouton dans la barre latérale. Ils enchaînent les écrans avec des données déjà préparées.

- Transport : départ et destination sur carte avec itinéraire réel, choix du véhicule, confirmation, recherche de chauffeur, suivi animé, fin de course avec notation et pourboire, paiement.
- Restaurant : fiche avec menu et avis, panier, adresse, paiement, puis suivi en direct jusqu'à la livraison.
- Événement : fiche, achat du billet, paiement, billet numérique avec un vrai QR Code dans "Mes billets".
- Commerce : produit sur Youss Market, panier, adresse, mode de livraison, paiement, suivi.
- Culture : destination, fiche du monument (histoire, visite, audio-guide, vidéo), scanner, résultat, lieux à proximité, exploration autour de soi.
- Livraison : catégorie, adresses, estimation, paiement, recherche d'un livreur, suivi sur carte, preuve de remise.

Les états intermédiaires sont couverts : chargement, erreur, paiement en attente ou échoué avec reprise, panier vide, aucun résultat, hors ligne, écran introuvable.

## Crédits

- Photos de lieux réels : Wikimedia Commons, auteurs et licences dans `assets/img/CREDITS.md`.
- Plats, produits, illustrations d'onboarding et portraits : images de synthèse faites pour la maquette.
- Cartes : © OpenStreetMap contributors. Itinéraires : OSRM. Géocodage : Photon (Komoot).

## Ce qui n'est pas réel

- Youss Wallet est conceptuel. Aucun flux financier, aucun partenaire engagé.
- Le scanner culturel lit vraiment les QR Codes, mais la reconnaissance d'image est simulée.
- Les itinéraires et les tuiles de carte demandent une connexion la première fois, ils sont mis en cache ensuite.
- L'interface est en français et en anglais.
