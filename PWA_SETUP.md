# Configuration PWA - EatReal

L'application EatReal est maintenant configurée comme une **Progressive Web App (PWA)**, ce qui permet de l'installer sur mobile et d'avoir une expérience "app-like" sans passer par les stores.

## ✅ Ce qui a été configuré

### 1. Manifest.json
- Fichier `public/manifest.json` créé avec `display: "standalone"`
- Configuration pour masquer la barre d'URL et les boutons de navigation
- Icônes 192x192 et 512x512 générées automatiquement

### 2. Balises Meta (iOS)
- Ajout des balises meta dans `src/app/layout.tsx`
- Support spécifique pour iOS/Safari
- Configuration de la barre de statut en noir translucide
- Viewport optimisé pour mobile

### 3. Next-PWA
- Package `next-pwa` installé et configuré dans `next.config.ts`
- Service Worker généré automatiquement au build
- Cache intelligent pour améliorer les performances
- Désactivé en développement pour éviter les problèmes de cache

### 4. Icônes
- Générées à partir du logo EatReal existant
- Format PNG avec transparence
- Tailles : 192x192px et 512x512px

## 📱 Comment installer l'app sur mobile

### Sur Android (Chrome/Edge)
1. Ouvrir le site dans Chrome ou Edge
2. Appuyer sur le menu (⋮) en haut à droite
3. Sélectionner "Ajouter à l'écran d'accueil" ou "Installer l'application"
4. Confirmer l'installation

### Sur iOS (Safari)
1. Ouvrir le site dans Safari
2. Appuyer sur le bouton de partage (□↑)
3. Faire défiler et sélectionner "Sur l'écran d'accueil"
4. Confirmer l'ajout

## 🚀 Déploiement

Après le déploiement sur Vercel :
1. Le build générera automatiquement les fichiers Service Worker
2. Les utilisateurs pourront installer l'app directement depuis le navigateur
3. L'app s'ouvrira en plein écran, sans interface de navigateur

## 🔧 Développement

En mode développement (`npm run dev`), la PWA est désactivée pour éviter les problèmes de cache.

Pour tester la PWA en local :
```bash
npm run build
npm start
```

Puis ouvrir `http://localhost:3000` et tester l'installation.

## 📝 Fichiers générés

Les fichiers suivants seront générés automatiquement au build et sont ignorés par git :
- `public/sw.js` - Service Worker
- `public/sw.js.map` - Source map
- `public/workbox-*.js` - Scripts Workbox

## 🎨 Personnalisation

Pour modifier l'apparence de l'app :
- **Couleur de thème** : Modifier `theme_color` dans `public/manifest.json`
- **Couleur de fond** : Modifier `background_color` dans `public/manifest.json`
- **Icônes** : Remplacer les fichiers dans `public/` et relancer `node scripts/generate-icons.js`

## ⚠️ Notes importantes

1. **HTTPS requis** : Les PWA ne fonctionnent qu'en HTTPS (ou localhost)
2. **Cache** : Le Service Worker met en cache les ressources. En cas de problème, vider le cache du navigateur
3. **iOS** : Safari a des limitations sur les PWA (pas de notifications push, etc.)
4. **Mise à jour** : Les utilisateurs verront les mises à jour au prochain chargement de l'app

## 🔍 Vérification

Pour vérifier que la PWA est bien configurée :
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Application" (Chrome) ou "Storage" (Firefox)
3. Vérifier la section "Manifest" et "Service Workers"

## 📊 Lighthouse

Pour tester le score PWA :
```bash
# Installer Lighthouse
npm install -g lighthouse

# Tester le site
lighthouse https://votre-site.vercel.app --view
```

Le score PWA devrait être proche de 100/100.

