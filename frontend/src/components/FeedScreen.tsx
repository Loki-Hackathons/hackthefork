import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Flame } from 'lucide-react';
import type { Screen } from './MainApp';

interface FeedScreenProps {
  onNavigate: (screen: Screen) => void;
}

const mockPosts = [
  {
    id: 1,
    user: {
      name: 'Sophie',
      username: '@sophie.m',
      avatar: '👩‍🍳'
    },
    image: 'https://images.unsplash.com/photo-1693042978560-5711db96a991?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMGZvb2QlMjBwbGF0ZXxlbnwxfHx8fDE3NjU2NDQwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    dishName: 'mon curry maison 🍛',
    ecoScore: 92,
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
    ecoScore: 88,
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
    ecoScore: 76,
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
    ecoScore: 95,
    verified: true,
    likes: 2341,
    comments: 87,
    timeAgo: '1j',
    isLiked: true
  }
];

export function FeedScreen({ onNavigate }: FeedScreenProps) {
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
  post: typeof mockPosts[0];
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
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      </div>

      {/* Double tap heart animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Heart className="w-32 h-32 text-white fill-white drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 pt-12 px-4 pb-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-xl border-2 border-white/20">
            {post.user.avatar}
          </div>
          <div>
            <div className="text-white drop-shadow-lg">{post.user.name}</div>
            <div className="text-white/70 text-xs">{post.timeAgo}</div>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 pb-24 px-4 z-10">
        <div className="flex items-end gap-4">
          {/* Left side - Content */}
          <div className="flex-1 pb-2">
            <h2 className="text-white text-2xl mb-3 drop-shadow-lg">
              {post.dishName}
            </h2>

            {/* Eco Score Badge - WOW Effect */}
            {post.verified && (
              <motion.div
                className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mb-3 shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                  <div className="relative w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-white/40">
                    <span className="text-white text-2xl leading-none">{post.ecoScore}</span>
                    <span className="text-white/90 text-[10px] leading-none">éco</span>
                  </div>
                </div>
                <div className="text-white">
                  <div className="text-xs opacity-90">Verified Impact</div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm">Score écolo</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action hint */}
            <button 
              onClick={() => onNavigate('shop')}
              className="text-white/80 text-sm flex items-center gap-2 hover:text-white transition-colors"
            >
              <span>Tap pour cuisiner ça →</span>
            </button>
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-col items-center gap-6 pb-2">
            {/* Like */}
            <button
              onClick={() => onLike(post.id)}
              className="flex flex-col items-center gap-1 group"
            >
              <motion.div
                className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                whileTap={{ scale: 0.8 }}
              >
                <Heart
                  className={`w-7 h-7 transition-colors ${
                    post.isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                  }`}
                />
              </motion.div>
              <span className="text-white text-xs drop-shadow">
                {post.likes > 999 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
              </span>
            </button>

            {/* Comment */}
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-xs drop-shadow">{post.comments}</span>
            </button>

            {/* Share */}
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Share2 className="w-7 h-7 text-white" />
              </div>
            </button>

            {/* Save */}
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Bookmark className="w-7 h-7 text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator (only on first post) */}
      {post.id === 1 && (
        <motion.div
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-0"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="text-white/50 text-sm flex flex-col items-center gap-2">
            <span>Swipe up</span>
            <div className="w-1 h-8 bg-white/30 rounded-full" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
