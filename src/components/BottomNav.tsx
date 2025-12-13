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
    <div className="bg-black/95 backdrop-blur-lg border-t border-white/10 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const isCamera = item.id === 'camera';
          
          if (isCamera) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative -mt-6"
              >
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/50"
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </motion.div>
              </button>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3 min-w-[60px]"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
              >
                <Icon 
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-white' : 'text-white/40'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              {item.label && (
                <span className={`text-xs mt-1 transition-colors ${
                  isActive ? 'text-white' : 'text-white/40'
                }`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
