// scoring.ts
// Calculate dish score based on Open Food Facts product data

export interface OFFProduct {
  product_name?: string;
  brands?: string;
  image_url?: string;
  nutriscore_score?: number;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  ecoscore_score?: number;
  nova_group?: number;
  [key: string]: any; // Allow other OFF fields
}

export interface DishScoreResult {
  totalScore: number;
  dishInnovation: boolean;
}

/**
 * Calculate a score for a single product (0-100)
 * This is the same algorithm used in calculateDishScore, but for a single product
 * @param product Open Food Facts product object
 * @returns Product score (0-100)
 */
export function calculateProductScore(product: OFFProduct): number {
  let productScore = 50; // Base score

  // Nutri-Score contribution (0-100 scale, higher is better)
  // OFF uses nutriscore_score where -15 (best) to 40 (worst)
  // We invert it: -15 = 100, 40 = 0
  if (product.nutriscore_score !== undefined) {
    const nutriScore = Math.max(0, Math.min(100, 100 - ((product.nutriscore_score + 15) * 100 / 55)));
    productScore += (nutriScore - 50) * 0.4; // 40% weight
  }

  // Eco-Score contribution (A=100, E=0)
  if (product.ecoscore_grade) {
    const ecoScoreMap: { [key: string]: number } = {
      'a': 100,
      'b': 80,
      'c': 60,
      'd': 40,
      'e': 20
    };
    const ecoScore = ecoScoreMap[product.ecoscore_grade.toLowerCase()] || 50;
    productScore += (ecoScore - 50) * 0.3; // 30% weight
  } else if (product.ecoscore_score !== undefined) {
    // Fallback to numeric score if available
    productScore += (product.ecoscore_score - 50) * 0.3;
  }

  // NOVA group (processing level): 1=best, 4=worst
  if (product.nova_group !== undefined) {
    const novaScore = ((5 - product.nova_group) / 4) * 100; // 1->100, 4->25
    productScore += (novaScore - 50) * 0.2; // 20% weight
  }

  // Bonus for organic/eco-friendly indicators
  const productName = (product.product_name || '').toLowerCase();
  const brands = (product.brands || '').toLowerCase();
  if (productName.includes('bio') || productName.includes('organic') || 
      brands.includes('bio') || brands.includes('organic')) {
    productScore += 10; // Bonus
  }

  // Bonus for complete data (Eco-Score + Nutri-Score + NOVA)
  // This encourages products with full transparency
  const hasEcoScore = !!(product.ecoscore_grade || product.ecoscore_score !== undefined);
  const hasNutriScore = !!(product.nutriscore_score !== undefined || product.nutriscore_grade);
  const hasNova = !!(product.nova_group !== undefined);
  const dataCompleteness = (hasEcoScore ? 1 : 0) + (hasNutriScore ? 1 : 0) + (hasNova ? 1 : 0);
  
  if (dataCompleteness === 3) {
    productScore += 5; // Small bonus for complete data (all 3 scores available)
  }

  return Math.max(0, Math.min(100, productScore));
}

/**
 * Calculate a composite score for a dish based on multiple products
 * @param products Array of Open Food Facts product objects
 * @returns Score result with totalScore (0-100) and innovation flag
 */
export function calculateDishScore(products: OFFProduct[]): DishScoreResult {
  if (!products || products.length === 0) {
    return { totalScore: 0, dishInnovation: false };
  }

  let totalScore = 0;
  let validProducts = 0;

  // Score each product using the same algorithm
  for (const product of products) {
    const productScore = calculateProductScore(product);
    totalScore += productScore;
    validProducts++;
  }

  // Average score
  const avgScore = validProducts > 0 ? totalScore / validProducts : 0;

  // Innovation flag: dish is innovative if average score > 70
  const isInnovation = avgScore > 70;

  return {
    totalScore: Math.round(avgScore),
    dishInnovation: isInnovation
  };
}

