'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Save, User, Camera, Trash2 } from 'lucide-react';
import { getUserName, setUserName, getUserId, getUserAvatar, setUserAvatar, getUserAvatarImage, setUserAvatarImage, removeUserAvatarImage } from '@/lib/cookies';

interface SettingsScreenProps {
  onClose: () => void;
}

const AVAILABLE_AVATARS = ['👩‍🍳', '👨‍🍳', '👩', '👨', '🧑‍🍳', '👨‍💼', '👩‍💼', '🧑', '👶', '👵', '👴', '🤖'];

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(getUserName());
    const savedImage = getUserAvatarImage();
    if (savedImage) {
      setUploadedImage(savedImage);
    } else {
      const savedAvatar = getUserAvatar();
      if (savedAvatar) {
        setSelectedAvatar(savedAvatar);
      } else {
        // If no saved avatar, use the default one based on user_id
        const userId = getUserId();
        const avatars = AVAILABLE_AVATARS;
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        setSelectedAvatar(avatars[hash % avatars.length]);
      }
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setUploadedImage(base64String);
      // Clear emoji selection when image is uploaded
      setSelectedAvatar('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage('');
    removeUserAvatarImage();
    // Reset to default avatar
    const userId = getUserId();
    const avatars = AVAILABLE_AVATARS;
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    setSelectedAvatar(avatars[hash % avatars.length]);
  };

  const handleSave = async () => {
    if (name.trim() && (selectedAvatar || uploadedImage)) {
      setIsSaving(true);
      try {
        // Save to cookie (for immediate UI update)
        setUserName(name.trim());
        
        if (uploadedImage) {
          setUserAvatarImage(uploadedImage);
          setUserAvatar(''); // Clear emoji avatar when using image
        } else if (selectedAvatar) {
          setUserAvatar(selectedAvatar);
          removeUserAvatarImage(); // Clear image when using emoji
        }
        
        // Save to database via API
        const userId = getUserId();
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('name', name.trim());
        
        if (uploadedImage) {
          // Send base64 image to API
          formData.append('avatar_image_base64', uploadedImage);
          formData.append('avatar', ''); // Clear emoji
        } else if (selectedAvatar) {
          formData.append('avatar', selectedAvatar);
        }
        
        const response = await fetch('/api/user', {
          method: 'PATCH',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Failed to save to database:', errorData);
          // Still save to cookie even if DB fails
        } else {
          const result = await response.json();
          // Update local storage with the URL from database
          if (result.user?.avatar_image_url) {
            setUserAvatarImage(result.user.avatar_image_url);
          }
        }
      } catch (error) {
        console.error('Error saving:', error);
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

        {/* Avatar Section */}
        <div className="mb-6">
          <label className="text-white/70 text-sm mb-3 block">Profile Picture</label>
          
          {/* Preview */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-4xl border-4 border-white/20 flex-shrink-0 overflow-hidden">
              {uploadedImage ? (
                <>
                  <img 
                    src={uploadedImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </>
              ) : (
                selectedAvatar
              )}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm mb-1">
                {uploadedImage ? 'Your photo' : 'Choose your avatar'}
              </p>
              <p className="text-white/50 text-xs">
                {uploadedImage ? 'Tap to change or remove' : 'Upload a photo or select an emoji'}
              </p>
            </div>
          </div>

          {/* Upload Button */}
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="avatar-upload"
              ref={fileInputRef}
            />
            <motion.label
              htmlFor="avatar-upload"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-xl text-white cursor-pointer transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <Camera className="w-5 h-5" />
              <span>{uploadedImage ? 'Change Photo' : 'Upload Photo'}</span>
            </motion.label>
          </div>

          {/* Emoji Avatars */}
          <div>
            <p className="text-white/50 text-xs mb-2">Or choose an emoji:</p>
            <div className="grid grid-cols-6 gap-3">
              {AVAILABLE_AVATARS.map((avatar) => (
                <motion.button
                  key={avatar}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setUploadedImage('');
                    removeUserAvatarImage();
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                    selectedAvatar === avatar && !uploadedImage
                      ? 'bg-emerald-500 scale-110 border-4 border-white'
                      : 'bg-white/10 hover:bg-white/20 border-2 border-white/20'
                  }`}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {avatar}
                </motion.button>
              ))}
            </div>
          </div>
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
                if (e.key === 'Enter' && name.trim() && (selectedAvatar || uploadedImage)) {
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
          disabled={!name.trim() || (!selectedAvatar && !uploadedImage) || isSaving}
          className="w-full py-4 bg-emerald-500 text-white rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          whileTap={{ scale: 0.95 }}
          whileHover={name.trim() && (selectedAvatar || uploadedImage) && !isSaving ? { scale: 1.02 } : {}}
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
