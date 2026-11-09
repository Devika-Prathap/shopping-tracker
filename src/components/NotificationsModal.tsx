import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Bell, 
  Settings, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  AlertTriangle, 
  Calendar, 
  ShoppingBag, 
  ArrowRight, 
  SlidersHorizontal, 
  Trash2, 
  Check, 
  ShieldCheck,
  TrendingUp,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BudgetAlertNotification, PurchaseTransaction } from '../types';

export interface NotificationPreferenceSettings {
  monthlySummary: boolean;
  priceDrops: boolean;
  budgetAlerts: boolean;
  unusualSpending: boolean;
  purchaseUpdates: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferenceSettings = {
  monthlySummary: true,
  priceDrops: true,
  budgetAlerts: true,
  unusualSpending: true,
  purchaseUpdates: true,
};

export interface SmartNotificationItem {
  id: string;
  type: 'monthly_summary' | 'price_drop' | 'budget_alert' | 'unusual_spending' | 'purchase_update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
  amount?: number;
  merchant?: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetAlerts: BudgetAlertNotification[];
  purchases: PurchaseTransaction[];
  onNavigateTab?: (tab: any) => void;
  onOpenMonthlySummary?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  budgetAlerts,
  purchases,
  onNavigateTab,
  onOpenMonthlySummary,
}) => {
  const { formatPrice } = useApp();
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings'>('alerts');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'budget_alert' | 'price_drop' | 'monthly_summary' | 'purchase_update'>('all');

  // Load preferences from localStorage
  const [prefs, setPrefs] = useState<NotificationPreferenceSettings>(() => {
    try {
      const saved = localStorage.getItem('trackshop_notification_preferences_v1');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATION_PREFS;
    } catch {
      return DEFAULT_NOTIFICATION_PREFS;
    }
  });

  // Save preferences
  const handleTogglePref = (key: keyof NotificationPreferenceSettings) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('trackshop_notification_preferences_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Seed smart notifications matching the 5 requested categories
  const [notifications, setNotifications] = useState<SmartNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('trackshop_smart_notifications_v1');
      if (saved) return JSON.parse(saved);
    } catch {}

    return [
      {
        id: 'notif-01',
        type: 'monthly_summary',
        title: 'October Spending Summary Ready',
        message: 'Your monthly overview is ready: total spend is down 8% compared with September, saving ₹1,340!',
        timestamp: 'Today, 9:00 AM',
        read: false,
        linkTab: 'monthly_report',
      },
      {
        id: 'notif-02',
        type: 'price_drop',
        title: 'Price Drop on Nike Sneakers',
        message: 'Nike Air Max Craft Sneaker dropped by ₹300 on Myntra (now ₹2,699).',
        timestamp: 'Yesterday, 3:20 PM',
        read: false,
        amount: 300,
        merchant: 'Myntra',
        linkTab: 'price_drops',
      },
      {
        id: 'notif-03',
        type: 'budget_alert',
        title: 'Approaching Electronics Limit',
        message: 'Electronics category spending reached 84% of your monthly plan. Plenty of room left for Essentials!',
        timestamp: '2 days ago',
        read: false,
        linkTab: 'budgets',
      },
      {
        id: 'notif-04',
        type: 'unusual_spending',
        title: 'Weekend Spend Pattern Note',
        message: '3 orders placed this Saturday across food and groceries. Everything reconciled successfully.',
        timestamp: '3 days ago',
        read: true,
        linkTab: 'calendar',
      },
      {
        id: 'notif-05',
        type: 'purchase_update',
        title: 'Receipt Extracted & Reconciled',
        message: 'Zara Lifestyle slip verified with 96% AI confidence and attached to your purchases.',
        timestamp: '4 days ago',
        read: true,
        merchant: 'Zara Lifestyle',
        linkTab: 'purchases',
      },
    ];
  });

  // Save notifications on change
  useEffect(() => {
    try {
      localStorage.setItem('trackshop_smart_notifications_v1', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Merge any dynamic budget alerts from props if not yet in state
  useEffect(() => {
    if (budgetAlerts && budgetAlerts.length > 0) {
      const newItems: SmartNotificationItem[] = budgetAlerts
        .filter(b => !notifications.some(n => n.id === b.id))
        .map(b => ({
          id: b.id,
          type: 'budget_alert',
          title: `Budget Notice: ${b.merchant}`,
          message: b.message,
          timestamp: b.timestamp,
          read: b.read,
          amount: b.purchaseAmount,
          merchant: b.merchant,
          linkTab: 'budgets',
        }));

      if (newItems.length > 0) {
        setNotifications(prev => [...newItems, ...prev]);
      }
    }
  }, [budgetAlerts]);

  // Mark all as read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clear all
  const handleClearAll = () => {
    setNotifications([]);
  };

  // Toggle single item read status
  const handleToggleItemRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  // Filter items based on user preferences and selected filter
  const displayedNotifications = useMemo(() => {
    return notifications.filter(item => {
      // Filter out types disabled in preferences
      if (item.type === 'monthly_summary' && !prefs.monthlySummary) return false;
      if (item.type === 'price_drop' && !prefs.priceDrops) return false;
      if (item.type === 'budget_alert' && !prefs.budgetAlerts) return false;
      if (item.type === 'unusual_spending' && !prefs.unusualSpending) return false;
      if (item.type === 'purchase_update' && !prefs.purchaseUpdates) return false;

      // Filter by UI tabs
      if (selectedFilter === 'unread') return !item.read;
      if (selectedFilter !== 'all') return item.type === selectedFilter;
      return true;
    });
  }, [notifications, prefs, selectedFilter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  const getTypeIcon = (type: SmartNotificationItem['type']) => {
    switch (type) {
      case 'monthly_summary':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'price_drop':
        return <Tag className="w-4 h-4 text-emerald-500" />;
      case 'budget_alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'unusual_spending':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'purchase_update':
        return <ShoppingBag className="w-4 h-4 text-pink-500" />;
    }
  };

  const getTypeBadge = (type: SmartNotificationItem['type']) => {
    switch (type) {
      case 'monthly_summary':
        return 'Monthly Summary';
      case 'price_drop':
        return 'Wishlist Price Drop';
      case 'budget_alert':
        return 'Budget Insight';
      case 'unusual_spending':
        return 'Pattern Note';
      case 'purchase_update':
        return 'Purchase Update';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-[#0e131f] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto min-w-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 shrink-0">
              <Bell className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  Smart Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Helpful alerts without stress or guilt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab(activeTab === 'alerts' ? 'settings' : 'alerts')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 font-bold'
                  : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Configure notification preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Toggle: Alerts List vs Preferences */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/20 text-xs">
          {activeTab === 'alerts' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('unread')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'unread'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setSelectedFilter('price_drop')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'price_drop'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Price Drops
              </button>
              <button
                onClick={() => setSelectedFilter('budget_alert')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'budget_alert'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Budgets
              </button>
            </div>
          ) : (
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Notification Preferences
            </span>
          )}

          {activeTab === 'alerts' && displayedNotifications.length > 0 && (
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
              >
                Mark all read
              </button>
            </div>
          )}
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-w-0">
          {activeTab === 'alerts' ? (
            displayedNotifications.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  You're all caught up!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No unread alerts for this filter. We only notify you about important updates, summaries, and verified price drops.
                </p>
                <button
                  onClick={() => setSelectedFilter('all')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  View All Notifications
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {displayedNotifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleToggleItemRead(notif.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      !notif.read
                        ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 mt-0.5">
                      {getTypeIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          {getTypeBadge(notif.type)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {notif.timestamp}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.linkTab && (
                        <div className="mt-2 pt-1.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              if (notif.linkTab === 'monthly_report' && onOpenMonthlySummary) {
                                onOpenMonthlySummary();
                              } else if (onNavigateTab) {
                                onNavigateTab(notif.linkTab);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                          >
                            <span>Open Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          {!notif.read && (
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.2 rounded-full">
                              Unread
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* PREFERENCES TAB */
            <div className="space-y-4 text-xs animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
                  <span>Choose Notification Types</span>
                </span>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Toggle on or off individual notifications. We respect your attention and never send guilt-inducing prompts.
                </p>
              </div>

              <div className="space-y-2">
                {/* 1. Monthly Spending Summaries */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                      Monthly Spending Summaries
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Encouraging monthly overview of spending and savings.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePref('monthlySummary')}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      prefs.monthlySummary ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      prefs.monthlySummary ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 2. Wishlist Price Drops */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                      Wishlist Price Drops
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Alerts when items you're watching drop in price across stores.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePref('priceDrops')}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      prefs.priceDrops ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      prefs.priceDrops ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 3. Budget Alerts */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                      Budget & Goal Alerts
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Friendly milestone reminders when nearing 80% of a category limit.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePref('budgetAlerts')}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      prefs.budgetAlerts ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      prefs.budgetAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 4. Unusual Spending Patterns */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                      Unusual Spending Patterns
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Detection of unexpected duplicate charges or surge spikes.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePref('unusualSpending')}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      prefs.unusualSpending ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      prefs.unusualSpending ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 5. Important Purchase Updates */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                      Important Purchase Updates
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Delivery confirmations, returns, and refund credits.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePref('purchaseUpdates')}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      prefs.purchaseUpdates ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      prefs.purchaseUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between">
          {activeTab === 'alerts' && displayedNotifications.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              Preferences saved automatically
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
