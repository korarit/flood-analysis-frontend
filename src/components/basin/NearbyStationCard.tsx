import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Station } from '../../types/station';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../common/StatusBadge';
import { TrendIndicator } from '../common/TrendIndicator';
import {
  Navigation,
  Waves,
  MapPin,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Gauge,
} from 'lucide-react';

interface NearbyStationCardProps {
  station: Station | null;
  basinSlug: string;
  distanceKm?: number;
}

export const NearbyStationCard: React.FC<NearbyStationCardProps> = ({
  station,
  basinSlug,
  distanceKm = 3.2,
}) => {
  const { t, isThai } = useLanguage();
  const navigate = useNavigate();

  // If no station is chosen yet, render the unselected state (§9)
  if (!station) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-cyan-500/50 bg-cyan-50/70 dark:bg-gradient-to-br dark:from-cyan-950/20 dark:via-slate-900/60 dark:to-slate-950/80 p-6 sm:p-7 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-cyan-500 transition-all">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 shadow-glow-cyan/50">
            <Navigation className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isThai ? 'สถานีใกล้ฉัน' : 'Nearby Station'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {isThai ? 'ยังไม่ได้เลือกสถานีใกล้คุณ' : 'No Nearby Station Selected'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              {isThai
                ? 'เลือกสถานีวัดระดับน้ำที่อยู่ใกล้พื้นที่ของคุณ เพื่อใช้เป็นจุดอ้างอิงหลักในการติดตามสถานการณ์น้ำใกล้บ้าน'
                : 'Select a water level station near your area as a key reference to answer "Will my home flood?".'}
            </p>
          </div>
        </div>

        <Link
          to="/basin/$basinSlug/nearby"
          params={{ basinSlug }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-cyan-500/30 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Navigation className="w-4 h-4" />
          <span>{isThai ? 'เลือกสถานีใกล้ฉัน' : 'Select Nearby Station'}</span>
        </Link>
      </div>
    );
  }

  // Selected State (§11)
  const waterLevel = station.waterLevel;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-white/95 dark:bg-gradient-to-br dark:from-cyan-950/30 dark:via-slate-900/90 dark:to-slate-950/95 p-6 sm:p-7 backdrop-blur-2xl shadow-xl dark:shadow-2xl transition-all hover:border-cyan-500/60 hover:shadow-cyan-950/30">
      
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
          <Navigation className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>{isThai ? 'สถานีใกล้ฉัน (จุดอ้างอิงของคุณ)' : 'My Nearby Reference Station'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 font-mono">
          <MapPin className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
          <span>{isThai ? `ห่างจากตำแหน่งคุณ ~${distanceKm} กม.` : `~${distanceKm} km away`}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: Station Identity & Location */}
        <div className="md:col-span-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-300 dark:border-cyan-500/40">
              {station.code}
            </span>
            <StatusBadge status={station.status} size="sm" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t(station.name)}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {t(station.geocode.tumbon)}, {t(station.geocode.amphoe)}, จ.{t(station.geocode.province)}
          </p>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            {isThai ? 'หน่วยงาน:' : 'Agency:'} <span className="text-slate-800 dark:text-slate-300 font-semibold">{t(station.agency.name)}</span>
          </div>
        </div>

        {/* Middle: Telemetry Gauges (§11, §21) */}
        <div className="md:col-span-4 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          
          {/* Water Level */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
              <Waves className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              {isThai ? 'ระดับน้ำล่าสุด' : 'Water Level'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-cyan-700 dark:text-cyan-300">
                {waterLevel?.waterLevelMsl || '-'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">{isThai ? 'ม.รทก.' : 'm MSL'}</span>
            </div>
            {waterLevel && (
              <TrendIndicator
                trend={waterLevel.trend}
                deltaPerHour={waterLevel.deltaPerHour}
                size="sm"
              />
            )}
          </div>

          {/* Discharge or Capacity */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
              <Gauge className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              {isThai ? 'ความจุตลิ่ง' : 'Bank Fill'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
                {waterLevel?.bankCapacityPercent || '-'}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
              <div
                className={`h-full rounded-full ${
                  (waterLevel?.bankCapacityPercent || 0) >= 85
                    ? 'bg-rose-500'
                    : (waterLevel?.bankCapacityPercent || 0) >= 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, waterLevel?.bankCapacityPercent || 0)}%` }}
              />
            </div>
          </div>

        </div>

        {/* Right: Actions */}
        <div className="md:col-span-3 flex flex-row md:flex-col gap-2.5 justify-end">
          <Link
            to="/basin/$basinSlug/station/$stationId"
            params={{ basinSlug, stationId: station.id }}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>{isThai ? 'ดูรายละเอียด' : 'View Detail'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/basin/$basinSlug/nearby"
            params={{ basinSlug }}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isThai ? 'เปลี่ยนสถานี' : 'Change Station'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
