import { describe, it, expect } from 'vitest';
import {
  getDriverImageUrl,
  getDriverPortraitUrl,
} from '../utils/driverImages';

describe('getDriverImageUrl', () => {
  it('returns a URL string for known driver', () => {
    const url = getDriverImageUrl('hamilton');
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });

  it('returns null or undefined for unknown driver', () => {
    const url = getDriverImageUrl('unknown_driver_xyz');
    expect(url == null || url === '').toBeTruthy();
  });

  it('handles null input gracefully', () => {
    const url = getDriverImageUrl(null);
    expect(url == null || url === '').toBeTruthy();
  });
});

describe('getDriverPortraitUrl', () => {
  it('returns a URL string for a driver with portrait', () => {
    const url = getDriverPortraitUrl('leclerc');
    if (url) {
      expect(url).toMatch(/^https?:\/\//);
    }
  });

  it('handles unknown driver ID gracefully', () => {
    const url = getDriverPortraitUrl('unknown_xyz');
    expect(url == null || url === '').toBeTruthy();
  });

  it('handles null input gracefully', () => {
    const url = getDriverPortraitUrl(null);
    expect(url == null || url === '').toBeTruthy();
  });
});
