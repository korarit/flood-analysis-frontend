import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useBasin } from '../../hooks/useBasin';
import { useLanguage } from '../../hooks/useLanguage';
import { StationType } from '../../types/station';
import { SituationStatus } from '../../types/basin';
import { filterStations } from '../../services/stationService';
import { StationCard } from '../../components/station/StationCard';
import { StationFilterBar } from '../../components/station/StationFilterBar';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export function StationListPage() {
  const { basinSlug } = useParams({ strict: false }) as { basinSlug?: string };
  const currentSlug = basinSlug || 'yom';
  const { basin, isLoading } = useBasin(currentSlug);
  const { isThai } = useLanguage();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [stationType, setStationType] = useState<'all' | StationType>('all');
  const [situationStatus, setSituationStatus] = useState<'all' | SituationStatus>('all');
  const [sortBy, setSortBy] = useState<'name' | 'water_level' | 'rainfall' | 'status' | 'update_time'>('status');

  const filteredStations = filterStations(currentSlug, {
    searchQuery,
    stationType,
    situationStatus,
    sortBy,
  });

  if (isLoading || !basin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <CardSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. Search & Filter Bar (§15, §16, §17) */}
      <StationFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stationType={stationType}
        onStationTypeChange={setStationType}
        situationStatus={situationStatus}
        onSituationStatusChange={setSituationStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={filteredStations.length}
      />

      {/* 2. Stations Grid (§17, §18) */}
      {filteredStations.length === 0 ? (
        <EmptyState
          type="stations_not_found"
          onAction={() => {
            setSearchQuery('');
            setStationType('all');
            setSituationStatus('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              basinSlug={currentSlug}
            />
          ))}
        </div>
      )}

    </div>
  );
}
