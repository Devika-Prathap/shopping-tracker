import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Award, 
  Flame, 
  Heart, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { PurchaseTransaction, ShoppingPersonality, PersonalityType } from '../types';
import { calculateShoppingPersonality } from '../data/smartShoppingData';

interface ShoppingPersonalityCardProps {
  purchases: PurchaseTransaction[];
}

const ALL_PERSONALITIES: Array<{
  type: PersonalityType;
  emoji: string;
  title: string;
  description: string;
  traits: { dealSensitivity: number; brandLoyalty: number; techAffinity: number; impulseResistance: number };
}> = [
  {
    type: 'Deal Hunter',
    emoji: '💰',
    title: 'Deal Hunter',
    description: 'Most of your purchases come from discounted products, and you frequently compare prices between stores.',
    traits: { dealSensitivity: 92, brandLoyalty: 64, techAffinity: 75, impulseResistance: 82 },
  },
  {
    type: 'Fashion Shopper',
    emoji: '👗',
    title: 'Fashion Shopper',
    description: 'You appreciate curated apparel, seasonal wardrobe refreshes, and express your individuality through style.',
    traits: { dealSensitivity: 74, brandLoyalty: 88, techAffinity: 60, impulseResistance: 65 },
  },
  {
    type: 'Tech Explorer',
    emoji: '💻',
    title: 'Tech Explorer',
    description: 'You invest thoughtfully in audio hardware, workspace peripherals, and computing tools that elevate daily life.',
    traits: { dealSensitivity: 78, brandLoyalty: 72, techAffinity: 95, impulseResistance: 70 },
  },
  {
    type: 'Beauty Shopper',
    emoji: '💄',
    title: 'Beauty Shopper',
    description: 'You prioritize self-care and personal grooming with mindful skincare replenish cycles and quality essentials.',
    traits: { dealSensitivity: 70, brandLoyalty: 85, techAffinity: 55, impulseResistance: 76 },
  },
  {
    type: 'Home Shopper',
    emoji: '🏠',
    title: 'Home Shopper',
    description: 'You concentrate spending on comforting home living, organized kitchenware, and lifestyle ambiance.',
    traits: { dealSensitivity: 75, brandLoyalty: 70, techAffinity: 65, impulseResistance: 80 },
  },
  {
    type: 'Gaming Shopper',
    emoji: '🎮',
    title: 'Gaming Shopper',
    description: 'You seek top-tier responsive controllers, interactive gear, and recreational lifestyle experiences.',
    traits: { dealSensitivity: 82, brandLoyalty: 80, techAffinity: 90, impulseResistance: 62 },
  },
  {
    type: 'Balanced Shopper',
    emoji: '⚖️',
    title: 'Balanced Shopper',
    description: 'You distribute your budget evenly between practical tech, apparel, and daily wellness with natural mindfulness.',
    traits: { dealSensitivity: 80, brandLoyalty: 75, techAffinity: 75, impulseResistance: 85 },
  },
];

export const ShoppingPersonalityCard: React.FC<ShoppingPersonalityCardProps> = ({ purchases }) => {
  const calculated = calculateShoppingPersonality(purchases);
  const [selectedType, setSelectedType] = useState<PersonalityType>(calculated.type);

  const currentPersonality = ALL_PERSONALITIES.find(p => p.type === selectedType) || ALL_PERSONALITIES[0];

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Behavioral Archetype · Data-Driven Persona</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Your Shopping Personality</span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Derived directly from your recent merchant checkouts, category ratios, and coupon usage without judgment or labels.
          </p>
        </div>

        {/* Selected badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            {calculated.emoji} {calculated.type} (Your Match)
          </span>
        </div>
      </div>

      {/* Main Personality Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-50 to-indigo-50 dark:from-purple-950/40 dark:via-pink-950/20 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-800/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-3xl border border-purple-200/70 dark:border-purple-800/60 shrink-0">
              {currentPersonality.emoji}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                Primary Shopper Persona
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                You&apos;re a {currentPersonality.title} {currentPersonality.emoji}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                {currentPersonality.description}
              </p>
            </div>
          </div>
        </div>

        {/* Trait Radar Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Trait 1: Deal Sensitivity */}
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-900/40 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Deal Sensitivity</span>
              <span className="font-mono text-purple-600 dark:text-purple-400">{currentPersonality.traits.dealSensitivity}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: `${currentPersonality.traits.dealSensitivity}%` }} />
            </div>
            <p className="text-[10px] text-slate-500">Alert to coupons & price dips</p>
          </div>

          {/* Trait 2: Brand Loyalty */}
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-900/40 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Brand Loyalty</span>
              <span className="font-mono text-pink-600 dark:text-pink-400">{currentPersonality.traits.brandLoyalty}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-pink-600 h-full rounded-full" style={{ width: `${currentPersonality.traits.brandLoyalty}%` }} />
            </div>
            <p className="text-[10px] text-slate-500">Re-visits verified stores</p>
          </div>

          {/* Trait 3: Tech Affinity */}
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-900/40 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Tech Affinity</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{currentPersonality.traits.techAffinity}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${currentPersonality.traits.techAffinity}%` }} />
            </div>
            <p className="text-[10px] text-slate-500">Values modern specs & audio</p>
          </div>

          {/* Trait 4: Impulse Resistance */}
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-900/40 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Impulse Resistance</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{currentPersonality.traits.impulseResistance}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${currentPersonality.traits.impulseResistance}%` }} />
            </div>
            <p className="text-[10px] text-slate-500">Practices cooling-off periods</p>
          </div>
        </div>
      </div>

      {/* Explore All Personality Types Switcher */}
      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
          Explore Other Archetypes:
        </span>
        <div className="flex flex-wrap gap-2">
          {ALL_PERSONALITIES.map(p => {
            const isSelected = selectedType === p.type;
            const isActual = calculated.type === p.type;

            return (
              <button
                key={p.type}
                onClick={() => setSelectedType(p.type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{p.emoji}</span>
                <span>{p.title}</span>
                {isActual && <span className="text-[9px] opacity-75 font-mono ml-0.5">(You)</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
