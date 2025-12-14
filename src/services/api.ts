import { getUserId } from '@/lib/cookies';

export interface Ingredient {
  name: string;
  confidence: number;
  category?: 'plant' | 'plant_protein' | 'animal';
}

export interface MealScore {
  vegetal: number; // 0-100, how plant-based
  healthy: number; // 0-100, nutrition score
  carbon: number; // 0-100, carbon footprint (higher = better, lower footprint)
}

export interface Recommendation {
  type: 'substitution' | 'tip' | 'improvement';
  title: string;
  description: string;
  impact: {
    vegetal?: number;
    healthy?: number;
    carbon?: number;
  };
}

export interface MealAnalysisResult {
  ingredients: Ingredient[];
  scores: MealScore;
  recommendations: Recommendation[];
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  vegetal_score: number;
  health_score: number;
  carbon_score: number;
  created_at: string;
  ingredients?: Ingredient[];
  upvote_count?: number;
  is_upvoted?: boolean;
}

export interface UserStats {
  post_count: number;
  avg_vegetal_score: number;
  avg_health_score: number;
  avg_carbon_score: number;
  total_co2_avoided: number;
}

// Generate recommendations based on scores
export function generateRecommendations(ingredients: Ingredient[], scores: MealScore): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const ingredientNames = ingredients.map(i => i.name.toLowerCase());
  
  if (scores.vegetal < 50) {
    if (ingredientNames.some(n => n.includes('beef'))) {
      recommendations.push({
        type: 'substitution',
        title: 'Replace beef',
        description: 'Try seitan or tempeh for +50 vegetal score',
        impact: { vegetal: 50, carbon: 40 }
      });
    }
    if (ingredientNames.some(n => n.includes('chicken'))) {
      recommendations.push({
        type: 'substitution',
        title: 'Replace chicken',
        description: 'Use marinated tofu for a similar taste',
        impact: { vegetal: 30, carbon: 20 }
      });
    }
  }
  
  if (scores.carbon < 60) {
    recommendations.push({
      type: 'tip',
      title: 'Reduce carbon footprint',
      description: 'Choose local legumes and grains',
      impact: { carbon: 25 }
    });
  }
  
  if (scores.healthy < 60) {
    recommendations.push({
      type: 'improvement',
      title: 'Add vegetables',
      description: 'A portion of greens improves your health score',
      impact: { healthy: 20 }
    });
  }
  
  return recommendations.slice(0, 3);
}

// API call to analyze meal and create post
export async function analyzeMeal(imageFile: File): Promise<MealAnalysisResult> {
  const userId = getUserId();
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('user_id', userId);
  
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Analysis failed');
    }
    
    const data = await response.json();
    const post = data.post;
    
    // Map to MealAnalysisResult
    const scores: MealScore = {
      vegetal: post.vegetal_score,
      healthy: post.health_score,
      carbon: post.carbon_score
    };
    
    const ingredients: Ingredient[] = post.ingredients || [];
    const recommendations = generateRecommendations(ingredients, scores);
    
    return {
      ingredients,
      scores,
      recommendations,
    };
  } catch (error) {
    console.error('Error analyzing meal:', error);
    throw error;
  }
}

// Fetch feed posts
export async function fetchPosts(): Promise<Post[]> {
  try {
    const response = await fetch('/api/posts');
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const data = await response.json();
    const userId = getUserId();
    
    // Check which posts are upvoted by current user
    const postsWithUpvotes = await Promise.all(
      data.posts.map(async (post: Post) => {
        const upvoteResponse = await fetch(
          `/api/upvote?post_id=${post.id}&user_id=${userId}`
        );
        const { upvoted } = await upvoteResponse.json();
        return { ...post, is_upvoted: upvoted || false };
      })
    );
    
    return postsWithUpvotes;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// Toggle upvote
export async function toggleUpvote(postId: string): Promise<boolean> {
  const userId = getUserId();
  
  try {
    const response = await fetch('/api/upvote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post_id: postId, user_id: userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle upvote');
    }
    
    const data = await response.json();
    return data.upvoted;
  } catch (error) {
    console.error('Error toggling upvote:', error);
    throw error;
  }
}

// Fetch user stats
export async function fetchUserStats(): Promise<UserStats> {
  const userId = getUserId();
  
  try {
    const response = await fetch(`/api/stats?user_id=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      post_count: 0,
      avg_vegetal_score: 0,
      avg_health_score: 0,
      avg_carbon_score: 0,
      total_co2_avoided: 0
    };
  }
}
