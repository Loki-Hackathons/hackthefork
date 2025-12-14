import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateProductScore, type OFFProduct } from '@/scoring';

// Search Open Food Facts for a single ingredient
async function searchOFFForIngredient(ingredientName: string): Promise<OFFProduct | null> {
  try {
    console.log(`🔍 Searching OFF for ingredient: "${ingredientName}"`);
    
    // Build search URL with popularity sorting
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(ingredientName)}&search_simple=1&action=process&json=1&page_size=5&sort_by=unique_scans_n&fields=product_name,brands,image_url,nutriscore_score,nutriscore_grade,ecoscore_grade,ecoscore_score,nova_group`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout per search
    
    const response = await fetch(searchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`OFF search failed for "${ingredientName}": ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.products || data.products.length === 0) {
      console.warn(`No products found for "${ingredientName}"`);
      return null;
    }
    
    // Return the most popular product (first one due to unique_scans_n sorting)
    const product = data.products[0];
    console.log(`✅ Found product for "${ingredientName}": ${product.product_name}`);
    
    return product;
  } catch (error: any) {
    console.error(`Error searching OFF for "${ingredientName}":`, error.message);
    return null;
  }
}

// Calculate scores breakdown (vegetal, health, carbon) from OFF products
function calculateScoresBreakdown(products: OFFProduct[]): {
  vegetal_score: number;
  health_score: number;
  carbon_score: number;
  overall_score: number;
} {
  if (!products || products.length === 0) {
    return {
      vegetal_score: 0,
      health_score: 0,
      carbon_score: 0,
      overall_score: 0
    };
  }

  let totalVegetalScore = 0;
  let totalHealthScore = 0;
  let totalCarbonScore = 0;

  for (const product of products) {
    // Vegetal Score: Based on NOVA group (less processed = higher score)
    let vegetalScore = 50;
    if (product.nova_group !== undefined) {
      vegetalScore = ((5 - product.nova_group) / 4) * 100; // 1->100, 4->25
    }

    // Health Score: Based on Nutri-Score
    let healthScore = 50;
    if (product.nutriscore_score !== undefined) {
      // Invert nutriscore: -15 (best) = 100, 40 (worst) = 0
      healthScore = Math.max(0, Math.min(100, 100 - ((product.nutriscore_score + 15) * 100 / 55)));
    }

    // Carbon Score: Based on Eco-Score
    let carbonScore = 50;
    if (product.ecoscore_grade) {
      const ecoScoreMap: { [key: string]: number } = {
        'a': 100,
        'b': 80,
        'c': 60,
        'd': 40,
        'e': 20
      };
      carbonScore = ecoScoreMap[product.ecoscore_grade.toLowerCase()] || 50;
    } else if (product.ecoscore_score !== undefined) {
      carbonScore = product.ecoscore_score;
    }

    // Bonus for organic products
    const productName = (product.product_name || '').toLowerCase();
    const brands = (product.brands || '').toLowerCase();
    if (productName.includes('bio') || productName.includes('organic') || 
        brands.includes('bio') || brands.includes('organic')) {
      vegetalScore = Math.min(100, vegetalScore + 10);
      healthScore = Math.min(100, healthScore + 5);
      carbonScore = Math.min(100, carbonScore + 10);
    }

    totalVegetalScore += vegetalScore;
    totalHealthScore += healthScore;
    totalCarbonScore += carbonScore;
  }

  // Calculate arithmetic means
  const count = products.length;
  const vegetalMean = Math.round(totalVegetalScore / count);
  const healthMean = Math.round(totalHealthScore / count);
  const carbonMean = Math.round(totalCarbonScore / count);
  const overallMean = Math.round((vegetalMean + healthMean + carbonMean) / 3);

  return {
    vegetal_score: vegetalMean,
    health_score: healthMean,
    carbon_score: carbonMean,
    overall_score: overallMean
  };
}

// GET /api/recalculate-scores?post_id=xxx
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

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Recalculating scores for post: ${postId}`);
    console.log(`${'='.repeat(60)}\n`);

    // Fetch ingredients for this post
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('*')
      .eq('post_id', postId);

    if (ingredientsError) {
      console.error('Error fetching ingredients:', ingredientsError);
      return NextResponse.json(
        { error: 'Failed to fetch ingredients' },
        { status: 500 }
      );
    }

    if (!ingredients || ingredients.length === 0) {
      console.warn(`No ingredients found for post ${postId}`);
      return NextResponse.json(
        { error: 'No ingredients found for this post' },
        { status: 404 }
      );
    }

    console.log(`📋 Found ${ingredients.length} ingredients:`, ingredients.map(i => i.name).join(', '));

    // Search OFF for each ingredient in parallel
    const searchPromises = ingredients.map(ing => searchOFFForIngredient(ing.name));
    const searchResults = await Promise.all(searchPromises);

    // Filter out null results
    const validProducts = searchResults.filter((p): p is OFFProduct => p !== null);

    console.log(`\n✅ Found ${validProducts.length} products from ${ingredients.length} ingredients`);

    if (validProducts.length === 0) {
      return NextResponse.json({
        error: 'No products found in Open Food Facts for these ingredients',
        ingredients: ingredients.map(i => i.name)
      }, { status: 404 });
    }

    // Calculate scores using the breakdown function
    const scores = calculateScoresBreakdown(validProducts);

    console.log(`\n📊 Calculated Scores:`);
    console.log(`   - Vegetal: ${scores.vegetal_score}/100`);
    console.log(`   - Health: ${scores.health_score}/100`);
    console.log(`   - Carbon: ${scores.carbon_score}/100`);
    console.log(`   - Overall: ${scores.overall_score}/100`);

    // Update the post with new scores
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        vegetal_score: scores.vegetal_score,
        health_score: scores.health_score,
        carbon_score: scores.carbon_score
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post scores:', updateError);
      // Still return the scores even if update fails
    } else {
      console.log(`✅ Updated post ${postId} with new scores`);
    }

    console.log(`\n${'='.repeat(60)}\n`);

    return NextResponse.json({
      success: true,
      post_id: postId,
      ingredients_count: ingredients.length,
      products_found: validProducts.length,
      scores: {
        vegetal: scores.vegetal_score,
        health: scores.health_score,
        carbon: scores.carbon_score,
        overall: scores.overall_score
      },
      products: validProducts.map(p => ({
        name: p.product_name,
        brand: p.brands,
        nutriscore: p.nutriscore_grade,
        ecoscore: p.ecoscore_grade,
        nova: p.nova_group
      }))
    });

  } catch (error: any) {
    console.error('Error in recalculate-scores API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to recalculate scores' },
      { status: 500 }
    );
  }
}

