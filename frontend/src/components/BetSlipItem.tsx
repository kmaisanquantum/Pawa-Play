import React from 'react';
import { BetSelection } from '../context/AppContext';

interface BetSlipItemProps {
  item: BetSelection;
  onRemove: (selectionId: string) => void;
}

export const BetSlipItem: React.FC<BetSlipItemProps> = ({ item, onRemove }) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 text-xs space-y-1.5 relative group">
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-slate-300 line-clamp-1">{item.eventName}</span>
        <button
          type="button"
          onClick={() => onRemove(item.selectionId)}
          className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors text-sm font-bold"
          aria-label={`Remove ${item.outcomeName}`}
        >
          ✕
        </button>
      </div>

      <div className="text-slate-400 text-[11px]">{item.marketName}</div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
        <span className="font-bold text-sky-400 text-sm">{item.outcomeName}</span>
        <span className="font-mono font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/60">
          @{item.odds.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
