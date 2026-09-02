import React from 'react';

interface HeaderProps {
  regulatoryMode: string;
}

export const Header: React.FC<HeaderProps> = ({ regulatoryMode }) => {
  return (
    <header style={{ borderBottom: '1px solid #334155', padding: '1rem', backgroundColor: '#1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#38bdf8' }}>PawaPlay</h1>
        <div>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              backgroundColor: regulatoryMode === 'PRODUCTION' ? '#dc2626' : '#eab308',
              color: '#0f172a',
            }}
          >
            {regulatoryMode ? `${regulatoryMode} MODE` : 'DEMO MODE'}
          </span>
        </div>
      </div>
      {regulatoryMode !== 'PRODUCTION' && (
        <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '0.5rem', color: '#fde047' }}>
          ⚠️ DEMO MODE — All money and transactions are simulated. Safe for testing.
        </div>
      )}
    </header>
  );
};
