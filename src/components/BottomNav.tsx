'use client';

import { motion } from 'motion/react';
import { Home, Flame, Camera, Trophy, User } from 'lucide-react';
import type { Screen } from './MainApp';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'feed' as Screen, icon: Home, label: 'Feed' },
    { id: 'swipe' as Screen, icon: Flame, label: 'Discover' },
    { id: 'camera' as Screen, icon: Camera, label: '' },
    { id: 'challenges' as Screen, icon: Trophy, label: 'Challenges' },
    { id: 'profile' as Screen, icon: User, label: 'Profile' },
  ];

  return (
    <div className="bg-black/98 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom shadow-2xl">
      <div className="flex items-center justify-around px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const isCamera = item.id === 'camera';
          
          if (isCamera) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative -mt-7 z-10"
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-2xl border-2 border-white/20"
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.05 }}
                  animate={isActive ? { 
                    boxShadow: [
                      '0 0 0 0 rgba(16, 185, 129, 0.4)',
                      '0 0 0 8px rgba(16, 185, 129, 0)',
                      '0 0 0 0 rgba(16, 185, 129, 0)'
                    ]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
              </button>
            );
          }
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3 min-w-[60px]"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Icon 
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-white/40'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              {item.label && (
                <motion.span 
                  className={`text-xs mt-1 font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-white/40'
                  }`}
                  animate={isActive ? { scale: 1.05 } : {}}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
