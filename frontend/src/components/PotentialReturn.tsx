import React from 'react';

interface PotentialReturnProps {
  totalOdds: number;
  stake: number;
  currency?: string;
}

export const PotentialReturn: React.FC<PotentialReturnProps> = ({
  totalOdds,
  stake,
  currency = 'PGK',
}) => {
  const returnAmount = stake * totalOdds;
  const profit = Math.max(0, returnAmount - stake);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
      <div className="flex justify-between items-center text-slate-400">
        <span>Total Odds:</span>
        <span className="font-mono font-bold text-slate-200">{totalOdds.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center text-slate-400">
        <span>Total Stake:</span>
        <span className="font-mono text-slate-200">
          {currency} {stake.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
        <span className="font-semibold text-slate-200">Potential Return:</span>
        <span className="font-mono font-bold text-base text-emerald-400">
          {currency} {returnAmount.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-400">
        <span>Estimated Profit:</span>
        <span className="font-mono text-emerald-400/90">+ {currency} {profit.toFixed(2)}</span>
      </div>
    </div>
  );
};
