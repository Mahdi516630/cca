# Gestion des Arbitres - SQLite Version

Cette application est une solution complète pour la gestion des arbitres, des catégories de matchs et des désignations.

## Caractéristiques
- **Base de données locale** : Utilise SQLite (`database.sqlite`) pour stocker les données de manière persistante dans un fichier.
- **Authentification personnalisée** : Système de Login/Register indépendant (remplace Google Auth).
- **Exports** : Génération de rapports professionnels en PDF et Excel.
- **Responsivité** : Interface optimisée pour tous les écrans (Mobile, Tablette, Desktop).

## Installation Locale
1. Installez les dépendances : `npm install`
2. Lancez le serveur de développement : `npm run dev`
3. Accédez à l'application sur `http://localhost:3000`

## Identifiants par défaut
- **Email** : `mahdiyacoubali318@gmail.com`
- **Mot de passe** : `admin123`

## Déploiement
Cette application est "Full-Stack" (Express + Vite + SQLite). 
- Pour la déployer sur **GitHub**, vous pouvez utiliser le code source, mais **GitHub Pages** ne supporte pas SQLite (car c'est un hébergeur statique).
- Il est recommandé d'utiliser des services comme **Cloud Run**, **Heroku**, ou un **VPS** pour que le fichier SQLite puisse être écrit.

## Structure
- `server.ts` : Serveur Express et logique SQLite.
- `src/App.tsx` : Interface utilisateur React.
- `database.sqlite` : Fichier contenant toutes vos données.
