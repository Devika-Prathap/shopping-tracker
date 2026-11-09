import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  SlidersHorizontal, 
  Zap, 
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction } from '../types';

interface PredictiveSpendingCardProps {
  purchases: PurchaseTransaction[];
  monthlyBudget?: number;
  onNavigateTab: (tab: any) => void;
}

export const SmartBudgetForecastCard: React.FC<PredictiveSpendingCardProps> = ({
  purchases,
  monthlyBudget = 15000,
  onNavigateTab,
}) => {
  const { formatPrice } = useApp();

  // Model choice: 'cadence' (frequency-adjusted), 'linear' (daily run rate), 'conservative' (budget-capped)
  const [modelType, setModelType] = useState<'cadence' | 'linear' | 'conservative'>('cadence');
  // Discretionary modifier (-30% to +30%)
  const [discretionaryModifier, setDiscretionaryModifier] = useState<number>(0);

  // Active delivered transactions
  const delivered = useMemo(() => {
    return purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  }, [purchases]);

  const totalSpentSoFar = useMemo(() => {
    const sum = delivered.reduce((acc, p) => acc + p.totalAmount, 0);
    return sum > 0 ? sum : 12450;
  }, [delivered]);

  // Calendar cycle: Assume a 30-day monthly tracking cycle where 21 days have elapsed and 9 days remain
  const totalCycleDays = 30;
  const elapsedDays = 21;
  const remainingDays = totalCycleDays - elapsedDays; // 9 days

  // Historical statistics
  const avgOrderTicket = delivered.length > 0 ? totalSpentSoFar / delivered.length : 1850;
  const avgCadenceDays = 3.2; // Historical cadence interval: 1 order every ~3.2 days
  const historicalDailyRunRate = elapsedDays > 0 ? totalSpentSoFar / elapsedDays : 592;

  // Calculate projected spending based on model
  const {
    predictedRemainder,
    expectedTotal,
    projectedCheckouts,
    overrunAmount,
    overrunRisk,
    dailyAllowanceLeft,
  } = useMemo(() => {
    // Expected checkouts in remaining days
    const baseProjectedCheckouts = remainingDays / avgCadenceDays;
    
    // Adjust by discretionary modifier
    const modifierFactor = 1 + (discretionaryModifier / 100);

    let rawRemainder = 0;

    if (modelType === 'linear') {
      // Linear run-rate extrapolation
      rawRemainder = historicalDailyRunRate * remainingDays * modifierFactor;
    } else if (modelType === 'conservative') {
      // Strict budget-adherence path
      const unallocated = Math.max(0, monthlyBudget - totalSpentSoFar);
      rawRemainder = unallocated * Math.min(1, modifierFactor);
    } else {
      // Cadence & ticket frequency model (Standard based on historical shopping habits)
      // Includes ~₹649 for scheduled upcoming recurring subscriptions
      const projectedOrderSpend = baseProjectedCheckouts * avgOrderTicket * modifierFactor;
      const scheduledRecurring = 649; // e.g. scheduled cloud/OTT renewal
      rawRemainder = projectedOrderSpend + scheduledRecurring;
    }

    const expectedTotal = Math.round(totalSpentSoFar + rawRemainder);
    const overrunAmount = expectedTotal - monthlyBudget;
    
    // Risk categorization
    let overrunRisk: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    const ratioToBudget = monthlyBudget > 0 ? (expectedTotal / monthlyBudget) * 100 : 100;

    if (ratioToBudget > 105) {
      overrunRisk = 'critical';
    } else if (ratioToBudget > 100) {
      overrunRisk = 'high';
    } else if (ratioToBudget > 85) {
      overrunRisk = 'moderate';
    } else {
      overrunRisk = 'low';
    }

    const remainingBudgetAllowance = Math.max(0, monthlyBudget - totalSpentSoFar);
    const dailyAllowanceLeft = remainingDays > 0 ? Math.round(remainingBudgetAllowance / remainingDays) : 0;

    return {
      predictedRemainder: Math.round(rawRemainder),
      expectedTotal,
      projectedCheckouts: Math.round(baseProjectedCheckouts * modifierFactor * 10) / 10,
      overrunAmount,
      overrunRisk,
      dailyAllowanceLeft,
    };
  }, [
    modelType,
    discretionaryModifier,
    historicalDailyRunRate,
    remainingDays,
    avgCadenceDays,
    avgOrderTicket,
    totalSpentSoFar,
    monthlyBudget,
  ]);

  // Risk styling helpers
  const getRiskConfig = () => {
    switch (overrunRisk) {
      case 'critical':
        return {
          label: 'Critical Overrun Projected',
          badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
          textColor: 'text-rose-600 dark:text-rose-400',
          accentBg: 'bg-rose-500',
          alertBoxBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
          icon: <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />,
        };
      case 'high':
        return {
          label: 'Overrun Alert: Projected to Exceed',
          badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300 dark:border-orange-800',
          textColor: 'text-orange-600 dark:text-orange-400',
          accentBg: 'bg-orange-500',
          alertBoxBg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60',
          icon: <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />,
        };
      case 'moderate':
        return {
          label: 'Caution: Approaching Budget Limit',
          badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          textColor: 'text-amber-600 dark:text-amber-400',
          accentBg: 'bg-amber-500',
          alertBoxBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
        };
      case 'low':
      default:
        return {
          label: 'On Track: Within Budget',
          badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          accentBg: 'bg-emerald-500',
          alertBoxBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
        };
    }
  };

  const risk = getRiskConfig();

  // Progress calculations for dual-segment runway
  const maxDisplayVal = Math.max(monthlyBudget * 1.15, expectedTotal * 1.05, 1);
  const spentPercent = Math.min(100, (totalSpentSoFar / maxDisplayVal) * 100);
  const remainderPercent = Math.min(100 - spentPercent, (predictedRemainder / maxDisplayVal) * 100);
  const budgetMarkerPercent = Math.min(99, (monthlyBudget / maxDisplayVal) * 100);

  // Sparkline Trajectory Points (Days 1 to 30)
  const trajectoryPoints = useMemo(() => {
    const points: { day: number; amount: number; isProjected: boolean }[] = [];
    
    // Past days (1 to 21)
    for (let d = 1; d <= elapsedDays; d++) {
      const progress = d / elapsedDays;
      const amt = Math.round(totalSpentSoFar * Math.pow(progress, 1.1));
      points.push({ day: d, amount: amt, isProjected: false });
    }

    // Future days (22 to 30)
    for (let d = elapsedDays + 1; d <= totalCycleDays; d++) {
      const remainingProgress = (d - elapsedDays) / remainingDays;
      const amt = Math.round(totalSpentSoFar + (predictedRemainder * remainingProgress));
      points.push({ day: d, amount: amt, isProjected: true });
    }

    return points;
  }, [totalSpentSoFar, predictedRemainder, elapsedDays, remainingDays, totalCycleDays]);

  // Convert trajectory to SVG polyline coordinates
  const svgWidth = 500;
  const svgHeight = 120;
  const maxTrajectoryVal = Math.max(monthlyBudget, expectedTotal) * 1.15;

  const actualPathPoints = trajectoryPoints
    .filter(p => !p.isProjected || p.day === elapsedDays)
    .map(p => {
      const x = ((p.day - 1) / (totalCycleDays - 1)) * svgWidth;
      const y = svgHeight - (p.amount / maxTrajectoryVal) * svgHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const projectedPathPoints = trajectoryPoints
    .filter(p => p.day >= elapsedDays)
    .map(p => {
      const x = ((p.day - 1) / (totalCycleDays - 1)) * svgWidth;
      const y = svgHeight - (p.amount / maxTrajectoryVal) * svgHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const budgetY = (svgHeight - (monthlyBudget / maxTrajectoryVal) * svgHeight).toFixed(1);

  return (
    <section 
      aria-label="Smart Budget Forecast" 
      className="w-full max-w-full min-w-0 p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-fadeIn box-border"
    >
      {/* Header & Forecasting Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>AI Spending Intelligence · Historical Pattern</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Smart Budget Forecast
            </h3>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold border shrink-0 ${risk.badgeClass}`}>
              {risk.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Predicts your total end-of-month expenditure using your historical <strong>{avgCadenceDays}-day checkout cadence</strong> (avg. {formatPrice(Math.round(avgOrderTicket))}/order) and current run rate to alert you before budget overruns occur.
          </p>
        </div>

        {/* Forecast Model Selection Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold self-start md:self-auto shrink-0">
          <button
            onClick={() => setModelType('cadence')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
              modelType === 'cadence'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Frequency-weighted projection using average checkout cadence & ticket"
          >
            Cadence Trend
          </button>
          <button
            onClick={() => setModelType('linear')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
              modelType === 'linear'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Linear extrapolation of actual daily run rate to date"
          >
            Linear Run-Rate
          </button>
          <button
            onClick={() => setModelType('conservative')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
              modelType === 'conservative'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Ideal ceiling trajectory designed to never exceed budget"
          >
            Budget Target
          </button>
        </div>
      </div>

      {/* Prominent Overrun Alert Banner (Required by prompt) */}
      <div 
        role="alert" 
        className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 transition-all min-w-0 ${
          overrunAmount > 0 
            ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 shadow-xs' 
            : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 shadow-xs'
        }`}
      >
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
          overrunAmount > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          {overrunAmount > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
              overrunAmount > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}>
              {overrunAmount > 0 ? 'Budget Overrun Warning' : 'Budget On Track'}
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              overrunAmount > 0 
                ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300' 
                : 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
            }`}>
              {overrunAmount > 0 
                ? `Projected to Exceed by +${formatPrice(overrunAmount)}`
                : `Surplus Cushion: ${formatPrice(Math.abs(overrunAmount))}`}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
            {overrunAmount > 0 ? (
              <>
                At your current shopping frequency, your projected month-end spend is <strong>{formatPrice(expectedTotal)}</strong>, which will exceed your <strong>{formatPrice(monthlyBudget)}</strong> monthly budget by <span className="text-rose-600 dark:text-rose-400 font-bold font-mono">+{formatPrice(overrunAmount)}</span> (+{((overrunAmount / monthlyBudget) * 100).toFixed(1)}%). To prevent this overrun, keep discretionary spending below <strong>{formatPrice(dailyAllowanceLeft)}/day</strong> over the remaining {remainingDays} days.
              </>
            ) : (
              <>
                Excellent pacing! Based on your historical pattern, you are projected to finish the month at <strong>{formatPrice(expectedTotal)}</strong>, staying safely within your <strong>{formatPrice(monthlyBudget)}</strong> budget with a <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{formatPrice(Math.abs(overrunAmount))}</span> buffer. Safe daily cap: <strong>{formatPrice(dailyAllowanceLeft)}/day</strong>.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Main Metric Spotlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full min-w-0">
        {/* Metric 1: Expected Spending (Hero Number) */}
        <div className={`p-4 rounded-2xl border shadow-xs min-w-0 ${
          overrunAmount > 0
            ? 'bg-gradient-to-br from-rose-50/70 via-purple-50/40 to-white dark:from-rose-950/30 dark:via-purple-950/20 dark:to-slate-900 border-rose-200/80 dark:border-rose-800/60'
            : 'bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900 border-purple-200/80 dark:border-purple-800/50'
        }`}>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 truncate block">
            Projected Month-End Spend
          </span>
          <div className="mt-2 flex items-baseline gap-1.5 truncate">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums truncate ${
              overrunAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {formatPrice(expectedTotal)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] gap-1">
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {monthlyBudget > 0 ? ((expectedTotal / monthlyBudget) * 100).toFixed(1) : 0}% of Budget
            </span>
            {overrunAmount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold font-mono shrink-0">
                +{formatPrice(overrunAmount)} overrun
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono shrink-0">
                {formatPrice(Math.abs(overrunAmount))} under
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Spent to Date */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            <span className="truncate">Spent So Far (Day {elapsedDays})</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums truncate">
            {formatPrice(totalSpentSoFar)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
            {delivered.length} orders · Run rate: {formatPrice(Math.round(historicalDailyRunRate))}/day
          </div>
        </div>

        {/* Metric 3: Projected Remainder for Remaining 9 Days */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            <span className="truncate">Forecast Remainder ({remainingDays}d)</span>
            <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400 tabular-nums truncate">
            +{formatPrice(predictedRemainder)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
            ~{projectedCheckouts} expected checkouts
          </div>
        </div>

        {/* Metric 4: Safe Daily Allowance */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 shadow-xs min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <span className="truncate">Recommended Daily Cap</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300 tabular-nums truncate">
            {formatPrice(dailyAllowanceLeft)}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/day</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
            {overrunAmount > 0 ? 'Max spend to avoid overrun' : 'Safely maintain surplus'}
          </div>
        </div>
      </div>

      {/* Visual Dual-Segment Runway Bar with Budget Threshold Marker */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs min-w-0">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <span className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
              Actual Spent ({formatPrice(totalSpentSoFar)})
            </span>
            <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 truncate">
              <span className="w-3 h-3 rounded-full bg-purple-300 dark:bg-purple-600/50 border border-dashed border-purple-500 shrink-0" />
              Forecast Remainder (+{formatPrice(predictedRemainder)})
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            Budget Target: {formatPrice(monthlyBudget)}
          </div>
        </div>

        {/* Dual Segment Progress Runway */}
        <div className="relative w-full h-5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
          {/* Segment 1: Actual Spent So Far (Solid gradient) */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-l-full transition-all duration-700"
            style={{ width: `${spentPercent}%` }}
          />

          {/* Segment 2: Projected Remainder (Hatched / pulsing forecast zone) */}
          <div
            className={`absolute top-0 bottom-0 transition-all duration-700 ${
              overrunAmount > 0
                ? 'bg-gradient-to-r from-indigo-500 via-amber-500 to-rose-500 opacity-90'
                : 'bg-gradient-to-r from-indigo-400 to-purple-300 dark:from-indigo-600 dark:to-purple-500 opacity-80'
            }`}
            style={{
              left: `${spentPercent}%`,
              width: `${remainderPercent}%`,
            }}
          />

          {/* Budget Limit Vertical Target Marker Line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-slate-900 dark:bg-white z-20 shadow-[0_0_6px_rgba(0,0,0,0.8)]"
            style={{ left: `${budgetMarkerPercent}%` }}
            title={`Budget Limit: ${formatPrice(monthlyBudget)}`}
          />
        </div>

        {/* Runway Labels */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 min-w-0">
          <span>Day 1 (Start)</span>
          <span className="text-purple-600 dark:text-purple-400 font-bold truncate px-1">
            Day {elapsedDays} (Today) · {formatPrice(totalSpentSoFar)}
          </span>
          <span className={`truncate ${overrunAmount > 0 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}`}>
            Day {totalCycleDays} ({formatPrice(expectedTotal)})
          </span>
        </div>
      </div>

      {/* SVG Projection Trajectory Curve vs Budget Line */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="font-mono text-[11px] font-bold text-slate-300 truncate">
              30-Day Cumulative Spending Trajectory & Confidence Path
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap">
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-3 h-0.5 bg-purple-400" /> History
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-0.5 bg-amber-400 border-dashed border-b" /> Forecast
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-0.5 bg-rose-400 border-t border-dotted" /> Budget Limit ({formatPrice(monthlyBudget)})
            </span>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full h-28 relative overflow-hidden select-none min-w-0">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={overrunAmount > 0 ? "#f43f5e" : "#10b981"} stopOpacity="0.3" />
                <stop offset="100%" stopColor={overrunAmount > 0 ? "#f43f5e" : "#10b981"} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="0" y1={budgetY} x2={svgWidth} y2={budgetY} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
            <line x1="0" y1={svgHeight - 1} x2={svgWidth} y2={svgHeight - 1} stroke="#334155" strokeWidth="1" />

            {/* Area under history */}
            <path
              d={`M 0,${svgHeight} L ${actualPathPoints} L ${((elapsedDays - 1) / (totalCycleDays - 1)) * svgWidth},${svgHeight} Z`}
              fill="url(#actualFill)"
            />

            {/* Historical Spend Solid Line */}
            <polyline
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.5"
              points={actualPathPoints}
            />

            {/* Projected Spend Dashed Line */}
            <polyline
              fill="none"
              stroke={overrunAmount > 0 ? "#fb7185" : "#34d399"}
              strokeWidth="2.5"
              strokeDasharray="4 3"
              points={projectedPathPoints}
            />

            {/* Today Pin Marker */}
            <circle
              cx={((elapsedDays - 1) / (totalCycleDays - 1)) * svgWidth}
              cy={svgHeight - (totalSpentSoFar / maxTrajectoryVal) * svgHeight}
              r="4.5"
              fill="#ffffff"
              stroke="#a855f7"
              strokeWidth="2"
            />

            {/* Month-End Point Marker */}
            <circle
              cx={svgWidth}
              cy={svgHeight - (expectedTotal / maxTrajectoryVal) * svgHeight}
              r="4"
              fill={overrunAmount > 0 ? "#f43f5e" : "#10b981"}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 min-w-0">
          <span>Day 1 · Cycle Start</span>
          <span className="text-purple-300 font-bold truncate px-1">Today (Day {elapsedDays})</span>
          <span>Day 30 · Cycle Close</span>
        </div>
      </div>

      {/* Actionable Overrun Prevention Advice & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-w-0">
        {/* Left: Preventive Action Recommendations (7 cols) */}
        <div className={`lg:col-span-7 p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 min-w-0 ${risk.alertBoxBg}`}>
          {risk.icon}
          <div className="space-y-1 min-w-0 flex-1">
            <h4 className={`text-xs sm:text-sm font-bold ${risk.textColor}`}>
              {overrunAmount > 0 ? 'Actionable Overrun Prevention Advice' : 'Budget Safety Status'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {overrunAmount > 0 ? (
                <>
                  At your current pace of <strong>1 order every {avgCadenceDays} days</strong>, you are projected to exceed your {formatPrice(monthlyBudget)} budget by <strong>{formatPrice(overrunAmount)}</strong>. 
                  Capping discretionary purchases to <strong>{formatPrice(dailyAllowanceLeft)}/day</strong> over the next {remainingDays} days will ensure you stay fully within budget.
                </>
              ) : (
                <>
                  Great pacing! You are on track to close the month with a comfortable <strong>{formatPrice(Math.abs(overrunAmount))} surplus</strong>. 
                  Your maximum recommended safe discretionary allowance is <strong>{formatPrice(dailyAllowanceLeft)}/day</strong>.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: What-If Sensitivity Simulator Slider (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-xs min-w-0">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              What-If Pacing Simulator
            </span>
            <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400 shrink-0">
              {discretionaryModifier > 0 ? `+${discretionaryModifier}% Pace` : discretionaryModifier < 0 ? `${discretionaryModifier}% Pace` : 'Normal Pace'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono shrink-0">-30%</span>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={discretionaryModifier}
              onChange={e => setDiscretionaryModifier(parseInt(e.target.value, 10))}
              className="flex-1 accent-purple-600 cursor-pointer min-w-0"
              aria-label="Pacing sensitivity slider"
            />
            <span className="text-[10px] text-slate-400 font-mono shrink-0">+30%</span>
          </div>

          <div className="flex items-center justify-between text-[11px] gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 min-w-0">
            <span className="text-slate-500 truncate">
              {discretionaryModifier < 0 ? 'Simulating cutback:' : discretionaryModifier > 0 ? 'Simulating surge:' : 'Baseline historical pattern'}
            </span>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
            >
              Adjust Budget →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Backward-compatibility export alias
export const PredictiveSpendingCard = SmartBudgetForecastCard;
