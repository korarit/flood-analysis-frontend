import { useMemo } from 'react';
import { Basin } from '../types/basin';
import { Station } from '../types/station';
import {
  getBasinById,
  getStationsForBasin,
  getRiverChainStations,
  getTopWaterLevelStations,
  getTopRainfallStations,
  getAllBasins
} from '../services/basinService';

export function useBasin(basinSlug?: string) {
  const currentSlug = basinSlug || 'yom';

  const basin: Basin | undefined = useMemo(() => {
    return getBasinById(currentSlug) || getBasinById('yom');
  }, [currentSlug]);

  const allBasins = useMemo(() => getAllBasins(), []);

  const stations: Station[] = useMemo(() => {
    if (!basin) return [];
    return getStationsForBasin(basin.id);
  }, [basin]);

  const riverChain: Station[] = useMemo(() => {
    if (!basin) return [];
    return getRiverChainStations(basin.id);
  }, [basin]);

  const topWaterLevelStations: Station[] = useMemo(() => {
    if (!basin) return [];
    return getTopWaterLevelStations(basin.id, 5);
  }, [basin]);

  const getTopRain = (interval: '1h' | '3h' | '6h' | '24h' = '24h') => {
    if (!basin) return [];
    return getTopRainfallStations(basin.id, interval, 5);
  };

  return {
    basin,
    allBasins,
    stations,
    riverChain,
    topWaterLevelStations,
    getTopRain,
    isLoading: false,
  };
}
