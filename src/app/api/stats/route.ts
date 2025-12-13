import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/stats?user_id=... - Get user stats
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id' },
        { status: 400 }
      );
    }

    // Get user's posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('vegetal_score, health_score, carbon_score')
      .eq('user_id', user_id);

    if (postsError) throw postsError;

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        post_count: 0,
        avg_vegetal_score: 0,
        avg_health_score: 0,
        avg_carbon_score: 0,
        total_co2_avoided: 0
      });
    }

    // Calculate averages
    const post_count = posts.length;
    const avg_vegetal_score = Math.round(
      posts.reduce((sum, p) => sum + p.vegetal_score, 0) / post_count
    );
    const avg_health_score = Math.round(
      posts.reduce((sum, p) => sum + p.health_score, 0) / post_count
    );
    const avg_carbon_score = Math.round(
      posts.reduce((sum, p) => sum + p.carbon_score, 0) / post_count
    );

    // Calculate CO2 avoided (heuristic: based on carbon score)
    // Higher carbon score = lower footprint = more CO2 avoided
    // Rough estimate: 0.5kg CO2 per meal for high scores
    const total_co2_avoided = Math.round(
      posts.reduce((sum, p) => {
        const co2PerMeal = (p.carbon_score / 100) * 0.5;
        return sum + co2PerMeal;
      }, 0) * 10
    ) / 10; // Round to 1 decimal

    return NextResponse.json({
      post_count,
      avg_vegetal_score,
      avg_health_score,
      avg_carbon_score,
      total_co2_avoided
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
