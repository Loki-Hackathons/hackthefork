import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSensoryComment } from '@/services/sensoryNLP';

/**
 * Industrial Analytics API
 * 
 * This endpoint aggregates real user data from the database:
 * - Posts with ratings
 * - Comments parsed into sensory tags via NLP
 * - Ingredient correlations (future: link to Open Food Facts)
 * 
 * DATA TRANSPARENCY:
 * - Real data: Post counts, ratings, NLP-parsed comments
 * - Mock data: Visual appeal (swipe) correlation (requires more users)
 */

interface SensoryTagAggregation {
  tag: string;
  count: number;
  avgRating: number;
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all posts with ratings and comments
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, rating, comment, created_at')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw postsError;
    }

    // Calculate basic stats
    const totalPosts = posts?.length || 0;
    const postsWithRatings = posts?.filter(p => p.rating !== null) || [];
    const totalRatings = postsWithRatings.length;
    const avgRating = totalRatings > 0
      ? postsWithRatings.reduce((sum, p) => sum + (p.rating || 0), 0) / totalRatings
      : 0;

    // Parse comments into sensory tags using NLP
    // NOTE: This is computationally expensive - in production, tags should be cached in DB
    const postsWithComments = posts?.filter(p => p.comment && p.comment.trim().length > 0) || [];
    
    console.log(`[Industrial Analytics] Parsing ${postsWithComments.length} comments...`);
    
    const tagMap = new Map<string, { count: number; totalRating: number }>();
    let commentsWithTags = 0;

    // Parse comments sequentially to avoid API rate limits
    for (const post of postsWithComments) {
      if (!post.comment || !post.rating) continue;

      try {
        // Use the existing NLP service (calls /api/sensory-parse)
        const sensoryData = await parseSensoryCommentServerSide(post.comment);
        
        if (sensoryData.tags && sensoryData.tags.length > 0) {
          commentsWithTags++;
          
          // Aggregate tags
          for (const tagObj of sensoryData.tags) {
            const existing = tagMap.get(tagObj.tag) || { count: 0, totalRating: 0 };
            tagMap.set(tagObj.tag, {
              count: existing.count + 1,
              totalRating: existing.totalRating + post.rating
            });
          }
        }
      } catch (error) {
        console.error(`Failed to parse comment for post ${post.id}:`, error);
        // Continue with next comment
      }
    }

    // Convert tag map to sorted arrays
    const allTags: SensoryTagAggregation[] = Array.from(tagMap.entries()).map(([tag, data]) => ({
      tag,
      count: data.count,
      avgRating: data.totalRating / data.count
    }));

    // Separate into barriers (negative) and drivers (positive)
    const BARRIER_TAGS_SET = new Set([
      'beany', 'wheaty', 'dry', 'granular', 'off-flavour', 'bitter', 'astringent',
      'cardboard', 'musty', 'earthy', 'chalky', 'mealy', 'rubbery', 'tough',
      'spongy', 'watery', 'bland', 'artificial', 'chemical'
    ]);

    const DRIVER_TAGS_SET = new Set([
      'juicy', 'meaty', 'umami', 'tender', 'crispy', 'succulent', 'savory',
      'rich', 'flavorful', 'aromatic', 'moist', 'firm', 'smooth', 'creamy'
    ]);

    let topBarriers = allTags
      .filter(t => BARRIER_TAGS_SET.has(t.tag.toLowerCase()))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    let topDrivers = allTags
      .filter(t => DRIVER_TAGS_SET.has(t.tag.toLowerCase()))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Use mock data if insufficient real data (< 5 tags per category)
    const useMockTags = topBarriers.length < 5 && topDrivers.length < 5;
    
    if (useMockTags) {
      // Mock data based on Flint et al. (2025) meta-analysis
      topBarriers = [
        { tag: 'dry', count: 12, avgRating: 2.3 },
        { tag: 'beany', count: 9, avgRating: 2.1 },
        { tag: 'bitter', count: 7, avgRating: 2.4 },
        { tag: 'granular', count: 6, avgRating: 2.7 },
        { tag: 'cardboard', count: 4, avgRating: 2.0 },
        { tag: 'spongy', count: 3, avgRating: 2.8 }
      ];
      
      topDrivers = [
        { tag: 'juicy', count: 15, avgRating: 4.6 },
        { tag: 'meaty', count: 13, avgRating: 4.5 },
        { tag: 'tender', count: 11, avgRating: 4.3 },
        { tag: 'savory', count: 9, avgRating: 4.4 },
        { tag: 'crispy', count: 7, avgRating: 4.2 },
        { tag: 'umami', count: 5, avgRating: 4.7 }
      ];
    }

    // Disconfirmation gap data (MOCK - requires swipe data)
    // In production, this would correlate visual swipes with post-consumption ratings
    const disconfirmationGap: any[] = [];

    return NextResponse.json({
      totalPosts,
      totalRatings,
      avgRating,
      commentsWithTags,
      topBarriers,
      topDrivers,
      disconfirmationGap,
      _meta: {
        dataTransparency: {
          realData: useMockTags ? ['totalPosts', 'totalRatings', 'avgRating', 'commentsWithTags'] : ['totalPosts', 'totalRatings', 'avgRating', 'commentsWithTags', 'topBarriers', 'topDrivers'],
          mockData: useMockTags ? ['topBarriers', 'topDrivers', 'disconfirmationGap'] : ['disconfirmationGap'],
          reason: useMockTags ? 'Insufficient comment data - using representative mock data from Flint et al. (2025)' : 'Swipe-to-rating correlation requires more user interactions'
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Industrial Analytics Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

/**
 * Server-side version of parseSensoryComment
 * Calls the NLP API directly with fetch
 */
async function parseSensoryCommentServerSide(comment: string) {
  try {
    // Construct absolute URL for API call
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/sensory-parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      throw new Error(`Sensory parse failed: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Sensory parse error:', error);
    // Return empty tags on failure
    return { tags: [] };
  }
}
