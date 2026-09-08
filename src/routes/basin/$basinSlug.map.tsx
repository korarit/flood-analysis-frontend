import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useBasin } from '../../hooks/useBasin';
import { useNearbyStation } from '../../hooks/useNearbyStation';
import { useLanguage } from '../../hooks/useLanguage';
import { Station, StationType } from '../../types/station';
import { SituationStatus } from '../../types/basin';
import { LeafletWaterMap } from '../../components/map/LeafletWaterMap';
import { MapFilterControl } from '../../components/map/MapFilterControl';
import { MapStationModal } from '../../components/map/MapStationModal';
import { MapLegend } from '../../components/map/MapLegend';
import { StatusBadge } from '../../components/common/StatusBadge';
import { isStationMissingData } from '../../services/stationService';
import {
  Search,
  Layers,
  Filter,
  Waves,
  CloudRain,
  Route,
} from 'lucide-react';

export function BasinMapPage() {
  const { basinSlug } = useParams({ strict: false }) as { basinSlug?: string };
  const currentSlug = basinSlug || 'yom';
  const { basin, stations, isLoading } = useBasin(currentSlug);
  const { savedStationId, saveAsNearbyStation } = useNearbyStation(currentSlug);
  const { t, isThai } = useLanguage();

  // Map Filter State: Default to water stations (§User Requirement)
  type StationFilterMode = 'water' | 'rainfall' | 'all';
  const [stationTypeFilter, setStationTypeFilter] = useState<StationFilterMode>('water');
  const showWaterLevel = stationTypeFilter === 'water' || stationTypeFilter === 'all';
  const showRainfall = stationTypeFilter === 'rainfall' || stationTypeFilter === 'all';
  const [statusFilters, setStatusFilters] = useState<Record<SituationStatus, boolean>>({
    normal: true,
    watch: true,
    warning: true,
    critical: true,
    missing: true,
  });
  const [baseMapType, setBaseMapType] = useState<'streets' | 'dark' | 'satellite'>('satellite');
  
  // Search & Selection
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [showFlowPaths, setShowFlowPaths] = useState(true);

  // Filter stations based on controls
  const visibleStations = stations.filter((s) => {
    if (s.stationType === 'water_level' && !showWaterLevel) return false;
    if (s.stationType === 'rainfall' && !showRainfall) return false;
    const effectiveStatus = isStationMissingData(s) ? 'missing' : s.status;
    if (!statusFilters[effectiveStatus]) return false;
    if (sidebarSearch.trim()) {
      const q = sidebarSearch.toLowerCase().trim();
      const matchName = s.name.th.toLowerCase().includes(q) || s.name.en.toLowerCase().includes(q);
      const matchCode = s.code.toLowerCase().includes(q);
      const matchAmphoe = s.geocode.amphoe.th.toLowerCase().includes(q);
      return matchName || matchCode || matchAmphoe;
    }
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-7.5rem)] flex overflow-hidden">
      
      {/* 1. DESKTOP LEFT SIDEBAR (Search & Stations List) (§29) */}
      <div className="hidden lg:flex w-96 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl z-20 shrink-0 transition-colors">
        
        {/* Sidebar Header & Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              {isThai ? 'รายการสถานีบนแผนที่' : 'Map Stations'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
              {visibleStations.length} / {stations.length}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <input
              type="text"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder={isThai ? 'ค้นหาสถานีบนแผนที่...' : 'Search station on map...'}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-xs"
            />
          </div>
        </div>

        {/* Sidebar Stations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {visibleStations.map((station) => {
            const isMissing = isStationMissingData(station);
            const isWater = station.stationType === 'water_level';
            const isSelected = selectedStation?.id === station.id;

            return (
              <div
                key={station.uniqueKey || `${station.stationType}-${station.id}`}
                onClick={() => setSelectedStation(station)}
                className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 shadow-xs'
                    : isMissing
                    ? 'border-transparent hover:border-slate-300 dark:hover:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 opacity-75 hover:opacity-100'
                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                        isMissing
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
                          : isWater
                          ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                      }`}
                    >
                      {isWater ? <Waves className="w-3.5 h-3.5" /> : <CloudRain className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {station.code}
                    </span>
                  </div>
                  <StatusBadge status={isMissing ? 'missing' : station.status} size="sm" showIcon={false} />
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {t(station.name)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono font-medium">
                  <span>{t(station.geocode.amphoe)}</span>
                  <span className={isMissing ? 'text-slate-400 dark:text-slate-500 font-semibold text-[10.5px]' : 'text-cyan-700 dark:text-cyan-300 font-bold'}>
                    {isMissing
                      ? (isThai ? 'ไม่มีข้อมูล' : 'No data')
                      : isWater
                      ? `${station.waterLevel?.waterLevelMsl} ม.รทก.`
                      : `${station.rainfall?.rain24h} มม.`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 2. INTERACTIVE MAP VIEWPORT */}
      <div className="relative flex-1 h-full w-full">
        
        {/* Floating Controls Overlay (Top Right) */}
        <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 max-w-[calc(100vw-2rem)]">
          
          {/* Top Control Buttons: Layer Filters & Legend */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsFilterPanelOpen(!isFilterPanelOpen);
                if (isLegendOpen) setIsLegendOpen(false);
              }}
              className={`p-2.5 px-3 rounded-2xl border backdrop-blur-xl shadow-lg transition-all flex items-center gap-2 text-xs font-bold cursor-pointer ${
                isFilterPanelOpen
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-white/95 dark:bg-slate-950/90 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Filter className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">{isThai ? 'ตัวกรองเลเยอร์' : 'Layer Filters'}</span>
            </button>

            <button
              onClick={() => {
                setIsLegendOpen(!isLegendOpen);
                if (isFilterPanelOpen) setIsFilterPanelOpen(false);
              }}
              className={`p-2.5 px-3 rounded-2xl border backdrop-blur-xl shadow-lg transition-all flex items-center gap-2 text-xs font-bold cursor-pointer ${
                isLegendOpen
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-white/95 dark:bg-slate-950/90 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">{isThai ? 'คำอธิบาย' : 'Legend'}</span>
            </button>

            {/* Flow Paths Layer Toggle */}
            <button
              type="button"
              onClick={() => setShowFlowPaths(!showFlowPaths)}
              title={isThai ? 'เปิด/ปิด เส้นทางการไหลของน้ำ' : 'Toggle Flow Paths'}
              className={`p-2.5 px-3 rounded-2xl border backdrop-blur-xl shadow-lg transition-all flex items-center gap-2 text-xs font-bold cursor-pointer ${
                showFlowPaths
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20'
                  : 'bg-white/95 dark:bg-slate-950/90 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Route className={`w-4 h-4 ${showFlowPaths ? 'text-slate-950' : 'text-cyan-600 dark:text-cyan-400'}`} />
              <span className="hidden sm:inline">{isThai ? 'เส้นทางน้ำ' : 'Flow Paths'}</span>
            </button>
          </div>

          {/* Station Type Selector: ย้ายมาอยู่ล่างคำอธิบาย แสดงให้เลือกแบบชัดๆ default คือสถานีน้ำ */}
          <div className="w-64 sm:w-72 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/95 dark:bg-slate-950/90 p-2.5 backdrop-blur-xl shadow-xl space-y-2 text-xs transition-colors">
            <div className="flex items-center justify-between px-1">
              <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isThai ? 'ประเภทสถานี' : 'Station Type'}
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                {stationTypeFilter === 'water'
                  ? (isThai ? 'สถานีระดับน้ำ' : 'Water Level')
                  : stationTypeFilter === 'rainfall'
                  ? (isThai ? 'สถานีวัดน้ำฝน' : 'Rainfall')
                  : (isThai ? 'แสดงทั้งหมด' : 'All Types')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {/* Water Level Button (Default) */}
              <button
                type="button"
                onClick={() => setStationTypeFilter('water')}
                className={`py-1.5 px-1.5 rounded-lg font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
                  stationTypeFilter === 'water'
                    ? 'bg-cyan-500 text-slate-950 shadow-md ring-1 ring-cyan-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Waves className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] truncate">{isThai ? 'สถานีน้ำ' : 'Water'}</span>
                </div>
                <span className={`text-[10px] font-mono leading-none ${
                  stationTypeFilter === 'water' ? 'text-slate-950 font-extrabold' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  ({stations.filter((s) => s.stationType === 'water_level').length})
                </span>
              </button>

              {/* Rainfall Button */}
              <button
                type="button"
                onClick={() => setStationTypeFilter('rainfall')}
                className={`py-1.5 px-1.5 rounded-lg font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
                  stationTypeFilter === 'rainfall'
                    ? 'bg-blue-500 text-white shadow-md ring-1 ring-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] truncate">{isThai ? 'สถานีฝน' : 'Rain'}</span>
                </div>
                <span className={`text-[10px] font-mono leading-none ${
                  stationTypeFilter === 'rainfall' ? 'text-blue-100 font-extrabold' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  ({stations.filter((s) => s.stationType === 'rainfall').length})
                </span>
              </button>

              {/* All Stations Button */}
              <button
                type="button"
                onClick={() => setStationTypeFilter('all')}
                className={`py-1.5 px-1.5 rounded-lg font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
                  stationTypeFilter === 'all'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md ring-1 ring-cyan-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] truncate">{isThai ? 'ทั้งหมด' : 'All'}</span>
                </div>
                <span className={`text-[10px] font-mono leading-none ${
                  stationTypeFilter === 'all' ? 'text-slate-950 font-extrabold' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  ({stations.length})
                </span>
              </button>
            </div>
          </div>

          {/* Floating Filter Panel Dropdown */}
          {isFilterPanelOpen && (
            <div className="w-72 animate-scaleUp">
              <MapFilterControl
                statusFilters={statusFilters}
                setStatusFilters={setStatusFilters}
                baseMapType={baseMapType}
                setBaseMapType={setBaseMapType}
              />
            </div>
          )}

          {/* Floating Legend Dropdown */}
          {isLegendOpen && (
            <div className="w-64 animate-scaleUp">
              <MapLegend />
            </div>
          )}
        </div>

        {/* Leaflet Map Component */}
        <LeafletWaterMap
          stations={visibleStations}
          center={basin ? basin.center : [17.5, 100.0]}
          zoom={basin ? basin.zoom : 8}
          selectedStationId={selectedStation?.id}
          onSelectStation={(st) => setSelectedStation(st)}
          baseMapType={baseMapType}
          basinSlug={currentSlug}
          showFlowPaths={showFlowPaths}
        />

        {/* 3. RESPONSIVE MODAL: Desktop Centered Modal + Mobile Bottom Modal (§User Requirement) */}
        <MapStationModal
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
          basinSlug={currentSlug}
          onSaveAsNearby={saveAsNearbyStation}
          isSavedNearby={selectedStation ? savedStationId === selectedStation.id : false}
        />

      </div>

    </div>
  );
}
