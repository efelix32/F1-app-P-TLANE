import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getTeamColor } from '../utils/teamColors';
import { getTeamCarUrlLarge } from '../utils/driverImages';

function CarSVG({ color = '#FF0000' }) {
  return (
    <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
        </linearGradient>
        <linearGradient id="shadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Shadow under car */}
      <ellipse cx="250" cy="175" rx="200" ry="15" fill="url(#shadowGrad)"/>
      {/* Rear wing */}
      <rect x="50" y="72" width="60" height="6" rx="2" fill={color} filter="url(#glow)"/>
      <rect x="70" y="65" width="20" height="14" rx="1" fill={color}/>
      {/* Front wing */}
      <rect x="390" y="80" width="65" height="5" rx="2" fill={color} filter="url(#glow)"/>
      <rect x="420" y="75" width="15" height="12" rx="1" fill={color}/>
      {/* Main body */}
      <path d="M90 100 L95 80 L160 72 L200 68 L300 66 L380 72 L420 85 L430 100 L420 115 L380 122 L300 126 L200 128 L160 126 L95 118 Z"
        fill="url(#bodyGrad)" />
      {/* Cockpit */}
      <path d="M210 68 L220 54 L260 50 L300 54 L310 68" fill="#0a0a0b"/>
      <path d="M215 68 L224 57 L260 53 L296 57 L305 68" fill="#111" opacity="0.8"/>
      {/* Sidepods */}
      <path d="M160 88 L200 80 L200 118 L160 112 Z" fill={color} opacity="0.7"/>
      <path d="M300 80 L340 88 L340 112 L300 118 Z" fill={color} opacity="0.7"/>
      {/* Floor */}
      <rect x="130" y="118" width="240" height="8" rx="2" fill={color} opacity="0.5"/>
      {/* Rear wheels */}
      <circle cx="130" cy="130" r="30" fill="#1a1a1a" stroke={color} strokeWidth="3"/>
      <circle cx="130" cy="130" r="18" fill="#111"/>
      <circle cx="130" cy="130" r="8" fill={color} opacity="0.6"/>
      <circle cx="370" cy="130" r="30" fill="#1a1a1a" stroke={color} strokeWidth="3"/>
      <circle cx="370" cy="130" r="18" fill="#111"/>
      <circle cx="370" cy="130" r="8" fill={color} opacity="0.6"/>
      {/* Front wheels */}
      <circle cx="390" cy="115" r="22" fill="#1a1a1a" stroke={color} strokeWidth="2.5"/>
      <circle cx="390" cy="115" r="14" fill="#111"/>
      <circle cx="390" cy="115" r="6" fill={color} opacity="0.6"/>
      <circle cx="110" cy="115" r="22" fill="#1a1a1a" stroke={color} strokeWidth="2.5"/>
      <circle cx="110" cy="115" r="14" fill="#111"/>
      <circle cx="110" cy="115" r="6" fill={color} opacity="0.6"/>
      {/* Halo */}
      <path d="M225 62 Q250 45 275 62" fill="none" stroke={color} strokeWidth="4" opacity="0.8"/>
      {/* Livery stripe */}
      <path d="M200 70 L300 70" stroke="white" strokeWidth="2" opacity="0.3"/>
      {/* DRS slot */}
      <rect x="52" y="74" width="56" height="2" rx="1" fill="black" opacity="0.5"/>
    </svg>
  );
}

export default function CarViewer({ team, constructorId, onClose }) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const animFrameRef = useRef(null);
  const color = getTeamColor(team);
  const carUrl = getTeamCarUrlLarge(constructorId);
  const [imgFailed, setImgFailed] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: -y * 18, y: x * 25 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    let angle = 0;
    const start = performance.now();
    const duration = 2800;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease in-out
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      setSpinAngle(eased * 360);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setSpinAngle(0);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 720,
          background: 'rgba(13,13,16,0.95)',
          border: `1px solid ${color.primary}30`,
          borderRadius: 28,
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${color.primary}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${color.bg}, transparent)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: color.primary,
              boxShadow: `0 0 12px ${color.primary}`,
            }}/>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{team}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: color.primary,
              background: color.bg, padding: '3px 10px', borderRadius: 99,
              border: `1px solid ${color.primary}30`,
              textTransform: 'uppercase', letterSpacing: 0.8,
            }}>2026 Yarış Aracı</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.08)', color: 'white',
              fontSize: 16, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.16)'}
            onMouseLeave={e => e.target.style.background='rgba(255,255,255,0.08)'}
          >×</button>
        </div>

        {/* 3D Car Stage */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            padding: '48px 40px',
            background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${color.primary}08, transparent)`,
            cursor: 'crosshair',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background grid */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: `
              linear-gradient(${color.primary} 1px, transparent 1px),
              linear-gradient(90deg, ${color.primary} 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}/>

          {/* Ground reflection */}
          <div style={{
            position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 60,
            background: `radial-gradient(ellipse 80% 100% at 50% 100%, ${color.primary}18, transparent)`,
          }}/>

          {/* 3D car container */}
          <div style={{
            perspective: '800px',
            perspectiveOrigin: '50% 60%',
          }}>
            <div style={{
              transform: spinning
                ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${spinAngle}deg)`
                : `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: spinning ? 'none' : 'transform 0.15s ease',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}>
              {!imgFailed ? (
                <img
                  src={carUrl}
                  alt={`${team} 2026`}
                  style={{
                    width: '100%', maxWidth: 580, display: 'block', margin: '0 auto',
                    filter: `drop-shadow(0 20px 40px ${color.primary}40)`,
                  }}
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div style={{ maxWidth: 580, margin: '0 auto' }}>
                  <CarSVG color={color.primary} />
                </div>
              )}
            </div>
          </div>

          {/* Mouse guide hint */}
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: 0.5,
            pointerEvents: 'none',
          }}>
            Fareyi hareket ettir · 3D efekt
          </div>
        </div>

        {/* Controls */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${color.primary}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>Motor</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>2026 Hibrit</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>Şasi</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Karbon Fiber</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>Güç</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: color.primary }}>~1000 HP</div>
            </div>
          </div>
          <button
            onClick={handleSpin}
            disabled={spinning}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 99,
              border: `1px solid ${color.primary}40`,
              background: spinning ? color.bg : `linear-gradient(135deg, ${color.primary}20, ${color.primary}08)`,
              color: spinning ? color.primary : 'white',
              fontSize: 13, fontWeight: 700, cursor: spinning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font)',
            }}
          >
            <span style={{ fontSize: 16, display: 'inline-block', animation: spinning ? 'spin 0.6s linear infinite' : 'none' }}>
              {spinning ? '⟳' : '↻'}
            </span>
            {spinning ? 'Dönüyor...' : '360° Döndür'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(40px) scale(0.95);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
