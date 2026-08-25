import { Basin } from '../types/basin';
import { Station } from '../types/station';
import { BASINS_DATA } from './data/multiBasinData';
import { YOM_STATIONS } from './data/yomStations';
import { OTHER_BASIN_STATIONS } from './data/otherBasinStations';

export function getAllBasins(): Basin[] {
  return BASINS_DATA;
}

export function getBasinById(slug: string): Basin | undefined {
  const normalized = slug.toLowerCase().trim();
  return BASINS_DATA.find(b => b.id === normalized || b.id === normalized.replace('-basin', ''));
}

export const getBasinBySlug = getBasinById;

export function getStationsForBasin(basinId: string): Station[] {
  const normalized = basinId.toLowerCase().trim();
  if (normalized === 'yom') {
    return YOM_STATIONS;
  }
  return OTHER_BASIN_STATIONS.filter(s => s.basinId === normalized);
}

export function getRiverChainStations(basinId: string): Station[] {
  const stations = getStationsForBasin(basinId);
  return stations
    .filter(s => s.stationType === 'water_level' && s.riverOrder !== undefined)
    .sort((a, b) => (a.riverOrder || 0) - (b.riverOrder || 0));
}

export function getTopWaterLevelStations(basinId: string, limit = 5): Station[] {
  const stations = getStationsForBasin(basinId);
  return stations
    .filter(s => s.stationType === 'water_level' && s.waterLevel)
    .sort((a, b) => {
      // Sort by bank capacity percentage descending
      return (b.waterLevel?.bankCapacityPercent || 0) - (a.waterLevel?.bankCapacityPercent || 0);
    })
    .slice(0, limit);
}

export function getTopRainfallStations(
  basinId: string,
  interval: '1h' | '3h' | '6h' | '24h' = '24h',
  limit = 5
): Station[] {
  const stations = getStationsForBasin(basinId);
  return stations
    .filter(s => s.rainfall !== undefined)
    .sort((a, b) => {
      const getVal = (st: Station) => {
        if (!st.rainfall) return 0;
        if (interval === '1h') return st.rainfall.rain1h;
        if (interval === '3h') return st.rainfall.rain3h;
        if (interval === '6h') return st.rainfall.rain6h;
        return st.rainfall.rain24h;
      };
      return getVal(b) - getVal(a);
    })
    .slice(0, limit);
}
