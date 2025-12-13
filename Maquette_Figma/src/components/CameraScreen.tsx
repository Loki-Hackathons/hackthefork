import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Scan, X, Sparkles, Flame, Check } from 'lucide-react';
import type { Screen } from './MainApp';

interface CameraScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function CameraScreen({ onNavigate }: CameraScreenProps) {
  const [mode, setMode] = useState<'camera' | 'scan' | 'post'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    // Simulate capture
    setCapturedImage('https://images.unsplash.com/photo-1693042978560-5711db96a991?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMGZvb2QlMjBwbGF0ZXxlbnwxfHx8fDE3NjU2NDQwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080');
    setMode('post');
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

        {mode === 'post' && (
          <PostView
            key="post"
            image={capturedImage!}
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
  fileInputRef: React.RefObject<HTMLInputElement>;
}

function CameraView({ onCapture, onScan, fileInputRef }: CameraViewProps) {
  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Camera viewfinder */}
      <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/20" />
          ))}
        </div>

        {/* Center focus */}
        <motion.div
          className="w-56 h-56 border-2 border-white/50 rounded-3xl"
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <Camera className="w-20 h-20 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 text-xl">Prends ton plat en photo</p>
        </div>
      </div>

      {/* Bottom controls - BeReal style */}
      <div className="p-6 bg-black">
        <div className="flex items-center justify-between max-w-md mx-auto mb-4">
          {/* Scan button */}
          <button
            onClick={onScan}
            className="flex flex-col items-center gap-2"
          >
            <motion.div 
              className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <Scan className="w-8 h-8 text-white" />
            </motion.div>
            <span className="text-purple-400 text-sm">Scan</span>
          </button>

          {/* Capture button - centered */}
          <motion.button
            onClick={onCapture}
            whileTap={{ scale: 0.9 }}
            className="relative"
          >
            <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white" />
            </div>
          </motion.button>

          {/* Post directly */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2"
          >
            <motion.div 
              className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <span className="text-emerald-400 text-sm">Post</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onCapture}
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
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white text-3xl">
          Scan de ton plat
        </h2>
      </div>

      {/* Scanning animation */}
      {scannedItems.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-28 h-28 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white/70 text-lg">Détection en cours...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onAnimationComplete={() => setTimeout(() => setShowSuggestion(true), 500)}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-5 mb-6 border border-white/10">
              <h3 className="text-purple-400 mb-4 text-lg">
                Ingrédients détectés
              </h3>
              <div className="space-y-3">
                {scannedItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span className="text-white flex-1 text-lg">{item}</span>
                    {idx === 0 && (
                      <span className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-sm">
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
                  className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-6 shadow-2xl"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <Sparkles className="w-7 h-7 text-white flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-white text-xl mb-3">
                        Suggestion IA
                      </h3>
                      <p className="text-white/90 text-lg leading-relaxed">
                        Remplace le <span className="font-semibold">Steak de bœuf</span> par du{' '}
                        <span className="font-semibold">Seitan</span>
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-white/70 line-through text-2xl">40</span>
                        <span className="text-white text-3xl">→ 90</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onShop}
                    className="w-full py-4 bg-white text-emerald-600 rounded-2xl text-lg active:scale-95 transition-transform"
                  >
                    Voir l'alternative
                  </button>
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
  image: string;
  onPost: () => void;
  onCancel: () => void;
}

function PostView({ image, onPost, onCancel }: PostViewProps) {
  const [isCalculating, setIsCalculating] = useState(true);
  const [ecoScore, setEcoScore] = useState<number | null>(null);

  useState(() => {
    setTimeout(() => {
      setEcoScore(92);
      setIsCalculating(false);
    }, 2000);
  });

  return (
    <motion.div
      className="h-full flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between">
        <button onClick={onCancel} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white text-xl">Nouveau post</h2>
        <div className="w-10" />
      </div>

      {/* Image preview - full bleed like Instagram */}
      <div className="aspect-square w-full mb-6">
        <img src={image} alt="Captured dish" className="w-full h-full object-cover" />
      </div>

      {/* Score calculation */}
      <div className="px-6 flex-1">
        <AnimatePresence mode="wait">
          {isCalculating ? (
            <motion.div
              key="calculating"
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-white text-lg">
                Calcul de ton score écolo...
              </p>
              <p className="text-white/50 text-sm mt-2">
                Recherche dans tes achats Carrefour
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-white/90 mb-2">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Ingrédients trouvés</span>
                  </div>
                  <div className="text-white text-2xl">
                    Score calculé
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                  <div className="relative w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-white/40">
                    <span className="text-white text-4xl leading-none">{ecoScore}</span>
                    <span className="text-white/90 text-xs leading-none mt-1">éco</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Flame className="w-5 h-5" />
                <span className="text-sm">Impact carbone vérifié</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Post button */}
      <div className="p-6">
        <motion.button
          onClick={onPost}
          disabled={isCalculating}
          className="w-full py-5 bg-white text-black rounded-2xl text-lg disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
          whileTap={{ scale: 0.95 }}
        >
          Partager avec ta squad
        </motion.button>
      </div>
    </motion.div>
  );
}
