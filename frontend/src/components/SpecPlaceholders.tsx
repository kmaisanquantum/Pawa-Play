import React, { useState } from 'react';
import { apiFetch } from '../api/client';

export const AuthPlaceholder: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('+675 7000 0000');
  const [status, setStatus] = useState<string | null>(null);

  const handleAuth = async (endpoint: string) => {
    setStatus('Sending request to API...');
    const res = await apiFetch(`/auth/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ phone: phoneNumber }),
    });
    if (res.error) {
      setStatus(`[Phase 1 Spec Placeholder] ${res.error} (Endpoint '/auth/${endpoint}' is not implemented yet in Phase 0 backend)`);
    } else {
      setStatus(`Response: ${JSON.stringify(res.data)}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
      <h2 style={{ marginTop: 0, color: '#94a3b8' }}>🔐 Authentication (Phase 1 Spec)</h2>
      <div style={{ fontSize: '0.85rem', color: '#f59e0b', marginBottom: '1rem' }}>
        ⚠️ Note: User registration & OTP authentication routes are documented in <code>docs/API_SPEC.md</code> and planned for Phase 1. Currently using dev-demo JWT token.
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}
        />
        <button
          onClick={() => handleAuth('request-otp')}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#334155', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer' }}
        >
          Request OTP
        </button>
        <button
          onClick={() => handleAuth('login')}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#334155', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer' }}
        >
          Login
        </button>
      </div>
      {status && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: '#0f172a', borderRadius: '4px', fontSize: '0.85rem' }}>
          {status}
        </div>
      )}
    </div>
  );
};

export const KYCPlaceholder: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
      <h2 style={{ marginTop: 0, color: '#94a3b8' }}>🪪 KYC & Verification (Phase 1 Spec)</h2>
      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
        In DEMO mode, KYC rules are bypassed. In PRODUCTION mode, national ID & document verification routes (<code>/kyc/verify</code>) will be enforced per PNG regulation.
      </div>
    </div>
  );
};
