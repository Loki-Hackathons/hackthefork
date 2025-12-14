'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Scan, X, Sparkles, Leaf, Apple, Cloud, Check, ArrowRight, ChefHat, Share2 } from 'lucide-react';
import type { Screen } from './MainApp';
import { analyzeMeal, createPost, type MealAnalysisResult } from '@/services/api';
import { processDishPhoto, type RecommendedDish } from '@/services/recipeEngine';

interface CameraScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function CameraScreen({ onNavigate }: CameraScreenProps) {
  const [mode, setMode] = useState<'camera' | 'scan' | 'post'>('camera');
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setMode('post');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleScan = () => {
    setMode('scan');
    setTimeout(() => {
      setScannedItems(['Beef Steak', 'Potatoes', 'Green Beans']);
    }, 1500);
  };

  const handlePost = async () => {
    // The post will be created in PostView with feedback
    setTimeout(() => {
      onNavigate('feed');
    }, 500);
  };

  const handleReset = () => {
    setMode('camera');
    setCapturedFile(null);
    setCapturedImage(null);
    setScannedItems([]);
  };

  return (
    <div className="h-full bg-black flex flex-col relative overflow-hidden pb-24">
      <AnimatePresence mode="wait">
        {mode === 'camera' && (
          <CameraView
            key="camera"
            onCapture={handleCapture}
            onScan={handleScan}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
          />
        )}

        {mode === 'scan' && (
          <ScanView
            key="scan"
            scannedItems={scannedItems}
            onBack={handleReset}
            onShop={() => onNavigate('shop')}
          />
        )}

        {mode === 'post' && capturedFile && capturedImage && (
          <PostFlow
            key="post"
            imageFile={capturedFile}
            imageUrl={capturedImage}
            onPost={handlePost}
            onCancel={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface CameraViewProps {
  onCapture: () => void;
  onScan: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function CameraView({ onCapture, onScan, fileInputRef, onFileSelect }: CameraViewProps) {
  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Camera viewfinder */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/10" />
          ))}
        </div>

        {/* Center focus */}
        <motion.div
          className="w-64 h-64 border-2 border-white/40 rounded-3xl"
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ borderRadius: '24px' }} // Fallback
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Camera className="w-24 h-24 text-white/50 mx-auto mb-6" />
          </motion.div>
          <p className="text-white/70 text-xl font-medium">Snap your meal</p>
          <p className="text-white/40 text-sm mt-2">We calculate your eco-impact</p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="p-8 bg-black/95 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-center max-w-md mx-auto">
          
          {/* Capture button - centered */}
          <motion.button
            onClick={onCapture}
            whileTap={{ scale: 0.85 }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full border-4 border-white/80 flex items-center justify-center shadow-2xl">
              <motion.div 
                className="w-20 h-20 rounded-full bg-white"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />
        </div>
      </div>
    </motion.div>
  );
}

interface ScanViewProps {
  scannedItems: string[];
  onBack: () => void;
  onShop: () => void;
}

function ScanView({ scannedItems, onBack, onShop }: ScanViewProps) {
  const [showSuggestion, setShowSuggestion] = useState(false);

  return (
    <motion.div
      className="h-full flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <button 
          onClick={onBack} 
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white text-4xl font-bold">
          Scan your meal
        </h2>
        <p className="text-white/60 text-sm mt-2">Detecting ingredients...</p>
      </div>

      {/* Scanning animation */}
      {scannedItems.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-32 h-32 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white/80 text-xl font-medium">Scanning...</p>
            <p className="text-white/50 text-sm mt-2">AI image analysis</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onAnimationComplete={() => setTimeout(() => setShowSuggestion(true), 500)}
          >
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10">
              <h3 className="text-purple-400 mb-4 text-lg font-semibold">
                Detected ingredients
              </h3>
              <div className="space-y-3">
                {scannedItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="w-3 h-3 bg-purple-400 rounded-full" />
                    <span className="text-white flex-1 text-lg">{item}</span>
                    {idx === 0 && (
                      <span className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-medium border border-red-500/30">
                        Score: 40
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {showSuggestion && (
                <motion.div
                  className="bg-emerald-700 rounded-3xl p-6 shadow-2xl border border-emerald-500/30"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <Sparkles className="w-8 h-8 text-white flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-white text-2xl font-bold mb-3">
                        AI Suggestion
                      </h3>
                      <p className="text-white/95 text-lg leading-relaxed mb-4">
                        Replace <span className="font-bold">Beef Steak</span> with{' '}
                        <span className="font-bold">Seitan</span>
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-white/70 line-through text-3xl font-bold">40</span>
                          <ArrowRight className="w-6 h-6 text-white/70" />
                          <span className="text-white text-4xl font-bold">90</span>
                        </div>
                        <span className="text-white/80 text-sm">+50 points</span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    onClick={onShop}
                    className="w-full py-4 bg-white text-emerald-600 rounded-2xl text-lg font-semibold active:scale-95 transition-transform shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    See Carrefour alternative
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

interface PostFlowProps {
  imageFile: File;
  imageUrl: string;
  onPost: (imageFile: File) => Promise<void>;
  onCancel: () => void;
}

function PostFlow({ imageFile, imageUrl, onPost, onCancel }: PostFlowProps) {
  const [step, setStep] = useState<'choice' | 'analysis' | 'recipe'>('choice');

  return (
    <div className="h-full bg-black flex flex-col">
      {step === 'choice' && (
        <PostChoiceView
          imageUrl={imageUrl}
          onSelectRecipe={() => setStep('recipe')}
          onSelectPost={() => setStep('analysis')}
          onCancel={onCancel}
        />
      )}
      
      {step === 'analysis' && (
        <PostAnalysisView
          imageFile={imageFile}
          imageUrl={imageUrl}
          onPost={() => onPost(imageFile)}
          onCancel={() => setStep('choice')}
        />
      )}

      {step === 'recipe' && (
        <RecipeView
          imageUrl={imageUrl}
          onBack={() => setStep('choice')}
        />
      )}
    </div>
  );
}

function PostChoiceView({ imageUrl, onSelectRecipe, onSelectPost, onCancel }: {
  imageUrl: string;
  onSelectRecipe: () => void;
  onSelectPost: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div 
      className="h-full flex flex-col relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6">
        <button 
          onClick={onCancel}
          className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors border border-white/10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="flex-1 flex flex-col justify-end gap-3 mb-8">
          <motion.button
            onClick={onSelectRecipe}
            className="w-full p-5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 text-left hover:bg-black/30 hover:border-white/20 transition-colors group"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-300 group-hover:bg-emerald-500/25 transition-colors">
                <ChefHat className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold">Get sustainable recipe</h3>
                <p className="text-white/50 text-xs">AI-powered recommendations</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>

          <motion.button
            onClick={onSelectPost}
            className="w-full p-5 bg-white/85 backdrop-blur-md text-black rounded-2xl text-left hover:bg-white/95 transition-colors group border border-white/20"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black/70">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-black text-lg font-semibold">Post to feed</h3>
                <p className="text-black/50 text-xs">Share with your squad</p>
              </div>
              <ArrowRight className="w-5 h-5 text-black/30 group-hover:text-black/60 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function RecipeView({ imageUrl, onBack }: { imageUrl: string; onBack: () => void }) {
  return (
    <motion.div 
      className="h-full flex flex-col bg-black p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <button 
        onClick={onBack}
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 rounded-full bg-emerald-900/30 flex items-center justify-center mb-8">
          <ChefHat className="w-16 h-16 text-emerald-500" />
        </div>
        <h2 className="text-white text-3xl font-bold mb-4">Cooking Up...</h2>
        <p className="text-white/60 text-lg max-w-xs mx-auto">
          Our AI is learning to create sustainable recipes from your photos. Feature coming soon!
        </p>
      </div>
    </motion.div>
  );
}

interface PostAnalysisViewProps {
  imageFile: File;
  imageUrl: string;
  onPost: () => Promise<void>;
  onCancel: () => void;
}

function PostAnalysisView({ imageFile, imageUrl, onPost, onCancel }: PostAnalysisViewProps) {
  const [isCalculating, setIsCalculating] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResult | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [foodFactsResult, setFoodFactsResult] = useState<RecommendedDish | null>(null);
  const [isProcessingFoodFacts, setIsProcessingFoodFacts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsCalculating(true);
    setIsProcessingFoodFacts(true);
    setError(null);
    
    // Analyze meal with existing API
    analyzeMeal(imageFile)
      .then((result) => {
        setAnalysisResult(result);
        setIsCalculating(false);
        
        // Process with OpenFoodFacts in parallel
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Image = reader.result as string;
            const foodFacts = await processDishPhoto(base64Image);
            setFoodFactsResult(foodFacts);
            setIsProcessingFoodFacts(false);
            // Show feedback form once analysis is complete
            setShowFeedback(true);
          } catch (err: unknown) {
            console.error('OpenFoodFacts error:', err);
            setError(err instanceof Error ? err.message : 'Failed to analyze with OpenFoodFacts');
            setIsProcessingFoodFacts(false);
            // Still show feedback even if OpenFoodFacts fails
            setShowFeedback(true);
          }
        };
        reader.readAsDataURL(imageFile);
      })
      .catch((error: unknown) => {
        console.error('Analysis error:', error);
        setIsCalculating(false);
        setIsProcessingFoodFacts(false);
        setError(error instanceof Error ? error.message : 'Failed to analyze meal');
      });
  }, [imageFile]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-700';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      className="h-full flex flex-col bg-black relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 pt-12 pb-4 px-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onCancel} 
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white text-xl font-semibold drop-shadow-lg">New post</h2>
        <div className="w-12" />
      </div>

      {/* Full screen image */}
      <div className="absolute inset-0">
        <img src={imageUrl} alt="Captured dish" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Small Score Badge - Top Left */}
      {!isCalculating && analysisResult && (
        <div className="absolute left-6 top-28 z-20">
          {(() => {
            const avgScore = Math.round(
              (analysisResult.scores.vegetal + analysisResult.scores.healthy + analysisResult.scores.carbon) / 3
            );
            const colorClass = getScoreColor(avgScore);
            
            return (
              <motion.div
                className={`${colorClass} rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm border border-white/30`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-lg font-bold">{avgScore}</span>
                    <span className="text-white/70 text-xs">/100</span>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </div>
      )}

      {/* Compact Analysis Complete Badge */}
      {!isCalculating && analysisResult && (
        <motion.div
          className="absolute left-6 right-6 top-48 z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-emerald-500/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-white/30 inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-sm font-semibold">Analysis complete</span>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isCalculating && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center border border-white/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white text-lg font-semibold mb-1">
              Calculating eco-score...
            </p>
            <p className="text-white/50 text-sm">
              AI analysis in progress
            </p>
          </motion.div>
        </div>
      )}

      {/* Recommendations - Bottom overlay */}
      {!isCalculating && analysisResult && analysisResult.recommendations.length > 0 && (
        <motion.div
          className="absolute bottom-32 left-6 right-6 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-purple-600/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-purple-400/40">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-white text-base font-bold">Suggestions</h3>
            </div>
            <div className="space-y-2">
              {analysisResult.recommendations.slice(0, 2).map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                >
                  <div className="text-white font-semibold text-sm mb-1">{rec.title}</div>
                  <div className="text-white/90 text-xs">{rec.description}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* OpenFoodFacts Products - Scrollable section above button */}
      {!isCalculating && foodFactsResult && !error && (
        <motion.div
          className="absolute bottom-40 left-6 right-6 z-20 max-h-64 overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-purple-600/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-purple-400/40">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-white text-base font-bold">Open Food Facts Products</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {foodFactsResult.products.slice(0, 3).map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/10"
                >
                  {prod.image ? (
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-10 h-10 rounded-lg object-cover" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-xs truncate">{prod.name}</p>
                    {prod.ecoScore && prod.ecoScore !== 'unknown' && (
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        prod.ecoScore === 'a' ? 'bg-emerald-700 text-white' :
                        prod.ecoScore === 'b' ? 'bg-green-600 text-white' :
                        prod.ecoScore === 'c' ? 'bg-yellow-500 text-black' :
                        prod.ecoScore === 'd' ? 'bg-orange-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {prod.ecoScore.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Feedback Form - Show when analysis is complete */}
      {showFeedback && !isCalculating && analysisResult && (
        <motion.div
          className="absolute bottom-40 left-6 right-6 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Give your feedback
            </h3>
            
            {/* Rating */}
            <div className="mb-3">
              <label className="text-white/80 text-xs mb-2 block">Rating (optional)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                      rating && star <= rating
                        ? 'bg-yellow-500 text-white scale-110'
                        : 'bg-white/10 text-white/40 hover:bg-white/20'
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    ⭐
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-3">
              <label className="text-white/80 text-xs mb-2 block">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think..."
                className="w-full bg-white/5 border border-white/20 rounded-xl p-2 text-white text-sm placeholder-white/40 resize-none focus:outline-none focus:border-emerald-500/50"
                rows={2}
                maxLength={200}
              />
            </div>

            <motion.button
              onClick={() => setShowFeedback(false)}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {rating ? `Continue with ${rating}⭐` : 'Skip'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Post button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-black/90 to-transparent">
        <motion.button
          onClick={async () => {
            if (!showFeedback && analysisResult) {
              setIsPosting(true);
              try {
                await createPost(imageFile, {
                  rating: rating,
                  comment: comment
                });
                onPost();
              } catch (error: unknown) {
                console.error('Error creating post:', error);
                onPost();
              } finally {
                setIsPosting(false);
              }
            }
          }}
          disabled={isCalculating || !analysisResult || showFeedback}
          className="w-full py-5 bg-white text-black rounded-2xl text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl"
          whileTap={{ scale: 0.95 }}
        >
          {isPosting ? 'Posting...' : showFeedback ? 'Complete feedback to continue' : 'Share with your squad'}
        </motion.button>
      </div>
    </motion.div>
  );
}
