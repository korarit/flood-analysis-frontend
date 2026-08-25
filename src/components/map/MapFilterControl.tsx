import React from 'react';
import { StationType } from '../../types/station';
import { SituationStatus } from '../../types/basin';
import { useLanguage } from '../../hooks/useLanguage';
import { Layers, Waves, CloudRain, ShieldCheck, AlertCircle, AlertTriangle, Flame, HelpCircle } from 'lucide-react';

interface MapFilterControlProps {
  showWaterLevel: boolean;
  setShowWaterLevel: (v: boolean) => void;
  showRainfall: boolean;
  setShowRainfall: (v: boolean) => void;
  statusFilters: Record<SituationStatus, boolean>;
  setStatusFilters: React.Dispatch<React.SetStateAction<Record<SituationStatus, boolean>>>;
  baseMapType: 'dark' | 'streets' | 'satellite';
  setBaseMapType: (t: 'dark' | 'streets' | 'satellite') => void;
}

export const MapFilterControl: React.FC<MapFilterControlProps> = ({
  showWaterLevel,
  setShowWaterLevel,
  showRainfall,
  setShowRainfall,
  statusFilters,
  setStatusFilters,
  baseMapType,
  setBaseMapType,
}) => {
  const { isThai } = useLanguage();

  const toggleStatus = (st: SituationStatus) => {
    setStatusFilters(prev => ({ ...prev, [st]: !prev[st] }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/95 dark:bg-slate-950/90 p-4 backdrop-blur-xl shadow-xl space-y-4 text-xs text-slate-800 dark:text-slate-200 transition-colors">
      
      {/* Base Map Switcher */}
      <div className="space-y-1.5">
        <span className="font-bold text-slate-900 dark:text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>{isThai ? 'แผนที่ฐาน (Base Map)' : 'Base Map'}</span>
        </span>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setBaseMapType('dark')}
            className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
              baseMapType === 'dark' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isThai ? 'มืด (Dark)' : 'Dark'}
          </button>
          <button
            onClick={() => setBaseMapType('streets')}
            className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
              baseMapType === 'streets' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isThai ? 'ถนน' : 'Street'}
          </button>
          <button
            onClick={() => setBaseMapType('satellite')}
            className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
              baseMapType === 'satellite' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isThai ? 'ดาวเทียม' : 'Satellite'}
          </button>
        </div>
      </div>

      {/* Station Type Filters (§32) */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 font-medium">
        <span className="font-bold text-slate-900 dark:text-slate-300 block">{isThai ? 'ประเภทสถานี' : 'Station Types'}</span>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
            <input
              type="checkbox"
              checked={showWaterLevel}
              onChange={(e) => setShowWaterLevel(e.target.checked)}
              className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500/20"
            />
            <Waves className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{isThai ? 'สถานีวัดระดับน้ำ' : 'Water Level Stations'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
            <input
              type="checkbox"
              checked={showRainfall}
              onChange={(e) => setShowRainfall(e.target.checked)}
              className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20"
            />
            <CloudRain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{isThai ? 'สถานีวัดปริมาณน้ำฝน' : 'Rainfall Stations'}</span>
          </label>
        </div>
      </div>

      {/* Situation Levels (§32) */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 font-medium">
        <span className="font-bold text-slate-900 dark:text-slate-300 block">{isThai ? 'ระดับสถานการณ์' : 'Situation Level'}</span>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={statusFilters.normal}
              onChange={() => toggleStatus('normal')}
              className="rounded text-emerald-500"
            />
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{isThai ? 'ปกติ (<70%)' : 'Normal'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={statusFilters.watch}
              onChange={() => toggleStatus('watch')}
              className="rounded text-amber-500"
            />
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{isThai ? 'เฝ้าระวัง (70-85%)' : 'Watch'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={statusFilters.warning}
              onChange={() => toggleStatus('warning')}
              className="rounded text-orange-500"
            />
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>{isThai ? 'เตือนภัย (85-100%)' : 'Warning'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={statusFilters.critical}
              onChange={() => toggleStatus('critical')}
              className="rounded text-rose-500"
            />
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>{isThai ? 'วิกฤต (>100%)' : 'Critical'}</span>
          </label>
        </div>
      </div>

    </div>
  );
};
