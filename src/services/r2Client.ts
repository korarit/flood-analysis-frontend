import { SituationStatus } from '../types/basin';

export const R2_PUBLIC_BASE_URL: string = (
  (import.meta as any).env?.VITE_R2_PUBLIC_BASE_URL ||
  'https://pub-6d09ad692430411182c45170ee192a0a.r2.dev'
).replace(/\/$/, '');

// Cache item wrapper
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

export interface R2BasinSummaryItem {
  id: string;
  slug: string;
  code: string;
  name: { th: string; en: string };
  totalStations: number;
  overallStatus: SituationStatus;
  lastUpdated: string;
  areaKm2?: number;
}

export interface R2BasinsListDataset {
  schemaVersion: string;
  datasetVersion: string;
  generatedAt: string;
  totalBasins: number;
  basins: R2BasinSummaryItem[];
}

export interface R2BasinDataset {
  schemaVersion: string;
  id: string;
  slug: string;
  code: string;
  name: { th: string; en: string };
  description: { th: string; en: string };
  areaKm2: number | null;
  boundaryGeojsonPath: string | null;
  isActive: boolean;
  updatedAt: string;
}

export interface R2BasinOverviewDataset {
  schemaVersion: string;
  datasetVersion: string;
  basin: string;
  generatedAt: string;
  summary: {
    totalStations: number;
    waterLevelStations: number;
    rainfallStations: number;
    overallStatus: SituationStatus;
    statusSummary: {
      normalCount: number;
      watchCount: number;
      warningCount: number;
      criticalCount: number;
      missingCount: number;
      risingCount: number;
      heavyRainCount: number;
    };
  };
  keyStations: {
    critical: Array<{ id: string; name: { th: string; en: string }; stage: number | null }>;
    warning: Array<{ id: string; name: { th: string; en: string }; stage: number | null }>;
    watch: Array<{ id: string; name: { th: string; en: string }; stage: number | null }>;
  };
  rainfallHighlights: any[];
  riverHighlights: any[];
}

export interface R2StationSnapshotItem {
  id: string;
  code: string;
  type: 'water_level' | 'rainfall';
  name: { th: string; en: string };
  agency?: { th: string; en: string };
  river?: { th: string; en: string };
  lat: number;
  lon: number;
  current: {
    stage?: number | null;
    discharge?: number | null;
    rainfall1h?: number | null;
    rainfall3h?: number | null;
    rainfall6h?: number | null;
    rainfall24h?: number | null;
    rainfallToday?: number | null;
    waterLevelMsl?: number | null;
    storagePercent?: number | null;
    trend?: 'rising' | 'steady' | 'falling';
    status: SituationStatus;
    freshness: 'fresh' | 'delayed' | 'missing';
    alertReason?: { th: string; en: string };
    isUpstreamAlert?: boolean;
    lastUpdated: string;
  };
}

export interface R2StationListDataset {
  schemaVersion: string;
  datasetVersion: string;
  basin: string;
  generatedAt: string;
  totalStations: number;
  stations: R2StationSnapshotItem[];
}

export interface R2StationDetailDataset {
  schemaVersion: string;
  datasetVersion: string;
  generatedAt: string;
  station: {
    id: string;
    code: string;
    basin: string;
    type: 'water_level' | 'rainfall';
    name: { th: string; en: string };
    address: { th: string; en: string };
    agency: { th: string; en: string };
    river?: { th: string; en: string };
    location: {
      lat: number;
      lon: number;
      groundLevelMsl: number | null;
      bankLevelMsl: number | null;
      warningLevelMsl: number | null;
      criticalLevelMsl: number | null;
    };
    thresholds: {
      groundLevelMsl?: number | null;
      bedLevelMsl?: number | null;
      bankLevelMsl: number | null;
      warningLevelMsl: number | null;
      criticalLevelMsl: number | null;
      warningRain24h: number | null;
      criticalRain24h: number | null;
    };
    relationsSummary: {
      influencingRainfallCount?: number;
      streamFallCount?: number;
      nextStationId?: string | null;
      streamFallName?: string | null;
      receivingWaterlevelCount?: number;
      receivingStationIds?: string[];
    };
    source: {
      provider: string;
      sourceStationId: string;
    };
    status: string;
  };
}

export interface R2StationRelationsDataset {
  schemaVersion: string;
  datasetVersion: string;
  stationId: string;
  stationType: 'water_level' | 'rainfall';
  basin: string;
  generatedAt: string;
  influencingRainfallStations?: any[];
  streamFall?: any[];
  downstreamStations?: any[];
  receivingWaterlevelStations?: any[];
  relations: Array<{
    type: string;
    stationId: string;
    targetStationId: string;
    name: { th: string; en: string };
    targetStationName: { th: string; en: string };
    stationType: 'water_level' | 'rainfall';
    distanceKm: number;
    travelTimeHours?: number | null;
    influenceWeightPercent?: number | null;
    latestValue: string;
    status: SituationStatus;
    isUpstream?: boolean;
  }>;
}

export interface R2RiverChainDataset {
  schemaVersion: string;
  basin: string;
  river: string;
  generatedAt: string;
  stations: string[];
}

export interface R2EventsFeedDataset {
  schemaVersion: string;
  basin: string;
  generatedAt: string;
  events: Array<{
    id: string;
    timestamp: string;
    level: SituationStatus;
    title: string;
    message: string;
    stationId?: string;
  }>;
}

class R2Client {
  private cache = new Map<string, CacheItem<any>>();

  /**
   * Universal fetcher with client-side cache and timeout
   */
  async fetchJson<T>(
    path: string,
    options: { ttlMs?: number; bypassCache?: boolean } = {}
  ): Promise<T | null> {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = `${R2_PUBLIC_BASE_URL}/${cleanPath}`;
    const ttlMs = options.ttlMs ?? 60_000; // Default 1 minute cache

    if (!options.bypassCache && this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      if (Date.now() - cached.timestamp < cached.ttlMs) {
        return cached.data as T;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      let res: Response | null = null;
      try {
        res = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });
      } catch (directErr: any) {
        // Fallback: If direct R2 fetch was blocked by browser CORS policy, use dev proxy (/r2-dev)
        if (url.includes('.r2.dev') && typeof window !== 'undefined') {
          try {
            res = await fetch(`/r2-dev/${cleanPath}`, {
              signal: controller.signal,
              headers: { Accept: 'application/json' },
            });
          } catch {
            throw directErr;
          }
        } else {
          throw directErr;
        }
      }
      clearTimeout(timeoutId);

      if (!res || !res.ok) {
        if (res && res.status !== 404) {
          console.warn(`[R2Client] HTTP ${res.status} fetching ${url}`);
        }
        return null;
      }

      const data = (await res.json()) as T;
      this.cache.set(url, {
        data,
        timestamp: Date.now(),
        ttlMs,
      });

      return data;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn(`[R2Client] Network error fetching ${url}:`, err.message);
      }
      return null;
    }
  }

  // 1. Root /basins.json
  async getBasinsList(bypassCache = false): Promise<R2BasinsListDataset | null> {
    return this.fetchJson<R2BasinsListDataset>('basins.json', { ttlMs: 120_000, bypassCache });
  }

  // 2. /basin/{slug}/basin.json
  async getBasinMetadata(slug: string): Promise<R2BasinDataset | null> {
    return this.fetchJson<R2BasinDataset>(`basin/${slug}/basin.json`, { ttlMs: 300_000 });
  }

  // 3. /basin/{slug}/overview.json
  async getBasinOverview(slug: string, bypassCache = false): Promise<R2BasinOverviewDataset | null> {
    return this.fetchJson<R2BasinOverviewDataset>(`basin/${slug}/overview.json`, { ttlMs: 60_000, bypassCache });
  }

  // 4. /waterlevel_station/{slug}/stations.json
  async getWaterLevelStations(slug: string, bypassCache = false): Promise<R2StationListDataset | null> {
    return this.fetchJson<R2StationListDataset>(`waterlevel_station/${slug}/stations.json`, { ttlMs: 60_000, bypassCache });
  }

  // 5. /rainfall_station/{slug}/stations.json
  async getRainfallStations(slug: string, bypassCache = false): Promise<R2StationListDataset | null> {
    return this.fetchJson<R2StationListDataset>(`rainfall_station/${slug}/stations.json`, { ttlMs: 60_000, bypassCache });
  }

  // 6. /{type}_station/{slug}/{stationId}/detail.json
  async getStationDetail(
    slug: string,
    stationId: string,
    type: 'water_level' | 'rainfall' = 'water_level'
  ): Promise<R2StationDetailDataset | null> {
    const folder = type === 'water_level' ? 'waterlevel_station' : 'rainfall_station';
    return this.fetchJson<R2StationDetailDataset>(`${folder}/${slug}/${stationId}/detail.json`, { ttlMs: 300_000 });
  }

  // 7. /{type}_station/{slug}/{stationId}/relations.json
  async getStationRelations(
    slug: string,
    stationId: string,
    type: 'water_level' | 'rainfall' = 'water_level'
  ): Promise<R2StationRelationsDataset | null> {
    const folder = type === 'water_level' ? 'waterlevel_station' : 'rainfall_station';
    return this.fetchJson<R2StationRelationsDataset>(`${folder}/${slug}/${stationId}/relations.json`, { ttlMs: 120_000 });
  }

  // 8. /basin/{slug}/river/chain.json
  async getRiverChain(slug: string): Promise<R2RiverChainDataset | null> {
    return this.fetchJson<R2RiverChainDataset>(`basin/${slug}/river/chain.json`, { ttlMs: 300_000 });
  }

  // 9. /basin/{slug}/events/feed.json
  async getEventsFeed(slug: string, bypassCache = false): Promise<R2EventsFeedDataset | null> {
    return this.fetchJson<R2EventsFeedDataset>(`basin/${slug}/events/feed.json`, { ttlMs: 60_000, bypassCache });
  }

  // 10. /basin/{slug}/report/bulletin-latest.json
  async getBulletinLatest(slug: string, bypassCache = false): Promise<any | null> {
    return this.fetchJson<any>(`basin/${slug}/report/bulletin-latest.json`, { ttlMs: 120_000, bypassCache });
  }

  // 11. /basin/{slug}/spatial/boundary.geojson
  async getBoundaryGeoJson(slug: string): Promise<any | null> {
    return this.fetchJson<any>(`basin/${slug}/spatial/boundary.geojson`, { ttlMs: 600_000 });
  }

  // 12. /basin/{slug}/spatial/rivers.geojson
  async getRiversGeoJson(slug: string): Promise<any | null> {
    return this.fetchJson<any>(`basin/${slug}/spatial/rivers.geojson`, { ttlMs: 600_000 });
  }

  /**
   * Clear in-memory cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export const r2Client = new R2Client();
