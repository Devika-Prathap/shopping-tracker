import React from 'react';
import { 
  X, 
  Sparkles, 
  TrendingDown, 
  Check, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Store, 
  ShoppingBag,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CheaperAlternative, AlternativeOption } from '../types';

interface AlternativeModalProps {
  alternative: CheaperAlternative | null;
  onClose: () => void;
}

export const AlternativeModal: React.FC<AlternativeModalProps> = ({
  alternative,
  onClose,
}) => {
  const { formatPrice } = useApp();

  if (!alternative) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personalised Money-Saving Options
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alternative recommendations for {alternative.targetItemName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Purchased Item Context */}
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 overflow-hidden shrink-0 flex items-center justify-center">
                {alternative.imageUrl ? (
                  <img src={alternative.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-purple-400" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Item You Bought
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {alternative.targetItemName}
                </h4>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                {formatPrice(alternative.originalPrice)}
              </span>
              <span className="block text-[10px] text-slate-400">Paid price</span>
            </div>
          </div>

          {/* Options Found List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Similar Options Found:
            </h4>

            {alternative.options && alternative.options.length > 0 ? (
              alternative.options.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400/60 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                          {formatPrice(opt.price)}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          — {opt.label}
                        </span>
                      </div>
                      {opt.brand && (
                        <span className="text-[11px] text-slate-500">
                          Brand: {opt.brand} {opt.store && `· Store: ${opt.store}`}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                        Save {formatPrice(opt.difference)}
                      </span>
                    </div>
                  </div>

                  {opt.specs && opt.specs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      {opt.specs.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        >
                          ✓ {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatPrice(alternative.alternativePrice)}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    Save {formatPrice(alternative.potentialSaving)}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {alternative.alternativeName}
                </div>
                <div className="text-xs text-slate-500">
                  Seller: {alternative.seller} · {alternative.warranty}
                </div>
              </div>
            )}
          </div>

          {/* Value Guarantee */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              All suggested alternatives are vetted for matching build quality, verified buyer reviews, and authentic seller return policies.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert('Alternative saved to your Maybe Later watchlist!');
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Save to Watchlist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
