import React from 'react';

interface StakeInputProps {
  stake: string;
  onChangeStake: (value: string) => void;
  currency?: string;
}

export const StakeInput: React.FC<StakeInputProps> = ({
  stake,
  onChangeStake,
  currency = 'PGK',
}) => {
  const quickAmounts = [10, 20, 50, 100];

  const handleQuickAdd = (addVal: number) => {
    const current = Number(stake) || 0;
    onChangeStake((current + addVal).toString());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <label htmlFor="stake-input">Stake Amount ({currency})</label>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
          {currency}
        </span>
        <input
          id="stake-input"
          type="number"
          min="1"
          step="1"
          value={stake}
          onChange={(e) => onChangeStake(e.target.value)}
          placeholder="0.00"
          className="w-full pl-12 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono font-bold text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
        />
      </div>

      {/* Quick stake buttons */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => handleQuickAdd(amt)}
            className="py-1 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            +{amt}
          </button>
        ))}
      </div>
    </div>
  );
};
