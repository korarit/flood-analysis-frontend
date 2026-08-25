import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { getAllBasins } from '../services/basinService';
import { getStoredNearbyStationId } from '../services/storageService';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Waves,
  Search,
  CloudRain,
  MapPin,
  ArrowRight,
  Sparkles,
  Navigation,
  Globe2,
  Activity,
  Layers,
  RadioTower,
  Sun,
  Moon,
} from 'lucide-react';

export function BasinSelectionPage() {
  const { t, language, setLanguage, isThai } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const allBasins = getAllBasins();
  const savedNearbyId = getStoredNearbyStationId();

  // Filter basins by search query (TH/EN name or covered provinces)
  const filteredBasins = allBasins.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = b.name.th.toLowerCase().includes(q) || b.name.en.toLowerCase().includes(q);
    const matchProvince = b.provinces.some(
      (p) => p.th.toLowerCase().includes(q) || p.en.toLowerCase().includes(q)
    );
    const matchRiver = b.mainRivers.some(
      (r) => r.th.toLowerCase().includes(q) || r.en.toLowerCase().includes(q)
    );
    return matchName || matchProvince || matchRiver;
  });

  return (
    <div className="min-h-screen bg-background text-slate-100 relative overflow-hidden flex flex-col justify-between">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -left-48 top-96 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -right-48 top-96 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Top Navigation / Brand */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-glow-cyan flex items-center justify-center text-slate-950">
              <Waves className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent leading-tight">
                Water Situation Platform
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wider uppercase">
                {isThai ? 'ระบบติดตามและสรุปสถานการณ์น้ำระดับลุ่มน้ำ' : 'Multi-Basin Hydrological Platform'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
              title={isDark ? (isThai ? 'เปลี่ยนเป็นธีมสว่าง (Light Mode)' : 'Switch to Light Mode') : (isThai ? 'เปลี่ยนเป็นธีมมืด (Dark Mode)' : 'Switch to Dark Mode')}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
            </button>

            <button
              onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 text-slate-300 hover:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-10">
        
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-glow-cyan/20">
            <RadioTower className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{isThai ? 'สถานการณ์น้ำเรียลไทม์ 5 ลุ่มน้ำหลัก' : 'Real-time 5 Major River Basins'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
            {isThai ? (
              <>
                เลือกลุ่มน้ำเพื่อดู <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">สถานการณ์น้ำ</span>
              </>
            ) : (
              <>
                Select a River Basin to View <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Live Situation</span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {isThai
              ? 'ระบบรายงานระดับน้ำ ปริมาณฝน อัตราการไหล และการแจ้งเตือนภัยน้ำท่วมน้ำหลากแบบเรียลไทม์ พร้อมระบบระบุสถานีใกล้ฉันเพื่อประชาชน'
              : 'Live telemetry monitoring river levels, rainfall, discharge flow, and warning alerts with nearby station tracking.'}
          </p>

          {/* Omni Search Bar */}
          <div className="pt-3 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isThai
                    ? 'ค้นหาชื่อลุ่มน้ำ (ยม, น่าน, ปิง, วัง, เจ้าพระยา) หรือชื่อจังหวัด...'
                    : 'Search basin by name or province (e.g. Yom, Phrae, Nan, Chiang Mai)...'
                }
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-xl transition-all"
              />
            </div>
          </div>
        </div>

        {/* Saved Nearby Station Shortcut Banner */}
        {savedNearbyId && (
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-4 sm:p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-glow-cyan/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    {isThai ? 'สถานีใกล้ฉันที่คุณเคยบันทึกไว้' : 'Your Saved Nearby Reference Station'}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-100">
                    {savedNearbyId === 'Y-0014'
                      ? 'Y.14 ศรีสัชนาลัย (ลุ่มน้ำยม)'
                      : `รหัสสถานี: ${savedNearbyId}`}
                  </div>
                </div>
              </div>
              <Link
                to="/basin/$basinSlug/station/$stationId"
                params={{ basinSlug: 'yom', stationId: savedNearbyId }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <span>{isThai ? 'เข้าสู่สถานีนี้ทันที' : 'Open Station Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Basin Cards Grid with Visual Backgrounds (§4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredBasins.map((basin) => (
            <Link
              key={basin.id}
              to="/basin/$basinSlug"
              params={{ basinSlug: basin.id }}
              className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-950/40 hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
            >
              {/* Dynamic Hydro Graphic Backdrop */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${basin.bgGradient} opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none`}
              />
              
              {/* Topographic Meander Water Vector Backdrop Motif */}
              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-cyan-500/10 opacity-30 pointer-events-none group-hover:scale-125 transition-transform" />
              <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full border border-cyan-500/15 opacity-40 pointer-events-none group-hover:scale-115 transition-transform" />

              <div className="relative z-10 space-y-4">
                {/* Header: Basin Code & Live Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/60">
                    CODE {basin.code}
                  </span>
                  <StatusBadge status={basin.overallStatus} size="sm" />
                </div>

                {/* Basin Titles */}
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {t(basin.name)}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {basin.name.en}
                  </p>
                </div>

                <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-2">
                  {t(basin.description)}
                </p>

                {/* Key Telemetry Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 mb-1">
                      <Waves className="w-3.5 h-3.5" />
                      <span>{isThai ? 'สถานีวัดระดับน้ำ' : 'Water Level'}</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-100">
                      {basin.waterLevelStationsCount}{' '}
                      <span className="text-xs font-sans text-slate-400 font-normal">
                        {isThai ? 'สถานี' : 'stations'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-[11px] text-blue-400 mb-1">
                      <CloudRain className="w-3.5 h-3.5" />
                      <span>{isThai ? 'สถานีวัดน้ำฝน' : 'Rainfall'}</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-100">
                      {basin.rainfallStationsCount}{' '}
                      <span className="text-xs font-sans text-slate-400 font-normal">
                        {isThai ? 'สถานี' : 'stations'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Covered Provinces Tags */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{isThai ? 'พื้นที่ครอบคลุม:' : 'Provinces:'}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {basin.provinces.slice(0, 4).map((prov, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] rounded-md bg-slate-800/70 text-slate-300 border border-slate-700/50"
                      >
                        {t(prov)}
                      </span>
                    ))}
                    {basin.provinces.length > 4 && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-slate-800/40 text-slate-400">
                        +{basin.provinces.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  {isThai ? 'อัปเดต' : 'Updated'}: {basin.lastUpdated}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all">
                  <span>{isThai ? 'ดูสถานการณ์' : 'View Basin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State when no basin matches */}
        {filteredBasins.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-slate-400 text-base">
              {isThai
                ? 'ไม่พบลุ่มน้ำที่ตรงกับคำค้นหาของคุณ'
                : 'No river basin matching your query.'}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300"
            >
              {isThai ? 'ล้างคำค้นหา' : 'Clear search'}
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Korarit Saengthong — Water Situation Platform</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Developed by Korarit Saengthong</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
