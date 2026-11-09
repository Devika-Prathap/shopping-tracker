import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  SlidersHorizontal, 
  Tag, 
  RotateCcw, 
  Calendar, 
  Download, 
  Settings, 
  Bookmark, 
  Wallet, 
  RefreshCw, 
  Clock, 
  Store, 
  Layers, 
  TrendingUp, 
  ShoppingBag, 
  Award, 
  Brain, 
  Pin, 
  Eye, 
  EyeOff, 
  GripVertical,
  Check,
  Search,
  ExternalLink,
  HelpCircle,
  Trophy,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from './Navigation';
import { PurchaseTransaction } from '../types';
import { ShoppingPersonalityCard } from './ShoppingPersonalityCard';

export interface MoreFeatureItem {
  id: NavTab;
  title: string;
  category: 'Savings & Deals' | 'Planning & Budgets' | 'Orders & History' | 'System & Reports' | 'Privacy & Security';
  description: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  isPinned?: boolean;
  isHidden?: boolean;
}

interface MoreHubViewProps {
  onNavigateTab: (tab: NavTab) => void;
  purchases: PurchaseTransaction[];
  savingsCount: number;
  priceDropCount: number;
  onOpenMonthlySummary?: () => void;
  activeFeatureTab?: NavTab;
}

export const MoreHubView: React.FC<MoreHubViewProps> = ({
  onNavigateTab,
  purchases,
  savingsCount,
  priceDropCount,
  onOpenMonthlySummary,
}) => {
  const { formatPrice } = useApp();

  // Load custom preferences for More section (pinning, ordering, hiding)
  const [featureConfig, setFeatureConfig] = useState<Record<string, { isPinned?: boolean; isHidden?: boolean; order?: number }>>(() => {
    try {
      const saved = localStorage.getItem('trackshop_more_config_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isCustomizing, setIsCustomizing] = useState(false);

  // All 13 comprehensive features inside More section
  const baseFeatures: Omit<MoreFeatureItem, 'isPinned' | 'isHidden'>[] = [
    {
      id: 'private_shopping',
      title: 'Private Shopping',
      category: 'Privacy & Security',
      description: 'PIN-protected vault for personal purchases, discreet aliases, hidden amounts, and isolated spending analytics.',
      icon: <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      badge: 'Protected',
      badgeColor: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    },
    {
      id: 'price_drops',
      title: 'Price History',
      category: 'Savings & Deals',
      description: 'View historical price charts and track items that dropped in price after you purchased them.',
      icon: <Tag className="w-5 h-5 text-indigo-500" />,
      badge: priceDropCount > 0 ? `${priceDropCount} Drops` : undefined,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300',
    },
    {
      id: 'save_more',
      title: 'Save More',
      category: 'Savings & Deals',
      description: 'Discover cheaper alternatives, similar products, and store price comparisons to lower spending.',
      icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
      badge: savingsCount > 0 ? `${savingsCount} Deals` : undefined,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'smart_shopping',
      title: 'Smart Shopping & Impulse Control',
      category: 'Savings & Deals',
      description: '“Do I Really Need This?” mindfulness tester, inventory of similar owned items, and Smart Cart waitlist.',
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      badge: 'Smart Cart',
      badgeColor: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'wishlist',
      title: 'Wishlist & Price Tracking',
      category: 'Savings & Deals',
      description: 'Saved products, real-time price monitoring, active discounts, and restock notifications.',
      icon: <Bookmark className="w-5 h-5 text-rose-500" />,
    },
    {
      id: 'budgets',
      title: 'Budgets & Goals',
      category: 'Planning & Budgets',
      description: 'Set monthly limits, category thresholds, saving goals, and 25% single-purchase velocity safeguards.',
      icon: <Wallet className="w-5 h-5 text-teal-500" />,
    },
    {
      id: 'challenges',
      title: 'Saving Challenges',
      category: 'Planning & Budgets',
      description: 'Participate in monthly shopping challenges like No-Spend Week, 30-Day Delay, and Category Caps.',
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
      badge: '3 Active',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'recurring',
      title: 'Subscriptions & Recurring',
      category: 'Planning & Budgets',
      description: 'Track recurring payments, renewal reminders, streaming services, and annual financial cost commitments.',
      icon: <RefreshCw className="w-5 h-5 text-cyan-500" />,
    },
    {
      id: 'calendar',
      title: 'Shopping Calendar',
      category: 'Orders & History',
      description: 'Interactive monthly calendar mapping checkout dates, daily spending intensity, weekend vs weekday patterns, and zero-spend streaks.',
      icon: <Calendar className="w-5 h-5 text-emerald-500" />,
      badge: 'Interactive',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'returns_refunds',
      title: 'Returns & Refunds',
      category: 'Orders & History',
      description: 'Track returned products, in-flight courier pickups, cancelled orders, and bank refunds.',
      icon: <RotateCcw className="w-5 h-5 text-amber-500" />,
      badge: 'Active Hub',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'export_reports',
      title: 'Export Data & Monthly Reports',
      category: 'System & Reports',
      description: 'Export purchases and analytics as CSV (Excel), JSON raw data, or printable PDF summaries.',
      icon: <Download className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 'shopping_personality',
      title: 'Shopping Personality & Badges',
      category: 'System & Reports',
      description: 'Deep-dive into your shopping style, top spending habits, Deal Hunter vs Tech Explorer badges.',
      icon: <Award className="w-5 h-5 text-pink-500" />,
      badge: 'AI Persona',
      badgeColor: 'bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300',
    },
    {
      id: 'settings',
      title: 'Settings & Privacy Controls',
      category: 'System & Reports',
      description: 'Connected accounts, email receipt ingestion, demo data management, currency switcher, and themes.',
      icon: <Settings className="w-5 h-5 text-slate-500" />,
    },
  ];

  // Merge with custom configuration
  const items: MoreFeatureItem[] = useMemo(() => {
    return baseFeatures.map((f) => {
      const cfg = featureConfig[f.id] || {};
      return {
        ...f,
        isPinned: cfg.isPinned || false,
        isHidden: cfg.isHidden || false,
      };
    });
  }, [featureConfig]);

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFeatureConfig(prev => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          isPinned: !prev[id]?.isPinned,
        }
      };
      localStorage.setItem('trackshop_more_config_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleHide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFeatureConfig(prev => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          isHidden: !prev[id]?.isHidden,
        }
      };
      localStorage.setItem('trackshop_more_config_v1', JSON.stringify(updated));
      return updated;
    });
  };

  // Filtered lists
  const visibleItems = items.filter(i => {
    if (!isCustomizing && i.isHidden) return false;
    const matchSearch = i.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
                        i.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchCat = activeCategory === 'all' || i.category === activeCategory;
    return matchSearch && matchCat;
  });

  const pinnedItems = visibleItems.filter(i => i.isPinned);
  const otherItems = visibleItems.filter(i => !i.isPinned);

  const categories = ['all', 'Savings & Deals', 'Planning & Budgets', 'Orders & History', 'Privacy & Security', 'System & Reports'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-7xl min-w-0 box-border mx-auto">
      {/* Hero Header */}
      <div className="p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-amber-950/20 border border-purple-200/80 dark:border-purple-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 min-w-0">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mb-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            More Features & Tools
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Advanced Shopping Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            All secondary intelligence tools, price monitors, and fiscal configurations kept outside the primary dashboard for clutter-free tracking. Customize and pin your favorites below.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              isCustomizing
                ? 'bg-purple-600 text-white shadow-purple-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{isCustomizing ? 'Done Customizing' : 'Customize Hub'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Features' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tools & reports..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Customization Note Banner */}
      {isCustomizing && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>
              <strong>Personalization Mode Active:</strong> Click the pin icon to keep frequent tools at the top, or the eye icon to hide tools you don't use.
            </span>
          </div>
          <button
            onClick={() => setIsCustomizing(false)}
            className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-[11px] cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* Pinned Features Section (if any) */}
      {pinnedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Pin className="w-3.5 h-3.5" />
            <span>Pinned Quick Access ({pinnedItems.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className={`group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800/80 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  item.isHidden ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center">
                      {item.icon}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Pin button */}
                      <button
                        onClick={(e) => togglePin(item.id, e)}
                        title="Unpin"
                        className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-lg cursor-pointer"
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {isCustomizing && (
                        <button
                          onClick={(e) => toggleHide(item.id, e)}
                          title={item.isHidden ? "Unhide" : "Hide"}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                          {item.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid of Features */}
      <div className="space-y-3">
        {pinnedItems.length > 0 && (
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>All Features ({otherItems.length})</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateTab(item.id)}
              className={`group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative ${
                item.isHidden ? 'opacity-50 border-dashed' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {item.icon}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}

                    <button
                      onClick={(e) => togglePin(item.id, e)}
                      title="Pin to top"
                      className="p-1 text-slate-400 hover:text-purple-600 rounded-lg cursor-pointer transition-colors"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {isCustomizing && (
                      <button
                        onClick={(e) => toggleHide(item.id, e)}
                        title={item.isHidden ? "Unhide" : "Hide"}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      >
                        {item.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  {item.category}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                <span>Explore</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
