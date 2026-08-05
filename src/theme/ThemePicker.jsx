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
    <div style={styles.container} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={styles.triggerButton}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{current.emoji || current.icon || '🌃'}</span>
        <span>{current.label || current.name || 'Theme'}</span>
        <span style={{ fontSize: '10px', opacity: 0.8 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={styles.dropdownMenu}>
          <div style={styles.menuTitle}>TRIP THEME</div>
          <div style={styles.grid}>
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
                  style={{
                    ...styles.swatchCard,
                    backgroundColor: t.previewBg || '#1e293b',
                    border: isSelected ? '3px solid #ec4899' : '1px solid transparent',
                    boxShadow: isSelected ? '0 0 12px rgba(236, 72, 153, 0.5)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '20px', marginBottom: '4px' }}>{t.emoji || t.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: '800', textAlign: 'center', lineHeight: '1.2' }}>
                    {t.label || t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
    zIndex: 99999
  },
  triggerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    outline: 'none'
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    zIndex: 2147483647,
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    width: '320px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
    border: '1px solid #f3f4f6'
  },
  menuTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: '0.05em',
    marginBottom: '16px',
    fontFamily: 'monospace'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  swatchCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 6px',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#ffffff',
    outline: 'none',
    minHeight: '64px'
  }
};

export default ThemePicker;