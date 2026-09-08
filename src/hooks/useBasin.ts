import { useState, useEffect, useCallback, useMemo } from 'react';
import { Basin } from '../types/basin';
import { Station } from '../types/station';
import {
  getBasinById,
  getAllBasins,
  getStationsForBasin,
  getRiverChainStations,
  fetchAllBasins,
  fetchBasinBySlug,
  fetchStationsForBasin,
  fetchRiverChainStations,
  getTopWaterLevelStations,
  getTopRainfallStations,
} from '../services/basinService';

export function useBasin(basinSlug?: string) {
  const currentSlug = basinSlug || 'yom';

  // Instant initial state from cache or presets
  const [basin, setBasin] = useState<Basin | undefined>(() => getBasinById(currentSlug));
  const [allBasins, setAllBasins] = useState<Basin[]>(() => getAllBasins());
  const [stations, setStations] = useState<Station[]>(() => getStationsForBasin(currentSlug));
  const [riverChain, setRiverChain] = useState<Station[]>(() => getRiverChainStations(currentSlug));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadBasinData = useCallback(
    async (bypassCache = false) => {
      try {
        setError(null);

        // Parallel fetch from Cloudflare R2
        const [loadedBasins, loadedBasin, loadedStations, loadedRiverChain] = await Promise.all([
          fetchAllBasins(bypassCache),
          fetchBasinBySlug(currentSlug),
          fetchStationsForBasin(currentSlug, bypassCache),
          fetchRiverChainStations(currentSlug),
        ]);

        if (loadedBasins && loadedBasins.length > 0) {
          setAllBasins(loadedBasins);
        }
        if (loadedBasin) {
          setBasin(loadedBasin);
        }
        if (loadedStations && loadedStations.length > 0) {
          setStations(loadedStations);
        }
        if (loadedRiverChain) {
          setRiverChain(loadedRiverChain);
        }
      } catch (err: any) {
        console.warn(`[useBasin] Failed to load R2 data for ${currentSlug}:`, err);
        setError(err.message || 'Failed to load basin data from R2');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentSlug]
  );

  useEffect(() => {
    // On basin slug switch, initialize with fast fallback first
    const initialB = getBasinById(currentSlug);
    setBasin(initialB);
    setStations(getStationsForBasin(currentSlug));
    setRiverChain(getRiverChainStations(currentSlug));
    setIsLoading(true);

    loadBasinData();
  }, [currentSlug, loadBasinData]);

  const refetch = useCallback(() => {
    setIsRefreshing(true);
    return loadBasinData(true);
  }, [loadBasinData]);

  const topWaterLevelStations: Station[] = useMemo(() => {
    if (!basin) return [];
    return getTopWaterLevelStations(basin.id, 5, stations);
  }, [basin, stations]);

  const getTopRain = useCallback(
    (interval: '1h' | '3h' | '6h' | '24h' = '24h') => {
      if (!basin) return [];
      return getTopRainfallStations(basin.id, interval, 5, stations);
    },
    [basin, stations]
  );

  return {
    basin,
    allBasins,
    stations,
    riverChain,
    topWaterLevelStations,
    getTopRain,
    isLoading,
    isRefreshing,
    error,
    refetch,
  };
}
