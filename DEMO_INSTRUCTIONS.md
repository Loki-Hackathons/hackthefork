# 🎯 Instructions pour la Démo - Feature Carrefour

## 🚀 Démarrage Rapide

### 1. Installer les dépendances

**Service d'automatisation** (dans un terminal) :
```bash
cd automation-service
npm install
```

**Frontend** (dans un autre terminal) :
```bash
cd frontend
npm install
```

### 2. Démarrer les services

**Terminal 1 - Service d'automatisation** :
```bash
cd automation-service
npm start
```
✅ Le service sera sur `http://localhost:3001`

**Terminal 2 - Frontend** :
```bash
cd frontend
npm run dev
```
✅ L'application sera sur `http://localhost:3000`

### 3. Tester la fonctionnalité

1. Ouvrir `http://localhost:3000` dans votre navigateur
2. Vous verrez l'interface avec le bouton vert **"🛒 COMMANDER LE PANIER"**
3. Cliquer sur le bouton
4. Un navigateur Chromium s'ouvrira automatiquement
5. Le script va :
   - Chercher chaque ingrédient sur Carrefour
   - Ajouter les produits au panier
   - Rediriger vers la page du panier
   - **Laisser le navigateur ouvert** pour la démo

## 📋 Ingrédients Mockés

Pour le "Burger Végétal", les ingrédients suivants seront recherchés :
- Haché végétal
- Pain burger bio
- Sauce burger vegan
- Salade iceberg
- Tomate bio

## ⚠️ Notes Importantes

- Le navigateur reste **ouvert** à la fin (c'est voulu pour la démo)
- Les logs avec emojis apparaissent dans le terminal du service d'automatisation
- Si un produit n'est pas trouvé, le script continue avec le suivant
- Le script utilise le plugin Stealth pour éviter la détection

## 🐛 Dépannage

**Le navigateur ne s'ouvre pas** :
- Vérifier que Chrome/Chromium est installé
- Vérifier les logs dans le terminal du service

**Erreur de connexion** :
- Vérifier que le service d'automatisation tourne sur le port 3001
- Vérifier le proxy dans `vite.config.ts`

**Les produits ne s'ajoutent pas** :
- Carrefour peut avoir changé leur structure HTML
- Vérifier les logs pour voir quels sélecteurs sont utilisés
- Adapter les sélecteurs dans `carrefour-automation.js` si nécessaire


