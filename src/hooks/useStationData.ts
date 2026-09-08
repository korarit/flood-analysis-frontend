import { useState, useMemo, useEffect } from 'react';
import { Station } from '../types/station';
import { HistoricalTelemetrySeries } from '../types/telemetry';
import {
  getStationById,
  fetchStationDetailAndRelations,
  getStationHistoricalTelemetry,
} from '../services/stationService';
import { toBangkokDateString } from '../utils/date';

export function useStationData(basinId: string, stationId: string) {
  const [station, setStation] = useState<Station | undefined>(() => getStationById(basinId, stationId));
  const [timeRange, setTimeRange] = useState<'1d' | '3d' | '7d' | 'custom'>('1d');
  const [chartMode, setChartMode] = useState<'bar' | 'line' | 'combined'>('combined');

  // Date inputs default to current date in Bangkok time
  const todayStr = useMemo(() => toBangkokDateString(new Date()), []);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return toBangkokDateString(d);
  });
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch live R2 station detail and relations
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const initialSt = getStationById(basinId, stationId);
    if (initialSt) setStation(initialSt);

    fetchStationDetailAndRelations(basinId, stationId)
      .then((enriched) => {
        if (isMounted && enriched) {
          setStation(enriched);
        }
      })
      .catch((err) => {
        console.warn(`[useStationData] Failed to fetch R2 detail for ${stationId}:`, err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [basinId, stationId]);

  // Update dates when 1d, 3d, 7d buttons are clicked
  const handleTimeRangeChange = (range: '1d' | '3d' | '7d') => {
    setTimeRange(range);
    const end = new Date();
    let daysBack = 1;
    if (range === '3d') daysBack = 3;
    if (range === '7d') daysBack = 7;

    const start = new Date(end.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const newStartStr = toBangkokDateString(start);
    const newEndStr = toBangkokDateString(end);

    setStartDate(newStartStr);
    setEndDate(newEndStr);
  };

  // When user manually edits startDate or endDate
  const handleCustomDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setTimeRange('custom');
  };

  // Historical Telemetry Series
  const telemetrySeries: HistoricalTelemetrySeries | null = useMemo(() => {
    if (!station) return null;
    return getStationHistoricalTelemetry(station, timeRange, startDate, endDate);
  }, [station, timeRange, startDate, endDate]);

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
