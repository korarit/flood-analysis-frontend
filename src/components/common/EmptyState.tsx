import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SearchX, Waves, CloudRain, MapPinOff, AlertCircle } from 'lucide-react';

export type EmptyStateType = 'stations_not_found' | 'no_history' | 'no_relations' | 'no_nearby' | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  const { isThai } = useLanguage();

  const presets = {
    stations_not_found: {
      icon: SearchX,
      titleTh: 'ไม่พบข้อมูลสถานี',
      titleEn: 'No Stations Found',
      descTh: 'ลองเปลี่ยนคำค้นหา ปรับตัวกรองประเภทสถานี หรือเลือกลุ่มน้ำอื่น',
      descEn: 'Try adjusting your search keywords, filter parameters, or switch river basin.',
      actionTh: 'ล้างตัวกรองการค้นหา',
      actionEn: 'Reset Filters',
    },
    no_history: {
      icon: Waves,
      titleTh: 'ยังไม่มีข้อมูลย้อนหลังสำหรับสถานีนี้',
      titleEn: 'No Historical Telemetry Data',
      descTh: 'ระบบยังไม่ได้รับข้อมูลโทรมาตรย้อนหลังจากสถานีนี้ กรุณาตรวจสอบอีกครั้งในภายหลัง',
      descEn: 'No historical observation series recorded for this station yet.',
      actionTh: 'ลองโหลดข้อมูลใหม่อีกครั้ง',
      actionEn: 'Reload Data',
    },
    no_relations: {
      icon: CloudRain,
      titleTh: 'ยังไม่มีข้อมูลความสัมพันธ์ของสถานี',
      titleEn: 'No Station Relationships',
      descTh: 'สถานีนี้ยังไม่มีการผูกโยงกับสถานีฝนต้นน้ำหรือสถานีน้ำท้ายน้ำในระบบแบบจำลอง',
      descEn: 'No upstream rainfall or downstream water station relationships linked yet.',
      actionTh: 'ดูสถานีทั้งหมดในลุ่มน้ำ',
      actionEn: 'View All Basin Stations',
    },
    no_nearby: {
      icon: MapPinOff,
      titleTh: 'ยังไม่ได้เลือกสถานีใกล้ฉัน',
      titleEn: 'No Nearby Station Selected',
      descTh: 'เลือกสถานีวัดระดับน้ำที่อยู่ใกล้คุณเพื่อใช้เป็นจุดอ้างอิงหลักในการติดตามสถานการณ์น้ำ',
      descEn: 'Select a telemetry station near you to track local water situation.',
      actionTh: 'ค้นหาและเลือกสถานีใกล้ฉัน',
      actionEn: 'Find & Select Nearby Station',
    },
    generic: {
      icon: AlertCircle,
      titleTh: 'ไม่มีข้อมูลแสดงผล',
      titleEn: 'No Data Available',
      descTh: 'ไม่พบรายการข้อมูลที่ตรงกับเงื่อนไขในขณะนี้',
      descEn: 'No items match current criteria at this moment.',
      actionTh: 'กลับสู่หน้าหลัก',
      actionEn: 'Go to Home',
    },
  }[type];

  const Icon = presets.icon;
  const displayTitle = title || (isThai ? presets.titleTh : presets.titleEn);
  const displayDesc = description || (isThai ? presets.descTh : presets.descEn);
  const displayAction = actionText || (isThai ? presets.actionTh : presets.actionEn);

  return (
    <div
      className={`rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-background-card/50 p-8 text-center backdrop-blur-md flex flex-col items-center justify-center max-w-md mx-auto my-6 shadow-md dark:shadow-xl transition-colors ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-500/20 flex items-center justify-center text-cyan-700 dark:text-cyan-400 mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{displayTitle}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 max-w-xs font-medium">{displayDesc}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
        >
          {displayAction}
        </button>
      )}
    </div>
  );
};
