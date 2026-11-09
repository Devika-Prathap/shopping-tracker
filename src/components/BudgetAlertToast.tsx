import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Receipt, 
  TrendingDown, 
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BudgetAlertNotification } from '../types';

interface BudgetAlertToastProps {
  alert: BudgetAlertNotification | null;
  onDismiss: () => void;
  onViewPurchase?: (txId: string) => void;
  onOpenBudgetSettings?: () => void;
}

export const BudgetAlertToast: React.FC<BudgetAlertToastProps> = ({
  alert,
  onDismiss,
  onViewPurchase,
  onOpenBudgetSettings,
}) => {
  const { formatPrice } = useApp();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!alert) return;
    setProgress(100);

    const duration = 12000; // 12 seconds visible
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 w-full max-w-md animate-slideIn">
      <div className="p-5 bg-white/95 dark:bg-slate-900/95 border-2 border-amber-500/70 rounded-3xl shadow-2xl backdrop-blur-xl ring-2 ring-amber-500/20 text-slate-800 dark:text-slate-100 overflow-hidden relative">
        {/* Top Progress countdown */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                High-Impact Spending Alert
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Single Purchase Exceeded 25% of Remaining Budget
              </h4>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alert Body */}
        <div className="mt-3.5 space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Your recent purchase at <span className="font-semibold text-slate-900 dark:text-white">{alert.merchant}</span> for{' '}
            <span className="font-mono font-bold text-amber-600 dark:text-amber-300 tabular-nums">
              {formatPrice(alert.purchaseAmount)}
            </span>{' '}
            consumed <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{alert.percentageOfRemaining.toFixed(1)}%</span> of your remaining monthly allowance.
          </p>

          {/* Visual Data Comparison Grid */}
          <div className="p-3 bg-amber-50/80 dark:bg-slate-950/80 rounded-2xl border border-amber-200/80 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Order Cost</div>
              <div className="font-mono font-bold text-slate-900 dark:text-white text-sm tabular-nums mt-0.5">
                {formatPrice(alert.purchaseAmount)}
              </div>
            </div>

            <div className="border-x border-amber-200 dark:border-slate-800">
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">25% Limit</div>
              <div className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm tabular-nums mt-0.5">
                {formatPrice(alert.thresholdAmount)}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Remaining Pool</div>
              <div className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm tabular-nums mt-0.5">
                {formatPrice(alert.remainingBudget)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          {onViewPurchase && (
            <button
              onClick={() => {
                onViewPurchase(alert.transactionId);
                onDismiss();
              }}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Inspect Receipt</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {onOpenBudgetSettings && (
              <button
                onClick={() => {
                  onOpenBudgetSettings();
                  onDismiss();
                }}
                className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer transition-colors"
              >
                Adjust Budget
              </button>
            )}

            <button
              onClick={onDismiss}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
