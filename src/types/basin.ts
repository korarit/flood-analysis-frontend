export type SituationStatus = 'normal' | 'watch' | 'warning' | 'critical' | 'missing';

export type FreshnessStatus = 'fresh' | 'delayed' | 'missing';

export interface LocalizedString {
  th: string;
  en: string;
}

export interface Basin {
  id: string; // e.g. 'yom', 'nan', 'ping', 'wang', 'chao-phraya'
  code: string; // e.g. '08'
  name: LocalizedString;
  description: LocalizedString;
  mainRivers: LocalizedString[];
  provinces: LocalizedString[];
  areaKm2: number;
  totalStations: number;
  waterLevelStationsCount: number;
  rainfallStationsCount: number;
  overallStatus: SituationStatus;
  statusSummary: {
    watchCount: number;
    risingCount: number;
    heavyRainCount: number;
  };
  lastUpdated: string; // ISO string or Thai time
  bgGradient: string;
  accentColor: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
}
