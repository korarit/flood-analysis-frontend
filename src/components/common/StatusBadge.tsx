import React from 'react';
import { SituationStatus } from '../../types/basin';
import { useLanguage } from '../../hooks/useLanguage';
import { ShieldCheck, AlertCircle, AlertTriangle, Flame, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: SituationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const { isThai } = useLanguage();

  const config: Record<
    SituationStatus,
    { labelTh: string; labelEn: string; bg: string; text: string; border: string; glow: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    normal: {
      labelTh: 'ปกติ',
      labelEn: 'Normal',
      bg: 'bg-emerald-100 dark:bg-emerald-950/70',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-500/40',
      glow: 'shadow-xs dark:shadow-glow-status-normal',
      icon: ShieldCheck,
    },
    watch: {
      labelTh: 'เฝ้าระวัง',
      labelEn: 'Watch',
      bg: 'bg-amber-100 dark:bg-amber-950/70',
      text: 'text-amber-900 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-500/40',
      glow: 'shadow-xs dark:shadow-glow-status-watch',
      icon: AlertCircle,
    },
    warning: {
      labelTh: 'เตือนภัย',
      labelEn: 'Warning',
      bg: 'bg-orange-100 dark:bg-orange-950/70',
      text: 'text-orange-900 dark:text-orange-300',
      border: 'border-orange-300 dark:border-orange-500/50',
      glow: 'shadow-xs dark:shadow-glow-status-warning',
      icon: AlertTriangle,
    },
    critical: {
      labelTh: 'วิกฤต',
      labelEn: 'Critical',
      bg: 'bg-rose-100 dark:bg-rose-950/80',
      text: 'text-rose-900 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-500/60',
      glow: 'shadow-xs dark:shadow-glow-status-critical',
      icon: Flame,
    },
    missing: {
      labelTh: 'ไม่มีข้อมูล',
      labelEn: 'No Data',
      bg: 'bg-slate-100 dark:bg-slate-900/80',
      text: 'text-slate-700 dark:text-slate-400',
      border: 'border-slate-300 dark:border-slate-700',
      glow: '',
      icon: HelpCircle,
    },
  };

  const item = config[status] || config.normal;
  const Icon = item.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-bold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border transition-all ${item.bg} ${item.text} ${item.border} ${item.glow} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{isThai ? item.labelTh : item.labelEn}</span>
    </span>
  );
};
