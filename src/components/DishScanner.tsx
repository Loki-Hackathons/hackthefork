// components/DishScanner.tsx
"use client";

import React, { useState } from 'react';
import { Camera, Loader2, ShoppingCart, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processDishPhoto } from '../services/recipeEngine';

interface DishScannerProps {
  onShop?: () => void;
}

export const DishScanner = ({ onShop }: DishScannerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    // Convert file to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        // CALL THE ENGINE
        const data = await processDishPhoto(base64String);
        setResult(data);
      } catch (error) {
        console.error("Error processing dish:", error);
        alert("Analysis failed. Try with a clearer photo.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-700';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full"
          >
            <label className="flex flex-col items-center justify-center w-full min-h-[400px] border-2 border-white/20 border-dashed rounded-3xl cursor-pointer hover:bg-white/5 transition-all backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full mb-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-white text-xl font-medium">Analyzing...</p>
                    <p className="text-white/60 text-sm mt-2">Detecting ingredients with AI</p>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Camera className="w-20 h-20 mb-4 text-purple-400" />
                    </motion.div>
                    <p className="text-white text-xl font-semibold mb-2">Import a photo</p>
                    <p className="text-white/60 text-sm">of your dish to get recommendations</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={isLoading} 
              />
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header with dish name and score */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-white text-3xl font-bold mb-2">{result.dishName}</h2>
                  <p className="text-white/60 text-sm">{result.products.length} product{result.products.length > 1 ? 's' : ''} recommended</p>
                </div>
                <motion.div
                  className={`${getScoreColor(result.totalScore)} rounded-2xl px-4 py-3 shadow-lg`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Sparkles className="w-4 h-4 text-white" />
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-2xl font-bold">{result.totalScore}</span>
                      <span className="text-white/80 text-xs">/100</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {result.isInnovation && (
                <motion.div
                  className="bg-emerald-700/30 border border-emerald-500/50 rounded-2xl p-3 flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <p className="text-emerald-400 text-sm font-medium">Innovative and eco-friendly dish!</p>
                </motion.div>
              )}
            </div>

            {/* Product List */}
            <div className="space-y-3">
              <h3 className="text-white text-xl font-semibold mb-2">Produits recommandés</h3>
              {result.products.map((prod: any, idx: number) => (
                <motion.div
                  key={idx}
                  className="flex items-center bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  {prod.image ? (
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-16 h-16 rounded-xl object-cover mr-4 border border-white/10" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mr-4">
                      <Camera className="w-8 h-8 text-white/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-lg truncate">{prod.name}</p>
                    <p className="text-white/60 text-sm truncate">{prod.brand}</p>
                    {prod.ecoScore && prod.ecoScore !== 'unknown' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/50 text-xs">Eco-Score:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          prod.ecoScore === 'a' ? 'bg-emerald-700 text-white' :
                          prod.ecoScore === 'b' ? 'bg-green-600 text-white' :
                          prod.ecoScore === 'c' ? 'bg-yellow-500 text-black' :
                          prod.ecoScore === 'd' ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {prod.ecoScore.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {onShop && (
                <motion.button
                  onClick={onShop}
                  className="w-full bg-emerald-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart size={20} />
                  View Carrefour alternatives
                </motion.button>
              )}
              
              <motion.button
                onClick={() => setResult(null)}
                className="w-full bg-white/10 text-white font-medium py-3 rounded-2xl hover:bg-white/20 transition border border-white/20"
                whileTap={{ scale: 0.98 }}
              >
                Scan another dish
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

