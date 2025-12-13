'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Bookmark, Leaf, Apple, Cloud, Sparkles, X, Send, Copy, Plus, Link2 } from 'lucide-react';
import type { Screen } from './MainApp';

interface MealScores {
  vegetal: number;
  healthy: number;
  carbon: number;
}

interface Comment {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  timeAgo: string;
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
  isSaved: boolean;
  commentsList: Comment[];
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
    isLiked: false,
    isSaved: false,
    commentsList: [
      {
        id: 1,
        user: { name: 'Marc', username: '@marc.l', avatar: '👨‍🍳' },
        text: 'Ça a l\'air délicieux ! Quelle recette tu as utilisée ?',
        timeAgo: '1h'
      },
      {
        id: 2,
        user: { name: 'Emma', username: '@emma.r', avatar: '👩' },
        text: 'Super score écolo ! 👏',
        timeAgo: '45m'
      },
      {
        id: 3,
        user: { name: 'Thomas', username: '@thomas.d', avatar: '👨' },
        text: 'Je vais essayer cette recette ce weekend !',
        timeAgo: '30m'
      }
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
    dishName: 'buddha bowl du midi',
    scores: { vegetal: 100, healthy: 92, carbon: 95 },
    verified: true,
    likes: 1203,
    comments: 45,
    timeAgo: '5h',
    isLiked: true,
    isSaved: true,
    commentsList: [
      {
        id: 1,
        user: { name: 'Sophie', username: '@sophie.m', avatar: '👩‍🍳' },
        text: 'Parfait pour un déjeuner équilibré !',
        timeAgo: '4h'
      },
      {
        id: 2,
        user: { name: 'Emma', username: '@emma.r', avatar: '👩' },
        text: 'J\'adore les couleurs ! 🌈',
        timeAgo: '3h'
      }
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
    dishName: 'dîner vite fait bien fait',
    scores: { vegetal: 65, healthy: 72, carbon: 68 },
    verified: true,
    likes: 542,
    comments: 12,
    timeAgo: '8h',
    isLiked: false,
    isSaved: false,
    commentsList: [
      {
        id: 1,
        user: { name: 'Thomas', username: '@thomas.d', avatar: '👨' },
        text: 'Simple et efficace !',
        timeAgo: '7h'
      }
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
    dishName: 'petit déj healthy ☀️',
    scores: { vegetal: 100, healthy: 95, carbon: 98 },
    verified: true,
    likes: 2341,
    comments: 87,
    timeAgo: '1j',
    isLiked: true,
    isSaved: true,
    commentsList: [
      {
        id: 1,
        user: { name: 'Sophie', username: '@sophie.m', avatar: '👩‍🍳' },
        text: 'Excellent score ! Bravo ! 🎉',
        timeAgo: '23h'
      },
      {
        id: 2,
        user: { name: 'Marc', username: '@marc.l', avatar: '👨‍🍳' },
        text: 'Inspirant !',
        timeAgo: '22h'
      }
    ]
  }
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-700';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

export function FeedScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [posts, setPosts] = useState(mockPosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [sharePostId, setSharePostId] = useState<number | null>(null);
  const [openScoreDetailsPostId, setOpenScoreDetailsPostId] = useState<number | null>(null);

  const mockContacts = [
    { id: 1, name: 'Florian', avatar: '👨' },
    { id: 2, name: 'Bastian', avatar: '👨' },
    { id: 3, name: 'Alexandre', avatar: '👨' },
    { id: 4, name: 'Mounir', avatar: '👨' },
    { id: 5, name: 'Camille', avatar: '👩' },
  ];

  const shareApps = [
    { id: 1, name: 'AirDrop', icon: '📡', color: 'bg-blue-500' },
    { id: 2, name: 'Notes', icon: '📝', color: 'bg-yellow-500' },
    { id: 3, name: 'Gmail', icon: '📧', color: 'bg-red-500' },
    { id: 4, name: 'Messages', icon: '💬', color: 'bg-green-500' },
  ];

  const shareActions = [
    { id: 1, name: 'Copy', icon: Copy },
    { id: 2, name: 'Add to Reading List', icon: Plus },
    { id: 3, name: 'Add Bookmark', icon: Bookmark },
  ];

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = window.innerHeight;
    const index = Math.round(scrollTop / itemHeight);
    setCurrentIndex(index);
  };

  const handleAddComment = (postId: number) => {
    if (!newComment.trim()) return;

    const currentUser = { name: 'Moi', username: '@moi', avatar: '👤' };
    const newCommentObj: Comment = {
      id: Date.now(),
      user: currentUser,
      text: newComment.trim(),
      timeAgo: 'maintenant'
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: post.comments + 1,
            commentsList: [...post.commentsList, newCommentObj]
          }
        : post
    ));
    setNewComment('');
  };

  const currentPost = openCommentsPostId ? posts.find(p => p.id === openCommentsPostId) : null;

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
          onCommentClick={() => setOpenCommentsPostId(post.id)}
          onShareClick={() => setSharePostId(post.id)}
          onSave={handleSave}
          onScoreClick={() => setOpenScoreDetailsPostId(post.id)}
        />
      ))}

      {/* Comments Overlay */}
      <AnimatePresence>
        {openCommentsPostId !== null && currentPost && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpenCommentsPostId(null);
              setNewComment('');
            }}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-black/95 rounded-t-3xl flex flex-col max-h-[85vh]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-white text-2xl font-bold">Commentaires</h2>
                <button
                  onClick={() => {
                    setOpenCommentsPostId(null);
                    setNewComment('');
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {currentPost.commentsList.length === 0 ? (
                  <p className="text-white/60 text-center py-8">
                    Aucun commentaire pour le moment
                  </p>
                ) : (
                  currentPost.commentsList.map((comment) => (
                    <motion.div
                      key={comment.id}
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-lg flex-shrink-0">
                        {comment.user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold text-sm">{comment.user.name}</span>
                          <span className="text-white/50 text-xs">{comment.timeAgo}</span>
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed">{comment.text}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-lg flex-shrink-0">
                    👤
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2 border border-white/10">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newComment.trim()) {
                          handleAddComment(openCommentsPostId!);
                        }
                      }}
                      placeholder="Ajouter un commentaire..."
                      className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none"
                    />
                    <motion.button
                      onClick={() => handleAddComment(openCommentsPostId!)}
                      disabled={!newComment.trim()}
                      className={`p-2 rounded-full transition-colors ${
                        newComment.trim()
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white/10 text-white/30'
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Sheet */}
      <AnimatePresence>
        {sharePostId !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSharePostId(null)}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium text-sm truncate">
                        {posts.find(p => p.id === sharePostId)?.dishName || 'Post'}
                      </p>
                      <p className="text-gray-500 text-xs truncate">hackthefork.app</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSharePostId(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                {/* Contacts */}
                <div className="mb-6">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {mockContacts.map((contact) => (
                      <motion.button
                        key={contact.id}
                        className="flex flex-col items-center gap-2 flex-shrink-0"
                        whileTap={{ scale: 0.9 }}
                      >
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl">
                            {contact.avatar}
                          </div>
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <Share2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                        <span className="text-gray-700 text-xs font-medium">{contact.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Share Apps */}
                <div className="mb-6">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {shareApps.map((app) => (
                      <motion.button
                        key={app.id}
                        className="flex flex-col items-center gap-2 flex-shrink-0"
                        whileTap={{ scale: 0.9 }}
                      >
                        <div className={`w-16 h-16 ${app.color} rounded-2xl flex items-center justify-center text-2xl shadow-md`}>
                          {app.icon}
                        </div>
                        <span className="text-gray-700 text-xs font-medium">{app.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-1">
                  {shareActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.id}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-gray-900 font-medium text-base">{action.name}</span>
                        <Icon className="w-5 h-5 text-gray-400" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Details Modal */}
      <AnimatePresence>
        {openScoreDetailsPostId !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenScoreDetailsPostId(null)}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-black/95 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const post = posts.find(p => p.id === openScoreDetailsPostId);
                if (!post) return null;
                
                const avgScore = Math.round(
                  (post.scores.vegetal + post.scores.healthy + post.scores.carbon) / 3
                );
                const scoreDetails = [
                  {
                    type: 'vegetal' as const,
                    score: post.scores.vegetal,
                    label: 'Végétal',
                    description: 'Pourcentage d\'ingrédients d\'origine végétale dans le plat',
                    icon: Leaf,
                    color: post.scores.vegetal >= 80 ? 'emerald' : post.scores.vegetal >= 60 ? 'yellow' : 'red'
                  },
                  {
                    type: 'healthy' as const,
                    score: post.scores.healthy,
                    label: 'Santé',
                    description: 'Score nutritionnel basé sur la qualité des ingrédients',
                    icon: Apple,
                    color: post.scores.healthy >= 80 ? 'emerald' : post.scores.healthy >= 60 ? 'yellow' : 'red'
                  },
                  {
                    type: 'carbon' as const,
                    score: post.scores.carbon,
                    label: 'Carbone',
                    description: 'Impact environnemental : plus le score est élevé, plus l\'empreinte carbone est faible',
                    icon: Cloud,
                    color: post.scores.carbon >= 80 ? 'emerald' : post.scores.carbon >= 60 ? 'yellow' : 'red'
                  }
                ];

                return (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-white text-2xl font-bold mb-1">Détails du score</h2>
                        <p className="text-white/60 text-sm">{post.dishName}</p>
                      </div>
                      <button
                        onClick={() => setOpenScoreDetailsPostId(null)}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Overall Score */}
                    <div className="mb-6">
                      <div className={`${getScoreColor(avgScore)} rounded-2xl p-6 text-center`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Sparkles className="w-6 h-6 text-white" />
                          <span className="text-white/90 text-sm font-medium">Score écolo global</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-white text-5xl font-bold">{avgScore}</span>
                          <span className="text-white/70 text-lg">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Individual Scores */}
                    <div className="space-y-4 mb-6">
                      <h3 className="text-white text-lg font-semibold mb-4">Détails par catégorie</h3>
                      {scoreDetails.map((detail) => {
                        const Icon = detail.icon;
                        const colorClass = detail.color === 'emerald' ? 'bg-emerald-700' : detail.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500';
                        
                        return (
                          <motion.div
                            key={detail.type}
                            className={`${colorClass} rounded-2xl p-5`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: scoreDetails.indexOf(detail) * 0.1 }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold text-lg">{detail.label}</h4>
                                  <p className="text-white/80 text-sm">{detail.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-white text-3xl font-bold">{detail.score}</span>
                                  <span className="text-white/70 text-sm">/100</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${detail.score}%` }}
                                transition={{ duration: 0.8, delay: scoreDetails.indexOf(detail) * 0.1 + 0.2 }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Info */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <p className="text-white/70 text-sm leading-relaxed">
                        💡 <strong className="text-white">Astuce :</strong> Pour améliorer ton score, privilégie les ingrédients locaux, de saison et d'origine végétale.
                      </p>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FeedPostProps {
  post: FeedPost;
  onLike: (postId: number) => void;
  onNavigate: (screen: Screen) => void;
  isActive: boolean;
  onCommentClick: () => void;
  onShareClick: () => void;
  onSave: (postId: number) => void;
  onScoreClick: () => void;
}

function FeedPost({ post, onLike, onNavigate, isActive, onCommentClick, onShareClick, onSave, onScoreClick }: FeedPostProps) {
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleTap = () => {
    if (!post.isLiked) {
      onLike(post.id);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
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
        {/* No overlays - images are bright and clear */}
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
            className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-2xl border-2 border-white/30 shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            {post.user.avatar}
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg drop-shadow-lg">{post.user.name}</span>
              {post.verified && (
                <motion.div
                  className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center"
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
        {(() => {
          const avgScore = Math.round(
            (post.scores.vegetal + post.scores.healthy + post.scores.carbon) / 3
          );
          const colorClass = getScoreColor(avgScore);
          
            return (
              <motion.button
                className={`${colorClass} rounded-2xl px-4 py-2.5 shadow-lg backdrop-blur-md border-2 border-white/30 cursor-pointer`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onScoreClick}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white flex-shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-xl font-bold">{avgScore}</span>
                    <span className="text-white/80 text-xs">/100</span>
                  </div>
                </div>
              </motion.button>
            );
        })()}
      </div>

      {/* Bottom content - completely redesigned */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 pl-6 pr-0 z-20">
        <div className="flex items-end gap-6">
          {/* Left side - Content */}
          <div className="flex-1 pb-1">
            <h2 className="text-white text-3xl font-bold mb-2 drop-shadow-2xl leading-tight">
              {post.dishName}
            </h2>


            {/* Action hint */}
            <motion.button 
              onClick={() => onNavigate('shop')}
              className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 text-white text-sm flex items-center gap-2 hover:bg-white/20 transition-colors group border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-medium">recipe</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </motion.button>
          </div>

          {/* Right side - Actions - refined */}
          <div className="flex flex-col items-center gap-5 pb-2 pr-1">
            {/* Like */}
            <motion.button
              onClick={() => onLike(post.id)}
              className="flex flex-col items-center gap-2 group"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border-2 transition-all ${
                  post.isLiked 
                    ? 'bg-red-500/30 border-red-400/50' 
                    : 'bg-black/40 border-white/20'
                }`}
                animate={post.isLiked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-6 h-6 transition-all ${
                    post.isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                  }`}
                />
              </motion.div>
              <span className="text-white text-xs font-medium drop-shadow-lg">
                {post.likes > 999 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
              </span>
            </motion.button>

            {/* Comment */}
            <motion.button 
              className="flex flex-col items-center gap-2 group"
              whileTap={{ scale: 0.9 }}
              onClick={onCommentClick}
            >
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border-2 border-white/20 group-hover:border-white/40 transition-colors">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium drop-shadow-lg">{post.comments}</span>
            </motion.button>

            {/* Share */}
            <motion.button 
              className="flex flex-col items-center gap-2 group"
              whileTap={{ scale: 0.9 }}
              onClick={onShareClick}
            >
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border-2 border-white/20 group-hover:border-white/40 transition-colors">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </motion.button>

            {/* Save */}
            <motion.button 
              className="flex flex-col items-center gap-2 group"
              whileTap={{ scale: 0.9 }}
              onClick={() => onSave(post.id)}
            >
              <motion.div
                className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border-2 transition-colors ${
                  post.isSaved
                    ? 'bg-yellow-500/30 border-yellow-400/50'
                    : 'bg-black/40 border-white/20 group-hover:border-white/40'
                }`}
                animate={post.isSaved ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Bookmark
                  className={`w-6 h-6 transition-all ${
                    post.isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-white'
                  }`}
                />
              </motion.div>
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
