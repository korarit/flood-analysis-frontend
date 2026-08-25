import { useState, useEffect, useCallback } from 'react';
import { Station } from '../types/station';
import { getStoredNearbyStationId, setStoredNearbyStationId } from '../services/storageService';
import { getStationById, findNearestStations, NearbyStationResult } from '../services/stationService';

export type GeolocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported' | 'error';

export function useNearbyStation(basinId: string) {
  const [savedStationId, setSavedStationIdState] = useState<string | null>(getStoredNearbyStationId());
  const [nearbyStation, setNearbyStation] = useState<Station | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>('idle');
  const [userCoords, setUserCoords] = useState<{ lat: number; long: number } | null>(null);
  const [nearestList, setNearestList] = useState<NearbyStationResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(50);

  // Sync saved station data when basin or savedStationId changes
  useEffect(() => {
    const currentSavedId = getStoredNearbyStationId();
    setSavedStationIdState(currentSavedId);

    if (currentSavedId) {
      const st = getStationById(basinId, currentSavedId);
      if (st) {
        setNearbyStation(st);
      } else {
        // Fallback or station belongs to another basin
        setNearbyStation(null);
      }
    } else {
      setNearbyStation(null);
    }
  }, [basinId]);

  // Request user geolocation and compute closest stations
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }

    setGeoStatus('requesting');
    setIsScanning(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          long: pos.coords.longitude,
        };
        setUserCoords(coords);
        setGeoStatus('granted');
        setIsScanning(false);

        // Find nearest water level & rainfall stations
        const results = findNearestStations(basinId, coords.lat, coords.long, 'all', 100);
        setNearestList(results);
      },
      (err) => {
        console.warn('Geolocation permission denied or error:', err.message);
        setGeoStatus('denied');
        setIsScanning(false);

        // Fallback default coordinates (Center of Yom Basin: Sukhothai/Phrae)
        const fallbackCoords = { lat: 17.5186, long: 99.7615 };
        const results = findNearestStations(basinId, fallbackCoords.lat, fallbackCoords.long, 'all', 100);
        setNearestList(results);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [basinId]);

  // Set reference station by custom location (e.g. user selected district/landmark)
  const searchByCustomLocation = useCallback((lat: number, long: number) => {
    setUserCoords({ lat, long });
    setGeoStatus('granted');
    const results = findNearestStations(basinId, lat, long, 'all', 100);
    setNearestList(results);
  }, [basinId]);

  // Save station as the single nearby station in localStorage
  const saveAsNearbyStation = useCallback((station: Station) => {
    setStoredNearbyStationId(station.id);
    setSavedStationIdState(station.id);
    setNearbyStation(station);
  }, []);

  // Remove saved nearby station
  const removeNearbyStation = useCallback(() => {
    setStoredNearbyStationId(null);
    setSavedStationIdState(null);
    setNearbyStation(null);
  }, []);

  return {
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
  };
}
