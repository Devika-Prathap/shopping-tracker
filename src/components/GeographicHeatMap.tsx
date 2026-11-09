import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Layers, 
  Flame, 
  Store, 
  SlidersHorizontal, 
  TrendingUp, 
  Sparkles, 
  ShoppingBag, 
  X, 
  ChevronRight, 
  Info, 
  ArrowUpRight, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory } from '../types';
import { GEOGRAPHIC_HUBS, extractFulfillmentData } from '../data/geographicHubs';

interface GeographicHeatMapProps {
  purchases: PurchaseTransaction[];
  selectedHubId?: string | null;
  onSelectHub?: (hubId: string | null) => void;
  filterStore?: string;
  onFilterStoreChange?: (store: string) => void;
  filterCategory?: string;
  onFilterCategoryChange?: (category: string) => void;
  showInternalSidebar?: boolean;
}

export const GeographicHeatMap: React.FC<GeographicHeatMapProps> = ({ 
  purchases,
  selectedHubId: propSelectedHubId,
  onSelectHub,
  filterStore: propFilterStore,
  onFilterStoreChange,
  filterCategory: propFilterCategory,
  onFilterCategoryChange,
  showInternalSidebar = false,
}) => {
  const { formatPrice } = useApp();

  const [internalSelectedHubId, setInternalSelectedHubId] = useState<string | null>(null);
  const activeSelectedHubId = propSelectedHubId !== undefined ? propSelectedHubId : internalSelectedHubId;
  const handleSelectHub = (id: string | null) => {
    if (onSelectHub) {
      onSelectHub(id);
    } else {
      setInternalSelectedHubId(id);
    }
  };

  const [hoveredHubId, setHoveredHubId] = useState<string | null>(null);
  const [internalFilterStore, setInternalFilterStore] = useState<string>('ALL');
  const activeFilterStore = propFilterStore !== undefined ? propFilterStore : internalFilterStore;
  const handleFilterStore = (st: string) => {
    if (onFilterStoreChange) {
      onFilterStoreChange(st);
    } else {
      setInternalFilterStore(st);
    }
  };

  const [internalFilterCategory, setInternalFilterCategory] = useState<string>('ALL');
  const activeFilterCategory = propFilterCategory !== undefined ? propFilterCategory : internalFilterCategory;
  const handleFilterCategory = (cat: string) => {
    if (onFilterCategoryChange) {
      onFilterCategoryChange(cat);
    } else {
      setInternalFilterCategory(cat);
    }
  };

  const [heatVisualizationMode, setHeatVisualizationMode] = useState<'gradient' | 'nodes' | 'hybrid'>('hybrid');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');

  // Available filter options
  const uniqueStores = useMemo(() => {
    return Array.from(new Set(delivered.map(p => p.store)));
  }, [delivered]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(delivered.flatMap(p => p.items.map(i => i.category))));
  }, [delivered]);

  // Aggregate spending by geographic hub
  const hubMetrics = useMemo(() => {
    const metrics: Record<
      string,
      {
        totalSpent: number;
        orderCount: number;
        itemCount: number;
        stores: Set<string>;
        categories: Record<string, number>;
        transactions: PurchaseTransaction[];
      }
    > = {};

    GEOGRAPHIC_HUBS.forEach(h => {
      metrics[h.id] = {
        totalSpent: 0,
        orderCount: 0,
        itemCount: 0,
        stores: new Set(),
        categories: {},
        transactions: [],
      };
    });

    delivered.forEach((tx, txIndex) => {
      if (activeFilterStore !== 'ALL' && tx.store !== activeFilterStore) return;

      const matchingItems = activeFilterCategory === 'ALL' 
        ? tx.items 
        : tx.items.filter(i => i.category === activeFilterCategory);

      if (matchingItems.length === 0) return;

      const itemsTotal = matchingItems.reduce((sum, it) => sum + (it.price * (it.quantity || 1)), 0);
      const origin = extractFulfillmentData(tx, txIndex);
      const targetHubId = origin.hubId || 'hub-blr';

      if (metrics[targetHubId]) {
        metrics[targetHubId].totalSpent += itemsTotal;
        metrics[targetHubId].orderCount += 1;
        metrics[targetHubId].itemCount += matchingItems.length;
        metrics[targetHubId].stores.add(tx.store);
        metrics[targetHubId].transactions.push(tx);

        matchingItems.forEach(it => {
          metrics[targetHubId].categories[it.category] = 
            (metrics[targetHubId].categories[it.category] || 0) + (it.price * (it.quantity || 1));
        });
      }
    });

    return metrics;
  }, [delivered, activeFilterStore, activeFilterCategory]);

  const maxHubSpend = useMemo(() => {
    return Math.max(1, ...Object.values(hubMetrics).map(m => m.totalSpent));
  }, [hubMetrics]);

  const totalFilteredSpent = useMemo(() => {
    return Object.values(hubMetrics).reduce((sum, m) => sum + m.totalSpent, 0);
  }, [hubMetrics]);

  // Active selected hub details
  const activeHub = activeSelectedHubId ? GEOGRAPHIC_HUBS.find(h => h.id === activeSelectedHubId) : null;
  const activeHubMetric = activeHub ? hubMetrics[activeHub.id] : null;

  // Sorted hubs by spending intensity
  const sortedHubs = useMemo(() => {
    return [...GEOGRAPHIC_HUBS].sort((a, b) => {
      return (hubMetrics[b.id]?.totalSpent || 0) - (hubMetrics[a.id]?.totalSpent || 0);
    });
  }, [hubMetrics]);

  // Color helper based on intensity ratio (0.0 to 1.0)
  const getHeatIntensityStyle = (ratio: number) => {
    if (ratio >= 0.75) {
      return {
        level: 'Very High',
        fill: '#f43f5e', // Rose-500
        stroke: '#be123c',
        glow: 'rgba(244, 63, 94, 0.65)',
        badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        textColor: 'text-rose-600 dark:text-rose-400',
        radius: 46,
      };
    }
    if (ratio >= 0.45) {
      return {
        level: 'High',
        fill: '#f59e0b', // Amber-500
        stroke: '#b45309',
        glow: 'rgba(245, 158, 11, 0.55)',
        badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        textColor: 'text-amber-600 dark:text-amber-400',
        radius: 36,
      };
    }
    if (ratio >= 0.20) {
      return {
        level: 'Moderate',
        fill: '#10b981', // Emerald-500
        stroke: '#047857',
        glow: 'rgba(16, 185, 129, 0.45)',
        badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        radius: 28,
      };
    }
    return {
      level: 'Low',
      fill: '#6366f1', // Indigo-500
      stroke: '#4338ca',
      glow: 'rgba(99, 102, 241, 0.35)',
      badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      radius: 22,
    };
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-fadeIn w-full max-w-full min-w-0 box-border overflow-hidden">
      {/* Heatmap Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 min-w-0">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>Interactive Geographical Heat Map</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Spending Intensity by Store Locations & Regions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
            Live thermal visualization indicating geographic origin, dispatch centers, and regional commerce density.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Store Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Store:
            </span>
            <select
              value={activeFilterStore}
              onChange={e => handleFilterStore(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="dark:bg-slate-900">All Stores</option>
              {uniqueStores.map(st => (
                <option key={st} value={st} className="dark:bg-slate-900">{st}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Category:
            </span>
            <select
              value={activeFilterCategory}
              onChange={e => handleFilterCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="dark:bg-slate-900">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setHeatVisualizationMode('hybrid')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                heatVisualizationMode === 'hybrid'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setHeatVisualizationMode('gradient')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                heatVisualizationMode === 'gradient'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Thermal Heat
            </button>
            <button
              onClick={() => setHeatVisualizationMode('nodes')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                heatVisualizationMode === 'nodes'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Store Pins
            </button>
          </div>
        </div>
      </div>

      {/* Main Heatmap Canvas Area */}
      <div className={showInternalSidebar ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "w-full"}>
        {/* Interactive SVG Map Canvas */}
        <div className={`${showInternalSidebar ? 'lg:col-span-8' : 'w-full'} bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl flex flex-col`}>
          {/* Top Bar inside Map Canvas */}
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between text-xs z-20">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[11px] font-semibold">
                National Fulfillment Logistics & Dispatch Network
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[11px] font-mono">
                Active Nodes: <strong className="text-white">{GEOGRAPHIC_HUBS.length}</strong>
              </span>
              <div className="h-3 w-[1px] bg-slate-700" />
              <button 
                onClick={() => setZoomLevel(prev => (prev === 1 ? 1.3 : 1))}
                className="hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                title="Toggle Zoom View"
              >
                {zoomLevel === 1 ? <ZoomIn className="w-3.5 h-3.5" /> : <ZoomOut className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={() => { handleSelectHub(null); setZoomLevel(1); }}
                className="hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Map Projection Viewport */}
          <div className="relative w-full h-[420px] sm:h-[490px] bg-radial from-[#131a29] via-[#0b0f19] to-[#06080e] overflow-hidden select-none">
            {/* Ambient Background Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* SVG Primary Viewport */}
            <svg
              viewBox="0 0 800 520"
              className="w-full h-full transition-transform duration-500 ease-out cursor-crosshair"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: activeSelectedHubId 
                  ? `${(GEOGRAPHIC_HUBS.find(h => h.id === activeSelectedHubId)?.x || 400) / 8}% ${(GEOGRAPHIC_HUBS.find(h => h.id === activeSelectedHubId)?.y || 260) / 5.2}%`
                  : 'center center',
              }}
            >
              <defs>
                {/* Continuous Thermal Blur Filter */}
                <filter id="thermalGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="34" result="blur1" />
                  <feGaussianBlur stdDeviation="18" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Individual Radial Gradients per Hub */}
                {GEOGRAPHIC_HUBS.map(hub => {
                  const metric = hubMetrics[hub.id];
                  const ratio = metric ? metric.totalSpent / maxHubSpend : 0;
                  const config = getHeatIntensityStyle(ratio);
                  return (
                    <radialGradient
                      key={`grad-${hub.id}`}
                      id={`heat-${hub.id}`}
                      cx="50%"
                      cy="50%"
                      r="50%"
                    >
                      <stop offset="0%" stopColor={config.fill} stopOpacity={0.88} />
                      <stop offset="35%" stopColor={config.fill} stopOpacity={0.48} />
                      <stop offset="70%" stopColor={config.fill} stopOpacity={0.16} />
                      <stop offset="100%" stopColor={config.fill} stopOpacity={0} />
                    </radialGradient>
                  );
                })}
              </defs>

              {/* Stylized Geographic Regional Contours */}
              <g className="opacity-30 pointer-events-none stroke-purple-400/40 fill-none" strokeWidth="1.2">
                <path
                  d="M 280 60 
                     C 340 40, 420 50, 480 80 
                     C 550 120, 640 180, 680 240
                     C 700 280, 660 320, 590 320
                     C 530 320, 480 370, 450 440
                     C 430 490, 390 510, 360 480
                     C 310 430, 260 360, 210 320
                     C 160 270, 140 210, 170 160
                     C 190 120, 240 80, 280 60 Z"
                  strokeDasharray="4 4"
                />
                {/* Transit Corridors */}
                <path d="M 200 220 Q 230 280 260 310 T 350 380 T 430 410" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                <path d="M 320 130 Q 330 220 390 300 T 350 380" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
                <path d="M 320 130 Q 450 180 580 230" stroke="#ec4899" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
                <path d="M 230 280 L 390 300" stroke="#10b981" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.5" />
              </g>

              {/* LAYER 1: CONTINUOUS HEATMAP GRADIENT THERMAL BLOBS */}
              {heatVisualizationMode !== 'nodes' && (
                <g filter="url(#thermalGlow)" className="transition-opacity duration-500">
                  {GEOGRAPHIC_HUBS.map(hub => {
                    const metric = hubMetrics[hub.id];
                    const ratio = metric ? metric.totalSpent / maxHubSpend : 0;
                    if (ratio <= 0.01) return null;

                    const config = getHeatIntensityStyle(ratio);
                    const dynamicRadius = Math.max(38, config.radius * (0.85 + ratio * 1.45));

                    return (
                      <circle
                        key={`thermal-${hub.id}`}
                        cx={hub.x}
                        cy={hub.y}
                        r={dynamicRadius}
                        fill={`url(#heat-${hub.id})`}
                        className="animate-pulse"
                        style={{
                          animationDuration: `${3 + (1 - ratio) * 2}s`,
                        }}
                      />
                    );
                  })}
                </g>
              )}

              {/* LAYER 2: INTERACTIVE PIN NODES & RADIAL WAVE RINGS */}
              {heatVisualizationMode !== 'gradient' && (
                <g>
                  {GEOGRAPHIC_HUBS.map(hub => {
                    const metric = hubMetrics[hub.id];
                    const ratio = metric ? metric.totalSpent / maxHubSpend : 0;
                    const config = getHeatIntensityStyle(ratio);
                    const isSelected = activeSelectedHubId === hub.id;
                    const isHovered = hoveredHubId === hub.id;
                    const nodeRadius = isSelected ? 13 : isHovered ? 11 : 8.5;

                    return (
                      <g
                        key={`node-${hub.id}`}
                        onClick={() => handleSelectHub(isSelected ? null : hub.id)}
                        onMouseEnter={() => setHoveredHubId(hub.id)}
                        onMouseLeave={() => setHoveredHubId(null)}
                        className="cursor-pointer group"
                      >
                        {/* Radar Pulse Wave for High-Heat Nodes */}
                        {ratio >= 0.35 && (
                          <circle
                            cx={hub.x}
                            cy={hub.y}
                            r={nodeRadius * 2.8}
                            fill="none"
                            stroke={config.fill}
                            strokeWidth="1.5"
                            opacity="0.45"
                            className="animate-ping"
                          />
                        )}

                        {/* Outer Glow Halo */}
                        <circle
                          cx={hub.x}
                          cy={hub.y}
                          r={nodeRadius * 2}
                          fill={config.glow}
                          className="transition-all duration-300"
                        />

                        {/* Solid Core Center */}
                        <circle
                          cx={hub.x}
                          cy={hub.y}
                          r={nodeRadius}
                          fill={config.fill}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? "3" : "2"}
                          className="transition-transform duration-200"
                        />

                        {/* Inner Dot */}
                        <circle
                          cx={hub.x}
                          cy={hub.y}
                          r={nodeRadius * 0.35}
                          fill="#ffffff"
                        />

                        {/* Node Label Text */}
                        <text
                          x={hub.x}
                          y={hub.y - (nodeRadius + 10)}
                          textAnchor="middle"
                          className={`text-[10px] font-mono font-bold transition-all ${
                            isSelected || isHovered
                              ? 'fill-white text-[11px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]'
                              : 'fill-slate-300 opacity-90'
                          }`}
                        >
                          {hub.name.split(' ')[0]}
                        </text>

                        {/* Spending Amount Sub-Label */}
                        {metric.totalSpent > 0 && (
                          <text
                            x={hub.x}
                            y={hub.y + (nodeRadius + 14)}
                            textAnchor="middle"
                            className="text-[9px] font-mono font-bold fill-purple-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                          >
                            {formatPrice(metric.totalSpent)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>

            {/* Bottom Map Legend Bar */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl flex items-center gap-3 text-[11px] font-mono text-slate-300 z-20">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Heat Scale:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-[10px]">&lt;20%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px]">Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[10px]">High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-[10px]">Very High</span>
              </div>
            </div>

            {/* Active Hub Hint on Map */}
            {activeHub && activeHubMetric && (
              <div className="absolute top-3 right-3 max-w-xs bg-slate-900/95 backdrop-blur-md border border-purple-500/50 p-3 rounded-2xl text-xs z-20 animate-fadeIn">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Inspected Node
                  </span>
                  <button
                    onClick={() => handleSelectHub(null)}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-bold text-white mt-0.5 truncate">{activeHub.name}</div>
                <div className="flex items-center justify-between text-[11px] mt-1 text-slate-300 font-mono">
                  <span>{formatPrice(activeHubMetric.totalSpent)}</span>
                  <span className="text-emerald-400">~{activeHub.avgDeliveryHours}h speed</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Optional Internal Right Drawer (if showInternalSidebar is true) */}
        {showInternalSidebar && (
          <div className="lg:col-span-4 space-y-4">
            {activeHub && activeHubMetric ? (
              <div className="p-5 rounded-3xl pastel-card-purple border shadow-md space-y-4 animate-slideIn">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Selected Hub Details</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeHub.name}
                    </h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {activeHub.stateOrArea}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectHub(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-purple-200/80 dark:border-purple-800/60">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Sourced</div>
                    <div className="text-base font-extrabold font-mono text-purple-700 dark:text-purple-300 mt-0.5">
                      {formatPrice(activeHubMetric.totalSpent)}
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-purple-200/80 dark:border-purple-800/60">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Fulfillment Pacing</div>
                    <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                      ~{activeHub.avgDeliveryHours}h Delivery
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
