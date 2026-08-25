import { LocalizedString, SituationStatus, FreshnessStatus } from './basin';

export type StationType = 'water_level' | 'rainfall';
export type TrendDirection = 'rising' | 'steady' | 'falling';
export type RainIntensity = 'light' | 'moderate' | 'heavy' | 'very_heavy';

export interface StationGeocode {
  tumbon: LocalizedString;
  amphoe: LocalizedString;
  province: LocalizedString;
  provinceCode?: string;
  warningZone?: string;
}

export interface StationAgency {
  name: LocalizedString;
  shortname: LocalizedString;
}

export interface WaterLevelTelemetry {
  waterLevelMsl: number;         // ระดับน้ำ ม.รทก.
  waterLevelBed: number;         // ระดับน้ำเทียบท้องน้ำ (ม.)
  discharge: number;             // ปริมาณการไหล ลูกบาศก์เมตร/วินาที (m³/s)
  bankLevelMsl: number;          // ระดับตลิ่ง ม.รทก.
  warningLevelMsl: number;       // ระดับเตือนภัย ม.รทก.
  criticalLevelMsl: number;      // ระดับวิกฤต ม.รทก.
  bedLevelMsl: number;           // ระดับท้องน้ำ ม.รทก.
  bankCapacityPercent: number;   // % ความจุตลิ่ง (เช่น 68.5%)
  maxDischargeCapacity: number;  // อัตราการไหลสูงสุดตามความจุลำน้ำ (m³/s)
  dischargePercent: number;      // % เทียบอัตราการไหลสูงสุด
  trend: TrendDirection;         // แนวโน้มน้ำ
  deltaPerHour: number;          // อัตราการเปลี่ยนแปลง ม./ชม.
}

export interface RainfallTelemetry {
  rain1h: number;                // ปริมาณฝน 1 ชม. (mm)
  rain3h: number;                // ปริมาณฝน 3 ชม. (mm)
  rain6h: number;                // ปริมาณฝน 6 ชม. (mm)
  rain24h: number;               // ปริมาณฝน 24 ชม. สะสม (mm)
  intensity: RainIntensity;      // ความรุนแรงของฝน
}

export interface StationRelation {
  stationId: string;
  name: LocalizedString;
  stationType: StationType;
  distanceKm: number;            // ระยะทาง (km)
  travelTimeHours?: number;      // เวลาน้ำหลากเดินทาง (ชั่วโมง)
  influenceWeightPercent?: number;// น้ำหนักอิทธิพล %
  latestValue: string;           // e.g. "65.0 mm" or "5.82 ม.รทก."
  status: SituationStatus;
  isUpstream?: boolean;
}

export interface Station {
  id: string;                    // Unique identifier e.g. 'Y-0014' or '621'
  code: string;                  // Code e.g. 'Y.14', 'PKTI'
  name: LocalizedString;
  basinId: string;               // e.g. 'yom'
  subBasinId?: string;
  subBasinName?: LocalizedString;
  stationType: StationType;      // 'water_level' | 'rainfall'
  lat: number;
  long: number;
  agency: StationAgency;
  geocode: StationGeocode;
  status: SituationStatus;       // 'normal' | 'watch' | 'warning' | 'critical' | 'missing'
  freshness: FreshnessStatus;    // 'fresh' | 'delayed' | 'missing'
  alertReason?: LocalizedString; // ข้อความเตือนภัย เช่น มีฝนตกหนักที่ต้นน้ำ
  isUpstreamAlert?: boolean;     // แจ้งเตือนจากอิทธิพลฝนต้นน้ำ
  lastUpdated: string;           // e.g. "2026-08-22 18:05:00"
  
  // Specific Telemetries
  waterLevel?: WaterLevelTelemetry;
  rainfall?: RainfallTelemetry;
  
  // Station relationships (Upstream rain stations or downstream river gauges)
  influencingStations?: StationRelation[];
  downstreamStations?: StationRelation[];

  // River chain index (optional for river view)
  riverOrder?: number;
  riverName?: LocalizedString;
}
