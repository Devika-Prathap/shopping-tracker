import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  SlidersHorizontal, 
  Trash2, 
  ShieldCheck,
  X,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryBudget, ProductCategory, PurchaseTransaction, PriceDropItem } from '../types';
import { MonthlySavingGoalCard } from './MonthlySavingGoalCard';
import { PredictiveMonthlySpendingChart } from './PredictiveMonthlySpendingChart';

interface BudgetsViewProps {
  budgets: CategoryBudget[];
  onUpdateBudget: (category: ProductCategory, limit: number) => void;
  onRemoveBudget: (category: ProductCategory) => void;
  onAddBudget: (category: ProductCategory, limit: number) => void;
  purchases: PurchaseTransaction[];
  monthlyBudget?: number;
  priceDrops?: PriceDropItem[];
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  onUpdateBudget,
  onRemoveBudget,
  onAddBudget,
  purchases,
  monthlyBudget = 15000,
  priceDrops = [],
}) => {
  const { formatPrice } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState<ProductCategory>('Clothing');
  const [newLimit, setNewLimit] = useState('3000');

  // Calculate actual spending per category
  const categorySpendingMap: Record<string, number> = {};
  purchases
    .filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled')
    .flatMap(p => p.items)
    .forEach(it => {
      categorySpendingMap[it.category] = (categorySpendingMap[it.category] || 0) + (it.price * (it.quantity || 1));
    });

  const availableCategories: ProductCategory[] = [
    'Clothing',
    'Shoes',
    'Electronics',
    'Beauty',
    'Accessories',
    'Home & Living',
    'Food & Groceries',
    'Gaming',
    'Mobile Accessories',
    'Books & Stationery',
    'Gifts',
    'Other'
  ].filter(c => !budgets.some(b => b.category === c)) as ProductCategory[];

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(newLimit);
    if (!limitNum || limitNum <= 0) return;
    onAddBudget(newCategory, limitNum);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full min-w-0 box-border">
      {/* ========================================================================= */}
      {/* 1. MONTHLY SAVING GOAL: User-defined goal with visual progress bar        */}
      {/* ========================================================================= */}
      <MonthlySavingGoalCard
        purchases={purchases}
        monthlyBudget={monthlyBudget}
        priceDrops={priceDrops}
      />

      {/* ========================================================================= */}
      {/* 2. PREDICTIVE SPENDING CHART: Based on current daily spending habits      */}
      {/* ========================================================================= */}
      <PredictiveMonthlySpendingChart
        purchases={purchases}
        monthlyBudget={monthlyBudget}
        budgets={budgets}
      />

      {/* ========================================================================= */}
      {/* 3. CATEGORY SPENDING LIMITS: Category-specific spending caps              */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-100 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
            <Wallet className="w-3.5 h-3.5" />
            Smart Category Budgets
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Optional Spending Limits & Progress Bars
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Create tailored spending targets for fashion, electronics, footwear, or groceries. You receive an alert whenever you approach or cross a limit.
          </p>
        </div>

        {availableCategories.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category Budget</span>
          </button>
        )}
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map(b => {
          const spent = categorySpendingMap[b.category] || 0;
          const ratio = (spent / b.monthlyLimit) * 100;
          const remaining = b.monthlyLimit - spent;
          const isOver = remaining < 0;

          // Color calculation
          let statusColor = 'bg-emerald-500';
          let textColor = 'text-emerald-600 dark:text-emerald-400';
          let label = 'Within Safe Budget';

          if (ratio > 100) {
            statusColor = 'bg-rose-500';
            textColor = 'text-rose-600 dark:text-rose-400';
            label = 'Limit Exceeded';
          } else if (ratio >= 80) {
            statusColor = 'bg-amber-400';
            textColor = 'text-amber-600 dark:text-amber-400';
            label = 'Approaching Limit';
          } else if (ratio >= 50) {
            statusColor = 'bg-teal-400';
            textColor = 'text-teal-600 dark:text-teal-400';
            label = 'Moderate';
          }

          return (
            <div
              key={b.category}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {b.category}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${textColor} bg-slate-100 dark:bg-slate-800`}>
                      {label}
                    </span>
                    <button
                      onClick={() => onRemoveBudget(b.category)}
                      title="Delete budget limit"
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                      {formatPrice(spent)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      / {formatPrice(b.monthlyLimit)} limit
                    </span>
                  </div>

                  {/* Progress Bar with Color Coding */}
                  <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                      style={{ width: `${Math.min(100, ratio)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs">
                    <span className={`font-bold font-mono ${textColor}`}>
                      {ratio.toFixed(0)}% consumed
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {isOver
                        ? `Over by ${formatPrice(Math.abs(remaining))}`
                        : `${formatPrice(remaining)} left`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Adjust control */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Monthly refresh cycle</span>
                <button
                  onClick={() => {
                    const promptVal = prompt(`Enter new monthly budget limit for ${b.category}:`, b.monthlyLimit.toString());
                    if (promptVal && !isNaN(parseFloat(promptVal))) {
                      onUpdateBudget(b.category, parseFloat(promptVal));
                    }
                  }}
                  className="font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Adjust Limit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateBudget}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create New Category Budget
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Category
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Monthly Spending Limit
              </label>
              <input
                type="number"
                required
                value={newLimit}
                onChange={e => setNewLimit(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
              >
                Save Budget
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
