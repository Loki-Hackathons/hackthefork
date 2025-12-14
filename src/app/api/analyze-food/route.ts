// app/api/analyze-food/route.ts
// Next.js API Route to proxy Blackbox AI requests (bypasses CORS)

import { NextRequest, NextResponse } from 'next/server';

const BLACKBOX_API_URL = "https://api.blackbox.ai/chat/completions";

// Get API key from environment variable
const getBlackboxApiKey = () => {
  const apiKey = process.env.BLACKBOX_API_KEY;
  if (!apiKey) {
    throw new Error('BLACKBOX_API_KEY environment variable is not set');
  }
  return apiKey;
};

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

    // Prepare the Prompt
    const systemPrompt = `
      You are a food analyst API. 
      Analyze this food image and identify ONLY the name of the meal/dish.
      
      CRITICAL CONSTRAINTS:
      - Return ONLY the meal name (e.g., "burger", "pasta bolognese", "chicken curry", "sushi")
      - Use simple, common meal names in English
      - Do NOT mention brands or specific restaurants
      - Return ONLY a STRICT JSON object (no markdown, no backticks, no extra text)
      
      JSON Structure:
      {
        "dishName": "Name of the meal"
      }
      
      Examples:
      - {"dishName": "burger"}
      - {"dishName": "pasta bolognese"}
      - {"dishName": "chicken curry"}
      - {"dishName": "sushi"}
    `;

    // Try multiple models in order until one works
    const modelsToTry = [
      "blackboxai/google/gemini-3-pro-preview", // User's requested model
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
          max_tokens: 500, // Increased to allow reasoning + response (Gemini 3 Pro needs reasoning tokens)
          temperature: 0.1,
          stream: false
        };

        console.log(`Trying model: ${model}`);

        // Make the Request to Blackbox API
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
          continue; // Try next model
        }

        const responseText = await response.text();
        console.log(`Success with model: ${model}`);
        console.log("Blackbox API Raw Response:", responseText.substring(0, 500)); // Log first 500 chars
        
        try {
          data = JSON.parse(responseText);
          console.log("Blackbox API Parsed Response:", JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          console.error("Raw response:", responseText);
          lastError = { status: response.status, message: "Invalid JSON response" };
          continue; // Try next model
        }
        
        break; // Success! Exit loop

      } catch (error: any) {
        console.error(`Error with model ${model}:`, error);
        lastError = error;
        continue; // Try next model
      }
    }

    // If all models failed
    if (!data) {
      console.error("All models failed. Last error:", lastError);
      return NextResponse.json(
        { error: `Blackbox API Error: No working model found. Last error: ${lastError?.status || 'Unknown'} - ${lastError?.message || 'Unknown error'}. Please check available models at https://api.blackbox.ai/v1/models` },
        { status: lastError?.status || 500 }
      );
    }
    
    // Parse OpenAI-style response
    // Check multiple possible response structures
    let rawContent = data.choices?.[0]?.message?.content;
    
    // Alternative response formats
    if (!rawContent || rawContent.trim().length === 0) {
      // Check reasoning_content (Gemini 3 Pro)
      const reasoningContent = data.choices?.[0]?.message?.reasoning_content;
      if (reasoningContent) {
        console.log("Content empty, checking reasoning_content...");
        // Try to extract JSON from reasoning content
        const jsonMatch = reasoningContent.match(/\{[\s\S]*"dishName"[\s\S]*\}/);
        if (jsonMatch) {
          rawContent = jsonMatch[0];
          console.log("Extracted JSON from reasoning_content:", rawContent);
        } else {
          // If no JSON found, use the reasoning content as-is and try to extract dish name
          rawContent = reasoningContent;
        }
      }
    }
    
    // Check other possible fields
    if (!rawContent || rawContent.trim().length === 0) {
      rawContent = data.content || data.response || data.text || data.message?.content;
    }
    
    // Check if content is in a different structure
    if (!rawContent || rawContent.trim().length === 0) {
      // Try to find content in nested structures
      if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0];
        rawContent = choice.content || choice.text || choice.message?.text || choice.delta?.content;
      }
    }

    if (!rawContent || rawContent.trim().length === 0) {
      console.error("Full API response structure:", JSON.stringify(data, null, 2));
      console.error("Available keys in data:", Object.keys(data));
      if (data.choices && data.choices[0]) {
        console.error("Available keys in choices[0]:", Object.keys(data.choices[0]));
        if (data.choices[0].message) {
          console.error("Available keys in message:", Object.keys(data.choices[0].message));
        }
      }
      return NextResponse.json(
        { 
          error: "No content received from Blackbox API. Response may have been truncated or in an unexpected format.",
          debug: {
            hasChoices: !!data.choices,
            choicesLength: data.choices?.length || 0,
            responseKeys: Object.keys(data)
          }
        },
        { status: 500 }
      );
    }

    // Clean up potential Markdown formatting
    let cleanedJson = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\*\*/g, "") // Remove markdown bold (**text**)
      .replace(/\*/g, "") // Remove markdown italic (*text*)
      .trim();
    
    // Try to extract JSON if it's wrapped in other text
    // Look for JSON object pattern, handling nested braces
    const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedJson = jsonMatch[0];
    }
    
    // Additional cleanup: remove any leading text before the first {
    const firstBrace = cleanedJson.indexOf('{');
    if (firstBrace > 0) {
      cleanedJson = cleanedJson.substring(firstBrace);
    }
    
    // Remove any trailing text after the last }
    const lastBrace = cleanedJson.lastIndexOf('}');
    if (lastBrace >= 0 && lastBrace < cleanedJson.length - 1) {
      cleanedJson = cleanedJson.substring(0, lastBrace + 1);
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw content:", rawContent);
      return NextResponse.json(
        { error: `Failed to parse AI response: ${parseError}` },
        { status: 500 }
      );
    }

    // Validate the result
    if (!parsedResult.dishName || parsedResult.dishName.trim().length === 0) {
      console.warn("AI returned incomplete data:", parsedResult);
      // Try to extract dish name from raw text
      const dishNameMatch = rawContent.match(/"dishName":\s*"([^"]+)"/);
      if (dishNameMatch) {
        parsedResult.dishName = dishNameMatch[1];
      } else {
        return NextResponse.json(
          { error: "AI did not return a valid meal name" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(parsedResult);

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: `Failed to analyze image: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

