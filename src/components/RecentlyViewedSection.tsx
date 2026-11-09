import React from 'react';
import { 
  Eye, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseItem } from '../types';

interface RecentlyViewedSectionProps {
  onSelectProduct: (item: PurchaseItem) => void;
  onNavigateTab: (tab: any) => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  onSelectProduct,
  onNavigateTab,
}) => {
  const { recentlyViewed, clearRecentlyViewed, formatPrice } = useApp();

  // Exclude any private items strictly
  const safeItems = recentlyViewed.filter((item) => !(item as any).isPrivate);

  if (safeItems.length === 0) {
    return (
      <section className="bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs select-none">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#625B72] dark:text-slate-400 uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Recently Viewed Products</span>
          </div>
        </div>
        <div className="py-5 px-3 text-center border border-dashed border-[#E5DDF2] dark:border-slate-800 rounded-xl bg-[#FFF9F2]/40 dark:bg-slate-950/20">
          <p className="text-xs font-semibold text-[#1E1B2E] dark:text-slate-200">
            No recently viewed products yet
          </p>
          <p className="text-[11px] text-[#625B72] dark:text-slate-400 mt-0.5 max-w-sm mx-auto">
            Click on any item in your purchases, stores, or price drops to view specifications and track your viewing history.
          </p>
          <button
            onClick={() => onNavigateTab('purchases')}
            className="mt-2.5 px-3 py-1 rounded-lg bg-[#F3EEFF] hover:bg-[#E8DCFE] text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Explore Purchases →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs select-none min-w-0">
      <div className="flex items-center justify-between mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4C267B] dark:text-white uppercase tracking-wider">
            <Eye className="w-4 h-4 text-[#8B5CF6]" />
            <span>Recently Viewed Products</span>
          </div>
          <span className="text-[10px] text-[#625B72] dark:text-slate-400 font-semibold">
            · {safeItems.length} items
          </span>
        </div>

        <button
          onClick={clearRecentlyViewed}
          className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          title="Clear recent viewing history"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Horizontal Scrollable Product Cards */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-thin">
        {safeItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectProduct(item)}
            className="w-36 sm:w-40 shrink-0 p-2.5 rounded-xl border border-[#E5DDF2] dark:border-slate-800 bg-[#FFF9F2]/50 hover:bg-[#F3EEFF]/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:-translate-y-0.5"
          >
            <div>
              {/* Product Thumbnail */}
              <div className="w-full h-24 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-[#E5DDF2] dark:border-slate-700/80 mb-2 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-[#8B5CF6]" />
                )}
              </div>

              {/* Store & Category */}
              <div className="flex items-center justify-between text-[10px] text-[#625B72] dark:text-slate-400 mb-0.5">
                <span className="font-bold text-[#7C3AED] dark:text-purple-300 truncate max-w-[80px]">
                  {item.store}
                </span>
                <span>{item.category}</span>
              </div>

              {/* Product Name */}
              <h4 className="text-xs font-bold text-[#29243A] dark:text-white line-clamp-2 group-hover:text-[#8B5CF6] transition-colors">
                {item.name}
              </h4>
            </div>

            {/* Price & Reopen Prompt */}
            <div className="mt-2 pt-1.5 border-t border-[#E5DDF2]/60 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-[#29243A] dark:text-white tabular-nums">
                {formatPrice(item.price)}
              </span>
              <span className="text-[10px] font-bold text-[#8B5CF6] group-hover:translate-x-0.5 transition-transform">
                View →
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
