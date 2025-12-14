'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Scan, X, Sparkles, Check, Image } from 'lucide-react';
import type { Screen } from './MainApp';
import { analyzeMeal, createPost, type MealAnalysisResult } from '@/services/api';
import { DishScanner } from './DishScanner';
import { processDishPhoto, type RecommendedDish } from '@/services/recipeEngine';

interface CameraScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function CameraScreen({ onNavigate }: CameraScreenProps) {
  const [mode, setMode] = useState<'camera' | 'scan' | 'post'>('camera');
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
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
  };

  const handlePost = async () => {
    // Le post sera créé dans PostView avec le feedback
    setTimeout(() => {
      onNavigate('feed');
    }, 500);
  };

  const handleReset = () => {
    setMode('camera');
    setCapturedFile(null);
    setCapturedImage(null);
  };

  return (
    <div className="h-full bg-black flex flex-col relative overflow-hidden">
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
          <ScanViewWithDishScanner
            key="scan"
            onBack={handleReset}
            onShop={() => onNavigate('shop')}
          />
        )}

        {mode === 'post' && capturedFile && capturedImage && (
          <PostView
            key="post"
            imageFile={capturedFile}
            imageUrl={capturedImage}
            onPost={() => handlePost(capturedFile)}
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
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/10" />
          ))}
        </div>

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
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Camera className="w-24 h-24 text-white/50 mx-auto mb-6" />
          </motion.div>
          <p className="text-white/70 text-xl font-medium">Prends ton plat en photo</p>
          <p className="text-white/40 text-sm mt-2">On calcule ton impact écolo</p>
        </div>
      </div>

      <div className="p-8 bg-black/95 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <motion.button
            onClick={onScan}
            className="flex flex-col items-center gap-3"
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg">
              <Scan className="w-10 h-10 text-white" />
            </div>
            <span className="text-purple-400 text-sm font-medium">Scan</span>
          </motion.button>

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

          <motion.button
            onClick={onCapture}
            className="flex flex-col items-center gap-3"
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-emerald-700 flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <span className="text-emerald-400 text-sm font-medium">Galerie</span>
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

interface ScanViewWithDishScannerProps {
  onBack: () => void;
  onShop: () => void;
}

function ScanViewWithDishScanner({ onBack, onShop }: ScanViewWithDishScannerProps) {
  return (
    <motion.div
      className="h-full flex flex-col bg-black overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="pt-12 pb-6 px-6 sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10">
        <button 
          onClick={onBack} 
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white text-4xl font-bold">
          Scan de ton plat
        </h2>
        <p className="text-white/60 text-sm mt-2">Importe une photo pour obtenir des recommandations de produits</p>
      </div>

      <div className="flex-1 px-6 pb-6">
        <DishScanner onShop={onShop} />
      </div>
    </motion.div>
  );
}

interface PostViewProps {
  imageFile: File;
  imageUrl: string;
  onPost: () => Promise<void>;
  onCancel: () => void;
}

function PostView({ imageFile, imageUrl, onPost, onCancel }: PostViewProps) {
  const [isCalculating, setIsCalculating] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResult | null>(null);
  const [foodFactsResult, setFoodFactsResult] = useState<RecommendedDish | null>(null);
  const [isProcessingFoodFacts, setIsProcessingFoodFacts] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(imageUrl);
  const [currentImageFile, setCurrentImageFile] = useState<File>(imageFile);
  const [error, setError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    setAnalysisResult(null);
    setFoodFactsResult(null);
    setError(null);
    setIsCalculating(true);
    setIsProcessingFoodFacts(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      try {
        const [mealResult, foodFactsResult] = await Promise.all([
          analyzeMeal(currentImageFile),
          processDishPhoto(base64String)
        ]);
        
        setAnalysisResult(mealResult);
        setFoodFactsResult(foodFactsResult);
        setError(null);
      } catch (error: any) {
        console.error('Analysis error:', error);
        const errorMessage = error?.message || "Une erreur s'est produite lors de l'analyse";
        setError(errorMessage);
        
        try {
          const mealResult = await analyzeMeal(currentImageFile);
          setAnalysisResult(mealResult);
        } catch (mealError) {
          console.error('Meal analysis error:', mealError);
        }
      } finally {
        setIsCalculating(false);
        setIsProcessingFoodFacts(false);
        // Afficher le formulaire de feedback une fois l'analyse terminée
        if (!error) {
          setShowFeedback(true);
        }
      }
    };
    
    reader.readAsDataURL(currentImageFile);
  }, [currentImageFile]);

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (e.target) {
      e.target.value = '';
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setCurrentImageFile(file);
  };

  const handleGalleryButtonClick = () => {
    galleryInputRef.current?.click();
  };

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
        <h2 className="text-white text-xl font-semibold drop-shadow-lg">Nouveau post</h2>
        <div className="w-12" />
      </div>

      {/* Full screen image */}
      <div className="absolute inset-0">
        <img src={currentImageUrl} alt="Captured dish" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Hidden gallery input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGallerySelect}
      />
      
      {/* Gallery button - bottom right */}
      <motion.button
        onClick={handleGalleryButtonClick}
        disabled={isProcessingFoodFacts || isCalculating}
        className="absolute bottom-32 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors z-20 disabled:opacity-50"
        whileTap={{ scale: 0.9 }}
      >
        <Image className="w-6 h-6 text-white" />
      </motion.button>

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
            <span className="text-white text-sm font-semibold">Analyse complète</span>
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
              Calcul du score écolo...
            </p>
            <p className="text-white/50 text-sm">
              Analyse en cours
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

      {/* Food Facts Badge - if available */}
      {!isCalculating && foodFactsResult && !error && (
        <motion.div
          className="absolute top-64 left-6 right-6 z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-purple-500/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-white/30 inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-semibold">
              Score Open Food Facts: {foodFactsResult.totalScore}/100
            </span>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
          <motion.div
            className="bg-red-600/20 border border-red-500/50 rounded-3xl p-6 text-center backdrop-blur-md mx-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <X className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-white text-lg font-semibold mb-2">
              Erreur d'analyse
            </p>
            <p className="text-white/80 text-sm mb-4">
              {error}
            </p>
            <motion.button
              onClick={() => {
                setError(null);
                handleGalleryButtonClick();
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              Réessayer avec une autre photo
            </motion.button>
          </motion.div>
        </div>
      )}

<<<<<<< HEAD
      {foodFactsResult && !error && (
        <div className="px-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-600 rounded-3xl p-6 shadow-xl border border-purple-400/30"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-white text-2xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  {foodFactsResult.dishName}
                </h3>
                <p className="text-white/80 text-sm">{foodFactsResult.products.length} produit{foodFactsResult.products.length > 1 ? 's' : ''} recommandé{foodFactsResult.products.length > 1 ? 's' : ''}</p>
              </div>
              <motion.div
                className={`${getScoreColor(foodFactsResult.totalScore)} rounded-2xl px-4 py-3 shadow-lg`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <Sparkles className="w-4 h-4 text-white" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-2xl font-bold">{foodFactsResult.totalScore}</span>
                    <span className="text-white/80 text-xs">/100</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {foodFactsResult.isInnovation && (
              <motion.div
                className="bg-emerald-700/30 border border-emerald-500/50 rounded-2xl p-3 flex items-center gap-2 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <p className="text-emerald-400 text-sm font-medium">Plat innovant et éco-responsable !</p>
              </motion.div>
            )}

            <div className="space-y-3 mt-4">
              <h4 className="text-white text-lg font-semibold">Produits recommandés (Open Food Facts)</h4>
              {foodFactsResult.products.map((prod, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
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
          </motion.div>
        </div>
      )}

      {isProcessingFoodFacts && !error && (
        <div className="px-6 mb-6">
          <motion.div
            className="bg-white/5 backdrop-blur-md rounded-3xl p-8 text-center border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white text-xl font-semibold mb-2">
              Analyse avec Open Food Facts...
            </p>
            <p className="text-white/50 text-sm">
              Recherche des meilleurs produits et calcul du score
            </p>
          </motion.div>
        </div>
      )}

      {/* Formulaire de feedback */}
      {showFeedback && !isCalculating && analysisResult && (
        <div className="px-6 mb-6">
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Donne ton avis
            </h3>
            
            {/* Note sur 5 */}
            <div className="mb-6">
              <label className="text-white/80 text-sm mb-3 block">
                Note sur 5
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                      rating && star <= rating
                        ? 'bg-yellow-500 text-white scale-110'
                        : 'bg-white/10 text-white/40 hover:bg-white/20'
                    }`}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    ⭐
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Commentaire */}
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-3 block">
                Commentaire (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Dis-nous ce que tu en penses..."
                className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white placeholder-white/40 resize-none focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-colors"
                rows={3}
                maxLength={200}
              />
              <p className="text-white/40 text-xs mt-2 text-right">
                {comment.length}/200
              </p>
            </div>

            {/* Bouton pour continuer */}
            <motion.button
              onClick={() => {
                // Le feedback est optionnel, on peut continuer même sans note
                setShowFeedback(false);
              }}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.95 }}
            >
              {rating ? `Continuer avec ${rating}⭐` : 'Passer'}
            </motion.button>
          </motion.div>
        </div>
      )}

      <div className="px-6 flex-1 pb-6">
        <AnimatePresence mode="wait">
          {isCalculating ? (
            <motion.div
              key="calculating"
              className="bg-white/5 backdrop-blur-md rounded-3xl p-8 text-center border border-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-24 h-24 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-white text-xl font-semibold mb-2">
                Calcul de ton score écolo...
              </p>
              <p className="text-white/50 text-sm">
                Recherche dans tes achats Carrefour
              </p>
            </motion.div>
          ) : analysisResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="space-y-6"
            >
              {analysisResult.recommendations.length > 0 && (
                <div className="bg-purple-600 rounded-3xl p-6 shadow-xl border border-purple-400/30">
                  <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Suggestions d'amélioration
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                      >
                        <div className="text-white font-semibold mb-1">{rec.title}</div>
                        <div className="text-white/90 text-sm">{rec.description}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <motion.div
                className="bg-emerald-500 rounded-3xl p-6 shadow-xl border border-emerald-400/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-lg font-semibold">Analyse complète</div>
                    <div className="text-white/80 text-sm">Impact carbone vérifié</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="p-6 pt-0 sticky bottom-0 bg-black/95 backdrop-blur-sm">
        <motion.button
          onClick={async () => {
            if (!showFeedback && analysisResult) {
              // Créer le post avec le feedback
              try {
                await createPost(currentImageFile, {
                  rating: rating,
                  comment: comment
                });
                onPost();
              } catch (error) {
                console.error('Error creating post:', error);
                // Continuer quand même pour ne pas bloquer l'utilisateur
                onPost();
              }
            }
          }}
          disabled={isCalculating || !analysisResult || showFeedback}
          className="w-full py-5 bg-white text-black rounded-2xl text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl"
          whileTap={{ scale: 0.95 }}
        >
          {showFeedback ? 'Complète le feedback pour continuer' : 'Partager avec ta squad'}
        </motion.button>
      </div>
    </motion.div>
  );
}
