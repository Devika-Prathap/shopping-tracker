import React, { useState } from 'react';
import { 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  Plus, 
  Trash2, 
  Sparkles, 
  CreditCard,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RecurringSubscription } from '../types';

interface RecurringViewProps {
  subscriptions: RecurringSubscription[];
  onAddSubscription: (sub: RecurringSubscription) => void;
  onRemoveSubscription: (id: string) => void;
}

export const RecurringView: React.FC<RecurringViewProps> = ({
  subscriptions,
  onAddSubscription,
  onRemoveSubscription,
}) => {
  const { formatPrice } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [merchant, setMerchant] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');

  const totalMonthlyRecurring = subscriptions.reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalYearlyRecurring = totalMonthlyRecurring * 12;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !monthlyCost) return;
    const cost = parseFloat(monthlyCost);
    const newSub: RecurringSubscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      merchant: merchant.trim() || name.trim(),
      category: 'Electronics',
      monthlyCost: cost,
      billingCycle,
      nextBillingDate: 'Next Month',
      colorAccent: '#8b5cf6',
    };
    onAddSubscription(newSub);
    setName('');
    setMerchant('');
    setMonthlyCost('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-100 via-pink-50 to-amber-50 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mb-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Recurring Spending & Subscriptions
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Subscriptions & Membership Audits
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Automatically tracks active monthly software, streaming services, and scheduled delivery charges to expose annual run-rates.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800/60 shadow-md text-center shrink-0">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Yearly Impact</div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400 tabular-nums mt-0.5">
            {formatPrice(totalYearlyRecurring)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            {formatPrice(totalMonthlyRecurring)} / month
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subscriptions.map(sub => {
          const yearly = sub.monthlyCost * 12;

          return (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {sub.merchant}
                  </span>
                  <button
                    onClick={() => onRemoveSubscription(sub.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {sub.name}
                  </h4>

                  <div className="mt-2">
                    <span className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
                      {formatPrice(sub.monthlyCost)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium ml-1">/ month</span>
                  </div>

                  {/* Useful Yearly Multiplier Calculation (Prompt rule: ₹499/month = ₹5,988/year) */}
                  <div className="mt-3 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 text-xs">
                    <div className="text-[10px] text-purple-700 dark:text-purple-300 font-bold uppercase">
                      Annual Multiplier
                    </div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatPrice(sub.monthlyCost)}/mo = <span className="text-purple-600 dark:text-purple-400">{formatPrice(yearly)}/year</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Cycle: {sub.billingCycle}</span>
                <span className="font-mono">{sub.nextBillingDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Subscription</span>
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Subscription
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Service / Plan Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Netflix 4K, Spotify Duo, Gym"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Cost
                </label>
                <input
                  type="number"
                  required
                  placeholder="499"
                  value={monthlyCost}
                  onChange={e => setMonthlyCost(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Billing Cycle
                </label>
                <select
                  value={billingCycle}
                  onChange={e => setBillingCycle(e.target.value as any)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
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
                Save Subscription
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
