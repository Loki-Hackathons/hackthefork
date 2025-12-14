// services/recipeEngine.ts
import { analyzeImageWithBlackbox } from "./blackboxVision";
import { findMostPopularProduct } from "./offSearch";
import { calculateDishScore } from "../scoring";
import { getIngredientsForMeal } from "./mealIngredients";

export interface RecommendedDish {
  dishName: string;
  totalScore: number;
  isInnovation: boolean;
  products: Array<{
    name: string;
    brand: string;
    image: string;
    score: number;
    ecoScore: string;
    offData: any; // Keep the full object for detailed views
  }>;
}

export async function processDishPhoto(base64Image: string): Promise<RecommendedDish> {
  try {
    // 1. VISION: Identify the meal name from the photo using Blackbox AI
    console.log("🔍 Step 1: Analyzing image with Blackbox (Gemini 3 Pro)...");
    const aiResult = await analyzeImageWithBlackbox(base64Image);
    
    console.log("✅ AI analysis complete, result:", aiResult);
    
    if (!aiResult.dishName || aiResult.dishName.trim().length === 0) {
      throw new Error("Could not identify the meal. Please try with a clearer photo of food.");
    }

    console.log(`🍽️ Step 2: Identified meal: "${aiResult.dishName}"`);

    // 2. GET INGREDIENTS: Based on the meal name, get typical ingredients
    const ingredients = getIngredientsForMeal(aiResult.dishName);
    console.log(`Step 3: Recommended ingredients for ${aiResult.dishName}:`, ingredients);

    // 3. SEARCH: Find the BEST products for each ingredient (best Nutri-Score, Eco-Score, NOVA)
    // Limit to first 3 ingredients for speed and relevance
    const ingredientsToProcess = ingredients.slice(0, 3);
    console.log(`Processing ${ingredientsToProcess.length} ingredients (limited for speed and relevance)`);

    // Process in parallel with balanced timeout
    const productPromises = ingredientsToProcess.map(async (keyword) => {
      try {
        return await Promise.race([
          findMostPopularProduct(keyword),
          new Promise<null>((resolve) => 
            setTimeout(() => {
              console.warn(`⏱️ Timeout for ${keyword}`);
              resolve(null);
            }, 5000) // 5 seconds max per ingredient (balanced for reliability)
          )
        ]);
      } catch (error) {
        console.warn(`Failed to find product for ${keyword}:`, error);
        return null;
      }
    });

    const rawProducts = await Promise.all(productPromises);
    
    // Filter out any ingredients where we couldn't find a product
    let validProducts = rawProducts.filter(p => p !== null);

    // FALLBACK: If we found very few products, try searching for the meal name itself
    if (validProducts.length < 2 && aiResult.dishName) {
      console.log(`Only found ${validProducts.length} products, trying meal name as fallback: ${aiResult.dishName}`);
      try {
        const mealProduct = await Promise.race([
          findMostPopularProduct(aiResult.dishName),
          new Promise<null>((resolve) => 
            setTimeout(() => resolve(null), 5000) // 5 seconds for fallback
          )
        ]);
        if (mealProduct) {
          validProducts.push(mealProduct);
          console.log(`Found product using meal name: ${aiResult.dishName}`);
        }
      } catch (error) {
        console.warn(`Fallback search for meal name failed:`, error);
      }
    }

    // If we still have no products, try a more aggressive fallback
    if (validProducts.length === 0) {
      console.log("No products found, trying aggressive fallback with generic ingredients...");
      
      // Try generic ingredient searches
      const genericIngredients = ['pasta', 'rice', 'tomato', 'cheese', 'bread', 'vegetables'];
      for (const generic of genericIngredients) {
        try {
          const genericProduct = await Promise.race([
            findMostPopularProduct(generic),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
          ]);
          if (genericProduct) {
            validProducts.push(genericProduct);
            console.log(`Found fallback product: ${generic}`);
            break; // Stop after finding one
          }
        } catch (error) {
          console.warn(`Fallback search for ${generic} failed:`, error);
        }
      }
    }

    if (validProducts.length === 0) {
      throw new Error("Could not find products for the identified ingredients. Please try a different photo.");
    }

    // 4. SCORE: Calculate the hackathon score for the "Virtual Dish"
    console.log("Step 4: Calculating Scores...");
    const dishScoreResult = calculateDishScore(validProducts);

    // 5. FORMAT: Return clean data for the UI
    return {
      dishName: aiResult.dishName || "Food Dish",
      totalScore: dishScoreResult.totalScore,
      isInnovation: dishScoreResult.dishInnovation,
      products: validProducts.map(p => ({
        name: p.product_name || "Unknown Product",
        brand: p.brands || "Unknown Brand",
        image: p.image_url || "",
        score: p.nutriscore_score || 0, // Raw score
        ecoScore: p.ecoscore_grade || "unknown",
        offData: p 
      }))
    };
  } catch (error: any) {
    console.error("Error processing dish photo:", error);
    // Re-throw with user-friendly message
    throw new Error(error.message || "Failed to process image. Please try again with a clearer photo.");
  }
}

