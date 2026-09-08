import React from 'react';
import { SituationStatus } from '../../types/basin';
import { useLanguage } from '../../hooks/useLanguage';
import { Layers } from 'lucide-react';

interface MapFilterControlProps {
  statusFilters: Record<SituationStatus, boolean>;
  setStatusFilters: React.Dispatch<React.SetStateAction<Record<SituationStatus, boolean>>>;
  baseMapType: 'streets' | 'dark' | 'satellite';
  setBaseMapType: (t: 'streets' | 'dark' | 'satellite') => void;
}

export const MapFilterControl: React.FC<MapFilterControlProps> = ({
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
            onClick={() => setBaseMapType('streets')}
            className={`py-1 rounded-lg font-bold transition-all cursor-pointer truncate text-[11px] ${
              baseMapType === 'streets' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            OSM
          </button>
          <button
            onClick={() => setBaseMapType('dark')}
            className={`py-1 rounded-lg font-bold transition-all cursor-pointer truncate text-[11px] ${
              baseMapType === 'dark' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isThai ? 'มืด (Dark)' : 'Dark'}
          </button>
          <button
            onClick={() => setBaseMapType('satellite')}
            className={`py-1 rounded-lg font-bold transition-all cursor-pointer truncate text-[11px] ${
              baseMapType === 'satellite' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isThai ? 'ดาวเทียม' : 'Satellite'}
          </button>
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
