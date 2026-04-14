# Gestion des Arbitres - Déploiement GitHub

Cette application est un projet **Full-Stack** utilisant React (Vite), Express et Neon Postgres.

## 🚀 Comment mettre sur GitHub

1. **Créez un nouveau dépôt** sur votre compte GitHub.
2. **Initialisez Git** dans votre dossier local (si ce n'est pas déjà fait) :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. **Liez votre dépôt local à GitHub** :
   ```bash
   git remote add origin https://github.com/VOTRE_NOM/VOTRE_DEPOT.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 Comment Déployer (Hébergement)

Puisque c'est une application Full-Stack avec un serveur Node.js, vous ne pouvez pas utiliser GitHub Pages (qui est statique). Voici les meilleures options gratuites/abordables :

### Option 1 : Render (Recommandé)
1. Créez un compte sur [Render.com](https://render.com/).
2. Cliquez sur **New +** > **Web Service**.
3. Connectez votre dépôt GitHub.
4. **Configuration** :
   - **Runtime** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
5. **Variables d'environnement** :
   - Allez dans l'onglet **Environment**.
   - Ajoutez `DATABASE_URL` avec votre lien Neon Postgres.
   - Ajoutez `JWT_SECRET` avec une clé secrète de votre choix.

### Option 2 : Railway
1. Créez un compte sur [Railway.app](https://railway.app/).
2. Cliquez sur **New Project** > **Deploy from GitHub repo**.
3. Railway détectera automatiquement les scripts et déploiera l'application.
4. N'oubliez pas d'ajouter vos variables d'environnement (`DATABASE_URL`, `JWT_SECRET`) dans l'onglet **Variables**.

## 🛠️ Développement Local
1. Clonez le dépôt.
2. Installez les dépendances : `npm install`.
3. Créez un fichier `.env` avec votre `DATABASE_URL`.
4. Lancez : `npm run dev`.

## 📝 Note sur SQLite
Si vous préférez utiliser SQLite à la place de Postgres, sachez que sur la plupart des hébergeurs (comme Render), le fichier `.sqlite` sera effacé à chaque redémarrage du serveur. C'est pourquoi l'utilisation de **Neon Postgres** est fortement recommandée pour la production.
