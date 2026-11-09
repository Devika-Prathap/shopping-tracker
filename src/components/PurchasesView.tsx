import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Download, 
  FileText, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  Store, 
  Tag, 
  Calendar, 
  ArrowUpDown,
  ShoppingBag,
  ExternalLink,
  Receipt,
  Sparkles,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, PurchaseItem, ProductCategory } from '../types';
import { getSuggestedTagsForMerchant } from '../utils/merchantTagSuggestions';
import { ProductDetailsModal } from './ProductDetailsModal';
import { SearchEmptyState, NoPurchasesEmptyState } from './SkeletonAndEmptyStates';

export interface PurchasesFilterInput {
  query?: string;
  store?: string;
  category?: string;
  priceRange?: 'ALL' | 'under1000' | '1000-3000' | '3000-7000' | 'above7000' | 'custom';
  minPrice?: number | '';
  maxPrice?: number | '';
  highlightedId?: string;
}

interface PurchasesViewProps {
  purchases: PurchaseTransaction[];
  onSelectStoreModal?: (storeName: string) => void;
  initialFilter?: PurchasesFilterInput | null;
  onSelectProduct?: (item: PurchaseItem, transaction?: PurchaseTransaction) => void;
  onRestoreDemo?: () => void;
  onMakePurchasePrivate?: (id: string) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  onSelectStoreModal,
  initialFilter,
  onSelectProduct,
  onRestoreDemo,
  onMakePurchasePrivate,
}) => {
  const { formatPrice, currency } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStore, setSelectedStore] = useState<string>('ALL');
  const [priceRange, setPriceRange] = useState<'ALL' | 'under1000' | '1000-3000' | '3000-7000' | 'above7000' | 'custom'>('ALL');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<'ALL' | 'today' | 'week' | 'month' | 'year'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [activeReceiptModal, setActiveReceiptModal] = useState<PurchaseTransaction | null>(null);
  const [selectedProductItem, setSelectedProductItem] = useState<{ item: PurchaseItem; transaction?: PurchaseTransaction } | null>(null);

  const handleProductClick = (item: PurchaseItem, order: PurchaseTransaction) => {
    if (onSelectProduct) {
      onSelectProduct(item, order);
    }
    setSelectedProductItem({ item, transaction: order });
  };

  // Sync initialFilter when provided from Global Search
  React.useEffect(() => {
    if (initialFilter) {
      if (initialFilter.query !== undefined) setSearchQuery(initialFilter.query);
      if (initialFilter.store !== undefined) setSelectedStore(initialFilter.store);
      if (initialFilter.category !== undefined) setSelectedCategory(initialFilter.category);
      if (initialFilter.priceRange !== undefined) setPriceRange(initialFilter.priceRange);
      if (initialFilter.minPrice !== undefined) setMinPrice(initialFilter.minPrice);
      if (initialFilter.maxPrice !== undefined) setMaxPrice(initialFilter.maxPrice);
      if (initialFilter.highlightedId) {
        setHighlightedId(initialFilter.highlightedId);
        setTimeout(() => {
          const el = document.getElementById(`purchase-${initialFilter.highlightedId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 200);
      }
    }
  }, [initialFilter]);

  // Available stores and categories
  const availableStores = useMemo(() => Array.from(new Set(purchases.map(p => p.store))), [purchases]);
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
  ];

  // Filtered transactions
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      // Store filter
      if (selectedStore !== 'ALL' && p.store !== selectedStore) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && !p.items.some(i => i.category === selectedCategory)) return false;

      // Price range filter
      const total = p.totalAmount;
      if (priceRange === 'under1000' && total >= 1000) return false;
      if (priceRange === '1000-3000' && (total < 1000 || total > 3000)) return false;
      if (priceRange === '3000-7000' && (total < 3000 || total > 7000)) return false;
      if (priceRange === 'above7000' && total <= 7000) return false;
      if (priceRange === 'custom') {
        if (minPrice !== '' && total < Number(minPrice)) return false;
        if (maxPrice !== '' && total > Number(maxPrice)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesStore = p.store.toLowerCase().includes(q);
        const matchesOrder = p.orderNumber.toLowerCase().includes(q);
        const matchesItem = p.items.some(
          i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.subCategory.toLowerCase().includes(q)
        );
        const suggestedTags = getSuggestedTagsForMerchant(p.store);
        const matchesTag = suggestedTags.some(t => t.label.toLowerCase().includes(q));
        if (!matchesStore && !matchesOrder && !matchesItem && !matchesTag) return false;
      }

      return true;
    });
  }, [purchases, selectedStore, selectedCategory, priceRange, minPrice, maxPrice, searchQuery, selectedDateFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Store', 'Product', 'Category', 'Price', 'Refund', 'Net Spending', 'Payment Method'];
    const rows = filteredPurchases.flatMap(p => 
      p.items.map(it => [
        p.orderNumber,
        p.date,
        p.store,
        `"${it.name.replace(/"/g, '""')}"`,
        it.category,
        it.price,
        it.isRefunded ? it.price : 0,
        it.isRefunded ? 0 : it.price,
        `"${p.paymentMethod}"`
      ])
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shopping_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredPurchases, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `shopping_data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-full min-w-0 box-border">
      {/* Header & Export controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            All Tracked Purchases & Orders
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically captured from email receipts, extensions, and payment feeds · {filteredPurchases.length} orders
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Timeline
            </button>
          </div>

          {/* Export Dropdown / Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, store, category (e.g. Nike, T-shirt, Sony, Myntra)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Store select */}
          <select
            value={selectedStore}
            onChange={e => setSelectedStore(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">All Stores</option>
            {availableStores.map(st => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Category select */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Price Range select */}
          <select
            value={priceRange}
            onChange={e => {
              const val = e.target.value as any;
              setPriceRange(val);
              if (val !== 'custom') {
                setMinPrice('');
                setMaxPrice('');
              }
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">All Prices</option>
            <option value="under1000">&lt; {currency}1,000</option>
            <option value="1000-3000">{currency}1,000 - {currency}3,000</option>
            <option value="3000-7000">{currency}3,000 - {currency}7,000</option>
            <option value="above7000">&gt; {currency}7,000</option>
            <option value="custom">Custom Price...</option>
          </select>
        </div>

        {/* Custom Price Inputs & Active Filters Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {priceRange === 'custom' ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500">Price ({currency}):</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-slate-400">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          ) : (
            <div className="text-slate-500 text-[11px]">
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredPurchases.length}</span> of {purchases.length} transactions
            </div>
          )}

          {(selectedStore !== 'ALL' || selectedCategory !== 'ALL' || priceRange !== 'ALL' || minPrice !== '' || maxPrice !== '' || searchQuery.trim() || highlightedId) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStore('ALL');
                setSelectedCategory('ALL');
                setPriceRange('ALL');
                setMinPrice('');
                setMaxPrice('');
                setHighlightedId(null);
              }}
              className="text-rose-600 dark:text-rose-400 text-xs font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* EMPTY STATES & RESULTS */}
      {purchases.length === 0 ? (
        <NoPurchasesEmptyState
          onRestoreDemo={onRestoreDemo}
        />
      ) : filteredPurchases.length === 0 ? (
        <SearchEmptyState
          query={searchQuery || (selectedStore !== 'ALL' ? selectedStore : selectedCategory !== 'ALL' ? selectedCategory : '')}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedStore('ALL');
            setSelectedCategory('ALL');
            setPriceRange('ALL');
            setMinPrice('');
            setMaxPrice('');
            setHighlightedId(null);
          }}
        />
      ) : (
        <>
          {/* TIMELINE VIEW (Prompt section 17) */}
          {viewMode === 'timeline' && (
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {filteredPurchases.map(order => (
                <div key={order.id} className="relative flex items-start gap-4 pl-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-[#0c0f17] shrink-0 z-10">
                    •
                  </div>

                  <div 
                    id={`purchase-${order.id}`}
                    className={`flex-1 p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
                      highlightedId === order.id
                        ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/20 border-purple-400 dark:border-purple-500'
                        : 'border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {order.date}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <button
                          onClick={() => onSelectStoreModal && onSelectStoreModal(order.store)}
                          className="font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                        >
                          {order.store}
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-xs font-mono text-slate-400">
                          {order.orderNumber}
                        </span>
                        {/* Auto-suggested merchant tags with confidence badge */}
                        <div className="flex items-center gap-1.5 ml-1">
                          {getSuggestedTagsForMerchant(order.store).map(tag => (
                            <span
                              key={tag.label}
                              title={`${tag.reason}\nConfidence: ${tag.confidence}% (${tag.confidenceReason || 'System categorization model'})`}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${tag.bgClass} ${tag.textClass} ${tag.borderClass} flex items-center gap-1`}
                            >
                              <Sparkles className="w-2 h-2 opacity-60" />
                              <span>{tag.label}</span>
                              <span
                                className={`text-[8px] font-mono font-semibold px-0.5 rounded-xs border flex items-center gap-0.5 ${
                                  tag.confidence >= 92
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                    : tag.confidence >= 82
                                    ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
                                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                }`}
                                title={`Confidence: ${tag.confidence}%`}
                              >
                                <span
                                  className={`w-1 h-1 rounded-full ${
                                    tag.confidence >= 92 ? 'bg-emerald-500' : tag.confidence >= 82 ? 'bg-indigo-500' : 'bg-amber-500'
                                  }`}
                                />
                                <span>{tag.confidence}%</span>
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                          {formatPrice(order.totalAmount)}
                        </span>
                        {order.isRefunded && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                            Refunded {formatPrice(order.refundAmount || order.totalAmount)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {order.items.map(it => (
                        <div
                          key={it.id}
                          onClick={() => handleProductClick(it, order)}
                          className="flex items-center justify-between gap-3 text-xs p-2 rounded-2xl hover:bg-purple-50/60 dark:hover:bg-purple-950/20 transition-all cursor-pointer group"
                          title="Click to view full product details, specs, return policy & price trends"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {it.imageUrl ? (
                                <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <ShoppingBag className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {it.name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <span>{it.category} · {it.subCategory}</span>
                                <span className="text-purple-600 dark:text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                  View Details →
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                            {formatPrice(it.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPurchases.map(order => (
                <div
                  key={order.id}
                  id={`purchase-${order.id}`}
                  className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${
                    highlightedId === order.id
                      ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/20 border-purple-400 dark:border-purple-500'
                      : order.isRefunded
                      ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 shadow-xs hover:shadow-md'
                      : 'border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Store & Date line */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          {order.store}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {order.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {getSuggestedTagsForMerchant(order.store).map(tag => (
                          <span
                            key={tag.label}
                            title={`${tag.reason}\nConfidence: ${tag.confidence}% (${tag.confidenceReason || 'System categorization model'})`}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${tag.bgClass} ${tag.textClass} ${tag.borderClass} flex items-center gap-1`}
                          >
                            <Sparkles className="w-2 h-2 opacity-60" />
                            <span>{tag.label}</span>
                            <span
                              className={`text-[8px] font-mono font-semibold px-0.5 rounded-xs border flex items-center gap-0.5 ${
                                tag.confidence >= 92
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                  : tag.confidence >= 82
                                  ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
                                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                              }`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${
                                  tag.confidence >= 92 ? 'bg-emerald-500' : tag.confidence >= 82 ? 'bg-indigo-500' : 'bg-amber-500'
                                }`}
                              />
                              <span>{tag.confidence}%</span>
                            </span>
                          </span>
                        ))}

                        {order.isRefunded ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                            Returned & Refunded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                            Delivered
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items in this order */}
                    <div className="mt-3.5 space-y-3">
                      {order.items.map(it => (
                        <div
                          key={it.id}
                          onClick={() => handleProductClick(it, order)}
                          className="flex gap-3 p-2 rounded-2xl hover:bg-purple-50/60 dark:hover:bg-purple-950/20 transition-all cursor-pointer group"
                          title="Click to view full product details, specs, return policy & price trends"
                        >
                          <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            {it.imageUrl ? (
                              <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <ShoppingBag className="w-6 h-6 text-slate-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {it.name}
                            </h4>
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {it.category} · {it.subCategory}
                              {it.size ? ` · Size ${it.size}` : ''}
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {formatPrice(it.price)}
                              </span>
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                Details →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

              {/* Order bottom calculation */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                {/* Prompt Section 14 rule: Net spending calculation */}
                {order.isRefunded ? (
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 font-mono space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Purchase:</span>
                      <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 dark:text-rose-400">
                      <span>Refund:</span>
                      <span>-{formatPrice(order.refundAmount || order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1">
                      <span>Net Spending:</span>
                      <span>{formatPrice(0)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">Final Amount Paid</div>
                      <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onMakePurchasePrivate && (
                        <button
                          type="button"
                          onClick={() => onMakePurchasePrivate(order.id)}
                          className="px-2.5 py-1.5 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-white hover:bg-[#F3EEFF] dark:bg-slate-800 dark:hover:bg-slate-700/80 text-[#625B72] dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Move this purchase into your Private Shopping Vault"
                        >
                          <Lock className="w-3.5 h-3.5 text-[#7C3AED]" />
                          <span className="hidden sm:inline">Make Private</span>
                        </button>
                      )}

                      <button
                        onClick={() => setActiveReceiptModal(order)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )}

  {/* Product Details Modal (Specs, Return Status, Price Trend, Cheaper Alternatives) */}
  <ProductDetailsModal
    isOpen={!!selectedProductItem}
    onClose={() => setSelectedProductItem(null)}
    item={selectedProductItem?.item || null}
    transaction={selectedProductItem?.transaction}
  />

      {/* Digital Receipt Modal */}
      {activeReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Order Breakdown & Payment Reconcile
                </h3>
              </div>
              <button
                onClick={() => setActiveReceiptModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeReceiptModal.store}
                  </h4>
                  <div className="text-xs text-slate-500 font-mono">
                    Order #{activeReceiptModal.orderNumber}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Date: {activeReceiptModal.date}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
                    {formatPrice(activeReceiptModal.totalAmount)}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Payment Verified
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {activeReceiptModal.items.map(it => (
                  <div key={it.id} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{it.name}</div>
                      <div className="text-[11px] text-slate-500">{it.category} · {it.subCategory}</div>
                    </div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatPrice(it.price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotals */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1.5 text-xs border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatPrice(activeReceiptModal.subtotal)}</span>
                </div>
                {activeReceiptModal.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount applied:</span>
                    <span className="font-mono">-{formatPrice(activeReceiptModal.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charges:</span>
                  <span className="font-mono">
                    {activeReceiptModal.deliveryCharges === 0 ? 'FREE' : formatPrice(activeReceiptModal.deliveryCharges)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>Final Amount Paid:</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">
                    {formatPrice(activeReceiptModal.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Payment source: {activeReceiptModal.paymentMethod} (Automatically synced via {activeReceiptModal.source.replace(/_/g, ' ')})
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setActiveReceiptModal(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
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
