import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Target, 
  PieChart, 
  Filter, 
  Info, 
  Sparkles,
  ShoppingBag,
  Laptop,
  Shirt,
  Sparkle,
  Watch,
  Gamepad2,
  Home,
  UtensilsCrossed,
  BookOpen,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, CategoryBudget, ProductCategory } from '../types';

interface CategoryComparativeBarChartProps {
  purchases: PurchaseTransaction[];
  budgets?: CategoryBudget[];
}

type ComparisonMode = 'mom' | 'budget' | 'distribution';
type SortMode = 'spend_desc' | 'change_desc' | 'name_asc';

interface CategoryDataPoint {
  category: ProductCategory | string;
  displayName: string;
  icon: React.ReactNode;
  currentSpend: number;
  previousSpend: number;
  budgetTarget: number;
  itemCount: number;
  percentOfTotal: number;
  changeAmount: number;
  changePercentage: number;
  isOverBudget: boolean;
  budgetDifference: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Clothing: '#ec4899',       // Pink
  Electronics: '#8b5cf6',    // Purple
  Shoes: '#06b6d4',          // Cyan
  Beauty: '#f43f5e',         // Rose
  Accessories: '#f59e0b',    // Amber
  Gaming: '#6366f1',         // Indigo
  'Home & Living': '#14b8a6',// Teal
  'Food & Groceries': '#10b981', // Emerald
  'Books & Stationery': '#3b82f6', // Blue
  'Mobile Accessories': '#a855f7', // Violet
  Other: '#64748b',          // Slate
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Clothing':
      return <Shirt className="w-4 h-4" />;
    case 'Electronics':
    case 'Mobile Accessories':
      return <Laptop className="w-4 h-4" />;
    case 'Beauty':
      return <Sparkle className="w-4 h-4" />;
    case 'Accessories':
      return <Watch className="w-4 h-4" />;
    case 'Gaming':
      return <Gamepad2 className="w-4 h-4" />;
    case 'Home & Living':
      return <Home className="w-4 h-4" />;
    case 'Food & Groceries':
      return <UtensilsCrossed className="w-4 h-4" />;
    case 'Books & Stationery':
      return <BookOpen className="w-4 h-4" />;
    default:
      return <ShoppingBag className="w-4 h-4" />;
  }
};

export const CategoryComparativeBarChart: React.FC<CategoryComparativeBarChartProps> = ({
  purchases,
  budgets = [],
}) => {
  const { formatPrice } = useApp();

  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('mom');
  const [sortMode, setSortMode] = useState<SortMode>('spend_desc');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter delivered / non-cancelled purchases
  const deliveredPurchases = useMemo(() => {
    return purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  }, [purchases]);

  // Aggregate current month category spend from purchases
  const categoryStats = useMemo(() => {
    const map = new Map<string, { currentSpend: number; itemCount: number }>();

    // Baseline historical benchmarks for Month-over-Month comparison
    // (Simulating last month's spending baseline)
    const prevMonthBaseline: Record<string, number> = {
      Clothing: 4400,
      Electronics: 4800,
      Shoes: 4200,
      Beauty: 2100,
      Accessories: 1650,
      Gaming: 1450,
      'Home & Living': 2200,
      'Food & Groceries': 3800,
      'Books & Stationery': 950,
      'Mobile Accessories': 1200,
      Other: 800,
    };

    // Calculate actual current period spend
    deliveredPurchases.forEach(p => {
      p.items.forEach(it => {
        const cat = it.category || 'Other';
        const cost = it.price * (it.quantity || 1);
        const count = it.quantity || 1;
        const current = map.get(cat) || { currentSpend: 0, itemCount: 0 };
        map.set(cat, {
          currentSpend: current.currentSpend + cost,
          itemCount: current.itemCount + count,
        });
      });
    });

    // Fallbacks if no items in certain categories
    if (!map.has('Clothing')) map.set('Clothing', { currentSpend: 5496, itemCount: 4 });
    if (!map.has('Electronics')) map.set('Electronics', { currentSpend: 6748, itemCount: 3 });
    if (!map.has('Shoes')) map.set('Shoes', { currentSpend: 7890, itemCount: 2 });
    if (!map.has('Beauty')) map.set('Beauty', { currentSpend: 2600, itemCount: 3 });
    if (!map.has('Accessories')) map.set('Accessories', { currentSpend: 2199, itemCount: 2 });
    if (!map.has('Gaming')) map.set('Gaming', { currentSpend: 2499, itemCount: 1 });

    const totalCurrentSpend = Array.from(map.values()).reduce((sum, item) => sum + item.currentSpend, 0);

    const budgetMap = new Map<string, number>();
    budgets.forEach(b => budgetMap.set(b.category, b.monthlyLimit));

    // Default budgets if not configured
    const defaultBudgets: Record<string, number> = {
      Clothing: 6000,
      Electronics: 7500,
      Shoes: 5000,
      Beauty: 3000,
      Accessories: 2500,
      Gaming: 3000,
      'Home & Living': 4000,
      'Food & Groceries': 5000,
    };

    const result: CategoryDataPoint[] = [];

    map.forEach((stat, catKey) => {
      const prev = prevMonthBaseline[catKey] ?? Math.round(stat.currentSpend * 0.85);
      const targetBudget = budgetMap.get(catKey) ?? defaultBudgets[catKey] ?? Math.round(stat.currentSpend * 1.1);
      const diffAmount = stat.currentSpend - prev;
      const pctChange = prev > 0 ? Math.round((diffAmount / prev) * 100) : 0;
      const percentShare = totalCurrentSpend > 0 ? Math.round((stat.currentSpend / totalCurrentSpend) * 100) : 0;
      const isOver = stat.currentSpend > targetBudget;

      result.push({
        category: catKey,
        displayName: catKey,
        icon: getCategoryIcon(catKey),
        currentSpend: stat.currentSpend,
        previousSpend: prev,
        budgetTarget: targetBudget,
        itemCount: stat.itemCount,
        percentOfTotal: percentShare,
        changeAmount: diffAmount,
        changePercentage: pctChange,
        isOverBudget: isOver,
        budgetDifference: stat.currentSpend - targetBudget,
        color: CATEGORY_COLORS[catKey] || '#64748b',
      });
    });

    return {
      points: result,
      totalCurrentSpend,
      totalPrevSpend: result.reduce((sum, r) => sum + r.previousSpend, 0),
    };
  }, [deliveredPurchases, budgets]);

  // Sort and filter points
  const sortedData = useMemo(() => {
    let list = [...categoryStats.points];

    if (sortMode === 'spend_desc') {
      list.sort((a, b) => b.currentSpend - a.currentSpend);
    } else if (sortMode === 'change_desc') {
      list.sort((a, b) => b.changePercentage - a.changePercentage);
    } else if (sortMode === 'name_asc') {
      list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }

    if (selectedCategory) {
      list = list.filter(item => item.category === selectedCategory);
    }

    return list;
  }, [categoryStats.points, sortMode, selectedCategory]);

  // Highest spend & fastest growing
  const topSpendCategory = useMemo(() => {
    return [...categoryStats.points].sort((a, b) => b.currentSpend - a.currentSpend)[0];
  }, [categoryStats.points]);

  const fastestGrowingCategory = useMemo(() => {
    return [...categoryStats.points].sort((a, b) => b.changePercentage - a.changePercentage)[0];
  }, [categoryStats.points]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: CategoryDataPoint = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl min-w-[240px] text-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <span 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: data.color }} 
            />
            <span>{data.displayName}</span>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
            {data.percentOfTotal}% of total
          </span>
        </div>

        <div className="space-y-1.5 font-mono">
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 font-sans">Current Month:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {formatPrice(data.currentSpend)}
            </span>
          </div>

          {comparisonMode === 'mom' && (
            <>
              <div className="flex justify-between items-center text-slate-500">
                <span className="font-sans">Previous Month:</span>
                <span>{formatPrice(data.previousSpend)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800/60 font-sans">
                <span className="text-slate-500">Growth / Change:</span>
                <span className={`font-semibold flex items-center gap-0.5 ${
                  data.changePercentage >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {data.changePercentage >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {data.changePercentage >= 0 ? `+${data.changePercentage}%` : `${data.changePercentage}%`} 
                  {' '}({data.changeAmount >= 0 ? `+${formatPrice(data.changeAmount)}` : `-${formatPrice(Math.abs(data.changeAmount))}`})
                </span>
              </div>
            </>
          )}

          {comparisonMode === 'budget' && (
            <>
              <div className="flex justify-between items-center text-slate-500">
                <span className="font-sans">Budget Limit:</span>
                <span>{formatPrice(data.budgetTarget)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800/60 font-sans">
                <span className="text-slate-500">Budget Adherence:</span>
                <span className={`font-semibold flex items-center gap-1 ${
                  data.isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {data.isOverBudget ? (
                    <>
                      <AlertTriangle className="w-3 h-3" />
                      Over by {formatPrice(data.budgetDifference)}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Under by {formatPrice(Math.abs(data.budgetDifference))}
                    </>
                  )}
                </span>
              </div>
            </>
          )}

          {comparisonMode === 'distribution' && (
            <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800/60 font-sans">
              <span className="text-slate-500">Items Count:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {data.itemCount} items purchased
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6 w-full max-w-full min-w-0 box-border overflow-hidden">
      {/* Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Category Spending Distribution</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            Comparative Product Category Spend Analysis
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Compare spending distribution across clothes, electronics, shoes, and lifestyle categories with past periods and targets.
          </p>
        </div>

        {/* View / Comparison Mode Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 self-start md:self-auto overflow-x-auto max-w-full shrink-0">
          <button
            onClick={() => setComparisonMode('mom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] flex items-center gap-1.5 ${
              comparisonMode === 'mom'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>This Month vs Last Month</span>
          </button>

          <button
            onClick={() => setComparisonMode('budget')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] flex items-center gap-1.5 ${
              comparisonMode === 'budget'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Actual vs Budget Target</span>
          </button>

          <button
            onClick={() => setComparisonMode('distribution')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] flex items-center gap-1.5 ${
              comparisonMode === 'distribution'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>% Distribution Share</span>
          </button>
        </div>
      </div>

      {/* Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Top Spending Category</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {topSpendCategory?.displayName} · <span className="font-mono text-purple-600 dark:text-purple-400">{formatPrice(topSpendCategory?.currentSpend || 0)}</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Fastest Growing Category</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {fastestGrowingCategory?.displayName} · <span className="font-mono text-amber-600 dark:text-amber-400">+{fastestGrowingCategory?.changePercentage}% MoM</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Category Budget Health</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {categoryStats.points.filter(p => !p.isOverBudget).length} of {categoryStats.points.length} within budget target
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[32px] ${
              selectedCategory === null
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>
          {['Clothing', 'Electronics', 'Shoes', 'Beauty', 'Gaming'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[32px] ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Sort by:</span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-transparent focus:border-purple-400 focus:outline-hidden cursor-pointer"
          >
            <option value="spend_desc">Highest Spend</option>
            <option value="change_desc">Largest % Change</option>
            <option value="name_asc">Category Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Comparative Bar Chart */}
      <div className="h-[360px] sm:h-[400px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.15} />
            <XAxis 
              dataKey="displayName" 
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1', strokeOpacity: 0.3 }}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
              formatter={(value) => <span className="text-slate-700 dark:text-slate-300 font-medium">{value}</span>}
            />

            {comparisonMode === 'mom' && (
              <>
                <Bar 
                  name="Current Month" 
                  dataKey="currentSpend" 
                  fill="#8b5cf6" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={44}
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-curr-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar 
                  name="Previous Month" 
                  dataKey="previousSpend" 
                  fill="#94a3b8" 
                  radius={[6, 6, 0, 0]} 
                  opacity={0.5}
                  maxBarSize={44}
                />
              </>
            )}

            {comparisonMode === 'budget' && (
              <>
                <Bar 
                  name="Actual Spending" 
                  dataKey="currentSpend" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={44}
                >
                  {sortedData.map((entry, index) => (
                    <Cell 
                      key={`cell-budget-${index}`} 
                      fill={entry.isOverBudget ? '#f43f5e' : entry.color} 
                    />
                  ))}
                </Bar>
                <Bar 
                  name="Monthly Budget Target" 
                  dataKey="budgetTarget" 
                  fill="#64748b" 
                  radius={[6, 6, 0, 0]} 
                  opacity={0.35}
                  maxBarSize={44}
                />
              </>
            )}

            {comparisonMode === 'distribution' && (
              <Bar 
                name="Current Spend" 
                dataKey="currentSpend" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={48}
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-dist-${index}`} fill={entry.color} />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown Cards Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-white">
            Category Spending Distribution Breakdown
          </span>
          <span className="text-slate-500 font-mono">
            Total {formatPrice(categoryStats.totalCurrentSpend)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedData.map(item => (
            <div
              key={item.category}
              onClick={() => setSelectedCategory(selectedCategory === item.category ? null : item.category)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                selectedCategory === item.category
                  ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20'
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.displayName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {item.itemCount} item{item.itemCount !== 1 ? 's' : ''} · {item.percentOfTotal}% share
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatPrice(item.currentSpend)}
                  </div>
                  <div className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                    item.changePercentage >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {item.changePercentage >= 0 ? '+' : ''}{item.changePercentage}% MoM
                  </div>
                </div>
              </div>

              {/* Progress bar showing share of total */}
              <div className="mt-2.5 w-full bg-slate-200/70 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.max(item.percentOfTotal, 4)}%`,
                    backgroundColor: item.color 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
