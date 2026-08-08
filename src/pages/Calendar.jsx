import React, { useState } from 'react';
import { useRaceSchedule } from '../hooks/useJolpica';
import { formatDate, formatShortDate, getRaceCircuitFlag, isRacePast } from '../utils/formatters';
import { LoadingSpinner, ErrorMessage } from '../components/common/LoadingSpinner';
import CircuitModal from '../components/CircuitModal';

const SESSION_KEYS = [
  { key: 'FirstPractice',      label: 'AP 1' },
  { key: 'SecondPractice',     label: 'AP 2' },
  { key: 'ThirdPractice',      label: 'AP 3' },
  { key: 'Sprint',             label: 'Sprint' },
  { key: 'SprintQualifying',   label: 'Sprint Sıralama' },
  { key: 'Qualifying',         label: 'Sıralama' },
];

// Circuit thumbnail card for upcoming races
function RaceCard({ race, onSelect, isNext }) {
  const past = isRacePast(race.date);
  const flag = getRaceCircuitFlag(race.Circuit?.Location?.country);

  return (
    <div
      onClick={() => onSelect(race)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'background 0.15s',
        opacity: past ? 0.65 : 1,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{
        fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.25)',
        width: 28, flexShrink: 0, textAlign: 'right',
      }}>R{race.round}</span>

      <img
        src={flag}
        alt=""
        style={{ width: 38, height: 26, objectFit: 'cover', borderRadius: 5, flexShrink: 0, border: '1px solid rgba(255,255,255,0.06)' }}
        onError={e => e.target.style.display = 'none'}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 800,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{race.raceName}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
          {race.Circuit?.circuitName}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {past && (
          <span style={{
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6,
            background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)',
            padding: '3px 8px', borderRadius: 6,
          }}>Bitti</span>
        )}
        <span style={{ fontSize: 12, color: past ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
          {formatDate(race.date)}
        </span>
        {/* Pist butonu */}
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12,
        }}>GP</div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const { races, loading, error } = useRaceSchedule();
  const [selectedRace, setSelectedRace] = useState(null);

  const past     = races.filter(r => isRacePast(r.date));
  const upcoming = races.filter(r => !isRacePast(r.date));
  const next     = upcoming[0];

  if (loading) return (
    <div className="page-content">
      <div className="container">
        <div className="page-header"><h1>Takvim</h1></div>
        <LoadingSpinner />
      </div>
    </div>
  );
  if (error) return (
    <div className="page-content">
      <div className="container">
        <div className="page-header"><h1>Takvim</h1></div>
        <ErrorMessage message={error} />
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <div className="page-title-row">
            <h1>Yarış Takvimi</h1>
            <span className="page-chip">2026 · {races.length} GP</span>
          </div>
          <p>{past.length} tamamlandı · {upcoming.length} kaldı · Pist detayı için tıklayın</p>
        </div>

        {/* ── NEXT RACE HERO ── */}
        {next && (
          <div style={{ marginBottom: 28 }}>
            <div className="s-label">Sıradaki Yarış</div>
            <div
              className="next-race-card"
              onClick={() => setSelectedRace(next)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                <img
                  src={getRaceCircuitFlag(next.Circuit?.Location?.country)}
                  alt={next.Circuit?.Location?.country}
                  style={{ width: 70, height: 48, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                  onError={e => e.target.style.display = 'none'}
                />
                <div style={{ flex: 1 }}>
                  <div className="badge badge-accent" style={{ marginBottom: 10 }}>R{next.round}</div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
                    {next.raceName}
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    {next.Circuit?.circuitName} · {next.Circuit?.Location?.locality}, {next.Circuit?.Location?.country}
                  </p>
                  <div className="nrc-sessions">
                    {SESSION_KEYS.map(({ key, label }) => {
                      const s = next[key];
                      if (!s) return null;
                      return (
                        <div key={key} className="nrc-session">
                          <div className="nrc-s-label">{label}</div>
                          <div className="nrc-s-date">{formatShortDate(s.date)}</div>
                        </div>
                      );
                    })}
                    <div className="nrc-session">
                      <div className="nrc-s-label">Yarış</div>
                      <div className="nrc-s-date" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                        {formatDate(next.date)}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pist butonu */}
                <div style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '8px 12px', fontSize: 11, fontWeight: 700,
                  color: 'rgba(255,255,255,0.5)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  Pist
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── UPCOMING RACES ── */}
        {upcoming.length > 1 && (
          <div style={{ marginBottom: 28 }}>
            <div className="s-label">Gelecek Yarışlar</div>
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              {upcoming.slice(1).map(race => (
                <RaceCard key={race.round} race={race} onSelect={setSelectedRace} />
              ))}
            </div>
          </div>
        )}

        {/* ── PAST RACES ── */}
        {past.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="s-label">Tamamlanan Yarışlar</div>
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              {[...past].reverse().map(race => (
                <RaceCard key={race.round} race={race} onSelect={setSelectedRace} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── CIRCUIT MODAL ── */}
      {selectedRace && (
        <CircuitModal
          race={selectedRace}
          onClose={() => setSelectedRace(null)}
        />
      )}
    </div>
  );
}
