-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  vegetal_score INTEGER NOT NULL CHECK (vegetal_score >= 0 AND vegetal_score <= 100),
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  carbon_score INTEGER NOT NULL CHECK (carbon_score >= 0 AND carbon_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  category TEXT NOT NULL CHECK (category IN ('plant', 'plant_protein', 'animal'))
);

-- Upvotes table
CREATE TABLE IF NOT EXISTS upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingredients_post_id ON ingredients(post_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_post_id ON upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_user_id ON upvotes(user_id);

-- Enable Row Level Security (RLS) - but allow all operations for demo
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for demo (no auth)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on posts" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on upvotes" ON upvotes FOR ALL USING (true) WITH CHECK (true);

-- Storage policies for meal-images bucket
-- Note: These need to be run after creating the bucket in Supabase Storage UI
-- First, create the bucket named 'meal-images' and make it public, then run:
-- See supabase/storage-policies.sql for the complete script with DROP statements
