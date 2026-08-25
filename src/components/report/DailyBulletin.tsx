import React from 'react';
import { SituationBulletin } from '../../types/alert';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../common/StatusBadge';
import { FileText, Calendar, Clock, AlertTriangle, ShieldCheck, Building } from 'lucide-react';

interface DailyBulletinProps {
  bulletin: SituationBulletin;
}

export const DailyBulletin: React.FC<DailyBulletinProps> = ({ bulletin }) => {
  const { t, isThai } = useLanguage();

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-10 backdrop-blur-2xl shadow-md dark:shadow-2xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none transition-colors">
      
      {/* Official Header */}
      <div className="text-center space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6 print:border-black">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-400 text-xs font-mono font-bold uppercase print:border-black print:text-black">
          <FileText className="w-3.5 h-3.5" />
          <span>{isThai ? 'รายงานสถานการณ์น้ำประจำวัน (ฉบับทางการ)' : 'Daily Hydrological Situation Bulletin'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 print:text-black tracking-tight">
          {isThai ? `รายงานสรุปสถานการณ์น้ำ ${t(bulletin.basinName)}` : `${t(bulletin.basinName)} Situation Report`}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-400 print:text-gray-600 font-mono font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {bulletin.issuedDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {bulletin.issuedTime}
          </span>
          <span>•</span>
          <StatusBadge status={bulletin.overallSeverity} size="sm" />
        </div>
      </div>

      {/* Executive Summary */}
      <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 print:bg-gray-50 print:border-gray-300">
        <h3 className="text-sm font-bold text-cyan-700 dark:text-cyan-400 print:text-blue-900 uppercase tracking-wider">
          {isThai ? '1. สรุปภาพรวมสถานการณ์' : '1. Executive Summary'}
        </h3>
        <p className="text-sm text-slate-800 dark:text-slate-200 print:text-black leading-relaxed font-medium">
          {t(bulletin.overallSituation)}
        </p>
      </div>

      {/* Key Highlights */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-cyan-700 dark:text-cyan-400 print:text-blue-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{isThai ? '2. สาระสำคัญและประเด็นเฝ้าระวัง' : '2. Key Highlights & Observations'}</span>
        </h3>
        <ul className="space-y-2.5">
          {bulletin.keyHighlights.map((hl, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 print:text-gray-800 font-medium">
              <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 text-xs flex items-center justify-center shrink-0 font-bold font-mono mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{t(hl)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upstream, Midstream, Downstream Analysis (§33) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-cyan-700 dark:text-cyan-400 print:text-blue-900 uppercase tracking-wider">
          {isThai ? '3. การวิเคราะห์สถานการณ์รายพื้นที่ตามแนวแม่น้ำ' : '3. Reach-by-Reach River Analysis'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5 print:bg-gray-50">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              {isThai ? 'ตอนบน (ต้นน้ำ)' : 'Upper Reach (Upstream)'}
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 print:text-black leading-relaxed font-medium">
              {t(bulletin.upstreamStatus)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5 print:bg-gray-50">
            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider block">
              {isThai ? 'ตอนกลาง (กลางน้ำ)' : 'Middle Reach (Midstream)'}
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 print:text-black leading-relaxed font-medium">
              {t(bulletin.midstreamStatus)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5 print:bg-gray-50">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              {isThai ? 'ตอนล่าง (ปลายน้ำ)' : 'Lower Reach (Downstream)'}
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 print:text-black leading-relaxed font-medium">
              {t(bulletin.downstreamStatus)}
            </p>
          </div>
        </div>
      </div>

      {/* 24-hour Forecast & Precautions */}
      <div className="space-y-3 p-5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-300 dark:border-cyan-500/30 print:bg-blue-50 print:border-blue-200">
        <h3 className="text-sm font-bold text-cyan-800 dark:text-cyan-300 print:text-blue-900 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>{isThai ? '4. การคาดการณ์แนวโน้มใน 24 ชั่วโมงข้างหน้า & คำแนะนำ' : '4. 24-Hour Forecast & Advisory'}</span>
        </h3>
        <p className="text-sm text-slate-800 dark:text-slate-200 print:text-black leading-relaxed font-medium">
          {t(bulletin.forecastNext24h)}
        </p>
      </div>

      {/* Sign-off Authority */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 print:text-gray-600 font-medium">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400" />
          <span>{t(bulletin.officerInCharge)}</span>
        </div>
        <div className="font-mono font-bold">
          Document ID: {bulletin.id}
        </div>
      </div>

    </div>
  );
};
