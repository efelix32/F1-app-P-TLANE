import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDriverImageUrl } from '../utils/driverImages';
import { useRaceSchedule } from '../hooks/useJolpica';

// ─── SVG Icons ─────────────────────────────────────────────────────────────
function NavIcon({ id, size = 16 }) {
  const base = { width: size, height: size, display: 'block', flexShrink: 0 };
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.65, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (id) {
    case 'home': return (
      <svg {...base} viewBox="0 0 20 20" {...s}>
        <rect x="2"  y="2"  width="7" height="7" rx="1.5"/>
        <rect x="11" y="2"  width="7" height="7" rx="1.5"/>
        <rect x="2"  y="11" width="7" height="7" rx="1.5"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5"/>
      </svg>
    );
    case 'chart': return (
      <svg {...base} viewBox="0 0 20 20" {...s}>
        <path d="M2 16V11M7 16V7M12 16V3M17 16V10"/>
      </svg>
    );
    case 'calendar': return (
      <svg {...base} viewBox="0 0 20 20" {...s}>
        <rect x="2" y="4" width="16" height="14" rx="2"/>
        <path d="M2 8.5h16M7 2v4M13 2v4"/>
      </svg>
    );
    case 'broadcast': return (
      <svg {...base} viewBox="0 0 20 20">
        <circle cx="10" cy="13.5" r="2" fill="currentColor"/>
        <path d="M6 9.5a5.66 5.66 0 018 0" {...s} strokeWidth={1.65}/>
        <path d="M2.5 6a10.5 10.5 0 0115 0" {...s} strokeWidth={1.65}/>
      </svg>
    );
    case 'star': return (
      <svg {...base} viewBox="0 0 20 20" {...s}>
        <path d="M10 1.5l2.6 5.3 5.9.86-4.25 4.14.99 5.83L10 14.9l-5.24 2.73.99-5.83L1.5 7.66l5.9-.86L10 1.5z"/>
      </svg>
    );
    case 'helmet': return (
      <svg {...base} viewBox="0 0 24 24" {...s}>
        <path d="M12 3c-5.52 0-10 4.48-10 10v3h20v-3c0-5.52-4.48-10-10-10z" />
        <path d="M5 13h14v2H5z" />
      </svg>
    );
    case 'shield': return (
      <svg {...base} viewBox="0 0 20 20" {...s}>
        <path d="M10 1.5L17.5 4.5V9c0 4.5-3.5 7.5-7.5 9-4-1.5-7.5-4.5-7.5-9V4.5L10 1.5z"/>
      </svg>
    );
    case 'compare': return (
      <svg {...base} viewBox="0 0 20 20" {...s}>
        <path d="M4 5h5M4 10h12M4 15h5"/>
        <path d="M13 3l3 2-3 2M7 13l-3 2 3 2"/>
      </svg>
    );
    case 'widget': return (
      <svg {...base} viewBox="0 0 20 20" {...s}>
        <rect x="2" y="2" width="7" height="5" rx="1.5"/>
        <rect x="11" y="2" width="7" height="5" rx="1.5"/>
        <rect x="2" y="9" width="16" height="9" rx="1.5"/>
      </svg>
    );
    case 'more': return (
      <svg {...base} viewBox="0 0 20 20" {...s}>
        <circle cx="4" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="10" cy="10" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="16" cy="10" r="1.2" fill="currentColor" stroke="none"/>
      </svg>
    );
    case 'door': return (
      <svg {...base} viewBox="0 0 20 20" {...s}>
        <path d="M14 3H6a1 1 0 00-1 1v12a1 1 0 001 1h8"/>
        <path d="M12 10h6M15 7l3 3-3 3"/>
      </svg>
    );
    case 'bell': return (
      <svg {...base} viewBox="0 0 24 24" {...s}>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    );
    default: return null;
  }
}

// Primary nav — always visible in top bar
const PRIMARY_NAV = [
  { path: '/',          label: 'Ana Sayfa',   iconId: 'home'      },
  { path: '/standings', label: 'Sıralamalar', iconId: 'chart'     },
  { path: '/calendar',  label: 'Takvim',      iconId: 'calendar'  },
  { path: '/drivers',   label: 'Sürücüler',   iconId: 'helmet'    },
  { path: '/teams',     label: 'Takımlar',    iconId: 'shield'    },
  { path: '/live',      label: 'Canlı',       iconId: 'broadcast' },
];

// Secondary nav — in “More” dropdown
const MORE_NAV = [
  { path: '/fantasy',   label: 'Fantezi',     iconId: 'star'     },
  { path: '/compare',   label: 'Karşılaştır', iconId: 'compare'  },
  { path: '/widgets',   label: 'Widgets',     iconId: 'widget'   },
];

// ─── Profile Avatar ────────────────────────────────────────────────────────
function ProfileAvatar({ user, size = 30 }) {
  // Try custom uploaded avatar first, then driver avatar, then initials
  const customImg = user?.customAvatar;
  const driverImg = user?.avatarDriver ? getDriverImageUrl(user.avatarDriver) : null;
  const avatarToUse = customImg || driverImg;

  if (avatarToUse) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        border: '2px solid rgba(225,6,0,0.6)', flexShrink: 0,
        background: '#111',
      }}>
        <img src={avatarToUse} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          onError={e => e.target.style.display = 'none'} />
      </div>
    );
  }

  // Gradient avatar with initials
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #E10600 0%, #FF8000 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 900, color: 'white', flexShrink: 0,
      border: '2px solid rgba(225,6,0,0.4)',
    }}>
      {initials}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const moreRef = useRef(null);
  const notiRef = useRef(null);
  const { user, openAuth, logout } = useAuth();
  const navigate = useNavigate();
  const { races } = useRaceSchedule();
  
  const nextRace = races?.find(r => new Date(r.date + 'T' + (r.time || '15:00:00Z')) > new Date());

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (notiRef.current && !notiRef.current.contains(e.target)) setNotiOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Left: Logo */}
          <div className="navbar-left">
            <NavLink to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
              <img src="/logo.png" alt="PitLane" className="logo-img" />
              <span className="logo-text">PitLane<span className="logo-accent">.</span></span>
            </NavLink>

            {/* Primary links — desktop */}
            <div className="navbar-links">
              {PRIMARY_NAV.map(item => (
                <NavLink
                  key={item.path} to={item.path} end={item.path === '/'}
                  className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                >
                  <span className="nav-link-icon"><NavIcon id={item.iconId} size={15} /></span>
                  {item.label}
                </NavLink>
              ))}

              {/* More dropdown */}
              <div ref={moreRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMoreOpen(o => !o)}
                  className={`nav-link${moreOpen ? ' nav-link--active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <span className="nav-link-icon"><NavIcon id="more" size={15} /></span>
                  Daha Fazla
                </button>
                {moreOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                    background: 'var(--bg-2, #0e0e14)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16, padding: 6, minWidth: 180, zIndex: 999,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                    animation: 'dropDown 0.15s ease',
                    maxHeight: '80vh', overflowY: 'auto'
                  }}>
                    {MORE_NAV.map(item => (
                      <NavLink
                        key={item.path} to={item.path}
                        className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                        onClick={() => setMoreOpen(false)}
                        style={{ display: 'flex', gap: 10, padding: '9px 14px', borderRadius: 10, whiteSpace: 'nowrap' }}
                      >
                        <span><NavIcon id={item.iconId} size={15} /></span>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Auth + hamburger */}
          <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div ref={notiRef} style={{ position: 'relative', display: 'flex' }}>
              <button onClick={() => setNotiOpen(o => !o)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'white', width:34, height:34, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
                <NavIcon id="bell" size={16} />
              </button>
              {notiOpen && (
                <div className="noti-dropdown">
                  <div style={{ fontSize:14, fontWeight:800, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                    <NavIcon id="bell" size={14} /> Bildirimler
                  </div>
                  {nextRace ? (
                    <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:12, border:'1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Sıradaki Yarış</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:4 }}>{nextRace.raceName}</div>
                      <div style={{ fontSize:11, color:'var(--accent)' }}>
                        {new Date(nextRace.date + 'T' + (nextRace.time || '15:00:00Z')).toLocaleString('tr-TR', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Yeni bildirim yok.</div>
                  )}
                </div>
              )}
            </div>

            <div className="season-badge" style={{ display: window.innerWidth > 600 ? 'flex' : 'none' }}>
              <span className="live-dot"></span>
              2026 Sezonu
            </div>

            {user ? (
              <NavLink
                to="/profile"
                title={user.name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 999, padding: '4px 12px 4px 4px',
                  textDecoration: 'none', color: 'white', transition: 'all 0.15s',
                }}
              >
                <ProfileAvatar user={user} size={28} />
                <span style={{ fontSize: 12, fontWeight: 700, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name?.split(' ')[0] || 'Profil'}
                </span>
              </NavLink>
            ) : (
              <button
                onClick={openAuth}
                style={{
                  padding: '8px 18px', borderRadius: 999, border: 'none',
                  background: 'linear-gradient(135deg, #E10600, #B00500)',
                  color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  fontFamily: 'var(--font)', boxShadow: '0 4px 14px rgba(225,6,0,0.3)',
                }}
              >
                Giriş Yap
              </button>
            )}

            {/* Hamburger (Desktop Only / Hidden on Mobile by CSS now) */}
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü">
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── BOTTOM NAVIGATION (Mobile Only) ─── */}
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `b-nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
          <span className="b-nav-icon"><NavIcon id="home" size={18}/></span>
          <span>Ana Sayfa</span>
        </NavLink>
        <NavLink to="/standings" className={({ isActive }) => `b-nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
          <span className="b-nav-icon"><NavIcon id="chart" size={18}/></span>
          <span>Sıralama</span>
        </NavLink>
        <NavLink to="/drivers" className={({ isActive }) => `b-nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
          <span className="b-nav-icon"><NavIcon id="helmet" size={18}/></span>
          <span>Sürücüler</span>
        </NavLink>
        <NavLink to="/live" className={({ isActive }) => `b-nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
          <span className="b-nav-icon"><NavIcon id="broadcast" size={18}/></span>
          <span>Canlı</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `b-nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
          <span className="b-nav-icon">
            {user ? <ProfileAvatar user={user} size={24} /> : <NavIcon id="person" size={18}/>}
          </span>
          <span>Profil</span>
        </NavLink>
        <button className={`b-nav-link${menuOpen ? ' active' : ''}`} style={{ background:'transparent', border:'none' }} onClick={() => setMenuOpen(!menuOpen)}>
          <span className="b-nav-icon">
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <NavIcon id="more" size={18}/>
            )}
          </span>
          <span>Menü</span>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            {/* User info top */}
            {user && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 8,
              }}>
                <ProfileAvatar user={user} size={40} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
                </div>
              </div>
            )}

            {[...PRIMARY_NAV, ...MORE_NAV].map(item => (
              <NavLink
                key={item.path} to={item.path} end={item.path === '/'}
                className={({ isActive }) => `mobile-nav-link${isActive ? ' mobile-nav-link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="mobile-nav-icon"><NavIcon id={item.iconId} size={18} /></span>
                {item.label}
              </NavLink>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, marginTop: 8 }}>
              {user ? (
                <>
                  <NavLink to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                    <span className="mobile-nav-icon"><NavIcon id="person" size={18}/></span>
                    Profilim
                  </NavLink>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: 'none', color: 'rgba(255,255,255,0.5)', textAlign: 'left', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <NavIcon id="door" size={18}/> Çıkış Yap
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { openAuth(); setMenuOpen(false); }}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(225,6,0,0.12)', border: '1px solid rgba(225,6,0,0.2)', color: '#E10600', textAlign: 'left', cursor: 'pointer', fontSize: 14, fontWeight: 800, fontFamily: 'var(--font)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  Giriş Yap
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
