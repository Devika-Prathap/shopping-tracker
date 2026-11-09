import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  Plus, 
  TrendingDown, 
  Check, 
  Trash2, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PersonalSavingGoal, ProductCategory } from '../types';
import { INITIAL_SAVING_GOALS } from '../data/smartShoppingData';

export const PersonalSavingGoals: React.FC = () => {
  const { formatPrice } = useApp();

  const [goals, setGoals] = useState<PersonalSavingGoal[]>(() => {
    try {
      const saved = localStorage.getItem('personal_saving_goals_v1');
      return saved ? JSON.parse(saved) : INITIAL_SAVING_GOALS;
    } catch {
      return INITIAL_SAVING_GOALS;
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('Clothing');
  const [newEmoji, setNewEmoji] = useState('🎯');

  const saveGoals = (updated: PersonalSavingGoal[]) => {
    setGoals(updated);
    try {
      localStorage.setItem('personal_saving_goals_v1', JSON.stringify(updated));
    } catch {}
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;

    const targetVal = parseFloat(newTarget);
    const currentVal = parseFloat(newCurrent) || 0;
    const monthlyCutback = Math.round(targetVal * 0.08);

    const newGoal: PersonalSavingGoal = {
      id: `goal-${Date.now()}`,
      title: newTitle,
      targetAmount: targetVal,
      currentSaved: currentVal,
      categoryFocus: newCategory,
      monthlyCutbackRecommendation: monthlyCutback,
      monthsToGoal: Math.max(1, Math.ceil((targetVal - currentVal) / 2000)),
      projectedMonthsWithCutback: Math.max(1, Math.ceil((targetVal - currentVal) / (2000 + monthlyCutback))),
      emoji: newEmoji || '🎯',
    };

    saveGoals([...goals, newGoal]);
    setNewTitle('');
    setNewTarget('');
    setNewCurrent('');
    setShowAddModal(false);
  };

  const handleDeleteGoal = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
  };

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>Target Acceleration · Personal Saving Goals</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Personal Saving Goals</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {goals.length} Active
            </span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Set custom financial milestones and see how targeted trim-backs in specific shopping categories accelerate your timeline.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Saving Goal</span>
        </button>
      </div>

      {/* Goals Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentSaved / goal.targetAmount) * 100));
          const monthsSaved = Math.max(1, goal.monthsToGoal - goal.projectedMonthsWithCutback);

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-xl shadow-2xs">
                      {goal.emoji}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {goal.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        Category Focus: {goal.categoryFocus}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer rounded-lg"
                    title="Remove Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500 font-bold">
                      {formatPrice(goal.currentSaved)} / {formatPrice(goal.targetAmount)}
                    </span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{percent}%</strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Category Reduction Recommendation (Prompt Section 12 Requirement) */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Acceleration Strategy</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Reducing <strong>{goal.categoryFocus}</strong> spending by <strong>{formatPrice(goal.monthlyCutbackRecommendation)}/mo</strong> could help you reach your goal <strong>{monthsSaved} {monthsSaved === 1 ? 'month' : 'months'} earlier</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Paced at ~{goal.monthsToGoal} months</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">On Track</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Personal Saving Goal
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Laptop / Vacation Trip"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="10000"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Current Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="2500"
                    value={newCurrent}
                    onChange={e => setNewCurrent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Category to Cut Back</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Clothing">Clothing</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newEmoji}
                    onChange={e => setNewEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-center"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
