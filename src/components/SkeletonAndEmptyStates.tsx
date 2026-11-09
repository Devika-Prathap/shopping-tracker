import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  RotateCcw, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  Plus, 
  Database,
  WifiOff,
  Inbox
} from 'lucide-react';

/**
 * Loading Skeleton Card with smooth subtle shimmer
 */
export const CardLoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 3, 
  className = '' 
}) => {
  return (
    <div className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs animate-pulse space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-16" />
      </div>

      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-14" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Empty State for search with zero matches
 */
export const SearchEmptyState: React.FC<{
  query: string;
  onResetFilters?: () => void;
  onClearFilters?: () => void;
}> = ({ query, onResetFilters, onClearFilters }) => {
  const handleReset = onResetFilters || onClearFilters;
  return (
    <div className="py-12 px-4 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
        <Search className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-white">
        No purchases matched "{query}"
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
        Check the spelling or try searching for a store name (like Amazon or Myntra), a date (e.g. 2026-09), or a category.
      </p>
      {handleReset && (
        <div className="pt-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Empty State when no purchases exist in the app
 */
export const NoPurchasesEmptyState: React.FC<{
  onRestoreDemo?: () => void;
  onOpenQuickAdd?: () => void;
  onAddManual?: () => void;
  onScanReceipt?: () => void;
}> = ({ onRestoreDemo, onOpenQuickAdd, onAddManual, onScanReceipt }) => {
  const handleAdd = onOpenQuickAdd || onAddManual;
  return (
    <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          No Purchases Recorded Yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          Your expense tracking begins automatically when you sync an order or scan a physical receipt photo with AI vision.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
        {onRestoreDemo && (
          <button
            onClick={onRestoreDemo}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Demo Shopping Data</span>
          </button>
        )}
        {handleAdd && (
          <button
            onClick={handleAdd}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Order</span>
          </button>
        )}
        {onScanReceipt && (
          <button
            onClick={onScanReceipt}
            className="px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Scan Receipt</span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Error / Integration Retry State Card
 */
export const IntegrationErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}> = ({
  title = 'Connection Timeout',
  message = 'Failed to reconcile recent receipts with bank sync. The connection was temporarily interrupted.',
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-200/80 dark:bg-rose-900/80 text-rose-700 dark:text-rose-200 shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200">
            {title}
          </h4>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-end">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Retry Connection'}</span>
        </button>
      </div>
    </div>
  );
};
