import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';

export interface UserBet {
  id: string;
  stake: string;
  totalOdds: string;
  potentialReturn: string;
  status: 'OPEN' | 'SETTLED' | 'WON' | 'LOST' | 'CANCELLED';
  createdAt?: string;
  selections?: {
    eventName?: string;
    outcomeName?: string;
    odds?: string;
  }[];
}

export const MyBets: React.FC = () => {
  const [bets, setBets] = useState<UserBet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'OPEN' | 'SETTLED'>('OPEN');

  const fetchBets = async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<UserBet[] | { data: UserBet[] }>('/bets');
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      const betList = Array.isArray(res.data)
        ? res.data
        : (res.data as any).data || [];
      setBets(betList);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  const openBets = bets.filter((b) => b.status === 'OPEN');
  const settledBets = bets.filter((b) => b.status !== 'OPEN');

  const currentList = tab === 'OPEN' ? openBets : settledBets;

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎟️</span> My Bets & Slip History
          </h1>
          <p className="text-xs text-slate-400">Track active wagers and settled payouts</p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTab('OPEN')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'OPEN'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Bets ({openBets.length})
          </button>
          <button
            onClick={() => setTab('SETTLED')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'SETTLED'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Settled Bets ({settledBets.length})
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : error ? (
        <ErrorState title="Failed to Load Bets" message={error} onRetry={fetchBets} />
      ) : currentList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <span className="text-4xl opacity-50">🎫</span>
          <h3 className="text-base font-bold text-slate-200">No {tab.toLowerCase()} bets found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {tab === 'OPEN'
              ? 'You do not have any active bets placed at the moment. Place a bet from the sports view!'
              : 'Settled bets will appear here once matches complete.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((bet) => (
            <div
              key={bet.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all shadow-md"
            >
              {/* Bet Header */}
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">Ref: {bet.id.slice(0, 8)}...</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      bet.status === 'OPEN'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : bet.status === 'WON'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {bet.status}
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {bet.createdAt ? new Date(bet.createdAt).toLocaleString() : 'Recent'}
                </div>
              </div>

              {/* Selections / Legs */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                {bet.selections && bet.selections.length > 0 ? (
                  bet.selections.map((sel, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{sel.outcomeName || 'Selection'}</div>
                        <div className="text-[11px] text-slate-400">{sel.eventName || 'Sports Event'}</div>
                      </div>
                      <span className="font-mono font-bold text-sky-400">@{sel.odds || '1.85'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Sportsbook Selection Leg</span>
                    <span className="font-mono font-bold text-sky-400">@{Number(bet.totalOdds).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Bet Footer Summary */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Stake</span>
                  <span className="font-mono font-bold text-slate-200">{bet.stake} PGK</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Total Odds</span>
                  <span className="font-mono font-bold text-slate-200">{Number(bet.totalOdds).toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Pot. Return</span>
                  <span className="font-mono font-bold text-emerald-400">{bet.potentialReturn} PGK</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
