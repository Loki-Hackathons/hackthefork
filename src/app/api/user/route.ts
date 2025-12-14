import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/user - Get user info
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user_id parameter' },
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

    // Try to select name, but handle gracefully if column doesn't exist
    const { data: user, error } = await supabase
      .from('users')
      .select('id, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      // If column doesn't exist, return user without name
      if (error.code === '42703') {
        console.warn('users.name column does not exist, returning user without name');
        return NextResponse.json({ user: { id: userId, name: null, created_at: null } });
      }
      console.error('Error fetching user:', error);
      throw error;
    }

    // Try to get name separately if column exists
    let userName = null;
    try {
      const { data: userWithName } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .single();
      userName = userWithName?.name || null;
    } catch (nameError: any) {
      // Column doesn't exist, that's okay
      if (nameError.code !== '42703') {
        console.warn('Could not fetch user name:', nameError);
      }
    }

    return NextResponse.json({ 
      user: user ? { ...user, name: userName } : { id: userId, name: null, created_at: null } 
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/user - Update user info (e.g., name)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, name } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id' },
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

    // Update user name (handle gracefully if column doesn't exist)
    const { data: user, error } = await supabase
      .from('users')
      .update({ name: name || null })
      .eq('id', user_id)
      .select('id, created_at')
      .single();

    if (error) {
      // If column doesn't exist, just update/create user without name
      if (error.code === '42703') {
        console.warn('users.name column does not exist, creating/updating user without name');
        // Try to upsert user without name
        const { data: newUser, error: upsertError } = await supabase
          .from('users')
          .upsert({ id: user_id, created_at: new Date().toISOString() }, { onConflict: 'id' })
          .select('id, created_at')
          .single();
        
        if (upsertError) throw upsertError;
        return NextResponse.json({ user: { ...newUser, name: null } });
      }
      
      // If user doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({ id: user_id })
          .select('id, created_at')
          .single();

        if (createError) throw createError;
        return NextResponse.json({ user: { ...newUser, name: null } });
      }
      throw error;
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
