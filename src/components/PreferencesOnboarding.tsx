'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Leaf, Beef, Activity, Weight } from 'lucide-react';
import { getUserId, setPreferencesComplete } from '@/lib/cookies';

interface PreferencesOnboardingProps {
  onComplete: () => void;
}

export function PreferencesOnboarding({ onComplete }: PreferencesOnboardingProps) {
  const [dietaryPreference, setDietaryPreference] = useState(50); // 0 = vegan, 100 = carnivore
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState(2); // 0-4 scale

  const activityOptions = [
    { value: 0, label: 'Sedentary', description: 'Little to no exercise' },
    { value: 1, label: 'Light', description: '1-3 days per week' },
    { value: 2, label: 'Moderate', description: '3-5 days per week' },
    { value: 3, label: 'Active', description: '6-7 days per week' },
    { value: 4, label: 'Very Active', description: '2x per day or intense' },
  ];

  const handleSubmit = async () => {
    if (!weight || parseFloat(weight) <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    const userId = getUserId();
    
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('dietary_preference', dietaryPreference.toString());
      formData.append('weight_kg', weight);
      formData.append('activity_level', activityLevel.toString());

      const response = await fetch('/api/user', {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save preferences');
      }

      setPreferencesComplete(true);
      onComplete();
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const getDietaryLabel = (value: number) => {
    if (value <= 20) return 'Vegan';
    if (value <= 40) return 'Vegetarian';
    if (value <= 60) return 'Flexitarian';
    if (value <= 80) return 'Omnivore';
    return 'Carnivore';
  };

  return (
    <motion.div
      className="h-full w-full bg-gradient-to-br from-emerald-950 via-black to-black flex flex-col items-center justify-center px-6 overflow-y-auto py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-white text-4xl font-bold mb-2">
            Personalize Your Experience
          </h1>
          <p className="text-white/70 text-lg">
            Help us tailor recommendations just for you
          </p>
        </motion.div>

        {/* Dietary Preference Slider */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Dietary Preference</h3>
              <p className="text-white/60 text-sm">Where do you want to get to with your diet?</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span className="text-white/80 text-sm">Vegan</span>
              </div>
              <div className="flex items-center gap-2">
                <Beef className="w-4 h-4 text-red-400" />
                <span className="text-white/80 text-sm">Carnivore</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${dietaryPreference}%, rgba(255,255,255,0.1) ${dietaryPreference}%, rgba(255,255,255,0.1) 100%)`
              }}
            />

            <div className="mt-3 text-center">
              <span className="text-emerald-400 font-bold text-xl">
                {getDietaryLabel(dietaryPreference)}
              </span>
              <span className="text-white/60 text-sm ml-2">({dietaryPreference}/100)</span>
            </div>
          </div>
        </motion.div>

        {/* Weight Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Weight className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Your Weight</h3>
              <p className="text-white/60 text-sm">For personalized nutrition</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter your weight in kg"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white text-lg placeholder-white/40 focus:outline-none focus:border-emerald-500 transition-colors"
              min="1"
              max="500"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-sm">
              kg
            </span>
          </div>
        </motion.div>

        {/* Activity Level */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Physical Activity</h3>
              <p className="text-white/60 text-sm">How often do you exercise?</p>
            </div>
          </div>

          <div className="space-y-2">
            {activityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActivityLevel(option.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  activityLevel === option.value
                    ? 'bg-emerald-500/20 border-emerald-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-white/60 text-sm">{option.description}</div>
                  </div>
                  {activityLevel === option.value && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleSubmit}
          disabled={!weight || parseFloat(weight) <= 0}
          className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
