import React from 'react';
import { StationType } from '../../types/station';
import { SituationStatus } from '../../types/basin';
import { useLanguage } from '../../hooks/useLanguage';
import { Search, Waves, CloudRain, Filter, ArrowUpDown } from 'lucide-react';

interface StationFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  stationType: 'all' | StationType;
  onStationTypeChange: (t: 'all' | StationType) => void;
  situationStatus: 'all' | SituationStatus;
  onSituationStatusChange: (s: 'all' | SituationStatus) => void;
  sortBy: 'name' | 'water_level' | 'rainfall' | 'status' | 'update_time';
  onSortByChange: (s: 'name' | 'water_level' | 'rainfall' | 'status' | 'update_time') => void;
  totalCount: number;
}

export const StationFilterBar: React.FC<StationFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  stationType,
  onStationTypeChange,
  situationStatus,
  onSituationStatusChange,
  sortBy,
  onSortByChange,
  totalCount,
}) => {
  const { isThai } = useLanguage();

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-card/80 p-5 sm:p-6 backdrop-blur-xl shadow-md dark:shadow-xl transition-colors">
      {/* Omni-Search Input (§14, §15) */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            isThai
              ? 'ค้นหาสถานี... (พิมพ์ชื่อสถานี, รหัส Y.14, ตำบล, อำเภอ, จังหวัด, สสน., ชลประทาน)'
              : 'Search stations... (e.g. Si Satchanalai, Y.14, Phrae, RID)'
          }
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
        />
      </div>

      {/* Filter Row: Type Pills, Status Dropdown, Sort Dropdown (§16) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        
        {/* Type Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => onStationTypeChange('all')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              stationType === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isThai ? 'ทั้งหมด' : 'All Types'}
          </button>
          
          <button
            onClick={() => onStationTypeChange('water_level')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              stationType === 'water_level'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>{isThai ? 'วัดระดับน้ำ' : 'Water Level'}</span>
          </button>

          <button
            onClick={() => onStationTypeChange('rainfall')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              stationType === 'rainfall'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-4 h-4" />
            <span>{isThai ? 'วัดปริมาณน้ำฝน' : 'Rainfall'}</span>
          </button>
        </div>

        {/* Right Controls: Status filter, Sort by, Total count badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Situation Status Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={situationStatus}
              onChange={(e) => onSituationStatusChange(e.target.value as any)}
              className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-1.5 pr-8 text-xs font-bold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-xs"
            >
              <option value="all">{isThai ? 'ทุกสถานะ' : 'All Status'}</option>
              <option value="normal">{isThai ? '🟢 ปกติ' : '🟢 Normal'}</option>
              <option value="watch">{isThai ? '🟡 เฝ้าระวัง' : '🟡 Watch'}</option>
              <option value="warning">{isThai ? '🟠 เตือนภัย' : '🟠 Warning'}</option>
              <option value="critical">{isThai ? '🔴 วิกฤต' : '🔴 Critical'}</option>
              <option value="missing">{isThai ? '⚪ ข้อมูลขาดหาย' : '⚪ Missing'}</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-1.5 pr-8 text-xs font-bold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-xs"
            >
              <option value="status">{isThai ? 'เรียงตาม: ความรุนแรง' : 'Sort: Severity'}</option>
              <option value="water_level">{isThai ? 'เรียงตาม: ระดับน้ำสูง' : 'Sort: High Water'}</option>
              <option value="rainfall">{isThai ? 'เรียงตาม: ฝนตกหนัก' : 'Sort: Rain Volume'}</option>
              <option value="name">{isThai ? 'เรียงตาม: ชื่อสถานี' : 'Sort: Name'}</option>
              <option value="update_time">{isThai ? 'เรียงตาม: อัปเดตล่าสุด' : 'Sort: Latest'}</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Total Count Badge (§17) */}
          <div className="px-3 py-1.5 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 text-xs font-mono text-cyan-800 dark:text-cyan-300 font-bold shadow-xs">
            {totalCount} {isThai ? 'สถานี' : 'stations'}
          </div>

        </div>

      </div>
    </div>
  );
};
