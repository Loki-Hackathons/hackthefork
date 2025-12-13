import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, Settings, Leaf, Flame, Users } from 'lucide-react';

const mockProfile = {
  name: 'Sophie',
  username: '@sophie.m',
  avatar: '👩‍🍳',
  title: 'Maître du Végétal',
  stats: {
    healthy: 85,
    local: 72,
    vege: 90,
    season: 78
  },
  totalScore: 81,
  weeklyProgress: +12,
  posts: 47,
  followers: 1284,
  following: 892,
  savedCO2: 28.5
};

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

export function ProfileScreen() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

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

  return (
    <div className="h-full bg-black overflow-y-auto pb-24">
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-4xl border-4 border-white/10">
              {mockProfile.avatar}
            </div>
            <div>
              <h1 className="text-white text-2xl">
                {mockProfile.name}
              </h1>
              <div className="text-white/50 text-sm">
                {mockProfile.username}
              </div>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats - Instagram style */}
        <div className="flex items-center justify-around mb-6">
          <div className="text-center">
            <div className="text-white text-2xl mb-1">
              {mockProfile.posts}
            </div>
            <div className="text-white/50 text-sm">posts</div>
          </div>
          <div className="text-center">
            <div className="text-white text-2xl mb-1">
              {mockProfile.followers > 999 ? `${(mockProfile.followers / 1000).toFixed(1)}k` : mockProfile.followers}
            </div>
            <div className="text-white/50 text-sm">followers</div>
          </div>
          <div className="text-center">
            <div className="text-white text-2xl mb-1">
              {mockProfile.following}
            </div>
            <div className="text-white/50 text-sm">following</div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">{mockProfile.title}</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">{mockProfile.savedCO2}kg de CO₂ économisés</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 bg-white text-black rounded-xl">
            Modifier le profil
          </button>
          <button className="flex-1 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20">
            Partager
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
          Impact Écologique
        </h2>
        
        <div className="bg-gradient-to-br from-emerald-950/50 to-green-950/50 rounded-3xl p-8 relative overflow-hidden border border-emerald-500/20">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
          
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
              viewBox="0 0 200 200" 
              className="w-full h-full"
              style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {/* Axes */}
              {[
                { angle: 0, label: 'Healthy', value: mockProfile.stats.healthy, color: '#10b981' },
                { angle: 90, label: 'Local', value: mockProfile.stats.local, color: '#3b82f6' },
                { angle: 180, label: 'Végé', value: mockProfile.stats.vege, color: '#8b5cf6' },
                { angle: 270, label: 'Saison', value: mockProfile.stats.season, color: '#f59e0b' },
              ].map((axis, idx) => {
                const rad = (axis.angle * Math.PI) / 180;
                const maxRadius = 80;
                const valueRadius = (axis.value / 100) * maxRadius;
                
                return (
                  <g key={idx}>
                    <line
                      x1="100"
                      y1="100"
                      x2={100 + maxRadius * Math.cos(rad)}
                      y2={100 + maxRadius * Math.sin(rad)}
                      stroke="#ffffff20"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    
                    <circle
                      cx={100 + valueRadius * Math.cos(rad)}
                      cy={100 + valueRadius * Math.sin(rad)}
                      r="5"
                      fill={axis.color}
                      className="drop-shadow-lg"
                    />
                    
                    <text
                      x={100 + (maxRadius + 25) * Math.cos(rad)}
                      y={100 + (maxRadius + 25) * Math.sin(rad)}
                      fill="white"
                      fontSize="12"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {axis.label}
                    </text>
                    
                    <text
                      x={100 + (maxRadius + 25) * Math.cos(rad)}
                      y={100 + (maxRadius + 25) * Math.sin(rad) + 14}
                      fill={axis.color}
                      fontSize="16"
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
                  M ${100 + (mockProfile.stats.healthy / 100) * 80 * Math.cos(0)} ${100 + (mockProfile.stats.healthy / 100) * 80 * Math.sin(0)}
                  L ${100 + (mockProfile.stats.local / 100) * 80 * Math.cos(Math.PI / 2)} ${100 + (mockProfile.stats.local / 100) * 80 * Math.sin(Math.PI / 2)}
                  L ${100 + (mockProfile.stats.vege / 100) * 80 * Math.cos(Math.PI)} ${100 + (mockProfile.stats.vege / 100) * 80 * Math.sin(Math.PI)}
                  L ${100 + (mockProfile.stats.season / 100) * 80 * Math.cos(3 * Math.PI / 2)} ${100 + (mockProfile.stats.season / 100) * 80 * Math.sin(3 * Math.PI / 2)}
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
              <circle cx="100" cy="100" r="32" fill="#000000" />
              <circle cx="100" cy="100" r="30" fill="url(#gradient)" fillOpacity="0.2" />
              <text
                x="100"
                y="95"
                fill="white"
                fontSize="28"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {mockProfile.totalScore}
              </text>
              <text
                x="100"
                y="112"
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
            Glisse pour tourner
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-6 pb-6">
        <h2 className="text-white text-xl mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Top de la semaine
        </h2>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
          {mockLeaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 p-4 border-b border-white/10 last:border-b-0 ${
                entry.isMe ? 'bg-emerald-500/10' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                entry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black' :
                entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                'bg-white/10 text-white/50'
              }`}>
                {entry.rank}
              </div>
              
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-2xl">
                {entry.avatar}
              </div>
              
              <div className="flex-1">
                <div className={`${entry.isMe ? 'text-emerald-400' : 'text-white'}`}>
                  {entry.name}
                </div>
                <div className="text-white/40 text-sm">{entry.username}</div>
              </div>
              
              <div className="text-white text-xl">
                {entry.score}
              </div>
              
              {entry.isMe && (
                <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{mockProfile.weeklyProgress}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid posts - Instagram style */}
      <div className="px-6 pb-6">
        <h2 className="text-white text-xl mb-4">
          Tes plats
        </h2>
        
        <div className="grid grid-cols-3 gap-1">
          {mockHistory.map((post) => (
            <motion.div
              key={post.id}
              className="relative aspect-square overflow-hidden"
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={post.image}
                alt=""
                className="w-full h-full object-cover"
              />
              
              {/* Score overlay */}
              <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-white text-sm">{post.score}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
