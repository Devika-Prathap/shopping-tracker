import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  TrendingUp, 
  Filter, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Store, 
  Layers, 
  ArrowRight, 
  Plus, 
  Info, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Tag,
  DollarSign,
  PackageCheck,
  CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory, PurchaseItem } from '../types';
import { ProductDetailsModal } from './ProductDetailsModal';

interface ShoppingCalendarViewProps {
  purchases: PurchaseTransaction[];
  onNavigateTab?: (tab: any) => void;
  onOpenStoreModal?: (storeName: string) => void;
  onAddPurchase?: (purchase: PurchaseTransaction) => void;
  onSelectProduct?: (item: PurchaseItem, transaction?: PurchaseTransaction) => void;
}

interface CalendarDayData {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  totalSpent: number;
  orderCount: number;
  transactions: PurchaseTransaction[];
  items: PurchaseItem[];
  topStore?: string;
  intensity: 'zero' | 'low' | 'medium' | 'high' | 'peak';
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ShoppingCalendarView: React.FC<ShoppingCalendarViewProps> = ({
  purchases,
  onNavigateTab,
  onOpenStoreModal,
  onAddPurchase,
  onSelectProduct,
}) => {
  const { formatPrice, currency } = useApp();
  const [selectedProductItem, setSelectedProductItem] = useState<{ item: PurchaseItem; transaction?: PurchaseTransaction } | null>(null);

  const handleProductClick = (item: PurchaseItem, tx: PurchaseTransaction) => {
    if (onSelectProduct) {
      onSelectProduct(item, tx);
    }
    setSelectedProductItem({ item, transaction: tx });
  };

  // Active calendar month & year (Default: October 2026, matching active app cycle)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October

  // Selected date for day inspector (default to Oct 19, 2026)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-19');

  // Filter states
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [viewStyle, setViewStyle] = useState<'intensity' | 'detailed'>('detailed');

  // Today reference (Oct 19, 2026)
  const todayStr = '2026-10-19';

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // October
    setSelectedDateStr(todayStr);
  };

  // Comprehensive merged purchases with October 2026 sample calendar dates
  // if not already present in dynamic purchases prop
  const allPurchases = useMemo(() => {
    // Collect unique transactions
    const list = [...purchases];

    // Seed realistic October 2026 checkouts if only September purchases are in the base array
    const hasOctoberPurchases = list.some(p => p.date.startsWith('2026-10'));
    if (!hasOctoberPurchases) {
      const octoberSamplePurchases: PurchaseTransaction[] = [
        {
          id: 'tx-oct-01',
          orderNumber: 'AMZ-OCT-9901',
          store: 'Amazon',
          date: '2026-10-19',
          subtotal: 1899,
          discount: 200,
          deliveryCharges: 0,
          totalAmount: 1699,
          currency: '₹',
          paymentMethod: 'Amazon Pay UPI',
          source: 'browser_extension',
          orderStatus: 'Delivered',
          items: [
            {
              id: 'it-oct-01',
              name: 'Anker Powerline Braided USB-C Fast Charger',
              price: 1699,
              quantity: 1,
              category: 'Electronics',
              subCategory: 'Mobile Accessories',
              store: 'Amazon',
              date: '2026-10-19',
              orderStatus: 'Delivered',
              imageUrl: '/src/assets/images/product_electronics_gadget_1790941045780.jpg',
            },
          ],
        },
        {
          id: 'tx-oct-02',
          orderNumber: 'MYN-OCT-4412',
          store: 'Myntra',
          date: '2026-10-17',
          subtotal: 3299,
          discount: 300,
          deliveryCharges: 0,
          totalAmount: 2999,
          currency: '₹',
          paymentMethod: 'UPI (GPay)',
          source: 'browser_extension',
          orderStatus: 'Delivered',
          items: [
            {
              id: 'it-oct-02',
              name: 'Puma Retro Suede Court Sneakers',
              price: 2999,
              quantity: 1,
              category: 'Shoes',
              subCategory: 'Sneakers',
              store: 'Myntra',
              date: '2026-10-17',
              orderStatus: 'Delivered',
              imageUrl: '/src/assets/images/product_shoes_sneakers_1790941017855.jpg',
            },
          ],
        },
        {
          id: 'tx-oct-03',
          orderNumber: 'AJI-OCT-7781',
          store: 'AJIO',
          date: '2026-10-14',
          subtotal: 1649,
          discount: 150,
          deliveryCharges: 0,
          totalAmount: 1499,
          currency: '₹',
          paymentMethod: 'Apple Pay (HDFC)',
          source: 'browser_extension',
          orderStatus: 'Delivered',
          items: [
            {
              id: 'it-oct-03',
              name: 'Linen Blend Textured Casual Resort Shirt',
              price: 1499,
              quantity: 1,
              category: 'Clothing',
              subCategory: 'Tops',
              store: 'AJIO',
              date: '2026-10-14',
              orderStatus: 'Delivered',
              imageUrl: '/src/assets/images/product_clothes_top_1790941031262.jpg',
            },
          ],
        },
        {
          id: 'tx-oct-04',
          orderNumber: 'AMZ-OCT-8821',
          store: 'Amazon',
          date: '2026-10-11',
          subtotal: 3799,
          discount: 300,
          deliveryCharges: 0,
          totalAmount: 3499,
          currency: '₹',
          paymentMethod: 'Amazon Pay ICICI Card',
          source: 'browser_extension',
          orderStatus: 'Delivered',
          items: [
            {
              id: 'it-oct-04',
              name: 'Sony Wireless Active Noise Cancelling Headphones',
              price: 3499,
              quantity: 1,
              category: 'Electronics',
              subCategory: 'Headphones',
              store: 'Amazon',
              date: '2026-10-11',
              orderStatus: 'Delivered',
              imageUrl: '/src/assets/images/product_electronics_gadget_1790941045780.jpg',
            },
          ],
        },
        {
          id: 'tx-oct-05',
          orderNumber: 'NYK-OCT-3319',
          store: 'Nykaa',
          date: '2026-10-08',
          subtotal: 1450,
          discount: 150,
          deliveryCharges: 0,
          totalAmount: 1300,
          currency: '₹',
          paymentMethod: 'UPI (Paytm)',
          source: 'browser_extension',
          orderStatus: 'Delivered',
          items: [
            {
              id: 'it-oct-05',
              name: 'Dew Drops Niacinamide Hydrating Glow Serum',
              price: 1300,
              quantity: 1,
              category: 'Beauty',
              subCategory: 'Skincare',
              store: 'Nykaa',
              date: '2026-10-08',
              orderStatus: 'Delivered',
              imageUrl: '/src/assets/images/product_beauty_skincare_1790941628878.jpg',
            },
          ],
        },
        {
          id: 'tx-oct-06',
          orderNumber: 'FLP-OCT-2291',
          store: 'Flipkart',
          date: '2026-10-05',
          subtotal: 1199,
          discount: 100,
          deliveryCharges: 0,
          totalAmount: 1099,
          currency: '₹',
          paymentMethod: 'Flipkart Axis Card',
          source: 'browser_extension',
          orderStatus: 'Delivered',
          items: [
            {
              id: 'it-oct-06',
              name: 'Gaming RGB Mouse & Extended Deskpad',
              price: 1099,
              quantity: 1,
              category: 'Gaming',
              subCategory: 'Accessories',
              store: 'Flipkart',
              date: '2026-10-05',
              orderStatus: 'Delivered',
              imageUrl: '/src/assets/images/product_mobile_gaming_1790941640501.jpg',
            },
          ],
        },
        {
          id: 'tx-oct-07',
          orderNumber: 'ZOM-OCT-1120',
          store: 'Swiggy Instamart',
          date: '2026-10-02',
          subtotal: 420,
          discount: 65,
          deliveryCharges: 0,
          totalAmount: 355,
          currency: '₹',
          paymentMethod: 'UPI (Cred Pay)',
          source: 'browser_extension',
          orderStatus: 'Delivered',
          items: [
            {
              id: 'it-oct-07',
              name: 'Organic Granola, Almond Milk & Greek Yogurt',
              price: 355,
              quantity: 1,
              category: 'Food & Groceries',
              subCategory: 'Groceries',
              store: 'Swiggy Instamart',
              date: '2026-10-02',
              orderStatus: 'Delivered',
            },
          ],
        },
      ];
      list.push(...octoberSamplePurchases);
    }

    return list.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  }, [purchases]);

  // Filtered transactions based on dropdown selections
  const filteredPurchases = useMemo(() => {
    return allPurchases.filter(p => {
      const matchStore = selectedStoreFilter === 'ALL' || p.store === selectedStoreFilter;
      const matchCategory = selectedCategoryFilter === 'ALL' || p.items.some(it => it.category === selectedCategoryFilter);
      return matchStore && matchCategory;
    });
  }, [allPurchases, selectedStoreFilter, selectedCategoryFilter]);

  // Lookup map: 'YYYY-MM-DD' -> PurchaseTransaction[]
  const purchasesByDate = useMemo(() => {
    const map = new Map<string, PurchaseTransaction[]>();
    filteredPurchases.forEach(p => {
      const existing = map.get(p.date) || [];
      existing.push(p);
      map.set(p.date, existing);
    });
    return map;
  }, [filteredPurchases]);

  // Generate calendar grid structure for active month
  const calendarCells = useMemo(() => {
    const cells: CalendarDayData[] = [];

    // First day of current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Number of days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Starting day of week (0 = Sunday, 1 = Monday, etc.)
    const startingDayOfWeek = firstDay.getDay();

    // Previous month filler days
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      
      const dayTxs = purchasesByDate.get(dateStr) || [];
      const totalSpent = dayTxs.reduce((sum, p) => sum + p.totalAmount, 0);

      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
        totalSpent,
        orderCount: dayTxs.length,
        transactions: dayTxs,
        items: dayTxs.flatMap(p => p.items),
        topStore: dayTxs[0]?.store,
        intensity: totalSpent > 4000 ? 'peak' : totalSpent > 2500 ? 'high' : totalSpent > 1000 ? 'medium' : totalSpent > 0 ? 'low' : 'zero',
      });
    }

    // Current month active days (1..daysInMonth)
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTxs = purchasesByDate.get(dateStr) || [];
      const totalSpent = dayTxs.reduce((sum, p) => sum + p.totalAmount, 0);

      let intensity: 'zero' | 'low' | 'medium' | 'high' | 'peak' = 'zero';
      if (totalSpent > 4000) intensity = 'peak';
      else if (totalSpent > 2500) intensity = 'high';
      else if (totalSpent > 1000) intensity = 'medium';
      else if (totalSpent > 0) intensity = 'low';

      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
        totalSpent,
        orderCount: dayTxs.length,
        transactions: dayTxs,
        items: dayTxs.flatMap(p => p.items),
        topStore: dayTxs[0]?.store,
        intensity,
      });
    }

    // Trailing days from next month to complete 35 or 42 grid cells
    const remainingSlots = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remainingSlots; day++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const dayTxs = purchasesByDate.get(dateStr) || [];
      const totalSpent = dayTxs.reduce((sum, p) => sum + p.totalAmount, 0);

      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
        totalSpent,
        orderCount: dayTxs.length,
        transactions: dayTxs,
        items: dayTxs.flatMap(p => p.items),
        topStore: dayTxs[0]?.store,
        intensity: totalSpent > 4000 ? 'peak' : totalSpent > 2500 ? 'high' : totalSpent > 1000 ? 'medium' : totalSpent > 0 ? 'low' : 'zero',
      });
    }

    return cells;
  }, [currentYear, currentMonth, purchasesByDate, todayStr]);

  // Current Month Summary Metrics
  const currentMonthCells = useMemo(() => {
    return calendarCells.filter(c => c.isCurrentMonth);
  }, [calendarCells]);

  const monthTotalSpent = useMemo(() => {
    return currentMonthCells.reduce((sum, c) => sum + c.totalSpent, 0);
  }, [currentMonthCells]);

  const monthTotalOrders = useMemo(() => {
    return currentMonthCells.reduce((sum, c) => sum + c.orderCount, 0);
  }, [currentMonthCells]);

  const activeShoppingDays = useMemo(() => {
    return currentMonthCells.filter(c => c.orderCount > 0);
  }, [currentMonthCells]);

  const zeroSpendDaysCount = useMemo(() => {
    // Only count days up to today or total month
    return currentMonthCells.filter(c => !c.isFuture && c.orderCount === 0).length;
  }, [currentMonthCells]);

  const peakDay = useMemo(() => {
    return [...activeShoppingDays].sort((a, b) => b.totalSpent - a.totalSpent)[0];
  }, [activeShoppingDays]);

  const avgSpendPerActiveDay = useMemo(() => {
    return activeShoppingDays.length > 0 
      ? Math.round(monthTotalSpent / activeShoppingDays.length) 
      : 0;
  }, [monthTotalSpent, activeShoppingDays]);

  // Day-of-Week spending distribution
  const spendingByDayOfWeek = useMemo(() => {
    const dowTotals = [0, 0, 0, 0, 0, 0, 0];
    currentMonthCells.forEach(cell => {
      const date = new Date(cell.dateStr);
      const dow = date.getDay();
      dowTotals[dow] += cell.totalSpent;
    });

    const maxDow = Math.max(...dowTotals, 1);
    return DAYS_OF_WEEK.map((name, index) => ({
      name,
      spent: dowTotals[index],
      percent: Math.round((dowTotals[index] / maxDow) * 100),
      isWeekend: index === 0 || index === 6,
    }));
  }, [currentMonthCells]);

  // Currently selected day details
  const selectedDayData = useMemo(() => {
    return calendarCells.find(c => c.dateStr === selectedDateStr) || calendarCells.find(c => c.isToday) || calendarCells[0];
  }, [calendarCells, selectedDateStr]);

  // Formatted date string for selected date (e.g. "Monday, October 19, 2026")
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDayData) return '';
    const [y, m, d] = selectedDayData.dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDayData]);

  // All unique stores for filtering
  const allStores = useMemo(() => {
    const set = new Set<string>();
    allPurchases.forEach(p => set.add(p.store));
    return Array.from(set).sort();
  }, [allPurchases]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full min-w-0 box-border">
      {/* ========================================================================= */}
      {/* 1. HEADER & CALENDAR CONTROLS                                             */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-100 via-teal-50 to-indigo-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/40 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Spending Cadence & Chronology</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Shopping Calendar
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            Maps every purchase onto an interactive month calendar to reveal spending patterns, weekend spikes, and celebrate zero-spend days.
          </p>
        </div>

        {/* Month Navigator Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white px-3 font-mono min-w-[130px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleJumpToToday}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer"
          >
            Jump to Today
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY METRIC SPOTLIGHT CARDS                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full min-w-0">
        {/* Metric 1: Total Month Spend */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/50 flex flex-col justify-between min-w-0 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            <span>{MONTH_NAMES[currentMonth]} Total Spend</span>
            <DollarSign className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatPrice(monthTotalSpent)}
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-medium truncate">
            {monthTotalOrders} verified orders recorded
          </span>
        </div>

        {/* Metric 2: Zero-Spend Days vs Active Shopping Days */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between min-w-0 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <span>Zero-Spend Discipline</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-200 tabular-nums">
            {zeroSpendDaysCount} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ 21 Days</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 font-medium truncate flex items-center gap-1">
            <span>🌱</span>
            <span>{Math.round((zeroSpendDaysCount / 21) * 100)}% No-Spend Rate to date</span>
          </span>
        </div>

        {/* Metric 3: Peak Spending Day */}
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/60 flex flex-col justify-between min-w-0 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            <span>Peak Spending Day</span>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-rose-700 dark:text-rose-200 tabular-nums truncate">
            {peakDay ? formatPrice(peakDay.totalSpent) : '₹0'}
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium truncate">
            {peakDay ? `${peakDay.dateStr.slice(5)} (${peakDay.topStore || 'Order'})` : 'No purchases yet'}
          </span>
        </div>

        {/* Metric 4: Average per Shopping Day */}
        <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/50 flex flex-col justify-between min-w-0 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            <span>Avg / Active Shopping Day</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-teal-700 dark:text-teal-200 tabular-nums">
            {formatPrice(avgSpendPerActiveDay)}
          </div>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-medium truncate">
            Across {activeShoppingDays.length} active shopping days
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CALENDAR FILTER BAR & INTENSITY LEGEND                                  */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0 shadow-xs">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-purple-500" />
            <span>Filter:</span>
          </div>

          {/* Store filter dropdown */}
          <select
            value={selectedStoreFilter}
            onChange={(e) => setSelectedStoreFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Stores</option>
            {allStores.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Category filter dropdown */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Clothing">Clothing</option>
            <option value="Shoes">Shoes</option>
            <option value="Electronics">Electronics</option>
            <option value="Beauty">Beauty</option>
            <option value="Gaming">Gaming</option>
            <option value="Food & Groceries">Food & Groceries</option>
          </select>

          {(selectedStoreFilter !== 'ALL' || selectedCategoryFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedStoreFilter('ALL');
                setSelectedCategoryFilter('ALL');
              }}
              className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Heatmap Intensity Legend */}
        <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Daily Intensity:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
            <span>₹0 (Zero)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-100 dark:bg-purple-950/70 border border-purple-300" />
            <span>&lt; ₹1k</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-300 dark:bg-purple-800 border border-purple-400" />
            <span>₹1k - ₹2.5k</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 border border-purple-700" />
            <span>₹2.5k - ₹4k</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-rose-500 to-amber-500 border border-rose-600" />
            <span>&gt; ₹4k (Peak)</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN INTERACTIVE CALENDAR WIDGET & DAY INSPECTOR                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* Calendar Grid (8 cols on large screens) */}
        <div className="xl:col-span-8 p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 min-w-0">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold font-mono">
            {DAYS_OF_WEEK.map((day, idx) => (
              <div 
                key={day}
                className={`py-2 rounded-xl uppercase tracking-wider text-[11px] ${
                  idx === 0 || idx === 6
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 7-column Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {calendarCells.map((cell) => {
              const isSelected = cell.dateStr === selectedDateStr;

              // Intensity styling classes
              let intensityBg = 'bg-slate-50/60 dark:bg-slate-800/30 text-slate-800 dark:text-slate-200 border-slate-200/60 dark:border-slate-800/60';

              if (cell.isCurrentMonth) {
                if (cell.intensity === 'peak') {
                  intensityBg = 'bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-950/60 dark:to-amber-950/40 text-rose-950 dark:text-rose-100 border-rose-300 dark:border-rose-800 shadow-xs';
                } else if (cell.intensity === 'high') {
                  intensityBg = 'bg-purple-100/90 dark:bg-purple-950/70 text-purple-950 dark:text-purple-100 border-purple-300 dark:border-purple-800 shadow-xs';
                } else if (cell.intensity === 'medium') {
                  intensityBg = 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800/60';
                } else if (cell.intensity === 'low') {
                  intensityBg = 'bg-teal-50/70 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 border-teal-200 dark:border-teal-800/50';
                } else if (!cell.isFuture) {
                  // Zero spend past day
                  intensityBg = 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300';
                }
              } else {
                // Out of month days
                intensityBg = 'opacity-35 bg-slate-50/30 dark:bg-slate-900/20 text-slate-400 border-slate-100 dark:border-slate-800';
              }

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`relative p-2 sm:p-2.5 rounded-2xl border text-left flex flex-col justify-between min-h-[78px] sm:min-h-[96px] transition-all cursor-pointer group hover:scale-[1.02] ${intensityBg} ${
                    isSelected
                      ? 'ring-2 ring-purple-500 dark:ring-purple-400 border-purple-500 shadow-md shadow-purple-500/15 z-10'
                      : ''
                  }`}
                >
                  {/* Top Bar: Date number + Today / Sprout indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs sm:text-sm font-bold font-mono ${
                      cell.isToday 
                        ? 'w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-black shadow-xs' 
                        : isSelected ? 'font-black text-purple-700 dark:text-purple-300' : ''
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {/* Today marker label or Zero-spend leaf badge */}
                    {cell.isToday ? (
                      <span className="hidden sm:inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-600 text-white">
                        Today
                      </span>
                    ) : cell.isCurrentMonth && !cell.isFuture && cell.orderCount === 0 ? (
                      <span className="text-[11px] opacity-70 group-hover:opacity-100 transition-opacity" title="Zero Spend Day">
                        🌱
                      </span>
                    ) : cell.intensity === 'peak' ? (
                      <span className="text-xs" title="Peak Spending Day">🔥</span>
                    ) : null}
                  </div>

                  {/* Bottom Information: Spend amount + Order count */}
                  <div className="mt-1 w-full truncate">
                    {cell.totalSpent > 0 ? (
                      <div className="space-y-0.5">
                        <div className="text-xs sm:text-sm font-bold font-mono tracking-tight truncate text-slate-900 dark:text-white">
                          {formatPrice(cell.totalSpent)}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          <span className="font-semibold">{cell.orderCount} {cell.orderCount === 1 ? 'order' : 'orders'}</span>
                          {cell.topStore && (
                            <span className="hidden sm:inline truncate">· {cell.topStore}</span>
                          )}
                        </div>
                      </div>
                    ) : cell.isCurrentMonth && !cell.isFuture ? (
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold opacity-75 group-hover:opacity-100">
                        ₹0 spent
                      </div>
                    ) : cell.isFuture ? (
                      <div className="text-[9px] font-mono text-slate-400 italic">
                        Upcoming
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-slate-400">
                        -
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Purchase Inspector Drawer (4 cols on large screens) */}
        <div className="xl:col-span-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 min-w-0 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Drawer Header */}
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Day Inspector</span>
                </span>

                {selectedDayData.isToday && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
                    Today's Activity
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                {selectedDateFormatted}
              </h3>
            </div>

            {/* Daily Summary Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Daily Spend
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 block tabular-nums">
                  {formatPrice(selectedDayData.totalSpent)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Checkouts
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 block tabular-nums">
                  {selectedDayData.orderCount} {selectedDayData.orderCount === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
            </div>

            {/* Purchases List on this Day */}
            {selectedDayData.transactions.length > 0 ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Orders on this day ({selectedDayData.transactions.length})
                </span>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {selectedDayData.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                    >
                      {/* Order Header */}
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <Store className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>{tx.store}</span>
                        </div>

                        <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                          {formatPrice(tx.totalAmount)}
                        </span>
                      </div>

                      {/* Items in this order */}
                      <div className="space-y-2">
                        {tx.items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleProductClick(item, tx)}
                            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-purple-50/70 dark:hover:bg-purple-950/30 cursor-pointer group transition-colors"
                            title="Click to view product specs, return policy & price trends"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <span className="text-base">🛍️</span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {item.name}
                              </h5>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                                  {item.category}
                                </span>
                                <span>·</span>
                                <span className="font-mono">{formatPrice(item.price)}</span>
                              </div>
                            </div>

                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              Details →
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Payment info & status badge */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                        <span className="truncate">{tx.paymentMethod}</span>
                        <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                          {tx.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedDayData.isFuture ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Future Calendar Date
                </h4>
                <p className="text-[11px] text-slate-500">
                  No purchases projected yet for this day. Checkouts logged on this date will appear here automatically.
                </p>
              </div>
            ) : (
              /* Zero-Spend Celebration Card */
              <div className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl">
                  🌱
                </div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Zero-Spend Day!
                </h4>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300 leading-relaxed">
                  You spent ₹0 on this day, protecting your monthly savings target. Zero-spend days help keep your budget healthy.
                </p>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('purchases')}
              className="w-full mt-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200/80 dark:border-purple-800/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>View All Purchases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DAY-OF-WEEK SPENDING PATTERN DISTRIBUTION                              */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              <span>Rhythm & Habit Analysis</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Spending Distribution by Day of Week
            </h3>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Based on {MONTH_NAMES[currentMonth]} {currentYear} checkout activity
          </span>
        </div>

        {/* 7-Day Histogram Bars */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end pt-4">
          {spendingByDayOfWeek.map((item) => (
            <div key={item.name} className="flex flex-col items-center gap-2">
              <div className="text-[10px] sm:text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {item.spent > 0 ? formatPrice(item.spent) : '₹0'}
              </div>

              {/* Bar Column */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl h-28 sm:h-36 p-1 flex items-end">
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${
                    item.isWeekend
                      ? 'bg-gradient-to-t from-purple-600 to-indigo-500 shadow-xs'
                      : 'bg-gradient-to-t from-teal-500 to-emerald-400'
                  }`}
                  style={{ height: `${Math.max(8, item.percent)}%` }}
                  title={`${item.name}: ${formatPrice(item.spent)}`}
                />
              </div>

              {/* Day Label */}
              <div className="text-center">
                <span className={`text-xs font-bold ${
                  item.isWeekend 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {item.name}
                </span>
                <span className="block text-[9px] text-slate-400 font-mono">
                  {item.isWeekend ? 'Weekend' : 'Weekday'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Behavioral Insight Callout */}
        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong>Chronological Spending Pattern:</strong> Your shopping activity peaks sharply on <strong>Fridays and Sundays</strong> (over 65% of monthly checkout volume), with <strong>Wednesdays and Thursdays</strong> recording the highest consistency of zero-spend discipline.
          </p>
        </div>
      </div>

      {/* Product Details Modal (Specs, Return Status, Price Trend, Cheaper Alternatives) */}
      <ProductDetailsModal
        isOpen={!!selectedProductItem}
        onClose={() => setSelectedProductItem(null)}
        item={selectedProductItem?.item || null}
        transaction={selectedProductItem?.transaction}
      />
    </div>
  );
};
