// services/aiVision.ts
// Using Blackbox AI API (OpenAI-compatible)

const BLACKBOX_API_KEY = "sk-ZRDD5Yygu4l7EQYGG3nJIg";
const BLACKBOX_API_URL = "https://api.blackbox.ai/v1/chat/completions";

export interface AIAnalysisResult {
  dishName: string;
}

export async function analyzeImageForMeal(base64Image: string): Promise<AIAnalysisResult> {
  try {
    // Check if API key is configured
    if (!BLACKBOX_API_KEY) {
      throw new Error("Blackbox API key is not configured.");
    }

    // The Prompt: identify the meal name only
    const prompt = `
      Analyze this food image and identify the name of the meal/dish.
      
      CRITICAL CONSTRAINTS:
      - Return ONLY the meal name (e.g., "burger", "pasta bolognese", "chicken curry", "sushi")
      - Use simple, common meal names in English
      - Do NOT mention brands or specific restaurants
      - Return ONLY a raw JSON object (no markdown formatting)
      
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

    // Prepare image part
    // Extract mime type from base64 string if present, default to jpeg
    const mimeTypeMatch = base64Image.match(/^data:image\/(\w+);base64,/);
    const mimeType = mimeTypeMatch ? `image/${mimeTypeMatch[1]}` : "image/jpeg";
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    if (!base64Data || base64Data.length === 0) {
      throw new Error("Invalid image data");
    }

    // Make request to Blackbox AI API (OpenAI-compatible format)
    // Try different image formats - some models prefer different structures
    const imageUrl = `data:${mimeType};base64,${base64Data}`;
    
    const requestBody = {
      model: "blackboxai/google/gemini-3-pro-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "auto" // Add detail parameter for better image processing
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    };
    
    console.log("Sending request to Blackbox API with model:", requestBody.model);
    console.log("Image data length:", base64Data.length, "MIME type:", mimeType);
    
    const response = await fetch(BLACKBOX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BLACKBOX_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Blackbox API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("Blackbox API Response:", JSON.stringify(data, null, 2));
    
    // Check different possible response structures
    let text = data.choices?.[0]?.message?.content;
    
    // Alternative response formats
    if (!text && data.content) {
      text = data.content;
    }
    if (!text && data.response) {
      text = data.response;
    }
    if (!text && data.text) {
      text = data.text;
    }
    
    // If still no text, log the full response for debugging
    if (!text || text.trim().length === 0) {
      console.error("Empty response from Blackbox API. Full response:", data);
      throw new Error(`Empty response from Blackbox API. Response structure: ${JSON.stringify(data)}`);
    }

    // Clean up markdown if AI adds it (e.g. ```json ... ```)
    let cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    let parsedResult: AIAnalysisResult;
    try {
      parsedResult = JSON.parse(cleanedText) as AIAnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error. Raw response:", text);
      throw new Error(`Failed to parse AI response: ${parseError}`);
    }

    // Validate the result
    if (!parsedResult.dishName || parsedResult.dishName.trim().length === 0) {
      console.warn("AI returned incomplete data:", parsedResult);
      // Try to extract dish name from raw text
      const dishNameMatch = text.match(/"dishName":\s*"([^"]+)"/);
      if (dishNameMatch) {
        parsedResult.dishName = dishNameMatch[1];
      } else {
        throw new Error("AI did not return a valid meal name");
      }
    }

    return parsedResult;

  } catch (error: any) {
    console.error("Blackbox AI Vision Error:", error);
    
    // Provide more specific error messages
    if (error.message?.includes("API key")) {
      throw new Error("Blackbox API key is not configured.");
    }
    
    if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      throw new Error("API quota exceeded. Please try again later.");
    }
    
    if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
      throw new Error("Invalid API key. Please check your Blackbox API key.");
    }
    
    // Re-throw with more context
    throw new Error(`Failed to analyze image: ${error.message || "Unknown error"}`);
  }
}

