import React, { useState } from 'react';
import { 
  Target, 
  PiggyBank, 
  TrendingDown, 
  TrendingUp, 
  Sliders, 
  Check, 
  X, 
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface RadialGoalProgressBarProps {
  // Active goal type
  goalType: 'spending' | 'savings';
  onGoalTypeChange: (type: 'spending' | 'savings') => void;
  // Spending goal
  spentAmount: number;
  spendingLimit: number;
  onUpdateSpendingLimit?: (newLimit: number) => void;
  // Savings goal
  savingsAchieved: number;
  savingsTarget: number;
  onUpdateSavingsTarget?: (newTarget: number) => void;
  // Context info
  monthName: string;
  comparisonPercent?: number;
}

export const RadialGoalProgressBar: React.FC<RadialGoalProgressBarProps> = ({
  goalType,
  onGoalTypeChange,
  spentAmount,
  spendingLimit,
  onUpdateSpendingLimit,
  savingsAchieved,
  savingsTarget,
  onUpdateSavingsTarget,
  monthName,
  comparisonPercent = 8,
}) => {
  const { formatPrice, currency } = useApp();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editValue, setEditValue] = useState<string>('');

  const isSpending = goalType === 'spending';

  const currentAmount = isSpending ? spentAmount : savingsAchieved;
  const currentTarget = isSpending ? spendingLimit : savingsTarget;

  const percentage = Math.round((currentAmount / (currentTarget || 1)) * 100);
  const clampedPercent = Math.min(Math.max(percentage, 0), 100);
  const remaining = Math.max(0, currentTarget - currentAmount);

  // SVG Geometry for Radial Bar
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~339.292
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  // Status computation
  let statusText = '';
  let statusColor = '';
  let statusBadgeBg = '';

  if (isSpending) {
    if (percentage > 100) {
      statusText = 'Over Limit';
      statusColor = 'text-rose-600 dark:text-rose-400';
      statusBadgeBg = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    } else if (percentage >= 85) {
      statusText = 'Near Limit';
      statusColor = 'text-amber-600 dark:text-amber-400';
      statusBadgeBg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    } else {
      statusText = 'Safe Pace';
      statusColor = 'text-emerald-600 dark:text-emerald-400';
      statusBadgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    }
  } else {
    if (percentage >= 100) {
      statusText = 'Goal Met! 🎉';
      statusColor = 'text-emerald-600 dark:text-emerald-400';
      statusBadgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    } else if (percentage >= 70) {
      statusText = 'Ahead of Pace';
      statusColor = 'text-teal-600 dark:text-teal-400';
      statusBadgeBg = 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800';
    } else {
      statusText = 'In Progress';
      statusColor = 'text-purple-600 dark:text-purple-400';
      statusBadgeBg = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
    }
  }

  const handleOpenEdit = () => {
    setEditValue(String(currentTarget));
    setIsEditingGoal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(editValue);
    if (!isNaN(num) && num > 0) {
      if (isSpending && onUpdateSpendingLimit) {
        onUpdateSpendingLimit(num);
      } else if (!isSpending && onUpdateSavingsTarget) {
        onUpdateSavingsTarget(num);
      }
      setIsEditingGoal(false);
    }
  };

  const spendingPresets = [10000, 15000, 20000, 25000];
  const savingsPresets = [3000, 5000, 7500, 10000];

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      {/* 1. Header with Goal Switcher Tabs */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        {/* Toggle between Spending Limit and Savings Goal */}
        <div className="flex items-center p-0.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-[#E5DDF2] dark:border-slate-700/80 shadow-2xs">
          <button
            type="button"
            onClick={() => onGoalTypeChange('spending')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isSpending
                ? 'bg-[#8B5CF6] text-white shadow-xs'
                : 'text-[#625B72] dark:text-slate-300 hover:text-[#4C267B] dark:hover:text-white'
            }`}
          >
            <Target className="w-3 h-3" />
            <span>Monthly Budget</span>
          </button>
          <button
            type="button"
            onClick={() => onGoalTypeChange('savings')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isSpending
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'text-[#625B72] dark:text-slate-300 hover:text-[#4C267B] dark:hover:text-white'
            }`}
          >
            <PiggyBank className="w-3 h-3" />
            <span>Savings Target</span>
          </button>
        </div>

        {/* Goal Edit Button */}
        <button
          type="button"
          onClick={handleOpenEdit}
          className="flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] dark:text-purple-300 hover:text-[#4C267B] dark:hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 shrink-0"
          title="Adjust target limit"
        >
          <Sliders className="w-3 h-3" />
          <span>Edit Goal</span>
        </button>
      </div>

      {/* 2. Main Visual Area: Radial Progress Ring + Metric Summary */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 py-1 min-w-0">
        {/* SVG Radial Progress Bar */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            <defs>
              {/* Spending Gradient */}
              <linearGradient id="spendingRadialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor={percentage > 90 ? '#F43F5E' : '#EC4899'} />
              </linearGradient>

              {/* Savings Gradient */}
              <linearGradient id="savingsRadialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-[#E5DDF2] dark:text-slate-800 transition-colors"
            />

            {/* Progress Active Ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={isSpending ? 'url(#spendingRadialGradient)' : 'url(#savingsRadialGradient)'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Info in the Radial Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#625B72] dark:text-slate-400">
              {isSpending ? 'Used' : 'Progress'}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1E1B2E] dark:text-white tabular-nums leading-none my-0.5">
              {percentage}%
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${statusBadgeBg}`}>
              {statusText}
            </span>
          </div>
        </div>

        {/* Text Metrics & Goal Comparison */}
        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#625B72] dark:text-slate-400">
              {isSpending ? `Total Spending (${monthName})` : `Total Savings (${monthName})`}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1E1B2E] dark:text-white tracking-tight tabular-nums mt-0.5">
              {formatPrice(currentAmount)}
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
            {isSpending ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EDFAF6] dark:bg-emerald-950/40 border border-[#BFEADE] dark:border-emerald-800 text-[11px] font-bold text-[#16A085] dark:text-emerald-300 shadow-2xs">
                <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                <span>↓ {comparisonPercent}% vs last month</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                <Sparkles className="w-3 h-3" />
                <span>Discounts & price drops</span>
              </span>
            )}

            <span className="text-[11px] font-semibold text-[#625B72] dark:text-slate-400">
              of {formatPrice(currentTarget)} goal
            </span>
          </div>
        </div>
      </div>

      {/* 3. Supporting Details: Budget Runway, Remaining Buffer, and Daily Pace */}
      <div className="pt-3 border-t border-[#E5DDF2] dark:border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[11px] text-[#625B72] dark:text-slate-400 font-medium block">
            {isSpending ? 'Remaining Pool' : 'Savings Gap'}
          </span>
          <div className="text-sm sm:text-base font-extrabold font-mono text-[#1E1B2E] dark:text-white tabular-nums">
            {formatPrice(remaining)}
          </div>
          <div className="text-[10px] text-[#625B72] dark:text-slate-400 font-semibold truncate">
            {isSpending 
              ? `${Math.max(0, 100 - percentage)}% allowance left`
              : `${Math.max(0, 100 - percentage)}% left to achieve`}
          </div>
        </div>

        <div className="space-y-0.5 text-right">
          <span className="text-[11px] text-[#625B72] dark:text-slate-400 font-medium block">
            {isSpending ? 'Daily Target Pace' : 'Daily Savings Pace'}
          </span>
          <div className="text-sm sm:text-base font-extrabold font-mono text-[#1E1B2E] dark:text-white tabular-nums">
            {formatPrice(Math.round(remaining / 30))}
            <span className="text-[10px] text-[#625B72] font-semibold">/day</span>
          </div>
          <div className="text-[10px] text-[#7C3AED] dark:text-purple-300 font-bold truncate">
            {isSpending ? 'Recommended spend limit' : 'Target daily saving'}
          </div>
        </div>
      </div>

      {/* 4. Inline Modal / Popover to Edit Target Goal */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xs sm:max-w-sm bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F3EEFF] dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center">
                  {isSpending ? <Target className="w-4 h-4" /> : <PiggyBank className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1E1B2E] dark:text-white">
                    {isSpending ? 'Set Monthly Budget Goal' : 'Set Monthly Savings Target'}
                  </h3>
                  <p className="text-[10px] text-[#625B72] dark:text-slate-400">
                    Visualized on your dashboard radial bar
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="text-[#625B72] hover:text-[#29243A] dark:hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#625B72] dark:text-slate-400 mb-1">
                  Target Amount ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-[#F8F5FD] dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 rounded-xl text-[#29243A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-[#625B72] dark:text-slate-400">
                  Quick Presets:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(isSpending ? spendingPresets : savingsPresets).map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setEditValue(String(preset))}
                      className={`px-1.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        Number(editValue) === preset
                          ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                          : 'bg-white dark:bg-slate-800 text-[#4C267B] dark:text-slate-300 border-[#E5DDF2] dark:border-slate-700 hover:bg-[#F3EEFF]'
                      }`}
                    >
                      {formatPrice(preset)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="flex-1 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 text-xs font-bold text-[#625B72] dark:text-slate-300 hover:bg-[#F3EEFF] dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
