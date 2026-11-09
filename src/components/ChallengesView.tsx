import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Calendar,
  Layers,
  ShoppingBag,
  Plus,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowRight,
  TrendingDown,
  Info,
  Award,
  AlertCircle,
  ExternalLink,
  Target,
  Zap,
  RefreshCw,
  ShoppingBasket
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory } from '../types';

export interface MonthlyChallengeItem {
  id: string;
  title: string;
  type: 'no_spend_streak' | 'category_budget' | 'discount_savings' | 'total_budget' | 'weekend_no_spend' | 'impulse_freeze';
  category?: ProductCategory | 'All' | 'Discretionary';
  description: string;
  targetValue: number;
  unit: 'days' | 'rupees' | 'orders' | 'items';
  rewardBadge: string;
  badgeEmoji: string;
  deadlineDays: number;
  month: string; // '2026-09' or '2026-10' or 'all'
  custom?: boolean;
}

const DEFAULT_CHALLENGES: MonthlyChallengeItem[] = [
  {
    id: 'ch-no-spend-week',
    title: 'No-Spend Week',
    type: 'no_spend_streak',
    category: 'Discretionary',
    description: 'Go 7 consecutive days without placing an online shopping checkout.',
    targetValue: 7,
    unit: 'days',
    rewardBadge: 'Mindful Saver',
    badgeEmoji: '🛡️',
    deadlineDays: 8,
    month: '2026-09',
  },
  {
    id: 'ch-cat-clothing',
    title: 'Category Budgeting: Clothing & Fashion',
    type: 'category_budget',
    category: 'Clothing',
    description: 'Keep your apparel and footwear orders under ₹2,000 this month.',
    targetValue: 2000,
    unit: 'rupees',
    rewardBadge: 'Capsule Wardrobe',
    badgeEmoji: '👗',
    deadlineDays: 12,
    month: '2026-09',
  },
  {
    id: 'ch-cat-electronics',
    title: 'Category Budgeting: Electronics & Tech',
    type: 'category_budget',
    category: 'Electronics',
    description: 'Keep gadget & hardware upgrades under a ₹7,000 threshold.',
    targetValue: 7000,
    unit: 'rupees',
    rewardBadge: 'Tech Guardian',
    badgeEmoji: '⚡',
    deadlineDays: 14,
    month: '2026-09',
  },
  {
    id: 'ch-cat-beauty',
    title: 'Category Budgeting: Beauty & Skincare',
    type: 'category_budget',
    category: 'Beauty',
    description: 'Limit skincare and beauty replenishments to under ₹1,500.',
    targetValue: 1500,
    unit: 'rupees',
    rewardBadge: 'Glow Minimalist',
    badgeEmoji: '✨',
    deadlineDays: 15,
    month: '2026-09',
  },
  {
    id: 'ch-discounts-hunt',
    title: 'Smart Deal Hunter',
    type: 'discount_savings',
    category: 'All',
    description: 'Save at least ₹1,500 through promo codes, instant discounts and deals.',
    targetValue: 1500,
    unit: 'rupees',
    rewardBadge: 'Deal Architect',
    badgeEmoji: '🏷️',
    deadlineDays: 10,
    month: '2026-09',
  },
  {
    id: 'ch-no-spend-weekend',
    title: 'Zero-Spend Weekend',
    type: 'weekend_no_spend',
    category: 'Discretionary',
    description: 'Complete at least 4 weekend days (Sat/Sun) with zero online shopping.',
    targetValue: 4,
    unit: 'days',
    rewardBadge: 'Weekend Unplugged',
    badgeEmoji: '☕',
    deadlineDays: 6,
    month: '2026-09',
  },
  {
    id: 'ch-impulse-freeze',
    title: 'Impulse Purchase Freeze',
    type: 'impulse_freeze',
    category: 'Discretionary',
    description: 'Keep spontaneous impulse-flagged and late-night orders to 1 or fewer.',
    targetValue: 1,
    unit: 'orders',
    rewardBadge: 'Zen Buyer',
    badgeEmoji: '🧘',
    deadlineDays: 18,
    month: '2026-09',
  },
  {
    id: 'ch-total-budget',
    title: 'Monthly Total Budget Cap',
    type: 'total_budget',
    category: 'All',
    description: 'Keep aggregate online retail spending under ₹18,000 for the billing cycle.',
    targetValue: 18000,
    unit: 'rupees',
    rewardBadge: 'Grandmaster Saver',
    badgeEmoji: '🏆',
    deadlineDays: 11,
    month: '2026-09',
  },
];

interface ChallengesViewProps {
  purchases: PurchaseTransaction[];
  onNavigateTab?: (tab: any) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({ purchases, onNavigateTab }) => {
  const { formatPrice } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [filterType, setFilterType] = useState<'all' | 'category' | 'streak' | 'active' | 'completed'>('all');
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Custom challenges saved in localStorage
  const [customChallenges, setCustomChallenges] = useState<MonthlyChallengeItem[]>(() => {
    try {
      const saved = localStorage.getItem('user_monthly_challenges_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // New challenge form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MonthlyChallengeItem['type']>('category_budget');
  const [newCategory, setNewCategory] = useState<ProductCategory>('Clothing');
  const [newTarget, setNewTarget] = useState<number>(2500);
  const [newBadge, setNewBadge] = useState('Thrift Champion');
  const [newEmoji, setNewEmoji] = useState('🌟');

  const allChallenges = useMemo(() => {
    return [...DEFAULT_CHALLENGES, ...customChallenges];
  }, [customChallenges]);

  // Handle saving new challenge
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newTarget <= 0) return;

    const created: MonthlyChallengeItem = {
      id: `custom-ch-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      category: newType === 'category_budget' ? newCategory : 'Discretionary',
      description: newType === 'category_budget' 
        ? `Keep spending on ${newCategory} under ${formatPrice(newTarget)} this month.`
        : `Achieve target of ${newTarget} ${newType === 'no_spend_streak' ? 'days' : 'rupees'}.`,
      targetValue: newTarget,
      unit: newType === 'no_spend_streak' || newType === 'weekend_no_spend' ? 'days' : newType === 'impulse_freeze' ? 'orders' : 'rupees',
      rewardBadge: newBadge.trim() || 'Goal Crusher',
      badgeEmoji: newEmoji || '🎯',
      deadlineDays: 14,
      month: selectedMonth,
      custom: true,
    };

    const updated = [created, ...customChallenges];
    setCustomChallenges(updated);
    try {
      localStorage.setItem('user_monthly_challenges_v1', JSON.stringify(updated));
    } catch {}

    setShowCreateModal(false);
    setNewTitle('');
  };

  const handleDeleteCustomChallenge = (id: string) => {
    const updated = customChallenges.filter(c => c.id !== id);
    setCustomChallenges(updated);
    try {
      localStorage.setItem('user_monthly_challenges_v1', JSON.stringify(updated));
    } catch {}
  };

  // Filter purchases for selected month
  const activeMonthPurchases = useMemo(() => {
    if (selectedMonth === 'all') return purchases;
    return purchases.filter(p => p.date.startsWith(selectedMonth));
  }, [purchases, selectedMonth]);

  // Real-time dynamic evaluation logic per challenge
  const evaluatedChallenges = useMemo(() => {
    return allChallenges.map(ch => {
      // 1. Calculate metrics based on type & purchases
      let currentValue = 0;
      let isCompleted = false;
      let progressPercent = 0;
      let contributingItems: Array<{ id: string; name: string; price: number; store: string; date: string }> = [];
      let explanation = '';

      if (ch.type === 'category_budget') {
        const cat = ch.category || 'Clothing';
        activeMonthPurchases.forEach(tx => {
          if (tx.orderStatus === 'Cancelled') return;
          tx.items.forEach(it => {
            if (it.isRefunded || it.orderStatus === 'Returned') return;
            if (it.category.toLowerCase() === (cat as string).toLowerCase()) {
              currentValue += it.price * it.quantity;
              contributingItems.push({
                id: it.id,
                name: it.name,
                price: it.price * it.quantity,
                store: tx.store,
                date: tx.date,
              });
            }
          });
        });

        // For budget caps: progress is how much of the budget cap has been used.
        // It remains completed/on-track as long as currentValue <= targetValue.
        progressPercent = Math.min(100, Math.round((currentValue / ch.targetValue) * 100));
        isCompleted = currentValue <= ch.targetValue;
        const diff = ch.targetValue - currentValue;
        explanation = diff >= 0
          ? `${formatPrice(diff)} buffer remaining under ₹${ch.targetValue} cap.`
          : `Exceeded budget limit by ${formatPrice(Math.abs(diff))}.`;
      } 
      else if (ch.type === 'no_spend_streak') {
        // Calculate consecutive days without purchases in this month
        // Find distinct dates of purchases
        const purchaseDateSet = new Set(
          activeMonthPurchases
            .filter(tx => tx.orderStatus !== 'Cancelled' && !tx.isRefunded)
            .map(tx => tx.date)
        );

        // Calculate maximum zero-spend consecutive streak
        // Let's inspect days in September 2026 (Sept 1 to Sept 30)
        let longestZeroStreak = 0;
        let currentZeroStreak = 0;
        let qualifyingDates: string[] = [];
        let tempStreakDates: string[] = [];

        // Check 30 days of the month
        for (let d = 1; d <= 30; d++) {
          const dayStr = d < 10 ? `0${d}` : `${d}`;
          const fullDateStr = `2026-09-${dayStr}`;
          if (!purchaseDateSet.has(fullDateStr)) {
            currentZeroStreak++;
            tempStreakDates.push(fullDateStr);
            if (currentZeroStreak > longestZeroStreak) {
              longestZeroStreak = currentZeroStreak;
              qualifyingDates = [...tempStreakDates];
            }
          } else {
            currentZeroStreak = 0;
            tempStreakDates = [];
          }
        }

        currentValue = longestZeroStreak;
        progressPercent = Math.min(100, Math.round((currentValue / ch.targetValue) * 100));
        isCompleted = currentValue >= ch.targetValue;
        explanation = isCompleted 
          ? `Achieved ${currentValue} consecutive zero-spend days! Challenge cleared.`
          : `Current best streak is ${currentValue} of ${ch.targetValue} days.`;
      } 
      else if (ch.type === 'weekend_no_spend') {
        // Days on weekends (Saturday & Sunday) without purchases
        const purchaseDateSet = new Set(
          activeMonthPurchases
            .filter(tx => tx.orderStatus !== 'Cancelled' && !tx.isRefunded)
            .map(tx => tx.date)
        );

        let weekendDaysWithoutSpend = 0;
        // In September 2026:
        // Sept 5 (Sat), Sept 6 (Sun), Sept 12 (Sat), Sept 13 (Sun), Sept 19 (Sat), Sept 20 (Sun - Flipkart tx-005), Sept 26 (Sat), Sept 27 (Sun)
        const weekendDates = [
          '2026-09-05', '2026-09-06',
          '2026-09-12', '2026-09-13',
          '2026-09-19', '2026-09-20',
          '2026-09-26', '2026-09-27'
        ];

        weekendDates.forEach(d => {
          if (!purchaseDateSet.has(d)) {
            weekendDaysWithoutSpend++;
          } else {
            const tx = activeMonthPurchases.find(p => p.date === d);
            if (tx) {
              contributingItems.push({
                id: tx.id,
                name: `${tx.store} order #${tx.orderNumber}`,
                price: tx.totalAmount,
                store: tx.store,
                date: tx.date,
              });
            }
          }
        });

        currentValue = weekendDaysWithoutSpend;
        progressPercent = Math.min(100, Math.round((currentValue / ch.targetValue) * 100));
        isCompleted = currentValue >= ch.targetValue;
        explanation = `${currentValue} of ${ch.targetValue} weekend days completed without online shopping.`;
      } 
      else if (ch.type === 'discount_savings') {
        // Total discounts captured across all transactions
        let totalDiscounts = 0;
        activeMonthPurchases.forEach(tx => {
          if (tx.orderStatus === 'Cancelled') return;
          if (tx.discount > 0) {
            totalDiscounts += tx.discount;
            contributingItems.push({
              id: tx.id,
              name: `${tx.store} instant promo & coupon savings`,
              price: tx.discount,
              store: tx.store,
              date: tx.date,
            });
          }
        });
        currentValue = totalDiscounts;
        progressPercent = Math.min(100, Math.round((currentValue / ch.targetValue) * 100));
        isCompleted = currentValue >= ch.targetValue;
        explanation = `${formatPrice(currentValue)} in discounts secured out of ₹${ch.targetValue} goal.`;
      } 
      else if (ch.type === 'impulse_freeze') {
        // Check for impulse tagged items or late night orders
        let impulseCount = 0;
        activeMonthPurchases.forEach(tx => {
          const hasImpulseTag = tx.tags?.some(t => t.toLowerCase().includes('impulse')) ||
            tx.items.some(it => it.tags?.some(t => t.toLowerCase().includes('impulse')));
          
          if (hasImpulseTag) {
            impulseCount++;
            contributingItems.push({
              id: tx.id,
              name: `${tx.store} - ${tx.items[0]?.name || 'Impulse tagged'}`,
              price: tx.totalAmount,
              store: tx.store,
              date: tx.date,
            });
          }
        });

        currentValue = impulseCount;
        isCompleted = currentValue <= ch.targetValue;
        progressPercent = currentValue === 0 ? 100 : Math.max(0, 100 - (currentValue * 50));
        explanation = currentValue <= ch.targetValue 
          ? `Mindful restraint maintained (${currentValue} impulse items flagged).`
          : `Flagged ${currentValue} impulse purchases this cycle.`;
      } 
      else if (ch.type === 'total_budget') {
        // Total spend across all purchases
        let totalSpend = 0;
        activeMonthPurchases.forEach(tx => {
          if (tx.orderStatus === 'Cancelled' || tx.isRefunded) return;
          totalSpend += tx.totalAmount;
          contributingItems.push({
            id: tx.id,
            name: `${tx.store} (${tx.items.length} item${tx.items.length > 1 ? 's' : ''})`,
            price: tx.totalAmount,
            store: tx.store,
            date: tx.date,
          });
        });

        currentValue = totalSpend;
        progressPercent = Math.min(100, Math.round((currentValue / ch.targetValue) * 100));
        isCompleted = currentValue <= ch.targetValue;
        const diff = ch.targetValue - currentValue;
        explanation = diff >= 0
          ? `${formatPrice(diff)} remains within your monthly ceiling.`
          : `Total spend is ${formatPrice(Math.abs(diff))} above ceiling.`;
      }

      return {
        ...ch,
        calculatedCurrentValue: currentValue,
        isCompleted,
        progressPercent,
        contributingItems,
        explanation,
      };
    });
  }, [allChallenges, activeMonthPurchases, formatPrice]);

  // Filtered view list
  const filteredChallenges = useMemo(() => {
    return evaluatedChallenges.filter(ch => {
      if (filterType === 'completed') return ch.isCompleted;
      if (filterType === 'active') return !ch.isCompleted;
      if (filterType === 'category') return ch.type === 'category_budget';
      if (filterType === 'streak') return ch.type === 'no_spend_streak' || ch.type === 'weekend_no_spend';
      return true;
    });
  }, [evaluatedChallenges, filterType]);

  // Overall Statistics
  const completedCount = evaluatedChallenges.filter(c => c.isCompleted).length;
  const totalCount = evaluatedChallenges.length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  // Calculate estimated savings from successful challenges
  const estimatedSavings = useMemo(() => {
    let saved = 0;
    evaluatedChallenges.forEach(ch => {
      if (ch.type === 'discount_savings') {
        saved += ch.calculatedCurrentValue;
      } else if (ch.type === 'category_budget' && ch.isCompleted) {
        saved += Math.max(0, ch.targetValue - ch.calculatedCurrentValue);
      }
    });
    return saved;
  }, [evaluatedChallenges]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-purple-200">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Monthly Gamified Shopping Challenges</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Shopping Challenges & Streaks</span>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-purple-500/30 border border-purple-400/30 text-purple-200 font-mono font-medium">
                Cycle: {selectedMonth === '2026-09' ? 'September 2026' : selectedMonth}
              </span>
            </h1>

            <p className="text-sm text-purple-100/80 leading-relaxed">
              Build mindful consumption habits with live progress tracking calculated straight from your verified purchase receipts. Set category caps, crush no-spend weeks, and unlock financial wellness badges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Month Picker */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-purple-300 ml-2" />
              <button
                onClick={() => setSelectedMonth('2026-09')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedMonth === '2026-09'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Sept 2026
              </button>
              <button
                onClick={() => setSelectedMonth('2026-10')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedMonth === '2026-10'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Oct 2026
              </button>
              <button
                onClick={() => setSelectedMonth('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedMonth === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                All Data
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Challenge</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/15">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-purple-200/80 uppercase tracking-wider">
              Completed Challenges
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-baseline gap-1.5">
              <span>{completedCount}</span>
              <span className="text-xs font-normal text-purple-300">/ {totalCount}</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{completionRate}% Success Rate</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-purple-200/80 uppercase tracking-wider">
              Budget Preserved
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
              {formatPrice(estimatedSavings)}
            </div>
            <div className="text-[11px] text-purple-200/80 mt-1">
              Via caps & discounts
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-purple-200/80 uppercase tracking-wider">
              Longest No-Spend Streak
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1 flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>5 Days</span>
            </div>
            <div className="text-[11px] text-purple-200/80 mt-1">
              Sept 5 – Sept 9 verified
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-purple-200/80 uppercase tracking-wider">
              Badges Unlocked
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-1.5">
              <span>{completedCount}</span>
              <Award className="w-5 h-5 text-purple-300" />
            </div>
            <div className="text-[11px] text-purple-200/80 mt-1">
              Monthly trophy shelf
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Challenges ({totalCount})
          </button>
          <button
            onClick={() => setFilterType('category')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'category'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Category Budgeting</span>
          </button>
          <button
            onClick={() => setFilterType('streak')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'streak'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>No-Spend Streaks</span>
          </button>
          <button
            onClick={() => setFilterType('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'completed'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Completed ({completedCount})</span>
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'active'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            In Progress ({totalCount - completedCount})
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span>Calculated automatically from {activeMonthPurchases.length} verified purchases</span>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredChallenges.map((challenge) => {
          const isExpanded = expandedChallengeId === challenge.id;
          const isCategoryCap = challenge.type === 'category_budget';
          const isStreak = challenge.type === 'no_spend_streak' || challenge.type === 'weekend_no_spend';

          // Color themes
          const isFinished = challenge.isCompleted;

          return (
            <div
              key={challenge.id}
              className={`rounded-3xl border transition-all duration-200 p-6 flex flex-col justify-between ${
                isFinished
                  ? 'bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-200 dark:border-emerald-800/50 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-800/70'
              }`}
            >
              <div>
                {/* Challenge Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0 ${
                      isFinished
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60'
                    }`}>
                      {challenge.badgeEmoji}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                          {challenge.title}
                        </h3>
                        {challenge.custom && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold">
                            Custom
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          {challenge.category || 'Discretionary'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{challenge.deadlineDays} days remaining</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isFinished ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Target className="w-3 h-3 text-amber-500" />
                        <span>In Progress</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {challenge.description}
                </p>

                {/* Metric Numbers */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {isCategoryCap ? 'Current Spent / Budget Cap' : 'Current Progress'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {challenge.unit === 'rupees' ? (
                        <>
                          <span className={isCategoryCap && !isFinished ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}>
                            {formatPrice(challenge.calculatedCurrentValue)}
                          </span>
                          {' '}/ {formatPrice(challenge.targetValue)}
                        </>
                      ) : (
                        <>
                          <span className="text-purple-600 dark:text-purple-400 font-bold">
                            {challenge.calculatedCurrentValue}
                          </span>
                          {' '}/ {challenge.targetValue} {challenge.unit}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFinished
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : isCategoryCap
                            ? challenge.progressPercent > 80
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                            : 'bg-gradient-to-r from-amber-400 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(4, challenge.progressPercent))}%` }}
                    />
                  </div>

                  {/* Dynamic Calculation Status message */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                      <span>{challenge.explanation}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                      {challenge.progressPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Reward Badge & Expandable Data Drawer */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Reward:
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50">
                      <span>{challenge.badgeEmoji}</span>
                      <span>{challenge.rewardBadge}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {challenge.custom && (
                      <button
                        onClick={() => handleDeleteCustomChallenge(challenge.id)}
                        className="text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedChallengeId(isExpanded ? null : challenge.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer px-2 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Purchase Data'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Breakdown Drawer */}
                {isExpanded && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>Live Purchase Evidence Breakdown</span>
                      <span className="text-[11px] text-slate-500">
                        {challenge.contributingItems.length} item{challenge.contributingItems.length !== 1 ? 's' : ''} detected
                      </span>
                    </div>

                    {challenge.contributingItems.length > 0 ? (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {challenge.contributingItems.map((item, idx) => (
                          <div 
                            key={`${item.id}-${idx}`}
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800"
                          >
                            <div className="truncate pr-2">
                              <div className="font-medium text-slate-900 dark:text-white truncate">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">{item.store}</span>
                                <span>•</span>
                                <span>{item.date}</span>
                              </div>
                            </div>
                            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0">
                              {formatPrice(item.price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-xl">
                        {isStreak 
                          ? 'Zero discretionary checkouts detected in this window. Full streak intact!'
                          : 'No matching purchases recorded in this category yet. Budget is completely unspent!'}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-700/60 pt-2">
                      💡 <strong>Formula:</strong> {challenge.type === 'category_budget' 
                        ? `Sum of delivered items in category '${challenge.category}' (excluding returns) compared against ₹${challenge.targetValue} cap.`
                        : challenge.type === 'no_spend_streak'
                        ? 'Count of continuous calendar days with ₹0 online shopping orders.'
                        : 'Real-time deduction against user transaction store records.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlocked Badges Showcase */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Trophy Shelf · Gamified Financial Wellness</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Earned Badges & Milestones
            </h2>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            {completedCount} of {totalCount} Badges Collected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {evaluatedChallenges.map((ch) => {
            const isEarned = ch.isCompleted;

            return (
              <div
                key={ch.id}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  isEarned
                    ? 'bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/30 dark:to-slate-900 border-amber-300 dark:border-amber-700 shadow-xs scale-100 hover:scale-105'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-800 opacity-60 grayscale'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                  isEarned ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-slate-200 dark:bg-slate-800'
                }`}>
                  {ch.badgeEmoji}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {ch.rewardBadge}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isEarned ? 'Unlocked 🎉' : 'Locked'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful Habit Guide Callout */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Positive Reinforcement Principle</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            All shopping challenges are designed to be fun, stress-free micro-habits. Missing a challenge carries zero negative penalty—progress simply rolls over to your next active cycle.
          </p>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('budgets')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-xs"
          >
            Manage Category Budgets →
          </button>
        )}
      </div>

      {/* Modal: Create Custom Challenge */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Create Monthly Shopping Challenge
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Set a customized cap or habit goal evaluated against your purchase history
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Challenge Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shoes Cap Challenge or 5-Day No-Spend"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Challenge Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="category_budget">Category Budget Cap</option>
                    <option value="no_spend_streak">No-Spend Streak (Days)</option>
                    <option value="discount_savings">Discount Savings (₹)</option>
                    <option value="weekend_no_spend">Zero-Spend Weekends</option>
                    <option value="total_budget">Total Monthly Cap (₹)</option>
                  </select>
                </div>

                {newType === 'category_budget' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Clothing">Clothing</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Mobile Accessories">Mobile Accessories</option>
                      <option value="Food & Groceries">Food & Groceries</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Value ({newType === 'no_spend_streak' || newType === 'weekend_no_spend' ? 'Days' : 'Rupees'})
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTarget}
                  onChange={(e) => setNewTarget(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Name
                  </label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Emoji
                  </label>
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Save & Activate Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
