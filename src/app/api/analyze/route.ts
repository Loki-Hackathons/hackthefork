// app/api/analyze/route.ts
// Unified AI analysis endpoint - extracts ingredients and calculates scores

import { NextRequest, NextResponse } from 'next/server';
import type { DetectedIngredient } from '@/lib/image-analysis';
import { supabase } from '@/lib/supabase';

const BLACKBOX_API_URL = "https://api.blackbox.ai/chat/completions";

// Get API key from environment variable
const getBlackboxApiKey = () => {
  const apiKey = process.env.BLACKBOX_API_KEY;
  if (!apiKey) {
    throw new Error('BLACKBOX_API_KEY environment variable is not set');
  }
  return apiKey;
};

export interface IngredientRecommendation {
  original: string;
  suggested: string;
  scoreImprovement: number;
}

export interface AnalyzeResponse {
  dishName: string;
  ingredients: DetectedIngredient[];
  scores: {
    vegetal: number;
    health: number;
    carbon: number;
  };
  recommendations?: IngredientRecommendation[];
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    let apiKey: string;
    try {
      apiKey = getBlackboxApiKey();
    } catch (error: any) {
      console.error("Blackbox API key not configured:", error.message);
      return NextResponse.json(
        { error: "Blackbox API key not configured. Please set BLACKBOX_API_KEY environment variable." },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    
    const { base64Image, user_id, liked_dishes } = body;

    if (!base64Image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Ensure base64Image has the data URL prefix
    let imageUrl = base64Image;
    if (!base64Image.startsWith("data:image/")) {
      imageUrl = `data:image/jpeg;base64,${base64Image}`;
    }

    // Prepare the prompt to extract dish name, ingredients, AND calculate scores
    const systemPrompt = `
      Return only the JSON object.

      You are a food analyst API. 
      Analyze this food image and identify:
      1. The name of the meal/dish
      2. All visible ingredients in the dish
      3. Calculate three sustainability scores (0-100) with proper weighting:
         - vegetal: How plant-based is this dish? (0 = all animal products, 100 = fully plant-based)
         - health: How healthy is this dish? (0 = very unhealthy, 100 = very healthy)
         - carbon: Environmental impact (0 = high carbon footprint, 100 = low carbon footprint)
      
      CRITICAL CONSTRAINTS:
      - Return ONLY a STRICT JSON object (no markdown, no backticks, no extra text)
      - Use simple, common ingredient names in English (e.g., "chicken", "rice", "broccoli", "cheese")
      - For each ingredient, classify it as:
        * "plant" - vegetables, grains, fruits (e.g., rice, pasta, broccoli, tomatoes)
        * "plant_protein" - plant-based proteins (e.g., tofu, lentils, beans, chickpeas)
        * "animal" - animal products (e.g., chicken, beef, fish, cheese, eggs)
      - Provide a confidence score (0.0 to 1.0) for each ingredient based on visibility
      - Include at least 3-8 ingredients if visible
      
      JSON Structure:
      {
        "dishName": "Name of the meal",
        "ingredients": [
          {
            "name": "ingredient name",
            "confidence": 0.85,
            "category": "plant" | "plant_protein" | "animal"
          }
        ]
      }
      
      Examples:
      - {"dishName": "chicken curry", "ingredients": [{"name": "chicken", "confidence": 0.9, "category": "animal"}, {"name": "rice", "confidence": 0.8, "category": "plant"}, {"name": "curry sauce", "confidence": 0.7, "category": "plant"}]}
      - {"dishName": "burger", "ingredients": [{"name": "beef", "confidence": 0.95, "category": "animal"}, {"name": "bread", "confidence": 0.9, "category": "plant"}, {"name": "cheese", "confidence": 0.85, "category": "animal"}, {"name": "lettuce", "confidence": 0.7, "category": "plant"}]}
    `;

    // Try multiple models in order until one works - Gemini 3 Pro Preview first
    const modelsToTry = [
      "blackboxai/google/gemini-3-pro-preview",
      "blackboxai/gpt-4o",
      "blackboxai/gemini-pro-vision",
      "blackboxai/gemini-1.5-pro",
    ];

    let lastError: any = null;
    let data: any = null;

    for (const model of modelsToTry) {
      try {
        const payload = {
          model: model,
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: systemPrompt 
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 4000, // Increased to handle full ingredient lists and complex dishes
          temperature: 0.1,
          stream: false,
          response_format: { type: "json_object" } // Enforce JSON output
        };

        console.log(`Trying model: ${model}`);

        const response = await fetch(BLACKBOX_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Model ${model} failed: ${response.status} - ${errorText}`);
          lastError = { status: response.status, message: errorText };
          continue;
        }

        const responseText = await response.text();
        console.log(`Success with model: ${model}`);
        console.log(`Response length: ${responseText.length} chars`);
        
        try {
          data = JSON.parse(responseText);
          
          // Check if the response was truncated by checking finish_reason
          const finishReason = data.choices?.[0]?.finish_reason;
          if (finishReason === 'length') {
            console.warn(`Model ${model} response was truncated (finish_reason: length)`);
            // Try next model if this one was truncated
            lastError = { status: response.status, message: "Response truncated (token limit)" };
            continue;
          }
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          console.error("Response preview:", responseText.substring(0, 500));
          lastError = { status: response.status, message: "Invalid JSON response" };
          continue;
        }
        
        break;

      } catch (error: any) {
        console.error(`Error with model ${model}:`, error);
        lastError = error;
        continue;
      }
    }

    if (!data) {
      console.error("All models failed. Last error:", lastError);
      return NextResponse.json(
        { error: `Blackbox API Error: No working model found. Last error: ${lastError?.status || 'Unknown'} - ${lastError?.message || 'Unknown error'}` },
        { status: lastError?.status || 500 }
      );
    }
    
    // Parse OpenAI-style response
    let rawContent = data.choices?.[0]?.message?.content;
    
    // Check reasoning_content (Gemini 3 Pro)
    if (!rawContent || rawContent.trim().length === 0) {
      const reasoningContent = data.choices?.[0]?.message?.reasoning_content;
      if (reasoningContent) {
        const jsonMatch = reasoningContent.match(/\{[\s\S]*"dishName"[\s\S]*\}/);
        if (jsonMatch) {
          rawContent = jsonMatch[0];
        } else {
          rawContent = reasoningContent;
        }
      }
    }
    
    if (!rawContent || rawContent.trim().length === 0) {
      rawContent = data.content || data.response || data.text || data.message?.content;
    }

    if (!rawContent || rawContent.trim().length === 0) {
      console.error("Full API response structure:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: "No content received from Blackbox API" },
        { status: 500 }
      );
    }

    // Clean up potential Markdown formatting and extract JSON
    let cleanedJson = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .trim();
    
    // More robust JSON extraction - find the first { and last } with balanced braces
    const firstBrace = cleanedJson.indexOf('{');
    if (firstBrace === -1) {
      console.error("No JSON object found in response. Raw content:", rawContent.substring(0, 500));
      return NextResponse.json(
        { error: "AI response does not contain valid JSON. Response may be in an unexpected format." },
        { status: 500 }
      );
    }
    
    // Start from the first brace
    cleanedJson = cleanedJson.substring(firstBrace);
    
    // Find the matching closing brace by counting braces
    let braceCount = 0;
    let lastBrace = -1;
    for (let i = 0; i < cleanedJson.length; i++) {
      if (cleanedJson[i] === '{') {
        braceCount++;
      } else if (cleanedJson[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          lastBrace = i;
          break;
        }
      }
    }
    
    if (lastBrace === -1) {
      console.error("Unbalanced braces in JSON. Content:", cleanedJson.substring(0, 500));
      console.error("Full cleaned JSON length:", cleanedJson.length);
      console.error("Last 200 chars:", cleanedJson.substring(Math.max(0, cleanedJson.length - 200)));
      
      // Check if response was truncated (common when max_tokens is too low)
      if (cleanedJson.length > 1900) {
        return NextResponse.json(
          { error: "AI response was truncated (likely exceeded token limit). Please try again or use a simpler image." },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: "AI response contains malformed JSON (unbalanced braces). The response may have been cut off." },
        { status: 500 }
      );
    }
    
    // Extract the complete JSON object
    cleanedJson = cleanedJson.substring(0, lastBrace + 1);

    let parsedResult: { 
      dishName: string; 
      ingredients: DetectedIngredient[]; 
      scores?: { vegetal: number; health: number; carbon: number };
    };
    try {
      parsedResult = JSON.parse(cleanedJson);
    } catch (parseError: any) {
      console.error("JSON Parse Error. Attempted to parse:", cleanedJson.substring(0, 200));
      console.error("Full raw content:", rawContent.substring(0, 500));
      return NextResponse.json(
        { error: `Failed to parse AI response: ${parseError.message || parseError}. The AI may have returned text before or after the JSON.` },
        { status: 500 }
      );
    }

    // Validate the result
    if (!parsedResult.dishName || parsedResult.dishName.trim().length === 0) {
      return NextResponse.json(
        { error: "AI did not return a valid meal name" },
        { status: 500 }
      );
    }

    // Validate and normalize ingredients
    if (!parsedResult.ingredients || !Array.isArray(parsedResult.ingredients)) {
      parsedResult.ingredients = [];
    }

    // Normalize ingredients to match our schema
    const normalizedIngredients: DetectedIngredient[] = parsedResult.ingredients
      .filter((ing: any) => ing && ing.name && ing.category)
      .map((ing: any) => ({
        name: ing.name.toLowerCase().trim(),
        confidence: Math.max(0, Math.min(1, ing.confidence || 0.7)),
        category: ['plant', 'plant_protein', 'animal'].includes(ing.category) 
          ? ing.category as 'plant' | 'plant_protein' | 'animal'
          : 'plant' as const
      }))
      .filter((ing: DetectedIngredient) => ing.name.length > 0);

    // Validate and normalize scores from AI
    let scores: { vegetal: number; health: number; carbon: number };
    if (parsedResult.scores && 
        typeof parsedResult.scores.vegetal === 'number' &&
        typeof parsedResult.scores.health === 'number' &&
        typeof parsedResult.scores.carbon === 'number') {
      // Use AI-provided scores, ensure they're in valid range
      scores = {
        vegetal: Math.max(0, Math.min(100, Math.round(parsedResult.scores.vegetal))),
        health: Math.max(0, Math.min(100, Math.round(parsedResult.scores.health))),
        carbon: Math.max(0, Math.min(100, Math.round(parsedResult.scores.carbon)))
      };
    } else {
      // Fallback: AI didn't provide scores, use default values
      console.warn("AI did not provide scores, using default values");
      scores = {
        vegetal: 50,
        health: 50,
        carbon: 50
      };
    }

    // Generate personalized recommendations if user_id is provided
    let recommendations: IngredientRecommendation[] = [];
    if (user_id) {
      try {
        // Fetch user preferences
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('dietary_preference, weight_kg, activity_level')
          .eq('id', user_id)
          .single();

        if (!userError && user) {
          // Get liked dishes names (if available) - map dish IDs to dish names
          const likedDishesIds = Array.isArray(liked_dishes) ? liked_dishes : [];
          // Map dish IDs to names (we'll use the IDs as context, actual names would come from database)
          const likedDishesContext = likedDishesIds.length > 0 
            ? `User liked ${likedDishesIds.length} dish(es) during onboarding - consider similar flavor profiles and cooking styles`
            : '';
          
          // Generate recommendations using AI with comprehensive context
          const recommendationPrompt = `
            Return only the JSON object.

            You are an expert nutritionist and sustainability advisor. Analyze this dish and suggest ingredient substitutions that will improve sustainability scores while respecting the user's preferences, dietary goals, and taste preferences.

            CURRENT DISH ANALYSIS:
            - Dish Name: ${parsedResult.dishName}
            - Current Ingredients: ${normalizedIngredients.map(i => `${i.name} (${i.category}, confidence: ${i.confidence.toFixed(2)})`).join(', ')}
            - Current Scores:
              * Vegetal: ${scores.vegetal}/100 (plant-based score)
              * Health: ${scores.health}/100 (nutritional quality)
              * Carbon: ${scores.carbon}/100 (environmental impact, higher = better)
            - Current Aggregated Score: ${Math.round(scores.vegetal * 0.5 + scores.health * 0.25 + scores.carbon * 0.25)}/100
            
            USER PROFILE:
            - Dietary Preference: ${user.dietary_preference || 50}/100 
              * 0-20 = Vegan (strictly plant-based)
              * 21-40 = Vegetarian (no meat, but may include dairy/eggs)
              * 41-60 = Flexitarian (mostly plant-based, occasional meat)
              * 61-80 = Omnivore (balanced plant and animal foods)
              * 81-100 = Carnivore (meat-heavy diet)
            - Weight: ${user.weight_kg || 'unknown'} kg
            - Activity Level: ${user.activity_level || 2}/4
              * 0 = Sedentary (little to no exercise)
              * 1 = Light (1-3 days/week)
              * 2 = Moderate (3-5 days/week)
              * 3 = Active (6-7 days/week)
              * 4 = Very Active (2x per day or intense training)
            ${likedDishesContext ? `- ${likedDishesContext}` : ''}
            
            TASK:
            Suggest 1-4 ingredient substitutions that will:
            1. IMPROVE SCORES: Calculate the expected improvement in vegetal, health, and carbon scores
            2. RESPECT DIETARY PREFERENCE: 
               - If vegan (0-20): Only suggest plant-based alternatives
               - If vegetarian (21-40): Suggest plant-based or dairy/egg alternatives
               - If flexitarian (41-60): Prefer plant-based but allow lean animal proteins
               - If omnivore (61-80): Balance plant and animal, prefer sustainable animal options
               - If carnivore (81-100): Suggest leaner, more sustainable animal proteins
            3. MATCH TASTE PREFERENCES: Consider the user's liked dishes to suggest similar flavors/textures
            4. CONSIDER NUTRITIONAL NEEDS: Based on weight and activity level, ensure adequate protein/calories
            5. MAINTAIN DISH CHARACTER: Substitutions should preserve the dish's essence
            
            SCORE IMPROVEMENT CALCULATION:
            For each substitution, estimate the improvement in the aggregated score (weighted: vegetal 50%, health 25%, carbon 25%).
            Consider:
            - Vegetal improvement: How much more plant-based does this make the dish? (0-30 points possible)
            - Health improvement: Nutritional quality increase? (0-20 points possible)
            - Carbon improvement: Environmental impact reduction? (0-20 points possible)
            - Total scoreImprovement should be the weighted sum: (vegetal_improvement * 0.5) + (health_improvement * 0.25) + (carbon_improvement * 0.25)
            - Range: 5-50 points per substitution (be realistic, most improvements are 10-25 points)
            
            CRITICAL: Return ONLY a valid JSON array. No markdown, no backticks, no explanations, no other text.
            
            The response must be a JSON array with this exact structure:
            [
              {
                "original": "exact ingredient name to replace",
                "suggested": "specific alternative ingredient name",
                "scoreImprovement": number
              }
            ]
            
            Rules:
            - Return ONLY the array, nothing before or after
            - Only suggest substitutions for ingredients that exist in: ${normalizedIngredients.map(i => i.name).join(', ')}
            - Be specific with names (e.g., "ground beef" not "meat")
            - Prioritize substitutions matching dietary preference: ${user.dietary_preference || 50}/100
            - scoreImprovement: estimated aggregated score improvement (5-50 points)
            - If dish scores well (>80) or matches preferences, suggest 1-2 minor improvements
            - If no improvements exist, return: []
          `;

          // Try Gemini 3 Pro Preview first, then fallback to other models
          const recModelsToTry = [
            "blackboxai/google/gemini-3-pro-preview",
            "blackboxai/gpt-4o",
            "blackboxai/gemini-pro-vision",
          ];

          let recData: any = null;
          let recContent: string | null = null;

          for (const recModel of recModelsToTry) {
            try {
              const recPayload = {
                model: recModel,
                messages: [
                  {
                    role: "user",
                    content: recommendationPrompt
                  }
                ],
                max_tokens: 2000,
                temperature: 0.2,
                stream: false
                // Note: Not using json_object mode since we want a JSON array, not an object
              };

              const recResponse = await fetch(BLACKBOX_API_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(recPayload)
              });

              if (recResponse.ok) {
                recData = await recResponse.json();
                recContent = recData.choices?.[0]?.message?.content;
                if (recContent) {
                  break; // Success, exit loop
                }
              } else {
                console.warn(`Recommendation model ${recModel} failed: ${recResponse.status}`);
              }
            } catch (recError) {
              console.warn(`Error with recommendation model ${recModel}:`, recError);
              continue; // Try next model
            }
          }

          // Parse recommendations from response
          if (recContent) {
            try {
              // Clean and parse JSON - look for array first, then object
              let cleanedRec = recContent.replace(/```json/g, '').replace(/```/g, '').trim();
              
              // Try to find JSON array first
              const firstBracket = cleanedRec.indexOf('[');
              if (firstBracket !== -1) {
                cleanedRec = cleanedRec.substring(firstBracket);
                let bracketCount = 0;
                let lastBracket = -1;
                for (let i = 0; i < cleanedRec.length; i++) {
                  if (cleanedRec[i] === '[') bracketCount++;
                  else if (cleanedRec[i] === ']') {
                    bracketCount--;
                    if (bracketCount === 0) { lastBracket = i; break; }
                  }
                }
                if (lastBracket !== -1) {
                  cleanedRec = cleanedRec.substring(0, lastBracket + 1);
                  const recJson = JSON.parse(cleanedRec);
                  if (Array.isArray(recJson)) {
                    recommendations = recJson;
                  }
                }
              } else {
                // Fallback: try to find JSON object with recommendations array
                const firstBrace = cleanedRec.indexOf('{');
                if (firstBrace !== -1) {
                  cleanedRec = cleanedRec.substring(firstBrace);
                  let braceCount = 0;
                  let lastBrace = -1;
                  for (let i = 0; i < cleanedRec.length; i++) {
                    if (cleanedRec[i] === '{') braceCount++;
                    else if (cleanedRec[i] === '}') {
                      braceCount--;
                      if (braceCount === 0) { lastBrace = i; break; }
                    }
                  }
                  if (lastBrace !== -1) {
                    cleanedRec = cleanedRec.substring(0, lastBrace + 1);
                    const recJson = JSON.parse(cleanedRec);
                    if (Array.isArray(recJson)) {
                      recommendations = recJson;
                    } else if (recJson.recommendations && Array.isArray(recJson.recommendations)) {
                      recommendations = recJson.recommendations;
                    }
                  }
                }
              }
            } catch (e) {
              console.warn("Failed to parse recommendations:", e);
            }
          }
        }
      } catch (recError) {
        console.warn("Error generating recommendations:", recError);
        // Continue without recommendations
      }
    }

    const response: AnalyzeResponse = {
      dishName: parsedResult.dishName.trim(),
      ingredients: normalizedIngredients,
      scores,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: `Failed to analyze image: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
