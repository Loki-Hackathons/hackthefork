// lib/score-utils.ts
// Utility functions for calculating aggregated scores with weighted averages

export interface Scores {
  vegetal: number;
  health: number;
  carbon: number;
}

/**
 * Calculate weighted aggregated score from three sustainability scores
 * Vegetal is the central element - it forms the foundation of the score
 * Health and carbon modify the vegetal base score in a nuanced, non-linear way
 * 
 * @param scores - Object containing vegetal, health, and carbon scores (0-100)
 * @returns Aggregated score (0-100)
 */
export function calculateAggregatedScore(scores: Scores): number {
  // Vegetal is the central element - it forms the foundation (50% base)
  // Health and carbon modify the vegetal score based on their values
  
  // Base score from vegetal (central element)
  const vegetalBase = scores.vegetal * 0.5;
  
  // Health and carbon contribute proportionally, but their impact
  // is enhanced when vegetal is high (synergy effect)
  const healthContribution = scores.health * 0.25;
  const carbonContribution = scores.carbon * 0.25;
  
  // Synergy bonus: when vegetal is high, health and carbon matter more
  // This rewards plant-based dishes that are also healthy and sustainable
  const synergyFactor = 1 + (scores.vegetal / 100) * 0.15; // Up to 15% boost
  
  // Calculate final score
  const baseScore = vegetalBase + healthContribution + carbonContribution;
  const finalScore = baseScore * synergyFactor;
  
  return Math.round(Math.max(0, Math.min(100, finalScore)));
}
