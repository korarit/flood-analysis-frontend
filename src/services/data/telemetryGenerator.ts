import { HistoricalPoint, HistoricalTelemetrySeries, DataGapPeriod } from '../../types/telemetry';
import { Station } from '../../types/station';

export function generateHistoricalTelemetry(
  station: Station,
  timeRange: '1d' | '3d' | '7d' | 'custom' = '1d',
  customStartDate?: string,
  customEndDate?: string
): HistoricalTelemetrySeries {
  const points: HistoricalPoint[] = [];
  const dataGaps: DataGapPeriod[] = [];

  const now = new Date('2026-08-22T18:05:00');
  
  let hoursCount = 24;
  if (timeRange === '1d') hoursCount = 24;
  else if (timeRange === '3d') hoursCount = 72;
  else if (timeRange === '7d') hoursCount = 168;
  else if (timeRange === 'custom' && customStartDate && customEndDate) {
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const diffHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    hoursCount = Math.min(168, Math.max(6, isNaN(diffHours) ? 24 : diffHours));
  }

  // Calculate start date string
  const startDateObj = new Date(now.getTime() - hoursCount * 60 * 60 * 1000);
  const startDateStr = customStartDate || startDateObj.toISOString().split('T')[0];
  const endDateStr = customEndDate || now.toISOString().split('T')[0];

  const baseWaterLevel = station.waterLevel?.waterLevelMsl || 50.0;
  const baseDischarge = station.waterLevel?.discharge || 200;
  const baseRain = station.rainfall?.rain1h || 0;

  // Insert a realistic data gap today at 13:00 - 14:00 (as specified in req.md §26)
  // And for 3d/7d ranges, another minor gap 2 days ago
  const gap1HourFromEnd = 5; // 5 hours ago (13:00 - 14:00 when now is 18:05)
  const gap2HourFromEnd = 50; // 50 hours ago for longer charts

  let cumulativeRain = 0;

  for (let i = hoursCount; i >= 0; i--) {
    const pointTime = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = pointTime.getHours();
    const dateStr = pointTime.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const displayTime = hoursCount <= 24 ? timeStr : `${dateStr} ${timeStr}`;
    const isoString = pointTime.toISOString();

    // Check if within data gap period
    const isGap1 = (i >= gap1HourFromEnd - 1 && i <= gap1HourFromEnd);
    const isGap2 = (hoursCount > 48 && i >= gap2HourFromEnd - 2 && i <= gap2HourFromEnd);
    const isDataGap = isGap1 || isGap2;

    if (isDataGap) {
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
    const upwardTrend = (hoursCount - i) / hoursCount * 0.65; // rising trend
    const noise = Math.sin(i * 1.7) * 0.08;

    const currentLevel = +(baseWaterLevel - 0.5 + upwardTrend + diurnal + noise).toFixed(2);
    const currentBedLevel = +( (station.waterLevel?.waterLevelBed || 5.0) - 0.5 + upwardTrend + diurnal + noise).toFixed(2);
    const currentDischarge = Math.round(baseDischarge * (0.8 + upwardTrend * 0.5 + diurnal * 0.2));

    // Rainfall simulation with localized bursts
    let pointRain = 0;
    if (hour >= 14 && hour <= 17) {
      pointRain = +(Math.abs(Math.sin((hour - 14) * 1.5)) * (baseRain > 0 ? baseRain : 28.5) + noise * 5).toFixed(1);
    } else if (hour >= 2 && hour <= 5) {
      pointRain = +(Math.abs(Math.cos(hour)) * 8.0).toFixed(1);
    } else {
      pointRain = +(Math.max(0, noise * 2)).toFixed(1);
    }
    cumulativeRain += pointRain;

    points.push({
      timestamp: isoString,
      displayTime,
      waterLevelMsl: station.stationType === 'water_level' ? currentLevel : null,
      waterLevelBed: station.stationType === 'water_level' ? currentBedLevel : null,
      discharge: station.stationType === 'water_level' ? currentDischarge : null,
      rainfall: station.stationType === 'rainfall' || pointRain > 0 ? pointRain : null,
      rainfallCumulative: +(cumulativeRain).toFixed(1),
      isDataGap: false,
    });
  }

  // Record data gap descriptions
  dataGaps.push({
    startTime: '13:00 น.',
    endTime: '14:00 น.',
    durationHours: 1,
    description: 'ขาดการเชื่อมต่อสัญญาณโทรมาตร (Telemetry Sensor Signal Lost)',
  });

  if (hoursCount > 48) {
    dataGaps.push({
      startTime: '20 ส.ค. 02:00 น.',
      endTime: '20 ส.ค. 04:00 น.',
      durationHours: 2,
      description: 'ระบบไฟฟ้าโซลาร์เซลล์ขัดข้องชั่วคราว',
    });
  }

  const validWaterLevels = points.map(p => p.waterLevelMsl).filter((v): v is number => v !== null);
  const validDischarges = points.map(p => p.discharge).filter((v): v is number => v !== null);
  const validRains = points.map(p => p.rainfall).filter((v): v is number => v !== null);

  const minWaterLevel = validWaterLevels.length > 0 ? Math.min(...validWaterLevels) : undefined;
  const maxWaterLevel = validWaterLevels.length > 0 ? Math.max(...validWaterLevels) : undefined;
  const avgWaterLevel = validWaterLevels.length > 0 ? +(validWaterLevels.reduce((a, b) => a + b, 0) / validWaterLevels.length).toFixed(2) : undefined;
  const maxDischarge = validDischarges.length > 0 ? Math.max(...validDischarges) : undefined;
  const totalRainfall = validRains.length > 0 ? +(validRains.reduce((a, b) => a + b, 0)).toFixed(1) : undefined;
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
