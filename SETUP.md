# Setup Instructions

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js & pnpm**: Make sure you have Node.js installed and pnpm

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to **Settings** → **API** and copy:
   - Project URL
   - `anon` `public` key

## Step 2: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. This will create all necessary tables and policies

**Note:** The storage policies in the schema file will fail if the bucket doesn't exist yet. You can either:
- Run the storage policies SQL after creating the bucket (Step 3), OR
- Skip the storage policy lines in schema.sql and run `supabase/storage-policies.sql` after Step 3

## Step 3: Set Up Storage

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name it `meal-images`
4. Make it **public** (toggle "Public bucket")
5. Click **Create bucket**

**Important:** After creating the bucket, you need to set up storage policies:

1. Go to **Storage** → **Policies** (or click on the `meal-images` bucket → **Policies** tab)
2. Click **New Policy** for each of these:

   **Policy 1: Public Read**
   - Policy name: `Public Access`
   - Allowed operation: `SELECT`
   - Policy definition: `bucket_id = 'meal-images'`
   - Click **Review** then **Save policy**

   **Policy 2: Public Upload**
   - Policy name: `Public Upload`
   - Allowed operation: `INSERT`
   - Policy definition: `bucket_id = 'meal-images'`
   - Click **Review** then **Save policy**

   **Policy 3: Public Delete (optional)**
   - Policy name: `Public Delete`
   - Allowed operation: `DELETE`
   - Policy definition: `bucket_id = 'meal-images'`
   - Click **Review** then **Save policy`

**Alternative:** You can also run the storage policy SQL from `supabase/schema.sql` in the SQL Editor after creating the bucket.

## Step 4: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Install Dependencies

```bash
pnpm install
```

## Step 6: Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture Overview

### Database Schema

- **users**: Stores anonymous user IDs (from cookies)
- **posts**: Stores meal posts with scores
- **ingredients**: Stores detected ingredients per post
- **upvotes**: Tracks upvotes (one per user per post)

### API Routes

- `POST /api/posts` - Create a new post (uploads image, analyzes, saves)
- `GET /api/posts` - Fetch feed posts
- `POST /api/upvote` - Toggle upvote on a post
- `GET /api/upvote` - Check if user upvoted a post
- `GET /api/stats` - Get user statistics

### Image Analysis

Uses CLIP (via @xenova/transformers) for zero-shot ingredient detection:
- Detects ingredients from image
- Classifies into: plant, plant_protein, animal
- Calculates scores based on detected ingredients

### Scoring System

- **Vegetal Score (0-100)**: Proportion of plant-based ingredients
- **Health Score (0-100)**: Simple heuristic based on ingredients
- **Carbon Score (0-100)**: Relative footprint (higher = better)

## Notes

- No authentication system - users identified by cookie-based UUID
- All RLS policies allow all operations (demo mode)
- Images stored in Supabase Storage bucket `meal-images`
- CLIP model loads from CDN (no local model files needed)

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has correct values
- Restart dev server after adding env vars

### "Storage bucket not found"
- Create the `meal-images` bucket in Supabase Storage
- Make sure it's public or has proper policies

### "Image analysis fails"
- CLIP model downloads from CDN on first use (may take time)
- Check browser console for errors
- Falls back to mock data if analysis fails
