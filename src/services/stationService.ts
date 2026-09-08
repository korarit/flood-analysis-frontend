import { Station, StationRelation, StationType } from '../types/station';
import { SituationStatus } from '../types/basin';
import { HistoricalTelemetrySeries } from '../types/telemetry';
import { fetchStationsForBasin, getStationsForBasin, mapR2StationToStation } from './basinService';
import { generateHistoricalTelemetry } from './data/telemetryGenerator';
import { r2Client } from './r2Client';

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

/**
 * Synchronous station getter from memory cache/fallback
 */
export function getStationById(basinId: string, stationId: string, stationsList?: Station[]): Station | undefined {
  const stations = stationsList || getStationsForBasin(basinId);
  const cleanId = stationId.toLowerCase().trim();
  return stations.find((s) => s.id.toLowerCase() === cleanId || s.code.toLowerCase() === cleanId);
}

/**
 * Helper to parse Thai address strings into geocode structure
 */
function parseAddressGeocode(addressTh = '', addressEn = '') {
  const parts = addressTh.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 3) {
    return {
      tumbon: { th: parts[0], en: '' },
      amphoe: { th: parts[1], en: '' },
      province: { th: parts[2], en: '' },
    };
  }
  if (parts.length === 2) {
    return {
      tumbon: { th: '', en: '' },
      amphoe: { th: parts[0], en: '' },
      province: { th: parts[1], en: '' },
    };
  }
  return {
    tumbon: { th: '', en: '' },
    amphoe: { th: '', en: '' },
    province: { th: parts[0] || '', en: '' },
  };
}

/**
 * Asynchronously fetch and enrich a station with R2 detail.json and relations.json
 */
export async function fetchStationDetailAndRelations(
  basinSlug: string,
  stationId: string
): Promise<Station | undefined> {
  const normalized = basinSlug.toLowerCase().trim();
  const cleanId = stationId.trim();

  // 1. Ensure basin stations list is loaded
  let allStations = await fetchStationsForBasin(normalized);
  let baseStation = allStations.find((s) => s.id === cleanId || s.code.toLowerCase() === cleanId.toLowerCase());

  // 2. Identify station type
  const isWL = baseStation ? baseStation.stationType === 'water_level' : true;
  const primaryType: StationType = isWL ? 'water_level' : 'rainfall';

  try {
    // 3. Fetch detail.json and relations.json from R2
    let detail = await r2Client.getStationDetail(normalized, cleanId, primaryType);
    let relations = await r2Client.getStationRelations(normalized, cleanId, primaryType);

    // If not found in primary type, try alternate type
    if (!detail && !baseStation) {
      const altType: StationType = isWL ? 'rainfall' : 'water_level';
      detail = await r2Client.getStationDetail(normalized, cleanId, altType);
      relations = await r2Client.getStationRelations(normalized, cleanId, altType);
    }

    if (detail && detail.station) {
      const dSt = detail.station;
      const parsedGeocode = parseAddressGeocode(dSt.address?.th, dSt.address?.en);

      // Create base if not found in list
      if (!baseStation) {
        baseStation = {
          id: dSt.id,
          code: dSt.code || dSt.id,
          name: dSt.name || { th: `สถานี ${dSt.code}`, en: `Station ${dSt.code}` },
          basinId: normalized,
          stationType: dSt.type,
          lat: dSt.location?.lat || 0,
          long: dSt.location?.lon || 0,
          agency: {
            name: dSt.agency || { th: '', en: '' },
            shortname: { th: (dSt.agency?.th || '').split(' ')[0] || '', en: (dSt.agency?.en || '').split(' ')[0] || '' },
          },
          geocode: parsedGeocode,
          status: 'normal',
          freshness: 'fresh',
          lastUpdated: 'ล่าสุด',
        };
      } else {
        // Enrich geocode from detail address
        if (dSt.address?.th) {
          baseStation.geocode = parsedGeocode;
        }
      }

      // Enrich water level thresholds
      if (baseStation.waterLevel && dSt.thresholds) {
        if (dSt.thresholds.bankLevelMsl != null) {
          baseStation.waterLevel.bankLevelMsl = dSt.thresholds.bankLevelMsl;
        }
        if (dSt.thresholds.warningLevelMsl != null) {
          baseStation.waterLevel.warningLevelMsl = dSt.thresholds.warningLevelMsl;
        }
        if (dSt.thresholds.criticalLevelMsl != null) {
          baseStation.waterLevel.criticalLevelMsl = dSt.thresholds.criticalLevelMsl;
        }
      }
    }

    // Enrich relations
    if (baseStation && relations) {
      const mappedInfluencing: StationRelation[] = (relations.influencingRainfallStations || []).map((inf: any) => ({
        stationId: inf.stationId,
        name: inf.stationName ? { th: inf.stationName, en: inf.stationName } : { th: inf.stationId, en: inf.stationId },
        stationType: 'rainfall',
        distanceKm: inf.distanceKm || 0,
        travelTimeHours: inf.travelTimeHours ?? undefined,
        latestValue: inf.latestRain24h != null ? `${inf.latestRain24h} มม.` : '-',
        status: inf.status || 'normal',
        isUpstream: true,
      }));

      const mappedDownstream: StationRelation[] = (relations.streamFall || relations.downstreamStations || []).map((ds: any) => ({
        stationId: ds.stationId,
        name: ds.stationName ? { th: ds.stationName, en: ds.stationName } : { th: ds.stationId, en: ds.stationId },
        stationType: 'water_level',
        distanceKm: ds.distanceKm || 0,
        travelTimeHours: ds.travelTimeHours ?? undefined,
        latestValue: ds.latestStage != null ? `${ds.latestStage} ม.รทก.` : '-',
        status: ds.status || 'normal',
        isUpstream: false,
      }));

      // Combined or custom relations
      if (relations.relations && relations.relations.length > 0) {
        const generalRelations: StationRelation[] = relations.relations.map((r) => ({
          stationId: r.targetStationId || r.stationId,
          name: r.targetStationName || r.name,
          stationType: r.stationType,
          distanceKm: r.distanceKm || 0,
          travelTimeHours: r.travelTimeHours ?? undefined,
          latestValue: r.latestValue || '-',
          status: r.status || 'normal',
          isUpstream: r.isUpstream,
        }));

        const up = generalRelations.filter((r) => r.isUpstream);
        const down = generalRelations.filter((r) => !r.isUpstream);

        baseStation.influencingStations = mappedInfluencing.length > 0 ? mappedInfluencing : up;
        baseStation.downstreamStations = mappedDownstream.length > 0 ? mappedDownstream : down;
      } else {
        baseStation.influencingStations = mappedInfluencing;
        baseStation.downstreamStations = mappedDownstream;
      }
    }

    return baseStation;
  } catch (err) {
    console.warn(`⚠️ [stationService] Error enriching station ${stationId}:`, err);
    return baseStation;
  }
}

/**
 * Filter stations (supports passing live stationsList or falls back to basinId lookup)
 */
export function filterStations(
  basinId: string,
  params: StationFilterParams,
  stationsList?: Station[]
): Station[] {
  let stations = stationsList || getStationsForBasin(basinId);

  // 1. Search Query Filter (name TH/EN, code, tumbon, amphoe, province, agency)
  if (params.searchQuery && params.searchQuery.trim() !== '') {
    const q = params.searchQuery.toLowerCase().trim();
    stations = stations.filter((s) => {
      const matchNameTh = s.name.th.toLowerCase().includes(q);
      const matchNameEn = s.name.en.toLowerCase().includes(q);
      const matchCode = s.code.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      const matchTumbon = s.geocode.tumbon.th.toLowerCase().includes(q) || s.geocode.tumbon.en.toLowerCase().includes(q);
      const matchAmphoe = s.geocode.amphoe.th.toLowerCase().includes(q) || s.geocode.amphoe.en.toLowerCase().includes(q);
      const matchProvince = s.geocode.province.th.toLowerCase().includes(q) || s.geocode.province.en.toLowerCase().includes(q);
      const matchAgency =
        s.agency.name.th.toLowerCase().includes(q) ||
        s.agency.shortname.th.toLowerCase().includes(q) ||
        s.agency.shortname.en.toLowerCase().includes(q);

      return matchNameTh || matchNameEn || matchCode || matchTumbon || matchAmphoe || matchProvince || matchAgency;
    });
  }

  // 2. Station Type Filter ('all' | 'water_level' | 'rainfall')
  if (params.stationType && params.stationType !== 'all') {
    stations = stations.filter((s) => s.stationType === params.stationType);
  }

  // 3. Situation Status Filter
  if (params.situationStatus && params.situationStatus !== 'all') {
    stations = stations.filter((s) => s.status === params.situationStatus);
  }

  // 4. Province Code Filter
  if (params.provinceCode && params.provinceCode !== 'all') {
    stations = stations.filter((s) => s.geocode.provinceCode === params.provinceCode);
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
  maxDistanceKm = 100,
  stationsList?: Station[]
): NearbyStationResult[] {
  let stations = stationsList || getStationsForBasin(basinId);

  if (stationType !== 'all') {
    stations = stations.filter((s) => s.stationType === stationType);
  }

  const results: NearbyStationResult[] = stations.map((station) => {
    const dist = calculateDistanceKm(userLat, userLong, station.lat, station.long);
    return { station, distanceKm: dist };
  });

  return results.filter((r) => r.distanceKm <= maxDistanceKm).sort((a, b) => a.distanceKm - b.distanceKm);
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
  options?: { basinId?: string; type?: 'all' | 'water_level' | 'rainfall'; stationsList?: Station[] }
): Station[] {
  const basinId = options?.basinId || 'yom';
  const type = options?.type || 'all';
  return filterStations(
    basinId,
    {
      searchQuery: query,
      stationType: type,
    },
    options?.stationsList
  );
}
