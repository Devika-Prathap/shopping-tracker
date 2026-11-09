import React, { createContext, useContext, useState, useEffect } from 'react';
import { PurchaseItem } from '../types';

export type SmartAdviceLevel = 'minimal' | 'balanced' | 'detailed';
export type LightPalette = 'warm-ivory' | 'soft-rose' | 'mint-fresh' | 'lavender-mist';

export interface NotificationPreferences {
  budgetAlerts: boolean;
  priceDrops: boolean;
  deliveryUpdates: boolean;
  weeklyDigest: boolean;
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currency: '₹' | '$' | '€' | '£';
  setCurrency: (curr: '₹' | '$' | '€' | '£') => void;
  appName: string;
  setAppName: (name: string) => void;
  formatPrice: (amount: number) => string;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  
  // Personalization settings
  smartAdviceLevel: SmartAdviceLevel;
  setSmartAdviceLevel: (level: SmartAdviceLevel) => void;
  lightPalette: LightPalette;
  setLightPalette: (palette: LightPalette) => void;
  hidePrivateShoppingFromSidebar: boolean;
  setHidePrivateShoppingFromSidebar: (hide: boolean) => void;
  notificationPreferences: NotificationPreferences;
  setNotificationPreferences: React.Dispatch<React.SetStateAction<NotificationPreferences>>;

  // Recently Viewed Products
  recentlyViewed: PurchaseItem[];
  addToRecentlyViewed: (item: PurchaseItem, isPrivate?: boolean) => void;
  clearRecentlyViewed: () => void;

  // Product Comparison (up to 3 products)
  comparedProducts: PurchaseItem[];
  addToComparison: (item: PurchaseItem) => boolean;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('shopping_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [currency, setCurrencyState] = useState<'₹' | '$' | '€' | '£'>(() => {
    try {
      const saved = localStorage.getItem('shopping_currency');
      return (saved as any) || '₹';
    } catch {
      return '₹';
    }
  });

  const [appName, setAppNameState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('shopping_app_title');
      if (!saved || saved === 'Shopping Tracker' || saved === 'CartLens') {
        localStorage.setItem('shopping_app_title', 'TrackShop');
        return 'TrackShop';
      }
      return saved;
    } catch {
      return 'TrackShop';
    }
  });

  const [demoMode, setDemoMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('shopping_demo_mode');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Smart Advice Level: 'minimal' | 'balanced' | 'detailed'
  const [smartAdviceLevel, setSmartAdviceLevelState] = useState<SmartAdviceLevel>(() => {
    try {
      const saved = localStorage.getItem('cartlens_smart_advice_level') as SmartAdviceLevel;
      if (saved === 'minimal' || saved === 'balanced' || saved === 'detailed') return saved;
      return 'balanced';
    } catch {
      return 'balanced';
    }
  });

  const setSmartAdviceLevel = (level: SmartAdviceLevel) => {
    setSmartAdviceLevelState(level);
    try {
      localStorage.setItem('cartlens_smart_advice_level', level);
    } catch {}
  };

  // Light Mode Color Palette
  const [lightPalette, setLightPaletteState] = useState<LightPalette>(() => {
    try {
      const saved = localStorage.getItem('cartlens_light_palette') as LightPalette;
      if (saved) return saved;
      return 'warm-ivory';
    } catch {
      return 'warm-ivory';
    }
  });

  const setLightPalette = (palette: LightPalette) => {
    setLightPaletteState(palette);
    try {
      localStorage.setItem('cartlens_light_palette', palette);
    } catch {}
  };

  // Hide Private Shopping from Sidebar preference
  const [hidePrivateShoppingFromSidebar, setHidePrivateShoppingFromSidebarState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cartlens_hide_private_from_sidebar');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const setHidePrivateShoppingFromSidebar = (hide: boolean) => {
    setHidePrivateShoppingFromSidebarState(hide);
    try {
      localStorage.setItem('cartlens_hide_private_from_sidebar', JSON.stringify(hide));
    } catch {}
  };

  // Notification Preferences
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('cartlens_notification_prefs');
      if (saved) return JSON.parse(saved);
      return {
        budgetAlerts: true,
        priceDrops: true,
        deliveryUpdates: true,
        weeklyDigest: false,
      };
    } catch {
      return {
        budgetAlerts: true,
        priceDrops: true,
        deliveryUpdates: true,
        weeklyDigest: false,
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cartlens_notification_prefs', JSON.stringify(notificationPreferences));
    } catch {}
  }, [notificationPreferences]);

  // Recently Viewed Products (strictly excludes private items)
  const [recentlyViewed, setRecentlyViewed] = useState<PurchaseItem[]>(() => {
    try {
      const saved = localStorage.getItem('cartlens_recently_viewed_products');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const addToRecentlyViewed = (item: PurchaseItem, isPrivate = false) => {
    // Privacy protection: Never store private products in regular viewing history
    if (isPrivate || (item as any).isPrivate) return;

    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== item.id && p.name !== item.name);
      const updated = [item, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('cartlens_recently_viewed_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem('cartlens_recently_viewed_products');
    } catch {}
  };

  // Compared Products (up to 3 products)
  const [comparedProducts, setComparedProducts] = useState<PurchaseItem[]>(() => {
    try {
      const saved = localStorage.getItem('cartlens_compared_products');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const addToComparison = (item: PurchaseItem): boolean => {
    if (comparedProducts.some((p) => p.id === item.id)) {
      return true;
    }
    if (comparedProducts.length >= 3) {
      return false; // Reached maximum limit of 3
    }
    const updated = [...comparedProducts, item];
    setComparedProducts(updated);
    try {
      localStorage.setItem('cartlens_compared_products', JSON.stringify(updated));
    } catch {}
    return true;
  };

  const removeFromComparison = (id: string) => {
    const updated = comparedProducts.filter((p) => p.id !== id);
    setComparedProducts(updated);
    try {
      localStorage.setItem('cartlens_compared_products', JSON.stringify(updated));
    } catch {}
  };

  const clearComparison = () => {
    setComparedProducts([]);
    try {
      localStorage.removeItem('cartlens_compared_products');
    } catch {}
  };

  // Apply dark mode class and data attributes to html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('shopping_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', lightPalette);
  }, [lightPalette]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setCurrency = (curr: '₹' | '$' | '€' | '£') => {
    setCurrencyState(curr);
    try {
      localStorage.setItem('shopping_currency', curr);
    } catch {}
  };

  const setAppName = (name: string) => {
    setAppNameState(name);
    try {
      localStorage.setItem('shopping_app_title', name);
    } catch {}
  };

  const formatPrice = (amount: number) => {
    if (currency === '₹') {
      return `${currency}${Math.round(amount).toLocaleString('en-IN')}`;
    }
    return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        setCurrency,
        appName,
        setAppName,
        formatPrice,
        demoMode,
        setDemoMode,
        smartAdviceLevel,
        setSmartAdviceLevel,
        lightPalette,
        setLightPalette,
        hidePrivateShoppingFromSidebar,
        setHidePrivateShoppingFromSidebar,
        notificationPreferences,
        setNotificationPreferences,
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
        comparedProducts,
        addToComparison,
        removeFromComparison,
        clearComparison,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
