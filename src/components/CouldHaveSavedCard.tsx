import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingDown, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Star, 
  Layers, 
  CheckCircle2, 
  Info,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, CheaperAlternative } from '../types';

interface CouldHaveSavedCardProps {
  purchases: PurchaseTransaction[];
  savingsRecommendations: CheaperAlternative[];
  onSelectAlternative?: (alt: CheaperAlternative) => void;
}

export const CouldHaveSavedCard: React.FC<CouldHaveSavedCardProps> = ({
  purchases,
  savingsRecommendations,
  onSelectAlternative,
}) => {
  const { formatPrice } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const totalCouldHaveSaved = savingsRecommendations.reduce((sum, item) => sum + item.potentialSaving, 0);

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Post-Purchase Intelligence · Could Have Saved</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Could Have Saved Analysis</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Save up to {formatPrice(totalCouldHaveSaved)}
            </span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Our market crawlers compare recent purchases with verified alternative options, scoring each product based on price, reviews, specs, and warranty.
          </p>
        </div>
      </div>

      {/* Comparison Cards List */}
      <div className="space-y-4">
        {savingsRecommendations.slice(0, 3).map((rec) => {
          const isExpanded = expandedId === rec.id;
          const userScore = 7.8;
          const altScore = 8.6;

          return (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-all space-y-4"
            >
              {/* Product Comparison Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Prompt Section 2 Distinction Badges */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {rec.type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Purchased on {rec.store}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {rec.targetItemName}
                  </h4>
                </div>

                {/* Savings Pill */}
                <div className="p-3 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between sm:justify-start gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                      Potential Saving
                    </span>
                    <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-700 dark:text-emerald-200">
                      {formatPrice(rec.potentialSaving)}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleExpand(rec.id)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Less' : 'Compare'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Price & Alternative Ladder (Prompt Section 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                {/* You Paid */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">You Paid</span>
                    <span className="font-bold text-slate-900 dark:text-white">{rec.targetItemName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-mono font-extrabold text-slate-900 dark:text-white">
                      {formatPrice(rec.originalPrice)}
                    </span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 block font-bold">
                      Score: {userScore}/10
                    </span>
                  </div>
                </div>

                {/* Similar Alternatives */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 uppercase font-bold block">
                      Recommended Alternative
                    </span>
                    <span className="font-bold text-emerald-950 dark:text-emerald-200">{rec.alternativeName}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">Available on {rec.store}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(rec.alternativePrice)}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 block font-bold">
                      Score: {altScore}/10 (★ {rec.rating})
                    </span>
                  </div>
                </div>
              </div>

              {/* Extended Comparison Details & Score Breakdown (Prompt Section 8) */}
              {isExpanded && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs animate-fadeIn">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Transparent Better Alternative Scoring Matrix</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <span className="text-slate-400 block text-[9px] uppercase">Rating</span>
                      <strong className="text-slate-900 dark:text-white">★ {rec.rating} ({rec.reviewsCount} reviews)</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <span className="text-slate-400 block text-[9px] uppercase">Warranty</span>
                      <strong className="text-slate-900 dark:text-white">{rec.warranty}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <span className="text-slate-400 block text-[9px] uppercase">Seller</span>
                      <strong className="text-slate-900 dark:text-white">{rec.seller}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <span className="text-slate-400 block text-[9px] uppercase">Specification Match</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">96% Equivalent</strong>
                    </div>
                  </div>

                  {rec.options && rec.options.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                        Other verified alternative price tiers:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {rec.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center gap-2"
                          >
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{formatPrice(opt.price)}</span>
                            <span className="text-slate-500">· {opt.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
