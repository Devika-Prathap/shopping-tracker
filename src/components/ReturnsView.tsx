import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ShoppingBag, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Calendar, 
  Store, 
  Tag, 
  TrendingDown, 
  Check, 
  X,
  FileText,
  DollarSign,
  ChevronDown,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, PurchaseItem, ProductCategory } from '../types';

export interface ReturnRecord {
  id: string;
  orderNumber: string;
  store: string;
  itemName: string;
  itemCategory: ProductCategory;
  originalPrice: number;
  refundAmount: number;
  returnDate: string;
  status: 'Refunded' | 'In Progress' | 'Pickup Scheduled' | 'Rejected';
  reason: 'Wrong Size / Fit' | 'Defective / Damaged' | 'Not as Pictured' | 'Better Price Found' | 'Changed Mind' | 'Late Delivery';
  refundMethod: 'Original Payment Method' | 'Store Credit' | 'Bank UPI' | 'Gift Card';
  trackingNumber?: string;
  notes?: string;
  imageUrl?: string;
}

interface ReturnsViewProps {
  purchases: PurchaseTransaction[];
  onUpdatePurchase?: (purchase: PurchaseTransaction) => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  purchases,
  onUpdatePurchase
}) => {
  const { formatPrice } = useApp();

  // Initial seed from purchases that are returned or refunded
  const [returnRecords, setReturnRecords] = useState<ReturnRecord[]>(() => {
    try {
      const saved = localStorage.getItem('trackshop_returns_v1');
      if (saved) return JSON.parse(saved);
    } catch {}

    const seed: ReturnRecord[] = [
      {
        id: 'ret-001',
        orderNumber: 'MYN-8819023',
        store: 'Myntra',
        itemName: 'Slim Fit Rigid Denim Jeans',
        itemCategory: 'Clothing',
        originalPrice: 1999,
        refundAmount: 1999,
        returnDate: '2026-09-17',
        status: 'Refunded',
        reason: 'Wrong Size / Fit',
        refundMethod: 'Bank UPI',
        trackingNumber: 'DELHIVERY-RT-8849102',
        notes: 'Requested size 34 exchange, but opted for full UPI refund to HDFC account.',
      },
      {
        id: 'ret-002',
        orderNumber: 'AMZ-309-1102931',
        store: 'Amazon',
        itemName: 'USB-C Multiport Aluminum Hub 7-in-1',
        itemCategory: 'Electronics',
        originalPrice: 2199,
        refundAmount: 2199,
        returnDate: '2026-09-29',
        status: 'In Progress',
        reason: 'Defective / Damaged',
        refundMethod: 'Original Payment Method',
        trackingNumber: 'ATS-RET-9021841',
        notes: 'HDMI port 4K output flickering on external display. Package picked up by courier on Sep 30.',
      },
      {
        id: 'ret-003',
        orderNumber: 'AJIO-7729103',
        store: 'AJIO',
        itemName: 'Chunky Sole Minimalist Derby Shoes',
        itemCategory: 'Shoes',
        originalPrice: 2499,
        refundAmount: 2499,
        returnDate: '2026-10-02',
        status: 'Pickup Scheduled',
        reason: 'Wrong Size / Fit',
        refundMethod: 'Store Credit',
        trackingNumber: 'SHDW-PKUP-449102',
        notes: 'Doorstep pickup window: Tomorrow 10 AM - 1 PM. Keep original barcode tag intact.',
      }
    ];

    // Also pick up any returned transaction from purchases
    purchases.forEach(p => {
      if (p.orderStatus === 'Returned' || p.isRefunded) {
        const firstItem = p.items[0];
        const exists = seed.some(r => r.orderNumber === p.orderNumber);
        if (!exists && firstItem) {
          seed.push({
            id: `ret-${p.id}`,
            orderNumber: p.orderNumber,
            store: p.store,
            itemName: firstItem.name,
            itemCategory: firstItem.category,
            originalPrice: firstItem.price,
            refundAmount: p.refundAmount || firstItem.price,
            returnDate: p.date,
            status: 'Refunded',
            reason: 'Changed Mind',
            refundMethod: 'Bank UPI',
            trackingNumber: `RET-${p.orderNumber}`,
          });
        }
      }
    });

    return seed;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Return Modal State
  const [newOrderNumber, setNewOrderNumber] = useState('');
  const [newStore, setNewStore] = useState('Amazon');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ProductCategory>('Clothing');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newRefundAmount, setNewRefundAmount] = useState('');
  const [newReason, setNewReason] = useState<ReturnRecord['reason']>('Wrong Size / Fit');
  const [newRefundMethod, setNewRefundMethod] = useState<ReturnRecord['refundMethod']>('Original Payment Method');
  const [newNotes, setNewNotes] = useState('');

  const saveReturns = (records: ReturnRecord[]) => {
    setReturnRecords(records);
    try {
      localStorage.setItem('trackshop_returns_v1', JSON.stringify(records));
    } catch {}
  };

  const handleAddNewReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const price = parseFloat(newOriginalPrice) || 0;
    const refund = parseFloat(newRefundAmount) || price;

    const newRecord: ReturnRecord = {
      id: `ret-${Date.now()}`,
      orderNumber: newOrderNumber.trim() || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      store: newStore,
      itemName: newItemName.trim(),
      itemCategory: newItemCategory,
      originalPrice: price,
      refundAmount: refund,
      returnDate: new Date().toISOString().split('T')[0],
      status: 'In Progress',
      reason: newReason,
      refundMethod: newRefundMethod,
      trackingNumber: `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      notes: newNotes.trim() || undefined,
    };

    const updated = [newRecord, ...returnRecords];
    saveReturns(updated);
    setShowNewModal(false);

    // Reset form
    setNewOrderNumber('');
    setNewItemName('');
    setNewOriginalPrice('');
    setNewRefundAmount('');
    setNewNotes('');
  };

  const handleUpdateStatus = (id: string, newStatus: ReturnRecord['status']) => {
    const updated = returnRecords.map(r => r.id === id ? { ...r, status: newStatus } : r);
    saveReturns(updated);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = returnRecords.filter(r => r.id !== id);
    saveReturns(updated);
  };

  // Calculations
  const totalRefundedAmount = useMemo(() => {
    return returnRecords
      .filter(r => r.status === 'Refunded')
      .reduce((sum, r) => sum + r.refundAmount, 0);
  }, [returnRecords]);

  const pendingRefundAmount = useMemo(() => {
    return returnRecords
      .filter(r => r.status === 'In Progress' || r.status === 'Pickup Scheduled')
      .reduce((sum, r) => sum + r.refundAmount, 0);
  }, [returnRecords]);

  const filteredRecords = useMemo(() => {
    return returnRecords.filter(r => {
      const matchSearch = 
        r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.trackingNumber && r.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
      const matchStore = selectedStore === 'all' || r.store === selectedStore;

      return matchSearch && matchStatus && matchStore;
    });
  }, [returnRecords, searchQuery, selectedStatus, selectedStore]);

  // Unique stores for filter
  const storesList = useMemo(() => {
    return Array.from(new Set(returnRecords.map(r => r.store)));
  }, [returnRecords]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Banner / Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-purple-950/30 border border-amber-200/80 dark:border-amber-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1">
            <RotateCcw className="w-3.5 h-3.5" />
            Order Lifecycle & Returns Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Returns & Refunds Tracker
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Track return pickups, reversed transactions, credited bank refunds, and store credits across all your connected e-commerce platforms.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Return</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Credited */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Recovered</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatPrice(totalRefundedAmount)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Credited back to your bank / original payment
          </p>
        </div>

        {/* Pending In-Flight Refunds */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold">In-Flight Refunds</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatPrice(pendingRefundAmount)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Awaiting inspection or transit settlement
          </p>
        </div>

        {/* Active Returns Count */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Return Cases</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {returnRecords.filter(r => r.status !== 'Refunded' && r.status !== 'Rejected').length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {returnRecords.filter(r => r.status === 'Pickup Scheduled').length} scheduled for pickup
          </p>
        </div>

        {/* Return Rate Insight */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Cases Handled</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
            {returnRecords.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Most frequent: Wrong Size / Fit (66%)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product, store, order #, or tracking #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            {(['all', 'In Progress', 'Pickup Scheduled', 'Refunded'] as const).map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  selectedStatus === status
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {status === 'all' ? 'All Status' : status}
              </button>
            ))}
          </div>

          {/* Store filter */}
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer shrink-0"
          >
            <option value="all">All Stores</option>
            {storesList.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Return Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No returns found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No matching returns or refunds in your records. All other orders are delivered and retained.
            </p>
          </div>
        ) : (
          filteredRecords.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-800/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Product and status info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/60 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.itemName}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      item.status === 'Refunded'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : item.status === 'In Progress'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : item.status === 'Pickup Scheduled'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.store}</span>
                    <span>·</span>
                    <span className="font-mono">{item.orderNumber}</span>
                    <span>·</span>
                    <span>Returned on {item.returnDate}</span>
                    <span>·</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{item.reason}</span>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Note: </span>
                      {item.notes}
                    </p>
                  )}

                  {item.trackingNumber && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-1">
                      <span>Tracking:</span>
                      <span className="text-slate-700 dark:text-slate-300 select-all font-semibold">{item.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800 shrink-0 gap-2">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Refund Amount</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatPrice(item.refundAmount)}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    via {item.refundMethod}
                  </div>
                </div>

                {/* Status quick toggle */}
                <div className="flex items-center gap-1.5 mt-1">
                  {item.status !== 'Refunded' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'Refunded')}
                      title="Mark as Refund Settled"
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Mark Credited
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteRecord(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Remove Record"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Helpful Return Policies & Tips */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Info className="w-4 h-4 text-amber-500" />
          <span>Automated Return Window Guidelines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Amazon / Flipkart</span>
            <span>Standard 7-10 day replacement or return period. Refund initiates automatically within 2 hours of doorstep courier scan.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Myntra / AJIO</span>
            <span>14-day hassle-free return window for fashion and apparel with attached brand tags. Instant UPI refunds supported.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Electronics & Gadgets</span>
            <span>Technical inspection required before refunds. Keep serial number and retail packaging for smooth acceptance.</span>
          </div>
        </div>
      </div>

      {/* Modal: Log New Return */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-amber-500 to-rose-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-bold text-base">Log Return or Refund</h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewReturn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Ergonomic Mouse"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Store
                  </label>
                  <select
                    value={newStore}
                    onChange={(e) => setNewStore(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Myntra">Myntra</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="AJIO">AJIO</option>
                    <option value="Nykaa">Nykaa</option>
                    <option value="Tata CLiQ">Tata CLiQ</option>
                    <option value="Croma">Croma</option>
                    <option value="Other">Other Store</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Clothing">Clothing</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Mobile Accessories">Mobile Accessories</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    placeholder="1999"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Refund
                  </label>
                  <input
                    type="number"
                    placeholder="1999"
                    value={newRefundAmount}
                    onChange={(e) => setNewRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Return Reason
                  </label>
                  <select
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Wrong Size / Fit">Wrong Size / Fit</option>
                    <option value="Defective / Damaged">Defective / Damaged</option>
                    <option value="Not as Pictured">Not as Pictured</option>
                    <option value="Better Price Found">Better Price Found</option>
                    <option value="Changed Mind">Changed Mind</option>
                    <option value="Late Delivery">Late Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Refund Method
                  </label>
                  <select
                    value={newRefundMethod}
                    onChange={(e) => setNewRefundMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Original Payment Method">Original Payment</option>
                    <option value="Bank UPI">Bank UPI</option>
                    <option value="Store Credit">Store Credit</option>
                    <option value="Gift Card">Gift Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Order Number (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AMZ-902-18239"
                  value={newOrderNumber}
                  onChange={(e) => setNewOrderNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Pickup instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Courier pickup scheduled, replacement notes..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer"
                >
                  Record Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
