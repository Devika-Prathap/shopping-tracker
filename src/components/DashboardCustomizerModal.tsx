import React, { useState } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  GripVertical, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

export type DashboardCardId = 
  | 'quick_actions'
  | 'total_spending' 
  | 'spending_sparkline'
  | 'recent_purchases' 
  | 'recently_viewed'
  | 'budget_progress'
  | 'category_spending' 
  | 'top_stores' 
  | 'smart_insight';

export interface DashboardCardConfig {
  id: string;
  title: string;
  description: string;
  visible: boolean;
  order: number;
  category: 'Actions' | 'Spending' | 'Purchases' | 'Breakdown' | 'Stores' | 'Insights';
}

export const DEFAULT_DASHBOARD_CARDS: DashboardCardConfig[] = [
  { 
    id: 'quick_actions', 
    title: 'Quick Actions Bar', 
    description: 'Fast access shortcuts to purchases, wishlist, budgets, spending, and private vault.', 
    visible: true, 
    order: 0, 
    category: 'Actions' 
  },
  { 
    id: 'total_spending', 
    title: 'Total Spending & Goal Progress', 
    description: 'Radial progress tracker for monthly spending limits and savings goals.', 
    visible: true, 
    order: 1, 
    category: 'Spending' 
  },
  { 
    id: 'spending_sparkline', 
    title: '7-Day Spending Trend', 
    description: 'Sparkline chart displaying daily spending pulse over the last 7 days.', 
    visible: true, 
    order: 2, 
    category: 'Spending' 
  },
  { 
    id: 'recent_purchases', 
    title: 'Recent Purchases', 
    description: 'Only the 5 most recent purchases with store, price, and details.', 
    visible: true, 
    order: 3, 
    category: 'Purchases' 
  },
  { 
    id: 'recently_viewed', 
    title: 'Recently Viewed Products', 
    description: 'Quickly reopen details for products you recently inspected.', 
    visible: true, 
    order: 4, 
    category: 'Purchases' 
  },
  { 
    id: 'budget_progress', 
    title: 'Budget Progress (Top 3)', 
    description: 'Visual gauges and progress bars comparing spending vs limit for top 3 categories.', 
    visible: true, 
    order: 5, 
    category: 'Spending' 
  },
  { 
    id: 'category_spending', 
    title: 'Spending by Category', 
    description: 'Colourful chart across Clothing, Electronics, Shoes, Beauty & Accessories.', 
    visible: true, 
    order: 6, 
    category: 'Breakdown' 
  },
  { 
    id: 'top_stores', 
    title: 'Top Stores', 
    description: 'Top 3 most-used shopping websites and total spend.', 
    visible: true, 
    order: 7, 
    category: 'Stores' 
  },
  { 
    id: 'smart_insight', 
    title: 'One Smart Insight', 
    description: 'Single high-value insight on spending habits and trends.', 
    visible: true, 
    order: 8, 
    category: 'Insights' 
  },
];

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: DashboardCardConfig[];
  onSaveCards: (cards: DashboardCardConfig[]) => void;
  onResetDefault: () => void;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
  cards,
  onSaveCards,
  onResetDefault,
}) => {
  const [localCards, setLocalCards] = useState<DashboardCardConfig[]>(cards);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  React.useEffect(() => {
    setLocalCards(cards);
  }, [cards, isOpen]);

  if (!isOpen) return null;

  // Toggle visibility of a card
  const handleToggleVisibility = (id: string) => {
    const updated = localCards.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
    setLocalCards(updated);
    onSaveCards(updated);
  };

  // Move card up
  const handleMoveUp = (idx: number) => {
    if (idx <= 0) return;
    const items = [...localCards];
    const temp = items[idx - 1];
    items[idx - 1] = items[idx];
    items[idx] = temp;
    // update order indices
    const updated = items.map((c, i) => ({ ...c, order: i }));
    setLocalCards(updated);
    onSaveCards(updated);
  };

  // Move card down
  const handleMoveDown = (idx: number) => {
    if (idx >= localCards.length - 1) return;
    const items = [...localCards];
    const temp = items[idx + 1];
    items[idx + 1] = items[idx];
    items[idx] = temp;
    // update order indices
    const updated = items.map((c, i) => ({ ...c, order: i }));
    setLocalCards(updated);
    onSaveCards(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const items = [...localCards];
    const [moved] = items.splice(draggedIdx, 1);
    items.splice(idx, 0, moved);
    const updated = items.map((c, i) => ({ ...c, order: i }));
    setDraggedIdx(idx);
    setLocalCards(updated);
    onSaveCards(updated);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const visibleCount = localCards.filter(c => c.visible).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-[#131A2B] border border-[#E5DDF2] dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto min-w-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E5DDF2] dark:border-slate-800 bg-[#F8F5FD] dark:bg-[#0E1422]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1E1B2E] dark:text-white truncate">
                  Personalize Dashboard
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3EEFF] text-[#7C3AED] dark:bg-purple-950 dark:text-purple-300">
                  {visibleCount} of {localCards.length} Visible
                </span>
              </div>
              <p className="text-[11px] text-[#625B72] dark:text-slate-400 truncate">
                Drag to reorder, toggle visibility, and save your custom layout
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#F3EEFF] dark:hover:bg-slate-800 text-[#625B72] hover:text-[#1E1B2E] dark:hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 min-w-0">
          <div className="flex items-center justify-between text-xs text-[#625B72] dark:text-slate-400 px-1 pb-1">
            <span className="font-semibold">Dashboard Cards ({localCards.length})</span>
            <span className="text-[11px] hidden sm:inline">Use grip handle to drag or arrows to reorder</span>
          </div>

          {localCards.map((card, idx) => (
            <div
              key={card.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                draggedIdx === idx
                  ? 'opacity-40 border-[#8B5CF6] bg-purple-50 dark:bg-purple-950/30'
                  : card.visible
                  ? 'bg-white dark:bg-[#131A2B] border-[#E5DDF2] dark:border-slate-800 shadow-2xs hover:border-[#8B5CF6]/50'
                  : 'bg-[#F8F5FD]/60 dark:bg-slate-900/60 border-dashed border-[#E5DDF2] dark:border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Drag handle */}
                <div 
                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#8B5CF6] transition-colors p-1 -ml-1 shrink-0"
                  title="Drag to rearrange"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[#1E1B2E] dark:text-white truncate">
                      {card.title}
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#F3EEFF] dark:bg-slate-800 text-[#7C3AED] dark:text-slate-400 shrink-0">
                      {card.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#625B72] dark:text-slate-400 line-clamp-1 mt-0.5">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Action Controls: Move Up/Down + Visibility Toggle */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg hover:bg-[#F3EEFF] dark:hover:bg-slate-800 text-[#625B72] hover:text-[#1E1B2E] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === localCards.length - 1}
                  className="p-1.5 rounded-lg hover:bg-[#F3EEFF] dark:hover:bg-slate-800 text-[#625B72] hover:text-[#1E1B2E] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Show/Hide switch */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(card.id)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                    card.visible
                      ? 'bg-[#F3EEFF] text-[#7C3AED] dark:bg-purple-950/70 dark:text-purple-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-[#625B72] dark:text-slate-400'
                  }`}
                  title={card.visible ? 'Hide section' : 'Show section'}
                >
                  {card.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline text-[11px]">
                    {card.visible ? 'Shown' : 'Hidden'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Reset and Done */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#E5DDF2] dark:border-slate-800 bg-[#F8F5FD] dark:bg-[#0E1422] flex items-center justify-between">
          <button
            onClick={() => {
              onResetDefault();
              setLocalCards(DEFAULT_DASHBOARD_CARDS);
            }}
            className="text-xs text-[#625B72] hover:text-[#7C3AED] dark:hover:text-purple-400 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default Layout</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
