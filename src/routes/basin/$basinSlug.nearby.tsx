import React, { useState, useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useNearbyStation } from '../../hooks/useNearbyStation';
import { useLanguage } from '../../hooks/useLanguage';
import { Station, StationType } from '../../types/station';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Navigation,
  Search,
  MapPin,
  Waves,
  CloudRain,
  Check,
  RotateCw,
  AlertCircle,
  Radio,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export function NearbyStationDiscoveryPage() {
  const { basinSlug } = useParams({ strict: false }) as { basinSlug?: string };
  const currentSlug = basinSlug || 'yom';
  const { t, isThai } = useLanguage();

  const {
    savedStationId,
    nearbyStation,
    geoStatus,
    userCoords,
    nearestList,
    isScanning,
    selectedRadiusKm,
    setSelectedRadiusKm,
    requestLocation,
    searchByCustomLocation,
    saveAsNearbyStation,
    removeNearbyStation,
  } = useNearbyStation(currentSlug);

  const [mode, setMode] = useState<'gps' | 'search'>('gps');
  const [stationTypeFilter, setStationTypeFilter] = useState<'all' | StationType>('all');
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Auto trigger location scan on mount if idle
  useEffect(() => {
    if (geoStatus === 'idle') {
      requestLocation();
    }
  }, [geoStatus, requestLocation]);

  // District preset buttons for quick landmark searching
  const districtPresets = [
    { name: { th: 'อ.ศรีสัชนาลัย สุโขทัย', en: 'Si Satchanalai, Sukhothai' }, lat: 17.5186, long: 99.7615 },
    { name: { th: 'อ.เมือง สุโขทัย', en: 'Mueang Sukhothai' }, lat: 17.0084, long: 99.8242 },
    { name: { th: 'อ.เมือง แพร่', en: 'Mueang Phrae' }, lat: 18.1425, long: 100.1418 },
    { name: { th: 'อ.สอง แพร่', en: 'Song, Phrae' }, lat: 18.4552, long: 100.1884 },
    { name: { th: 'อ.บางระกำ พิษณุโลก', en: 'Bang Rakam, Phitsanulok' }, lat: 16.7582, long: 100.1194 },
    { name: { th: 'อ.พรานกระต่าย กำแพงเพชร', en: 'Phran Kratai' }, lat: 16.6537, long: 99.5757 },
  ];

  const handleSaveStation = (st: Station) => {
    saveAsNearbyStation(st);
    setSavedToast(t(st.name));
    setTimeout(() => setSavedToast(null), 3000);
  };

  // Filter nearest list
  const filteredResults = nearestList.filter((item) => {
    if (stationTypeFilter !== 'all' && item.station.stationType !== stationTypeFilter) {
      return false;
    }
    if (selectedRadiusKm !== 999 && item.distanceKm > selectedRadiusKm) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 p-4 text-emerald-200 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-slideDown">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {isThai ? 'บันทึกสถานีใกล้ฉันสำเร็จ' : 'Saved as Nearby Station'}
            </div>
            <div className="text-sm font-semibold">{savedToast}</div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-cyan-500/30 bg-white/95 dark:bg-gradient-to-br dark:from-cyan-950/40 dark:via-slate-900/80 dark:to-slate-950/90 p-6 sm:p-8 backdrop-blur-2xl shadow-md dark:shadow-2xl space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 text-xs font-bold mb-2">
              <Navigation className="w-3.5 h-3.5" />
              <span>{isThai ? 'ระบบค้นหาและระบุสถานีใกล้ฉัน' : 'Nearby Telemetry Discovery Hub'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {isThai ? 'ค้นหาสถานีวัดระดับน้ำ & ปริมาณฝนใกล้คุณ' : 'Find Stations Near Your Location'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1 font-medium">
              {isThai
                ? 'คำนวณระยะทางจริงจากตำแหน่ง GPS หรือเลือกสถานที่ใกล้บ้าน เพื่อเลือก 1 สถานีเป็นจุดอ้างอิงหลักในการติดตามสถานการณ์น้ำ'
                : 'Calculate real-time distance from your coordinates or landmark to set your primary reference station.'}
            </p>
          </div>

          {/* Mode Switcher: GPS Scan vs Landmark Search */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-800 self-start sm:self-auto shrink-0 shadow-xs">
            <button
              onClick={() => {
                setMode('gps');
                requestLocation();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                mode === 'gps'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{isThai ? 'ใช้พิกัด GPS' : 'Use GPS'}</span>
            </button>
            <button
              onClick={() => setMode('search')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                mode === 'search'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{isThai ? 'เลือกตามสถานที่' : 'By Landmark'}</span>
            </button>
          </div>
        </div>

        {/* GPS Scanning Animation State */}
        {isScanning && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-300 dark:border-cyan-500/20 text-cyan-800 dark:text-cyan-300 text-sm font-semibold animate-pulse shadow-xs">
            <RotateCw className="w-5 h-5 animate-spin text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>
              {isThai
                ? 'กำลังเชื่อมต่อดาวเทียมและคำนวณระยะทางไปยังสถานีทั้งหมดในลุ่มน้ำ...'
                : 'Scanning satellite GPS coordinates and computing distances to all stations...'}
            </span>
          </div>
        )}

        {/* Permission Denied Fallback UI (§13) */}
        {geoStatus === 'denied' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 text-sm space-y-3 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{isThai ? 'ไม่สามารถเข้าถึงตำแหน่ง GPS ของคุณได้' : 'Location Permission Denied'}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {isThai
                ? 'คุณยังสามารถค้นหาและเลือกสถานีใกล้เคียงได้ โดยเลือกจากตำบล/อำเภอ หรือระบุจุดอ้างอิงด้านล่างนี้'
                : 'You can still find nearby stations by selecting your district or landmark from the list below.'}
            </p>
          </div>
        )}

        {/* Landmark Presets Bar (Active in Search Mode or Denied GPS) */}
        {(mode === 'search' || geoStatus === 'denied') && (
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-400 block">
              {isThai ? 'เลือกตำแหน่งอำเภออ้างอิง:' : 'Select District Landmark:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {districtPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => searchByCustomLocation(preset.lat, preset.long)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>{t(preset.name)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar: Distance Radius & Station Type */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 dark:bg-background-card/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-xs transition-colors">
        
        {/* Distance Radius Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{isThai ? 'รัศมี:' : 'Radius:'}</span>
          </span>
          {[5, 10, 25, 50, 999].map((rad) => (
            <button
              key={rad}
              onClick={() => setSelectedRadiusKm(rad)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRadiusKm === rad
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:text-slate-200'
              }`}
            >
              {rad === 999 ? (isThai ? 'ทั้งหมด' : 'All') : `${rad} km`}
            </button>
          ))}
        </div>

        {/* Station Type Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setStationTypeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              stationTypeFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isThai ? 'ทั้งหมด' : 'All'}
          </button>
          <button
            onClick={() => setStationTypeFilter('water_level')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              stationTypeFilter === 'water_level'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{isThai ? 'วัดระดับน้ำ' : 'Water Level'}</span>
          </button>
          <button
            onClick={() => setStationTypeFilter('rainfall')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              stationTypeFilter === 'rainfall'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>{isThai ? 'วัดปริมาณฝน' : 'Rainfall'}</span>
          </button>
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1 font-medium">
        <span>
          {isThai
            ? `พบสถานีในพื้นที่ ${filteredResults.length} แห่ง (เรียงจากระยะใกล้ที่สุด)`
            : `Found ${filteredResults.length} stations (sorted by nearest distance)`}
        </span>
        {savedStationId && (
          <span className="text-cyan-700 dark:text-cyan-400 font-bold">
            {isThai ? '★ คุณได้บันทึกสถานีใกล้ฉันไว้แล้ว 1 สถานี' : '★ 1 Saved Reference Station active'}
          </span>
        )}
      </div>

      {/* Nearest Stations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResults.map(({ station, distanceKm }) => {
          const isWater = station.stationType === 'water_level';
          const wl = station.waterLevel;
          const rf = station.rainfall;
          const isSaved = savedStationId === station.id;

          return (
            <div
              key={station.id}
              className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-xl shadow-md dark:shadow-xl transition-all flex flex-col justify-between ${
                isSaved
                  ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 ring-2 ring-cyan-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/80 hover:border-cyan-400 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Distance Badge & Type Icon */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isWater
                          ? 'bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400'
                          : 'bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {isWater ? <Waves className="w-5 h-5" /> : <CloudRain className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-cyan-800 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-300 dark:border-cyan-800/60">
                        {station.code}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                        {t(station.name)}
                      </h3>
                    </div>
                  </div>

                  <StatusBadge status={station.status} size="sm" showIcon={false} />
                </div>

                {/* Distance Indicator */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-cyan-700 dark:text-cyan-300 font-bold mb-3">
                  <Navigation className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>{distanceKm} km {isThai ? 'จากตำแหน่งคุณ' : 'from you'}</span>
                </div>

                {/* Address */}
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-3 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {t(station.geocode.tumbon)}, {t(station.geocode.amphoe)}, จ.{t(station.geocode.province)}
                  </span>
                </p>

                {/* Telemetry Snapshot */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-2 mb-4">
                  {isWater && wl ? (
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'ระดับน้ำ' : 'Level'}</span>
                        <span className="text-xl font-extrabold font-mono text-cyan-700 dark:text-cyan-300">
                          {wl.waterLevelMsl} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">{isThai ? 'ม.รทก.' : 'm MSL'}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'อัตราไหล (Q)' : 'Discharge'}</span>
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-200">
                          {wl.discharge} m³/s
                        </span>
                      </div>
                    </div>
                  ) : rf ? (
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'ฝน 24 ชม.' : '24h Rain'}</span>
                        <span className="text-xl font-extrabold font-mono text-blue-700 dark:text-blue-300">
                          {rf.rain24h} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">มม.</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{isThai ? 'ฝน 1 ชม.' : '1h Rain'}</span>
                        <span className="text-sm font-bold font-mono text-cyan-700 dark:text-cyan-300">
                          {rf.rain1h} มม.
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons: 1-Tap Save as Nearby Station + View Detail */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                <button
                  onClick={() => handleSaveStation(station)}
                  disabled={isSaved}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSaved
                      ? 'bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-400 dark:border-cyan-500/50 text-cyan-900 dark:text-cyan-300 cursor-default'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isThai ? 'สถานีใกล้ฉันแล้ว' : 'Active Nearby'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isThai ? '★ ตั้งเป็นสถานีใกล้ฉัน' : 'Set as Nearby'}</span>
                    </>
                  )}
                </button>

                <Link
                  to="/basin/$basinSlug/station/$stationId"
                  params={{ basinSlug: currentSlug, stationId: station.id }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold transition-all shadow-xs"
                  title={isThai ? 'ดูกราฟและประวัติย้อนหลัง' : 'View full telemetry'}
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
