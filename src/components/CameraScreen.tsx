'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Sparkles, ArrowRight, ChefHat, Share2 } from 'lucide-react';
import type { Screen } from './MainApp';
import { createPost } from '@/services/api';
import type { DetectedIngredient } from '@/lib/image-analysis';
import { calculateAggregatedScore } from '@/lib/score-utils';

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
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function CameraView({ onCapture, fileInputRef, onFileSelect }: CameraViewProps) {
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
  const [step, setStep] = useState<'preview' | 'analyzed' | 'recipe'>('preview');
  const [analysisData, setAnalysisData] = useState<{
    dishName: string;
    ingredients: DetectedIngredient[];
    scores: { vegetal: number; health: number; carbon: number };
  } | null>(null);

  return (
    <div className="h-full bg-black flex flex-col">
      {step === 'preview' && (
        <PostPreviewView
          imageFile={imageFile}
          imageUrl={imageUrl}
          onAnalyze={async () => {
            // Convert image to base64
            return new Promise<void>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = async () => {
                try {
                  const base64Image = reader.result as string;
                  if (!base64Image) {
                    throw new Error('Failed to read image');
                  }
                  
                  const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ base64Image }),
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(errorData.error || `Analysis failed: ${response.status}`);
                  }
                  
                  const data = await response.json();
                  
                  // Validate response
                  if (!data.dishName || !data.ingredients || !data.scores) {
                    throw new Error('Invalid analysis response');
                  }
                  
                  setAnalysisData(data);
                  setStep('analyzed');
                  resolve();
                } catch (error) {
                  console.error('Analysis error:', error);
                  const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image. Please try again.';
                  alert(errorMessage);
                  reject(error);
                }
              };
              reader.onerror = () => {
                const error = new Error('Failed to read image file');
                console.error('FileReader error:', error);
                alert('Failed to read image. Please try again.');
                reject(error);
              };
              reader.readAsDataURL(imageFile);
            });
          }}
          onCancel={onCancel}
        />
      )}
      
      {step === 'analyzed' && analysisData && (
        <PostAnalyzedView
          imageFile={imageFile}
          imageUrl={imageUrl}
          analysisData={analysisData}
          onShare={async () => {
            await onPost(imageFile);
          }}
          onSeeRecipe={() => setStep('recipe')}
          onCancel={() => setStep('preview')}
        />
      )}

      {step === 'recipe' && analysisData && (
        <RecipeView
          dishName={analysisData.dishName}
          onBack={() => setStep('analyzed')}
        />
      )}
    </div>
  );
}

interface PostPreviewViewProps {
  imageFile: File;
  imageUrl: string;
  onAnalyze: () => Promise<void>;
  onCancel: () => void;
}

function PostPreviewView({ imageUrl, onAnalyze, onCancel }: PostPreviewViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <motion.div 
      className="h-full flex flex-col relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6">
        <button 
          onClick={onCancel}
          className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors border border-white/10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="flex-1 flex flex-col justify-end gap-4 mb-8">
          <div className="text-center mb-4">
            <h2 className="text-white text-2xl font-bold mb-2">Ready to analyze?</h2>
            <p className="text-white/70 text-sm">We&apos;ll extract ingredients and calculate your eco-score</p>
          </div>

          <motion.button
            onClick={async () => {
              setIsAnalyzing(true);
              try {
                await onAnalyze();
              } finally {
                setIsAnalyzing(false);
              }
            }}
            disabled={isAnalyzing}
            className="w-full p-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
            whileTap={{ scale: 0.98 }}
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

interface PostAnalyzedViewProps {
  imageFile: File;
  imageUrl: string;
  analysisData: {
    dishName: string;
    ingredients: DetectedIngredient[];
    scores: { vegetal: number; health: number; carbon: number };
  };
  onShare: () => Promise<void>;
  onSeeRecipe: () => void;
  onCancel: () => void;
}

function PostAnalyzedView({ imageFile, imageUrl, analysisData, onShare, onSeeRecipe, onCancel }: PostAnalyzedViewProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');

  const avgScore = calculateAggregatedScore(analysisData.scores);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-700';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await createPost(imageFile, {
        ingredients: analysisData.ingredients,
        scores: analysisData.scores,
        rating: rating,
        comment: comment
      });
      await onShare();
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Failed to share post. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.div 
      className="h-full flex flex-col relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0">
        <img src={imageUrl} alt="Analyzed dish" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6">
        <button 
          onClick={onCancel}
          className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors border border-white/10 mb-4"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Score Badge */}
        <motion.div
          className={`${getScoreColor(avgScore)} rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm border border-white/30 mb-4`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <div>
                <div className="text-white/80 text-xs">Eco-Score</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-2xl font-bold">{avgScore}</span>
                  <span className="text-white/70 text-sm">/100</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/80 text-xs">Dish</div>
              <div className="text-white font-semibold text-sm capitalize">{analysisData.dishName}</div>
            </div>
          </div>
        </motion.div>

        {/* Ingredients */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-white text-sm font-semibold mb-2">Detected Ingredients</h3>
          <div className="flex flex-wrap gap-2">
            {analysisData.ingredients.slice(0, 6).map((ing, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white/10 rounded-full text-white text-xs border border-white/20"
              >
                {ing.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Feedback (optional) */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-white text-sm font-semibold mb-3">Your feedback (optional)</h3>
          <div className="flex gap-2 mb-3">
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
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you think..."
            className="w-full bg-white/5 border border-white/20 rounded-xl p-2 text-white text-sm placeholder-white/40 resize-none focus:outline-none focus:border-emerald-500/50"
            rows={2}
            maxLength={200}
          />
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <motion.button
            onClick={onSeeRecipe}
            className="flex-1 p-4 bg-black/30 backdrop-blur-md text-white rounded-2xl font-semibold border border-white/20 hover:bg-black/40 transition-colors flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <ChefHat className="w-5 h-5" />
            See Recipe
          </motion.button>
          <motion.button
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 p-4 bg-white text-black rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            {isSharing ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function RecipeView({ dishName, onBack }: { dishName: string; onBack: () => void }) {
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
        <h2 className="text-white text-3xl font-bold mb-4">Recipe for {dishName}</h2>
        <p className="text-white/60 text-lg max-w-xs mx-auto">
          Recipe feature coming soon! We&apos;re working on AI-powered sustainable recipe recommendations.
        </p>
      </div>
    </motion.div>
  );
}

