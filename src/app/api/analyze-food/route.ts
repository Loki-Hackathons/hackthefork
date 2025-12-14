// app/api/analyze-food/route.ts
// Next.js API Route to proxy Blackbox AI requests (bypasses CORS)

import { NextRequest, NextResponse } from 'next/server';

const BLACKBOX_API_KEY = "sk-ZRDD5Yygu4l7EQYGG3nJIg";
const BLACKBOX_API_URL = "https://api.blackbox.ai/chat/completions";

export async function POST(request: NextRequest) {
  try {
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
          max_tokens: 200, // Increased to allow reasoning + response (Gemini 3 Pro needs reasoning tokens)
          temperature: 0.1,
          stream: false
        };

        console.log(`Trying model: ${model}`);

        // Make the Request to Blackbox API
        const response = await fetch(BLACKBOX_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${BLACKBOX_API_KEY}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Model ${model} failed: ${response.status} - ${errorText}`);
          lastError = { status: response.status, message: errorText };
          continue; // Try next model
        }

        data = await response.json();
        console.log(`Success with model: ${model}`);
        console.log("Blackbox API Response:", JSON.stringify(data, null, 2));
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
    // Gemini 3 Pro sometimes puts content in reasoning_content, so check both
    let rawContent = data.choices?.[0]?.message?.content;
    
    // Fallback: if content is empty but reasoning_content exists, try to extract from it
    if (!rawContent || rawContent.trim().length === 0) {
      const reasoningContent = data.choices?.[0]?.message?.reasoning_content;
      if (reasoningContent) {
        console.log("Content empty, checking reasoning_content for JSON...");
        // Try to extract JSON from reasoning content
        const jsonMatch = reasoningContent.match(/\{[\s\S]*"dishName"[\s\S]*\}/);
        if (jsonMatch) {
          rawContent = jsonMatch[0];
          console.log("Extracted JSON from reasoning_content:", rawContent);
        }
      }
    }

    if (!rawContent || rawContent.trim().length === 0) {
      console.error("Full API response:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: "No content received from Blackbox API. Response may have been truncated." },
        { status: 500 }
      );
    }

    // Clean up potential Markdown formatting
    let cleanedJson = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedJson = jsonMatch[0];
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

