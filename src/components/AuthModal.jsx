import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthModal() {
  const { login, register, googleLogin, closeAuth } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      closeAuth();
    } catch (err) {
      let msg = err.message || 'Bir hata olustu';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        msg = 'E-posta veya sifre hatali. Sifrenizi unuttuysan asagidaki baglantiya tikla.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'Bu e-posta adresi zaten kullanımda. Giris yap butonuna gec.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Sifre en az 6 karakter olmali.';
      } else if (msg.includes('auth/too-many-requests')) {
        msg = 'Cok fazla basarisiz giris. Lutfen birka dakika bekle veya sifreni sifirla.';
      } else if (msg.includes('auth/network-request-failed')) {
        msg = 'Baglanti hatasi. Internet baglantini kontrol et.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) { setError('Sifre sifirlamak icin once e-posta adresini yaz.'); return; }
    setError(''); setLoading(true);
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
      }
    } catch (err) {
      setError('Sifre sifirlama e-postasi gonderilmedi. E-posta adresini kontrol et.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try {
      await googleLogin();
      closeAuth();
    } catch (err) {
      console.error('Google auth error:', err);
      let msg = err.message || 'Google girişi başarısız';
      if (msg.includes('auth/popup-closed-by-user')) {
        msg = 'Giriş penceresi kapatıldı.';
      } else if (msg.includes('auth/unauthorized-domain')) {
        msg = 'Google girişi için bu alan adı henüz yetkilendirilmedi. Lütfen e-posta ile kayıt olun.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={closeAuth}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(28px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        animation: 'bbFadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 380,
          background: 'linear-gradient(160deg, #0F0F14 0%, #080809 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 28, overflow: 'hidden',
          animation: 'bbSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Top stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #E10600, #FF8000, #00D2BE)' }} />

        <div style={{ padding: '30px 28px 32px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
              PitLane<span style={{ color: '#E10600' }}>.</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              {mode === 'login' ? 'Hesabına giriş yap' : 'Yeni hesap oluştur'}
            </div>
          </div>

          {/* Social login */}
          <button
            type="button" onClick={handleGoogle} disabled={loading}
            style={{
              width: '100%', padding: '11px', borderRadius: 14,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'white', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginBottom: 18, fontFamily: 'var(--font)',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Google ile {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>veya</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>İsim</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Adın soyadın"
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', fontSize: 13, fontFamily: 'var(--font)', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>E-posta</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="sen@mail.com"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: 13, fontFamily: 'var(--font)', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Şifre</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: 13, fontFamily: 'var(--font)', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(225,6,0,0.1)', border: '1px solid rgba(225,6,0,0.2)', fontSize: 12, color: '#ff6b6b', marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 14, border: 'none',
                background: loading ? 'rgba(225,6,0,0.5)' : 'linear-gradient(135deg, #E10600, #B00500)',
                color: 'white', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font)', letterSpacing: 0.3,
                boxShadow: '0 8px 24px rgba(225,6,0,0.3)',
                transition: 'all 0.15s',
              }}
            >
              {loading ? 'Lütfen bekle...' : mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
            </button>
          </form>

          {/* Forgot password — login mode only */}
          {mode === 'login' && (
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              {resetSent ? (
                <span style={{ color: '#00D2BE', fontWeight: 700 }}>
                  Sifre sifirlama e-postasi gonderildi! Gelen kutunu kontrol et.
                </span>
              ) : (
                <>
                  Sifreni mi unuttun?{' '}
                  <span onClick={handleReset} style={{ color: '#E10600', fontWeight: 700, cursor: 'pointer' }}>
                    Sifre Sifirla
                  </span>
                </>
              )}
            </div>
          )}

          {/* Toggle mode */}
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {mode === 'login' ? (
              <>Hesabin yok mu?{' '}
                <span onClick={() => { setMode('register'); setError(''); setResetSent(false); }} style={{ color: '#E10600', fontWeight: 700, cursor: 'pointer' }}>Kayit ol</span>
              </>
            ) : (
              <>Zaten hesabin var mi?{' '}
                <span onClick={() => { setMode('login'); setError(''); }} style={{ color: '#E10600', fontWeight: 700, cursor: 'pointer' }}>Giris yap</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
