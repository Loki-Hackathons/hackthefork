# Industrial Dashboard - Sensory Disconfirmation Engine

**B2B Intelligence Platform for PBMA (Plant-Based Meat Alternatives) Reformulation Strategies**

## Overview

This dashboard provides scientific analysis of consumer sensory perception for plant-based products, combining:
- Visual expectation data (swipes)
- Post-consumption sensory ratings
- NLP-parsed sensory tags (CATA method)
- Ingredient correlation analysis

## Access

**URL:** `http://localhost:3000/industrial`

**Important:** This dashboard is NOT accessible via the main app navigation. It requires direct URL access for security (demo purposes).

## Features

### 1. Disconfirmation Heatmap (Screen 1)

**Goal:** Identify products in the "Deception Zone" - high visual appeal but low sensory satisfaction.

**Data Status:** `MOCK DATA`

**Why Mock?** Requires correlation between:
- Visual swipes (Discover screen)  
- Post-consumption ratings (after purchase & cooking)

This requires more user interactions than available for demo.

**Scientific Basis:**
- Expectation-Disconfirmation Theory (Oliver, 1980)
- Food Essentialism & Law of Similarity (Cheon et al., 2025)
- Flint et al. (2025) - Visual similarity triggers expectations

### 2. Ingredient-Sensory Correlator (Screen 2)

**Goal:** Correlate specific sensory tags with product ratings to identify reformulation targets.

**Data Status:** `REAL DATA` (when available)

**How It Works:**
1. User posts review with natural language comment
2. NLP (Gemini 3 Pro Preview) parses comment into CATA tags
3. Tags are aggregated by frequency and correlated with ratings

**Taxonomy:**
- **Barrier Tags** (Negative): beany, dry, bitter, granular, off-flavour, etc.
- **Driver Tags** (Positive): juicy, meaty, umami, tender, crispy, etc.

**Scientific Basis:**
- CATA (Check-All-That-Apply) method (Ares et al., 2014)
- Sensory lexicon from Neville et al. (2017)
- Pea protein correlation (Saint-Eve et al., 2021)

### 3. Smart Swap A/B Test (Screen 3)

**Goal:** Validate product substitutability via recommendation engine conversion funnel.

**Data Status:** `MOCK DATA`

**Concept:**
- User scans traditional product (e.g., chicken nuggets)
- App recommends plant-based alternative
- Track: (1) Acceptance Rate, (2) Post-Trial Rating, (3) Sensory Tags

**Example Insights:**
- Precision fermentation → 25% acceptance, 4.2★ rating (juicy, meaty)
- High-pea protein → 15% acceptance, 2.8★ rating (dry, beany)

## Data Transparency

### Real Data Sources
- Total posts count
- Average rating
- NLP-parsed comments from `posts` table
- Sensory tags extracted from user reviews

### Mock Data
- Disconfirmation Heatmap (visual appeal vs sensory)
- Smart Swap A/B Test funnel

**Why Mock?**  
Insufficient time to collect:
1. Swipe data + purchase + consumption + rating for same product
2. Recommendation acceptance tracking

## Technical Architecture

### API Endpoint
```
GET /api/industrial/analytics
```

Returns:
```json
{
  "totalPosts": 5,
  "totalRatings": 2,
  "avgRating": 4.5,
  "commentsWithTags": 0,
  "topBarriers": [...],
  "topDrivers": [...],
  "disconfirmationGap": [],
  "_meta": {
    "dataTransparency": {
      "realData": ["totalPosts", "totalRatings", "avgRating", ...],
      "mockData": ["disconfirmationGap"]
    }
  }
}
```

### NLP Pipeline

**Endpoint:** `/api/sensory-parse`

**Process:**
1. User comment → Gemini 3 Pro Preview
2. Prompt includes CATA taxonomy from Neville et al. (2017)
3. Returns structured JSON:
```json
{
  "texture": "dry",
  "flavour": "beany",
  "visual_expectation": "high",
  "disconfirmation": "negative",
  "tags": [
    {"tag": "dry", "category": "barrier", "valence": "negative", "confidence": 0.95},
    {"tag": "beany", "category": "barrier", "valence": "negative", "confidence": 0.90}
  ]
}
```

## Scientific References

All citations in the dashboard are from real sensory science literature:

- **Flint et al. (2025)** - Sensory drivers and barriers for PBMA acceptance
- **Neville et al. (2017)** - Sensory lexicon for plant-based proteins
- **Saint-Eve et al. (2021)** - Pea protein concentration ↔ bitterness correlation
- **Cheon et al. (2025)** - Food essentialism in PBMAs
- **Oliver (1980)** - Expectation-Disconfirmation Theory
- **Ares et al. (2014)** - CATA methodology

## Usage for Jury Presentation

1. **Navigate to:** `http://localhost:3000/industrial`
2. **Show 3 screens:**
   - Heatmap → Gap analysis concept
   - Correlator → Real NLP parsing (if data available)
   - Smart Swap → Substitutability validation

3. **Emphasize:**
   - Scientific rigor (CATA, Disconfirmation Theory)
   - Data transparency (badges: "Real Data" vs "Mock Data")
   - Actionable insights for manufacturers
   - Use of industry-standard jargon (hedonic score, substitutability, etc.)

## Future Enhancements (Post-Demo)

1. **Swipe Tracking:**
   - Add `swipes` table to DB
   - Correlate swipe_rate with rating for real disconfirmation gap

2. **Recommendation Engine:**
   - Track swap acceptance
   - Measure post-trial ratings

3. **Ingredient Database:**
   - Link to Open Food Facts SKUs
   - Correlate specific protein sources with sensory defects

4. **CATA UI:**
   - Add tag selection interface to review submission
   - Replace text-only comments with structured tags

## Notes

- Dashboard is completely independent from main app
- No authentication required (demo only)
- All mock data is clearly labeled
- Code comments indicate data sources
