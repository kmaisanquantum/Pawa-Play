import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { DemoModeBanner } from './components/DemoModeBanner';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { ToastNotification } from './components/ToastNotification';
import { Footer } from './components/Footer';

import { SportsView } from './views/SportsView';
import { LiveView } from './views/LiveView';
import { MyBets } from './components/MyBets';
import { WalletViewPage } from './views/WalletViewPage';
import { PromotionsView } from './views/PromotionsView';
import { AccountMenu } from './components/AccountMenu';
import { ResponsibleGambling } from './components/ResponsibleGambling';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
          <DemoModeBanner />
          <Header />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/sports" replace />} />
              <Route path="/sports" element={<SportsView />} />
              <Route path="/live" element={<LiveView />} />
              <Route path="/my-bets" element={<div className="max-w-4xl mx-auto px-4 py-6"><MyBets /></div>} />
              <Route path="/wallet" element={<WalletViewPage />} />
              <Route path="/promotions" element={<PromotionsView />} />
              <Route path="/account" element={<div className="max-w-4xl mx-auto px-4 py-6"><AccountMenu /></div>} />
              <Route path="/responsible-gambling" element={<div className="max-w-4xl mx-auto px-4 py-6"><ResponsibleGambling /></div>} />
              <Route path="*" element={<Navigate to="/sports" replace />} />
            </Routes>
          </main>

          <DepositModal />
          <WithdrawModal />
          <ToastNotification />
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
