import React, { useState, useEffect } from 'react';
import { getFlagUrl } from '../utils/formatters';
import { getTeamColor } from '../utils/teamColors';
import { getDriverImageUrlLarge, getDriverPortraitUrl, getDriverInitials, getDriverNumberArtUrl } from '../utils/driverImages';
import { useDriverCareerStats } from '../hooks/useDriverStats';
import { useAuth } from '../contexts/AuthContext';
import Icon from './common/Icon';

// ─── Sampiyonluk yillari ───────────────────────────────────────────
const DRIVER_CHAMPIONSHIPS = {
  'hamilton':        { count: 7,  years: [2008, 2014, 2015, 2017, 2018, 2019, 2020] },
  'max_verstappen':  { count: 4,  years: [2021, 2022, 2023, 2024] },
  'vettel':          { count: 4,  years: [2010, 2011, 2012, 2013] },
  'alonso':          { count: 2,  years: [2005, 2006] },
  'schumacher':      { count: 5,  years: [2000, 2001, 2002, 2003, 2004] },
  'raikkonen':       { count: 1,  years: [2007] },
  'button':          { count: 1,  years: [2009] },
  'rosberg':         { count: 1,  years: [2016] },
  'senna':           { count: 3,  years: [1988, 1990, 1991] },
  'prost':           { count: 4,  years: [1985, 1986, 1989, 1993] },
  'lauda':           { count: 3,  years: [1975, 1977, 1984] },
  'piquet':          { count: 3,  years: [1981, 1983, 1987] },
  'mansell':         { count: 1,  years: [1992] },
  'hill':            { count: 1,  years: [1996] },
  'villeneuve':      { count: 1,  years: [1997] },
  'hakkinen':        { count: 2,  years: [1998, 1999] },
  'leclerc':         null,
  'norris':          { count: 1, years: [2025] },
  'piastri':         null,
  'russell':         null,
  'antonelli':       null,
  'sainz':           null,
  'albon':           null,
  'gasly':           null,
  'colapinto':       null,
  'ocon':            null,
  'bearman':         null,
  'stroll':          null,
  'hulkenberg':      null,
  'bortoleto':       null,
  'lawson':          null,
  'tsunoda':         null,
  'hadjar':          null,
  'perez':           null,
  'bottas':          null,
};

// ─── En iyi pistleri (En cok kazandigi/basarili oldugu pistler) ────
const DRIVER_BEST_TRACKS = {
  'hamilton':       [{t:'Silverstone', w:8}, {t:'Hungaroring', w:8}, {t:'Gilles Villeneuve', w:7}, {t:'Shanghai', w:6}, {t:'Barcelona', w:6}],
  'max_verstappen': [{t:'Red Bull Ring', w:4}, {t:'Hermanos Rodríguez', w:5}, {t:'Zandvoort', w:3}, {t:'Spa', w:3}, {t:'Abu Dhabi', w:4}],
  'alonso':         [{t:'Bahrain', w:3}, {t:'Hockenheim', w:3}, {t:'Sepang', w:3}, {t:'Monza', w:2}, {t:'Barcelona', w:2}],
  'leclerc':        [{t:'Monza', w:2}, {t:'Monaco', w:1}, {t:'Spa', w:1}, {t:'Albert Park', w:1}, {t:'COTA', w:1}],
  'norris':         [{t:'Miami', w:1}, {t:'Zandvoort', w:1}, {t:'Marina Bay', w:1}, {t:'Interlagos', w:1}],
  'piastri':        [{t:'Hungaroring', w:1}, {t:'Baku', w:1}],
  'sainz':          [{t:'Silverstone', w:1}, {t:'Marina Bay', w:1}, {t:'Albert Park', w:1}, {t:'Hermanos Rodríguez', w:1}],
  'russell':        [{t:'Interlagos', w:1}, {t:'Red Bull Ring', w:1}, {t:'Spa', w:1}, {t:'Las Vegas', w:1}],
};

// ─── Animated counter ───────────────────────────────────────────────
function AnimCounter({ to, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) return;
    const start = performance.now();
    const n = parseInt(to) || 0;
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * n));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <>{val}</>;
}

// ─── Bar chart for season results ───────────────────────────────────
function SeasonChart({ races, color }) {
  if (!races?.length) return null;
  const maxPos = 20;
  
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        2026 Yarış Sonuçları
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52 }}>
        {races.map((race, i) => {
          const pos = parseInt(race.Results?.[0]?.position || 20);
          const pts = parseInt(race.Results?.[0]?.points || 0);
          const h = Math.round(((maxPos - pos + 1) / maxPos) * 100);
          const isPodium = pos <= 3;
          const isWin = pos === 1;
          
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }} title={`${race.raceName}: P${pos} (${pts}pts)`}>
              <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 44 }}>
                <div style={{
                  width: '100%',
                  height: `${h}%`,
                  minHeight: 4,
                  borderRadius: '3px 3px 0 0',
                  background: isWin
                    ? '#FFD700'
                    : isPodium
                    ? color
                    : `${color}55`,
                  boxShadow: isWin ? `0 0 8px #FFD70060` : isPodium ? `0 0 6px ${color}40` : 'none',
                  transition: 'all 0.3s',
                }}/>
              </div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: 0 }}>
                R{race.round}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Driver avatar fallback ──────────────────────────────────────────
function DriverAvatar({ firstName, lastName, color, size = 180 }) {
  const initials = getDriverInitials(firstName, lastName);
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}30, ${color}08)`,
      border: `2px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 900, fontStyle: 'italic',
      color: color, opacity: 0.7,
      letterSpacing: -4,
    }}>
      {initials}
    </div>
  );
}

// ─── Main modal ─────────────────────────────────────────────────────
export default function DriverModal({ item, onClose }) {
  // Hero: real face portrait (DAM) with standing cutout as fallback
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [cutoutFailed, setCutoutFailed]     = useState(false);
  const [view, setView] = useState('season');

  const drv   = item?.Driver;
  const team  = item?.Constructors?.[0];
  const color = getTeamColor(team?.name);
  const pos   = parseInt(item?.position || 99);
  const flag  = getFlagUrl(drv?.nationality);

  // Prefer portrait (real photo with background), fall back to standing cutout
  const portraitUrl = getDriverPortraitUrl(drv?.driverId);
  const cutoutUrl   = getDriverImageUrlLarge(drv?.driverId);

  const heroUrl    = !portraitFailed && portraitUrl ? portraitUrl : (!cutoutFailed ? cutoutUrl : null);
  const isPortrait = !portraitFailed && !!portraitUrl;

  const { stats, seasonRaces, loading: statsLoading } = useDriverCareerStats(drv?.driverId);
  const { user, updateProfile, openAuth } = useAuth();

  const isFav = user?.favDrivers?.includes(drv?.driverId);
  const canAdd = (user?.favDrivers?.length || 0) < 3;

  const handleToggleFav = (e) => {
    e.stopPropagation();
    if (!user) { openAuth(); return; }
    const cur = user.favDrivers || [];
    if (isFav) updateProfile({ favDrivers: cur.filter(x => x !== drv?.driverId) });
    else updateProfile({ favDrivers: [...cur, drv?.driverId] });
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  if (!item) return null;

  const seasonStats = [
    { icon: 'R', label: 'Yarış',   val: seasonRaces.length || '—' },
    { icon: 'W', label: 'Zafer',   val: parseInt(item.wins) },
    { icon: 'P', label: 'Podyum',
      val: seasonRaces.filter(r => parseInt(r.Results?.[0]?.position||99) <= 3).length || '—' },
    { icon: 'Q', label: 'Pole',
      val: '—' /* season poles need separate API call */ },
  ];

  const careerStats = [
    { icon: 'W', label: 'Zafer',     val: stats?.wins,    big: true },
    { icon: 'P', label: 'Podyum',    val: stats?.podiums, big: true },
    { icon: 'Q', label: 'Pole',      val: stats?.poles,   big: true },
    { icon: 'R', label: 'Yarış',     val: stats?.starts,  big: false },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.90)',
        backdropFilter: 'blur(24px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'bbFadeIn 0.22s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: '#0A0A0D',
          border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 28,
          overflow: 'hidden',
          animation: 'bbSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* ── HERO ── */}
        <div style={{
          height: 340, position: 'relative', overflow: 'hidden', flexShrink: 0,
          background: `linear-gradient(150deg, ${color.bg} 0%, #060608 65%)`,
        }}>
          {/* Color top stripe */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color.primary, boxShadow:`0 0 20px ${color.primary}`, zIndex:10 }} />


          {/* Close */}
          <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif', lineHeight:1, transition:'all 0.2s' }}>✕</button>

          {/* Fav star */}
          {(isFav || canAdd) && (
            <button onClick={handleToggleFav} style={{ position:'absolute', top:14, right:54, zIndex:10, width:32, height:32, borderRadius:'50%', background: isFav ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.07)', border:`1px solid ${isFav ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)'}`, color: isFav ? '#FFD700' : 'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
              <Icon name="star" size={14} color="currentColor" />
            </button>
          )}

          {/* Number art — team-font ghost number */}
          {(() => {
            const artUrl = getDriverNumberArtUrl(drv?.driverId);
            if (!artUrl) return null;
            return (
              <img
                src={artUrl}
                alt=""
                style={{
                  position: 'absolute',
                  right: -30, bottom: -10,
                  height: '115%', width: 'auto',
                  objectFit: 'contain',
                  opacity: 0.10, zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
            );
          })()}

          {/* Portrait / hero photo */}
          {heroUrl ? (
            <img
              key={heroUrl}
              src={heroUrl}
              alt={`${drv?.givenName} ${drv?.familyName}`}
              onError={() => {
                if (isPortrait) setPortraitFailed(true);
                else setCutoutFailed(true);
              }}
              style={{
                position: 'absolute',
                right: 0, top: 0,
                width: isPortrait ? '58%' : 'auto',
                height: isPortrait ? '100%' : '160%',
                objectFit: isPortrait ? 'cover' : 'contain',
                objectPosition: isPortrait ? 'center top' : 'top center',
                zIndex: 2,
                WebkitMaskImage: isPortrait
                  ? 'linear-gradient(90deg, transparent 0%, black 22%)'
                  : 'linear-gradient(100deg, transparent 0%, black 20%)',
                maskImage: isPortrait
                  ? 'linear-gradient(90deg, transparent 0%, black 22%)'
                  : 'linear-gradient(100deg, transparent 0%, black 20%)',
                filter: `brightness(0.92) contrast(1.05) drop-shadow(-12px 0 32px rgba(0,0,0,0.95))`,
              }}
            />
          ) : (
            <div style={{ position: 'absolute', right: 20, bottom: 20, zIndex: 2 }}>
              <DriverAvatar firstName={drv?.givenName} lastName={drv?.familyName} color={color.primary} size={130} />
            </div>
          )}

          {/* 🏳️ FLAG SILHOUETTE — LEFT side, mirroring number art on right */}
          {flag && (
            <img
              src={flag}
              alt=""
              style={{
                position: 'absolute',
                left: -30,
                top: '-15%',
                width: '62%',
                height: '130%',
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: 0.07,
                filter: 'grayscale(100%) brightness(0.25) contrast(3.5) saturate(0)',
                zIndex: 4,   // above gradient (3), below text (5)
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Left gradient — text-readable side */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3,
            background: isPortrait
              ? 'linear-gradient(90deg, rgba(6,6,8,1) 0%, rgba(6,6,8,0.97) 32%, rgba(6,6,8,0.8) 48%, rgba(6,6,8,0.3) 64%, transparent 100%)'
              : 'linear-gradient(100deg, rgba(6,6,8,0.99) 28%, rgba(6,6,8,0.72) 52%, rgba(6,6,8,0.10) 76%, transparent 100%)',
          }} />

          {/* Team color ambient glow */}
          <div style={{
            position: 'absolute', right: 0, bottom: 0, width: '55%', height: '100%', zIndex: 0,
            background: `radial-gradient(ellipse 80% 70% at 85% 65%, ${color.primary}22, transparent)`,
          }} />

          {/* Kapat butonu */}
          <button onClick={onClose} style={{
            position:'absolute', top:14, left:14, zIndex:15,
            width:34, height:34, borderRadius:'50%',
            background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)',
            color:'white', fontSize:18, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1,
          }}>‹</button>

          {/* Sol metin katmani */}
          <div style={{
            position:'absolute', top:0, left:0, bottom:0, zIndex:5,
            padding:'50px 22px 20px',
            display:'flex', flexDirection:'column', justifyContent:'space-between',
            width:'58%',
          }}>
            {/* Milliyet */}
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <img src={flag} alt="" style={{ width:22, borderRadius:3 }} onError={e=>e.target.style.display='none'} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>
                {drv?.nationality}
              </span>
            </div>

            {/* Isim */}
            <div>
              <div style={{ fontSize:15, fontWeight:300, color:'rgba(255,255,255,0.55)', lineHeight:1.1 }}>{drv?.givenName}</div>
              <div style={{ fontSize:28, fontWeight:900, letterSpacing:-1.2, color:'white', lineHeight:1 }}>{drv?.familyName}</div>

              {/* Sampiyonluk rozeti */}
              {DRIVER_CHAMPIONSHIPS[drv?.driverId]?.count > 0 && (
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:6, marginTop:8,
                  background:'rgba(255,215,0,0.12)', border:'1px solid rgba(255,215,0,0.3)',
                  borderRadius:10, padding:'4px 12px',
                }}>
                  <span style={{ fontSize:13, fontWeight:900, color:'#FFD700' }}>WDC</span>
                  <span style={{ fontSize:13, fontWeight:900, color:'#FFD700', letterSpacing:-0.3 }}>
                    {DRIVER_CHAMPIONSHIPS[drv?.driverId].count}× Dunya Sampiyonu
                  </span>
                </div>
              )}

              {/* Numara badge */}
              <div style={{
                display:'inline-flex', alignItems:'center',
                background:`${color.primary}14`, border:`1px solid ${color.primary}35`,
                borderRadius:10, padding:'3px 12px', marginTop:8, marginLeft: DRIVER_CHAMPIONSHIPS[drv?.driverId]?.count > 0 ? 6 : 0,
              }}>
                <span style={{ fontSize:20, fontWeight:900, letterSpacing:-1, color:color.primary, lineHeight:1 }}>#{drv?.permanentNumber}</span>
              </div>

              {/* Takim */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:color.primary, boxShadow:`0 0 8px ${color.primary}` }} />
                <span style={{ fontSize:11, fontWeight:700, color:color.primary }}>{team?.name}</span>
              </div>
            </div>

            {/* POS + PUAN */}
            <div style={{ display:'flex', gap:0 }}>
              <div style={{ paddingRight:16 }}>
                <div style={{ fontSize:40, fontWeight:900, letterSpacing:-3, lineHeight:1, color: pos<=3 ? color.primary : 'white' }}>
                  {String(pos).padStart(2,'0')}
                </div>
                <div style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:1, marginTop:2 }}>POS</div>
              </div>
              <div style={{ width:1, background:'rgba(255,255,255,0.1)', margin:'0 16px 0 0' }} />
              <div>
                <div style={{ fontSize:40, fontWeight:900, letterSpacing:-3, lineHeight:1, color:'white' }}>{item.points}</div>
                <div style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:1, marginTop:2 }}>PUAN</div>
              </div>
            </div>
          </div>
        </div>


        {/* ── SEASON / CAREER TOGGLE ── */}


        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 4,
          background: 'rgba(0,0,0,0.3)',
        }}>
          {['season', 'career'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 12,
                border: 'none', cursor: 'pointer',
                background: view === v ? `${color.primary}18` : 'transparent',
                color: view === v ? color.primary : 'rgba(255,255,255,0.35)',
                fontSize: 12, fontWeight: 800,
                fontFamily: 'var(--font)',
                textTransform: 'uppercase', letterSpacing: 0.5,
                transition: 'all 0.15s',
                boxShadow: view === v ? `inset 0 0 0 1px ${color.primary}30` : 'none',
              }}
            >
              {v === 'season' ? '2026 Sezonu' : 'Kariyer'}
            </button>
          ))}
        </div>

        {/* ── STATS GRID ── */}
        <div style={{ padding: '18px 18px' }}>
          {view === 'season' ? (
            <>
              {/* Season stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  { icon: 'R', label: 'Yarış', val: seasonRaces.length },
                  { icon: 'W', label: 'Zafer', val: parseInt(item.wins) },
                  { icon: 'P', label: 'Podyum', val: seasonRaces.filter(r => parseInt(r.Results?.[0]?.position||99) <= 3).length },
                  { icon: '↑', label: 'Şampiyonluk', val: `P${pos}` },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14, padding: '14px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 900, width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.primary, flexShrink: 0 }}>{s.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 22, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1,
                        color: s.label === 'Şampiyonluk' ? color.primary : 'white',
                      }}>{s.val}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Season chart */}
              {seasonRaces.length > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, padding: '14px 14px 10px',
                }}>
                  <SeasonChart races={seasonRaces} color={color.primary} />
                </div>
              )}

              {/* Points progress */}
              <div style={{
                marginTop: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Şampiyonluk İlerlemesi</div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${color.primary}, ${color.primary}80)`,
                      width: `${Math.min((parseInt(item.points) / 400) * 100, 100)}%`,
                      boxShadow: `0 0 8px ${color.primary}60`,
                      transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
                    }}/>
                  </div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 900, color: color.primary }}>{item.points}</span>
              </div>
            </>
          ) : (
            /* Career stats */
            <>
              {statsLoading ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: `2px solid rgba(255,255,255,0.08)`,
                    borderTopColor: color.primary,
                    animation: 'bbSpin 0.8s linear infinite',
                    margin: '0 auto 10px',
                  }}/>
                  Kariyer verileri yükleniyor...
                </div>
              ) : (
                <>
                  {/* Big 4 career stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
                    {[
                      { icon: 'W', label: 'Galibiyetler', val: stats?.wins,    highlight: true },
                      { icon: 'P', label: 'Podyumlar',    val: stats?.podiums, highlight: false },
                      { icon: 'Q', label: 'Pole Pozisyonu', val: stats?.poles, highlight: false },
                      { icon: 'R', label: 'Yarış Girişi', val: stats?.starts,  highlight: false },
                    ].map(s => (
                      <div key={s.label} style={{
                        background: s.highlight ? `${color.bg}` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${s.highlight ? color.primary + '25' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 14, padding: '16px',
                      }}>
                        <div style={{ fontSize: 16, fontWeight: 900, width: 36, height: 36, borderRadius: 10, background: s.highlight ? `${color.primary}18` : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.highlight ? color.primary : 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.icon}</div>
                        <div style={{
                          fontSize: 34, fontWeight: 900, letterSpacing: -2, lineHeight: 1,
                          color: s.highlight ? color.primary : 'white',
                        }}>
                          <AnimCounter to={s.val} duration={1000} />
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Additional info */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14, padding: '14px',
                    display: 'flex', justifyContent: 'space-around',
                  }}>
                    {[
                      { label: 'D. Tarihi', val: drv?.dateOfBirth?.split('T')[0] || '—' },
                      { label: 'Uyruk',     val: drv?.nationality || '—' },
                      { label: 'Numara',    val: `#${drv?.permanentNumber || '—'}` },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{s.val}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Sampiyonluk yillari - sadece sampiyonlara */}
                  {DRIVER_CHAMPIONSHIPS[drv?.driverId]?.count > 0 && (
                    <div style={{
                      marginTop:8, background:'rgba(255,215,0,0.05)',
                      border:'1px solid rgba(255,215,0,0.15)',
                      borderRadius:14, padding:'14px',
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                        <span style={{ fontSize:13, fontWeight:900, color:'#FFD700', width:32, height:32, borderRadius:8, background:'rgba(255,215,0,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>WDC</span>
                        <div>
                          <div style={{ fontSize:11, fontWeight:800, color:'#FFD700' }}>
                            {DRIVER_CHAMPIONSHIPS[drv.driverId].count}× DUNYA SAMPIYONU
                          </div>
                          <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 }}>Formula 1 Dunya Sampiyonasi</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {DRIVER_CHAMPIONSHIPS[drv.driverId].years.map(y => (
                          <div key={y} style={{
                            background:'rgba(255,215,0,0.12)', border:'1px solid rgba(255,215,0,0.25)',
                            borderRadius:8, padding:'4px 12px',
                            fontSize:12, fontWeight:900, color:'#FFD700', letterSpacing:-0.3,
                          }}>{y}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Galibiyet orani */}
                  {stats?.starts > 0 && (
                    <div style={{
                      marginTop: 8,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 14, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                          Galibiyet Oranı
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: color.primary }}>
                          {((stats.wins / stats.starts) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          background: `linear-gradient(90deg, ${color.primary}, ${color.primary}80)`,
                          width: `${(stats.wins / stats.starts) * 100}%`,
                          boxShadow: `0 0 8px ${color.primary}60`,
                          transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
                        }}/>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>Podyum: {stats.podiums} ({((stats.podiums / stats.starts) * 100).toFixed(0)}%)</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>Pole: {stats.poles} ({((stats.poles / stats.starts) * 100).toFixed(0)}%)</span>
                      </div>
                    </div>
                  )}

                  {/* En Iyi Oldugu Pistler */}
                  {DRIVER_BEST_TRACKS[drv?.driverId] && (
                    <div style={{
                      marginTop: 8,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 14, padding: '14px',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        En İyi Olduğu Pistler
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {DRIVER_BEST_TRACKS[drv.driverId].map((track, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{track.t}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 900, color: '#FFD700' }}>{track.w}</span>
                              <span style={{ fontSize: 9, color: 'rgba(255,215,0,0.5)', textTransform: 'uppercase' }}>Zafer</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Bottom padding */}
        <div style={{ height: 8 }}/>
      </div>

      <style>{`
        @keyframes bbFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes bbSlideUp { from{transform:translateY(50px) scale(0.93);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
        @keyframes bbSpin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
