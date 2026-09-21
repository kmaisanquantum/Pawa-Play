import React from 'react';
import { PromotionCard, PromotionItem } from '../components/PromotionCard';

export const PromotionsView: React.FC = () => {
  const promos: PromotionItem[] = [
    {
      id: 'promo-1',
      title: '100% First Deposit Match Bonus',
      description: 'Double your initial deposit up to 100 PGK on your first wallet deposit in PawaPlay.',
      badge: 'Welcome Bonus',
      imageBg: 'from-sky-900 via-blue-900 to-slate-900',
      code: 'WELCOME100',
    },
    {
      id: 'promo-2',
      title: 'Multi-Bet Boost up to 50%',
      description: 'Add 3 or more selections to your bet slip to unlock progressive accumulator bonus boosts.',
      badge: 'Bet Boost',
      imageBg: 'from-emerald-900 via-slate-900 to-slate-950',
      code: 'MULTIBOOST',
    },
    {
      id: 'promo-3',
      title: 'Rugby League Cash Back Special',
      description: 'Get 10% cash back as a bonus bet if your PNG Hunters match prediction loses by 2 points or less.',
      badge: 'Rugby Special',
      imageBg: 'from-amber-900 via-slate-900 to-slate-950',
      code: 'HUNTERS10',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <span className="text-2xl">🎁</span>
          <h1 className="text-xl font-bold text-white">Promotions & Special Offers</h1>
        </div>
        <p className="text-xs text-slate-400">
          Boost your payouts and earn rewards. Offers are simulated in Demo mode.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promos.map((p) => (
          <PromotionCard key={p.id} promo={p} />
        ))}
      </div>
    </div>
  );
};
