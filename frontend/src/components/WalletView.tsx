import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

interface WalletViewProps {
  onModeDetected: (mode: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onModeDetected }) => {
  const [balance, setBalance] = useState<string>('0.00');
  const [currency, setCurrency] = useState<string>('PGK');
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    const res = await apiFetch<{ currencyCode: string; balance: string; regulatoryMode: string }>('/wallet/balance');
    setLoading(false);
    if (res.data) {
      setBalance(res.data.balance);
      setCurrency(res.data.currencyCode);
      if (res.data.regulatoryMode) onModeDetected(res.data.regulatoryMode);
    } else if (res.regulatoryMode) {
      onModeDetected(res.regulatoryMode);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;

    setLoading(true);
    setMessage(null);
    const idempotencyKey = `dep-${Date.now()}`;
    const res = await apiFetch<{ transactionId: string; status: string }>('/wallet/deposit', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ amount: depositAmount }),
    });
    setLoading(false);

    if (res.error) {
      setMessage(`Deposit error: ${res.error}`);
    } else {
      setMessage(`Successfully deposited ${currency} ${depositAmount} (Txn: ${res.data?.transactionId})`);
      fetchBalance();
    }
  };

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
      <h2 style={{ marginTop: 0, color: '#38bdf8' }}>💰 Wallet</h2>
      <div style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Current Balance: <strong>{currency} {balance}</strong>
      </div>

      <form onSubmit={handleDeposit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label htmlFor="deposit-amount" style={{ fontWeight: 'bold' }}>Demo Deposit Amount:</label>
        <input
          id="deposit-amount"
          type="number"
          min="1"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', width: '100px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}
    </div>
  );
};
