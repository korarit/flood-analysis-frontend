import React, { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useBasin } from '../../hooks/useBasin';
import { useLanguage } from '../../hooks/useLanguage';
import { getAlertsForBasin } from '../../services/alertService';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Bell,
  TrendingUp,
  CloudRain,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export function EventsAndAlertsPage() {
  const { basinSlug } = useParams({ strict: false }) as { basinSlug?: string };
  const currentSlug = basinSlug || 'yom';
  const { basin } = useBasin(currentSlug);
  const { t, isThai } = useLanguage();

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'watch'>('all');
  const allEvents = getAlertsForBasin(currentSlug);

  const filteredEvents = allEvents.filter((ev) => {
    if (filterSeverity === 'all') return true;
    return ev.severity === filterSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-8 backdrop-blur-2xl shadow-md dark:shadow-xl space-y-3 transition-colors">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold">
          <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{isThai ? 'กระดานติดตามเหตุการณ์และแจ้งเตือนภัย' : 'Real-time Event & Alert Timeline'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {isThai ? `การแจ้งเตือนและเหตุการณ์ ${t(basin?.name || '')}` : `${t(basin?.name || '')} Events & Alerts`}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
          {isThai
            ? 'ประมวลผลอัตโนมัติจากเกณฑ์เตือนภัยอุทกวิทยา: ระดับน้ำเพิ่มขึ้นเร็วผิดปกติ, ฝนตกหนักพื้นที่ต้นน้ำ, และระดับน้ำใกล้ล้นตลิ่ง'
            : 'Automated hydrological detections: rapid water rise, heavy upstream precipitation, and river bank overflow warnings.'}
        </p>
      </div>

      {/* Rules Criteria Summary (§38) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            <TrendingUp className="w-4 h-4" />
            <span>{isThai ? 'เกณฑ์น้ำขึ้นเร็ว (Rapid Rise)' : 'Rapid Rise Threshold'}</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {isThai ? 'ระดับน้ำเพิ่มขึ้น > 0.20 ม./ชม. ติดต่อกัน' : 'Rise rate > 0.20 m/h consecutively'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
            <CloudRain className="w-4 h-4" />
            <span>{isThai ? 'เกณฑ์ฝนตกหนัก (Heavy Rain)' : 'Heavy Rain Threshold'}</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {isThai ? 'ฝน 1 ชม. > 30 มม. หรือ 24 ชม. > 80 มม.' : '1h Rain > 30mm or 24h Rain > 80mm'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>{isThai ? 'เกณฑ์ระดับตลิ่ง (Bank Capacity)' : 'Bank Capacity Threshold'}</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {isThai ? 'ระดับน้ำเกิน 70% (เฝ้าระวัง) และ 85% (เตือนภัย)' : 'Water level > 70% (Watch) & 85% (Warning)'}
          </p>
        </div>
      </div>

      {/* Severity Filter Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 dark:bg-background-card/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-xs transition-colors">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-bold">{isThai ? 'กรองตามความรุนแรง:' : 'Severity:'}</span>
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterSeverity === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:text-slate-200'
            }`}
          >
            {isThai ? 'ทั้งหมด' : 'All'}
          </button>
          <button
            onClick={() => setFilterSeverity('critical')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterSeverity === 'critical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-rose-700 dark:text-rose-400 hover:bg-slate-200'
            }`}
          >
            {isThai ? '🔴 วิกฤต' : 'Critical'}
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterSeverity === 'warning'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-orange-700 dark:text-orange-400 hover:bg-slate-200'
            }`}
          >
            {isThai ? '🟠 เตือนภัย' : 'Warning'}
          </button>
          <button
            onClick={() => setFilterSeverity('watch')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterSeverity === 'watch'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-amber-700 dark:text-amber-400 hover:bg-slate-200'
            }`}
          >
            {isThai ? '🟡 เฝ้าระวัง' : 'Watch'}
          </button>
        </div>

        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-bold">
          {filteredEvents.length} {isThai ? 'เหตุการณ์' : 'events'}
        </span>
      </div>

      {/* Events Timeline Feed */}
      <div className="space-y-4">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 backdrop-blur-xl shadow-md dark:shadow-xl space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0 font-mono font-extrabold text-xs shadow-xs">
                  {ev.stationCode}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{t(ev.title)}</h3>
                    <StatusBadge status={ev.severity} size="sm" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 font-medium">
                    {ev.timestamp} • {ev.relativeTime}
                  </div>
                </div>
              </div>

              <Link
                to="/basin/$basinSlug/station/$stationId"
                params={{ basinSlug: currentSlug, stationId: ev.stationId }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 active:scale-95 self-end sm:self-auto shadow-xs"
              >
                <span>{isThai ? 'ดูกราฟสถานี' : 'View Station'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {t(ev.description)}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 font-mono">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500">{isThai ? 'ค่าตรวจวัด:' : 'Observed:'}</span>
                <span className="text-cyan-800 dark:text-cyan-300 font-extrabold">{ev.value}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500">{isThai ? 'เกณฑ์เตือน:' : 'Threshold:'}</span>
                <span className="text-amber-800 dark:text-amber-300 font-extrabold">{ev.threshold}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 italic font-sans font-medium">
                {t(ev.ruleTriggered)}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
