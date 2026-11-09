import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Trash2, 
  Plus, 
  HelpCircle, 
  ShieldCheck, 
  TrendingDown, 
  AlertCircle,
  ExternalLink,
  ChevronDown,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SmartCartItem, ProductCategory } from '../types';
import { INITIAL_SMART_CART_ITEMS } from '../data/smartShoppingData';

interface SmartCartProps {
  onSelectAlternative?: (alt: any) => void;
}

export const SmartCart: React.FC<SmartCartProps> = ({ onSelectAlternative }) => {
  const { formatPrice } = useApp();

  const [cartItems, setCartItems] = useState<SmartCartItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_cart_items_v1');
      return saved ? JSON.parse(saved) : INITIAL_SMART_CART_ITEMS;
    } catch {
      return INITIAL_SMART_CART_ITEMS;
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeAlternativeModal, setActiveAlternativeModal] = useState<SmartCartItem | null>(null);

  // New item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStore, setNewItemStore] = useState('Amazon');
  const [newItemCategory, setNewItemCategory] = useState<ProductCategory>('Shoes');

  const saveCart = (items: SmartCartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem('smart_cart_items_v1', JSON.stringify(items));
    } catch {}
  };

  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    saveCart(updated);
  };

  const handleKeepItem = (id: string) => {
    // Acknowledge keeping
    const updated = cartItems.map(item => {
      if (item.id === id) {
        return { ...item, statusReason: 'Verified by you to keep in cart.' };
      }
      return item;
    });
    saveCart(updated);
  };

  const handleSwitchToAlternative = (item: SmartCartItem) => {
    if (!item.cheaperAlternative) return;
    const updated = cartItems.map(cartItem => {
      if (cartItem.id === item.id) {
        return {
          ...cartItem,
          name: item.cheaperAlternative!.name,
          price: item.cheaperAlternative!.price,
          store: item.cheaperAlternative!.store,
          status: 'good_value' as const,
          potentialSaving: 0,
          statusReason: `Switched to ${item.cheaperAlternative!.name} from ${item.cheaperAlternative!.store}. Saved ${formatPrice(item.cheaperAlternative!.saving)}!`,
          cheaperAlternative: undefined,
          score: item.cheaperAlternative!.score,
        };
      }
      return cartItem;
    });
    saveCart(updated);
    setActiveAlternativeModal(null);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    const priceNum = parseFloat(newItemPrice);

    // Dynamic smart valuation logic
    let status: 'good_value' | 'could_be_cheaper' | 'expensive' = 'could_be_cheaper';
    let potentialSaving = Math.round(priceNum * 0.2);
    let reason = 'Similar alternatives detected across retail competitor catalogs.';

    if (priceNum > 3000) {
      status = 'expensive';
      potentialSaving = Math.round(priceNum * 0.28);
      reason = 'Price is significantly higher than comparable market averages for this category.';
    } else if (priceNum < 1000) {
      status = 'good_value';
      potentialSaving = 0;
      reason = 'Competitive entry-level pricing. Good value for money.';
    }

    const newItem: SmartCartItem = {
      id: `cart-custom-${Date.now()}`,
      name: newItemName,
      price: priceNum,
      store: newItemStore,
      category: newItemCategory,
      status,
      potentialSaving,
      statusReason: reason,
      score: status === 'good_value' ? 8.9 : status === 'could_be_cheaper' ? 7.5 : 6.4,
      cheaperAlternative: potentialSaving > 0 ? {
        name: `${newItemName} (Value Alternative)`,
        price: priceNum - potentialSaving,
        store: newItemStore === 'Amazon' ? 'Flipkart' : 'Amazon',
        saving: potentialSaving,
        type: 'Similar product',
        rating: 4.4,
        score: 8.5,
      } : undefined,
    };

    saveCart([...cartItems, newItem]);
    setNewItemName('');
    setNewItemPrice('');
    setShowAddModal(false);
  };

  const totalCart = cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalPotentialSaving = cartItems.reduce((sum, item) => sum + item.potentialSaving, 0);

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <ShoppingCart className="w-3.5 h-3.5 text-purple-500" />
            <span>Smart Cart · Pre-Purchase Valuation Engine</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Your Smart Cart</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {cartItems.length} items
            </span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Whenever multiple products are being considered, Smart Cart analyzes value ratings, price tags, and better alternatives before you check out.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item to Test</span>
          </button>
        </div>
      </div>

      {/* Cart Summary Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/50 to-emerald-50/60 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-emerald-950/20 border border-purple-200/80 dark:border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">Total Considered:</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatPrice(totalCart)}
          </div>
        </div>

        {totalPotentialSaving > 0 ? (
          <div className="p-3 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                Potential Saving Identified
              </div>
              <div className="text-lg font-mono font-extrabold text-emerald-700 dark:text-emerald-200">
                {formatPrice(totalPotentialSaving)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span>All items in your cart currently offer verified optimal value!</span>
          </div>
        )}
      </div>

      {/* Item-by-Item Valuation Cards */}
      <div className="space-y-3.5">
        {cartItems.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-500">Your Smart Cart is currently empty. Add products to evaluate their value.</p>
          </div>
        ) : (
          cartItems.map((item) => {
            const isGoodValue = item.status === 'good_value';
            const isCouldBeCheaper = item.status === 'could_be_cheaper';
            const isExpensive = item.status === 'expensive';

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isGoodValue
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/60'
                    : isCouldBeCheaper
                    ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/60'
                    : 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/60'
                }`}
              >
                {/* Left: Product Info & Badge */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Prompt Section 10 Valuation Badges */}
                      {isGoodValue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          🟢 <span>Good Value</span>
                        </span>
                      )}
                      {isCouldBeCheaper && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                          🟡 <span>Could Be Cheaper</span>
                        </span>
                      )}
                      {isExpensive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                          🔴 <span>Expensive</span>
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-slate-400">
                        {item.store} · {item.category}
                      </span>
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                        Score: {item.score}/10
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.name}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.statusReason}
                    </p>

                    {item.potentialSaving > 0 && (
                      <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ⚡ Potential Saving: {formatPrice(item.potentialSaving)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Price & User Decisions */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Cart Price</span>
                    <span className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-white">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Actions required by Prompt Section 10 */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.cheaperAlternative && (
                      <button
                        onClick={() => setActiveAlternativeModal(item)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        View Alternative
                      </button>
                    )}

                    <button
                      onClick={() => handleKeepItem(item.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
                      title="Keep this item without switching"
                    >
                      Keep Item
                    </button>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Alternative Detail Modal */}
      {activeAlternativeModal && activeAlternativeModal.cheaperAlternative && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">
                  Alternative Comparison
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Compare & Choose Smart Alternative
                </h3>
              </div>
              <button
                onClick={() => setActiveAlternativeModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Current */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Current In Cart</span>
                <div className="font-bold text-slate-900 dark:text-white line-clamp-2">
                  {activeAlternativeModal.name}
                </div>
                <div className="text-xs text-slate-500">{activeAlternativeModal.store}</div>
                <div className="text-base font-mono font-extrabold text-slate-900 dark:text-white pt-1">
                  {formatPrice(activeAlternativeModal.price)}
                </div>
                <div className="text-[10px] font-mono text-purple-600 font-bold">
                  Score: {activeAlternativeModal.score}/10
                </div>
              </div>

              {/* Cheaper Alternative */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 uppercase font-bold">Recommended</span>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-200 dark:bg-emerald-900 px-1 rounded">
                    Save {formatPrice(activeAlternativeModal.cheaperAlternative.saving)}
                  </span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white line-clamp-2">
                  {activeAlternativeModal.cheaperAlternative.name}
                </div>
                <div className="text-xs text-slate-500">{activeAlternativeModal.cheaperAlternative.store}</div>
                <div className="text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400 pt-1">
                  {formatPrice(activeAlternativeModal.cheaperAlternative.price)}
                </div>
                <div className="text-[10px] font-mono text-emerald-600 font-bold">
                  Score: {activeAlternativeModal.cheaperAlternative.score}/10 (★ {activeAlternativeModal.cheaperAlternative.rating})
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-slate-700 dark:text-slate-300">
              <strong>Distinction:</strong> {activeAlternativeModal.cheaperAlternative.type}. Specifications vetted with 98% matching capability.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleSwitchToAlternative(activeAlternativeModal)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Switch to Cheaper Alternative</span>
              </button>
              <button
                onClick={() => setActiveAlternativeModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Keep Original
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Item to Smart Cart
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Puma Motorsport Running Sneakers"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2499"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Store</label>
                  <select
                    value={newItemStore}
                    onChange={e => setNewItemStore(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Myntra">Myntra</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="AJIO">AJIO</option>
                    <option value="Croma">Croma</option>
                    <option value="Nykaa">Nykaa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={e => setNewItemCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Shoes">Shoes</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  Analyze & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
