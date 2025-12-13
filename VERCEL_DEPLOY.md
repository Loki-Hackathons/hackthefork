# Guide de déploiement sur Vercel

Ce guide explique comment déployer l'application HackTheFork sur Vercel.

## Prérequis

1. Un compte GitHub (pour connecter votre repository)
2. Un compte Vercel (gratuit)

## Étapes de configuration

### 1. Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **Sign Up**
3. Choisissez **Continue with GitHub** (recommandé pour connecter votre repo)
4. Autorisez Vercel à accéder à votre compte GitHub

### 2. Importer votre projet

1. Dans le dashboard Vercel, cliquez sur **Add New Project**
2. Sélectionnez votre repository `HackTheFork`
3. **Important** : Sélectionnez la branche `vercel` (pas `main`)
4. Vercel détectera automatiquement la configuration depuis `vercel.json`

### 3. Configurer les variables d'environnement

Dans les paramètres du projet Vercel :

1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez les variables suivantes (pour Production, Preview, et Development) :

```
SUPABASE_URL=votre_url_supabase
SUPABASE_KEY=votre_clé_supabase
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_KEY=votre_clé_supabase
VITE_API_URL=https://loki-hackthefork.vercel.app/api
```

**Note** : Remplacez `votre_url_supabase` et `votre_clé_supabase` par vos vraies valeurs Supabase.

### 4. Configurer le projet

Dans les paramètres du projet :

1. **Project Name** : Assurez-vous que le nom est `loki-hackthefork` (ou changez-le si nécessaire)
2. **Root Directory** : Laissez vide (racine du projet)
3. **Build Command** : `cd frontend && npm install && npm run build` (déjà configuré dans vercel.json)
4. **Output Directory** : `frontend/dist` (déjà configuré dans vercel.json)
5. **Install Command** : `cd frontend && npm install` (déjà configuré dans vercel.json)

### 5. Déployer

1. Cliquez sur **Deploy**
2. Vercel va :
   - Installer les dépendances Node.js du frontend
   - Builder le frontend
   - Configurer les serverless functions Python pour le backend
3. Le déploiement prend généralement 2-5 minutes

### 6. Vérifier le déploiement

Une fois le déploiement terminé :

1. Votre application sera disponible à : `https://loki-hackthefork.vercel.app`
2. L'API backend sera accessible à : `https://loki-hackthefork.vercel.app/api`
3. Testez l'endpoint de santé : `https://loki-hackthefork.vercel.app/api/`

## Structure du déploiement

- **Frontend** : SPA React déployée depuis `frontend/dist`
- **Backend API** : Serverless functions Python dans `api/` qui pointent vers le backend FastAPI
- **Routes** :
  - `/api/*` → Backend FastAPI
  - `/*` → Frontend React (SPA)

## Mises à jour futures

À chaque push sur la branche `vercel`, Vercel redéploiera automatiquement l'application.

Pour déployer manuellement :
1. Allez dans le dashboard Vercel
2. Sélectionnez votre projet
3. Cliquez sur **Redeploy**

## Dépannage

### Erreur de build

- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez les logs de build dans le dashboard Vercel

### Erreur 404 sur les routes API

- Vérifiez que `api/index.py` existe et est correctement configuré
- Vérifiez que `api/requirements.txt` contient toutes les dépendances

### Frontend ne charge pas

- Vérifiez que `frontend/dist` est bien généré après le build
- Vérifiez les logs de build pour les erreurs TypeScript/Vite

