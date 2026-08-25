const STORAGE_KEYS = {
  NEARBY_STATION_ID: 'nearbyStationId',
  SELECTED_BASIN_ID: 'selectedBasinId',
  LANGUAGE: 'preferred_language',
};

export interface NearbyStationStorageData {
  nearbyStationId: string | null;
}

export function getStoredNearbyStationId(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NEARBY_STATION_ID);
    if (!raw) return null;
    // Check if stored as JSON or plain string
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw) as NearbyStationStorageData;
      return parsed.nearbyStationId || null;
    }
    return raw;
  } catch (e) {
    console.error('Error reading nearbyStationId from localStorage', e);
    return null;
  }
}

export function setStoredNearbyStationId(stationId: string | null): void {
  try {
    if (!stationId) {
      localStorage.removeItem(STORAGE_KEYS.NEARBY_STATION_ID);
    } else {
      // Store strictly as {"nearbyStationId": "..."} as specified in req.md §12
      const payload: NearbyStationStorageData = {
        nearbyStationId: stationId,
      };
      localStorage.setItem(STORAGE_KEYS.NEARBY_STATION_ID, JSON.stringify(payload));
    }
  } catch (e) {
    console.error('Error saving nearbyStationId to localStorage', e);
  }
}

export function getStoredLanguage(): 'th' | 'en' {
  try {
    const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return lang === 'en' ? 'en' : 'th';
  } catch {
    return 'th';
  }
}

export function setStoredLanguage(lang: 'th' | 'en'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (e) {
    console.error('Error saving language preference', e);
  }
}
