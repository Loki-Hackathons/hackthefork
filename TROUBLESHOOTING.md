# Troubleshooting Guide

## Storage "Bucket not found" Error

If you're getting a "Bucket not found" error when accessing image URLs, even though uploads work:

### Symptoms
- ✅ Image uploads succeed (no error during POST /api/posts)
- ❌ Accessing the image URL returns: `{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}`

### Root Cause
The bucket exists and INSERT policy works, but the SELECT (read) policy is missing or the bucket isn't public.

### Solution

1. **Verify bucket is public:**
   - Go to Supabase Dashboard → Storage
   - Click on `meal-images` bucket
   - Check that "Public bucket" toggle is ON
   - If not, toggle it ON and save

2. **Check storage policies:**
   - In the `meal-images` bucket, go to "Policies" tab
   - Look for a policy named "Public Access" with operation `SELECT`
   - If missing, create it:
     - Click "New Policy"
     - Name: `Public Access`
     - Allowed operation: `SELECT`
     - Policy definition: `bucket_id = 'meal-images'`
     - Save

3. **Verify policy is enabled:**
   - Make sure the "Public Access" policy has a green checkmark (enabled)
   - If it's disabled, click to enable it

4. **Run the storage policies SQL:**
   - Go to SQL Editor
   - Run `supabase/storage-policies.sql`
   - This will create/update all necessary policies

### Quick Test

After fixing, test by:
1. Upload a new image
2. Copy the `image_url` from the database
3. Open it in a browser - it should display the image

### Alternative: Check Bucket Name

If the error persists, verify the bucket name matches exactly:
- In Supabase Dashboard → Storage, check the exact bucket name
- It should be `meal-images` (lowercase, with hyphen)
- If it's different, either:
  - Rename the bucket to `meal-images`, OR
  - Update the code in `src/app/api/posts/route.ts` to use your bucket name

## Other Common Issues

### "Missing Supabase environment variables"
- Create `.env.local` file in project root
- Add: `NEXT_PUBLIC_SUPABASE_URL=...` and `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- Restart dev server

### "Storage upload error: new row violates row-level security policy"
- Run `supabase/storage-policies.sql` in SQL Editor
- Make sure bucket is set to "Public bucket"

### Images upload but URLs return 404
- Check bucket is public (see above)
- Verify SELECT policy exists and is enabled
- Check bucket name matches exactly
