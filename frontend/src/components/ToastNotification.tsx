import React from 'react';
import { useApp } from '../context/AppContext';

export const ToastNotification: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-slate-800 border-slate-700 text-slate-100';
        let icon = 'ℹ️';

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-950 border-emerald-700 text-emerald-200';
          icon = '✅';
        } else if (toast.type === 'error') {
          bgColor = 'bg-rose-950 border-rose-700 text-rose-200';
          icon = '❌';
        } else if (toast.type === 'warning') {
          bgColor = 'bg-amber-950 border-amber-700 text-amber-200';
          icon = '⚠️';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg border shadow-xl text-sm font-medium transition-all transform translate-y-0 ${bgColor}`}
            role="alert"
          >
            <div className="flex items-center gap-2.5">
              <span>{icon}</span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md text-xs font-bold"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
