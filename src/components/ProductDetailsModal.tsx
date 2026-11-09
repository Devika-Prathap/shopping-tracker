import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  Calendar, 
  Tag, 
  Clock, 
  RotateCcw, 
  TrendingDown, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ShoppingBag, 
  DollarSign, 
  Layers, 
  Share2, 
  Bookmark, 
  ArrowRight,
  Truck,
  Receipt,
  Check,
  Lock,
  Scale
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseItem, PurchaseTransaction, PriceDropItem, CheaperAlternative } from '../types';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PurchaseItem | null;
  transaction?: PurchaseTransaction | null;
  priceDrops?: PriceDropItem[];
  savingsRecommendations?: CheaperAlternative[];
  onOpenStoreModal?: (storeName: string) => void;
  onNavigateTab?: (tab: any) => void;
  onToggleWishlist?: (name: string) => void;
  onMakePurchasePrivate?: (id: string) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  item,
  transaction,
  priceDrops = [],
  savingsRecommendations = [],
  onOpenStoreModal,
  onNavigateTab,
  onToggleWishlist,
  onMakePurchasePrivate,
}) => {
  const { formatPrice, currency, addToRecentlyViewed, addToComparison } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'price_history' | 'return_status' | 'alternatives'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSavedToWishlist, setIsSavedToWishlist] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      addToRecentlyViewed(item, transaction?.isPrivate);
    }
  }, [isOpen, item, transaction?.isPrivate, addToRecentlyViewed]);

  if (!isOpen || !item) return null;

  // Find matching price drop data if available
  const matchingPriceDrop = priceDrops.find(
    pd => pd.productName.toLowerCase().includes(item.name.toLowerCase()) || 
          item.name.toLowerCase().includes(pd.productName.toLowerCase())
  );

  // Find matching cheaper alternatives if available
  const matchingAlternative = savingsRecommendations.find(
    alt => alt.targetItemName.toLowerCase().includes(item.name.toLowerCase()) || 
           item.name.toLowerCase().includes(alt.targetItemName.toLowerCase())
  );

  // Derive price stats
  const originalPrice = item.originalPrice || (matchingPriceDrop ? matchingPriceDrop.purchasedPrice : Math.round(item.price * 1.25));
  const currentPrice = item.currentMarketPrice || (matchingPriceDrop ? matchingPriceDrop.currentPrice : item.price);
  const hasSavings = originalPrice > item.price;
  const savingsAmount = Math.max(0, originalPrice - item.price);
  const savingsPercent = Math.round((savingsAmount / originalPrice) * 100);

  // Return window calculation (typically 30 days from purchase date)
  const purchaseDate = new Date(item.date || transaction?.date || '2026-10-15');
  const returnWindowDays = 30;
  const returnDeadline = new Date(purchaseDate.getTime() + returnWindowDays * 24 * 60 * 60 * 1000);
  const currentDate = new Date('2026-10-24'); // Fixed simulation date
  const isReturnEligible = currentDate <= returnDeadline && !item.isRefunded && item.orderStatus !== 'Returned';
  const daysLeftForReturn = Math.max(0, Math.ceil((returnDeadline.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)));

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWishlistToggle = () => {
    setIsSavedToWishlist(!isSavedToWishlist);
    if (onToggleWishlist) {
      onToggleWishlist(item.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#0e131f] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto min-w-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                Product Details
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {item.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              title="Share item details"
              className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleWishlistToggle}
              title={isSavedToWishlist ? 'Saved in wishlist' : 'Save to wishlist'}
              className={`p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                isSavedToWishlist ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={() => {
                addToComparison(item);
                if (onNavigateTab) {
                  onClose();
                  onNavigateTab('comparison');
                }
              }}
              title="Compare with other products"
              className="px-2.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare</span>
            </button>
            {transaction && onMakePurchasePrivate && (
              <button
                onClick={() => {
                  onMakePurchasePrivate(transaction.id);
                  onClose();
                }}
                title="Move this purchase to Private Shopping Vault"
                className="p-2 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-950/60 text-[#625B72] hover:text-[#7C3AED] dark:text-slate-400 dark:hover:text-purple-300 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 min-w-0">
          {/* Main Hero Card: Product Image, Store, Price, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#F8F5FD] via-[#F3EEFF] to-[#FFF9F2] dark:from-slate-900/60 dark:via-purple-950/10 dark:to-slate-900/60 border border-[#E5DDF2] dark:border-slate-800">
            {/* Product Image */}
            <div className="sm:col-span-4 w-full aspect-square rounded-2xl bg-white dark:bg-slate-800 overflow-hidden border border-[#E5DDF2] dark:border-slate-700/60 flex items-center justify-center relative shadow-xs">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-4xl">🛍️</span>
              )}
              {hasSavings && (
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white shadow-xs">
                  {savingsPercent}% Off
                </span>
              )}
            </div>

            {/* Product Details Overview */}
            <div className="sm:col-span-8 flex flex-col justify-between space-y-3 min-w-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <button
                    onClick={() => {
                      if (onOpenStoreModal) onOpenStoreModal(item.store);
                      else if (onNavigateTab) onNavigateTab('stores');
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>{item.store}</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                  {item.subCategory && (
                    <span className="text-xs text-slate-400">· {item.subCategory}</span>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                  {item.name}
                </h2>

                {/* Specs: Size / Color / Rating if available */}
                {(item.size || item.color || item.rating) && (
                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1.5 flex-wrap">
                    {item.size && (
                      <span className="font-medium">Size: <strong className="text-slate-900 dark:text-white">{item.size}</strong></span>
                    )}
                    {item.color && (
                      <span className="font-medium">Color: <strong className="text-slate-900 dark:text-white">{item.color}</strong></span>
                    )}
                    {item.rating && (
                      <span className="font-medium text-amber-500">★ {item.rating}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Price Row */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-baseline justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Paid Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
                      {formatPrice(item.price)}
                    </span>
                    {originalPrice > item.price && (
                      <span className="text-sm font-mono text-slate-400 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quantity</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {item.quantity || 1} unit{(item.quantity || 1) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200/80 dark:border-slate-800 pb-1 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Purchase History</span>
            </button>

            <button
              onClick={() => setActiveTab('price_history')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'price_history'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Price Trend</span>
              {matchingPriceDrop && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('return_status')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'return_status'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return Status</span>
              {isReturnEligible && (
                <span className="text-[10px] px-1 rounded-full bg-emerald-500 text-white font-bold">
                  {daysLeftForReturn}d
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('alternatives')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'alternatives'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Similar Products</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & PURCHASE HISTORY */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Order Information */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-purple-500" />
                    <span>Order Reference</span>
                  </span>
                  <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order ID:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {transaction?.orderNumber || 'ORD-SYNC-9921'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {item.date || transaction?.date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Method:</span>
                      <span className="font-medium text-slate-900 dark:text-white truncate max-w-[140px]">
                        {transaction?.paymentMethod || 'UPI / Card Sync'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fulfillment Hub:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {transaction?.fulfillmentOrigin?.facilityName || `${item.store} Express Logistics`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery & Status */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Delivery Status</span>
                  </span>
                  <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Order Status:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        item.isRefunded || item.orderStatus === 'Returned'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}>
                        {item.isRefunded ? 'Returned & Refunded' : item.orderStatus || 'Delivered'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Origin:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {transaction?.fulfillmentOrigin?.city ? `${transaction.fulfillmentOrigin.city}, ${transaction.fulfillmentOrigin.state}` : 'Bengaluru, Karnataka'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verified Sync:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Reconciled</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags & Snippets */}
              {(item.tags || transaction?.tags) && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Associated Tags</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.from(new Set([...(item.tags || []), ...(transaction?.tags || [])])).map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRICE HISTORY & TREND */}
          {activeTab === 'price_history' && (
            <div className="space-y-4 text-xs animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-indigo-950 dark:text-indigo-100">
                      Historical Price Trend Analysis
                    </span>
                  </div>
                  {currentPrice < item.price && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                      Price Dropped by {formatPrice(item.price - currentPrice)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[10px] text-slate-400 block uppercase">Listed MRP</span>
                    <span className="font-mono font-bold text-slate-500 line-through text-sm">
                      {formatPrice(originalPrice)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 block uppercase font-bold">You Paid</span>
                    <span className="font-mono font-extrabold text-purple-700 dark:text-purple-300 text-sm">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase font-bold">Market Price</span>
                    <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-300 text-sm">
                      {formatPrice(currentPrice)}
                    </span>
                  </div>
                </div>

                {/* Timeline Visual */}
                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Price Timeline:
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>1 Month Ago (Launch):</span>
                      <span>{formatPrice(originalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-purple-700 dark:text-purple-300">
                      <span>{item.date || 'Purchase Date'} (Your Order):</span>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Today's Tracked Price:</span>
                      <span>{formatPrice(currentPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {onNavigateTab && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('price_drops');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Explore Price History Tab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* TAB 3: RETURN & REFUND STATUS */}
          {activeTab === 'return_status' && (
            <div className="space-y-4 text-xs animate-fadeIn">
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                item.isRefunded || item.orderStatus === 'Returned'
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                  : isReturnEligible
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <RotateCcw className={`w-4 h-4 ${
                      item.isRefunded ? 'text-rose-600' : isReturnEligible ? 'text-emerald-600' : 'text-slate-400'
                    }`} />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {item.isRefunded 
                        ? 'Refund Completed' 
                        : isReturnEligible 
                        ? 'Return Window Open' 
                        : 'Return Window Closed'}
                    </h4>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.isRefunded 
                      ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200' 
                      : isReturnEligible 
                      ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.isRefunded ? 'Refunded' : isReturnEligible ? `${daysLeftForReturn} Days Left` : 'Expired'}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.isRefunded ? (
                    `This item was returned and ₹${item.refundAmount || item.price} was refunded back to your original payment method.`
                  ) : isReturnEligible ? (
                    `You are within the 30-day return policy period for ${item.store}. Return deadline is ${returnDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`
                  ) : (
                    `The 30-day return window closed on ${returnDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`
                  )}
                </p>

                {isReturnEligible && onNavigateTab && (
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTab('returns_refunds');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Initiate Return or View Policy in Returns Hub</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SIMILAR PRODUCTS & ALTERNATIVES */}
          {activeTab === 'alternatives' && (
            <div className="space-y-4 text-xs animate-fadeIn">
              {matchingAlternative ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Cheaper Alternative Available</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                      Save {formatPrice(matchingAlternative.potentialSaving || (item.price - matchingAlternative.alternativePrice))}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                          {matchingAlternative.alternativeName}
                        </h5>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Store: {matchingAlternative.store} · {matchingAlternative.brand}
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatPrice(matchingAlternative.alternativePrice)}
                      </span>
                    </div>
                    {matchingAlternative.specComparison && matchingAlternative.specComparison.length > 0 && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug pt-1 border-t border-slate-100 dark:border-slate-800">
                        {matchingAlternative.specComparison.join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center py-6 space-y-2">
                  <Sparkles className="w-6 h-6 text-purple-500 mx-auto" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Great Value Already Secured
                  </h4>
                  <p className="text-slate-500 max-w-sm mx-auto text-xs">
                    No significantly cheaper alternative was found in this category. You purchased at a competitive market rate!
                  </p>
                </div>
              )}

              {onNavigateTab && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('save_more');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Browse All Savings Recommendations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Source: <strong className="text-slate-700 dark:text-slate-300">{item.store}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
