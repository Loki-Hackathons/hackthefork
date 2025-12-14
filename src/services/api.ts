import { getUserId } from '@/lib/cookies';

export interface Ingredient {
  name: string;
  confidence: number;
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

export interface MealAnalysisResponse {
  ingredients: Ingredient[];
  note: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  vegetal_score: number;
  health_score: number;
  carbon_score: number;
  upvote_count?: number;
  is_upvoted?: boolean;
  ingredients?: Array<{
    id: string;
    name: string;
    confidence: number;
    category: string;
  }>;
}

export interface UserStats {
  post_count: number;
  avg_vegetal_score: number;
  avg_health_score: number;
  avg_carbon_score: number;
  total_co2_avoided: number;
}

// Mock scoring logic
export function calculateScores(ingredients: Ingredient[]): MealScore {
  const ingredientNames = ingredients.map(i => i.name.toLowerCase());
  
  // Vegetal score: higher if more plant-based ingredients
  const plantBased = ['tofu', 'lentils', 'beans', 'chickpeas', 'rice', 'pasta', 'bread', 'salad', 'vegetables'];
  const animalBased = ['beef', 'chicken', 'pork', 'fish', 'egg', 'cheese', 'milk', 'yogurt'];
  
  const plantCount = ingredientNames.filter(name => 
    plantBased.some(plant => name.includes(plant))
  ).length;
  const animalCount = ingredientNames.filter(name => 
    animalBased.some(animal => name.includes(animal))
  ).length;
  
  const vegetal = Math.min(100, Math.round((plantCount / (plantCount + animalCount + 1)) * 100));
  
  // Healthy score: based on ingredients
  let healthy = 70; // base
  if (ingredientNames.some(n => n.includes('salad') || n.includes('vegetables'))) healthy += 15;
  if (ingredientNames.some(n => n.includes('fries'))) healthy -= 20;
  if (ingredientNames.some(n => n.includes('beef') || n.includes('pork'))) healthy -= 10;
  healthy = Math.max(0, Math.min(100, healthy));
  
  // Carbon score: lower footprint = higher score
  let carbon = 80; // base
  if (ingredientNames.some(n => n.includes('beef'))) carbon -= 40;
  if (ingredientNames.some(n => n.includes('pork') || n.includes('chicken'))) carbon -= 20;
  if (ingredientNames.some(n => n.includes('fish'))) carbon -= 10;
  if (ingredientNames.some(n => n.includes('cheese') || n.includes('milk'))) carbon -= 15;
  if (ingredientNames.some(n => n.includes('tofu') || n.includes('lentils') || n.includes('beans'))) carbon += 10;
  carbon = Math.max(0, Math.min(100, carbon));
  
  return { vegetal, healthy, carbon };
}

// Mock recommendations
export function generateRecommendations(ingredients: Ingredient[], scores: MealScore): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const ingredientNames = ingredients.map(i => i.name.toLowerCase());
  
  if (scores.vegetal < 50) {
    if (ingredientNames.some(n => n.includes('beef'))) {
      recommendations.push({
        type: 'substitution',
        title: 'Remplacer le bœuf',
        description: 'Essaie du seitan ou du tempeh pour un score végétal +50',
        impact: { vegetal: 50, carbon: 40 }
      });
    }
    if (ingredientNames.some(n => n.includes('chicken'))) {
      recommendations.push({
        type: 'substitution',
        title: 'Remplacer le poulet',
        description: 'Utilise du tofu mariné pour un goût similaire',
        impact: { vegetal: 30, carbon: 20 }
      });
    }
  }
  
  if (scores.carbon < 60) {
    recommendations.push({
      type: 'tip',
      title: 'Réduire l\'empreinte carbone',
      description: 'Privilégie les légumineuses et céréales locales',
      impact: { carbon: 25 }
    });
  }
  
  if (scores.healthy < 60) {
    recommendations.push({
      type: 'improvement',
      title: 'Ajouter des légumes',
      description: 'Une portion de légumes verts améliore ton score santé',
      impact: { healthy: 20 }
    });
  }
  
  return recommendations.slice(0, 3);
}

// API call to backend
export async function analyzeMeal(imageFile: File): Promise<MealAnalysisResult> {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await fetch('http://localhost:8000/analyze-meal', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Analysis failed');
    }
    
    const data: MealAnalysisResponse = await response.json();
    
    // Calculate scores and recommendations
    const scores = calculateScores(data.ingredients);
    const recommendations = generateRecommendations(data.ingredients, scores);
    
    return {
      ingredients: data.ingredients,
      scores,
      recommendations,
    };
  } catch (error) {
    // Fallback to mock data for demo
    const mockIngredients: Ingredient[] = [
      { name: 'chicken', confidence: 0.85 },
      { name: 'rice', confidence: 0.72 },
      { name: 'vegetables', confidence: 0.65 },
    ];
    
    const scores = calculateScores(mockIngredients);
    const recommendations = generateRecommendations(mockIngredients, scores);
    
    return {
      ingredients: mockIngredients,
      scores,
      recommendations,
    };
  }
}

// Fetch posts from feed
export async function fetchPosts(): Promise<Post[]> {
  try {
    const response = await fetch('/api/posts');
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const data = await response.json();
    const posts: Post[] = data.posts || [];
    
    // Check upvote status for each post
    const userId = getUserId();
    const postsWithUpvotes = await Promise.all(
      posts.map(async (post) => {
        try {
          const upvoteResponse = await fetch(
            `/api/upvote?post_id=${post.id}&user_id=${userId}`
          );
          if (upvoteResponse.ok) {
            const upvoteData = await upvoteResponse.json();
            return { ...post, is_upvoted: upvoteData.upvoted || false };
          }
        } catch (error) {
          console.error('Error checking upvote status:', error);
        }
        return { ...post, is_upvoted: false };
      })
    );
    
    return postsWithUpvotes;
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// Toggle upvote on a post
export async function toggleUpvote(postId: string): Promise<boolean> {
  try {
    const userId = getUserId();
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
    return data.upvoted || false;
  } catch (error: any) {
    console.error('Error toggling upvote:', error);
    throw error;
  }
}

// Fetch user statistics
export async function fetchUserStats(): Promise<UserStats> {
  try {
    const userId = getUserId();
    const response = await fetch(`/api/stats?user_id=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    
    const data = await response.json();
    return {
      post_count: data.post_count || 0,
      avg_vegetal_score: data.avg_vegetal_score || 0,
      avg_health_score: data.avg_health_score || 0,
      avg_carbon_score: data.avg_carbon_score || 0,
      total_co2_avoided: data.total_co2_avoided || 0,
    };
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

