import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../../hooks/useLanguage';
import { searchStations } from '../../services/stationService';
import { Station } from '../../types/station';
import { StatusBadge } from '../common/StatusBadge';
import {
  Search,
  X,
  Waves,
  CloudRain,
  MapPin,
  Building2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBasinSlug?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  currentBasinSlug,
}) => {
  const { t, isThai } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'water_level' | 'rainfall'>('all');
  const [basinId, setBasinId] = useState<string>(currentBasinSlug || 'yom');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search results
  const results = searchStations(query, {
    basinId,
    type: filterType,
  });

  if (!isOpen) return null;

  const handleSelectStation = (station: Station) => {
    onClose();
    navigate({
      to: '/basin/$basinSlug/station/$stationId',
      params: { basinSlug: basinId, stationId: station.id },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-3xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/95 shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col max-h-[80vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isThai
                ? 'ค้นหาสถานี... (พิมพ์ชื่อสถานี, รหัส Y.14, ตำบล, อำเภอ, จังหวัด, หน่วยงาน)'
                : 'Search stations... (e.g. Si Satchanalai, Y.14, Phrae, RID)'
            }
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-base sm:text-lg focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="ล้างข้อความค้นหา"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            aria-label="ปิดหน้าต่าง"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800/80 flex gap-2 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {isThai ? 'ทั้งหมด' : 'All'}
          </button>
          <button
            onClick={() => setFilterType('water_level')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition-all ${
              filterType === 'water_level'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{isThai ? 'วัดระดับน้ำ' : 'Water Level'}</span>
          </button>
          <button
            onClick={() => setFilterType('rainfall')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition-all ${
              filterType === 'rainfall'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>{isThai ? 'วัดน้ำฝน' : 'Rainfall'}</span>
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto max-h-96 divide-y divide-slate-100 dark:divide-slate-800/80">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              {isThai
                ? 'ไม่พบสถานีที่ตรงกับคำค้นหา ลองค้นหาด้วยชื่ออำเภอ จังหวัด หรือรหัสสถานี'
                : 'No stations matched your query.'}
            </div>
          ) : (
            results.map((st: Station) => {
              const isWater = st.stationType === 'water_level';
              const wl = st.waterLevel;
              const rf = st.rainfall;

              return (
                <div
                  key={st.id}
                  onClick={() => handleSelectStation(st)}
                  className="p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isWater
                          ? 'bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400'
                          : 'bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {isWater ? <Waves className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400">
                          {st.code}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                          {t(st.name)}
                        </span>
                        <StatusBadge status={st.status} size="sm" showIcon={false} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {t(st.geocode.tumbon)}, {t(st.geocode.amphoe)}, จ.{t(st.geocode.province)}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {t(st.agency.shortname)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {isWater && wl && (
                        <>
                          <div className="font-mono text-sm font-bold text-cyan-700 dark:text-cyan-300">
                            {wl.waterLevelMsl} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">ม.รทก.</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {wl.bankCapacityPercent}% {isThai ? 'ตลิ่ง' : 'cap'}
                          </div>
                        </>
                      )}
                      {!isWater && rf && (
                        <>
                          <div className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
                            {rf.rain24h} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">มม.</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            24h {isThai ? 'สะสม' : 'rain'}
                          </div>
                        </>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
