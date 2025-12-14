# HackTheFork - BeReal for Meals

A B2C hackathon MVP for a food sustainability app. Users post photos of their meals, and the app automatically analyzes them to compute vegetal proportion, health, and carbon footprint scores.

## Features

- 📸 **Photo Upload**: Users can upload meal photos
- 🤖 **AI Analysis**: CLIP-based zero-shot ingredient detection
- 📊 **Scoring System**: 
  - Vegetal Score (0-100): Plant-based proportion
  - Health Score (0-100): Nutrition heuristic
  - Carbon Score (0-100): Relative footprint (higher = better)
- 📱 **Social Feed**: Instagram-style feed with upvotes
- 📈 **User Stats**: Aggregated statistics per user
- 🍪 **Cookie-based Identity**: No login required - anonymous user IDs

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** (Postgres + Storage)
- **CLIP** (via @xenova/transformers) for image analysis
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up Supabase**:
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql`
   - Create a storage bucket named `meal-images` (public)
   - Copy your project URL and anon key


3. **Configure environment**:
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```


4. **Run development server**:
   ```bash
   pnpm dev
   ```


5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure



```
src/
├── app/
│   ├── api/
│   │   ├── posts/route.ts      # Create & fetch posts
│   │   ├── upvote/route.ts     # Toggle upvotes
│   │   └── stats/route.ts      # User statistics
│   └── page.tsx                # Main entry point
├── components/
│   ├── CameraScreen.tsx        # Photo capture & analysis
│   ├── FeedScreen.tsx          # Social feed
│   ├── ProfileScreen.tsx       # User stats
│   └── ...
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── cookies.ts             # User ID management
│   ├── image-analysis.ts      # CLIP analysis
│   └── scoring.ts             # Score calculation
└── services/
    └── api.ts                  # API client functions
```

## Database Schema

- **users**: Anonymous user IDs (from cookies)
- **posts**: Meal posts with scores
- **ingredients**: Detected ingredients per post
- **upvotes**: One upvote per user per post

## API Endpoints

- `POST /api/posts` - Create post (upload + analyze + save)
- `GET /api/posts` - Fetch feed posts
- `POST /api/upvote` - Toggle upvote
- `GET /api/upvote` - Check upvote status
- `GET /api/stats` - Get user statistics

## Scoring Algorithm

### Vegetal Score
- Weighted proportion of plant-based ingredients
- Plant proteins count as 1.2x, animals as 0.5x

### Health Score
- Base: 60
- +15 for vegetables/salad
- +10 for plant proteins
- -20 for fried foods
- -5 per animal product

### Carbon Score
- Base: 80
- -40 for beef
- -25 for pork
- -15 for chicken
- -10 for fish/dairy
- +10 for plant proteins
- +5 for multiple vegetables

## Demo Mode

This is a **demo-first** product:
- No authentication system
- Cookie-based anonymous user IDs
- All RLS policies allow all operations
- Optimized for clarity and demo impact

## 🛒 Feature Auchan - Automatisation du Panier

### Description
Killer feature pour la démo : un bouton "Commander les ingrédients" qui ouvre automatiquement un navigateur, va sur le site Auchan Drive, cherche les produits et les ajoute au panier.

### Architecture
- **Service Node.js** (`automation-service/`): Service Express avec Playwright pour l'automatisation
- **Frontend Vite** (`frontend-bastian/`): Frontend React/Vite séparé pour la feature d'automatisation
- **Composant React** (`frontend-bastian/src/components/CarrefourOrderButton.tsx`): Bouton de déclenchement
- **Stack**: Playwright, React, Express, Vite

### Utilisation
1. Démarrer le service d'automatisation : `cd automation-service && npm start`
2. Démarrer le frontend d'automatisation : `cd frontend-bastian && npm run dev`
3. Cliquer sur le bouton "COMMANDER LE PANIER" dans l'interface
4. Le navigateur s'ouvre automatiquement et ajoute les produits au panier Auchan

### Fonctionnalités
- ✅ Automatisation avec Playwright (mode visible pour la démo)
- ✅ Gestion de session persistante (évite les CAPTCHAs)
- ✅ Gestion d'erreurs robuste
- ✅ Logs détaillés avec timestamps
- ✅ Optimisations de vitesse (timeouts minimisés)
- ✅ Navigateur reste ouvert à la fin pour la démo

## License

MIT
