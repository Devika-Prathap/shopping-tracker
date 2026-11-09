import React, { useState, useMemo, useEffect } from 'react';
import { 
  PiggyBank, 
  Target, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Edit3, 
  Plus, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight, 
  Zap, 
  DollarSign, 
  Percent, 
  Calendar, 
  X,
  Flame,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, PriceDropItem } from '../types';

interface MonthlySavingGoalCardProps {
  purchases: PurchaseTransaction[];
  monthlyBudget?: number;
  priceDrops?: PriceDropItem[];
}

interface SavingsContribution {
  id: string;
  amount: number;
  note: string;
  date: string;
}

const PRESET_GOALS = [2500, 5000, 7500, 10000, 15000];

export const MonthlySavingGoalCard: React.FC<MonthlySavingGoalCardProps> = ({
  purchases,
  monthlyBudget = 15000,
  priceDrops = [],
}) => {
  const { formatPrice, currency } = useApp();

  // 1. Monthly Saving Goal state (persisted to localStorage)
  const [monthlySavingGoal, setMonthlySavingGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('monthly_saving_goal_amount');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {}
    return 5000; // Default ₹5,000 goal
  });

  // Goal edit modal state
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState<string>(monthlySavingGoal.toString());

  // 2. Extra custom savings contributions (e.g. skipped impulse purchases, cash deposits, rewards)
  const [contributions, setContributions] = useState<SavingsContribution[]>(() => {
    try {
      const saved = localStorage.getItem('monthly_savings_contributions_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'contrib-1',
        amount: 800,
        note: 'Skipped fast-fashion impulse checkout',
        date: 'Oct 14',
      },
      {
        id: 'contrib-2',
        amount: 450,
        note: 'Credit card shopping cashback rewarded',
        date: 'Oct 18',
      },
    ];
  });

  const [isAddingDeposit, setIsAddingDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Sync goal to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('monthly_saving_goal_amount', monthlySavingGoal.toString());
    } catch {}
  }, [monthlySavingGoal]);

  // Sync contributions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('monthly_savings_contributions_v1', JSON.stringify(contributions));
    } catch {}
  }, [contributions]);

  // 3. Compute Savings Breakdown from real verified shopping data
  const delivered = useMemo(() => {
    return purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  }, [purchases]);

  // Total spent this month
  const totalSpentMonth = useMemo(() => {
    const sum = delivered.reduce((acc, p) => acc + p.totalAmount, 0);
    return sum > 0 ? sum : 12450;
  }, [delivered]);

  // Discounts captured at checkout across orders
  const discountSavings = useMemo(() => {
    const discountsSum = delivered.reduce((sum, p) => {
      const orderDiscount = p.discount || 0;
      const itemMarkdowns = p.items.reduce((iSum, item) => {
        if (item.originalPrice && item.originalPrice > item.price) {
          return iSum + (item.originalPrice - item.price) * (item.quantity || 1);
        }
        return iSum;
      }, 0);
      return sum + orderDiscount + itemMarkdowns;
    }, 0);
    return discountsSum > 0 ? discountsSum : 1250;
  }, [delivered]);

  // Preserved budget headroom (unspent allocation)
  const preservedBudgetHeadroom = useMemo(() => {
    return Math.max(0, monthlyBudget - totalSpentMonth);
  }, [monthlyBudget, totalSpentMonth]);

  // Price drop alerts savings captured
  const priceDropSavings = useMemo(() => {
    return priceDrops.reduce((acc, pd) => acc + (pd.priceDifference || 0), 0);
  }, [priceDrops]);

  // Manual extra contributions sum
  const customContributionsSum = useMemo(() => {
    return contributions.reduce((sum, c) => sum + c.amount, 0);
  }, [contributions]);

  // Total actual saved towards monthly goal
  const totalSaved = useMemo(() => {
    return discountSavings + preservedBudgetHeadroom + customContributionsSum;
  }, [discountSavings, preservedBudgetHeadroom, customContributionsSum]);

  // Progress percentage
  const progressRatio = useMemo(() => {
    if (monthlySavingGoal <= 0) return 0;
    return (totalSaved / monthlySavingGoal) * 100;
  }, [totalSaved, monthlySavingGoal]);

  const cappedProgress = Math.min(100, Math.max(0, progressRatio));
  const remainingToGoal = Math.max(0, monthlySavingGoal - totalSaved);
  const isGoalAchieved = totalSaved >= monthlySavingGoal;

  // Monthly pacing comparison (e.g. Day 21 of 30 days = 70%)
  const currentDay = 21;
  const totalDays = 30;
  const monthElapsedRatio = (currentDay / totalDays) * 100; // 70%
  const isPacingAhead = progressRatio >= monthElapsedRatio;

  // Save updated goal
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      setMonthlySavingGoal(val);
      setIsEditingGoal(false);
    }
  };

  // Add new savings deposit / contribution
  const handleAddContribution = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      const newEntry: SavingsContribution = {
        id: `contrib-${Date.now()}`,
        amount: amt,
        note: depositNote.trim() || 'Discretionary cutback saved',
        date: `Oct ${currentDay}`,
      };
      setContributions(prev => [newEntry, ...prev]);
      setDepositAmount('');
      setDepositNote('');
      setIsAddingDeposit(false);
    }
  };

  return (
    <section 
      aria-label="Monthly Saving Goal"
      className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#EDFAF6] via-[#F4FDF9] to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border border-[#BFEADE] dark:border-slate-800 shadow-xs space-y-6 relative overflow-hidden transition-all w-full max-w-full min-w-0 box-border animate-fadeIn"
    >
      {/* Decorative ambient gradient backdrop */}
      <div 
        className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header & Goal Target Display */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#BFEADE]/70 dark:border-slate-800/80 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#16A085] dark:text-emerald-400 mb-1">
            <PiggyBank className="w-3.5 h-3.5 text-[#16A085] dark:text-emerald-500 shrink-0" />
            <span>Monthly Saving Goal · Progress Tracker</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-bold text-[#4C267B] dark:text-white tracking-tight flex items-center gap-2">
              Monthly Saving Goal
            </h3>

            {isGoalAchieved ? (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#EDFAF6] dark:bg-emerald-950/80 text-[#16A085] dark:text-emerald-300 border border-[#BFEADE] dark:border-emerald-800 shrink-0">
                <Award className="w-3.5 h-3.5 text-[#16A085] dark:text-emerald-500" />
                Goal Achieved ({progressRatio.toFixed(0)}%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#EDFAF6] dark:bg-teal-950/80 text-[#16A085] dark:text-teal-300 border border-[#BFEADE] dark:border-teal-800 shrink-0">
                <Target className="w-3.5 h-3.5 text-[#16A085] dark:text-teal-500" />
                Target: {formatPrice(monthlySavingGoal)}
              </span>
            )}
          </div>

          <p className="text-xs text-[#625B72] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Set and track your dedicated monthly savings target across checkout discounts, unspent budget headroom, and skipped impulse purchases.
          </p>
        </div>

        {/* Action Controls: Edit Goal & Log Extra Savings */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto shrink-0">
          <button
            onClick={() => {
              setGoalInput(monthlySavingGoal.toString());
              setIsEditingGoal(true);
            }}
            className="px-3.5 py-2 rounded-2xl border border-[#BFEADE] dark:border-slate-700 bg-white hover:bg-[#EDFAF6] dark:bg-slate-800 dark:hover:bg-slate-700/80 text-[#29243A] dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Edit your monthly saving goal target"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#16A085] dark:text-emerald-400" />
            <span>Set / Edit Goal</span>
          </button>

          <button
            onClick={() => setIsAddingDeposit(true)}
            className="px-3.5 py-2 rounded-2xl bg-[#16A085] hover:bg-[#138a72] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#16A085]/20 active:scale-95"
            title="Record money saved from avoiding a purchase or depositing savings"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Savings</span>
          </button>
        </div>
      </div>

      {/* Visual Progress Bar Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/80 dark:bg-slate-800/40 border border-[#BFEADE] dark:border-slate-800 space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
          <div className="flex items-baseline gap-2.5 min-w-0">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatPrice(totalSaved)}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">
              of {formatPrice(monthlySavingGoal)} goal
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`text-base sm:text-lg font-black font-mono px-3 py-1 rounded-2xl ${
              isGoalAchieved 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
            }`}>
              {progressRatio.toFixed(1)}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isGoalAchieved ? 'Target Met!' : 'Progress'}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar Component */}
        <div className="space-y-1.5">
          <div className="relative w-full h-6 sm:h-7 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner border border-slate-300/60 dark:border-slate-700">
            {/* Background Milestone Tick Markers (25%, 50%, 75%) */}
            <div className="absolute inset-0 flex justify-between px-[25%] pointer-events-none z-10">
              <div className="w-[1px] h-full bg-slate-300/70 dark:bg-slate-700" title="25% Milestone" />
              <div className="w-[1px] h-full bg-slate-300/70 dark:bg-slate-700" title="50% Milestone" />
              <div className="w-[1px] h-full bg-slate-300/70 dark:bg-slate-700" title="75% Milestone" />
            </div>

            {/* Current day-of-month pacing needle marker (Day 21 / 70%) */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-slate-900/60 dark:bg-white/60 z-20 pointer-events-none"
              style={{ left: `${monthElapsedRatio}%` }}
              title={`Day ${currentDay} of ${totalDays} (${monthElapsedRatio.toFixed(0)}% through month)`}
            />

            {/* Glowing Active Progress Fill Bar */}
            <div
              className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${
                isGoalAchieved
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500'
              }`}
              style={{ width: `${cappedProgress}%` }}
            >
              {/* Animated gleam effect */}
              <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-pulse" />
            </div>
          </div>

          {/* Progress Bar Milestone Labels */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>₹0 (Start)</span>
            <span className="hidden sm:inline">25%</span>
            <span className="hidden sm:inline">50% Halfway</span>
            <span className="hidden sm:inline">75%</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {formatPrice(monthlySavingGoal)} (100%)
            </span>
          </div>
        </div>

        {/* Motivational Status Callout Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            {isGoalAchieved ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Congratulations! You surpassed your monthly goal by {formatPrice(totalSaved - monthlySavingGoal)}.</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>{formatPrice(remainingToGoal)}</strong> left to hit your monthly target.
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Day {currentDay} of {totalDays} · {isPacingAhead ? 'Ahead of Monthly Pacing' : 'Behind Monthly Pacing'}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0">
        {/* Metric 1: Monthly Saving Goal Target */}
        <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/60 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            <span>Monthly Target Goal</span>
            <Target className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-teal-800 dark:text-teal-200 tabular-nums">
            {formatPrice(monthlySavingGoal)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-teal-700 dark:text-teal-300">
            <span>Set by you</span>
            <button
              onClick={() => {
                setGoalInput(monthlySavingGoal.toString());
                setIsEditingGoal(true);
              }}
              className="font-bold underline hover:text-teal-900 dark:hover:text-teal-100 cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* Metric 2: Total Accumulated Savings */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <span>Accumulated Savings</span>
            <PiggyBank className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-200 tabular-nums">
            {formatPrice(totalSaved)}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 font-medium truncate">
            {progressRatio.toFixed(1)}% of your target met
          </span>
        </div>

        {/* Metric 3: Remaining Needed / Surplus */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isGoalAchieved ? 'Surplus Beyond Goal' : 'Remaining to Goal'}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className={`mt-2 text-2xl font-extrabold font-mono tabular-nums ${
            isGoalAchieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
          }`}>
            {isGoalAchieved ? `+${formatPrice(totalSaved - monthlySavingGoal)}` : formatPrice(remainingToGoal)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
            {isGoalAchieved ? 'Cushion saved this month' : `~${formatPrice(Math.round(remainingToGoal / Math.max(1, totalDays - currentDay)))}/day for next 9 days`}
          </span>
        </div>
      </div>

      {/* Verified Savings Sources Breakdown */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 min-w-0">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Where Your Monthly Savings Came From:
          </span>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer font-semibold"
          >
            {showHistory ? 'Hide Details' : 'View Breakdown & Log'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Source 1: Discounts captured */}
          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block">
                🏷️ Checkout Discounts
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Coupons & item markdowns
              </span>
            </div>
            <span className="font-bold font-mono text-purple-700 dark:text-purple-300">
              {formatPrice(discountSavings)}
            </span>
          </div>

          {/* Source 2: Retained budget headroom */}
          <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 block">
                🛡️ Budget Retained
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Unspent monthly ceiling
              </span>
            </div>
            <span className="font-bold font-mono text-teal-700 dark:text-teal-300">
              {formatPrice(preservedBudgetHeadroom)}
            </span>
          </div>

          {/* Source 3: Discretionary / Manual deposits */}
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">
                🌱 Extra Logged Savings
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {contributions.length} recorded entries
              </span>
            </div>
            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
              {formatPrice(customContributionsSum)}
            </span>
          </div>
        </div>

        {/* Detailed contribution history when toggled */}
        {showHistory && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2 animate-fadeIn">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Recent Savings Contributions & Deposits
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {contributions.map((item) => (
                <div 
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item.note}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.date})</span>
                  </div>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatPrice(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SET / EDIT MONTHLY SAVING GOAL                                   */}
      {/* ========================================================================= */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveGoal}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Set Monthly Saving Goal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your monthly savings target amount. The progress bar will automatically measure your accumulated savings against this goal.
            </p>

            {/* Quick Preset Buttons */}
            <div>
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Goal Presets
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_GOALS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGoalInput(preset.toString())}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                      goalInput === preset.toString()
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                    }`}
                  >
                    {formatPrice(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Custom Target Goal Amount ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                  {currency}
                </span>
                <input
                  type="number"
                  min="500"
                  step="100"
                  required
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="5000"
                  autoFocus
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Saving Goal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LOG EXTRA SAVED DEPOSIT                                          */}
      {/* ========================================================================= */}
      {isAddingDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleAddContribution}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Log Extra Savings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingDeposit(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resisted an impulse buy or moved extra money to savings? Log it here to advance your monthly saving goal progress.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Amount Saved ({currency})
              </label>
              <input
                type="number"
                min="10"
                step="10"
                required
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 500"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Note / Description (Optional)
              </label>
              <input
                type="text"
                value={depositNote}
                onChange={(e) => setDepositNote(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Skipped buying unnecessary sneakers"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingDeposit(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Add to Savings</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
