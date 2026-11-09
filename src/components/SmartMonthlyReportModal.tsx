import React from 'react';
import { 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  X, 
  Store, 
  ShoppingBag, 
  TrendingDown, 
  ShieldCheck, 
  Flame, 
  Trophy, 
  Download,
  Share2,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction } from '../types';

interface SmartMonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchases: PurchaseTransaction[];
}

export const SmartMonthlyReportModal: React.FC<SmartMonthlyReportModalProps> = ({
  isOpen,
  onClose,
  purchases,
}) => {
  const { formatPrice } = useApp();

  if (!isOpen) return null;

  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  const totalSpent = delivered.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPurchases = delivered.length;
  
  // Unique stores
  const uniqueStores = Array.from(new Set(delivered.map(p => p.store)));
  const totalStores = uniqueStores.length;

  // Group by store
  const storeCounts: Record<string, number> = {};
  delivered.forEach(p => {
    storeCounts[p.store] = (storeCounts[p.store] || 0) + 1;
  });
  const mostUsedStore = Object.entries(storeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Amazon';

  // Group by category
  const catCounts: Record<string, number> = {};
  delivered.flatMap(p => p.items).forEach(it => {
    catCounts[it.category] = (catCounts[it.category] || 0) + (it.price * (it.quantity || 1));
  });
  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const mostPurchasedCat = sortedCats[0]?.[0] || 'Clothing';

  // Biggest & cheapest purchase
  const allDeliveredItems = delivered.flatMap(p => p.items).sort((a, b) => b.price - a.price);
  const biggestPurchase = allDeliveredItems[0] || { name: 'Sony WH-1000XM4', price: 3499, store: 'Amazon' };
  const cheapestPurchase = allDeliveredItems[allDeliveredItems.length - 1] || { name: 'GaN Cable 100W', price: 499, store: 'Amazon' };

  // Refunds
  const refundedCount = purchases.filter(p => p.isRefunded).length;
  const refundedAmount = purchases.filter(p => p.isRefunded).reduce((sum, p) => sum + (p.refundAmount || p.totalAmount), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Monthly Financial Review · September 2026
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Your Monthly Shopping Report
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Key Pillars Grid (Prompt Section 13) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Total Spent</span>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 dark:text-white">
              {formatPrice(totalSpent)}
            </div>
            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-bold">
              <ArrowDownRight className="w-3 h-3" /> 8% vs last month
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Purchases</span>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 dark:text-white">
              {totalPurchases} Orders
            </div>
            <span className="text-[10px] text-slate-400">~1 order every 3.2 days</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Stores Used</span>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 dark:text-white">
              {totalStores} Portals
            </div>
            <span className="text-[10px] text-slate-400">Top Hub: {mostUsedStore}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-0.5">
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 uppercase font-bold block">Money Saved</span>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹1,250
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300">Through alternatives</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-0.5">
            <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 uppercase font-bold block">Top Category</span>
            <div className="text-lg sm:text-xl font-extrabold text-purple-900 dark:text-purple-200 truncate">
              {mostPurchasedCat}
            </div>
            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-mono">
              {formatPrice(sortedCats[0]?.[1] || 0)} spend
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-0.5">
            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 uppercase font-bold block">Saving Streak</span>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Flame className="w-4 h-4" /> 7 Days
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-300">Active streak</span>
          </div>
        </div>

        {/* Detailed Breakdown Comparison Cards (Prompt Section 13) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Biggest vs Cheapest Purchase */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <ShoppingBag className="w-4 h-4 text-purple-500" />
              <span>Purchase Range Extremes</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">Biggest Purchase</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[160px] block">
                    {biggestPurchase.name}
                  </span>
                </div>
                <div className="font-mono font-extrabold text-purple-600 dark:text-purple-400 text-sm">
                  {formatPrice(biggestPurchase.price)}
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">Cheapest Purchase</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[160px] block">
                    {cheapestPurchase.name}
                  </span>
                </div>
                <div className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatPrice(cheapestPurchase.price)}
                </div>
              </div>
            </div>
          </div>

          {/* Refunds & Behavioral Insights */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Refunds & Habit Health</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">Refunds Processed</span>
                  <span className="font-bold text-slate-900 dark:text-white">{refundedCount} Returned Orders</span>
                </div>
                <div className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                  +{formatPrice(refundedAmount)} Reclaimed
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">
                  Smart Shopping Recommendation:
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Batching weekend footwear checkouts with the 48-hour cooling rule can save an estimated ₹1,500 next month!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Report finalized based on 9 reconciled transactions
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
