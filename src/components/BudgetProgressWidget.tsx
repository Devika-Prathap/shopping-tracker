import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Gauge, 
  BarChart2, 
  TrendingUp, 
  Edit3,
  X,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, CategoryBudget, ProductCategory } from '../types';
import { INITIAL_CATEGORY_BUDGETS } from '../data/shoppingData';

interface BudgetProgressWidgetProps {
  purchases: PurchaseTransaction[];
  budgets?: CategoryBudget[];
  onNavigateTab?: (tab: any) => void;
  onUpdateBudget?: (category: ProductCategory, limit: number) => void;
  selectedMonth?: string;
}

interface TopCategoryBudgetData {
  category: ProductCategory;
  name: string;
  emoji: string;
  spent: number;
  limit: number;
  percent: number;
  remaining: number;
  isOver: boolean;
  status: 'safe' | 'warning' | 'exceeded';
  statusLabel: string;
  themeColor: string;
}

const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  Clothing: { emoji: '👕', color: '#8B5CF6' },
  Electronics: { emoji: '💻', color: '#3B82F6' },
  Shoes: { emoji: '👟', color: '#06B6D4' },
  'Food & Groceries': { emoji: '🥑', color: '#10B981' },
  Beauty: { emoji: '💄', color: '#EC4899' },
  Accessories: { emoji: '🎒', color: '#F59E0B' },
  Gaming: { emoji: '🎮', color: '#6366F1' },
  'Home & Living': { emoji: '🛋️', color: '#14B8A6' },
  'Mobile Accessories': { emoji: '📱', color: '#3B82F6' },
  'Books & Stationery': { emoji: '📚', color: '#84CC16' },
  Gifts: { emoji: '🎁', color: '#A855F7' },
  Other: { emoji: '📦', color: '#64748B' },
};

export const BudgetProgressWidget: React.FC<BudgetProgressWidgetProps> = ({
  purchases,
  budgets = INITIAL_CATEGORY_BUDGETS,
  onNavigateTab,
  onUpdateBudget,
  selectedMonth = 'Current Month',
}) => {
  const { formatPrice } = useApp();

  // Visualization Mode: 'gauge' or 'bar'
  const [viewMode, setViewMode] = useState<'gauge' | 'bar'>(() => {
    try {
      const saved = localStorage.getItem('cartlens_budget_widget_view');
      return saved === 'bar' ? 'bar' : 'gauge';
    } catch {
      return 'gauge';
    }
  });

  const handleToggleViewMode = (mode: 'gauge' | 'bar') => {
    setViewMode(mode);
    try {
      localStorage.setItem('cartlens_budget_widget_view', mode);
    } catch {}
  };

  // State for inline edit of a category limit
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');

  // 1. Calculate spending per category from valid purchases
  const topCategories = useMemo<TopCategoryBudgetData[]>(() => {
    const validPurchases = purchases.filter(
      (p) => !p.isRefunded && p.orderStatus !== 'Cancelled'
    );

    // Compute actual spending
    const spendingMap: Record<string, number> = {};
    validPurchases.forEach((p) => {
      p.items.forEach((item) => {
        const cat = item.category || 'Other';
        const cost = (item.price || 0) * (item.quantity || 1);
        spendingMap[cat] = (spendingMap[cat] || 0) + cost;
      });
    });

    // Create a budget limit lookup
    const budgetMap: Record<string, number> = {};
    budgets.forEach((b) => {
      budgetMap[b.category] = b.monthlyLimit;
    });

    // Baseline fallback values if purchases data has fewer than 3 categories
    const baselineDefaults: Record<string, number> = {
      Clothing: 4200,
      Electronics: 3100,
      Shoes: 2400,
      'Food & Groceries': 2100,
      Beauty: 1850,
      Accessories: 900,
    };

    // Gather all candidate categories
    const candidateCategories: string[] = Array.from(
      new Set([
        ...Object.keys(spendingMap),
        ...budgets.map((b) => b.category),
        'Clothing',
        'Electronics',
        'Shoes',
      ])
    );

    const list = candidateCategories.map((catKey) => {
      const spent = spendingMap[catKey] ?? baselineDefaults[catKey] ?? 0;
      const limit = budgetMap[catKey] || 4000;
      const percent = Math.round((spent / (limit || 1)) * 100);
      const remaining = limit - spent;
      const isOver = spent > limit;

      let status: 'safe' | 'warning' | 'exceeded' = 'safe';
      let statusLabel = 'On Track';

      if (percent >= 100) {
        status = 'exceeded';
        statusLabel = 'Over Limit';
      } else if (percent >= 80) {
        status = 'warning';
        statusLabel = 'Near Limit';
      } else {
        status = 'safe';
        statusLabel = 'Safe Pace';
      }

      const meta = CATEGORY_META[catKey] || { emoji: '📦', color: '#8B5CF6' };

      return {
        category: catKey as ProductCategory,
        name: catKey,
        emoji: meta.emoji,
        spent,
        limit,
        percent,
        remaining,
        isOver,
        status,
        statusLabel,
        themeColor: meta.color,
      };
    });

    // Sort by spending descending and take Top 3
    return list.sort((a, b) => b.spent - a.spent).slice(0, 3);
  }, [purchases, budgets]);

  // Overall combined totals for the top 3
  const overallSummary = useMemo(() => {
    const totalSpent = topCategories.reduce((acc, c) => acc + c.spent, 0);
    const totalLimit = topCategories.reduce((acc, c) => acc + c.limit, 0);
    const percent = Math.round((totalSpent / (totalLimit || 1)) * 100);
    const overLimitCount = topCategories.filter((c) => c.isOver).length;
    return { totalSpent, totalLimit, percent, overLimitCount };
  }, [topCategories]);

  // Quick limit edit handlers
  const handleStartEdit = (cat: ProductCategory, currentLimit: number) => {
    setEditingCategory(cat);
    setEditLimitValue(String(currentLimit));
  };

  const handleSaveEdit = () => {
    if (!editingCategory) return;
    const num = parseFloat(editLimitValue);
    if (!isNaN(num) && num > 0 && onUpdateBudget) {
      onUpdateBudget(editingCategory, num);
    }
    setEditingCategory(null);
  };

  return (
    <section className="bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full min-w-0 transition-all">
      {/* 1. Header Section */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60 flex items-center justify-center shrink-0 shadow-2xs">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-[#4C267B] dark:text-white truncate">
                Budget Progress
              </h2>
              <p className="text-[11px] text-[#625B72] dark:text-slate-400 font-medium truncate">
                Top 3 spending categories vs monthly limits
              </p>
            </div>
          </div>

          {/* Controls: View Switcher & Budgets Link */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Switcher: Gauge vs Bar */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-[#F3EEFF] dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleToggleViewMode('gauge')}
                aria-label="Gauge View"
                className={`p-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'gauge'
                    ? 'bg-white dark:bg-purple-900 text-[#7C3AED] dark:text-purple-200 shadow-2xs'
                    : 'text-[#625B72] dark:text-slate-400 hover:text-[#4C267B]'
                }`}
                title="Circular Gauge View"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">Gauges</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleViewMode('bar')}
                aria-label="Progress Bar View"
                className={`p-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'bar'
                    ? 'bg-white dark:bg-purple-900 text-[#7C3AED] dark:text-purple-200 shadow-2xs'
                    : 'text-[#625B72] dark:text-slate-400 hover:text-[#4C267B]'
                }`}
                title="Linear Progress Bar View"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">Bars</span>
              </button>
            </div>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('budgets')}
                aria-label="Manage all budgets"
                className="group inline-flex items-center gap-1 text-xs font-bold text-[#7C3AED] dark:text-purple-400 hover:text-[#4C267B] dark:hover:text-purple-300 transition-colors cursor-pointer pl-1"
              >
                <span className="hidden md:inline">Budgets</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Top 3 Categories Representation */}
        {viewMode === 'gauge' ? (
          /* GAUGE VIEW: 3 Arc Speedometer Dials */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 min-w-0">
            {topCategories.map((item, idx) => {
              const clampedPercent = Math.min(Math.max(item.percent, 0), 100);
              // Semi-circle Arc Math
              // Radius 36, circumference of 180° = Math.PI * 36 ≈ 113.1
              const arcRadius = 36;
              const arcCircumference = Math.PI * arcRadius;
              const arcOffset = arcCircumference * (1 - clampedPercent / 100);

              // Needle coordinates at angle (180 - percent * 1.8 degrees)
              const angleDeg = 180 - (clampedPercent * 180) / 100;
              const angleRad = (angleDeg * Math.PI) / 180;
              const needleX = 50 + arcRadius * Math.cos(angleRad);
              const needleY = 48 - arcRadius * Math.sin(angleRad);

              // Status colors
              let strokeGradientId = `budgetGaugeGrad-${idx}`;
              let strokeColorStart = '#8B5CF6';
              let strokeColorEnd = '#06B6D4';
              let badgeBg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
              let percentTextClass = 'text-emerald-600 dark:text-emerald-400';

              if (item.status === 'exceeded') {
                strokeColorStart = '#F43F5E';
                strokeColorEnd = '#E11D48';
                badgeBg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
                percentTextClass = 'text-rose-600 dark:text-rose-400';
              } else if (item.status === 'warning') {
                strokeColorStart = '#F59E0B';
                strokeColorEnd = '#EA580C';
                badgeBg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
                percentTextClass = 'text-amber-600 dark:text-amber-400';
              }

              return (
                <div
                  key={item.category}
                  className="p-3 rounded-xl bg-[#F8F5FD] dark:bg-slate-800/40 border border-[#E5DDF2] dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between items-center text-center group min-w-0 shadow-2xs relative"
                >
                  {/* Category Title & Rank */}
                  <div className="w-full flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-[#625B72] dark:text-slate-400 uppercase tracking-wider">
                      Rank #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item.category, item.limit)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-[#7C3AED] dark:hover:text-purple-300"
                      title="Adjust limit"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1 truncate max-w-full">
                    <span className="text-base shrink-0">{item.emoji}</span>
                    <h3 className="text-xs font-bold text-[#1E1B2E] dark:text-white truncate">
                      {item.name}
                    </h3>
                  </div>

                  {/* SVG Semi-Circle Arc Gauge */}
                  <div className="relative w-28 h-18 sm:w-32 sm:h-20 flex items-center justify-center my-0.5">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 58">
                      <defs>
                        <linearGradient id={strokeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={strokeColorStart} />
                          <stop offset="100%" stopColor={strokeColorEnd} />
                        </linearGradient>
                      </defs>

                      {/* Background Inactive Arc (180 degrees) */}
                      <path
                        d="M 14 48 A 36 36 0 0 1 86 48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeLinecap="round"
                        className="text-[#E5DDF2] dark:text-slate-700/70"
                      />

                      {/* Warning threshold tick at 80% */}
                      <circle
                        cx={50 + 36 * Math.cos(((180 - 144) * Math.PI) / 180)}
                        cy={48 - 36 * Math.sin(((180 - 144) * Math.PI) / 180)}
                        r="1.5"
                        fill="#F59E0B"
                        opacity="0.8"
                      />

                      {/* Active Gauge Arc */}
                      <path
                        d="M 14 48 A 36 36 0 0 1 86 48"
                        fill="none"
                        stroke={`url(#${strokeGradientId})`}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={arcCircumference}
                        strokeDashoffset={arcOffset}
                        className="transition-all duration-700 ease-out"
                      />

                      {/* Needle Indicator Dot */}
                      <circle
                        cx={needleX}
                        cy={needleY}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke={strokeColorEnd}
                        strokeWidth="2"
                        className="transition-all duration-700 shadow-sm"
                      />
                    </svg>

                    {/* Gauge Center Metric */}
                    <div className="absolute inset-x-0 bottom-0 text-center flex flex-col items-center">
                      <span className={`text-base font-extrabold font-mono tracking-tight leading-none ${percentTextClass}`}>
                        {item.percent}%
                      </span>
                      <span className="text-[9px] text-[#625B72] dark:text-slate-400 font-medium">
                        consumed
                      </span>
                    </div>
                  </div>

                  {/* Numbers: Spent vs Limit */}
                  <div className="w-full mt-1.5 pt-1.5 border-t border-[#E5DDF2]/80 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-extrabold font-mono text-[#1E1B2E] dark:text-white tabular-nums">
                      {formatPrice(item.spent)}
                    </span>
                    <span className="text-[10px] text-[#625B72] dark:text-slate-400 font-mono">
                      / {formatPrice(item.limit)}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <div className="w-full mt-1 flex items-center justify-between text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded font-bold border ${badgeBg}`}>
                      {item.statusLabel}
                    </span>
                    <span className="text-[#625B72] dark:text-slate-400 font-medium truncate text-right">
                      {item.isOver
                        ? `+${formatPrice(Math.abs(item.remaining))} over`
                        : `${formatPrice(item.remaining)} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* BAR VIEW: Detailed Horizontal Progress Bars */
          <div className="space-y-2.5 my-2 min-w-0">
            {topCategories.map((item, idx) => {
              const clampedPercent = Math.min(Math.max(item.percent, 0), 100);

              let barBg = 'bg-gradient-to-r from-emerald-500 to-teal-500';
              let badgeBg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';

              if (item.status === 'exceeded') {
                barBg = 'bg-gradient-to-r from-rose-500 to-red-600';
                badgeBg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
              } else if (item.status === 'warning') {
                barBg = 'bg-gradient-to-r from-amber-400 to-orange-500';
                badgeBg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
              }

              return (
                <div
                  key={item.category}
                  className="p-3 rounded-xl bg-[#F8F5FD] dark:bg-slate-800/40 border border-[#E5DDF2] dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all min-w-0 shadow-2xs group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{item.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-bold text-[#1E1B2E] dark:text-white truncate">
                            {item.name}
                          </h3>
                          <span className="text-[10px] text-[#625B72] dark:text-slate-400 font-semibold">
                            (Rank #{idx + 1})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeBg}`}>
                        {item.statusLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item.category, item.limit)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-[#7C3AED] dark:hover:text-purple-300 cursor-pointer"
                        title="Adjust limit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar with Target Notch */}
                  <div className="relative w-full h-3 rounded-full bg-[#E5DDF2] dark:bg-slate-700 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barBg}`}
                      style={{ width: `${clampedPercent}%` }}
                    />
                  </div>

                  {/* Amount Breakdown */}
                  <div className="flex items-center justify-between text-xs mt-1.5">
                    <div className="flex items-center gap-1 font-mono font-bold">
                      <span className="text-[#1E1B2E] dark:text-white">
                        {formatPrice(item.spent)}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        / {formatPrice(item.limit)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-bold font-mono text-[#7C3AED] dark:text-purple-300">
                        {item.percent}%
                      </span>
                      <span className="text-[#625B72] dark:text-slate-400">
                        {item.isOver
                          ? `Exceeded by ${formatPrice(Math.abs(item.remaining))}`
                          : `${formatPrice(item.remaining)} remaining`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Footer Summary */}
      <div className="pt-2.5 mt-2 border-t border-[#E5DDF2] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#625B72] dark:text-slate-400 min-w-0">
        <div className="flex items-center gap-1.5 truncate">
          {overallSummary.overLimitCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{overallSummary.overLimitCount} category over budget</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All top categories within bounds</span>
            </span>
          )}
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">
            Combined spend: <strong className="text-[#4C267B] dark:text-slate-200 font-mono">{formatPrice(overallSummary.totalSpent)}</strong> of {formatPrice(overallSummary.totalLimit)}
          </span>
        </div>

        {onNavigateTab ? (
          <button
            onClick={() => onNavigateTab('budgets')}
            className="font-bold text-[#7C3AED] dark:text-purple-400 hover:underline cursor-pointer shrink-0 self-end sm:self-auto"
          >
            Adjust Limits & Targets →
          </button>
        ) : (
          <span className="font-semibold text-[#7C3AED] dark:text-purple-400">
            {overallSummary.percent}% overall
          </span>
        )}
      </div>

      {/* 4. Quick Edit Limit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DDF2] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">{CATEGORY_META[editingCategory]?.emoji || '📦'}</span>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B2E] dark:text-white">
                    Adjust {editingCategory} Limit
                  </h3>
                  <p className="text-[10px] text-[#625B72] dark:text-slate-400">
                    Set your monthly maximum ceiling
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-[#29243A] dark:text-slate-300 block mb-1">
                Monthly Spending Limit
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={editLimitValue}
                  onChange={(e) => setEditLimitValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F8F5FD] dark:bg-slate-900 text-[#1E1B2E] dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                  placeholder="e.g. 5000"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-3 py-1.5 rounded-xl border border-[#E5DDF2] dark:border-slate-800 text-xs font-semibold text-[#625B72] dark:text-slate-400 hover:bg-[#F3EEFF] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Limit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
