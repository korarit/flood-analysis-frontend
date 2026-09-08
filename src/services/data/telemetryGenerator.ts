import { HistoricalPoint, HistoricalTelemetrySeries, DataGapPeriod } from '../../types/telemetry';
import { Station } from '../../types/station';
import { toBangkokDateString, toBangkokTimeString, toBangkokShortDateString } from '../../utils/date';

export function generateHistoricalTelemetry(
  station: Station,
  timeRange: '1d' | '3d' | '7d' | 'custom' = '1d',
  customStartDate?: string,
  customEndDate?: string
): HistoricalTelemetrySeries {
  const points: HistoricalPoint[] = [];
  const dataGaps: DataGapPeriod[] = [];

  // Determine reference end time (anchor time)
  let now = new Date();
  const todayBangkok = toBangkokDateString(now);

  if (customEndDate) {
    if (customEndDate === todayBangkok) {
      now = new Date();
    } else {
      const parsedEnd = new Date(`${customEndDate}T23:59:59+07:00`);
      if (!isNaN(parsedEnd.getTime())) {
        now = parsedEnd;
      }
    }
  }

  let hoursCount = 24;
  if (timeRange === '1d') hoursCount = 24;
  else if (timeRange === '3d') hoursCount = 72;
  else if (timeRange === '7d') hoursCount = 168;
  else if (timeRange === 'custom' && customStartDate && customEndDate) {
    const start = new Date(`${customStartDate}T00:00:00+07:00`).getTime();
    const end = new Date(`${customEndDate}T23:59:59+07:00`).getTime();
    const diffHours = Math.round((end - start) / (1000 * 60 * 60));
    hoursCount = Math.min(720, Math.max(24, isNaN(diffHours) ? 24 : diffHours));
  }

  // Calculate start & end date strings formatted in Asia/Bangkok
  const startDateObj = new Date(now.getTime() - hoursCount * 60 * 60 * 1000);
  const startDateStr = customStartDate || toBangkokDateString(startDateObj);
  const endDateStr = customEndDate || toBangkokDateString(now);

  const baseWaterLevel = station.waterLevel?.waterLevelMsl || 50.0;
  const baseDischarge = station.waterLevel?.discharge || 200;
  const baseRain24 = station.rainfall?.rain24h ?? 0;
  const baseRain1h = station.rainfall?.rain1h ?? 0;
  const baseRain3h = station.rainfall?.rain3h ?? 0;

  // Insert data gap only if station freshness indicates an issue
  const hasDataGap = station.freshness === 'delayed' || station.freshness === 'missing';
  const gap1HourFromEnd = 3;
  let cumulativeRain = 0;

  for (let i = hoursCount; i >= 0; i--) {
    const pointTime = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = pointTime.getHours();
    const timeStr = toBangkokTimeString(pointTime);
    const shortDateStr = toBangkokShortDateString(pointTime);
    const displayTime = hoursCount <= 24 ? timeStr : `${shortDateStr} ${timeStr}`;
    const isoString = pointTime.toISOString();

    // Check if within data gap period
    const isGap = hasDataGap && (i >= gap1HourFromEnd - 1 && i <= gap1HourFromEnd);

    if (isGap) {
      points.push({
        timestamp: isoString,
        displayTime,
        waterLevelMsl: null,
        waterLevelBed: null,
        discharge: null,
        rainfall: null,
        rainfallCumulative: null,
        isDataGap: true,
      });
      continue;
    }

    // Dynamic sinusoidal wave simulating river hydrograph / diurnal rain
    const diurnal = Math.sin((hour - 6) / 24 * Math.PI * 2) * 0.45;
    const upwardTrend = ((hoursCount - i) / hoursCount) * 0.65;
    const noise = Math.sin(i * 1.7) * 0.08;

    const currentLevel = +(baseWaterLevel - 0.5 + upwardTrend + diurnal + noise).toFixed(2);
    const currentBedLevel = +( (station.waterLevel?.waterLevelBed || 5.0) - 0.5 + upwardTrend + diurnal + noise).toFixed(2);
    const currentDischarge = Math.round(baseDischarge * (0.8 + upwardTrend * 0.5 + diurnal * 0.2));

    // Rainfall simulation with real metric anchoring
    let pointRain = 0;
    if (station.stationType === 'rainfall') {
      if (baseRain24 > 0) {
        if (i === 0) {
          pointRain = baseRain1h;
        } else if (i <= 2) {
          pointRain = +(Math.max(0, (baseRain3h - baseRain1h) / 2)).toFixed(1);
        } else {
          // Distribute remaining 24h rain with a realistic bell curve peaked in recent hours
          const remainingRain = Math.max(0, baseRain24 - (baseRain3h || baseRain1h));
          const peakOffset = Math.min(10, Math.floor(hoursCount / 3));
          const weight = Math.exp(-Math.pow(i - peakOffset, 2) / (hoursCount * 0.8));
          pointRain = +(remainingRain * weight * (1 / (Math.sqrt(2 * Math.PI) * 2.5))).toFixed(1);
        }
      } else {
        pointRain = 0;
      }
    } else {
      // For water level station showing rain
      pointRain = hour >= 14 && hour <= 17 ? +(Math.abs(Math.sin((hour - 14) * 1.5)) * 12.0).toFixed(1) : 0;
    }
    cumulativeRain += pointRain;

    points.push({
      timestamp: isoString,
      displayTime,
      waterLevelMsl: station.stationType === 'water_level' ? currentLevel : null,
      waterLevelBed: station.stationType === 'water_level' ? currentBedLevel : null,
      discharge: station.stationType === 'water_level' ? currentDischarge : null,
      rainfall: station.stationType === 'rainfall' || pointRain > 0 ? pointRain : 0,
      rainfallCumulative: +(cumulativeRain).toFixed(1),
      isDataGap: false,
    });
  }

  if (hasDataGap) {
    const gapStart = new Date(now.getTime() - gap1HourFromEnd * 60 * 60 * 1000);
    const gapStartTime = toBangkokTimeString(gapStart);
    const gapEndTime = toBangkokTimeString(new Date(gapStart.getTime() + 60 * 60 * 1000));
    dataGaps.push({
      startTime: `${gapStartTime} น.`,
      endTime: `${gapEndTime} น.`,
      durationHours: 1,
      description: 'ขาดการเชื่อมต่อสัญญาณโทรมาตร (Telemetry Sensor Signal Lost)',
    });
  }

  const validWaterLevels = points.map(p => p.waterLevelMsl).filter((v): v is number => v !== null);
  const validDischarges = points.map(p => p.discharge).filter((v): v is number => v !== null);
  const validRains = points.map(p => p.rainfall).filter((v): v is number => v !== null);

  const minWaterLevel = validWaterLevels.length > 0 ? Math.min(...validWaterLevels) : undefined;
  const maxWaterLevel = validWaterLevels.length > 0 ? Math.max(...validWaterLevels) : undefined;
  const avgWaterLevel = validWaterLevels.length > 0 ? +(validWaterLevels.reduce((a, b) => a + b, 0) / validWaterLevels.length).toFixed(2) : undefined;
  const maxDischarge = validDischarges.length > 0 ? Math.max(...validDischarges) : undefined;
  const totalRainfall = +(cumulativeRain).toFixed(1);
  const maxRain1h = validRains.length > 0 ? Math.max(...validRains) : undefined;

  return {
    stationId: station.id,
    startDate: startDateStr,
    endDate: endDateStr,
    timeRange,
    points,
    dataGaps,
    summary: {
      minWaterLevel,
      maxWaterLevel,
      avgWaterLevel,
      maxDischarge,
      totalRainfall,
      maxRain1h,
    },
  };
}
