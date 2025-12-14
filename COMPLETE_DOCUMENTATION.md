# EatReal - Complete Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Application Architecture](#application-architecture)
3. [Main Application (Consumer App)](#main-application-consumer-app)
4. [Industrial Dashboard (B2B)](#industrial-dashboard-b2b)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Scoring System](#scoring-system)
8. [User Flow](#user-flow)
9. [Technical Stack](#technical-stack)

---

## Overview

**EatReal** is a mobile-first web application that makes low-carbon eating visible. The platform consists of two main components:

1. **Consumer Application**: A social media-style app where users can share meal photos, get sustainability scores, and discover plant-based alternatives
2. **Industrial Dashboard**: A B2B analytics platform for food manufacturers to analyze consumer sensory feedback and optimize product formulations

### Key Features
- AI-powered meal analysis with ingredient detection
- Sustainability scoring (vegetal, health, carbon footprint)
- Social feed with likes, comments, and sharing
- Shopping integration with automated cart management
- Sensory feedback parsing using NLP
- Industrial analytics for product reformulation

---

## Application Architecture

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Motion (Framer Motion)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI Services**: Blackbox API (Gemini, Claude)
- **UI Components**: Radix UI

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── industrial/        # Industrial dashboard page
│   ├── page.tsx           # Main entry point
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── MainApp.tsx        # Main app container
│   ├── BottomNav.tsx      # Navigation bar
│   ├── FeedScreen.tsx     # Social feed
│   ├── CameraScreen.tsx   # Photo capture & analysis
│   ├── ShopScreen.tsx     # Shopping interface
│   ├── ProfileScreen.tsx  # User profile
│   ├── ChallengesScreen.tsx # Challenges (integrated in Profile)
│   ├── MessagesScreen.tsx # Messaging
│   ├── SettingsScreen.tsx # Settings
│   ├── SplashScreen.tsx   # Splash screen
│   └── TinderOnboarding.tsx # Onboarding flow
├── lib/                   # Utilities & helpers
│   ├── supabase.ts        # Supabase client
│   ├── scoring.ts         # Score calculation
│   ├── image-analysis.ts  # Image processing
│   └── cookies.ts         # Cookie management
└── services/              # External service integrations
    ├── api.ts             # API client
    ├── sensoryNLP.ts      # NLP parsing
    └── blackboxVision.ts  # Vision AI
```

---

## Main Application (Consumer App)

### Entry Point Flow

1. **Splash Screen** (`SplashScreen.tsx`)
   - Displays for 2 seconds on app launch
   - Shows EatReal logo with animated particles
   - Checks onboarding completion status

2. **Onboarding** (`TinderOnboarding.tsx`)
   - **Note**: Discover feature removed from main navigation, kept only for onboarding
   - Tinder-style swipe interface
   - Users swipe through 5 sample dishes
   - Collects user preferences
   - Name collection at the end
   - Sets onboarding completion cookie

3. **Main App** (`MainApp.tsx`)
   - Container component managing screen state
   - Handles navigation between screens
   - Manages user ID cookie initialization

### Navigation Structure

The app uses a bottom navigation bar (`BottomNav.tsx`) with the following tabs:

1. **Feed** (Home icon)
   - Main social feed screen
   - Instagram-style vertical scrolling

2. **Discover** (Flame icon)
   - **REMOVED from main navigation**
   - Only accessible during onboarding
   - Can be revisited via "swipe" screen type (not in bottom nav)

3. **Camera** (Camera icon)
   - Central, prominent button
   - Photo capture and meal analysis

4. **Challenges** (Trophy icon)
   - **MOVED to Profile tab**
   - No longer in bottom navigation
   - Accessible from Profile screen

5. **Profile** (User icon)
   - User profile and statistics
   - **Now includes Challenges section**

### Screen Details

#### 1. Feed Screen (`FeedScreen.tsx`)

**Purpose**: Social media feed displaying meal posts from all users

**Features**:
- Vertical scrolling with snap points (full-screen posts)
- Post interactions:
  - **Like/Upvote**: Heart button, double-tap to like
  - **Comment**: Opens comments overlay
  - **Share**: Native share API or WhatsApp fallback
  - **Save**: Bookmark posts (local storage)
- Score display: Aggregated eco-score badge (top-right)
- Post details:
  - User avatar and ID
  - Time ago
  - Meal image
  - Recipe button (navigates to Shop screen)
- Comments overlay:
  - Bottom sheet modal
  - Real-time comment loading
  - Add new comments
  - User avatars and timestamps
- Score details modal:
  - Breakdown of vegetal, health, and carbon scores
  - Visual progress bars
  - Category descriptions

**Data Flow**:
- Fetches posts from `/api/posts`
- Checks upvote status per post
- Loads comments on-demand
- Updates UI optimistically

#### 2. Camera Screen (`CameraScreen.tsx`)

**Purpose**: Capture and analyze meal photos

**Flow**:
1. **Camera View**: Viewfinder with capture button
2. **Post Preview**: Shows captured image with analyze button
3. **Analysis**: Calls `/api/analyze` for ingredient detection
4. **Post Analyzed View**: 
   - Displays detected ingredients
   - Shows calculated scores
   - Optional feedback:
     - Star rating (1-5)
     - Text comment
   - Actions:
     - See Recipe (navigates to recipe view - placeholder)
     - Share (creates post)
5. **Recipe View**: Placeholder for future recipe feature

**Analysis Process**:
- Image sent to Blackbox API (Gemini 3 Pro Preview)
- AI extracts:
  - Dish name
  - Ingredients with categories (plant/plant_protein/animal)
  - Confidence scores
- Scores calculated client-side using `calculateScores()`
- Post created via `/api/posts` with image upload to Supabase Storage

#### 3. Shop Screen (`ShopScreen.tsx`)

**Purpose**: Shopping interface for detected ingredients

**Features**:
- Displays ingredients detected from a post
- Ingredient list with:
  - Checkboxes for selection
  - Price (mock data)
  - Eco-score badge
  - Alternative suggestions (if available)
- Bottom bar showing:
  - Average score
  - CO₂ saved estimate
  - Total price
  - Order button (Auchan Drive automation)
- Order automation:
  - Calls `/api/order` with selected ingredients
  - Triggers Playwright automation to add items to cart
  - Shows success/error messages

**Navigation**:
- Accessible from Feed screen (recipe button)
- Can navigate back to Feed

#### 4. Profile Screen (`ProfileScreen.tsx`)

**Purpose**: User profile, statistics, and challenges

**Features**:
- **Header Section**:
  - User avatar (emoji or uploaded image)
  - User name
  - Settings button
- **Statistics**:
  - Post count
  - Average plant-based score
  - Average carbon score
- **Bio Section**:
  - Average aggregated score
  - Total CO₂ saved
- **Action Buttons**:
  - Messages
  - Share profile
  - Followers (placeholder)
- **Environmental Impact Visualization**:
  - Interactive 3D globe/chart
  - Shows health, carbon, plant-based, and average scores
  - Draggable/rotatable
- **Statistics Summary**:
  - Detailed breakdown of all scores
  - CO₂ savings
- **Challenges Section**:
  - **INTEGRATED INTO PROFILE** (moved from separate tab)
  - Active challenges list
  - Progress tracking
  - Leaderboard
  - Challenge details

**Challenges Feature** (integrated):
- Personal challenges (e.g., "100% Veg Week")
- Group challenges (e.g., "Battle Squad")
- Progress bars
- Rewards (points)
- Leaderboard rankings

#### 5. Messages Screen (`MessagesScreen.tsx`)

**Purpose**: Direct messaging between users

**Features**:
- Conversation list:
  - User avatars
  - Last message preview
  - Timestamp
  - Unread count badges
- Chat interface:
  - Message bubbles (sent/received)
  - Timestamps
  - Input field with send button
  - Auto-scroll to latest message
- **Note**: Currently uses mock data (no real backend)

#### 6. Settings Screen (`SettingsScreen.tsx`)

**Purpose**: User profile customization

**Features**:
- **Avatar Management**:
  - Upload photo (max 5MB)
  - Choose emoji avatar
  - Preview
  - Remove image option
- **Name Editing**:
  - Text input
  - Saved to cookie and database
- **Save Button**:
  - Updates local cookie
  - Syncs to database via `/api/user`
  - Shows success feedback

### Navigation Behavior

- Bottom navigation hidden on:
  - Shop screen
  - Messages screen
- Screen transitions handled by `MainApp.tsx`
- State management via React hooks
- URL-based routing for industrial dashboard only

---

## Industrial Dashboard (B2B)

### Access
- **Route**: `/industrial`
- **Note**: NOT accessible from main app navigation
- Separate page for B2B users

### Purpose
Scientific analytics platform for food manufacturers to:
- Analyze consumer sensory feedback
- Identify product barriers and drivers
- Optimize formulations based on real data
- Export reports

### Scientific Framework
- **Expectation-Disconfirmation Theory** (Oliver, 1980)
- **Food Essentialism & Law of Similarity** (Rozin et al., 2004)
- **CATA (Check-All-That-Apply) Sensory Profiling** (Ares et al., 2014)

### Dashboard Sections

#### 1. KPI Cards
- **Sample Size (N)**: Total consumer evaluations
- **Mean Hedonic Score**: Average rating (1-5 scale)
- **Parsed Comments**: NLP-extracted sensory tags
- **Active Formulations**: Unique SKUs analyzed

#### 2. Analytics Tabs

##### Tab 1: Disconfirmation Heatmap
- **Visualization**: Scatter plot
  - X-axis: Visual Appeal (swipe rate %)
  - Y-axis: Sensory Satisfaction (rating 1-5)
- **Quadrants**:
  - **Success Zone** (top-right): High visual, high sensory
  - **Deception Zone** (bottom-right): High visual, low sensory
  - **Hidden Gems** (top-left): Low visual, high sensory
- **Cohort Analysis**:
  - Deception Zone count
  - Safe Zone count
  - Hidden Gems count
- **Data Source**: Mock data (requires swipe tracking)

##### Tab 2: Ingredient Correlator
- **Barrier Tags** (Defects):
  - Negative sensory attributes
  - Examples: beany, dry, bitter, granular
  - Count and average rating
- **Driver Tags** (Assets):
  - Positive sensory attributes
  - Examples: juicy, meaty, tender, crispy
  - Count and average rating
- **Formulation Insights**:
  - Correlations between ingredients and tags
  - Example: "Bitter" tag correlates with "Pea Protein > 65%"
- **Data Source**: Real NLP-parsed comments (with mock fallback)

##### Tab 3: Substitution Analysis
- **A/B Testing Visualization**:
  - Control vs. Test formulations
  - Sample size
  - Conversion rate
  - Mean rating
  - Dominant sensory tags
- **Success Criteria**: Higher conversion + higher rating
- **Data Source**: Mock data (requires recommendation engine tracking)

### Data Transparency
- **Real Data**: Post counts, ratings, NLP-parsed comments
- **Mock Data**: Visual appeal correlation, disconfirmation gap (requires more user interactions)
- Metadata indicates data source for each metric

### Export Functionality
- **PDF Export**: Full dashboard snapshot
- Uses `html2canvas` and `jsPDF`
- Includes all tabs and KPIs

---

## API Endpoints

### Consumer App APIs

#### `/api/analyze` (POST)
**Purpose**: Analyze meal image and extract ingredients

**Request**:
```json
{
  "base64Image": "data:image/jpeg;base64,..."
}
```

**Response**:
```json
{
  "dishName": "chicken curry",
  "ingredients": [
    {
      "name": "chicken",
      "confidence": 0.9,
      "category": "animal"
    }
  ],
  "scores": {
    "vegetal": 40,
    "health": 70,
    "carbon": 60
  }
}
```

**Implementation**:
- Uses Blackbox API (Gemini 3 Pro Preview)
- Falls back to other models if primary fails
- Extracts dish name, ingredients, and calculates scores

#### `/api/posts` (GET, POST)
**GET**: Fetch all posts
- Returns posts with upvote counts, comment counts
- Ordered by creation date (newest first)

**POST**: Create new post
- Multipart form data with image file
- Requires: `user_id`, `ingredients` (JSON), `scores`
- Optional: `rating`, `comment`
- Uploads image to Supabase Storage
- Returns created post

#### `/api/comments` (GET, POST)
**GET**: Fetch comments for a post
- Query param: `post_id`
- Returns array of comments with user info

**POST**: Create comment
- Body: `post_id`, `user_id`, `text`
- Returns created comment

#### `/api/upvote` (GET, POST)
**GET**: Check upvote status
- Query params: `post_id`, `user_id`
- Returns: `{ upvoted: boolean }`

**POST**: Toggle upvote
- Body: `post_id`, `user_id`
- Returns: `{ upvoted: boolean }`

#### `/api/stats` (GET)
**Purpose**: Get user statistics

**Query Params**: `user_id`

**Response**:
```json
{
  "post_count": 10,
  "avg_vegetal_score": 75,
  "avg_health_score": 80,
  "avg_carbon_score": 85,
  "total_co2_avoided": 12.5
}
```

#### `/api/user` (GET, PATCH)
**GET**: Fetch user data
- Query param: `user_id`
- Returns user name, avatar, avatar_image_url

**PATCH**: Update user
- Form data: `user_id`, `name`, `avatar` (emoji), `avatar_image_base64`
- Updates database and storage

#### `/api/order` (POST)
**Purpose**: Trigger shopping automation

**Request**:
```json
{
  "ingredients": ["chicken", "rice", "broccoli"]
}
```

**Response**:
```json
{
  "message": "Automation started",
  "status": "success"
}
```

**Implementation**:
- Triggers Playwright automation
- Adds items to Auchan Drive cart
- Requires saved browser session

#### `/api/analyze-ingredients` (GET)
**Purpose**: Get detailed ingredient analysis for a post

**Query Params**: `post_id`, `force` (optional)

**Response**:
```json
{
  "ingredients": [...],
  "fromCache": true
}
```

### Industrial Dashboard APIs

#### `/api/industrial/analytics` (GET)
**Purpose**: Aggregate analytics data for dashboard

**Response**:
```json
{
  "totalPosts": 50,
  "totalRatings": 45,
  "avgRating": 3.8,
  "commentsWithTags": 30,
  "topBarriers": [
    { "tag": "dry", "count": 12, "avgRating": 2.3 }
  ],
  "topDrivers": [
    { "tag": "juicy", "count": 15, "avgRating": 4.6 }
  ],
  "disconfirmationGap": [],
  "_meta": {
    "dataTransparency": {
      "realData": [...],
      "mockData": [...]
    }
  }
}
```

**Implementation**:
- Fetches all posts with ratings and comments
- Parses comments using `/api/sensory-parse`
- Aggregates sensory tags
- Separates barriers vs. drivers
- Uses mock data if insufficient real data

#### `/api/sensory-parse` (POST)
**Purpose**: Parse consumer comments into structured sensory tags

**Request**:
```json
{
  "comment": "The burger looked great but it was dry and tasted like cardboard."
}
```

**Response**:
```json
{
  "texture": "dry",
  "flavour": "cardboard",
  "visual_expectation": "high",
  "disconfirmation": "negative",
  "tags": [
    {
      "tag": "dry",
      "category": "texture",
      "valence": "negative",
      "confidence": 0.95
    }
  ]
}
```

**Implementation**:
- Uses Blackbox API (Claude 3.5 Haiku)
- CATA method taxonomy
- Extracts barrier tags, driver tags, texture, flavour
- Detects visual expectations and disconfirmation patterns

---

## Data Models

### Post
```typescript
{
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  vegetal_score: number;      // 0-100
  health_score: number;        // 0-100
  carbon_score: number;        // 0-100
  rating?: number;             // 1-5 (optional)
  comment?: string;            // Optional feedback
  upvote_count?: number;
  comment_count?: number;
  is_upvoted?: boolean;        // For current user
  ingredients?: Array<{
    id: string;
    name: string;
    confidence: number;
    category: 'plant' | 'plant_protein' | 'animal';
  }>;
}
```

### Comment
```typescript
{
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
}
```

### User
```typescript
{
  id: string;
  name?: string;
  avatar?: string;              // Emoji
  avatar_image_url?: string;   // Image URL
  created_at: string;
}
```

### UserStats
```typescript
{
  post_count: number;
  avg_vegetal_score: number;
  avg_health_score: number;
  avg_carbon_score: number;
  total_co2_avoided: number;    // kg
}
```

### SensoryTag
```typescript
{
  tag: string;                  // e.g., "juicy", "dry"
  category: 'barrier' | 'driver' | 'texture' | 'flavour' | 'visual' | 'other';
  valence: 'positive' | 'negative' | 'neutral';
  confidence: number;            // 0.0-1.0
}
```

---

## Scoring System

### Score Components

#### 1. Vegetal Score (0-100)
**Purpose**: Measures how plant-based the dish is

**Calculation**:
- Counts plant vs. animal ingredients
- Weighted formula: `(plantCount * 1.0 + plantProteinCount * 1.2) / (totalCount + animalCount * 0.5)`
- Higher score = more plant-based

**Categories**:
- `plant`: Vegetables, grains, fruits
- `plant_protein`: Tofu, lentils, beans, chickpeas
- `animal`: Meat, dairy, eggs

#### 2. Health Score (0-100)
**Purpose**: Nutritional quality assessment

**Calculation**:
- Base score: 60
- **Positive factors**:
  - Plant ingredients: +15
  - Plant proteins: +10
  - Vegetables/salad: +10
- **Negative factors**:
  - Fried foods: -20
  - Animal products: -5 per item
- Clamped to 0-100

#### 3. Carbon Score (0-100)
**Purpose**: Environmental impact (higher = lower footprint)

**Calculation**:
- Base score: 80
- **Penalties**:
  - Beef: -40
  - Pork: -25
  - Chicken: -15
  - Fish: -10
  - Dairy: -10
- **Bonuses**:
  - Plant proteins: +10
  - Multiple plants: +5
- Clamped to 0-100

### Aggregated Score

**Formula** (weighted with synergy):
```typescript
vegetalBase = vegetal * 0.5
healthContribution = health * 0.25
carbonContribution = carbon * 0.25
synergyFactor = 1 + (vegetal / 100) * 0.15
finalScore = (vegetalBase + healthContribution + carbonContribution) * synergyFactor
```

**Interpretation**:
- Vegetal is the foundation (50% weight)
- Health and carbon contribute equally (25% each)
- Synergy bonus rewards plant-based dishes that are also healthy and sustainable
- Final score: 0-100

---

## User Flow

### First-Time User
1. **Splash Screen** → 2 seconds
2. **Onboarding**:
   - Swipe through 5 dishes (Tinder-style)
   - Enter name
   - Onboarding marked complete
3. **Feed Screen** → See empty feed or existing posts
4. **Create First Post**:
   - Tap Camera button
   - Capture/select photo
   - Analyze (AI extracts ingredients)
   - Add optional rating/comment
   - Share to feed

### Returning User
1. **Splash Screen** → Brief logo display
2. **Feed Screen** → Main content
3. **Navigation**:
   - Feed: Browse posts
   - Camera: Create new post
   - Profile: View stats, challenges, settings
   - Messages: Direct messages (mock)

### Post Creation Flow
1. **Camera Screen** → Capture photo
2. **Preview** → Confirm and analyze
3. **Analysis** → AI processing (5-10 seconds)
4. **Results**:
   - Ingredients displayed
   - Scores calculated
   - Optional feedback
5. **Share** → Post created, navigate to Feed

### Shopping Flow
1. **Feed Screen** → Tap "recipe" button on post
2. **Shop Screen** → Ingredients loaded
3. **Select Items** → Check/uncheck ingredients
4. **Order** → Automation adds to cart
5. **Confirmation** → Success message

### Profile & Challenges
1. **Profile Tab** → View stats
2. **Scroll Down** → See Challenges section
3. **Challenge Details** → Progress, rewards, leaderboard
4. **Settings** → Edit name, avatar

---

## Technical Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Motion (Framer Motion)**: Animations
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icons

### Backend
- **Next.js API Routes**: Serverless functions
- **Supabase**: 
  - PostgreSQL database
  - Storage for images
  - Real-time subscriptions (future)
- **Blackbox API**: 
  - Gemini 3 Pro Preview (vision)
  - Claude 3.5 Haiku (NLP)

### Automation
- **Playwright**: Browser automation for shopping
- **Node.js scripts**: Cart management

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Git**: Version control

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BLACKBOX_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

---

## Key Design Decisions

### Navigation Changes
- **Discover removed**: No longer in bottom nav, only during onboarding
- **Challenges moved**: Integrated into Profile screen
- **Camera prominent**: Central, large button in nav

### Data Handling
- **Client-side scoring**: Scores calculated in browser for speed
- **Optimistic updates**: UI updates before API confirmation
- **Cookie-based user ID**: No authentication required (MVP)
- **Image storage**: Supabase Storage with public URLs

### AI Integration
- **Model fallback**: Tries multiple models if primary fails
- **Caching**: Ingredient analysis can be cached
- **Error handling**: Graceful degradation on API failures

### Industrial Dashboard
- **Separate route**: Not accessible from main app
- **Data transparency**: Clear indication of real vs. mock data
- **Scientific rigor**: Based on peer-reviewed frameworks

---

## Future Enhancements

### Planned Features
- Real-time messaging backend
- Recipe generation AI
- Social features (follow, feed algorithm)
- Push notifications
- Offline support (PWA)
- More shopping integrations
- Advanced analytics for industrial dashboard

### Technical Improvements
- Authentication system (Supabase Auth)
- Real-time subscriptions
- Image optimization
- Better error boundaries
- Performance monitoring
- A/B testing framework

---

## Conclusion

EatReal is a comprehensive platform combining consumer engagement with industrial analytics. The application successfully bridges the gap between end-users seeking sustainable food options and manufacturers needing consumer insights for product optimization.

The architecture is modular, scalable, and designed for future enhancements while maintaining a clean, intuitive user experience.

