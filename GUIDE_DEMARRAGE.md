# 🚀 Guide de Démarrage - Automatisation Carrefour

## ✅ Tests réalisés

J'ai testé le flow complet sur le site Carrefour en temps réel. Voici ce qui fonctionne :

### 1. Clic sur "Ajouter au panier"
- ✅ Le sélecteur `button[aria-label*="Ajouter le produit"]` fonctionne parfaitement
- ✅ Le produit s'ajoute au panier (le compteur s'incrémente dans le header)
- ✅ Le bouton se transforme en sélecteur de quantité après l'ajout

### 2. Popup de mode de livraison
- ✅ Une popup "Comment souhaitez-vous faire vos courses aujourd'hui ?" apparaît au premier ajout
- ✅ Elle propose : Drive / Livraison / Livraison Express
- ✅ Le mode Drive doit être sélectionné pour continuer

### 3. Sélection du mode Drive
- ✅ Le bouton "Drive Retrait gratuit en magasin" est cliquable
- ✅ La popup se ferme après la sélection
- ✅ Les produits suivants n'affichent plus la popup

## 🛠️ Comment lancer l'automatisation

### Étape 1 : Démarrer le service d'automatisation

```powershell
cd automation-service
npm start
```

Le service démarre sur `http://localhost:3001`

### Étape 2 : Démarrer le frontend

```powershell
cd frontend
npm run dev
```

Le frontend démarre sur `http://localhost:3000`

### Étape 3 : Tester l'automatisation

1. Ouvrez `http://localhost:3000` dans votre navigateur
2. Cliquez sur le bouton "🛒 COMMANDER LE PANIER"
3. Un navigateur Chromium s'ouvre automatiquement
4. Observez l'automatisation :
   - Recherche de chaque ingrédient
   - Clic sur "Ajouter au panier"
   - Sélection du mode Drive (au premier ajout)
   - Ajout des autres produits
   - Redirection vers le panier

## 📋 Ingrédients du Burger Végétal

Le script ajoute automatiquement :
- Haché végétal
- Pain burger bio
- Sauce burger vegan
- Salade iceberg
- Tomate bio

## 🎯 Points clés pour la démo

1. **Le navigateur reste ouvert** : C'est intentionnel pour montrer le panier au jury
2. **Mode Drive sélectionné** : Le script choisit automatiquement le Drive (gratuit)
3. **Logs avec emojis** : Suivez la progression dans le terminal du service
4. **Gestion d'erreurs** : Si un produit n'est pas trouvé, le script continue avec les suivants

## 🔧 Troubleshooting

### Le navigateur ne s'ouvre pas
- Vérifiez que le service d'automatisation tourne sur le port 3001
- Vérifiez les logs du terminal `automation-service`

### Erreur "ENOBUFS" ou "Connection refused"
- Le service d'automatisation n'est pas démarré
- Redémarrez avec `npm start` dans le dossier `automation-service`

### Rien ne s'ajoute au panier
- **C'est résolu !** Le code a été mis à jour avec les bons sélecteurs
- Le script attend maintenant la popup de mode de livraison
- Il sélectionne automatiquement le mode Drive

## 🎉 Résultat attendu

À la fin de l'automatisation :
- Le navigateur Carrefour affiche le panier
- Les 5 ingrédients du burger végétal sont ajoutés
- Le mode Drive est configuré
- Le panier est prêt pour passer commande

## 📊 Architecture technique

```
frontend (React + Vite) ─────► automation-service (Express + Puppeteer)
   Port 3000                        Port 3001
      │                                  │
      │  POST /api/start-shopping       │
      └──────────────────────────────────┤
                                         │
                                         ▼
                              Lance Puppeteer (Chromium)
                                         │
                                         ▼
                              Scraping + ajout au panier Carrefour
```

## 🚀 Prêt pour la démo !

Votre "Killer Feature" est opérationnelle. Bonne chance pour le hackathon GreenReal ! 🥗🎉


