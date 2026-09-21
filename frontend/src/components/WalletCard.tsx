import React from 'react';
import { useApp } from '../context/AppContext';

export const WalletCard: React.FC = () => {
  const { balance, currency, regulatoryMode, setIsDepositModalOpen, setIsWithdrawModalOpen } = useApp();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Main Sportsbook Wallet</span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>💰</span> Wallet Balance
          </h2>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
            regulatoryMode === 'PRODUCTION'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}
        >
          {regulatoryMode ? `${regulatoryMode} MODE` : 'DEMO'}
        </span>
      </div>

      <div className="my-5">
        <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-400">
          {currency} {Number(balance).toFixed(2)}
        </span>
        <div className="text-xs text-slate-400 mt-1">Available for betting & payout</div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => setIsDepositModalOpen(true)}
          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          <span>💳</span> Deposit Funds
        </button>

        <button
          onClick={() => setIsWithdrawModalOpen(true)}
          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span>🏧</span> Withdraw
        </button>
      </div>
    </div>
  );
};
