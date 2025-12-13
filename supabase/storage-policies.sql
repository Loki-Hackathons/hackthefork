-- Storage policies for meal-images bucket
-- Run this AFTER creating the 'meal-images' bucket in Supabase Storage UI
-- Make sure the bucket is set to "Public bucket" in the UI

-- Drop existing policies if they exist (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- IMPORTANT: Allow public read access (SELECT) - this is needed to access URLs
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'meal-images');

-- Allow public insert (upload)
CREATE POLICY "Public Upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'meal-images');

-- Allow public delete (optional, for cleanup)
CREATE POLICY "Public Delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'meal-images');

-- Verify the policies were created
-- You can check in Supabase Dashboard → Storage → Policies
-- Make sure "Public Access" policy exists and is ENABLED
