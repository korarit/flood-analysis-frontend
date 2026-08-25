import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Waves, CloudRain } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const { isThai } = useLanguage();

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/95 dark:bg-slate-950/90 p-3.5 backdrop-blur-xl shadow-xl space-y-3 text-xs text-slate-800 dark:text-slate-200 transition-colors">
      <div className="font-bold text-slate-900 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-1.5 uppercase tracking-wider text-[10px]">
        {isThai ? 'คำอธิบายสัญลักษณ์ (Map Legend)' : 'Map Legend'}
      </div>

      {/* Marker Types */}
      <div className="space-y-1.5 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-[10px]">
            <Waves className="w-3 h-3" />
          </div>
          <span>{isThai ? 'สถานีวัดระดับน้ำ' : 'Water Level Station'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-400 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[10px]">
            <CloudRain className="w-3 h-3" />
          </div>
          <span>{isThai ? 'สถานีวัดปริมาณน้ำฝน' : 'Rainfall Station'}</span>
        </div>
      </div>

      {/* Severity Colors */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>{isThai ? 'ปกติ (<70% ตลิ่ง / ฝนเล็กน้อย)' : 'Normal (<70% Bank)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>{isThai ? 'เฝ้าระวัง (70-85% / ฝนปานกลาง)' : 'Watch (70-85%)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>{isThai ? 'เตือนภัย (85-100% / ฝนตกหนัก)' : 'Warning (85-100%)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>{isThai ? 'วิกฤต (ล้นตลิ่ง / ฝนหนักมาก)' : 'Critical (Overflow)'}</span>
        </div>
      </div>
    </div>
  );
};
