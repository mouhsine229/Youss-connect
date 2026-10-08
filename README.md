# YOUSS CONNECT — App de démonstration (KYA CORPORATION)

## Lancer l'application
Ouvrez `index.html` dans un navigateur, ou servez le dossier via n'importe
quel serveur statique (recommandé pour le service worker) :

```
npx serve .
```

## Installer comme PWA (mobile ou desktop)
Servi en HTTPS (ou via `localhost`), l'app est installable :
- Android/Chrome : menu ⋮ → "Installer l'application"
- iOS/Safari : Partager → "Sur l'écran d'accueil"
- Desktop Chrome/Edge : icône d'installation dans la barre d'adresse

Le service worker (`sw.js`) met en cache l'app shell pour un démarrage
hors-ligne des écrans. Les actions qui simulent un vrai réseau (paiements
Wallet) restent volontairement bloquées hors-ligne pour rester honnêtes
sur ce qui est réellement synchronisé.

## Empaqueter en app native (iOS / Android) avec Capacitor
Ce dépôt est prêt pour Capacitor (`capacitor.config.json` inclus) mais la
génération des projets Xcode/Android Studio nécessite un environnement
avec accès réseau + SDKs natifs, indisponible dans cet environnement de
build. Étapes à exécuter sur votre machine :

```
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap add ios
npx cap add android
npx cap copy
npx cap open ios      # ou: npx cap open android
```

## Ce qui est réellement fonctionnel
Voir le résumé fourni dans la conversation : authentification, Transport,
Restaurants, Youss Market, Événements, Culture & Tourisme, Livraison,
Youss Wallet, Youss Bonus, Activités, Notifications, Profil, Youss
Business — tous connectés à un même état partagé (solde, points,
activités, notifications).

## Limites connues (transparence)
- Données de démonstration en mémoire uniquement (pas de vraie base de
  données ni de vrai backend multi-utilisateur).
- Le "Scanner culturel" est une simulation assumée, pas une vraie
  reconnaissance d'image.
- Les images de fond de plusieurs écrans du ZIP Stitch d'origine
  (Google AI Studio) n'ont pas été reprises telles quelles : elles sont
  remplacées par des blocs d'icônes de la palette de marque pour éviter
  toute dépendance à des liens d'images temporaires.
- Le mode hors-ligne est simulé via `navigator.onLine` : il bloque les
  paiements avec un message clair, mais ne simule pas une vraie latence
  réseau ni des erreurs serveur partielles.
