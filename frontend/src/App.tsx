import React, { useState } from 'react';
import { Header } from './components/Header';
import { WalletView } from './components/WalletView';
import { BettingView } from './components/BettingView';
import { AuthPlaceholder, KYCPlaceholder } from './components/SpecPlaceholders';

export const App: React.FC = () => {
  const [regulatoryMode, setRegulatoryMode] = useState<string>('DEMO');
  const [activeTab, setActiveTab] = useState<'sports' | 'wallet' | 'auth'>('sports');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
      <Header regulatoryMode={regulatoryMode} />

      <main style={{ maxWidth: '800px', margin: '1.5rem auto', padding: '0 1rem' }}>
        <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('sports')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeTab === 'sports' ? '#0284c7' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Sports & Betting
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeTab === 'wallet' ? '#0284c7' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Wallet & Deposit
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeTab === 'auth' ? '#0284c7' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Account / Spec Status
          </button>
        </nav>

        {activeTab === 'sports' && (
          <>
            <BettingView />
            <WalletView onModeDetected={setRegulatoryMode} />
          </>
        )}

        {activeTab === 'wallet' && (
          <WalletView onModeDetected={setRegulatoryMode} />
        )}

        {activeTab === 'auth' && (
          <>
            <AuthPlaceholder />
            <KYCPlaceholder />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
