import { useState } from 'react';
import {
  Award,
  Trophy,
  Sparkles,
  CheckCircle2,
  Lock,
  Medal,
  Zap,
  TrendingUp,
  Filter,
  Star,
  Leaf,
  Recycle,
  Trees,
  ShieldAlert,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function UserAchievements({ userStats = {} }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unlocked' | 'in-progress'
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Stats defaults
  const totalCollections = userStats.totalCollections || 18;
  const totalWeightKg = userStats.totalWeightKg || 84.5;
  const co2SavedKg = userStats.co2SavedKg || (totalWeightKg * 1.38).toFixed(1);
  const monthlyVolumeKg = userStats.monthlyVolumeKg || 72.0;
  const ngoEventsAttended = userStats.ngoEventsAttended || 4;
  const plasticWeightKg = userStats.plasticWeightKg || 32.0;

  // Badges Definitions
  const BADGES = [
    {
      id: 'pioneer',
      title: 'Zero-Waste Pioneer',
      subtitle: 'First Steps in Recycling',
      description: 'Scheduled and completed 3 or more doorstep waste collections.',
      icon: '🌱',
      category: 'collections',
      current: totalCollections,
      target: 3,
      unlocked: totalCollections >= 3,
      unlockedDate: 'Aug 14, 2026',
      perkBonus: '+50 EcoPoints',
      color: 'emerald',
    },
    {
      id: 'carbon-reducer',
      title: 'Carbon Reducer',
      subtitle: 'Emissions Offset Master',
      description: 'Prevented over 50kg of greenhouse CO₂ gas emissions through recycling.',
      icon: '🌍',
      category: 'impact',
      current: parseFloat(co2SavedKg),
      target: 50,
      unlocked: parseFloat(co2SavedKg) >= 50,
      unlockedDate: 'Aug 22, 2026',
      perkBonus: '+100 EcoPoints',
      color: 'teal',
    },
    {
      id: 'eco-warrior',
      title: 'Eco-Warrior',
      subtitle: '50+ Collection Champion',
      description: 'Complete 50+ total verified doorstep waste pickup dispatches.',
      icon: '⚔️',
      category: 'collections',
      current: totalCollections,
      target: 50,
      unlocked: totalCollections >= 50,
      unlockedDate: null,
      perkBonus: '+250 EcoPoints + Silver Badge Tag',
      color: 'amber',
    },
    {
      id: 'top-recycler',
      title: 'Top Recycler',
      subtitle: 'Monthly Volume Leader',
      description: 'Recycle 100+ kg of waste in a single calendar month.',
      icon: '👑',
      category: 'volume',
      current: monthlyVolumeKg,
      target: 100,
      unlocked: monthlyVolumeKg >= 100,
      unlockedDate: null,
      perkBonus: '2x EcoPoint Multiplier for 1 Month',
      color: 'purple',
    },
    {
      id: 'plastic-buster',
      title: 'Plastic Buster',
      subtitle: 'Ocean & Landfill Savior',
      description: 'Divert 25+ kg of ocean-bound single-use plastics from municipal landfills.',
      icon: '🥤',
      category: 'specialty',
      current: plasticWeightKg,
      target: 25,
      unlocked: plasticWeightKg >= 25,
      unlockedDate: 'Sep 02, 2026',
      perkBonus: '+75 EcoPoints',
      color: 'blue',
    },
    {
      id: 'community-leader',
      title: 'Community Leader',
      subtitle: 'NGO Drive Mobilizer',
      description: 'Participate and volunteer in 3+ NGO community waste cleanup drives.',
      icon: '🤝',
      category: 'community',
      current: ngoEventsAttended,
      target: 3,
      unlocked: ngoEventsAttended >= 3,
      unlockedDate: 'Sep 05, 2026',
      perkBonus: 'NGO Volunteer Certificate Badge',
      color: 'rose',
    },
  ];

  const unlockedCount = BADGES.filter((b) => b.unlocked).length;
  const filteredBadges = BADGES.filter((b) => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'in-progress') return !b.unlocked;
    return true;
  });

  const getCardBg = (unlocked, color) => {
    if (!unlocked) return 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80';
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80';
      case 'teal':
        return 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800/80';
      case 'amber':
        return 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80';
      case 'purple':
        return 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800/80';
      case 'blue':
        return 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800/80';
      case 'rose':
        return 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80';
      default:
        return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Volunteer Achievements & Eco Badges</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Earn verified eco-badges, unlock bonus EcoPoints, and track your municipal recycling milestones.
          </p>
        </div>

        {/* Filters & Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {unlockedCount} / {BADGES.length} Badges Unlocked
            </span>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'all'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'unlocked'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'in-progress'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              In Progress
            </button>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBadges.map((badge) => {
          const progressPercent = Math.min(100, Math.round((badge.current / badge.target) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md relative overflow-hidden flex flex-col justify-between space-y-4 ${getCardBg(
                badge.unlocked,
                badge.color
              )}`}
            >
              {/* Top Row: Emoji Icon & Badge Tag */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${
                      badge.unlocked ? 'bg-white dark:bg-slate-900' : 'bg-slate-200 dark:bg-slate-700 opacity-60'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug flex items-center gap-1.5">
                      <span>{badge.title}</span>
                      {badge.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{badge.subtitle}</p>
                  </div>
                </div>

                {!badge.unlocked && (
                  <span className="p-1.5 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-lg shrink-0" title="Locked">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{badge.description}</p>

              {/* Progress Bar for Locked Badges */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={badge.unlocked ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}>
                    {badge.unlocked ? 'Achievement Unlocked!' : 'Goal Progress'}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-extrabold">
                    {badge.current} / {badge.target}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.unlocked ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Footer Perk */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Perk: <span className="font-bold text-slate-800 dark:text-slate-200">{badge.perkBonus}</span>
                </span>
                {badge.unlockedDate && <span className="text-[10px] text-emerald-600 font-semibold">{badge.unlockedDate}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950 text-4xl flex items-center justify-center mx-auto shadow-inner">
                {selectedBadge.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  {selectedBadge.unlocked ? 'Unlocked Badge' : 'In-Progress Milestone'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{selectedBadge.title}</h3>
                <p className="text-xs text-slate-500">{selectedBadge.subtitle}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 text-center leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {selectedBadge.description}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                <span className="text-slate-500">Milestone Progress:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedBadge.current} / {selectedBadge.target}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                <span className="text-slate-500">Reward Perk:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{selectedBadge.perkBonus}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
