// services/blackboxVision.ts
// Client-side function that calls Next.js API route (bypasses CORS)

export interface AIAnalysisResult {
  dishName: string;
}

export async function analyzeImageWithBlackbox(base64Image: string): Promise<AIAnalysisResult> {
  try {
    console.log("🤖 Calling Blackbox AI API...");
    
    // Call our Next.js API route instead of calling Blackbox directly
    // This bypasses CORS and keeps the API key secure on the server
    const response = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image }),
    });

    console.log("📡 Received response from API, status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error("❌ API error:", errorData);
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ AI identified dish:", result.dishName);
    
    // Validate the result
    if (!result.dishName || result.dishName.trim().length === 0) {
      throw new Error("AI did not return a valid meal name");
    }

    return result as AIAnalysisResult;

  } catch (error: any) {
    console.error("Blackbox Vision Error:", error);
    
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

