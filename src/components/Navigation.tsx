import React from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  Menu, 
  PanelLeft, 
  PanelLeftClose,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BudgetAlertNotification, PurchaseTransaction } from '../types';
import { GlobalSearchBar, SearchFilterState } from './GlobalSearchBar';

export type NavTab = 
  | 'dashboard' 
  | 'purchases' 
  | 'calendar'
  | 'stores' 
  | 'categories' 
  | 'analytics' 
  | 'save_more'
  | 'more'
  | 'private_shopping'
  | 'comparison'
  | 'timeline'
  | 'challenges'
  | 'price_drops' 
  | 'smart_shopping'
  | 'wishlist' 
  | 'budgets' 
  | 'recurring' 
  | 'returns_refunds'
  | 'export_reports'
  | 'shopping_personality'
  | 'settings';

export interface NavigationProps {
  activeTab: NavTab;
  setActiveTab?: (tab: NavTab) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
  notifications: BudgetAlertNotification[];
  onOpenNotifications: () => void;
  onOpenMonthlySummary?: () => void;
  onOpenIntegrations?: () => void;
  isSyncing?: boolean;
  onTriggerSync?: () => void;
  priceDropCount?: number;
  savingsCount?: number;
  purchases: PurchaseTransaction[];
  onSelectPurchase?: (purchase: PurchaseTransaction) => void;
  onApplySearchToPurchases?: (filter: SearchFilterState, highlightedId?: string) => void;
}

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'Spending Dashboard',
  purchases: 'Purchase History',
  stores: 'Shopping Websites & Stores',
  categories: 'Expense Categories',
  analytics: 'Spending Analytics',
  save_more: 'Savings Recommendations',
  private_shopping: 'Private Shopping Vault',
  comparison: 'Product Comparison Matrix',
  timeline: 'Spending Timeline & Velocity',
  wishlist: 'Saved Wishlist',
  budgets: 'Monthly Category Budgets',
  price_drops: 'Price Drop Tracker',
  smart_shopping: 'Smart Cart Recommendations',
  recurring: 'Recurring Subscriptions',
  returns_refunds: 'Returns & Refunds Management',
  export_reports: 'Monthly Spending Reports',
  calendar: 'Spending Calendar',
  challenges: 'Savings Challenges',
  shopping_personality: 'Shopping Style & Habits',
  settings: 'Settings & Personalization',
  more: 'All Features & Tools'
};

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  isSidebarCollapsed = false,
  onToggleSidebar,
  onOpenMobileSidebar,
  notifications,
  onOpenNotifications,
  purchases,
  onSelectPurchase,
  onApplySearchToPurchases,
}) => {
  const { theme, toggleTheme, currency, setCurrency, demoMode, setDemoMode } = useApp();

  const unreadAlerts = notifications.filter(n => !n.read).length;

  const handleCycleCurrency = () => {
    const list: ('₹' | '$' | '€' | '£')[] = ['₹', '$', '€', '£'];
    const idx = list.indexOf(currency as any);
    const next = list[(idx + 1) % list.length];
    setCurrency(next);
  };

  const pageTitle = TAB_TITLES[activeTab] || 'Shopping Tracker';

  return (
    <header className="sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors bg-white/95 dark:bg-[#0E1422]/95 border-[#E5DDF2] dark:border-slate-800 shadow-xs select-none">
      {/* Demo Mode Notice Banner */}
      {demoMode && (
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white px-3 sm:px-4 py-1 text-[11px] font-medium w-full">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-2">
            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className="bg-white/20 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[9px] shrink-0">
                Demo Mode
              </span>
              <span className="truncate">
                Displaying realistic spending history across Amazon, Myntra, Flipkart, AJIO & Nykaa.
              </span>
            </div>
            <button
              onClick={() => setDemoMode(false)}
              className="ml-auto underline hover:text-white/80 cursor-pointer whitespace-nowrap text-[10px] shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Top Header: Minimal, Clean, Uncrowded */}
      <div className="w-full px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          
          {/* 1. LEFT: Mobile Drawer Toggle & Active Page Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Hamburger Menu Button (< md) */}
            <button
              onClick={onOpenMobileSidebar}
              aria-label="Open Sidebar Navigation"
              className="md:hidden p-2 rounded-xl bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 text-[#4C267B] dark:text-slate-200 hover:bg-[#F3EEFF] dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop / Tablet Sidebar Toggle Button (md+) */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                className="hidden md:flex p-2 rounded-xl bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 text-[#625B72] hover:text-[#4C267B] dark:text-slate-400 dark:hover:text-white hover:bg-[#F3EEFF] dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0"
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? (
                  <PanelLeft className="w-4 h-4 text-[#8B5CF6]" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Active Page Header Title */}
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[#4C267B] dark:text-white truncate">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* 2. CENTER: Global Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg min-w-0 mx-auto">
            <GlobalSearchBar
              purchases={purchases}
              onSelectPurchase={onSelectPurchase}
              onApplySearchToPurchases={onApplySearchToPurchases}
            />
          </div>

          {/* 3. RIGHT: Minimal Controls (Currency, Theme Toggle, Notifications) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Currency Selector */}
            <button
              onClick={handleCycleCurrency}
              aria-label="Switch Currency"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 text-xs font-bold font-mono text-[#7C3AED] dark:text-purple-300 hover:bg-[#F3EEFF] dark:hover:bg-slate-800 transition-colors cursor-pointer text-center shadow-2xs"
              title={`Active Currency: ${currency} (Click to switch)`}
            >
              {currency}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark and Light theme"
              className="p-2 rounded-xl bg-white dark:bg-[#131A2B] text-[#4C267B] dark:text-amber-400 hover:bg-[#F3EEFF] dark:hover:bg-slate-800 border border-[#E5DDF2] dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-[#4C267B]" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              aria-label="Open Notifications"
              className="relative p-2 rounded-xl bg-white dark:bg-[#131A2B] text-[#4C267B] dark:text-slate-300 hover:bg-[#F3EEFF] dark:hover:bg-slate-800 border border-[#E5DDF2] dark:border-slate-800 cursor-pointer transition-colors shadow-2xs"
              title="Budget & Expense Alerts"
            >
              <Bell className="w-4 h-4 text-[#4C267B] dark:text-slate-300" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {unreadAlerts}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
