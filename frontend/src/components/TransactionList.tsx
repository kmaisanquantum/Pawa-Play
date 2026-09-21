import React, { useState } from 'react';

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WINNING';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
  reference?: string;
}

interface TransactionListProps {
  transactions?: WalletTransaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'BET'>('ALL');

  // Fallback demo/simulated recent transactions if none passed from parent
  const demoTxns: WalletTransaction[] = transactions && transactions.length > 0 ? transactions : [
    {
      id: 'tx-dep-100',
      type: 'DEPOSIT',
      amount: 50.00,
      status: 'COMPLETED',
      timestamp: 'Today, 10:15 AM',
      reference: 'dep-demo-1710001',
    },
    {
      id: 'tx-bet-101',
      type: 'BET',
      amount: -10.00,
      status: 'COMPLETED',
      timestamp: 'Today, 10:20 AM',
      reference: 'bet-8f2a1b9c',
    },
    {
      id: 'tx-win-102',
      type: 'WINNING',
      amount: 18.50,
      status: 'COMPLETED',
      timestamp: 'Yesterday, 04:30 PM',
      reference: 'payout-4d9e0f',
    },
  ];

  const filtered = demoTxns.filter((t) => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📜</span> Recent Wallet Transactions
          </h3>
          <span className="text-xs text-slate-400">Activity log & payment history</span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
          {(['ALL', 'DEPOSIT', 'BET'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No transactions match your filter.</div>
        ) : (
          filtered.map((tx) => {
            const isPositive = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                      tx.type === 'DEPOSIT'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : tx.type === 'WINNING'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' ? '↓' : tx.type === 'WINNING' ? '★' : '↑'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {tx.type} {tx.reference && <span className="text-slate-500 font-mono text-[10px]">({tx.reference})</span>}
                    </div>
                    <div className="text-[11px] text-slate-400">{tx.timestamp}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-bold font-mono ${
                      isPositive ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {isPositive ? '+' : ''}{tx.amount.toFixed(2)} PGK
                  </div>
                  <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold rounded bg-slate-800 text-emerald-400 border border-emerald-500/20 uppercase">
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
