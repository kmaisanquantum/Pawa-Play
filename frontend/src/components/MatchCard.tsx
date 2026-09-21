import React from 'react';
import { OddsButton } from './OddsButton';

export interface MatchSelection {
  id: string;
  name: string;
  odds: number;
}

export interface MatchMarket {
  id: string;
  name: string; // e.g. "Match Winner (1X2)"
  selections: MatchSelection[];
}

export interface MatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  sportName: string;
  startTime: string;
  status?: string; // 'LIVE', 'SCHEDULED', 'FINISHED'
  score?: string;
  markets: MatchMarket[];
}

interface MatchCardProps {
  match: MatchData;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const primaryMarket = match.markets && match.markets.length > 0 ? match.markets[0] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all shadow-md">
      {/* Header: Competition & Time */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">{match.leagueName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {match.status === 'LIVE' ? (
            <span className="flex items-center gap-1 bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> LIVE
            </span>
          ) : (
            <span className="text-slate-400 font-mono text-[11px]">{match.startTime}</span>
          )}
        </div>
      </div>

      {/* Main Event Body */}
      <div className="mb-4">
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-bold text-slate-100">{match.homeTeam}</span>
          {match.score && <span className="font-mono text-sm font-bold text-sky-400">{match.score.split('-')[0]}</span>}
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-bold text-slate-100">{match.awayTeam}</span>
          {match.score && <span className="font-mono text-sm font-bold text-sky-400">{match.score.split('-')[1]}</span>}
        </div>
      </div>

      {/* Primary Betting Market Selections */}
      {primaryMarket ? (
        <div className="space-y-1.5">
          <div className="text-[11px] text-slate-400 font-medium">{primaryMarket.name}</div>
          <div className="grid grid-cols-3 gap-2">
            {primaryMarket.selections.map((sel) => (
              <OddsButton
                key={sel.id}
                selectionId={sel.id}
                label={sel.name}
                odds={sel.odds}
                eventName={`${match.homeTeam} vs ${match.awayTeam}`}
                marketName={primaryMarket.name}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500 italic py-2">No markets available</div>
      )}
    </div>
  );
};
