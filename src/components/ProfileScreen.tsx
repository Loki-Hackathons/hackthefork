'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, TrendingUp, Settings, Leaf, Flame, Users } from 'lucide-react';
import { fetchUserStats, type UserStats } from '@/services/api';
import { getUserId, getUserName, setUserName, getUserAvatar, getUserAvatarImage, setUserAvatar, setUserAvatarImage } from '@/lib/cookies';
import { SettingsScreen } from './SettingsScreen';
import type { Screen } from './MainApp';
import { calculateAggregatedScore } from '@/lib/score-utils';

const mockHistory = [
  { id: 1, score: 95, image: 'https://images.unsplash.com/photo-1693042978560-5711db96a991?w=400' },
  { id: 2, score: 88, image: 'https://images.unsplash.com/photo-1510035618584-c442b241abe7?w=400' },
  { id: 3, score: 92, image: 'https://images.unsplash.com/photo-1751151497799-8b4057a2638e?w=400' },
  { id: 4, score: 90, image: 'https://images.unsplash.com/photo-1553709225-9eb59ce4d215?w=400' },
  { id: 5, score: 87, image: 'https://images.unsplash.com/photo-1521388825798-fec41108def2?w=400' },
  { id: 6, score: 85, image: 'https://images.unsplash.com/photo-1649927866910-1a01a44b214c?w=400' },
  { id: 7, score: 93, image: 'https://images.unsplash.com/photo-1543353071-c953d88f7033?w=400' },
  { id: 8, score: 89, image: 'https://images.unsplash.com/photo-1760537440650-37ccbfe91d2c?w=400' },
  { id: 9, score: 94, image: 'https://images.unsplash.com/photo-1693042978560-5711db96a991?w=400' },
];

const mockLeaderboard = [
  { rank: 1, name: 'Sophie', username: '@sophie.m', score: 481, avatar: '👩‍🍳', isMe: true },
  { rank: 2, name: 'Marc', username: '@marc.l', score: 457, avatar: '👨‍🍳', isMe: false },
  { rank: 3, name: 'Emma', username: '@emma.r', score: 423, avatar: '👩', isMe: false },
  { rank: 4, name: 'Thomas', username: '@thomas.d', score: 398, avatar: '👨', isMe: false },
];

interface ProfileScreenProps {
  onNavigate?: (screen: Screen) => void;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps = {}) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserNameState] = useState(getUserName());
  const [avatarRefresh, setAvatarRefresh] = useState(0); // Force re-render when avatar changes
  const startPos = useRef({ x: 0, y: 0 });
  const userId = getUserId();

  useEffect(() => {
    loadStats();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    // Try to load name and avatar from database, fallback to cookie
    try {
      const response = await fetch(`/api/user?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user?.name) {
          setUserNameState(data.user.name);
          setUserName(data.user.name); // Also update cookie
        }
        // Update avatar from database if available
        if (data.user?.avatar_image_url) {
          setUserAvatarImage(data.user.avatar_image_url);
        } else if (data.user?.avatar) {
          setUserAvatar(data.user.avatar);
        }
      }
    } catch (error) {
      console.error('Error loading user data from database:', error);
      // Fallback to cookie is already handled by getUserName()
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const userStats = await fetchUserStats();
      console.log('📊 Stats loaded:', userStats); // Debug
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      // En cas d'erreur, initialiser avec des valeurs par défaut pour éviter les 0
      setStats({
        post_count: 0,
        avg_vegetal_score: 0,
        avg_health_score: 0,
        avg_carbon_score: 0,
        total_co2_avoided: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get avatar from user_id (fallback)
  const getAvatar = (id: string) => {
    const avatars = ['👩‍🍳', '👨‍🍳', '👩', '👨', '🧑‍🍳'];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatars[hash % avatars.length];
  };

  // Get avatar from cookie/image if set, otherwise use default based on user_id
  // Use avatarRefresh to force re-render when avatar changes
  const savedImage = getUserAvatarImage();
  const savedAvatar = getUserAvatar();
  // Check if savedImage is a URL (starts with http) or base64 (starts with data:)
  const isImageUrl = savedImage && (savedImage.startsWith('http') || savedImage.startsWith('https'));
  const avatar = savedImage || savedAvatar || getAvatar(userId);
  const isImageAvatar = !!savedImage;
  
  // This ensures the avatar updates when settings close
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Avatar is computed in render, this just forces a re-render check
  }, [avatarRefresh]);
  const totalScore = stats 
    ? calculateAggregatedScore({
        vegetal: stats.avg_vegetal_score,
        health: stats.avg_health_score,
        carbon: stats.avg_carbon_score
      })
    : 0;

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    setRotation({
      x: Math.max(-45, Math.min(45, rotation.x - deltaY * 0.5)),
      y: Math.max(-45, Math.min(45, rotation.y + deltaX * 0.5))
    });
    
    startPos.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black overflow-y-auto pb-24">
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-4xl border-4 border-white/10 overflow-hidden">
              {isImageAvatar ? (
                <img 
                  src={avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                avatar
              )}
            </div>
            <div>
              <h1 className="text-white text-2xl">
                {userName || 'My Profile'}
              </h1>
              <div className="text-white/50 text-sm">
                {userName ? userId.slice(0, 8) + '...' : userId.slice(0, 8) + '...'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats - Instagram style */}
        <div className="flex items-center justify-around mb-6">
          <div className="text-center">
            <div className="text-white text-2xl mb-1">
              {stats?.post_count || 0}
            </div>
            <div className="text-white/50 text-sm">posts</div>
          </div>
          <div className="text-center">
            <div className="text-white text-2xl mb-1">
              {stats?.avg_vegetal_score || 0}
            </div>
            <div className="text-white/50 text-sm">plant-based</div>
          </div>
          <div className="text-center">
            <div className="text-white text-2xl mb-1">
              {stats?.avg_carbon_score || 0}
            </div>
            <div className="text-white/50 text-sm">carbon</div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">Average score: {totalScore}/100</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">{stats?.total_co2_avoided || 0}kg of CO₂ saved</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (onNavigate) {
                onNavigate('challenges');
              }
            }}
            className="flex-1 py-2.5 bg-yellow-500 text-black rounded-xl flex items-center justify-center gap-2 font-semibold"
          >
            <Trophy className="w-5 h-5" />
            Challenges
          </button>
          <button className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
            <Users className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* The Globe - WOW Effect */}
      <div className="px-6 py-8">
        <h2 className="text-white text-xl mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          Environmental Impact
        </h2>
        
        {stats && stats.post_count === 0 ? (
          <div className="bg-emerald-950/50 rounded-3xl p-8 relative overflow-hidden border border-emerald-500/20 text-center">
            <p className="text-white/60 text-sm mb-2">Aucun post encore</p>
            <p className="text-white/40 text-xs">Créez votre premier post pour voir vos statistiques !</p>
          </div>
        ) : (
        <div className="bg-emerald-950/50 rounded-3xl p-8 relative overflow-hidden border border-emerald-500/20">
          {/* Background glow */}
          <div className="absolute inset-0 bg-emerald-500/5" />
          
          {/* Interactive 3D visualization */}
          <div 
            className="relative w-full aspect-square flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <svg 
              viewBox="0 0 240 240" 
              className="w-full h-full"
              style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {/* Axes */}
              {[
                { angle: 0, label: 'Health', shortLabel: 'Health', value: stats?.avg_health_score || 0, color: '#10b981' },
                { angle: 90, label: 'Carbon', shortLabel: 'Carbon', value: stats?.avg_carbon_score || 0, color: '#3b82f6' },
                { angle: 180, label: 'Plant-based', shortLabel: 'Plant', value: stats?.avg_vegetal_score || 0, color: '#8b5cf6' },
                { angle: 270, label: 'Average', shortLabel: 'Avg', value: totalScore, color: '#f59e0b' },
              ].map((axis, idx) => {
                const rad = (axis.angle * Math.PI) / 180;
                const centerX = 120; // Centre ajusté pour le nouveau viewBox
                const centerY = 120;
                const maxRadius = 75; // Réduit pour laisser plus d'espace pour les labels
                const valueRadius = (axis.value / 100) * maxRadius;
                const labelRadius = maxRadius + 30; // Plus d'espace pour les labels
                
                return (
                  <g key={idx}>
                    <line
                      x1={centerX}
                      y1={centerY}
                      x2={centerX + maxRadius * Math.cos(rad)}
                      y2={centerY + maxRadius * Math.sin(rad)}
                      stroke="#ffffff20"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    
                    <circle
                      cx={centerX + valueRadius * Math.cos(rad)}
                      cy={centerY + valueRadius * Math.sin(rad)}
                      r="5"
                      fill={axis.color}
                      className="drop-shadow-lg"
                    />
                    
                    {/* Label court pour éviter les coupures */}
                    <text
                      x={centerX + labelRadius * Math.cos(rad)}
                      y={centerY + labelRadius * Math.sin(rad)}
                      fill="white"
                      fontSize="11"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontWeight: '500' }}
                    >
                      {axis.shortLabel}
                    </text>
                    
                    {/* Valeur */}
                    <text
                      x={centerX + labelRadius * Math.cos(rad)}
                      y={centerY + labelRadius * Math.sin(rad) + 15}
                      fill={axis.color}
                      fontSize="18"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {axis.value}
                    </text>
                  </g>
                );
              })}
              
              {/* Filled shape */}
              <motion.path
                d={`
                  M ${120 + ((stats?.avg_health_score || 0) / 100) * 75 * Math.cos(0)} ${120 + ((stats?.avg_health_score || 0) / 100) * 75 * Math.sin(0)}
                  L ${120 + ((stats?.avg_carbon_score || 0) / 100) * 75 * Math.cos(Math.PI / 2)} ${120 + ((stats?.avg_carbon_score || 0) / 100) * 75 * Math.sin(Math.PI / 2)}
                  L ${120 + ((stats?.avg_vegetal_score || 0) / 100) * 75 * Math.cos(Math.PI)} ${120 + ((stats?.avg_vegetal_score || 0) / 100) * 75 * Math.sin(Math.PI)}
                  L ${120 + (totalScore / 100) * 75 * Math.cos(3 * Math.PI / 2)} ${120 + (totalScore / 100) * 75 * Math.sin(3 * Math.PI / 2)}
                  Z
                `}
                fill="url(#gradient)"
                fillOpacity="0.3"
                stroke="url(#gradient)"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              
              {/* Center score */}
              <circle cx="120" cy="120" r="32" fill="#000000" />
              <circle cx="120" cy="120" r="30" fill="url(#gradient)" fillOpacity="0.2" />
              <text
                x="120"
                y="115"
                fill="white"
                fontSize="28"
                textAnchor="middle"
                dominantBaseline="middle"
                fontWeight="bold"
              >
                {totalScore}
              </text>
              <text
                x="120"
                y="132"
                fill="#10b981"
                fontSize="11"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                SCORE
              </text>
            </svg>
          </div>
          
          <p className="text-white/40 text-center text-sm mt-4">
            Swipe to rotate
          </p>
        </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="px-6 pb-6">
        <h2 className="text-white text-xl mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          Statistics
        </h2>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Average plant-based score</span>
            <span className="text-white text-xl font-bold">{stats?.avg_vegetal_score || 0}/100</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70">Average health score</span>
            <span className="text-white text-xl font-bold">{stats?.avg_health_score || 0}/100</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70">Average carbon score</span>
            <span className="text-white text-xl font-bold">{stats?.avg_carbon_score || 0}/100</span>
          </div>
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Total CO₂ saved</span>
              <span className="text-emerald-400 text-xl font-bold">{stats?.total_co2_avoided || 0}kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsScreen 
            onClose={() => {
              setShowSettings(false);
              // Reload user name and avatar after settings close
              setUserNameState(getUserName());
              setAvatarRefresh(prev => prev + 1); // Force re-render to show new avatar
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
