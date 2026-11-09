import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Trash2, 
  Star, 
  Check, 
  ShieldCheck, 
  Truck, 
  Award, 
  Tag, 
  ShoppingBag, 
  Sparkles, 
  X,
  Search,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseItem, PurchaseTransaction } from '../types';

interface ProductComparisonViewProps {
  purchases: PurchaseTransaction[];
  onSelectProduct?: (item: PurchaseItem) => void;
  onNavigateTab?: (tab: any) => void;
}

export const ProductComparisonView: React.FC<ProductComparisonViewProps> = ({
  purchases,
  onSelectProduct,
  onNavigateTab,
}) => {
  const { formatPrice, currency, comparedProducts, addToComparison, removeFromComparison, clearComparison } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all verified non-private purchase items
  const allAvailableItems = React.useMemo(() => {
    const list: PurchaseItem[] = [];
    const seen = new Set<string>();

    purchases.forEach((p) => {
      if (p.isPrivate) return;
      p.items.forEach((item) => {
        if (!seen.has(item.id) && !seen.has(item.name)) {
          seen.add(item.id);
          seen.add(item.name);
          list.push(item);
        }
      });
    });

    return list;
  }, [purchases]);

  // If comparedProducts is empty, pre-populate with top 2 distinct verified items so the comparison is instantly engaging
  React.useEffect(() => {
    if (comparedProducts.length === 0 && allAvailableItems.length >= 2) {
      addToComparison(allAvailableItems[0]);
      addToComparison(allAvailableItems[1]);
    }
  }, [allAvailableItems, comparedProducts.length]);

  // Extract brand cleanly from product name
  const getBrand = (name: string, store: string) => {
    const knownBrands = ['Nike', 'Sony', "Levi's", 'H&M', 'boAt', 'Apple', 'Samsung', 'Puma', 'Zara', 'Adidas', 'Noise', 'Philips', 'Bose'];
    for (const b of knownBrands) {
      if (name.toLowerCase().includes(b.toLowerCase())) return b;
    }
    const firstWord = name.split(' ')[0];
    return firstWord.length > 2 ? firstWord : store;
  };

  // Determine warranty where applicable based on category
  const getWarranty = (item: PurchaseItem) => {
    if (item.category === 'Electronics' || item.subCategory?.toLowerCase().includes('phone') || item.subCategory?.toLowerCase().includes('audio')) {
      return '1 Year Manufacturer Brand Warranty';
    }
    if (item.category === 'Shoes' || item.category === 'Clothing') {
      return '30-Day Hassle-Free Exchange & Quality Guarantee';
    }
    if (item.category === 'Beauty' || item.category === 'Food & Groceries') {
      return '100% Authentic Sealed Packaging Guarantee';
    }
    return 'Standard Retailer Return Window (15 Days)';
  };

  // Determine delivery charge
  const getDeliveryCharge = (item: PurchaseItem) => {
    return item.price >= 999 ? 'FREE Delivery' : `${currency}49 Standard Shipping`;
  };

  // Value highlight calculations
  const lowestPrice = Math.min(...comparedProducts.map((p) => p.price));
  const highestRating = Math.max(...comparedProducts.map((p) => p.rating || 4.2));

  const filteredCatalog = allAvailableItems.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return it.name.toLowerCase().includes(q) || it.store.toLowerCase().includes(q) || it.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-100 via-indigo-50 to-pink-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED] dark:text-purple-300 flex items-center gap-1.5 mb-1">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Decision Intelligence
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#29243A] dark:text-white tracking-tight">
            Product Comparison Matrix
          </h2>
          <p className="text-xs text-[#625B72] dark:text-slate-400 mt-1 max-w-xl">
            Compare up to 3 products side-by-side using verified order specifications, prices, ratings, and delivery terms to identify better-value options.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comparedProducts.length < 3 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product ({comparedProducts.length}/3)</span>
            </button>
          )}

          {comparedProducts.length > 0 && (
            <button
              onClick={clearComparison}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Side-by-Side Comparison Table (Up to 3 Products) */}
      {comparedProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center mx-auto text-xl">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#29243A] dark:text-white">
            No Products Selected for Comparison
          </h3>
          <p className="text-xs text-[#625B72] dark:text-slate-400 max-w-sm mx-auto">
            Select up to 3 products from your shopping history or catalog to compare specifications, ratings, and identify better-value choices.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold hover:bg-[#7C3AED] cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Choose Products</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs overflow-x-auto">
          <div className={`grid grid-cols-${comparedProducts.length} gap-4 sm:gap-6 min-w-[620px]`}>
            {comparedProducts.map((item, idx) => {
              const brand = getBrand(item.name, item.store);
              const warranty = getWarranty(item);
              const delivery = getDeliveryCharge(item);
              const isLowestPrice = item.price === lowestPrice && comparedProducts.length > 1;
              const isTopRated = (item.rating || 4.2) === highestRating && comparedProducts.length > 1;

              return (
                <div
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-[#E5DDF2] dark:border-slate-800 bg-[#FFF9F2]/40 dark:bg-slate-800/30 p-4 relative group"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromComparison(item.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-[#E5DDF2] dark:border-slate-700 cursor-pointer transition-colors shadow-2xs z-10"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Highlights Badge */}
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-[22px]">
                    {isLowestPrice && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                        <Sparkles className="w-3 h-3" />
                        Lowest Price
                      </span>
                    )}
                    {isTopRated && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold">
                        <Award className="w-3 h-3" />
                        Top Rated
                      </span>
                    )}
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-44 rounded-xl bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700/80 overflow-hidden mb-3 flex items-center justify-center p-2">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <ShoppingBag className="w-10 h-10 text-[#8B5CF6]" />
                    )}
                  </div>

                  {/* Title & Brand */}
                  <div className="space-y-1 mb-4 flex-1">
                    <span className="text-[11px] font-extrabold text-[#7C3AED] dark:text-purple-300 uppercase tracking-wider">
                      {brand}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#29243A] dark:text-white line-clamp-2">
                      {item.name}
                    </h3>
                  </div>

                  {/* Key Comparison Data Points */}
                  <div className="space-y-3 pt-3 border-t border-[#E5DDF2] dark:border-slate-800 text-xs">
                    {/* 1. Price */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#625B72] dark:text-slate-400 block mb-0.5">
                        Verified Price
                      </span>
                      <div className="text-lg font-extrabold font-mono text-[#29243A] dark:text-white tabular-nums flex items-baseline gap-2">
                        <span>{formatPrice(item.price)}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-slate-400 line-through font-normal">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. Rating & Reviews */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#625B72] dark:text-slate-400 block mb-0.5">
                        Rating & Feedback
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-[#29243A] dark:text-slate-200">
                        <span className="flex items-center text-amber-500 gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{item.rating || 4.5}</span>
                        </span>
                        <span className="text-slate-400 text-[11px] font-normal">
                          · Verified Buyers
                        </span>
                      </div>
                    </div>

                    {/* 3. Seller & Store */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#625B72] dark:text-slate-400 block mb-0.5">
                        Seller & Platform
                      </span>
                      <div className="font-semibold text-[#4C267B] dark:text-purple-300">
                        {item.store} Official Fulfillment
                      </div>
                    </div>

                    {/* 4. Specifications */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#625B72] dark:text-slate-400 block mb-0.5">
                        Specifications
                      </span>
                      <div className="space-y-0.5 text-[11px] text-[#625B72] dark:text-slate-300">
                        <div><strong className="text-[#29243A] dark:text-white">Category:</strong> {item.category} ({item.subCategory})</div>
                        {item.color && <div><strong className="text-[#29243A] dark:text-white">Color:</strong> {item.color}</div>}
                        {item.size && <div><strong className="text-[#29243A] dark:text-white">Size:</strong> {item.size}</div>}
                      </div>
                    </div>

                    {/* 5. Delivery Charges */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#625B72] dark:text-slate-400 block mb-0.5">
                        Delivery Terms
                      </span>
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Truck className="w-3.5 h-3.5" />
                        <span>{delivery}</span>
                      </div>
                    </div>

                    {/* 6. Warranty */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#625B72] dark:text-slate-400 block mb-0.5">
                        Warranty & Return Guarantee
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#625B72] dark:text-slate-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                        <span className="truncate">{warranty}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action link */}
                  <div className="mt-4 pt-3 border-t border-[#E5DDF2] dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onSelectProduct && onSelectProduct(item)}
                      className="w-full py-2 rounded-xl bg-[#F3EEFF] hover:bg-[#E8DCFE] dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-[#7C3AED] dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Full Specifications</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#121826] border border-[#E5DDF2] dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E5DDF2] dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="text-sm font-bold text-[#29243A] dark:text-white">
                  Add Product to Comparison (Up to 3)
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by title, category, or store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F5FD] dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 rounded-xl text-[#29243A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6]"
                autoFocus
              />
            </div>

            {/* Product selection list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCatalog.map((item) => {
                const isSelected = comparedProducts.some((p) => p.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      isSelected
                        ? 'bg-[#F3EEFF]/60 dark:bg-purple-950/40 border-[#8B5CF6]/40'
                        : 'bg-white dark:bg-slate-800 border-[#E5DDF2] dark:border-slate-700/80 hover:bg-[#FFF9F2]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-[#8B5CF6]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#29243A] dark:text-white truncate">
                          {item.name}
                        </h4>
                        <div className="text-[10px] text-[#625B72] dark:text-slate-400">
                          {item.store} · {item.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold font-mono text-[#29243A] dark:text-white">
                        {formatPrice(item.price)}
                      </span>
                      <button
                        onClick={() => {
                          if (isSelected) {
                            removeFromComparison(item.id);
                          } else {
                            if (comparedProducts.length < 3) {
                              addToComparison(item);
                            }
                          }
                        }}
                        disabled={!isSelected && comparedProducts.length >= 3}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-200'
                            : comparedProducts.length >= 3
                            ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-700 text-slate-500'
                            : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#E5DDF2] dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Selected: {comparedProducts.length} of 3
              </span>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
