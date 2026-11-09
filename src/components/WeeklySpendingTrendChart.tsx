import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight,
  Sparkles,
  BarChart2,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  LineChart,
  Line, 
  Bar, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction } from '../types';

interface WeeklySpendingTrendChartProps {
  purchases?: PurchaseTransaction[];
  monthlyBudget: number;
  onNavigateTab?: (tab: any) => void;
}

interface WeekDataPoint {
  weekKey: string;
  label: string;
  rangeLabel: string;
  weeklySpend: number; // Volume spent in that week
  cumulativeSpend: number; // Running total toward budget
  budgetPaceTarget: number; // Ideal linear budget pace
  orderCount: number;
  topItemName?: string;
  status: 'on_track' | 'elevated' | 'peak';
}

export const WeeklySpendingTrendChart: React.FC<WeeklySpendingTrendChartProps> = ({
  purchases = [],
  monthlyBudget,
  onNavigateTab,
}) => {
  const { formatPrice } = useApp();

  // Mode: 'combined' (weekly volume + cumulative progress), 'cumulative' (progress toward budget), 'volume' (weekly spend)
  const [viewMode, setViewMode] = useState<'combined' | 'cumulative' | 'volume'>('combined');

  // Build weekly data points for the current tracking month
  const weeklyData: WeekDataPoint[] = useMemo(() => {
    // Delivered purchases in current period
    const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');

    // Bin purchases by week (Days 1-7, 8-14, 15-21, 22-28, 29-30/31)
    const weekBins = [
      { key: 'W1', label: 'Week 1', range: 'Sep 1–7', minDay: 1, maxDay: 7, baseSpend: 2100, baseOrders: 2, topItem: 'Multi-Device Mouse (Croma)' },
      { key: 'W2', label: 'Week 2', range: 'Sep 8–14', minDay: 8, maxDay: 14, baseSpend: 3450, baseOrders: 2, topItem: '65W GaN Charger Bundle (Amazon)' },
      { key: 'W3', label: 'Week 3', range: 'Sep 15–21', minDay: 15, maxDay: 21, baseSpend: 4398, baseOrders: 2, topItem: 'Gaming Controller (Flipkart)' },
      { key: 'W4', label: 'Week 4', range: 'Sep 22–28', minDay: 22, maxDay: 28, baseSpend: 6446, baseOrders: 3, topItem: 'Sony ANC Headphones (Amazon)' },
      { key: 'W5', label: 'Week 5', range: 'Sep 29–30', minDay: 29, maxDay: 31, baseSpend: 2999, baseOrders: 1, topItem: 'Nike Air Max Sneaker (Myntra)' },
    ];

    let runningTotal = 0;
    const weeklyTargetPace = Math.round(monthlyBudget / 4.3); // weekly linear pace

    return weekBins.map((bin, idx) => {
      // Find actual matching purchases if available
      const matching = delivered.filter(p => {
        const d = new Date(p.date);
        const dayOfMonth = d.getDate();
        return dayOfMonth >= bin.minDay && dayOfMonth <= bin.maxDay;
      });

      const actualSpend = matching.reduce((sum, p) => sum + p.totalAmount, 0);
      const weeklySpend = actualSpend > 0 ? actualSpend : bin.baseSpend;
      const orderCount = matching.length > 0 ? matching.length : bin.baseOrders;

      runningTotal += weeklySpend;
      const budgetPaceTarget = Math.min(monthlyBudget, Math.round(weeklyTargetPace * (idx + 1)));

      let status: WeekDataPoint['status'] = 'on_track';
      if (weeklySpend > 5500) {
        status = 'peak';
      } else if (weeklySpend > 3800) {
        status = 'elevated';
      }

      return {
        weekKey: bin.key,
        label: bin.label,
        rangeLabel: bin.range,
        weeklySpend,
        cumulativeSpend: runningTotal,
        budgetPaceTarget,
        orderCount,
        topItemName: matching[0]?.items[0]?.name || bin.topItem,
        status,
      };
    });
  }, [purchases, monthlyBudget]);

  // Aggregate summary values
  const totalMonthSpend = weeklyData[weeklyData.length - 1]?.cumulativeSpend || 0;
  const budgetConsumedPercentage = Math.round((totalMonthSpend / monthlyBudget) * 100);
  const highestSpendWeek = [...weeklyData].sort((a, b) => b.weeklySpend - a.weeklySpend)[0];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
      {/* 1. Header & View Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Weekly Spending Trend & Budget Progress</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Monthly Budget Trajectory
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total spending volume per week for the current month mapped toward your {formatPrice(monthlyBudget)} budget limit.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setViewMode('combined')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'combined'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Combined
          </button>
          <button
            onClick={() => setViewMode('cumulative')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'cumulative'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cumulative vs Budget
          </button>
          <button
            onClick={() => setViewMode('volume')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'volume'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Weekly Volume
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Spent MTD</span>
          <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-white mt-0.5 tabular-nums">
            {formatPrice(totalMonthSpend)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Monthly Budget</span>
          <div className="text-base sm:text-lg font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-0.5 tabular-nums">
            {formatPrice(monthlyBudget)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Budget Consumed</span>
          <div className="text-base sm:text-lg font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-0.5 tabular-nums">
            {budgetConsumedPercentage}%
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Peak Spend Week</span>
          <div className="text-base sm:text-lg font-extrabold font-mono text-rose-500 mt-0.5 tabular-nums truncate">
            {highestSpendWeek?.label} ({formatPrice(highestSpendWeek?.weeklySpend)})
          </div>
        </div>
      </div>

      {/* 3. Recharts Trend Line & Volume Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={weeklyData}
            margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="weeklyBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="cumulativeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(148, 163, 184, 0.2)" 
            />

            <XAxis 
              dataKey="label" 
              tickLine={false} 
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />

            <YAxis 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              domain={[0, Math.max(monthlyBudget * 1.15, totalMonthSpend * 1.1)]}
            />

            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as WeekDataPoint;
                  return (
                    <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-3.5 rounded-2xl text-xs font-semibold shadow-2xl border border-slate-700 dark:border-slate-200 pointer-events-none space-y-1.5">
                      <div className="flex items-center justify-between gap-4 font-bold border-b border-slate-800 dark:border-slate-100 pb-1">
                        <span>{data.label} · {data.rangeLabel}</span>
                        <span className="font-mono text-blue-400 dark:text-blue-600">{data.orderCount} orders</span>
                      </div>

                      <div className="flex justify-between gap-4 font-mono text-[11px]">
                        <span className="text-slate-400">Weekly Volume:</span>
                        <span className="font-bold text-blue-400 dark:text-blue-600">{formatPrice(data.weeklySpend)}</span>
                      </div>

                      <div className="flex justify-between gap-4 font-mono text-[11px]">
                        <span className="text-slate-400">Cumulative Progress:</span>
                        <span className="font-bold text-purple-400 dark:text-purple-600">{formatPrice(data.cumulativeSpend)}</span>
                      </div>

                      <div className="flex justify-between gap-4 font-mono text-[11px]">
                        <span className="text-slate-400">Monthly Budget Cap:</span>
                        <span className="font-bold text-rose-400">{formatPrice(monthlyBudget)}</span>
                      </div>

                      {data.topItemName && (
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 dark:border-slate-100 truncate max-w-[200px]">
                          Key purchase: {data.topItemName}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Horizontal Monthly Budget Threshold Reference Line */}
            <ReferenceLine 
              y={monthlyBudget} 
              stroke="#ef4444" 
              strokeDasharray="4 4" 
              label={{ 
                value: `Budget Cap (${formatPrice(monthlyBudget)})`, 
                position: 'insideTopRight', 
                fill: '#ef4444', 
                fontSize: 10,
                fontWeight: 'bold'
              }} 
            />

            {/* Weekly Volume Bar (Visible in Combined and Volume views) */}
            {(viewMode === 'combined' || viewMode === 'volume') && (
              <Bar 
                dataKey="weeklySpend" 
                name="Weekly Volume" 
                fill="url(#weeklyBarGradient)" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={44}
              />
            )}

            {/* Cumulative Spending Area Fill (Visible in Combined and Cumulative views) */}
            {(viewMode === 'combined' || viewMode === 'cumulative') && (
              <Area 
                type="monotone" 
                dataKey="cumulativeSpend" 
                name="Cumulative Spending" 
                fill="url(#cumulativeAreaGradient)" 
                stroke="transparent"
              />
            )}

            {/* Cumulative Spending Trend Line */}
            {(viewMode === 'combined' || viewMode === 'cumulative') && (
              <Line 
                type="monotone" 
                dataKey="cumulativeSpend" 
                name="Progress Toward Budget" 
                stroke="#8b5cf6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
              />
            )}

            {/* Weekly Spending Trend Line (Visible in Volume view) */}
            {viewMode === 'volume' && (
              <Line 
                type="monotone" 
                dataKey="weeklySpend" 
                name="Weekly Spending Velocity" 
                stroke="#3b82f6" 
                strokeWidth={2.5} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Trajectory Analysis Footer */}
      <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Weekly Spending Pacing:</strong> Weekly spend peaked in Week 4 ({formatPrice(6446)}), driven by noise-cancelling headphones and apparel. Current cumulative spend is {formatPrice(totalMonthSpend)}.
          </span>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('budgets')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>Budget Settings</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
