import React from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useStationData } from '../../hooks/useStationData';
import { useNearbyStation } from '../../hooks/useNearbyStation';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { TelemetryGauge } from '../../components/station/TelemetryGauge';
import { HistoricalChart } from '../../components/station/HistoricalChart';
import { StationRelations } from '../../components/station/StationRelations';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Waves,
  CloudRain,
  MapPin,
  Building2,
  Navigation,
  Map,
  ArrowLeft,
  Check,
} from 'lucide-react';

export function StationDetailPage() {
  const { basinSlug, stationId } = useParams({ strict: false }) as {
    basinSlug?: string;
    stationId?: string;
  };
  const currentSlug = basinSlug || 'yom';
  const currentStationId = stationId || '';

  const { t, isThai } = useLanguage();
  const {
    station,
    telemetrySeries,
    timeRange,
    chartMode,
    setChartMode,
    startDate,
    endDate,
    isLoading,
    handleTimeRangeChange,
    handleCustomDateChange,
  } = useStationData(currentSlug, currentStationId);

  const { savedStationId, saveAsNearbyStation } = useNearbyStation(currentSlug);
  const isSavedNearby = station ? savedStationId === station.id : false;

  if (!station) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          type="stations_not_found"
          title={isThai ? 'ไม่พบข้อมูลสถานีที่ระบุ' : 'Station Not Found'}
          actionText={isThai ? 'กลับไปยังรายการสถานี' : 'Back to Station Directory'}
        />
      </div>
    );
  }

  const isWater = station.stationType === 'water_level';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/basin/$basinSlug/station"
          params={{ basinSlug: currentSlug }}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isThai ? 'กลับสู่รายการสถานี' : 'Back to Station List'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Set as Nearby Station Button */}
          {isWater && (
            <button
              onClick={() => saveAsNearbyStation(station)}
              disabled={isSavedNearby}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSavedNearby
                  ? 'bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-400 dark:border-cyan-500/50 text-cyan-900 dark:text-cyan-300 cursor-default'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md active:scale-95'
              }`}
            >
              {isSavedNearby ? <Check className="w-3.5 h-3.5" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>{isSavedNearby ? (isThai ? 'สถานีใกล้ฉันแล้ว' : 'Active Nearby') : (isThai ? '★ ตั้งเป็นสถานีใกล้ฉัน' : 'Set as Nearby')}</span>
            </button>
          )}

          {/* View on Map Link (§20) */}
          <Link
            to="/basin/$basinSlug/map"
            params={{ basinSlug: currentSlug }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 shadow-xs"
          >
            <Map className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{isThai ? 'ดูบนแผนที่' : 'View on Map'}</span>
          </Link>
        </div>
      </div>

      {/* Station Profile Header Card (§20) */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-8 backdrop-blur-2xl shadow-md dark:shadow-xl space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                isWater
                  ? 'bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400'
                  : 'bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-400'
              }`}
            >
              {isWater ? <Waves className="w-8 h-8" /> : <CloudRain className="w-8 h-8" />}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-300 dark:border-cyan-800/60">
                  {station.code}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isWater ? (isThai ? 'สถานีวัดระดับน้ำ' : 'Water Level Station') : (isThai ? 'สถานีวัดปริมาณน้ำฝน' : 'Rainfall Station')}
                </span>
                <StatusBadge status={station.status} size="sm" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {t(station.name)}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {t(station.geocode.tumbon)}, {t(station.geocode.amphoe)}, จ.{t(station.geocode.province)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {t(station.agency.name)} ({t(station.agency.shortname)})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <FreshnessBadge freshness={station.freshness} timestampText={station.lastUpdated.split(' ')[1]} />
          </div>
        </div>
      </div>

      {/* Telemetry Gauges Section (§21, §22) */}
      {isWater && station.waterLevel && (
        <TelemetryGauge telemetry={station.waterLevel} />
      )}

      {/* Historical Telemetry Chart (§23–§26) */}
      <HistoricalChart
        station={station}
        telemetrySeries={telemetrySeries}
        timeRange={timeRange}
        chartMode={chartMode}
        setChartMode={setChartMode}
        startDate={startDate}
        endDate={endDate}
        isLoading={isLoading}
        onTimeRangeChange={handleTimeRangeChange}
        onCustomDateChange={handleCustomDateChange}
      />

      {/* Upstream Rain Influence Network / Downstream River Relations (§27) */}
      <StationRelations station={station} basinSlug={currentSlug} />

    </div>
  );
}
