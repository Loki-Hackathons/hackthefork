-- Migration: Add user preferences columns
-- Run this in your Supabase SQL editor

-- Add dietary preference (0 = vegan, 100 = carnivore)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'dietary_preference'
    ) THEN
        ALTER TABLE users ADD COLUMN dietary_preference INTEGER DEFAULT 50 CHECK (dietary_preference >= 0 AND dietary_preference <= 100);
    END IF;
END $$;

-- Add weight in kg
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'weight_kg'
    ) THEN
        ALTER TABLE users ADD COLUMN weight_kg NUMERIC(5, 2) CHECK (weight_kg > 0 AND weight_kg <= 500);
    END IF;
END $$;

-- Add physical activity frequency
-- 0 = sedentary, 1 = light (1-3 days/week), 2 = moderate (3-5 days/week), 3 = active (6-7 days/week), 4 = very active (2x per day)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'activity_level'
    ) THEN
        ALTER TABLE users ADD COLUMN activity_level INTEGER DEFAULT 2 CHECK (activity_level >= 0 AND activity_level <= 4);
    END IF;
END $$;
