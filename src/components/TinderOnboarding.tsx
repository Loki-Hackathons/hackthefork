'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'motion/react';
import { Heart, X, Camera, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { ingredientImagePaths } from '@/utils/foodIcons';
import { analyzeImageWithBlackbox } from '@/services/blackboxVision';
import { processDishPhoto, type RecommendedDish } from '@/services/recipeEngine';
import { setOnboardingComplete, setUserName } from '@/lib/cookies';

interface TinderOnboardingProps {
  onComplete: () => void;
  isRevisit?: boolean;
}

// Image paths for ingredients - using downloaded food icons

const dishes = [
  {
    id: 1,
    name: 'Homemade Curry 🍛',
    image: 'https://images.unsplash.com/photo-1693042978560-5711db96a991?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMGZvb2QlMjBwbGF0ZXxlbnwxfHx8fDE3NjU2NDQwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['curry', 'rice', 'vegetables']
  },
  {
    id: 2,
    name: 'Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1510035618584-c442b241abe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBsdW5jaCUyMGJvd2x8ZW58MXx8fHwxNzY1NjQ0MDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['quinoa', 'avocado', 'edamame']
  },
  {
    id: 3,
    name: 'Homemade Pasta',
    image: 'https://images.unsplash.com/photo-1751151497799-8b4057a2638e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY29va2VkJTIwcGFzdGF8ZW58MXx8fHwxNzY1NjQ0MDUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['pasta', 'sauce', 'basil']
  },
  {
    id: 4,
    name: 'Vegetable Wok',
    image: 'https://images.unsplash.com/photo-1553709225-9eb59ce4d215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaW5uZXIlMjBwbGF0ZSUyMGhvbWV8ZW58MXx8fHwxNzY1NjQ0MDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['noodles', 'vegetables', 'sauce']
  },
  {
    id: 5,
    name: 'Healthy Breakfast',
    image: 'https://images.unsplash.com/photo-1649927866910-1a01a44b214c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjB0YWJsZSUyMGZsYXRsYXl8ZW58MXx8fHwxNzY1NjQ0MDUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['granola', 'fruits', 'yogurt']
  },
];

export function TinderOnboarding({ onComplete, isRevisit = false }: TinderOnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<(string | number)[]>([]);
  const [showParticles, setShowParticles] = useState(false);
  const [particleKey, setParticleKey] = useState(0); // Key to force re-render of particles
  // We track the exit direction: 1 for right, -1 for left
  const [exitDirection, setExitDirection] = useState(0);
  
  // Image scanning state
  const [scanMode, setScanMode] = useState(false);
  const [scannedDish, setScannedDish] = useState<RecommendedDish | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Name collection state
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserNameInput] = useState('');

  const currentDish = dishes[currentIndex];

  // Helper to safely increment index or complete
  const nextCard = () => {
    if (currentIndex < dishes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (!isRevisit) {
        // Show name input before completing
        setShowNameInput(true);
      } else {
        setCurrentIndex(0);
        setLiked([]);
      }
    }
  };
  
  const handleNameSubmit = () => {
    if (userName.trim()) {
      setUserName(userName.trim());
      setOnboardingComplete(true);
      onComplete();
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    // Set direction for the exit animation
    const dir = direction === 'right' ? 1 : -1;
    setExitDirection(dir);
    
    // Logic for "Like"
    if (direction === 'right') {
      setLiked([...liked, currentDish.id as string | number]);
      // Force new particle animation by resetting and incrementing key
      setShowParticles(false); // Reset first
      setParticleKey(prev => prev + 1); // Force re-render with new key
      // Use setTimeout to ensure state update happens after reset
      setTimeout(() => {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 3500); // Match animation duration (3s + delay)
      }, 0);
    }

    // Immediately trigger next card
    // The component will unmount and the exit animation will play thanks to AnimatePresence
    nextCard();
  };


  // Show name input screen if needed
  if (showNameInput && !isRevisit) {
    return (
      <motion.div
        className="h-full w-full bg-black flex flex-col items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-full max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-white text-3xl font-bold mb-2 text-center">
            Bienvenue ! 👋
          </h2>
          <p className="text-white/70 text-center mb-8 text-lg">
            Comment veux-tu qu'on t'appelle ?
          </p>
          
          <div className="space-y-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserNameInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && userName.trim()) {
                  handleNameSubmit();
                }
              }}
              placeholder="Ton prénom"
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-emerald-500 transition-colors"
              autoFocus
            />
            
            <motion.button
              onClick={handleNameSubmit}
              disabled={!userName.trim()}
              className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileTap={{ scale: 0.95 }}
              whileHover={userName.trim() ? { scale: 1.02 } : {}}
            >
              <span>Continuer</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (!currentDish) {
    return null;
  }

  return (
    <div className="h-full w-full bg-black flex flex-col relative overflow-hidden">
      {/* Header */}
      {!isRevisit && (
        <div className="absolute top-0 left-0 right-0 z-30 pt-12 pb-4 px-6 bg-gradient-to-b from-black/80 to-transparent">
          <h2 className="text-white text-2xl text-center mb-1 font-bold">
            Discover Dishes
          </h2>
          <p className="text-white/80 text-center text-sm">
            Swipe to tell us what you like
          </p>
          <div className="flex justify-center gap-1.5 mt-4">
            {dishes.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx < currentIndex ? 'w-6 bg-emerald-700' :
                  idx === currentIndex ? 'w-10 bg-emerald-400' :
                  'w-4 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Card Stack */}
      <div className="absolute inset-0 z-10">
        {/* Next card (background placeholder) */}
        {currentIndex < dishes.length - 1 && (
          <div className="absolute inset-0 bg-black">
             <img
              src={dishes[currentIndex + 1].image}
              alt={dishes[currentIndex + 1].name}
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Simulating the "scale down" look of the next card so it matches the Enter animation */}
             <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        {/* Current card with AnimatePresence */}
        <AnimatePresence mode="popLayout" initial={false} custom={exitDirection}>
          {currentDish && (
            <SwipeCard
              key={currentDish.id}
              dish={currentDish}
              onSwipe={handleSwipe}
              custom={exitDirection}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Action buttons */}
      <div className="absolute bottom-12 left-0 right-0 z-40 flex justify-center items-center gap-12 pointer-events-none">
          <motion.button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border-2 border-red-500/50 flex items-center justify-center shadow-xl pointer-events-auto transition-colors hover:bg-black/80"
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-8 h-8 text-red-500" strokeWidth={3} />
          </motion.button>

          <motion.button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border-2 border-emerald-500/50 flex items-center justify-center shadow-xl pointer-events-auto transition-colors hover:bg-black/80"
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="w-8 h-8 text-emerald-500 fill-emerald-500" />
          </motion.button>
      </div>
      
       {/* Particle explosion effect */}
       {showParticles && (
          <ParticleExplosion key={particleKey} ingredients={currentDish.ingredients} />
        )}
    </div>
  );
}

interface SwipeCardProps {
  dish: typeof dishes[0] | {
    id: string;
    name: string;
    image: string;
    ingredients: string[];
    score?: number;
    products?: Array<{
      name: string;
      brand: string;
      image: string;
      ecoScore?: string;
    }>;
  };
  onSwipe: (direction: 'left' | 'right') => void;
  custom?: number;
}

const variants = {
  enter: (direction: number) => ({
    scale: 0.95, // Start slightly smaller (like the background card)
    opacity: 0,  // Start invisible (or fading in from background)
    x: 0,
    zIndex: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 }
    }
  },
  exit: (direction: number) => ({
    zIndex: 1,
    x: direction * 1000, // Fly off screen in the direction of swipe
    opacity: 0,
    rotate: direction * 20, // Rotate while flying
    transition: { duration: 0.3, ease: "easeInOut" }
  })
};

function SwipeCard({ dish, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]); 
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    }
    // If threshold not met, the spring animation in 'center' variant will snap it back
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }} 
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{ x, rotate }}
      className="absolute inset-0 w-full h-full overflow-hidden bg-black shadow-2xl cursor-grab active:cursor-grabbing"
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Image */}
      <img
        src={dish.image}
        alt={dish.name}
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Dark overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* Dish info */}
      <div className="absolute bottom-32 left-0 right-0 px-8 pb-4 z-10 pointer-events-none">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-white text-3xl drop-shadow-lg font-bold tracking-tight flex-1">
            {dish.name}
          </h3>
          {'score' in dish && dish.score !== undefined && (
            <div className={`px-3 py-1.5 rounded-xl shadow-lg ${
              dish.score >= 80 ? 'bg-emerald-600' :
              dish.score >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white text-lg font-bold">{dish.score}</span>
                <span className="text-white/80 text-xs">/100</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dish.ingredients.map((ingredient, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 text-[10px] font-medium uppercase tracking-wide"
            >
              {ingredient}
            </span>
          ))}
        </div>
        {'products' in dish && dish.products && dish.products.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-white/80 text-xs font-medium mb-2">Produits recommandés (Open Food Facts):</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {dish.products.slice(0, 3).map((product, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 min-w-[100px]"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover mb-1"
                    />
                  )}
                  <p className="text-white text-[10px] font-semibold truncate mb-0.5">{product.name}</p>
                  <p className="text-white/60 text-[9px] truncate">{product.brand}</p>
                  {product.ecoScore && product.ecoScore !== 'unknown' && (
                    <div className="mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${
                        product.ecoScore === 'a' ? 'bg-emerald-600 text-white' :
                        product.ecoScore === 'b' ? 'bg-green-500 text-white' :
                        product.ecoScore === 'c' ? 'bg-yellow-500 text-black' :
                        'bg-orange-500 text-white'
                      }`}>
                        Eco: {product.ecoScore.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Swipe indicators */}
      <motion.div
        className="absolute top-20 right-10 z-20 pointer-events-none"
        style={{ opacity: likeOpacity, rotate: 15 }}
      >
        <div className="border-4 border-emerald-500 rounded-lg px-4 py-2 bg-black/20 backdrop-blur-sm">
             <span className="text-emerald-500 text-4xl font-black tracking-widest uppercase">LIKE</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-20 left-10 z-20 pointer-events-none"
        style={{ opacity: nopeOpacity, rotate: -15 }}
      >
         <div className="border-4 border-red-500 rounded-lg px-4 py-2 bg-black/20 backdrop-blur-sm">
            <span className="text-red-500 text-4xl font-black tracking-widest uppercase">NOPE</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ParticleExplosionProps {
  ingredients: string[];
}

function ParticleExplosion({ ingredients }: ParticleExplosionProps) {
  // Generate particles based on ingredients
  const particles = ingredients.flatMap((ingredient, idx) => 
    Array(8).fill(null).map((_, i) => ({ // Increased particle count
      id: `${idx}-${i}`,
      ingredient,
      imagePath: ingredientImagePaths[ingredient.toLowerCase()] || '/food-icons/vegetables.png', // Fallback
      delay: Math.random() * 0.1,
      angle: (Math.random() * 360) * (Math.PI / 180), // Random angle in radians
      velocity: 300 + Math.random() * 300, // Random velocity
      rotation: Math.random() * 360
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute top-1/2 left-1/2 flex items-center justify-center"
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 0,
            scale: 0.5,
            rotate: 0
          }}
          animate={{ 
            x: Math.cos(particle.angle) * particle.velocity,
            y: Math.sin(particle.angle) * particle.velocity,
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 0.8],
            rotate: particle.rotation + 360
          }}
          transition={{
            duration: 3.0, // 3 seconds
            delay: particle.delay,
            ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for "explosive" feel
            times: [0, 0.1, 0.8, 1]
          }}
        >
          <div className="p-1">
            <img 
              src={particle.imagePath} 
              alt={particle.ingredient}
              className="w-10 h-10 object-contain drop-shadow-lg"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
