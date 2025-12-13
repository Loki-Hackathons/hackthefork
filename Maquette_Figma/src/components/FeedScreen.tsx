import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Flame, X, Send } from 'lucide-react';
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
    dishName: 'homemade curry 🍛',
    ecoScore: 92,
    verified: true,
    likes: 847,
    comments: 23,
    timeAgo: '2h',
    isLiked: false,
    commentList: [
      { id: 1, user: { name: 'Alex', avatar: '👨' }, text: 'This looks amazing! Recipe?', timeAgo: '1h' },
      { id: 2, user: { name: 'Sarah', avatar: '👩' }, text: 'Love the eco score! 🌱', timeAgo: '45m' },
      { id: 3, user: { name: 'Mike', avatar: '👨‍🍳' }, text: 'Trying this tonight!', timeAgo: '30m' }
    ]
  },
  {
    id: 2,
    user: {
      name: 'Marc',
      username: '@marc.l',
      avatar: '👨‍🍳'
    },
    image: 'https://images.unsplash.com/photo-1510035618584-c442b241abe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBsdW5jaCUyMGJvd2x8ZW58MXx8fHwxNzY1NjQ0MDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    dishName: 'lunch buddha bowl',
    ecoScore: 88,
    verified: true,
    likes: 1203,
    comments: 45,
    timeAgo: '5h',
    isLiked: true,
    commentList: [
      { id: 1, user: { name: 'Lisa', avatar: '👩‍🍳' }, text: 'So healthy!', timeAgo: '3h' },
      { id: 2, user: { name: 'Tom', avatar: '👨' }, text: 'Perfect for meal prep', timeAgo: '2h' }
    ]
  },
  {
    id: 3,
    user: {
      name: 'Emma',
      username: '@emma.r',
      avatar: '👩'
    },
    image: 'https://images.unsplash.com/photo-1553709225-9eb59ce4d215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaW5uZXIlMjBwbGF0ZSUyMGhvbWV8ZW58MXx8fHwxNzY1NjQ0MDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    dishName: 'quick & easy dinner',
    ecoScore: 76,
    verified: true,
    likes: 542,
    comments: 12,
    timeAgo: '8h',
    isLiked: false,
    commentList: [
      { id: 1, user: { name: 'Chris', avatar: '👨' }, text: 'Quick and easy!', timeAgo: '6h' }
    ]
  },
  {
    id: 4,
    user: {
      name: 'Thomas',
      username: '@thomas.d',
      avatar: '👨'
    },
    image: 'https://images.unsplash.com/photo-1521388825798-fec41108def2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGhvdG9ncmFwaHklMjBvdmVyaGVhZHxlbnwxfHx8fDE3NjU2NDQwNTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    dishName: 'healthy breakfast ☀️',
    ecoScore: 95,
    verified: true,
    likes: 2341,
    comments: 87,
    timeAgo: '1d',
    isLiked: true,
    commentList: [
      { id: 1, user: { name: 'Anna', avatar: '👩' }, text: 'Best breakfast ever!', timeAgo: '20h' },
      { id: 2, user: { name: 'David', avatar: '👨‍🍳' }, text: 'Making this tomorrow', timeAgo: '18h' },
      { id: 3, user: { name: 'Emma', avatar: '👩' }, text: 'So nutritious!', timeAgo: '15h' }
    ]
  }
];

export function FeedScreen({ onNavigate }: FeedScreenProps) {
  const [posts, setPosts] = useState(mockPosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<number | null>(null);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleAddComment = (postId: number, commentText: string) => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now(),
      user: { name: 'You', avatar: '👤' },
      text: commentText,
      timeAgo: 'now'
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: post.comments + 1,
            commentList: [...(post.commentList || []), newComment]
          }
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
          onOpenComments={() => setOpenCommentsPostId(post.id)}
        />
      ))}
      
      {/* Comments Modal */}
      <CommentsModal
        post={posts.find(p => p.id === openCommentsPostId)}
        isOpen={openCommentsPostId !== null}
        onClose={() => setOpenCommentsPostId(null)}
        onAddComment={(text) => {
          if (openCommentsPostId) {
            handleAddComment(openCommentsPostId, text);
          }
        }}
      />
    </div>
  );
}

interface FeedPostProps {
  post: typeof mockPosts[0];
  onLike: (postId: number) => void;
  onNavigate: (screen: Screen) => void;
  isActive: boolean;
  onOpenComments: () => void;
}

function FeedPost({ post, onLike, onNavigate, isActive, onOpenComments }: FeedPostProps) {
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

            {/* Eco Score Badge - Modern Social Media Style */}
            {post.verified && (
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full mb-3 border border-white/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{post.ecoScore}</span>
                  </div>
                  <span className="text-white text-sm font-medium">Eco</span>
                </div>
                <div className="w-px h-4 bg-white/30" />
                <Flame className="w-4 h-4 text-emerald-300" />
              </motion.div>
            )}

            {/* Action hint */}
            <button 
              onClick={() => onNavigate('shop')}
              className="text-white/80 text-sm flex items-center gap-1.5 hover:text-white transition-colors group"
            >
              <span className="font-medium">Get recipe</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
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
            <button 
              onClick={onOpenComments}
              className="flex flex-col items-center gap-1 group"
            >
              <motion.div
                className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                whileTap={{ scale: 0.8 }}
              >
                <MessageCircle className="w-7 h-7 text-white" />
              </motion.div>
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

interface CommentsModalProps {
  post: typeof mockPosts[0] | undefined;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (text: string) => void;
}

function CommentsModal({ post, isOpen, onClose, onAddComment }: CommentsModalProps) {
  const [commentText, setCommentText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  if (!post) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-black rounded-t-3xl z-50 flex flex-col"
            style={{ maxHeight: '80vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
              <h2 className="text-white text-xl font-semibold">Comments</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {post.commentList && post.commentList.length > 0 ? (
                post.commentList.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-sm flex-shrink-0">
                      {comment.user.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{comment.user.name}</span>
                        <span className="text-white/50 text-xs">{comment.timeAgo}</span>
                      </div>
                      <p className="text-white/90 text-sm">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/50 text-sm">No comments yet. Be the first!</p>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-sm flex-shrink-0">
                  👤
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/50 text-sm focus:outline-none focus:border-emerald-400/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
