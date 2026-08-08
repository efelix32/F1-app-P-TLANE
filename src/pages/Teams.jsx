import React, { useState } from 'react';
import { useConstructorStandings, useDriverStandings } from '../hooks/useJolpica';
import { getTeamColor } from '../utils/teamColors';
import { getFlagUrl } from '../utils/formatters';
import { getDriverImageUrl, getTeamCarUrlLarge, getTeamLogoUrl } from '../utils/driverImages';
import { LoadingSpinner, ErrorMessage } from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/common/Icon';

// ─── Kapsamlı Takım Tarihi ─────────────────────────────────────────────
const TEAM_HISTORY = {
  'Mercedes': {
    founded: 1954, base: 'Brackley, İngiltere', chassis: 'W17',
    engine: 'Mercedes-AMG F1 M17', teamPrincipal: 'Toto Wolff',
    championships: { constructor: 8, driver: 7 },
    bestSeason: '2014–2021 (8 ardışık şampiyonluk)',
    podiums: 280, wins: 125, poles: 128,
    famousDrivers: ['Lewis Hamilton (7×)', 'Nico Rosberg (1×)', 'Michael Schumacher', 'Juan Manuel Fangio'],
    milestones: [
      "2014: Turbo hibrit donemine mukemmel baslangic",
      "2015-2021: Hamilton ile 6 sampiyonluk daha",
      "2020: En cok kazanan sezon (13/17 yaris)",
    ],
    about: "Mercedes-AMG Petronas Formula One Team, 2010'dan bu yana F1'de yer almakta olup 2014-2021 arasinda 8 ardisik yapimci sampiyonlugu kazandi. Bu donem F1 tarihinin en baskin donemi olarak kabul edilmektedir. Lewis Hamilton, takimla birlikte 6 sampiyonluk kazanarak Michael Schumacher'in rekorunu kirdi.",

  },
  'Ferrari': {
    founded: 1950, base: 'Maranello, İtalya', chassis: 'SF-26',
    engine: 'Ferrari 066/14', teamPrincipal: 'Frédéric Vasseur',
    championships: { constructor: 16, driver: 15 },
    bestSeason: '2002-2004 (Schumacher dönemi)',
    podiums: 794, wins: 243, poles: 245,
    famousDrivers: ['Michael Schumacher (5×)', 'Niki Lauda (2×)', 'Alain Prost (1×)', 'Kimi Räikkönen (1×)', 'Fernando Alonso', 'Charles Leclerc', 'Lewis Hamilton'],
    milestones: [
      '1950: F1\'in kurucu takımı olarak ilk yarışta yer aldı',
      '2000-2004: Schumacher ile 5 ardışık sürücü şampiyonluğu',
      '2022: 14 yıl sonra ilk yarış galibiyeti (Leclerc, Bahreyn)',
    ],
    about: 'Scuderia Ferrari, Formula 1\'in en köklü ve en başarılı takımıdır. 1950\'den bu yana her sezonda yarışan tek takım olan Ferrari, 16 takım ve 15 sürücü şampiyonluğuyla tarihin zirvesinde yer almaktadır. Kırmızı rengi, "La Scuderia" ruhu ve Tifosi kültü ile F1\'in sembolüdür.',
  },
  'McLaren': {
    founded: 1966, base: 'Woking, İngiltere', chassis: 'MCL40',
    engine: 'Mercedes-AMG F1 M17', teamPrincipal: 'Andrea Stella',
    championships: { constructor: 8, driver: 12 },
    bestSeason: '1988 (15/16 yarış — tüm zamanların rekoru)',
    podiums: 494, wins: 183, poles: 156,
    famousDrivers: ['Ayrton Senna (3×)', 'Alain Prost (3×)', 'Mika Häkkinen (2×)', 'Lewis Hamilton', 'Jenson Button'],
    milestones: [
      '1988: Senna-Prost dönemi — 15/16 yarış galibiyeti (rekor)',
      '1998-1999: Häkkinen ile Schumacher\'a karşı mücadele',
      '2024: Norris & Piastri ile güçlü geri dönüş',
    ],
    about: 'McLaren Racing, Bruce McLaren tarafından 1966\'da kurulan efsanevi bir takımdır. Senna-Prost döneminde yaşadığı altın çağ, 1988\'de 16 yarışın 15\'ini kazanarak F1 tarihinin en başarılı sezonunu yarattı. Son yıllarda Lando Norris ve Oscar Piastri ile yeniden şampiyonluk yarışına döndü.',
  },
  'Red Bull Racing': {
    founded: 2005, base: 'Milton Keynes, İngiltere', chassis: 'RB22',
    engine: 'Ford Red Bull Powertrains', teamPrincipal: 'Christian Horner',
    championships: { constructor: 6, driver: 7 },
    bestSeason: '2023 (21/22 yarış — tüm zamanların rekoru)',
    podiums: 314, wins: 120, poles: 101,
    famousDrivers: ['Sebastian Vettel (4×)', 'Max Verstappen (4×)', 'Mark Webber', 'Daniel Ricciardo'],
    milestones: [
      '2010-2013: Vettel ile 4 ardışık şampiyonluk',
      '2021: Verstappen\'ın dramatik son turda şampiyonluğu',
      '2023: 21/22 yarış galibiyeti — tüm zamanların sezonu',
    ],
    about: 'Red Bull Racing, Jaguar Racing\'in satın alınmasıyla 2005\'te kuruldu. Adrian Newey\'nin tasarım dehası ve Sebastian Vettel ile kazandığı 4 ardışık şampiyonlukla (2010-2013) tanındı. Max Verstappen ile 4 şampiyonluk daha ekleyerek modern F1\'in en baskın takımı haline geldi. 2026 itibarıyla kendi motorlarını (Ford ortaklığıyla) üretiyorlar.',
  },
  'Alpine': {
    founded: 1977, base: 'Enstone, İngiltere', chassis: 'A526',
    engine: 'Mercedes-AMG F1 M17', teamPrincipal: 'Oliver Oakes',
    championships: { constructor: 2, driver: 2 },
    bestSeason: '2005-2006 (Alonso şampiyonlukları)',
    podiums: 112, wins: 35, poles: 31,
    famousDrivers: ['Fernando Alonso (2×)', 'Alain Prost (1×)', 'Damon Hill', 'Michael Schumacher (1995)', 'Esteban Ocon'],
    milestones: [
      '1989: Alain Prost ile sürücü şampiyonluğu',
      '2005-06: Fernando Alonso ile üst üste şampiyonluk',
      '2021: Alpine markası altında yeniden doğuş',
    ],
    about: 'Enstone\'da kurulan bu tesis, Toleman → Benetton → Renault → Lotus → Renault → Alpine adlarıyla F1\'de uzun bir tarihe sahiptir. Renault markasıyla Fernando Alonso ile 2005-2006 şampiyonluklarını kazandı. 2026 itibarıyla Mercedes motorları kullanmaktadır.',
  },
  'Williams': {
    founded: 1977, base: 'Grove, İngiltere', chassis: 'FW48',
    engine: 'Mercedes-AMG F1 M17', teamPrincipal: 'James Vowles',
    championships: { constructor: 7, driver: 7 },
    bestSeason: '1992-1993 (Mansell & Prost)',
    podiums: 313, wins: 114, poles: 128,
    famousDrivers: ['Nigel Mansell (1×)', 'Damon Hill (1×)', 'Jacques Villeneuve (1×)', 'Alain Prost', 'Ayrton Senna', 'Nelson Piquet'],
    milestones: [
      '1980: İlk takım şampiyonluğu (Alan Jones)',
      '1992: Mansell\'in 9 galibiyetle unutulmaz sezonu',
      '1996-1997: Hill ve Villeneuve ile üst üste şampiyonluk',
    ],
    about: 'Frank Williams ve Patrick Head tarafından 1977\'de kurulan Williams, 1980-90\'larda F1\'in baskın gücüydü. 7 takım ve 7 sürücü şampiyonluğuyla birlikte F1 tarihinin en büyük özel takımlarından biridir. 2020\'de Dorilton Capital tarafından satın alınan takım, James Vowles liderliğinde yeniden inşa sürecindedir.',
  },
  'Haas F1 Team': {
    founded: 2016, base: 'Kannapolis (ABD) / Banbury (İngiltere)', chassis: 'VF-26',
    engine: 'Ferrari 066/14', teamPrincipal: 'Ayao Komatsu',
    championships: { constructor: 0, driver: 0 },
    bestSeason: '2022 (5. sıra, 37 puan)',
    podiums: 0, wins: 0, poles: 1,
    famousDrivers: ['Romain Grosjean', 'Kevin Magnussen', 'Mick Schumacher', 'Esteban Ocon', 'Oliver Bearman'],
    milestones: [
      '2016: Debüt yarışında puan alan ilk yeni takım (Haas — 6. sıra)',
      '2022: 37 puanla tarihinin en iyi sezonunu yaşadı',
      '2023: Magnussen ile süpriz pole pozisyonu (Brezilya)',
    ],
    about: 'Haas F1 Team, Gene Haas tarafından kurulan ve ABD merkezli tek F1 fabrika takımıdır. Ferrari ile güçlü teknik iş birliği yapan takım, 2016\'daki debüsünde puan kazanarak şaşırttı. 2022\'de Kevin Magnussen\'ın geri dönüşüyle en iyi sezonunu yaşadı.',
  },
  'Racing Bulls': {
    founded: 2006, base: 'Faenza, İtalya', chassis: 'VCARB 03',
    engine: 'Ford Red Bull Powertrains', teamPrincipal: 'Laurent Mekies',
    championships: { constructor: 0, driver: 0 },
    bestSeason: '2008 (Sebastian Vettel — ilk galibiyeti)',
    podiums: 6, wins: 2, poles: 1,
    famousDrivers: ['Sebastian Vettel (Toro Rosso)', 'Max Verstappen (Toro Rosso)', 'Carlos Sainz', 'Pierre Gasly', 'Yuki Tsunoda'],
    milestones: [
      '2008: Vettel ile Monza\'da sürpriz galibiyet (ıslak pistte)',
      '2016: 18 yaşındaki Verstappen F1 debüsünde puan aldı',
      '2019: Gasly ile Monza galibiyeti',
    ],
    about: 'Minardi\'nin devamı olan bu takım, Toro Rosso → AlphaTauri → VCARB → Racing Bulls isim değişikliklerinden geçti. Red Bull\'un genç sürücü yetiştirme platformu olarak Sebastian Vettel, Max Verstappen gibi şampiyonları keşfetti. 2024\'ten itibaren "Racing Bulls" adıyla yarışmaktadır. 2026 itibarıyla Red Bull-Ford motorları kullanmaktadır.',
  },
  'Aston Martin': {
    founded: 1991, base: 'Silverstone, İngiltere', chassis: 'AMR26',
    engine: 'Honda RA626H', teamPrincipal: 'Andy Cowell',
    championships: { constructor: 0, driver: 0 },
    bestSeason: '2023 (5. sıra — Fernando Alonso 8 podyum)',
    podiums: 11, wins: 0, poles: 0,
    famousDrivers: ['Fernando Alonso', 'Lance Stroll', 'Sebastian Vettel', 'Jenson Button (BAR)', 'Rubens Barrichello'],
    milestones: [
      '2009: BAR → Honda → Brawn GP — Button\'la şampiyonluk',
      '2021: "Aston Martin" adıyla yeniden doğuş (Force India devamı)',
      '2023: Alonso ile 8 podyum — tarihinin en iyi sezonu',
    ],
    about: 'Bu tesis Jordan → BAR → Honda → Brawn GP → Mercedes GP → Force India → Racing Point → Aston Martin isim değişimlerinden geçti. Lawrence Stroll 2018\'de satın aldıktan sonra Aston Martin markasını 2021\'de getirdi. 2026 itibarıyla takım fabrika destekli Honda motorlarına geçiş yaptı.',
  },
  'Audi': {
    founded: 2026, base: 'Hinwil, İsviçre', chassis: 'Audi F1-26',
    engine: 'Audi F1 Power Unit', teamPrincipal: 'Mattia Binotto',
    championships: { constructor: 0, driver: 0 },
    bestSeason: '2026 — İlk sezon',
    podiums: 0, wins: 0, poles: 0,
    famousDrivers: ['Nico Hülkenberg', 'Gabriel Bortoleto'],
    milestones: [
      '2022: Volkswagen Grubu F1\'e geri dönme kararı aldı',
      '2023: Sauber ile 2026 ortaklığı açıklandı',
      '2026: Audi F1 markasıyla ilk sezon başladı',
    ],
    about: 'Audi, Sauber altyapısını devralarak 2026\'da tam fabrika takımı olarak F1\'e girdi. Volkswagen Grubu\'nun ilk tam F1 fabrika girişimini temsil eden Audi, kendi güç birimini de üreterek hem takım hem motor tedarikçisi rolünde yer almaktadır. Mattia Binotto (eski Ferrari) takımı yönetiyor.',
  },
  'Cadillac': {
    founded: 2026, base: 'Indianapolis, ABD', chassis: 'CGR-01',
    engine: 'Ferrari 066/10', teamPrincipal: 'Graeme Lowdon',
    championships: { constructor: 0, driver: 0 },
    bestSeason: '2026 — İlk sezon',
    podiums: 0, wins: 0, poles: 0,
    famousDrivers: ['Sergio Pérez', 'Valtteri Bottas'],
    milestones: [
      '2021: Andretti Global F1\'e başvurdu, ilk ret',
      '2024: GM/Cadillac\'ın katılımıyla FIA onayı alındı',
      '2026: F1 tarihinde 11. takım olarak ızgaraya katıldı',
    ],
    about: 'Cadillac F1, General Motors\'un F1\'e dönüşünü temsil eden ve uzun bir hukuki süreç sonunda FIA onayı alan yeni Amerikan takımıdır. Andretti Global altyapısını kullanan takım, Ferrari motor desteğiyle 2026\'da ızgaraya katıldı. ABD\'deki büyüyen F1 ilgisiyle güçlü bir taraftar kitlesine sahip.',
  },
};

// API constructor name → TEAM_HISTORY key
const API_NAME_MAP = {
  'Alpine F1 Team': 'Alpine',
  'RB F1 Team':     'Racing Bulls',
  'Haas F1 Team':   'Haas F1 Team',
  'Red Bull':       'Red Bull Racing',
  'Aston Martin':   'Aston Martin',
  'Mercedes':       'Mercedes',
  'Ferrari':        'Ferrari',
  'McLaren':        'McLaren',
  'Williams':       'Williams',
  'Audi':           'Audi',
  'Cadillac F1 Team': 'Cadillac',
};
function getTeamHistory(apiName) {
  const key = API_NAME_MAP[apiName] || apiName;
  return TEAM_HISTORY[key] || TEAM_HISTORY[apiName] || {};
}

// ─── Team detail modal ────────────────────────────────────────────────
function TeamModal({ item, drivers, onClose }) {
  const team = item.Constructor;
  const color = getTeamColor(team?.name);
  const hist = getTeamHistory(team?.name);
  const teamDrivers = drivers.filter(d => d.Constructors?.some(c => c.constructorId === team?.constructorId));
  const carUrl = getTeamCarUrlLarge(team?.constructorId);
  const logoUrl = getTeamLogoUrl(team?.name);

  const { user, updateProfile, openAuth } = useAuth();
  const isFav = user?.favTeams?.includes(team?.constructorId);
  const canAdd = (user?.favTeams?.length || 0) < 2;

  const handleToggleFav = (e) => {
    e.stopPropagation();
    if (!user) { openAuth(); return; }
    const cur = user.favTeams || [];
    if (isFav) updateProfile({ favTeams: cur.filter(x => x !== team?.constructorId) });
    else updateProfile({ favTeams: [...cur, team?.constructorId] });
  };

  const statItems = [
    { label: 'Kuruluş', val: hist.founded || '—' },
    { label: 'Üs', val: hist.base || team?.nationality || '—' },
    { label: 'Şasi', val: hist.chassis || '—' },
    { label: 'Motor', val: hist.engine || '—' },
    { label: 'Takım Patronu', val: hist.teamPrincipal || '—' },
    { label: 'En İyi Sezon', val: hist.bestSeason || '—' },
  ];

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(28px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, animation:'bbFadeIn 0.2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:560, background:'#080809', border:`1px solid ${color.primary}22`, borderRadius:26, overflow:'hidden', maxHeight:'92vh', overflowY:'auto', animation:'bbSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Top stripe */}
        <div style={{ height:3, background:`linear-gradient(90deg, ${color.primary}, ${color.primary}80)`, boxShadow:`0 0 20px ${color.primary}` }} />

        {/* Hero */}
        <div style={{ position:'relative', minHeight:210, background:`linear-gradient(150deg, ${color.bg} 0%, #050506 60%)`, overflow:'hidden', padding:'22px 24px 20px' }}>
          {/* Ghost pos */}
          <div style={{ position:'absolute', right:-10, bottom:-20, fontSize:180, fontWeight:900, fontStyle:'italic', color:color.primary, opacity:0.05, lineHeight:1, userSelect:'none' }}>
            {parseInt(item.position)}
          </div>

          {/* Car image */}
          {carUrl && (
            <img src={carUrl} alt="" style={{ position:'absolute', bottom:0, right:-20, height:'78%', width:'auto', objectFit:'contain', filter:`drop-shadow(0 8px 32px ${color.primary}28)`, opacity:0.85, zIndex:0 }} onError={e => e.target.style.display='none'} />
          )}

          {/* Close */}
          <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif', lineHeight:1 }}>✕</button>

          {/* Fav star */}
          {(isFav || canAdd) && (
            <button onClick={handleToggleFav} style={{ position:'absolute', top:14, right:54, zIndex:10, width:32, height:32, borderRadius:'50%', background: isFav ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.07)', border:`1px solid ${isFav ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)'}`, color: isFav ? '#FFD700' : 'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
              <Icon name="star" size={14} color="currentColor" />
            </button>
          )}

          {/* Logo + title */}
          <div style={{ position:'relative', zIndex:2, maxWidth:'55%' }}>
            {logoUrl ? (
              <img src={logoUrl} alt={team?.name} style={{ height:26, objectFit:'contain', marginBottom:12, filter:'brightness(1.15)' }} onError={e => e.target.style.display='none'} />
            ) : (
              <div style={{ fontSize:20, fontWeight:900, color:color.primary, marginBottom:12 }}>{team?.name}</div>
            )}

            <div style={{ fontSize:24, fontWeight:900, letterSpacing:-0.7, marginBottom:3 }}>{team?.name}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:14 }}>
              {hist.base || team?.nationality}
              {hist.founded && <> · {hist.founded}′den beri</>}
            </div>

            {/* Championship badges */}
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {hist.championships?.constructor > 0 && (
                <div style={{ background:color.bg, border:`1px solid ${color.primary}30`, borderRadius:8, padding:'3px 10px', fontSize:10, fontWeight:800, color:color.primary }}>
                  {hist.championships.constructor}× Takım Şampiyonu
                </div>
              )}
              {hist.championships?.driver > 0 && (
                <div style={{ background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.2)', borderRadius:8, padding:'3px 10px', fontSize:10, fontWeight:800, color:'#FFD700' }}>
                  {hist.championships.driver}× Sürücü Şampiyonu
                </div>
              )}
              {!hist.championships?.constructor && !hist.championships?.driver && hist.founded >= 2016 && (
                <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'3px 10px', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)' }}>
                  🆕 Yeni Takım
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'20px 24px' }}>

          {/* Key stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:20 }}>
            {[
              { label:'2026 Puan', val:item.points, color: parseInt(item.position)===1 ? '#FFD700' : 'white' },
              { label:'Kazanılan', val: hist.wins ?? '—', color: (hist.wins > 0) ? '#FFD700' : 'rgba(255,255,255,0.5)' },
              { label:'Podyum', val: hist.podiums ?? '—', color: (hist.podiums > 0) ? color.primary : 'rgba(255,255,255,0.5)' },
              { label:'Pole', val: hist.poles ?? '—', color: (hist.poles > 0) ? '#a855f7' : 'rgba(255,255,255,0.5)' },
              { label:'Şasi', val: hist.chassis || '—', color:'rgba(255,255,255,0.8)', small:true },
              { label:'Motor', val: hist.engine?.split(' ').slice(0,2).join(' ') || '—', color:'rgba(255,255,255,0.8)', small:true },
            ].map(s => (
              <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontSize: s.small ? 12 : 19, fontWeight:900, color:s.color, letterSpacing: s.small ? -0.2 : -0.5, marginBottom:2 }}>{s.val}</div>
                <div style={{ fontSize:7, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* About */}
          {hist.about && (
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Hakkında</div>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.62)', lineHeight:1.75, margin:0 }}>{hist.about}</p>
            </div>
          )}

          {/* Team info table */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Takım Bilgileri</div>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, overflow:'hidden' }}>
              {statItems.map((s, i) => (
                <div key={s.label} style={{ display:'flex', alignItems:'center', padding:'9px 14px', borderBottom: i < statItems.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ flex:'0 0 130px', fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:600 }}>{s.label}</span>
                  <span style={{ flex:1, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.8)' }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          {hist.milestones?.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Önemli Anlar</div>
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {hist.milestones.map((m, i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:color.primary, flexShrink:0, marginTop:5, boxShadow:`0 0 6px ${color.primary}` }} />
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)', lineHeight:1.5 }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Famous drivers */}
          {hist.famousDrivers?.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Efsanevi Pilotlar</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {hist.famousDrivers.map((d, i) => (
                  <span key={i} style={{ background:`${color.primary}10`, border:`1px solid ${color.primary}20`, borderRadius:8, padding:'3px 10px', fontSize:11, fontWeight:700, color:color.primary }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 2026 Drivers */}
          {teamDrivers.length > 0 && (
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>2026 Sürücüleri</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {teamDrivers.map(d => {
                  const drv = d.Driver;
                  const imgUrl = getDriverImageUrl(drv?.driverId);
                  return (
                    <div key={drv?.driverId} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.03)', border:`1px solid ${color.primary}12`, borderRadius:12, padding:'10px 14px', position:'relative', overflow:'hidden' }}>
                      {/* Portrait */}
                      <div style={{ width:46, height:46, borderRadius:11, overflow:'hidden', flexShrink:0, background:`${color.primary}08`, border:`1px solid ${color.primary}18`, position:'relative' }}>
                        {imgUrl && (
                          <img src={imgUrl} alt={drv?.familyName} style={{ width:'250%', height:'110%', objectFit:'cover', objectPosition:'center top', position:'absolute', left:'50%', transform:'translateX(-50%)', top:0 }} />
                        )}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:800 }}>{drv?.givenName} <strong>{drv?.familyName}</strong></div>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:2 }}>
                          <img src={getFlagUrl(drv?.nationality)} alt="" style={{ width:15, borderRadius:2 }} onError={e => e.target.style.display='none'} />
                          <span style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>#{drv?.permanentNumber} · {drv?.nationality}</span>
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:20, fontWeight:900, color:color.primary }}>{d.points}</div>
                        <div style={{ fontSize:8, color:'rgba(255,255,255,0.25)', textTransform:'uppercase' }}>puan</div>
                        {parseInt(d.wins) > 0 && (
                          <div style={{ fontSize:9, color:'#FFD700', fontWeight:800, marginTop:2 }}>{d.wins} zafer</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Team card ────────────────────────────────────────────────────────
function TeamCard({ item, drivers, onClick }) {
  const [hovered, setHovered] = useState(false);
  const team = item.Constructor;
  const color = getTeamColor(team?.name);
  const pos = parseInt(item.position);
  const logoUrl = getTeamLogoUrl(team?.name);
  const carUrl = getTeamCarUrlLarge(team?.constructorId);
  const hist = getTeamHistory(team?.name);
  const teamDrivers = drivers.filter(d => d.Constructors?.some(c => c.constructorId === team?.constructorId));
  const isTop3 = pos <= 3;
  const mc = { 1:'#FFD700', 2:'#C0C7D0', 3:'#CD853F' };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:'relative', overflow:'hidden', background:'#0D0D10',
        border:`1px solid ${hovered ? color.primary+'35' : isTop3 ? color.primary+'18' : 'rgba(255,255,255,0.07)'}`,
        borderRadius:20, cursor:'pointer',
        transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 20px 50px rgba(0,0,0,0.5), 0 0 40px ${color.primary}08` : isTop3 ? `0 4px 20px ${color.primary}08` : 'none',
      }}
    >
      {/* Left stripe */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width: isTop3 ? 4 : 3, background: isTop3 ? mc[pos] || color.primary : color.primary, boxShadow: hovered ? `0 0 20px ${color.primary}` : 'none', transition:'box-shadow 0.25s' }} />

      {/* BG radial + car */}
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 70% 100% at 100% 50%, ${color.primary}${hovered?'10':'06'}, transparent)`, transition:'all 0.25s' }} />
      {carUrl && (
        <div style={{ position:'absolute', right:-10, bottom:0, height:'75%', width:'52%', zIndex:0, opacity: hovered ? 0.30 : 0.15, transition:'opacity 0.3s' }}>
          <img src={carUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'contain', objectPosition:'right bottom', filter:`drop-shadow(0 4px 20px ${color.primary}40)` }} onError={e => e.target.style.display='none'} />
        </div>
      )}

      {/* Content */}
      <div style={{ position:'relative', zIndex:1, padding:'18px 20px 16px 24px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          {/* Pos medal */}
          <div style={{ width:38, height:38, borderRadius:11, background: isTop3 ? `${mc[pos]}12` : color.bg, border:`1px solid ${isTop3 ? mc[pos]+'30' : color.primary+'25'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize: isTop3 ? 18 : 14, fontWeight:900, color: isTop3 ? mc[pos] : color.primary, flexShrink:0 }}>
            {isTop3 ? ['1','2','3'][pos-1] : pos}
          </div>

          {/* Logo / Name */}
          {logoUrl ? (
            <img src={logoUrl} alt={team?.name} style={{ height:18, objectFit:'contain', filter:'brightness(1.1)' }} onError={e => e.target.style.display='none'} />
          ) : (
            <div style={{ fontSize:13, fontWeight:900, color:color.primary }}>{team?.name}</div>
          )}

          <div style={{ flex:1 }} />

          {/* Points */}
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:22, fontWeight:900, letterSpacing:-1, color: pos===1 ? '#FFD700' : 'white' }}>{item.points}</div>
            <div style={{ fontSize:7, color:'rgba(255,255,255,0.2)', textTransform:'uppercase' }}>puan</div>
          </div>
        </div>

        {/* Team name (when logo is shown) */}
        {logoUrl && <div style={{ fontSize:14, fontWeight:800, marginBottom:1 }}>{team?.name}</div>}
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)', marginBottom:10 }}>
          {hist.base || team?.nationality}{hist.founded ? ` · ${hist.founded}′den beri` : ''}
        </div>

        {/* Engine info */}
        {hist.engine && (
          <div style={{ fontSize:9, color:`${color.primary}cc`, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
            <span>MOT</span> {hist.engine}
          </div>
        )}

        {/* History blurb */}
        {hist.about && (
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.42)', lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {hist.about}
          </div>
        )}

        {/* Championship badges */}
        {(hist.championships?.constructor > 0 || hist.championships?.driver > 0) && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
            {hist.championships.constructor > 0 && (
              <div style={{ background:color.bg, border:`1px solid ${color.primary}25`, borderRadius:6, padding:'2px 7px', fontSize:9, fontWeight:800, color:color.primary }}>
                {hist.championships.constructor}× Takım Şamp.
              </div>
            )}
            {hist.championships.driver > 0 && (
              <div style={{ background:'rgba(255,215,0,0.07)', border:'1px solid rgba(255,215,0,0.15)', borderRadius:6, padding:'2px 7px', fontSize:9, fontWeight:800, color:'#FFD700' }}>
                {hist.championships.driver}× Sürücü
              </div>
            )}
          </div>
        )}

        {/* Drivers */}
        <div style={{ display:'flex', gap:7, marginBottom:12, flexWrap:'wrap' }}>
          {teamDrivers.map(d => (
            <div key={d.Driver?.driverId} style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'4px 8px' }}>
              <img src={getFlagUrl(d.Driver?.nationality)} alt="" style={{ width:13, borderRadius:2 }} onError={e => e.target.style.display='none'} />
              <span style={{ fontSize:10, fontWeight:700 }}>{d.Driver?.familyName}</span>
              <span style={{ fontSize:9, color:color.primary, fontWeight:900 }}>#{d.Driver?.permanentNumber}</span>
              <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>{d.points}p</span>
            </div>
          ))}
        </div>

        {/* Points bar */}
        <div style={{ height:2, background:'rgba(255,255,255,0.05)', borderRadius:99, overflow:'hidden', marginBottom:10 }}>
          <div style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg, ${color.primary}, ${color.primary}50)`, width:`${Math.min((parseInt(item.points)/600)*100,100)}%`, transition:'width 1.2s ease' }} />
        </div>

        {/* Detail hint */}
        <div style={{ fontSize:10, fontWeight:700, color: hovered ? color.primary : 'rgba(255,255,255,0.18)', transition:'color 0.2s', display:'flex', alignItems:'center', gap:5 }}>
          <span>+</span> Detaylar · Araç görünümü →
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function Teams() {
  const { standings: cs, loading: cL, error } = useConstructorStandings();
  const { standings: ds, loading: dL } = useDriverStandings();
  const [selected, setSelected] = useState(null);
  const loading = cL || dL;

  if (loading) return (
    <div className="page-content"><div className="container">
      <div className="page-header"><h1>Takımlar</h1></div>
      <LoadingSpinner />
    </div></div>
  );
  if (error) return (
    <div className="page-content"><div className="container">
      <div className="page-header"><h1>Takımlar</h1></div>
      <ErrorMessage message={error} />
    </div></div>
  );

  return (
    <div className="page-content">
      <div className="container">
        <div className="page-header">
          <div className="page-title-row">
            <h1>Takımlar</h1>
            <span className="page-chip">2026 · {cs.length} Takım</span>
          </div>
          <p>Takıma tıkla → Tarih · Araç · Şampiyonluklar · Pilotlar</p>
        </div>

        <div className="g2" style={{ marginBottom:40 }}>
          {cs.map(item => (
            <TeamCard
              key={item.Constructor?.constructorId}
              item={item}
              drivers={ds}
              onClick={() => setSelected(item)}
            />
          ))}
        </div>
      </div>

      {selected && (
        <TeamModal item={selected} drivers={ds} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
