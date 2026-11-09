import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  ShoppingCart, 
  Moon, 
  Brain, 
  ArrowRight, 
  Layers, 
  Check, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Hourglass, 
  TrendingDown, 
  Zap, 
  Tag, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, SmartCartItem, ProductCategory } from '../types';
import { SmartCart } from './SmartCart';
import { ImpulsePurchaseDetector } from './ImpulsePurchaseDetector';
import { DoIReallyNeedThisModal } from './DoIReallyNeedThisModal';

interface SmartShoppingViewProps {
  purchases: PurchaseTransaction[];
  onOpenStoreModal?: (store: string) => void;
}

export const SmartShoppingView: React.FC<SmartShoppingViewProps> = ({
  purchases,
  onOpenStoreModal,
}) => {
  const { formatPrice } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'decision_helper' | 'impulse_patterns' | 'similar_owned' | 'smart_cart'>('decision_helper');
  const [showNeedModal, setShowNeedModal] = useState(false);
  const [selectedProductForCheck, setSelectedProductForCheck] = useState<{
    name: string;
    category: ProductCategory;
    price: number;
    store: string;
  } | undefined>(undefined);

  // Delivered items for similar ownership checks
  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  const allItems = delivered.flatMap(p => p.items);

  // Group similar items by category
  const categoryCounts = allItems.reduce<Record<string, { count: number; totalSpent: number; items: typeof allItems }>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, totalSpent: 0, items: [] };
    }
    acc[item.category].count += (item.quantity || 1);
    acc[item.category].totalSpent += (item.price * (item.quantity || 1));
    acc[item.category].items.push(item);
    return acc;
  }, {});

  const handleOpenTestNeed = (sampleName: string, sampleCat: ProductCategory, samplePrice: number, sampleStore: string) => {
    setSelectedProductForCheck({
      name: sampleName,
      category: sampleCat,
      price: samplePrice,
      store: sampleStore,
    });
    setShowNeedModal(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 border border-indigo-200/80 dark:border-indigo-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
            <Brain className="w-3.5 h-3.5" />
            Mindful Shopping AI Assistant
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Smart Shopping & Impulse Control
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Evaluate prospective purchases before checking out, review similar products you already own, understand impulse habits, and curate your Smart Cart.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProductForCheck(undefined);
            setShowNeedModal(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
        >
          <HelpCircle className="w-4 h-4" />
          <span>"Do I Really Need This?" Check</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'decision_helper', label: 'Do I Really Need This?', icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'similar_owned', label: 'Items Already Owned', icon: <Layers className="w-4 h-4" /> },
          { id: 'impulse_patterns', label: 'Impulse Purchase Patterns', icon: <Moon className="w-4 h-4" /> },
          { id: 'smart_cart', label: 'Smart Cart (Waitlist)', icon: <ShoppingCart className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SubTab Content */}
      {activeSubTab === 'decision_helper' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pre-Purchase Decision Framework
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Test any item you are about to purchase against your past order habits, current closet inventory, and alternative lower-cost options.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div 
                onClick={() => handleOpenTestNeed('Sony Wireless ANC Headphones', 'Electronics', 3499, 'Amazon')}
                className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 hover:border-indigo-400 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                  Sample Test #1
                </span>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Sony Wireless Headphones</div>
                <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">₹3,499 · Amazon</div>
                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-semibold">
                  <span>Run Need Test</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div 
                onClick={() => handleOpenTestNeed('Nike Air Max Craft Sneaker', 'Shoes', 2999, 'Myntra')}
                className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 hover:border-purple-400 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                  Sample Test #2
                </span>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Nike Air Max Sneaker</div>
                <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 mt-1">₹2,999 · Myntra</div>
                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-semibold">
                  <span>Run Need Test</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div 
                onClick={() => handleOpenTestNeed('Oversized Cotton Linen Shirt', 'Clothing', 899, 'AJIO')}
                className="p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-800/40 hover:border-pink-400 cursor-pointer transition-all"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 block mb-1">
                  Sample Test #3
                </span>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Linen Casual Shirt</div>
                <div className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400 mt-1">₹899 · AJIO</div>
                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-semibold">
                  <span>Run Need Test</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'similar_owned' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Inventory of Similar Items Already Purchased
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Before buying another item in these categories, review what is already delivered and active in your home.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryCounts).map(([cat, data]) => (
                <div
                  key={cat}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{cat}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                      {data.count} items owned
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    Total spent: {formatPrice(data.totalSpent)}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {data.items.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                        <span className="truncate max-w-[160px] font-medium">{it.name}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{formatPrice(it.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'impulse_patterns' && (
        <ImpulsePurchaseDetector
          purchases={purchases}
          onOpenCoolingModal={() => {
            setSelectedProductForCheck(undefined);
            setShowNeedModal(true);
          }}
        />
      )}

      {activeSubTab === 'smart_cart' && (
        <SmartCart />
      )}

      {/* Modal */}
      <DoIReallyNeedThisModal
        purchases={purchases}
        isOpen={showNeedModal}
        onClose={() => setShowNeedModal(false)}
        initialProduct={selectedProductForCheck}
      />
    </div>
  );
};
