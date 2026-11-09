import React, { useState, useEffect, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { 
  INITIAL_PURCHASES, 
  INITIAL_PRICE_DROPS, 
  INITIAL_SAVINGS_RECOMMENDATIONS, 
  INITIAL_WISHLIST, 
  INITIAL_CATEGORY_BUDGETS, 
  INITIAL_SUBSCRIPTIONS, 
  INITIAL_INTEGRATIONS 
} from './data/shoppingData';
import { 
  PurchaseTransaction, 
  PriceDropItem, 
  CheaperAlternative, 
  WishlistItem, 
  CategoryBudget, 
  RecurringSubscription, 
  IntegrationStatus,
  BudgetAlertNotification,
  ProductCategory,
  PurchaseItem
} from './types';
import { Navigation, NavTab } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { SearchFilterState } from './components/GlobalSearchBar';
import { PurchasesView, PurchasesFilterInput } from './components/PurchasesView';
import { DashboardView } from './components/DashboardView';
import { StoresView } from './components/StoresView';
import { CategoriesView } from './components/CategoriesView';
import { AnalyticsView } from './components/AnalyticsView';
import { ChallengesView } from './components/ChallengesView';
import { SaveMoreView } from './components/SaveMoreView';
import { PriceDropView } from './components/PriceDropView';
import { WishlistView } from './components/WishlistView';
import { BudgetsView } from './components/BudgetsView';
import { RecurringView } from './components/RecurringView';
import { SettingsView } from './components/SettingsView';
import { ReturnsView } from './components/ReturnsView';
import { MoreHubView } from './components/MoreHubView';
import { SmartShoppingView } from './components/SmartShoppingView';
import { ExportReportsView } from './components/ExportReportsView';
import { ShoppingPersonalityView } from './components/ShoppingPersonalityView';
import { ShoppingCalendarView } from './components/ShoppingCalendarView';
import { MonthlySummaryModal } from './components/MonthlySummaryModal';
import { OnboardingModal } from './components/OnboardingModal';
import { BudgetAlertToast } from './components/BudgetAlertToast';
import { NotificationsModal } from './components/NotificationsModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { PrivateShoppingView } from './components/PrivateShoppingView';
import { ProductComparisonView } from './components/ProductComparisonView';
import { SpendingTimelineView } from './components/SpendingTimelineView';

function ShoppingAppContent() {
  const { formatPrice, demoMode, setDemoMode, appName } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('shopping_purchases_v3');
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  });

  const [priceDrops, setPriceDrops] = useState<PriceDropItem[]>(INITIAL_PRICE_DROPS);
  const [savingsRecommendations, setSavingsRecommendations] = useState<CheaperAlternative[]>(INITIAL_SAVINGS_RECOMMENDATIONS);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [budgets, setBudgets] = useState<CategoryBudget[]>(INITIAL_CATEGORY_BUDGETS);
  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>(INITIAL_SUBSCRIPTIONS);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(INITIAL_INTEGRATIONS);

  const [monthlyBudget, setMonthlyBudget] = useState<number>(15000); // Sample baseline
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Global search filter state to bridge navigation and purchases
  const [purchasesSearchFilter, setPurchasesSearchFilter] = useState<PurchasesFilterInput | null>(null);

  // Persistent Left Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cartlens_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cartlens_sidebar_collapsed', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSetSidebarCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    setIsSidebarCollapsed((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        localStorage.setItem('cartlens_sidebar_collapsed', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleLogout = () => {
    setSyncToast('Signed out of personal session (Devika Prathap).');
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Modals & Alerts
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<{ item: PurchaseItem; transaction?: PurchaseTransaction } | null>(null);
  const [selectedStoreModal, setSelectedStoreModal] = useState<string | null>(null);
  const [activeBudgetAlert, setActiveBudgetAlert] = useState<BudgetAlertNotification | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<BudgetAlertNotification[]>([
    {
      id: 'init-alert-01',
      timestamp: 'Yesterday, 4:15 PM',
      transactionId: 'tx-002',
      merchant: 'Amazon',
      purchaseAmount: 3499,
      remainingBudget: 6800,
      thresholdAmount: 1700,
      percentageOfRemaining: 51.4,
      read: false,
      message: 'Sony Wireless ANC Headphones purchase of ₹3,499 exceeded 25% (₹1,700) of remaining monthly budget.',
    },
  ]);

  // Persist purchases
  useEffect(() => {
    try {
      localStorage.setItem('shopping_purchases_v3', JSON.stringify(purchases));
    } catch {}
  }, [purchases]);

  // Show onboarding on very first load if not seen
  useEffect(() => {
    const hasSeen = localStorage.getItem('shopping_onboarding_completed');
    if (!hasSeen) {
      setShowOnboarding(true);
      localStorage.setItem('shopping_onboarding_completed', 'true');
    }
  }, []);

  // Sync simulation
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncToast('Syncing with Browser Extension, Email Receipts & Payments...');

    setTimeout(() => {
      setIsSyncing(false);
      setSyncToast('Reconciliation Complete! 9 store transactions and price history up to date.');
      setTimeout(() => setSyncToast(null), 3500);
    }, 1200);
  };

  // Split into regular purchases (public) and private purchases (isolated in vault)
  const regularPurchases = useMemo(() => purchases.filter(p => !p.isPrivate), [purchases]);
  const privatePurchases = useMemo(() => purchases.filter(p => p.isPrivate), [purchases]);

  // Private Shopping Handlers
  const handleMoveToRegular = (id: string) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, isPrivate: false } : p));
  };

  const handleMakePurchasePrivate = (id: string) => {
    setPurchases(prev => prev.map(p => p.id === id ? { 
      ...p, 
      isPrivate: true, 
      customDisplayName: p.customDisplayName || p.items[0]?.name,
      privateCategory: p.privateCategory || 'Personal Care & Wellness'
    } : p));
  };

  const handleRenamePrivatePurchase = (id: string, newName: string) => {
    setPurchases(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          customDisplayName: newName,
          items: p.items.map(it => ({ ...it, customDisplayName: newName }))
        };
      }
      return p;
    }));
  };

  const handleUpdatePrivateCategory = (id: string, newCategory: string) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, privateCategory: newCategory } : p));
  };

  const handleDeletePrivatePurchase = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
  };

  const handleAddPrivatePurchase = (newPurchase: PurchaseTransaction) => {
    setPurchases(prev => [newPurchase, ...prev]);
  };

  const handleWipePrivateVault = () => {
    setPurchases(prev => prev.filter(p => !p.isPrivate));
  };

  // Add purchase with 25% single-purchase budget check
  const handleAddPurchase = (newPurchase: PurchaseTransaction) => {
    // If the purchase is marked private, do NOT trigger regular public notifications
    if (newPurchase.isPrivate) {
      setPurchases(prev => [newPurchase, ...prev]);
      setSyncToast(`Added to Private Vault: ${newPurchase.customDisplayName || newPurchase.store}!`);
      setTimeout(() => setSyncToast(null), 3500);
      return;
    }

    const currentSpent = regularPurchases.filter(p => !p.isRefunded).reduce((sum, p) => sum + p.totalAmount, 0);
    const poolRemainingBefore = Math.max(0, monthlyBudget - currentSpent);
    const threshold25 = poolRemainingBefore * 0.25;

    if (newPurchase.totalAmount > threshold25 && poolRemainingBefore > 0) {
      const percentageConsumed = +( (newPurchase.totalAmount / poolRemainingBefore) * 100 ).toFixed(1);
      newPurchase.exceededBudgetThreshold = true;
      newPurchase.budgetThresholdRatio = percentageConsumed;

      const newAlert: BudgetAlertNotification = {
        id: `alert-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        transactionId: newPurchase.id,
        merchant: newPurchase.store,
        purchaseAmount: newPurchase.totalAmount,
        remainingBudget: poolRemainingBefore,
        thresholdAmount: threshold25,
        percentageOfRemaining: percentageConsumed,
        read: false,
        message: `Purchase of ${formatPrice(newPurchase.totalAmount)} at ${newPurchase.store} consumed ${percentageConsumed}% of remaining budget pool.`,
      };

      setActiveBudgetAlert(newAlert);
      setNotifications(prev => [newAlert, ...prev]);
    }

    setPurchases(prev => [newPurchase, ...prev]);
    setSyncToast(`Auto-Recorded: ${newPurchase.store} (${formatPrice(newPurchase.totalAmount)}) without manual entry!`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleToggleWishlist = (id: string) => {
    setWishlist(prev => prev.map(w => w.id === id ? { ...w, isWatching: !w.isWatching } : w));
  };

  const handleUpdatePurchase = (updatedPurchase: PurchaseTransaction) => {
    setPurchases(prev => prev.map(p => p.id === updatedPurchase.id ? updatedPurchase : p));
  };

  const handleUpdateCategoryBudget = (category: ProductCategory, limit: number) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, monthlyLimit: limit } : b));
  };

  const handleRemoveCategoryBudget = (category: ProductCategory) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
  };

  const handleAddCategoryBudget = (category: ProductCategory, limit: number) => {
    setBudgets(prev => [...prev, { category, monthlyLimit: limit, color: '#8b5cf6' }]);
  };

  const handleClearAllData = () => {
    setPurchases([]);
    setPriceDrops([]);
    localStorage.removeItem('shopping_purchases_v3');
    setSyncToast('All local shopping history deleted.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleRestoreDemoData = () => {
    setPurchases(INITIAL_PURCHASES);
    setPriceDrops(INITIAL_PRICE_DROPS);
    setSavingsRecommendations(INITIAL_SAVINGS_RECOMMENDATIONS);
    setWishlist(INITIAL_WISHLIST);
    setDemoMode(true);
    setSyncToast('Restored realistic demo shopping purchases.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const unreadAlerts = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex w-full max-w-full min-w-0 bg-[#FFF9F2] dark:bg-[#0B0F19] text-[#1E1B2E] dark:text-[#F8FAFC] transition-colors">
      {/* 1. Permanent Left Sidebar (collapsible on desktop, slide-out drawer on mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleSetSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        priceDropCount={priceDrops.length}
        savingsCount={savingsRecommendations.length}
        onOpenHelpTour={() => setShowOnboarding(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Wrapper: Adjusts width automatically as sidebar collapses/expands */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
        {/* Minimal Top Header */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          purchases={regularPurchases}
          onSelectPurchase={(purchase) => {
            setPurchasesSearchFilter({
              highlightedId: purchase.id,
            });
            setActiveTab('purchases');
          }}
          onApplySearchToPurchases={(filter, highlightedId) => {
            setPurchasesSearchFilter({
              query: filter.query,
              store: filter.store,
              category: filter.category,
              priceRange: filter.priceRange,
              minPrice: filter.minPrice,
              maxPrice: filter.maxPrice,
              highlightedId,
            });
            setActiveTab('purchases');
          }}
        />

        {/* Visual Budget Alert Toast */}
        <BudgetAlertToast
          alert={activeBudgetAlert}
          onDismiss={() => setActiveBudgetAlert(null)}
          onViewPurchase={() => setActiveTab('purchases')}
          onOpenBudgetSettings={() => setActiveTab('budgets')}
        />

        {/* Standard Ingestion Sync Toast */}
        {syncToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slideUp">
            <span>{syncToast}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl min-w-0 mx-auto px-3.5 sm:px-6 lg:px-8 py-5 pb-16 lg:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              purchases={regularPurchases}
              monthlyBudget={monthlyBudget}
              onNavigateTab={setActiveTab}
              priceDrops={priceDrops}
              savingsRecommendations={savingsRecommendations}
              onOpenStoreModal={(storeName) => {
                setSelectedStoreModal(storeName);
                setActiveTab('stores');
              }}
              onOpenMonthlySummary={() => setShowMonthlySummary(true)}
              onAddPurchase={handleAddPurchase}
              onUpdatePurchase={handleUpdatePurchase}
              onSelectProduct={(item, tx) => setSelectedProductDetails({ item, transaction: tx })}
              onRestoreDemo={handleRestoreDemoData}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              unreadNotificationsCount={unreadAlerts}
            />
          )}

        {activeTab === 'purchases' && (
          <PurchasesView
            purchases={regularPurchases}
            initialFilter={purchasesSearchFilter}
            onSelectStoreModal={(storeName) => {
              setSelectedStoreModal(storeName);
              setActiveTab('stores');
            }}
            onSelectProduct={(item, tx) => setSelectedProductDetails({ item, transaction: tx })}
            onRestoreDemo={handleRestoreDemoData}
            onMakePurchasePrivate={handleMakePurchasePrivate}
          />
        )}

        {activeTab === 'private_shopping' && (
          <PrivateShoppingView
            privatePurchases={privatePurchases}
            regularPurchases={regularPurchases}
            onMoveToRegular={handleMoveToRegular}
            onMakePurchasePrivate={handleMakePurchasePrivate}
            onRenamePrivatePurchase={handleRenamePrivatePurchase}
            onUpdatePrivateCategory={handleUpdatePrivateCategory}
            onDeletePrivatePurchase={handleDeletePrivatePurchase}
            onAddPrivatePurchase={handleAddPrivatePurchase}
            onWipePrivateVault={handleWipePrivateVault}
          />
        )}

        {activeTab === 'comparison' && (
          <ProductComparisonView
            purchases={regularPurchases}
            onSelectProduct={(item: PurchaseItem) => setSelectedProductDetails({ item })}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'timeline' && (
          <SpendingTimelineView
            purchases={regularPurchases}
            onSelectProduct={(item: PurchaseItem) => setSelectedProductDetails({ item })}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'calendar' && (
          <ShoppingCalendarView
            purchases={regularPurchases}
            onNavigateTab={setActiveTab}
            onOpenStoreModal={(storeName) => {
              setSelectedStoreModal(storeName);
              setActiveTab('stores');
            }}
            onAddPurchase={handleAddPurchase}
            onSelectProduct={(item, tx) => setSelectedProductDetails({ item, transaction: tx })}
          />
        )}

        {activeTab === 'stores' && (
          <StoresView
            purchases={regularPurchases}
            selectedStoreModal={selectedStoreModal}
            onSelectStoreModal={setSelectedStoreModal}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView purchases={regularPurchases} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView 
            purchases={regularPurchases} 
            priceDrops={priceDrops} 
            budgets={budgets} 
            monthlyBudget={monthlyBudget} 
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengesView purchases={regularPurchases} onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'save_more' && (
          <SaveMoreView savingsRecommendations={savingsRecommendations} />
        )}

        {activeTab === 'price_drops' && (
          <PriceDropView priceDrops={priceDrops} />
        )}

        {activeTab === 'wishlist' && (
          <WishlistView
            wishlist={wishlist}
            onToggleWatch={handleToggleWishlist}
            onAddWishlist={(item) => setWishlist(prev => [item, ...prev])}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            budgets={budgets}
            onUpdateBudget={handleUpdateCategoryBudget}
            onRemoveBudget={handleRemoveCategoryBudget}
            onAddBudget={handleAddCategoryBudget}
            purchases={regularPurchases}
            monthlyBudget={monthlyBudget}
            priceDrops={priceDrops}
          />
        )}

        {activeTab === 'recurring' && (
          <RecurringView
            subscriptions={subscriptions}
            onAddSubscription={(sub) => setSubscriptions(prev => [sub, ...prev])}
            onRemoveSubscription={(id) => setSubscriptions(prev => prev.filter(s => s.id !== id))}
          />
        )}

        {(activeTab === 'returns_refunds' || (activeTab as any) === 'returns') && (
          <ReturnsView
            purchases={regularPurchases}
            onUpdatePurchase={handleUpdatePurchase}
          />
        )}

        {activeTab === 'more' && (
          <MoreHubView
            onNavigateTab={setActiveTab}
            purchases={regularPurchases}
            savingsCount={savingsRecommendations.length}
            priceDropCount={priceDrops.length}
            onOpenMonthlySummary={() => setShowMonthlySummary(true)}
          />
        )}

        {activeTab === 'smart_shopping' && (
          <SmartShoppingView
            purchases={regularPurchases}
            onOpenStoreModal={(store) => {
              setSelectedStoreModal(store);
              setActiveTab('stores');
            }}
          />
        )}

        {(activeTab === 'export_reports' || (activeTab as any) === 'reports') && (
          <ExportReportsView
            purchases={regularPurchases}
            onOpenMonthlySummary={() => setShowMonthlySummary(true)}
          />
        )}

        {(activeTab === 'shopping_personality' || (activeTab as any) === 'personality') && (
          <ShoppingPersonalityView
            purchases={regularPurchases}
            onNavigateTab={setActiveTab}
          />
        )}

        {(activeTab === 'settings' || (activeTab as any) === 'privacy') && (
          <SettingsView
            integrations={integrations}
            onToggleIntegration={(id) => {
              setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'connected' ? 'available' : 'connected' } : i));
            }}
            onClearAllData={handleClearAllData}
            onRestoreDemoData={handleRestoreDemoData}
            onNavigateTab={setActiveTab}
            onExportData={() => {
              try {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(purchases, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", "trackshop_purchases.json");
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              } catch {
                // Ignore
              }
            }}
          />
        )}
      </main>

      {/* Monthly Summary Modal */}
      <MonthlySummaryModal
        isOpen={showMonthlySummary}
        onClose={() => setShowMonthlySummary(false)}
        purchases={regularPurchases}
      />

      {/* Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Smart Notifications Center Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        budgetAlerts={notifications}
        purchases={regularPurchases}
        onNavigateTab={setActiveTab}
        onOpenMonthlySummary={() => setShowMonthlySummary(true)}
      />

      {/* Global Product Details Modal (Full specs, return status, price trends, alternatives) */}
      <ProductDetailsModal
        isOpen={!!selectedProductDetails}
        onClose={() => setSelectedProductDetails(null)}
        item={selectedProductDetails?.item || null}
        transaction={selectedProductDetails?.transaction}
        onMakePurchasePrivate={handleMakePurchasePrivate}
      />

      {/* Modern Colorful Footer */}
      <footer className="mt-auto border-t py-6 text-xs transition-colors bg-white/95 dark:bg-[#0E1422]/95 border-[#E5DDF2] dark:border-slate-800 text-[#625B72] dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1E1B2E] dark:text-white">{appName}</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Manual Expense Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium">
            <button onClick={() => setShowOnboarding(true)} className="hover:text-purple-600 cursor-pointer">
              Restart Welcome Tour
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => setActiveTab('settings')} className="hover:text-purple-600 cursor-pointer">
              Connected Accounts & Privacy
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => setShowMonthlySummary(true)} className="hover:text-purple-600 cursor-pointer">
              Monthly Report
            </button>
          </div>
        </div>
      </footer>
      </div> {/* Close 2. Main Content Wrapper */}
    </div> /* Close 1. Root flex container */
  );
}

export default function App() {
  return (
    <AppProvider>
      <ShoppingAppContent />
    </AppProvider>
  );
}
