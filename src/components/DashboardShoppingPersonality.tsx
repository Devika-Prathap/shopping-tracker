import React, { useMemo, useState } from 'react';
import { 
  Sparkles, 
  Tag, 
  Calendar, 
  Zap, 
  ChevronRight, 
  Info, 
  Heart,
  TrendingDown,
  Smile,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, PersonalityType } from '../types';

export interface PersonalityInsight {
  type: PersonalityType | 'Style Enthusiast' | 'Wellness Devotee' | 'Steady Planner' | 'Active Shopper';
  badgeTitle: string;
  badgeEmoji: string;
  badgeColorClass: string;
  badgeBorderClass: string;
  badgeTextClass: string;
  bgGradient: string;
  explanation: string;
  topCategoryName: string;
  topCategoryPercent: number;
  frequencyText: string;
  cadenceDescription: string;
  positiveHighlight: string;
}

interface DashboardShoppingPersonalityProps {
  purchases: PurchaseTransaction[];
  onExploreInsights?: () => void;
}

export const DashboardShoppingPersonality: React.FC<DashboardShoppingPersonalityProps> = ({
  purchases,
  onExploreInsights,
}) => {
  const { formatPrice } = useApp();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Analyze top categories and spending frequency
  const personality = useMemo<PersonalityInsight>(() => {
    const validPurchases = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
    const items = validPurchases.flatMap(p => p.items);

    // 1. Category aggregation
    const categoryTotals: Record<string, { spend: number; count: number }> = {};
    let totalItemsSpend = 0;

    items.forEach(item => {
      const cat = item.category || 'General';
      const itemSpend = (item.price || 0) * (item.quantity || 1);
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { spend: 0, count: 0 };
      }
      categoryTotals[cat].spend += itemSpend;
      categoryTotals[cat].count += (item.quantity || 1);
      totalItemsSpend += itemSpend;
    });

    const sortedCategories = Object.entries(categoryTotals).sort(
      (a, b) => b[1].spend - a[1].spend
    );

    const topCategoryEntry = sortedCategories[0] || ['Clothing', { spend: 4200, count: 4 }];
    const topCategoryName = topCategoryEntry[0];
    const topCategorySpend = topCategoryEntry[1].spend;
    const topCategoryPercent = totalItemsSpend > 0 
      ? Math.round((topCategorySpend / totalItemsSpend) * 100) 
      : 34;

    // 2. Spending Frequency analysis
    const orderCount = validPurchases.length;
    let frequencyText = '1 order every 3–4 days';
    let cadenceDescription = 'Balanced regular cadence';

    if (validPurchases.length >= 2) {
      const timestamps = validPurchases
        .map(p => new Date(p.date).getTime())
        .filter(t => !isNaN(t))
        .sort((a, b) => a - b);

      if (timestamps.length >= 2) {
        const timeDiffDays = Math.max(1, (timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60 * 24));
        const avgDaysPerOrder = Math.max(1, Math.round((timeDiffDays / (timestamps.length - 1)) * 10) / 10);
        
        if (avgDaysPerOrder <= 2.5) {
          frequencyText = `~1 order every ${avgDaysPerOrder} days`;
          cadenceDescription = 'Frequent, active checkout cadence';
        } else if (avgDaysPerOrder <= 6) {
          frequencyText = `~1 order every ${avgDaysPerOrder} days`;
          cadenceDescription = 'Steady, spaced checkout rhythm';
        } else {
          frequencyText = `~1 order every ${avgDaysPerOrder} days`;
          cadenceDescription = 'Mindful, deliberate pacing';
        }
      }
    } else if (orderCount > 0) {
      frequencyText = `${orderCount} order recorded`;
      cadenceDescription = 'Initial shopping pacing';
    }

    // 3. Discount ratio check
    const totalDiscounts = validPurchases.reduce((acc, p) => acc + (p.discount || 0), 0);
    const totalOrderSpend = validPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
    const discountRatio = totalOrderSpend > 0 ? (totalDiscounts / totalOrderSpend) * 100 : 0;

    // Classification logic (friendly, positive, supportive)
    if (discountRatio >= 14 || totalDiscounts >= 800) {
      return {
        type: 'Deal Hunter',
        badgeTitle: 'Deal Hunter',
        badgeEmoji: '💰',
        badgeColorClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
        badgeBorderClass: 'border-emerald-200 dark:border-emerald-800/60',
        badgeTextClass: 'text-emerald-700 dark:text-emerald-300',
        bgGradient: 'from-emerald-50/70 via-teal-50/40 to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900',
        explanation: 'You have a sharp eye for value, actively taking advantage of seasonal promotions, instant coupons, and store discounts.',
        topCategoryName,
        topCategoryPercent,
        frequencyText,
        cadenceDescription,
        positiveHighlight: `Saved over ${formatPrice(totalDiscounts > 0 ? totalDiscounts : 1250)} through seasonal promotions and price reductions.`,
      };
    }

    if (topCategoryName.toLowerCase().includes('electron') || topCategoryName.toLowerCase().includes('gadget') || topCategoryName.toLowerCase().includes('gaming')) {
      return {
        type: 'Tech Explorer',
        badgeTitle: 'Tech Explorer',
        badgeEmoji: '💻',
        badgeColorClass: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300',
        badgeBorderClass: 'border-blue-200 dark:border-blue-800/60',
        badgeTextClass: 'text-blue-700 dark:text-blue-300',
        bgGradient: 'from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900',
        explanation: 'You invest thoughtfully in audio hardware, workspace peripherals, and computing gear that elevate daily productivity.',
        topCategoryName,
        topCategoryPercent,
        frequencyText,
        cadenceDescription,
        positiveHighlight: `${topCategoryPercent}% of purchases are directed toward tech & productivity devices.`,
      };
    }

    if (topCategoryName.toLowerCase().includes('cloth') || topCategoryName.toLowerCase().includes('fashion') || topCategoryName.toLowerCase().includes('shoe')) {
      return {
        type: 'Style Enthusiast',
        badgeTitle: 'Style Enthusiast',
        badgeEmoji: '👗',
        badgeColorClass: 'bg-pink-100 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300',
        badgeBorderClass: 'border-pink-200 dark:border-pink-800/60',
        badgeTextClass: 'text-pink-700 dark:text-pink-300',
        bgGradient: 'from-pink-50/70 via-rose-50/40 to-slate-50 dark:from-pink-950/20 dark:via-slate-900 dark:to-slate-900',
        explanation: 'You curate your wardrobe with intention, keeping an eye on seasonal style updates and comfortable quality apparel.',
        topCategoryName,
        topCategoryPercent,
        frequencyText,
        cadenceDescription,
        positiveHighlight: `${topCategoryName} is your primary focus (${topCategoryPercent}% of total purchases) with mindful spacing.`,
      };
    }

    if (topCategoryName.toLowerCase().includes('beauty') || topCategoryName.toLowerCase().includes('skincare')) {
      return {
        type: 'Wellness Devotee',
        badgeTitle: 'Wellness Devotee',
        badgeEmoji: '💄',
        badgeColorClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300',
        badgeBorderClass: 'border-rose-200 dark:border-rose-800/60',
        badgeTextClass: 'text-rose-700 dark:text-rose-300',
        bgGradient: 'from-rose-50/70 via-pink-50/40 to-slate-50 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900',
        explanation: 'You maintain dedicated self-care rituals, regularly replenishing skincare staples and grooming essentials from trusted portals.',
        topCategoryName,
        topCategoryPercent,
        frequencyText,
        cadenceDescription,
        positiveHighlight: `Consistent self-care replenishments with strong brand loyalty across trusted skincare portals.`,
      };
    }

    // Default: Balanced Shopper
    return {
      type: 'Balanced Shopper',
      badgeTitle: 'Balanced Shopper',
      badgeEmoji: '⚖️',
      badgeColorClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300',
      badgeBorderClass: 'border-purple-200 dark:border-purple-800/60',
      badgeTextClass: 'text-purple-700 dark:text-purple-300',
      bgGradient: 'from-purple-50/70 via-indigo-50/40 to-slate-50 dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900',
      explanation: 'You distribute your budget evenly between everyday apparel, practical tech utilities, and home necessities with steady pacing.',
      topCategoryName,
      topCategoryPercent,
      frequencyText,
      cadenceDescription,
      positiveHighlight: `Even basket distribution across categories with steady spending rhythm across the month.`,
    };
  }, [purchases, formatPrice]);

  return (
    <section className={`rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br ${personality.bgGradient} shadow-xs transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Badge + Explanation */}
        <div className="flex items-start gap-4 min-w-0">
          {/* Avatar / Emoji Badge Icon */}
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center text-2xl shrink-0">
            {personality.badgeEmoji}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Shopping Personality
              </span>

              {/* Friendly Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${personality.badgeBorderClass} ${personality.badgeColorClass}`}>
                <span>{personality.badgeTitle}</span>
              </span>
            </div>

            {/* Brief, non-judgmental explanation */}
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug max-w-xl">
              {personality.explanation}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setShowDetails(prev => !prev)}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            aria-expanded={showDetails}
            title="Toggle insights breakdown"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{showDetails ? 'Hide Details' : 'View Factors'}</span>
          </button>

          {onExploreInsights && (
            <button
              onClick={onExploreInsights}
              className="p-1.5 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
              title="Open full analytics"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Analysis Metrics Strip */}
      <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Top Category Factor */}
        <div className="flex items-center gap-2.5 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold uppercase">
              Top Category
            </span>
            <span className="font-bold text-slate-800 dark:text-white truncate block">
              {personality.topCategoryName} ({personality.topCategoryPercent}% of spend)
            </span>
          </div>
        </div>

        {/* Spending Frequency Factor */}
        <div className="flex items-center gap-2.5 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold uppercase">
              Spending Frequency
            </span>
            <span className="font-bold text-slate-800 dark:text-white truncate block">
              {personality.frequencyText} · {personality.cadenceDescription}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Non-judgmental Factors Breakdown */}
      {showDetails && (
        <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white text-xs">
            <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>How your personality badge was calculated</span>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            This supportive analytical profile is derived from your delivered orders across categories and checkout dates. It celebrates your organic shopping preferences without judgment or spending labels.
          </p>

          <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <span>
              <strong>Key Highlight:</strong> {personality.positiveHighlight}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
