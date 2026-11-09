import React, { useState, useMemo } from 'react';
import { 
  PiggyBank, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  SlidersHorizontal, 
  CheckCircle2, 
  Percent, 
  Zap, 
  Target, 
  Tag, 
  Info,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, PriceDropItem } from '../types';

interface SavingsProgressBarProps {
  purchases: PurchaseTransaction[];
  monthlyBudget: number;
  onNavigateTab: (tab: any) => void;
  priceDrops?: PriceDropItem[];
}

export const SavingsProgressBar: React.FC<SavingsProgressBarProps> = ({
  purchases,
  monthlyBudget: initialMonthlyBudget,
  onNavigateTab,
  priceDrops = [],
}) => {
  const { formatPrice } = useApp();

  // Active savings scope view
  const [savingsScope, setSavingsScope] = useState<'all' | 'preserved' | 'discounts'>('all');
  
  // Custom budget override for simulation/adjustment
  const [customBudget, setCustomBudget] = useState<number>(initialMonthlyBudget);
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [simulatedSavingsBoost, setSimulatedSavingsBoost] = useState<number>(0);

  // Delivered verified purchases
  const delivered = useMemo(() => {
    return purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  }, [purchases]);

  // Total spent this month
  const totalSpentMonth = useMemo(() => {
    return delivered.reduce((sum, p) => sum + p.totalAmount, 0);
  }, [delivered]);

  // Actual discounts captured on checkout transactions
  const totalDiscountsRedeemed = useMemo(() => {
    return delivered.reduce((sum, p) => {
      // Sum explicit discounts plus originalPrice - price differences on items
      const itemMarkdowns = p.items.reduce((itemSum, item) => {
        if (item.originalPrice && item.originalPrice > item.price) {
          return itemSum + (item.originalPrice - item.price) * item.quantity;
        }
        return itemSum;
      }, 0);
      return sum + (p.discount || 0) + itemMarkdowns;
    }, 0);
  }, [delivered]);

  // Price drop savings potential/realized
  const priceDropSavings = useMemo(() => {
    return priceDrops.reduce((acc, pd) => acc + (pd.priceDifference || 0), 0);
  }, [priceDrops]);

  // Preserved budget (unspent budget headroom from the set budget limit)
  const effectiveBudget = customBudget > 0 ? customBudget : 15000;
  const preservedBudget = Math.max(0, effectiveBudget - totalSpentMonth);

  // Combined savings calculation
  const calculatedSavings = useMemo(() => {
    let base = 0;
    if (savingsScope === 'all') {
      base = preservedBudget + totalDiscountsRedeemed + Math.round(priceDropSavings * 0.4);
    } else if (savingsScope === 'preserved') {
      base = preservedBudget;
    } else {
      base = totalDiscountsRedeemed;
    }
    return base + simulatedSavingsBoost;
  }, [savingsScope, preservedBudget, totalDiscountsRedeemed, priceDropSavings, simulatedSavingsBoost]);

  // Savings progress percentage against the set budget limit
  const savingsPercentage = useMemo(() => {
    if (effectiveBudget <= 0) return 0;
    return Math.min(100, Math.max(0, (calculatedSavings / effectiveBudget) * 100));
  }, [calculatedSavings, effectiveBudget]);

  // Pacing status & day-in-month calculation (Day 21 of 30)
  const currentDayOfMonth = 21;
  const totalDaysInMonth = 30;
  const monthElapsedPercentage = Math.round((currentDayOfMonth / totalDaysInMonth) * 100); // 70%

  // Status diagnosis
  const isAheadOfPacing = savingsPercentage >= 35;

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 relative overflow-hidden transition-all">
      {/* Decorative ambient background blur */}
      <div 
        className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Smart Budget & Savings Engine</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Pacing</span>
          </div>

          <div className="flex items-center gap-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Monthly Savings Progress Bar
            </h3>
            <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
              {savingsPercentage.toFixed(1)}% of Budget Saved
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Measures your accumulated monthly savings—combining retained budget headroom and verified checkout markdowns—against your set monthly budget ceiling.
          </p>
        </div>

        {/* Scope Switcher Controls */}
        <div className="flex items-center gap-1.5 flex-wrap self-start lg:self-auto">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setSavingsScope('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                savingsScope === 'all'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Savings
            </button>
            <button
              onClick={() => setSavingsScope('preserved')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                savingsScope === 'preserved'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Retained Headroom
            </button>
            <button
              onClick={() => setSavingsScope('discounts')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                savingsScope === 'discounts'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Checkout Discounts
            </button>
          </div>

          <button
            onClick={() => setIsEditingBudget(!isEditingBudget)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:border-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Adjust set budget limit"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
            <span>{isEditingBudget ? 'Close' : 'Adjust Limit'}</span>
          </button>
        </div>
      </div>

      {/* Optional Interactive Budget Limit Adjuster Drawer */}
      {isEditingBudget && (
        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50 space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Customize Set Budget Limit:</span>
              <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                Simulate how adjusting your monthly ceiling alters your savings ratio.
              </span>
            </div>
            <span className="font-mono font-extrabold text-sm text-purple-600 dark:text-purple-400">
              {formatPrice(effectiveBudget)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={8000}
              max={35000}
              step={500}
              value={effectiveBudget}
              onChange={(e) => setCustomBudget(Number(e.target.value))}
              className="flex-1 accent-purple-600 cursor-pointer h-2 bg-purple-200 dark:bg-purple-900 rounded-lg"
            />
            <div className="flex items-center gap-1.5">
              {[12000, 15000, 20000, 25000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCustomBudget(preset)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    effectiveBudget === preset
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-purple-200 dark:border-purple-800'
                  }`}
                >
                  {formatPrice(preset)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Metric 1: Total Saved this month */}
        <div className="p-4 rounded-2xl pastel-card-mint border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span>Total Saved This Month</span>
            <PiggyBank className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
              {formatPrice(calculatedSavings)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>{savingsPercentage.toFixed(1)}% of your set budget limit</span>
          </div>
        </div>

        {/* Metric 2: Set Budget Limit */}
        <div className="p-4 rounded-2xl pastel-card-purple border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-800 dark:text-purple-300">
            <span>Set Budget Limit</span>
            <Target className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight tabular-nums">
              {formatPrice(effectiveBudget)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between font-mono">
            <span>Month Elapsed:</span>
            <span className="font-bold text-purple-700 dark:text-purple-300">Day {currentDayOfMonth} of {totalDaysInMonth}</span>
          </div>
        </div>

        {/* Metric 3: Preserved Headroom */}
        <div className="p-4 rounded-2xl pastel-card-blue border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-800 dark:text-blue-300">
            <span>Budget Retained / Unspent</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400 tracking-tight tabular-nums">
              {formatPrice(preservedBudget)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            Headroom buffer before cap
          </div>
        </div>

        {/* Metric 4: Verified Discounts & Markdowns */}
        <div className="p-4 rounded-2xl pastel-card-yellow border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span>Direct Discounts Secured</span>
            <Tag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight tabular-nums">
              {formatPrice(totalDiscountsRedeemed)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            Coupons & promotional cuts
          </div>
        </div>
      </div>

      {/* Main Visual Progress Bar Section */}
      <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
        {/* Progress Bar Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
              <span>Savings Acceleration Runway</span>
            </span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-600 dark:text-slate-400 font-mono">
              Saved <strong className="text-emerald-600 dark:text-emerald-400">{formatPrice(calculatedSavings)}</strong> out of <strong className="text-purple-600 dark:text-purple-400">{formatPrice(effectiveBudget)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-500">Remaining to 100% parity:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatPrice(Math.max(0, effectiveBudget - calculatedSavings))}
            </span>
          </div>
        </div>

        {/* The Animated Gradient Progress Bar */}
        <div className="relative pt-6 pb-2">
          {/* Floating Pill Marker on Top of Current Progress */}
          <div 
            className="absolute top-0 transition-all duration-1000 ease-out z-20 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${Math.max(6, Math.min(94, savingsPercentage))}%` }}
          >
            <div className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-mono font-bold shadow-md flex items-center gap-1 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{formatPrice(calculatedSavings)} Saved ({savingsPercentage.toFixed(0)}%)</span>
            </div>
            <div className="w-1.5 h-1.5 bg-slate-900 dark:bg-white rotate-45 -mt-0.5" />
          </div>

          {/* Progress Track Container */}
          <div className="w-full h-8 sm:h-9 rounded-2xl bg-slate-200/80 dark:bg-slate-800 p-1 relative border border-slate-300/60 dark:border-slate-700/60 shadow-inner overflow-hidden">
            {/* Background Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-15 dark:opacity-20 pointer-events-none" 
              style={{
                backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '10% 100%'
              }}
            />

            {/* Current Day Pacing Milestone (Vertical Line Marker) */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-purple-500/60 dark:bg-purple-400/60 z-10 pointer-events-none border-r border-dashed border-purple-600 dark:border-purple-300"
              style={{ left: `${monthElapsedPercentage}%` }}
              title={`Month Pace: Day ${currentDayOfMonth} (${monthElapsedPercentage}% elapsed)`}
            />

            {/* The Animated Gradient Fill Bar */}
            <div
              className="h-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 via-cyan-400 to-indigo-500 animate-gradient-flow-smooth relative shadow-sm transition-all duration-1000 ease-out overflow-hidden"
              style={{
                width: `${Math.max(4, savingsPercentage)}%`,
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.45)',
              }}
            >
              {/* Shimmer Sweep Animation Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep pointer-events-none rounded-xl" />

              {/* Sub-label inside bar if width allows */}
              {savingsPercentage > 20 && (
                <div className="absolute inset-0 flex items-center justify-end pr-3 pointer-events-none text-white font-mono font-bold text-[10px] drop-shadow-xs">
                  {savingsPercentage.toFixed(1)}%
                </div>
              )}
            </div>
          </div>

          {/* Milestone Markers below progress track */}
          <div className="mt-2.5 flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-400 px-1">
            <div className="flex flex-col items-start">
              <span className="font-bold text-slate-700 dark:text-slate-300">0%</span>
              <span className="text-[9px] text-slate-400">Baseline</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">25%</span>
              <span className="text-[9px] text-slate-400">{formatPrice(effectiveBudget * 0.25)}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">50%</span>
              <span className="text-[9px] text-slate-400">Halfway ({formatPrice(effectiveBudget * 0.5)})</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">75%</span>
              <span className="text-[9px] text-slate-400">Super Saver ({formatPrice(effectiveBudget * 0.75)})</span>
            </div>

            <div className="flex flex-col items-end">
              <span className="font-bold text-purple-600 dark:text-purple-400">100% Target</span>
              <span className="text-[9px] font-bold text-slate-900 dark:text-white">{formatPrice(effectiveBudget)}</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Pacing & Savings Health Banner */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                {isAheadOfPacing ? '🌟 Outstanding Savings Cadence' : '⚡ Steady Savings Progress'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                You have secured <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatPrice(calculatedSavings)}</strong> across your online orders and budget headroom.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('save_more')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Boost Savings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Three Pillars Savings Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Pillar 1: Preserved Headroom */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Preserved Budget Headroom
            </span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(preservedBudget)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Funds unspent from your {formatPrice(effectiveBudget)} monthly allocation. Remaining safe daily burn: <strong className="font-mono text-slate-700 dark:text-slate-300">{formatPrice(Math.round(preservedBudget / (totalDaysInMonth - currentDayOfMonth + 1)))}/day</strong>.
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${Math.min(100, (preservedBudget / effectiveBudget) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Pillar 2: Store Markdowns */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-500" />
              Retail Promo & Coupons
            </span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {formatPrice(totalDiscountsRedeemed)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Discounts captured on Myntra (₹300 off), Amazon (₹300 coupon), and brand apparel promotional deals across your verified orders.
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full" 
              style={{ width: `${Math.min(100, (totalDiscountsRedeemed / effectiveBudget) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Pillar 3: Alternatives & What-If Simulation */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Smart Choice Opportunity
            </span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
              Up to +{formatPrice(2700)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Switching to suggested similar items on pending checkouts would add +{formatPrice(2700)} more into your monthly savings progress.
          </p>
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                setSimulatedSavingsBoost(prev => (prev > 0 ? 0 : 1500));
              }}
              className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{simulatedSavingsBoost > 0 ? 'Reset Simulated Boost' : 'Simulate +₹1,500 Alternative'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
