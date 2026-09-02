import React, { useState } from 'react';
import { apiFetch } from '../api/client';

export const BettingView: React.FC = () => {
  const [selectionId, setSelectionId] = useState<string>('sel-match1-home');
  const [stake, setStake] = useState<string>('10.00');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);

  const handlePlaceBet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const idempotencyKey = `bet-${Date.now()}`;
    const res = await apiFetch<{ betId: string; status: string }>('/bets', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        selections: [{ selectionId }],
        stake,
      }),
    });

    setLoading(false);
    if (res.error) {
      setResult(`Bet Error: ${res.error}`);
    } else {
      setResult(`Bet Placed Successfully! ID: ${res.data?.betId || 'accepted'}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
      <h2 style={{ marginTop: 0, color: '#38bdf8' }}>🎲 Sports Betting / Bet Slip</h2>

      <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#0f172a', borderRadius: '6px' }}>
        <strong>Available Demo Match:</strong>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          PNG Hunters vs. Brisbane Tigers (Rugby League)
        </div>
      </div>

      <form onSubmit={handlePlaceBet} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
        <div>
          <label htmlFor="selection-select" style={{ display: 'block', marginBottom: '0.25rem' }}>Selection:</label>
          <select
            id="selection-select"
            value={selectionId}
            onChange={(e) => setSelectionId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}
          >
            <option value="sel-match1-home">PNG Hunters Win (@ 1.85)</option>
            <option value="sel-match1-draw">Draw (@ 15.00)</option>
            <option value="sel-match1-away">Brisbane Tigers Win (@ 2.10)</option>
          </select>
        </div>

        <div>
          <label htmlFor="stake-input" style={{ display: 'block', marginBottom: '0.25rem' }}>Stake (PGK):</label>
          <input
            id="stake-input"
            type="number"
            min="1"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            backgroundColor: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Submitting...' : 'Place Bet'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#0f172a', borderRadius: '4px' }}>
          {result}
        </div>
      )}
    </div>
  );
};
