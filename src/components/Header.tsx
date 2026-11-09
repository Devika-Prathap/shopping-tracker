import React, { useState, useRef, useEffect } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Puzzle, 
  RefreshCw, 
  Receipt, 
  Building2, 
  Sparkles,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  ShieldAlert
} from 'lucide-react';
import { BudgetAlertNotification } from '../types';

interface HeaderProps {
  viewMode: 'desktop' | 'extension' | 'mobile';
  setViewMode: (mode: 'desktop' | 'extension' | 'mobile') => void;
  activeTab: 'overview' | 'items' | 'sync' | 'insights';
  setActiveTab: (tab: 'overview' | 'items' | 'sync' | 'insights') => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
  lastSyncedText: string;
  notifications: BudgetAlertNotification[];
  onClearNotifications: () => void;
  onSelectAlert: (alert: BudgetAlertNotification) => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
  isSyncing,
  onTriggerSync,
  lastSyncedText,
  notifications,
  onClearNotifications,
  onSelectAlert,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-sm font-semibold">
              CL
            </div>
            <a href="/" className="text-lg font-semibold tracking-tight text-white hover:text-emerald-400 transition-colors">
              CartLens
            </a>
            <span className="hidden lg:inline text-xs text-neutral-400 pl-2 border-l border-neutral-800">
              Auto-Sync Shopping & Expense Engine
            </span>
          </div>

          {/* Zone 2: Navigation tabs with quiet text styling */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`transition-colors py-1 ${
                activeTab === 'overview'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Spending Dashboard
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`transition-colors py-1 ${
                activeTab === 'items'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Purchased Items
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`transition-colors py-1 flex items-center gap-1.5 ${
                activeTab === 'sync'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Bank & Receipts</span>
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`transition-colors py-1 flex items-center gap-1.5 ${
                activeTab === 'insights'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Insights</span>
            </button>
          </nav>

          {/* Zone 3: Actions, Notifications Bell & View Mode Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                title="Budget Alert Notifications"
                className="relative p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-mono font-bold text-neutral-950 ring-2 ring-neutral-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-white">
                        Budget Notifications
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button
                          onClick={onClearNotifications}
                          className="text-[11px] text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear All</span>
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-neutral-400 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* List of Alerts */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-neutral-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-neutral-400">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500/50 mx-auto mb-1.5" />
                        <p className="font-medium text-neutral-300">No active spending alerts</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Alerts will trigger whenever a single purchase exceeds 25% of your remaining monthly budget.
                        </p>
                      </div>
                    ) : (
                      notifications.map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => {
                            onSelectAlert(alert);
                            setShowNotifications(false);
                          }}
                          className="p-3.5 hover:bg-neutral-800/60 cursor-pointer transition-colors text-left space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-amber-300">
                              25%+ Remaining Budget Exceeded
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {alert.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 leading-normal">
                            <span className="font-semibold text-white">{alert.merchant}</span>: ${alert.purchaseAmount.toFixed(2)} purchase exceeded 25% (${alert.thresholdAmount.toFixed(2)}) of the ${alert.remainingBudget.toFixed(2)} remaining pool.
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                            <span className="text-amber-400">
                              {alert.percentageOfRemaining.toFixed(1)}% of remaining budget
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-400 hover:underline">
                              Inspect receipt →
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* View mode switcher */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('desktop')}
                title="Desktop Dashboard View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Laptop className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('extension')}
                title="Web Extension Overlay"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'extension'
                    ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Puzzle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                title="Mobile Phone View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Sync All Button */}
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/40 active:scale-95 transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Auto-Syncing...' : 'Sync Banks & Receipts'}
              </span>
              <span className="sm:hidden">Sync</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
