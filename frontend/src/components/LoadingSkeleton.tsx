import React from 'react';

interface SkeletonProps {
  type?: 'card' | 'line' | 'text' | 'button' | 'table';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({ type = 'line', count = 1, className = '' }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div key={i} className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 animate-pulse ${className}`}>
            <div className="flex justify-between items-center mb-3">
              <div className="h-4 bg-slate-700 rounded w-1/4"></div>
              <div className="h-4 bg-slate-700 rounded w-1/6"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-5 bg-slate-700 rounded w-3/4"></div>
              <div className="h-5 bg-slate-700 rounded w-2/3"></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-10 bg-slate-700/80 rounded-lg"></div>
              <div className="h-10 bg-slate-700/80 rounded-lg"></div>
              <div className="h-10 bg-slate-700/80 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((_, i) => (
        <div key={i} className={`bg-slate-700/60 rounded animate-pulse h-4 ${className}`} />
      ))}
    </div>
  );
};
