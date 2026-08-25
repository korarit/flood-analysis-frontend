import React from 'react';
import { FreshnessStatus } from '../../types/basin';
import { useLanguage } from '../../hooks/useLanguage';
import { Clock, ClockAlert, RadioTower } from 'lucide-react';

interface FreshnessBadgeProps {
  freshness: FreshnessStatus;
  timestampText?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  freshness,
  timestampText,
  size = 'sm',
  className = '',
}) => {
  const { isThai } = useLanguage();

  const config = {
    fresh: {
      labelTh: 'ข้อมูลล่าสุด',
      labelEn: 'Live Fresh',
      bg: 'bg-cyan-100 dark:bg-cyan-950/60',
      text: 'text-cyan-800 dark:text-cyan-300',
      border: 'border-cyan-300 dark:border-cyan-500/30',
      icon: RadioTower,
      dotColor: 'bg-cyan-500 dark:bg-cyan-400',
    },
    delayed: {
      labelTh: 'ข้อมูลล่าช้า',
      labelEn: 'Delayed',
      bg: 'bg-amber-100 dark:bg-amber-950/60',
      text: 'text-amber-900 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-500/30',
      icon: ClockAlert,
      dotColor: 'bg-amber-500 dark:bg-amber-400',
    },
    missing: {
      labelTh: 'ไม่มีข้อมูลล่าสุด',
      labelEn: 'Missing',
      bg: 'bg-rose-100 dark:bg-rose-950/60',
      text: 'text-rose-900 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-500/30',
      icon: Clock,
      dotColor: 'bg-rose-500 dark:bg-rose-400',
    },
  }[freshness] || {
    labelTh: 'ไม่มีข้อมูลล่าสุด',
    labelEn: 'Missing',
    bg: 'bg-slate-100 dark:bg-slate-900/60',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    icon: Clock,
    dotColor: 'bg-slate-400',
  };

  const Icon = config.icon;
  const label = isThai ? config.labelTh : config.labelEn;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold px-2.5 py-0.5 backdrop-blur-sm ${config.bg} ${config.text} ${config.border} ${
        size === 'sm' ? 'text-[11px]' : 'text-xs'
      } ${className}`}
      title={`${label} ${timestampText ? `(${timestampText})` : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dotColor}`} />
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
};
