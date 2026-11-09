import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Calendar, 
  Filter,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction } from '../types';

interface CategorySpendingShiftChartProps {
  purchases?: PurchaseTransaction[];
}

interface MonthlyCategoryPoint {
  monthKey: string;
  monthLabel: string;
  fullDate: string;
  clothing: number;
  shoes: number;
  electronics: number;
  beauty: number;
  accessories: number;
  gaming: number;
  total: number;
  // Normalized 100% values
  clothingPct: number;
  shoesPct: number;
  electronicsPct: number;
  beautyPct: number;
  accessoriesPct: number;
  gamingPct: number;
}

interface CategoryConfig {
  key: 'clothing' | 'shoes' | 'electronics' | 'beauty' | 'accessories' | 'gaming';
  label: string;
  color: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  { key: 'shoes', label: 'Shoes & Footwear', color: '#06b6d4', description: 'Sneakers, running & formal' },
  { key: 'electronics', label: 'Electronics & Audio', color: '#8b5cf6', description: 'Headphones, chargers & hardware' },
  { key: 'clothing', label: 'Clothing & Apparel', color: '#ec4899', description: 'Shirts, tees & denim' },
  { key: 'beauty', label: 'Beauty & Skincare', color: '#f43f5e', description: 'Serums, moisturisers & care' },
  { key: 'accessories', label: 'Accessories & Watches', color: '#f59e0b', description: 'Activity trackers & wearables' },
  { key: 'gaming', label: 'Gaming & Peripherals', color: '#10b981', description: 'Controllers & gaming accessories' },
];

export const CategorySpendingShiftChart: React.FC<CategorySpendingShiftChartProps> = ({
  purchases = [],
}) => {
  const { formatPrice } = useApp();

  // Mode: 'absolute' (₹ spend) vs 'normalized' (% distribution)
  const [displayMode, setDisplayMode] = useState<'absolute' | 'normalized'>('absolute');

  // Active / Isolated Category filter (null = all shown)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Build the 6-month historical stacked dataset
  const chartData: MonthlyCategoryPoint[] = useMemo(() => {
    // If purchases from actual data have September amounts, sync with Sep baseline
    const sepDelivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
    let sepShoes = 7890;
    let sepElectronics = 6748;
    let sepClothing = 5496;
    let sepBeauty = 2600;
    let sepAccessories = 2199;
    let sepGaming = 2499;

    if (sepDelivered.length > 0) {
      const items = sepDelivered.flatMap(p => p.items);
      const shoesVal = items.filter(it => it.category === 'Shoes').reduce((s, it) => s + it.price * (it.quantity || 1), 0);
      const elecVal = items.filter(it => it.category === 'Electronics' || it.category === 'Mobile Accessories').reduce((s, it) => s + it.price * (it.quantity || 1), 0);
      const clothVal = items.filter(it => it.category === 'Clothing').reduce((s, it) => s + it.price * (it.quantity || 1), 0);
      const beautyVal = items.filter(it => it.category === 'Beauty').reduce((s, it) => s + it.price * (it.quantity || 1), 0);
      const accVal = items.filter(it => it.category === 'Accessories').reduce((s, it) => s + it.price * (it.quantity || 1), 0);
      const gameVal = items.filter(it => it.category === 'Gaming').reduce((s, it) => s + it.price * (it.quantity || 1), 0);

      if (shoesVal > 0) sepShoes = shoesVal;
      if (elecVal > 0) sepElectronics = elecVal;
      if (clothVal > 0) sepClothing = clothVal;
      if (beautyVal > 0) sepBeauty = beautyVal;
      if (accVal > 0) sepAccessories = accVal;
      if (gameVal > 0) sepGaming = gameVal;
    }

    const rawMonths = [
      {
        monthKey: 'apr',
        monthLabel: 'Apr 2026',
        fullDate: 'April 2026',
        clothing: 3800,
        shoes: 2400,
        electronics: 1200,
        beauty: 650,
        accessories: 850,
        gaming: 300,
      },
      {
        monthKey: 'may',
        monthLabel: 'May 2026',
        fullDate: 'May 2026',
        clothing: 4100,
        shoes: 2999,
        electronics: 1800,
        beauty: 950,
        accessories: 1200,
        gaming: 450,
      },
      {
        monthKey: 'jun',
        monthLabel: 'Jun 2026',
        fullDate: 'June 2026',
        clothing: 4600,
        shoes: 3200,
        electronics: 2400,
        beauty: 1400,
        accessories: 900,
        gaming: 750,
      },
      {
        monthKey: 'jul',
        monthLabel: 'Jul 2026',
        fullDate: 'July 2026',
        clothing: 3900,
        shoes: 3600,
        electronics: 3200,
        beauty: 1850,
        accessories: 1450,
        gaming: 1100,
      },
      {
        monthKey: 'aug',
        monthLabel: 'Aug 2026',
        fullDate: 'August 2026',
        clothing: 4400,
        shoes: 4200,
        electronics: 4800,
        beauty: 2100,
        accessories: 1650,
        gaming: 1450,
      },
      {
        monthKey: 'sep',
        monthLabel: 'Sep 2026',
        fullDate: 'September 2026',
        clothing: sepClothing,
        shoes: sepShoes,
        electronics: sepElectronics,
        beauty: sepBeauty,
        accessories: sepAccessories,
        gaming: sepGaming,
      },
    ];

    return rawMonths.map((m) => {
      const total = m.clothing + m.shoes + m.electronics + m.beauty + m.accessories + m.gaming;
      return {
        ...m,
        total,
        clothingPct: Math.round((m.clothing / total) * 100),
        shoesPct: Math.round((m.shoes / total) * 100),
        electronicsPct: Math.round((m.electronics / total) * 100),
        beautyPct: Math.round((m.beauty / total) * 100),
        accessoriesPct: Math.round((m.accessories / total) * 100),
        gamingPct: Math.round((m.gaming / total) * 100),
      };
    });
  }, [purchases]);

  // Total spend over the 6-month period
  const total6MonthSpend = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.total, 0);
  }, [chartData]);

  // Overall category totals over the 6-month period
  const category6MonthTotals = useMemo(() => {
    const totals: Record<string, number> = {
      clothing: 0,
      shoes: 0,
      electronics: 0,
      beauty: 0,
      accessories: 0,
      gaming: 0,
    };
    chartData.forEach(m => {
      totals.clothing += m.clothing;
      totals.shoes += m.shoes;
      totals.electronics += m.electronics;
      totals.beauty += m.beauty;
      totals.accessories += m.accessories;
      totals.gaming += m.gaming;
    });
    return totals;
  }, [chartData]);

  return (
    <section className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 w-full max-w-full min-w-0 box-border overflow-hidden">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Category Spending Evolution · 6-Month Stacked Trajectory</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            6-Month Category Spending Shifts
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Examine how your primary expense segments have shifted from April to September 2026, revealing expanding categories and seasonal habit changes.
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Display Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setDisplayMode('absolute')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                displayMode === 'absolute'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Absolute (₹)
            </button>
            <button
              onClick={() => setDisplayMode('normalized')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                displayMode === 'normalized'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              100% Share (%)
            </button>
          </div>

          {activeCategoryFilter && (
            <button
              onClick={() => setActiveCategoryFilter(null)}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline px-2 py-1 cursor-pointer"
            >
              Reset Category Focus
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Category Filter Chips */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs pb-1 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3 text-slate-400" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategoryFilter === cat.key;
          const totalVal = category6MonthTotals[cat.key];
          const pctOfTotal = Math.round((totalVal / total6MonthSpend) * 100);

          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategoryFilter(isSelected ? null : cat.key)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-2 ring-purple-500/40'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.label}</span>
              <span className="font-mono text-[10px] opacity-75">
                {displayMode === 'absolute' ? formatPrice(totalVal) : `${pctOfTotal}%`}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Recharts Stacked Bar Chart */}
      <div className="h-72 sm:h-80 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: displayMode === 'absolute' ? -5 : -15, bottom: 5 }}
            barSize={displayMode === 'absolute' ? 44 : 48}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(148, 163, 184, 0.2)" 
            />

            <XAxis 
              dataKey="monthLabel" 
              tickLine={false} 
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />

            <YAxis 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => displayMode === 'absolute' ? `₹${Math.round(val / 1000)}k` : `${val}%`}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              domain={displayMode === 'absolute' ? [0, 'auto'] : [0, 100]}
            />

            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as MonthlyCategoryPoint;
                  return (
                    <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-4 rounded-2xl text-xs font-semibold shadow-2xl border border-slate-700 dark:border-slate-200 pointer-events-none space-y-2 min-w-[220px]">
                      <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-100 pb-1.5 font-bold">
                        <span className="text-sm">{data.fullDate}</span>
                        <span className="font-mono text-purple-400 dark:text-purple-600 font-extrabold">
                          {formatPrice(data.total)}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-0.5">
                        {CATEGORIES.map((cat) => {
                          const val = data[cat.key];
                          const pct = data[`${cat.key}Pct` as keyof MonthlyCategoryPoint];
                          const isFiltered = activeCategoryFilter && activeCategoryFilter !== cat.key;
                          
                          return (
                            <div 
                              key={cat.key} 
                              className={`flex items-center justify-between gap-3 text-[11px] font-mono ${
                                isFiltered ? 'opacity-30' : ''
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                <span className="truncate text-slate-300 dark:text-slate-700 font-sans font-medium">
                                  {cat.label}
                                </span>
                              </div>
                              <div className="font-bold text-slate-100 dark:text-slate-900 shrink-0">
                                {formatPrice(val)} <span className="text-slate-400 font-normal">({pct}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Stacked Bars for each category */}
            {CATEGORIES.map((cat, idx) => {
              const isSelected = !activeCategoryFilter || activeCategoryFilter === cat.key;
              const dataKey = displayMode === 'absolute' ? cat.key : `${cat.key}Pct`;
              const opacity = isSelected ? 1 : 0.2;

              return (
                <Bar
                  key={cat.key}
                  dataKey={dataKey}
                  name={cat.label}
                  stackId="categoryStack"
                  fill={cat.color}
                  fillOpacity={opacity}
                  radius={idx === CATEGORIES.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                  className="transition-opacity duration-300"
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Strategic Behavioral Shift Insights Panel */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Observed Shifts in Shopping Habits (Last 6 Months)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {/* Shift 1: Electronics Surge */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-purple-700 dark:text-purple-300">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                Electronics Surge
              </span>
              <span className="font-mono text-[11px]">+142% Volume</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Electronics climbed from <strong>13%</strong> in April (₹1,200) to <strong>25%</strong> in September (₹6,748), driven by active noise-cancelling headphones and fast charging hardware.
            </p>
          </div>

          {/* Shift 2: Clothing Normalization */}
          <div className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/80 dark:border-pink-800/50 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-pink-700 dark:text-pink-300">
              <span className="flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-500" />
                Clothing Normalization
              </span>
              <span className="font-mono text-[11px]">43% → 20% Share</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Summer wardrobe refreshes dominated May–June (over 40% of spend) before stabilizing at <strong>20%</strong> in September as staple purchases plateaued.
            </p>
          </div>

          {/* Shift 3: Footwear Upgrades */}
          <div className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/50 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-cyan-700 dark:text-cyan-300">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                Footwear Consistency
              </span>
              <span className="font-mono text-[11px]">27%–31% Core</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Shoes remained your most consistent high-ticket passion segment throughout the 6 months, culminating in a ₹7,890 peak in September with Nike sneaker drops.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
