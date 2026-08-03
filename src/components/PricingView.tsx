import React from 'react';
import { Crown, Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';

interface PricingViewProps {
  onSelectPlan: (plan: string) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onSelectPlan }) => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="px-3.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold uppercase tracking-wider">
          Pricing Plans
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Simple, Fair Pricing for Everyone
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Start for free with 5 3D movies per day. Upgrade to Pro for unlimited 4K cartoon video generations.
        </p>
      </div>

      {/* Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        
        {/* FREE PLAN */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 space-y-6 relative flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Free Plan</h3>
                <p className="text-xs text-zinc-400">Perfect for trying out 3D movies</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold">
                Current Plan
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$0</span>
              <span className="text-zinc-400 text-sm">/ forever</span>
            </div>

            <ul className="space-y-3 text-sm text-zinc-300 pt-4 border-t border-[#27272a]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong className="text-white">5 Videos</strong> per day free</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong className="text-white">No Watermark</strong> on generated videos</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Full HD 1080p Resolution</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Up to 5 Minute Long Movie Mode</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Urdu, English & Hindi Voiceover</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onSelectPlan('Free')}
            className="w-full py-3.5 px-4 rounded-xl bg-[#09090b] hover:bg-[#27272a] text-zinc-200 font-bold text-sm border border-[#27272a] transition-all"
          >
            Use Free Plan
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="bg-gradient-to-b from-[#18181b] to-[#1e1b4b] border-2 border-purple-500 rounded-3xl p-8 space-y-6 relative shadow-2xl shadow-purple-600/20 flex flex-col justify-between">
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black tracking-wider uppercase shadow-md flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Most Popular</span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Pro Plan
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              <p className="text-xs text-purple-200">Unlimited 3D Cartoon Movies for Creators</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$9</span>
              <span className="text-purple-300 text-sm">/ month</span>
            </div>

            <ul className="space-y-3 text-sm text-zinc-200 pt-4 border-t border-purple-500/30">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span><strong className="text-white">Unlimited Videos</strong> per day</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span><strong className="text-white">4K Ultra HD</strong> Cinema Rendering</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>Priority Superfast Server Queue</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>Commercial Usage License</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>Custom Replicate & Fal.ai API Keys Support</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onSelectPlan('Pro')}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all transform hover:scale-[1.02]"
          >
            Upgrade to Pro - $9/mo
          </button>
        </div>

      </div>
    </div>
  );
};
