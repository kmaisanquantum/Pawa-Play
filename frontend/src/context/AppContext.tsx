import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/client';

export interface BetSelection {
  selectionId: string;
  eventName: string;
  marketName: string;
  outcomeName: string;
  odds: number;
  eventId?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  // Selections / Bet Slip
  selections: BetSelection[];
  toggleSelection: (sel: BetSelection) => void;
  removeSelection: (selectionId: string) => void;
  clearSelections: () => void;

  // Wallet
  balance: string;
  currency: string;
  fetchBalance: () => Promise<void>;

  // Regulatory
  regulatoryMode: string;
  setRegulatoryMode: (mode: string) => void;

  // Modals & Mobile
  isMobileBetSlipOpen: boolean;
  setIsMobileBetSlipOpen: (open: boolean) => void;
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [balance, setBalance] = useState<string>('0.00');
  const [currency, setCurrency] = useState<string>('PGK');
  const [regulatoryMode, setRegulatoryMode] = useState<string>('DEMO');

  const [isMobileBetSlipOpen, setIsMobileBetSlipOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleSelection = useCallback((sel: BetSelection) => {
    setSelections((prev) => {
      const exists = prev.some((item) => item.selectionId === sel.selectionId);
      if (exists) {
        return prev.filter((item) => item.selectionId !== sel.selectionId);
      } else {
        // If single match selection replacement or appending
        return [...prev, sel];
      }
    });
  }, []);

  const removeSelection = useCallback((selectionId: string) => {
    setSelections((prev) => prev.filter((item) => item.selectionId !== selectionId));
  }, []);

  const clearSelections = useCallback(() => {
    setSelections([]);
  }, []);

  const fetchBalance = useCallback(async () => {
    const res = await apiFetch<{ currencyCode: string; balance: string; regulatoryMode: string }>('/wallet/balance');
    if (res.data) {
      setBalance(res.data.balance);
      if (res.data.currencyCode) setCurrency(res.data.currencyCode);
      if (res.data.regulatoryMode) setRegulatoryMode(res.data.regulatoryMode);
    } else if (res.regulatoryMode) {
      setRegulatoryMode(res.regulatoryMode);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <AppContext.Provider
      value={{
        selections,
        toggleSelection,
        removeSelection,
        clearSelections,
        balance,
        currency,
        fetchBalance,
        regulatoryMode,
        setRegulatoryMode,
        isMobileBetSlipOpen,
        setIsMobileBetSlipOpen,
        isDepositModalOpen,
        setIsDepositModalOpen,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
