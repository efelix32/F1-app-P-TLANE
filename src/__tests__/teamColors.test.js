import { describe, it, expect } from 'vitest';
import { getTeamColor, TEAM_COLORS } from '../utils/teamColors';

describe('getTeamColor', () => {
  it('returns default color for null team name', () => {
    const color = getTeamColor(null);
    expect(color).toHaveProperty('primary');
    expect(color).toHaveProperty('bg');
  });

  it('returns correct color for Red Bull', () => {
    const color = getTeamColor('Red Bull');
    expect(color.primary).toBe(TEAM_COLORS['Red Bull'].primary);
  });

  it('returns correct color for Ferrari', () => {
    const color = getTeamColor('Ferrari');
    expect(color.primary).toBe(TEAM_COLORS['Ferrari'].primary);
  });

  it('returns correct color for McLaren', () => {
    const color = getTeamColor('McLaren');
    expect(color.primary).toBe(TEAM_COLORS['McLaren'].primary);
  });

  it('returns correct color for Mercedes', () => {
    const color = getTeamColor('Mercedes');
    expect(color.primary).toBe(TEAM_COLORS['Mercedes'].primary);
  });

  it('handles partial team name match (case-insensitive)', () => {
    const color = getTeamColor('red bull racing');
    expect(color.primary).toBe(TEAM_COLORS['Red Bull'].primary);
  });

  it('returns fallback color for unknown team', () => {
    const color = getTeamColor('Unknown Team XYZ');
    expect(color).toHaveProperty('primary', '#8E8E93');
  });

  it('all team colors have required properties', () => {
    Object.values(TEAM_COLORS).forEach((color) => {
      expect(color).toHaveProperty('primary');
      expect(color).toHaveProperty('secondary');
      expect(color).toHaveProperty('bg');
    });
  });
});
