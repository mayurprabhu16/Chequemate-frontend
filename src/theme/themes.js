// Each theme drives a full palette swap via CSS custom properties
// (see the `[data-theme="…"]` blocks in index.css) and a matching
// swatch background used in the theme picker. `accent` / `soft` are also
// used by ToastContext.jsx so pop-up messages match the active theme.
export const THEMES = [
  { id: 'classic',     label: 'Classic Ledger', emoji: '📒', accent: '#b9902f', soft: '#f7ecd2' },
  { id: 'mountains',   label: 'Mountains',      emoji: '🏔️', accent: '#54728a', soft: '#e4edf3' },
  { id: 'beach',       label: 'Beach',          emoji: '🏖️', accent: '#1fa2b8', soft: '#dff7f4' },
  { id: 'waterpark',   label: 'Waterpark',      emoji: '🌊', accent: '#17a3d6', soft: '#e0f6fd' },
  { id: 'desert',      label: 'Desert Safari',  emoji: '🏜️', accent: '#c98444', soft: '#fbead9' },
  { id: 'forest',      label: 'Forest Trail',   emoji: '🌲', accent: '#2f6b47', soft: '#e2f0e5' },
  { id: 'snow',        label: 'Snow Peaks',     emoji: '❄️', accent: '#5b8bab', soft: '#eaf4fb' },
  { id: 'lake',        label: 'Lakeside',       emoji: '🏞️', accent: '#4a5a8f', soft: '#e7e9f5' },
  { id: 'nightlife',   label: 'City Nightlife', emoji: '🌃', accent: '#c2408f', soft: '#fbe6f2' },
  { id: 'countryside', label: 'Countryside',    emoji: '🌾', accent: '#6fa347', soft: '#eef6e5' },
  { id: 'cruise',      label: 'Cruise',         emoji: '🚢', accent: '#2f6b8a', soft: '#e2eff3' },
  { id: 'roadtrip',    label: 'Road Trip',      emoji: '🚗', accent: '#c9722f', soft: '#fbe9dc' },
].map((t) => ({ ...t, previewBg: t.accent }));

export const DEFAULT_THEME = 'classic';
export const THEME_STORAGE_KEY = 'chequemate-theme';
