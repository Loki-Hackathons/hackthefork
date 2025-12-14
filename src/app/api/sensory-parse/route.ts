// API endpoint for parsing sensory comments using NLP
// Uses Blackbox API with Gemini 3 Pro Preview to extract sensory dimensions

import { NextRequest, NextResponse } from 'next/server';
import type { SensoryDimensions, SensoryTag } from '@/services/sensoryNLP';

const BLACKBOX_API_URL = "https://api.blackbox.ai/chat/completions";

const getBlackboxApiKey = () => {
  const apiKey = process.env.BLACKBOX_API_KEY;
  if (!apiKey) {
    throw new Error('BLACKBOX_API_KEY environment variable is not set');
  }
  return apiKey;
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = getBlackboxApiKey();
    const body = await request.json();
    const { comment } = body;

    if (!comment || typeof comment !== 'string') {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      );
    }

    // Prompt for extracting sensory dimensions
    const systemPrompt = `
You are a sensory science expert analyzing food reviews for plant-based meat alternatives (PBMAs).

Your task is to parse the user's comment and extract sensory dimensions based on the CATA (Check-All-That-Apply) method.

CRITICAL CONSTRAINTS:
- Return ONLY a STRICT JSON object (no markdown, no backticks, no extra text)
- Extract specific sensory tags from the predefined lists below
- Classify each tag by category and valence (positive/negative)
- Detect visual expectations and disconfirmation patterns

SENSORY TAGS TAXONOMY:

BARRIER TAGS (Negative sensory defects):
- beany, wheaty, dry, granular, off-flavour, bitter, astringent, cardboard, musty, earthy, chalky, mealy, rubbery, tough, spongy, watery, bland, artificial, chemical

DRIVER TAGS (Positive sensory attributes):
- juicy, meaty, umami, tender, crispy, succulent, savory, rich, flavorful, aromatic, moist, firm, smooth, creamy

TEXTURE TAGS:
- crispy, crunchy, tender, juicy, dry, moist, firm, soft, tough, chewy, smooth, grainy, granular, mealy, rubbery, spongy, creamy, watery, succulent

FLAVOUR TAGS:
- umami, savory, meaty, rich, flavorful, aromatic, bland, bitter, astringent, beany, wheaty, earthy, musty, cardboard, off-flavour, artificial, chemical

ANALYSIS FRAMEWORK:
1. Identify all applicable sensory tags from the comment
2. Determine primary texture descriptor
3. Determine primary flavour descriptor
4. Detect visual expectation cues (e.g., "looked great", "looked unappetizing")
5. Detect disconfirmation patterns (e.g., "looked good but tasted dry" = negative disconfirmation)

JSON Structure:
{
  "texture": "primary texture descriptor or null",
  "flavour": "primary flavour descriptor or null",
  "visual_expectation": "high" | "medium" | "low" | null,
  "disconfirmation": "positive" | "negative" | "neutral" | null,
  "tags": [
    {
      "tag": "tag name from taxonomy",
      "category": "barrier" | "driver" | "texture" | "flavour" | "visual" | "other",
      "valence": "positive" | "negative" | "neutral",
      "confidence": 0.0 to 1.0
    }
  ]
}

EXAMPLES:

Input: "The burger looked great but it was dry and tasted like cardboard."
Output: {
  "texture": "dry",
  "flavour": "cardboard",
  "visual_expectation": "high",
  "disconfirmation": "negative",
  "tags": [
    {"tag": "dry", "category": "texture", "valence": "negative", "confidence": 0.95},
    {"tag": "cardboard", "category": "flavour", "valence": "negative", "confidence": 0.90}
  ]
}

Input: "Surprisingly juicy and meaty, better than I expected!"
Output: {
  "texture": "juicy",
  "flavour": "meaty",
  "visual_expectation": "medium",
  "disconfirmation": "positive",
  "tags": [
    {"tag": "juicy", "category": "driver", "valence": "positive", "confidence": 0.95},
    {"tag": "meaty", "category": "driver", "valence": "positive", "confidence": 0.95}
  ]
}

Input: "Had a weird beany taste and the texture was spongy."
Output: {
  "texture": "spongy",
  "flavour": "beany",
  "visual_expectation": null,
  "disconfirmation": null,
  "tags": [
    {"tag": "beany", "category": "barrier", "valence": "negative", "confidence": 0.90},
    {"tag": "spongy", "category": "texture", "valence": "negative", "confidence": 0.85}
  ]
}

Now parse this comment:
"${comment}"
`;

    // Use Gemini 3 Pro Preview for advanced NLP
    const payload = {
      model: "blackboxai/google/gemini-3-pro-preview",
      messages: [
        {
          role: "user",
          content: systemPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.1,
      stream: false,
      response_format: { type: "json_object" }
    };

    console.log(`Parsing sensory comment with Gemini 3 Pro Preview...`);

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
      console.error(`Blackbox API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `API Error: ${response.status}` },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    // Extract content from response
    let rawContent = data.choices?.[0]?.message?.content;
    
    if (!rawContent) {
      const reasoningContent = data.choices?.[0]?.message?.reasoning_content;
      if (reasoningContent) {
        const jsonMatch = reasoningContent.match(/\{[\s\S]*"tags"[\s\S]*\}/);
        if (jsonMatch) {
          rawContent = jsonMatch[0];
        } else {
          rawContent = reasoningContent;
        }
      }
    }

    if (!rawContent) {
      console.error("No content in API response:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: "No content received from AI" },
        { status: 500 }
      );
    }

    // Clean and parse JSON
    let cleanedJson = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleanedJson.indexOf('{');
    if (firstBrace === -1) {
      return NextResponse.json(
        { error: "AI response does not contain valid JSON" },
        { status: 500 }
      );
    }

    cleanedJson = cleanedJson.substring(firstBrace);

    // Find matching closing brace
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
      return NextResponse.json(
        { error: "AI response contains malformed JSON" },
        { status: 500 }
      );
    }

    cleanedJson = cleanedJson.substring(0, lastBrace + 1);

    const parsedResult: SensoryDimensions = JSON.parse(cleanedJson);

    // Validate and normalize the result
    if (!parsedResult.tags || !Array.isArray(parsedResult.tags)) {
      parsedResult.tags = [];
    }

    // Ensure tags have required fields
    parsedResult.tags = parsedResult.tags.map((tag: any) => ({
      tag: tag.tag || 'unknown',
      category: tag.category || 'other',
      valence: tag.valence || 'neutral',
      confidence: Math.max(0, Math.min(1, tag.confidence || 0.7))
    }));

    return NextResponse.json(parsedResult);

  } catch (error: any) {
    console.error("Sensory Parse API Error:", error);
    return NextResponse.json(
      { error: `Failed to parse comment: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
