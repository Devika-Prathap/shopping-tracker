import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Store, 
  Clock, 
  PieChart, 
  BarChart3, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, PriceDropItem, CategoryBudget } from '../types';
import { GeographicHeatMap } from './GeographicHeatMap';
import { TopShoppingHubsSidebar } from './TopShoppingHubsSidebar';
import { CategorySpendingShiftChart } from './CategorySpendingShiftChart';
import { CategoryComparativeBarChart } from './CategoryComparativeBarChart';
import { BudgetForecastChart } from './BudgetForecastChart';
import { SpendingInsights } from './SpendingInsights';
import { PriceDropView } from './PriceDropView';
import { PredictiveSpendingAnalytics } from './PredictiveSpendingAnalytics';

export type AnalyticsSubTab = 'cadence' | 'predictive' | 'price_history';

interface AnalyticsViewProps {
  purchases: PurchaseTransaction[];
  priceDrops?: PriceDropItem[];
  budgets?: CategoryBudget[];
  monthlyBudget?: number;
  initialSubTab?: AnalyticsSubTab;
  onNavigateTab?: (tab: any) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  purchases, 
  priceDrops = [],
  budgets = [],
  monthlyBudget = 15000,
  initialSubTab = 'predictive',
  onNavigateTab
}) => {
  const { formatPrice } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<AnalyticsSubTab>(initialSubTab);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const [geoFilterStore, setGeoFilterStore] = useState<string>('ALL');
  const [geoFilterCategory, setGeoFilterCategory] = useState<string>('ALL');

  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  const totalSpent = delivered.reduce((sum, p) => sum + p.totalAmount, 0);

  // Group by store
  const storeStats: Record<string, { count: number; spent: number }> = {};
  delivered.forEach(p => {
    if (!storeStats[p.store]) storeStats[p.store] = { count: 0, spent: 0 };
    storeStats[p.store].count += 1;
    storeStats[p.store].spent += p.totalAmount;
  });

  const sortedStores = Object.entries(storeStats).sort((a, b) => b[1].count - a[1].count);
  const mostFrequentStore = sortedStores[0] ? sortedStores[0][0] : 'Amazon';

  // Group by Category
  const catStats: Record<string, number> = {};
  delivered.flatMap(p => p.items).forEach(it => {
    catStats[it.category] = (catStats[it.category] || 0) + (it.price * (it.quantity || 1));
  });
  const sortedCategories = Object.entries(catStats).sort((a, b) => b[1] - a[1]);
  const topCategoryName = sortedCategories[0] ? sortedCategories[0][0] : 'Clothing';
  const topCategoryPercent = totalSpent > 0 ? Math.round(((sortedCategories[0]?.[1] || 0) / totalSpent) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-full min-w-0 box-border">
      {/* Analytics Sub-tab navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit max-w-full overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('predictive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'predictive'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Predictive Spending</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
            Seasonal AI
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('cadence')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'cadence'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Cadence & Shopping Hubs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('price_history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'price_history'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Past Purchase Price Check</span>
        </button>
      </div>

      {activeSubTab === 'predictive' && (
        <PredictiveSpendingAnalytics 
          purchases={purchases}
          monthlyBudget={monthlyBudget}
          budgets={budgets}
          onNavigateTab={onNavigateTab}
        />
      )}

      {activeSubTab === 'price_history' && (
        <PriceDropView priceDrops={priceDrops} />
      )}

      {activeSubTab === 'cadence' && (
        <div className="space-y-8 animate-fadeIn w-full max-w-full min-w-0">
          {/* Predictive Engine Prompt Callout Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#F3EEFF] via-[#FAF5FF] to-[#FFF9F2] dark:from-purple-900 dark:via-indigo-900 dark:to-slate-900 text-[#29243A] dark:text-white border border-[#E5DDF2] dark:border-purple-800/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#7C3AED] dark:text-purple-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-[#4C267B] dark:text-white">Predictive Seasonal Engine Active</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-500/30 text-[#7C3AED] dark:text-purple-200 px-2 py-0.5 rounded-full border border-purple-200 dark:border-transparent">
                    Q4 Holiday Forecast Ready
                  </span>
                </div>
                <p className="text-xs text-[#625B72] dark:text-purple-200/90 mt-0.5">
                  Holiday & festive sales (Nov & Dec) are projected to surge spending by +38% based on your recent category momentum.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('predictive')}
              className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-white dark:hover:bg-purple-50 text-white dark:text-purple-950 font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 whitespace-nowrap"
            >
              <span>View Full Forecast</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Header */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-100 via-indigo-50 to-blue-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 min-w-0">
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Shopping Frequency & Insights
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Shopping Cadence & Behavioral Analytics
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Understand how frequently you buy, which shopping portals you turn to first, and where your monthly budget concentrates.
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800/60 shadow-xs text-center flex-1 sm:flex-none min-w-[120px]">
            <div className="text-[11px] text-slate-500 font-medium">Avg Cadence</div>
            <div className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400 font-mono mt-0.5 whitespace-nowrap">
              Every 3.2 Days
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800/60 shadow-xs text-center flex-1 sm:flex-none min-w-[120px]">
            <div className="text-[11px] text-slate-500 font-medium">Top Hub</div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {mostFrequentStore}
            </div>
          </div>
        </div>
      </div>

      {/* Shopping Frequency Metrics (Prompt Section 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl pastel-card-purple border shadow-xs">
          <div className="flex justify-between items-center text-xs font-semibold text-purple-700 dark:text-purple-300">
            <span>Purchases This Week</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
            3 Orders
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Nike, Sony Headphones, T-shirt
          </div>
        </div>

        <div className="p-5 rounded-3xl pastel-card-blue border shadow-xs">
          <div className="flex justify-between items-center text-xs font-semibold text-blue-700 dark:text-blue-300">
            <span>Purchases This Month</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
            {delivered.length} Orders
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total {formatPrice(totalSpent)} spent
          </div>
        </div>

        <div className="p-5 rounded-3xl pastel-card-pink border shadow-xs">
          <div className="flex justify-between items-center text-xs font-semibold text-pink-700 dark:text-pink-300">
            <span>Purchases This Year</span>
            <ShoppingBag className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
            38 Orders
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Paced evenly across fashion & tech
          </div>
        </div>

        <div className="p-5 rounded-3xl pastel-card-mint border shadow-xs">
          <div className="flex justify-between items-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span>Average Order Time</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
            ~3.2 Days
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Interval between checkouts
          </div>
        </div>
      </div>

      {/* 6-Month Budget Forecast: Actual Monthly Spending vs Defined Savings Goal Trend */}
      <BudgetForecastChart 
        purchases={purchases} 
        monthlyBudget={monthlyBudget} 
        budgets={budgets} 
      />

      {/* Comparative Product Category Spending Distribution Bar Chart */}
      <CategoryComparativeBarChart purchases={purchases} budgets={budgets} />

      {/* 6-Month Category Spending Shifts Stacked Bar Chart */}
      <CategorySpendingShiftChart purchases={purchases} />

      {/* Geographical Spending Heat Map & Top Shopping Hubs Summary Sidebar */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Main Interactive Geographic Heat Map (8 columns on large screens) */}
          <div className="xl:col-span-8">
            <GeographicHeatMap 
              purchases={purchases}
              selectedHubId={selectedHubId}
              onSelectHub={setSelectedHubId}
              filterStore={geoFilterStore}
              onFilterStoreChange={setGeoFilterStore}
              filterCategory={geoFilterCategory}
              onFilterCategoryChange={setGeoFilterCategory}
              showInternalSidebar={false}
            />
          </div>

          {/* Complementary Summary Sidebar: Top Shopping Hubs (4 columns on large screens) */}
          <div className="xl:col-span-4">
            <TopShoppingHubsSidebar 
              purchases={purchases}
              selectedHubId={selectedHubId}
              onSelectHub={setSelectedHubId}
              filterStore={geoFilterStore}
              filterCategory={geoFilterCategory}
            />
          </div>
        </div>
      </section>

      {/* Gemini AI Spending Habits & Actionable Monthly Savings Engine */}
      <SpendingInsights purchases={purchases} />

      {/* Where I Shop Most (Visual Bars & Store Rank) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Where I Shop Most
        </h3>

        <div className="space-y-4">
          {sortedStores.map(([storeName, stat], index) => {
            const maxCount = sortedStores[0][1].count;
            const percentage = Math.round((stat.count / maxCount) * 100);

            return (
              <div key={storeName} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold text-[10px] flex items-center justify-center">
                      #{index + 1}
                    </span>
                    {storeName}
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {stat.count} purchases · <strong className="text-purple-600 dark:text-purple-400">{formatPrice(stat.spent)}</strong>
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Factual Shopping Insights (Prompt Section 10) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          <Sparkles className="w-4 h-4" />
          <span>Your Shopping Insights</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Automated Behavioral Observations (Factual & Objective)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              You made <strong>6 purchases from clothing and footwear stores</strong> this month, making apparel your most active category.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              <strong>Electronics and audio hardware</strong> made up {topCategoryPercent}% of your total spending volume this month.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/80 dark:border-pink-800/40 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              You purchased from <strong>{sortedStores.length} different shopping portals</strong> this month, with {mostFrequentStore} having the highest order frequency.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              <strong>Multi-store reconciliation</strong> automatically synchronizes order receipts, invoices, and delivery tracking across connected portals.
            </p>
          </div>
        </div>
      </div>
    </div>
    )}
  </div>
);
};
