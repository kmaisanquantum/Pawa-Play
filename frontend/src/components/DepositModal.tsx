import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../api/client';

export const DepositModal: React.FC = () => {
  const {
    isDepositModalOpen,
    setIsDepositModalOpen,
    fetchBalance,
    currency,
    regulatoryMode,
    showToast,
  } = useApp();

  const [step, setStep] = useState<'amount' | 'method' | 'confirm'>('amount');
  const [amount, setAmount] = useState<string>('50');
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card' | 'bank'>('mobile');
  const [mobileNumber, setMobileNumber] = useState<string>('+675 7000 0000');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isDepositModalOpen) return null;

  const presets = ['10', '20', '50', '100', '200'];

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Please enter a valid deposit amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const idempotencyKey = `dep-${Date.now()}`;
    const res = await apiFetch<{ transactionId: string; status: string }>('/wallet/deposit', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ amount }),
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
      showToast(`Deposit failed: ${res.error}`, 'error');
    } else {
      const txnId = res.data?.transactionId || 'accepted';
      showToast(`Deposit Successful! Received ${currency} ${amount} (Txn: ${txnId.slice(0, 8)})`, 'success');
      await fetchBalance();
      setIsDepositModalOpen(false);
      setStep('amount');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">

        {/* Modal Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💳</span>
            <h3 className="text-base font-bold text-white">Deposit Funds</h3>
          </div>
          <button
            onClick={() => setIsDepositModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Demo Mode Notice */}
        {regulatoryMode !== 'PRODUCTION' && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-[11px] text-amber-300 font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>Demo deposit — no real money will be transferred from your bank or wallet.</span>
          </div>
        )}

        {/* Modal Body / Steps */}
        <div className="p-5 space-y-4">
          {step === 'amount' && (
            <div className="space-y-4">
              <label htmlFor="deposit-amount-input" className="block text-xs font-semibold text-slate-300">
                1. Select or Enter Deposit Amount ({currency})
              </label>

              <div className="grid grid-cols-5 gap-1.5">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2 text-xs font-bold font-mono rounded-lg border transition-all ${
                      amount === preset
                        ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                  {currency}
                </span>
                <input
                  id="deposit-amount-input"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-base font-bold text-white focus:border-sky-500"
                  placeholder="Enter amount"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep('method')}
                disabled={!amount || Number(amount) <= 0}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg"
              >
                Continue to Payment Method →
              </button>
            </div>
          )}

          {step === 'method' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>2. Select Payment Method</span>
                <button
                  onClick={() => setStep('amount')}
                  className="text-sky-400 hover:underline text-[11px]"
                >
                  ← Change Amount ({currency} {amount})
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'mobile', name: 'Mobile Money (Digicel Cellmoni / MiCash)', icon: '📱' },
                  { id: 'bank', name: 'Bank Transfer (BSP / Kina Bank)', icon: '🏦' },
                  { id: 'card', name: 'Debit / Credit Card', icon: '💳' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      paymentMethod === m.id
                        ? 'bg-sky-600/20 border-sky-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{m.icon}</span>
                      <span>{m.name}</span>
                    </div>
                    {paymentMethod === m.id && <span className="text-sky-400 font-bold">✓</span>}
                  </button>
                ))}
              </div>

              {paymentMethod === 'mobile' && (
                <div className="space-y-1.5 pt-2">
                  <label htmlFor="mobile-wallet-number" className="block text-xs text-slate-400">Mobile Wallet Number</label>
                  <input
                    id="mobile-wallet-number"
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg"
              >
                Review Deposit ({currency} {amount}) →
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-300">3. Confirm Deposit Request</div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Amount:</span>
                  <span className="font-mono font-bold text-emerald-400">{currency} {Number(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-slate-200 capitalize">{paymentMethod} Payment</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Fee:</span>
                  <span className="font-mono text-slate-200">0.00 {currency}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('method')}
                  className="w-1/3 py-3 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold rounded-xl"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleDeposit}
                  disabled={isSubmitting}
                  className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Processing...
                    </>
                  ) : (
                    'Confirm Deposit'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
