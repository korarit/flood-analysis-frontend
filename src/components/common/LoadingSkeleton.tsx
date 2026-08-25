import React from 'react';

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-background-card/60 p-5 shadow-md backdrop-blur-md animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 w-48 bg-slate-200/80 dark:bg-slate-800/80 rounded"></div>
            <div className="h-3 w-64 bg-slate-200/50 dark:bg-slate-800/50 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/50">
            <div className="h-10 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl"></div>
            <div className="h-10 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/80 p-6 shadow-md backdrop-blur-md animate-pulse ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-32 bg-slate-200/60 dark:bg-slate-800/60 rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>
      <div className="h-64 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl flex items-end p-4 gap-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-300 dark:bg-slate-800/80 rounded-t w-full"
            style={{ height: `${Math.max(20, Math.sin(i) * 60 + 30)}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};
