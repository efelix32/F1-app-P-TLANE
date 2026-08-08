import React, { useState, useRef, useEffect } from 'react';
import { useDriverStandings, useConstructorStandings } from '../hooks/useJolpica';
import { useAuth } from '../contexts/AuthContext';
import { getTeamColor } from '../utils/teamColors';
import { getFlagUrl } from '../utils/formatters';
import { getDriverImageUrl, getDriverPortraitUrl, getTeamLogoUrl } from '../utils/driverImages';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useTheme } from '../hooks/useTheme';
import HelmetCollection from '../components/HelmetCollection';
import { requestNotificationPermission } from '../utils/notifications';

// ─── Avatar picker drivers ─────────────────────────────────────────────
const PICKER_DRIVERS = [
  { id: 'max_verstappen', name: 'Verstappen', num: 1  },
  { id: 'norris',         name: 'Norris',     num: 4  },
  { id: 'leclerc',        name: 'Leclerc',    num: 16 },
  { id: 'hamilton',       name: 'Hamilton',   num: 44 },
  { id: 'piastri',        name: 'Piastri',    num: 81 },
  { id: 'russell',        name: 'Russell',    num: 63 },
  { id: 'antonelli',      name: 'Antonelli',  num: 12 },
  { id: 'sainz',          name: 'Sainz',      num: 55 },
  { id: 'alonso',         name: 'Alonso',     num: 14 },
  { id: 'hadjar',         name: 'Hadjar',     num: 6  },
  { id: 'lawson',         name: 'Lawson',     num: 30 },
  { id: 'gasly',          name: 'Gasly',      num: 10 },
];

// ─── Theme options (real, via useTheme) ───────────────────────────────

// ─── Fan rank ──────────────────────────────────────────────────────────
function getFanRank(user) {
  const score = (user.favDrivers?.length || 0) * 2 + (user.favTeams?.length || 0) * 2 + (user.fantasyTeam ? 3 : 0) + (user.emailVerified ? 2 : 0);
  if (score >= 11) return { label: 'Grand Prix Efsanesi', color: '#FFD700',   rank: 4 };
  if (score >= 7)  return { label: 'Pit Lane Ustası',     color: '#00D2BE',   rank: 3 };
  if (score >= 3)  return { label: 'F1 Tutkunası',        color: '#FF8000',   rank: 2 };
  return               { label: 'Rookie Fan',             color: '#8899AA',   rank: 1 };
}

// ─── SVG Icons ─────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = 'currentColor' }) {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 };
  const p = { fill: 'none', stroke: color, strokeWidth: 1.65, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'edit':   return <svg {...s} viewBox="0 0 20 20" {...p}><path d="M14 3l3 3-9 9H5v-3l9-9z"/><path d="M12 5l3 3"/></svg>;
    case 'check':  return <svg {...s} viewBox="0 0 20 20" {...p}><path d="M4 10l5 5 7-8"/></svg>;
    case 'mail':   return <svg {...s} viewBox="0 0 20 20" {...p}><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M2 7l8 5 8-5"/></svg>;
    case 'lock':   return <svg {...s} viewBox="0 0 20 20" {...p}><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V6a3 3 0 016 0v3"/></svg>;
    case 'star':   return <svg {...s} viewBox="0 0 20 20" {...p}><path d="M10 1.5l2.5 5 5.5.8-4 3.9.9 5.5L10 14.4l-4.9 2.8.9-5.5-4-3.9 5.5-.8z"/></svg>;
    case 'user':   return <svg {...s} viewBox="0 0 20 20" {...p}><circle cx="10" cy="6.5" r="3.5"/><path d="M2.5 18c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5"/></svg>;
    case 'camera': return <svg {...s} viewBox="0 0 20 20" {...p}><path d="M2 7c0-1.1.9-2 2-2h.8l1.4-2h7.6l1.4 2H16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"/><circle cx="10" cy="11" r="2.8"/></svg>;
    case 'logout': return <svg {...s} viewBox="0 0 20 20" {...p}><path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3M13 6l4 4-4 4M17 10H8"/></svg>;
    case 'shield': return <svg {...s} viewBox="0 0 20 20" {...p}><path d="M10 1.5L17.5 4.5V9c0 4.5-3.5 7.5-7.5 9-4-1.5-7.5-4.5-7.5-9V4.5L10 1.5z"/></svg>;
    case 'heart':  return <svg {...s} viewBox="0 0 20 20" {...p}><path d="M10 16.5S2 12 2 6.5A4.5 4.5 0 0110 4a4.5 4.5 0 018 2.5C18 12 10 16.5 10 16.5z"/></svg>;
    case 'bell':   return <svg {...s} viewBox="0 0 20 20" {...p}><path d="M10 2a4 4 0 00-4 4v5l-2 2v1h12v-1l-2-2V6a4 4 0 00-4-4zM7 16a3 3 0 006 0"/></svg>;
    default: return null;
  }
}

// ─── Avatar Picker Modal ───────────────────────────────────────────────
function AvatarPickerModal({ onClose, onSave }) {
  const [tab, setTab] = useState('driver');
  const [preview, setPreview] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const fileRef = useRef(null);

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => { setPreview(ev.target.result); setSelectedId(null); };
    r.readAsDataURL(file);
  };

  const handlePick = d => {
    setSelectedId(d.id);
    setPreview(getDriverPortraitUrl(d.id) || getDriverImageUrl(d.id));
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.88)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:460, background:'#0C0C12', border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 22px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize:15, fontWeight:800 }}>Profil Fotoğrafı</div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:'50%', width:30, height:30, cursor:'pointer', color:'rgba(255,255,255,0.7)', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        {/* Preview */}
        <div style={{ display:'flex', justifyContent:'center', padding:'20px 0 14px' }}>
          <div style={{ width:84, height:84, borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(255,255,255,0.15)', background:'#1a1a22', flexShrink:0 }}>
            {preview
              ? <img src={preview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'rgba(255,255,255,0.2)' }}>?</div>
            }
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', margin:'0 20px 14px', background:'rgba(255,255,255,0.04)', borderRadius:12, padding:3 }}>
          {[['driver','Pilot Seç'], ['upload','Fotoğraf Yükle']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex:1, padding:'8px 0', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'var(--font)', transition:'all 0.2s', background: tab === id ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === id ? 'white' : 'rgba(255,255,255,0.4)' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding:'0 20px 20px' }}>
          {tab === 'driver' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, maxHeight:240, overflowY:'auto' }}>
              {PICKER_DRIVERS.map(d => {
                const portrait = getDriverPortraitUrl(d.id);
                const isStanding = !portrait;
                const img = portrait || getDriverImageUrl(d.id);
                const sel = selectedId === d.id;
                return (
                  <div key={d.id} onClick={() => handlePick(d)} style={{ position:'relative', borderRadius:12, overflow:'hidden', cursor:'pointer', border:`1.5px solid ${sel ? '#E10600' : 'rgba(255,255,255,0.07)'}`, height:80, background:'#0E0E14', transition:'all 0.18s', transform: sel ? 'scale(1.04)' : 'scale(1)' }}>
                    {img && <img src={img} alt={d.name} style={isStanding ? { position:'absolute', right:-10, top:5, height:'140%', width:'140%', objectFit:'cover', objectPosition:'top center' } : { position:'absolute', right:0, top:0, height:'100%', width:'70%', objectFit:'contain', objectPosition:'top center' }} />}
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,#0E0E14 30%, transparent 75%)' }} />
                    <div style={{ position:'absolute', bottom:7, left:8, fontSize:9, fontWeight:800, lineHeight:1.2 }}>{d.name}</div>
                    {sel && <div style={{ position:'absolute', top:6, right:6, width:16, height:16, borderRadius:'50%', background:'#E10600', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="check" size={10} color="white"/></div>}
                  </div>
                );
              })}
            </div>
          )}
          {tab === 'upload' && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'20px 0' }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
              <button onClick={() => fileRef.current?.click()} style={{ padding:'12px 28px', borderRadius:12, border:'1.5px dashed rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)', display:'flex', alignItems:'center', gap:8 }}>
                <Icon name="camera" size={16}/> Dosya Seç
              </button>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>JPG, PNG, GIF — maks 5MB</div>
            </div>
          )}
          <button onClick={() => { if (preview) onSave(preview); onClose(); }} disabled={!preview} style={{ width:'100%', marginTop:16, padding:'13px 0', borderRadius:12, border:'none', background: preview ? 'linear-gradient(135deg, #E10600, #B00500)' : 'rgba(255,255,255,0.06)', color: preview ? 'white' : 'rgba(255,255,255,0.3)', fontSize:13, fontWeight:800, cursor: preview ? 'pointer' : 'not-allowed', fontFamily:'var(--font)', transition:'all 0.2s' }}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email Verify Modal ────────────────────────────────────────────────
function EmailVerifyModal({ email, onClose, onVerified }) {
  const [step, setStep] = useState('send'); // 'send' | 'enter'
  const [code, setCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = () => {
    setLoading(true);
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setCode(generated);
    // Store with 10-min expiry
    localStorage.setItem(`pl_verify_${email}`, JSON.stringify({ code: generated, expires: Date.now() + 600000 }));
    setTimeout(() => { setLoading(false); setStep('enter'); }, 1200);
  };

  const checkCode = () => {
    const stored = JSON.parse(localStorage.getItem(`pl_verify_${email}`) || 'null');
    if (!stored || Date.now() > stored.expires) { setError('Kodun süresi doldu. Tekrar gönderin.'); return; }
    if (inputCode !== stored.code) { setError('Hatalı kod. Tekrar deneyin.'); return; }
    localStorage.removeItem(`pl_verify_${email}`);
    onVerified();
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.88)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:380, background:'#0C0C12', border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, overflow:'hidden' }}>
        <div style={{ padding:'28px 28px 24px' }}>
          <div style={{ width:52, height:52, borderRadius:16, background:'rgba(225,6,0,0.12)', border:'1px solid rgba(225,6,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
            <Icon name="mail" size={22} color="#E10600"/>
          </div>

          {step === 'send' ? (
            <>
              <div style={{ fontSize:17, fontWeight:800, marginBottom:6 }}>E-postayı Doğrula</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:22, lineHeight:1.6 }}>
                <strong style={{ color:'rgba(255,255,255,0.8)' }}>{email}</strong> adresinize 6 haneli doğrulama kodu göndereceğiz.
              </div>
              <button onClick={sendCode} disabled={loading} style={{ width:'100%', padding:'13px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg, #E10600, #B00500)', color:'white', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'var(--font)', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Gönderiliyor...' : 'Kodu Gönder'}
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize:17, fontWeight:800, marginBottom:6 }}>Kodu Girin</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:10, lineHeight:1.6 }}>
                {email} adresine kod gönderildi.
              </div>
              {/* Demo only: show code since no real backend */}
              <div style={{ background:'rgba(255,200,0,0.08)', border:'1px solid rgba(255,200,0,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:18, fontSize:11, color:'rgba(255,200,0,0.8)' }}>
                Demo modu: Kodunuz <strong style={{ fontSize:16, letterSpacing:3 }}>{code}</strong>
              </div>
              <input
                type="text" maxLength={6} value={inputCode} onChange={e => { setInputCode(e.target.value.replace(/\D/g,'')); setError(''); }}
                placeholder="000000"
                style={{ width:'100%', padding:'14px 16px', borderRadius:12, border:`1.5px solid ${error ? '#E10600' : 'rgba(255,255,255,0.1)'}`, background:'rgba(255,255,255,0.04)', color:'white', fontSize:22, fontWeight:800, letterSpacing:8, textAlign:'center', fontFamily:'var(--font)', boxSizing:'border-box', marginBottom:8, outline:'none' }}
              />
              {error && <div style={{ fontSize:11, color:'#E10600', marginBottom:8 }}>{error}</div>}
              <button onClick={checkCode} style={{ width:'100%', padding:'13px 0', borderRadius:12, border:'none', background: inputCode.length === 6 ? 'linear-gradient(135deg, #E10600, #B00500)' : 'rgba(255,255,255,0.06)', color: inputCode.length === 6 ? 'white' : 'rgba(255,255,255,0.3)', fontSize:13, fontWeight:800, cursor: inputCode.length === 6 ? 'pointer' : 'not-allowed', fontFamily:'var(--font)', transition:'all 0.2s', marginBottom:8 }}>
                Doğrula
              </button>
              <button onClick={() => { setStep('send'); setInputCode(''); setError(''); }} style={{ width:'100%', padding:'10px 0', borderRadius:12, border:'none', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' }}>
                Tekrar gönder
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Driver pick card ──────────────────────────────────────────────────
function DriverPickCard({ item, selected, onToggle, disabled }) {
  const drv = item.Driver;
  const team = item.Constructors?.[0];
  const color = getTeamColor(team?.name);
  const portraitUrl = getDriverPortraitUrl(drv?.driverId);
  const isStanding = !portraitUrl;
  const imgUrl = portraitUrl || getDriverImageUrl(drv?.driverId);
  const flag = getFlagUrl(drv?.nationality);
  const isSelected = selected.includes(drv?.driverId);
  const isDisabled = disabled && !isSelected;

  return (
    <div onClick={() => !isDisabled && onToggle(drv?.driverId)} style={{ position:'relative', overflow:'hidden', borderRadius:14, cursor: isDisabled ? 'not-allowed' : 'pointer', background: isSelected ? `linear-gradient(135deg, ${color.bg}, #0a0a0d)` : '#0D0D12', border:`1px solid ${isSelected ? color.primary : 'rgba(255,255,255,0.07)'}`, opacity: isDisabled ? 0.35 : 1, transition:'all 0.2s', transform: isSelected ? 'scale(1.02)' : 'scale(1)', boxShadow: isSelected ? `0 8px 30px ${color.primary}20` : 'none', height:80 }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background: isSelected ? color.primary : 'rgba(255,255,255,0.08)', borderRadius:'3px 0 0 3px' }} />
      {imgUrl && (
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width: isStanding ? '50%' : '44%', overflow:'hidden', opacity: isSelected ? 0.95 : 0.3 }}>
          <img src={imgUrl} alt="" style={isStanding ? { position:'absolute', right:-15, top:10, height:'150%', width:'150%', objectFit:'cover', objectPosition:'top center' } : { position:'absolute', right:-8, bottom:-4, height:'145%', width:'auto', objectFit:'contain', objectPosition:'bottom' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, #0D0D12 0%, transparent 55%)' }} />
        </div>
      )}
      <div style={{ padding:'10px 12px', position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
          <img src={flag} alt="" style={{ width:13, borderRadius:2 }} onError={e => e.target.style.display='none'} />
          <span style={{ fontSize:9, fontWeight:900, color:color.primary }}>#{drv?.permanentNumber}</span>
        </div>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', lineHeight:1 }}>{drv?.givenName}</div>
        <div style={{ fontSize:13, fontWeight:900, lineHeight:1.1 }}>{drv?.familyName}</div>
      </div>
      {isSelected && <div style={{ position:'absolute', top:7, right:7, width:17, height:17, borderRadius:'50%', background:color.primary, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="check" size={10} color="white"/></div>}
    </div>
  );
}

// ─── Team pick card ────────────────────────────────────────────────────
function TeamPickCard({ item, selected, onToggle, disabled }) {
  const team = item.Constructor;
  const color = getTeamColor(team?.name);
  const logo = getTeamLogoUrl(team?.name);
  const isSelected = selected.includes(team?.constructorId);
  const isDisabled = disabled && !isSelected;

  return (
    <div onClick={() => !isDisabled && onToggle(team?.constructorId)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, cursor: isDisabled ? 'not-allowed' : 'pointer', background: isSelected ? color.bg : 'rgba(255,255,255,0.03)', border:`1px solid ${isSelected ? color.primary+'50' : 'rgba(255,255,255,0.07)'}`, opacity: isDisabled ? 0.35 : 1, transition:'all 0.2s', boxShadow: isSelected ? `0 4px 20px ${color.primary}15` : 'none' }}>
      <div style={{ width:3, height:32, borderRadius:99, background: isSelected ? color.primary : 'rgba(255,255,255,0.1)', flexShrink:0 }} />
      {logo ? <img src={logo} alt={team?.name} style={{ height:16, objectFit:'contain', opacity: isSelected ? 1 : 0.45 }} onError={e => e.target.style.display='none'} /> : <span style={{ fontSize:11, fontWeight:900, color:color.primary }}>{team?.name?.slice(0,3).toUpperCase()}</span>}
      <span style={{ fontSize:11, fontWeight:700, flex:1 }}>{team?.name}</span>
      <span style={{ fontSize:11, fontWeight:900, color: isSelected ? '#FFD700' : 'rgba(255,255,255,0.25)' }}>{item.points}p</span>
      {isSelected && <Icon name="check" size={14} color={color.primary}/>}
    </div>
  );
}

// ─── Fav Driver Card ───────────────────────────────────────────────────
function FavDriverCard({ item }) {
  const drv = item.Driver;
  const team = item.Constructors?.[0];
  const color = getTeamColor(team?.name);
  let isStanding = false;
  let img = getDriverPortraitUrl(drv?.driverId);
  if (!img) {
    img = getDriverImageUrl(drv?.driverId);
    isStanding = true;
  }
  const flag = getFlagUrl(drv?.nationality);

  const imgStyle = isStanding
    ? { position:'absolute', right:-15, top:10, height:'140%', width:'140%', objectFit:'cover', objectPosition:'top center', filter:'drop-shadow(-8px 0 20px rgba(0,0,0,0.85)) saturate(1.15) contrast(1.05)', zIndex:1 }
    : { position:'absolute', right:-10, bottom:0, height:'95%', width:'auto', objectFit:'contain', objectPosition:'bottom center', filter:'drop-shadow(-8px 0 20px rgba(0,0,0,0.85)) saturate(1.15) contrast(1.05)', zIndex:1 };

  return (
    <div style={{ flex:1, position:'relative', overflow:'hidden', borderRadius:22, minHeight:180, background:`linear-gradient(160deg, ${color.bg} 0%, #050508 100%)`, border:`1px solid ${color.primary}40`, boxShadow:`0 12px 36px ${color.primary}15`, minWidth:145, transition:'transform 0.2s', cursor:'pointer' }} className="card--lift">
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${color.primary}, transparent)` }} />
      <div style={{ position:'absolute', right:-15, bottom:-25, fontSize:130, fontWeight:900, fontStyle:'italic', color:color.primary, opacity:0.08, letterSpacing:-12, lineHeight:1, userSelect:'none', textShadow:`0 0 40px ${color.primary}` }}>{drv?.permanentNumber}</div>
      {img && (
        <>
          <img src={img} alt="" style={imgStyle} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(5,5,8,0.98) 35%, rgba(5,5,8,0.4) 65%, transparent 100%)', zIndex:2 }} />
        </>
      )}
      <div style={{ position:'relative', zIndex:3, padding:'18px 20px 20px', display:'flex', flexDirection:'column', height:'100%', justifyContent:'space-between' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
            <img src={flag} alt="" style={{ width:16, borderRadius:2, boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }} onError={e => e.target.style.display='none'} />
            <span style={{ fontSize:9, color:color.primary, fontWeight:900, textTransform:'uppercase', letterSpacing:0.8 }}>#{drv?.permanentNumber}</span>
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', lineHeight:1 }}>{drv?.givenName}</div>
          <div style={{ fontSize:20, fontWeight:900, letterSpacing:-0.5, lineHeight:1.1, marginBottom:12 }}>{drv?.familyName}</div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.06)', backdropFilter:'blur(10px)', border:`1px solid rgba(255,255,255,0.1)`, borderRadius:99, padding:'3px 10px' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:color.primary, boxShadow:`0 0 8px ${color.primary}` }} />
            <span style={{ fontSize:8, fontWeight:700, color:'rgba(255,255,255,0.8)', letterSpacing:0.3 }}>{team?.name}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:16, marginTop:24 }}>
          <div><div style={{ fontSize:22, fontWeight:900, letterSpacing:-1, color: parseInt(item.position)===1 ? '#FFD700' : color.primary, textShadow:`0 0 16px ${parseInt(item.position)===1 ? 'rgba(255,215,0,0.3)' : color.primary+'40'}` }}>{item.points}</div><div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.6 }}>Puan</div></div>
          <div><div style={{ fontSize:22, fontWeight:900, letterSpacing:-1, color:'rgba(255,255,255,0.7)' }}>P{item.position}</div><div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.6 }}>Sıra</div></div>
          {parseInt(item.wins) > 0 && <div><div style={{ fontSize:22, fontWeight:900, letterSpacing:-1, color:'#FFD700' }}>{item.wins}</div><div style={{ fontSize:8, color:'rgba(255,215,0,0.4)', textTransform:'uppercase', letterSpacing:0.6 }}>Zafer</div></div>}
        </div>
      </div>
    </div>
  );
}

// ─── Section label ─────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:1.2, marginBottom:10 }}>{children}</div>;
}

// ─── Support Banner ────────────────────────────────────────────────────
export function SupportBanner({ user, driverStandings, teamStandings }) {
  if (!user || (!user.favDrivers?.length && !user.favTeams?.length)) return null;
  const favDrvItems = (user.favDrivers || []).map(id => driverStandings.find(d => d.Driver?.driverId === id)).filter(Boolean);
  const favTeamItems = (user.favTeams || []).map(id => teamStandings.find(t => t.Constructor?.constructorId === id)).filter(Boolean);

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', padding:'10px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, marginBottom:20 }}>
      <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.8 }}>Destekliyorsun</span>
      {favDrvItems.map(item => {
        const drv = item.Driver;
        const color = getTeamColor(item.Constructors?.[0]?.name);
        const flag = getFlagUrl(drv?.nationality);
        return (
          <div key={drv.driverId} style={{ display:'flex', alignItems:'center', gap:4, background:`${color.primary}12`, border:`1px solid ${color.primary}25`, borderRadius:20, padding:'3px 10px' }}>
            <img src={flag} alt="" style={{ width:12, borderRadius:2 }} onError={e => e.target.style.display='none'} />
            <span style={{ fontSize:11, fontWeight:800, color:color.primary }}>{drv.code || drv.familyName}</span>
            <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>P{item.position}</span>
          </div>
        );
      })}
      {favTeamItems.map(item => {
        const team = item.Constructor;
        const color = getTeamColor(team?.name);
        return (
          <div key={team.constructorId} style={{ display:'flex', alignItems:'center', gap:4, background:`${color.primary}12`, border:`1px solid ${color.primary}25`, borderRadius:20, padding:'3px 10px' }}>
            <span style={{ fontSize:11, fontWeight:800, color:color.primary }}>{team.name}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Profile Page ─────────────────────────────────────────────────
export default function Profile() {
  const { user, updateProfile, logout, openAuth } = useAuth();
  const { standings: ds } = useDriverStandings();
  const { standings: cs } = useConstructorStandings();
  const [tab, setTab] = useState('profile');       // 'profile' | 'favorites' | 'settings'
  const [favTab, setFavTab] = useState('drivers'); // 'drivers' | 'teams'
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(false);
  const [bioVal, setBioVal] = useState(user?.bio || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const toast = (msg, dur = 2500) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), dur); };

  useEffect(() => { setNameVal(user?.name || ''); setBioVal(user?.bio || ''); }, [user]);

  // ── Unauthenticated ──────────────────────────────────────────────────
  if (!user) return (
    <div className="page-content">
      <div className="container">
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'65vh', gap:20, textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:22, background:'rgba(225,6,0,0.1)', border:'1px solid rgba(225,6,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="user" size={32} color="#E10600"/>
          </div>
          <div>
            <div style={{ fontSize:24, fontWeight:900, letterSpacing:-0.5, marginBottom:8 }}>PitLane'e Hoş Geldin</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', maxWidth:280, lineHeight:1.6 }}>Favori pilotlarını kaydet, sezon tahminleri yap, fantezi takım kur.</div>
          </div>
          <button onClick={openAuth} style={{ padding:'14px 36px', borderRadius:14, border:'none', background:'linear-gradient(135deg, #E10600, #B00500)', color:'white', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'var(--font)', boxShadow:'0 8px 24px rgba(225,6,0,0.3)', letterSpacing:0.2 }}>
            Giriş Yap / Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  );

  const { theme: activeTheme, changeTheme, themes: THEMES } = useTheme();
  const themeColor = THEMES.find(t => t.id === activeTheme)?.color || '#E10600';
  const fanRank = getFanRank(user);
  
  // TEMİZLİK: Geçersiz veya eski verileri filtrele
  const validFavDrivers = (user?.favDrivers || []).filter(id => ds.some(d => d.Driver?.driverId === id));
  const validFavTeams = (user?.favTeams || []).filter(id => cs.some(c => c.Constructor?.constructorId === id));

  const toggleFavDriver = id => {
    const cur = validFavDrivers;
    updateProfile({ favDrivers: cur.includes(id) ? cur.filter(x => x !== id) : cur.length >= 3 ? cur : [...cur, id] });
  };
  const toggleFavTeam = id => {
    const cur = validFavTeams;
    updateProfile({ favTeams: cur.includes(id) ? cur.filter(x => x !== id) : cur.length >= 2 ? cur : [...cur, id] });
  };
  
  const favDrvItems = validFavDrivers.map(id => ds.find(d => d.Driver?.driverId === id)).filter(Boolean);
  const favTeamItems = validFavTeams.map(id => cs.find(t => t.Constructor?.constructorId === id)).filter(Boolean);
  const joinDate = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : '2026';

  const saveName = () => { if (nameVal.trim()) { updateProfile({ name: nameVal.trim(), avatar: nameVal.trim().split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() }); toast('İsim güncellendi'); } setEditName(false); };
  const saveBio  = () => { updateProfile({ bio: bioVal }); toast('Biyografi güncellendi'); setEditBio(false); };

  const TABS = [
    { id:'profile',   label:'Profil'    },
    { id:'favorites', label:'Favoriler' },
    { id:'settings',  label:'Ayarlar'   },
  ];

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth:760 }}>

        {/* ── HERO CARD ── */}
        <div style={{ position:'relative', borderRadius:24, overflow:'hidden', marginBottom:20, background:'#08080E', border:'1px solid rgba(255,255,255,0.07)' }}>

          {/* Gradient banner */}
          <div style={{ height:100, background:`linear-gradient(135deg, ${themeColor}40 0%, ${themeColor}10 50%, transparent 100%)`, position:'relative' }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, #08080E 100%)' }} />
          </div>

          {/* Avatar */}
          <div style={{ position:'absolute', top:50, left:28 }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', border:`3px solid ${themeColor}`, background:'#12121A', overflow:'hidden', boxShadow:`0 0 0 4px #08080E, 0 8px 32px ${themeColor}30` }}>
                {user.customAvatar
                  ? <img src={user.customAvatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:900, color:themeColor }}>{user.avatar || user.name?.[0] || '?'}</div>
                }
              </div>
              <button onClick={() => setShowAvatarPicker(true)} style={{ position:'absolute', bottom:-3, right:-3, width:26, height:26, borderRadius:'50%', background:themeColor, border:'2.5px solid #08080E', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="camera" size={12} color="white"/>
              </button>
            </div>
          </div>

          {/* Rank badge top-right */}
          <div style={{ position:'absolute', top:14, right:18 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:`${fanRank.color}15`, border:`1px solid ${fanRank.color}30`, borderRadius:20, padding:'5px 12px' }}>
              <Icon name="star" size={11} color={fanRank.color}/>
              <span style={{ fontSize:10, fontWeight:800, color:fanRank.color }}>{fanRank.label}</span>
            </div>
          </div>

          {/* Name / info */}
          <div style={{ padding:'18px 28px 20px', marginTop:22 }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:22, fontWeight:900, letterSpacing:-0.5 }}>{user.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{user.email}</span>
                  {user.emailVerified && (
                    <div style={{ display:'inline-flex', alignItems:'center', gap:3, background:'rgba(0,200,130,0.1)', border:'1px solid rgba(0,200,130,0.25)', borderRadius:10, padding:'1px 7px' }}>
                      <Icon name="check" size={10} color="#00C882"/>
                      <span style={{ fontSize:9, fontWeight:700, color:'#00C882' }}>Doğrulandı</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:4 }}>Üye: {joinDate}</div>
              </div>
              {/* Quick stats */}
              <div style={{ display:'flex', gap:20, paddingBottom:2 }}>
                {[
                  { label:'Pilot', val: validFavDrivers.length },
                  { label:'Takım',  val: validFavTeams.length  },
                  { label:'Fantezi', val: user.fantasyTeam ? 1 : 0  },
                ].map(s => (
                  <div key={s.label} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:900, color: s.val > 0 ? themeColor : 'rgba(255,255,255,0.2)' }}>{s.val}</div>
                    <div style={{ fontSize:8, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            {user.bio && !editBio && (
              <div style={{ marginTop:12, fontSize:12, color:'rgba(255,255,255,0.5)', lineHeight:1.5, fontStyle:'italic' }}>"{user.bio}"</div>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:14, padding:3, marginBottom:20 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'10px 0', borderRadius:12, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'var(--font)', transition:'all 0.2s', background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === t.id ? 'white' : 'rgba(255,255,255,0.4)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: PROFIL ── */}
        {tab === 'profile' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Fav driver showcase */}
            {favDrvItems.length > 0 && (
              <div>
                <SectionLabel>Desteklediğin Pilotlar</SectionLabel>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {favDrvItems.map(item => <FavDriverCard key={item.Driver?.driverId} item={item} />)}
                </div>
              </div>
            )}

            {/* Fav teams */}
            {favTeamItems.length > 0 && (
              <div>
                <SectionLabel>Desteklediğin Takımlar</SectionLabel>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {favTeamItems.map(item => {
                    const team = item.Constructor;
                    const color = getTeamColor(team?.name);
                    const logo = getTeamLogoUrl(team?.name);
                    return (
                      <div key={team.constructorId} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:color.bg, border:`1px solid ${color.primary}25`, borderRadius:14 }}>
                        <div style={{ width:3, height:32, borderRadius:99, background:color.primary, flexShrink:0 }} />
                        {logo ? <img src={logo} alt={team.name} style={{ height:18, objectFit:'contain' }} onError={e => e.target.style.display='none'} /> : null}
                        <span style={{ fontSize:13, fontWeight:700, flex:1 }}>{team.name}</span>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:18, fontWeight:900, color:color.primary }}>{item.points}</div>
                          <div style={{ fontSize:7, color:'rgba(255,255,255,0.25)', textTransform:'uppercase' }}>Puan · P{item.position}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {favDrvItems.length === 0 && favTeamItems.length === 0 && (
              <div style={{ padding:'40px 0', textAlign:'center' }}>
                <div style={{ width:52, height:52, borderRadius:16, background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}><Icon name="heart" size={22} color="rgba(255,255,255,0.2)"/></div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>Henüz favori eklenmedi</div>
                <button onClick={() => setTab('favorites')} style={{ marginTop:12, padding:'9px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' }}>Favori Ekle</button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: FAVORİLER ── */}
        {tab === 'favorites' && (
          <div>
            <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:12, padding:3, marginBottom:16 }}>
              {[['drivers','Pilotlar (maks 3)'],['teams','Takımlar (maks 2)']].map(([id, label]) => (
                <button key={id} onClick={() => setFavTab(id)} style={{ flex:1, padding:'8px 0', borderRadius:10, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'var(--font)', transition:'all 0.2s', background: favTab===id ? 'rgba(255,255,255,0.1)' : 'transparent', color: favTab===id ? 'white' : 'rgba(255,255,255,0.4)' }}>
                  {label}
                </button>
              ))}
            </div>

            {favTab === 'drivers' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8 }}>
                {ds.map(item => <DriverPickCard key={item.Driver?.driverId} item={item} selected={validFavDrivers} onToggle={toggleFavDriver} disabled={validFavDrivers.length >= 3} />)}
              </div>
            )}
            {favTab === 'teams' && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {cs.map(item => <TeamPickCard key={item.Constructor?.constructorId} item={item} selected={validFavTeams} onToggle={toggleFavTeam} disabled={validFavTeams.length >= 2} />)}
              </div>
            )}
            {favTab === 'helmets' && (
              <HelmetCollection favDrivers={user.favDrivers || []} />
            )}
          </div>
        )}

        {/* ── TAB: AYARLAR ── */}
        {tab === 'settings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

            {/* Profile info */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:10 }}>
                <Icon name="user" size={15} color="rgba(255,255,255,0.4)"/>
                <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.8 }}>Profil Bilgileri</span>
              </div>

              {/* Name */}
              <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:6 }}>Ad Soyad</div>
                {editName ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <input value={nameVal} onChange={e => setNameVal(e.target.value)} onKeyDown={e => e.key==='Enter' && saveName()} autoFocus style={{ flex:1, padding:'9px 12px', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.06)', color:'white', fontSize:13, fontFamily:'var(--font)', outline:'none' }} />
                    <button onClick={saveName} style={{ padding:'9px 16px', borderRadius:10, border:'none', background:themeColor, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)' }}>Kaydet</button>
                    <button onClick={() => setEditName(false)} style={{ padding:'9px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' }}>İptal</button>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:14, fontWeight:700 }}>{user.name}</span>
                    <button onClick={() => setEditName(true)} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.5)', fontSize:11, cursor:'pointer', fontFamily:'var(--font)' }}>
                      <Icon name="edit" size={12} color="currentColor"/> Düzenle
                    </button>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:6 }}>Biyografi</div>
                {editBio ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <textarea value={bioVal} onChange={e => setBioVal(e.target.value)} rows={3} maxLength={150} placeholder="Kendini anlat..." style={{ padding:'9px 12px', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.06)', color:'white', fontSize:12, fontFamily:'var(--font)', resize:'none', outline:'none' }} />
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={saveBio} style={{ padding:'9px 16px', borderRadius:10, border:'none', background:themeColor, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)' }}>Kaydet</button>
                      <button onClick={() => setEditBio(false)} style={{ padding:'9px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' }}>İptal</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:12, color: user.bio ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)', fontStyle: user.bio ? 'normal' : 'italic' }}>{user.bio || 'Biyografi eklenmemiş'}</span>
                    <button onClick={() => setEditBio(true)} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.5)', fontSize:11, cursor:'pointer', fontFamily:'var(--font)', flexShrink:0, marginLeft:10 }}>
                      <Icon name="edit" size={12} color="currentColor"/> {user.bio ? 'Düzenle' : 'Ekle'}
                    </button>
                  </div>
                )}
              </div>

              {/* Theme */}
              <div style={{ padding:'14px 18px' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:10 }}>Uygulama Teması</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => changeTheme(t.id)} title={t.label} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 2px',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: t.color,
                        border: `3px solid ${activeTheme === t.id ? 'white' : 'transparent'}`,
                        boxShadow: activeTheme === t.id ? `0 0 0 2px ${t.color}60, 0 4px 12px ${t.color}50` : `0 2px 8px ${t.color}40`,
                        transition: 'all 0.2s', transform: activeTheme === t.id ? 'scale(1.18)' : 'scale(1)',
                      }} />
                      <span style={{ fontSize: 9, color: activeTheme === t.id ? 'white' : 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Security */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:10 }}>
                <Icon name="shield" size={15} color="rgba(255,255,255,0.4)"/>
                <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.8 }}>Güvenlik</span>
              </div>

              {/* Email verify */}
              <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>E-posta Doğrulama</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{user.email}</div>
                  </div>
                  {user.emailVerified ? (
                    <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(0,200,130,0.1)', border:'1px solid rgba(0,200,130,0.25)', borderRadius:10, padding:'6px 12px' }}>
                      <Icon name="check" size={13} color="#00C882"/>
                      <span style={{ fontSize:11, fontWeight:700, color:'#00C882' }}>Doğrulandı</span>
                    </div>
                  ) : (
                    <button onClick={() => setShowEmailVerify(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid rgba(225,6,0,0.3)', background:'rgba(225,6,0,0.08)', color:'#E10600', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)' }}>
                      <Icon name="mail" size={13} color="#E10600"/> Doğrula
                    </button>
                  )}
                </div>
              </div>

              {/* Logout */}
              <div style={{ padding:'14px 18px' }}>
                <button onClick={() => { logout(); }} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', borderRadius:11, border:'1px solid rgba(255,60,60,0.2)', background:'rgba(255,60,60,0.06)', color:'rgba(255,80,80,0.8)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)', transition:'all 0.2s' }}>
                  <Icon name="logout" size={15} color="currentColor"/> Çıkış Yap
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, overflow:'hidden', marginBottom: 20 }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:10 }}>
                <Icon name="bell" size={15} color="rgba(255,255,255,0.4)"/>
                <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.8 }}>Bildirimler</span>
              </div>
              <div style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'white' }}>Yarış Bildirimleri</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Yarışlardan 15 dk önce haber ver</div>
                </div>
                <button
                  onClick={async () => {
                    if (user.fcmToken) {
                      updateProfile({ fcmToken: null });
                      toast("Bildirimler kapatıldı");
                    } else {
                      const token = await requestNotificationPermission();
                      if (token) {
                        updateProfile({ fcmToken: token });
                        toast("Bildirimler başarıyla açıldı!");
                      } else {
                        toast("Bildirim izni reddedildi veya hata oluştu.");
                      }
                    }
                  }}
                  style={{
                    padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700, fontSize: 11,
                    background: user.fcmToken ? themeColor : 'rgba(255,255,255,0.1)',
                    color: user.fcmToken ? 'white' : 'rgba(255,255,255,0.6)',
                    transition: 'all 0.2s'
                  }}
                >
                  {user.fcmToken ? 'AÇIK' : 'KAPALI'}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Toast */}
        {toastMsg && (
          <div style={{ position:'fixed', bottom:30, left:'50%', transform:'translateX(-50%)', background:'rgba(20,20,30,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 22px', fontSize:13, fontWeight:700, color:'white', zIndex:9999, backdropFilter:'blur(20px)', animation:'bbSlideUp 0.25s ease', boxShadow:'0 8px 32px rgba(0,0,0,0.5)', whiteSpace:'nowrap' }}>
            {toastMsg}
          </div>
        )}

      </div>

      {/* Modals */}
      {showAvatarPicker && <AvatarPickerModal onClose={() => setShowAvatarPicker(false)} onSave={img => { updateProfile({ customAvatar: img }); toast('Profil fotoğrafı güncellendi'); }} />}
      {showEmailVerify && <EmailVerifyModal email={user.email} onClose={() => setShowEmailVerify(false)} onVerified={() => { updateProfile({ emailVerified: true }); toast('E-posta doğrulandı!'); }} />}
    </div>
  );
}
