'use client';

import { motion } from 'motion/react';
import { Trophy, Users, Target, Clock, ChevronRight, Flame, TrendingUp } from 'lucide-react';

const mockChallenges = [
  {
    id: 1,
    title: '100% Veg Week',
    description: 'Cook 7 vegetarian dishes this week',
    progress: 5,
    total: 7,
    reward: 500,
    endDate: '2j',
    type: 'personal',
    participants: null
  },
  {
    id: 2,
    title: 'Battle Squad',
    description: 'Top score entre amis cette semaine',
    progress: 0,
    total: 100,
    reward: 1000,
    endDate: '5j',
    type: 'group',
    participants: ['👩‍🍳', '👨‍🍳', '👩', '👨']
  },
  {
    id: 3,
    title: 'Zero Waste',
    description: 'Use all purchased ingredients',
    progress: 3,
    total: 5,
    reward: 300,
    endDate: '3j',
    type: 'personal',
    participants: null
  },
];

const mockLeaderboard = [
  { rank: 1, name: 'Sophie', username: '@sophie.m', score: 481, avatar: '👩‍🍳', change: 'up' },
  { rank: 2, name: 'Marc', username: '@marc.l', score: 457, avatar: '👨‍🍳', change: 'same' },
  { rank: 3, name: 'Emma', username: '@emma.r', score: 423, avatar: '👩', change: 'down' },
  { rank: 4, name: 'Thomas', username: '@thomas.d', score: 398, avatar: '👨', change: 'up' },
];

export function ChallengesScreen() {
  return (
    <div className="h-full bg-black overflow-y-auto pb-24">
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-white text-3xl">
              Challenges
            </h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 rounded-full shadow-lg">
            <Flame className="w-5 h-5 text-white" />
            <span className="text-white">1,250</span>
          </div>
        </div>
        <p className="text-white/50 text-sm">
          Take on challenges, earn points
        </p>
      </div>

      {/* Featured Challenge */}
      <div className="px-6 mb-8">
        <motion.div 
          className="bg-purple-600 rounded-3xl p-6 relative overflow-hidden"
          whileTap={{ scale: 0.98 }}
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full"
              animate={{
                x: [0, 20, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ filter: 'blur(40px)' }}
            />
          </div>

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-white/70 text-sm mb-1">Challenge of the day</div>
                <h3 className="text-white text-2xl mb-2">
                  Collective Vegetarian Curry
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  The whole group cooks the same eco-friendly dish
                </p>
                <div className="flex items-center gap-3 text-white/70 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>4 friends</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>12d left</span>
                  </div>
                </div>
              </div>
              <div className="flex -space-x-3">
                {['👩‍🍳', '👨‍🍳', '👩', '👨'].map((avatar, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-purple-600 flex items-center justify-center text-xl"
                  >
                    {avatar}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <div className="text-white/70 text-xs mb-1">Reward</div>
                <div className="text-white text-xl flex items-center gap-2">
                  <Flame className="w-5 h-5 text-yellow-400" />
                  1,500
                </div>
              </div>
              <button className="px-8 py-3.5 bg-white text-purple-600 rounded-2xl shadow-lg active:scale-95 transition-transform">
                Go
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active Challenges */}
      <div className="px-6 mb-8">
        <h2 className="text-white text-xl mb-4">En cours</h2>
        <div className="space-y-3">
          {mockChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </div>

      {/* Weekly Leaderboard */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl">Leaderboard</h2>
          <button className="text-emerald-400 text-sm flex items-center gap-1">
            See all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
          {mockLeaderboard.map((entry, idx) => (
            <motion.div
              key={entry.rank}
              className="flex items-center gap-4 p-4 border-b border-white/10 last:border-b-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {/* Rank Badge */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                entry.rank === 1 ? 'bg-yellow-500 text-black' :
                entry.rank === 2 ? 'bg-slate-400 text-black' :
                entry.rank === 3 ? 'bg-orange-500 text-white' :
                'bg-white/10 text-white/50'
              }`}>
                {entry.rank}
              </div>
              
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-2xl">
                {entry.avatar}
              </div>
              
              {/* Name */}
              <div className="flex-1">
                <div className="text-white">
                  {entry.name}
                </div>
                <div className="text-white/40 text-sm">
                  {entry.username}
                </div>
              </div>

              {/* Score */}
              <div className="text-white text-xl">
                {entry.score}
              </div>
              
              {/* Change indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                entry.change === 'up' ? 'bg-green-500/20 text-green-400' :
                entry.change === 'down' ? 'bg-red-500/20 text-red-400' :
                'bg-white/5 text-white/30'
              }`}>
                {entry.change === 'up' && <TrendingUp className="w-4 h-4" />}
                {entry.change === 'down' && <TrendingUp className="w-4 h-4 rotate-180" />}
                {entry.change === 'same' && '–'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ChallengeCardProps {
  challenge: typeof mockChallenges[0];
}

function ChallengeCard({ challenge }: ChallengeCardProps) {
  const progressPercent = (challenge.progress / challenge.total) * 100;

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {challenge.type === 'group' ? (
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            <h3 className="text-white text-lg">
              {challenge.title}
            </h3>
          </div>
          <p className="text-white/50 text-sm">
            {challenge.description}
          </p>
        </div>
        
        {challenge.type === 'group' && challenge.participants && (
          <div className="flex -space-x-2 ml-3">
            {challenge.participants.slice(0, 3).map((avatar, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-full bg-emerald-700 border-2 border-black flex items-center justify-center text-sm"
              >
                {avatar}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress */}
      {challenge.type === 'personal' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/50">
              {challenge.progress} / {challenge.total}
            </span>
            <span className="text-emerald-400">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-700"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-white/50">
            <Clock className="w-4 h-4" />
            <span>{challenge.endDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">{challenge.reward}</span>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-white/30" />
      </div>
    </motion.div>
  );
}
