'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Generate stable pseudo-random values for particles using seeded function
  const particles = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: 30 }, (_, i) => {
      const seed = i * 0.1;
      return {
        id: i,
        width: seededRandom(seed) * 4 + 2,
        height: seededRandom(seed + 1) * 4 + 2,
        opacity: seededRandom(seed + 2) * 0.3 + 0.1,
        shadow: seededRandom(seed + 3) * 6 + 4,
        initialX: seededRandom(seed + 4),
        animateX: seededRandom(seed + 5),
        duration: seededRandom(seed + 6) * 4 + 3,
        delay: seededRandom(seed + 7) * 2,
      };
    });
  }, []);

  useEffect(() => {
    // Set dimensions for SSR compatibility
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Enhanced animated background particles */}
      {dimensions.width > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.width,
                height: particle.height,
                background: `rgba(255, 255, 255, ${particle.opacity})`,
                boxShadow: `0 0 ${particle.shadow}px rgba(255, 255, 255, 0.5)`,
              }}
              initial={{ 
                x: particle.initialX * dimensions.width,
                y: dimensions.height + 50,
                scale: 0,
              }}
              animate={{ 
                y: -50,
                x: particle.animateX * dimensions.width,
                scale: [0, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "easeOut",
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Logo with enhanced animations */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          delay: 0.15 
        }}
        className="relative z-10 mb-6"
      >
        {/* Glow effect behind logo */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
            borderRadius: '50%',
            width: '200px',
            height: '200px',
            margin: '-50px',
          }}
        />
        
        {/* Logo container with shadow */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-4 backdrop-blur-sm">
            <Image
              src="/logo_eatreal_transparent.png"
              alt="Eat Real Logo"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Slogan */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-32 px-8 text-center max-w-lg"
      >
        <motion.p 
          className="text-white text-2xl md:text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.7,
            type: "spring",
            stiffness: 200,
          }}
          style={{
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
        >
          Make low-carbon eating visible.
        </motion.p>
      </motion.div>

    </motion.div>
  );
}
