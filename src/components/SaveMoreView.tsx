import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingDown, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Check, 
  ExternalLink, 
  X,
  HelpCircle,
  Award,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CheaperAlternative } from '../types';

interface SaveMoreViewProps {
  savingsRecommendations: CheaperAlternative[];
}

export const SaveMoreView: React.FC<SaveMoreViewProps> = ({ savingsRecommendations }) => {
  const { formatPrice } = useApp();
  const [activeComparison, setActiveComparison] = useState<CheaperAlternative | null>(null);

  const totalPotentialSavings = savingsRecommendations.reduce((acc, alt) => acc + alt.potentialSaving, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-100 via-teal-50 to-purple-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Money-Saving Assistant
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Save More on Previous & Future Purchases
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            We scan marketplace listings and verified sellers to discover identical items at lower prices, similar products, and high-value alternatives with equal or better specifications.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-md text-center shrink-0">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Potential Savings</div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
            {formatPrice(totalPotentialSavings)}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
            Across {savingsRecommendations.length} tracked items
          </div>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          You may be able to spend less on these purchases:
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {savingsRecommendations.map(alt => (
            <div
              key={alt.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Type Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                    {alt.type}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Save {formatPrice(alt.potentialSaving)}
                  </span>
                </div>

                {/* You Bought header */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs mb-3">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">You purchased:</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {alt.targetItemName}
                  </div>
                </div>

                {/* Cheaper Alternative Card */}
                <div className="flex gap-3.5">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                    {alt.imageUrl ? (
                      <img src={alt.imageUrl} alt={alt.alternativeName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {alt.alternativeName}
                    </h4>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{alt.store}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {alt.rating} ({alt.reviewsCount})
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatPrice(alt.alternativePrice)}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        {formatPrice(alt.originalPrice)}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ({Math.round((alt.potentialSaving / alt.originalPrice) * 100)}% cheaper)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Spec highlights */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {alt.specComparison.slice(0, 2).map((spec, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Verified Seller: {alt.seller}
                </span>

                <button
                  onClick={() => setActiveComparison(alt)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Alternative & Compare</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARISON MODAL */}
      {activeComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Alternative Product Comparison
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {activeComparison.type}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveComparison(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Product header */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeComparison.alternativeName}
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Brand: <strong>{activeComparison.brand}</strong> · Sold by <strong>{activeComparison.seller}</strong> on <strong>{activeComparison.store}</strong>
                </div>
              </div>

              {/* Price comparison box */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Your Potential Saving</div>
                  <div className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
                    {formatPrice(activeComparison.potentialSaving)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Alternative Price</div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {formatPrice(activeComparison.alternativePrice)}
                  </div>
                  <div className="text-[11px] text-slate-400 line-through">
                    Original {formatPrice(activeComparison.originalPrice)}
                  </div>
                </div>
              </div>

              {/* Comparison Matrix Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Feature & Specification Comparison
                </h5>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Attribute</span>
                    <span>Specification & Details</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-500">Rating & Reviews</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ★ {activeComparison.rating} / 5.0 ({activeComparison.reviewsCount} customer reviews)
                    </span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-500">Warranty</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeComparison.warranty}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-500">Store / Seller</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeComparison.store} ({activeComparison.seller})
                    </span>
                  </div>
                  {activeComparison.specComparison.map((spec, i) => (
                    <div key={i} className="p-3 flex justify-between">
                      <span className="text-slate-500">Key Feature {i + 1}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                        {spec}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Data refreshed via automated price crawler
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveComparison(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Navigating to ${activeComparison.store} listing for ${activeComparison.alternativeName}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open on {activeComparison.store}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
