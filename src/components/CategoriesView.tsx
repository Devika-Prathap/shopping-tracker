import React, { useState } from 'react';
import { 
  Shirt, 
  Footprints, 
  Laptop, 
  Sparkles, 
  Briefcase, 
  Home, 
  BookOpen, 
  Utensils, 
  Gamepad2, 
  Smartphone, 
  Gift, 
  Package,
  Layers,
  ArrowRight,
  Receipt,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCategory, PurchaseTransaction, PurchaseItem } from '../types';

interface CategoriesViewProps {
  purchases: PurchaseTransaction[];
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ purchases }) => {
  const { formatPrice } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  const categoryDefinitions: { 
    name: ProductCategory; 
    icon: React.ReactNode; 
    color: string; 
    pastelBg: string;
    subcategories: string[];
  }[] = [
    { name: 'Clothing', icon: <Shirt className="w-5 h-5 text-pink-500" />, color: '#ec4899', pastelBg: 'pastel-card-pink', subcategories: ['Tops', 'T-shirts', 'Shirts', 'Jeans', 'Dresses', 'Jackets'] },
    { name: 'Shoes', icon: <Footprints className="w-5 h-5 text-cyan-500" />, color: '#06b6d4', pastelBg: 'pastel-card-blue', subcategories: ['Sneakers', 'Formal shoes', 'Sandals', 'Slippers'] },
    { name: 'Electronics', icon: <Laptop className="w-5 h-5 text-purple-500" />, color: '#8b5cf6', pastelBg: 'pastel-card-purple', subcategories: ['Phones', 'Laptops', 'Headphones', 'Chargers', 'Accessories'] },
    { name: 'Beauty', icon: <Sparkles className="w-5 h-5 text-rose-500" />, color: '#f43f5e', pastelBg: 'pastel-card-pink', subcategories: ['Skincare', 'Fragrance', 'Makeup', 'Haircare'] },
    { name: 'Accessories', icon: <Briefcase className="w-5 h-5 text-amber-500" />, color: '#f59e0b', pastelBg: 'pastel-card-yellow', subcategories: ['Watches', 'Bags', 'Wallets', 'Eyewear', 'Belts'] },
    { name: 'Home & Living', icon: <Home className="w-5 h-5 text-emerald-500" />, color: '#10b981', pastelBg: 'pastel-card-mint', subcategories: ['Decor', 'Kitchen', 'Bedding', 'Lighting'] },
    { name: 'Books & Stationery', icon: <BookOpen className="w-5 h-5 text-indigo-500" />, color: '#6366f1', pastelBg: 'pastel-card-blue', subcategories: ['Fiction', 'Productivity', 'Notebooks', 'Pens'] },
    { name: 'Food & Groceries', icon: <Utensils className="w-5 h-5 text-teal-500" />, color: '#14b8a6', pastelBg: 'pastel-card-mint', subcategories: ['Snacks', 'Beverages', 'Pantry', 'Gourmet'] },
    { name: 'Gaming', icon: <Gamepad2 className="w-5 h-5 text-violet-500" />, color: '#7c3aed', pastelBg: 'pastel-card-purple', subcategories: ['Consoles', 'Controllers', 'Keyboards', 'Games'] },
    { name: 'Mobile Accessories', icon: <Smartphone className="w-5 h-5 text-blue-500" />, color: '#3b82f6', pastelBg: 'pastel-card-blue', subcategories: ['Chargers', 'Cables', 'Cases', 'Screen Guards'] },
    { name: 'Gifts', icon: <Gift className="w-5 h-5 text-orange-500" />, color: '#f97316', pastelBg: 'pastel-card-peach', subcategories: ['Festive', 'Birthday', 'Cards', 'Hampers'] },
    { name: 'Other', icon: <Package className="w-5 h-5 text-slate-500" />, color: '#64748b', pastelBg: 'pastel-card-yellow', subcategories: ['General items', 'Miscellaneous'] },
  ];

  // Flatten items
  const allDeliveredItems = purchases
    .filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled')
    .flatMap(p => p.items);

  const totalSpentAll = allDeliveredItems.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);

  // Group items by category
  const categoryStats = categoryDefinitions.map(cat => {
    const itemsInCat = allDeliveredItems.filter(it => it.category === cat.name);
    const amount = itemsInCat.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
    const storesSet = new Set(itemsInCat.map(it => it.store));
    const percentage = totalSpentAll > 0 ? Math.round((amount / totalSpentAll) * 100) : 0;

    return {
      ...cat,
      amount,
      items: itemsInCat,
      itemCount: itemsInCat.reduce((acc, it) => acc + (it.quantity || 1), 0),
      storesCount: storesSet.size,
      percentage,
    };
  }).sort((a, b) => b.amount - a.amount);

  const activeCategoryData = selectedCategory ? categoryStats.find(c => c.name === selectedCategory) : null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full min-w-0 box-border">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-pink-100 via-purple-50 to-teal-50 dark:from-pink-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-pink-200/80 dark:border-pink-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5" />
            AI-Categorized Segments
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Category Tracking & Spending Breakdown
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Automatically organized into 12 dedicated shopping segments with smart subcategories. Click any category to view all purchased products.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Top Category</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {categoryStats[0]?.name || 'N/A'} ({categoryStats[0]?.percentage}%)
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categoryStats.map(cat => {
          const isSelected = selectedCategory === cat.name;

          return (
            <div
              key={cat.name}
              onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
              className={`p-5 rounded-3xl border ${cat.pastelBg} shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                isSelected ? 'ring-2 ring-purple-500 scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 shadow-xs border border-slate-200/50 dark:border-slate-800">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {cat.itemCount} {cat.itemCount === 1 ? 'product' : 'products'} · {cat.storesCount} stores
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300">
                    {cat.percentage}%
                  </span>
                </div>

                <div className="mt-4">
                  <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                    {formatPrice(cat.amount)}
                  </span>
                </div>

                {/* Subcategories preview */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {cat.subcategories.slice(0, 3).map(sub => (
                    <span
                      key={sub}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400"
                    >
                      {sub}
                    </span>
                  ))}
                  {cat.subcategories.length > 3 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{cat.subcategories.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                <span>View {cat.itemCount} items</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Category Drill-Down View */}
      {activeCategoryData && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                {activeCategoryData.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeCategoryData.name} — All Purchases
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatPrice(activeCategoryData.amount)} spent across {activeCategoryData.itemCount} products from {activeCategoryData.storesCount} stores
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCategory(null)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of items */}
          {activeCategoryData.items.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No products recorded in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeCategoryData.items.map(it => (
                <div
                  key={it.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shirt className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {it.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {it.store} · {it.subCategory}
                        {it.size ? ` · Size ${it.size}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatPrice(it.price)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {it.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
