import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const WithdrawModal: React.FC = () => {
  const { isWithdrawModalOpen, setIsWithdrawModalOpen, currency, balance, showToast } = useApp();
  const [amount, setAmount] = useState<string>('20');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isWithdrawModalOpen) return null;

  const handleSimulatedWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > Number(balance)) {
      showToast('Requested amount exceeds current balance.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast(`Simulated Withdrawal Request of ${currency} ${amount} received (Demo mode / Coming Soon)`, 'info');
      setIsWithdrawModalOpen(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">

        <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏧</span>
            <h3 className="text-base font-bold text-white">Withdrawal Request</h3>
          </div>
          <button
            onClick={() => setIsWithdrawModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Feature status banner */}
        <div className="bg-sky-500/10 border-b border-sky-500/20 px-4 py-2 text-[11px] text-sky-300 font-medium flex items-center gap-2">
          <span>ℹ️</span>
          <span>Automated Withdrawals are in Demo / Simulated Mode for Phase 0.</span>
        </div>

        <form onSubmit={handleSimulatedWithdraw} className="p-5 space-y-4">
          <div className="space-y-1">
            <label htmlFor="withdraw-amount-input" className="block text-xs font-semibold text-slate-300">
              Withdrawal Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                {currency}
              </span>
              <input
                id="withdraw-amount-input"
                type="number"
                min="1"
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm font-bold text-white"
              />
            </div>
            <div className="text-[11px] text-slate-400">
              Available Balance: <span className="font-mono text-slate-200">{currency} {Number(balance).toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || Number(amount) <= 0}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Simulated Withdrawal Request'}
          </button>
        </form>
      </div>
    </div>
  );
};
