-- Migration: Add rating and comment columns to posts table
-- Run this script in Supabase SQL Editor if the columns don't exist yet

-- Add rating column (1-5 stars, nullable)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Add comment column (text, nullable, max 200 characters)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS comment TEXT;

-- Add check constraint for comment length if needed
-- Note: PostgreSQL doesn't support CHECK constraints with LENGTH() directly in ALTER TABLE
-- We'll rely on application-level validation for the 200 character limit
