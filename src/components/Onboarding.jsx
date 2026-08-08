import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TEAMS_2026 = [
  { id: 'Ferrari', name: 'Ferrari', color: '#E8002D' },
  { id: 'Mercedes', name: 'Mercedes', color: '#00D2BE' },
  { id: 'McLaren', name: 'McLaren', color: '#FF8000' },
  { id: 'Red Bull Racing', name: 'Red Bull', color: '#3671C6' },
  { id: 'Aston Martin', name: 'Aston Martin', color: '#229971' },
  { id: 'Alpine', name: 'Alpine', color: '#0093CC' },
  { id: 'Williams', name: 'Williams', color: '#64C4FF' },
  { id: 'Racing Bulls', name: 'Racing Bulls', color: '#6692FF' },
  { id: 'Haas F1 Team', name: 'Haas', color: '#B6BABD' },
  { id: 'Audi', name: 'Audi', color: '#F50538' },
  { id: 'Cadillac', name: 'Cadillac', color: '#FFFFFF' },
];

const DRIVERS_2026 = [
  { id: 'max_verstappen', name: 'Max Verstappen', team: 'Red Bull Racing', number: 1 },
  { id: 'hamilton', name: 'Lewis Hamilton', team: 'Ferrari', number: 44 },
  { id: 'leclerc', name: 'Charles Leclerc', team: 'Ferrari', number: 16 },
  { id: 'norris', name: 'Lando Norris', team: 'McLaren', number: 4 },
  { id: 'piastri', name: 'Oscar Piastri', team: 'McLaren', number: 81 },
  { id: 'russell', name: 'George Russell', team: 'Mercedes', number: 63 },
  { id: 'antonelli', name: 'Kimi Antonelli', team: 'Mercedes', number: 12 },
  { id: 'alonso', name: 'Fernando Alonso', team: 'Aston Martin', number: 14 },
  { id: 'stroll', name: 'Lance Stroll', team: 'Aston Martin', number: 18 },
  { id: 'sainz', name: 'Carlos Sainz', team: 'Williams', number: 55 },
  { id: 'albon', name: 'Alex Albon', team: 'Williams', number: 23 },
  { id: 'gasly', name: 'Pierre Gasly', team: 'Alpine', number: 10 },
  { id: 'colapinto', name: 'Franco Colapinto', team: 'Alpine', number: 43 },
  { id: 'hadjar', name: 'Isack Hadjar', team: 'Racing Bulls', number: 6 },
  { id: 'lindblad', name: 'Arvid Lindblad', team: 'Racing Bulls', number: 40 },
  { id: 'lawson', name: 'Liam Lawson', team: 'Red Bull Racing', number: 30 },
  { id: 'hulkenberg', name: 'Nico Hulkenberg', team: 'Audi', number: 27 },
  { id: 'bortoleto', name: 'Gabriel Bortoleto', team: 'Audi', number: 5 },
  { id: 'bearman', name: 'Oliver Bearman', team: 'Haas F1 Team', number: 87 },
  { id: 'ocon', name: 'Esteban Ocon', team: 'Haas F1 Team', number: 31 },
];

const MAX_TEAMS = 3;
const MAX_DRIVERS = 5;

const ONBOARDING_KEY = 'pitlane_onboarded_v1';

export function useOnboarding() {
  const done = () => {
    try { return !!localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
  };
  const [show, setShow] = useState(!done());
  const complete = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShow(false);
  };
  return { showOnboarding: show, completeOnboarding: complete };
}

export default function Onboarding({ onComplete }) {
  const { user, updateProfile, login, register } = useAuth();
  // Steps: 0=welcome/auth, 1=team, 2=drivers, 3=done
  const [step, setStep] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [exiting, setExiting] = useState(false);

  // Auth state
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'guest'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // If already logged in, skip auth step
  const startStep = user ? 1 : 0;
  useEffect(() => {
    if (user) {
      if (user.favTeams?.length > 0 || user.favDrivers?.length > 0) {
        // Zaten takımları seçmiş, direkt bitir
        finish();
      } else if (step === 0) {
        setStep(1);
      }
    }
  }, [user]);

  const finish = () => {
    if (user) {
      updateProfile({
        favTeams: selectedTeams,
        favDrivers: selectedDrivers,
      });
    }
    setExiting(true);
    setTimeout(onComplete, 500);
  };

  const next = () => {
    if (step < 2) setStep(s => s + 1);
    else finish();
  };

  const skip = () => {
    setExiting(true);
    setTimeout(onComplete, 400);
  };

  const toggleTeam = (id) => {
    setSelectedTeams(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : prev.length < MAX_TEAMS ? [...prev, id] : prev
    );
  };

  const toggleDriver = (id) => {
    setSelectedDrivers(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : prev.length < MAX_DRIVERS ? [...prev, id] : prev
    );
  };

  const handleAuth = async (asGuest = false) => {
    if (asGuest) { setStep(1); return; }
    setAuthError(''); setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      setStep(1);
    } catch (err) {
      let msg = err.message || 'Bir hata oluştu';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) msg = 'E-posta veya şifre hatalı.';
      else if (msg.includes('auth/email-already-in-use')) msg = 'Bu e-posta zaten kayıtlı.';
      else if (msg.includes('auth/weak-password')) msg = 'Şifre en az 6 karakter olmalı.';
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Dominant color from selected teams
  const primaryColor = selectedTeams.length > 0
    ? TEAMS_2026.find(t => t.id === selectedTeams[0])?.color
    : '#E10600';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#08080a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font, Inter, sans-serif)',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.5s ease',
      overflow: 'hidden',
    }}>
      {/* BG glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${primaryColor}15 0%, transparent 70%)`,
        transition: 'background 0.6s ease',
      }} />

      {/* Top stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}44)`,
        transition: 'background 0.6s ease',
      }} />

      {/* Progress dots — steps 1,2 only */}
      {step >= 1 && (
        <div style={{ position: 'absolute', top: 24, display: 'flex', gap: 8 }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i <= step ? primaryColor : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      )}

      {/* Skip */}
      <button onClick={skip} style={{
        position: 'absolute', top: 18, right: 24,
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)',
        fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        textTransform: 'uppercase', letterSpacing: 1,
      }}>
        Atla
      </button>

      {/* Content */}
      <div style={{
        width: '100%', maxWidth: 500, padding: '0 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        maxHeight: '92vh', overflowY: 'auto',
      }}>

        {/* ─── STEP 0: Auth ─────────────────────────────────────── */}
        {step === 0 && (
          <div style={{ width: '100%', animation: 'bbSlideUp 0.5s ease' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: -3, lineHeight: 1, marginBottom: 6 }}>
                Pit<span style={{ color: '#E10600' }}>Lane</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Formula 1'i yaşa</div>
            </div>

            {/* Auth card */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 24, padding: '24px 22px', marginBottom: 12,
            }}>
              {/* Mode switcher */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 3, marginBottom: 20 }}>
                {[['login', 'Giriş Yap'], ['register', 'Kayıt Ol']].map(([id, label]) => (
                  <button key={id} onClick={() => { setAuthMode(id); setAuthError(''); }} style={{
                    flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                    background: authMode === id ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: authMode === id ? 'white' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s',
                  }}>{label}</button>
                ))}
              </div>

              {authMode === 'register' && (
                <input
                  type="text" placeholder="Adın soyadın" value={name}
                  onChange={e => setName(e.target.value)}
                  style={inputStyle}
                />
              )}
              <input
                type="email" placeholder="E-posta" value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password" placeholder="Şifre" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                style={{ ...inputStyle, marginBottom: authError ? 8 : 14 }}
              />

              {authError && (
                <div style={{ fontSize: 11, color: '#ff6b6b', marginBottom: 12, padding: '8px 12px', background: 'rgba(255,60,60,0.08)', borderRadius: 8 }}>
                  {authError}
                </div>
              )}

              <button
                onClick={() => handleAuth()}
                disabled={authLoading || !email || !password}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
                  background: (authLoading || !email || !password) ? 'rgba(225,6,0,0.4)' : 'linear-gradient(135deg, #E10600, #B00500)',
                  color: 'white', fontSize: 14, fontWeight: 800, cursor: (authLoading || !email || !password) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(225,6,0,0.25)',
                }}
              >
                {authLoading ? 'Lütfen bekle...' : authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </div>

            {/* Guest option */}
            <button onClick={() => handleAuth(true)} style={{
              width: '100%', padding: '13px 0', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Giriş yapmadan devam et
            </button>
          </div>
        )}

        {/* ─── STEP 1: Takım seç ────────────────────────────────── */}
        {step === 1 && (
          <div style={{ width: '100%', animation: 'bbSlideUp 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Favori Takımların</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                En fazla {MAX_TEAMS} takım seçebilirsin ({selectedTeams.length}/{MAX_TEAMS})
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {TEAMS_2026.map(team => {
                const active = selectedTeams.includes(team.id);
                const disabled = !active && selectedTeams.length >= MAX_TEAMS;
                return (
                  <button key={team.id} onClick={() => !disabled && toggleTeam(team.id)} style={{
                    padding: '14px 12px', borderRadius: 14,
                    border: `2px solid ${active ? team.color : 'rgba(255,255,255,0.08)'}`,
                    background: active ? `${team.color}18` : 'rgba(255,255,255,0.03)',
                    color: active ? team.color : disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                    fontSize: 13, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.2s ease',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                    opacity: disabled ? 0.45 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>{team.name}</span>
                    {active && (
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%', background: team.color,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: 'white', flexShrink: 0,
                      }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── STEP 2: Pilot seç ────────────────────────────────── */}
        {step === 2 && (
          <div style={{ width: '100%', animation: 'bbSlideUp 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Favori Pilotların</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                En fazla {MAX_DRIVERS} pilot seçebilirsin ({selectedDrivers.length}/{MAX_DRIVERS})
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DRIVERS_2026.map(driver => {
                const active = selectedDrivers.includes(driver.id);
                const teamData = TEAMS_2026.find(t => t.id === driver.team);
                const disabled = !active && selectedDrivers.length >= MAX_DRIVERS;
                return (
                  <button key={driver.id} onClick={() => !disabled && toggleDriver(driver.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 12,
                    border: `1px solid ${active ? (teamData?.color || '#E10600') : 'rgba(255,255,255,0.07)'}`,
                    background: active ? `${teamData?.color || '#E10600'}14` : 'rgba(255,255,255,0.03)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.35 : 1,
                    fontFamily: 'inherit', transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: `${teamData?.color || '#E10600'}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 900, color: teamData?.color || '#E10600', flexShrink: 0,
                    }}>
                      {driver.number}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active ? 'white' : 'rgba(255,255,255,0.8)' }}>
                        {driver.name}
                      </div>
                      <div style={{ fontSize: 10, color: teamData?.color || 'rgba(255,255,255,0.4)', opacity: 0.8 }}>
                        {driver.team}
                      </div>
                    </div>
                    {active && (
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: teamData?.color || '#E10600',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: 'white', flexShrink: 0,
                      }}>✓</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA button */}
        {step >= 1 && (
          <button
            onClick={next}
            style={{
              marginTop: 20, marginBottom: 16,
              width: '100%', maxWidth: 380, padding: '15px',
              borderRadius: 16, border: 'none',
              background: `linear-gradient(135deg, ${primaryColor || '#E10600'}, ${primaryColor || '#E10600'}99)`,
              color: 'white', fontSize: 15, fontWeight: 900, cursor: 'pointer',
              fontFamily: 'inherit', letterSpacing: 0.5,
              boxShadow: `0 8px 32px ${primaryColor || '#E10600'}44`,
              transition: 'all 0.3s ease',
              position: 'sticky', bottom: 16,
            }}
          >
            {step === 2 ? 'Tamamla' : 'Devam Et'}
          </button>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 12, marginBottom: 10,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'white', fontSize: 13, fontFamily: 'var(--font, Inter, sans-serif)',
  outline: 'none', boxSizing: 'border-box',
};
