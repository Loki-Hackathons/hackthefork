# Installation

## Prérequis

- Node.js 20+
- npm (inclus avec Node.js)

## Installation des dépendances

```bash
npm install
```

Cette commande installe automatiquement toutes les dépendances listées dans `package.json` :
- React 19 + Next.js 16
- Supabase client
- Playwright (pour l'automatisation)
- UI components (Radix UI, Lucide Icons, etc.)
- Et toutes les autres dépendances

## Lancement du projet

### Mode développement
```bash
npm run dev
```

### Build de production
```bash
npm run build
```

### Démarrer en production
```bash
npm start
```

## Configuration

Copier `.vercelignore` en `.env.local` et remplir les variables d'environnement :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Notes importantes

- ✅ Le fichier `package-lock.json` est commité pour garantir les mêmes versions pour toute l'équipe
- ✅ Ne pas utiliser `pnpm` ou `yarn` - utiliser uniquement `npm`
- ✅ Le dossier `frontend-bastian/` est exclu du build Next.js
