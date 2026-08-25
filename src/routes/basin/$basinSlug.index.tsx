import React from 'react';
import { useParams } from '@tanstack/react-router';
import { useBasin } from '../../hooks/useBasin';
import { useNearbyStation } from '../../hooks/useNearbyStation';
import { useLanguage } from '../../hooks/useLanguage';
import { getAlertsForBasin } from '../../services/alertService';
import { SituationSummaryCard } from '../../components/basin/SituationSummaryCard';
import { NearbyStationCard } from '../../components/basin/NearbyStationCard';
import { RiverChainView } from '../../components/basin/RiverChainView';
import { TopWaterLevelList } from '../../components/basin/TopWaterLevelList';
import { TopRainfallList } from '../../components/basin/TopRainfallList';
import { RecentEventsFeed } from '../../components/basin/RecentEventsFeed';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export function BasinOverviewPage() {
  const { basinSlug } = useParams({ strict: false }) as { basinSlug?: string };
  const currentSlug = basinSlug || 'yom';
  const { basin, riverChain, topWaterLevelStations, getTopRain, isLoading } = useBasin(currentSlug);
  const { nearbyStation } = useNearbyStation(currentSlug);
  const { t, isThai } = useLanguage();

  const alerts = getAlertsForBasin(currentSlug);

  if (isLoading || !basin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. Situation Summary Card (§7) */}
      <SituationSummaryCard basin={basin} />

      {/* 2. 📍 Nearby Station Card (§8-11) */}
      <NearbyStationCard
        station={nearbyStation}
        basinSlug={currentSlug}
        distanceKm={nearbyStation ? 3.2 : undefined}
      />

      {/* 3. River Flow Chain Schematic (§33) */}
      {riverChain.length > 0 && (
        <RiverChainView stations={riverChain} basinSlug={currentSlug} />
      )}

      {/* 4. Top Telemetry Rankings Grid: Water Level & Rainfall Overview (§34, §35) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <TopWaterLevelList stations={topWaterLevelStations} basinSlug={currentSlug} />
        <TopRainfallList getTopRain={getTopRain} basinSlug={currentSlug} />
      </div>

      {/* 5. Live Events & Alerts Feed (§37, §38) */}
      {alerts.length > 0 && (
        <RecentEventsFeed events={alerts} basinSlug={currentSlug} />
      )}

    </div>
  );
}
