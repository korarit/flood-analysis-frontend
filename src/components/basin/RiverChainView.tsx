import React from 'react';
import { Link } from '@tanstack/react-router';
import { Station } from '../../types/station';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../common/StatusBadge';
import { Waves, ArrowDown, ExternalLink } from 'lucide-react';

interface RiverChainViewProps {
  stations: Station[];
  basinSlug: string;
}

export const RiverChainView: React.FC<RiverChainViewProps> = ({ stations, basinSlug }) => {
  const { t, isThai } = useLanguage();

  if (!stations || stations.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/70 p-6 backdrop-blur-xl shadow-xl space-y-5 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <Waves className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{isThai ? 'แผนผังสถานการณ์น้ำตามแนวแม่น้ำ' : 'River Flow Chain Profile'}</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            {isThai ? 'การไหลของน้ำจากต้นน้ำสู่ปลายน้ำ' : 'Upstream to Downstream Flow Cascade'}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>{isThai ? 'ปกติ (<70%)' : 'Normal'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>{isThai ? 'เฝ้าระวัง (70-85%)' : 'Watch'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>{isThai ? 'เตือนภัย (>85%)' : 'Warning'}</span>
          </div>
        </div>
      </div>

      {/* Chain Stream Line */}
      <div className="relative pt-2 pb-4 overflow-x-auto">
        <div className="min-w-[700px] flex items-center justify-between gap-3 relative">
          
          {/* Connecting Flow Pipe */}
          <div className="absolute top-1/2 left-6 right-6 h-2 -translate-y-1/2 bg-gradient-to-r from-cyan-300 via-cyan-500 to-blue-500 dark:from-cyan-900 dark:via-cyan-600 dark:to-blue-900 rounded-full z-0 opacity-40" />

          {stations.map((st, idx) => {
            const wl = st.waterLevel;
            const fillPct = wl?.bankCapacityPercent || 0;
            const isUpstream = idx === 0;
            const isDownstream = idx === stations.length - 1;

            const ringColor =
              fillPct >= 85
                ? 'border-rose-500 shadow-sm dark:shadow-glow-status-critical'
                : fillPct >= 70
                ? 'border-amber-500 shadow-sm dark:shadow-glow-status-watch'
                : 'border-cyan-400 dark:border-cyan-500 shadow-sm dark:shadow-glow-cyan';

            return (
              <div key={st.id} className="relative z-10 flex flex-col items-center flex-1 group">
                
                {/* Stage Tag */}
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-bold">
                  {isUpstream
                    ? isThai
                      ? 'ต้นน้ำ'
                      : 'Upstream'
                    : isDownstream
                    ? isThai
                      ? 'ปลายน้ำ'
                      : 'Downstream'
                    : isThai
                    ? `ตอน ${idx + 1}`
                    : `Node ${idx + 1}`}
                </span>

                {/* Node Box */}
                <Link
                  to="/basin/$basinSlug/station/$stationId"
                  params={{ basinSlug, stationId: st.id }}
                  className={`w-full max-w-[130px] rounded-2xl border bg-white dark:bg-slate-900/95 p-3 text-center transition-all hover:scale-105 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-sm ${ringColor}`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
                      {st.code}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={t(st.name)}>
                    {t(st.name)}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-left space-y-1">
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono flex justify-between">
                      <span>{isThai ? 'ระดับ' : 'Level'}:</span>
                      <span className="text-cyan-700 dark:text-cyan-300 font-bold">{wl?.waterLevelMsl} ม.</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono flex justify-between">
                      <span>{isThai ? 'อัตราไหล' : 'Q'}:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{wl?.discharge} m³/s</span>
                    </div>
                  </div>

                  {/* Fill progress */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${
                        fillPct >= 85
                          ? 'bg-rose-500'
                          : fillPct >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, fillPct)}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 text-right mt-0.5 font-medium">
                    {fillPct}% {isThai ? 'ตลิ่ง' : 'cap'}
                  </div>
                </Link>

                {/* Arrow connector between nodes */}
                {!isDownstream && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden">
                    <ArrowDown className="w-4 h-4 text-cyan-500 -rotate-90 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};
