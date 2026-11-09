import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Mail, 
  Puzzle, 
  CreditCard, 
  Check, 
  ArrowRight, 
  X,
  Wallet,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { currency, setCurrency, appName, setAppName } = useApp();
  const [step, setStep] = useState(1);
  const [localTitle, setLocalTitle] = useState(appName);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step 1: Welcome & Setup */}
        {step === 1 && (
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-purple-500/20">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Welcome to Smart Shopping
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Track your shopping. Understand your spending. Find ways to save.
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                The modern, zero-manual expense tracker for Amazon, Myntra, Flipkart, AJIO, Nykaa, and 50+ stores.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 text-left space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Name Your Tracker:
                </label>
                <input
                  type="text"
                  value={localTitle}
                  onChange={e => setLocalTitle(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select Currency:
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {(['₹', '$', '€', '£'] as const).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        currency === c
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (localTitle.trim()) setAppName(localTitle.trim());
                setStep(2);
              }}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Integrations (Browser extension & Email) */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Step 2 of 4
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Zero-Manual Tracking Setup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All integrations are completely optional and require your explicit consent.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
                  <Puzzle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-white">CartLens Browser Companion</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Automatically sniffs order confirmation pages on Amazon, Myntra, Flipkart, AJIO & Croma.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Enabled
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-white">Email E-Receipt Ingestion</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Extracts product names, prices, and tax breakdown directly from order emails with Gemini AI.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Enabled
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Privacy Guarantee */}
        {step === 3 && (
          <div className="p-8 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Step 3 of 4 · Security Guarantee
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Your Privacy Is Fully Guaranteed
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>We never request banking passwords, PINs, CVVs, or OTPs.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Only finalized purchases are recorded (no cart browsing telemetry).</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>You can disconnect integrations or export all data at any time.</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-2/3 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Final Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready! */}
        {step === 4 && (
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                You're All Set to Start Tracking!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Explore your live shopping dashboard, review stores, explore cheaper alternatives with Save More, and watch for price drops.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 active:scale-95 transition-all cursor-pointer"
            >
              Enter Shopping Tracker
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
