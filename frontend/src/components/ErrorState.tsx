import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an issue loading this information. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 text-center my-4 flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
        ⚠️
      </div>
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
