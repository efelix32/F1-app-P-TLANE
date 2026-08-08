import React, { useState } from 'react';
import { useDriverStandings } from '../hooks/useJolpica';
import { getTeamColor } from '../utils/teamColors';
import { getDriverImageUrl, getTeamLogoUrl } from '../utils/driverImages';
import { getFlagUrl } from '../utils/formatters';

// ─── Stat Bar ──────────────────────────────────────────────────────────────
function StatBar({ label, valA, valB, colorA, colorB, unit = '', higherIsBetter = true }) {
  const numA = parseFloat(valA) || 0;
  const numB = parseFloat(valB) || 0;
  const max = Math.max(numA, numB, 1);
  const pctA = (numA / max) * 100;
  const pctB = (numB / max) * 100;
  const aWins = higherIsBetter ? numA >= numB : numA <= numB;
  const bWins = higherIsBetter ? numB > numA : numB < numA;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{
          fontSize: 15, fontWeight: 900, color: aWins ? colorA : 'rgba(255,255,255,0.5)',
          minWidth: 60, textAlign: 'left',
        }}>
          {numA}{unit}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', flex: 1 }}>
          {label}
        </span>
        <span style={{
          fontSize: 15, fontWeight: 900, color: bWins ? colorB : 'rgba(255,255,255,0.5)',
          minWidth: 60, textAlign: 'right',
        }}>
          {numB}{unit}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4, height: 8, borderRadius: 4, overflow: 'hidden' }}>
        {/* Left bar (A) - fills from right */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.06)', borderRadius: '4px 0 0 4px', overflow: 'hidden' }}>
          <div style={{
            width: `${pctA}%`, background: colorA, borderRadius: '4px 0 0 4px',
            transition: 'width 0.8s cubic-bezier(0.34,1.2,0.64,1)',
            boxShadow: aWins ? `0 0 8px ${colorA}60` : 'none',
          }} />
        </div>
        {/* Center divider */}
        <div style={{ width: 2, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
        {/* Right bar (B) */}
        <div style={{ flex: 1, display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '0 4px 4px 0', overflow: 'hidden' }}>
          <div style={{
            width: `${pctB}%`, background: colorB, borderRadius: '0 4px 4px 0',
            transition: 'width 0.8s cubic-bezier(0.34,1.2,0.64,1)',
            boxShadow: bWins ? `0 0 8px ${colorB}60` : 'none',
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── Driver Selector ───────────────────────────────────────────────────────
function DriverSelector({ standings, selected, onSelect, side, color }) {
  const [open, setOpen] = useState(false);
  const item = standings.find(d => d.Driver?.driverId === selected);
  const drv = item?.Driver;
  const team = item?.Constructors?.[0];
  const img = drv ? getDriverImageUrl(drv.driverId) : null;
  const flag = drv ? getFlagUrl(drv.nationality) : null;
  const tc = team ? getTeamColor(team.name) : null;

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', background: 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${drv ? (tc?.primary || color) : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.2s', minHeight: 120, position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {drv ? (
          <>
            {img && (
              <img src={img} alt={drv.familyName} style={{
                position: 'absolute', bottom: 0,
                [side === 'left' ? 'right' : 'left']: -8,
                height: '130%', width: 'auto', objectFit: 'contain',
                objectPosition: 'bottom', opacity: 0.9,
                WebkitMaskImage: side === 'left'
                  ? 'linear-gradient(90deg, #000 30%, transparent 90%)'
                  : 'linear-gradient(270deg, #000 30%, transparent 90%)',
                maskImage: side === 'left'
                  ? 'linear-gradient(90deg, #000 30%, transparent 90%)'
                  : 'linear-gradient(270deg, #000 30%, transparent 90%)',
              }} />
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: side === 'left'
                ? `linear-gradient(90deg, rgba(8,8,12,0.95) 35%, transparent 80%)`
                : `linear-gradient(270deg, rgba(8,8,12,0.95) 35%, transparent 80%)`,
            }} />
            <div style={{
              position: 'relative', zIndex: 2, padding: '12px 16px',
              width: '100%', textAlign: side === 'left' ? 'left' : 'right',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: side === 'left' ? 'flex-start' : 'flex-end', marginBottom: 4 }}>
                {flag && <img src={flag} alt="" style={{ width: 16, borderRadius: 2 }} onError={e => e.target.style.display = 'none'} />}
                <span style={{ fontSize: 11, fontWeight: 900, color: tc?.primary }}># {drv.permanentNumber}</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{drv.givenName}</div>
              <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: -0.5 }}>{drv.familyName}</div>
              <div style={{ fontSize: 9, color: tc?.primary, marginTop: 2 }}>{team?.name}</div>
            </div>
          </>
        ) : (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>+</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
              Sürücü Seç
            </div>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', [side === 'left' ? 'left' : 'right']: 0,
          zIndex: 100, width: 220, maxHeight: 320, overflowY: 'auto',
          background: '#10101A', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          marginTop: 6,
        }}>
          {standings.map(item => {
            const d = item.Driver;
            const t = item.Constructors?.[0];
            const tc2 = getTeamColor(t?.name);
            const f = getFlagUrl(d?.nationality);
            return (
              <div key={d?.driverId} onClick={() => { onSelect(d?.driverId); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: selected === d?.driverId ? 'rgba(255,255,255,0.06)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = selected === d?.driverId ? 'rgba(255,255,255,0.06)' : 'transparent'}
              >
                {f && <img src={f} alt="" style={{ width: 16, borderRadius: 2 }} onError={e => e.target.style.display = 'none'} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{d?.familyName}</div>
                  <div style={{ fontSize: 10, color: tc2?.primary }}>{t?.name}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.3)' }}>P{item.position}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Compare Page ─────────────────────────────────────────────────────
export default function Compare() {
  const { standings } = useDriverStandings();
  const [driverA, setDriverA] = useState('max_verstappen');
  const [driverB, setDriverB] = useState('hamilton');

  const itemA = standings.find(d => d.Driver?.driverId === driverA);
  const itemB = standings.find(d => d.Driver?.driverId === driverB);

  const colorA = itemA ? getTeamColor(itemA.Constructors?.[0]?.name).primary : '#E10600';
  const colorB = itemB ? getTeamColor(itemB.Constructors?.[0]?.name).primary : '#00D2BE';

  const logoA = itemA ? getTeamLogoUrl(itemA.Constructors?.[0]?.name) : null;
  const logoB = itemB ? getTeamLogoUrl(itemB.Constructors?.[0]?.name) : null;

  const winner = (() => {
    if (!itemA || !itemB) return null;
    const pa = parseInt(itemA.position);
    const pb = parseInt(itemB.position);
    if (pa < pb) return 'A';
    if (pb < pa) return 'B';
    return null;
  })();

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
            Sürücü Karşılaştır
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            İki sürücüyü yan yana karşılaştır
          </p>
        </div>

        {/* Selector row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'stretch' }}>
          <DriverSelector standings={standings} selected={driverA} onSelect={setDriverA} side="left" color={colorA} />
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,0.4)', alignSelf: 'center',
          }}>
            VS
          </div>
          <DriverSelector standings={standings} selected={driverB} onSelect={setDriverB} side="right" color={colorB} />
        </div>

        {/* Team logos */}
        {(logoA || logoB) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
            <div style={{ height: 18, display: 'flex', alignItems: 'center' }}>
              {logoA && <img src={logoA} alt="" style={{ height: '100%', objectFit: 'contain', opacity: 0.7 }} onError={e => e.target.style.display = 'none'} />}
            </div>
            <div style={{ height: 18, display: 'flex', alignItems: 'center' }}>
              {logoB && <img src={logoB} alt="" style={{ height: '100%', objectFit: 'contain', opacity: 0.7 }} onError={e => e.target.style.display = 'none'} />}
            </div>
          </div>
        )}

        {/* Winner banner */}
        {winner && itemA && itemB && (
          <div style={{
            padding: '12px 18px', borderRadius: 14, marginBottom: 20,
            background: winner === 'A' ? `${colorA}15` : `${colorB}15`,
            border: `1px solid ${winner === 'A' ? colorA : colorB}30`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: winner === 'A' ? colorA : colorB,
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: winner === 'A' ? colorA : colorB }}>
              {winner === 'A' ? itemA.Driver?.familyName : itemB.Driver?.familyName} şampiyonada önde
            </span>
          </div>
        )}

        {/* Stats comparison */}
        {itemA && itemB ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '24px 20px',
          }}>
            <StatBar label="Puan" valA={itemA.points} valB={itemB.points} colorA={colorA} colorB={colorB} />
            <StatBar label="Sıralama" valA={itemA.position} valB={itemB.position} colorA={colorA} colorB={colorB} higherIsBetter={false} />
            <StatBar label="Galibiyet" valA={itemA.wins} valB={itemB.wins} colorA={colorA} colorB={colorB} />

            {/* Extra info grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 24,
              paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {[
                { label: 'Ülke', valA: itemA.Driver?.nationality, valB: itemB.Driver?.nationality, isText: true },
                { label: 'Numara', valA: `#${itemA.Driver?.permanentNumber}`, valB: `#${itemB.Driver?.permanentNumber}`, isText: true },
                { label: 'Takım', valA: itemA.Constructors?.[0]?.name, valB: itemB.Constructors?.[0]?.name, isText: true },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: colorA, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.valA}</div>
                  <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: 11, fontWeight: 800, color: colorB, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.valB}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            background: 'rgba(255,255,255,0.02)', borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              Karşılaştırmak için iki sürücü seç
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
