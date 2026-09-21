import React from 'react';

export interface PromotionItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  imageBg: string;
  code?: string;
}

interface PromotionCardProps {
  promo: PromotionItem;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({ promo }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-between group">
      <div className={`p-6 bg-gradient-to-br ${promo.imageBg} relative`}>
        <div className="flex items-center justify-between mb-3">
          <span className="bg-slate-950/80 text-sky-400 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-sky-500/30">
            {promo.badge}
          </span>
          <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-amber-500/30">
            Simulated / Demo
          </span>
        </div>

        <h3 className="text-xl font-black text-white group-hover:text-sky-300 transition-colors mb-2">
          {promo.title}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-md">
          {promo.description}
        </p>
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
        {promo.code && (
          <div className="text-xs font-mono text-slate-400">
            Code: <span className="text-white font-bold">{promo.code}</span>
          </div>
        )}
        <button
          onClick={() => alert(`Simulated Promo Claim for ${promo.title}`)}
          className="ml-auto py-2 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
        >
          Claim Offer →
        </button>
      </div>
    </div>
  );
};
