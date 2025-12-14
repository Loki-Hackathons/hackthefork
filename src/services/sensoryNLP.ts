// Sensory NLP Parser
// Converts natural language comments into CATA (Check-All-That-Apply) sensory tags
// Based on sensory science frameworks for PBMA (Plant-Based Meat Alternatives)

export interface SensoryTag {
  tag: string;
  category: 'barrier' | 'driver' | 'texture' | 'flavour' | 'visual' | 'other';
  valence: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface SensoryDimensions {
  texture?: string;
  flavour?: string;
  visual_expectation?: 'high' | 'medium' | 'low';
  disconfirmation?: 'positive' | 'negative' | 'neutral';
  tags: SensoryTag[];
}

// CATA Attributes derived from sensory science literature
// Negative Tags (Barriers) - common sensory defects in PBMAs
const BARRIER_TAGS = [
  'beany', 'wheaty', 'dry', 'granular', 'off-flavour', 'bitter', 'astringent',
  'cardboard', 'musty', 'earthy', 'chalky', 'mealy', 'rubbery', 'tough',
  'spongy', 'watery', 'bland', 'artificial', 'chemical'
];

// Positive Tags (Drivers) - desirable sensory attributes
const DRIVER_TAGS = [
  'juicy', 'meaty', 'umami', 'tender', 'crispy', 'succulent', 'savory',
  'rich', 'flavorful', 'aromatic', 'moist', 'firm', 'smooth', 'creamy'
];

const TEXTURE_TAGS = [
  'crispy', 'crunchy', 'tender', 'juicy', 'dry', 'moist', 'firm', 'soft',
  'tough', 'chewy', 'smooth', 'grainy', 'granular', 'mealy', 'rubbery',
  'spongy', 'creamy', 'watery', 'succulent'
];

const FLAVOUR_TAGS = [
  'umami', 'savory', 'meaty', 'rich', 'flavorful', 'aromatic', 'bland',
  'bitter', 'astringent', 'beany', 'wheaty', 'earthy', 'musty', 'cardboard',
  'off-flavour', 'artificial', 'chemical'
];

/**
 * Parse natural language comment into sensory dimensions using AI
 * Uses Blackbox API with Gemini 3 Pro Preview for NLP parsing
 */
export async function parseSensoryComment(comment: string): Promise<SensoryDimensions> {
  try {
    const response = await fetch('/api/sensory-parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to parse sensory comment');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Sensory NLP Error:', error);
    
    // Fallback to basic keyword matching if API fails
    return fallbackKeywordParsing(comment);
  }
}

/**
 * Fallback keyword-based parsing when AI is unavailable
 * Simple but effective for common sensory terms
 */
function fallbackKeywordParsing(comment: string): SensoryDimensions {
  const lowerComment = comment.toLowerCase();
  const tags: SensoryTag[] = [];

  // Check for barrier tags
  BARRIER_TAGS.forEach(tag => {
    if (lowerComment.includes(tag)) {
      tags.push({
        tag,
        category: determineCategory(tag),
        valence: 'negative',
        confidence: 0.8
      });
    }
  });

  // Check for driver tags
  DRIVER_TAGS.forEach(tag => {
    if (lowerComment.includes(tag)) {
      tags.push({
        tag,
        category: determineCategory(tag),
        valence: 'positive',
        confidence: 0.8
      });
    }
  });

  // Determine texture and flavour from detected tags
  const textureTag = tags.find(t => TEXTURE_TAGS.includes(t.tag));
  const flavourTag = tags.find(t => FLAVOUR_TAGS.includes(t.tag));

  // Detect visual expectation
  let visual_expectation: 'high' | 'medium' | 'low' | undefined;
  if (lowerComment.match(/looked? (great|amazing|beautiful|good|nice)/i)) {
    visual_expectation = 'high';
  } else if (lowerComment.match(/looked? (okay|fine|decent)/i)) {
    visual_expectation = 'medium';
  } else if (lowerComment.match(/looked? (bad|ugly|unappetizing)/i)) {
    visual_expectation = 'low';
  }

  // Detect disconfirmation
  let disconfirmation: 'positive' | 'negative' | 'neutral' | undefined;
  if (lowerComment.match(/but|however|though|unfortunately/i) && visual_expectation === 'high') {
    disconfirmation = 'negative';
  } else if (lowerComment.match(/and|better than expected|surprisingly good/i)) {
    disconfirmation = 'positive';
  }

  return {
    texture: textureTag?.tag,
    flavour: flavourTag?.tag,
    visual_expectation,
    disconfirmation,
    tags
  };
}

/**
 * Determine category for a sensory tag
 */
function determineCategory(tag: string): 'barrier' | 'driver' | 'texture' | 'flavour' | 'other' {
  if (BARRIER_TAGS.includes(tag)) {
    if (TEXTURE_TAGS.includes(tag)) return 'texture';
    if (FLAVOUR_TAGS.includes(tag)) return 'flavour';
    return 'barrier';
  }
  if (DRIVER_TAGS.includes(tag)) {
    if (TEXTURE_TAGS.includes(tag)) return 'texture';
    if (FLAVOUR_TAGS.includes(tag)) return 'flavour';
    return 'driver';
  }
  if (TEXTURE_TAGS.includes(tag)) return 'texture';
  if (FLAVOUR_TAGS.includes(tag)) return 'flavour';
  return 'other';
}

/**
 * Get all available CATA tags for UI selection
 */
export function getCATATags(): {
  barriers: string[];
  drivers: string[];
  texture: string[];
  flavour: string[];
} {
  return {
    barriers: BARRIER_TAGS,
    drivers: DRIVER_TAGS,
    texture: TEXTURE_TAGS,
    flavour: FLAVOUR_TAGS
  };
}
