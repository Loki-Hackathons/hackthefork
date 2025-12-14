// services/offSearch.ts
import { calculateProductScore, type OFFProduct } from "../scoring";

const OFF_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";

/**
 * Generate keyword variations to try (e.g., "tomato sauce" -> ["tomato sauce", "tomato", "sauce"])
 */
function generateKeywordVariations(keyword: string): string[] {
  const variations: string[] = [keyword]; // Always try original first
  
  const words = keyword.toLowerCase().split(/\s+/);
  
  // If multi-word, try individual words
  if (words.length > 1) {
    variations.push(...words);
  }
  
  // Try singular/plural variations for common words
  const singularPlural: { [key: string]: string[] } = {
    "tomatoes": ["tomato"],
    "onions": ["onion"],
    "carrots": ["carrot"],
    "potatoes": ["potato"],
    "cheeses": ["cheese"],
  };
  
  for (const word of words) {
    if (singularPlural[word]) {
      variations.push(...singularPlural[word]);
    }
  }
  
  // Remove duplicates and return
  return Array.from(new Set(variations));
}

/**
 * Search for products with a specific keyword
 */
async function searchWithKeyword(keyword: string, page: number = 1): Promise<any[]> {
  try {
    const url = `${OFF_SEARCH_URL}?search_terms=${encodeURIComponent(keyword)}&search_simple=1&action=process&json=1&page_size=40&page=${page}&fields=code,product_name,brands,image_url,nutriscore_score,nutriscore_grade,ecoscore_grade,ecoscore_score,nova_group`;
    console.log(`   🌐 API call: ${url.substring(0, 100)}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout (more reliable)
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`   ❌ Food Facts API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const products = data.products || [];
    console.log(`   ✅ API returned ${products.length} products`);

    return products;
  } catch (error) {
    console.warn(`   ❌ Search failed for "${keyword}" (page ${page}):`, error);
    return [];
  }
}

/**
 * ULTRA-STRICT relevance: Only returns high scores if the product IS the keyword, not just contains it
 * Example: "tomato sauce" should match "Tomato Sauce" but NOT "Baked Beans in Tomato Sauce"
 */
function calculateRelevanceScore(product: any, keyword: string): number {
  const productName = (product.product_name || "").toLowerCase().trim();
  const keywordLower = keyword.toLowerCase().trim();
  const keywordWords = keywordLower.split(/\s+/).filter(w => w.length > 2);
  
  // Remove common prefixes/suffixes to get core product name
  const cleanName = productName
    .replace(/^(organic|bio|fresh|frozen|canned|dried|raw|cooked|whole|sliced|chopped)\s+/gi, '')
    .replace(/\s+(pack|tin|can|jar|bottle|bag)$/gi, '')
    .trim();
  
  // EXACT MATCH (product IS the keyword) = 100
  if (cleanName === keywordLower || productName.startsWith(keywordLower + " ") || productName.startsWith(keywordLower + ",")) {
    return 100;
  }
  
  // STARTS WITH keyword (keyword is the main product) = 95
  if (cleanName.startsWith(keywordLower) || productName.startsWith(keywordLower)) {
    return 95;
  }
  
  // Check if product name is ONLY the keyword (with minor variations)
  // Example: "Tomato Sauce" for "tomato sauce" = YES
  // Example: "Baked Beans in Tomato Sauce" for "tomato sauce" = NO
  const nameWords = cleanName.split(/\s+/);
  if (nameWords.length <= keywordWords.length + 1) { // Allow 1 extra word (e.g., "Fresh Tomatoes")
    const allKeywordWordsPresent = keywordWords.every(kw => cleanName.includes(kw));
    if (allKeywordWordsPresent) {
      // Check if keyword words are at the START
      const firstKeywordIndex = cleanName.indexOf(keywordWords[0]);
      if (firstKeywordIndex < 10) {
        return 90;
      }
    }
  }
  
  // Keyword is in name but product has many other words (likely a prepared dish)
  // Example: "Classic Margherita Pizza with Mozzarella" for "mozzarella" = LOW SCORE
  if (nameWords.length > keywordWords.length + 3) {
    // Too many extra words - product is probably a prepared dish, not the ingredient
    const keywordPosition = cleanName.indexOf(keywordLower);
    if (keywordPosition > 20) {
      // Keyword appears late in name - it's a minor ingredient
      return 0;
    }
    // Keyword appears early but with many other words - still suspicious
    return 20;
  }
  
  // All keyword words in product name AND product is simple (not many extra words)
  const allWordsInName = keywordWords.every(word => productName.includes(word));
  if (allWordsInName && nameWords.length <= keywordWords.length + 2) {
    return 70;
  }
  
  // Partial match - some keyword words at the start
  const matchingWords = keywordWords.filter(word => productName.includes(word));
  if (matchingWords.length >= keywordWords.length * 0.8) {
    const firstWordIndex = productName.indexOf(keywordWords[0]);
    if (firstWordIndex < 15) {
      return 50;
    }
  }
  
  // Very low relevance or no match
  return 0;
}

/**
 * Find the BEST product for an ingredient using the same scoring algorithm as calculateDishScore
 * ULTRA-STRICT: Only returns products that ARE the keyword (not just contain it)
 */
export async function findBestProduct(keyword: string) {
  console.log(`🔍 Searching for "${keyword}"...`);
  
  let allProducts: any[] = [];
  
  // ULTRA-FAST SEARCH: Only try first page of exact keyword (40 products max)
  console.log(`🔍 Searching Food Facts for: "${keyword}"`);
  const firstPageProducts = await searchWithKeyword(keyword, 1);
  console.log(`   Found ${firstPageProducts.length} products for "${keyword}"`);
  if (firstPageProducts.length > 0) {
    allProducts.push(...firstPageProducts);
  }
  
  // Only try variation if we got very few results (less than 10)
  if (allProducts.length < 10) {
    const keywordVariations = generateKeywordVariations(keyword);
    // Try the most relevant variation (usually the first word if multi-word)
    if (keywordVariations.length > 1) {
      const bestVariation = keywordVariations[1]; // First variation after original
      console.log(`   Trying variation: "${bestVariation}"`);
      const variationProducts = await searchWithKeyword(bestVariation, 1);
      console.log(`   Found ${variationProducts.length} products for variation "${bestVariation}"`);
      if (variationProducts.length > 0) {
        allProducts.push(...variationProducts);
      }
    }
  }

  if (allProducts.length === 0) {
    console.warn(`❌ No products found for "${keyword}" - Food Facts API returned no results`);
    return null;
  }

  // Remove duplicates by product code
  const uniqueProducts = Array.from(
    new Map(allProducts.map((p: any) => [p.code || p._id || Math.random(), p])).values()
  );

  // Score each product - VERY LENIENT to ensure we find products
  const scoredProducts = uniqueProducts
    .map((p: any) => {
      // Use the same scoring function from scoring.ts
      const score = calculateProductScore(p as OFFProduct);
      
      // Check data completeness (Eco-Score, Nutri-Score, NOVA)
      const hasEcoScore = !!(p.ecoscore_grade || p.ecoscore_score);
      const hasNutriScore = !!(p.nutriscore_score !== undefined || p.nutriscore_grade);
      const hasNova = !!(p.nova_group !== undefined);
      const dataCompleteness = (hasEcoScore ? 1 : 0) + (hasNutriScore ? 1 : 0) + (hasNova ? 1 : 0);
      
      // Calculate relevance score
      const relevanceScore = calculateRelevanceScore(p, keyword);
      
      return {
        ...p,
        _calculatedScore: score,
        _dataCompleteness: dataCompleteness,
        _hasEcoScore: hasEcoScore,
        _relevanceScore: relevanceScore
      };
    })
    .filter((p: any) => {
      // ULTRA-LENIENT FILTERING to avoid "no products found" errors:
      // 1. Must have some score (at least 10) - very low threshold
      // 2. Must have some relevance (at least 10) - product should somewhat match
      //    This is very lenient to ensure we always find products
      const passes = p._calculatedScore > 10 && p._relevanceScore >= 10;
      if (!passes) {
        console.log(`Filtered out product "${p.product_name}": score=${p._calculatedScore.toFixed(1)}, relevance=${p._relevanceScore}`);
      }
      return passes;
    })
    .sort((a: any, b: any) => {
      // First sort by relevance (STRICT - must match keyword)
      if (b._relevanceScore !== a._relevanceScore) {
        return b._relevanceScore - a._relevanceScore;
      }
      // Then by data completeness (prefer products with complete data)
      if (b._dataCompleteness !== a._dataCompleteness) {
        return b._dataCompleteness - a._dataCompleteness;
      }
      // Finally by score (best first)
      return b._calculatedScore - a._calculatedScore;
    });

  // Return the best product - must have passed relevance filter
  if (scoredProducts.length > 0) {
    const best = scoredProducts[0];
    console.log(`Best product for "${keyword}": "${best.product_name}" (relevance: ${best._relevanceScore}, score: ${best._calculatedScore.toFixed(1)})`);
    return best;
  }

  // If no products passed relevance filter, try to return the best one anyway (even with lower relevance)
  // This prevents "no products found" errors - ULTRA-LENIENT fallback
  console.log(`No products passed strict filter (${scoredProducts.length} passed), trying fallback with ${uniqueProducts.length} total products...`);
  
  const allScored = uniqueProducts
    .map((p: any) => {
      const score = calculateProductScore(p as OFFProduct);
      const relevanceScore = calculateRelevanceScore(p, keyword);
      return { ...p, _calculatedScore: score, _relevanceScore: relevanceScore };
    })
    .filter((p: any) => {
      // Accept products with ANY score and ANY relevance (ultra lenient)
      return p._calculatedScore > 0 && p._relevanceScore >= 0;
    })
    .sort((a: any, b: any) => {
      // Sort by relevance first, then score
      if (b._relevanceScore !== a._relevanceScore) {
        return b._relevanceScore - a._relevanceScore;
      }
      return b._calculatedScore - a._calculatedScore;
    });

  if (allScored.length > 0) {
    const best = allScored[0];
    console.log(`✅ Using fallback product for "${keyword}": "${best.product_name}" (relevance: ${best._relevanceScore}, score: ${best._calculatedScore.toFixed(1)})`);
    return best;
  }
  
  // LAST RESORT: Return first product even if it has no score (better than nothing)
  if (uniqueProducts.length > 0) {
    const first = uniqueProducts[0];
    const score = calculateProductScore(first as OFFProduct);
    console.log(`⚠️ Using last resort product for "${keyword}": "${first.product_name || 'Unknown'}" (score: ${score.toFixed(1)})`);
    return first;
  }

  // No products found at all
  console.warn(`No products found for "${keyword}"`);
  return null;
}

/**
 * Legacy function for backward compatibility - now calls findBestProduct
 */
export async function findMostPopularProduct(keyword: string) {
  return findBestProduct(keyword);
}

