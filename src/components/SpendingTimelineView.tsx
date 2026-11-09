import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Flame, 
  Filter, 
  ShoppingBag, 
  ChevronRight, 
  RotateCcw, 
  Store, 
  Layers, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory, PurchaseItem } from '../types';

interface SpendingTimelineViewProps {
  purchases: PurchaseTransaction[];
  onSelectProduct?: (item: PurchaseItem) => void;
  onNavigateTab?: (tab: any) => void;
}

export type TimelineGranularity = 'daily' | 'weekly' | 'monthly';

export const SpendingTimelineView: React.FC<SpendingTimelineViewProps> = ({
  purchases,
  onSelectProduct,
  onNavigateTab,
}) => {
  const { formatPrice, currency } = useApp();

  const [granularity, setGranularity] = useState<TimelineGranularity>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStore, setSelectedStore] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Delivered non-private purchases
  const validPurchases = useMemo(() => {
    return purchases.filter((p) => !p.isPrivate && !p.isRefunded && p.orderStatus !== 'Cancelled');
  }, [purchases]);

  // Extract unique stores and categories for filtering
  const availableStores = useMemo(() => {
    return Array.from(new Set(validPurchases.map((p) => p.store))).sort();
  }, [validPurchases]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    validPurchases.forEach((p) => p.items.forEach((it) => cats.add(it.category)));
    return Array.from(cats).sort();
  }, [validPurchases]);

  // Filter purchases according to selected category and store
  const filteredPurchases = useMemo(() => {
    return validPurchases.filter((p) => {
      if (selectedStore !== 'ALL' && p.store !== selectedStore) return false;
      if (selectedCategory !== 'ALL') {
        const hasCategory = p.items.some((it) => it.category === selectedCategory);
        if (!hasCategory) return false;
      }
      return true;
    });
  }, [validPurchases, selectedStore, selectedCategory]);

  // Group into timeline entries based on granularity
  const timelineEntries = useMemo(() => {
    if (granularity === 'daily') {
      // Group by exact date (e.g. 2026-09-20 to 2026-10-31)
      const dateMap: Record<string, { total: number; transactions: PurchaseTransaction[] }> = {};
      filteredPurchases.forEach((p) => {
        const d = p.date || '2026-10-01';
        if (!dateMap[d]) dateMap[d] = { total: 0, transactions: [] };
        dateMap[d].total += p.totalAmount;
        dateMap[d].transactions.push(p);
      });

      const sorted = Object.entries(dateMap)
        .map(([date, data]) => ({
          key: date,
          label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          subLabel: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          total: data.total,
          transactions: data.transactions,
        }))
        .sort((a, b) => a.key.localeCompare(b.key));

      return sorted;
    }

    if (granularity === 'weekly') {
      // Group into 7-day buckets
      const weekMap: Record<string, { total: number; transactions: PurchaseTransaction[]; label: string }> = {};
      filteredPurchases.forEach((p) => {
        const d = new Date(p.date || '2026-10-01');
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay()); // Sunday
        const weekKey = startOfWeek.toISOString().slice(0, 10);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const label = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        if (!weekMap[weekKey]) weekMap[weekKey] = { total: 0, transactions: [], label };
        weekMap[weekKey].total += p.totalAmount;
        weekMap[weekKey].transactions.push(p);
      });

      return Object.entries(weekMap)
        .map(([key, data]) => ({
          key,
          label: data.label,
          subLabel: 'Week',
          total: data.total,
          transactions: data.transactions,
        }))
        .sort((a, b) => a.key.localeCompare(b.key));
    }

    // Monthly
    const monthMap: Record<string, { total: number; transactions: PurchaseTransaction[]; label: string }> = {};
    filteredPurchases.forEach((p) => {
      const monthKey = (p.date || '2026-10-01').slice(0, 7); // YYYY-MM
      const label = new Date(`${monthKey}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!monthMap[monthKey]) monthMap[monthKey] = { total: 0, transactions: [], label };
      monthMap[monthKey].total += p.totalAmount;
      monthMap[monthKey].transactions.push(p);
    });

    return Object.entries(monthMap)
      .map(([key, data]) => ({
        key,
        label: data.label,
        subLabel: 'Month',
        total: data.total,
        transactions: data.transactions,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredPurchases, granularity]);

  // Identify maximum and peak spending threshold (> 1.4x of average)
  const maxTotal = useMemo(() => Math.max(...timelineEntries.map((e) => e.total), 1), [timelineEntries]);
  const avgTotal = useMemo(() => {
    if (timelineEntries.length === 0) return 1;
    return timelineEntries.reduce((sum, e) => sum + e.total, 0) / timelineEntries.length;
  }, [timelineEntries]);

  // Selected date's transactions
  const activeDetailEntry = useMemo(() => {
    if (selectedDate) {
      return timelineEntries.find((e) => e.key === selectedDate);
    }
    // Default to the highest spending peak day
    return timelineEntries.slice().sort((a, b) => b.total - a.total)[0] || null;
  }, [timelineEntries, selectedDate]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12 select-none">
      {/* 1. Header with Granularity Switcher */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-100 via-indigo-50 to-pink-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED] dark:text-purple-300 flex items-center gap-1.5 mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            Spending Velocity & Trajectory
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#29243A] dark:text-white tracking-tight">
            Spending Timeline & Patterns
          </h2>
          <p className="text-xs text-[#625B72] dark:text-slate-400 mt-1 max-w-xl">
            Visualize your shopping rhythm over time. High-spending peak days are highlighted to reveal purchase clusters. Click any date or bar to inspect verified orders.
          </p>
        </div>

        {/* Daily, Weekly, Monthly Granularity Buttons */}
        <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 shadow-2xs self-start md:self-auto">
          {(['daily', 'weekly', 'monthly'] as TimelineGranularity[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setGranularity(mode);
                setSelectedDate(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                granularity === mode
                  ? 'bg-[#8B5CF6] text-white shadow-xs'
                  : 'text-[#625B72] dark:text-slate-300 hover:text-[#4C267B] dark:hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Filter Bar: Category & Store dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Store Filter */}
          <div className="flex items-center gap-1.5 text-xs bg-[#FFF9F2] dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 rounded-xl px-2.5 py-1 text-[#29243A] dark:text-white">
            <Store className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="font-semibold text-[11px] text-[#625B72] dark:text-slate-400">Store:</span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stores ({availableStores.length})</option>
              {availableStores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs bg-[#FFF9F2] dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 rounded-xl px-2.5 py-1 text-[#29243A] dark:text-white">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-[11px] text-[#625B72] dark:text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories ({availableCategories.length})</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {(selectedStore !== 'ALL' || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedStore('ALL');
                setSelectedCategory('ALL');
              }}
              className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-[#625B72] dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
            <span>Regular Spend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
            <span>Peak Spending Day (&gt;1.4x Avg)</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Visual Spending Timeline Chart */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#29243A] dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
            <span>Spending Velocity Chart</span>
          </h3>
          <span className="text-xs text-[#625B72] dark:text-slate-400 font-medium">
            Click any column to view orders
          </span>
        </div>

        {timelineEntries.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#625B72] dark:text-slate-400">
            No spending entries found for the selected store or category filter.
          </div>
        ) : (
          <div className="relative pt-6 pb-2 overflow-x-auto scrollbar-thin">
            <div className="flex items-end gap-2.5 sm:gap-4 min-w-[580px] h-52 px-2 border-b border-[#E5DDF2] dark:border-slate-800">
              {timelineEntries.map((entry) => {
                const heightPercent = Math.max(Math.round((entry.total / maxTotal) * 100), 8);
                const isPeak = entry.total > avgTotal * 1.4 && entry.total > 1500;
                const isSelected = activeDetailEntry?.key === entry.key;

                return (
                  <div
                    key={entry.key}
                    onClick={() => setSelectedDate(entry.key)}
                    className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group min-w-[36px]"
                  >
                    {/* Peak Flame Marker */}
                    {isPeak && (
                      <div className="mb-1 text-[#EA580C] dark:text-amber-400 animate-bounce">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                      </div>
                    )}

                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold font-mono text-[#29243A] dark:text-white mb-1 whitespace-nowrap tabular-nums">
                      {formatPrice(entry.total)}
                    </div>

                    {/* Column Bar */}
                    <div className="w-full max-w-[28px] h-full flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          isSelected
                            ? 'ring-2 ring-purple-600 dark:ring-purple-400 shadow-md scale-105'
                            : ''
                        } ${
                          isPeak
                            ? 'bg-gradient-to-t from-[#F97316] to-[#FB923C]'
                            : 'bg-gradient-to-t from-[#8B5CF6] to-[#C084FC]'
                        }`}
                      />
                    </div>

                    {/* Date label */}
                    <div className="mt-2 text-center">
                      <span className={`block text-[11px] font-bold truncate ${
                        isSelected 
                          ? 'text-[#7C3AED] dark:text-purple-300 font-extrabold' 
                          : 'text-[#29243A] dark:text-slate-300'
                      }`}>
                        {entry.label}
                      </span>
                      <span className="block text-[9px] text-[#625B72] dark:text-slate-500 font-semibold">
                        {entry.subLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Date Inspector Ledger: Purchases on the Selected Date */}
      {activeDetailEntry && (
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DDF2] dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#625B72] dark:text-slate-400">
                Purchases on Selected Date
              </span>
              <h3 className="text-base font-extrabold text-[#29243A] dark:text-white flex items-center gap-2">
                <span>{activeDetailEntry.label}</span>
                {activeDetailEntry.total > avgTotal * 1.4 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />
                    High Spending Peak
                  </span>
                )}
              </h3>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#625B72] dark:text-slate-400 font-medium block">
                Total Orders Amount:
              </span>
              <span className="text-lg font-extrabold font-mono text-[#7C3AED] dark:text-purple-400 tabular-nums">
                {formatPrice(activeDetailEntry.total)}
              </span>
            </div>
          </div>

          {/* Orders List */}
          <div className="divide-y divide-[#E5DDF2] dark:divide-slate-800">
            {activeDetailEntry.transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#29243A] dark:text-white">
                        {tx.store}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{tx.orderNumber}
                      </span>
                    </div>
                    <div className="text-xs text-[#625B72] dark:text-slate-400">
                      {tx.items.map((i) => i.name).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-[#29243A] dark:text-white tabular-nums">
                      {formatPrice(tx.totalAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {tx.paymentMethod}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectProduct && tx.items[0]) {
                        onSelectProduct(tx.items[0]);
                      }
                    }}
                    className="p-1.5 rounded-lg text-[#7C3AED] hover:bg-[#F3EEFF] dark:hover:bg-slate-800 cursor-pointer"
                    title="View order details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
