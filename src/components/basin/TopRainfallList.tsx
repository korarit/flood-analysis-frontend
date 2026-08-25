import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Station } from '../../types/station';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../common/StatusBadge';
import { CloudRain, ArrowRight, MapPin } from 'lucide-react';

interface TopRainfallListProps {
  getTopRain: (interval: '1h' | '3h' | '6h' | '24h') => Station[];
  basinSlug: string;
}

export const TopRainfallList: React.FC<TopRainfallListProps> = ({
  getTopRain,
  basinSlug,
}) => {
  const { t, isThai } = useLanguage();
  const [interval, setInterval] = useState<'1h' | '3h' | '6h' | '24h'>('24h');

  const stations = getTopRain(interval);

  const getRainValue = (st: Station) => {
    if (!st.rainfall) return 0;
    if (interval === '1h') return st.rainfall.rain1h;
    if (interval === '3h') return st.rainfall.rain3h;
    if (interval === '6h') return st.rainfall.rain6h;
    return st.rainfall.rain24h;
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/70 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-colors">
      <div>
        {/* Header & Interval Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{isThai ? 'ปริมาณฝนสะสมสูงสุด' : 'Top Rainfall Stations'}</span>
          </div>

          {/* Time Interval Tabs (§34) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800 self-start sm:self-auto shadow-xs">
            {(['1h', '3h', '6h', '24h'] as const).map((intv) => (
              <button
                key={intv}
                onClick={() => setInterval(intv)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  interval === intv
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                {intv === '1h'
                  ? isThai
                    ? '1 ชม.'
                    : '1h'
                  : intv === '3h'
                  ? isThai
                    ? '3 ชม.'
                    : '3h'
                  : intv === '6h'
                  ? isThai
                    ? '6 ชม.'
                    : '6h'
                  : isThai
                  ? '24 ชม.'
                  : '24h'}
              </button>
            ))}
          </div>
        </div>

        {/* Stations List */}
        <div className="space-y-3">
          {stations.map((st, idx) => {
            const rainVal = getRainValue(st);
            return (
              <Link
                key={st.id}
                to="/basin/$basinSlug/station/$stationId"
                params={{ basinSlug, stationId: st.id }}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500/30 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-mono text-xs font-bold text-blue-800 dark:text-blue-300 shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                        {st.code}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                        {t(st.name)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {t(st.geocode.amphoe)}, จ.{t(st.geocode.province)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
                      {rainVal} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">มม.</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {isThai ? `ช่วง ${interval}` : `${interval} interval`}
                    </div>
                  </div>
                  <StatusBadge status={st.status} size="sm" showIcon={false} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
