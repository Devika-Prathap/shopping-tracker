import React, { useState } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  Receipt, 
  X, 
  Clock, 
  ArrowUpRight, 
  ExternalLink,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory, PurchaseItem } from '../types';

interface StoresViewProps {
  purchases: PurchaseTransaction[];
  selectedStoreModal: string | null;
  onSelectStoreModal: (storeName: string | null) => void;
}

export const StoresView: React.FC<StoresViewProps> = ({
  purchases,
  selectedStoreModal,
  onSelectStoreModal,
}) => {
  const { formatPrice } = useApp();

  // Aggregate store stats
  const storeMap: Record<
    string,
    {
      name: string;
      purchasesCount: number;
      productsCount: number;
      totalSpent: number;
      lastDate: string;
      items: PurchaseItem[];
      categories: Record<string, number>;
      mostExpensive: { name: string; amount: number };
      color: string;
      pastelCardClass: string;
    }
  > = {};

  const pastelClasses = [
    'pastel-card-purple',
    'pastel-card-pink',
    'pastel-card-blue',
    'pastel-card-mint',
    'pastel-card-peach',
    'pastel-card-yellow',
  ];

  purchases.forEach((p, idx) => {
    if (!storeMap[p.store]) {
      storeMap[p.store] = {
        name: p.store,
        purchasesCount: 0,
        productsCount: 0,
        totalSpent: 0,
        lastDate: p.date,
        items: [],
        categories: {},
        mostExpensive: { name: '', amount: 0 },
        color: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f97316', '#eab308'][idx % 6],
        pastelCardClass: pastelClasses[idx % pastelClasses.length],
      };
    }

    const st = storeMap[p.store];
    st.purchasesCount += 1;
    st.totalSpent += p.totalAmount;
    if (new Date(p.date) > new Date(st.lastDate)) {
      st.lastDate = p.date;
    }

    p.items.forEach(it => {
      st.productsCount += it.quantity || 1;
      st.items.push(it);
      st.categories[it.category] = (st.categories[it.category] || 0) + it.price;
      if (it.price > st.mostExpensive.amount) {
        st.mostExpensive = { name: it.name, amount: it.price };
      }
    });
  });

  const storesList = Object.values(storeMap).sort((a, b) => b.totalSpent - a.totalSpent);

  // Active Store Modal Details
  const activeStore = selectedStoreModal ? storeMap[selectedStoreModal] : null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full min-w-0 box-border">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-100 via-purple-50 to-pink-50 dark:from-blue-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-blue-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
            <Store className="w-3.5 h-3.5" />
            Shopping Websites & Stores
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Where You Shop & How Much You Spend
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Detailed breakdown of shopping activity across every retailer. Click any store to see in-depth order history and analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
            <div className="text-[11px] text-slate-500 font-medium">Active Stores</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono">
              {storesList.length}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
            <div className="text-[11px] text-slate-500 font-medium">Top Store</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {storesList[0]?.name || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {storesList.map((store, index) => {
          const topCategoryEntry = Object.entries(store.categories).sort((a, b) => b[1] - a[1])[0];
          const topCategory = topCategoryEntry ? topCategoryEntry[0] : 'General';
          const avgOrder = store.purchasesCount > 0 ? store.totalSpent / store.purchasesCount : 0;

          return (
            <div
              key={store.name}
              onClick={() => onSelectStoreModal(store.name)}
              className={`p-5 rounded-3xl border ${store.pastelCardClass} shadow-xs hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-purple-600 dark:text-purple-400 shadow-xs border border-slate-200/50 dark:border-slate-800">
                      {store.name.substring(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {store.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400">
                    {store.purchasesCount} {store.purchasesCount === 1 ? 'order' : 'orders'}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Total Spent</span>
                    <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                      {formatPrice(store.totalSpent)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Average Order</span>
                    <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">
                      {formatPrice(avgOrder)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Top Category</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      {topCategory}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Last order: {store.lastDate}</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                  Analytics <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* STORE ANALYTICS MODAL */}
      {activeStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {activeStore.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {activeStore.name} Analytics
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You have shopped here <strong className="text-purple-600 dark:text-purple-400">{activeStore.purchasesCount} times</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectStoreModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Top Stats Callout */}
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">Total Spent</div>
                  <div className="text-lg font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {formatPrice(activeStore.totalSpent)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">Purchases</div>
                  <div className="text-lg font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {activeStore.purchasesCount} orders
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">Products</div>
                  <div className="text-lg font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {activeStore.productsCount} items
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">Avg Order Value</div>
                  <div className="text-lg font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {formatPrice(activeStore.totalSpent / activeStore.purchasesCount)}
                  </div>
                </div>
              </div>

              {/* Detailed Metrics List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Store Purchase Intelligence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-500 dark:text-slate-400">Most Expensive Purchase</span>
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {activeStore.mostExpensive.name || 'N/A'}
                    </div>
                    <div className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {formatPrice(activeStore.mostExpensive.amount)}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-500 dark:text-slate-400">Most Recent Order</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {activeStore.lastDate}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Verified Delivery
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Purchased from this store */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Products Bought from {activeStore.name} ({activeStore.items.length})
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  {activeStore.items.map((it) => (
                    <div key={it.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                          {it.imageUrl ? (
                            <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {it.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {it.category} · {it.subCategory}
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
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end">
              <button
                onClick={() => onSelectStoreModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
