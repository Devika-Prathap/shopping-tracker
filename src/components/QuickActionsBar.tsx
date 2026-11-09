import React, { useState } from 'react';
import { 
  Clock, 
  Bookmark, 
  TrendingUp, 
  Wallet, 
  Lock, 
  ArrowLeftRight, 
  SlidersHorizontal, 
  Plus, 
  Check, 
  X,
  Calendar,
  Sparkles
} from 'lucide-react';
import { NavTab } from './Navigation';

export interface QuickActionItem {
  id: string;
  label: string;
  tab: NavTab;
  iconName: 'purchases' | 'wishlist' | 'spending' | 'budget' | 'private' | 'compare' | 'timeline';
  visible: boolean;
  colorClass: string;
}

export const DEFAULT_QUICK_ACTIONS: QuickActionItem[] = [
  { id: 'qa-purchases', label: 'Recent Purchases', tab: 'purchases', iconName: 'purchases', visible: true, colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300' },
  { id: 'qa-wishlist', label: 'Add to Wishlist', tab: 'wishlist', iconName: 'wishlist', visible: true, colorClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300' },
  { id: 'qa-spending', label: 'View Spending', tab: 'analytics', iconName: 'spending', visible: true, colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300' },
  { id: 'qa-budget', label: 'Set a Budget', tab: 'budgets', iconName: 'budget', visible: true, colorClass: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300' },
  { id: 'qa-private', label: 'Private Shopping', tab: 'private_shopping', iconName: 'private', visible: true, colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300' },
  { id: 'qa-compare', label: 'Compare Products', tab: 'comparison', iconName: 'compare', visible: true, colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300' },
  { id: 'qa-timeline', label: 'Spending Timeline', tab: 'timeline', iconName: 'timeline', visible: false, colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300' },
];

interface QuickActionsBarProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onNavigateTab }) => {
  const [actions, setActions] = useState<QuickActionItem[]>(() => {
    try {
      const saved = localStorage.getItem('cartlens_custom_quick_actions');
      if (saved) return JSON.parse(saved);
      return DEFAULT_QUICK_ACTIONS;
    } catch {
      return DEFAULT_QUICK_ACTIONS;
    }
  });

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const toggleActionVisibility = (id: string) => {
    setActions(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, visible: !a.visible } : a);
      try {
        localStorage.setItem('cartlens_custom_quick_actions', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resetActions = () => {
    setActions(DEFAULT_QUICK_ACTIONS);
    try {
      localStorage.setItem('cartlens_custom_quick_actions', JSON.stringify(DEFAULT_QUICK_ACTIONS));
    } catch {}
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'purchases': return <Clock className="w-4 h-4" />;
      case 'wishlist': return <Bookmark className="w-4 h-4" />;
      case 'spending': return <TrendingUp className="w-4 h-4" />;
      case 'budget': return <Wallet className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      case 'compare': return <ArrowLeftRight className="w-4 h-4" />;
      case 'timeline': return <Calendar className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const visibleActions = actions.filter(a => a.visible);

  return (
    <section className="bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-4 shadow-xs select-none min-w-0">
      <div className="flex items-center justify-between mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#625B72] dark:text-slate-400">
            Quick Actions
          </span>
          <span className="text-[10px] text-[#8B5CF6] font-semibold hidden sm:inline">
            · {visibleActions.length} shortcuts
          </span>
        </div>

        <button
          onClick={() => setIsCustomizeOpen(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] dark:text-purple-300 hover:text-[#4C267B] dark:hover:text-white px-2 py-1 rounded-lg hover:bg-[#F3EEFF] dark:hover:bg-slate-800 cursor-pointer transition-colors"
          title="Customize dashboard shortcuts"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Customize</span>
        </button>
      </div>

      {/* Grid / Flex of Compact Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 min-w-0">
        {visibleActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onNavigateTab(action.tab)}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5DDF2]/80 dark:border-slate-800 hover:border-[#8B5CF6] dark:hover:border-purple-600 bg-[#FFF9F2]/60 hover:bg-[#F3EEFF] dark:bg-slate-800/40 dark:hover:bg-slate-800 transition-all cursor-pointer group text-left min-w-0 shadow-2xs"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${action.colorClass} group-hover:scale-105 transition-transform`}>
              {renderIcon(action.iconName)}
            </div>
            <span className="text-xs font-bold text-[#29243A] dark:text-slate-200 group-hover:text-[#7C3AED] dark:group-hover:text-purple-300 transition-colors truncate">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Customizer Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DDF2] dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="text-sm font-bold text-[#1E1B2E] dark:text-white">
                  Customize Quick Actions
                </h3>
              </div>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="text-[#625B72] hover:text-[#1E1B2E] dark:text-slate-400 dark:hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#625B72] dark:text-slate-400">
              Select which action shortcuts appear on your main dashboard:
            </p>

            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
              {actions.map((act) => (
                <div
                  key={act.id}
                  onClick={() => toggleActionVisibility(act.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    act.visible
                      ? 'bg-[#F3EEFF]/80 dark:bg-purple-950/40 border-[#8B5CF6]/50'
                      : 'bg-white dark:bg-slate-800 border-[#E5DDF2] dark:border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${act.colorClass}`}>
                      {renderIcon(act.iconName)}
                    </div>
                    <span className="text-xs font-bold text-[#29243A] dark:text-white">
                      {act.label}
                    </span>
                  </div>

                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                    act.visible 
                      ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' 
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {act.visible && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E5DDF2] dark:border-slate-800">
              <button
                onClick={resetActions}
                className="text-xs font-semibold text-[#625B72] dark:text-slate-400 hover:text-[#7C3AED] cursor-pointer"
              >
                Reset Default
              </button>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
