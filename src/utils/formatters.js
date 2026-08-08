// Formatting utilities for F1 data

export function formatLapTime(seconds) {
  if (!seconds || isNaN(seconds)) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
}

export function formatDuration(ms) {
  if (!ms) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'short'
  });
}

export function getCountdownDays(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target - now;
  if (diff < 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, total: diff };
}

export function getPositionSuffix(pos) {
  if (!pos) return '—';
  const n = parseInt(pos);
  if (n === 1) return `${n}ST`;
  if (n === 2) return `${n}ND`;
  if (n === 3) return `${n}RD`;
  return `${n}TH`;
}

export function getFlagUrl(nationality) {
  const countryMap = {
    'British': 'gb', 'German': 'de', 'Spanish': 'es', 'Finnish': 'fi',
    'Dutch': 'nl', 'Mexican': 'mx', 'Monegasque': 'mc', 'French': 'fr',
    'Australian': 'au', 'Canadian': 'ca', 'Japanese': 'jp', 'Thai': 'th',
    'Chinese': 'cn', 'American': 'us', 'Brazilian': 'br', 'Italian': 'it',
    'Danish': 'dk', 'Austrian': 'at', 'New Zealander': 'nz', 'Argentine': 'ar',
    'Polish': 'pl', 'Swedish': 'se', 'Swiss': 'ch', 'Belgian': 'be',
    'Irish': 'ie', 'Russian': 'ru', 'Hungarian': 'hu', 'Czech': 'cz',
  };
  const code = countryMap[nationality] || 'un';
  return `https://flagcdn.com/w40/${code}.png`;
}

export function getRaceCircuitFlag(country) {
  const countryMap = {
    'Australia': 'au', 'China': 'cn', 'Japan': 'jp', 'Bahrain': 'bh',
    'Saudi Arabia': 'sa', 'USA': 'us', 'United States': 'us', 'Miami': 'us',
    'Italy': 'it', 'Monaco': 'mc', 'Canada': 'ca', 'Spain': 'es',
    'Austria': 'at', 'UK': 'gb', 'Great Britain': 'gb', 'Hungary': 'hu',
    'Belgium': 'be', 'Netherlands': 'nl', 'Singapore': 'sg', 'Azerbaijan': 'az',
    'Mexico': 'mx', 'Brazil': 'br', 'Las Vegas': 'us', 'Qatar': 'qa',
    'Abu Dhabi': 'ae', 'UAE': 'ae',
  };
  const code = countryMap[country] || 'un';
  return `https://flagcdn.com/w40/${code}.png`;
}

export function isRacePast(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}
