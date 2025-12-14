'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Sparkles, ArrowRight, ChefHat, Share2, Leaf, Activity, Weight, TrendingUp } from 'lucide-react';
import type { Screen } from './MainApp';
import { createPost } from '@/services/api';
import type { DetectedIngredient } from '@/lib/image-analysis';
import { calculateAggregatedScore } from '@/lib/score-utils';
import { getUserId, getLikedDishes } from '@/lib/cookies';

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
  const [step, setStep] = useState<'preview' | 'analyzed' | 'recommendations'>('preview');
  const [analysisData, setAnalysisData] = useState<{
    dishName: string;
    ingredients: DetectedIngredient[];
    scores: { vegetal: number; health: number; carbon: number };
    recommendations?: Array<{
      original: string;
      suggested: string;
      scoreImprovement: number;
    }>;
  } | null>(null);

  // Poll for recommendations when analysisData is set and recommendations are missing
  useEffect(() => {
    if (!analysisData || analysisData.recommendations) return; // Already has recommendations or no data
    
    const userId = getUserId();
    if (!userId || !analysisData.dishName) return;
    
    let attempts = 0;
    const maxAttempts = 20; // Poll for up to 20 seconds (20 attempts * 1 second)
    let timeoutId: NodeJS.Timeout;
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/analyze?user_id=${userId}&dish_name=${encodeURIComponent(analysisData.dishName)}`);
        
        if (response.status === 200) {
          const data = await response.json();
          if (data.recommendations && data.recommendations.length > 0) {
            // Update analysisData with recommendations
            setAnalysisData(prev => prev ? { ...prev, recommendations: data.recommendations } : null);
            console.log('Recommendations loaded:', data.recommendations);
            return; // Stop polling
          }
        }
        
        // If not ready yet and haven't exceeded max attempts, continue polling
        if (attempts < maxAttempts) {
          attempts++;
          timeoutId = setTimeout(poll, 1000); // Poll every 1 second
        } else {
          console.log('Recommendations polling timeout');
        }
      } catch (error) {
        console.error('Error polling for recommendations:', error);
      }
    };
    
    // Start polling after a short delay
    timeoutId = setTimeout(poll, 2000); // Wait 2 seconds before first poll
    
    // Cleanup on unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [analysisData]);

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
                  
                  const userId = getUserId();
                  const likedDishes = getLikedDishes();
                  const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      base64Image, 
                      user_id: userId,
                      liked_dishes: likedDishes 
                    }),
                  });
                  
                  // Get response text first to check if it's valid JSON
                  const responseText = await response.text();
                  
                  if (!response.ok) {
                    // Try to parse as JSON, but handle non-JSON error responses
                    let errorData: any;
                    try {
                      errorData = JSON.parse(responseText);
                    } catch {
                      // If not JSON, use the raw text or a default error
                      errorData = { error: responseText || `Analysis failed: ${response.status}` };
                    }
                    throw new Error(errorData.error || `Analysis failed: ${response.status}`);
                  }
                  
                  // Parse the successful response
                  let data: any;
                  try {
                    data = JSON.parse(responseText);
                  } catch (parseError) {
                    console.error('Failed to parse response as JSON:', parseError);
                    console.error('Response text:', responseText.substring(0, 500));
                    throw new Error('Invalid JSON response from server. Please try again.');
                  }
                  
                  // Validate response
                  if (!data.dishName || !data.ingredients || !data.scores) {
                    throw new Error('Invalid analysis response: missing required fields');
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
          onSeeRecipe={() => setStep('recommendations')}
          onCancel={() => setStep('preview')}
        />
      )}

      {step === 'recommendations' && analysisData && (
        <RecommendationView
          analysisData={analysisData}
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
    recommendations?: Array<{
      original: string;
      suggested: string;
      scoreImprovement: number;
    }>;
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
      className="h-full flex flex-col relative overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0">
        <img src={imageUrl} alt="Analyzed dish" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 flex flex-col min-h-full p-6">
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

        {/* Personalized Recommendations */}
        {analysisData.recommendations && analysisData.recommendations.length > 0 && (
          <motion.div
            className="bg-emerald-700/80 backdrop-blur-md rounded-2xl p-4 mb-4 border border-emerald-500/30 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-white text-sm font-bold">Personalized Suggestions</h3>
            </div>
            <div className="space-y-3">
              {analysisData.recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white/10 rounded-xl p-3 border border-white/20"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 text-sm line-through">{rec.original}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-300" />
                        <span className="text-white font-semibold text-sm">{rec.suggested}</span>
                      </div>
                    </div>
                    <div className="bg-emerald-600 rounded-lg px-3 py-1.5">
                      <span className="text-white text-sm font-bold">+{rec.scoreImprovement}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-white/70 text-xs mt-3 italic">
              These suggestions are tailored to your preferences and goals
            </p>
          </motion.div>
        )}

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
            className="flex-1 p-4 bg-emerald-600/80 backdrop-blur-md text-white rounded-2xl font-semibold border border-emerald-500/30 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-5 h-5" />
            See Recommendations
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
                <span>Publishing...</span>
              </>
            ) : (
              <span>Publish</span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

interface RecommendationViewProps {
  analysisData: {
    dishName: string;
    ingredients: DetectedIngredient[];
    scores: { vegetal: number; health: number; carbon: number };
    recommendations?: Array<{
      original: string;
      suggested: string;
      scoreImprovement: number;
    }>;
  };
  onBack: () => void;
}

function RecommendationView({ analysisData, onBack }: RecommendationViewProps) {
  const [userPrefs, setUserPrefs] = useState<{
    dietary_preference?: number;
    weight_kg?: number;
    activity_level?: number;
  } | null>(null);
  const likedDishes = getLikedDishes();
  const currentScore = calculateAggregatedScore(analysisData.scores);
  const potentialScore = analysisData.recommendations 
    ? currentScore + Math.round(analysisData.recommendations.reduce((sum, r) => sum + r.scoreImprovement, 0) / analysisData.recommendations.length)
    : currentScore;

  useEffect(() => {
    // Fetch user preferences
    const fetchPrefs = async () => {
      try {
        const userId = getUserId();
        const response = await fetch(`/api/user?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserPrefs({
              dietary_preference: data.user.dietary_preference,
              weight_kg: data.user.weight_kg,
              activity_level: data.user.activity_level
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };
    fetchPrefs();
  }, []);

  const getDietaryLabel = (value?: number) => {
    if (!value) return 'Not set';
    if (value <= 20) return 'Vegan';
    if (value <= 40) return 'Vegetarian';
    if (value <= 60) return 'Flexitarian';
    if (value <= 80) return 'Omnivore';
    return 'Carnivore';
  };

  const getActivityLabel = (level?: number) => {
    if (level === undefined) return 'Not set';
    const labels = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'];
    return labels[level] || 'Not set';
  };

  return (
    <motion.div 
      className="h-full flex flex-col bg-black overflow-y-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-white text-2xl font-bold">Personalized Recommendations</h2>
          </div>
        </div>
        <p className="text-white/70 text-sm">
          Tailored to your preferences, goals, and eco-friendly objectives
        </p>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Current vs Potential Score */}
        <motion.div
          className="bg-gradient-to-r from-emerald-700/80 to-emerald-600/80 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-white" />
              <h3 className="text-white text-lg font-bold">Score Improvement</h3>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/70 text-sm mb-1">Current Score</div>
              <div className="text-white text-3xl font-bold">{currentScore}</div>
            </div>
            <ArrowRight className="w-8 h-8 text-white/50" />
            <div>
              <div className="text-white/70 text-sm mb-1">Potential Score</div>
              <div className="text-emerald-200 text-3xl font-bold">{potentialScore}</div>
            </div>
            <div className="ml-4">
              <div className="text-white/70 text-sm mb-1">Improvement</div>
              <div className="text-emerald-200 text-2xl font-bold">+{potentialScore - currentScore}</div>
            </div>
          </div>
        </motion.div>

        {/* User Profile Summary */}
        {userPrefs && (
          <motion.div
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-white text-lg font-bold mb-4">Your Profile</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/70 text-xs">Diet</span>
                </div>
                <div className="text-white font-semibold">{getDietaryLabel(userPrefs.dietary_preference)}</div>
              </div>
              {userPrefs.weight_kg && (
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Weight className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/70 text-xs">Weight</span>
                  </div>
                  <div className="text-white font-semibold">{userPrefs.weight_kg} kg</div>
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/70 text-xs">Activity</span>
                </div>
                <div className="text-white font-semibold">{getActivityLabel(userPrefs.activity_level)}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Liked Dishes */}
        {likedDishes.length > 0 && (
          <motion.div
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-white text-lg font-bold mb-3">Based on Your Likes</h3>
            <p className="text-white/70 text-sm mb-3">
              We&apos;ve considered dishes you liked during onboarding to tailor these recommendations.
            </p>
            <div className="flex flex-wrap gap-2">
              {likedDishes.slice(0, 5).map((dishId, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs border border-emerald-500/30"
                >
                  Liked #{idx + 1}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Ingredient Recommendations */}
        {analysisData.recommendations && analysisData.recommendations.length > 0 ? (
          <motion.div
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white text-lg font-bold">Recommended Substitutions</h3>
            </div>
            <div className="space-y-4">
              {analysisData.recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  className="bg-emerald-700/30 rounded-xl p-4 border border-emerald-500/30"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 line-through text-sm">{rec.original}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-300" />
                        <span className="text-white font-semibold text-base">{rec.suggested}</span>
                      </div>
                    </div>
                    <div className="bg-emerald-600 rounded-lg px-3 py-2 flex-shrink-0">
                      <div className="text-white text-sm font-bold">+{rec.scoreImprovement}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-bold mb-2">Great Choice!</h3>
            <p className="text-white/70 text-sm">
              This dish already aligns well with your preferences and eco-friendly goals. No major substitutions needed!
            </p>
          </motion.div>
        )}

        {/* Eco-Friendly Goals */}
        <motion.div
          className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            Eco-Friendly Impact
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Vegetal Score</span>
              <span className="text-white font-semibold">{analysisData.scores.vegetal}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Health Score</span>
              <span className="text-white font-semibold">{analysisData.scores.health}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Carbon Score</span>
              <span className="text-white font-semibold">{analysisData.scores.carbon}/100</span>
            </div>
            <div className="pt-3 border-t border-emerald-500/20 mt-3">
              <p className="text-emerald-200 text-xs">
                These recommendations help you maintain your dietary preferences while improving your environmental impact.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

