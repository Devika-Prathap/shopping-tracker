import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  Plus, 
  Sparkles, 
  Store, 
  DollarSign, 
  Layers, 
  Calendar,
  CheckCircle2,
  FileText,
  Camera,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory, PurchaseItem } from '../types';

interface QuickAddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPurchase: (purchase: PurchaseTransaction) => void;
  onOpenScanner?: () => void;
}

const COMMON_STORES = [
  'Amazon',
  'Myntra',
  'Flipkart',
  'Nykaa',
  'AJIO',
  'Zara',
  'Apple',
  'Swiggy Instamart',
  'Blinkit',
  'Uniqlo',
  'H&M',
  'Other'
];

const CATEGORIES: ProductCategory[] = [
  'Clothing',
  'Shoes',
  'Electronics',
  'Beauty',
  'Accessories',
  'Home & Living',
  'Books & Stationery',
  'Food & Groceries',
  'Gaming',
  'Mobile Accessories',
  'Gifts',
  'Other'
];

export const QuickAddPurchaseModal: React.FC<QuickAddPurchaseModalProps> = ({
  isOpen,
  onClose,
  onAddPurchase,
  onOpenScanner,
}) => {
  const { currency, formatPrice } = useApp();

  const [store, setStore] = useState('Amazon');
  const [customStore, setCustomStore] = useState('');
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Clothing');
  const [subCategory, setSubCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay');
  const [orderNumber, setOrderNumber] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const actualStore = store === 'Other' ? (customStore.trim() || 'Store') : store;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !productName.trim()) {
      return;
    }

    const newId = `manual-tx-${Date.now()}`;
    const generatedOrderNum = orderNumber.trim() || `ODR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newItem: PurchaseItem = {
      id: `manual-item-${Date.now()}`,
      name: productName.trim(),
      customDisplayName: isPrivate ? productName.trim() : undefined,
      price: parsedAmount,
      quantity: 1,
      category,
      subCategory: subCategory.trim() || category,
      store: actualStore,
      date,
      imageUrl: imageUrl.trim() || undefined,
      orderStatus: 'Delivered',
      tags: ['Manual Receipt', actualStore, category],
    };

    const newPurchase: PurchaseTransaction = {
      id: newId,
      orderNumber: generatedOrderNum,
      store: actualStore,
      date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subtotal: parsedAmount,
      discount: 0,
      deliveryCharges: 0,
      totalAmount: parsedAmount,
      currency: currency || '₹',
      paymentMethod,
      source: 'email_receipt',
      items: [newItem],
      orderStatus: 'Delivered',
      isPrivate,
      customDisplayName: isPrivate ? productName.trim() : undefined,
      privateCategory: isPrivate ? (category === 'Beauty' ? 'Personal Care & Wellness' : category === 'Gifts' ? 'Gifts & Celebrations' : 'Discretionary') : undefined,
      rawReceiptSnippet: receiptNote.trim() ? `Receipt Note: ${receiptNote.trim()}` : undefined,
      tags: ['Manual Receipt', actualStore, category],
    };

    onAddPurchase(newPurchase);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      // Reset form fields
      setProductName('');
      setAmount('');
      setSubCategory('');
      setReceiptNote('');
      setImageUrl('');
      setCustomStore('');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-[#0f1422] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle bar */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Quick Add Purchase
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Log a receipt or offline purchase in seconds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Form */}
        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Purchase Added!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your spending total, store charts, and category metrics have been updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Camera Scan Receipt AI Prompt Banner */}
            {onOpenScanner && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenScanner();
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800/60 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Have a paper receipt?</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-purple-600 text-white">
                        AI Camera
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Snap a photo to auto-fill merchant, date & total amount
                    </p>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            )}

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Item / Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nike Air Max, Zara Linen Shirt, Cold Brew"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Price & Date Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount ({currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    placeholder="2499"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Store Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Store / Merchant
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {COMMON_STORES.slice(0, 6).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setStore(s)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate transition-all cursor-pointer border ${
                      store === s
                        ? 'bg-purple-100 text-purple-700 border-purple-400 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-600 font-bold'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {COMMON_STORES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {store === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter store name..."
                  value={customStore}
                  onChange={(e) => setCustomStore(e.target.value)}
                  className="mt-2 w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              )}
            </div>

            {/* Category & SubCategory */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sub-category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tops, Sneakers"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              >
                <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>

            {/* Optional Note / Receipt Reference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Receipt Note or Order ID <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Order #108924, physical receipt from store visit"
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Save to Private Shopping Vault Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F3EEFF]/80 dark:bg-purple-950/30 border border-[#E5DDF2] dark:border-purple-800/60 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded text-[#7C3AED] accent-[#7C3AED] cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-[#4C267B] dark:text-purple-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Save to Private Shopping Vault
                </span>
                <span className="text-[11px] text-[#625B72] dark:text-slate-400 block">
                  Completely isolates this item from your public dashboard, category charts, and reports.
                </span>
              </div>
            </label>

            {/* Submit Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Purchase</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
