import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDriverStandings, useConstructorStandings } from '../hooks/useJolpica';
import { useAuth } from '../contexts/AuthContext';
import { getTeamColor } from '../utils/teamColors';
import { getFlagUrl } from '../utils/formatters';
import { getDriverImageUrl, getDriverPortraitUrl, getTeamLogoUrl } from '../utils/driverImages';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const BUDGET = 100;

// ─── Driver prestige — historical quality / star power ────────────────
// Independent of current-season standings.
// Verstappen = peak prestige (4x WDC, era-defining), rest ordered realistically.
const DRIVER_PRESTIGE = {
  'max_verstappen': { price: 42, rating: 99, tier: 'S' }, // 4x WDC, era-defining
  'hamilton':       { price: 40, rating: 97, tier: 'S' }, // 7x WC — Ferrari move
  'leclerc':        { price: 37, rating: 95, tier: 'S' }, // Ferrari #1
  'norris':         { price: 35, rating: 93, tier: 'S' }, // McLaren ace
  'piastri':        { price: 33, rating: 91, tier: 'S' }, // McLaren rising
  'russell':        { price: 30, rating: 88, tier: 'A' }, // Mercedes #1
  'antonelli':      { price: 28, rating: 85, tier: 'A' }, // Merc junior
  'alonso':         { price: 26, rating: 84, tier: 'A' }, // 2x WC legend
  'sainz':          { price: 24, rating: 82, tier: 'A' }, // Multiple wins
  'lawson':         { price: 20, rating: 78, tier: 'A' }, // Red Bull #2
  'hadjar':         { price: 17, rating: 76, tier: 'B' },
  'tsunoda':        { price: 15, rating: 73, tier: 'B' },
  'gasly':          { price: 14, rating: 72, tier: 'B' },
  'albon':          { price: 13, rating: 70, tier: 'B' },
  'hulkenberg':     { price: 12, rating: 69, tier: 'B' },
  'colapinto':      { price: 10, rating: 65, tier: 'C' },
  'bearman':        { price: 10, rating: 64, tier: 'C' },
  'bortoleto':      { price: 9,  rating: 62, tier: 'C' },
  'stroll':         { price: 8,  rating: 60, tier: 'C' },
  'ocon':           { price: 7,  rating: 58, tier: 'C' },
  'perez':          { price: 6,  rating: 55, tier: 'C' },
  'bottas':         { price: 5,  rating: 52, tier: 'C' },
};

// Tier badge color
const TIER_COLOR = { S: '#FFD700', A: '#00D2BE', B: '#FF8000', C: 'rgba(255,255,255,0.4)' };

// Blend prestige rating with current-season performance (+/-5)
function getDriverPrice(driverId, standingsPosition) {
  const prestige = DRIVER_PRESTIGE[driverId?.toLowerCase()];
  if (prestige) return prestige.price;
  // fallback for unknown drivers
  const prices = [28, 25, 22, 20, 18, 16, 14, 12, 10, 8, 7, 6, 5, 5, 4, 4, 4, 4, 4, 4];
  return prices[Math.min((standingsPosition || 20) - 1, prices.length - 1)] || 4;
}

function getDriverRating(driverId, standingsPosition, points) {
  const prestige = DRIVER_PRESTIGE[driverId?.toLowerCase()];
  if (prestige) {
    // Tiny bonus/penalty based on current season position
    const posDelta = Math.max(0, 10 - (standingsPosition || 20)); // 0-9
    return Math.min(prestige.rating + Math.floor(posDelta * 0.4), 99);
  }
  // fallback
  const base = [90, 86, 82, 78, 74, 70, 65, 60, 55, 50, 46, 42, 38, 35, 32, 29, 26, 24, 22, 20];
  return base[Math.min((standingsPosition || 20) - 1, base.length - 1)] || 20;
}

function getDriverTier(driverId) {
  return DRIVER_PRESTIGE[driverId?.toLowerCase()]?.tier || 'C';
}

function getTeamRating(position, points) {
  const pts = parseInt(points) || 0;
  const baseByPos = [99, 95, 91, 86, 80, 74, 68, 60, 52, 44, 36];
  const base = baseByPos[Math.min(position - 1, baseByPos.length - 1)] || 36;
  const bonus = Math.min(Math.floor(pts / 40), 5);
  return Math.min(base + bonus, 99);
}

function getTeamPrice(position) {
  const prices = [38, 34, 29, 25, 22, 19, 16, 13, 10, 8];
  return prices[Math.min(position - 1, prices.length - 1)] || 6;
}

// ─── Rating bar ────────────────────────────────────────────────────────
function RatingBar({ rating, color }) {
  const getColor = (r) => {
    if (r >= 90) return '#FFD700';
    if (r >= 80) return '#00D2BE';
    if (r >= 65) return '#FF8000';
    return 'rgba(255,255,255,0.3)';
  };
  const c = color || getColor(rating);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: c, width: `${rating}%`, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 9, fontWeight: 900, color: c, minWidth: 20, textAlign: 'right' }}>{rating}</span>
    </div>
  );
}

// ─── Driver selection card ─────────────────────────────────────────────
function DriverSlot({ item, selected, onToggle, budget, spent }) {
  const drv = item.Driver;
  const team = item.Constructors?.[0];
  const color = getTeamColor(team?.name);
  const portraitUrl = getDriverPortraitUrl(drv?.driverId);
  const isStanding = !portraitUrl;
  const img = portraitUrl || getDriverImageUrl(drv?.driverId);
  const flag = getFlagUrl(drv?.nationality);
  const pos = parseInt(item.position);
  const price = getDriverPrice(drv?.driverId, pos);
  const rating = getDriverRating(drv?.driverId, pos, item.points);
  const tier = getDriverTier(drv?.driverId);
  const tierColor = TIER_COLOR[tier];
  const isSelected = selected.some(s => s.id === drv?.driverId);
  const canAfford = (budget - spent + (isSelected ? price : 0)) >= price;
  const isDisabled = !isSelected && (!canAfford || selected.length >= 2);

  return (
    <div
      onClick={() => !isDisabled && onToggle({ id: drv?.driverId, name: drv?.familyName, fullName: `${drv?.givenName} ${drv?.familyName}`, price, pos, points: item.points, rating, teamName: team?.name, tier })}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 14, cursor: isDisabled ? 'default' : 'pointer',
        background: isSelected ? `linear-gradient(135deg, ${color.bg}, #0a0a0d)` : '#0D0D10',
        border: `1px solid ${isSelected ? color.primary + '60' : 'rgba(255,255,255,0.07)'}`,
        opacity: isDisabled ? 0.32 : 1,
        transition: 'all 0.2s', height: 100,
        boxShadow: isSelected ? `0 8px 24px ${color.primary}18` : 'none',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: isSelected ? color.primary : 'transparent', borderRadius: '3px 0 0 3px' }} />
      {img && (
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: isStanding ? '50%' : '42%', overflow: 'hidden', opacity: isSelected ? 0.9 : 0.25 }}>
          <img src={img} alt="" style={isStanding ? { position: 'absolute', right: -15, top: 10, height: '150%', width: '150%', objectFit: 'cover', objectPosition: 'top center' } : { position: 'absolute', right: -10, bottom: -4, height: '140%', width: 'auto', objectFit: 'contain', objectPosition: 'bottom' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #0D0D10 0%, transparent 55%)' }} />
        </div>
      )}
      <div style={{ padding: '10px 12px 10px 15px', position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <img src={flag} alt="" style={{ width: 13, borderRadius: 2 }} onError={e => e.target.style.display='none'} />
            <span style={{ fontSize: 9, fontWeight: 900, color: color.primary }}>#{drv?.permanentNumber}</span>
            <span style={{ fontSize: 8, fontWeight: 900, color: tierColor, background: `${tierColor}18`, border: `1px solid ${tierColor}35`, borderRadius: 4, padding: '0px 4px', letterSpacing: 0.2 }}>{tier}</span>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginLeft: 2 }}>{team?.name}</span>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>{drv?.givenName}</div>
          <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.1 }}>{drv?.familyName}</div>
        </div>
        <div>
          <RatingBar rating={rating} color={isSelected ? color.primary : tierColor} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: isSelected ? '#FFD700' : 'rgba(255,255,255,0.6)' }}>${price}M</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{item.points} puan</span>
          </div>
        </div>
      </div>
      {isSelected && (
        <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: color.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: 'white', zIndex: 3 }}>✓</div>
      )}
    </div>
  );
}

// ─── Team selection card ──────────────────────────────────────────────
function TeamSlot({ item, selected, onToggle, budget, spent }) {
  const team = item.Constructor;
  const color = getTeamColor(team?.name);
  const logo = getTeamLogoUrl(team?.name);
  const price = getTeamPrice(parseInt(item.position));
  const rating = getTeamRating(parseInt(item.position), item.points);
  const isSelected = selected?.id === team?.constructorId;
  const canAfford = (budget - spent + (isSelected ? price : 0)) >= price;
  const isDisabled = !isSelected && (!canAfford || selected);

  return (
    <div
      onClick={() => !isDisabled && onToggle(isSelected ? null : { id: team?.constructorId, name: team?.name, price, points: item.points, rating })}
      style={{
        display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 14px',
        borderRadius: 12, cursor: isDisabled ? 'default' : 'pointer',
        background: isSelected ? `${color.bg}` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isSelected ? color.primary + '50' : 'rgba(255,255,255,0.07)'}`,
        opacity: isDisabled ? 0.3 : 1, transition: 'all 0.2s',
        boxShadow: isSelected ? `0 4px 16px ${color.primary}12` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 3, height: 28, borderRadius: 99, background: isSelected ? color.primary : 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        {logo ? <img src={logo} alt={team?.name} style={{ height: 16, objectFit: 'contain', opacity: isSelected ? 1 : 0.5 }} onError={e => e.target.style.display='none'} /> : null}
        <span style={{ fontSize: 12, fontWeight: 800, flex: 1 }}>{team?.name}</span>
        <span style={{ fontSize: 11, fontWeight: 900, color: isSelected ? '#FFD700' : 'rgba(255,255,255,0.4)' }}>${price}M</span>
        {isSelected && <span style={{ fontSize: 14, color: color.primary }}>✓</span>}
      </div>
      <RatingBar rating={rating} color={isSelected ? color.primary : undefined} />
    </div>
  );
}

// ─── Season Simulator ─────────────────────────────────────────────────
const CIRCUITS_26 = [
  'Avustralya','Çin','Japonya','Bahreyn','Suudi Arabistan','Miami',
  'İmola','Monako','Kanada','İspanya','Avusturya','İngiltere',
  'Belçika','Macaristan','Hollanda','İtalya','Azerbaycan','Singapur',
  'Teksas','Meksika','Brezilya','Las Vegas','Katar','Abu Dabi'
];

function runRace(drivers, teamPick, allDrivers, allTeams, raceIdx) {
  // Each driver gets a score based on rating + randomness
  const seed = raceIdx * 7 + 13;
  const rnd = (n, s) => {
    const x = Math.sin(n * 127.1 + s * 311.7 + seed * 17.3) * 43758.5453123;
    return x - Math.floor(x);
  };

  const racers = allDrivers.map((item, i) => {
    const drv = item.Driver;
    const pos = parseInt(item.position);
    const rating = getDriverRating(drv?.driverId, pos, item.points);
    const luck = (rnd(i, raceIdx) - 0.5) * 30;
    const score = rating + luck;
    return { id: drv?.driverId, name: drv?.familyName, score, constructorId: item.Constructors?.[0]?.constructorId };
  });

  racers.sort((a, b) => b.score - a.score);

  const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  let fantasyPoints = 0;
  const results = [];

  racers.forEach((r, i) => {
    const pts = POINTS_TABLE[i] || 0;
    const isMyDriver = drivers.some(d => d.id === r.id);
    const isMyTeam = teamPick?.id && r.constructorId === teamPick.id;
    let fp = 0;
    if (isMyDriver) fp += pts;
    if (isMyTeam) fp += Math.floor(pts * 0.5);
    fantasyPoints += fp;
    if (isMyDriver || i < 5) {
      results.push({ pos: i + 1, name: r.name, pts, fp, isMyDriver, isMyTeam });
    }
  });

  // My drivers' final positions
  const myResults = drivers.map(d => {
    const pos = racers.findIndex(r => r.id === d.id) + 1;
    const pts = POINTS_TABLE[pos - 1] || 0;
    return { name: d.name, pos, pts };
  });

  return { fantasyPoints, myResults, top5: racers.slice(0, 5).map((r, i) => ({ ...r, pos: i + 1, pts: POINTS_TABLE[i] || 0 })) };
}

function SimulatorModal({ drivers, teamPick, allDrivers, allTeams, onClose }) {
  const [phase, setPhase] = useState('idle'); // idle | racing | done
  const [raceIdx, setRaceIdx] = useState(0);
  const [raceResults, setRaceResults] = useState([]); // [{circuit, fp, myResults}]
  const [currentResult, setCurrentResult] = useState(null);
  const [totalFP, setTotalFP] = useState(0);
  const intervalRef = useRef(null);
  const TOTAL_RACES = CIRCUITS_26.length;
  const RACE_INTERVAL = 25000 / TOTAL_RACES; // spread 25s total

  const startSim = () => {
    setPhase('racing');
    setRaceIdx(0);
    setRaceResults([]);
    setTotalFP(0);
    setCurrentResult(null);
  };

  useEffect(() => {
    if (phase !== 'racing') return;
    if (raceIdx >= TOTAL_RACES) {
      setPhase('done');
      return;
    }
    const timer = setTimeout(() => {
      const result = runRace(drivers, teamPick, allDrivers, allTeams, raceIdx);
      const entry = { circuit: CIRCUITS_26[raceIdx], ...result, raceIdx };
      setCurrentResult(entry);
      setRaceResults(prev => [...prev, entry]);
      setTotalFP(prev => prev + result.fantasyPoints);
      setRaceIdx(prev => prev + 1);
    }, RACE_INTERVAL);
    return () => clearTimeout(timer);
  }, [phase, raceIdx]);

  const teamColor = teamPick ? getTeamColor(teamPick.name) : { primary: '#E10600', bg: 'rgba(225,6,0,0.08)' };
  const progress = (raceIdx / TOTAL_RACES) * 100;

  const totalMax = TOTAL_RACES * 37.5; // rough max
  const rating = Math.min(Math.round((totalFP / totalMax) * 100), 100);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.95)',
      backdropFilter: 'blur(32px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'simFadeIn 0.22s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 560, background: '#08080C',
        border: '1px solid rgba(255,255,255,0.09)', borderRadius: 28,
        overflow: 'hidden', animation: 'simSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Sezon Simülasyonu</div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>2026 Formula 1</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Team summary */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {drivers.map(d => {
            const c = getTeamColor(d.teamName);
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: c.bg, border: `1px solid ${c.primary}30`, borderRadius: 10, padding: '5px 10px' }}>
                <div style={{ width: 3, height: 16, borderRadius: 99, background: c.primary }} />
                <span style={{ fontSize: 12, fontWeight: 800 }}>{d.name}</span>
                <span style={{ fontSize: 9, color: '#FFD700', fontWeight: 700 }}>{d.rating}</span>
              </div>
            );
          })}
          {teamPick && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: teamColor.bg, border: `1px solid ${teamColor.primary}30`, borderRadius: 10, padding: '5px 10px' }}>
              <div style={{ width: 3, height: 16, borderRadius: 99, background: teamColor.primary }} />
              <span style={{ fontSize: 12, fontWeight: 800 }}>{teamPick.name}</span>
              <span style={{ fontSize: 9, color: '#FFD700', fontWeight: 700 }}>{teamPick.rating}</span>
            </div>
          )}
        </div>

        {/* Idle state */}
        {phase === 'idle' && (() => {
          const avgRating = Math.round((drivers.reduce((a,b)=>a+b.rating, 0) + (teamPick ? teamPick.rating : 0)) / (drivers.length + (teamPick ? 1 : 0))) || 0;
          const topDriver = [...drivers].sort((a,b)=>b.rating - a.rating)[0];
          const wdcProb = topDriver ? Math.max(1, Math.min(99, Math.round(Math.pow((topDriver.rating - 75) / 21, 2) * 100))) : 0;
          const wccProb = teamPick ? Math.max(1, Math.min(99, Math.round(Math.pow((teamPick.rating - 75) / 21, 2) * 100))) : 0;

          return (
            <div style={{ padding: '30px 22px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(225,6,0,0.08)', border: '1px solid rgba(225,6,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L5 12h5l-1 6 8-10h-5l1-6z"/></svg></div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Sezon Simülasyonuna Hazır Mısın?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24, lineHeight: 1.6 }}>
                Takımınla 2026 sezonunun 24 yarışını simüle et.<br/>
                Sürücü rating'leri + şans faktörü ile gerçekçi sonuçlar.
              </div>

              {/* Takım Analizi */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px', marginBottom: 28, textAlign: 'left' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  Yapay Zeka Analizi
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Kadro Ortalaması</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#00D2BE' }}>{avgRating} OVR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>WDC (Pilotlar) Şampiyonluk Şansı</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: topDriver?.rating >= 90 ? '#FFD700' : 'white' }}>%{wdcProb}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>WCC (Takımlar) Şampiyonluk Şansı</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: teamPick?.rating >= 90 ? '#FFD700' : 'white' }}>%{wccProb}</span>
                </div>
              </div>

              <button onClick={startSim} style={{
                padding: '14px 36px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #E10600, #B00500)',
                color: 'white', fontSize: 15, fontWeight: 900, cursor: 'pointer',
                fontFamily: 'var(--font)', boxShadow: '0 8px 32px rgba(225,6,0,0.4)',
                letterSpacing: -0.3, width: '100%',
              }}>
                Simülasyonu Başlat
              </button>
            </div>
          );
        })()}

        {/* Racing phase */}
        {(phase === 'racing' || phase === 'done') && (
          <div style={{ padding: '18px 22px' }}>
            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                  {phase === 'done' ? 'Sezon Tamamlandı!' : `Yarış ${raceIdx}/${TOTAL_RACES} — ${CIRCUITS_26[raceIdx - 1] || '...'}`}
                </span>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#FFD700' }}>{totalFP} FP</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #E10600, #FF4444)', width: `${progress}%`, transition: 'width 0.4s ease', boxShadow: '0 0 10px rgba(225,6,0,0.5)' }} />
              </div>
            </div>

            {/* Current race result */}
            {currentResult && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  Son Yarış — {currentResult.circuit}
                </div>
                {currentResult.myResults.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: r.pos <= 3 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: r.pos <= 3 ? '#FFD700' : 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                      P{r.pos}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: r.pos <= 3 ? '#FFD700' : 'rgba(255,255,255,0.5)' }}>+{r.pts} pts</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Bu yarış fantasy puanı</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#00D2BE' }}>+{currentResult.fantasyPoints} FP</span>
                </div>
              </div>
            )}

            {/* Race history minimap */}
            {raceResults.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Yarış Bazlı FP</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
                  {raceResults.map((r, i) => {
                    const maxFP = Math.max(...raceResults.map(x => x.fantasyPoints), 1);
                    const h = Math.max((r.fantasyPoints / maxFP) * 100, 8);
                    return (
                      <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0', background: r.fantasyPoints >= 20 ? '#FFD700' : r.fantasyPoints >= 10 ? '#00D2BE' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s', minWidth: 2 }} title={`${r.circuit}: ${r.fantasyPoints} FP`} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Final result */}
            {phase === 'done' && (
              <div style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,215,0,0.03))', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 18, padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: totalFP >= 600 ? 'rgba(255,215,0,0.15)' : totalFP >= 400 ? 'rgba(192,199,208,0.12)' : 'rgba(205,127,50,0.12)', border: `2px solid ${totalFP >= 600 ? '#FFD700' : totalFP >= 400 ? '#B8BEC8' : '#CD7F32'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: totalFP >= 600 ? '#FFD700' : totalFP >= 400 ? '#B8BEC8' : '#CD7F32' }}>{totalFP >= 600 ? 'S' : totalFP >= 400 ? 'A' : totalFP >= 250 ? 'B' : 'C'}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>2026 Sezon Skoru</div>
                <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: -3, color: '#FFD700', lineHeight: 1, marginBottom: 8 }}>{totalFP}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>Fantasy Puan</div>

                {/* Rating */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Takım Performans Notu</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, background: rating >= 70 ? '#FFD700' : rating >= 50 ? '#00D2BE' : '#FF8000', width: `${rating}%`, transition: 'width 1.2s ease' }} />
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 900, color: rating >= 70 ? '#FFD700' : '#00D2BE', minWidth: 36 }}>{rating}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, marginTop: 8, color: rating >= 80 ? '#FFD700' : rating >= 60 ? '#00D2BE' : rating >= 40 ? '#FF8000' : 'rgba(255,255,255,0.4)' }}>
                    {rating >= 85 ? 'Efsanevi Takım!' : rating >= 70 ? 'Harika Bir Sezon!' : rating >= 55 ? 'İyi İş!' : rating >= 40 ? 'Ortalama' : 'Geliştirilmeli'}
                  </div>
                </div>

                <button onClick={startSim} style={{
                  padding: '11px 28px', borderRadius: 12, border: '1px solid rgba(255,215,0,0.3)',
                  background: 'rgba(255,215,0,0.1)', color: '#FFD700', fontSize: 13, fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}>
                  Tekrar Simüle Et
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes simFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes simSlideUp { from{transform:translateY(50px) scale(0.93);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
      `}</style>
    </div>
  );
}

// ─── Key 2026 races ────────────────────────────────────────────────────
const KEY_RACES_2026 = [
  { id: 'bahrain',   name: 'Bahrain GP',     country: 'Bahrain'   },
  { id: 'saudi',     name: 'Suudi Arabistan', country: 'Saudi Arabia' },
  { id: 'australia', name: 'Avustralya GP',   country: 'Australia' },
  { id: 'monaco',    name: 'Monaco GP',       country: 'Monaco'    },
  { id: 'silverstone', name: 'Britanya GP',  country: 'British'   },
  { id: 'monza',     name: 'İtalya GP',       country: 'Italy'     },
  { id: 'suzuka',    name: 'Japonya GP',      country: 'Japan'     },
  { id: 'usgp',      name: 'Amerika GP',      country: 'USA'       },
  { id: 'brazil',    name: 'Brezilya GP',     country: 'Brazil'    },
  { id: 'abudhabi',  name: 'Abu Dhabi GP',    country: 'Abu Dhabi' },
];

// ─── Season Prediction ─────────────────────────────────────────────────
function SeasonPrediction({ drivers: allDrivers, teams: allTeams }) {
  const STORAGE_KEY = 'pl_season_prediction_2026';
  const [pred, setPred] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  });
  const [saved, setSaved] = useState(false);
  const [expandedRace, setExpandedRace] = useState(null);

  const update = (patch) => {
    const next = { ...pred, ...patch };
    setPred(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Score: compare prediction to current standings
  const score = useMemo(() => {
    if (!allDrivers.length || !allTeams.length) return { pts: 0, max: 0, pct: 0 };
    let pts = 0;
    const maxPts = 50 + 30 + KEY_RACES_2026.length * 10;
    const wdcLeader = allDrivers[0]?.Driver?.driverId;
    const wccLeader = allTeams[0]?.Constructor?.constructorId;
    if (pred.champion && pred.champion === wdcLeader) pts += 50;
    if (pred.constructorChamp && pred.constructorChamp === wccLeader) pts += 30;
    KEY_RACES_2026.forEach(r => {
      if (pred[`race_${r.id}`] && pred[`race_${r.id}`] === wdcLeader) pts += 10;
    });
    return { pts, max: maxPts, pct: Math.round((pts / maxPts) * 100) };
  }, [pred, allDrivers, allTeams]);

  const driverOptions = allDrivers.map(item => ({
    id: item.Driver?.driverId,
    name: `${item.Driver?.givenName} ${item.Driver?.familyName}`,
    short: item.Driver?.familyName,
    num: item.Driver?.permanentNumber,
    team: item.Constructors?.[0]?.name,
    color: getTeamColor(item.Constructors?.[0]?.name).primary,
  }));

  const teamOptions = allTeams.map(item => ({
    id: item.Constructor?.constructorId,
    name: item.Constructor?.name,
    color: getTeamColor(item.Constructor?.name).primary,
  }));

  const SelectPill = ({ value, onChange, options, placeholder }) => (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      style={{
        background: value ? getTeamColor(options.find(o => o.id===value)?.team || '').bg || 'rgba(225,6,0,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${value ? (options.find(o=>o.id===value)?.color || '#E10600') + '40' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10, padding: '8px 12px',
        color: value ? 'white' : 'rgba(255,255,255,0.4)',
        fontSize: 12, fontWeight: 700, fontFamily: 'var(--font)',
        cursor: 'pointer', outline: 'none', width: '100%',
        appearance: 'none', WebkitAppearance: 'none',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.id} value={o.id}>{o.name || o.short}</option>)}
    </select>
  );

  return (
    <div>
      {/* Score card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(225,6,0,0.08), rgba(0,0,0,0))', border: '1px solid rgba(225,6,0,0.15)', borderRadius: 18, padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Tahmin Puanın</div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -2, color: score.pts > 0 ? '#FFD700' : 'rgba(255,255,255,0.3)' }}>{score.pts}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 400, marginLeft: 4 }}>/ {score.max}</span></div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Güncel sıralamayla karşılaştırılıyor</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Doğruluk</div>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: `3px solid ${score.pct > 50 ? '#FFD700' : score.pct > 20 ? '#FF8000' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: score.pct > 50 ? '#FFD700' : 'rgba(255,255,255,0.5)' }}>%{score.pct}</span>
          </div>
        </div>
      </div>

      {/* Champion picks */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Şampiyonluk Tahminleri</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Dünya Şampiyonu <span style={{ color: '#FFD700' }}>+50 puan</span></div>
            <SelectPill
              value={pred.champion}
              onChange={v => update({ champion: v })}
              options={driverOptions}
              placeholder="Pilot seç..."
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Takım Şampiyonu <span style={{ color: '#00D2BE' }}>+30 puan</span></div>
            <select
              value={pred.constructorChamp || ''}
              onChange={e => update({ constructorChamp: e.target.value })}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: pred.constructorChamp ? 'white' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', outline: 'none', width: '100%', appearance: 'none' }}>
              <option value="">Takım seç...</option>
              {teamOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Race winners */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>Yarış Galibi Tahminleri <span style={{ color: 'rgba(255,255,255,0.2)' }}>· her biri +10 puan</span></div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{KEY_RACES_2026.filter(r => pred[`race_${r.id}`]).length}/{KEY_RACES_2026.length} seçildi</div>
        </div>
        <div>
          {KEY_RACES_2026.map((race, i) => {
            const pick = pred[`race_${race.id}`];
            const pickDriver = driverOptions.find(d => d.id === pick);
            const isExpanded = expandedRace === race.id;

            return (
              <div key={race.id} style={{ borderBottom: i < KEY_RACES_2026.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div
                  onClick={() => setExpandedRace(isExpanded ? null : race.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', cursor: 'pointer', transition: 'background 0.15s', background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                >
                  <div style={{ width: 28, textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>R{i+1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{race.name}</div>
                  </div>
                  {pickDriver ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${pickDriver.color}15`, border: `1px solid ${pickDriver.color}30`, borderRadius: 8, padding: '4px 10px' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: pickDriver.color, flexShrink: 0 }}/>
                      <span style={{ fontSize: 11, fontWeight: 800, color: pickDriver.color }}>{pickDriver.short}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Seçilmedi</div>
                  )}
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>{isExpanded ? '−' : '+'}</div>
                </div>
                {isExpanded && (
                  <div style={{ padding: '0 18px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {driverOptions.map(d => (
                      <button
                        key={d.id}
                        onClick={() => { update({ [`race_${race.id}`]: d.id }); setExpandedRace(null); }}
                        style={{ padding: '7px 6px', borderRadius: 9, border: `1px solid ${pick===d.id ? d.color + '60' : 'rgba(255,255,255,0.08)'}`, background: pick===d.id ? `${d.color}18` : 'rgba(255,255,255,0.03)', color: pick===d.id ? d.color : 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s', textAlign: 'center' }}
                      >
                        {d.short}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {saved && (
        <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: '#00C882', fontWeight: 700 }}>
          Tahminler kaydedildi
        </div>
      )}
    </div>
  );
}

// ─── Fantasy Team Page ─────────────────────────────────────────────────
export default function FantasyTeam() {
  const { user, updateProfile, openAuth } = useAuth();
  const { standings: ds } = useDriverStandings();
  const { standings: cs } = useConstructorStandings();
  const [showSim, setShowSim] = useState(false);
  const [mainTab, setMainTab] = useState('fantasy'); // 'fantasy' | 'prediction'

  const saved = user?.fantasyTeam;
  const [drivers, setDrivers] = useState(saved?.drivers || []);
  const [teamPick, setTeamPick] = useState(saved?.team || null);
  const [teamName, setTeamName] = useState(saved?.teamName || 'Benim F1 Takımım');
  const [editName, setEditName] = useState(false);
  const [isSaved, setIsSaved] = useState(!!saved);

  const spent = useMemo(() =>
    drivers.reduce((a, d) => a + (d.price || 0), 0) + (teamPick?.price || 0), [drivers, teamPick]);
  const remaining = BUDGET - spent;

  const toggleDriver = (item) => {
    setDrivers(prev => {
      const exists = prev.some(d => d.id === item.id);
      if (exists) return prev.filter(d => d.id !== item.id);
      if (prev.length >= 2) return prev;
      return [...prev, item];
    });
    setIsSaved(false);
  };

  const save = () => {
    if (!user) { openAuth(); return; }
    const ft = { drivers, team: teamPick, teamName, savedAt: new Date().toISOString() };
    updateProfile({ fantasyTeam: ft });
    setIsSaved(true);
  };

  const fantasyPoints = useMemo(() => {
    const dPts = drivers.reduce((a, d) => {
      const live = ds.find(x => x.Driver?.driverId === d.id);
      return a + (parseInt(live?.points || 0));
    }, 0);
    const tPts = teamPick ? parseInt(cs.find(x => x.Constructor?.constructorId === teamPick.id)?.points || 0) : 0;
    return dPts + tPts;
  }, [drivers, teamPick, ds, cs]);

  const isComplete = drivers.length === 2 && !!teamPick;

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <div className="page-title-row">
            <h1>Fantezi</h1>
          </div>
          <p>Takım kur ve sezon tahminleri yap</p>
        </div>

        {/* ── MAIN TABS ── */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 3, marginBottom: 22 }}>
          {[['fantasy', 'Fantezi Takım'], ['prediction', 'Sezon Tahmini']].map(([id, label]) => (
            <button key={id} onClick={() => setMainTab(id)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font)', transition: 'all 0.2s', background: mainTab === id ? 'rgba(255,255,255,0.1)' : 'transparent', color: mainTab === id ? 'white' : 'rgba(255,255,255,0.4)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Prediction tab */}
        {mainTab === 'prediction' && <SeasonPrediction drivers={ds} teams={cs} />}

        {/* Fantasy tab */}
        {mainTab === 'fantasy' && (<>

        {/* Budget meter */}
        <div style={{ background: '#0A0A0D', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Kalan Bütçe</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1.5, color: remaining < 10 ? '#E10600' : remaining < 25 ? '#FF8000' : '#00D2BE' }}>
                ${remaining}M
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Canlı Puan</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1.5, color: '#FFD700' }}>{fantasyPoints}</div>
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: remaining < 10 ? '#E10600' : `linear-gradient(90deg, #00D2BE, #00D2BE80)`, width: `${(remaining / BUDGET) * 100}%`, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
            <span>Harcanan: ${spent}M</span><span>Toplam: $100M</span>
          </div>
        </div>

        {/* My team panel */}
        {(drivers.length > 0 || teamPick) && (
          <div style={{ background: 'linear-gradient(135deg, #111118, #0A0A0D)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '16px 20px', marginBottom: 20 }}>
            {/* Team name */}
            {editName ? (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input value={teamName} onChange={e => setTeamName(e.target.value)} autoFocus onKeyDown={e => { if (e.key==='Enter'||e.key==='Escape') setEditName(false); }} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '7px 12px', color: 'white', fontSize: 15, fontWeight: 900, fontFamily: 'var(--font)', outline: 'none' }} />
                <button onClick={() => setEditName(false)} style={{ background: '#E10600', border: 'none', color: 'white', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontWeight: 700 }}>✓</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 900 }}>{teamName}</span>
                <button onClick={() => setEditName(true)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 6, padding: '3px 7px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 10 }}><svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.146 9.146H2v-3.854L12.146.854zM3 12h1.293l8-8L11 2.707l-8 8V12z"/></svg></button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {drivers.map(d => {
                const live = ds.find(x => x.Driver?.driverId === d.id);
                const color = getTeamColor(live?.Constructors?.[0]?.name || d.teamName);
                return (
                  <div key={d.id} style={{ background: `${color.bg}`, border: `1px solid ${color.primary}25`, borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 3, height: 24, borderRadius: 99, background: color.primary, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 900 }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: '#FFD700' }}>{live?.points || d.points}p · ${d.price}M · {d.rating} OVR</div>
                    </div>
                    <button onClick={() => toggleDriver(d)} style={{ marginLeft: 4, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 6, padding: '2px 6px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>✕</button>
                  </div>
                );
              })}
              {teamPick && (() => {
                const color = getTeamColor(teamPick.name);
                const live = cs.find(x => x.Constructor?.constructorId === teamPick.id);
                const logo = getTeamLogoUrl(teamPick.name);
                return (
                  <div style={{ background: `${color.bg}`, border: `1px solid ${color.primary}25`, borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 3, height: 24, borderRadius: 99, background: color.primary, flexShrink: 0 }} />
                    {logo && <img src={logo} alt={teamPick.name} style={{ height: 14, objectFit: 'contain' }} onError={e => e.target.style.display='none'} />}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 900 }}>{teamPick.name}</div>
                      <div style={{ fontSize: 10, color: '#FFD700' }}>{live?.points || teamPick.points}p · ${teamPick.price}M · {teamPick.rating} OVR</div>
                    </div>
                    <button onClick={() => { setTeamPick(null); setIsSaved(false); }} style={{ marginLeft: 4, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 6, padding: '2px 6px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>✕</button>
                  </div>
                );
              })()}
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={save} disabled={!isComplete} style={{
                padding: '10px 24px', borderRadius: 12, border: 'none',
                background: !isComplete ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #E10600, #B00500)',
                color: !isComplete ? 'rgba(255,255,255,0.3)' : 'white',
                fontSize: 13, fontWeight: 800, cursor: !isComplete ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font)', transition: 'all 0.15s',
                boxShadow: !isComplete ? 'none' : '0 6px 20px rgba(225,6,0,0.3)',
              }}>
                {isSaved ? 'Kaydedildi' : 'Takımı Kaydet'}
              </button>

              {isComplete && (
                <button onClick={() => setShowSim(true)} style={{
                  padding: '10px 24px', borderRadius: 12,
                  border: '1px solid rgba(255,215,0,0.3)',
                  background: 'rgba(255,215,0,0.08)',
                  color: '#FFD700', fontSize: 13, fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  transition: 'all 0.15s',
                  boxShadow: '0 0 20px rgba(255,215,0,0.1)',
                }}>
                  Sezonu Simüle Et
                </button>
              )}

              {!isComplete && (
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                  {2 - drivers.length} pilot {!teamPick ? '+ 1 takım' : ''} seç
                </span>
              )}
            </div>
          </div>
        )}

        <div className="fantasy-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Drivers */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Pilotlar <span style={{ color: '#E10600' }}>{drivers.length}/2</span>
              <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.15)', fontSize: 8 }}>· prestige sıralaması</span>
            </div>
            {ds.length === 0 ? <LoadingSpinner /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[...ds].sort((a, b) => {
                  const pA = getDriverPrice(a.Driver?.driverId, parseInt(a.position));
                  const pB = getDriverPrice(b.Driver?.driverId, parseInt(b.position));
                  return pB - pA; // highest price (= best prestige) first
                }).map(item => (
                  <DriverSlot
                    key={item.Driver?.driverId}
                    item={item} selected={drivers}
                    onToggle={toggleDriver} budget={BUDGET} spent={spent}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Teams */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Takım <span style={{ color: '#E10600' }}>{teamPick ? '1' : '0'}/1</span>
            </div>
            {cs.length === 0 ? <LoadingSpinner /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {cs.map(item => (
                  <TeamSlot
                    key={item.Constructor?.constructorId}
                    item={item} selected={teamPick}
                    onToggle={setTeamPick} budget={BUDGET} spent={spent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Simulator modal */}
        {showSim && (
          <SimulatorModal
            drivers={drivers}
            teamPick={teamPick}
            allDrivers={ds}
            allTeams={cs}
            onClose={() => setShowSim(false)}
          />
        )}
        </>)}
      </div>
    </div>
  );
}
