# HackTheFork - AI-Powered Sustainable Food Platform

## 🎯 Project Overview

**HackTheFork** is **the BeREAL of food to help you improve**. 

A social platform where you post photos of your meals, and the app automatically analyzes them to compute sustainability scores, suggest better ingredients, and help you make more eco-friendly food choices. Every meal photo gets instant AI analysis for vegetal proportion, health, and carbon footprint scores, helping you improve your eating habits over time.

---

## ✨ Key Features

### 1. **AI-Powered Meal Analysis**
- 📸 **Photo Upload**: Users capture or upload meal photos
- 🤖 **Multi-Model AI Vision**: Uses Blackbox AI (Gemini 3 Pro, GPT-4o) to identify dishes and extract ingredients
- 📊 **Triple Scoring System**:
  - **Vegetal Score (0-100)**: Plant-based proportion of the meal
  - **Health Score (0-100)**: Nutritional quality assessment
  - **Carbon Score (0-100)**: Environmental impact (higher = lower footprint)

### 2. **Social Feed Experience**
- 📱 Instagram-style feed with meal posts
- ❤️ Upvote system for community engagement
- 💬 Comments and discussions on meals
- 📈 User statistics and aggregated scores
- 🎨 Beautiful, modern UI with smooth animations

### 3. **Smart Ingredient Recommendations**
- 🔍 **Open Food Facts Integration**: Searches for best products based on Nutri-Score, Eco-Score, and NOVA
- 🛒 **Product Scoring**: Each ingredient gets a sustainability score
- 🔄 **Smart Swaps**: Suggests better alternatives for ingredients
- 📦 **Recipe Engine**: Automatically generates shopping lists from meal photos

### 4. **Automated Grocery Shopping** 🚀
- 🤖 **Playwright Automation**: Automatically adds ingredients to Auchan Drive cart
- 🍪 **Session Management**: Persistent browser sessions to avoid CAPTCHAs
- ⚡ **Fast & Reliable**: Optimized for demo speed and reliability
- 🎯 **One-Click Ordering**: Users can order ingredients directly from the app

### 5. **User Experience**
- 🎭 **Tinder-Style Onboarding**: Engaging swipe-based introduction
- 🍪 **Cookie-based Identity**: No login required - anonymous user IDs
- 📱 **PWA Ready**: Progressive Web App capabilities
- 🌙 **Dark Theme**: Beautiful dark UI optimized for mobile

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icons

### Backend & Services
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database + file storage
- **Blackbox AI** - Multi-model AI vision (Gemini 3 Pro, GPT-4o)
- **Open Food Facts API** - Product data and scoring
- **Playwright** - Browser automation for grocery shopping

### AI & ML
- **@xenova/transformers** - CLIP-based zero-shot image classification (fallback)
- **Blackbox AI** - Primary vision model for dish identification
- **Custom scoring algorithms** - Sustainability metrics

### Automation
- **Node.js + Express** - Automation service
- **Playwright** - Browser automation
- **Cookie management** - Session persistence

---

## 🏗️ Architecture

### Project Structure

```
hackthefork_clean/
├── src/
│   ├── app/
│   │   ├── api/                    # Next.js API routes
│   │   │   ├── analyze/            # AI image analysis
│   │   │   ├── analyze-ingredients/ # Ingredient extraction
│   │   │   ├── posts/              # Post CRUD operations
│   │   │   ├── upvote/             # Like/unlike posts
│   │   │   ├── order/              # Grocery automation trigger
│   │   │   └── stats/              # User statistics
│   │   └── page.tsx                # Main entry point
│   ├── components/
│   │   ├── MainApp.tsx             # Main app container
│   │   ├── FeedScreen.tsx          # Social feed
│   │   ├── CameraScreen.tsx        # Photo capture & analysis
│   │   ├── ShopScreen.tsx          # Ingredient shopping
│   │   ├── ProfileScreen.tsx      # User stats
│   │   └── TinderOnboarding.tsx   # Onboarding flow
│   ├── lib/
│   │   ├── image-analysis.ts       # CLIP-based analysis (fallback)
│   │   ├── scoring.ts              # Score calculation
│   │   ├── score-utils.ts         # Score aggregation
│   │   ├── supabase.ts            # Database client
│   │   └── cookies.ts             # User ID management
│   └── services/
│       ├── api.ts                  # API client functions
│       ├── blackboxVision.ts      # Blackbox AI integration
│       ├── recipeEngine.ts        # Recipe & product recommendations
│       ├── offSearch.ts           # Open Food Facts search
│       └── mealIngredients.ts     # Meal-to-ingredients mapping
├── automation-service/            # Grocery automation service
│   ├── server.js                  # Express server
│   ├── carrefour-automation-playwright.js  # Auchan automation
│   └── cart-manager.js            # Cart management
└── public/                        # Static assets
```

### Data Flow

1. **Photo Upload** → `CameraScreen.tsx`
2. **AI Analysis** → `/api/analyze` → Blackbox AI (Gemini 3 Pro)
3. **Ingredient Extraction** → Normalized ingredient list with categories
4. **Score Calculation** → `scoring.ts` → Vegetal/Health/Carbon scores
5. **Database Storage** → Supabase (posts, ingredients, scores)
6. **Feed Display** → `FeedScreen.tsx` → Social feed with scores
7. **Shopping** → `ShopScreen.tsx` → Open Food Facts → Product recommendations
8. **Ordering** → `/api/order` → Automation service → Playwright → Auchan cart

---

## 📊 Scoring Algorithms

### Vegetal Score (0-100)
Measures how plant-based a meal is:
- **Formula**: `(plantCount × 1.0 + plantProteinCount × 1.2) / (totalCount + animalCount × 0.5) × 100`
- Plant proteins (tofu, lentils) count as 1.2x
- Animal products count as 0.5x
- Higher score = more plant-based

### Health Score (0-100)
Assesses nutritional quality:
- **Base**: 60 points
- **Bonuses**:
  - +15 for vegetables/salad
  - +10 for plant proteins
- **Penalties**:
  - -20 for fried foods
  - -5 per animal product
- Clamped to 0-100 range

### Carbon Score (0-100)
Environmental impact (higher = better, lower footprint):
- **Base**: 80 points
- **Heavy Penalties**:
  - -40 for beef
  - -25 for pork
  - -15 for chicken
  - -10 for fish/dairy
- **Bonuses**:
  - +10 for plant proteins
  - +5 for multiple vegetables

### Product Scoring (for ingredients)
Uses Open Food Facts data:
- **Nutri-Score**: A-E grade (A = best)
- **Eco-Score**: A-E grade (A = best)
- **NOVA Group**: 1-4 (1 = unprocessed, 4 = ultra-processed)
- **Combined Score**: Weighted combination prioritizing health and sustainability

---

## 🔌 API Endpoints

### `/api/analyze` (POST)
Analyzes a meal photo using AI vision.
- **Input**: `{ base64Image: string }`
- **Output**: `{ dishName: string, ingredients: DetectedIngredient[], scores: { vegetal, health, carbon } }`
- **Models**: Tries Gemini 3 Pro → GPT-4o → Gemini 1.5 Pro (fallback chain)

### `/api/analyze-ingredients` (GET)
Extracts ingredients for a post (cached).
- **Query**: `?post_id={id}&force={boolean}`
- **Output**: `{ ingredients: Ingredient[], fromCache: boolean }`

### `/api/posts` (GET/POST)
- **GET**: Fetches feed posts with scores and user data
- **POST**: Creates a new post (upload image, analyze, save to DB)

### `/api/upvote` (POST/GET)
- **POST**: Toggles upvote for a post
- **GET**: Checks upvote status

### `/api/order` (POST)
Triggers grocery automation.
- **Input**: `{ ingredients: string[] }`
- **Output**: `{ success: boolean, message: string }`
- **Backend**: Calls automation service on port 3001

### `/api/stats` (GET)
Returns user statistics (aggregated scores, post count, etc.)

---

## 🤖 AI & Automation Features

### Image Analysis Pipeline

1. **Primary**: Blackbox AI (Gemini 3 Pro)
   - Multi-model fallback chain for reliability
   - JSON-structured output with dish name and ingredients
   - Confidence scores for each ingredient

2. **Fallback**: CLIP (via @xenova/transformers)
   - Zero-shot image classification
   - 30+ ingredient labels
   - Category mapping (plant/plant_protein/animal)

### Grocery Automation

**Service**: `automation-service/server.js` (Express on port 3001)

**Features**:
- Playwright browser automation
- Persistent session management (saves cookies)
- Smart product search on Auchan Drive
- Automatic cart addition
- Error handling and retries
- Visible browser for demo purposes

**Workflow**:
1. User clicks "Order" in `ShopScreen`
2. Frontend calls `/api/order` with ingredient list
3. Next.js API routes to automation service
4. Playwright opens browser, navigates to Auchan
5. Searches for each ingredient
6. Adds products to cart
7. Browser stays open for verification

---

## 🗄️ Database Schema (Supabase)

### Tables

**users**
- `id` (UUID, primary key)
- `user_id` (text, from cookies)
- `user_name` (text, optional)
- `created_at` (timestamp)

**posts**
- `id` (UUID, primary key)
- `user_id` (text, foreign key)
- `image_url` (text, Supabase Storage)
- `dish_name` (text)
- `vegetal_score` (integer, 0-100)
- `health_score` (integer, 0-100)
- `carbon_score` (integer, 0-100)
- `created_at` (timestamp)

**ingredients**
- `id` (UUID, primary key)
- `post_id` (UUID, foreign key)
- `name` (text)
- `category` (text: 'plant' | 'plant_protein' | 'animal')
- `confidence` (float, 0-1)

**upvotes**
- `id` (UUID, primary key)
- `user_id` (text)
- `post_id` (UUID, foreign key)
- `created_at` (timestamp)
- Unique constraint on (user_id, post_id)

**comments**
- `id` (UUID, primary key)
- `post_id` (UUID, foreign key)
- `user_id` (text)
- `content` (text)
- `created_at` (timestamp)

### Storage
- **Bucket**: `meal-images` (public)
- Stores uploaded meal photos

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 20+
- pnpm (or npm)
- Supabase account
- Blackbox AI API key (optional, for full AI features)
- **Portrait Mode**: The app is optimized for portrait orientation on mobile devices. Please ensure your device/browser is in portrait mode for the best experience.

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Blackbox AI (optional but recommended)
BLACKBOX_API_KEY=your_blackbox_api_key
```

### 4. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**⚠️ Important**: The app is designed for **portrait mode** on mobile devices. For desktop testing, use browser developer tools (F12) to simulate a mobile device in portrait orientation, or rotate your device to portrait mode.

### 5. (Optional) Set Up Automation Service

For grocery automation:

```bash
cd automation-service
```

Service runs on port 3001.

**First-time setup**: Save your Auchan session:
```bash
npm run save-session
```

---

## 🎨 Key Components

### `MainApp.tsx`
Main container managing screen navigation and state.

### `FeedScreen.tsx`
Social feed displaying posts with scores, upvotes, and comments.

### `CameraScreen.tsx`
Photo capture/upload and AI analysis trigger.

### `ShopScreen.tsx`
Ingredient shopping interface with:
- Ingredient list with scores
- Alternative suggestions
- One-click ordering
- CO₂ savings display

### `TinderOnboarding.tsx`
Swipe-based onboarding experience.

---

## 🔍 Open Food Facts Integration

### Product Search (`offSearch.ts`)

**Features**:
- Ultra-strict relevance matching (product must BE the keyword, not just contain it)
- Keyword variation generation (singular/plural, word splitting)
- Multi-criteria scoring (Nutri-Score, Eco-Score, NOVA)
- Data completeness prioritization
- Fast search (first page only, 40 products max)

**Scoring**:
- Relevance score (0-100): How well product matches keyword
- Data completeness: Has Eco-Score, Nutri-Score, NOVA?
- Combined score: Weighted product score

---

## 🎯 Demo Features for Judges

### ⚠️ Important: Portrait Mode Required
**The app must be viewed in portrait mode** for optimal experience. Please ensure:
- Mobile devices are rotated to portrait orientation
- Desktop browsers use developer tools to simulate mobile portrait view
- Screen width is optimized for vertical scrolling

### What to Showcase

1. **Photo Analysis**
   - Upload a meal photo
   - Show instant AI analysis (dish name, ingredients, scores)
   - Explain the scoring system

2. **Social Feed**
   - Browse community posts
   - Show aggregated scores
   - Demonstrate upvoting and comments

3. **Smart Shopping**
   - Navigate to ShopScreen from a post
   - Show ingredient recommendations with scores
   - Demonstrate alternative suggestions
   - **Killer Feature**: Click "Order" → Browser automation adds to Auchan cart

4. **User Stats**
   - Show profile with aggregated sustainability metrics
   - Display CO₂ savings

### Demo Flow

1. **Onboarding**: Swipe through Tinder-style intro
2. **Post a Meal**: Take/upload photo → AI analysis → Scores appear
3. **Browse Feed**: See community posts with scores
4. **Shop**: Click on a post → View ingredients → Order → Automation runs
5. **Profile**: Check personal sustainability stats

---

## 🏆 Hackathon Highlights

### Innovation Points

1. **Multi-Model AI Fallback**: Ensures reliability even if one model fails
2. **Real-World Integration**: Open Food Facts + Auchan automation
3. **Complete User Journey**: Photo → Analysis → Shopping → Ordering
4. **Social Engagement**: BeReal-style feed with sustainability focus
5. **No Login Required**: Cookie-based identity for frictionless UX

### Technical Achievements

- **Zero-shot image classification** with CLIP fallback
- **Browser automation** with session persistence
- **Real-time scoring** with multiple sustainability metrics
- **Product recommendation engine** with relevance matching
- **PWA-ready** architecture

---

## 📝 Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Optional (for full AI features)
BLACKBOX_API_KEY=xxx
```

---

## 🐛 Troubleshooting

### AI Analysis Not Working
- Check `BLACKBOX_API_KEY` is set
- Verify API quota hasn't been exceeded
- Check browser console for errors

### Automation Not Starting
- Ensure automation service is running on port 3001
- Check if session is saved (`npm run save-session` in automation-service)
- Verify Auchan website is accessible

### Database Errors
- Verify Supabase credentials in `.env.local`
- Check RLS policies allow operations
- Ensure storage bucket `meal-images` exists

---

## 📄 License

MIT

---

## 👥 Team

Built for HackTheFork hackathon.

---

## 🚧 Future Enhancements

- [ ] User authentication (email/social login)
- [ ] Recipe suggestions based on scores
- [ ] Challenge system (weekly sustainability goals)
- [ ] Multi-store support (Carrefour, Leclerc, etc.)
- [ ] Meal planning features
- [ ] Carbon footprint tracking over time
- [ ] Social sharing to external platforms

---

**Built with ❤️ for sustainable eating**
