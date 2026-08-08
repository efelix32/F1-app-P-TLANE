import React, { useState } from 'react';
import { useDriverStandings } from '../hooks/useJolpica';
import { getTeamColor } from '../utils/teamColors';
import { getFlagUrl } from '../utils/formatters';
import { getDriverImageUrl, getDriverInitials } from '../utils/driverImages';
import { LoadingSpinner, ErrorMessage } from '../components/common/LoadingSpinner';
import DriverModal from '../components/DriverModal';

function DriverInitialsAvatar({ first, last, color }) {
  const initials = getDriverInitials(first, last);
  return (
    <div style={{
      position: 'absolute', right: 0, bottom: 0,
      width: '58%', height: '88%',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      paddingBottom: 16, zIndex: 1,
    }}>
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}25, ${color}08)`,
        border: `1.5px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 900, fontStyle: 'italic',
        color: color, letterSpacing: -3,
      }}>
        {initials}
      </div>
    </div>
  );
}

// ─── Number badge with driver portrait inside ─────────────────────────
function NumberWithPortrait({ number, driverId, color }) {
  const [failed, setFailed] = useState(false);
  const imgUrl = getDriverImageUrl(driverId);

  return (
    <div style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {/* Number in team color */}
      <div style={{
        fontSize: 52, fontWeight: 900, fontStyle: 'italic',
        letterSpacing: -3, lineHeight: 1,
        color: color, opacity: 0.9,
        textShadow: `0 0 30px ${color}50`,
      }}>
        {number}
      </div>
    </div>
  );
}

// ─── Single driver card ───────────────────────────────────────────────
function DriverCard({ item, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const drv   = item.Driver;
  const team  = item.Constructors?.[0];
  const color = getTeamColor(team?.name);
  const flag  = getFlagUrl(drv?.nationality);
  const pos   = parseInt(item.position);

  const imgUrl = getDriverImageUrl(drv?.driverId);

  const posColors = { 1: '#FFD700', 2: '#C0C7D0', 3: '#CD853F' };
  const posBgs    = { 1: 'rgba(255,215,0,0.10)', 2: 'rgba(192,199,208,0.08)', 3: 'rgba(205,133,63,0.08)' };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        background: '#0A0A0D',
        border: `1px solid rgba(255,255,255,${hovered ? 0.13 : 0.06})`,
        borderRadius: 22, cursor: 'pointer',
        height: 280,
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-6px) scale(1.018)' : 'none',
        boxShadow: hovered
          ? `0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px ${color.primary}28, 0 0 40px ${color.primary}08`
          : '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top accent stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color.primary}, ${color.primary}60)`,
        boxShadow: hovered ? `0 0 20px ${color.primary}80` : 'none',
        transition: 'box-shadow 0.25s', zIndex: 5,
      }} />

      {/* BG gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(145deg, ${color.bg} 0%, transparent 60%)`,
      }} />

      {/* BIG NUMBER — very visible behind portrait */}
      <div style={{
        position: 'absolute',
        right: '-5%', bottom: -8,
        fontSize: 170, fontWeight: 900, fontStyle: 'italic',
        letterSpacing: -16, lineHeight: 1,
        color: color.primary,
        opacity: hovered ? 0.22 : 0.14,
        userSelect: 'none', zIndex: 1,
        transition: 'opacity 0.3s',
        fontFamily: 'var(--font)',
      }}>
        {drv?.permanentNumber}
      </div>

      {/* DRIVER PORTRAIT — right side, fitted */}
      {!imgFailed && imgUrl ? (
        <>
          <img
            src={imgUrl}
            alt={`${drv?.givenName} ${drv?.familyName}`}
            onError={() => setImgFailed(true)}
            style={{
              position: 'absolute', right: -4, bottom: 0,
              height: '100%', width: 'auto',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              zIndex: 2,
              WebkitMaskImage: 'linear-gradient(95deg, transparent 0%, black 24%)',
              maskImage: 'linear-gradient(95deg, transparent 0%, black 24%)',
              transform: hovered ? 'scale(1.04) translateX(-2px)' : 'scale(1)',
              transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))',
            }}
          />
        </>
      ) : (
        <DriverInitialsAvatar first={drv?.givenName} last={drv?.familyName} color={color.primary} />
      )}

      {/* Left gradient overlay */}

      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'linear-gradient(95deg, rgba(10,10,13,0.97) 32%, rgba(10,10,13,0.25) 65%, transparent 100%)',
      }} />

      {/* Content layer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 4,
        padding: '16px 16px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        width: '60%',
      }}>
        {/* Top row: position + flag + number badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {/* Position bubble */}
          <div style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: posColors[pos] ? posBgs[pos] : 'rgba(255,255,255,0.06)',
            border: `1px solid ${posColors[pos] ? posColors[pos] + '30' : 'rgba(255,255,255,0.08)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: pos <= 3 ? 13 : 10, fontWeight: 900,
            color: posColors[pos] || 'rgba(255,255,255,0.35)',
          }}>
            {pos <= 3 ? ['1','2','3'][pos - 1] : pos}
          </div>

          {/* Flag */}
          <img src={flag} alt="" style={{ width: 20, borderRadius: 3, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />

          {/* Number badge */}
          <div style={{
            background: `${color.primary}18`,
            border: `1px solid ${color.primary}30`,
            borderRadius: 7, padding: '2px 7px',
            fontSize: 10, fontWeight: 900, color: color.primary,
          }}>
            #{drv?.permanentNumber}
          </div>
        </div>

        {/* Name + team */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 400,
            color: 'rgba(255,255,255,0.4)', lineHeight: 1.2,
          }}>
            {drv?.givenName}
          </div>
          <div style={{
            fontSize: 20, fontWeight: 900, letterSpacing: -0.6,
            color: 'white', lineHeight: 1.1,
          }}>
            {drv?.familyName}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            marginTop: 8, padding: '3px 9px', borderRadius: 99,
            background: color.bg, border: `1px solid ${color.primary}25`,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: color.primary }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: color.primary }}>{team?.name}</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <div style={{
              fontSize: 28, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1,
              color: pos === 1 ? color.primary : 'white',
            }}>
              {item.points}
            </div>
            <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Puan
            </div>
          </div>
          {parseInt(item.wins) > 0 && (
            <div>
              <div style={{
                fontSize: 28, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1,
                color: '#FFD700',
              }}>
                {item.wins}
              </div>
              <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,215,0,0.3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Zafer
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Arrow hint */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12, zIndex: 6,
        width: 28, height: 28, borderRadius: 8,
        background: hovered ? `${color.primary}20` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${hovered ? color.primary + '30' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color: hovered ? color.primary : 'rgba(255,255,255,0.2)',
        transition: 'all 0.2s',
      }}>→</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function Drivers() {
  const { standings, loading, error } = useDriverStandings();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const teams    = [...new Set(standings.map(s => s.Constructors?.[0]?.name).filter(Boolean))];
  const filtered = filter === 'all'
    ? standings
    : standings.filter(s => s.Constructors?.[0]?.name === filter);

  if (loading) return (
    <div className="page-content"><div className="container">
      <div className="page-header"><h1>Sürücüler</h1></div>
      <LoadingSpinner text="Sürücü verileri yükleniyor..." />
    </div></div>
  );
  if (error) return (
    <div className="page-content"><div className="container">
      <div className="page-header"><h1>Sürücüler</h1></div>
      <ErrorMessage message={error} />
    </div></div>
  );

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <div className="page-title-row">
            <h1>Sürücüler</h1>
            <span className="page-chip">2026 · {standings.length} Sürücü</span>
          </div>
          <p>Tıkla → 2026 &amp; kariyer istatistikleri · Araç görünümü</p>
        </div>

        {/* ── Takım filtresi ── */}
        <div style={{
          display: 'flex', gap: 7, flexWrap: 'wrap',
          marginBottom: 24, overflowX: 'auto', paddingBottom: 4,
        }}>
          {['all', ...teams].map(t => {
            const tc = t === 'all' ? null : getTeamColor(t);
            const active = filter === t;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 99,
                  border: '1px solid',
                  borderColor: active ? (tc?.primary || 'rgba(255,255,255,0.35)') : 'rgba(255,255,255,0.08)',
                  background: active ? (tc?.bg || 'rgba(255,255,255,0.07)') : 'transparent',
                  color: active ? (tc?.primary || 'white') : 'rgba(255,255,255,0.3)',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s', fontFamily: 'var(--font)',
                  whiteSpace: 'nowrap',
                  boxShadow: active ? `0 0 12px ${tc?.primary || 'rgba(255,255,255,0.1)'}30` : 'none',
                }}
              >
                {t === 'all' ? 'Tümü' : t}
              </button>
            );
          })}
        </div>

        {/* ── Driver grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))',
          gap: 14, marginBottom: 44,
        }}>
          {filtered.map(item => (
            <DriverCard
              key={item.Driver?.driverId}
              item={item}
              onClick={() => setSelected(item)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <DriverModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
