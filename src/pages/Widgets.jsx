import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDriverImageUrl, getTeamCarUrlLarge } from '../utils/driverImages';
import { getTeamColor } from '../utils/teamColors';
import { useDriverStandings, useConstructorStandings } from '../hooks/useJolpica';

const APP_URL = 'https://f1app-tau.vercel.app';

// ─── Widget size definitions ─────────────────────────────────────────────
const SIZES = {
  small:  { w: 155, h: 155, label: 'Kucuk' },
  medium: { w: 329, h: 155, label: 'Orta'  },
  large:  { w: 329, h: 329, label: 'Buyuk' },
};

// ─── Driver metadata ─────────────────────────────────────────────────────
const DRIVER_META = {
  'max_verstappen': { code: 'VER', number: 1  },
  'hamilton':       { code: 'HAM', number: 44 },
  'leclerc':        { code: 'LEC', number: 16 },
  'norris':         { code: 'NOR', number: 4  },
  'piastri':        { code: 'PIA', number: 81 },
  'russell':        { code: 'RUS', number: 63 },
  'antonelli':      { code: 'ANT', number: 12 },
  'alonso':         { code: 'ALO', number: 14 },
  'sainz':          { code: 'SAI', number: 55 },
  'gasly':          { code: 'GAS', number: 10 },
  'tsunoda':        { code: 'TSU', number: 22 },
  'albon':          { code: 'ALB', number: 23 },
  'hulkenberg':     { code: 'HUL', number: 27 },
  'lawson':         { code: 'LAW', number: 30 },
  'bearman':        { code: 'BEA', number: 87 },
  'colapinto':      { code: 'COL', number: 43 },
  'stroll':         { code: 'STR', number: 18 },
  'hadjar':         { code: 'HAD', number: 6  },
  'bortoleto':      { code: 'BOR', number: 5  },
  'ocon':           { code: 'OCO', number: 31 },
};

function standingToDriver(item, i) {
  const d = item.Driver;
  const id = d?.driverId || '';
  const meta = DRIVER_META[id] || { code: id.slice(0,3).toUpperCase(), number: d?.permanentNumber || '?' };
  return {
    id,
    name: d?.familyName || id,
    code: meta.code,
    number: meta.number,
    team: item.Constructors?.[0]?.name || '',
    pos: i + 1,
    pts: parseInt(item.points) || 0,
    wins: parseInt(item.wins) || 0,
  };
}

function standingToTeam(item, i) {
  const c = item.Constructor;
  return {
    id: c?.constructorId || '',
    name: c?.name || '',
    pos: i + 1,
    pts: parseInt(item.points) || 0,
    wins: parseInt(item.wins) || 0,
  };
}

// ─── Small Driver Widget ──────────────────────────────────────────────────
function WidgetDriverSmall({ driver, color }) {
  const img = getDriverImageUrl(driver.id);
  const c = color.primary;
  return (
    <div style={{
      width: SIZES.small.w, height: SIZES.small.h, borderRadius: 22,
      background: `linear-gradient(145deg, ${color.bg} 0%, #070710 100%)`,
      border: `1px solid ${c}30`, overflow: 'hidden', position: 'relative', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c }} />
      {img && <img src={img} alt="" style={{
        position: 'absolute', right: -5, bottom: 0, height: '90%', width: 'auto',
        objectFit: 'contain', objectPosition: 'bottom', opacity: 0.35, filter: 'grayscale(10%) drop-shadow(-4px 0 10px rgba(0,0,0,0.5))',
      }} />}
      <div style={{ position: 'absolute', inset: 0, padding: '14px 14px 10px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: c, letterSpacing: -1 }}>{driver.code}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 'auto' }}>{driver.team.split(' ')[0]}</div>
        <div style={{ marginTop: 'auto', position: 'absolute', bottom: 10, left: 14 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1 }}>P{driver.pos}</div>
          <div style={{ fontSize: 11, color: c }}>{driver.pts} PTS</div>
        </div>
      </div>
    </div>
  );
}

// ─── Medium Driver Widget ─────────────────────────────────────────────────
function WidgetDriverMedium({ driver, color }) {
  const img = getDriverImageUrl(driver.id);
  const c = color.primary;
  return (
    <div style={{
      width: '100%', height: SIZES.medium.h, borderRadius: 22,
      background: `linear-gradient(135deg, ${color.bg} 0%, #08080F 100%)`,
      border: `1px solid ${c}25`, overflow: 'hidden', position: 'relative', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c }} />
      {img && <img src={img} alt="" style={{
        position: 'absolute', right: 0, bottom: 0, height: '95%', width: 'auto',
        objectFit: 'contain', objectPosition: 'bottom', opacity: 0.3, filter: 'drop-shadow(-4px 0 10px rgba(0,0,0,0.5))',
      }} />}
      <div style={{ position: 'absolute', inset: 0, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, color: c, letterSpacing: -1 }}>{driver.code}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{driver.team}</div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['SIR', `P${driver.pos}`], ['PTS', driver.pts], ['GAL', driver.wins]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: label === 'SIR' ? c : 'white' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Large Driver Widget ──────────────────────────────────────────────────
function WidgetDriverLarge({ driver, color }) {
  const img = getDriverImageUrl(driver.id);
  const c = color.primary;
  return (
    <div style={{
      width: '100%', minHeight: SIZES.large.h, borderRadius: 22,
      background: `linear-gradient(160deg, ${color.bg} 0%, #06060E 70%)`,
      border: `1px solid ${c}20`, overflow: 'hidden', position: 'relative', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${c}, transparent)` }} />
      {img && <img src={img} alt="" style={{
        position: 'absolute', right: -20, top: 0, height: '90%', width: 'auto',
        objectFit: 'contain', objectPosition: 'top center', opacity: 0.15,
      }} />}
      <div style={{ position: 'absolute', inset: 0, padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: c, opacity: 0.7, letterSpacing: 1 }}>#{driver.number}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: c, letterSpacing: -2, marginTop: 4 }}>{driver.code}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{driver.team}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[['SIRALAMA', `P${driver.pos}`], ['TOPLAM PUAN', driver.pts], ['GALIBIYET', driver.wins], ['SEZON', '2025']].map(([label, val]) => (
            <div key={label} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: label === 'SIRALAMA' ? c : 'white' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Team Medium Widget ───────────────────────────────────────────────────
function WidgetTeamMedium({ team, color }) {
  const c = color.primary;
  const carImg = getTeamCarUrlLarge(team.id);

  return (
    <div style={{
      width: '100%', height: SIZES.medium.h, borderRadius: 22,
      background: `linear-gradient(135deg, ${color.bg} 0%, #08080F 100%)`,
      border: `1px solid ${c}25`, overflow: 'hidden', position: 'relative', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c }} />
      {carImg && <img src={carImg} alt="" style={{
        position: 'absolute', right: -30, bottom: -5, height: '75%', width: 'auto',
        objectFit: 'contain', objectPosition: 'bottom right', opacity: 0.45, filter: `drop-shadow(-10px 0 20px rgba(0,0,0,0.7))`
      }} />}
      <div style={{ position: 'absolute', inset: 0, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>{team.name?.replace(' Racing', '').replace(' F1 Team', '')}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Takim</div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['SIR', `P${team.pos}`], ['PTS', team.pts], ['GAL', team.wins]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: label === 'SIR' ? c : 'white' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Phone Frame ─────────────────────────────────────────────────────────
function PhoneFrame({ children }) {
  return (
    <div style={{
      width: 270, borderRadius: 44, background: '#0A0A14',
      border: '2px solid rgba(255,255,255,0.12)', overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.6)', flexShrink: 0, position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px 6px', fontSize: 12, fontWeight: 700, color: 'white' }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 10 }}>●●●</span>
          <span>100%</span>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #0D0D1A 0%, #1A0808 50%, #080D1A 100%)', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '8px 16px 28px' }}>
        {children}
      </div>
    </div>
  );
}

function WidgetLabel({ text }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '20px 0 10px', letterSpacing: 0.3 }}>
      {text}
    </div>
  );
}

// ─── Setup Tab ───────────────────────────────────────────────────────────
function SetupTab({ favDrivers, favTeams, allDrivers, allTeams }) {
  const [copied, setCopied] = useState(null);

  function copyURL(url, key) {
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  // shortcuts for fav drivers + fav teams + key pages
  const shortcuts = [
    { key: 'home',      label: 'PitLane Ana Sayfa',  subtitle: 'Tum verilere hizli erisim',  url: `${APP_URL}/`,          color: '#E10600' },
    { key: 'standings', label: 'Siralama Tablosu',   subtitle: 'Surucu ve takim siralamalari', url: `${APP_URL}/standings`, color: '#FFB400' },
    { key: 'live',      label: 'Canli Seans',         subtitle: 'Anlik pist verileri',         url: `${APP_URL}/live`,      color: '#30D158' },
    { key: 'calendar',  label: 'Takvim',              subtitle: 'Yaris takvimi',               url: `${APP_URL}/calendar`,  color: '#0A84FF' },
    ...favDrivers.slice(0, 5).map(d => ({
      key: `d_${d.id}`,
      label: `${d.code} Takip`,
      subtitle: `${d.name} — ${d.team}`,
      url: `${APP_URL}/drivers`,
      color: getTeamColor(d.team)?.primary || '#E10600',
      tag: 'Favori Pilot',
    })),
    ...favTeams.slice(0, 3).map(t => ({
      key: `t_${t.id}`,
      label: `${t.name?.split(' ')[0]} Takim`,
      subtitle: `P${t.pos} — ${t.pts} puan`,
      url: `${APP_URL}/teams`,
      color: getTeamColor(t.id)?.primary || '#E10600',
      tag: 'Favori Takim',
    })),
  ];

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Step 1 — PWA */}
      <div style={{
        borderRadius: 20, border: '1px solid rgba(52,199,89,0.3)',
        background: 'rgba(52,199,89,0.06)', marginBottom: 16, padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#34C759,#28A745)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" fill="white"/><rect x="12" y="3" width="7" height="7" rx="2" fill="white"/><rect x="3" y="12" width="7" height="7" rx="2" fill="white"/><rect x="12" y="12" width="7" height="7" rx="2" fill="white"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 900 }}>Ana Ekrana Ekle</span>
              <span style={{ fontSize: 9, fontWeight: 900, background: '#34C759', color: 'black', borderRadius: 6, padding: '2px 8px' }}>EN KOLAY</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>0 ek uygulama — 3 tiklama, tam ekran acilir</div>
          </div>
        </div>
        {['Safari\'de f1app-tau.vercel.app adresi ac', 'Alttaki Paylasim butonuna bas (kare + ok)', '"Ana Ekrana Ekle" yi sec ve isim ver'].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(52,199,89,0.2)', border: '1px solid rgba(52,199,89,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#34C759', flexShrink: 0 }}>{i+1}</div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, paddingTop: 2 }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Step 2 — iOS Shortcuts per widget */}
      <div style={{
        borderRadius: 20, border: '1px solid rgba(10,132,255,0.3)',
        background: 'rgba(10,132,255,0.06)', padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#0A84FF,#0060CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 11h12M14 7l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900 }}>iOS Kisayollari</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Her sayfa icin ayri kısayol — Kisayollar uygulamasi ile</div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, marginBottom: 14 }}>
          Asagidan istedigin sayfanin URL'ini kopyala. Kisayollar uyg. aç → + → "URL Ac" → URL'i yapistir → isim ver → Ana ekrana ekle.
        </div>

        {/* Shortcut Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shortcuts.map((s) => (
            <div key={s.key} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 14,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              {/* Color dot */}
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{s.label}</span>
                  {s.tag && <span style={{ fontSize: 8, fontWeight: 900, background: `${s.color}25`, color: s.color, borderRadius: 5, padding: '1px 6px' }}>{s.tag}</span>}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subtitle}</div>
              </div>
              {/* Copy button */}
              <button
                onClick={() => copyURL(s.url, s.key)}
                style={{
                  padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: copied === s.key ? 'rgba(52,199,89,0.25)' : 'rgba(255,255,255,0.08)',
                  color: copied === s.key ? '#34C759' : 'rgba(255,255,255,0.7)',
                  fontSize: 10, fontWeight: 800, fontFamily: 'var(--font)',
                  transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                {copied === s.key ? 'Kopyalandi' : 'Kopyala'}
              </button>
            </div>
          ))}
        </div>

        {favDrivers.length === 0 && favTeams.length === 0 && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
            Profil sayfasinda favori pilot ve takim ekle — kisayollar buraya gelecek.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Widgets Page ────────────────────────────────────────────────────
export default function Widgets() {
  const { user } = useAuth();
  const [activeSize, setActiveSize] = useState('medium');
  const [activeTab, setActiveTab] = useState('preview');

  const { standings: driverStandings, loading: dL, season } = useDriverStandings();
  const { standings: teamStandings, loading: tL } = useConstructorStandings();

  const ALL_DRIVERS = driverStandings.map(standingToDriver);
  const ALL_TEAMS   = teamStandings.map(standingToTeam);

  const FAV_DRIVER_IDS = user?.favDrivers?.length ? user.favDrivers : ALL_DRIVERS.slice(0, 3).map(d => d.id);
  const FAV_TEAM_IDS   = user?.favTeams?.length   ? user.favTeams   : ALL_TEAMS.slice(0, 2).map(t => t.id);

  const favDrivers = FAV_DRIVER_IDS.map(id => ALL_DRIVERS.find(d => d.id === id)).filter(Boolean);
  const favTeams   = FAV_TEAM_IDS.map(id => ALL_TEAMS.find(t => t.id === id)).filter(Boolean);

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 6 }}>Widgets</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
            {season} sezonu resmi istatistikleri — Kisayol olarak ana ekrana eklenebilir
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.25)',
            borderRadius: 20, padding: '6px 14px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFB400', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#FFB400', fontWeight: 700 }}>Mobil Uygulamada Native Widget Olarak Gelecek</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 3, marginBottom: 24, maxWidth: 440 }}>
          {[['preview', 'Genel Bakis'], ['mine', 'Favorilerim'], ['setup', 'Kisayollar']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              flex: 1, padding: '9px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'var(--font)',
              background: activeTab === id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === id ? 'white' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* Size selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {Object.entries(SIZES).map(([id, { label }]) => (
            <button key={id} onClick={() => setActiveSize(id)} style={{
              padding: '7px 16px', borderRadius: 20, border: `1px solid ${activeSize === id ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
              background: activeSize === id ? 'var(--accent-dim)' : 'transparent',
              color: activeSize === id ? 'var(--accent)' : 'rgba(255,255,255,0.45)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* ── PREVIEW TAB ── */}
        {activeTab === 'preview' && (
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <PhoneFrame>
              <WidgetLabel text="Surucu Widgetlari" />
              {activeSize === 'small' && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ALL_DRIVERS.slice(0, 4).map(d => (
                    <WidgetDriverSmall key={d.id} driver={d} color={getTeamColor(d.team)} />
                  ))}
                </div>
              )}
              {activeSize === 'medium' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ALL_DRIVERS.slice(0, 3).map(d => (
                    <WidgetDriverMedium key={d.id} driver={d} color={getTeamColor(d.team)} />
                  ))}
                </div>
              )}
              {activeSize === 'large' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ALL_DRIVERS.slice(0, 2).map(d => (
                    <WidgetDriverLarge key={d.id} driver={d} color={getTeamColor(d.team)} />
                  ))}
                </div>
              )}
              <WidgetLabel text="Takim Widgetlari" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ALL_TEAMS.slice(0, 2).map(t => (
                  <WidgetTeamMedium key={t.id} team={t} color={getTeamColor(t.id)} />
                ))}
              </div>
            </PhoneFrame>

            {/* Info panel */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16, letterSpacing: -0.3 }}>3 Boyut, Sonsuz Stil</div>
              {Object.entries(SIZES).map(([id, { w, h, label }]) => (
                <div key={id} onClick={() => setActiveSize(id)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                  borderRadius: 14, marginBottom: 8, cursor: 'pointer',
                  background: activeSize === id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${activeSize === id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: activeSize === id ? 36 : 28,
                    height: activeSize === id ? 36 : 28,
                    borderRadius: 8, background: activeSize === id ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                    transition: 'all 0.2s', flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{w}x{h}pt</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 20, padding: '16px', background: 'rgba(10,132,255,0.08)', borderRadius: 16, border: '1px solid rgba(10,132,255,0.2)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Ana Ekrana Ekle</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 10 }}>
                  Kisayollar sekmesinden her widget sayfasini tek tiklama ana ekrana ekle.
                </div>
                <button
                  onClick={() => setActiveTab('setup')}
                  style={{
                    width: '100%', padding: '9px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#0A84FF,#0060CC)',
                    color: 'white', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}
                >
                  Kisayol Olustur
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MY FAVORITES TAB ── */}
        {activeTab === 'mine' && (
          <div>
            {favDrivers.length > 0 ? (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: 'rgba(255,255,255,0.7)' }}>Favori Pilotlarin</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {favDrivers.map(d => (
                    <WidgetDriverMedium key={d.id} driver={d} color={getTeamColor(d.team)} />
                  ))}
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {favDrivers.map(d => (
                    <WidgetDriverSmall key={d.id + '_s'} driver={d} color={getTeamColor(d.team)} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                Profil sayfasinda favori pilot ekle
              </div>
            )}
            {favTeams.length > 0 && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: 'rgba(255,255,255,0.7)' }}>Favori Takimlarin</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {favTeams.map(t => (
                    <WidgetTeamMedium key={t.id} team={t} color={getTeamColor(t.id)} />
                  ))}
                </div>
              </div>
            )}
            {favDrivers.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: 'rgba(255,255,255,0.7)' }}>Buyuk Widget Onizleme</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {favDrivers.slice(0, 2).map(d => (
                    <WidgetDriverLarge key={d.id + '_l'} driver={d} color={getTeamColor(d.team)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SHORTCUTS TAB ── */}
        {activeTab === 'setup' && (
          <SetupTab favDrivers={favDrivers} favTeams={favTeams} allDrivers={ALL_DRIVERS} allTeams={ALL_TEAMS} />
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
