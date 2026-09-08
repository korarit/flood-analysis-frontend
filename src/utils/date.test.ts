import { describe, it, expect } from 'bun:test';
import { formatDuration, formatTravelTime } from './date';

describe('formatDuration', () => {
  it('formats under 1 hour in minutes only', () => {
    expect(formatDuration(15, true)).toBe('15 นาที');
    expect(formatDuration(59, true)).toBe('59 นาที');
    expect(formatDuration(0, true)).toBe('0 นาที');
  });

  it('formats exact hours without trailing 0 minutes', () => {
    expect(formatDuration(60, true)).toBe('1 ชม.');
    expect(formatDuration(120, true)).toBe('2 ชม.');
    expect(formatDuration(3240, true)).toBe('54 ชม.');
  });

  it('formats hours and minutes together', () => {
    expect(formatDuration(65, true)).toBe('1 ชม. 5 นาที');
    expect(formatDuration(425, true)).toBe('7 ชม. 5 นาที');
    expect(formatDuration(903, true)).toBe('15 ชม. 3 นาที');
  });
});

describe('formatTravelTime', () => {
  it('formats range when min and max are available (e.g. 7 ชม. 5 นาที - 15 ชม. 3 นาที)', () => {
    const rel = {
      travelTimeMinutesMin: 425, // 7h 5m
      travelTimeMinutesMax: 903, // 15h 3m
    };
    expect(formatTravelTime(rel, true)).toBe('7 ชม. 5 นาที - 15 ชม. 3 นาที');
  });

  it('formats range under 1 hour as minutes only (e.g. 10 - 30 นาที)', () => {
    const rel = {
      travelTimeMinutesMin: 10,
      travelTimeMinutesMax: 30,
    };
    expect(formatTravelTime(rel, true)).toBe('10 - 30 นาที');
  });

  it('formats mixed range where min < 60m and max >= 60m', () => {
    const rel = {
      travelTimeMinutesMin: 21,
      travelTimeMinutesMax: 3240, // 54h
    };
    expect(formatTravelTime(rel, true)).toBe('21 นาที - 54 ชม.');
  });

  it('formats single value under 1 hour as minutes only', () => {
    const rel = { travelTimeMinutes: 15 };
    expect(formatTravelTime(rel, true)).toBe('15 นาที');
  });

  it('formats single value over 1 hour into hours and minutes', () => {
    const rel = { travelTimeMinutes: 97 }; // 1h 37m
    expect(formatTravelTime(rel, true)).toBe('1 ชม. 37 นาที');
  });

  it('supports hours fallback if minutes are not provided', () => {
    const rel = { travelTimeHours: 1.6 }; // 96 mins = 1h 36m
    expect(formatTravelTime(rel, true)).toBe('1 ชม. 36 นาที');
  });

  it('never outputs ~ or ประมาณ', () => {
    const rel = {
      travelTimeMinutes: 97,
      travelTimeMinutesMin: 68,
      travelTimeMinutesMax: 139,
    };
    const formatted = formatTravelTime(rel, true)!;
    expect(formatted.includes('~')).toBe(false);
    expect(formatted.includes('ประมาณ')).toBe(false);
    expect(formatted).toBe('1 ชม. 8 นาที - 2 ชม. 19 นาที');
  });
});
