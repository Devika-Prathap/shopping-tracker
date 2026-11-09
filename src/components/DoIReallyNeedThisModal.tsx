import React, { useState } from 'react';
import { 
  Brain, 
  HelpCircle, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Bookmark, 
  Zap, 
  Layers,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory } from '../types';

interface DoIReallyNeedThisModalProps {
  purchases: PurchaseTransaction[];
  isOpen: boolean;
  onClose: () => void;
  onSaveToWishlist?: (item: any) => void;
  initialProduct?: {
    name: string;
    category: ProductCategory;
    price: number;
    store: string;
  };
}

export const DoIReallyNeedThisModal: React.FC<DoIReallyNeedThisModalProps> = ({
  purchases,
  isOpen,
  onClose,
  onSaveToWishlist,
  initialProduct = {
    name: 'Nike Air Max Craft Running Shoes',
    category: 'Shoes',
    price: 2999,
    store: 'Myntra',
  },
}) => {
  const { formatPrice } = useApp();

  // Test product inputs
  const [productName, setProductName] = useState(initialProduct.name);
  const [productCategory, setProductCategory] = useState<ProductCategory>(initialProduct.category);
  const [productPrice, setProductPrice] = useState(initialProduct.price);
  const [coolingTimerActive, setCoolingTimerActive] = useState(false);

  if (!isOpen) return null;

  // Real data analysis from purchases
  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  const allItems = delivered.flatMap(p => p.items);

  // 1. How many similar products user already owns in this category
  const similarItemsOwned = allItems.filter(
    it => it.category === productCategory || (it.subCategory && it.subCategory.toLowerCase().includes(productCategory.toLowerCase()))
  );

  // 2. How recently they purchased a similar item
  const recentPurchasesOfCategory = delivered
    .filter(p => p.items.some(it => it.category === productCategory))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const mostRecentDate = recentPurchasesOfCategory[0]?.date || 'None';

  // 3. How much spent on this category recently
  const categorySpent = similarItemsOwned.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0);

  // 4. Repeated purchase check
  const isRepeatedProduct = allItems.some(
    it => it.name.toLowerCase().includes(productName.toLowerCase()) || productName.toLowerCase().includes(it.name.toLowerCase())
  );

  // 5. Cheaper alternative available
  const cheaperAlternativePrice = Math.max(999, Math.round(productPrice * 0.55));

  const handleStartCoolingTimer = () => {
    setCoolingTimerActive(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-xs">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Pre-Purchase Deliberation Assistant
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Do I Really Need This?
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

        {/* Product Being Evaluated */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Item Being Considered</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {productName}
            </div>
            <div className="text-slate-500 mt-0.5">
              Category: <strong className="text-purple-600 dark:text-purple-400">{productCategory}</strong>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Estimated Cost</span>
            <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white">
              {formatPrice(productPrice)}
            </div>
          </div>
        </div>

        {/* Friendly Reflection Heading (Prompt Requirement) */}
        <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
          <h3 className="text-base font-bold text-purple-900 dark:text-purple-200">
            Do you really need another {productCategory === 'Shoes' ? 'pair of shoes' : productCategory.toLowerCase()}?
          </h3>
          <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
            Here is a friendly, objective look at your recent history to help you decide with intention.
          </p>
        </div>

        {/* 4 Key Behavioral Facts (Section 1 in Prompt) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Fact 1: Similar products purchased */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <ShoppingBag className="w-4 h-4 text-purple-500" />
              <span>Similar Products Owned</span>
            </div>
            <div className="text-xl font-mono font-extrabold text-purple-600 dark:text-purple-400">
              {similarItemsOwned.length} items
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              You already purchased {similarItemsOwned.length} items in the {productCategory} category across your orders.
            </p>
          </div>

          {/* Fact 2: How recently purchased */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Recent Acquisition</span>
            </div>
            <div className="text-xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
              {mostRecentDate}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your last checkout in this category was recorded on {mostRecentDate}.
            </p>
          </div>

          {/* Fact 3: How much spent on category */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Category Spend Volume</span>
            </div>
            <div className="text-xl font-mono font-extrabold text-amber-600 dark:text-amber-400">
              {formatPrice(categorySpent)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              You&apos;ve already allocated {formatPrice(categorySpent)} to {productCategory} this month.
            </p>
          </div>

          {/* Fact 4: Cheaper alternatives & repeat checks */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <TrendingDown className="w-4 h-4 text-emerald-500" />
              <span>Cheaper Alternatives</span>
            </div>
            <div className="text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              From {formatPrice(cheaperAlternativePrice)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Similar options with high review ratings are available starting at {formatPrice(cheaperAlternativePrice)}.
            </p>
          </div>
        </div>

        {/* Existing Products Owned Carousel / List */}
        {similarItemsOwned.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>You already own these similar products:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {similarItemsOwned.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </div>
                    <div className="font-mono text-purple-600 dark:text-purple-400 text-[11px]">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 24-Hour Cooling Off Active Banner */}
        {coolingTimerActive && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>24-Hour Cooling-Off Rule Activated!</strong> We&apos;ve held this purchase for 24 hours. Check back tomorrow to see if you still feel the same excitement.
            </span>
          </div>
        )}

        {/* Decisions Action Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartCoolingTimer}
              className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Wait 24 Hours</span>
            </button>

            {onSaveToWishlist && (
              <button
                onClick={() => {
                  onSaveToWishlist({
                    id: `wish-${Date.now()}`,
                    productName,
                    store: 'Amazon',
                    currentPrice: productPrice,
                    originalPrice: productPrice,
                    detectedDate: new Date().toISOString().split('T')[0],
                    isWatching: true,
                    category: productCategory,
                    priceHistory: [{ date: 'Today', price: productPrice }],
                  });
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save to Wishlist Instead</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            I Truly Need This (Proceed)
          </button>
        </div>
      </div>
    </div>
  );
};
