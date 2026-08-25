import { WaterAlertEvent, SituationBulletin } from '../types/alert';
import { getBasinById, getStationsForBasin } from './basinService';

export function getAlertsForBasin(basinId: string): WaterAlertEvent[] {
  const basin = getBasinById(basinId);
  const stations = getStationsForBasin(basinId);
  const basinName = basin ? basin.name : { th: 'ลุ่มน้ำ', en: 'Basin' };

  const events: WaterAlertEvent[] = [];

  stations.forEach(station => {
    // 1. Rapid rise alert rule (delta >= 0.20 m/h)
    if (station.waterLevel && station.waterLevel.deltaPerHour >= 0.20) {
      events.push({
        id: `alert-rise-${station.id}`,
        type: 'rapid_rise',
        stationId: station.id,
        stationCode: station.code,
        stationName: station.name,
        basinId,
        basinName,
        severity: station.waterLevel.deltaPerHour >= 0.25 ? 'warning' : 'watch',
        title: {
          th: `ระดับน้ำเพิ่มขึ้นอย่างรวดเร็ว (+${station.waterLevel.deltaPerHour} ม./ชม.)`,
          en: `Rapid Water Level Rise (+${station.waterLevel.deltaPerHour} m/h)`,
        },
        description: {
          th: `ตรวจพบอัตราการเพิ่มของระดับน้ำสูงผิดปกติที่สถานี ${station.code} (${station.name.th}) อ.${station.geocode.amphoe.th} จ.${station.geocode.province.th}`,
          en: `Abnormal rapid rise detected at station ${station.code} (${station.name.en}), ${station.geocode.amphoe.en}.`,
        },
        ruleTriggered: {
          th: 'กฎเตือนภัย: อัตราการเพิ่มระดับน้ำ > 0.20 ม./ชม. ติดต่อกัน',
          en: 'Alert Rule: Water level rise rate > 0.20 m/h consecutively',
        },
        value: `+${station.waterLevel.deltaPerHour} ม./ชม.`,
        threshold: '> 0.20 ม./ชม.',
        timestamp: '2026-08-22 18:02:00',
        relativeTime: '3 นาทีที่แล้ว',
      });
    }

    // 2. Heavy rain alert rule (rain1h >= 30mm or rain24h >= 80mm)
    if (station.rainfall && (station.rainfall.rain1h >= 30 || station.rainfall.rain24h >= 80)) {
      events.push({
        id: `alert-rain-${station.id}`,
        type: 'heavy_rain',
        stationId: station.id,
        stationCode: station.code,
        stationName: station.name,
        basinId,
        basinName,
        severity: station.rainfall.rain1h >= 45 ? 'critical' : 'warning',
        title: {
          th: `ฝนตกหนักมากในพื้นที่ (${station.rainfall.rain1h} มม./ชม.)`,
          en: `Intense Rainfall Detected (${station.rainfall.rain1h} mm/h)`,
        },
        description: {
          th: `ปริมาณฝนสะสมสูงที่สถานี ${station.code} (${station.name.th}) ฝน 24 ชม. สะสม ${station.rainfall.rain24h} มม. มีความเสี่ยงน้ำป่าไหลหลาก`,
          en: `Heavy rainfall detected at ${station.code} with 24h accumulation ${station.rainfall.rain24h} mm. Flash flood risk elevated.`,
        },
        ruleTriggered: {
          th: 'กฎเตือนภัย: ฝน 1 ชม. > 30 มม. หรือ ฝน 24 ชม. > 80 มม.',
          en: 'Alert Rule: 1h Rain > 30mm or 24h Rain > 80mm',
        },
        value: `${station.rainfall.rain1h} มม.`,
        threshold: '> 30 มม.',
        timestamp: '2026-08-22 17:45:00',
        relativeTime: '20 นาทีที่แล้ว',
      });
    }

    // 3. Bank capacity alert rule (> 85% capacity)
    if (station.waterLevel && station.waterLevel.bankCapacityPercent >= 70) {
      events.push({
        id: `alert-bank-${station.id}`,
        type: 'warning_level',
        stationId: station.id,
        stationCode: station.code,
        stationName: station.name,
        basinId,
        basinName,
        severity: station.waterLevel.bankCapacityPercent >= 85 ? 'warning' : 'watch',
        title: {
          th: `ระดับน้ำอยู่ในเกณฑ์เฝ้าระวัง (${station.waterLevel.bankCapacityPercent}% ของตลิ่ง)`,
          en: `Water Level Near Bank Capacity (${station.waterLevel.bankCapacityPercent}%)`,
        },
        description: {
          th: `ระดับน้ำปัจจุบัน ${station.waterLevel.waterLevelMsl} ม.รทก. เหลืออีก ${(station.waterLevel.bankLevelMsl - station.waterLevel.waterLevelMsl).toFixed(2)} ม. จะถึงระดับตลิ่ง`,
          en: `Current water level is ${station.waterLevel.waterLevelMsl} m MSL, ${(station.waterLevel.bankLevelMsl - station.waterLevel.waterLevelMsl).toFixed(2)} m below bank overflow.`,
        },
        ruleTriggered: {
          th: 'กฎเตือนภัย: ระดับน้ำสูงกว่า 70% ของระดับตลิ่ง',
          en: 'Alert Rule: Water level exceeds 70% of river bank level',
        },
        value: `${station.waterLevel.waterLevelMsl} ม.รทก.`,
        threshold: `${station.waterLevel.warningLevelMsl} ม.รทก.`,
        timestamp: '2026-08-22 18:05:00',
        relativeTime: 'เมื่อสักครู่',
      });
    }
  });

  return events;
}

const R2_PUBLIC_BASE_URL = (import.meta as any).env?.VITE_R2_PUBLIC_BASE_URL || 'http://localhost:3001/r2-static';
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Fetch Situation Bulletin dynamically from Cloudflare R2 / Backend REST API
 */
export async function fetchSituationBulletin(basinId: string): Promise<SituationBulletin> {
  // 1. Try loading from R2 Public Object Path
  try {
    const res = await fetch(`${R2_PUBLIC_BASE_URL}/basin/${basinId}/report/bulletin-latest.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.overallSituation) {
        return data as SituationBulletin;
      }
    }
  } catch {}

  // 2. Try loading from Backend REST API
  try {
    const res = await fetch(`${API_BASE_URL}/basins/${basinId}/report`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as SituationBulletin;
      }
    }
  } catch {}

  // 3. Fallback to dynamic synthesizer based on current stations
  return getSituationBulletin(basinId);
}

/**
 * Dynamic fallback synthesizer based on current basin stations data
 */
export function getSituationBulletin(basinId: string): SituationBulletin {
  const basin = getBasinById(basinId);
  const stations = getStationsForBasin(basinId);
  const basinName = basin ? basin.name : { th: 'ลุ่มน้ำ', en: 'River Basin' };
  const overallSeverity = basin ? basin.overallStatus : 'normal';

  const criticalStations = stations.filter(s => s.status === 'critical');
  const warningStations = stations.filter(s => s.status === 'warning');
  const watchStations = stations.filter(s => s.status === 'watch');

  const highlights: { th: string; en: string }[] = [];

  stations.slice(0, 3).forEach(s => {
    if (s.waterLevel) {
      highlights.push({
        th: `สถานี ${s.code} (${s.name.th}) ระดับน้ำ ${s.waterLevel.waterLevelMsl} ม.รทก. คิดเป็น ${s.waterLevel.bankCapacityPercent}% ของตลิ่ง แนวโน้ม ${s.waterLevel.trend === 'rising' ? 'เพิ่มขึ้น' : 'ทรงตัว'}`,
        en: `Station ${s.code} (${s.name.en}) water level at ${s.waterLevel.waterLevelMsl} m MSL (${s.waterLevel.bankCapacityPercent}% capacity), trend ${s.waterLevel.trend}.`
      });
    } else if (s.rainfall) {
      highlights.push({
        th: `สถานี ${s.code} (${s.name.th}) ปริมาณฝน 24 ชม. สะสม ${s.rainfall.rain24h} มม.`,
        en: `Station ${s.code} (${s.name.en}) recorded 24h rainfall of ${s.rainfall.rain24h} mm.`
      });
    }
  });

  if (highlights.length === 0) {
    highlights.push({
      th: `สถานการณ์น้ำและปริมาณฝนในภาพรวมของ${basinName.th}อยู่ในเกณฑ์ปกติ`,
      en: `Overall water levels and rainfall across ${basinName.en} remain within normal criteria.`
    });
  }

  const isHigh = overallSeverity === 'warning' || overallSeverity === 'critical';
  const isWatch = overallSeverity === 'watch';

  const now = new Date();
  const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const issuedDate = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`;
  const issuedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

  return {
    id: `bulletin-${basinId}-${now.toISOString().slice(0, 10).replace(/-/g, '')}`,
    basinId,
    basinName,
    issuedDate,
    issuedTime,
    overallSituation: {
      th: isHigh
        ? `สถานการณ์น้ำใน${basinName.th}อยู่ในเกณฑ์${overallSeverity === 'critical' ? 'วิกฤต' : 'เตือนภัย'} ตรวจพบสถานีเฝ้าระวัง ${criticalStations.length + warningStations.length} แห่ง มีความเสี่ยงน้ำล้นตลิ่ง`
        : isWatch
        ? `สถานการณ์น้ำใน${basinName.th}อยู่ในเกณฑ์เฝ้าระวัง มีฝนตกสะสมต่อเนื่อง ส่งผลให้ระดับน้ำในลำน้ำสายหลักมีแนวโน้มทรงตัวสูง`
        : `สถานการณ์น้ำใน${basinName.th}อยู่ในเกณฑ์ปกติ ระดับน้ำในลำน้ำสายหลักยังต่ำกว่าตลิ่ง การระบายน้ำทำได้คล่องตัว`,
      en: isHigh
        ? `Water situation in ${basinName.en} is at ${overallSeverity.toUpperCase()} level with ${criticalStations.length + warningStations.length} stations exceeding warning thresholds.`
        : isWatch
        ? `Water situation in ${basinName.en} is under WATCH status due to continuous rainfall keeping river stages elevated.`
        : `Water situation in ${basinName.en} is NORMAL. River levels remain within bank capacities with smooth discharge.`
    },
    overallSeverity,
    keyHighlights: highlights,
    highRiskAreas: (criticalStations.length > 0 || warningStations.length > 0)
      ? [...criticalStations, ...warningStations].map(s => ({
          th: `อ.${s.geocode.amphoe.th} จ.${s.geocode.province.th}`,
          en: `${s.geocode.amphoe.en} District (${s.geocode.province.en})`
        }))
      : [{ th: `ไม่มีพื้นที่เสี่ยงวิกฤตในขณะนี้`, en: `No critical high-risk zones currently identified.` }],
    upstreamStatus: {
      th: isHigh
        ? `ตอนบน (ต้นน้ำ) มีฝนตกต่อเนื่อง ระดับน้ำในลำน้ำสาขาเพิ่มขึ้นอย่างรวดเร็ว`
        : `ตอนบน (ต้นน้ำ) สภาพอากาศปกติ ระดับน้ำในลำน้ำสาขาทรงตัว`,
      en: isHigh
        ? `Upstream reaches experiencing continuous heavy rain with rising tributary stages.`
        : `Upstream reaches stable under normal weather conditions.`
    },
    midstreamStatus: {
      th: isHigh
        ? `ตอนกลาง (กลางน้ำ) รับมวลน้ำจากต้นน้ำ ระดับน้ำสูงขึ้นต่อเนื่อง เฝ้าระวังจุดเสี่ยงตลิ่งต่ำ`
        : `ตอนกลาง (กลางน้ำ) ระดับน้ำอยู่ในเกณฑ์ควบคุม การระบายน้ำทำได้ตามเกณฑ์`,
      en: isHigh
        ? `Midstream reaches receiving upstream flows with elevated stages near lower banks.`
        : `Midstream reaches operating under standard regulation criteria.`
    },
    downstreamStatus: {
      th: `ตอนล่าง (ปลายน้ำ) ระดับน้ำต่ำกว่าตลิ่ง ประตูระบายน้ำและสถานีสูบน้ำพร้อมรองรับการระบาย`,
      en: `Downstream reaches remain below bank levels; sluice gates and pumps operating normally.`
    },
    forecastNext24h: {
      th: isHigh
        ? `คาดการณ์ 24 ชั่วโมงข้างหน้า ระดับน้ำในลำน้ำสายหลักมีแนวโน้มเพิ่มขึ้นต่อเนื่อง ขอให้ประชาชนริมตลิ่งและพื้นที่ลุ่มต่ำติดตามสถานการณ์อย่างใกล้ชิด`
        : `คาดการณ์ 24 ชั่วโมงข้างหน้า ระดับน้ำมีแนวโน้มทรงตัวถึงลดลงต่อเนื่อง สภาพอากาศปกติ ไม่มีแนวโน้มวิกฤต`,
      en: isHigh
        ? `Forecast for next 24 hours indicates rising stages along main stems. Riparian communities advised to stay alert.`
        : `Forecast for next 24 hours indicates steady to receding water levels with no critical threats.`
    },
    officerInCharge: {
      th: 'ระบบประมวลผลสถานการณ์น้ำและอุทกวิทยา',
      en: 'Water Situation & Hydrology Processing System'
    }
  };
}
