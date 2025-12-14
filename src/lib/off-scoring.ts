// lib/off-scoring.ts
// Calculate category scores from Open Food Facts products

export interface OFFProduct {
  product_name?: string;
  nutriscore_score?: number;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  ecoscore_score?: number;
  nova_group?: number;
  [key: string]: any;
}

export interface CategoryScores {
  nutriscore: number;  // 0-100 (from nutriscore_score)
  additive: number;    // 0-100 (from NOVA group - processing level)
  label: number;       // 0-100 (from ecoscore)
}

/**
 * Calculate Nutriscore category score (0-100)
 * Open Food Facts nutriscore_score: -15 (best) to 40 (worst)
 * We invert it so -15 = 100, 40 = 0
 */
function calculateNutriscoreCategory(product: OFFProduct): number {
  if (product.nutriscore_score !== undefined) {
    // Invert the score: -15 (best) → 100, 40 (worst) → 0
    const score = 100 - ((product.nutriscore_score + 15) * 100 / 55);
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  // Fallback to grade if numeric score not available
  if (product.nutriscore_grade) {
    const gradeMap: { [key: string]: number } = {
      'a': 100,
      'b': 80,
      'c': 60,
      'd': 40,
      'e': 20
    };
    return gradeMap[product.nutriscore_grade.toLowerCase()] || 50;
  }
  
  return 50; // Default if no data
}

/**
 * Calculate Additive category score (0-100)
 * Based on NOVA group (processing level): 1 (best) to 4 (worst)
 * Lower NOVA = less processed = better score
 */
function calculateAdditiveCategory(product: OFFProduct): number {
  if (product.nova_group !== undefined) {
    // NOVA 1 (unprocessed) = 100, NOVA 4 (ultra-processed) = 25
    const score = ((5 - product.nova_group) / 4) * 100;
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  return 50; // Default if no data
}

/**
 * Calculate Label category score (0-100)
 * Based on Ecoscore: A (best) = 100, E (worst) = 20
 */
function calculateLabelCategory(product: OFFProduct): number {
  if (product.ecoscore_grade) {
    const gradeMap: { [key: string]: number } = {
      'a': 100,
      'b': 80,
      'c': 60,
      'd': 40,
      'e': 20
    };
    return gradeMap[product.ecoscore_grade.toLowerCase()] || 50;
  }
  
  // Fallback to numeric score if grade not available
  if (product.ecoscore_score !== undefined) {
    return Math.max(0, Math.min(100, Math.round(product.ecoscore_score)));
  }
  
  return 50; // Default if no data
}

/**
 * Calculate category scores for a single product
 */
export function calculateProductCategoryScores(product: OFFProduct): CategoryScores {
  return {
    nutriscore: calculateNutriscoreCategory(product),
    additive: calculateAdditiveCategory(product),
    label: calculateLabelCategory(product)
  };
}

/**
 * Calculate arithmetic mean of category scores from multiple products
 * This is what we'll save as vegetal_score, health_score, carbon_score
 */
export function calculateMeanScores(products: OFFProduct[]): {
  vegetal_score: number;  // Mapped from nutriscore
  health_score: number;   // Mapped from additive (NOVA)
  carbon_score: number;   // Mapped from label (ecoscore)
} {
  if (!products || products.length === 0) {
    return {
      vegetal_score: 50,
      health_score: 50,
      carbon_score: 50
    };
  }

  let totalNutriscore = 0;
  let totalAdditive = 0;
  let totalLabel = 0;
  let count = 0;

  for (const product of products) {
    const scores = calculateProductCategoryScores(product);
    totalNutriscore += scores.nutriscore;
    totalAdditive += scores.additive;
    totalLabel += scores.label;
    count++;
  }

  return {
    vegetal_score: Math.round(totalNutriscore / count),
    health_score: Math.round(totalAdditive / count),
    carbon_score: Math.round(totalLabel / count)
  };
}

