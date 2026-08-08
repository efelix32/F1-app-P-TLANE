// F1 2025 Team Colors
export const TEAM_COLORS = {
  'Red Bull': { primary: '#3671C6', secondary: '#CC1E4A', bg: 'rgba(54, 113, 198, 0.15)' },
  'Ferrari': { primary: '#E8002D', secondary: '#FFFFFF', bg: 'rgba(232, 0, 45, 0.15)' },
  'Mercedes': { primary: '#27F4D2', secondary: '#FFFFFF', bg: 'rgba(39, 244, 210, 0.12)' },
  'McLaren': { primary: '#FF8000', secondary: '#FFFFFF', bg: 'rgba(255, 128, 0, 0.15)' },
  'Aston Martin': { primary: '#229971', secondary: '#FFFFFF', bg: 'rgba(34, 153, 113, 0.15)' },
  'Alpine': { primary: '#FF87BC', secondary: '#FFFFFF', bg: 'rgba(255, 135, 188, 0.12)' },
  'Williams': { primary: '#64C4FF', secondary: '#FFFFFF', bg: 'rgba(100, 196, 255, 0.12)' },
  'RB': { primary: '#6692FF', secondary: '#FFFFFF', bg: 'rgba(102, 146, 255, 0.12)' },
  'Racing Bulls': { primary: '#6692FF', secondary: '#FFFFFF', bg: 'rgba(102, 146, 255, 0.12)' },
  'Kick Sauber': { primary: '#52E252', secondary: '#FFFFFF', bg: 'rgba(82, 226, 82, 0.12)' },
  'Sauber': { primary: '#52E252', secondary: '#FFFFFF', bg: 'rgba(82, 226, 82, 0.12)' },
  'Haas': { primary: '#B6BABD', secondary: '#E8002D', bg: 'rgba(182, 186, 189, 0.12)' },
};

export function getTeamColor(teamName) {
  if (!teamName) return { primary: '#00D4AA', secondary: '#FFFFFF', bg: 'rgba(0, 212, 170, 0.12)' };
  
  for (const [key, colors] of Object.entries(TEAM_COLORS)) {
    if (teamName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(teamName.toLowerCase())) {
      return colors;
    }
  }
  return { primary: '#8E8E93', secondary: '#FFFFFF', bg: 'rgba(142, 142, 147, 0.12)' };
}

export const CONSTRUCTOR_IDS = {
  'red_bull': 'Red Bull',
  'ferrari': 'Ferrari',
  'mercedes': 'Mercedes',
  'mclaren': 'McLaren',
  'aston_martin': 'Aston Martin',
  'alpine': 'Alpine',
  'williams': 'Williams',
  'rb': 'RB',
  'sauber': 'Kick Sauber',
  'haas': 'Haas',
};
