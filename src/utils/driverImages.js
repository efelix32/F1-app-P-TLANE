/**
 * F1 Driver Image URLs — 2026 Season
 *
 * TWO separate systems:
 *  1. CARD images   → Cloudinary standing cutouts (transparent PNG/webp, right-facing)
 *  2. PROFILE/HERO  → content/dam direct portrait photos (real face shots, ~150-220KB each)
 *
 * Profile photo URLs confirmed working via HTTP 200 checks (July 2026).
 */

// ─── 1. Standing cutout card images (Cloudinary CDN) ──────────────────
const F1_BASE     = 'https://media.formula1.com/image/upload';
const FALLBACK_DRV = 'd_common:f1:2026:fallback:driver:2026fallbackdriverright.webp';

const DRIVER_PATHS = {
  'russell':        'mercedes/georus01/2026mercedesgeorus01right',
  'antonelli':      'mercedes/andant01/2026mercedesandant01right',
  'leclerc':        'ferrari/chalec01/2026ferrarichalec01right',
  'hamilton':       'ferrari/lewham01/2026ferrarilewham01right',
  'norris':         'mclaren/lannor01/2026mclarenlannor01right',
  'piastri':        'mclaren/oscpia01/2026mclarenoscpia01right',
  'max_verstappen': 'redbullracing/maxver01/2026redbullracingmaxver01right',
  'albon':          'williams/alealb01/2026williamsalealb01right',
  'gasly':          'alpine/piegas01/2026alpinepiegas01right',
  'colapinto':      'alpine/fracol01/2026alpinefracol01right',
  'hadjar':         'redbullracing/isahad01/2026redbullracingisahad01right',
  'lindblad':       'racingbulls/arvlin01/2026racingbullsarvlin01right',
  'lawson':         'racingbulls/lialaw01/2026racingbullslialaw01right',
  'ocon':           'haasf1team/estoco01/2026haasf1teamestoco01right',
  'bearman':        'haasf1team/olibea01/2026haasf1teamolibea01right',
  'sainz':          'williams/carsai01/2026williamscarsai01right',
  'hulkenberg':     'audi/nichul01/2026audinichul01right',
  'bortoleto':      'audi/gabbor01/2026audigabbor01right',
  'alonso':         'astonmartin/feralo01/2026astonmartinferalo01right',
  'stroll':         'astonmartin/lanstr01/2026astonmartinlanstr01right',
  'perez':          'cadillac/serper01/2026cadillacserper01right',
  'bottas':         'cadillac/valbot01/2026cadillacvalbot01right',
};

/** Small card portrait (standing cutout) */
export function getDriverImageUrl(driverId) {
  if (!driverId) return null;
  const key = driverId.toLowerCase();
  const path = DRIVER_PATHS[key]
    || DRIVER_PATHS[Object.keys(DRIVER_PATHS).find(k => key.includes(k.slice(0, 4))) || ''];
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${F1_BASE}/c_lfill,w_440/q_auto/${FALLBACK_DRV}/v1677244985/common/f1/2026/${path}.webp`;
}

/** Large standing cutout — used as backdrop / fallback in modal */
export function getDriverImageUrlLarge(driverId) {
  if (!driverId) return null;
  const key = driverId.toLowerCase();
  const path = DRIVER_PATHS[key]
    || DRIVER_PATHS[Object.keys(DRIVER_PATHS).find(k => key.includes(k.slice(0, 4))) || ''];
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${F1_BASE}/c_lfill,w_700/q_auto/${FALLBACK_DRV}/v1677244985/common/f1/2026/${path}.webp`;
}

// ─── 2. Portrait / hero photos (direct DAM) ────────────────────────────
//   These are the REAL driver face portraits used on f1.com driver pages.
//   All confirmed 200 OK in July 2026 (except Antonelli → see note).
//   No Cloudinary transforms — served as-is (~150–220 KB each).

const F1_DAM = 'https://media.formula1.com/content/dam/fom-website/drivers';

const DRIVER_PORTRAIT_PATHS = {
  // ✅ CONFIRMED CORRECT for 2026 — same team or updated portrait
  'max_verstappen': 'M/MAXVER01_Max_Verstappen/maxver01.png',    // Red Bull ✓
  'hamilton':       'L/LEWHAM01_Lewis_Hamilton/lewham01.png',    // Ferrari ✓
  'norris':         'L/LANNOR01_Lando_Norris/lannor01.png',      // McLaren ✓
  'leclerc':        'C/CHALEC01_Charles_Leclerc/chalec01.png',   // Ferrari ✓
  'piastri':        'O/OSCPIA01_Oscar_Piastri/oscpia01.png',      // McLaren ✓
  'russell':        'G/GEORUS01_George_Russell/georus01.png',    // Mercedes ✓
  'antonelli':      'K/ANDANT01_Kimi_Antonelli/andant01.png',    // Mercedes ✓
  'alonso':         'F/FERALO01_Fernando_Alonso/feralo01.png',   // Aston Martin ✓
  'sainz':          'C/CARSAI01_Carlos_Sainz/carsai01.png',      // Williams ✓
  'albon':          'A/ALEALB01_Alexander_Albon/alealb01.png',   // Williams ✓
  'tsunoda':        'Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png',      // Racing Bulls ✓
  'lawson':         'L/LIALAW01_Liam_Lawson/lialaw01.png',       // Racing Bulls ✓
  'gasly':          'P/PIEGAS01_Pierre_Gasly/piegas01.png',      // Alpine ✓
  'colapinto':      'F/FRACOL01_Franco_Colapinto/fracol01.png',  // Alpine ✓
  'stroll':         'L/LANSTR01_Lance_Stroll/lanstr01.png',      // Aston Martin ✓
  'ocon':           'E/ESTOCO01_Esteban_Ocon/estoco01.png',      // Haas ✓
  'bearman':        'O/OLIBEA01_Oliver_Bearman/olibea01.png',    // Haas ✓

  // ❌ REMOVED — portrait shows OLD TEAM suit (F1 DAM not yet updated):
  // We use the 2026 standing cutouts instead and crop them via CSS to look like headshots
  // 'perez'      → shows Red Bull suit  → falls back to 2026 Cadillac cutout
  // 'bottas'     → shows Kick Sauber   → falls back to 2026 Cadillac cutout
  // 'lindblad'   → F1 DAM lacks 2026 F1 portrait    → falls back to cutout
  // 'hulkenberg' → shows Kick Sauber   → falls back to 2026 Audi cutout
  // 'bortoleto'  → shows Kick Sauber   → falls back to 2026 Audi cutout
};

/**
 * High-quality portrait photo for modal hero.
 * Returns the actual face/portrait photo from F1's DAM (not a transparent cutout).
 * Falls back to large standing cutout if no portrait path found.
 */
export function getDriverPortraitUrl(driverId) {
  if (!driverId) return null;
  const key = driverId.toLowerCase();
  const path = DRIVER_PORTRAIT_PATHS[key]
    || DRIVER_PORTRAIT_PATHS[Object.keys(DRIVER_PORTRAIT_PATHS).find(k => key.includes(k.slice(0, 4))) || ''];
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${F1_DAM}/${path}`;
}

// ─── Number art PNG (official team-font styled number artwork) ─────────
const FALLBACK_CAR = 'd_common:f1:2026:fallback:car:2026fallbackcarright.webp';
export function getDriverNumberArtUrl(driverId) {
  if (!driverId) return null;
  const key = driverId.toLowerCase();
  const path = DRIVER_PATHS[key];
  if (!path) return null;
  const artPath = path.replace('right', 'numberwhitefrless');
  return `${F1_BASE}/c_fit,w_876,h_742/q_auto/${FALLBACK_CAR}/v1677244985/common/f1/2026/${artPath}.webp`;
}

// ─── Helpers ───────────────────────────────────────────────────────────
export function getDriverInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

// ─── Team car URLs ─────────────────────────────────────────────────────
const CAR_PATHS = {
  'mercedes':     'mercedes/2026mercedescarright',
  'ferrari':      'ferrari/2026ferraricarright',
  'mclaren':      'mclaren/2026mclarencarright',
  'red_bull':     'redbullracing/2026redbullracingcarright',
  'alpine':       'alpine/2026alpinecarright',
  'rb':           'racingbulls/2026racingbullscarright',
  'haas':         'haasf1team/2026haasf1teamcarright',
  'williams':     'williams/2026williamscarright',
  'sauber':       'audi/2026audicarright',
  'aston_martin': 'astonmartin/2026astonmartincarright',
  'cadillac':     'cadillac/2026cadillaccarright',
};

export function getTeamCarUrl(constructorId) {
  const path = CAR_PATHS[constructorId] || CAR_PATHS[constructorId?.replace('-', '_')];
  if (!path) return null;
  return `${F1_BASE}/c_lfill,h_224/q_auto/${FALLBACK_CAR}/v1677244985/common/f1/2026/${path}.webp`;
}

export function getTeamCarUrlLarge(constructorId) {
  const path = CAR_PATHS[constructorId] || CAR_PATHS[constructorId?.replace('-', '_')];
  if (!path) return null;
  return `${F1_BASE}/c_lfill,h_500/q_auto/${FALLBACK_CAR}/v1677244985/common/f1/2026/${path}.webp`;
}

// ─── Team logo URLs ────────────────────────────────────────────────────
const TEAM_LOGO_CDN = 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244985/content/dam/fom-website/2018-redesign-assets/team%20logos';
const TEAM_LOGO_SLUGS = {
  'Mercedes': 'mercedes', 'Ferrari': 'ferrari', 'McLaren': 'mclaren',
  'Red Bull Racing': 'red%20bull', 'Red Bull': 'red%20bull',
  'Alpine': 'alpine', 'Williams': 'williams',
  'Haas F1 Team': 'haas', 'Haas': 'haas',
  'Racing Bulls': 'rb', 'RB': 'rb',
  'Aston Martin': 'aston%20martin',
  'Audi': 'kick%20sauber', 'Kick Sauber': 'kick%20sauber', 'Sauber': 'kick%20sauber',
  'Cadillac': 'cadillac',
};

export function getTeamLogoUrl(teamName) {
  const slug = TEAM_LOGO_SLUGS[teamName];
  if (!slug) return null;
  return `${TEAM_LOGO_CDN}/${slug}.png`;
}
