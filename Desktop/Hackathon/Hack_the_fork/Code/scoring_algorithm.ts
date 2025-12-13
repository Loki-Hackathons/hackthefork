// scoring.ts

/**
* HACKATHON "HACK THE FORK" SCORING ALGORITHM - V2 (ROBUST)
* Total Score (100) =
* Nutri-Score (Max 50) +
* Additives Score (Max 30) +
* Eco-Innovation Score (Max 20)
*/

// --- 1. LISTS OF "BAD" ADDITIVES (The Penalty List) ---
const HAZARDOUS_ADDITIVES = [
// Nitrites & Nitrates (Processed meats - carcinogenic risk)
'en:e249', 'en:e250', 'en:e251', 'en:e252',
// BHA / BHT (Antioxidants)
'en:e320', 'en:e321',
// Intense Sweeteners (Metabolic impact)
'en:e950', 'en:e951', 'en:e952', 'en:e954', 'en:e955', 'en:e962', 'en:e961',
// Risky Emulsifiers & Thickeners (Gut health)
'en:e433', 'en:e466', 'en:e407', 'en:e471', 'en:e472c', 'en:e442',
// Phosphates (Cardiovascular risk)
'en:e338', 'en:e339', 'en:e340', 'en:e341', 'en:e450', 'en:e451', 'en:e452',
// Titanium Dioxide & Colorants
'en:e171', 'en:e102', 'en:e110', 'en:e129'
];

// --- 2. LISTS OF "GOOD" KEYWORDS (The Innovation List - EXPANDED) ---

const ALGAE_KEYWORDS = [
// Generic
'algae', 'algue', 'algues', 'seaweed', 'microalgae', 'micro-algues', 'microalgue',
// Species (French & English)
'spirulina', 'spiruline',
'chlorella', 'chlorelle',
'agar', 'agar-agar',
'kelp', 'varech',
'wakame', 'wakamé',
'nori', 'porphyra',
'kombu', 'laminaria', 'laminaire',
'dulse', 'palmaria',
'sea lettuce', 'laitue de mer', 'ulva',
'fucus', 'lithothamne', 'lithothamnium',
'hijiki', 'hiziki',
'schizochytrium' // Omega-3 rich algae often used in innovation
];

const FERMENTATION_KEYWORDS = [
// Deep Tech / Precision Fermentation
'fermented protein', 'protéine fermentée',
'mycoprotein', 'mycoprotéine', 'fungal protein', 'protéine fongique',
'non-animal whey', 'lactosérum non animal',
'precision fermentation', 'fermentation de précision',
'animal-free dairy', 'sans animal',
'beta-lactoglobulin', 'bêta-lactoglobuline',
'yeast protein', 'protéine de levure',
// Traditional but High-Value Fermentation
'tempeh', 'miso', 'koji', 'natto', 'kombucha', 'kefir',
'fermented cashew', 'noix de cajou fermentée', // Vegan cheeses
'fermented nut', 'fermented almond',
'lactic acid bacteria', 'ferments lactiques' // Good for gut, often in "new gen" pickles
];

const PLANT_BASED_TAGS = [
'en:plant-based-foods-and-beverages',
'en:plant-based-foods',
'en:vegan',
'en:meat-analogues',
'en:dairy-substitutes',
'en:cheese-substitutes'
];

const ORGANIC_TAGS = [
'en:organic',
'en:eu-organic',
'fr:ab-agriculture-biologique',
'en:usda-organic',
'de:eg-oko-verordnung', // Common in Europe
'it:biologico' // Common in Europe
];

// --- 3. THE SCORING FUNCTION (SINGLE PRODUCT) ---

export function calculateHackathonScore(product: any) {
if (!product) return { total: 0, details: { nutri: 0, additives: 0, eco: 0 }, isInnovation: false };

// --- A. Nutri-Score (Max 50) ---
let nutriRaw = 0;
if (product.nutriments && product.nutriments['nutrition-score-fr_100g'] !== undefined) {
nutriRaw = product.nutriments['nutrition-score-fr_100g'];
} else if (product.nutriscore_score !== undefined) {
nutriRaw = product.nutriscore_score;
}

// Map [-15...40] range to [50...0] points
const clampedNutri = Math.max(-15, Math.min(40, nutriRaw));
let nutriPoints = 50 - ((clampedNutri + 15) * (50 / 55));
nutriPoints = Math.round(Math.max(0, Math.min(50, nutriPoints)));

// --- B. Additives (Max 30) ---
let additivePoints = 30;
const productAdditives = product.additives_tags || [];

productAdditives.forEach((tag: string) => {
if (HAZARDOUS_ADDITIVES.includes(tag)) {
additivePoints -= 10;
}
});
additivePoints = Math.max(0, additivePoints);

// --- C. Eco-Innovation (Max 20) ---
let ecoPoints = 0;
const labels = product.labels_tags || [];
const categories = product.categories_tags || [];
const analysis = product.ingredients_analysis_tags || [];
const ingredientsText = (product.ingredients_text || "").toLowerCase();

// 1. Organic (+5)
const isOrganic = labels.some((tag: string) => ORGANIC_TAGS.includes(tag));
if (isOrganic) ecoPoints += 5;

// 2. Plant-Based (+5)
const isPlantBased = analysis.includes('en:vegan') ||
categories.some((tag: string) => PLANT_BASED_TAGS.includes(tag));
if (isPlantBased) {
ecoPoints += 5;
}

// 3. Algae & Fermentation (+10)
const hasInnovation = [...ALGAE_KEYWORDS, ...FERMENTATION_KEYWORDS].some(k =>
ingredientsText.includes(k)
);
if (hasInnovation) {
ecoPoints += 10;
}

ecoPoints = Math.min(20, ecoPoints);

// --- RESULT ---
return {
total: Math.round(nutriPoints + additivePoints + ecoPoints),
details: {
nutri: nutriPoints,
additives: additivePoints,
eco: ecoPoints
},
isInnovation: hasInnovation,
productName: product.product_name || "Unknown Product"
};
}

// --- 4. THE DISH SCORING FUNCTION (ARITHMETIC MEAN) ---

/**
* Calculates the average score for a whole dish composed of multiple products.
* @param products Array of Open Food Facts product objects
*/
export function calculateDishScore(products: any[]) {
if (!products || products.length === 0) {
return {
totalScore: 0,
productScores: [],
dishInnovation: false
};
}

let sumScore = 0;
let hasDishInnovation = false;

// Calculate score for each individual product
const productScores = products.map(product => {
const scoreData = calculateHackathonScore(product);

sumScore += scoreData.total;
if (scoreData.isInnovation) hasDishInnovation = true;

return scoreData;
});

// Calculate Arithmetic Mean
const averageScore = Math.round(sumScore / products.length);

return {
totalScore: averageScore, // This is the final 0-100 score for the Dish
productScores: productScores, // Keep details to show the user which product lowered the score
dishInnovation: hasDishInnovation // True if at least one ingredient is "Deep Tech"
};
}
