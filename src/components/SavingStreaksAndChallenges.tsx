import React, { useState } from 'react';
import { 
  Flame, 
  Trophy, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  TrendingDown, 
  Check, 
  Plus, 
  Ban, 
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SavingStreakData, ShoppingChallenge } from '../types';
import { INITIAL_SAVING_STREAK, INITIAL_CHALLENGES } from '../data/smartShoppingData';

interface SavingStreaksAndChallengesProps {
  onNavigateTab?: (tab: any) => void;
}

export const SavingStreaksAndChallenges: React.FC<SavingStreaksAndChallengesProps> = ({ onNavigateTab }) => {
  const { formatPrice } = useApp();

  const [streakData, setStreakData] = useState<SavingStreakData>(() => {
    try {
      const saved = localStorage.getItem('saving_streak_data_v1');
      return saved ? JSON.parse(saved) : INITIAL_SAVING_STREAK;
    } catch {
      return INITIAL_SAVING_STREAK;
    }
  });

  const [challenges, setChallenges] = useState<ShoppingChallenge[]>(() => {
    try {
      const saved = localStorage.getItem('shopping_challenges_v1');
      return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
    } catch {
      return INITIAL_CHALLENGES;
    }
  });

  const saveChallenges = (updated: ShoppingChallenge[]) => {
    setChallenges(updated);
    try {
      localStorage.setItem('shopping_challenges_v1', JSON.stringify(updated));
    } catch {}
  };

  const handleToggleComplete = (id: string) => {
    const updated = challenges.map(ch => {
      if (ch.id === id) {
        const nextCompleted = !ch.completed;
        return {
          ...ch,
          completed: nextCompleted,
          currentValue: nextCompleted ? ch.targetValue : Math.max(0, ch.targetValue - 1),
        };
      }
      return ch;
    });
    saveChallenges(updated);
  };

  const handleToggleDisable = (id: string) => {
    const updated = challenges.map(ch => {
      if (ch.id === id) {
        return { ...ch, disabled: !ch.disabled };
      }
      return ch;
    });
    saveChallenges(updated);
  };

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Gamified Financial Wellness · Saving Streaks</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Saving Streaks & Monthly Challenges</span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Turn mindful shopping into an engaging habit. Earn streak badges and conquer optional monthly budget challenges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-extrabold font-mono shadow-xs flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-white" />
            <span>{streakData.daysWithoutUnnecessary}-Day Streak!</span>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('challenges')}
              className="px-3.5 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Full Challenges Hub →</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Gamified Streak Metrics (Prompt Section 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak 1: Days without unnecessary purchases */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/10 border border-amber-200 dark:border-amber-800/60 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span>Mindful Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {streakData.daysWithoutUnnecessary} Days
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            You&apos;ve avoided unnecessary purchases for {streakData.daysWithoutUnnecessary} consecutive days!
          </p>
        </div>

        {/* Streak 2: Days under budget */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/10 border border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span>Pacing Track</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {streakData.daysUnderBudget} Days
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Consecutive days operating safely below monthly allowance.
          </p>
        </div>

        {/* Streak 3: Money saved via alternatives */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/40 dark:from-purple-950/30 dark:to-indigo-950/10 border border-purple-200 dark:border-purple-800/60 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-xs font-semibold text-purple-800 dark:text-purple-300">
            <span>Alternative Savings</span>
            <TrendingDown className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-1">
            {formatPrice(streakData.savedThroughAlternatives)}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Saved this month by choosing vetted lower-priced alternatives.
          </p>
        </div>

        {/* Streak 4: Price comparisons */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50/40 dark:from-blue-950/30 dark:to-cyan-950/10 border border-blue-200 dark:border-blue-800/60 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-xs font-semibold text-blue-800 dark:text-blue-300">
            <span>Price Comparisons</span>
            <Trophy className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {streakData.successfulComparisons} Checks
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Cross-store verifications conducted before completing checkout.
          </p>
        </div>
      </div>

      {/* Monthly Challenges Cards (Prompt Section 5) */}
      <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Monthly Shopping Challenges (Optional)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {challenges.filter(c => c.completed).length} of {challenges.filter(c => !c.disabled).length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {challenges.map((ch) => {
            const isCompleted = ch.completed;
            const isDisabled = ch.disabled;
            const progressPercent = Math.min(100, Math.round((ch.currentValue / ch.targetValue) * 100));

            return (
              <div
                key={ch.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isDisabled
                    ? 'opacity-40 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                    : isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {ch.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {ch.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {ch.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                        {ch.rewardBadge}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {!isDisabled && (
                    <div className="space-y-1.5 pt-3">
                      <div className="flex justify-between text-[11px] font-mono text-slate-500">
                        <span>Progress: {ch.unit === 'rupees' ? formatPrice(ch.currentValue) : `${ch.currentValue} / ${ch.targetValue} ${ch.unit}`}</span>
                        <strong className="text-purple-600 dark:text-purple-400">{progressPercent}%</strong>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Challenge Actions (Allow user to skip or toggle) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <button
                    onClick={() => handleToggleDisable(ch.id)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {isDisabled ? 'Re-enable Challenge' : 'Skip / Disable'}
                  </button>

                  {!isDisabled && (
                    <button
                      onClick={() => handleToggleComplete(ch.id)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{isCompleted ? 'Completed' : 'Mark as Done'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
