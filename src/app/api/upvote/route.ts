import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/upvote - Toggle upvote on a post
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Return false (not upvoted) to prevent errors
      return NextResponse.json({ upvoted: false });
    }

    const { post_id, user_id } = await request.json();

    if (!post_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing post_id or user_id' },
        { status: 400 }
      );
    }

    // Check if upvote exists
    const { data: existing } = await supabase
      .from('upvotes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      // Remove upvote
      const { error } = await supabase
        .from('upvotes')
        .delete()
        .eq('post_id', post_id)
        .eq('user_id', user_id);

      if (error) throw error;

      return NextResponse.json({ upvoted: false });
    } else {
      // Add upvote
      const { error } = await supabase
        .from('upvotes')
        .insert({
          post_id,
          user_id
        });

      if (error) throw error;

      return NextResponse.json({ upvoted: true });
    }
  } catch (error: any) {
    console.error('Error toggling upvote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle upvote' },
      { status: 500 }
    );
  }
}

// GET /api/upvote?post_id=...&user_id=... - Check if user upvoted
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Return false (not upvoted) to prevent errors
      return NextResponse.json({ upvoted: false });
    }

    const searchParams = request.nextUrl.searchParams;
    const post_id = searchParams.get('post_id');
    const user_id = searchParams.get('user_id');

    if (!post_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing post_id or user_id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('upvotes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    return NextResponse.json({ upvoted: !!data });
  } catch (error: any) {
    console.error('Error checking upvote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check upvote' },
      { status: 500 }
    );
  }
}
