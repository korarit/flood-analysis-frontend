import React from 'react';
import { Link } from '@tanstack/react-router';
import { Station, StationRelation } from '../../types/station';
import { useLanguage } from '../../hooks/useLanguage';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { CloudRain, Waves, ArrowRight, Clock, Network, MapPin } from 'lucide-react';
import { formatTravelTime } from '../../utils/date';

interface StationRelationsProps {
  station: Station;
  basinSlug: string;
}

interface RelationCardsGridProps {
  relations: StationRelation[];
  basinSlug: string;
  emptyTitle: string;
  emptyDescription: string;
}

const RelationCardsGrid: React.FC<RelationCardsGridProps> = ({
  relations,
  basinSlug,
  emptyTitle,
  emptyDescription,
}) => {
  const { t, isThai } = useLanguage();

  if (relations.length === 0) {
    return (
      <EmptyState
        type="no_relations"
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {relations.map((rel) => {
        const isRelWater = rel.stationType === 'water_level';
        const travelTimeText = formatTravelTime(rel, isThai);

        return (
          <div
            key={`${rel.stationType}-${rel.stationId}-${rel.isUpstream ? 'up' : 'down'}`}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-slate-900/80 p-5 backdrop-blur-md transition-all hover:border-cyan-400 dark:hover:border-cyan-500/40 hover:bg-slate-100 dark:hover:bg-slate-850 shadow-xs dark:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isRelWater
                        ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30'
                    }`}
                  >
                    {isRelWater ? <Waves className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
                  </div>
                  <span className="font-mono text-xs font-bold text-cyan-800 dark:text-slate-300 bg-cyan-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {rel.stationId}
                  </span>
                </div>
                <StatusBadge status={rel.status} size="sm" showIcon={false} />
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
                {t(rel.name)}
              </h4>

              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <div className="flex justify-between items-center font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {isThai ? 'ระยะทาง:' : 'Distance:'}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{rel.distanceKm} กม.</span>
                </div>

                {travelTimeText && (
                  <div className="flex justify-between items-center font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {isThai ? 'เวลาน้ำหลากเดินทาง:' : 'Hydro Lag Time:'}
                    </span>
                    <span className="text-amber-700 dark:text-amber-300 font-bold text-right">
                      {travelTimeText}
                    </span>
                  </div>
                )}

                {rel.influenceWeightPercent && (
                  <div className="flex justify-between items-center font-mono">
                    <span>{isThai ? 'น้ำหนักอิทธิพล:' : 'Influence Weight:'}</span>
                    <span className="text-cyan-700 dark:text-cyan-300 font-bold">{rel.influenceWeightPercent}%</span>
                  </div>
                )}

                <div className="flex justify-between items-center font-mono pt-1">
                  <span>{isThai ? 'ค่าตรวจวัดล่าสุด:' : 'Observation:'}</span>
                  <span className="text-slate-900 dark:text-slate-100 font-extrabold">{rel.latestValue}</span>
                </div>
              </div>
            </div>

            <Link
              to="/basin/$basinSlug/station/$stationId"
              params={{ basinSlug, stationId: rel.stationId }}
              className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              <span>{isThai ? 'ดูข้อมูลสถานีนี้' : 'Inspect station'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export const StationRelations: React.FC<StationRelationsProps> = ({ station, basinSlug }) => {
  const { isThai } = useLanguage();
  const isWater = station.stationType === 'water_level';

  const influencingList = station.influencingStations || [];
  const downstreamList = station.downstreamStations || [];

  if (isWater) {
    if (influencingList.length === 0 && downstreamList.length === 0) {
      return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-2xl shadow-md dark:shadow-xl transition-colors">
          <EmptyState
            type="no_relations"
            title={isThai ? 'ยังไม่มีข้อมูลความสัมพันธ์ของสถานี' : 'No Linked Relations'}
            description={
              isThai
                ? 'สถานีนี้ยังไม่มีการผูกโยงเครือข่ายอิทธิพลกับสถานีอื่นในฐานข้อมูล'
                : 'This station has no configured upstream or downstream correlations.'
            }
          />
        </div>
      );
    }

    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Section 1: สถานีฝนต้นน้ำที่ส่งผลต่อระดับน้ำ ณ จุดนี้ (ขึ้นก่อน) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-2xl shadow-md dark:shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isThai ? 'เครือข่ายสถานีฝนต้นน้ำที่มีอิทธิพล' : 'Upstream Rain Influence Network'}</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
                {isThai ? 'สถานีฝนต้นน้ำที่ส่งผลต่อระดับน้ำ ณ จุดนี้' : 'Influencing Upstream Rainfall Telemetry'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs font-medium">
              {isThai
                ? 'คำนวณจากแบบจำลองอุทกวิทยาและการไหลของน้ำท่าตามแนวแม่น้ำ'
                : 'Hydrologically correlated catchment rainfall stations.'}
            </p>
          </div>

          <RelationCardsGrid
            relations={influencingList}
            basinSlug={basinSlug}
            emptyTitle={isThai ? 'ยังไม่มีข้อมูลสถานีฝนต้นน้ำ' : 'No Upstream Rain Stations'}
            emptyDescription={
              isThai
                ? 'สถานีนี้ยังไม่มีการผูกโยงเครือข่ายสถานีฝนต้นน้ำในฐานข้อมูล'
                : 'No upstream rainfall stations linked in database.'
            }
          />
        </div>

        {/* Section 2: สถานีวัดระดับน้ำท้ายน้ำที่รองรับน้ำต่อจากจุดนี้ */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-2xl shadow-md dark:shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                <Waves className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{isThai ? 'เครือข่ายสถานีระดับน้ำท้ายน้ำ' : 'Downstream River Network'}</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
                {isThai ? 'สถานีวัดระดับน้ำท้ายน้ำที่รองรับน้ำต่อจากจุดนี้' : 'Downstream Water Level Stations'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs font-medium">
              {isThai
                ? 'แสดงสถานีวัดระดับน้ำท้ายน้ำที่รองรับมวลน้ำตามลำน้ำสายหลัก'
                : 'Downstream river stations receiving runoff along the channel.'}
            </p>
          </div>

          <RelationCardsGrid
            relations={downstreamList}
            basinSlug={basinSlug}
            emptyTitle={isThai ? 'ยังไม่มีข้อมูลสถานีระดับน้ำท้ายน้ำ' : 'No Downstream River Stations'}
            emptyDescription={
              isThai
                ? 'สถานีนี้เป็นจุดปลายน้ำหรือยังไม่มีการผูกโยงสถานีระดับน้ำถัดไป'
                : 'No downstream water level stations configured.'
            }
          />
        </div>
      </div>
    );
  }

  // Rainfall station relations (Downstream receiving waterlevel stations)
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/90 p-6 sm:p-7 backdrop-blur-2xl shadow-md dark:shadow-xl space-y-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{isThai ? 'เครือข่ายสถานีระดับน้ำท้ายน้ำที่ได้รับผลกระทบ' : 'Downstream River Impact Network'}</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            {isThai ? 'สถานีวัดระดับน้ำท้ายน้ำที่รองรับปริมาณน้ำฝนนี้' : 'Downstream Gauges Receiving Runoff'}
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs font-medium">
          {isThai
            ? 'แสดงสถานีระดับน้ำที่อาจได้รับผลกระทบจากปริมาณฝนในพื้นที่นี้'
            : 'Monitored downstream water bodies.'}
        </p>
      </div>

      <RelationCardsGrid
        relations={downstreamList}
        basinSlug={basinSlug}
        emptyTitle={isThai ? 'ยังไม่มีข้อมูลความสัมพันธ์ของสถานี' : 'No Linked Relations'}
        emptyDescription={
          isThai
            ? 'สถานีนี้ยังไม่มีการผูกโยงเครือข่ายอิทธิพลกับสถานีอื่นในฐานข้อมูล'
            : 'This station has no configured upstream or downstream correlations.'
        }
      />
    </div>
  );
};
