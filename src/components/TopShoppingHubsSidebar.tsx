import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  TrendingUp, 
  Store, 
  Clock, 
  Compass, 
  Sparkles, 
  Search, 
  ChevronRight, 
  Zap, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  Package, 
  X,
  Flame,
  Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction } from '../types';
import { 
  GEOGRAPHIC_HUBS, 
  aggregateGeographicMetrics, 
  HubDetailedMetric 
} from '../data/geographicHubs';

interface TopShoppingHubsSidebarProps {
  purchases: PurchaseTransaction[];
  selectedHubId: string | null;
  onSelectHub: (hubId: string | null) => void;
  filterStore?: string;
  filterCategory?: string;
}

export const TopShoppingHubsSidebar: React.FC<TopShoppingHubsSidebarProps> = ({
  purchases,
  selectedHubId,
  onSelectHub,
  filterStore = 'ALL',
  filterCategory = 'ALL',
}) => {
  const { formatPrice } = useApp();
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'spend' | 'orders' | 'speed'>('spend');

  // Compute metrics
  const { hubs, totalRegionalSpend, totalOrdersCount, maxHubSpend, topHub, fastestHub } = useMemo(() => {
    return aggregateGeographicMetrics(purchases, filterStore, filterCategory, 'ALL');
  }, [purchases, filterStore, filterCategory]);

  // Filter and sort hubs
  const displayedHubs = useMemo(() => {
    let list = [...hubs];

    if (regionFilter !== 'ALL') {
      list = list.filter(h => h.hub.region === regionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        h =>
          h.hub.name.toLowerCase().includes(q) ||
          h.hub.stateOrArea.toLowerCase().includes(q) ||
          h.stores.some(s => s.toLowerCase().includes(q)) ||
          h.hub.region.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'spend') {
      list.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (sortBy === 'orders') {
      list.sort((a, b) => b.orderCount - a.orderCount);
    } else if (sortBy === 'speed') {
      list.sort((a, b) => a.hub.avgDeliveryHours - b.hub.avgDeliveryHours);
    }

    return list;
  }, [hubs, regionFilter, searchQuery, sortBy]);

  const activeHubMetric = selectedHubId ? hubs.find(h => h.hub.id === selectedHubId) : null;

  // Heat intensity badge helper
  const getIntensityBadge = (ratio: number) => {
    if (ratio >= 0.75) {
      return {
        label: 'Very High',
        bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        bar: 'bg-gradient-to-r from-rose-500 to-red-500',
      };
    }
    if (ratio >= 0.45) {
      return {
        label: 'High',
        bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
      };
    }
    if (ratio >= 0.20) {
      return {
        label: 'Moderate',
        bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      };
    }
    return {
      label: 'Low',
      bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
      bar: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    };
  };

  return (
    <aside className="w-full flex flex-col space-y-4">
      {/* Sidebar Top Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Header with Title & Badge */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
              <Compass className="w-3.5 h-3.5 text-purple-500" />
              <span>Geographical Intelligence</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Top Shopping Hubs
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {displayedHubs.length} Hubs
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Fulfillment nodes and regional commerce clusters extracted from your order receipts.
            </p>
          </div>

          <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Regional Total</span>
            <div className="text-base font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-0.5">
              {formatPrice(totalRegionalSpend)}
            </div>
            <span className="text-[9px] text-slate-400 font-mono">100% Sourced</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Fastest Corridor</span>
            <div className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              ~{fastestHub.avgDeliveryHours}h
            </div>
            <span className="text-[9px] text-slate-400 font-mono truncate block">
              {fastestHub.name.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hubs, cities, stores..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Regional Pills & Sort */}
          <div className="flex items-center justify-between gap-1 flex-wrap pt-1 text-[11px]">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {(['ALL', 'South', 'West', 'North', 'East'] as const).map(reg => (
                <button
                  key={reg}
                  onClick={() => setRegionFilter(reg)}
                  className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-[10px] ${
                    regionFilter === reg
                      ? 'bg-purple-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {reg === 'ALL' ? 'All Regions' : reg}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 py-0.5 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="spend">Sort: Spend</option>
              <option value="orders">Sort: Orders</option>
              <option value="speed">Sort: Delivery Speed</option>
            </select>
          </div>
        </div>

        {/* Selected Hub Deep Inspection (if active) */}
        {activeHubMetric && (
          <div className="p-4 rounded-2xl bg-purple-50/90 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 shadow-xs space-y-3 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  Inspecting Hub on Heat Map
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {activeHubMetric.hub.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {activeHubMetric.hub.stateOrArea}
                </p>
              </div>

              <button
                onClick={() => onSelectHub(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer shrink-0"
                title="Deselect Hub"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="p-1.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-slate-400">Total Spent</div>
                <div className="font-extrabold font-mono text-purple-600 dark:text-purple-400 text-xs">
                  {formatPrice(activeHubMetric.totalSpent)}
                </div>
              </div>
              <div className="p-1.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-slate-400">Orders</div>
                <div className="font-extrabold font-mono text-slate-900 dark:text-white text-xs">
                  {activeHubMetric.orderCount}
                </div>
              </div>
              <div className="p-1.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-slate-400">Transit</div>
                <div className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                  ~{activeHubMetric.hub.avgDeliveryHours}h
                </div>
              </div>
            </div>

            {/* Recent Orders Sourced From This Hub */}
            {activeHubMetric.transactions.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-purple-200/70 dark:border-purple-800/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Extracted Orders from this Hub:
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {activeHubMetric.transactions.map(tx => (
                    <div
                      key={tx.id}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {tx.items[0]?.name || tx.orderNumber}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {tx.store} · {tx.date}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400 shrink-0">
                        {formatPrice(tx.totalAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Shopping Hubs List */}
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {displayedHubs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No shopping hubs found matching "{searchQuery}".
            </div>
          ) : (
            displayedHubs.map((metric, idx) => {
              const isSelected = selectedHubId === metric.hub.id;
              const intensity = getIntensityBadge(metric.intensityRatio);

              return (
                <div
                  key={metric.hub.id}
                  onClick={() => onSelectHub(isSelected ? null : metric.hub.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 dark:border-purple-600 shadow-sm ring-2 ring-purple-400/30'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/60 hover:bg-white dark:hover:bg-slate-800/70'
                  }`}
                >
                  {/* Card Header: Rank, Name, and Sourced Spend */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-mono font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300'
                            : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {metric.hub.name}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {metric.hub.stateOrArea}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(metric.totalSpent)}
                      </div>
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                        {metric.percentageOfTotal}% share
                      </span>
                    </div>
                  </div>

                  {/* Intensity Progress Bar */}
                  <div className="mt-2.5 w-full bg-slate-200/70 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${intensity.bar}`}
                      style={{ width: `${Math.max(4, Math.round(metric.intensityRatio * 100))}%` }}
                    />
                  </div>

                  {/* Hub Micro Badges */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 text-[10px] flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded font-mono font-bold border text-[9px] ${intensity.bg}`}>
                        {intensity.label} Intensity
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[9px] flex items-center gap-1">
                        <Truck className="w-2.5 h-2.5" />
                        ~{metric.hub.avgDeliveryHours}h
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold">
                      {metric.orderCount} {metric.orderCount === 1 ? 'order' : 'orders'}
                    </div>
                  </div>

                  {/* Stores and Top Category */}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate max-w-[170px]">
                      Stores: <strong className="text-slate-700 dark:text-slate-300">{metric.stores.join(', ') || metric.hub.associatedStores.slice(0, 2).join(', ')}</strong>
                    </span>
                    <span className="font-medium text-purple-600 dark:text-purple-400 shrink-0">
                      {metric.topCategory.name} ({metric.topCategory.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Macro Observation Card */}
      <div className="p-4 rounded-3xl pastel-card-purple border shadow-xs space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fulfillment Observation</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {topHub && topHub.totalSpent > 0 ? (
            <>
              Your highest-density spending hub is <strong>{topHub.hub.name}</strong>, accounting for <strong>{topHub.percentageOfTotal}%</strong> of physical checkouts, predominantly delivering <strong>{topHub.topCategory.name}</strong>.
            </>
          ) : (
            'Fulfillment hubs are extracted directly from invoice dispatch coordinates and order origins.'
          )}
        </p>
      </div>
    </aside>
  );
};
