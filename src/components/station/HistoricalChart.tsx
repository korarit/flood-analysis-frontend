import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Station } from '../../types/station';
import { HistoricalTelemetrySeries } from '../../types/telemetry';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { DataGapAlert } from './DataGapAlert';
import { Calendar, BarChart2, LineChart, Layers, RefreshCw } from 'lucide-react';

interface HistoricalChartProps {
  station: Station;
  telemetrySeries: HistoricalTelemetrySeries | null;
  timeRange: '1d' | '3d' | '7d' | 'custom';
  chartMode: 'bar' | 'line' | 'combined';
  setChartMode: (mode: 'bar' | 'line' | 'combined') => void;
  startDate: string;
  endDate: string;
  isLoading: boolean;
  onTimeRangeChange: (range: '1d' | '3d' | '7d') => void;
  onCustomDateChange: (start: string, end: string) => void;
}

export const HistoricalChart: React.FC<HistoricalChartProps> = ({
  station,
  telemetrySeries,
  timeRange,
  chartMode,
  setChartMode,
  startDate,
  endDate,
  isLoading,
  onTimeRangeChange,
  onCustomDateChange,
}) => {
  const { t, isThai } = useLanguage();
  const { isDark } = useTheme();
  const isWater = station.stationType === 'water_level';
  const wl = station.waterLevel;

  const points = telemetrySeries?.points || [];
  const dataGaps = telemetrySeries?.dataGaps || [];

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-2xl shadow-md dark:shadow-xl space-y-6 transition-colors">
      
      {/* Chart Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        
        {/* Left: Title & Visual Mode Switcher */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <LineChart className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>
              {isWater
                ? isThai
                  ? 'กราฟข้อมูลโทรมาตรย้อนหลัง (ระดับน้ำ & ปริมาณการไหล)'
                  : 'Historical Telemetry Chart (Water Level & Discharge)'
                : isThai
                ? 'กราฟปริมาณฝนสะสมย้อนหลัง'
                : 'Historical Precipitation Chart'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{isThai ? 'โหมดกราฟ:' : 'Chart Type:'}</span>
            <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800 text-xs shadow-xs">
              <button
                onClick={() => setChartMode('combined')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                  chartMode === 'combined'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{isThai ? 'กราฟผสม' : 'Combined'}</span>
              </button>
              <button
                onClick={() => setChartMode('line')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                  chartMode === 'line'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LineChart className="w-3 h-3" />
                <span>{isThai ? 'กราฟเส้น' : 'Line'}</span>
              </button>
              <button
                onClick={() => setChartMode('bar')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                  chartMode === 'bar'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3 h-3" />
                <span>{isThai ? 'กราฟแท่ง' : 'Bar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Presets & Date Inputs (§23) */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Preset Buttons: 1 วัน, 3 วัน, 7 วัน */}
          <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800 shadow-xs">
            {(['1d', '3d', '7d'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => onTimeRangeChange(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === preset
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                {preset === '1d'
                  ? isThai
                    ? '1 วัน'
                    : '1 Day'
                  : preset === '3d'
                  ? isThai
                    ? '3 วัน'
                    : '3 Days'
                  : isThai
                  ? '7 วัน'
                  : '7 Days'}
              </button>
            ))}
          </div>

          {/* Date Picker Inputs (startDate, endDate) */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onCustomDateChange(e.target.value, endDate)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            />
            <span className="text-slate-400 dark:text-slate-600">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onCustomDateChange(startDate, e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* Data Gap Alert Notification Banner (§26) */}
      {dataGaps.length > 0 && <DataGapAlert gaps={dataGaps} />}

      {/* Chart Canvas */}
      <div className="relative w-full h-80 sm:h-96 pt-2">
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center rounded-2xl">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} opacity={0.8} />
            
            <XAxis
              dataKey="displayTime"
              stroke={isDark ? '#64748B' : '#475569'}
              fontSize={11}
              tickLine={false}
              minTickGap={25}
            />

            {/* Left Y Axis: Water Level (m MSL) or Rainfall (mm) */}
            <YAxis
              yAxisId="left"
              stroke={isDark ? '#22D3EE' : '#0891B2'}
              fontSize={11}
              tickLine={false}
              domain={isWater ? ['auto', 'auto'] : [0, 'auto']}
              unit={isWater ? 'ม.' : 'mm'}
            />

            {/* Right Y Axis: Discharge Q (m³/s) */}
            {isWater && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={isDark ? '#10B981' : '#059669'}
                fontSize={11}
                tickLine={false}
                domain={['auto', 'auto']}
                unit="m³/s"
              />
            )}

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0]?.payload;
                if (point?.isDataGap) {
                  return (
                    <div className="rounded-xl border border-amber-400 dark:border-amber-500/50 bg-white dark:bg-slate-950/95 p-3 shadow-xl backdrop-blur-md">
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">⚠️ {isThai ? 'ข้อมูลขาดหาย (Data Gap)' : 'Missing Telemetry'}</p>
                    </div>
                  );
                }

                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md space-y-1.5 text-xs">
                    <p className="font-mono text-slate-500 dark:text-slate-400 font-semibold">{point?.timestamp}</p>
                    {isWater && (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-cyan-700 dark:text-cyan-400 font-bold">{isThai ? 'ระดับน้ำ:' : 'Water Level:'}</span>
                          <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100">
                            {point?.waterLevelMsl} ม.รทก.
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{isThai ? 'อัตราไหล (Q):' : 'Discharge:'}</span>
                          <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100">
                            {point?.discharge} m³/s
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">{isThai ? 'ความจุตลิ่ง:' : 'Bank Capacity:'}</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {point?.bankCapacityPercent}%
                          </span>
                        </div>
                      </>
                    )}
                    {!isWater && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-blue-700 dark:text-blue-400 font-bold">{isThai ? 'ปริมาณฝนสะสม:' : 'Rainfall:'}</span>
                        <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100">
                          {point?.rainfall} มม.
                        </span>
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            />

            {/* Threshold Reference Lines */}
            {isWater && wl && (
              <>
                <ReferenceLine
                  yAxisId="left"
                  y={wl.warningLevelMsl}
                  label={{ value: isThai ? 'เตือนภัย' : 'Warning', fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }}
                  stroke="#F59E0B"
                  strokeDasharray="4 4"
                />
                <ReferenceLine
                  yAxisId="left"
                  y={wl.bankLevelMsl}
                  label={{ value: isThai ? 'ระดับตลิ่ง' : 'Bank Level', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                />
              </>
            )}

            {/* Render Bars or Lines based on chartMode */}
            {isWater && (chartMode === 'bar' || chartMode === 'combined') && (
              <Bar
                yAxisId="right"
                dataKey="discharge"
                name={isThai ? 'ปริมาณไหล (m³/s)' : 'Discharge (m³/s)'}
                fill={isDark ? '#065F46' : '#A7F3D0'}
                opacity={0.7}
                radius={[4, 4, 0, 0]}
              />
            )}

            {isWater && (chartMode === 'line' || chartMode === 'combined') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="waterLevelMsl"
                name={isThai ? 'ระดับน้ำ (ม.รทก.)' : 'Water Level (m MSL)'}
                stroke={isDark ? '#22D3EE' : '#0891B2'}
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
              />
            )}

            {!isWater && (chartMode === 'bar' || chartMode === 'combined') && (
              <Bar
                yAxisId="left"
                dataKey="rainfall"
                name={isThai ? 'ปริมาณฝน (มม.)' : 'Rainfall (mm)'}
                fill={isDark ? '#3B82F6' : '#60A5FA'}
                radius={[4, 4, 0, 0]}
              />
            )}

            {!isWater && chartMode === 'line' && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="rainfall"
                name={isThai ? 'ปริมาณฝน (มม.)' : 'Rainfall (mm)'}
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
              />
            )}

          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
