import React from 'react';
import { Link } from '@tanstack/react-router';
import { Station } from '../../types/station';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../common/StatusBadge';
import { TrendIndicator } from '../common/TrendIndicator';
import { FreshnessBadge } from '../common/FreshnessBadge';
import {
  X,
  Waves,
  CloudRain,
  MapPin,
  Building2,
  Navigation,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';

interface MapStationModalProps {
  station: Station | null;
  onClose: () => void;
  basinSlug: string;
  onSaveAsNearby?: (st: Station) => void;
  isSavedNearby?: boolean;
}

export const MapStationModal: React.FC<MapStationModalProps> = ({
  station,
  onClose,
  basinSlug,
  onSaveAsNearby,
  isSavedNearby = false,
}) => {
  const { t, isThai } = useLanguage();

  if (!station) return null;

  const isWater = station.stationType === 'water_level';
  const wl = station.waterLevel;
  const rf = station.rainfall;

  const modalContent = (
    <div className="flex flex-col h-full max-h-[85vh] justify-between">
      {/* Header with Type, Code, Status, Close button */}
      <div>
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isWater
                  ? 'bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400'
                  : 'bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400'
              }`}
            >
              {isWater ? <Waves className="w-6 h-6" /> : <CloudRain className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-300 dark:border-cyan-800/60">
                  {station.code}
                </span>
                <StatusBadge status={station.status} size="sm" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {t(station.name)}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Agency */}
        <div className="space-y-1.5 my-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {t(station.geocode.tumbon)}, {t(station.geocode.amphoe)}, จ.{t(station.geocode.province)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 dark:text-slate-300 font-semibold">{t(station.agency.name)}</span>
          </div>
        </div>

        {/* Telemetry Metrics Display (§21, §22) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3 my-3 shadow-xs">
          {isWater && wl ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'ระดับน้ำปัจจุบัน' : 'Water Level'}</span>
                  <div className="text-2xl font-extrabold font-mono text-cyan-700 dark:text-cyan-300">
                    {wl.waterLevelMsl} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">{isThai ? 'ม.รทก.' : 'm MSL'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'ปริมาณการไหล (Q)' : 'Discharge (Q)'}</span>
                  <div className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
                    {wl.discharge} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">m³/s</span>
                  </div>
                </div>
              </div>

              {/* Bank Fill Progress */}
              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800/80 font-medium">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">{isThai ? 'ความจุตลิ่ง:' : 'Bank Fill:'}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{wl.bankCapacityPercent}% ({wl.bankLevelMsl} ม.รทก.)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
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
            </>
          ) : rf ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'ฝนสะสม 24 ชม.' : '24h Rainfall'}</span>
                  <div className="text-2xl font-extrabold font-mono text-blue-700 dark:text-blue-300">
                    {rf.rain24h} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">มม.</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'ฝน 1 ชม. ล่าสุด' : '1h Rain'}</span>
                  <div className="text-2xl font-extrabold font-mono text-cyan-700 dark:text-cyan-300">
                    {rf.rain1h} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">มม.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/40">
                  {rf.intensity === 'very_heavy'
                    ? isThai ? '🌧️ ฝนตกหนักมาก' : 'Very Heavy'
                    : rf.intensity === 'heavy'
                    ? isThai ? '🌧️ ฝนตกหนัก' : 'Heavy Rain'
                    : rf.intensity === 'moderate'
                    ? isThai ? '🌦️ ฝนปานกลาง' : 'Moderate'
                    : isThai ? '🌤️ ฝนเล็กน้อย' : 'Light Rain'}
                </span>
                <FreshnessBadge freshness={station.freshness} />
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        {onSaveAsNearby && isWater && (
          <button
            onClick={() => onSaveAsNearby(station)}
            disabled={isSavedNearby}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              isSavedNearby
                ? 'bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-400 dark:border-cyan-500/50 text-cyan-900 dark:text-cyan-300 cursor-default'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md'
            }`}
          >
            {isSavedNearby ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isSavedNearby ? (isThai ? 'สถานีใกล้ฉันแล้ว' : 'Saved') : (isThai ? '★ บันทึกใกล้ฉัน' : 'Set as Nearby')}</span>
          </button>
        )}

        <Link
          to="/basin/$basinSlug/station/$stationId"
          params={{ basinSlug, stationId: station.id }}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
        >
          <span>{isThai ? 'ดูข้อมูลกราฟละเอียด' : 'Full Telemetry'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Floating Modal Dialog (>= lg) */}
      <div
        className="hidden lg:flex fixed inset-0 z-50 items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn cursor-pointer"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl backdrop-blur-2xl animate-scaleUp cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {modalContent}
        </div>
      </div>

      {/* 2. Mobile & Portrait Tablet Swipeable Bottom Sheet Modal (< lg) */}
      <div
        className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fadeIn cursor-pointer"
        onClick={onClose}
      >
        <div
          className="w-full rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl backdrop-blur-2xl animate-slideUp max-h-[85vh] overflow-y-auto cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Indicator */}
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />
          {modalContent}
        </div>
      </div>
    </>
  );
};
