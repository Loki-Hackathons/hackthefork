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
        ],
        "scores": {
          "vegetal": 45,
          "health": 70,
          "carbon": 60
        }
      }
      
      Examples:
      - {"dishName": "chicken curry", "ingredients": [{"name": "chicken", "confidence": 0.9, "category": "animal"}, {"name": "rice", "confidence": 0.8, "category": "plant"}, {"name": "curry sauce", "confidence": 0.7, "category": "plant"}], "scores": {"vegetal": 40, "health": 65, "carbon": 50}}
      - {"dishName": "burger", "ingredients": [{"name": "beef", "confidence": 0.95, "category": "animal"}, {"name": "bread", "confidence": 0.9, "category": "plant"}, {"name": "cheese", "confidence": 0.85, "category": "animal"}, {"name": "lettuce", "confidence": 0.7, "category": "plant"}], "scores": {"vegetal": 30, "health": 45, "carbon": 30}}
    `;

    // Try multiple models in order until one works - Gemini 3 Pro Preview first
    const modelsToTry = [
      "blackboxai/google/gemini-3-pro-preview",
      // Removed invalid models: blackboxai/gemini-pro-vision, blackboxai/gemini-1.5-pro, blackboxai/gpt-4o
      // These models are not available with the current API key
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
          max_tokens: 4000, // Increased to prevent truncation
          temperature: 0.1,
          stream: false,
          response_format: { type: "json_object" } // Enforce JSON object output
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
            console.warn(`Model ${model} response was truncated (finish_reason: length). Attempting to extract JSON anyway.`);
            // Continue anyway - we'll try to extract JSON from what we have
            // The JSON might still be valid even if truncated
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
    
    // Check reasoning_content (Gemini 3 Pro) - extract JSON if content is empty or contains reasoning
    if (!rawContent || rawContent.trim().length === 0 || rawContent.trim().startsWith('**')) {
      const reasoningContent = data.choices?.[0]?.message?.reasoning_content;
      if (reasoningContent) {
        // Try to find JSON object in reasoning content
        const firstBrace = reasoningContent.indexOf('{');
        if (firstBrace !== -1) {
          let braceCount = 0;
          let lastBrace = -1;
          for (let i = firstBrace; i < reasoningContent.length; i++) {
            if (reasoningContent[i] === '{') braceCount++;
            else if (reasoningContent[i] === '}') {
              braceCount--;
              if (braceCount === 0) { lastBrace = i; break; }
            }
          }
          if (lastBrace !== -1) {
            rawContent = reasoningContent.substring(firstBrace, lastBrace + 1);
            console.log(`Extracted JSON from reasoning_content`);
          } else {
            // Fallback: try regex match
            const jsonMatch = reasoningContent.match(/\{[\s\S]*"dishName"[\s\S]*\}/);
            if (jsonMatch) {
              rawContent = jsonMatch[0];
            }
          }
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

    // Return main analysis immediately, generate recommendations in background
    const response: AnalyzeResponse = {
      dishName: parsedResult.dishName.trim(),
      ingredients: normalizedIngredients,
      scores,
      recommendations: undefined // Will be loaded separately
    };

    // Generate recommendations in background (don't await)
    if (user_id) {
      // Fire and forget - generate recommendations asynchronously
      generateRecommendationsInBackground(
        parsedResult.dishName,
        normalizedIngredients,
        scores,
        user_id,
        liked_dishes
      ).catch(err => {
        console.error("Background recommendation generation failed:", err);
      });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: `Failed to analyze image: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

// Helper function to generate recommendations in background
async function generateRecommendationsInBackground(
  dishName: string,
  ingredients: any[],
  scores: any,
  userId: string,
  likedDishes: any
) {
  try {
    // Fetch user preferences
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('dietary_preference, weight_kg, activity_level')
      .eq('id', userId)
      .single();

    if (!userError && user) {
      // Get liked dishes names (if available) - map dish IDs to dish names
      const likedDishesIds = Array.isArray(likedDishes) ? likedDishes : [];
      // Map dish IDs to names (we'll use the IDs as context, actual names would come from database)
      const likedDishesContext = likedDishesIds.length > 0 
        ? `User liked ${likedDishesIds.length} dish(es) during onboarding - consider similar flavor profiles and cooking styles`
        : '';
          
          // Generate recommendations using AI - simplified prompt
          const recommendationPrompt = `Return only the JSON object.

Suggest 1-3 ingredient substitutions to improve sustainability scores.

Dish: ${dishName}
Ingredients: ${ingredients.map(i => i.name).join(', ')}
Scores: vegetal=${scores.vegetal}, health=${scores.health}, carbon=${scores.carbon}
Diet: ${user.dietary_preference || 50}/100 (0=vegan, 100=carnivore)

CRITICAL CONSTRAINTS:
- Return ONLY a STRICT JSON object (no markdown, no backticks, no extra text)
- Only suggest for existing ingredients: ${ingredients.map(i => i.name).join(', ')}
- Respect dietary preference
- scoreImprovement: estimated score improvement (5-50 points, weighted: vegetal 50%, health 25%, carbon 25%)

JSON Structure:
{
  "recommendations": [
    {
      "original": "ingredient name",
      "suggested": "alternative name",
      "scoreImprovement": number
    }
  ]
}

Examples:
- {"recommendations": [{"original": "ground beef", "suggested": "lentils", "scoreImprovement": 22}]}
- {"recommendations": [{"original": "white rice", "suggested": "brown rice", "scoreImprovement": 12}, {"original": "butter", "suggested": "olive oil", "scoreImprovement": 15}]}
- {"recommendations": []}`;

      // Try Gemini 3 Pro Preview first, then fallback to other models
      const recModelsToTry = [
        "blackboxai/google/gemini-3-pro-preview",
        // Removed invalid models: blackboxai/gemini-1.5-pro, blackboxai/gemini-pro-vision, blackboxai/gpt-4o
        // These models are not available with the current API key
      ];

      const apiKey = getBlackboxApiKey();
      let recData: any = null;
      let recContent: string | null = null;
      let recommendations: IngredientRecommendation[] = [];

          for (const recModel of recModelsToTry) {
            try {
              console.log(`Trying recommendation model: ${recModel}`);
              const recPayload = {
                model: recModel,
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: recommendationPrompt
                      }
                    ]
                  }
                ],
                max_tokens: 2000, // Reduced for faster response
                temperature: 0.1,
                stream: false,
                response_format: { type: "json_object" } // Enforce JSON object output
              };

              const fetchStartTime = Date.now();
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
              
              const recResponse = await fetch(BLACKBOX_API_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(recPayload),
                signal: controller.signal
              }).catch((fetchError: any) => {
                clearTimeout(timeoutId);
                if (fetchError.name === 'AbortError') {
                  console.warn(`Recommendation fetch timed out after ${Date.now() - fetchStartTime}ms`);
                }
                throw fetchError;
              });
              
              clearTimeout(timeoutId);
              console.log(`Recommendation API response status: ${recResponse.status} (took ${Date.now() - fetchStartTime}ms)`);

              if (recResponse.ok) {
                recData = await recResponse.json();
                console.log(`Recommendation API response structure:`, Object.keys(recData));
                console.log(`Recommendation choices length: ${recData.choices?.length || 0}`);
                if (recData.choices && recData.choices.length > 0) {
                  console.log(`First choice structure:`, Object.keys(recData.choices[0]));
                  console.log(`First choice message structure:`, recData.choices[0].message ? Object.keys(recData.choices[0].message) : 'no message');
                }
                const choice = recData.choices?.[0];
                const finishReason = choice?.finish_reason;
                
                // Check for content in multiple possible locations
                recContent = choice?.message?.content;
                
                // If content is empty or looks like reasoning, try to extract JSON from reasoning_content
                if ((!recContent || recContent.trim().startsWith('**')) && choice?.message?.reasoning_content) {
                  // Try to find JSON array in reasoning_content
                  const reasoningText = choice.message.reasoning_content;
                  const jsonStart = reasoningText.indexOf('[');
                  if (jsonStart !== -1) {
                    // Extract JSON array from reasoning content
                    let bracketCount = 0;
                    let jsonEnd = -1;
                    for (let i = jsonStart; i < reasoningText.length; i++) {
                      if (reasoningText[i] === '[') bracketCount++;
                      else if (reasoningText[i] === ']') {
                        bracketCount--;
                        if (bracketCount === 0) { jsonEnd = i; break; }
                      }
                    }
                    if (jsonEnd !== -1) {
                      recContent = reasoningText.substring(jsonStart, jsonEnd + 1);
                      console.log(`Extracted JSON from reasoning_content`);
                    }
                  }
                }
                
                // If still no content, use reasoning_content as fallback
                if (!recContent && choice?.message?.reasoning_content) {
                  recContent = choice.message.reasoning_content;
                  console.log(`Using reasoning_content as content`);
                }
                
                console.log(`Recommendation finish_reason: ${finishReason}`);
                console.log(`Recommendation content length: ${recContent?.length || 0}`);
                console.log(`Recommendation content preview: ${recContent?.substring(0, 200) || 'empty'}`);
                
                if (finishReason === 'length') {
                  console.warn(`Recommendation response was truncated (finish_reason: length). Content may be incomplete.`);
                }
                
                if (recContent) {
                  console.log(`Success with recommendation model: ${recModel}`);
                  break; // Success, exit loop
                } else {
                  console.warn(`Recommendation model ${recModel} returned OK but no content in response`);
                  console.warn(`Full response:`, JSON.stringify(recData, null, 2).substring(0, 500));
                }
              } else {
                const errorText = await recResponse.text().catch(() => 'Unknown error');
                console.warn(`Recommendation model ${recModel} failed: ${recResponse.status} - ${errorText.substring(0, 200)}`);
              }
            } catch (recError: any) {
              console.warn(`Error with recommendation model ${recModel}:`, recError?.message || recError);
              continue; // Try next model
            }
          }

      // Parse recommendations from response
      if (recContent) {
        try {
          // Clean and parse JSON object
          let cleanedRec = recContent.replace(/```json/g, '').replace(/```/g, '').trim();
          
          // Find JSON object
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
              if (recJson.recommendations && Array.isArray(recJson.recommendations)) {
                recommendations = recJson.recommendations;
              } else if (Array.isArray(recJson)) {
                // Fallback: if it's just an array, use it directly
                recommendations = recJson;
              }
            }
          }
        } catch (e) {
          console.warn("Failed to parse recommendations:", e);
        }
      }
      
      // Store recommendations in a simple in-memory cache (keyed by userId + dishName)
      // In production, you might want to use Redis or database
      const cacheKey = `${userId}_${dishName}`;
      if (recommendations.length > 0) {
        // Store in global cache (simple Map)
        if (!(global as any).recommendationCache) {
          (global as any).recommendationCache = new Map();
        }
        (global as any).recommendationCache.set(cacheKey, recommendations);
        console.log(`Stored recommendations in cache for key: ${cacheKey}`);
      }
    }
  } catch (recError) {
    console.warn("Error generating recommendations:", recError);
  }
}

// GET endpoint to fetch recommendations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const dishName = searchParams.get('dish_name');

    if (!userId || !dishName) {
      return NextResponse.json(
        { error: 'Missing user_id or dish_name parameter' },
        { status: 400 }
      );
    }

    const cacheKey = `${userId}_${dishName}`;
    if (!(global as any).recommendationCache) {
      (global as any).recommendationCache = new Map();
    }

    const recommendations = (global as any).recommendationCache.get(cacheKey);
    
    if (recommendations) {
      return NextResponse.json({ recommendations });
    } else {
      return NextResponse.json(
        { recommendations: null, message: 'Recommendations not ready yet' },
        { status: 202 } // Accepted but not ready
      );
    }
  } catch (error: any) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: `Failed to fetch recommendations: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
