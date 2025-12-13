# 🛒 Service d'Automatisation Carrefour

Service Node.js pour automatiser l'ajout de produits au panier Carrefour.

## 🚀 Installation

```bash
cd automation-service
npm install
```

## ▶️ Démarrage

```bash
npm start
```

Le service sera disponible sur `http://localhost:3001`

## 📋 Endpoints

- `POST /api/start-shopping` - Démarre l'automatisation
  - Body: `{ "dishId": "burger-vege" }`
  - Répond immédiatement et lance l'automatisation en arrière-plan

- `GET /health` - Vérifie l'état du service

## 🎯 Fonctionnalités

- ✅ Utilise Puppeteer avec plugin Stealth pour éviter la détection
- ✅ Navigateur visible pour la démo
- ✅ Gestion d'erreurs robuste
- ✅ Logs détaillés avec emojis
- ✅ Laisse le navigateur ouvert à la fin


