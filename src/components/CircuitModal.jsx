import React, { useState, useEffect } from 'react';
import { getFlagUrl } from '../utils/formatters';
import { getCircuitTrackUrl, getCircuitHeaderUrl } from '../data/circuits';
import { useCircuitStats } from '../hooks/useCircuitStats';

// ─── Nationality to flag URL helper ─────────────────────────────────
const NATIONALITY_TO_CODE = {
  British: 'gb', German: 'de', Finnish: 'fi', Brazilian: 'br',
  French: 'fr', Austrian: 'at', Canadian: 'ca', Italian: 'it',
  Australian: 'au', Spanish: 'es', Dutch: 'nl', Mexican: 'mx',
  Monegasque: 'mc', American: 'us', Japanese: 'jp', Thai: 'th',
  Danish: 'dk', Chinese: 'cn', Swiss: 'ch', Polish: 'pl',
};
function nationalityFlag(nat) {
  const code = NATIONALITY_TO_CODE[nat] || 'un';
  return `https://flagcdn.com/w40/${code}.png`;
}

// ─── Medal colors ────────────────────────────────────────────────────
const MEDAL = ['#FFD700', '#C0C7D0', '#CD853F', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.3)'];

// ─── Stat pill ───────────────────────────────────────────────────────
function StatPill({ icon, label, value, accent }) {
  return (
    <div style={{
      background: accent ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
      border: `1px solid rgba(255,255,255,${accent ? 0.12 : 0.07})`,
      borderRadius: 14, padding: '13px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontSize: 16 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
    </div>
  );
}

// ─── Main modal ─────────────────────────────────────────────────────
export default function CircuitModal({ race, onClose }) {
  const [headerFailed, setHeaderFailed] = useState(false);
  const [trackFailed, setTrackFailed] = useState(false);

  const circuit = race?.Circuit;
  const circuitId = circuit?.circuitId;

  const { wins, total, loading: statsLoading } = useCircuitStats(circuitId);

  // ESC to close
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  if (!race) return null;

  // Build image URLs using the F1 CDN pattern we discovered
  const F1_TRACK_BASE = 'https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000001/common/f1/2026/track/2026track';
  const F1_HEADER_BASE = 'https://media.formula1.com/image/upload/c_lfill,w_1440/q_auto/v1740000001/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/';

  // Track key mapping from circuitId to F1 CDN key
  const TRACK_KEYS = {
    albert_park: 'melbourne', shanghai: 'shanghai', suzuka: 'suzuka',
    bahrain: 'bahrain', jeddah: 'jeddah', miami: 'miami',
    monaco: 'montecarlo', catalunya: 'madring', villeneuve: 'montreal',
    red_bull_ring: 'spielberg', silverstone: 'silverstone', spa: 'spafrancorchamps',
    hungaroring: 'hungaroring', zandvoort: 'zandvoort', monza: 'monza',
    baku: 'baku', marina_bay: 'singapore', americas: 'austin',
    rodriguez: 'mexicocity', interlagos: 'interlagos',
    las_vegas: 'lasvegas', losail: 'lusail', yas_marina: 'yasmarina',
  };

  const HEADER_KEYS = {
    albert_park: 'Australia', shanghai: 'China', suzuka: 'Japan',
    bahrain: 'Bahrain', jeddah: 'Saudi Arabia', miami: 'Miami',
    monaco: 'Monaco', catalunya: 'Spain', villeneuve: 'Canada',
    red_bull_ring: 'Austria', silverstone: 'Great Britain', spa: 'Belgium',
    hungaroring: 'Hungary', zandvoort: 'Netherlands', monza: 'Italy',
    baku: 'Azerbaijan', marina_bay: 'Singapore', americas: 'United States',
    rodriguez: 'Mexico', interlagos: 'Brazil',
    las_vegas: 'Las Vegas', losail: 'Qatar', yas_marina: 'Abu Dhabi',
  };

  // Inline circuit info
  const CIRCUIT_INFO = {
    albert_park:  { km: 5.278, laps: 58, turns: 16, drs: 4, first: 1996, record: '1:20.235 – Leclerc (2022)', desc: 'Melbourne sokaklarından ilham alan yarı-sokak pisti. Albert Park Gölü etrafında dönen parkurda yüksek hız bölümleri ve dar sokak kesimleri bir arada.' },
    shanghai:     { km: 5.451, laps: 56, turns: 16, drs: 2, first: 2004, record: '1:32.238 – Schumacher (2004)', desc: 'Ejder şeklinde tasarlanan pist. Uzun bir düzlük ve yüksek G-kuvveti üreten uzun sağ virajıyla öne çıkar.' },
    suzuka:       { km: 5.807, laps: 53, turns: 18, drs: 1, first: 1987, record: '1:30.983 – Hamilton (2019)', desc: 'Sekiz şeklindeki Suzuka, birbirinin üzerinden geçen tek F1 pistlerinden biridir. S-eğrileri ve Dunlop virajıyla efsanevi.' },
    bahrain:      { km: 5.412, laps: 57, turns: 15, drs: 3, first: 2004, record: '1:31.447 – de la Rosa (2005)', desc: 'Çölün ortasında gece ışıkları altında yapılan yarış. Geçiş imkânı yüksek, DRS bölgelerinin etkin olduğu parkur.' },
    jeddah:       { km: 6.174, laps: 50, turns: 27, drs: 3, first: 2021, record: '1:30.734 – Hamilton (2021)', desc: 'Dünyanın en hızlı sokak devresilerinden biri. Yüksek duvarlar ve neredeyse sıfır dış alanla ekstrem baskı altında sürüş.' },
    miami:        { km: 5.412, laps: 57, turns: 19, drs: 3, first: 2022, record: '1:29.708 – Verstappen (2023)', desc: 'Hard Rock Stadium etrafındaki Miami Pisti, Amerikan F1 ruhunu yansıtır. Sprint yarışlarının düzenlendiği geniş sahası.' },
    monaco:       { km: 3.337, laps: 78, turns: 19, drs: 1, first: 1929, record: '1:12.909 – Barrichello (2004)', desc: 'F1\'nin en prestijli yarışı. Dar Monako sokaklarında çok az geçiş yapılır. Casino, tünel ve liman ikonik bölümler.' },
    catalunya:    { km: 4.657, laps: 66, turns: 16, drs: 2, first: 1991, record: '1:18.149 – Verstappen (2021)', desc: 'Her takımın test pistlerine yakınlığı nedeniyle en tanınan devre. Balanced tasarımı tüm araç özelliklerini sınar.' },
    villeneuve:   { km: 4.361, laps: 70, turns: 14, drs: 2, first: 1978, record: '1:13.078 – Bottas (2019)', desc: 'Gilles Villeneuve onuruna adlandırılmıştır. Uzun düzlükler ve "Wall of Champions" duvarlarıyla ünlüdür.' },
    red_bull_ring:{ km: 4.318, laps: 71, turns: 10, drs: 3, first: 1970, record: '1:05.619 – Sainz (2020)', desc: 'Avusturya\'nın yemyeşil dağları arasında. Yüksek kotlu 10 viraj, motor gücünün belirleyici olduğu bir parkur.' },
    silverstone:  { km: 5.891, laps: 52, turns: 18, drs: 2, first: 1950, record: '1:27.097 – Verstappen (2020)', desc: 'F1\'nin anayurdu. 1950\'deki ilk Dünya Şampiyonası yarışına ev sahipliği yapmıştır. Copse ve Maggotts efsanevi virajlar.' },
    spa:          { km: 7.004, laps: 44, turns: 20, drs: 2, first: 1925, record: '1:46.286 – Bottas (2018)', desc: 'Ardenler ormanlarının içindeki Spa-Francorchamps. Eau Rouge/Raidillon ve değişken Belçika havası efsanedir.' },
    hungaroring:  { km: 4.381, laps: 70, turns: 14, drs: 1, first: 1986, record: '1:16.627 – Hamilton (2020)', desc: 'Demir Perde gerisinde ilk F1 yarışı. Dar yapısıyla geçişin zor olduğu bir devre. Aerondinamik denge belirleyici.' },
    zandvoort:    { km: 4.259, laps: 72, turns: 14, drs: 2, first: 1952, record: '1:11.097 – Verstappen (2021)', desc: 'Max Verstappen\'ın ev sahibi yarışı. Bankalı virajları ve kum tepeleri arasındaki pist 2021\'de geri döndü.' },
    monza:        { km: 5.793, laps: 53, turns: 11, drs: 2, first: 1950, record: '1:21.046 – Barrichello (2004)', desc: '"Hız Tapınağı". F1\'in en yüksek ortalama hızlarının görüldüğü pistir. Uzun parabol düzlükleri ile ikonik.' },
    baku:         { km: 6.003, laps: 51, turns: 20, drs: 2, first: 2016, record: '1:43.009 – Leclerc (2019)', desc: 'Tarihi şehrin sokaklarını dolanan Baku. En uzun düzlüklü F1 sokak devresi. Ana düzlükte 370 km/s\'e ulaşılıyor.' },
    marina_bay:   { km: 4.940, laps: 62, turns: 23, drs: 3, first: 2008, record: '1:35.867 – Magnussen (2018)', desc: 'F1\'nin tek gece yarışı. Marina Körfezi\'ni çevreleyen ışıklı pistinde yüksek nem ve sıcaklık pilotları zorlar.' },
    americas:     { km: 5.513, laps: 56, turns: 20, drs: 2, first: 2012, record: '1:36.169 – Leclerc (2019)', desc: 'Dünya\'nın çeşitli devreleri ilham alınarak tasarlandı. Sarp çıkış virajı ve değişken eğimli bölümleriyle özgün.' },
    rodriguez:    { km: 4.304, laps: 71, turns: 17, drs: 3, first: 1963, record: '1:17.774 – Bottas (2021)', desc: '2.285m yükseklikte. İnce hava motor gücünü azaltırken DRS etkisini artırır. Estadio bölümü müthiş atmosfer.' },
    interlagos:   { km: 4.309, laps: 71, turns: 15, drs: 2, first: 1973, record: '1:10.540 – Bottas (2018)', desc: 'Geçişlerin bereketli, dramatik son tur çarpışmaları ve ani yağmuruyla ünlü. Brezilya taraftarları efsanevi coşku.' },
    las_vegas:    { km: 6.201, laps: 50, turns: 17, drs: 3, first: 2023, record: '1:35.490 – Piastri (2023)', desc: 'Las Vegas Strip boyunca gece ışıkları altında 320+ km/s. 2023\'te F1 takvimine katıldı.' },
    losail:       { km: 5.380, laps: 57, turns: 16, drs: 2, first: 2021, record: '1:24.319 – Verstappen (2023)', desc: 'Motosiklet için tasarlanan Losail, F1\'e 2021\'de açıldı. Gece yarışı formatı ve akıcı tasarımıyla özgün.' },
    yas_marina:   { km: 5.281, laps: 58, turns: 16, drs: 2, first: 2009, record: '1:26.103 – Verstappen (2021)', desc: 'Sezonun finali. Gün batımında başlayan yarış, şampiyonu belirler. Otel altındaki tünel bölümüyle ikonik.' },
  };

  const trackKey = TRACK_KEYS[circuitId];
  const headerKey = HEADER_KEYS[circuitId];
  const info = CIRCUIT_INFO[circuitId] || {};

  const trackUrl = trackKey ? `${F1_TRACK_BASE}${trackKey}detailed.webp` : null;
  const headerUrl = headerKey ? `${F1_HEADER_BASE}${encodeURIComponent(headerKey)}.webp` : null;

  const raceDate = new Date(race.date);
  const dateStr = raceDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(24px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'circFadeIn 0.2s ease',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 680,
          background: '#0A0A0D',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 28,
          overflow: 'hidden',
          animation: 'circSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1)',
          margin: 'auto',
        }}
      >
        {/* ── HERO: Header Image ── */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          {!headerFailed && headerUrl ? (
            <img
              src={headerUrl}
              alt={circuit?.circuitName}
              onError={() => setHeaderFailed(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #0f1021, #1a1a2e)',
            }}/>
          )}
          {/* Overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(0deg, rgba(10,10,13,1) 0%, rgba(10,10,13,0.5) 50%, rgba(10,10,13,0.2) 100%)',
          }}/>
          {/* Round badge */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, padding: '4px 12px',
            fontSize: 11, fontWeight: 800, backdropFilter: 'blur(8px)',
          }}>
            Tur {race.round}
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >×</button>
          {/* Race title */}
          <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 4 }}>
              {circuit?.Location?.country} · {dateStr}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.8, lineHeight: 1.1 }}>
              {race.raceName}
            </div>
          </div>
        </div>

        {/* ── TRACK LAYOUT + INFO ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Track map */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 170, padding: 20,
          }}>
            {!trackFailed && trackUrl ? (
              <img
                src={trackUrl}
                alt="Pist Haritası"
                onError={() => setTrackFailed(true)}
                style={{
                  maxWidth: '100%', maxHeight: 150,
                  objectFit: 'contain',
                  filter: 'brightness(1.2) contrast(1.1)',
                }}
              />
            ) : (
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40,
              }}>
                F1
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Pist Bilgileri
            </div>
            {[
              { icon: '─', label: 'Uzunluk', val: info.km ? `${info.km} km` : '—' },
              { icon: '⟳', label: 'Tur Sayısı', val: info.laps || '—' },
              { icon: '↩', label: 'Viraj', val: info.turns || '—' },
              { icon: '→', label: 'DRS Bölgesi', val: info.drs || '—' },
              { icon: '•', label: 'İlk GP', val: info.first || '—' },
              { icon: '#', label: 'Toplam GP', val: statsLoading ? '...' : total },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{s.icon}</span>{s.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── LAP RECORD ── */}
        {info.record && (
          <div style={{
            margin: '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '14px 0',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>REC</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>
                En Hızlı Tur Rekoru
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#FFD700', letterSpacing: -0.3 }}>
                {info.record}
              </div>
            </div>
          </div>
        )}

        {/* ── DESCRIPTION ── */}
        {info.desc && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
              Pist Hakkında
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0, fontWeight: 400 }}>
              {info.desc}
            </p>
          </div>
        )}

        {/* ── MOST WINS ── */}
        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
            Bu Pistte En Çok Kazanan
          </div>

          {statsLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.08)',
                borderTopColor: 'rgba(255,255,255,0.4)',
                animation: 'circSpin 0.8s linear infinite',
                margin: '0 auto 8px',
              }}/>
              Veriler yükleniyor...
            </div>
          ) : wins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
              Henüz yarış verisi yok
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wins.map((w, i) => (
                <div key={w.driverId} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 14,
                  background: i === 0 ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                  {/* Rank */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: i === 0 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900, color: MEDAL[i],
                  }}>{i + 1}</div>
                  {/* Flag */}
                  <img
                    src={nationalityFlag(w.nationality)}
                    alt=""
                    style={{ width: 22, borderRadius: 3, flexShrink: 0 }}
                    onError={e => e.target.style.display = 'none'}
                  />
                  {/* Name */}
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{w.name}</span>
                  {/* Wins count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      fontSize: 20, fontWeight: 900, letterSpacing: -0.5,
                      color: i === 0 ? '#FFD700' : 'white',
                    }}>
                      {w.wins}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      GALİBİYET
                    </div>
                  </div>
                  {/* Win bar */}
                  <div style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: i === 0 ? '#FFD700' : MEDAL[i],
                      width: `${(w.wins / (wins[0]?.wins || 1)) * 100}%`,
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes circFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes circSlideUp { from{transform:translateY(50px) scale(0.93);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
        @keyframes circSpin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
