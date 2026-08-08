import { useState, useEffect } from 'react';

const THEME_KEY = 'pitlane_theme_v1';

const THEMES = [
  { id: 'dark',     label: 'Varsayılan',  color: '#00D4AA', preview: '#070708' },
  { id: 'ferrari',  label: 'Ferrari',     color: '#E8002D', preview: '#07000A' },
  { id: 'mercedes', label: 'Mercedes',    color: '#00D2BE', preview: '#000A09' },
  { id: 'mclaren',  label: 'McLaren',     color: '#FF8000', preview: '#0A0600' },
  { id: 'redbull',  label: 'Red Bull',    color: '#3671C6', preview: '#00000F' },
  { id: 'light',    label: 'Aydınlık',   color: '#00B891', preview: '#F5F5F7' },
];

function applyTheme(themeId) {
  if (themeId === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeId);
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const changeTheme = (themeId) => {
    setTheme(themeId);
    localStorage.setItem(THEME_KEY, themeId);
    applyTheme(themeId);
  };

  return { theme, changeTheme, themes: THEMES };
}
