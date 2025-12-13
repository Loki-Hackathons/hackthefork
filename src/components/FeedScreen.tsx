'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Leaf, Apple, Cloud } from 'lucide-react';
import type { Screen } from './MainApp';

interface MealScores {
  vegetal: number;
  healthy: number;
  carbon: number;
}

interface FeedPost {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  image: string;
  dishName: string;
  scores: MealScores;
  verified: boolean;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
}

const mockPosts: FeedPost[] = [
  {
    id: 1,
    user: {
      name: 'Sophie',
      username: '@sophie.m',
      avatar: '👩‍🍳'
    },
    image: 'https://images.unsplash.com/photo-1693042978560-5711db96a991?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMGZvb2QlMjBwbGF0ZXxlbnwxfHx8fDE3NjU2NDQwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    dishName: 'mon curry maison 🍛',
    scores: { vegetal: 95, healthy: 88, carbon: 92 },
    verified: true,
    likes: 847,
    comments: 23,
    timeAgo: '2h',
    isLiked: false
  },
  {
    id: 2,
    user: {
      name: 'Marc',
      username: '@marc.l',
      avatar: '👨‍🍳'
    },
    image: 'https://images.unsplash.com/photo-1510035618584-c442b241abe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBsdW5jaCUyMGJvd2x8ZW58MXx8fHwxNzY1NjQ0MDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    dishName: 'buddha bowl du midi',
    scores: { vegetal: 100, healthy: 92, carbon: 95 },
    verified: true,
    likes: 1203,
    comments: 45,
    timeAgo: '5h',
    isLiked: true
  },
  {
    id: 3,
    user: {
      name: 'Emma',
      username: '@emma.r',
      avatar: '👩'
    },
    image: 'https://images.unsplash.com/photo-1553709225-9eb59ce4d215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaW5uZXIlMjBwbGF0ZSUyMGhvbWV8ZW58MXx8fHwxNzY1NjQ0MDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    dishName: 'dîner vite fait bien fait',
    scores: { vegetal: 65, healthy: 72, carbon: 68 },
    verified: true,
    likes: 542,
    comments: 12,
    timeAgo: '8h',
    isLiked: false
  },
  {
    id: 4,
    user: {
      name: 'Thomas',
      username: '@thomas.d',
      avatar: '👨'
    },
    image: 'https://images.unsplash.com/photo-1521388825798-fec41108def2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGhvdG9ncmFwaHklMjBvdmVyaGVhZHxlbnwxfHx8fDE3NjU2NDQwNTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    dishName: 'petit déj healthy ☀️',
    scores: { vegetal: 100, healthy: 95, carbon: 98 },
    verified: true,
    likes: 2341,
    comments: 87,
    timeAgo: '1j',
    isLiked: true
  }
];

export function FeedScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [posts, setPosts] = useState(mockPosts);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = window.innerHeight;
    const index = Math.round(scrollTop / itemHeight);
    setCurrentIndex(index);
  };

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
        />
      ))}
    </div>
  );
}

interface FeedPostProps {
  post: FeedPost;
  onLike: (postId: number) => void;
  onNavigate: (screen: Screen) => void;
  isActive: boolean;
}

function FeedPost({ post, onLike, onNavigate, isActive }: FeedPostProps) {
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleTap = () => {
    if (!post.isLiked) {
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
          src={post.image}
          alt={post.dishName}
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
            {post.user.avatar}
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg drop-shadow-lg">{post.user.name}</span>
              {post.verified && (
                <motion.div
                  className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </div>
            <div className="text-white/70 text-sm">{post.timeAgo}</div>
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
            <h2 className="text-white text-3xl font-bold mb-4 drop-shadow-2xl leading-tight">
              {post.dishName}
            </h2>

            {/* Three Score Cards - Beautiful Design */}
            <div className="flex flex-wrap gap-3 mb-4">
              {(['vegetal', 'healthy', 'carbon'] as const).map((type) => {
                const score = post.scores[type];
                const Icon = getScoreIcon(type);
                const colorClass = getScoreColor(score);
                const labels = {
                  vegetal: 'Végétal',
                  healthy: 'Santé',
                  carbon: 'Carbone'
                };

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
                      <span className="text-white/90 text-xs font-medium">{labels[type]}</span>
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
                  post.isLiked 
                    ? 'bg-red-500/30 border-red-400/50' 
                    : 'bg-black/40 border-white/20'
                }`}
                animate={post.isLiked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-7 h-7 transition-all ${
                    post.isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                  }`}
                />
              </motion.div>
              <span className="text-white text-sm font-medium drop-shadow-lg">
                {post.likes > 999 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
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
              <span className="text-white text-sm font-medium drop-shadow-lg">{post.comments}</span>
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
      {post.id === 1 && (
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
