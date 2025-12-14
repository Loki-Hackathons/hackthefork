import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateScores } from '@/lib/scoring';
import type { DetectedIngredient } from '@/lib/image-analysis';

// Lazy import for image analysis to avoid loading sharp on GET requests
async function getImageAnalysis() {
  return await import('@/lib/image-analysis');
}

// GET /api/posts - Fetch feed posts
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Return empty array instead of error to prevent Feed from crashing
      console.warn('Supabase not configured. Returning empty posts array.');
      return NextResponse.json({ posts: [] });
    }

    // First, get all posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    // Get upvote counts for all posts
    const postsWithUpvotes = await Promise.all(
      posts.map(async (post) => {
        const { count, error: countError } = await supabase
          .from('upvotes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        if (countError) {
          console.error('Error counting upvotes:', countError);
        }

        // Get ingredients for this post
        const { data: ingredients, error: ingredientsError } = await supabase
          .from('ingredients')
          .select('*')
          .eq('post_id', post.id);

        if (ingredientsError) {
          console.error('Error fetching ingredients:', ingredientsError);
        }

        // Get comment count for this post
        const { count: commentCount, error: commentCountError } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        if (commentCountError) {
          console.error('Error counting comments:', commentCountError);
        }

        return {
          ...post,
          upvote_count: count || 0,
          comment_count: commentCount || 0,
          ingredients: ingredients || []
        };
      })
    );

    return NextResponse.json({ posts: postsWithUpvotes });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const userId = formData.get('user_id') as string;
    const rating = formData.get('rating') ? parseInt(formData.get('rating') as string) : null;
    const comment = formData.get('comment') as string | null;

    if (!imageFile || !userId) {
      return NextResponse.json(
        { error: 'Missing image or user_id' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Analyze image (CLIP-based detection)
    // Lazy load image analysis module only when needed
    let detectedIngredients: DetectedIngredient[];
    try {
      const imageAnalysis = await getImageAnalysis();
      // Try CLIP analysis, but fallback gracefully if it fails
      detectedIngredients = await imageAnalysis.analyzeImage(buffer);
      // If analysis returns empty or fails, use fallback
      if (!detectedIngredients || detectedIngredients.length === 0) {
        throw new Error('No ingredients detected');
      }
    } catch (error) {
      console.warn('Image analysis not available, using fallback detection:', error);
      // Fallback to basic detection based on common meal patterns
      detectedIngredients = [
        { name: 'vegetables', confidence: 0.7, category: 'plant' as const },
        { name: 'rice', confidence: 0.65, category: 'plant' as const }
      ];
    }
    const scores = calculateScores(detectedIngredients);

    // Upload image to Supabase Storage
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('meal-images')
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      // Provide helpful error message
      const errorMessage = uploadError.message || String(uploadError);
      if (errorMessage.includes('Bucket not found') || errorMessage.includes('404') || errorMessage.includes('bucket')) {
        throw new Error('Storage bucket "meal-images" not found. Please create it in Supabase Storage and set up policies (see SETUP.md)');
      }
      throw uploadError;
    }

    // Use the path from upload response, or fallback to fileName
    const uploadedPath = uploadData?.path || fileName;
    
    // Get public URL using the actual uploaded path
    // getPublicUrl returns { data: { publicUrl: string } }
    const urlResponse = supabase.storage
      .from('meal-images')
      .getPublicUrl(uploadedPath);
    
    const publicUrl = urlResponse.data.publicUrl;
    
    // Verify URL format
    if (!publicUrl || !publicUrl.includes('/storage/v1/object/public/meal-images/')) {
      console.error('Invalid public URL generated:', publicUrl);
      throw new Error('Failed to generate valid public URL for uploaded image');
    }
    
    // Log for debugging
    console.log('Uploaded file path:', uploadedPath);
    console.log('Generated public URL:', publicUrl);

    // Ensure user exists (name will be updated separately via settings API)
    const { error: userError } = await supabase
      .from('users')
      .upsert({ id: userId, created_at: new Date().toISOString() }, { onConflict: 'id' });

    if (userError) throw userError;

    // Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        image_url: publicUrl,
        vegetal_score: scores.vegetal,
        health_score: scores.health,
        carbon_score: scores.carbon,
        rating: rating,
        comment: comment || null
      })
      .select()
      .single();

    if (postError) throw postError;

    // Insert ingredients
    if (detectedIngredients.length > 0) {
      const ingredientsData = detectedIngredients.map(ing => ({
        post_id: post.id,
        name: ing.name,
        confidence: ing.confidence,
        category: ing.category
      }));

      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(ingredientsData);

      if (ingredientsError) throw ingredientsError;
    }

    return NextResponse.json({
      post: {
        ...post,
        ingredients: detectedIngredients,
        upvote_count: 0
      }
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}
