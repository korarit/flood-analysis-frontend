import React from 'react';
import { TrendDirection } from '../../types/station';
import { useLanguage } from '../../hooks/useLanguage';
import { TrendingUp, TrendingDown, MoveRight } from 'lucide-react';

interface TrendIndicatorProps {
  trend: TrendDirection;
  deltaPerHour?: number;
  showDelta?: boolean;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  trend,
  deltaPerHour,
  showDelta = true,
  unit,
  size = 'md',
  className = '',
}) => {
  const { isThai } = useLanguage();
  const defaultUnit = unit || (isThai ? 'ม./ชม.' : 'm/h');

  const config = {
    rising: {
      labelTh: 'เพิ่มขึ้น',
      labelEn: 'Rising',
      icon: TrendingUp,
      color: 'text-amber-800 dark:text-amber-300',
      bg: 'bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-500/40',
      symbol: '↑',
    },
    steady: {
      labelTh: 'ทรงตัว',
      labelEn: 'Steady',
      icon: MoveRight,
      color: 'text-cyan-900 dark:text-cyan-300',
      bg: 'bg-cyan-100 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-500/40',
      symbol: '→',
    },
    falling: {
      labelTh: 'ลดลง',
      labelEn: 'Falling',
      icon: TrendingDown,
      color: 'text-emerald-800 dark:text-emerald-300',
      bg: 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-500/40',
      symbol: '↓',
    },
  }[trend];

  const Icon = config.icon;
  const label = isThai ? config.labelTh : config.labelEn;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2 font-semibold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-semibold ${config.bg} ${config.color} ${sizeClasses} ${className}`}
      title={`${label} ${deltaPerHour !== undefined ? `(${deltaPerHour > 0 ? '+' : ''}${deltaPerHour} ${defaultUnit})` : ''}`}
    >
      <Icon className={`${iconSizes} shrink-0`} />
      <span>{label}</span>
      {showDelta && deltaPerHour !== undefined && (
        <span className="font-mono text-xs ml-0.5">
          ({deltaPerHour > 0 ? `+${deltaPerHour}` : deltaPerHour} {defaultUnit})
        </span>
      )}
    </span>
  );
};
