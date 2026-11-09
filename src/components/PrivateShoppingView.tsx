import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Search, 
  Plus, 
  ArrowLeftRight, 
  Trash2, 
  Edit3, 
  Tag, 
  Store, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  SlidersHorizontal, 
  AlertTriangle, 
  Download, 
  Clock, 
  X, 
  Check, 
  CheckCircle2, 
  Info, 
  ShieldAlert,
  ChevronRight,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory, PurchaseItem } from '../types';

interface PrivateShoppingViewProps {
  privatePurchases: PurchaseTransaction[];
  regularPurchases: PurchaseTransaction[];
  onMoveToRegular: (id: string) => void;
  onMakePurchasePrivate: (id: string) => void;
  onRenamePrivatePurchase: (id: string, newName: string) => void;
  onUpdatePrivateCategory: (id: string, newCategory: string) => void;
  onDeletePrivatePurchase: (id: string) => void;
  onAddPrivatePurchase: (purchase: PurchaseTransaction) => void;
  onWipePrivateVault: () => void;
}

const PRIVATE_CATEGORIES = [
  'Personal Care & Wellness',
  'Gifts & Celebrations',
  'Confidential Gadgets',
  'Discretionary',
  'Health & Medical',
  'Hobbies & Secret Projects',
  'Other'
];

export const PrivateShoppingView: React.FC<PrivateShoppingViewProps> = ({
  privatePurchases,
  regularPurchases,
  onMoveToRegular,
  onMakePurchasePrivate,
  onRenamePrivatePurchase,
  onUpdatePrivateCategory,
  onDeletePrivatePurchase,
  onAddPrivatePurchase,
  onWipePrivateVault,
}) => {
  const { formatPrice, currency, hidePrivateShoppingFromSidebar, setHidePrivateShoppingFromSidebar } = useApp();

  // ==========================================
  // AUTHENTICATION & PIN SECURITY STATE
  // ==========================================
  const [storedPin, setStoredPin] = useState<string>(() => {
    try {
      return localStorage.getItem('trackshop_private_vault_pin') || '1234';
    } catch {
      return '1234';
    }
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');

  // Auto-lock settings (options: '1', '2', '5', 'immediate')
  const [autoLockTimeoutMinutes, setAutoLockTimeoutMinutes] = useState<string>(() => {
    try {
      return localStorage.getItem('trackshop_vault_autolock') || '2';
    } catch {
      return '2';
    }
  });

  // Mask amounts toggle (hide currency numbers as ••••)
  const [isAmountsHidden, setIsAmountsHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem('trackshop_vault_hide_amounts') === 'true';
    } catch {
      return false;
    }
  });

  // Discreet Mode (hide product photos & show aliases only)
  const [isDiscreetDetailsMode, setIsDiscreetDetailsMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('trackshop_vault_discreet_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Inactivity Timer
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const mins = parseInt(autoLockTimeoutMinutes, 10);
    return isNaN(mins) ? 120 : mins * 60;
  });

  // Search & Filter within Private Vault
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStore, setSelectedStore] = useState<string>('ALL');

  // Modals & Dialogues
  const [activeTab, setActiveTab] = useState<'vault' | 'analytics' | 'settings'>('vault');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [renamingItem, setRenamingItem] = useState<{ id: string; currentName: string } | null>(null);
  const [renamingInput, setRenamingInput] = useState('');
  const [itemToDelete, setItemToDelete] = useState<PurchaseTransaction | null>(null);
  const [itemToMoveRegular, setItemToMoveRegular] = useState<PurchaseTransaction | null>(null);
  const [showWipeConfirmation, setShowWipeConfirmation] = useState(false);
  const [noticeToast, setNoticeToast] = useState<string | null>(null);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trackshop_vault_hide_amounts', isAmountsHidden.toString());
    } catch {}
  }, [isAmountsHidden]);

  useEffect(() => {
    try {
      localStorage.setItem('trackshop_vault_discreet_mode', isDiscreetDetailsMode.toString());
    } catch {}
  }, [isDiscreetDetailsMode]);

  useEffect(() => {
    try {
      localStorage.setItem('trackshop_vault_autolock', autoLockTimeoutMinutes);
    } catch {}
  }, [autoLockTimeoutMinutes]);

  // Handle Tab Blur / Visibility change for immediate autolock
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && autoLockTimeoutMinutes === 'immediate' && isUnlocked) {
        setIsUnlocked(false);
        setEnteredPin('');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoLockTimeoutMinutes, isUnlocked]);

  // Countdown timer for automatic locking
  useEffect(() => {
    if (!isUnlocked) return;
    if (autoLockTimeoutMinutes === 'immediate') return;

    const timeoutSecs = parseInt(autoLockTimeoutMinutes, 10) * 60;
    setSecondsRemaining(timeoutSecs);

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          setIsUnlocked(false);
          setEnteredPin('');
          return timeoutSecs;
        }
        return prev - 1;
      });
    }, 1000);

    // Reset timer on user interaction
    const resetTimer = () => {
      setSecondsRemaining(timeoutSecs);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [isUnlocked, autoLockTimeoutMinutes]);

  // Handle PIN input keypad
  const handleKeypadPress = (val: string) => {
    setPinError(null);
    if (val === 'backspace') {
      setEnteredPin(prev => prev.slice(0, -1));
      return;
    }
    if (val === 'clear') {
      setEnteredPin('');
      return;
    }
    if (enteredPin.length < 4) {
      const next = enteredPin + val;
      setEnteredPin(next);
      if (next.length === 4) {
        // Evaluate immediately
        if (next === storedPin) {
          setIsUnlocked(true);
          setPinError(null);
          setEnteredPin('');
        } else {
          setPinError('Incorrect PIN. Please try again or use the default (1234).');
          setTimeout(() => setEnteredPin(''), 600);
        }
      }
    }
  };

  const handleQuickUnlockDemo = () => {
    setIsUnlocked(true);
    setPinError(null);
    setEnteredPin('');
  };

  const handleLockNow = () => {
    setIsUnlocked(false);
    setEnteredPin('');
    setNoticeToast('Private Shopping Vault locked.');
    setTimeout(() => setNoticeToast(null), 3000);
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setPinError('PIN must be exactly 4 numeric digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinError('New PINs do not match.');
      return;
    }
    try {
      localStorage.setItem('trackshop_private_vault_pin', newPinInput);
      setStoredPin(newPinInput);
      setIsChangingPin(false);
      setNewPinInput('');
      setConfirmPinInput('');
      setNoticeToast('Security PIN successfully updated.');
      setTimeout(() => setNoticeToast(null), 3000);
    } catch {}
  };

  // Safe display for monetary amounts
  const renderPrice = (val: number) => {
    if (isAmountsHidden) {
      return <span className="font-mono tracking-widest text-slate-400 select-none">••••</span>;
    }
    return formatPrice(val);
  };

  // Filtered private purchases
  const filteredPrivatePurchases = useMemo(() => {
    return privatePurchases.filter(p => {
      const displayTitle = p.customDisplayName || p.items[0]?.customDisplayName || p.items[0]?.name || p.store;
      const matchSearch = displayTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.privateCategory || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'ALL' || (p.privateCategory || p.items[0]?.category) === selectedCategory;
      const matchStore = selectedStore === 'ALL' || p.store === selectedStore;
      return matchSearch && matchCategory && matchStore;
    });
  }, [privatePurchases, searchQuery, selectedCategory, selectedStore]);

  // Private Spending Analytics calculations
  const totalPrivateSpent = useMemo(() => {
    return privatePurchases.reduce((acc, p) => acc + p.totalAmount, 0);
  }, [privatePurchases]);

  const privateCategoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    privatePurchases.forEach(p => {
      const cat = p.privateCategory || p.items[0]?.category || 'Other';
      map[cat] = (map[cat] || 0) + p.totalAmount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [privatePurchases]);

  const availableStores = useMemo(() => {
    return Array.from(new Set(privatePurchases.map(p => p.store)));
  }, [privatePurchases]);

  // Export private vault data
  const handleExportPrivateData = () => {
    try {
      const cleanData = privatePurchases.map(p => ({
        ...p,
        vaultExportDate: new Date().toISOString(),
        discreetAlias: p.customDisplayName || 'Discreet Item',
      }));
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cleanData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `private_vault_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setNoticeToast('Private vault encrypted export saved.');
      setTimeout(() => setNoticeToast(null), 3500);
    } catch {}
  };

  // =========================================================================
  // RENDER 1: AUTHENTICATION LOCK SCREEN (If Vault is Locked)
  // =========================================================================
  if (!isUnlocked) {
    return (
      <div className="w-full max-w-xl mx-auto py-8 sm:py-16 px-4 animate-fadeIn">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xl space-y-6 text-center relative overflow-hidden">
          {/* Decorative ambient aura */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Lock Icon Emblem */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#7C3AED] via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#F3EEFF] dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 border border-[#E5DDF2] dark:border-purple-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Isolated Private Vault</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4C267B] dark:text-white tracking-tight">
              Private Shopping Vault
            </h2>
            <p className="text-xs sm:text-sm text-[#625B72] dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Enter your 4-digit PIN to unlock. Purchases stored here are strictly hidden from your main dashboard, public categories, spending insights, and notifications.
            </p>
          </div>

          {/* PIN Digit Indicators */}
          <div className="flex justify-center items-center gap-4 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled 
                      ? 'bg-[#7C3AED] dark:bg-purple-400 scale-125 shadow-md shadow-purple-500/40' 
                      : 'bg-slate-200 dark:bg-slate-700 border border-[#E5DDF2] dark:border-slate-600'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 animate-shake">
              {pinError}
            </div>
          )}

          {/* Numeric Keypad (4x3 Grid) */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'].map((key) => {
              if (key === 'clear') {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress('clear')}
                    className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-bold text-[#625B72] dark:text-slate-400 transition-all cursor-pointer active:scale-95"
                  >
                    Clear
                  </button>
                );
              }
              if (key === 'backspace') {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress('backspace')}
                    className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-bold text-[#625B72] dark:text-slate-400 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                    title="Delete digit"
                  >
                    ⌫
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key)}
                  className="p-3.5 rounded-2xl bg-white hover:bg-[#F3EEFF] dark:bg-slate-800/90 dark:hover:bg-slate-700/80 text-lg font-mono font-bold text-[#29243A] dark:text-white border border-[#E5DDF2] dark:border-slate-700 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Quick Unlock Hint & Bypass Button */}
          <div className="pt-4 border-t border-[#E5DDF2] dark:border-slate-800/80 space-y-2 text-xs">
            <button
              onClick={handleQuickUnlockDemo}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Vault (Default PIN: 1234)</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#625B72] dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A085]" />
              <span>Zero-knowledge client-side isolated encrypted storage</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER 2: UNLOCKED PRIVATE SHOPPING VAULT
  // =========================================================================
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-7xl min-w-0 box-border mx-auto">
      {/* Toast Notice Banner */}
      {noticeToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#29243A] text-white shadow-2xl flex items-center gap-3 text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-[#16A085]" />
          <span>{noticeToast}</span>
          <button onClick={() => setNoticeToast(null)} className="ml-2 hover:opacity-75">✕</button>
        </div>
      )}

      {/* Vault Top Security Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[#F3EEFF] via-[#FAF5FF] to-[#FFF9F2] dark:from-purple-950/40 dark:via-pink-950/20 dark:to-slate-900 border border-[#E5DDF2] dark:border-purple-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 min-w-0">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[#7C3AED] dark:text-purple-400 mb-1">
            <Lock className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400 shrink-0" />
            <span>Private Shopping Vault · Active Session</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#4C267B] dark:text-white tracking-tight flex items-center gap-2">
              Private Shopping
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#EDFAF6] text-[#16A085] dark:bg-emerald-950/80 dark:text-emerald-300 border border-[#BFEADE] dark:border-emerald-800 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              Isolated from Main Dashboard
            </span>
          </div>

          <p className="text-xs text-[#625B72] dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Manage your personal, gift, and sensitive purchases confidentially. Items here never appear on your home dashboard, category distributions, smart insights, or notifications.
          </p>
        </div>

        {/* Action Controls: Lock Now, Hide Amounts Toggle, Discreet Mode, Add Private Purchase */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto shrink-0">
          {/* Hide/Show Amounts Toggle */}
          <button
            onClick={() => setIsAmountsHidden(!isAmountsHidden)}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isAmountsHidden 
                ? 'bg-[#FFF6ED] border-[#FDBA74] text-[#C2410C] dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                : 'bg-white hover:bg-[#F3EEFF] border-[#E5DDF2] text-[#29243A] dark:bg-slate-800 dark:border-slate-700 dark:text-white'
            }`}
            title={isAmountsHidden ? 'Show purchase amounts' : 'Hide purchase amounts'}
          >
            {isAmountsHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#7C3AED]" />}
            <span>{isAmountsHidden ? 'Amounts Hidden' : 'Hide Amounts'}</span>
          </button>

          {/* Discreet Details Mode */}
          <button
            onClick={() => setIsDiscreetDetailsMode(!isDiscreetDetailsMode)}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isDiscreetDetailsMode 
                ? 'bg-[#F3EEFF] border-[#8B5CF6] text-[#7C3AED] dark:bg-purple-950/60 dark:border-purple-800 dark:text-purple-300'
                : 'bg-white hover:bg-[#F3EEFF] border-[#E5DDF2] text-[#29243A] dark:bg-slate-800 dark:border-slate-700 dark:text-white'
            }`}
            title="Hide product photos and show discreet aliases"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>{isDiscreetDetailsMode ? 'Discreet Mode ON' : 'Discreet Mode'}</span>
          </button>

          {/* Quick Lock Now Button */}
          <button
            onClick={handleLockNow}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Lock private vault immediately"
          >
            <Lock className="w-3.5 h-3.5 text-purple-300" />
            <span>Lock Vault</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Vault Purchases | Private Analytics | Privacy & PIN Settings */}
      <div className="flex items-center justify-between border-b border-[#E5DDF2] dark:border-slate-800 pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-[#625B72] hover:bg-[#F3EEFF] dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Private Purchases ({privatePurchases.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-[#625B72] hover:bg-[#F3EEFF] dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Private Analytics & Trends
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-[#625B72] hover:bg-[#F3EEFF] dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Privacy & Security Settings
          </button>
        </div>

        {/* Auto-lock countdown indicator */}
        <div className="text-[11px] font-mono text-[#625B72] dark:text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-purple-500" />
          <span>
            Auto-locks in {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: PRIVATE PURCHASES LIST & MANAGEMENT                            */}
      {/* ===================================================================== */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Action Row: Search, Category Filter, and Add/Import buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#625B72] dark:text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search private purchases, aliases, stores..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 rounded-xl text-[#29243A] dark:text-white placeholder:text-[#625B72]/60 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 rounded-xl text-[#29243A] dark:text-white cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {PRIVATE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              {/* Move Existing Purchase from Regular Shopping into Private Vault */}
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2 rounded-2xl border border-[#E5DDF2] dark:border-slate-700 bg-white hover:bg-[#F3EEFF] dark:bg-slate-800 text-[#29243A] dark:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Move an existing purchase into the private vault"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Move Purchase to Vault</span>
              </button>

              {/* Add New Private Purchase */}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Private Purchase</span>
              </button>
            </div>
          </div>

          {/* Private Purchases Grid */}
          {filteredPrivatePurchases.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F3EEFF] dark:bg-purple-950/60 text-[#7C3AED] flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                  No Private Purchases Found
                </h3>
                <p className="text-xs text-[#625B72] dark:text-slate-400 max-w-sm mx-auto">
                  {searchQuery || selectedCategory !== 'ALL' 
                    ? 'No private purchases matched your current search or category filter.'
                    : 'Your private vault is currently empty. You can mark existing purchases as private or log new ones here.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#F3EEFF] hover:bg-[#E5DDF2] text-[#7C3AED] text-xs font-bold cursor-pointer transition-colors"
                >
                  Move Existing Purchase Here
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] cursor-pointer shadow-xs"
                >
                  + Add New Private Item
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPrivatePurchases.map((purchase) => {
                const item = purchase.items[0];
                const displayTitle = purchase.customDisplayName || item?.customDisplayName || (isDiscreetDetailsMode ? 'Discreet Confidential Purchase' : item?.name || 'Private Item');
                const privateCat = purchase.privateCategory || item?.category || 'Personal Care & Wellness';

                return (
                  <div
                    key={purchase.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Store & Date line */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#E5DDF2]/70 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#29243A] dark:text-white flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-[#7C3AED]" />
                            {purchase.store}
                          </span>
                          <span className="text-[#625B72] dark:text-slate-400 font-mono text-[11px]">
                            {purchase.date}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F3EEFF] text-[#7C3AED] dark:bg-purple-950/80 dark:text-purple-300 border border-[#E5DDF2] dark:border-purple-800">
                          <Lock className="w-2.5 h-2.5" />
                          Vault
                        </span>
                      </div>

                      {/* Main Item Box */}
                      <div className="mt-3.5 flex gap-3.5">
                        <div className="w-16 h-16 rounded-2xl bg-[#F8F5FD] dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {isDiscreetDetailsMode || !item?.imageUrl ? (
                            <ShieldCheck className="w-7 h-7 text-[#7C3AED]/70" />
                          ) : (
                            <img src={item.imageUrl} alt={displayTitle} className="w-full h-full object-cover" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#29243A] dark:text-white line-clamp-2">
                            {displayTitle}
                          </h4>
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-semibold text-[#7C3AED] bg-[#F3EEFF] dark:bg-purple-950/60 px-2 py-0.5 rounded-lg">
                              {privateCat}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Amount */}
                      <div className="mt-4 p-3 rounded-2xl bg-[#F8F5FD] dark:bg-slate-800/50 border border-[#E5DDF2]/60 dark:border-slate-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-[#625B72] dark:text-slate-400 block uppercase font-bold">
                            Private Amount Paid
                          </span>
                          <span className="text-lg font-extrabold font-mono text-[#29243A] dark:text-white tabular-nums">
                            {renderPrice(purchase.totalAmount)}
                          </span>
                        </div>

                        <div className="text-[10px] text-right text-[#625B72] dark:text-slate-400">
                          <div>Method: {purchase.paymentMethod}</div>
                          <div className="font-mono text-[9px] text-[#7C3AED]">Hidden from main report</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Controls: Rename, Move Back to Regular, Delete */}
                    <div className="mt-5 pt-3 border-t border-[#E5DDF2]/70 dark:border-slate-800 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setRenamingItem({ id: purchase.id, currentName: displayTitle });
                            setRenamingInput(displayTitle);
                          }}
                          className="p-1.5 rounded-xl text-[#625B72] hover:text-[#7C3AED] hover:bg-[#F3EEFF] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Rename with custom discreet alias"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setItemToMoveRegular(purchase)}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold text-[#625B72] hover:text-[#7C3AED] hover:bg-[#F3EEFF] dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                          title="Move this purchase back to the regular shopping dashboard"
                        >
                          <ArrowLeftRight className="w-3 h-3 text-[#7C3AED]" />
                          <span>Make Public</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setItemToDelete(purchase)}
                        className="p-1.5 rounded-xl text-[#625B72] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Permanently delete purchase from private vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PRIVATE SPENDING ANALYTICS                                     */}
      {/* ===================================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stat 1: Total Private Spend */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#625B72] dark:text-slate-400 block">
                Total Private Spend
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#4C267B] dark:text-white">
                {renderPrice(totalPrivateSpent)}
              </div>
              <span className="text-[11px] text-[#16A085] font-semibold block">
                Kept out of normal monthly totals
              </span>
            </div>

            {/* Stat 2: Total Private Orders */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#625B72] dark:text-slate-400 block">
                Private Orders Tracked
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#7C3AED] dark:text-purple-400">
                {privatePurchases.length}
              </div>
              <span className="text-[11px] text-[#625B72] dark:text-slate-400 block">
                Across {availableStores.length} merchants
              </span>
            </div>

            {/* Stat 3: Average Order Value */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#625B72] dark:text-slate-400 block">
                Average Private Order
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#29243A] dark:text-white">
                {privatePurchases.length > 0 ? renderPrice(Math.round(totalPrivateSpent / privatePurchases.length)) : renderPrice(0)}
              </div>
              <span className="text-[11px] text-[#625B72] dark:text-slate-400 block">
                Average confidential spend
              </span>
            </div>
          </div>

          {/* Private Category Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                  Private Spending by Category
                </h3>
              </div>
              <span className="text-xs text-[#625B72] dark:text-slate-400">
                Visible only within this vault
              </span>
            </div>

            {privateCategoryBreakdown.length === 0 ? (
              <p className="text-xs text-[#625B72] dark:text-slate-400 py-4">No private categories recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {privateCategoryBreakdown.map(([cat, amt]) => {
                  const ratio = totalPrivateSpent > 0 ? (amt / totalPrivateSpent) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#29243A] dark:text-white">{cat}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#7C3AED]">{renderPrice(amt)}</span>
                          <span className="text-[#625B72] dark:text-slate-400 font-mono text-[10px]">({ratio.toFixed(0)}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-purple-400"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: PRIVACY, AUTHENTICATION & STORAGE SETTINGS                     */}
      {/* ===================================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Setting Box 1: PIN Authentication */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
                <KeyRound className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                  Vault Authentication & PIN
                </h3>
              </div>

              <p className="text-xs text-[#625B72] dark:text-slate-400 leading-relaxed">
                Your private vault is safeguarded by your 4-digit PIN. You can change this PIN at any time.
              </p>

              {!isChangingPin ? (
                <button
                  onClick={() => setIsChangingPin(true)}
                  className="px-4 py-2.5 rounded-2xl bg-[#F3EEFF] hover:bg-[#E5DDF2] text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Change 4-Digit Security PIN</span>
                </button>
              ) : (
                <form onSubmit={handleSaveNewPin} className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-[#29243A] dark:text-white block mb-1">
                      New 4-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F8F5FD] dark:bg-slate-800 text-sm font-mono text-center tracking-widest text-[#29243A] dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#29243A] dark:text-white block mb-1">
                      Confirm New 4-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F8F5FD] dark:bg-slate-800 text-sm font-mono text-center tracking-widest text-[#29243A] dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingPin(false)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 text-[#625B72] dark:bg-slate-800 dark:text-slate-400 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer"
                    >
                      Save New PIN
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Setting Box 2: Auto-Lock Timing */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
                <Clock className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                  Automatic Locking Timeout
                </h3>
              </div>

              <p className="text-xs text-[#625B72] dark:text-slate-400 leading-relaxed">
                Choose when the vault locks itself to prevent unauthorized viewing if you step away.
              </p>

              <div className="space-y-2">
                {[
                  { id: '1', label: 'Lock after 1 minute of inactivity' },
                  { id: '2', label: 'Lock after 2 minutes of inactivity (Recommended)' },
                  { id: '5', label: 'Lock after 5 minutes of inactivity' },
                  { id: 'immediate', label: 'Immediately lock whenever switching tabs or leaving app' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      autoLockTimeoutMinutes === opt.id
                        ? 'bg-[#F3EEFF] border-[#8B5CF6] text-[#4C267B] dark:bg-purple-950/60 dark:border-purple-700 dark:text-purple-200 font-bold'
                        : 'border-[#E5DDF2] dark:border-slate-800 text-[#29243A] dark:text-slate-300 hover:bg-[#F8F5FD]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="autolock"
                      checked={autoLockTimeoutMinutes === opt.id}
                      onChange={() => setAutoLockTimeoutMinutes(opt.id)}
                      className="accent-[#7C3AED]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Setting Box 3: Sidebar Stealth Mode */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-4 md:col-span-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                  <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                    Sidebar Stealth Mode
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hidePrivateShoppingFromSidebar
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                }`}>
                  {hidePrivateShoppingFromSidebar ? 'Hidden from Sidebar' : 'Visible in Sidebar'}
                </span>
              </div>

              <p className="text-xs text-[#625B72] dark:text-slate-400 leading-relaxed">
                Remove the Private Shopping entry from the permanent left navigation sidebar so observers cannot see that a private shopping vault is enabled on this device. You can still open this vault via Quick Actions or Settings.
              </p>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E5DDF2] dark:border-slate-800 bg-[#F8F5FD] dark:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-bold text-[#29243A] dark:text-white">
                  Hide Private Shopping from Left Navigation Bar
                </span>
                <input
                  type="checkbox"
                  checked={hidePrivateShoppingFromSidebar}
                  onChange={(e) => setHidePrivateShoppingFromSidebar(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Privacy & Disconnection Policy Explanation Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#FFF9F2] dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#7C3AED] dark:bg-purple-950/80 dark:text-purple-300 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#4C267B] dark:text-white">
                  How Your Private Shopping Data Is Protected
                </h4>
                <p className="text-xs text-[#625B72] dark:text-slate-400 leading-relaxed">
                  <strong>Local Client-Side Storage:</strong> All private shopping transactions and custom aliases are stored securely inside your browser's private local environment. They are never transmitted to public marketing dashboards or shared with Google Workspace analytics.
                </p>
                <p className="text-xs text-[#625B72] dark:text-slate-400 leading-relaxed mt-2">
                  <strong>What happens if you disconnect shopping integrations?</strong> If you disconnect an integrated merchant (like Amazon, Myntra, or your email receipt ingestor), your previously marked private purchases <em>remain safe in this vault</em>. They are not erased or restored to public views unless you explicitly choose to move them or wipe the vault below.
                </p>
              </div>
            </div>

            {/* Export & Vault Wipe Buttons */}
            <div className="pt-4 border-t border-[#E5DDF2] dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={handleExportPrivateData}
                className="px-4 py-2 rounded-2xl bg-white hover:bg-[#F3EEFF] dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 text-[#29243A] dark:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Export Private Vault Data (JSON)</span>
              </button>

              <button
                onClick={() => setShowWipeConfirmation(true)}
                className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Wipe Private Vault</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ADD NEW PRIVATE PURCHASE DIRECTLY                            */}
      {/* ===================================================================== */}
      {showAddModal && (
        <AddPrivatePurchaseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddPurchase={(p) => {
            onAddPrivatePurchase(p);
            setShowAddModal(false);
            setNoticeToast('Private purchase added to vault.');
            setTimeout(() => setNoticeToast(null), 3000);
          }}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: MOVE EXISTING REGULAR PURCHASE INTO PRIVATE VAULT            */}
      {/* ===================================================================== */}
      {showImportModal && (
        <ImportPurchaseToVaultModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          regularPurchases={regularPurchases}
          onMakePrivate={(id) => {
            onMakePurchasePrivate(id);
            setShowImportModal(false);
            setNoticeToast('Purchase transferred into Private Vault.');
            setTimeout(() => setNoticeToast(null), 3000);
          }}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: RENAME WITH CUSTOM DISCREET ALIAS                            */}
      {/* ===================================================================== */}
      {renamingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#E5DDF2] dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DDF2] dark:border-slate-800">
              <h3 className="text-base font-bold text-[#4C267B] dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#7C3AED]" />
                Rename Private Purchase
              </h3>
              <button onClick={() => setRenamingItem(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#625B72] dark:text-slate-400">
              Provide a custom discreet alias (e.g. "Anniversary Gift", "Personal Care", "Discreet Parcel") so the original item title is concealed.
            </p>

            <div>
              <label className="text-[11px] font-semibold text-[#29243A] dark:text-white block mb-1">
                Custom Name / Alias
              </label>
              <input
                type="text"
                required
                value={renamingInput}
                onChange={(e) => setRenamingInput(e.target.value)}
                placeholder="e.g. Birthday Surprise"
                className="w-full px-3 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F8F5FD] dark:bg-slate-800 text-xs text-[#29243A] dark:text-white focus:outline-none"
                autoFocus
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E5DDF2] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRenamingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[#625B72]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (renamingInput.trim()) {
                    onRenamePrivatePurchase(renamingItem.id, renamingInput.trim());
                    setRenamingItem(null);
                    setNoticeToast('Private alias saved.');
                    setTimeout(() => setNoticeToast(null), 3000);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold"
              >
                Save Custom Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: CONFIRMATION - MOVE BACK TO REGULAR SHOPPING                 */}
      {/* ===================================================================== */}
      {itemToMoveRegular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#E5DDF2] dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-[#7C3AED]">
              <ArrowLeftRight className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                Move Back to Regular Shopping?
              </h3>
            </div>

            <p className="text-xs text-[#625B72] dark:text-slate-400 leading-relaxed">
              Are you sure you want to transfer <strong>"{itemToMoveRegular.customDisplayName || itemToMoveRegular.items[0]?.name}"</strong> back into regular shopping?
            </p>

            <div className="p-3 rounded-2xl bg-[#FFF6ED] border border-[#FDBA74] text-xs text-[#C2410C]">
              ⚠️ This purchase will reappear on your public Dashboard, Recent Purchases, and general analytics.
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E5DDF2] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setItemToMoveRegular(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[#625B72]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onMoveToRegular(itemToMoveRegular.id);
                  setItemToMoveRegular(null);
                  setNoticeToast('Purchase restored to normal shopping tracker.');
                  setTimeout(() => setNoticeToast(null), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold"
              >
                Move to Regular Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: CONFIRMATION - PERMANENTLY DELETE PRIVATE PURCHASE            */}
      {/* ===================================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-200 dark:border-rose-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                Delete Private Purchase?
              </h3>
            </div>

            <p className="text-xs text-[#625B72] dark:text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{itemToDelete.customDisplayName || itemToDelete.items[0]?.name}"</strong>? This will permanently purge the record from your device.
            </p>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E5DDF2] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[#625B72]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePrivatePurchase(itemToDelete.id);
                  setItemToDelete(null);
                  setNoticeToast('Private purchase permanently deleted.');
                  setTimeout(() => setNoticeToast(null), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: CONFIRMATION - WIPE PRIVATE VAULT                            */}
      {/* ===================================================================== */}
      {showWipeConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-300 dark:border-rose-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Permanently Wipe Private Vault?
              </h3>
            </div>

            <p className="text-xs text-[#625B72] dark:text-slate-400 leading-relaxed">
              This action will permanently delete all <strong>{privatePurchases.length} private purchases</strong> in your vault. This cannot be undone. Regular shopping purchases will remain unaffected.
            </p>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowWipeConfirmation(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[#625B72]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onWipePrivateVault();
                  setShowWipeConfirmation(false);
                  setNoticeToast('Private vault completely wiped.');
                  setTimeout(() => setNoticeToast(null), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// HELPER COMPONENT 1: ADD NEW PRIVATE PURCHASE MODAL
// =========================================================================
interface AddPrivatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPurchase: (purchase: PurchaseTransaction) => void;
}

const AddPrivatePurchaseModal: React.FC<AddPrivatePurchaseModalProps> = ({
  isOpen,
  onClose,
  onAddPurchase,
}) => {
  const { currency } = useApp();
  const [store, setStore] = useState('Amazon');
  const [customStore, setCustomStore] = useState('');
  const [productName, setProductName] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Personal Care & Wellness');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Discreet)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !productName.trim()) return;

    const actualStore = store === 'Other' ? (customStore.trim() || 'Store') : store;
    const newTxId = `pvt-tx-${Date.now()}`;

    const newPurchase: PurchaseTransaction = {
      id: newTxId,
      orderNumber: `PVT-${Math.floor(100000 + Math.random() * 900000)}`,
      store: actualStore,
      date,
      subtotal: parsedAmount,
      discount: 0,
      deliveryCharges: 0,
      totalAmount: parsedAmount,
      currency,
      paymentMethod,
      source: 'store_webhook',
      orderStatus: 'Delivered',
      isPrivate: true,
      customDisplayName: customAlias.trim() || productName.trim(),
      privateCategory: category,
      items: [
        {
          id: `pvt-it-${Date.now()}`,
          name: productName.trim(),
          customDisplayName: customAlias.trim() || productName.trim(),
          price: parsedAmount,
          quantity: 1,
          category: 'Other',
          subCategory: category,
          store: actualStore,
          date,
          orderStatus: 'Delivered',
        }
      ]
    };

    onAddPurchase(newPurchase);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fadeIn">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#E5DDF2] dark:border-slate-800 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F3EEFF] text-[#7C3AED] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
              Log Private Purchase
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#625B72] dark:text-slate-400">
          This purchase will be saved exclusively inside your Private Vault. It will never be indexed into regular dashboard totals or external reports.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#29243A] dark:text-white block mb-1">
              Real Item / Description (Concealed)
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Sensitive Skincare Treatment, Special Gift"
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F8F5FD] dark:bg-slate-800 text-xs text-[#29243A] dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#29243A] dark:text-white block mb-1">
              Discreet Display Alias (Optional)
            </label>
            <input
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              placeholder="e.g. Anniversary Surprise (Shown in place of real title)"
              className="w-full px-3 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F8F5FD] dark:bg-slate-800 text-xs text-[#29243A] dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#29243A] dark:text-white block mb-1">
                Store / Website
              </label>
              <select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F8F5FD] dark:bg-slate-800 text-xs text-[#29243A] dark:text-white focus:outline-none"
              >
                <option value="Amazon">Amazon</option>
                <option value="Myntra">Myntra</option>
                <option value="Nykaa">Nykaa</option>
                <option value="Flipkart">Flipkart</option>
                <option value="AJIO">AJIO</option>
                <option value="Croma">Croma</option>
                <option value="Other">Other Store</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#29243A] dark:text-white block mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F8F5FD] dark:bg-slate-800 text-xs font-mono text-[#29243A] dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#29243A] dark:text-white block mb-1">
                Private Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F8F5FD] dark:bg-slate-800 text-xs text-[#29243A] dark:text-white focus:outline-none"
              >
                {PRIVATE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#29243A] dark:text-white block mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F8F5FD] dark:bg-slate-800 text-xs text-[#29243A] dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 flex justify-end gap-2 border-t border-[#E5DDF2] dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[#625B72]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold"
          >
            Save to Private Vault
          </button>
        </div>
      </form>
    </div>
  );
};

// =========================================================================
// HELPER COMPONENT 2: IMPORT EXISTING PURCHASE TO VAULT MODAL
// =========================================================================
interface ImportPurchaseToVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  regularPurchases: PurchaseTransaction[];
  onMakePrivate: (id: string) => void;
}

const ImportPurchaseToVaultModal: React.FC<ImportPurchaseToVaultModalProps> = ({
  isOpen,
  onClose,
  regularPurchases,
  onMakePrivate,
}) => {
  const { formatPrice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const eligiblePurchases = regularPurchases.filter(p => {
    const title = p.items[0]?.name || p.store;
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.store.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#E5DDF2] dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
              Move Purchase into Private Vault
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#625B72] dark:text-slate-400">
          Select an existing purchase to isolate it. It will immediately be removed from your regular dashboard, recent purchases, and public spending reports.
        </p>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search purchases by name or store..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F5FD] dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 rounded-xl text-[#29243A] dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {eligiblePurchases.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No matching purchases found.</p>
          ) : (
            eligiblePurchases.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl border border-[#E5DDF2] dark:border-slate-800 bg-white hover:bg-[#F3EEFF]/40 dark:bg-slate-900 dark:hover:bg-slate-800/50 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#29243A] dark:text-white truncate">
                    {p.items[0]?.name || p.store}
                  </div>
                  <div className="text-[10px] text-[#625B72] dark:text-slate-400">
                    {p.store} · {p.date} · {formatPrice(p.totalAmount)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onMakePrivate(p.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Make Private</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex justify-end border-t border-[#E5DDF2] dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[#625B72]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
