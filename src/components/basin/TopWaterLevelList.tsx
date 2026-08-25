import React from 'react';
import { Link } from '@tanstack/react-router';
import { Station } from '../../types/station';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../common/StatusBadge';
import { Waves, ArrowRight, MapPin } from 'lucide-react';

interface TopWaterLevelListProps {
  stations: Station[];
  basinSlug: string;
}

export const TopWaterLevelList: React.FC<TopWaterLevelListProps> = ({
  stations,
  basinSlug,
}) => {
  const { t, isThai } = useLanguage();

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/70 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <Waves className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{isThai ? 'สถานีระดับน้ำเฝ้าระวังสูงสุด' : 'Highest Water Level Stations'}</span>
          </div>
          <Link
            to="/basin/$basinSlug/station"
            params={{ basinSlug }}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 inline-flex items-center gap-1 hover:underline font-bold"
          >
            <span>{isThai ? 'ดูทั้งหมด' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {stations.map((st, idx) => {
            const wl = st.waterLevel;
            return (
              <Link
                key={st.id}
                to="/basin/$basinSlug/station/$stationId"
                params={{ basinSlug, stationId: st.id }}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-400 dark:hover:border-cyan-500/30 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-800 dark:text-slate-300 shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400">
                        {st.code}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
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
                    <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                      {wl?.waterLevelMsl} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">{isThai ? 'ม.รทก.' : 'm MSL'}</span>
                    </div>
                    {wl && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
                        {wl.bankCapacityPercent}% {isThai ? 'ตลิ่ง' : 'cap'}
                      </div>
                    )}
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
