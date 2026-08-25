import { Station, StationType } from '../types/station';
import { SituationStatus } from '../types/basin';
import { HistoricalTelemetrySeries } from '../types/telemetry';
import { getStationsForBasin } from './basinService';
import { generateHistoricalTelemetry } from './data/telemetryGenerator';

export interface StationFilterParams {
  searchQuery?: string;
  stationType?: 'all' | StationType;
  situationStatus?: 'all' | SituationStatus;
  provinceCode?: string;
  sortBy?: 'name' | 'water_level' | 'rainfall' | 'status' | 'update_time';
}

export interface NearbyStationResult {
  station: Station;
  distanceKm: number;
}

// Calculate Haversine distance in kilometers between two geo coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(1);
}

export function getStationById(basinId: string, stationId: string): Station | undefined {
  const stations = getStationsForBasin(basinId);
  const cleanId = stationId.toLowerCase().trim();
  return stations.find(s => s.id.toLowerCase() === cleanId || s.code.toLowerCase() === cleanId);
}

export function filterStations(basinId: string, params: StationFilterParams): Station[] {
  let stations = getStationsForBasin(basinId);

  // 1. Search Query Filter (name TH/EN, code, tumbon, amphoe, province, agency)
  if (params.searchQuery && params.searchQuery.trim() !== '') {
    const q = params.searchQuery.toLowerCase().trim();
    stations = stations.filter(s => {
      const matchNameTh = s.name.th.toLowerCase().includes(q);
      const matchNameEn = s.name.en.toLowerCase().includes(q);
      const matchCode = s.code.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      const matchTumbon = s.geocode.tumbon.th.toLowerCase().includes(q) || s.geocode.tumbon.en.toLowerCase().includes(q);
      const matchAmphoe = s.geocode.amphoe.th.toLowerCase().includes(q) || s.geocode.amphoe.en.toLowerCase().includes(q);
      const matchProvince = s.geocode.province.th.toLowerCase().includes(q) || s.geocode.province.en.toLowerCase().includes(q);
      const matchAgency = s.agency.name.th.toLowerCase().includes(q) || s.agency.shortname.th.toLowerCase().includes(q) || s.agency.shortname.en.toLowerCase().includes(q);
      
      return matchNameTh || matchNameEn || matchCode || matchTumbon || matchAmphoe || matchProvince || matchAgency;
    });
  }

  // 2. Station Type Filter ('all' | 'water_level' | 'rainfall')
  if (params.stationType && params.stationType !== 'all') {
    stations = stations.filter(s => s.stationType === params.stationType);
  }

  // 3. Situation Status Filter
  if (params.situationStatus && params.situationStatus !== 'all') {
    stations = stations.filter(s => s.status === params.situationStatus);
  }

  // 4. Province Code Filter
  if (params.provinceCode && params.provinceCode !== 'all') {
    stations = stations.filter(s => s.geocode.provinceCode === params.provinceCode);
  }

  // 5. Sorting
  const sortBy = params.sortBy || 'status';
  stations = [...stations].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.th.localeCompare(b.name.th, 'th');
    }
    if (sortBy === 'water_level') {
      const aVal = a.waterLevel?.waterLevelMsl || 0;
      const bVal = b.waterLevel?.waterLevelMsl || 0;
      return bVal - aVal;
    }
    if (sortBy === 'rainfall') {
      const aVal = a.rainfall?.rain24h || 0;
      const bVal = b.rainfall?.rain24h || 0;
      return bVal - aVal;
    }
    if (sortBy === 'update_time') {
      return b.lastUpdated.localeCompare(a.lastUpdated);
    }
    // Default sort by status severity (critical > warning > watch > normal > missing)
    const severityScore: Record<SituationStatus, number> = {
      critical: 4,
      warning: 3,
      watch: 2,
      normal: 1,
      missing: 0,
    };
    return severityScore[b.status] - severityScore[a.status];
  });

  return stations;
}

export function findNearestStations(
  basinId: string,
  userLat: number,
  userLong: number,
  stationType: 'all' | StationType = 'all',
  maxDistanceKm = 100
): NearbyStationResult[] {
  let stations = getStationsForBasin(basinId);
  
  if (stationType !== 'all') {
    stations = stations.filter(s => s.stationType === stationType);
  }

  const results: NearbyStationResult[] = stations.map(station => {
    const dist = calculateDistanceKm(userLat, userLong, station.lat, station.long);
    return { station, distanceKm: dist };
  });

  return results
    .filter(r => r.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getStationHistoricalTelemetry(
  station: Station,
  timeRange: '1d' | '3d' | '7d' | 'custom' = '1d',
  startDate?: string,
  endDate?: string
): HistoricalTelemetrySeries {
  return generateHistoricalTelemetry(station, timeRange, startDate, endDate);
}

export function searchStations(
  query: string,
  options?: { basinId?: string; type?: 'all' | 'water_level' | 'rainfall' }
): Station[] {
  const basinId = options?.basinId || 'yom';
  const type = options?.type || 'all';
  return filterStations(basinId, {
    searchQuery: query,
    stationType: type,
  });
}

