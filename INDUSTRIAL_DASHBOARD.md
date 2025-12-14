# Industrial Dashboard - Quick Reference Guide

**Access:** `http://localhost:3000/industrial` (direct URL only, not in main navigation)

---

## Dashboard Overview

The **Sensory Disconfirmation Engine** analyzes consumer perception of plant-based meat alternatives (PBMAs) to provide actionable reformulation insights.

### Key Metrics Explained

| Metric | Definition | Interpretation |
|--------|------------|----------------|
| **Sample Size (N)** | Total number of consumer evaluations with ratings | Larger N = more statistically significant results |
| **Mean Hedonic Score** | Average consumer liking rating on a 1-5 scale | Higher = better overall acceptance. Industry benchmark: 3.5+ |
| **Parsed Comments** | Number of text reviews converted to sensory tags via NLP | Shows how many qualitative comments have been scientifically analyzed |
| **Unique Formulations** | Number of distinct product recipes/SKUs in database | Each product photographed = 1 formulation |

### Terminology

- **Hedonic Score**: Consumer liking rating (from "I hate it" to "I love it")
- **CATA (Check-All-That-Apply)**: Scientific method where specific sensory attributes are tagged (e.g., "juicy", "dry", "beany")
- **Barrier Tags**: Negative sensory attributes causing rejection (e.g., "bitter", "cardboard", "spongy")
- **Driver Tags**: Positive sensory attributes driving acceptance (e.g., "meaty", "tender", "savory")
- **NLP (Natural Language Processing)**: AI parsing of text comments into structured sensory data
- **Disconfirmation**: Gap between visual expectations and actual taste experience
- **SKU**: Stock Keeping Unit (unique product identifier)

---

## Dashboard Screens

### 1. Disconfirmation Heatmap

**Purpose:** Identify products where appearance doesn't match taste reality.

**How to Read:**
- **X-axis**: Visual Appeal (% of users who would swipe right based on photo)
- **Y-axis**: Sensory Satisfaction (actual rating after tasting)
- **Black Squares**: Deception Zone (looks good, tastes bad → high rejection risk)
- **White Diamonds**: Success Zone (looks good, tastes good)
- **Grey Circles**: Neutral (moderate expectations, moderate delivery)

**Data Source:** MOCK (requires swipe tracking + post-consumption ratings)

**Key Insight:** Products in bottom-right quadrant need immediate reformulation.

---

### 2. Ingredient-Sensory Correlator

**Purpose:** Link specific sensory defects to ingredients.

**How to Read:**
- **Barrier Tags** (left): Negative attributes with frequency bars
- **Driver Tags** (right): Positive attributes with frequency bars
- Darker/wider bars = more frequent occurrence

**Data Source:** REAL (when users post reviews with comments)

**Example Finding:** "Bitter" tag correlates with Pea Protein >65% → Reduce pea protein or add masking agents

---

### 3. Substitution Analysis

**Purpose:** Validate if plant-based products can substitute traditional meat.

**How to Read:**
- Compare Control vs Test groups
- **Conversion Rate**: % of users who accepted the recommended swap
- **Mean Rating**: Post-trial satisfaction
- **Tags**: Dominant sensory attributes

**Data Source:** MOCK (requires recommendation engine tracking)

**Key Insight:** Higher conversion + rating = successful substitution

---

## Data Transparency

### Real Data Sources
- Post counts from database
- User ratings (1-5 stars)
- NLP-parsed comments → sensory tags
- Tag frequency + correlation with ratings

### Mock Data
- Disconfirmation Heatmap (visual swipe vs rating correlation)
- Substitution Analysis funnel metrics

**Why Mock?** Insufficient time to collect:
1. Swipe data + purchase + consumption cycle for same product
2. Recommendation engine acceptance tracking

---

## Scientific Framework

**Expectation-Disconfirmation Theory (Oliver, 1980)**
- Consumers form expectations (from visuals)
- Experience reality (from taste)
- Gap = Disconfirmation → Drives satisfaction/rejection

**Food Essentialism (Cheon et al., 2025)**
- Visual similarity to meat → Consumers expect meat-like properties
- When unmet → 2x stronger rejection than non-mimetic products

**CATA Method (Ares et al., 2014)**
- Standardized sensory attribute selection
- Enables statistical analysis of qualitative feedback

---

## For Technical Users

### API Endpoints

```
GET /api/industrial/analytics
```
Returns aggregated dashboard data with metadata:
```json
{
  "totalPosts": 5,
  "totalRatings": 2,
  "avgRating": 4.5,
  "commentsWithTags": 0,
  "topBarriers": [...],
  "topDrivers": [...],
  "_meta": {
    "dataTransparency": {
      "realData": ["totalPosts", "avgRating", ...],
      "mockData": ["disconfirmationGap"]
    }
  }
}
```

### NLP Pipeline

**Model:** Claude 3.5 Haiku (fast sensory parsing)  
**Input:** User comment (e.g., "Looked great but tasted dry")  
**Output:** Structured tags (e.g., `{"texture": "dry", "visual_expectation": "high", ...}`)

---

## Quick Actions

- **Export PDF**: Download current dashboard state
- **Info Buttons (ⓘ)**: Click for interpretation guides on each screen

---

## Need More Detail?

See `INDUSTRIAL_DASHBOARD_SCIENTIFIC.md` for:
- Full literature review
- Detailed sensory taxonomy
- Statistical methodologies
- Industry benchmarks
