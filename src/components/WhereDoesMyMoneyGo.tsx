import React, { useState } from 'react';
import { 
  PieChart as PieIcon, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  X, 
  Store, 
  Calendar,
  Layers,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory } from '../types';

interface WhereDoesMyMoneyGoProps {
  purchases: PurchaseTransaction[];
}

interface CategoryGroup {
  category: ProductCategory;
  name: string;
  emoji: string;
  total: number;
  count: number;
  color: string;
  percentage: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    store: string;
    date: string;
    imageUrl?: string;
  }>;
}

const CATEGORY_COLORS: Record<string, { color: string; emoji: string }> = {
  Shoes: { color: '#06b6d4', emoji: '👟' },
  Electronics: { color: '#8b5cf6', emoji: '💻' },
  Clothing: { color: '#ec4899', emoji: '👕' },
  Beauty: { color: '#f43f5e', emoji: '💄' },
  Accessories: { color: '#f59e0b', emoji: '⌚' },
  Gaming: { color: '#10b981', emoji: '🎮' },
  'Home & Living': { color: '#6366f1', emoji: '🏠' },
  Other: { color: '#64748b', emoji: '📦' },
};

export const WhereDoesMyMoneyGo: React.FC<WhereDoesMyMoneyGoProps> = ({ purchases }) => {
  const { formatPrice } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  const totalSpent = delivered.reduce((sum, p) => sum + p.totalAmount, 0);

  // Group items by category
  const categoryMap: Record<string, CategoryGroup> = {};

  delivered.forEach(p => {
    p.items.forEach(it => {
      const catKey = it.category || 'Other';
      if (!categoryMap[catKey]) {
        const meta = CATEGORY_COLORS[catKey] || { color: '#8b5cf6', emoji: '🛍️' };
        categoryMap[catKey] = {
          category: catKey as ProductCategory,
          name: catKey,
          emoji: meta.emoji,
          total: 0,
          count: 0,
          color: meta.color,
          percentage: 0,
          items: [],
        };
      }
      categoryMap[catKey].total += it.price * (it.quantity || 1);
      categoryMap[catKey].count += it.quantity || 1;
      categoryMap[catKey].items.push({
        id: it.id,
        name: it.name,
        price: it.price,
        store: it.store,
        date: it.date,
        imageUrl: it.imageUrl,
      });
    });
  });

  const categoriesList = Object.values(categoryMap).sort((a, b) => b.total - a.total);
  categoriesList.forEach(c => {
    c.percentage = totalSpent > 0 ? Math.round((c.total / totalSpent) * 100) : 0;
  });

  const activeGroup = selectedCategory ? categoryMap[selectedCategory] : null;

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <PieIcon className="w-3.5 h-3.5" />
            <span>Interactive Outflow Stream · Category Decomposition</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Where Does My Money Go?</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {formatPrice(totalSpent)} Total
            </span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Click any category block or chart segment to view individual receipts and see exactly what items made up that volume.
          </p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer self-start sm:self-auto"
          >
            Show All Categories
          </button>
        )}
      </div>

      {/* Visual Outflow Distribution: Blocks & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Interactive Colorful Category Cards (Prompt Section 9) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'ring-2 ring-purple-500 shadow-md bg-purple-50/50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-2xs"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <span>{cat.emoji}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {cat.count} purchases
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                    {formatPrice(cat.total)}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto mt-0.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Donut Chart Visual */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-2">
          <div className="h-48 w-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriesList}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  onClick={(entry: any) => setSelectedCategory(entry?.name ?? null)}
                >
                  {categoriesList.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.color}
                      strokeWidth={selectedCategory === entry.name ? 3 : 1}
                      stroke={selectedCategory === entry.name ? '#ffffff' : 'transparent'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatPrice(Number(val) || 0), 'Spent']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[9px] font-mono uppercase text-slate-400">Total</span>
              <span className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">
                {formatPrice(totalSpent)}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono text-center mt-2">
            Click segment or card to inspect purchases
          </span>
        </div>
      </div>

      {/* Individual Purchases Drawer for Selected Category (Prompt Section 9 Requirement) */}
      {activeGroup && (
        <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeGroup.emoji}</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeGroup.name} Purchases ({activeGroup.items.length} items)
                </h4>
                <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                  Total spent: {formatPrice(activeGroup.total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCategory(null)}
              className="p-1.5 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {activeGroup.items.map((it) => (
              <div
                key={it.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {it.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{it.store}</span>
                    <span>·</span>
                    <span>{it.date}</span>
                  </div>
                </div>
                <div className="font-mono font-extrabold text-slate-900 dark:text-white shrink-0">
                  {formatPrice(it.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
