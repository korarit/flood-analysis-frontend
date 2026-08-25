import React from 'react';
import { DataGapPeriod } from '../../types/telemetry';
import { useLanguage } from '../../hooks/useLanguage';
import { AlertTriangle, Info } from 'lucide-react';

interface DataGapAlertProps {
  gaps: DataGapPeriod[];
}

export const DataGapAlert: React.FC<DataGapAlertProps> = ({ gaps }) => {
  const { isThai } = useLanguage();

  if (!gaps || gaps.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50/90 dark:bg-amber-950/25 p-4 backdrop-blur-md space-y-2 shadow-xs transition-colors">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{isThai ? 'แจ้งเตือน: ตรวจพบช่วงข้อมูลขาดหาย (Data Gap)' : 'Notice: Missing Data Gaps Detected'}</span>
      </div>

      <div className="space-y-1.5 pl-6">
        {gaps.map((gap, idx) => (
          <div key={idx} className="flex flex-wrap items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <span className="font-mono font-bold text-amber-800 dark:text-amber-200">
              ช่วงเวลา {gap.startTime} – {gap.endTime} ({gap.durationHours} ชั่วโมง)
            </span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-600 dark:text-slate-400">{gap.description}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 pl-6 pt-1 border-t border-amber-200 dark:border-amber-500/15 font-medium">
        <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400/80 shrink-0" />
        <span>
          {isThai
            ? 'ระบบไม่ลากเส้นเชื่อมข้อมูลอัตโนมัติ เพื่อรักษาความถูกต้องของข้อมูลอุทกวิทยาตามมาตรฐาน'
            : 'Chart does not interpolate over missing intervals to maintain hydrological observation integrity.'}
        </span>
      </div>
    </div>
  );
};
