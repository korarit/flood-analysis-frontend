import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: string;
  badge?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  badge,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-background-card/80 p-5 backdrop-blur-md shadow-md dark:shadow-lg transition-all hover:border-slate-300 dark:hover:border-slate-700/80 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/50 border border-cyan-300 dark:border-cyan-500/20 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wide uppercase">{title}</span>
        </div>
        {badge}
      </div>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
          {value}
        </span>
        {unit && <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">{unit}</span>}
      </div>
      {subtitle && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium truncate">{subtitle}</p>}
    </div>
  );
};
