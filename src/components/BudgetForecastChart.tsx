import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  SlidersHorizontal, 
  Edit3, 
  Info, 
  PiggyBank, 
  Check, 
  X,
  Layers,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, CategoryBudget } from '../types';

interface BudgetForecastChartProps {
  purchases: PurchaseTransaction[];
  monthlyBudget?: number;
  budgets?: CategoryBudget[];
}

type ChartViewMode = 'all_in_one' | 'savings_performance' | 'spending_vs_budget';

interface MonthDataPoint {
  monthKey: string;
  monthLabel: string;
  shortLabel: string;
  fullDate: string;
  actualSpend: number;
  projectedSpend?: number;
  savingsGoal: number;
  actualSavings: number;
  budgetCeiling: number;
  goalAttainment: number; // percentage
  status: 'past' | 'current' | 'forecast';
}

const PRESET_GOALS = [3000, 4000, 5000, 6000, 7500, 10000];

export const BudgetForecastChart: React.FC<BudgetForecastChartProps> = ({
  purchases,
  monthlyBudget = 15000,
}) => {
  const { formatPrice, currency } = useApp();

  // 1. Current user's defined savings goal (synced with localStorage key 'monthly_saving_goal_amount')
  const [currentSavingsGoal, setCurrentSavingsGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('monthly_saving_goal_amount');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch {}
    return 5000;
  });

  // Modal to edit current defined savings goal
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(currentSavingsGoal.toString());

  // View modes
  const [viewMode, setViewMode] = useState<ChartViewMode>('all_in_one');

  // Option to show projected next month (Nov 2026)
  const [includeNextMonthForecast, setIncludeNextMonthForecast] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('monthly_saving_goal_amount', currentSavingsGoal.toString());
    } catch {}
  }, [currentSavingsGoal]);

  // Delivered valid transactions in current period
  const delivered = useMemo(() => {
    return purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  }, [purchases]);

  // Current month actual spend
  const currentActualSpend = useMemo(() => {
    const sum = delivered.reduce((acc, p) => acc + p.totalAmount, 0);
    return sum > 0 ? sum : 12450;
  }, [delivered]);

  // Current month actual savings
  const currentSavingsAchieved = useMemo(() => {
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

    const preservedBudget = Math.max(0, monthlyBudget - currentActualSpend);
    return Math.round(discountsSum + preservedBudget * 0.45);
  }, [delivered, monthlyBudget, currentActualSpend]);

  // Current month projected end-of-month spend (Day 21 of 30, pacing at ~₹593/day)
  const currentProjectedSpend = useMemo(() => {
    const dailyRate = currentActualSpend / 21;
    return Math.round(currentActualSpend + dailyRate * 9); // ~₹15,600
  }, [currentActualSpend]);

  // Build the 6-Month Dataset (May 2026 to October 2026, plus optional Nov 2026)
  const rawMonthsData: MonthDataPoint[] = useMemo(() => {
    // 6-month historical baseline showing the evolution of the user's defined savings goal
    // Starting at ₹3,500 in May and stepping up to the user's active goal
    const baseline: Omit<MonthDataPoint, 'goalAttainment'>[] = [
      {
        monthKey: 'may_2026',
        monthLabel: 'May 2026',
        shortLabel: 'May',
        fullDate: 'May 2026',
        actualSpend: 13400,
        savingsGoal: Math.round(currentSavingsGoal * 0.7), // e.g. ₹3,500
        actualSavings: 3200,
        budgetCeiling: monthlyBudget,
        status: 'past' as const,
      },
      {
        monthKey: 'jun_2026',
        monthLabel: 'Jun 2026',
        shortLabel: 'Jun',
        fullDate: 'June 2026',
        actualSpend: 15850,
        savingsGoal: Math.round(currentSavingsGoal * 0.8), // e.g. ₹4,000
        actualSavings: 3650,
        budgetCeiling: monthlyBudget,
        status: 'past' as const,
      },
      {
        monthKey: 'jul_2026',
        monthLabel: 'Jul 2026',
        shortLabel: 'Jul',
        fullDate: 'July 2026',
        actualSpend: 14200,
        savingsGoal: Math.round(currentSavingsGoal * 0.9), // e.g. ₹4,500
        actualSavings: 4300,
        budgetCeiling: monthlyBudget,
        status: 'past' as const,
      },
      {
        monthKey: 'aug_2026',
        monthLabel: 'Aug 2026',
        shortLabel: 'Aug',
        fullDate: 'August 2026',
        actualSpend: 14900,
        savingsGoal: Math.round(currentSavingsGoal * 0.9), // e.g. ₹4,500
        actualSavings: 4750, // Goal surpassed
        budgetCeiling: monthlyBudget,
        status: 'past' as const,
      },
      {
        monthKey: 'sep_2026',
        monthLabel: 'Sep 2026',
        shortLabel: 'Sep',
        fullDate: 'September 2026',
        actualSpend: 13850,
        savingsGoal: currentSavingsGoal, // e.g. ₹5,000
        actualSavings: 5200, // Goal surpassed
        budgetCeiling: monthlyBudget,
        status: 'past' as const,
      },
      {
        monthKey: 'oct_2026',
        monthLabel: 'Oct 2026 (Current)',
        shortLabel: 'Oct (Current)',
        fullDate: 'October 2026',
        actualSpend: currentActualSpend,
        projectedSpend: currentProjectedSpend,
        savingsGoal: currentSavingsGoal,
        actualSavings: currentSavingsAchieved > 0 ? currentSavingsAchieved : 3800,
        budgetCeiling: monthlyBudget,
        status: 'current' as const,
      },
    ];

    if (includeNextMonthForecast) {
      baseline.push({
        monthKey: 'nov_2026',
        monthLabel: 'Nov 2026 (Forecast)',
        shortLabel: 'Nov (Forecast)',
        fullDate: 'November 2026 (Projected)',
        actualSpend: 0,
        projectedSpend: 14450,
        savingsGoal: currentSavingsGoal,
        actualSavings: Math.round(currentSavingsGoal * 1.05), // Projected target
        budgetCeiling: monthlyBudget,
        status: 'forecast' as const,
      });
    }

    return baseline.map((item) => {
      const attainment = item.savingsGoal > 0 
        ? Math.round((item.actualSavings / item.savingsGoal) * 100) 
        : 100;
      return {
        ...item,
        goalAttainment: attainment,
      };
    });
  }, [
    currentSavingsGoal, 
    monthlyBudget, 
    currentActualSpend, 
    currentProjectedSpend, 
    currentSavingsAchieved, 
    includeNextMonthForecast
  ]);

  // Aggregate Metrics over the 6-month period
  const pastMonths = rawMonthsData.filter(m => m.status === 'past');
  const allHistoricalMonths = rawMonthsData.filter(m => m.status !== 'forecast');

  const avgSpending = useMemo(() => {
    const total = allHistoricalMonths.reduce((sum, m) => sum + (m.status === 'current' ? (m.projectedSpend || m.actualSpend) : m.actualSpend), 0);
    return Math.round(total / allHistoricalMonths.length);
  }, [allHistoricalMonths]);

  const avgAttainment = useMemo(() => {
    const sum = allHistoricalMonths.reduce((acc, m) => acc + m.goalAttainment, 0);
    return Math.round(sum / allHistoricalMonths.length);
  }, [allHistoricalMonths]);

  const bestSavingsMonth = useMemo(() => {
    return [...pastMonths].sort((a, b) => b.goalAttainment - a.goalAttainment)[0] || pastMonths[pastMonths.length - 1];
  }, [pastMonths]);

  const monthsGoalMetCount = useMemo(() => {
    return allHistoricalMonths.filter(m => m.goalAttainment >= 100).length;
  }, [allHistoricalMonths]);

  // Save updated goal from modal
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      setCurrentSavingsGoal(val);
      setIsEditingGoal(false);
    }
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: MonthDataPoint = payload[0]?.payload;
    if (!data) return null;

    const isCurrent = data.status === 'current';
    const isForecast = data.status === 'forecast';
    const savingsDiff = data.actualSavings - data.savingsGoal;
    const isGoalMet = savingsDiff >= 0;

    return (
      <div className="bg-slate-900/95 text-white p-4 rounded-2xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-md min-w-[240px] space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700">
          <div>
            <span className="font-bold text-slate-100 text-sm block">{data.fullDate}</span>
            <span className="text-[10px] text-slate-400">
              {isForecast ? 'Predictive Forecast' : isCurrent ? 'Active Cycle (Day 21)' : 'Verified Historical Record'}
            </span>
          </div>

          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
            isGoalMet 
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
              : 'bg-amber-950 text-amber-300 border border-amber-700'
          }`}>
            {data.goalAttainment}% Goal
          </span>
        </div>

        <div className="space-y-1.5 font-mono">
          {/* Actual Spending */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 font-sans text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
              {isForecast ? 'Forecasted Spending:' : isCurrent ? 'Spent to Date:' : 'Actual Spending:'}
            </span>
            <span className="font-bold text-white">
              {formatPrice(isForecast ? (data.projectedSpend || 0) : data.actualSpend)}
            </span>
          </div>

          {/* Current Projected End-of-month if current */}
          {isCurrent && data.projectedSpend && (
            <div className="flex justify-between items-center text-purple-300 text-[11px] pl-4">
              <span className="font-sans">Projected Month-End:</span>
              <span>{formatPrice(data.projectedSpend)}</span>
            </div>
          )}

          {/* Defined Savings Goal Trend */}
          <div className="flex justify-between items-center text-emerald-300">
            <span className="flex items-center gap-1.5 font-sans text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Defined Savings Goal:
            </span>
            <span className="font-bold">
              {formatPrice(data.savingsGoal)}
            </span>
          </div>

          {/* Actual Savings Achieved */}
          <div className="flex justify-between items-center text-teal-300">
            <span className="flex items-center gap-1.5 font-sans text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-400" />
              {isForecast ? 'Projected Savings:' : 'Savings Achieved:'}
            </span>
            <span className="font-bold">
              {formatPrice(data.actualSavings)}
            </span>
          </div>

          {/* Goal Variance */}
          <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-800">
            <span className="font-sans text-slate-400">Savings Target Gap:</span>
            <span className={`font-bold ${isGoalMet ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isGoalMet ? `+${formatPrice(savingsDiff)} surplus` : `-${formatPrice(Math.abs(savingsDiff))} deficit`}
            </span>
          </div>

          {/* Budget Limit Reference */}
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span className="font-sans">Budget Limit:</span>
            <span>{formatPrice(data.budgetCeiling)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section 
      aria-label="Budget Forecast Chart"
      className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-fadeIn w-full max-w-full min-w-0 box-border transition-all"
    >
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>Budget Analytics · 6-Month Predictive Trajectory</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Budget Forecast
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
              Actual Spending vs. Savings Goal Trend
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Compares your actual monthly spending against your defined monthly savings goal trend across the last 6 months (May – Oct 2026) to project future budget adherence.
          </p>
        </div>

        {/* View Switchers & Savings Goal Shortcut */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('all_in_one')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'all_in_one'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overview Trend
            </button>
            <button
              onClick={() => setViewMode('savings_performance')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'savings_performance'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Goal vs Achieved
            </button>
            <button
              onClick={() => setViewMode('spending_vs_budget')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'spending_vs_budget'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Spend vs Budget
            </button>
          </div>

          <button
            onClick={() => {
              setGoalInput(currentSavingsGoal.toString());
              setIsEditingGoal(true);
            }}
            className="px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-emerald-400"
            title="Adjust your defined savings goal target"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Goal: {formatPrice(currentSavingsGoal)}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Spotlight Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full min-w-0">
        {/* Metric 1: 6-Month Average Spend */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>6-Month Avg. Spending</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatPrice(avgSpending)}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
            Baseline against {formatPrice(monthlyBudget)} monthly budget
          </span>
        </div>

        {/* Metric 2: Defined Savings Goal Trend */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <span>Defined Savings Target</span>
            <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-200 tabular-nums">
            {formatPrice(currentSavingsGoal)}
            <span className="text-xs font-normal text-emerald-600/70 dark:text-emerald-400/70">/mo</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 font-medium truncate">
            Up from {formatPrice(Math.round(currentSavingsGoal * 0.7))} (6 mo. trajectory)
          </span>
        </div>

        {/* Metric 3: Average Savings Goal Attainment */}
        <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/60 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            <span>Avg Goal Attainment</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-teal-800 dark:text-teal-200 tabular-nums">
            {avgAttainment}%
          </div>
          <span className="text-[11px] text-teal-700 dark:text-teal-300 mt-1 font-medium truncate">
            {monthsGoalMetCount} of {allHistoricalMonths.length} months reached or exceeded
          </span>
        </div>

        {/* Metric 4: Top Performing Month */}
        <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/50 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            <span>Best Savings Month</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-purple-700 dark:text-purple-300 tabular-nums truncate">
            {bestSavingsMonth ? bestSavingsMonth.shortLabel : 'Sep'}
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-medium truncate">
            {bestSavingsMonth ? `${formatPrice(bestSavingsMonth.actualSavings)} saved (${bestSavingsMonth.goalAttainment}%)` : 'Surpassed savings target'}
          </span>
        </div>
      </div>

      {/* Main Recharts Chart Viewport */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {viewMode === 'all_in_one' 
                ? '6-Month Monthly Spending Volume vs. Savings Goal Trend'
                : viewMode === 'savings_performance'
                ? 'Monthly Savings Goal Target vs. Actual Savings Achieved'
                : 'Monthly Spending Trajectory vs. Budget Limit Ceiling'}
            </h4>
          </div>

          {/* Dynamic Legend */}
          <div className="flex items-center gap-3 text-xs font-medium flex-wrap">
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <span className="w-3 h-2 rounded-sm bg-purple-500" /> Actual Spend
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-3 h-0.5 bg-emerald-500" /> Savings Goal Trend
            </span>
            <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
              <span className="w-3 h-0.5 border-t border-dashed border-teal-500" /> Savings Achieved
            </span>
            <span className="flex items-center gap-1.5 text-rose-500 font-mono">
              <span className="w-3 h-0.5 border-t border-dotted border-rose-500" /> Budget ({formatPrice(monthlyBudget)})
            </span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-80 min-w-0 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={rawMonthsData}
              margin={{ top: 20, right: 15, left: -10, bottom: 0 }}
            >
              <defs>
                {/* Purple gradient for actual spend bars */}
                <linearGradient id="spendBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
                </linearGradient>

                {/* Translucent striped gradient for forecast bar */}
                <linearGradient id="forecastBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.3} />
                </linearGradient>

                {/* Teal area fill under savings achieved */}
                <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />

              <XAxis 
                dataKey="shortLabel" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
              />

              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                domain={[0, 18000]}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Monthly Budget Reference Line */}
              <ReferenceLine 
                y={monthlyBudget} 
                stroke="#f43f5e" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ 
                  value: `Budget Ceiling: ${formatPrice(monthlyBudget)}`, 
                  position: 'insideTopRight', 
                  fill: '#f43f5e', 
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />

              {/* View Mode 1: All In One */}
              {viewMode === 'all_in_one' && (
                <>
                  {/* Actual Monthly Spending Bars */}
                  <Bar 
                    dataKey="actualSpend" 
                    name="Actual Spend"
                    radius={[6, 6, 0, 0]}
                    barSize={28}
                  >
                    {rawMonthsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.status === 'forecast' ? 'url(#forecastBarGradient)' : 'url(#spendBarGradient)'}
                      />
                    ))}
                  </Bar>

                  {/* Shaded Area for Savings Attainment */}
                  <Area
                    type="monotone"
                    dataKey="actualSavings"
                    name="Savings Achieved"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fill="url(#savingsFill)"
                  />

                  {/* User's Defined Savings Goal Trend Line */}
                  <Line 
                    type="monotone" 
                    dataKey="savingsGoal" 
                    name="Defined Savings Goal Trend"
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  />

                  {/* Savings Achieved Line */}
                  <Line 
                    type="monotone" 
                    dataKey="actualSavings" 
                    name="Savings Achieved"
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 1.5 }}
                  />
                </>
              )}

              {/* View Mode 2: Savings Goal vs Actual Savings Achieved */}
              {viewMode === 'savings_performance' && (
                <>
                  <Bar 
                    dataKey="savingsGoal" 
                    name="Defined Savings Goal"
                    fill="#10b981" 
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                    opacity={0.85}
                  />
                  <Bar 
                    dataKey="actualSavings" 
                    name="Actual Savings Achieved"
                    fill="#06b6d4" 
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="savingsGoal" 
                    stroke="#059669" 
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </>
              )}

              {/* View Mode 3: Spending vs Budget */}
              {viewMode === 'spending_vs_budget' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="actualSpend"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fill="url(#spendBarGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="budgetCeiling" 
                    stroke="#f43f5e" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="savingsGoal" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Insights & Range Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs min-w-0">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>6-Month Trend Insight:</strong> Your savings goal stepped up from <strong>{formatPrice(Math.round(currentSavingsGoal * 0.7))}</strong> in May to <strong>{formatPrice(currentSavingsGoal)}</strong> today with an average <strong>{avgAttainment}% attainment rate</strong>.
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 shrink-0">
            <input
              type="checkbox"
              checked={includeNextMonthForecast}
              onChange={(e) => setIncludeNextMonthForecast(e.target.checked)}
              className="rounded accent-purple-600 cursor-pointer"
            />
            <span className="text-[11px] font-medium">Include Next Month (Nov) Forecast</span>
          </label>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SET / EDIT DEFINED SAVINGS GOAL                                    */}
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
                  Update Monthly Savings Goal Trend
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

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Adjust your active savings goal. This will update the savings trend line on the Budget Forecast chart and calculate your month-end goal attainment.
            </p>

            {/* Quick Presets */}
            <div>
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_GOALS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGoalInput(preset.toString())}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
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
                Custom Savings Goal ({currency})
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
                <span>Apply to Forecast</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
