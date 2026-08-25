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
import {
  Search,
  Layers,
  Filter,
  Waves,
  CloudRain,
} from 'lucide-react';

export function BasinMapPage() {
  const { basinSlug } = useParams({ strict: false }) as { basinSlug?: string };
  const currentSlug = basinSlug || 'yom';
  const { basin, stations, isLoading } = useBasin(currentSlug);
  const { savedStationId, saveAsNearbyStation } = useNearbyStation(currentSlug);
  const { t, isThai } = useLanguage();

  // Map Filter State
  const [showWaterLevel, setShowWaterLevel] = useState(true);
  const [showRainfall, setShowRainfall] = useState(true);
  const [statusFilters, setStatusFilters] = useState<Record<SituationStatus, boolean>>({
    normal: true,
    watch: true,
    warning: true,
    critical: true,
    missing: true,
  });
  const [baseMapType, setBaseMapType] = useState<'dark' | 'streets' | 'satellite'>('dark');
  
  // Search & Selection
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Filter stations based on controls
  const visibleStations = stations.filter((s) => {
    if (s.stationType === 'water_level' && !showWaterLevel) return false;
    if (s.stationType === 'rainfall' && !showRainfall) return false;
    if (!statusFilters[s.status]) return false;
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
            const isWater = station.stationType === 'water_level';
            const isSelected = selectedStation?.id === station.id;

            return (
              <div
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 shadow-xs'
                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                        isWater
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
                  <StatusBadge status={station.status} size="sm" showIcon={false} />
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {t(station.name)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono font-medium">
                  <span>{t(station.geocode.amphoe)}</span>
                  <span className="text-cyan-700 dark:text-cyan-300 font-bold">
                    {isWater
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
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`p-2.5 rounded-2xl border backdrop-blur-xl shadow-lg transition-all flex items-center gap-2 text-xs font-bold cursor-pointer ${
              isFilterPanelOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-white/95 dark:bg-slate-950/90 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Filter className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">{isThai ? 'ตัวกรองเลเยอร์' : 'Layer Filters'}</span>
          </button>

          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className={`p-2.5 rounded-2xl border backdrop-blur-xl shadow-lg transition-all flex items-center gap-2 text-xs font-bold cursor-pointer ${
              isLegendOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-white/95 dark:bg-slate-950/90 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">{isThai ? 'สัญลักษณ์' : 'Legend'}</span>
          </button>
        </div>

        {/* Floating Filter Panel Dropdown */}
        {isFilterPanelOpen && (
          <div className="absolute top-16 right-4 z-30 w-72 animate-scaleUp">
            <MapFilterControl
              showWaterLevel={showWaterLevel}
              setShowWaterLevel={setShowWaterLevel}
              showRainfall={showRainfall}
              setShowRainfall={setShowRainfall}
              statusFilters={statusFilters}
              setStatusFilters={setStatusFilters}
              baseMapType={baseMapType}
              setBaseMapType={setBaseMapType}
            />
          </div>
        )}

        {/* Floating Legend Dropdown */}
        {isLegendOpen && (
          <div className="absolute top-16 right-4 z-30 w-64 animate-scaleUp">
            <MapLegend />
          </div>
        )}

        {/* Leaflet Map Component */}
        <LeafletWaterMap
          stations={visibleStations}
          center={basin ? basin.center : [17.5, 100.0]}
          zoom={basin ? basin.zoom : 8}
          selectedStationId={selectedStation?.id}
          onSelectStation={(st) => setSelectedStation(st)}
          baseMapType={baseMapType}
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
