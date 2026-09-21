import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BetSlipItem } from './BetSlipItem';
import { StakeInput } from './StakeInput';
import { PotentialReturn } from './PotentialReturn';
import { apiFetch } from '../api/client';

export const BetSlip: React.FC = () => {
  const {
    selections,
    removeSelection,
    clearSelections,
    balance,
    currency,
    fetchBalance,
    showToast,
    isMobileBetSlipOpen,
    setIsMobileBetSlipOpen,
    setIsDepositModalOpen,
  } = useApp();

  const [tab, setTab] = useState<'singles' | 'multi'>('singles');
  const [stake, setStake] = useState<string>('10');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numStake = Number(stake) || 0;
  const numBalance = Number(balance) || 0;

  // Compute total odds
  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);

  // Validation
  const hasSelections = selections.length > 0;
  const isValidStake = numStake > 0;
  const isBalanceSufficient = numBalance >= numStake;

  let validationError: string | null = null;
  if (!hasSelections) {
    validationError = 'Select odds from matches to build your slip.';
  } else if (!isValidStake) {
    validationError = 'Please enter a valid stake amount.';
  } else if (!isBalanceSufficient) {
    validationError = 'Insufficient balance. Please deposit funds.';
  }

  const isPlaceBetDisabled = !hasSelections || !isValidStake || !isBalanceSufficient || isSubmitting;

  const handlePlaceBet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPlaceBetDisabled) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const idempotencyKey = `bet-${Date.now()}`;
    const selectionPayload = selections.map((s) => ({ selectionId: s.selectionId }));

    const res = await apiFetch<{ betId: string; status: string; potentialReturn?: string }>('/bets', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        selections: selectionPayload,
        stake: numStake.toFixed(2),
      }),
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
      showToast(`Bet Failed: ${res.error}`, 'error');
    } else {
      const betId = res.data?.betId || 'accepted';
      showToast(`Bet Placed Successfully! Ref: ${betId.slice(0, 8)}`, 'success');
      clearSelections();
      await fetchBalance();
      if (isMobileBetSlipOpen) {
        setIsMobileBetSlipOpen(false);
      }
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
      {/* Bet Slip Header */}
      <div className="bg-slate-800/90 p-3.5 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🎟️</span>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">Bet Slip</h2>
          {selections.length > 0 && (
            <span className="bg-sky-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded-full">
              {selections.length}
            </span>
          )}
        </div>
        {selections.length > 0 && (
          <button
            onClick={clearSelections}
            className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Tabs: Singles / Multi */}
      <div className="grid grid-cols-2 bg-slate-900 p-1.5 border-b border-slate-800 gap-1">
        <button
          onClick={() => setTab('singles')}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
            tab === 'singles'
              ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Singles / Standard
        </button>
        <button
          onClick={() => setTab('multi')}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
            tab === 'multi'
              ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Multi ({selections.length})
        </button>
      </div>

      {/* Selections List */}
      <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto max-h-[380px] min-h-[140px]">
        {selections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 space-y-2">
            <span className="text-3xl opacity-60">🎯</span>
            <p className="text-xs font-medium max-w-[200px]">
              Your bet slip is empty. Click on any odds to add selections.
            </p>
          </div>
        ) : (
          selections.map((sel) => (
            <BetSlipItem key={sel.selectionId} item={sel} onRemove={removeSelection} />
          ))
        )}
      </div>

      {/* Stake & Return Section */}
      {hasSelections && (
        <div className="p-3.5 bg-slate-800/40 border-t border-slate-800 space-y-3">
          <StakeInput stake={stake} onChangeStake={setStake} currency={currency} />
          <PotentialReturn totalOdds={totalOdds} stake={numStake} currency={currency} />

          {/* Validation Error / Hint */}
          {validationError && (
            <div className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-center flex items-center justify-center gap-1.5">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {errorMsg && (
            <div className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg text-center">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          {!isBalanceSufficient && (
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <span>💳</span> Deposit Funds Now
            </button>
          )}

          <button
            type="button"
            onClick={handlePlaceBet}
            disabled={isPlaceBetDisabled}
            className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
              isPlaceBetDisabled
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </>
            ) : (
              <>
                <span>🚀</span> Place Bet ({currency} {numStake.toFixed(2)})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Bet Slip Sidebar */}
      <aside className="hidden lg:block sticky top-28">{content}</aside>

      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 p-3 backdrop-blur-md shadow-2xl">
        <button
          type="button"
          onClick={() => setIsMobileBetSlipOpen(!isMobileBetSlipOpen)}
          className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span>🎟️</span>
            <span>BET SLIP</span>
            <span className="bg-sky-700 font-mono px-2 py-0.5 rounded-full text-[11px]">
              {selections.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasSelections && (
              <span className="font-mono text-xs">
                {currency} {(numStake * totalOdds).toFixed(2)}
              </span>
            )}
            <span className="text-sm">{isMobileBetSlipOpen ? '▼' : '▲'}</span>
          </div>
        </button>
      </div>

      {/* Mobile Bottom Drawer Panel */}
      {isMobileBetSlipOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-h-[85vh] bg-slate-900 border-t border-slate-800 rounded-t-2xl overflow-hidden flex flex-col">
            <div className="flex justify-end p-2 bg-slate-900 border-b border-slate-800">
              <button
                onClick={() => setIsMobileBetSlipOpen(false)}
                className="text-slate-400 hover:text-white px-3 py-1 text-xs font-bold rounded-lg bg-slate-800"
              >
                Close ✕
              </button>
            </div>
            <div className="p-3 overflow-y-auto">{content}</div>
          </div>
        </div>
      )}
    </>
  );
};
