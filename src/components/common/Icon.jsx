import React from 'react';

export default function Icon({ name, size = 16, color = 'currentColor' }) {
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
    default: return null;
  }
}
