import { Station, StationRelation, StationType, SeverityScoreBreakdown } from '../types/station';
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
      if (baseStation.waterLevel) {
        const dLoc = dSt.location;
        const dThresh = dSt.thresholds;
        const bedMsl = dThresh?.groundLevelMsl ?? dThresh?.bedLevelMsl ?? dLoc?.groundLevelMsl;
        if (bedMsl != null && bedMsl > 0) {
          baseStation.waterLevel.bedLevelMsl = bedMsl;
        }
        if (dThresh?.bankLevelMsl != null) {
          baseStation.waterLevel.bankLevelMsl = dThresh.bankLevelMsl;
        }
        if (dThresh?.criticalLevelMsl != null) {
          baseStation.waterLevel.criticalLevelMsl = dThresh.criticalLevelMsl;
        }

        // Sanitize warningLevelMsl: if below bedLevelMsl, recalculate to realistic 85% channel depth
        if (dThresh?.warningLevelMsl != null) {
          let warn = dThresh.warningLevelMsl;
          const bank = baseStation.waterLevel.bankLevelMsl;
          const bed = baseStation.waterLevel.bedLevelMsl;
          if (bed > 0 && warn <= bed && bank > bed) {
            warn = Number((bed + (bank - bed) * 0.85).toFixed(2));
          }
          baseStation.waterLevel.warningLevelMsl = warn;
        }

        // Ensure waterLevelBed matches bedLevelMsl if available
        const wlMsl = baseStation.waterLevel.waterLevelMsl;
        const bed = baseStation.waterLevel.bedLevelMsl;
        if (bed > 0 && wlMsl >= bed) {
          baseStation.waterLevel.waterLevelBed = Number((wlMsl - bed).toFixed(2));
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
 * Check if a station lacks recent telemetry data ("ไม่มีข้อมูลล่าสุด")
 * In ThaiWater / R2 snapshots:
 * - freshness === 'missing' means telemetry is older than 3.5h or offline.
 * - status === 'missing' means observation gap.
 * - Lack of actual telemetry readings.
 */
export function isStationMissingData(station: Station): boolean {
  if (station.freshness === 'missing' || station.status === 'missing') {
    return true;
  }
  if (station.hasRecentData === false) {
    return true;
  }
  if (station.stationType === 'water_level') {
    if (!station.waterLevel || station.waterLevel.waterLevelMsl == null || isNaN(station.waterLevel.waterLevelMsl)) {
      return true;
    }
    // If water level station has all zeros (no active gauge readings)
    if (
      station.waterLevel.waterLevelMsl === 0 &&
      station.waterLevel.waterLevelBed === 0 &&
      station.waterLevel.discharge === 0
    ) {
      return true;
    }
  } else if (station.stationType === 'rainfall') {
    if (!station.rainfall || station.rainfall.rain24h == null || isNaN(station.rainfall.rain24h)) {
      return true;
    }
  }
  return false;
}

/**
 * Hydrological Severity Scoring Algorithm
 * Combines emergency situation status tiers with fine-grained real-time metrics:
 * - Water Level: Bank capacity percent, river trend (rising/steady/falling), delta per hour, upstream alerts
 * - Rainfall: 24h accumulation, 1h flash flood downpour, 3h accumulation, intensity tier, upstream alerts
 *
 * Missing data stations receive -1 score and are placed at the bottom.
 */
export function calculateStationSeverityScore(station: Station): {
  score: number;
  normalizedScore: number;
  details: SeverityScoreBreakdown;
} {
  const isMissing = isStationMissingData(station);
  if (isMissing) {
    return {
      score: -1,
      normalizedScore: 0,
      details: {
        baseTierScore: 0,
        telemetryScore: 0,
        trendScore: 0,
        surgeAlertScore: 0,
        freshnessPenalty: 0,
        totalScore: 0,
        normalizedScore: 0,
      },
    };
  }

  // 1. Base Status Tier Score (Macro emergency anchor)
  let baseTierScore = 100; // normal
  if (station.status === 'critical') baseTierScore = 1000;
  else if (station.status === 'warning') baseTierScore = 700;
  else if (station.status === 'watch') baseTierScore = 400;

  // 2. Telemetry and Trend Points (0 - 300 pts)
  let telemetryScore = 0;
  let trendScore = 0;

  if (station.stationType === 'water_level' && station.waterLevel) {
    const wl = station.waterLevel;
    // Bank capacity utilization (up to 150 pts):
    // >= 100% capacity represents river overflowing its banks
    if (wl.bankCapacityPercent >= 100) {
      telemetryScore += 100 + Math.min((wl.bankCapacityPercent - 100) * 2, 50);
    } else {
      telemetryScore += Math.max(0, Math.min(wl.bankCapacityPercent, 100));
    }

    // Trend direction
    if (wl.trend === 'rising') trendScore += 40;
    else if (wl.trend === 'steady') trendScore += 10;

    // Rate of water rise (m/hr)
    if (wl.deltaPerHour > 0) {
      trendScore += Math.min(wl.deltaPerHour * 100, 40);
    }

    // Discharge capacity percentage (0 - 25 pts)
    if (wl.dischargePercent) {
      telemetryScore += Math.min(wl.dischargePercent * 0.25, 25);
    }
  } else if (station.stationType === 'rainfall' && station.rainfall) {
    const rf = station.rainfall;
    // 24h rainfall accumulation (up to 150 pts)
    // 35mm = heavy, 90mm = very heavy in Thailand
    if (rf.rain24h >= 90) {
      telemetryScore += 90 + Math.min((rf.rain24h - 90) * 0.6, 60);
    } else {
      telemetryScore += Math.max(0, rf.rain24h);
    }

    // 1h flash flood burst intensity (up to 50 pts)
    if (rf.rain1h > 0) {
      telemetryScore += Math.min(rf.rain1h * 2.0, 50);
    }

    // 3h accumulation (up to 30 pts)
    if (rf.rain3h > 0) {
      telemetryScore += Math.min(rf.rain3h * 0.5, 30);
    }

    // Rain intensity category
    if (rf.intensity === 'very_heavy') trendScore += 30;
    else if (rf.intensity === 'heavy') trendScore += 20;
    else if (rf.intensity === 'moderate') trendScore += 10;
  }

  // 3. Upstream Surge Alert (+40 pts)
  const surgeAlertScore = station.isUpstreamAlert ? 40 : 0;

  // 4. Freshness penalty (delayed by 1-3.5h: -10 pts)
  const freshnessPenalty = station.freshness === 'delayed' ? -10 : 0;

  const totalScore = Math.max(0, baseTierScore + telemetryScore + trendScore + surgeAlertScore + freshnessPenalty);

  // Normalized 0 - 100 index for display
  // Max expected totalScore ~ 1250 -> 100
  const normalizedScore = Math.min(100, Math.max(1, Number(((totalScore / 1250) * 100).toFixed(1))));

  return {
    score: totalScore,
    normalizedScore,
    details: {
      baseTierScore,
      telemetryScore,
      trendScore,
      surgeAlertScore,
      freshnessPenalty,
      totalScore,
      normalizedScore,
    },
  };
}

/**
 * Filter and sort stations:
 * - Computes and attaches continuous Severity Score and data freshness indicator
 * - In severity sorting: sorts active stations by score descending, and ALWAYS pushes stations without recent data to the end
 */
export function filterStations(
  basinId: string,
  params: StationFilterParams,
  stationsList?: Station[]
): Station[] {
  let stations = stationsList || getStationsForBasin(basinId);

  // Attach severityScore and hasRecentData to all stations
  stations = stations.map((s) => {
    const isMissing = isStationMissingData(s);
    const scoreInfo = calculateStationSeverityScore(s);
    return {
      ...s,
      hasRecentData: !isMissing,
      severityScore: scoreInfo.score,
      normalizedSeverityScore: scoreInfo.normalizedScore,
    };
  });

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
    const aMissing = !a.hasRecentData;
    const bMissing = !b.hasRecentData;

    // RULE: Stations without recent data ("ไม่มีข้อมูลล่าสุด") always go to the very end!
    if (aMissing && !bMissing) return 1;
    if (!aMissing && bMissing) return -1;
    if (aMissing && bMissing) {
      // Deterministic tie-break for stations with missing data
      return a.name.th.localeCompare(b.name.th, 'th');
    }

    // Both have recent data: sort by selected criteria
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

    // Default: Sort by severity score descending (Continuous severity algorithm)
    return (b.severityScore || 0) - (a.severityScore || 0);
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
