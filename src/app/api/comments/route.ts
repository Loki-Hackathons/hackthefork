import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/comments - Get comments for a post
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('post_id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Missing post_id parameter' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Fetch comments
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    // Fetch user names for all unique user_ids in comments
    const userIds = [...new Set((comments || []).map((c: any) => c.user_id))];
    const userNamesMap: Record<string, { name: string | null; avatar_image_url: string | null; avatar: string | null }> = {};
    
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, avatar_image_url, avatar')
        .in('id', userIds);
      
      if (!usersError && users) {
        users.forEach((user: any) => {
          userNamesMap[user.id] = {
            name: user.name,
            avatar_image_url: user.avatar_image_url,
            avatar: user.avatar
          };
        });
      }
    }

    // Attach user data to comments
    const commentsWithUsers = (comments || []).map((comment: any) => ({
      ...comment,
      users: userNamesMap[comment.user_id] || null
    }));

    return NextResponse.json({ comments: commentsWithUsers || [] });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_id, user_id, text } = body;

    if (!post_id || !user_id || !text || !text.trim()) {
      return NextResponse.json(
        { error: 'Missing post_id, user_id, or text' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Ensure user exists
    const { error: userError } = await supabase
      .from('users')
      .upsert({ id: user_id, created_at: new Date().toISOString() }, { onConflict: 'id' });

    if (userError) {
      console.error('Error ensuring user exists:', userError);
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        user_id,
        text: text.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      throw error;
    }

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}
