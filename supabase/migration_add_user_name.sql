-- Migration: Add name column to users table if it doesn't exist
-- Run this in your Supabase SQL editor

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE users ADD COLUMN name TEXT;
    END IF;
END $$;
