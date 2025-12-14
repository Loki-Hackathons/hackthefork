-- Script to delete all entries from the database
-- WARNING: This will permanently delete all data from all tables!
-- Run this script in Supabase SQL Editor

-- Delete in order to respect foreign key constraints
-- Start with tables that have foreign keys pointing to them

-- Delete comments (references posts)
DELETE FROM comments;

-- Delete upvotes (references posts)
DELETE FROM upvotes;

-- Delete ingredients (references posts)
DELETE FROM ingredients;

-- Delete posts (references users)
DELETE FROM posts;

-- Delete users (no foreign key dependencies)
DELETE FROM users;

-- Optional: Reset sequences if you want to start IDs from 1 again
-- Note: UUIDs don't use sequences, but if you have any sequences, reset them here
-- ALTER SEQUENCE IF EXISTS your_sequence_name RESTART WITH 1;

-- Verify deletion (optional - uncomment to check)
-- SELECT 
--   (SELECT COUNT(*) FROM users) as users_count,
--   (SELECT COUNT(*) FROM posts) as posts_count,
--   (SELECT COUNT(*) FROM ingredients) as ingredients_count,
--   (SELECT COUNT(*) FROM upvotes) as upvotes_count,
--   (SELECT COUNT(*) FROM comments) as comments_count;
