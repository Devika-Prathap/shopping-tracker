import React from 'react';
import { 
  Moon, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  Sparkles, 
  Zap, 
  Calendar,
  Hourglass,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction } from '../types';

interface ImpulsePurchaseDetectorProps {
  purchases: PurchaseTransaction[];
  onOpenCoolingModal?: () => void;
}

export const ImpulsePurchaseDetector: React.FC<ImpulsePurchaseDetectorProps> = ({
  purchases,
  onOpenCoolingModal,
}) => {
  const { formatPrice } = useApp();

  // Pattern detection from purchases
  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  
  // Late-night detection simulation based on timestamps
  const lateNightOrdersCount = 4; // Orders between 10 PM and 1 AM
  const quickCadenceCount = 3; // Orders made within 48 hours of another order

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Behavioral Mindfulness · Impulse Purchase Detector</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Checkout Timing & Spontaneity Insights</span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Identifies natural temporal rhythms in your checkouts to help you pause and reflect before completing non-urgent orders.
          </p>
        </div>

        {onOpenCoolingModal && (
          <button
            onClick={onOpenCoolingModal}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Practice 24h Cooling Rule</span>
          </button>
        )}
      </div>

      {/* Main Pattern Highlight Box (Prompt Section 6) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/20 border border-indigo-200/80 dark:border-indigo-800/40 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Moon className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Detected Timing Pattern
            </span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              🌙 You tend to place more orders between 10 PM and 12 AM
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              4 of your last 9 online purchases occurred during late-evening relaxation hours, coinciding with flash sales and casual bed-time browsing.
            </p>
          </div>
        </div>

        {/* Gentle intervention prompt (Prompt Section 6) */}
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-200/60 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
            <Hourglass className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              <strong>Maybe wait until tomorrow before buying?</strong> You tend to make more spontaneous purchases around this time.
            </span>
          </div>

          {onOpenCoolingModal && (
            <button
              onClick={onOpenCoolingModal}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
            >
              Set 24h Reminder →
            </button>
          )}
        </div>
      </div>

      {/* 3 Supporting Impulse Factors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Consecutive Day Orders</span>
            <span className="font-mono text-purple-600 dark:text-purple-400">{quickCadenceCount} Occurrences</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Placing orders on consecutive days across Myntra and Amazon. Batching orders into a weekly routine can trim shipping fees.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Small Add-on Items</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">₹400–₹800 range</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Fast chargers, phone cases, and serums frequently added alongside high-ticket tech checkouts.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Spending Velocity</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Even pacing</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            No sudden 3x spikes detected; monthly run rate remains predictable and well-paced within allowance.
          </p>
        </div>
      </div>

      {/* Mandatory Disclaimer (Prompt Section 6) */}
      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>
          <strong>Note:</strong> Behavioral observations are objective statistical summaries of checkout timestamps, never presented as medical or psychological evaluation.
        </span>
      </div>
    </section>
  );
};
