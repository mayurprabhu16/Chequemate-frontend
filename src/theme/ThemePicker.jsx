import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeContext';

const ThemePicker = () => {
  const { themeId, setThemeId, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const themeList = themes || [];
  const current = themeList.find((t) => (t.id || t.key) === themeId) || themeList[0] || { emoji: '🌃', label: 'Theme' };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="cm-theme-picker" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="cm-theme-trigger"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="cm-theme-trigger-emoji">{current.emoji || current.icon || '🌃'}</span>
        <span className="cm-theme-trigger-label">{current.label || current.name || 'Theme'}</span>
        <span className="cm-theme-trigger-caret">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="cm-theme-menu">
          <div className="cm-theme-menu-title">Trip theme</div>
          <div className="cm-theme-grid">
            {themeList.map((t) => {
              const tId = t.id || t.key;
              const isSelected = tId === themeId;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => {
                    setThemeId(tId);
                    setOpen(false);
                  }}
                  className={`cm-theme-swatch cm-swatch-${tId}${isSelected ? ' cm-theme-swatch--active' : ''}`}
                >
                  <span className="cm-theme-swatch-emoji">{t.emoji || t.icon}</span>
                  <span>{t.label || t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
