'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Scan, X, Sparkles, Leaf, Apple, Cloud, Check, ArrowRight } from 'lucide-react';
import type { Screen } from './MainApp';
import { analyzeMeal, type MealAnalysisResult } from '@/services/api';

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
      setScannedItems(['Steak de bœuf', 'Pommes de terre', 'Haricots verts']);
    }, 1500);
  };

  const handlePost = () => {
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
          <ScanView
            key="scan"
            scannedItems={scannedItems}
            onBack={handleReset}
            onShop={() => onNavigate('shop')}
          />
        )}

        {mode === 'post' && capturedFile && capturedImage && (
          <PostView
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

      {/* Bottom controls - BeReal style */}
      <div className="p-8 bg-black/95 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Scan button */}
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

          {/* Gallery button */}
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
          Scan de ton plat
        </h2>
        <p className="text-white/60 text-sm mt-2">Détection des ingrédients en cours...</p>
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
            <p className="text-white/80 text-xl font-medium">Détection en cours...</p>
            <p className="text-white/50 text-sm mt-2">Analyse de l'image avec IA</p>
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
                Ingrédients détectés
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
                        Suggestion IA
                      </h3>
                      <p className="text-white/95 text-lg leading-relaxed mb-4">
                        Remplace le <span className="font-bold">Steak de bœuf</span> par du{' '}
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
                    Voir l'alternative Carrefour
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

interface PostViewProps {
  imageFile: File;
  imageUrl: string;
  onPost: () => void;
  onCancel: () => void;
}

function PostView({ imageFile, imageUrl, onPost, onCancel }: PostViewProps) {
  const [isCalculating, setIsCalculating] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResult | null>(null);

  useEffect(() => {
    setIsCalculating(true);
    analyzeMeal(imageFile)
      .then((result) => {
        setAnalysisResult(result);
        setIsCalculating(false);
      })
      .catch((error) => {
        console.error('Analysis error:', error);
        setIsCalculating(false);
      });
  }, [imageFile]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-700';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreIcon = (type: 'vegetal' | 'healthy' | 'carbon') => {
    switch (type) {
      case 'vegetal': return Leaf;
      case 'healthy': return Apple;
      case 'carbon': return Cloud;
    }
  };

  return (
    <motion.div
      className="h-full flex flex-col bg-black overflow-y-auto relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10">
        <button 
          onClick={onCancel} 
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white text-xl font-semibold">Nouveau post</h2>
        <div className="w-12" />
      </div>

      {/* Small Score Container - Left Side */}
      {!isCalculating && analysisResult && (
        <div className="absolute left-6 top-40 z-20">
          {(() => {
            const avgScore = Math.round(
              (analysisResult.scores.vegetal + analysisResult.scores.healthy + analysisResult.scores.carbon) / 3
            );
            const colorClass = getScoreColor(avgScore);
            
            return (
              <motion.div
                className={`${colorClass} rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm border border-white/20`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
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

      {/* Image preview */}
      <div className="aspect-square w-full mb-6 relative">
        <img src={imageUrl} alt="Captured dish" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Score calculation */}
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

              {/* Recommendations */}
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

              {/* Success badge */}
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

      {/* Post button */}
      <div className="p-6 pt-0 sticky bottom-0 bg-black/95 backdrop-blur-sm">
        <motion.button
          onClick={onPost}
          disabled={isCalculating || !analysisResult}
          className="w-full py-5 bg-white text-black rounded-2xl text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl"
          whileTap={{ scale: 0.95 }}
        >
          Partager avec ta squad
        </motion.button>
      </div>
    </motion.div>
  );
}
