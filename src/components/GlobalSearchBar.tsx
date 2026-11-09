import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Store, 
  Tag, 
  ArrowRight, 
  ShoppingBag, 
  RotateCcw,
  Receipt,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory } from '../types';

export interface SearchFilterState {
  query: string;
  store: string; // 'ALL' or merchant name
  category: string; // 'ALL' or category name
  priceRange: 'ALL' | 'under1000' | '1000-3000' | '3000-7000' | 'above7000' | 'custom';
  minPrice?: number | '';
  maxPrice?: number | '';
}

interface GlobalSearchBarProps {
  purchases: PurchaseTransaction[];
  onSelectPurchase?: (purchase: PurchaseTransaction) => void;
  onApplySearchToPurchases?: (filter: SearchFilterState, highlightedId?: string) => void;
  className?: string;
}

const CATEGORIES: ProductCategory[] = [
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
];

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  purchases,
  onSelectPurchase,
  onApplySearchToPurchases,
  className = '',
}) => {
  const { formatPrice, currency } = useApp();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [priceRange, setPriceRange] = useState<'ALL' | 'under1000' | '1000-3000' | '3000-7000' | 'above7000' | 'custom'>('ALL');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  
  // Quick receipt modal (kept clean and non-disruptive)
  const [previewPurchase, setPreviewPurchase] = useState<PurchaseTransaction | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available unique merchants
  const availableStores = useMemo(() => {
    const stores = Array.from(new Set(purchases.map(p => p.store)));
    return stores.sort();
  }, [purchases]);

  // Global keyboard shortcut to focus search: Cmd+K / Ctrl+K or '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setShowFiltersPanel(false);
        setPreviewPurchase(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside to close dropdown (NO full-screen dark overlay!)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowFiltersPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedStore !== 'ALL' ||
      selectedCategory !== 'ALL' ||
      priceRange !== 'ALL' ||
      minPrice !== '' ||
      maxPrice !== '' ||
      query.trim().length > 0
    );
  }, [selectedStore, selectedCategory, priceRange, minPrice, maxPrice, query]);

  // Count active filter conditions (excluding text query)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedStore !== 'ALL') count++;
    if (selectedCategory !== 'ALL') count++;
    if (priceRange !== 'ALL' || minPrice !== '' || maxPrice !== '') count++;
    return count;
  }, [selectedStore, selectedCategory, priceRange, minPrice, maxPrice]);

  // Filtered transactions
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      // 1. Merchant filter
      if (selectedStore !== 'ALL' && p.store !== selectedStore) {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'ALL') {
        const hasCategory = p.items.some((i) => i.category === selectedCategory);
        if (!hasCategory) return false;
      }

      // 3. Price range filter
      const total = p.totalAmount;
      if (priceRange === 'under1000' && total >= 1000) return false;
      if (priceRange === '1000-3000' && (total < 1000 || total > 3000)) return false;
      if (priceRange === '3000-7000' && (total < 3000 || total > 7000)) return false;
      if (priceRange === 'above7000' && total <= 7000) return false;
      if (priceRange === 'custom') {
        if (minPrice !== '' && total < Number(minPrice)) return false;
        if (maxPrice !== '' && total > Number(maxPrice)) return false;
      }

      // 4. Text search query
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesStore = p.store.toLowerCase().includes(q);
        const matchesOrder = p.orderNumber.toLowerCase().includes(q);
        const matchesPayment = (p.paymentMethod || '').toLowerCase().includes(q);
        const matchesDate = (p.date || '').toLowerCase().includes(q);
        const matchesItems = p.items.some(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            it.category.toLowerCase().includes(q) ||
            it.subCategory.toLowerCase().includes(q) ||
            (it.tags && it.tags.some(t => t.toLowerCase().includes(q)))
        );

        if (!matchesStore && !matchesOrder && !matchesPayment && !matchesItems && !matchesDate) {
          return false;
        }
      }

      return true;
    });
  }, [purchases, selectedStore, selectedCategory, priceRange, minPrice, maxPrice, query]);

  // Only show top 4–5 relevant results in the compact dropdown
  const visiblePurchases = useMemo(() => {
    return filteredPurchases.slice(0, 5);
  }, [filteredPurchases]);

  // Reset all filters
  const handleResetFilters = () => {
    setQuery('');
    setSelectedStore('ALL');
    setSelectedCategory('ALL');
    setPriceRange('ALL');
    setMinPrice('');
    setMaxPrice('');
  };

  // Navigate to Purchases view with current filter applied
  const handleOpenInPurchases = (highlightedId?: string) => {
    const filterState: SearchFilterState = {
      query,
      store: selectedStore,
      category: selectedCategory,
      priceRange,
      minPrice,
      maxPrice,
    };
    if (onApplySearchToPurchases) {
      onApplySearchToPurchases(filterState, highlightedId);
    }
    setIsOpen(false);
    setShowFiltersPanel(false);
  };

  // Select a purchase for quick view
  const handleItemClick = (p: PurchaseTransaction) => {
    if (onSelectPurchase) {
      onSelectPurchase(p);
      setIsOpen(false);
    } else {
      setPreviewPurchase(p);
    }
  };

  return (
    <>
      <div ref={containerRef} className={`relative ${className}`}>
        {/* Search input container */}
        <div className="relative flex items-center">
          <div className="absolute left-2.5 pointer-events-none text-[#625B72] dark:text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            placeholder="Search purchases..."
            className="w-full pl-7 pr-12 py-1.5 text-xs bg-[#F8F5FD] dark:bg-[#131A2B] hover:bg-[#F3EEFF]/60 dark:hover:bg-slate-800/80 focus:bg-white dark:focus:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-xl text-[#1E1B2E] dark:text-white placeholder:text-[#625B72]/70 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6] transition-all shadow-2xs"
          />

          {/* Right actions: Clear button and Filter toggle */}
          <div className="absolute right-1 flex items-center gap-0.5">
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-[#625B72] hover:text-[#29243A] dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                title="Clear query"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setShowFiltersPanel(!showFiltersPanel);
                if (!isOpen) setIsOpen(true);
              }}
              className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFiltersCount > 0
                  ? 'bg-purple-100 text-[#7C3AED] dark:bg-purple-950/80 dark:text-purple-300 font-bold'
                  : 'text-[#625B72] hover:text-[#29243A] dark:text-slate-400 dark:hover:text-white hover:bg-[#F3EEFF] dark:hover:bg-slate-800'
              }`}
              title="Filters"
            >
              <SlidersHorizontal className="w-3 h-3" />
              {activeFiltersCount > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-[#8B5CF6] text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPACT SEARCH DROPDOWN POPOVER                                           */}
        {/* Directly beneath search bar, max width 380-400px, NO dark overlay         */}
        {/* ========================================================================= */}
        {isOpen && (
          <div 
            className="absolute right-0 top-full mt-1.5 w-[min(400px,calc(100vw-2rem))] bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl shadow-xl z-40 overflow-hidden animate-fadeIn"
            style={{ filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.08))' }}
          >
            {/* Filter Configuration Panel */}
            <div className="p-3 border-b border-[#E5DDF2] dark:border-slate-800/80 bg-[#FBF8FF] dark:bg-[#0E1422]/80">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#4C267B] dark:text-purple-300 uppercase tracking-wider cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#8B5CF6]" />
                  <span>Filters</span>
                  <ChevronDown className={`w-3 h-3 text-[#625B72] transition-transform ${showFiltersPanel ? 'rotate-180' : ''}`} />
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Collapsible / Expandable Filter Controls */}
              {showFiltersPanel && (
                <div className="space-y-2 pt-1 pb-1 animate-fadeIn">
                  {/* Clean 3-row compact stacked filter inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* 1. Store Filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#625B72] dark:text-slate-400 mb-0.5 flex items-center gap-1">
                        <Store className="w-2.5 h-2.5 text-[#8B5CF6]" />
                        Store
                      </label>
                      <select
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 rounded-lg px-2 py-1 text-[#29243A] dark:text-slate-200 focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                      >
                        <option value="ALL">All Stores</option>
                        {availableStores.map((store) => (
                          <option key={store} value={store}>
                            {store}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Category Filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#625B72] dark:text-slate-400 mb-0.5 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-indigo-500" />
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 rounded-lg px-2 py-1 text-[#29243A] dark:text-slate-200 focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                      >
                        <option value="ALL">All Categories</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Price Range Filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#625B72] dark:text-slate-400 mb-0.5 flex items-center gap-1">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{currency}</span>
                        Price
                      </label>
                      <select
                        value={priceRange}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setPriceRange(val);
                          if (val !== 'custom') {
                            setMinPrice('');
                            setMaxPrice('');
                          }
                        }}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 rounded-lg px-2 py-1 text-[#29243A] dark:text-slate-200 focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                      >
                        <option value="ALL">All Prices</option>
                        <option value="under1000">&lt; {currency}1k</option>
                        <option value="1000-3000">{currency}1k - 3k</option>
                        <option value="3000-7000">{currency}3k - 7k</option>
                        <option value="above7000">&gt; {currency}7k</option>
                        <option value="custom">Custom...</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Price Range Min/Max Inputs */}
                  {priceRange === 'custom' && (
                    <div className="pt-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#625B72] dark:text-slate-400 whitespace-nowrap">
                        Range ({currency}):
                      </span>
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                          className="w-full text-xs bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 rounded-lg px-2 py-0.5 text-[#29243A] dark:text-white focus:outline-none focus:border-[#8B5CF6]"
                        />
                        <span className="text-slate-400 text-xs">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                          className="w-full text-xs bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 rounded-lg px-2 py-0.5 text-[#29243A] dark:text-white focus:outline-none focus:border-[#8B5CF6]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  {selectedStore !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F3EEFF] text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-semibold">
                      {selectedStore}
                      <button onClick={() => setSelectedStore('ALL')} className="hover:opacity-75 cursor-pointer">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}

                  {selectedCategory !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] font-semibold">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory('ALL')} className="hover:opacity-75 cursor-pointer">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}

                  {priceRange !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold">
                      {priceRange === 'under1000' && `< ${currency}1k`}
                      {priceRange === '1000-3000' && `${currency}1k-3k`}
                      {priceRange === '3000-7000' && `${currency}3k-7k`}
                      {priceRange === 'above7000' && `> ${currency}7k`}
                      {priceRange === 'custom' && `${minPrice || 0}-${maxPrice || '∞'}`}
                      <button onClick={() => { setPriceRange('ALL'); setMinPrice(''); setMaxPrice(''); }} className="hover:opacity-75 cursor-pointer">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}

                  {query.trim() && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#29243A] dark:text-slate-300 text-[10px] font-semibold">
                      "{query}"
                      <button onClick={() => setQuery('')} className="hover:opacity-75 cursor-pointer">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results Header: Count & Quick Link */}
            <div className="px-3 py-1.5 border-b border-[#E5DDF2]/60 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-[#131A2B] text-xs">
              <span className="text-[11px] font-bold text-[#625B72] dark:text-slate-400">
                {filteredPurchases.length === 0 ? (
                  'No transactions found'
                ) : (
                  <>
                    Showing <span className="text-[#8B5CF6] font-bold">{visiblePurchases.length}</span> of {filteredPurchases.length}
                  </>
                )}
              </span>

              {filteredPurchases.length > 0 && (
                <button
                  onClick={() => handleOpenInPurchases()}
                  className="text-[11px] font-bold text-[#8B5CF6] dark:text-purple-400 hover:text-[#7C3AED] dark:hover:text-purple-300 flex items-center gap-0.5 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Matching Transactions List: Max 5 items, max-h-64 */}
            <div className="max-h-64 overflow-y-auto divide-y divide-[#E5DDF2]/60 dark:divide-slate-800/60 p-1">
              {filteredPurchases.length === 0 ? (
                <div className="py-6 px-3 text-center">
                  <div className="w-8 h-8 rounded-full bg-[#F3EEFF] dark:bg-slate-800 flex items-center justify-center mx-auto text-[#8B5CF6] dark:text-purple-400 mb-1.5">
                    <Search className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#29243A] dark:text-white">
                    No matching transactions
                  </h4>
                  <p className="text-[11px] text-[#625B72] dark:text-slate-400 mt-0.5">
                    Try adjusting the store, category, or price range.
                  </p>
                </div>
              ) : (
                visiblePurchases.map((purchase) => {
                  const firstItem = purchase.items[0];
                  const totalItems = purchase.items.length;

                  return (
                    <div
                      key={purchase.id}
                      onClick={() => handleItemClick(purchase)}
                      className="group p-2 rounded-xl hover:bg-[#F3EEFF]/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between gap-2.5"
                    >
                      {/* Product thumbnail */}
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                        {firstItem?.imageUrl ? (
                          <img
                            src={firstItem.imageUrl}
                            alt={firstItem.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-[#8B5CF6]" />
                        )}
                      </div>

                      {/* Main details: Store badge, Date, Item Name, Category */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#7C3AED] dark:text-purple-300 bg-[#F3EEFF] dark:bg-purple-950/70 px-1.5 py-0.2 rounded">
                            {purchase.store}
                          </span>
                          <span className="text-[10px] text-[#625B72] dark:text-slate-400 font-mono">
                            {purchase.date}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-[#29243A] dark:text-white truncate mt-0.5 group-hover:text-[#8B5CF6] dark:group-hover:text-purple-400 transition-colors">
                          {firstItem?.name || `Order #${purchase.orderNumber}`}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-[#625B72] dark:text-slate-400">
                          <span>{firstItem?.category || 'General'}</span>
                          {totalItems > 1 && (
                            <>
                              <span>·</span>
                              <span>+{totalItems - 1} more</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Price & Quick Action */}
                      <div className="text-right shrink-0 pl-1">
                        <div className="text-xs font-bold font-mono text-[#29243A] dark:text-white tabular-nums">
                          {formatPrice(purchase.totalAmount)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInPurchases(purchase.id);
                          }}
                          className="mt-0.5 text-[10px] font-bold text-[#8B5CF6] dark:text-purple-400 hover:underline flex items-center justify-end gap-0.5"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Popover Footer: Clean Escape hint & View All button */}
            <div className="p-2 border-t border-[#E5DDF2]/60 dark:border-slate-800 bg-[#FFF9F2]/70 dark:bg-slate-900/60 flex items-center justify-between text-[10px]">
              <span className="text-[#625B72] dark:text-slate-400">
                Press <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 font-mono text-[9px]">ESC</kbd> to close
              </span>

              <button
                onClick={() => handleOpenInPurchases()}
                className="px-2.5 py-1 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold cursor-pointer transition-colors shadow-2xs text-[11px] flex items-center gap-1"
              >
                <span>View all in Purchases</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightweight Quick Receipt Preview Modal (Only if onSelectPurchase is not handled) */}
      {previewPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#121826] border border-[#E5DDF2] dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-[#E5DDF2] dark:border-slate-800 flex items-center justify-between bg-[#FFF9F2] dark:bg-slate-900/50">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="text-xs font-bold text-[#29243A] dark:text-white">
                  Order Details
                </h3>
              </div>
              <button
                onClick={() => setPreviewPurchase(null)}
                className="text-[#625B72] hover:text-[#29243A] dark:hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-[#29243A] dark:text-white">
                    {previewPurchase.store}
                  </h4>
                  <div className="text-[11px] text-[#625B72] font-mono">
                    #{previewPurchase.orderNumber}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {previewPurchase.date}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold font-mono text-[#8B5CF6] dark:text-purple-400">
                    {formatPrice(previewPurchase.totalAmount)}
                  </div>
                  <div className="text-[10px] text-[#625B72] font-medium">
                    {previewPurchase.paymentMethod}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-[#E5DDF2] dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-[#E5DDF2]/60 dark:divide-slate-800">
                {previewPurchase.items.map((it) => (
                  <div key={it.id} className="p-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-[#E5DDF2] dark:border-slate-700 flex items-center justify-center">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#29243A] dark:text-white truncate">
                        {it.name}
                      </div>
                      <div className="text-[10px] text-[#625B72]">
                        {it.category}
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-[#29243A] dark:text-white">
                      {formatPrice(it.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-[#E5DDF2] dark:border-slate-800 bg-[#FFF9F2] dark:bg-slate-900/50 flex items-center justify-between">
              <button
                onClick={() => setPreviewPurchase(null)}
                className="px-3 py-1 rounded-xl border border-[#E5DDF2] dark:border-slate-700 text-xs font-semibold text-[#625B72] dark:text-slate-300 hover:bg-[#F3EEFF] dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const p = previewPurchase;
                  setPreviewPurchase(null);
                  handleOpenInPurchases(p.id);
                }}
                className="px-3 py-1 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Open in Purchases</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
