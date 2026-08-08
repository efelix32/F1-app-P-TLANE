import React from 'react';

export function LoadingSpinner({ text = 'Yükleniyor...' }) {
  return (
    <div className="loading-wrap">
      <div className="spinner-ring" />
      <p className="loading-txt">{text}</p>
    </div>
  );
}

export function ErrorMessage({ message }) {
  return (
    <div className="error-wrap">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <p className="error-txt">{message || 'Veri alınamadı'}</p>
    </div>
  );
}
