/**
 * Traduction des ingrédients anglais vers français pour Auchan
 */

const ingredientTranslations: Record<string, string> = {
  // Légumes
  'salad': 'salade',
  'lettuce': 'salade',
  'iceberg lettuce': 'salade iceberg',
  'tomato': 'tomate',
  'tomatoes': 'tomates',
  'onion': 'oignon',
  'onions': 'oignons',
  'garlic': 'ail',
  'mushroom': 'champignon',
  'mushrooms': 'champignons',
  'pepper': 'poivron',
  'peppers': 'poivrons',
  'bell pepper': 'poivron',
  'carrot': 'carotte',
  'carrots': 'carottes',
  'cucumber': 'concombre',
  'cucumbers': 'concombres',
  'zucchini': 'courgette',
  'courgette': 'courgette',
  'eggplant': 'aubergine',
  'aubergine': 'aubergine',
  'spinach': 'épinards',
  'broccoli': 'brocoli',
  'cauliflower': 'chou-fleur',
  'cabbage': 'chou',
  'potato': 'pomme de terre',
  'potatoes': 'pommes de terre',
  'sweet potato': 'patate douce',
  'sweet potatoes': 'patates douces',
  
  // Fruits
  'apple': 'pomme',
  'apples': 'pommes',
  'banana': 'banane',
  'bananas': 'bananes',
  'orange': 'orange',
  'oranges': 'oranges',
  'lemon': 'citron',
  'lemons': 'citrons',
  'lime': 'citron vert',
  'avocado': 'avocat',
  'avocados': 'avocats',
  
  // Protéines animales
  'chicken': 'poulet',
  'beef': 'boeuf',
  'pork': 'porc',
  'fish': 'poisson',
  'salmon': 'saumon',
  'tuna': 'thon',
  'egg': 'oeuf',
  'eggs': 'oeufs',
  'cheese': 'fromage',
  'milk': 'lait',
  'yogurt': 'yaourt',
  'yoghurt': 'yaourt',
  'butter': 'beurre',
  
  // Protéines végétales
  'tofu': 'tofu',
  'tempeh': 'tempeh',
  'seitan': 'seitan',
  'lentils': 'lentilles',
  'lentil': 'lentille',
  'beans': 'haricots',
  'bean': 'haricot',
  'chickpeas': 'pois chiches',
  'chickpea': 'pois chiche',
  'black beans': 'haricots noirs',
  'kidney beans': 'haricots rouges',
  
  // Céréales et féculents
  'rice': 'riz',
  'pasta': 'pâtes',
  'spaghetti': 'spaghettis',
  'noodles': 'nouilles',
  'bread': 'pain',
  'baguette': 'baguette',
  'flour': 'farine',
  'wheat': 'blé',
  
  // Herbes et épices
  'basil': 'basilic',
  'parsley': 'persil',
  'cilantro': 'coriandre',
  'coriander': 'coriandre',
  'oregano': 'origan',
  'thyme': 'thym',
  'rosemary': 'romarin',
  'mint': 'menthe',
  'dill': 'aneth',
  'sage': 'sauge',
  'cumin': 'cumin',
  'paprika': 'paprika',
  'turmeric': 'curcuma',
  'curry': 'curry',
  'ginger': 'gingembre',
  'cinnamon': 'cannelle',
  
  // Autres
  'olive oil': 'huile d\'olive',
  'vegetable oil': 'huile végétale',
  'salt': 'sel',
  'pepper': 'poivre',
  'black pepper': 'poivre noir',
  'sugar': 'sucre',
  'honey': 'miel',
  'vinegar': 'vinaigre',
  'soy sauce': 'sauce soja',
  'mustard': 'moutarde',
  'mayonnaise': 'mayonnaise',
  'ketchup': 'ketchup',
  'sauce': 'sauce',
  'tomato sauce': 'sauce tomate',
  'pizza sauce': 'sauce tomate',
  'pasta sauce': 'sauce tomate',
  'pizza dough': 'pâte à pizza',
  'pizza base': 'pâte à pizza',
  'pizza crust': 'pâte à pizza',
};

/**
 * Traduit un ingrédient de l'anglais vers le français
 * @param ingredient - Nom de l'ingrédient (peut être en anglais ou français)
 * @returns Nom traduit en français, ou l'original si pas de traduction trouvée
 */
export function translateIngredient(ingredient: string): string {
  if (!ingredient) return ingredient;
  
  const normalized = ingredient.toLowerCase().trim();
  
  // Si déjà en français (contient des caractères accentués ou mots français communs)
  if (normalized.match(/[àâäéèêëïîôùûüÿç]/) || 
      normalized.includes('bio') || 
      normalized.includes('frais') ||
      normalized.includes('d\'') ||
      normalized.includes('à')) {
    return ingredient; // Garder tel quel
  }
  
  // Chercher une traduction exacte
  if (ingredientTranslations[normalized]) {
    return ingredientTranslations[normalized];
  }
  
  // Chercher une traduction partielle (ex: "fresh basil" -> "basil")
  for (const [english, french] of Object.entries(ingredientTranslations)) {
    if (normalized.includes(english) || english.includes(normalized)) {
      // Remplacer la partie anglaise par la traduction française
      const regex = new RegExp(english, 'gi');
      return ingredient.replace(regex, french);
    }
  }
  
  // Si pas de traduction trouvée, retourner l'original
  // (peut être déjà en français ou un nom propre)
  return ingredient;
}

/**
 * Traduit une liste d'ingrédients
 * @param ingredients - Liste des noms d'ingrédients
 * @returns Liste traduite en français
 */
export function translateIngredients(ingredients: string[]): string[] {
  return ingredients.map(translateIngredient);
}

