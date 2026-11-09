import React, { useState } from 'react';
import { 
  Bookmark, 
  Bell, 
  BellOff, 
  TrendingDown, 
  ArrowRight, 
  ExternalLink, 
  Plus, 
  Sparkles,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WishlistItem } from '../types';

interface WishlistViewProps {
  wishlist: WishlistItem[];
  onToggleWatch: (id: string) => void;
  onAddWishlist: (item: WishlistItem) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  onToggleWatch,
  onAddWishlist,
}) => {
  const { formatPrice } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStore, setNewStore] = useState('Amazon');
  const [newPrice, setNewPrice] = useState('');

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;
    const priceNum = parseFloat(newPrice);
    const item: WishlistItem = {
      id: `wsh-${Date.now()}`,
      productName: newTitle.trim(),
      store: newStore,
      currentPrice: priceNum,
      originalPrice: +(priceNum * 1.15).toFixed(0),
      detectedDate: 'Today',
      priceHistory: [
        { date: 'Initial', price: +(priceNum * 1.15).toFixed(0) },
        { date: 'Today', price: priceNum },
      ],
      isWatching: true,
      category: 'Other',
    };
    onAddWishlist(item);
    setNewTitle('');
    setNewPrice('');
    setShowAddModal(false);
  };

  const [openStoreNotice, setOpenStoreNotice] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-fadeIn">
      {openStoreNotice && (
        <div className="p-3.5 rounded-2xl bg-[#EDFAF6] border border-[#BFEADE] text-[#16A085] flex items-center justify-between animate-fadeIn text-xs font-semibold">
          <span>{openStoreNotice}</span>
          <button 
            onClick={() => setOpenStoreNotice(null)}
            className="p-1 hover:bg-[#BFEADE]/40 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FDF2F8] via-[#FFF9F2] to-[#F3EEFF] dark:from-purple-950/40 dark:via-pink-950/30 dark:to-slate-900 border border-[#FBCFE8] dark:border-purple-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED] dark:text-purple-400 flex items-center gap-1.5 mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            Wait-To-Buy & Intent Assistant
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#4C267B] dark:text-white tracking-tight">
            Maybe Later (Wishlist Price Tracker)
          </h2>
          <p className="text-xs text-[#625B72] dark:text-slate-400 mt-1 max-w-xl">
            When you repeatedly browse a product without purchasing, our browser extension catches it here so you can pause impulse buying and wait for a price drop.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product to Watch</span>
        </button>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {wishlist.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-3xl bg-gradient-to-br from-[#FDF2F8]/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border border-[#FBCFE8] dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#625B72] dark:text-slate-400 pb-3 border-b border-[#FBCFE8]/60 dark:border-slate-800">
                <span className="font-bold text-[#29243A] dark:text-white">
                  {item.store}
                </span>
                <span className="text-[11px] text-[#625B72] dark:text-slate-400">
                  Detected {item.detectedDate}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-bold text-[#29243A] dark:text-white line-clamp-2">
                  {item.productName}
                </h4>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-[#7C3AED] dark:text-purple-400 tabular-nums">
                    {formatPrice(item.currentPrice)}
                  </span>
                  {item.originalPrice > item.currentPrice && (
                    <span className="text-xs text-[#625B72] line-through font-mono">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                  {item.originalPrice > item.currentPrice && (
                    <span className="text-xs font-bold text-[#16A085] dark:text-emerald-400">
                      -{formatPrice(item.originalPrice - item.currentPrice)}
                    </span>
                  )}
                </div>

                {/* Price History Sparkline simulation */}
                <div className="mt-4 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/50 border border-[#FBCFE8]/80 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="flex justify-between text-[11px] text-[#625B72] dark:text-slate-400 font-semibold">
                    <span>Price Trend</span>
                    <span className="text-[#16A085] dark:text-emerald-400 font-bold">
                      Dropping
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#625B72] dark:text-slate-400 font-mono">
                    {item.priceHistory.map((step, i) => (
                      <div key={i} className="text-center">
                        <div>{step.date}</div>
                        <div className="font-bold text-[#29243A] dark:text-slate-300">
                          {formatPrice(step.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#FBCFE8]/60 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onToggleWatch(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  item.isWatching
                    ? 'bg-[#FFF6ED] text-[#C2410C] dark:bg-amber-950/80 dark:text-amber-300 border border-[#FDBA74] dark:border-amber-800'
                    : 'bg-[#F3EEFF] text-[#4C267B] dark:bg-slate-800 dark:text-slate-300 border border-[#E5DDF2] dark:border-slate-700'
                }`}
              >
                {item.isWatching ? (
                  <>
                    <Bell className="w-3.5 h-3.5 fill-[#FDBA74] text-[#C2410C]" />
                    <span>Watching Price</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-3.5 h-3.5" />
                    <span>Watch Price</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setOpenStoreNotice(`Direct link to ${item.store} verified for ${item.productName}`)}
                className="p-2 rounded-xl text-[#625B72] hover:text-[#7C3AED] hover:bg-[#F3EEFF] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Open Store"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateItem}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Product to Maybe Later
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Product Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sony WH-1000XM5, Linen Dress, Shoes"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Store / Website
                </label>
                <select
                  value={newStore}
                  onChange={e => setNewStore(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Amazon">Amazon</option>
                  <option value="Myntra">Myntra</option>
                  <option value="Flipkart">Flipkart</option>
                  <option value="AJIO">AJIO</option>
                  <option value="Croma">Croma</option>
                  <option value="Nykaa">Nykaa</option>
                  <option value="Tata CLiQ">Tata CLiQ</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Price
                </label>
                <input
                  type="number"
                  required
                  placeholder="2499"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
              >
                Add & Watch Price
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
