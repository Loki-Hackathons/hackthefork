import { DetectedIngredient } from './image-analysis';

export interface Scores {
  vegetal: number; // 0-100
  health: number; // 0-100
  carbon: number; // 0-100 (higher = better, lower footprint)
}

export function calculateScores(ingredients: DetectedIngredient[]): Scores {
  if (ingredients.length === 0) {
    return { vegetal: 50, health: 50, carbon: 50 };
  }

  // Count by category
  const plantCount = ingredients.filter(i => i.category === 'plant').length;
  const plantProteinCount = ingredients.filter(i => i.category === 'plant_protein').length;
  const animalCount = ingredients.filter(i => i.category === 'animal').length;
  const totalCount = ingredients.length;

  // Vegetal score: weighted proportion of plant-based ingredients
  const vegetalWeight = (plantCount * 1.0 + plantProteinCount * 1.2) / (totalCount + animalCount * 0.5);
  const vegetal = Math.min(100, Math.round(vegetalWeight * 100));

  // Health score: simple heuristic
  let health = 60; // base score
  
  // Positive factors
  if (plantCount > 0) health += 15;
  if (plantProteinCount > 0) health += 10;
  if (ingredients.some(i => i.name.includes('vegetable') || i.name.includes('salad'))) {
    health += 10;
  }
  
  // Negative factors
  if (ingredients.some(i => i.name.includes('fries') || i.name.includes('fried'))) {
    health -= 20;
  }
  if (animalCount > 0) {
    health -= 5 * animalCount; // Small penalty for animal products
  }
  
  health = Math.max(0, Math.min(100, health));

  // Carbon score: higher = better (lower footprint)
  let carbon = 80; // base score
  
  // Heavy penalties for high-impact animal products
  if (ingredients.some(i => i.name.includes('beef'))) carbon -= 40;
  if (ingredients.some(i => i.name.includes('pork'))) carbon -= 25;
  if (ingredients.some(i => i.name.includes('chicken'))) carbon -= 15;
  if (ingredients.some(i => i.name.includes('fish'))) carbon -= 10;
  if (ingredients.some(i => i.name.includes('cheese') || i.name.includes('milk'))) carbon -= 10;
  
  // Bonuses for plant-based
  if (plantProteinCount > 0) carbon += 10;
  if (plantCount > 2) carbon += 5;
  
  carbon = Math.max(0, Math.min(100, carbon));

  return { vegetal, health, carbon };
}
