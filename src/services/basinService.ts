import { Basin, SituationStatus } from '../types/basin';
import { Station } from '../types/station';
import { BASINS_DATA } from './data/multiBasinData';
import { YOM_STATIONS } from './data/yomStations';
import { OTHER_BASIN_STATIONS } from './data/otherBasinStations';
import { r2Client, R2StationSnapshotItem, R2RiverChainEdge } from './r2Client';

// In-memory cache for live R2 data
let cachedBasins: Basin[] = [...BASINS_DATA];
const cachedStationsByBasin = new Map<string, Station[]>();
const cachedRiverChainByBasin = new Map<string, Station[]>();
const cachedRiverChainEdgesByBasin = new Map<string, R2RiverChainEdge[]>();

// Format Thai date and time display (Asia/Bangkok timezone)
export function formatThaiTime(
  isoStr?: string,
  options?: { includeDate?: boolean; includeYear?: boolean }
): string {
  if (!isoStr) return 'ล่าสุด';
  if (isoStr === 'ล่าสุด' || isoStr === 'ไม่มีข้อมูลล่าสุด') return isoStr;

  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;

    const includeDate = options?.includeDate ?? true;
    if (includeDate) {
      const isCurrentYear = d.getFullYear() === new Date().getFullYear();
      const includeYear = options?.includeYear ?? !isCurrentYear;

      const formatted = new Intl.DateTimeFormat('th-TH', {
        timeZone: 'Asia/Bangkok',
        day: 'numeric',
        month: 'short',
        ...(includeYear ? { year: '2-digit' as const } : {}),
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);

      return `${formatted} น.`;
    }

    const timeOnly = new Intl.DateTimeFormat('th-TH', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
    return `${timeOnly} น.`;
  } catch {
    return 'ล่าสุด';
  }
}

/**
 * Normalizes R2 station snapshot into frontend Station interface
 */
export function mapR2StationToStation(
  item: R2StationSnapshotItem,
  basinSlug: string,
  detailThresholds?: any
): Station {
  const isWL = item.type === 'water_level';
  const c = item.current;

  // Determine if telemetry is missing from the R2 snapshot
  const hasTelemetryValues = isWL
    ? (c?.stage != null || c?.waterLevelMsl != null || c?.discharge != null)
    : (c?.rainfall1h != null || c?.rainfall3h != null || c?.rainfall6h != null || c?.rainfall24h != null || c?.rainfallToday != null);

  const isMissing =
    !c ||
    c.status === 'missing' ||
    c.freshness === 'missing' ||
    !hasTelemetryValues;

  const agencyName = item.agency?.th || 'กรมชลประทาน';
  const agencyEn = item.agency?.en || 'Royal Irrigation Department';

  const riverNameTh = item.river?.th || (isWL ? 'ลำน้ำสายหลัก' : undefined);
  const riverNameEn = item.river?.en || (isWL ? 'Main River' : undefined);

  let waterLevelData: Station['waterLevel'] = undefined;
  if (isWL && !isMissing && c) {
    const stage = c.stage ?? c.waterLevelMsl ?? 0;
    const wlMsl = c.waterLevelMsl ?? c.stage ?? 0;
    const discharge = c.discharge ?? 0;
    const trend = c.trend || 'steady';

    // Inferred bed level: from detailThresholds or inferred from wlMsl - stage
    let bedLevelMsl = detailThresholds?.groundLevelMsl ?? detailThresholds?.bedLevelMsl ?? 0;
    if (!bedLevelMsl && wlMsl > 0 && c.stage != null && c.stage > 0 && wlMsl > c.stage) {
      bedLevelMsl = Number((wlMsl - c.stage).toFixed(2));
    }

    const bankLevelMsl = detailThresholds?.bankLevelMsl ?? (wlMsl > 0 ? (bedLevelMsl > 0 ? bedLevelMsl + 5.0 : wlMsl + 1.8) : 10.0);

    let warningLevelMsl = detailThresholds?.warningLevelMsl;
    // Sanitize warning level: if missing or <= bedLevelMsl (e.g. legacy minBank * 0.85 bug)
    if (warningLevelMsl == null || (bedLevelMsl > 0 && warningLevelMsl <= bedLevelMsl)) {
      if (bedLevelMsl > 0 && bankLevelMsl > bedLevelMsl) {
        warningLevelMsl = Number((bedLevelMsl + (bankLevelMsl - bedLevelMsl) * 0.85).toFixed(2));
      } else {
        warningLevelMsl = wlMsl > 0 ? wlMsl + 0.8 : 8.5;
      }
    }
    const criticalLevelMsl = detailThresholds?.criticalLevelMsl ?? bankLevelMsl;

    let bankCapPercent = 50;
    if (c.storagePercent != null) {
      bankCapPercent = Math.round(c.storagePercent);
    } else if (bankLevelMsl > bedLevelMsl && wlMsl >= bedLevelMsl) {
      bankCapPercent = Math.min(Math.round(((wlMsl - bedLevelMsl) / (bankLevelMsl - bedLevelMsl)) * 100), 120);
    } else if (bankLevelMsl > 0 && wlMsl > 0) {
      bankCapPercent = Math.min(Math.round((wlMsl / bankLevelMsl) * 100), 120);
    } else if (c.status === 'critical') {
      bankCapPercent = 105;
    } else if (c.status === 'warning') {
      bankCapPercent = 88;
    } else if (c.status === 'watch') {
      bankCapPercent = 75;
    }

    const maxDischarge = Math.max(discharge * 1.4, 400);
    const dischargePercent = discharge > 0 ? Math.min(Math.round((discharge / maxDischarge) * 100), 100) : 0;

    waterLevelData = {
      waterLevelMsl: Number(wlMsl.toFixed(2)),
      waterLevelBed: Number(stage.toFixed(2)),
      discharge: Number(discharge.toFixed(2)),
      bankLevelMsl: Number(bankLevelMsl.toFixed(2)),
      warningLevelMsl: Number(warningLevelMsl.toFixed(2)),
      criticalLevelMsl: Number(criticalLevelMsl.toFixed(2)),
      bedLevelMsl: Number(bedLevelMsl.toFixed(2)),
      bankCapacityPercent: bankCapPercent,
      maxDischargeCapacity: maxDischarge,
      dischargePercent,
      trend,
      deltaPerHour: trend === 'rising' ? 0.12 : trend === 'falling' ? -0.08 : 0,
    };
  }

  let rainfallData: Station['rainfall'] = undefined;
  if (!isWL && !isMissing && c) {
    const r1 = c.rainfall1h ?? 0;
    const r3 = c.rainfall3h ?? 0;
    const r6 = c.rainfall6h ?? 0;
    const r24 = c.rainfall24h ?? c.rainfallToday ?? 0;

    let intensity: Station['rainfall'] extends { intensity: infer T } ? T : any = 'light';
    if (r24 >= 90 || r1 >= 35) intensity = 'very_heavy';
    else if (r24 >= 35 || r1 >= 10) intensity = 'heavy';
    else if (r24 >= 10) intensity = 'moderate';

    rainfallData = {
      rain1h: Number(r1.toFixed(1)),
      rain3h: Number(r3.toFixed(1)),
      rain6h: Number(r6.toFixed(1)),
      rain24h: Number(r24.toFixed(1)),
      intensity,
    };
  }

  return {
    id: item.id,
    uniqueKey: `${item.type}-${item.id}`,
    code: item.code || item.id,
    name: item.name || { th: `สถานี ${item.code}`, en: `Station ${item.code}` },
    basinId: basinSlug,
    stationType: item.type,
    lat: item.lat,
    long: item.lon,
    agency: {
      name: { th: agencyName, en: agencyEn },
      shortname: { th: agencyName.split(' ')[0] || agencyName, en: agencyEn.split(' ')[0] || agencyEn },
    },
    geocode: {
      tumbon: { th: '', en: '' },
      amphoe: { th: '', en: '' },
      province: { th: '', en: '' },
    },
    status: isMissing ? 'missing' : (c?.status || 'normal'),
    freshness: isMissing ? 'missing' : (c?.freshness || 'fresh'),
    hasRecentData: !isMissing,
    alertReason: c?.alertReason,
    isUpstreamAlert: c?.isUpstreamAlert,
    lastUpdated: (hasTelemetryValues && c?.lastUpdated) ? formatThaiTime(c.lastUpdated) : 'ไม่มีข้อมูลล่าสุด',
    waterLevel: waterLevelData,
    rainfall: rainfallData,
    riverName: riverNameTh ? { th: riverNameTh, en: riverNameEn || riverNameTh } : undefined,
  };
}

/**
 * 1. Fetch All Basins from R2 (/basins.json)
 * Merges live R2 counts and statuses with visual metadata presets.
 */
export async function fetchAllBasins(bypassCache = false): Promise<Basin[]> {
  try {
    const res = await r2Client.getBasinsList(bypassCache);
    if (res && res.basins && res.basins.length > 0) {
      const merged: Basin[] = res.basins.map((r2b) => {
        const preset = BASINS_DATA.find((p) => p.id === r2b.slug || p.id === r2b.id);

        return {
          id: r2b.slug || r2b.id,
          code: r2b.code || preset?.code || '00',
          name: r2b.name || preset?.name || { th: r2b.slug, en: r2b.slug },
          description: preset?.description || {
            th: `ลุ่มน้ำ${r2b.name.th} พื้นที่ประมาณ ${r2b.areaKm2 ? r2b.areaKm2.toLocaleString() : '-'} ตร.กม.`,
            en: `${r2b.name.en} covers approximately ${r2b.areaKm2 ? r2b.areaKm2.toLocaleString() : '-'} sq km.`,
          },
          mainRivers: preset?.mainRivers || [{ th: `แม่น้ำ${r2b.name.th.replace('ลุ่มน้ำ', '')}`, en: `${r2b.name.en}` }],
          provinces: preset?.provinces || [],
          areaKm2: r2b.areaKm2 || preset?.areaKm2 || 0,
          totalStations: r2b.totalStations,
          waterLevelStationsCount: preset?.waterLevelStationsCount || Math.round(r2b.totalStations * 0.3),
          rainfallStationsCount: preset?.rainfallStationsCount || Math.round(r2b.totalStations * 0.7),
          overallStatus: r2b.overallStatus || 'normal',
          statusSummary: preset?.statusSummary || {
            watchCount: 0,
            risingCount: 0,
            heavyRainCount: 0,
          },
          lastUpdated: formatThaiTime(r2b.lastUpdated),
          bgGradient: preset?.bgGradient || 'from-cyan-950 via-slate-900 to-blue-950',
          accentColor: preset?.accentColor || '#06B6D4',
          center: preset?.center || [17.0, 100.0],
          zoom: preset?.zoom || 8,
        };
      });

      cachedBasins = merged;
      return merged;
    }
  } catch (err) {
    console.warn('⚠️ [basinService] Failed to load basins from R2, using fallback:', err);
  }

  return cachedBasins;
}

/**
 * Synchronous getter (returns cached or preset basins)
 */
export function getAllBasins(): Basin[] {
  return cachedBasins;
}

/**
 * 2. Fetch Basin Overview from R2 (/basin/{slug}/overview.json & basin.json)
 */
export async function fetchBasinBySlug(slug: string): Promise<Basin | undefined> {
  const normalized = slug.toLowerCase().trim();
  try {
    const [overview, meta] = await Promise.all([
      r2Client.getBasinOverview(normalized),
      r2Client.getBasinMetadata(normalized),
    ]);

    const preset = BASINS_DATA.find((b) => b.id === normalized || b.id === normalized.replace('-basin', ''));

    if (overview || meta) {
      const summary = overview?.summary;
      const bName = meta?.name || overview?.basin ? { th: meta?.name.th || `ลุ่มน้ำ${overview?.basin}`, en: meta?.name.en || overview?.basin! } : (preset?.name || { th: normalized, en: normalized });

      const updatedBasin: Basin = {
        id: normalized,
        code: meta?.code || preset?.code || '00',
        name: bName,
        description: meta?.description || preset?.description || {
          th: `ข้อมูลสถานการณ์น้ำลุ่มน้ำ ${bName.th}`,
          en: `Water situation monitoring for ${bName.en}`,
        },
        mainRivers: preset?.mainRivers || [{ th: `แม่น้ำ${bName.th.replace('ลุ่มน้ำ', '')}`, en: bName.en }],
        provinces: preset?.provinces || [],
        areaKm2: meta?.areaKm2 || preset?.areaKm2 || 0,
        totalStations: summary?.totalStations || preset?.totalStations || 0,
        waterLevelStationsCount: summary?.waterLevelStations || preset?.waterLevelStationsCount || 0,
        rainfallStationsCount: summary?.rainfallStations || preset?.rainfallStationsCount || 0,
        overallStatus: summary?.overallStatus || preset?.overallStatus || 'normal',
        statusSummary: {
          watchCount: summary?.statusSummary?.watchCount || 0,
          risingCount: summary?.statusSummary?.risingCount || 0,
          heavyRainCount: summary?.statusSummary?.heavyRainCount || 0,
        },
        lastUpdated: formatThaiTime(overview?.generatedAt || meta?.updatedAt),
        bgGradient: preset?.bgGradient || 'from-cyan-950 via-slate-900 to-blue-950',
        accentColor: preset?.accentColor || '#06B6D4',
        center: preset?.center || [17.5, 100.0],
        zoom: preset?.zoom || 8,
      };

      // Update in cachedBasins
      const idx = cachedBasins.findIndex((b) => b.id === normalized);
      if (idx >= 0) cachedBasins[idx] = updatedBasin;
      else cachedBasins.push(updatedBasin);

      return updatedBasin;
    }
  } catch (err) {
    console.warn(`⚠️ [basinService] Failed to load overview for ${slug}:`, err);
  }

  return getBasinById(slug);
}

export function getBasinById(slug: string): Basin | undefined {
  const normalized = slug.toLowerCase().trim();
  return (
    cachedBasins.find((b) => b.id === normalized || b.id === normalized.replace('-basin', '')) ||
    BASINS_DATA.find((b) => b.id === normalized || b.id === normalized.replace('-basin', ''))
  );
}

export const getBasinBySlug = getBasinById;

/**
 * 3. Fetch All Stations for a Basin from R2
 * Loads both waterlevel_station/{slug}/stations.json and rainfall_station/{slug}/stations.json
 */
export async function fetchStationsForBasin(
  basinId: string,
  bypassCache = false
): Promise<Station[]> {
  const normalized = basinId.toLowerCase().trim();

  try {
    const [wlRes, rfRes] = await Promise.all([
      r2Client.getWaterLevelStations(normalized, bypassCache),
      r2Client.getRainfallStations(normalized, bypassCache),
    ]);

    const wlList = wlRes?.stations || [];
    const rfList = rfRes?.stations || [];

    if (wlList.length > 0 || rfList.length > 0) {
      const combined: Station[] = [
        ...wlList.map((st) => mapR2StationToStation(st, normalized)),
        ...rfList.map((st) => mapR2StationToStation(st, normalized)),
      ];

      cachedStationsByBasin.set(normalized, combined);
      return combined;
    }
  } catch (err) {
    console.warn(`⚠️ [basinService] Failed to fetch stations for ${basinId} from R2:`, err);
  }

  // Fallback to static data if R2 network fails or has no stations
  return getStationsForBasin(basinId);
}

/**
 * Synchronous stations getter (from memory cache or static fallback)
 */
export function getStationsForBasin(basinId: string): Station[] {
  const normalized = basinId.toLowerCase().trim();
  if (cachedStationsByBasin.has(normalized)) {
    return cachedStationsByBasin.get(normalized)!;
  }
  if (normalized === 'yom') {
    return YOM_STATIONS;
  }
  return OTHER_BASIN_STATIONS.filter((s) => s.basinId === normalized);
}

/**
 * 4. Fetch River Chain Stations from R2 (/basin/{slug}/river/chain.json)
 * Backend already filters to only include stations with non-missing telemetry.
 * Frontend shows all stations present in chain.json (ordered upstream→downstream).
 */
export async function fetchRiverChainStations(basinSlug: string): Promise<Station[]> {
  const normalized = basinSlug.toLowerCase().trim();

  try {
    const [chainData, stations] = await Promise.all([
      r2Client.getRiverChain(normalized),
      fetchStationsForBasin(normalized),
    ]);

    if (chainData && chainData.stations && chainData.stations.length > 0) {
      const stationMap = new Map(stations.map((s) => [s.id, s]));
      const ordered: Station[] = [];

      chainData.stations.forEach((id, index) => {
        const found = stationMap.get(id);
        if (found) {
          ordered.push({
            ...found,
            riverOrder: index + 1,
          });
        }
      });

      if (ordered.length > 0) {
        cachedRiverChainByBasin.set(normalized, ordered);
        // Cache edges for RiverChainView travel time hints
        if (chainData.edges && chainData.edges.length > 0) {
          cachedRiverChainEdgesByBasin.set(normalized, chainData.edges);
        }
        return ordered;
      }
    }
  } catch (err) {
    console.warn(`⚠️ [basinService] Failed to fetch river chain for ${basinSlug}:`, err);
  }

  return getRiverChainStations(basinSlug);
}

export function getRiverChainStations(basinId: string): Station[] {
  const normalized = basinId.toLowerCase().trim();
  if (cachedRiverChainByBasin.has(normalized)) {
    return cachedRiverChainByBasin.get(normalized)!;
  }
  const stations = getStationsForBasin(basinId);
  return stations
    .filter((s) => s.stationType === 'water_level' && s.riverOrder !== undefined)
    .sort((a, b) => (a.riverOrder || 0) - (b.riverOrder || 0));
}

/**
 * Get cached river chain edges (travel time between stations)
 */
export function getRiverChainEdges(basinId: string): R2RiverChainEdge[] {
  const normalized = basinId.toLowerCase().trim();
  return cachedRiverChainEdgesByBasin.get(normalized) || [];
}

/**
 * Top water level stations sorted by bank capacity percentage
 */
export function getTopWaterLevelStations(
  basinId: string,
  limit = 5,
  stationsList?: Station[]
): Station[] {
  const stations = stationsList || getStationsForBasin(basinId);
  return stations
    .filter((s) => s.stationType === 'water_level' && s.waterLevel)
    .sort((a, b) => {
      return (b.waterLevel?.bankCapacityPercent || 0) - (a.waterLevel?.bankCapacityPercent || 0);
    })
    .slice(0, limit);
}

/**
 * Top rainfall stations sorted by accumulation
 */
export function getTopRainfallStations(
  basinId: string,
  interval: '1h' | '3h' | '6h' | '24h' = '24h',
  limit = 5,
  stationsList?: Station[]
): Station[] {
  const stations = stationsList || getStationsForBasin(basinId);
  return stations
    .filter((s) => s.rainfall !== undefined)
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
