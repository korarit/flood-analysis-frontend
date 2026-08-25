import { useState, useMemo, useEffect } from 'react';
import { Station } from '../types/station';
import { HistoricalTelemetrySeries } from '../types/telemetry';
import { getStationById, getStationHistoricalTelemetry } from '../services/stationService';

export function useStationData(basinId: string, stationId: string) {
  const station: Station | undefined = useMemo(() => {
    return getStationById(basinId, stationId);
  }, [basinId, stationId]);

  const [timeRange, setTimeRange] = useState<'1d' | '3d' | '7d' | 'custom'>('1d');
  const [chartMode, setChartMode] = useState<'bar' | 'line' | 'combined'>('combined');
  
  // Date inputs
  const todayStr = '2026-08-22';
  const [startDate, setStartDate] = useState<string>('2026-08-21');
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Update dates when 1d, 3d, 7d buttons are clicked
  const handleTimeRangeChange = (range: '1d' | '3d' | '7d') => {
    setTimeRange(range);
    const end = new Date('2026-08-22T18:05:00');
    let daysBack = 1;
    if (range === '3d') daysBack = 3;
    if (range === '7d') daysBack = 7;

    const start = new Date(end.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const newStartStr = start.toISOString().split('T')[0];
    const newEndStr = end.toISOString().split('T')[0];

    setStartDate(newStartStr);
    setEndDate(newEndStr);
  };

  // When user manually edits startDate or endDate
  const handleCustomDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setTimeRange('custom');
  };

  // Historical Telemetry Series (Auto-loads when station, timeRange, or dates change)
  const telemetrySeries: HistoricalTelemetrySeries | null = useMemo(() => {
    if (!station) return null;
    return getStationHistoricalTelemetry(station, timeRange, startDate, endDate);
  }, [station, timeRange, startDate, endDate]);

  // Simulate loading state transitions on timeframe change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [timeRange, startDate, endDate]);

  return {
    station,
    telemetrySeries,
    timeRange,
    chartMode,
    setChartMode,
    startDate,
    endDate,
    isLoading,
    handleTimeRangeChange,
    handleCustomDateChange,
  };
}
