import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { useApp } from '../context/AppContext';
import { PriceHistoryProduct } from '../types';
import { INITIAL_PRICE_HISTORY_PRODUCTS } from '../data/smartShoppingData';

export const PriceHistoryCard: React.FC = () => {
  const { formatPrice } = useApp();
  const [selectedProductId, setSelectedProductId] = useState<string>(INITIAL_PRICE_HISTORY_PRODUCTS[0].id);

  const product = INITIAL_PRICE_HISTORY_PRODUCTS.find(p => p.id === selectedProductId) || INITIAL_PRICE_HISTORY_PRODUCTS[0];

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Price Volatility Tracker · Historical Timeline</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Price History & Buying Timing Advisory</span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Historical price tracking detects artificial markups and verifies whether current prices are genuinely discounted compared to historical lows.
          </p>
        </div>

        {/* Product selector buttons */}
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
          {INITIAL_PRICE_HISTORY_PRODUCTS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer truncate max-w-[150px] ${
                selectedProductId === p.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p.category}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Product Overview Banner */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover" />
            ) : (
              <BarChart3 className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{product.store}</span>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">· {product.category}</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
              {product.productName}
            </h4>
          </div>
        </div>

        {/* Timing Advisory Banner (Prompt Section 7 Requirement) */}
        <div className={`p-3 rounded-xl border text-xs max-w-sm ${
          product.isGoodTimeToBuy
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
        }`}>
          <div className="font-bold flex items-center gap-1.5">
            {product.isGoodTimeToBuy ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
            <span>{product.isGoodTimeToBuy ? 'Optimal Buy Window' : 'Caution on Timing'}</span>
          </div>
          <p className="mt-0.5 leading-relaxed text-[11px] opacity-90">
            {product.advisoryMessage}
          </p>
        </div>
      </div>

      {/* 4 Stats Cards (Prompt Section 7: Current, Lowest, Highest, Average) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Current Price</span>
          <div className="text-lg font-mono font-extrabold text-blue-600 dark:text-blue-400">
            {formatPrice(product.currentPrice)}
          </div>
          <span className="text-[10px] text-slate-400">Previous: {formatPrice(product.previousPrice)}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold block">Lowest Recorded</span>
          <div className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatPrice(product.lowestPrice)}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400">All-time promotional dip</span>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-1">
          <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 uppercase font-bold block">Highest Recorded</span>
          <div className="text-lg font-mono font-extrabold text-rose-600 dark:text-rose-400">
            {formatPrice(product.highestPrice)}
          </div>
          <span className="text-[10px] text-rose-700 dark:text-rose-400">MSRP launch price</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Historical Average</span>
          <div className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
            {formatPrice(product.averagePrice)}
          </div>
          <span className="text-[10px] text-slate-400">60-day moving mean</span>
        </div>
      </div>

      {/* Interactive Recharts Line Chart */}
      <div className="h-60 sm:h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={product.history} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }} tickLine={false} />
            <YAxis tickFormatter={v => `₹${v}`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['dataMin - 300', 'dataMax + 300']} />
            <ReferenceLine y={product.lowestPrice} stroke="#10b981" strokeDasharray="3 3" label={{ value: `Lowest: ₹${product.lowestPrice}`, position: 'right', fill: '#10b981', fontSize: 10 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-3 rounded-xl text-xs font-semibold shadow-xl border border-slate-700 space-y-1">
                      <div className="font-bold text-slate-300 dark:text-slate-600">{data.date}</div>
                      <div className="text-base font-mono font-extrabold text-blue-400 dark:text-blue-600">
                        {formatPrice(data.price)}
                      </div>
                      {data.event && <div className="text-[10px] text-emerald-400">{data.event}</div>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
