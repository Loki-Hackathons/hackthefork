// app/api/analyze/route.ts
// Unified AI analysis endpoint - extracts ingredients and calculates scores

import { NextRequest, NextResponse } from 'next/server';
import { calculateScores } from '@/lib/scoring';
import type { DetectedIngredient } from '@/lib/image-analysis';

const BLACKBOX_API_URL = "https://api.blackbox.ai/chat/completions";

// Get API key from environment variable
const getBlackboxApiKey = () => {
  const apiKey = process.env.BLACKBOX_API_KEY;
  if (!apiKey) {
    throw new Error('BLACKBOX_API_KEY environment variable is not set');
  }
  return apiKey;
};

export interface AnalyzeResponse {
  dishName: string;
  ingredients: DetectedIngredient[];
  scores: {
    vegetal: number;
    health: number;
    carbon: number;
  };
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
    
    const { base64Image } = body;

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

    // Prepare the prompt to extract dish name AND ingredients
    const systemPrompt = `
      Return only the JSON object.

      You are a food analyst API. 
      Analyze this food image and identify:
      1. The name of the meal/dish
      2. All visible ingredients in the dish
      
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

    // Try multiple models in order until one works
    const modelsToTry = [
      "blackboxai/google/gemini-3-pro-preview",
      "blackboxai/gemini-pro-vision",
      "blackboxai/gemini-1.5-pro",
      "blackboxai/gpt-4o",
      "gpt-4o",
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

    let parsedResult: { dishName: string; ingredients: DetectedIngredient[] };
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

    // Calculate scores immediately
    const scores = calculateScores(normalizedIngredients);

    const response: AnalyzeResponse = {
      dishName: parsedResult.dishName.trim(),
      ingredients: normalizedIngredients,
      scores
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
