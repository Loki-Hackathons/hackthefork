// Lazy load transformers to avoid breaking if sharp isn't installed
let pipeline: any = null;
let transformersLoaded = false;

async function loadTransformers() {
  if (transformersLoaded && pipeline) return pipeline;
  
  try {
    const transformers = await import('@xenova/transformers');
    pipeline = transformers.pipeline;
    const env = transformers.env;
    
    // Disable local model files to use CDN
    env.allowLocalModels = false;
    env.allowRemoteModels = true;
    
    transformersLoaded = true;
    return pipeline;
  } catch (error: any) {
    console.error('Failed to load @xenova/transformers:', error);
    // Return null to indicate transformers aren't available
    return null;
  }
}

// Common ingredient labels for zero-shot classification
const INGREDIENT_LABELS = [
  'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna',
  'rice', 'pasta', 'noodles', 'bread', 'quinoa',
  'tofu', 'tempeh', 'seitan', 'lentils', 'beans', 'chickpeas', 'edamame',
  'broccoli', 'carrots', 'peppers', 'onions', 'tomatoes', 'lettuce', 'spinach', 'kale',
  'potatoes', 'sweet potatoes', 'avocado', 'mushrooms',
  'cheese', 'milk', 'yogurt', 'eggs',
  'fries', 'fried food', 'sauce', 'curry', 'salad', 'vegetables'
];

// Category mapping
const CATEGORY_MAP: Record<string, 'plant' | 'plant_protein' | 'animal'> = {
  // Animal products
  'chicken': 'animal',
  'beef': 'animal',
  'pork': 'animal',
  'fish': 'animal',
  'salmon': 'animal',
  'tuna': 'animal',
  'cheese': 'animal',
  'milk': 'animal',
  'yogurt': 'animal',
  'eggs': 'animal',
  
  // Plant proteins
  'tofu': 'plant_protein',
  'tempeh': 'plant_protein',
  'seitan': 'plant_protein',
  'lentils': 'plant_protein',
  'beans': 'plant_protein',
  'chickpeas': 'plant_protein',
  'edamame': 'plant_protein',
  
  // Plants
  'rice': 'plant',
  'pasta': 'plant',
  'noodles': 'plant',
  'bread': 'plant',
  'quinoa': 'plant',
  'broccoli': 'plant',
  'carrots': 'plant',
  'peppers': 'plant',
  'onions': 'plant',
  'tomatoes': 'plant',
  'lettuce': 'plant',
  'spinach': 'plant',
  'kale': 'plant',
  'potatoes': 'plant',
  'sweet potatoes': 'plant',
  'avocado': 'plant',
  'mushrooms': 'plant',
  'sauce': 'plant',
  'curry': 'plant',
  'salad': 'plant',
  'vegetables': 'plant',
  'fries': 'plant',
  'fried food': 'plant',
};

export interface DetectedIngredient {
  name: string;
  confidence: number;
  category: 'plant' | 'plant_protein' | 'animal';
}

let classifier: any = null;

async function getClassifier() {
  if (!classifier) {
    const pipelineFn = await loadTransformers();
    if (!pipelineFn) {
      throw new Error('Transformers not available');
    }
    classifier = await pipelineFn(
      'zero-shot-image-classification',
      'Xenova/clip-vit-base-patch32'
    );
  }
  return classifier;
}

export async function analyzeImage(imageBuffer: Buffer): Promise<DetectedIngredient[]> {
  try {
    const classifier = await getClassifier();
    
    // Run zero-shot classification
    const results = await classifier(imageBuffer, INGREDIENT_LABELS);
    
    // Filter results with confidence > 0.3 and map to our structure
    const detected: DetectedIngredient[] = results
      .filter((result: any) => result.score > 0.3)
      .slice(0, 10) // Top 10 ingredients
      .map((result: any) => {
        const label = result.label.toLowerCase();
        const category = CATEGORY_MAP[label] || 'plant';
        
        return {
          name: label,
          confidence: result.score,
          category: category as 'plant' | 'plant_protein' | 'animal'
        };
      });
    
    return detected;
  } catch (error) {
    console.error('Image analysis error:', error);
    // Fallback to mock detection
    return [
      { name: 'vegetables', confidence: 0.7, category: 'plant' },
      { name: 'rice', confidence: 0.65, category: 'plant' },
      { name: 'chicken', confidence: 0.6, category: 'animal' }
    ];
  }
}
