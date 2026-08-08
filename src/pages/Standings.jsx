import React, { useState } from 'react';
import { useDriverStandings, useConstructorStandings } from '../hooks/useJolpica';
import { getTeamColor } from '../utils/teamColors';
import { getFlagUrl } from '../utils/formatters';
import { getDriverImageUrl, getTeamLogoUrl } from '../utils/driverImages';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Portrait — face crop (top-anchored so helmet+face shows, feet cut off)
function Portrait({ driverId, color, size = 52 }) {
  const [failed, setFailed] = useState(false);
  const url = getDriverImageUrl(driverId);

  if (!url || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 12, flexShrink: 0,
        background: `${color}12`, border: `1px solid ${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>F1</div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      overflow: 'hidden', position: 'relative',
      background: `${color}08`, border: `1px solid ${color}20`,
    }}>
      <img
        src={url}
        alt=""
        onError={() => setFailed(true)}
        style={{
          // Show helmet/face area: image starts from top, zoomed in
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          height: '160%',
          width: 'auto',
          objectFit: 'contain',
          objectPosition: 'top center',
        }}
      />
    </div>
  );
}

// ─── Team logo with abbreviation fallback ─────────────────────────────
function TeamLogo({ teamName, color }) {
  const [failed, setFailed] = useState(false);
  const url = getTeamLogoUrl(teamName);
  const abbr = (teamName || '').split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 3).toUpperCase();

  if (!url || failed) {
    return (
      <div style={{
        width: 52, height: 34, borderRadius: 9, flexShrink: 0,
        background: `${color.primary}14`, border: `1px solid ${color.primary}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 900, color: color.primary, letterSpacing: -0.5,
      }}>{abbr}</div>
    );
  }
  return (
    <div style={{
      width: 52, height: 34, borderRadius: 9, flexShrink: 0,
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', padding: 5,
    }}>
      <img src={url} alt={teamName} onError={() => setFailed(true)}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'brightness(1.1)' }} />
    </div>
  );
}

// ─── Podium (Top 3 horizontal strip) ─────────────────────────────────
function PodiumStrip({ standings }) {
  if (standings.length < 3) return null;
  const top3 = [standings[1], standings[0], standings[2]]; // P2, P1, P3
  const mc = { 1:'#FFD700', 2:'#B8BEC8', 3:'#CD7F32' };
  const tc = { 1:'#1a1200', 2:'#0e1018', 3:'#1a0a00' };  // text contrast on badge

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1.08fr 1fr', gap:10, marginBottom:28 }}>
      {top3.map((item, idx) => {
        if (!item) return <div key={idx} />;
        const p = parseInt(item.position);
        const drv = item.Driver;
        const team = item.Constructors?.[0]?.name;
        const color = getTeamColor(team);
        const flag = getFlagUrl(drv?.nationality);
        const url = getDriverImageUrl(drv?.driverId);

        return (
          <div key={drv?.driverId} style={{
            background: `linear-gradient(160deg, ${color.bg}, #090910)`,
            border: `1px solid ${p === 1 ? color.primary+'30' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 20, overflow: 'hidden', position: 'relative',
            boxShadow: p === 1 ? `0 16px 48px ${color.primary}18` : 'none',
          }}>
            {/* Top stripe */}
            <div style={{ height: 2, background: p===1 ? color.primary : mc[p], boxShadow: p===1 ? `0 0 12px ${color.primary}` : 'none' }} />

            {/* Portrait area */}
            <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: `radial-gradient(ellipse 80% 100% at 70% 100%, ${color.primary}10, transparent)` }}>
              {/* Ghost number */}
              <div style={{ position:'absolute', right:-2, bottom:-8, fontSize:100, fontWeight:900, fontStyle:'italic', letterSpacing:-8, lineHeight:1, color:color.primary, opacity:0.07, userSelect:'none' }}>
                {drv?.permanentNumber}
              </div>

              {/* Driver photo — top-anchored so face/helmet is always visible */}
              {url && (
                <img src={url} alt={drv?.familyName}
                  style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', height:'145%', width:'auto', objectFit:'contain', objectPosition:'top center', filter:'drop-shadow(0 4px 20px rgba(0,0,0,0.6))', zIndex:2 }} />
              )}

              {/* Position badge + flag */}
              <div style={{ position:'absolute', top:12, left:12, zIndex:3, display:'flex', flexDirection:'column', gap:6 }}>
                {/* Clean numbered badge — Apple style */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: mc[p],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 900, color: tc[p],
                  boxShadow: `0 0 14px ${mc[p]}70, 0 2px 8px rgba(0,0,0,0.5)`,
                  letterSpacing: -0.5,
                }}>
                  {p}
                </div>
                <img src={flag} alt="" style={{ width:22, borderRadius:3 }} onError={e=>e.target.style.display='none'} />
              </div>
              {/* Bottom fade */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:40, background:'linear-gradient(transparent,#090910)', zIndex:1 }} />
            </div>

            {/* Info */}
            <div style={{ padding:'10px 14px 14px' }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', lineHeight:1 }}>{drv?.givenName}</div>
              <div style={{ fontSize:17, fontWeight:900, letterSpacing:-0.5, marginBottom:6 }}>{drv?.familyName}</div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:color.bg, border:`1px solid ${color.primary}22`, borderRadius:99, padding:'2px 7px', marginBottom:10 }}>
                <div style={{ width:4, height:4, borderRadius:'50%', background:color.primary }} />
                <span style={{ fontSize:8, fontWeight:700, color:color.primary }}>{team}</span>
              </div>
              <div style={{ display:'flex', gap:14 }}>
                <div>
                  <div style={{ fontSize:20, fontWeight:900, letterSpacing:-1, color: p===1 ? color.primary : 'white' }}>{item.points}</div>
                  <div style={{ fontSize:7, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:0.5 }}>Puan</div>
                </div>
                {parseInt(item.wins) > 0 && (
                  <div>
                    <div style={{ fontSize:20, fontWeight:900, letterSpacing:-1, color:'#FFD700' }}>{item.wins}</div>
                    <div style={{ fontSize:7, color:'rgba(255,215,0,0.4)', textTransform:'uppercase', letterSpacing:0.5 }}>Zafer</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Driver table row ─────────────────────────────────────────────────
function DriverRow({ item, idx, total }) {
  const p = parseInt(item.position);
  const drv = item.Driver;
  const team = item.Constructors?.[0];
  const color = getTeamColor(team?.name);
  const flag = getFlagUrl(drv?.nationality);
  const isTop = p <= 3;
  const mc = {1:'#FFD700', 2:'#C0C7D0', 3:'#CD853F'};

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:11,
      padding:'8px 16px',
      borderBottom: idx < total - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
      background: isTop ? `${color.primary}04` : 'transparent',
      position:'relative',
    }}>
      {isTop && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2.5, background:color.primary, boxShadow:`2px 0 8px ${color.primary}50` }} />}

      {/* Pos — clean numbered circle for top 3, muted number for rest */}
      <div style={{ width:28, textAlign:'center', flexShrink:0 }}>
        {isTop ? (
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: mc[p],
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 900,
            color: p === 1 ? '#1a1200' : '#0e1018',
            boxShadow: `0 0 10px ${mc[p]}60`,
          }}>{p}</div>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>{p}</span>
        )}
      </div>

      {/* Portrait */}
      <Portrait driverId={drv?.driverId} color={color.primary} size={48} />

      {/* Number */}
      <div style={{ width:28, height:20, borderRadius:6, flexShrink:0, background:`${color.primary}14`, border:`1px solid ${color.primary}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:900, color:color.primary }}>
        {drv?.permanentNumber}
      </div>

      {/* Flag + name + team */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <img src={flag} alt="" style={{ width:15, borderRadius:2, flexShrink:0 }} onError={e=>e.target.style.display='none'} />
          <span style={{ fontSize:13, fontWeight:800, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {drv?.givenName} <strong>{drv?.familyName}</strong>
          </span>
        </div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:3, background:color.bg, border:`1px solid ${color.primary}18`, borderRadius:99, padding:'1px 6px' }}>
          <div style={{ width:3, height:3, borderRadius:'50%', background:color.primary }} />
          <span style={{ fontSize:8, fontWeight:700, color:color.primary }}>{team?.name}</span>
        </div>
      </div>

      {/* Points */}
      <div style={{ textAlign:'right', flexShrink:0, minWidth:44 }}>
        <div style={{ fontSize:17, fontWeight:900, letterSpacing:-0.5, color: p===1?'#FFD700':'white' }}>{item.points}</div>
        <div style={{ fontSize:7, color:'rgba(255,255,255,0.2)', textTransform:'uppercase' }}>puan</div>
      </div>

      {/* Wins badge */}
      {parseInt(item.wins) > 0 && (
        <div style={{ background:'rgba(255,215,0,0.07)', border:'1px solid rgba(255,215,0,0.15)', borderRadius:7, padding:'2px 7px', flexShrink:0 }}>
          <div style={{ fontSize:12, fontWeight:900, color:'#FFD700', textAlign:'center' }}>{item.wins}</div>
          <div style={{ fontSize:6, color:'rgba(255,215,0,0.5)', textTransform:'uppercase', textAlign:'center' }}>zafer</div>
        </div>
      )}
    </div>
  );
}

// ─── Constructor table row ─────────────────────────────────────────────
function ConstructorRow({ item, idx, total }) {
  const p = parseInt(item.position);
  const team = item.Constructor;
  const color = getTeamColor(team?.name);
  const isTop = p <= 3;
  const mc = {1:'#FFD700', 2:'#C0C7D0', 3:'#CD853F'};

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:14, padding:'12px 16px',
      borderBottom: idx < total-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
      background: isTop ? `${color.primary}04` : 'transparent',
      position:'relative',
    }}>
      {isTop && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2.5, background:color.primary, boxShadow:`2px 0 8px ${color.primary}50` }} />}

      {/* Pos */}
      <div style={{ width:26, textAlign:'center', flexShrink:0, fontSize: isTop?15:11, fontWeight:900, color: isTop?mc[p]:'rgba(255,255,255,0.2)' }}>
        {isTop ? ['1','2','3'][p-1] : p}
      </div>

      {/* Logo */}
      <TeamLogo teamName={team?.name} color={color} />

      {/* Name */}
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:900, letterSpacing:-0.3 }}>{team?.name}</div>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{team?.nationality}</div>
      </div>

      {/* Points */}
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:19, fontWeight:900, letterSpacing:-0.5, color: p===1?'#FFD700':'white' }}>{item.points}</div>
        <div style={{ fontSize:7, color:'rgba(255,255,255,0.2)', textTransform:'uppercase' }}>puan</div>
      </div>

      {parseInt(item.wins) > 0 && (
        <div style={{ background:'rgba(255,215,0,0.07)', border:'1px solid rgba(255,215,0,0.15)', borderRadius:7, padding:'2px 7px', flexShrink:0 }}>
          <div style={{ fontSize:12, fontWeight:900, color:'#FFD700', textAlign:'center' }}>{item.wins}</div>
          <div style={{ fontSize:6, color:'rgba(255,215,0,0.5)', textTransform:'uppercase', textAlign:'center' }}>zafer</div>
        </div>
      )}
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────
export default function Standings() {
  const [tab, setTab] = useState('driver');
  const { standings: ds, loading: dL } = useDriverStandings();
  const { standings: cs, loading: cL } = useConstructorStandings();
  const loading = tab === 'driver' ? dL : cL;

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <div className="page-title-row">
            <h1>Sıralamalar</h1>
            <span className="page-chip">2026 Sezonu</span>
          </div>
          <p>Formula 1 Dünya Şampiyonası · Resmi İstatistikler</p>
        </div>

        {/* Podium */}
        {!dL && ds.length >= 3 && (
          <>
            <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Podyum</div>
            <PodiumStrip standings={ds} />
          </>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:11, padding:3 }}>
            {[{k:'driver',l:'Sürücüler'},{k:'constructor',l:'Takımlar'}].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{
                padding:'7px 18px', borderRadius:8, border:'none',
                background: tab===t.k ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: tab===t.k ? 'white' : 'rgba(255,255,255,0.35)',
                fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)',
                transition:'all 0.15s', boxShadow: tab===t.k ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              }}>{t.l}</button>
            ))}
          </div>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)' }}>{tab==='driver' ? ds.length : cs.length} kayıt</span>
        </div>

        {/* Table */}
        {loading ? <LoadingSpinner text="Yükleniyor..." /> : (
          <div style={{ background:'#0A0A0D', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, overflow:'hidden' }}>
            {tab === 'driver'
              ? ds.map((item, i) => <DriverRow key={item.Driver?.driverId} item={item} idx={i} total={ds.length} />)
              : cs.map((item, i) => <ConstructorRow key={item.Constructor?.constructorId} item={item} idx={i} total={cs.length} />)
            }
          </div>
        )}
      </div>
    </div>
  );
}
