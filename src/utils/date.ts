/**
 * Date and time formatting helpers with Asia/Bangkok (UTC+7) timezone
 */

export function toBangkokDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function toBangkokTimeString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function toBangkokShortDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/**
 * Format minutes into human-readable duration:
 * - Under 1 hour: "X นาที" (e.g. "15 นาที")
 * - 1 hour or more: "X ชม. Y นาที" (e.g. "7 ชม. 5 นาที") or "X ชม." if minutes === 0
 */
export function formatDuration(totalMins: number, isThai = true): string {
  const m = Math.max(0, Math.round(totalMins));
  if (m < 60) {
    return isThai ? `${m} นาที` : `${m} mins`;
  }
  const hours = Math.floor(m / 60);
  const remainingMins = m % 60;
  if (remainingMins === 0) {
    return isThai ? `${hours} ชม.` : `${hours} hrs`;
  }
  return isThai
    ? `${hours} ชม. ${remainingMins} นาที`
    : `${hours} hrs ${remainingMins} mins`;
}

/**
 * Format hydro travel time without approximation "~":
 * Range: "7 ชม. 5 นาที - 15 ชม. 3 นาที"
 * If under 1 hour: "10 - 30 นาที" or "15 นาที"
 */
export function formatTravelTime(
  rel: {
    travelTimeMinutes?: number;
    travelTimeHours?: number;
    travelTimeMinutesMin?: number;
    travelTimeMinutesMax?: number;
    travelTimeHoursMin?: number;
    travelTimeHoursMax?: number;
  },
  isThai = true
): string | null {
  const minM =
    rel.travelTimeMinutesMin ??
    (rel.travelTimeHoursMin != null ? Math.round(rel.travelTimeHoursMin * 60) : undefined);
  const maxM =
    rel.travelTimeMinutesMax ??
    (rel.travelTimeHoursMax != null ? Math.round(rel.travelTimeHoursMax * 60) : undefined);
  const avgM =
    rel.travelTimeMinutes ??
    (rel.travelTimeHours != null ? Math.round(rel.travelTimeHours * 60) : undefined);

  if (minM !== undefined && maxM !== undefined && minM < maxM) {
    if (minM < 60 && maxM < 60) {
      return isThai ? `${minM} - ${maxM} นาที` : `${minM} - ${maxM} mins`;
    }
    return `${formatDuration(minM, isThai)} - ${formatDuration(maxM, isThai)}`;
  }

  const singleM = avgM ?? minM ?? maxM;
  if (singleM === undefined) return null;

  return formatDuration(singleM, isThai);
}

