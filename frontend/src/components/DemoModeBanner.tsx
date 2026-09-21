import React from 'react';
import { useApp } from '../context/AppContext';

export const DemoModeBanner: React.FC = () => {
  const { regulatoryMode } = useApp();

  if (regulatoryMode === 'PRODUCTION') {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300 py-2 px-4 text-xs font-medium text-center flex items-center justify-center gap-2">
      <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
        Demo Mode
      </span>
      <span>⚠️ All money and transactions are simulated for safe testing.</span>
    </div>
  );
};
