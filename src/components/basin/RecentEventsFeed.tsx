import React from 'react';
import { Link } from '@tanstack/react-router';
import { WaterAlertEvent } from '../../types/alert';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../common/StatusBadge';
import { Bell, TrendingUp, CloudRain, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

interface RecentEventsFeedProps {
  events: WaterAlertEvent[];
  basinSlug: string;
}

export const RecentEventsFeed: React.FC<RecentEventsFeedProps> = ({ events, basinSlug }) => {
  const { t, isThai } = useLanguage();

  const getIcon = (type: WaterAlertEvent['type']) => {
    switch (type) {
      case 'rapid_rise':
        return TrendingUp;
      case 'heavy_rain':
        return CloudRain;
      case 'bank_overflow':
      case 'warning_level':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/70 p-6 backdrop-blur-xl shadow-xl space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{isThai ? 'เหตุการณ์และการแจ้งเตือนล่าสุด' : 'Recent Events & Alerts'}</span>
        </div>
        <Link
          to="/basin/$basinSlug/event"
          params={{ basinSlug }}
          className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 inline-flex items-center gap-1 hover:underline font-bold"
        >
          <span>{isThai ? 'ดูกระดานเหตุการณ์ทั้งหมด' : 'All Events'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.slice(0, 3).map((event) => {
          const Icon = getIcon(event.type);
          return (
            <div
              key={event.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {t(event.title)}
                    </span>
                    <StatusBadge status={event.severity} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {t(event.description)}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    <span className="font-mono text-cyan-700 dark:text-cyan-400 font-bold">{event.stationCode}</span>
                    <span>•</span>
                    <span>{event.relativeTime}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/basin/$basinSlug/station/$stationId"
                params={{ basinSlug, stationId: event.stationId }}
                className="self-end sm:self-center shrink-0 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all active:scale-95 shadow-xs"
              >
                {isThai ? 'ตรวจสอบสถานี' : 'Inspect'}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
