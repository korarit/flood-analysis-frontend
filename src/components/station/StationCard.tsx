import React from 'react';
import { Link } from '@tanstack/react-router';
import { Station } from '../../types/station';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../common/StatusBadge';
import { FreshnessBadge } from '../common/FreshnessBadge';
import { TrendIndicator } from '../common/TrendIndicator';
import { Waves, CloudRain, MapPin, Building2, ArrowRight } from 'lucide-react';

interface StationCardProps {
  station: Station;
  basinSlug: string;
  className?: string;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  basinSlug,
  className = '',
}) => {
  const { t, isThai } = useLanguage();
  const isWater = station.stationType === 'water_level';
  const wl = station.waterLevel;
  const rf = station.rainfall;

  return (
    <Link
      to="/basin/$basinSlug/station/$stationId"
      params={{ basinSlug, stationId: station.id }}
      className={`group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-background-card/80 p-5 sm:p-6 backdrop-blur-xl shadow-md dark:shadow-lg transition-all hover:border-cyan-400 dark:hover:border-cyan-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 hover:shadow-xl flex flex-col justify-between cursor-pointer ${className}`}
    >
      {/* Top Bar: Type Icon, Code, Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isWater
                ? 'bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400'
                : 'bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400'
            }`}
          >
            {isWater ? <Waves className="w-6 h-6" /> : <CloudRain className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-300 dark:border-cyan-800/60">
                {station.code}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isWater ? (isThai ? 'วัดระดับน้ำ' : 'Water Level') : (isThai ? 'วัดปริมาณฝน' : 'Rainfall')}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
              {t(station.name)}
            </h4>
          </div>
        </div>

        <StatusBadge status={station.status} size="sm" showIcon={false} />
      </div>

      {/* Location & Agency */}
      <div className="space-y-1.5 my-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {t(station.geocode.tumbon)}, {t(station.geocode.amphoe)}, จ.{t(station.geocode.province)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 dark:text-slate-300 truncate font-semibold">{t(station.agency.name)}</span>
        </div>
      </div>

      {/* Main Telemetry Block */}
      <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800/80">
        {isWater && wl ? (
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'ระดับน้ำปัจจุบัน' : 'Water Level'}</span>
                <span className="text-2xl font-extrabold font-mono text-cyan-700 dark:text-cyan-300">
                  {wl.waterLevelMsl} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">{isThai ? 'ม.รทก.' : 'm MSL'}</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'อัตราไหล (Q)' : 'Discharge (Q)'}</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-200">
                  {wl.discharge} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">m³/s</span>
                </span>
              </div>
            </div>

            {/* Bank Capacity Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-500 dark:text-slate-400">{isThai ? 'ความจุตลิ่ง' : 'Bank Fill'}</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">{wl.bankCapacityPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    wl.bankCapacityPercent >= 85
                      ? 'bg-rose-500'
                      : wl.bankCapacityPercent >= 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, wl.bankCapacityPercent)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <TrendIndicator trend={wl.trend} deltaPerHour={wl.deltaPerHour} size="sm" />
              <FreshnessBadge freshness={station.freshness} />
            </div>
          </div>
        ) : rf ? (
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'ฝน 24 ชม. สะสม' : '24h Rainfall'}</span>
                <span className="text-2xl font-extrabold font-mono text-blue-700 dark:text-blue-300">
                  {rf.rain24h} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">มม.</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'ฝน 1 ชม. ล่าสุด' : '1h Rain'}</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-200">
                  {rf.rain1h} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">มม.</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/40">
                {rf.intensity === 'very_heavy'
                  ? isThai ? '🌧️ ฝนตกหนักมาก' : 'Very Heavy Rain'
                  : rf.intensity === 'heavy'
                  ? isThai ? '🌧️ ฝนตกหนัก' : 'Heavy Rain'
                  : rf.intensity === 'moderate'
                  ? isThai ? '🌦️ ฝนปานกลาง' : 'Moderate Rain'
                  : isThai ? '🌤️ ฝนเล็กน้อย' : 'Light Rain'}
              </span>
              <FreshnessBadge freshness={station.freshness} />
            </div>
          </div>
        ) : null}
      </div>

      {/* Hover Action Prompt */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 font-medium transition-colors">
        <span>{isThai ? 'ดูประวัติ & ความสัมพันธ์' : 'View telemetry & relations'}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
