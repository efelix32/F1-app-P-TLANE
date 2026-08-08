import { describe, it, expect } from 'vitest';
import {
  formatLapTime,
  formatDuration,
  formatDate,
  getPositionSuffix,
  getFlagUrl,
  isRacePast,
} from '../utils/formatters';

describe('formatLapTime', () => {
  it('formats seconds into mm:ss.mmm format', () => {
    expect(formatLapTime(83.456)).toBe('1:23.456');
  });

  it('returns dash for null input', () => {
    expect(formatLapTime(null)).toBe('—');
  });

  it('returns dash for NaN input', () => {
    expect(formatLapTime(NaN)).toBe('—');
  });

  it('handles zero correctly', () => {
    expect(formatLapTime(0)).toBe('—');
  });

  it('formats sub-minute times correctly', () => {
    expect(formatLapTime(59.123)).toBe('0:59.123');
  });
});

describe('formatDuration', () => {
  it('returns dash for falsy input', () => {
    expect(formatDuration(0)).toBe('—');
    expect(formatDuration(null)).toBe('—');
  });

  it('formats milliseconds into seconds', () => {
    expect(formatDuration(5000)).toBe('5s');
  });

  it('formats milliseconds into minutes and seconds', () => {
    expect(formatDuration(125000)).toBe('2m 5s');
  });

  it('formats milliseconds into hours, minutes, and seconds', () => {
    expect(formatDuration(3665000)).toBe('1h 1m 5s');
  });
});

describe('getPositionSuffix', () => {
  it('returns dash for falsy input', () => {
    expect(getPositionSuffix(null)).toBe('—');
    expect(getPositionSuffix(0)).toBe('—');
  });

  it('formats 1st position correctly', () => {
    expect(getPositionSuffix(1)).toBe('1ST');
  });

  it('formats 2nd position correctly', () => {
    expect(getPositionSuffix(2)).toBe('2ND');
  });

  it('formats 3rd position correctly', () => {
    expect(getPositionSuffix(3)).toBe('3RD');
  });

  it('formats 4th position correctly', () => {
    expect(getPositionSuffix(4)).toBe('4TH');
  });

  it('works with string input', () => {
    expect(getPositionSuffix('1')).toBe('1ST');
    expect(getPositionSuffix('11')).toBe('11TH');
  });
});

describe('getFlagUrl', () => {
  it('returns a valid flag URL for known nationality', () => {
    const url = getFlagUrl('British');
    expect(url).toContain('gb');
    expect(url).toMatch(/^https?:\/\//);
  });

  it('returns unknown flag URL for unknown nationality', () => {
    const url = getFlagUrl('Atlantean');
    expect(url).toContain('un');
  });

  it('handles null nationality gracefully', () => {
    const url = getFlagUrl(null);
    expect(url).toContain('un');
  });
});

describe('isRacePast', () => {
  it('returns false for null input', () => {
    expect(isRacePast(null)).toBe(false);
  });

  it('returns true for a past date', () => {
    expect(isRacePast('2020-01-01')).toBe(true);
  });

  it('returns false for a future date', () => {
    expect(isRacePast('2099-12-31')).toBe(false);
  });
});
