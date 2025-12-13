'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Leaf, Apple, Cloud } from 'lucide-react';
import type { Screen } from './MainApp';
import { fetchPosts, toggleUpvote, type Post } from '@/services/api';

// Helper function to format time ago
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}j`;
}

// Helper function to get user avatar from user_id
function getUserAvatar(userId: string): string {
  const avatars = ['👩‍🍳', '👨‍🍳', '👩', '👨', '🧑‍🍳'];
  // Simple hash to get consistent avatar per user
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatars[hash % avatars.length];
}

export function FeedScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (err: any) {
      console.error('Error loading posts:', err);
      setError(err.message || 'Failed to load posts. Please check your Supabase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const upvoted = await toggleUpvote(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_upvoted: upvoted,
              upvote_count: upvoted 
                ? (post.upvote_count || 0) + 1 
                : Math.max(0, (post.upvote_count || 0) - 1)
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling upvote:', error);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = window.innerHeight;
    const index = Math.round(scrollTop / itemHeight);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">Erreur</div>
          <div className="text-white/70 text-sm mb-6">{error}</div>
          <div className="text-white/50 text-xs mb-4">
            Assurez-vous que:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Les variables d'environnement Supabase sont configurées</li>
              <li>Le schéma de base de données a été créé</li>
              <li>Le bucket de stockage "meal-images" existe</li>
            </ul>
          </div>
          <button
            onClick={loadPosts}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Aucun post pour le moment</div>
          <button
            onClick={() => onNavigate('camera')}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Créer le premier post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      onScroll={handleScroll}
    >
      {posts.map((post, index) => (
        <FeedPost
          key={post.id}
          post={post}
          onLike={handleLike}
          onNavigate={onNavigate}
          isActive={index === currentIndex}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}

interface FeedPostProps {
  post: Post;
  onLike: (postId: string) => void;
  onNavigate: (screen: Screen) => void;
  isActive: boolean;
  isFirst: boolean;
}

function FeedPost({ post, onLike, onNavigate, isActive, isFirst }: FeedPostProps) {
  const [showHeart, setShowHeart] = useState(false);
  const avatar = getUserAvatar(post.user_id);
  const timeAgo = getTimeAgo(post.created_at);

  const handleDoubleTap = () => {
    if (!post.is_upvoted) {
      onLike(post.id);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreIcon = (type: 'vegetal' | 'healthy' | 'carbon') => {
    switch (type) {
      case 'vegetal': return Leaf;
      case 'healthy': return Apple;
      case 'carbon': return Cloud;
    }
  };

  return (
    <div className="relative h-screen w-screen snap-start snap-always">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={post.image_url}
          alt="Meal"
          className="w-full h-full object-cover"
          onDoubleClick={handleDoubleTap}
        />
        {/* Solid overlays */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-black/60" />
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-black/80" />
      </div>

      {/* Double tap heart animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Heart className="w-40 h-40 text-white fill-white drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar - refined */}
      <div className="absolute top-0 left-0 right-0 pt-12 px-6 pb-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-2xl border-2 border-white/30 shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            {avatar}
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg drop-shadow-lg">User {post.user_id.slice(0, 8)}</span>
            </div>
            <div className="text-white/70 text-sm">{timeAgo}</div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors">
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Bottom content - completely redesigned */}
      <div className="absolute bottom-0 left-0 right-0 pb-28 px-6 z-20">
        <div className="flex items-end gap-6">
          {/* Left side - Content */}
          <div className="flex-1 pb-2">
            {/* Three Score Cards - Beautiful Design */}
            <div className="flex flex-wrap gap-3 mb-4">
              {([
                { type: 'vegetal' as const, score: post.vegetal_score, label: 'Végétal' },
                { type: 'healthy' as const, score: post.health_score, label: 'Santé' },
                { type: 'carbon' as const, score: post.carbon_score, label: 'Carbone' }
              ]).map(({ type, score, label }) => {
                const Icon = getScoreIcon(type);
                const colorClass = getScoreColor(score);

                return (
                  <motion.div
                    key={type}
                    className={`${colorClass} rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm border border-white/20`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (type === 'vegetal' ? 0 : type === 'healthy' ? 1 : 2) }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-white" />
                      <span className="text-white/90 text-xs font-medium">{label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-2xl font-bold">{score}</span>
                      <span className="text-white/70 text-xs">/100</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action hint */}
            <motion.button 
              onClick={() => onNavigate('shop')}
              className="text-white/80 text-sm flex items-center gap-2 hover:text-white transition-colors group"
              whileHover={{ x: 4 }}
            >
              <span>Tap pour cuisiner ça</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </motion.button>
          </div>

          {/* Right side - Actions - refined */}
          <div className="flex flex-col items-center gap-5 pb-2">
            {/* Like */}
            <motion.button
              onClick={() => onLike(post.id)}
              className="flex flex-col items-center gap-2 group"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className={`w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center border-2 transition-all ${
                  post.is_upvoted 
                    ? 'bg-red-500/30 border-red-400/50' 
                    : 'bg-black/40 border-white/20'
                }`}
                animate={post.is_upvoted ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-7 h-7 transition-all ${
                    post.is_upvoted ? 'text-red-500 fill-red-500' : 'text-white'
                  }`}
                />
              </motion.div>
              <span className="text-white text-sm font-medium drop-shadow-lg">
                {(post.upvote_count || 0) > 999 ? `${((post.upvote_count || 0) / 1000).toFixed(1)}k` : (post.upvote_count || 0)}
              </span>
            </motion.button>

            {/* Comment */}
            <motion.button 
              className="flex flex-col items-center gap-2 group"
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border-2 border-white/20 group-hover:border-white/40 transition-colors">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-sm font-medium drop-shadow-lg">0</span>
            </motion.button>

            {/* Share */}
            <motion.button 
              className="flex flex-col items-center gap-2 group"
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border-2 border-white/20 group-hover:border-white/40 transition-colors">
                <Share2 className="w-7 h-7 text-white" />
              </div>
            </motion.button>

            {/* Save */}
            <motion.button 
              className="flex flex-col items-center gap-2 group"
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border-2 border-white/20 group-hover:border-white/40 transition-colors">
                <Bookmark className="w-7 h-7 text-white" />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      {isFirst && (
        <motion.div
          className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-white/60 text-sm flex flex-col items-center gap-2">
            <span className="font-medium">Swipe up</span>
            <div className="w-1 h-10 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
