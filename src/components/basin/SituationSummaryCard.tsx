import React from 'react';
import { Basin } from '../../types/basin';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../common/StatusBadge';
import { AlertCircle, TrendingUp, CloudRain, Clock } from 'lucide-react';

interface SituationSummaryCardProps {
  basin: Basin;
}

export const SituationSummaryCard: React.FC<SituationSummaryCardProps> = ({ basin }) => {
  const { t, isThai } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white/95 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-950/90 p-6 sm:p-7 backdrop-blur-2xl shadow-xl dark:shadow-2xl transition-colors">
      {/* Background hydro ambient light in dark mode */}
      <div className="hidden dark:block absolute -right-16 -top-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="hidden dark:block absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* Left: Basin Status Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase">
            <span>{isThai ? 'สรุปสถานการณ์ภาพรวม' : 'Basin Situation Summary'}</span>
            <span>•</span>
            <span>{t(basin.name)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t(basin.name)}
            </h2>
            <StatusBadge status={basin.overallStatus} size="lg" />
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            {t(basin.description)}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{isThai ? 'อัปเดตข้อมูลล่าสุด:' : 'Last updated:'}</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{basin.lastUpdated}</span>
          </div>
        </div>

        {/* Right: Key Summary Statistics Grid (§7) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-slate-100 dark:bg-slate-950/60 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800/90 shrink-0">
          
          {/* Watch Stations Count */}
          <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/20 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-200/60 dark:bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-1.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-700 dark:text-amber-300">
              {basin.statusSummary.watchCount}
            </span>
            <span className="text-[11px] text-amber-800 dark:text-amber-200/80 font-medium mt-0.5">
              {isThai ? 'สถานีเฝ้าระวัง' : 'Watch Stations'}
            </span>
          </div>

          {/* Rising Stations Count */}
          <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-300 dark:border-cyan-500/20 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-cyan-200/60 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-700 dark:text-cyan-400 mb-1.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-700 dark:text-cyan-300">
              {basin.statusSummary.risingCount}
            </span>
            <span className="text-[11px] text-cyan-800 dark:text-cyan-200/80 font-medium mt-0.5">
              {isThai ? 'ระดับน้ำเพิ่มขึ้น' : 'Rising Stations'}
            </span>
          </div>

          {/* Heavy Rain Stations Count */}
          <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-500/20 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-200/60 dark:bg-blue-500/10 flex items-center justify-center text-blue-700 dark:text-blue-400 mb-1.5">
              <CloudRain className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-blue-700 dark:text-blue-300">
              {basin.statusSummary.heavyRainCount}
            </span>
            <span className="text-[11px] text-blue-800 dark:text-blue-200/80 font-medium mt-0.5">
              {isThai ? 'ฝนตกหนัก' : 'Heavy Rain'}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
