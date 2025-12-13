import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { Heart, X, Sparkles } from 'lucide-react';

interface TinderOnboardingProps {
  onComplete: () => void;
  isRevisit?: boolean;
}

const dishes = [
  {
    id: 1,
    name: 'curry maison 🍛',
    image: 'https://images.unsplash.com/photo-1693042978560-5711db96a991?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMGZvb2QlMjBwbGF0ZXxlbnwxfHx8fDE3NjU2NDQwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['curry', 'riz', 'légumes']
  },
  {
    id: 2,
    name: 'buddha bowl',
    image: 'https://images.unsplash.com/photo-1510035618584-c442b241abe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBsdW5jaCUyMGJvd2x8ZW58MXx8fHwxNzY1NjQ0MDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['quinoa', 'avocat', 'edamame']
  },
  {
    id: 3,
    name: 'pasta fait maison',
    image: 'https://images.unsplash.com/photo-1751151497799-8b4057a2638e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY29va2VkJTIwcGFzdGF8ZW58MXx8fHwxNzY1NjQ0MDUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['pâtes', 'sauce', 'basilic']
  },
  {
    id: 4,
    name: 'wok de légumes',
    image: 'https://images.unsplash.com/photo-1553709225-9eb59ce4d215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaW5uZXIlMjBwbGF0ZSUyMGhvbWV8ZW58MXx8fHwxNzY1NjQ0MDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['nouilles', 'légumes', 'sauce']
  },
  {
    id: 5,
    name: 'petit déj healthy',
    image: 'https://images.unsplash.com/photo-1649927866910-1a01a44b214c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjB0YWJsZSUyMGZsYXRsYXl8ZW58MXx8fHwxNzY1NjQ0MDUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['granola', 'fruits', 'yaourt']
  },
  {
    id: 6,
    name: 'meal prep',
    image: 'https://images.unsplash.com/photo-1543353071-c953d88f7033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWFsJTIwcHJlcCUyMGNvbnRhaW5lcnxlbnwxfHx8fDE3NjU2NDQwNTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['poulet', 'riz', 'brocoli']
  },
  {
    id: 7,
    name: 'tartines du matin',
    image: 'https://images.unsplash.com/photo-1521388825798-fec41108def2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGhvdG9ncmFwaHklMjBvdmVyaGVhZHxlbnwxfHx8fDE3NjU2NDQwNTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['pain', 'avocat', 'œuf']
  },
  {
    id: 8,
    name: 'assiette complète',
    image: 'https://images.unsplash.com/photo-1760537440650-37ccbfe91d2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraXRjaGVuJTIwY29va2luZyUyMHByb2Nlc3N8ZW58MXx8fHwxNzY1NjQ0MDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: ['protéines', 'légumes', 'féculents']
  },
];

export function TinderOnboarding({ onComplete, isRevisit = false }: TinderOnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [showParticles, setShowParticles] = useState(false);

  const currentDish = dishes[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setLiked([...liked, currentDish.id]);
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }

    setTimeout(() => {
      if (currentIndex < dishes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        if (!isRevisit) {
          onComplete();
        } else {
          setCurrentIndex(0);
        }
      }
    }, 300);
  };

  if (!currentDish) {
    return null;
  }

  return (
    <div className="h-full w-full bg-black flex flex-col relative overflow-hidden">
      {/* Header */}
      {!isRevisit && (
        <div className="absolute top-0 left-0 right-0 z-20 pt-12 pb-6 px-6 bg-gradient-to-b from-black/80 to-transparent">
          <h2 className="text-white text-3xl text-center mb-2">
            Découvre des plats
          </h2>
          <p className="text-white/60 text-center">
            Swipe pour nous dire ce qui te plaît
          </p>
          <div className="flex justify-center gap-1.5 mt-6">
            {dishes.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx < currentIndex ? 'w-6 bg-emerald-500' :
                  idx === currentIndex ? 'w-10 bg-emerald-400' :
                  'w-4 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Next card (background) */}
        {currentIndex < dishes.length - 1 && (
          <motion.div
            className={`absolute inset-x-6 rounded-3xl bg-slate-800 ${
              !isRevisit ? 'top-40 bottom-20' : 'inset-y-20'
            }`}
            initial={{ scale: 0.92, opacity: 0.3 }}
            animate={{ scale: 0.92, opacity: 0.3 }}
          />
        )}

        {/* Current card */}
        <SwipeCard
          dish={currentDish}
          onSwipe={handleSwipe}
          key={currentDish.id}
          isColdStart={!isRevisit}
        />

        {/* Particle explosion effect */}
        {showParticles && (
          <ParticleExplosion ingredients={currentDish.ingredients} />
        )}
      </div>

      {/* Action buttons */}
      <div className="pb-12 px-8 flex justify-center gap-8 z-20">
        <motion.button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border-2 border-white/20 flex items-center justify-center shadow-xl"
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-8 h-8 text-white" strokeWidth={3} />
        </motion.button>
        <motion.button
          onClick={() => handleSwipe('right')}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl shadow-emerald-500/50"
          whileTap={{ scale: 0.9 }}
        >
          <Heart className="w-9 h-9 text-white fill-white" />
        </motion.button>
      </div>
    </div>
  );
}

interface SwipeCardProps {
  dish: typeof dishes[0];
  onSwipe: (direction: 'left' | 'right') => void;
  isColdStart?: boolean;
}

function SwipeCard({ dish, onSwipe, isColdStart = false }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      className={`absolute inset-x-6 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing ${
        isColdStart ? 'top-40 bottom-20' : 'inset-y-20'
      }`}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Image */}
      <img
        src={dish.image}
        alt={dish.name}
        className="w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

      {/* Dish info */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h3 className="text-white text-4xl mb-4 drop-shadow-lg">
          {dish.name}
        </h3>
        <div className="flex flex-wrap gap-2">
          {dish.ingredients.map((ingredient, idx) => (
            <span
              key={idx}
              className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20"
            >
              {ingredient}
            </span>
          ))}
        </div>
      </div>

      {/* Swipe indicators */}
      <motion.div
        className="absolute top-12 right-8 px-8 py-4 bg-emerald-500 rounded-2xl rotate-12 border-4 border-white shadow-2xl"
        style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
      >
        <span className="text-white text-3xl drop-shadow">OUI!</span>
      </motion.div>

      <motion.div
        className="absolute top-12 left-8 px-8 py-4 bg-white rounded-2xl -rotate-12 border-4 border-red-500 shadow-2xl"
        style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
      >
        <span className="text-red-500 text-3xl drop-shadow">NOPE</span>
      </motion.div>
    </motion.div>
  );
}

interface ParticleExplosionProps {
  ingredients: string[];
}

function ParticleExplosion({ ingredients }: ParticleExplosionProps) {
  const particles = ingredients.flatMap((ingredient, idx) => 
    Array(4).fill(null).map((_, i) => ({
      id: `${idx}-${i}`,
      text: ingredient,
      delay: Math.random() * 0.2
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute top-1/2 left-1/2 px-4 py-2 bg-emerald-500 text-white rounded-full shadow-lg"
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 1, 
            scale: 1 
          }}
          animate={{ 
            x: (Math.random() - 0.5) * 500,
            y: Math.random() * -400 - 100,
            opacity: 0,
            scale: 0.3,
          }}
          transition={{
            duration: 1,
            delay: particle.delay,
            ease: "easeOut"
          }}
        >
          {particle.text}
        </motion.div>
      ))}

      {/* Basket icon at bottom */}
      <motion.div
        className="absolute bottom-24 right-8 w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>
    </div>
  );
}
