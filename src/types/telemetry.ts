export interface HistoricalPoint {
  timestamp: string;             // ISO or "YYYY-MM-DD HH:mm"
  displayTime: string;           // "18:00" or "22 ส.ค. 18:00"
  waterLevelMsl: number | null;  // null indicates data gap
  waterLevelBed: number | null;
  discharge: number | null;      // m³/s
  rainfall: number | null;       // mm
  rainfallCumulative: number | null;
  isDataGap?: boolean;
}

export interface DataGapPeriod {
  startTime: string;
  endTime: string;
  durationHours: number;
  description: string;
}

export interface HistoricalTelemetrySeries {
  stationId: string;
  startDate: string;
  endDate: string;
  timeRange: '1d' | '3d' | '7d' | 'custom';
  points: HistoricalPoint[];
  dataGaps: DataGapPeriod[];
  summary: {
    minWaterLevel?: number;
    maxWaterLevel?: number;
    avgWaterLevel?: number;
    maxDischarge?: number;
    totalRainfall?: number;
    maxRain1h?: number;
  };
}
