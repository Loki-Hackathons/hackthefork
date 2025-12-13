'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowRight, Leaf, TrendingDown, CheckCircle, AlertCircle, X } from 'lucide-react';

const mockRecipe = {
  name: 'curry maison 🍛',
  image: 'https://images.unsplash.com/photo-1693042978560-5711db96a991?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMGZvb2QlMjBwbGF0ZXxlbnwxfHx8fDE3NjU2NDQwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  ingredients: [
    { 
      id: 1, 
      name: 'Lentilles corail bio 500g', 
      price: 3.20, 
      checked: true,
      score: 92,
      sponsored: false
    },
    { 
      id: 2, 
      name: 'Lait de coco 400ml', 
      price: 2.80, 
      checked: true,
      score: 85,
      sponsored: false
    },
    { 
      id: 3, 
      name: 'Épices curry bio 50g', 
      price: 4.50, 
      checked: true,
      score: 90,
      sponsored: false
    },
    { 
      id: 4, 
      name: 'Pommes de terre 1kg', 
      price: 2.20, 
      checked: true,
      score: 68,
      sponsored: false,
      hasAlternative: true,
      alternative: {
        name: 'Patates douces locales 1kg',
        price: 3.10,
        score: 94,
        sponsored: true,
        brand: 'TerraVita'
      }
    },
    { 
      id: 5, 
      name: 'Légumes de saison', 
      price: 3.90, 
      checked: true,
      score: 95,
      sponsored: false
    },
  ]
};

export function ShopScreen() {
  const [ingredients, setIngredients] = useState(mockRecipe.ingredients);
  const [showSwap, setShowSwap] = useState<number | null>(null);

  const toggleIngredient = (id: number) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, checked: !ing.checked } : ing
    ));
  };

  const swapIngredient = (id: number) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id === id && ing.alternative) {
        return {
          ...ing,
          name: ing.alternative.name,
          price: ing.alternative.price,
          score: ing.alternative.score,
          sponsored: ing.alternative.sponsored,
          hasAlternative: false
        };
      }
      return ing;
    }));
    setShowSwap(null);
  };

  const totalPrice = ingredients
    .filter(ing => ing.checked)
    .reduce((sum, ing) => sum + ing.price, 0);

  const avgScore = Math.round(
    ingredients
      .filter(ing => ing.checked)
      .reduce((sum, ing) => sum + ing.score, 0) / 
    ingredients.filter(ing => ing.checked).length
  );

  const co2Saved = 2.4;

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden">
      {/* Header with recipe */}
      <div className="pt-12 pb-4 px-6">
        <div className="flex gap-4 items-start mb-4">
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-2xl mb-1">
              {mockRecipe.name}
            </h1>
            <p className="text-white/50 text-sm">
              {ingredients.filter(i => i.checked).length} ingrédients à commander
            </p>
          </div>
        </div>
      </div>

      {/* Ingredients list */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="space-y-3">
          {ingredients.map((ingredient) => (
            <div key={ingredient.id}>
              <motion.div
                className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border transition-colors ${
                  ingredient.hasAlternative && showSwap !== ingredient.id
                    ? 'border-yellow-500/50'
                    : 'border-white/10'
                }`}
                layout
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleIngredient(ingredient.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      ingredient.checked 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-white/30'
                    }`}>
                      {ingredient.checked && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`text-white ${!ingredient.checked && 'opacity-40'}`}>
                        {ingredient.name}
                      </h3>
                      <span className={`text-white flex-shrink-0 ${!ingredient.checked && 'opacity-40'}`}>
                        {ingredient.price.toFixed(2)}€
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Score badge */}
                      <div className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 ${
                        ingredient.score >= 85 ? 'bg-emerald-500/20 text-emerald-400' :
                        ingredient.score >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        <Leaf className="w-3 h-3" />
                        {ingredient.score}
                      </div>

                      {/* Sponsored badge */}
                      {ingredient.sponsored && (
                        <div className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-xl text-xs">
                          Sponsorisé
                        </div>
                      )}

                      {/* Smart swap indicator */}
                      {ingredient.hasAlternative && showSwap !== ingredient.id && (
                        <button
                          onClick={() => setShowSwap(ingredient.id)}
                          className="ml-auto flex items-center gap-1.5 text-yellow-400 text-xs px-3 py-1.5 bg-yellow-500/10 rounded-xl"
                        >
                          <AlertCircle className="w-3 h-3" />
                          Meilleur choix dispo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alternative suggestion */}
                {ingredient.hasAlternative && showSwap === ingredient.id && ingredient.alternative && (
                  <motion.div
                    className="mt-4 pt-4 border-t border-white/10"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <ArrowRight className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h4 className="text-white mb-2">
                              {ingredient.alternative.name}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-1.5">
                                <Leaf className="w-3 h-3" />
                                {ingredient.alternative.score}
                              </div>
                              <span className="text-emerald-400 text-xs px-3 py-1.5 bg-emerald-500/10 rounded-xl">
                                +{ingredient.alternative.score - ingredient.score} points
                              </span>
                            </div>
                          </div>
                          <span className="text-white flex-shrink-0 text-lg">
                            {ingredient.alternative.price.toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowSwap(null)}
                        className="flex-1 py-3 bg-white/5 text-white rounded-xl border border-white/10 active:scale-95 transition-transform"
                      >
                        Non merci
                      </button>
                      <button
                        onClick={() => swapIngredient(ingredient.id)}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl active:scale-95 transition-transform"
                      >
                        Changer
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom sticky bar */}
      <motion.div 
        className="bg-black/95 backdrop-blur-lg border-t border-white/10 p-6"
        layout
      >
        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span className="text-white/50 text-sm">Score Moyen</span>
            </div>
            <div className="text-white text-3xl">{avgScore}</div>
          </div>
          <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-blue-400" />
              <span className="text-white/50 text-sm">CO₂ Économisé</span>
            </div>
            <div className="text-white text-3xl">{co2Saved}kg</div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full py-5 bg-white text-black rounded-2xl flex items-center justify-between px-6 shadow-xl active:scale-95 transition-transform">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div className="text-left">
              <div className="text-sm">Commander</div>
              <div className="text-xs opacity-60">Carrefour Drive</div>
            </div>
          </div>
          <div className="text-3xl">
            {totalPrice.toFixed(2)}€
          </div>
        </button>
      </motion.div>
    </div>
  );
}
