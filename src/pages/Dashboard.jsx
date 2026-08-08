import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDriverStandings, useConstructorStandings, useRaceSchedule, useLastRaceResults } from '../hooks/useJolpica';
import { getTeamColor } from '../utils/teamColors';
import { formatShortDate, getCountdownDays, getFlagUrl, getRaceCircuitFlag, isRacePast } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

function CountdownTimer({ nextRace }) {
  const [t, setT] = useState(null);

  useEffect(() => {
    if (!nextRace) return;
    const ds = `${nextRace.date}T${nextRace.time || '13:00:00Z'}`;
    const update = () => setT(getCountdownDays(ds));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [nextRace]);

  if (!nextRace) return null;
  const country = nextRace.Circuit?.Location?.country;
  const flagUrl = getRaceCircuitFlag(country);

  return (
    <div className="countdown-hero">
      <div className="c-eyebrow">
        <span style={{ color: 'var(--accent)', fontWeight: 900 }}>●</span> Sıradaki Yarış
      </div>
      <div className="flex items-start gap-[18px]">
        <div className="flex-1">
          <div className="c-race">{nextRace.raceName}</div>
          <div className="c-circuit">
            {nextRace.Circuit?.circuitName} &middot; {country}
            &nbsp;·&nbsp; <span style={{ color: 'var(--accent)' }}>{formatShortDate(nextRace.date)}</span>
          </div>
          {t && t.total > 0 ? (
            <div className="c-units">
              <div className="c-unit"><span className="c-num">{String(t.days).padStart(2,'0')}</span><span className="c-label">Gün</span></div>
              <span className="c-sep">:</span>
              <div className="c-unit"><span className="c-num">{String(t.hours).padStart(2,'0')}</span><span className="c-label">Saat</span></div>
              <span className="c-sep">:</span>
              <div className="c-unit"><span className="c-num">{String(t.minutes).padStart(2,'0')}</span><span className="c-label">Dakika</span></div>
              <span className="c-sep">:</span>
              <div className="c-unit"><span className="c-num">{String(t.seconds).padStart(2,'0')}</span><span className="c-label">Saniye</span></div>
            </div>
          ) : (
            <span className="badge badge-red" style={{ marginTop: 12 }}>Yarış Günü!</span>
          )}
        </div>
        <img src={flagUrl} alt={country}
          className="w-[72px] h-[50px] object-cover rounded-[10px] opacity-[0.85] shrink-0"
          onError={e => e.target.style.display='none'} />
      </div>
    </div>
  );
}

function MiniLeader({ standings, type }) {
  const top = standings.slice(0, 5);
  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="pt-[14px] px-[18px] pb-[12px] border-b border-[var(--border)] flex justify-between items-center">
        <span style={{ fontSize: 13, fontWeight: 700 }}>
          {type === 'driver' ? 'Sürücü Şampiyonası' : 'Takım Şampiyonası'}
        </span>
        <Link to="/standings" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>Tümü →</Link>
      </div>
      {top.map((item, i) => {
        const isD = type === 'driver';
        const name = isD
          ? `${item.Driver?.givenName?.[0]}. ${item.Driver?.familyName}`
          : item.Constructor?.name;
        const team = isD ? item.Constructors?.[0]?.name : item.Constructor?.name;
        const color = getTeamColor(team);
        const flag = isD ? getFlagUrl(item.Driver?.nationality) : null;
        const medals = ['1','2','3'];

        return (
          <div key={i} className="result-row">
            <div className="rr-pos">
              {i < 3 ? <span style={{ fontSize: 11, fontWeight: 900, color: i===0?'#FFD700':i===1?'#C0C0C0':'#CD7F32' }}>{medals[i]}</span> : <span style={{ color: 'var(--text-3)' }}>{i+1}</span>}
            </div>
            {!isD && <div className="team-dot" style={{ background: color.primary }} />}
            {flag && <img src={flag} alt="" className="flag-img" onError={e=>e.target.style.display='none'} />}
            <div className="rr-name-col">
              <div className="rr-nm">{name}</div>
              {isD && <div className="rr-sub">{team}</div>}
            </div>
            <div className="rr-pts-val" style={{ color: i===0 ? 'var(--accent)' : 'var(--text)' }}>
              {item.points}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LastRaceCard({ race, results }) {
  if (!race) return null;
  return (
    <div className="card" style={{ height: '100%' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
        <div className="badge badge-muted" style={{ marginBottom: 8 }}>Son Yarış</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{race.raceName}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
          {race.Circuit?.circuitName} · {formatShortDate(race.date)}
        </div>
      </div>
      {results.slice(0, 5).map((r, i) => {
        const color = getTeamColor(r.Constructor?.name);
        const medals = ['1','2','3'];
        return (
          <div key={i} className="result-row">
            <div className="rr-pos">
              {i < 3 ? <span style={{ fontSize: 11, fontWeight: 900, color: i===0?'#FFD700':i===1?'#C0C0C0':'#CD7F32' }}>{medals[i]}</span> : <span style={{ color: 'var(--text-3)' }}>{i+1}</span>}
            </div>
            <div className="team-dot" style={{ background: color.primary }} />
            <div className="rr-name-col">
              <div className="rr-nm">{r.Driver?.givenName?.[0]}. {r.Driver?.familyName}</div>
              <div className="rr-sub">{r.Constructor?.name}</div>
            </div>
            <div className="rr-time-val">{r.Time?.time || r.status}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { standings: ds, loading: dL, season: dSeason } = useDriverStandings();
  const { standings: cs, loading: cL } = useConstructorStandings();
  const { races, loading: rL, season: raceSeason } = useRaceSchedule();
  const { race: lastRace, results: lastResults, loading: lrL } = useLastRaceResults();
  const displaySeason = dSeason || raceSeason || '2026';

  const nextRace = races.find(r => !isRacePast(r.date));
  const upcomingRaces = races.filter(r => !isRacePast(r.date)).slice(1, 5);
  const loading = dL || cL || rL;

  // Leader card
  const leader = ds[0];
  const leaderTeam = leader?.Constructors?.[0]?.name;
  const leaderColor = getTeamColor(leaderTeam);

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <div className="page-title-row">
            <h1>Dashboard</h1>
            <span className="page-chip">{displaySeason} Sezonu</span>
            {displaySeason === '2025' && (
              <span className="text-[10px] font-bold py-[3px] px-[10px] rounded-full bg-[rgba(255,180,0,0.12)] border border-[rgba(255,180,0,0.25)] text-[#FFB400] tracking-wide">
                2026 henüz başlamadı
              </span>
            )}
          </div>
          <p>Formula 1 Dünya Şampiyonası · {displaySeason} Canlı Veriler</p>
        </div>

        {/* Countdown */}
        {!rL && nextRace && <CountdownTimer nextRace={nextRace} />}

        {loading ? <LoadingSpinner text="Veriler yükleniyor..." /> : (
          <>
            {/* Leader spotlight */}
            {leader && (
              <div style={{ marginBottom: 28 }}>
                <div className="s-label">Lider</div>
                <div className="card card-p-lg" style={{
                  background: `linear-gradient(135deg, var(--bg-2), ${leaderColor.bg})`,
                  borderColor: `${leaderColor.primary}22`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: leaderColor.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                        Şampiyonluk Lideri
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>
                        {leader.Driver?.givenName} {leader.Driver?.familyName}
                      </div>
                      <div style={{ fontSize: 13, color: leaderColor.primary, fontWeight: 600, marginBottom: 16 }}>
                        {leaderTeam}
                      </div>
                      <div style={{ display: 'flex', gap: 28 }}>
                        <div><div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Puan</div>
                          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>{leader.points}</div>
                        </div>
                        <div><div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Zafer</div>
                          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>{leader.wins}</div>
                        </div>
                        <div><div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Sıralama</div>
                          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, color: leaderColor.primary }}>P1</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <img src={getFlagUrl(leader.Driver?.nationality)} alt=""
                        style={{ width: 64, borderRadius: 8, opacity: 0.85, marginLeft: 'auto' }}
                        onError={e => e.target.style.display='none'} />
                      <div style={{ fontSize: 72, fontWeight: 900, fontStyle: 'italic', opacity: 0.08, letterSpacing: -5, lineHeight: 1, marginTop: -10 }}>
                        {leader.Driver?.permanentNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standings mini + Last race */}
            <div style={{ marginBottom: 28 }}>
              <div className="s-label">Şampiyonluk Özeti</div>
              <div className="g2">
                <MiniLeader standings={ds} type="driver" />
                <MiniLeader standings={cs} type="constructor" />
              </div>
            </div>

            {/* Last race + upcoming */}
            <div className="g2" style={{ marginBottom: 28 }}>
              {!lrL && <LastRaceCard race={lastRace} results={lastResults} />}
              <div className="card">
                <div style={{
                  padding: '14px 18px 12px', borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Yaklaşan Yarışlar</span>
                  <Link to="/calendar" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>Tümü →</Link>
                </div>
                {upcomingRaces.map((race, i) => (
                  <div key={race.round} className="race-row">
                    <span className="rr-round">R{race.round}</span>
                    <img src={getRaceCircuitFlag(race.Circuit?.Location?.country)} alt=""
                      className="rr-flag" onError={e=>e.target.style.display='none'} />
                    <div className="rr-info">
                      <div className="rr-name">{race.raceName}</div>
                      <div className="rr-circuit">{race.Circuit?.Location?.country}</div>
                    </div>
                    <span className="rr-date">{formatShortDate(race.date)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick nav */}
            <div style={{ marginBottom: 40 }}>
              <div className="s-label">Keşfet</div>
              <div className="g4">
                {[
                  { to: '/standings', icon: 'S', label: 'Sıralamalar', desc: 'Şampiyonluk tablosu' },
                  { to: '/calendar', icon: 'T', label: 'Takvim', desc: '2026 yarış programı' },
                  { to: '/drivers', icon: 'P', label: 'Sürücüler', desc: 'Tüm yarışçılar' },
                  { to: '/live', icon: 'C', label: 'Canlı', desc: 'Son oturum' },
                ].map(item => (
                  <Link key={item.to} to={item.to} className="quick-card">
                    <span className="qc-icon">{item.icon}</span>
                    <span className="qc-title">{item.label}</span>
                    <span className="qc-desc">{item.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
