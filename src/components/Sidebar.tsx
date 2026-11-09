import React, { useState, useEffect } from 'react';
import { 
  Home,
  ShoppingBag, 
  Store, 
  Layers, 
  BarChart3, 
  Sparkles, 
  Lock, 
  Heart, 
  Wallet, 
  Tag, 
  Brain, 
  RefreshCw, 
  Package, 
  Calendar, 
  Settings, 
  HelpCircle, 
  LogOut, 
  PanelLeftClose, 
  PanelLeft, 
  X,
  User,
  ShieldCheck,
  Scale,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from './Navigation';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  priceDropCount: number;
  savingsCount: number;
  onOpenHelpTour: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  priceDropCount,
  savingsCount,
  onOpenHelpTour,
  onLogout,
}) => {
  const { appName, hidePrivateShoppingFromSidebar } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  const handleSelect = (tab: NavTab) => {
    setActiveTab(tab);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  // 1. Main Navigation Items (Exact requested order with matching icons)
  const mainNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4 shrink-0" /> },
    { id: 'purchases', label: 'Purchases', icon: <ShoppingBag className="w-4 h-4 shrink-0" /> },
    { id: 'stores', label: 'Stores', icon: <Store className="w-4 h-4 shrink-0" /> },
    { id: 'categories', label: 'Categories', icon: <Layers className="w-4 h-4 shrink-0" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
    { 
      id: 'save_more', 
      label: 'Save More', 
      icon: <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />,
      badge: savingsCount > 0 ? savingsCount : undefined,
      badgeColor: 'bg-emerald-500 text-white'
    },
  ];

  // 2. Advanced Tools Items (Exact requested order with matching icons)
  const advancedToolItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string }[] = [
    { 
      id: 'private_shopping', 
      label: 'Private Shopping', 
      icon: <Lock className="w-4 h-4 shrink-0 text-[#8B5CF6] dark:text-purple-400" />,
      badge: 'Vault',
      badgeColor: 'bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300'
    },
    { 
      id: 'comparison', 
      label: 'Product Comparison', 
      icon: <Scale className="w-4 h-4 shrink-0 text-emerald-500" />,
      badge: 'Compare',
      badgeColor: 'bg-emerald-500 text-white'
    },
    { 
      id: 'timeline', 
      label: 'Spending Timeline', 
      icon: <TrendingUp className="w-4 h-4 shrink-0 text-orange-500" /> 
    },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4 shrink-0 text-rose-500" /> },
    { id: 'budgets', label: 'Budgets', icon: <Wallet className="w-4 h-4 shrink-0 text-teal-500" /> },
    { 
      id: 'price_drops', 
      label: 'Price History', 
      icon: <Tag className="w-4 h-4 shrink-0 text-indigo-500" />,
      badge: priceDropCount > 0 ? priceDropCount : undefined,
      badgeColor: 'bg-indigo-500 text-white'
    },
    { id: 'smart_shopping', label: 'Smart Shopping', icon: <Brain className="w-4 h-4 shrink-0 text-purple-500" /> },
    { id: 'recurring', label: 'Subscriptions', icon: <RefreshCw className="w-4 h-4 shrink-0 text-cyan-500" /> },
    { 
      id: 'returns_refunds', 
      label: 'Returns & Refunds', 
      icon: <Package className="w-4 h-4 shrink-0 text-amber-500" />,
      badge: 'Active',
      badgeColor: 'bg-amber-500 text-white'
    },
    { id: 'export_reports', label: 'Monthly Reports', icon: <Calendar className="w-4 h-4 shrink-0 text-blue-500" /> },
  ];

  const visibleAdvancedItems = advancedToolItems.filter(
    (item) => item.id !== 'private_shopping' || !hidePrivateShoppingFromSidebar
  );

  // Render navigation item button
  const renderNavItem = (
    item: { id: NavTab; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string },
    isMini: boolean
  ) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleSelect(item.id)}
        title={isMini ? item.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group relative ${
          isMini ? 'justify-center px-0' : 'justify-between'
        } ${
          isActive
            ? 'bg-[#F3EEFF] text-[#7C3AED] dark:bg-purple-950/70 dark:text-purple-300 border border-[#E5DDF2] dark:border-purple-800/50 shadow-2xs'
            : 'text-[#1E1B2E] dark:text-slate-300 hover:text-[#3C1A68] dark:hover:text-white hover:bg-[#F3EEFF]/80 dark:hover:bg-slate-800/60'
        }`}
      >
        <div className={`flex items-center gap-2.5 min-w-0 ${isMini ? 'justify-center' : ''}`}>
          <span className={`transition-transform group-hover:scale-110 ${
            isActive ? 'text-[#8B5CF6] dark:text-purple-300' : 'text-[#625B72] dark:text-slate-400 group-hover:text-[#4C267B] dark:group-hover:text-white'
          }`}>
            {item.icon}
          </span>
          {!isMini && (
            <span className="truncate text-left">{item.label}</span>
          )}
        </div>

        {!isMini && item.badge ? (
          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold shrink-0 ${item.badgeColor || 'bg-[#8B5CF6] text-white'}`}>
            {item.badge}
          </span>
        ) : null}

        {/* Collapsed dot badge */}
        {isMini && item.badge ? (
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#8B5CF6] ring-2 ring-white dark:ring-slate-900" />
        ) : null}
      </button>
    );
  };

  // Content shared between desktop/tablet sidebar and mobile drawer
  const renderSidebarContent = (isMini: boolean) => (
    <div className="flex flex-col h-full select-none">
      {/* 1. TOP HEADER: Logo & App Name & Toggle */}
      <div className={`h-16 flex items-center px-3.5 border-b border-[#E5DDF2] dark:border-slate-800/80 shrink-0 ${
        isMini ? 'justify-between' : 'justify-between'
      }`}>
        {isMini ? (
          <div className="flex items-center justify-between w-full">
            <div 
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xs shrink-0 cursor-pointer"
              onClick={() => handleSelect('dashboard')}
              title={`${appName} - Dashboard`}
            >
              <ShoppingBag className="w-4 h-4" />
            </div>
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg text-[#625B72] hover:text-[#7C3AED] dark:text-slate-400 dark:hover:text-purple-300 hover:bg-[#F3EEFF] dark:hover:bg-slate-800 cursor-pointer transition-colors"
              title="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4 text-[#8B5CF6]" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xs shrink-0 cursor-pointer"
                onClick={() => handleSelect('dashboard')}
              >
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex flex-col">
                <span 
                  onClick={() => handleSelect('dashboard')}
                  className="text-sm font-extrabold tracking-tight text-[#4C267B] dark:text-white hover:text-[#7C3AED] transition-colors cursor-pointer truncate"
                >
                  {appName}
                </span>
                <span className="text-[10px] text-[#625B72] dark:text-slate-400 font-medium truncate">
                  Shopping & Expense Engine
                </span>
              </div>
            </div>

            {/* Desktop / Tablet Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-[#625B72] hover:text-[#29243A] dark:text-slate-400 dark:hover:text-white hover:bg-[#F3EEFF] dark:hover:bg-slate-800 cursor-pointer transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-[#625B72] hover:text-[#29243A] dark:text-slate-400 dark:hover:text-white hover:bg-[#F3EEFF] dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. SCROLLABLE NAVIGATION LIST */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
        {/* Main Navigation Section */}
        <div>
          {!isMini && (
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#625B72] dark:text-slate-400">
              Main Navigation
            </div>
          )}
          <div className="space-y-1">
            {mainNavItems.map((item) => renderNavItem(item, isMini))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5DDF2] dark:border-slate-800/80 my-2" />

        {/* Advanced Features Section */}
        <div>
          {!isMini && (
            <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#625B72] dark:text-slate-400">
              <span>Advanced Tools</span>
              <span className="text-[9px] font-bold text-[#8B5CF6] dark:text-purple-400">{visibleAdvancedItems.length} Tools</span>
            </div>
          )}
          <div className="space-y-1">
            {visibleAdvancedItems.map((item) => renderNavItem(item, isMini))}
          </div>
        </div>
      </div>

      {/* 3. FIXED BOTTOM SECTION: Settings, Help & Support, Logout, User Profile */}
      <div className="p-3 border-t border-[#E5DDF2] dark:border-slate-800/80 bg-white/95 dark:bg-[#0E1422]/95 shrink-0 space-y-1">
        {/* Settings item */}
        <button
          onClick={() => handleSelect('settings')}
          title={isMini ? 'Settings' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isMini ? 'justify-center px-0' : 'justify-between'
          } ${
            activeTab === 'settings'
              ? 'bg-[#F3EEFF] text-[#7C3AED] dark:bg-purple-950/70 dark:text-purple-300 border border-[#E5DDF2] dark:border-purple-800/50'
              : 'text-[#1E1B2E] dark:text-slate-300 hover:text-[#3C1A68] dark:hover:text-white hover:bg-[#F3EEFF]/80 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-[#625B72] dark:text-slate-400 shrink-0" />
            {!isMini && <span>Settings</span>}
          </div>
        </button>

        {/* Help & Support item */}
        <button
          onClick={() => {
            onOpenHelpTour();
            if (isMobileOpen) setIsMobileOpen(false);
          }}
          title={isMini ? 'Help & Support' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1E1B2E] dark:text-slate-300 hover:text-[#3C1A68] dark:hover:text-white hover:bg-[#F3EEFF]/80 dark:hover:bg-slate-800/60 transition-all cursor-pointer ${
            isMini ? 'justify-center px-0' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-[#625B72] dark:text-slate-400 shrink-0" />
            {!isMini && <span>Help & Support</span>}
          </div>
          {!isMini && (
            <span className="text-[9px] font-semibold text-[#8B5CF6]">Guide</span>
          )}
        </button>

        {/* Logout item */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          title={isMini ? 'Logout' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer ${
            isMini ? 'justify-center px-0' : 'justify-start'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isMini && <span>Logout</span>}
        </button>

        {/* User Profile Card */}
        <div className={`mt-2 pt-2 border-t border-[#E5DDF2]/80 dark:border-slate-800/80 flex items-center ${
          isMini ? 'justify-center' : 'justify-between'
        }`}>
          <div 
            onClick={() => handleSelect('settings')}
            className={`flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-[#F3EEFF]/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors min-w-0 ${
              isMini ? 'justify-center' : 'w-full'
            }`}
            title={isMini ? 'Devika Prathap (devika.prathap23@gmail.com)' : undefined}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                DP
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0E1422]" />
            </div>

            {!isMini && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#1E1B2E] dark:text-white truncate">
                  Devika Prathap
                </div>
                <div className="text-[10px] text-[#625B72] dark:text-slate-400 truncate flex items-center gap-1">
                  <span>devika.prathap23@gmail.com</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. PERMANENT DESKTOP & TABLET SIDEBAR                                     */}
      {/* Visible on md+, collapsible, flex child so main content adjusts smoothly  */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen shrink-0 border-r border-[#E5DDF2] dark:border-slate-800 bg-white dark:bg-[#0E1422] transition-all duration-300 ease-in-out z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE SLIDE-OUT DRAWER (< md)                                         */}
      {/* Opens via header hamburger menu, closes on selection or backdrop click    */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-[#0E1422] border-r border-[#E5DDF2] dark:border-slate-800 shadow-2xl z-50 flex flex-col animate-slideRight">
            {renderSidebarContent(false)}
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#121826] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-bold text-[#29243A] dark:text-white">
                Sign Out of Shopping Tracker?
              </h3>
              <p className="text-xs text-[#625B72] dark:text-slate-400 mt-1">
                You are currently signed in as <span className="font-semibold text-[#29243A] dark:text-slate-200">Devika Prathap</span>. Your recorded purchases and preferences are stored locally.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 text-xs font-bold text-[#29243A] dark:text-slate-300 hover:bg-[#F3EEFF] dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
