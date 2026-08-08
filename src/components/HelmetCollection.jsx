import React, { useState } from 'react';
import { getTeamColor } from '../utils/teamColors';
import { useNavigate } from 'react-router-dom';

// ─── Helmet SVG per driver ─────────────────────────────────────────────────
const HELMET_DATA = {
  max_verstappen: { colors: ['#1B3FA0', '#CC1E4A', '#FFD700'],  stripes: [[20,38,50,20,75,38],[68,32,80,48,62,48]] },
  hamilton:       { colors: ['#E8002D', '#FFFFFF', '#000000'],  stripes: [[22,36,50,18,72,36],[30,50,68,50]] },
  leclerc:        { colors: ['#E8002D', '#FF9500', '#FFFFFF'],  stripes: [[20,40,50,22,70,40]] },
  norris:         { colors: ['#FF8000', '#47C7FC', '#FFFFFF'],  stripes: [[14,50,50,20,65,35]] },
  piastri:        { colors: ['#FF8000', '#000000', '#FFFFFF'],  stripes: [[50,20,50,85]] },
  russell:        { colors: ['#00D2BE', '#FFFFFF', '#000000'],  stripes: [[24,34,50,20,76,34],[32,52,68,52]] },
  antonelli:      { colors: ['#00D2BE', '#FF2020', '#FFFFFF'],  stripes: [[60,20,82,48,65,52]] },
  alonso:         { colors: ['#229971', '#FFD700', '#000000'],  stripes: [[20,38,50,22,72,38]] },
  sainz:          { colors: ['#64C4FF', '#003FFF', '#FFFFFF'],  stripes: [[14,50,86,50],[14,57,86,57]] },
  gasly:          { colors: ['#0093CC', '#FF69B4', '#FFFFFF'],  stripes: [[14,50,50,20,65,42]] },
  hadjar:         { colors: ['#6692FF', '#CC1E4A', '#FFFFFF'],  stripes: [[22,38,50,22,72,38]] },
  albon:          { colors: ['#64C4FF', '#CC0000', '#FFFFFF'],  stripes: [[14,48,50,20],[50,20,86,48]] },
  hulkenberg:     { colors: ['#F50538', '#FFFFFF', '#000000'],  stripes: [[20,36,50,20,78,36]] },
  bearman:        { colors: ['#B6BABD', '#CC0000', '#FFFFFF'],  stripes: [[20,40,50,22,72,40]] },
  colapinto:      { colors: ['#74ACDF', '#FFFFFF', '#F6B40E'],  stripes: [[14,48,50,20,86,48]] },
  stroll:         { colors: ['#229971', '#000000', '#FFFFFF'],  stripes: [[28,38,50,22,70,38]] },
  tsunoda:        { colors: ['#6692FF', '#FF2020', '#FFFFFF'],  stripes: [[20,36,50,20,72,36]] },
  lawson:         { colors: ['#1B3FA0', '#CC1E4A', '#FFFFFF'],  stripes: [[60,20,80,45,62,50]] },
};

function HelmetSVG({ driverId, size = 200 }) {
  const data = HELMET_DATA[driverId] || { colors: ['#333344', '#666677', '#FFFFFF'], stripes: [] };
  const [c1, c2, c3] = data.colors;

  return (
    <svg
      width={size} height={size * 0.9}
      viewBox="0 0 100 90"
      style={{ display: 'block', overflow: 'visible', filter: `drop-shadow(0 8px 24px ${c1}60)` }}
    >
      <defs>
        <radialGradient id={`hg_${driverId}`} cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor={c1} stopOpacity="1" />
          <stop offset="100%" stopColor={c1} stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id={`shine_${driverId}`} cx="35%" cy="25%" r="45%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <clipPath id={`clip_${driverId}`}>
          <path d="M12 55 Q12 22 50 12 Q88 22 88 55 L88 68 Q88 78 78 80 L22 80 Q12 78 12 68 Z" />
        </clipPath>
      </defs>

      {/* Helmet shell */}
      <path d="M12 55 Q12 22 50 12 Q88 22 88 55 L88 68 Q88 78 78 80 L22 80 Q12 78 12 68 Z"
        fill={`url(#hg_${driverId})`} />

      {/* Design stripe layer */}
      <g clipPath={`url(#clip_${driverId})`}>
        {/* Main design stripe */}
        <path d={`M${data.stripes[0]?.map((v, i) => (i === 0 ? 'M' + v : (i % 2 === 0 ? ' L' + v : ',' + v))).join('') || 'M20,40 L50,20 L75,38'}`}
          fill={c2} opacity="0.85" />
        {data.stripes[1] && (
          <path d={`M${data.stripes[1]?.map((v, i) => (i === 0 ? '' + v : (i % 2 === 0 ? ' L' + v : ',' + v))).join('')}`}
            fill="none" stroke={c3} strokeWidth="2.5" opacity="0.7" />
        )}
      </g>

      {/* Visor */}
      <path d="M22 54 Q26 44 50 42 Q74 44 78 54 L76 62 Q50 67 24 62 Z"
        fill="rgba(10,10,25,0.95)" />
      {/* Visor chrome rim */}
      <path d="M22 54 Q26 44 50 42 Q74 44 78 54"
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {/* Visor shine */}
      <path d="M28 51 Q38 45 54 46"
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" />

      {/* Helmet shine overlay */}
      <path d="M12 55 Q12 22 50 12 Q88 22 88 55 L88 68 Q88 78 78 80 L22 80 Q12 78 12 68 Z"
        fill={`url(#shine_${driverId})`} />

      {/* Chin / lower section */}
      <path d="M24 62 Q50 70 76 62 L78 74 Q50 82 22 74 Z"
        fill={c1} opacity="0.6" />

      {/* Air intake detail */}
      <rect x="40" y="72" width="20" height="4" rx="2" fill="rgba(0,0,0,0.4)" />
      <rect x="43" y="73" width="5" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
      <rect x="51" y="73" width="5" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
    </svg>
  );
}

const ALL_HELMET_INFO = {
  max_verstappen: { name: 'Max Verstappen', code: 'VER', num: 1,  team: 'Red Bull Racing' },
  hamilton:       { name: 'Lewis Hamilton', code: 'HAM', num: 44, team: 'Ferrari'          },
  leclerc:        { name: 'Charles Leclerc', code: 'LEC', num: 16, team: 'Ferrari'         },
  norris:         { name: 'Lando Norris',    code: 'NOR', num: 4,  team: 'McLaren'         },
  piastri:        { name: 'Oscar Piastri',   code: 'PIA', num: 81, team: 'McLaren'         },
  russell:        { name: 'George Russell',  code: 'RUS', num: 63, team: 'Mercedes'        },
  antonelli:      { name: 'Kimi Antonelli',  code: 'ANT', num: 12, team: 'Mercedes'        },
  alonso:         { name: 'Fernando Alonso', code: 'ALO', num: 14, team: 'Aston Martin'    },
  sainz:          { name: 'Carlos Sainz',    code: 'SAI', num: 55, team: 'Williams'        },
  gasly:          { name: 'Pierre Gasly',    code: 'GAS', num: 10, team: 'Alpine'          },
  hadjar:         { name: 'Isack Hadjar',    code: 'HAD', num: 6,  team: 'Racing Bulls'    },
  albon:          { name: 'Alex Albon',      code: 'ALB', num: 23, team: 'Williams'        },
  hulkenberg:     { name: 'Nico Hulkenberg', code: 'HUL', num: 27, team: 'Audi'            },
  bearman:        { name: 'Oliver Bearman',  code: 'BEA', num: 87, team: 'Haas F1 Team'   },
  colapinto:      { name: 'Franco Colapinto',code: 'COL', num: 43, team: 'Alpine'          },
  stroll:         { name: 'Lance Stroll',    code: 'STR', num: 18, team: 'Aston Martin'    },
  tsunoda:        { name: 'Yuki Tsunoda',    code: 'TSU', num: 22, team: 'Racing Bulls'    },
  lawson:         { name: 'Liam Lawson',     code: 'LAW', num: 30, team: 'Red Bull Racing' },
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function HelmetCollection({ favDrivers = [] }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const helmets = favDrivers
    .filter(id => ALL_HELMET_INFO[id])
    .map(id => ({ id, ...ALL_HELMET_INFO[id] }));

  if (helmets.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '40px 20px',
        background: 'rgba(255,255,255,0.02)', borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
          Favori pilot ekleyince kasklari burada goreceksin
        </div>
        <button onClick={() => navigate('/profile')} style={{
          padding: '9px 22px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
          background: 'transparent', color: 'rgba(255,255,255,0.6)',
          fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
        }}>
          Pilot Sec
        </button>
      </div>
    );
  }

  const activeId = selected || helmets[0]?.id;
  const active = helmets.find(h => h.id === activeId) || helmets[0];
  const color = getTeamColor(active?.team);
  const hData = HELMET_DATA[active?.id] || { colors: ['#333344', '#666677', '#FFFFFF'] };
  const [c1] = hData.colors;

  return (
    <div>
      {/* Vitrin — spotlight showcase */}
      <div style={{
        borderRadius: 24,
        background: `linear-gradient(160deg, ${c1}18 0%, rgba(6,6,12,1) 55%)`,
        border: `1px solid ${c1}25`,
        padding: '32px 24px 24px',
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.5s ease',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 280, height: 280,
          background: `radial-gradient(ellipse, ${c1}20 0%, transparent 70%)`,
          pointerEvents: 'none', transition: 'all 0.5s ease',
        }} />
        {/* Stage floor reflection */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: `linear-gradient(to top, ${c1}10, transparent)`,
          pointerEvents: 'none',
        }} />

        {/* Helmet display */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            <HelmetSVG driverId={active?.id} size={200} />
            {/* Stand */}
            <div style={{
              width: 60, height: 6, background: `linear-gradient(90deg, transparent, ${c1}40, transparent)`,
              margin: '0 auto', borderRadius: 3,
            }} />
            <div style={{
              width: 8, height: 14, background: `${c1}25`, margin: '0 auto',
              borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
            }} />
          </div>
        </div>

        {/* Driver info */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${c1}15`, border: `1px solid ${c1}30`,
            borderRadius: 20, padding: '4px 14px', marginBottom: 10,
          }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: c1, letterSpacing: 1.5 }}>
              #{active?.num}
            </span>
            <span style={{ width: 1, height: 12, background: `${c1}40` }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: c1, letterSpacing: 1 }}>
              {active?.code}
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, marginBottom: 3 }}>
            {active?.name}
          </div>
          <div style={{ fontSize: 11, color: color.primary, fontWeight: 700 }}>
            {active?.team}
          </div>
          {/* Color palette dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
            {hData.colors.map((col, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%', background: col,
                border: '1.5px solid rgba(255,255,255,0.15)',
                boxShadow: `0 2px 6px ${col}60`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      {helmets.length > 1 && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {helmets.map(h => {
            const hc = getTeamColor(h.team);
            const hd = HELMET_DATA[h.id] || { colors: ['#333'] };
            const isActive = h.id === activeId;
            return (
              <button key={h.id} onClick={() => setSelected(h.id)} style={{
                flexShrink: 0, width: 72, height: 72, borderRadius: 16, cursor: 'pointer',
                border: `2px solid ${isActive ? hd.colors[0] : 'rgba(255,255,255,0.08)'}`,
                background: isActive ? `${hd.colors[0]}15` : 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
                transform: isActive ? 'scale(1.06)' : 'scale(1)',
                boxShadow: isActive ? `0 6px 20px ${hd.colors[0]}30` : 'none',
                flexDirection: 'column', gap: 2, padding: 0,
              }}>
                <HelmetSVG driverId={h.id} size={52} />
                <div style={{
                  fontSize: 8, fontWeight: 900, color: isActive ? hd.colors[0] : 'rgba(255,255,255,0.3)',
                  letterSpacing: 0.5, lineHeight: 1,
                }}>{h.code}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
