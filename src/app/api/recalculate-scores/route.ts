import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateMeanScores, type OFFProduct } from '@/lib/off-scoring';

// Search Open Food Facts for a single ingredient
async function searchOFFForIngredient(ingredientName: string): Promise<OFFProduct | null> {
  try {
    console.log(`🔍 Searching OFF for ingredient: "${ingredientName}"`);
    
    // Build search URL with popularity sorting (deterministic: unique_scans_n ensures consistent results)
    // Using page_size=1 and sort_by=unique_scans_n ensures we always get the same most popular product
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(ingredientName)}&search_simple=1&action=process&json=1&page_size=1&sort_by=unique_scans_n&fields=product_name,brands,image_url,nutriscore_score,nutriscore_grade,ecoscore_grade,ecoscore_score,nova_group`;
    
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

    // Calculate scores using arithmetic mean from OFF data
    const scores = calculateMeanScores(validProducts);
    const overallScore = Math.round((scores.vegetal_score + scores.health_score + scores.carbon_score) / 3);

    console.log(`\n📊 Calculated Scores (Arithmetic Mean):`);
    console.log(`   - Nutriscore (vegetal): ${scores.vegetal_score}/100`);
    console.log(`   - Additive (health): ${scores.health_score}/100`);
    console.log(`   - Label (carbon): ${scores.carbon_score}/100`);
    console.log(`   - Overall: ${overallScore}/100`);

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
        overall: overallScore
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

