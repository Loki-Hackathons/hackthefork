// services/mealIngredients.ts
// Maps meal names to typical ingredients for Food Facts recommendations

export interface MealIngredientMapping {
  [mealName: string]: string[];
}

/**
 * Get typical ingredients for a meal based on its name
 * Returns an array of ingredient keywords to search in Food Facts
 */
export function getIngredientsForMeal(mealName: string): string[] {
  const normalizedMeal = mealName.toLowerCase().trim();
  
  // Meal to ingredients mapping
  const mealMap: MealIngredientMapping = {
    // Burgers
    "burger": ["beef", "bread", "cheese"],
    "hamburger": ["beef", "bread", "cheese"],
    "cheeseburger": ["beef", "bread", "cheese"],
    "black bean burger": ["beans", "bread", "vegetables"],
    "veggie burger": ["vegetables", "bread", "cheese"],
    
    // Pasta dishes
    "pasta": ["pasta", "tomato", "cheese"],
    "spaghetti": ["pasta", "tomato", "cheese"],
    "pasta bolognese": ["pasta", "beef", "tomato"],
    "bolognese": ["pasta", "beef", "tomato"],
    "carbonara": ["pasta", "bacon", "eggs"],
    "pasta carbonara": ["pasta", "bacon", "eggs"],
    
    // Pizza
    "pizza": ["pizza", "tomato", "cheese"],
    "margherita": ["pizza", "tomato", "cheese"],
    "pizza margherita": ["pizza", "tomato", "cheese"],
    
    // Salads
    "salad": ["lettuce", "tomato", "cucumber", "olive oil"],
    "caesar salad": ["lettuce", "chicken", "cheese", "croutons", "caesar dressing"],
    "greek salad": ["lettuce", "tomato", "cucumber", "feta cheese", "olive oil"],
    
    // Asian dishes
    "sushi": ["rice", "fish", "seaweed", "soy sauce"],
    "ramen": ["noodles", "broth", "egg", "pork", "soy sauce"],
    "fried rice": ["rice", "egg", "soy sauce", "vegetables", "chicken"],
    "pad thai": ["noodles", "shrimp", "egg", "peanuts", "soy sauce"],
    
    // Mexican
    "tacos": ["tortilla", "beef", "lettuce", "tomato", "cheese"],
    "burrito": ["tortilla", "beef", "rice", "beans", "cheese"],
    "quesadilla": ["tortilla", "cheese", "chicken"],
    
    // French
    "ratatouille": ["eggplant", "zucchini", "tomato", "onion", "pepper"],
    "coq au vin": ["chicken", "wine", "mushrooms", "onion", "bacon"],
    "boeuf bourguignon": ["beef", "wine", "carrot", "onion", "mushrooms"],
    
    // Italian
    "risotto": ["rice", "cheese", "butter"],
    "lasagna": ["pasta", "beef", "tomato"],
    "lasagne": ["pasta", "beef", "tomato"],
    
    // Indian
    "curry": ["chicken", "curry powder", "coconut milk", "onion", "tomato"],
    "chicken curry": ["chicken", "curry powder", "coconut milk", "onion", "tomato"],
    "butter chicken": ["chicken", "butter", "tomato", "cream", "spices"],
    
    // Breakfast
    "pancakes": ["flour", "milk", "egg", "butter", "sugar"],
    "waffles": ["flour", "milk", "egg", "butter", "sugar"],
    "omelette": ["egg", "cheese", "butter", "milk"],
    
    // Soups
    "soup": ["broth", "vegetables", "onion", "carrot"],
    "tomato soup": ["tomato", "onion", "broth", "cream"],
    "chicken soup": ["chicken", "broth", "carrot", "onion", "celery"],
    
    // Sandwiches
    "sandwich": ["bread", "ham", "cheese", "lettuce", "tomato"],
    "club sandwich": ["bread", "chicken", "bacon", "lettuce", "tomato"],
    
    // Fish dishes
    "fish and chips": ["fish", "potato", "flour", "oil"],
    "salmon": ["salmon", "lemon", "butter", "herbs"],
    
    // Steak
    "steak": ["beef", "butter", "herbs", "pepper"],
    "filet mignon": ["beef", "butter", "herbs", "pepper"],
  };
  
  // Direct match
  if (mealMap[normalizedMeal]) {
    return mealMap[normalizedMeal];
  }
  
  // Partial match - check if meal name contains any key
  for (const [key, ingredients] of Object.entries(mealMap)) {
    if (normalizedMeal.includes(key) || key.includes(normalizedMeal)) {
      return ingredients;
    }
  }
  
  // Fallback: try to extract common ingredients from meal name
  const fallbackIngredients: string[] = [];
  
  // Common ingredient keywords
  const ingredientKeywords = [
    "chicken", "beef", "pork", "fish", "salmon", "shrimp",
    "pasta", "rice", "noodles", "bread", "tortilla",
    "tomato", "onion", "cheese", "lettuce", "carrot",
    "egg", "milk", "butter", "oil", "flour"
  ];
  
  for (const keyword of ingredientKeywords) {
    if (normalizedMeal.includes(keyword)) {
      fallbackIngredients.push(keyword);
    }
  }
  
  // If we found some ingredients, return them, otherwise return generic ones
  if (fallbackIngredients.length > 0) {
    return fallbackIngredients.slice(0, 5);
  }
  
  // Ultimate fallback: generic ingredients
  return ["chicken", "rice", "vegetables", "spices"];
}

