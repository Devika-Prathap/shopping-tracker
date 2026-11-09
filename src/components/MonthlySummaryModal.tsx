import React from 'react';
import { 
  Calendar, 
  X, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Store, 
  Layers, 
  Award, 
  RotateCcw,
  Sparkles,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction } from '../types';

interface MonthlySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchases: PurchaseTransaction[];
}

export const MonthlySummaryModal: React.FC<MonthlySummaryModalProps> = ({
  isOpen,
  onClose,
  purchases,
}) => {
  const { formatPrice } = useApp();

  if (!isOpen) return null;

  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  const refunds = purchases.filter(p => p.isRefunded || p.orderStatus === 'Returned');
  const totalSpent = delivered.reduce((sum, p) => sum + p.totalAmount, 0);
  const purchasesCount = delivered.length;
  const uniqueStores = Array.from(new Set(delivered.map(p => p.store)));
  const avgOrder = purchasesCount > 0 ? totalSpent / purchasesCount : 0;

  // Biggest purchase
  let biggestItem = { name: 'None', price: 0, store: '' };
  delivered.flatMap(p => p.items).forEach(it => {
    if (it.price > biggestItem.price) {
      biggestItem = { name: it.name, price: it.price, store: it.store };
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                Monthly Spending Digest
              </span>
              <h3 className="text-xl font-bold tracking-tight mt-0.5">
                Your September Shopping Summary
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl pastel-card-purple border text-center">
              <div className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">Total Spent</div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                {formatPrice(totalSpent)}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center justify-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                -8.4% vs August
              </div>
            </div>

            <div className="p-4 rounded-2xl pastel-card-pink border text-center">
              <div className="text-[11px] text-pink-700 dark:text-pink-300 font-semibold">Total Purchases</div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                {purchasesCount} Orders
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Verified delivery
              </div>
            </div>

            <div className="p-4 rounded-2xl pastel-card-blue border text-center">
              <div className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold">Stores Used</div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                {uniqueStores.length} Stores
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Amazon, Myntra, etc.
              </div>
            </div>

            <div className="p-4 rounded-2xl pastel-card-mint border text-center">
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">Average Order</div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                {formatPrice(avgOrder)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Per transaction
              </div>
            </div>

            <div className="p-4 rounded-2xl pastel-card-peach border text-center">
              <div className="text-[11px] text-orange-700 dark:text-orange-300 font-semibold">Top Store</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Myntra
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Most frequent
              </div>
            </div>

            <div className="p-4 rounded-2xl pastel-card-yellow border text-center">
              <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">Refunds Processed</div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                {refunds.length}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                {formatPrice(refunds.reduce((s, r) => s + (r.refundAmount || 0), 0))} credited
              </div>
            </div>
          </div>

          {/* Biggest Purchase Callout */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Biggest Purchase of the Month
                </span>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {biggestItem.name}
                </div>
                <div className="text-xs text-slate-500">
                  Store: {biggestItem.store}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
                {formatPrice(biggestItem.price)}
              </div>
              <span className="text-[10px] font-semibold text-emerald-600">Verified</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
