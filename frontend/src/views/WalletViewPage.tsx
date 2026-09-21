import React from 'react';
import { WalletCard } from '../components/WalletCard';
import { TransactionList } from '../components/TransactionList';

export const WalletViewPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <WalletCard />
      <TransactionList />
    </div>
  );
};
