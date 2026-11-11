import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  Lightbulb, 
  Plus, 
  Camera, 
  SlidersHorizontal, 
  RotateCcw, 
  TrendingDown, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Target,
  GripVertical,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, PurchaseItem, PriceDropItem, CheaperAlternative, CategoryBudget, ProductCategory } from '../types';
import { QuickAddPurchaseModal } from './QuickAddPurchaseModal';
import { ReceiptCameraScannerModal } from './ReceiptCameraScannerModal';
import { DashboardCustomizerModal, DEFAULT_DASHBOARD_CARDS, DashboardCardConfig } from './DashboardCustomizerModal';
import { ProductDetailsModal } from './ProductDetailsModal';
import { NoPurchasesEmptyState } from './SkeletonAndEmptyStates';
import { RadialGoalProgressBar } from './RadialGoalProgressBar';
import { QuickActionsBar } from './QuickActionsBar';
import { RecentlyViewedSection } from './RecentlyViewedSection';
import { BudgetProgressWidget } from './BudgetProgressWidget';
import { SpendingSparklineWidget } from './SpendingSparklineWidget';

interface DashboardViewProps {
  purchases: PurchaseTransaction[];
  monthlyBudget?: number;
  budgets?: CategoryBudget[];
  onNavigateTab: (tab: any) => void;
  priceDrops?: PriceDropItem[];
  savingsRecommendations?: CheaperAlternative[];
  onOpenStoreModal?: (storeName: string) => void;
  onOpenMonthlySummary?: () => void;
  onAddPurchase?: (purchase: PurchaseTransaction) => void;
  onUpdatePurchase?: (purchase: PurchaseTransaction) => void;
  onUpdateBudget?: (category: ProductCategory, limit: number) => void;
  onSelectProduct?: (item: PurchaseItem, transaction?: PurchaseTransaction) => void;
  onRestoreDemo?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  purchases,
  monthlyBudget = 15000,
  budgets,
  onNavigateTab,
  onOpenStoreModal,
  onAddPurchase,
  onUpdatePurchase,
  onUpdateBudget,
  onSelectProduct,
  onRestoreDemo,
}) => {
  const { formatPrice, smartAdviceLevel } = useApp();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedProductItem, setSelectedProductItem] = useState<{ item: PurchaseItem; transaction?: PurchaseTransaction } | null>(null);

  // Month selector state
  const availableMonths = useMemo(() => ['October 2026', 'September 2026', 'August 2026'], []);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const selectedMonth = availableMonths[selectedMonthIndex];

  const handlePrevMonth = () => {
    setSelectedMonthIndex((prev) => Math.min(prev + 1, availableMonths.length - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthIndex((prev) => Math.max(prev - 1, 0));
  };

  // Load customizable dashboard card preferences from localStorage
  const [dashboardCards, setDashboardCards] = useState<DashboardCardConfig[]>(() => {
    try {
      const saved = localStorage.getItem('cartlens_dashboard_cards_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const existingIds = new Set(parsed.map((c: any) => c.id));
          const missingDefaults = DEFAULT_DASHBOARD_CARDS.filter((c) => !existingIds.has(c.id));
          if (missingDefaults.length > 0) {
            const merged = [...parsed, ...missingDefaults].map((c, i) => ({ ...c, order: i }));
            try {
              localStorage.setItem('cartlens_dashboard_cards_v4', JSON.stringify(merged));
            } catch {}
            return merged;
          }
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_DASHBOARD_CARDS;
  });

  const handleSaveDashboardCards = (updated: DashboardCardConfig[]) => {
    setDashboardCards(updated);
    try {
      localStorage.setItem('cartlens_dashboard_cards_v4', JSON.stringify(updated));
    } catch {}
  };

  const handleResetDashboardCards = () => {
    setDashboardCards(DEFAULT_DASHBOARD_CARDS);
    try {
      localStorage.setItem('cartlens_dashboard_cards_v4', JSON.stringify(DEFAULT_DASHBOARD_CARDS));
    } catch {}
  };

  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  const [isArrangeMode, setIsArrangeMode] = useState(false);
  const customizerMenuRef = useRef<HTMLDivElement>(null);

  // Drag and drop states on dashboard
  const [draggedDashboardCardId, setDraggedDashboardCardId] = useState<string | null>(null);
  const [dragOverDashboardCardId, setDragOverDashboardCardId] = useState<string | null>(null);

  // Drag and drop states inside the popover menu
  const [menuDraggedIdx, setMenuDraggedIdx] = useState<number | null>(null);

  // Close visibility menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customizerMenuRef.current && !customizerMenuRef.current.contains(e.target as Node)) {
        setIsVisibilityMenuOpen(false);
      }
    };
    if (isVisibilityMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisibilityMenuOpen]);

  // Toggle card visibility
  const handleToggleCardVisibility = (cardId: string) => {
    const updated = dashboardCards.map((c) =>
      c.id === cardId ? { ...c, visible: !c.visible } : c
    );
    handleSaveDashboardCards(updated);
  };

  // Move card up or down
  const handleMoveCard = (cardId: string, direction: 'up' | 'down') => {
    const sorted = [...dashboardCards].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === cardId);
    if (idx === -1) return;
    if (direction === 'up' && idx > 0) {
      const temp = sorted[idx - 1];
      sorted[idx - 1] = sorted[idx];
      sorted[idx] = temp;
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const temp = sorted[idx + 1];
      sorted[idx + 1] = sorted[idx];
      sorted[idx] = temp;
    } else {
      return;
    }
    const updated = sorted.map((c, i) => ({ ...c, order: i }));
    handleSaveDashboardCards(updated);
  };

  // Dashboard Drag-and-drop handlers
  const handleDashboardDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedDashboardCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDashboardDragOver = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedDashboardCardId && draggedDashboardCardId !== targetCardId) {
      setDragOverDashboardCardId(targetCardId);
    }
  };

  const handleDashboardDragLeave = () => {
    setDragOverDashboardCardId(null);
  };

  const handleDashboardDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    if (!draggedDashboardCardId || draggedDashboardCardId === targetCardId) {
      setDraggedDashboardCardId(null);
      setDragOverDashboardCardId(null);
      return;
    }

    const sorted = [...dashboardCards].sort((a, b) => a.order - b.order);
    const sourceIdx = sorted.findIndex((c) => c.id === draggedDashboardCardId);
    const targetIdx = sorted.findIndex((c) => c.id === targetCardId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [moved] = sorted.splice(sourceIdx, 1);
      sorted.splice(targetIdx, 0, moved);
      const updated = sorted.map((c, i) => ({ ...c, order: i }));
      handleSaveDashboardCards(updated);
    }

    setDraggedDashboardCardId(null);
    setDragOverDashboardCardId(null);
  };

  const handleDashboardDragEnd = () => {
    setDraggedDashboardCardId(null);
    setDragOverDashboardCardId(null);
  };

  // Popover menu drag-and-drop handlers
  const handleMenuDragStart = (idx: number) => {
    setMenuDraggedIdx(idx);
  };

  const handleMenuDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (menuDraggedIdx === null || menuDraggedIdx === targetIdx) return;
    const sorted = [...dashboardCards].sort((a, b) => a.order - b.order);
    const [moved] = sorted.splice(menuDraggedIdx, 1);
    sorted.splice(targetIdx, 0, moved);
    const updated = sorted.map((c, i) => ({ ...c, order: i }));
    setMenuDraggedIdx(targetIdx);
    handleSaveDashboardCards(updated);
  };

  const handleMenuDragEnd = () => {
    setMenuDraggedIdx(null);
  };

  // Sorted cards by order
  const sortedCards = useMemo(() => {
    return [...dashboardCards].sort((a, b) => a.order - b.order);
  }, [dashboardCards]);

  const sortedVisibleCards = useMemo(() => {
    return [...dashboardCards]
      .filter((c) => c.visible)
      .sort((a, b) => a.order - b.order);
  }, [dashboardCards]);

  // Card visibility map
  const cardVisibility = useMemo(() => {
    const map: Record<string, boolean> = {};
    dashboardCards.forEach((c) => {
      map[c.id] = c.visible;
    });
    return map;
  }, [dashboardCards]);

  const visibleCardsCount = useMemo(() => {
    return dashboardCards.filter((c) => c.visible).length;
  }, [dashboardCards]);

  // Delivered, non-refunded purchases
  const validPurchases = useMemo(() => {
    return purchases.filter((p) => !p.isRefunded && p.orderStatus !== 'Cancelled');
  }, [purchases]);

  // =========================================================================
  // 1. TOTAL SPENDING
  // =========================================================================
  const totalSpentMonth = useMemo(() => {
    if (selectedMonthIndex === 1) return 13530; // Sep 2026
    if (selectedMonthIndex === 2) return 14200; // Aug 2026
    const sum = validPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
    return sum > 0 ? sum : 12450;
  }, [validPurchases, selectedMonthIndex]);

  const comparisonPercent = 8;

  // Radial Goal Tracking State: spending limit or savings target
  const [activeGoalType, setActiveGoalType] = useState<'spending' | 'savings'>(() => {
    try {
      const saved = localStorage.getItem('cartlens_dashboard_goal_type');
      return (saved === 'savings' || saved === 'spending') ? saved : 'spending';
    } catch {
      return 'spending';
    }
  });

  const [currentSpendingBudget, setCurrentSpendingBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cartlens_dashboard_spending_goal');
      return saved ? Number(saved) : monthlyBudget;
    } catch {
      return monthlyBudget;
    }
  });

  const [savingsTarget, setSavingsTarget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cartlens_dashboard_savings_goal');
      return saved ? Number(saved) : 5000;
    } catch {
      return 5000;
    }
  });

  const handleGoalTypeChange = (type: 'spending' | 'savings') => {
    setActiveGoalType(type);
    try {
      localStorage.setItem('cartlens_dashboard_goal_type', type);
    } catch {}
  };

  const handleUpdateSpendingLimit = (newLimit: number) => {
    setCurrentSpendingBudget(newLimit);
    try {
      localStorage.setItem('cartlens_dashboard_spending_goal', String(newLimit));
    } catch {}
  };

  const handleUpdateSavingsTarget = (newTarget: number) => {
    setSavingsTarget(newTarget);
    try {
      localStorage.setItem('cartlens_dashboard_savings_goal', String(newTarget));
    } catch {}
  };

  const totalSavingsAchieved = useMemo(() => {
    const discountsSum = validPurchases.reduce((acc, p) => acc + (p.discount || 0), 0);
    return discountsSum > 0 ? discountsSum : 3680;
  }, [validPurchases]);

  const budgetPacePercent = Math.min(Math.round((totalSpentMonth / currentSpendingBudget) * 100), 100);
  const remainingBudget = Math.max(currentSpendingBudget - totalSpentMonth, 0);

  // =========================================================================
  // 2. RECENT PURCHASES (Only 5 most recent purchases)
  // =========================================================================
  const recentPurchases = useMemo(() => {
    const itemsList: {
      id: string;
      name: string;
      store: string;
      price: number;
      date: string;
      relativeDate: string;
      imageUrl?: string;
      category?: string;
      rawItem: PurchaseItem;
      parentTransaction: PurchaseTransaction;
    }[] = [];

    const getRelativeTimeString = (idx: number) => {
      if (idx === 0) return '2 days ago';
      if (idx === 1) return '4 days ago';
      if (idx === 2) return '1 week ago';
      if (idx === 3) return '10 days ago';
      if (idx === 4) return '2 weeks ago';
      return 'Recently';
    };

    validPurchases.forEach((p) => {
      p.items.forEach((item) => {
        itemsList.push({
          id: item.id || `item-${itemsList.length}`,
          name: item.name,
          store: item.store || p.store,
          price: item.price,
          date: item.date || p.date,
          relativeDate: getRelativeTimeString(itemsList.length),
          imageUrl: item.imageUrl,
          category: item.category,
          rawItem: item,
          parentTransaction: p,
        });
      });
    });

    return itemsList.slice(0, 5);
  }, [validPurchases]);

  // =========================================================================
  // 3. SPENDING BY CATEGORY
  // =========================================================================
  const categorySpending = useMemo(() => {
    const cats = [
      { id: 'clothing', emoji: '👕', name: 'Clothing', amount: 4200, color: '#8b5cf6', barColor: 'bg-violet-500' },
      { id: 'electronics', emoji: '💻', name: 'Electronics', amount: 3100, color: '#3b82f6', barColor: 'bg-blue-500' },
      { id: 'shoes', emoji: '👟', name: 'Shoes', amount: 2400, color: '#10b981', barColor: 'bg-emerald-500' },
      { id: 'beauty', emoji: '💄', name: 'Beauty', amount: 1850, color: '#ec4899', barColor: 'bg-pink-500' },
      { id: 'accessories', emoji: '🎒', name: 'Accessories', amount: 900, color: '#f59e0b', barColor: 'bg-amber-500' },
    ];
    const total = cats.reduce((acc, c) => acc + c.amount, 0);
    return cats.map((c) => ({
      ...c,
      percent: Math.round((c.amount / total) * 100),
    }));
  }, []);

  const totalCategoryAmount = useMemo(() => {
    return categorySpending.reduce((acc, c) => acc + c.amount, 0);
  }, [categorySpending]);

  // =========================================================================
  // 4. TOP STORES (Top 3 most-used shopping websites)
  // =========================================================================
  const topStores = useMemo(() => {
    const storeMap: Record<string, { count: number; spent: number }> = {};
    validPurchases.forEach((p) => {
      const s = p.store || 'Online Store';
      if (!storeMap[s]) storeMap[s] = { count: 0, spent: 0 };
      storeMap[s].count += 1;
      storeMap[s].spent += p.totalAmount;
    });

    const calculated = Object.entries(storeMap)
      .map(([name, data]) => ({
        name,
        purchasesCount: data.count,
        spent: data.spent,
      }))
      .sort((a, b) => b.purchasesCount - a.purchasesCount);

    if (calculated.length >= 3) {
      const top3 = calculated.slice(0, 3);
      const maxCount = top3[0].purchasesCount || 1;
      return top3.map((st, i) => ({
        ...st,
        logoEmoji: i === 0 ? '📦' : i === 1 ? '🛍️' : '🛒',
        barPercent: Math.round((st.purchasesCount / maxCount) * 100),
        colorClass: i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-pink-500' : 'bg-blue-500',
      }));
    }

    return [
      {
        name: 'Amazon',
        purchasesCount: 12,
        spent: 8450,
        logoEmoji: '📦',
        barPercent: 100,
        colorClass: 'bg-amber-500',
      },
      {
        name: 'Myntra',
        purchasesCount: 8,
        spent: 5240,
        logoEmoji: '🛍️',
        barPercent: 67,
        colorClass: 'bg-pink-500',
      },
      {
        name: 'Flipkart',
        purchasesCount: 5,
        spent: 3890,
        logoEmoji: '🛒',
        barPercent: 42,
        colorClass: 'bg-blue-500',
      },
    ];
  }, [validPurchases]);

  // =========================================================================
  // 5. ONE SMART INSIGHT
  // =========================================================================
  // 5. ONE SMART INSIGHT (Adapted to smartAdviceLevel: Minimal, Balanced, Detailed)
  // =========================================================================
  const smartInsights = useMemo(() => {
    if (smartAdviceLevel === 'minimal') {
      return [
        {
          id: 'ins-min-1',
          title: 'Monthly Summary',
          message: 'Total verified purchases recorded this month stand at 18 orders.',
          highlight: '18 orders total',
          badge: 'Factual Summary',
        },
        {
          id: 'ins-min-2',
          title: 'Budget Standing',
          message: 'Your overall spending is currently tracking 8% below your monthly target.',
          highlight: '8% under budget',
          badge: 'Budget Limit',
        },
      ];
    }

    if (smartAdviceLevel === 'detailed') {
      return [
        {
          id: 'ins-det-1',
          title: 'Behavioral Velocity',
          message: '68% of discretionary spending occurred on Friday-Sunday weekends. Shifting non-urgent purchases to mid-week bundle promotions can save an estimated ₹1,200/mo.',
          highlight: 'Weekend velocity high',
          badge: 'Spending Habits',
        },
        {
          id: 'ins-det-2',
          title: 'Price Volatility Alert',
          message: 'Electronics & Gadgets purchases had a 24-day average price volatility. Tracking price drops on your Wishlist can unlock up to 14% cashback.',
          highlight: '14% potential cashback',
          badge: 'Price Intelligence',
        },
        {
          id: 'ins-det-3',
          title: 'Subscription Audit',
          message: '3 recurring delivery subscriptions renew in the next 10 days. Auditing unstreamed entertainment add-ons can recover ₹650 monthly.',
          highlight: '3 renewals upcoming',
          badge: 'Recurring Audit',
        },
      ];
    }

    // Default: 'balanced'
    return [
      {
        id: 'ins-1',
        title: 'Smart Insight',
        message: 'You spent 12% less on clothing this month compared to last month.',
        highlight: '12% less on clothing',
        badge: 'Savings Trend',
      },
      {
        id: 'ins-2',
        title: 'Smart Insight',
        message: 'Amazon is your most frequent shopping stop with 12 orders placed this month.',
        highlight: '12 orders on Amazon',
        badge: 'Shopping Habit',
      },
      {
        id: 'ins-3',
        title: 'Smart Insight',
        message: 'Your overall spending is currently pacing 8% below your monthly target.',
        highlight: '8% lower overall',
        badge: 'Budget Health',
      },
      {
        id: 'ins-4',
        title: 'Smart Insight',
        message: 'You placed zero impulsive late-night purchases in the last 14 days.',
        highlight: 'Zero late-night splurges',
        badge: 'Mindful Shopping',
      },
    ];
  }, [smartAdviceLevel]);

  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  const handleNextInsight = () => {
    setCurrentInsightIndex((prev) => (prev + 1) % smartInsights.length);
  };

  const currentInsight = smartInsights[currentInsightIndex % smartInsights.length] || smartInsights[0];

  const handleProductClick = (item: PurchaseItem, parentTx: PurchaseTransaction) => {
    if (onSelectProduct) {
      onSelectProduct(item, parentTx);
    }
    setSelectedProductItem({ item, transaction: parentTx });
  };

  // Dynamic Widget Renderer based on user's customized layout order
  const renderWidgetContent = (cardId: string) => {
    switch (cardId) {
      case 'quick_actions':
        return (
          <QuickActionsBar onNavigateTab={onNavigateTab} />
        );

      case 'total_spending':
        return (
          <section className="bg-gradient-to-br from-[#F3EEFF] via-[#FAF6FF] to-[#FFF9F2] dark:from-[#131A2B] dark:via-purple-950/40 dark:to-[#131A2B] border border-[#E5DDF2] dark:border-purple-900/50 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full min-w-0">
            <RadialGoalProgressBar
              goalType={activeGoalType}
              onGoalTypeChange={handleGoalTypeChange}
              spentAmount={totalSpentMonth}
              spendingLimit={currentSpendingBudget}
              onUpdateSpendingLimit={handleUpdateSpendingLimit}
              savingsAchieved={totalSavingsAchieved}
              savingsTarget={savingsTarget}
              onUpdateSavingsTarget={handleUpdateSavingsTarget}
              monthName={selectedMonth}
              comparisonPercent={comparisonPercent}
            />
          </section>
        );

      case 'spending_sparkline':
        return (
          <SpendingSparklineWidget
            purchases={validPurchases}
            onNavigateTab={onNavigateTab}
          />
        );

      case 'recent_purchases':
        return (
          <section className="bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between mb-3 min-w-0">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-[#4C267B] dark:text-white truncate">
                    Recent Purchases
                  </h2>
                  <p className="text-[11px] text-[#625B72] dark:text-slate-400 font-medium">
                    5 most recent verified orders
                  </p>
                </div>

                <button
                  onClick={() => onNavigateTab('purchases')}
                  aria-label="View all purchases"
                  className="group inline-flex items-center gap-1 text-xs font-bold text-[#7C3AED] dark:text-purple-400 hover:text-[#4C267B] transition-colors cursor-pointer shrink-0"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {recentPurchases.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#625B72]">
                  No recent purchases found.
                </div>
              ) : (
                <div className="divide-y divide-[#E5DDF2] dark:divide-slate-800/60 min-w-0">
                  {recentPurchases.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p.rawItem, p.parentTransaction)}
                      className="py-2 flex items-center justify-between gap-2.5 group hover:bg-[#F8F5FD] dark:hover:bg-slate-800/40 rounded-xl px-1.5 -mx-1.5 transition-colors cursor-pointer min-w-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-lg bg-[#F8F5FD] dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-base">🛍️</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold text-[#1E1B2E] dark:text-white truncate group-hover:text-[#7C3AED] dark:group-hover:text-purple-400 transition-colors">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#625B72] dark:text-slate-400 mt-0.5 truncate">
                            <span className="font-semibold text-[#4C267B] dark:text-slate-300">
                              {p.store}
                            </span>
                            <span>·</span>
                            <span>{p.relativeDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold font-mono text-[#1E1B2E] dark:text-white tabular-nums block">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2.5 mt-2 border-t border-[#E5DDF2] dark:border-slate-800 flex items-center justify-between text-[11px] text-[#625B72] dark:text-slate-400">
              <span>Showing 5 latest orders</span>
              <button
                onClick={() => onNavigateTab('purchases')}
                className="font-bold text-[#7C3AED] dark:text-purple-400 hover:underline cursor-pointer"
              >
                View full ledger →
              </button>
            </div>
          </section>
        );

      case 'recently_viewed':
        return (
          <RecentlyViewedSection
            onSelectProduct={(item: PurchaseItem) => {
              setSelectedProductItem({ item });
              if (onSelectProduct) onSelectProduct(item);
            }}
            onNavigateTab={onNavigateTab}
          />
        );

      case 'budget_progress':
        return (
          <BudgetProgressWidget
            purchases={validPurchases}
            budgets={budgets}
            onNavigateTab={onNavigateTab}
            onUpdateBudget={onUpdateBudget}
            selectedMonth={selectedMonth}
          />
        );

      case 'category_spending':
        return (
          <section className="bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between mb-3 min-w-0">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-[#4C267B] dark:text-white truncate">
                    Spending by Category
                  </h2>
                  <p className="text-[11px] text-[#625B72] dark:text-slate-400 font-medium">
                    Breakdown across 5 core categories
                  </p>
                </div>

                <button
                  onClick={() => onNavigateTab('analytics')}
                  aria-label="View category analytics"
                  className="group inline-flex items-center gap-1 text-xs font-bold text-[#7C3AED] dark:text-purple-400 hover:text-[#4C267B] transition-colors cursor-pointer shrink-0"
                >
                  <span>View Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Proportional Segmented Progress Bar */}
              <div className="mb-3">
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-[#F3EEFF] dark:bg-slate-800 border border-[#E5DDF2] dark:border-transparent">
                  {categorySpending.map((cat) => (
                    <div
                      key={cat.id}
                      className={`h-full ${cat.barColor} transition-all`}
                      style={{ width: `${cat.percent}%` }}
                      title={`${cat.name}: ${formatPrice(cat.amount)} (${cat.percent}%)`}
                    />
                  ))}
                </div>
              </div>

              {/* 5 Categories List */}
              <div className="space-y-1.5 min-w-0">
                {categorySpending.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => onNavigateTab('analytics')}
                    className="flex items-center justify-between gap-2.5 text-xs p-1.5 rounded-xl hover:bg-[#F8F5FD] dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{cat.emoji}</span>
                      <span className="font-bold text-[#1E1B2E] dark:text-slate-200 truncate">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[11px] text-[#625B72] dark:text-slate-400 font-mono font-medium">
                        {cat.percent}%
                      </span>
                      <span className="font-bold font-mono text-[#4C267B] dark:text-white tabular-nums">
                        {formatPrice(cat.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2.5 mt-2 border-t border-[#E5DDF2] dark:border-slate-800 flex items-center justify-between text-[11px] text-[#625B72] dark:text-slate-400 font-medium">
              <span>Total categorized spend</span>
              <span className="font-extrabold font-mono text-[#4C267B] dark:text-slate-200">
                {formatPrice(totalCategoryAmount)}
              </span>
            </div>
          </section>
        );

      case 'top_stores':
        return (
          <section className="bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between mb-3 min-w-0">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-[#4C267B] dark:text-white truncate">
                    Top Stores
                  </h2>
                  <p className="text-[11px] text-[#625B72] dark:text-slate-400 font-medium">
                    Only the 3 most-used shopping websites
                  </p>
                </div>

                <button
                  onClick={() => onNavigateTab('stores')}
                  aria-label="View all stores"
                  className="group inline-flex items-center gap-1 text-xs font-bold text-[#7C3AED] dark:text-purple-400 hover:text-[#4C267B] transition-colors cursor-pointer shrink-0"
                >
                  <span>View All Stores</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* 3 Store Cards with Soft Pastel Styling */}
              <div className="space-y-2 min-w-0">
                {topStores.map((st, idx) => (
                  <div
                    key={st.name}
                    onClick={() => {
                      if (onOpenStoreModal) {
                        onOpenStoreModal(st.name);
                      } else {
                        onNavigateTab('stores');
                      }
                    }}
                    className="p-3 rounded-xl bg-[#F8F5FD] dark:bg-slate-800/40 border border-[#E5DDF2] dark:border-slate-800 hover:border-[#8B5CF6]/60 dark:hover:border-purple-700 transition-all cursor-pointer group flex flex-col justify-between min-w-0 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{st.logoEmoji}</span>
                        <div className="min-w-0">
                          <h3 className="text-xs sm:text-sm font-extrabold text-[#1E1B2E] dark:text-white truncate group-hover:text-[#7C3AED] dark:group-hover:text-purple-400 transition-colors">
                            {st.name}
                          </h3>
                          <span className="text-[10px] text-[#625B72] dark:text-slate-400 font-bold">
                            Rank #{idx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold font-mono text-[#1E1B2E] dark:text-white tabular-nums block">
                          {formatPrice(st.spent)}
                        </span>
                        <span className="text-[10px] text-[#625B72] dark:text-slate-400 font-semibold">
                          {st.purchasesCount} orders
                        </span>
                      </div>
                    </div>

                    {/* Progress Volume Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[#E5DDF2] dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full ${st.colorClass} rounded-full`}
                        style={{ width: `${st.barPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2.5 mt-2 border-t border-[#E5DDF2] dark:border-slate-800 flex items-center justify-between text-[11px] text-[#625B72] dark:text-slate-400">
              <span>Store policy & price tracking</span>
              <button
                onClick={() => onNavigateTab('stores')}
                className="font-bold text-[#7C3AED] dark:text-purple-400 hover:underline cursor-pointer"
              >
                Compare stores →
              </button>
            </div>
          </section>
        );

      case 'smart_insight':
        return (
          <section className="bg-gradient-to-r from-[#FFF6ED] via-[#FFF9F2] to-[#FFF0E1] dark:from-[#131A2B] dark:via-amber-950/20 dark:to-[#131A2B] border border-[#FDBA74]/60 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0E1] dark:bg-amber-950/60 text-[#EA580C] dark:text-amber-400 border border-[#FDBA74]/40 flex items-center justify-center shrink-0 shadow-2xs">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#C2410C] dark:text-amber-400 uppercase font-bold tracking-wider">
                    {currentInsight.badge}
                  </span>
                  <span className="text-[10px] text-[#625B72] dark:text-slate-400 font-semibold">
                    · Showing {currentInsightIndex + 1} of {smartInsights.length}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#1E1B2E] dark:text-white">
                  {currentInsight.title}
                </h3>
                <p className="text-xs text-[#625B72] dark:text-slate-300">
                  {currentInsight.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FFF0E1] dark:bg-amber-950/50 border border-[#FDBA74]/40 text-xs font-bold text-[#C2410C] dark:text-amber-300 shadow-2xs">
                {currentInsight.highlight}
              </span>
              <button
                onClick={handleNextInsight}
                aria-label="Next insight"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] dark:text-purple-400 hover:text-[#4C267B] dark:hover:text-purple-300 cursor-pointer px-3 py-1.5 rounded-xl bg-white dark:bg-purple-950/40 hover:bg-[#F3EEFF] border border-[#E5DDF2] dark:border-transparent transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Next Insight</span>
              </button>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto space-y-5 animate-fadeIn pb-12 min-w-0">
      
      {/* ========================================================================= */}
      {/* 1. DASHBOARD HEADER: Compact, aligned, Light Mode pure white card         */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl py-3 px-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs min-w-0">
        {/* Title and Clean Subtitle */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-[#4C267B] dark:text-white tracking-tight truncate">
              User Dashboard
            </h1>
            <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#F3EEFF] text-[#7C3AED] border border-[#E5DDF2] dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/50">
              5-Second Summary
            </span>
          </div>
          <p className="text-xs text-[#625B72] dark:text-slate-400 font-medium truncate mt-0.5">
            Spending overview, recent purchases, and key category insights
          </p>
        </div>

        {/* Compact Right Controls in One Single Row */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Month Selector */}
          <div className="flex items-center bg-[#F3EEFF] dark:bg-slate-800/80 border border-[#E5DDF2] dark:border-slate-700 rounded-xl p-0.5">
            <button
              onClick={handlePrevMonth}
              disabled={selectedMonthIndex === availableMonths.length - 1}
              aria-label="Previous month"
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-[#4C267B] dark:text-slate-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1 px-2 text-xs font-bold text-[#4C267B] dark:text-white whitespace-nowrap">
              <Calendar className="w-3 h-3 text-[#8B5CF6]" />
              <span>{selectedMonth}</span>
            </div>
            <button
              onClick={handleNextMonth}
              disabled={selectedMonthIndex === 0}
              aria-label="Next month"
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-[#4C267B] dark:text-slate-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Customize Widgets Button & Quick Dropdown Menu */}
          <div className="relative" ref={customizerMenuRef}>
            <button
              onClick={() => setIsVisibilityMenuOpen(prev => !prev)}
              aria-label="Customize dashboard cards and widgets"
              aria-expanded={isVisibilityMenuOpen}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isVisibilityMenuOpen || isArrangeMode
                  ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-xs'
                  : 'bg-[#F3EEFF] hover:bg-[#EBDFFD] text-[#4C267B] border-[#E5DDF2] dark:bg-purple-950/50 dark:hover:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customize</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                isVisibilityMenuOpen || isArrangeMode ? 'bg-white/20 text-white' : 'bg-[#8B5CF6] text-white'
              }`}>
                {visibleCardsCount}/{dashboardCards.length}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isVisibilityMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick 'Toggle Visibility' & Reorder Popover Menu */}
            {isVisibilityMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-3.5 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E5DDF2] dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-xs font-bold text-[#1E1B2E] dark:text-white">Dashboard Widgets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3EEFF] text-[#7C3AED] dark:bg-purple-950 dark:text-purple-300">
                      {visibleCardsCount} of {dashboardCards.length} visible
                    </span>
                    <button 
                      onClick={() => setIsVisibilityMenuOpen(false)}
                      className="p-1 rounded-lg text-[#625B72] hover:text-[#1E1B2E] dark:hover:text-white cursor-pointer"
                      title="Close menu"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* On-Dashboard Rearrange Mode Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F5FD] dark:bg-[#0E1422] border border-[#E5DDF2]/80 dark:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <GripVertical className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1E1B2E] dark:text-white truncate">
                        On-Dashboard Drag & Drop
                      </div>
                      <div className="text-[10px] text-[#625B72] dark:text-slate-400 truncate">
                        Rearrange cards directly on your screen
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsArrangeMode(prev => !prev);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isArrangeMode 
                        ? 'bg-[#8B5CF6] text-white shadow-xs' 
                        : 'bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 text-[#4C267B] dark:text-slate-300 hover:bg-[#F3EEFF]'
                    }`}
                  >
                    {isArrangeMode ? 'Active' : 'Enable'}
                  </button>
                </div>

                {/* Draggable & Toggleable Widget List */}
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin">
                  {sortedCards.map((card, idx) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleMenuDragStart(idx)}
                      onDragOver={(e) => handleMenuDragOver(e, idx)}
                      onDragEnd={handleMenuDragEnd}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                        menuDraggedIdx === idx
                          ? 'opacity-40 border-[#8B5CF6] bg-purple-50 dark:bg-purple-950/30'
                          : card.visible
                          ? 'bg-white dark:bg-[#131A2B] border-[#E5DDF2] dark:border-slate-800 shadow-2xs'
                          : 'bg-[#F8F5FD]/60 dark:bg-slate-900/60 border-dashed border-[#E5DDF2] dark:border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div 
                          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#8B5CF6] transition-colors p-0.5 shrink-0"
                          title="Drag to rearrange"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#1E1B2E] dark:text-white truncate">
                            {card.title}
                          </div>
                          <span className="text-[9px] text-[#625B72] dark:text-slate-400 font-medium">
                            {card.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMoveCard(card.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded-md hover:bg-[#F3EEFF] dark:hover:bg-slate-800 text-[#625B72] hover:text-[#1E1B2E] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveCard(card.id, 'down')}
                          disabled={idx === sortedCards.length - 1}
                          className="p-1 rounded-md hover:bg-[#F3EEFF] dark:hover:bg-slate-800 text-[#625B72] hover:text-[#1E1B2E] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleToggleCardVisibility(card.id)}
                          className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                            card.visible
                              ? 'bg-[#F3EEFF] text-[#7C3AED] dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-[#625B72] dark:text-slate-400'
                          }`}
                          title={card.visible ? 'Hide widget' : 'Show widget'}
                        >
                          {card.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="text-[10px] hidden sm:inline">
                            {card.visible ? 'Shown' : 'Hidden'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer buttons */}
                <div className="pt-2 border-t border-[#E5DDF2] dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={handleResetDashboardCards}
                    className="text-[11px] font-semibold text-[#625B72] hover:text-[#7C3AED] dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Layout</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsVisibilityMenuOpen(false);
                      setIsCustomizerOpen(true);
                    }}
                    className="text-[11px] font-bold text-[#7C3AED] dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Full Customizer Modal →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scan Receipt Button */}
          <button
            onClick={() => setIsCameraScannerOpen(true)}
            aria-label="Scan physical receipt"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F3EEFF] text-[#4C267B] border border-[#E5DDF2] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Scan</span>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            aria-label="Add manual purchase"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EMPTY PURCHASE OR EMPTY SECTIONS STATE                                    */}
      {/* ========================================================================= */}
      {validPurchases.length === 0 ? (
        <NoPurchasesEmptyState
          onRestoreDemo={onRestoreDemo}
          onAddManual={() => setIsQuickAddOpen(true)}
          onScanReceipt={() => setIsCameraScannerOpen(true)}
        />
      ) : visibleCardsCount === 0 ? (
        <div className="bg-white dark:bg-[#131A2B] rounded-2xl p-8 text-center border border-dashed border-[#E5DDF2] dark:border-slate-800 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center mx-auto text-xl">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#4C267B] dark:text-slate-200">
            All Dashboard Sections Are Hidden
          </h3>
          <p className="text-xs text-[#625B72] max-w-sm mx-auto">
            You have hidden all dashboard sections. Customize your layout to choose which cards to display.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold hover:bg-[#7C3AED] cursor-pointer shadow-xs"
            >
              Open Customizer
            </button>
            <button
              onClick={handleResetDashboardCards}
              className="px-4 py-2 rounded-xl bg-[#F3EEFF] text-[#4C267B] border border-[#E5DDF2] dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold hover:bg-[#EBDFFD] cursor-pointer"
            >
              Reset to Default Layout
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Arrange Mode Active Banner */}
          {isArrangeMode && (
            <div className="p-3 sm:p-4 rounded-2xl bg-[#F3EEFF] dark:bg-purple-950/50 border border-[#8B5CF6]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#4C267B] dark:text-purple-200">
                    Dashboard Drag & Rearrange Mode
                  </h4>
                  <p className="text-[11px] text-[#625B72] dark:text-slate-300">
                    Drag widgets directly by their top handles or click arrow buttons to rearrange them.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleResetDashboardCards}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 text-xs font-semibold text-[#625B72] dark:text-slate-300 hover:bg-[#F8F5FD] cursor-pointer"
                >
                  Reset Layout
                </button>
                <button
                  onClick={() => setIsArrangeMode(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done Arranging</span>
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Grid of Visible Widgets Sorted by User Order */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch w-full min-w-0">
            {sortedVisibleCards.map((card, index) => {
              const isFullWidth =
                card.id === 'quick_actions' ||
                card.id === 'recently_viewed' ||
                card.id === 'budget_progress' ||
                card.id === 'smart_insight';

              return (
                <div
                  key={card.id}
                  draggable={isArrangeMode}
                  onDragStart={(e) => handleDashboardDragStart(e, card.id)}
                  onDragOver={(e) => handleDashboardDragOver(e, card.id)}
                  onDragLeave={handleDashboardDragLeave}
                  onDrop={(e) => handleDashboardDrop(e, card.id)}
                  onDragEnd={handleDashboardDragEnd}
                  className={`transition-all duration-200 min-w-0 flex flex-col ${
                    isFullWidth ? 'col-span-1 lg:col-span-2' : 'col-span-1'
                  } ${
                    draggedDashboardCardId === card.id ? 'opacity-40 scale-[0.98]' : ''
                  } ${
                    dragOverDashboardCardId === card.id
                      ? 'ring-2 ring-[#8B5CF6] ring-offset-2 ring-offset-[#FFF9F2] dark:ring-offset-[#0B0F19] rounded-2xl'
                      : ''
                  }`}
                >
                  {/* Arrange Toolbar (Shown when Arrange Mode is Active) */}
                  {isArrangeMode && (
                    <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-[#F3EEFF] dark:bg-purple-950/70 border border-[#E5DDF2] dark:border-purple-800/60 text-xs font-bold text-[#4C267B] dark:text-purple-300 shadow-2xs">
                      <div className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 text-[#8B5CF6]" />
                        <span>{card.title}</span>
                        <span className="text-[10px] font-normal text-[#625B72] dark:text-slate-400 hidden sm:inline">
                          · Drag to reorder
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveCard(card.id, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-[#625B72] hover:text-[#1E1B2E] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveCard(card.id, 'down')}
                          disabled={index === sortedVisibleCards.length - 1}
                          className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-[#625B72] hover:text-[#1E1B2E] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleCardVisibility(card.id)}
                          className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 hover:text-rose-700 cursor-pointer transition-colors"
                          title="Hide this widget"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Widget Content */}
                  <div className="flex-1 flex flex-col min-w-0">
                    {renderWidgetContent(card.id)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}
      {/* 1. Dashboard Layout Customizer Modal */}
      <DashboardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        cards={dashboardCards}
        onSaveCards={handleSaveDashboardCards}
        onResetDefault={handleResetDashboardCards}
      />

      {/* 2. Product Details Modal */}
      {selectedProductItem && (
        <ProductDetailsModal
          isOpen={true}
          onClose={() => setSelectedProductItem(null)}
          item={selectedProductItem.item}
          transaction={selectedProductItem.transaction}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* 3. Quick Add Purchase Modal */}
      <QuickAddPurchaseModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddPurchase={(p) => {
          if (onAddPurchase) onAddPurchase(p);
          setIsQuickAddOpen(false);
        }}
      />

      {/* 4. Receipt Camera Scanner Modal */}
      <ReceiptCameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onReceiptScanned={(p: PurchaseTransaction) => {
          if (onAddPurchase) onAddPurchase(p);
          setIsCameraScannerOpen(false);
        }}
      />
    </div>
  );
};
