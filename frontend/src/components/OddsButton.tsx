import React from 'react';
import { useApp, BetSelection } from '../context/AppContext';

interface OddsButtonProps {
  selectionId: string;
  label: string;
  odds: number;
  eventName: string;
  marketName: string;
  disabled?: boolean;
}

export const OddsButton: React.FC<OddsButtonProps> = ({
  selectionId,
  label,
  odds,
  eventName,
  marketName,
  disabled = false,
}) => {
  const { selections, toggleSelection } = useApp();

  const isSelected = selections.some((s) => s.selectionId === selectionId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    toggleSelection({
      selectionId,
      eventName,
      marketName,
      outcomeName: label,
      odds,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`${label} @ ${odds.toFixed(2)} for ${eventName}`}
      className={`relative flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 shadow-sm ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-slate-800/40 border-slate-700/40 text-slate-500'
          : isSelected
          ? 'bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-600/30 scale-[1.02]'
          : 'bg-slate-800/90 hover:bg-slate-700/80 border-slate-700 text-slate-200 hover:text-white'
      }`}
    >
      <span className="truncate mr-1 text-slate-300 font-medium group-aria-pressed:text-white">
        {label}
      </span>
      <span
        className={`font-mono font-bold ml-1 px-1.5 py-0.5 rounded ${
          isSelected ? 'bg-sky-700 text-white' : 'bg-slate-900/60 text-sky-400'
        }`}
      >
        {odds.toFixed(2)}
      </span>
    </button>
  );
};
