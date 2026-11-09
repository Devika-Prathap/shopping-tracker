import { 
  ShoppingBag, 
  Clock, 
  Store,
  TrendingUp, 
  Sparkles, 
  SlidersHorizontal 
} from 'lucide-react';
import { NavTab } from './Navigation';

interface MobileBottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  savingsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  savingsCount,
}) => {
  // Mobile Bottom Navigation Bar matching 6-section hierarchy:
  // Dashboard | Purchases | Stores | Analytics | Save More | More
  const mobileTabs: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    isActive: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <ShoppingBag className="w-4 h-4" />,
      isActive: activeTab === 'dashboard',
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: <Clock className="w-4 h-4" />,
      isActive: activeTab === 'purchases',
    },
    {
      id: 'stores',
      label: 'Stores',
      icon: <Store className="w-4 h-4" />,
      isActive: activeTab === 'stores',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp className="w-4 h-4" />,
      isActive: activeTab === 'analytics',
    },
    {
      id: 'save_more',
      label: 'Save More',
      icon: <Sparkles className="w-4 h-4" />,
      badge: savingsCount > 0 ? savingsCount : undefined,
      isActive: activeTab === 'save_more',
    },
    {
      id: 'more',
      label: 'More',
      icon: <SlidersHorizontal className="w-4 h-4" />,
      isActive: [
        'more',
        'calendar',
        'price_drops',
        'smart_shopping',
        'wishlist',
        'budgets',
        'challenges',
        'recurring',
        'returns_refunds',
        'export_reports',
        'shopping_personality',
        'settings',
        'categories'
      ].includes(activeTab),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#FFF9F2]/95 dark:bg-[#0c0f17]/95 backdrop-blur-lg border-t border-[#E5DDF2] dark:border-slate-800/80 px-2 py-1.5 shadow-lg shadow-purple-900/5">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer relative min-w-[50px] ${
              tab.isActive
                ? 'text-[#7C3AED] dark:text-purple-400 font-bold bg-[#F3EEFF] dark:bg-purple-950/50 shadow-2xs'
                : 'text-[#625B72] dark:text-slate-400 hover:text-[#29243A] dark:hover:text-slate-200 font-semibold'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge ? (
                <span className="absolute -top-1 -right-2 bg-[#16A085] text-white text-[9px] font-bold px-1 rounded-full ring-2 ring-[#FFF9F2] dark:ring-slate-900">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
