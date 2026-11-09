import React from 'react';
import { 
  Sparkles, 
  Award, 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction } from '../types';
import { DashboardShoppingPersonality } from './DashboardShoppingPersonality';
import { ShoppingPersonalityCard } from './ShoppingPersonalityCard';

interface ShoppingPersonalityViewProps {
  purchases: PurchaseTransaction[];
  onNavigateTab?: (tab: any) => void;
}

export const ShoppingPersonalityView: React.FC<ShoppingPersonalityViewProps> = ({
  purchases,
  onNavigateTab,
}) => {
  const { formatPrice } = useApp();

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 dark:from-pink-950/40 dark:via-purple-950/30 dark:to-indigo-950/20 border border-pink-200/80 dark:border-pink-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5 mb-1.5">
            <Award className="w-3.5 h-3.5" />
            AI Persona Profiler
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your Shopping Archetype & Patterns
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Non-judgmental, insightful analysis of your purchase rhythm, favorite retail verticals, and value-hunting instincts.
          </p>
        </div>
      </div>

      {/* Main Personality Card */}
      <DashboardShoppingPersonality 
        purchases={purchases} 
        onExploreInsights={() => onNavigateTab && onNavigateTab('analytics')}
      />

      {/* All Available Archetypes Explainer */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          TrackShop Archetype Catalog
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          How our friendly algorithm identifies your primary shopping persona based on merchant mix, frequency, and categories:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 space-y-2">
            <span className="text-xl">🎯</span>
            <div className="font-bold text-xs text-amber-900 dark:text-amber-200">Deal Hunter</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Consistently leverages coupons, vouchers, seasonal flash sales, and compares multiple stores to maximize savings.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 space-y-2">
            <span className="text-xl">⚡</span>
            <div className="font-bold text-xs text-indigo-900 dark:text-indigo-200">Tech Explorer</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Drawn to high-efficiency computing peripherals, fast GaN chargers, audio equipment, and wireless gadgets.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/30 border border-pink-200/60 dark:border-pink-800/40 space-y-2">
            <span className="text-xl">✨</span>
            <div className="font-bold text-xs text-pink-900 dark:text-pink-200">Style Curator</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Elevates personal wardrobe and aesthetic lifestyle with carefully selected footwear, denim, and linen apparel.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
            <span className="text-xl">🌿</span>
            <div className="font-bold text-xs text-emerald-900 dark:text-emerald-200">Mindful Minimalist</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Maintains steady, long gaps between orders, prioritizing replacement essentials and durable utility over novelty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
