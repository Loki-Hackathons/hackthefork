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

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, created_at, avatar_image_url, avatar')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }

    return NextResponse.json({ user: user || { id: userId, name: null, created_at: null } });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/user - Update user info (e.g., name, avatar)
export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.formData();
    const user_id = formData.get('user_id') as string;
    const name = formData.get('name') as string | null;
    const avatar = formData.get('avatar') as string | null;
    const avatar_image = formData.get('avatar_image') as File | null;
    const avatar_image_base64 = formData.get('avatar_image_base64') as string | null;

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

    let avatar_image_url: string | null = null;

    // Handle avatar image upload (either File or base64)
    if (avatar_image) {
      // Upload File to Supabase Storage
      const arrayBuffer = await avatar_image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = avatar_image.name.split('.').pop() || 'jpg';
      const fileName = `avatars/${user_id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-images') // Reuse meal-images bucket, or create 'avatars' bucket
        .upload(fileName, buffer, {
          contentType: avatar_image.type,
          upsert: true // Allow overwriting existing avatar
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      const uploadedPath = uploadData?.path || fileName;
      const urlResponse = supabase.storage
        .from('meal-images')
        .getPublicUrl(uploadedPath);
      
      avatar_image_url = urlResponse.data.publicUrl;
    } else if (avatar_image_base64) {
      // Handle base64 image upload
      // Convert base64 to buffer
      const base64Data = avatar_image_base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Determine file extension from base64 data URL
      const mimeMatch = avatar_image_base64.match(/^data:image\/(\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'jpg';
      const fileExt = mimeType === 'jpeg' ? 'jpg' : mimeType;
      const fileName = `avatars/${user_id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(fileName, buffer, {
          contentType: `image/${mimeType}`,
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      const uploadedPath = uploadData?.path || fileName;
      const urlResponse = supabase.storage
        .from('meal-images')
        .getPublicUrl(uploadedPath);
      
      avatar_image_url = urlResponse.data.publicUrl;
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== null) updateData.name = name || null;
    if (avatar !== null) updateData.avatar = avatar || null;
    if (avatar_image_url !== null) {
      updateData.avatar_image_url = avatar_image_url;
      // Clear emoji avatar when image is uploaded
      if (avatar_image_url) updateData.avatar = null;
    } else if (avatar_image_base64 === null && avatar_image === null && avatar !== null) {
      // If setting emoji avatar, clear image URL
      updateData.avatar_image_url = null;
    }

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      // If user doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({ 
            id: user_id, 
            name: name || null,
            avatar: avatar || null,
            avatar_image_url: avatar_image_url || null
          })
          .select()
          .single();

        if (createError) throw createError;
        return NextResponse.json({ user: newUser });
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
