import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { DetectedIngredient } from '@/lib/image-analysis';

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

        // Get user name for this post
        let userName: string | null = null;
        try {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('name')
            .eq('id', post.user_id)
            .single();
          
          if (userError) {
            // If column doesn't exist (42703) or user not found (PGRST116), that's okay
            if (userError.code !== '42703' && userError.code !== 'PGRST116') {
              console.warn(`Error fetching user name for ${post.user_id}:`, userError);
            }
          } else if (user?.name) {
            userName = user.name;
          }
        } catch (userError: any) {
          // Column might not exist, that's okay
          if (userError.code !== '42703' && userError.code !== 'PGRST116') {
            console.warn('Error fetching user name:', userError);
          }
        }

        return {
          ...post,
          upvote_count: count || 0,
          comment_count: commentCount || 0,
          ingredients: ingredients || [],
          user_name: userName || undefined
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
// NOTE: Ingredients and scores should be pre-analyzed via /api/analyze
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const userId = formData.get('user_id') as string;
    const rating = formData.get('rating') ? parseInt(formData.get('rating') as string) : null;
    const commentRaw = formData.get('comment') as string | null;
    
    // Get pre-analyzed ingredients and scores from form data
    const ingredientsJson = formData.get('ingredients') as string | null;
    const vegetalScore = formData.get('vegetal_score') ? parseInt(formData.get('vegetal_score') as string) : null;
    const healthScore = formData.get('health_score') ? parseInt(formData.get('health_score') as string) : null;
    const carbonScore = formData.get('carbon_score') ? parseInt(formData.get('carbon_score') as string) : null;
    
    // Validate rating if provided
    if (rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Validate and trim comment if provided
    let comment: string | null = null;
    if (commentRaw) {
      const trimmedComment = commentRaw.trim();
      if (trimmedComment.length > 200) {
        return NextResponse.json(
          { error: 'Comment must be 200 characters or less' },
          { status: 400 }
        );
      }
      comment = trimmedComment.length > 0 ? trimmedComment : null;
    }

    if (!imageFile || !userId) {
      return NextResponse.json(
        { error: 'Missing image or user_id' },
        { status: 400 }
      );
    }

    // Validate that ingredients and scores are provided (from /api/analyze)
    if (!ingredientsJson || vegetalScore === null || healthScore === null || carbonScore === null) {
      return NextResponse.json(
        { error: 'Missing ingredients or scores. Please analyze the image first via /api/analyze' },
        { status: 400 }
      );
    }

    let detectedIngredients: DetectedIngredient[];
    try {
      detectedIngredients = JSON.parse(ingredientsJson);
      if (!Array.isArray(detectedIngredients)) {
        throw new Error('Ingredients must be an array');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid ingredients format' },
        { status: 400 }
      );
    }

    // Validate scores
    if (vegetalScore < 0 || vegetalScore > 100 || 
        healthScore < 0 || healthScore > 100 || 
        carbonScore < 0 || carbonScore > 100) {
      return NextResponse.json(
        { error: 'Scores must be between 0 and 100' },
        { status: 400 }
      );
    }

    const scores = {
      vegetal: vegetalScore,
      health: healthScore,
      carbon: carbonScore
    };

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
