import React from 'react';
import { WaterLevelTelemetry } from '../../types/station';
import { useLanguage } from '../../hooks/useLanguage';
import { Waves, Gauge, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';

interface TelemetryGaugeProps {
  telemetry: WaterLevelTelemetry;
}

export const TelemetryGauge: React.FC<TelemetryGaugeProps> = ({ telemetry }) => {
  const { isThai } = useLanguage();
  const fillPercent = telemetry.bankCapacityPercent;

  // Threshold colors
  const statusColor =
    fillPercent >= 85
      ? 'text-rose-900 dark:text-rose-400 border-rose-300 dark:border-rose-500 bg-rose-100 dark:bg-rose-950/40'
      : fillPercent >= 70
      ? 'text-amber-900 dark:text-amber-400 border-amber-300 dark:border-amber-500 bg-amber-100 dark:bg-amber-950/40'
      : 'text-emerald-900 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40';

  const progressGradient =
    fillPercent >= 85
      ? 'from-amber-500 to-rose-500'
      : fillPercent >= 70
      ? 'from-cyan-500 to-amber-500'
      : 'from-cyan-500 to-emerald-500';

  const marginToBank = +(telemetry.bankLevelMsl - telemetry.waterLevelMsl).toFixed(2);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-2xl shadow-md dark:shadow-xl space-y-6 transition-colors">
      
      {/* Title & Key Highlights */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
          <Gauge className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>{isThai ? 'ข้อมูลโทรมาตรระดับน้ำ & ความจุลำน้ำ' : 'Water Level & River Capacity Telemetry'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{isThai ? 'สถานะความเสี่ยง:' : 'Risk Status:'}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
            {fillPercent >= 85
              ? isThai ? '🔴 ใกล้ล้นตลิ่ง' : 'Critical'
              : fillPercent >= 70
              ? isThai ? '🟡 เฝ้าระวัง' : 'Watch'
              : isThai ? '🟢 ปลอดภัย' : 'Safe'}
          </span>
        </div>
      </div>

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        
        {/* 1. Water Level in ม.รทก. */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{isThai ? 'ระดับน้ำปัจจุบัน' : 'Water Level'}</span>
            <Waves className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-700 dark:text-cyan-300">
              {telemetry.waterLevelMsl}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 font-sans">
              {isThai ? 'ม.รทก.' : 'm MSL'}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between font-medium">
            <span>{isThai ? 'เทียบระดับท้องน้ำ:' : 'From Bed:'}</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
              {telemetry.waterLevelBed} {isThai ? 'ม.' : 'm'}
            </span>
          </div>
        </div>

        {/* 2. Bank Capacity Fill (%) */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{isThai ? 'ปริมาณน้ำเทียบความจุตลิ่ง' : 'Bank Fill Capacity'}</span>
            <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {fillPercent}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium">
              {isThai ? 'ของตลิ่ง' : 'capacity'}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between font-medium">
            <span>{isThai ? 'ระยะห่างตลิ่ง:' : 'Below Bank:'}</span>
            <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">
              {marginToBank > 0 ? `${marginToBank} ม.` : isThai ? 'ล้นตลิ่ง' : 'Overflow'}
            </span>
          </div>
        </div>

        {/* 3. Discharge in ลูกบาศก์เมตร/วินาที (m³/s) */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{isThai ? 'ปริมาณการไหล (Q)' : 'Discharge (Q)'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
              {telemetry.discharge}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 font-sans">
              {isThai ? 'ลบ.ม./วินาที' : 'm³/s'}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between font-medium">
            <span>{isThai ? 'เทียบความจุระบายสูงสุด:' : 'Max River Flow:'}</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
              {telemetry.dischargePercent}% ({telemetry.maxDischargeCapacity} m³/s)
            </span>
          </div>
        </div>

      </div>

      {/* Visual Bank Profile Progress Bar */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-slate-400 font-medium">
          <span>{isThai ? 'ท้องน้ำ: ' : 'Bed: '}{telemetry.bedLevelMsl} ม.รทก.</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">{isThai ? 'เตือนภัย: ' : 'Warning: '}{telemetry.warningLevelMsl} ม.รทก.</span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">{isThai ? 'ตลิ่ง: ' : 'Bank: '}{telemetry.bankLevelMsl} ม.รทก.</span>
        </div>
        <div className="relative w-full bg-slate-200 dark:bg-slate-950 rounded-full h-4 p-0.5 border border-slate-300 dark:border-slate-800 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressGradient} transition-all duration-500 shadow-md`}
            style={{ width: `${Math.min(100, fillPercent)}%` }}
          />
        </div>
      </div>

    </div>
  );
};
