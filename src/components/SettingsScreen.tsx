'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, User } from 'lucide-react';
import { getUserName, setUserName, getUserId } from '@/lib/cookies';

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(getUserName());
  }, []);

  const handleSave = async () => {
    if (name.trim()) {
      setIsSaving(true);
      try {
        // Save to cookie (for immediate UI update)
        setUserName(name.trim());
        
        // Also save to database
        const userId = getUserId();
        const response = await fetch('/api/user', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, name: name.trim() })
        });
        
        if (!response.ok) {
          console.warn('Failed to save name to database, but saved to cookie');
        }
      } catch (error) {
        console.error('Error saving name:', error);
        // Still save to cookie even if DB fails
      } finally {
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          onClose();
        }, 1000);
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black/95 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Name Section */}
        <div className="mb-6">
          <label className="text-white/70 text-sm mb-2 block">Your name</label>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleSave();
                }
              }}
              placeholder="Your first name"
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          disabled={!name.trim() || isSaving}
          className="w-full py-4 bg-emerald-500 text-white rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          whileTap={{ scale: 0.95 }}
          whileHover={name.trim() && !isSaving ? { scale: 1.02 } : {}}
        >
          {saved ? (
            <>
              <span>✓ Saved</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
