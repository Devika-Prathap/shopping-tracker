import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  Mail, 
  CreditCard, 
  Store, 
  Sliders, 
  SlidersHorizontal, 
  Check, 
  Plus, 
  ExternalLink, 
  Layers, 
  Database,
  Palette,
  Sparkles,
  Sun,
  Moon,
  Bell,
  PanelLeft,
  LayoutGrid
} from 'lucide-react';
import { useApp, LightPalette, SmartAdviceLevel } from '../context/AppContext';
import { IntegrationStatus } from '../types';

interface SettingsViewProps {
  integrations: IntegrationStatus[];
  onToggleIntegration: (id: string) => void;
  onClearAllData: () => void;
  onRestoreDemoData: () => void;
  onExportData: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  integrations,
  onToggleIntegration,
  onClearAllData,
  onRestoreDemoData,
  onExportData,
  onNavigateTab,
}) => {
  const { 
    demoMode, 
    setDemoMode, 
    appName, 
    setAppName,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    smartAdviceLevel,
    setSmartAdviceLevel,
    lightPalette,
    setLightPalette,
    hidePrivateShoppingFromSidebar,
    setHidePrivateShoppingFromSidebar,
    notificationPreferences,
    setNotificationPreferences
  } = useApp();

  const [activeTab, setActiveTab] = useState<'personalization' | 'accounts' | 'data' | 'privacy'>('personalization');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [connectingModal, setConnectingModal] = useState<string | null>(null);

  const [sidebarDefaultCollapsed, setSidebarDefaultCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cartlens_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const handleToggleDefaultSidebar = (collapsed: boolean) => {
    setSidebarDefaultCollapsed(collapsed);
    try {
      localStorage.setItem('cartlens_sidebar_collapsed', JSON.stringify(collapsed));
    } catch {}
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Settings Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-100 via-indigo-50 to-blue-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            System Configuration
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Settings & Personalization
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Configure visual themes, custom Light Mode colour palettes, smart advice depth, sidebar behavior, and connected background channels.
          </p>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('personalization')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'personalization'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Personalization</span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'accounts'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Accounts
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'data'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Data & Export
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Privacy
          </button>
        </div>
      </div>

      {/* Tab 0: Personalization Settings */}
      {activeTab === 'personalization' && (
        <div className="space-y-6">
          {/* Section 1: Smart Advice Depth Level */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                  Smart Financial Advice Depth
                </h3>
              </div>
              <span className="text-xs text-[#625B72] dark:text-slate-400">
                Tailors dashboard insights & alerts
              </span>
            </div>

            <p className="text-xs text-[#625B72] dark:text-slate-400">
              Choose the level of analysis and depth for insights displayed across your dashboard and summary reports:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'minimal' as SmartAdviceLevel,
                  title: 'Minimal (Factual)',
                  tag: 'Totals & Limits',
                  desc: 'Concise, direct summaries. Purely facts like total spend, verified order count, and budget threshold status with zero commentary.',
                  accent: 'border-blue-400 text-blue-600 dark:text-blue-400'
                },
                {
                  id: 'balanced' as SmartAdviceLevel,
                  title: 'Balanced (Standard)',
                  tag: 'Recommended',
                  desc: 'High-value monthly comparisons, top store habits, and category trend shifts without overwhelming detail.',
                  accent: 'border-purple-500 text-purple-600 dark:text-purple-400'
                },
                {
                  id: 'detailed' as SmartAdviceLevel,
                  title: 'Detailed (Deep Dive)',
                  tag: 'Full Intelligence',
                  desc: 'In-depth velocity breakdown: weekend vs. weekday spending habits, price volatility metrics, and upcoming subscription renewal audits.',
                  accent: 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                }
              ].map((opt) => {
                const isSelected = smartAdviceLevel === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSmartAdviceLevel(opt.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#F3EEFF] dark:bg-purple-950/40 shadow-xs'
                        : 'border-[#E5DDF2] dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-[#29243A] dark:text-white">
                          {opt.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-[#E5DDF2] dark:border-slate-700 text-[#7C3AED] dark:text-purple-300">
                          {opt.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#625B72] dark:text-slate-400 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] font-bold">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[#7C3AED] dark:text-purple-300">
                          <Check className="w-3.5 h-3.5" /> Active Depth
                        </span>
                      ) : (
                        <span className="text-slate-400">Click to Select</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Light Mode Colour Palette Selection */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                  Light Mode Colour Palette
                </h3>
              </div>
              <span className="text-xs text-[#625B72] dark:text-slate-400">
                Independent Light Mode themes
              </span>
            </div>

            <p className="text-xs text-[#625B72] dark:text-slate-400">
              Choose your preferred Light Mode visual styling. Each theme features warm pastel backgrounds, accessible contrast, and custom accents:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'warm-ivory' as LightPalette,
                  name: 'Warm Ivory & Lavender',
                  tag: 'Primary Theme',
                  swatches: ['#FFF9F2', '#F3EEFF', '#8B5CF6', '#F472B6', '#16A085']
                },
                {
                  id: 'soft-rose' as LightPalette,
                  name: 'Soft Rose & Coral',
                  tag: 'Warm Pastel',
                  swatches: ['#FFF5F7', '#FDF2F8', '#F43F5E', '#FB7185', '#F59E0B']
                },
                {
                  id: 'mint-fresh' as LightPalette,
                  name: 'Emerald Mint & Sage',
                  tag: 'Eco Calm',
                  swatches: ['#F0FDF4', '#ECFDF5', '#10B981', '#34D399', '#0284C7']
                },
                {
                  id: 'lavender-mist' as LightPalette,
                  name: 'Ocean Frost & Sky',
                  tag: 'Cool Crisp',
                  swatches: ['#F0F9FF', '#EFF6FF', '#3B82F6', '#60A5FA', '#8B5CF6']
                }
              ].map((p) => {
                const isSelected = lightPalette === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setLightPalette(p.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#F3EEFF] dark:bg-purple-950/40 shadow-xs'
                        : 'border-[#E5DDF2] dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#29243A] dark:text-white">
                          {p.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#7C3AED]" />}
                      </div>
                      <span className="text-[10px] text-[#625B72] dark:text-slate-400 block mb-2 font-medium">
                        {p.tag}
                      </span>
                      {/* Swatch chips */}
                      <div className="flex items-center gap-1.5">
                        {p.swatches.map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-black/10 dark:border-white/10 shadow-2xs"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-[#7C3AED] dark:text-purple-300">
                      {isSelected ? '● Active Palette' : 'Apply Palette'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Navigation, Sidebar & Privacy Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sidebar Default Configuration */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
                <PanelLeft className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                  Left Sidebar Default Behavior
                </h3>
              </div>
              <p className="text-xs text-[#625B72] dark:text-slate-400">
                Set how the persistent left navigation sidebar appears when launching the app:
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleDefaultSidebar(false)}
                  className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    !sidebarDefaultCollapsed
                      ? 'bg-[#F3EEFF] text-[#7C3AED] border-[#8B5CF6] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700'
                      : 'border-[#E5DDF2] dark:border-slate-800 text-[#625B72] dark:text-slate-400'
                  }`}
                >
                  Expanded (256px with labels)
                </button>
                <button
                  onClick={() => handleToggleDefaultSidebar(true)}
                  className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    sidebarDefaultCollapsed
                      ? 'bg-[#F3EEFF] text-[#7C3AED] border-[#8B5CF6] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700'
                      : 'border-[#E5DDF2] dark:border-slate-800 text-[#625B72] dark:text-slate-400'
                  }`}
                >
                  Collapsed (80px icon strip)
                </button>
              </div>
            </div>

            {/* Private Shopping Sidebar Visibility */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#8B5CF6]" />
                  <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                    Private Shopping Sidebar Visibility
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
                For maximum discretion, hide the Private Shopping entry from the left sidebar. You can still access it anytime via Quick Actions or Settings.
              </p>
              <label className="flex items-center justify-between p-3 rounded-2xl border border-[#E5DDF2] dark:border-slate-800 bg-[#F8F5FD] dark:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-bold text-[#29243A] dark:text-white">
                  Hide Private Shopping from Left Sidebar
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

          {/* Section 4: Display Theme, Currency & Notification Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Theme & Currency Controls */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
                <Sun className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                  Display & Currency Preferences
                </h3>
              </div>

              {/* Theme toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#29243A] dark:text-white block">
                    Active Theme Mode
                  </span>
                  <span className="text-[11px] text-[#625B72] dark:text-slate-400">
                    Switch between tailored Light Mode and Dark Mode
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-xl border border-[#E5DDF2] dark:border-slate-700 bg-[#F3EEFF] dark:bg-slate-800 text-xs font-bold text-[#4C267B] dark:text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-purple-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>

              {/* Currency selector */}
              <div>
                <span className="text-xs font-bold text-[#29243A] dark:text-white block mb-1.5">
                  Display Currency
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {(['₹', '$', '€', '£'] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        currency === curr
                          ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs'
                          : 'border-[#E5DDF2] dark:border-slate-800 text-[#29243A] dark:text-slate-300 hover:bg-[#F3EEFF]'
                      }`}
                    >
                      {curr} {curr === '₹' ? 'INR' : curr === '$' ? 'USD' : curr === '€' ? 'EUR' : 'GBP'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dashboard Layout link */}
              <div className="pt-2 border-t border-[#E5DDF2] dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-[#625B72] dark:text-slate-400">
                  Dashboard cards & shortcuts
                </span>
                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('dashboard');
                  }}
                  className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Customize Dashboard Cards →</span>
                </button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E5DDF2] dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5DDF2] dark:border-slate-800">
                <Bell className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="text-base font-bold text-[#4C267B] dark:text-white">
                  Notifications & Alerts
                </h3>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'budgetAlerts' as const,
                    title: 'Budget Limit Warnings',
                    desc: 'Notify when category spend exceeds 80% and 100% of limits.'
                  },
                  {
                    key: 'priceDrops' as const,
                    title: 'Wishlist Price Drop Triggers',
                    desc: 'Instant alert when a saved product price falls.'
                  },
                  {
                    key: 'deliveryUpdates' as const,
                    title: 'Return Window Reminders',
                    desc: 'Notice 3 days before return/refund eligibility expires.'
                  },
                  {
                    key: 'weeklyDigest' as const,
                    title: 'Weekly Sunday Summary',
                    desc: 'Recap of week-over-week spending velocity.'
                  }
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-[#F8F5FD] dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#29243A] dark:text-white block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-[#625B72] dark:text-slate-400 leading-tight block">
                        {item.desc}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationPreferences[item.key]}
                      onChange={(e) => {
                        setNotificationPreferences(prev => ({
                          ...prev,
                          [item.key]: e.target.checked
                        }));
                      }}
                      className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] mt-0.5 cursor-pointer shrink-0"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Connected Accounts Section */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Automatic Data Sources
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorised background channels collecting your verified purchases. Technical integrations run silently in the background.
              </p>
            </div>

            <button
              onClick={() => alert('Account connection flow ready. Select a provider below to connect.')}
              className="px-3.5 py-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-purple-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect New Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map(integ => (
              <div
                key={integ.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                        {integ.type === 'email' ? <Mail className="w-4 h-4" /> : integ.type === 'payment' ? <CreditCard className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {integ.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Last polled: {integ.lastPolled}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      integ.status === 'connected'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    }`}>
                      {integ.status === 'connected' ? 'Connected' : 'Available'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                    {integ.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {integ.purchasesDetected} verified checkouts extracted
                  </span>

                  <button
                    onClick={() => onToggleIntegration(integ.id)}
                    className={`font-semibold cursor-pointer text-xs ${
                      integ.status === 'connected'
                        ? 'text-rose-600 hover:text-rose-700'
                        : 'text-purple-600 hover:text-purple-700'
                    }`}
                  >
                    {integ.status === 'connected' ? 'Disconnect' : 'Connect Account'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              All connected accounts use read-only OAuth tokens or client-side invoice parsers. We never store bank passwords, PINs, OTPs, or credit card numbers.
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Data & Export Section */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Management & Backup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export your structured shopping records, reset demo data, or manage local cache.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Export Dataset</h4>
                <p className="text-[11px] text-slate-500">
                  Download your purchase records as a JSON or CSV spreadsheet.
                </p>
                <button
                  onClick={onExportData}
                  className="mt-2 w-full py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:border-purple-300 cursor-pointer"
                >
                  Download Data
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Restore Sample Data</h4>
                <p className="text-[11px] text-slate-500">
                  Reset the dashboard to the initial verified sample shopping activity.
                </p>
                <button
                  onClick={onRestoreDemoData}
                  className="mt-2 w-full py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:border-amber-300 cursor-pointer"
                >
                  Restore Dataset
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Clear All Records</h4>
                <p className="text-[11px] text-slate-500">
                  Permanently delete all stored purchase records from local storage.
                </p>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="mt-2 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Clear Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Privacy & Security */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Zero-Knowledge Privacy Architecture
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              TrackShop is architected with a strict privacy-first foundation. Your transaction records, receipts, and order histories stay private to your session. We do not sell your shopping data to advertisers or third-party data brokers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Client-Side Receipt Processing</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Digital invoice parsing extracts store name, total, and items locally without transmitting full unencrypted email bodies to external servers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>No Financial Credentials Required</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  We never ask for passwords, UPI PINs, net-banking credentials, or CVVs. All spending data originates from verified order manifests.
                </p>
              </div>
            </div>

            {/* Private Shopping Disconnection Policy */}
            <div className="p-4 rounded-2xl bg-[#F3EEFF]/80 dark:bg-purple-950/40 border border-[#E5DDF2] dark:border-purple-800/60 space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-[#4C267B] dark:text-purple-300">
                  <Lock className="w-4 h-4 text-[#7C3AED]" />
                  <span>Private Shopping Vault & Integration Disconnection Policy</span>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('private_shopping')}
                    className="text-[11px] text-[#7C3AED] hover:underline font-bold cursor-pointer"
                  >
                    Open Private Vault →
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#625B72] dark:text-slate-400 leading-relaxed">
                <strong>What happens to private purchases when you disconnect shopping integrations?</strong> When you disconnect an integration (such as Amazon, Myntra, or your email inbox), your private vault purchases <em>remain safely preserved</em> on this device. Disconnecting accounts will never purge, reveal, or restore private purchases to public views.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Clear All Shopping Records?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will reset all purchase transactions, store analytics, and category metrics. You can restore sample data anytime.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
