import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';

/**
 * Drop-in replacement for alert(...) / window.confirm(...).
 * Pops up dead-center of the screen (both phone and desktop), colored to
 * match the active trip theme, auto-dismisses after 3 seconds, and
 * supports an optional Undo action for reversible operations like deletes.
 *
 * All layout-critical styling is inline on purpose — it does not depend on
 * any external CSS file being present or wired in correctly.
 *
 * SETUP — wrap your app once, INSIDE <ThemeProvider> (it needs useTheme()):
 *
 *   <ThemeProvider>
 *     <ToastProvider>
 *       <App />
 *     </ToastProvider>
 *   </ThemeProvider>
 *
 * USAGE:
 *   const { showToast } = useToast();
 *   showToast('Group created successfully!');            // success, theme-colored
 *   showToast('Failed to create group', 'error');          // error, always red
 *   showToast('Deleted "Goa Trip"', {
 *     type: 'undo',
 *     actionLabel: 'Undo',
 *     onAction: () => { / * restore the item * / },
 *   });
 */

const ToastContext = createContext();

let idCounter = 0;
const DEFAULT_DURATION = 3000;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});
  const { themeId, themes } = useTheme() || {};

  const activeTheme = (themes || []).find((t) => (t.id || t.key) === themeId);
  const accent = activeTheme?.accent || '#b9902f';
  const soft = activeTheme?.soft || '#f4f1ea';

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message, typeOrOptions = 'success', maybeOptions = {}) => {
      const options = typeof typeOrOptions === 'string' ? { type: typeOrOptions, ...maybeOptions } : typeOrOptions || {};
      const { type = 'success', duration = DEFAULT_DURATION, actionLabel, onAction } = options;

      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type, duration, actionLabel, onAction }]);
      timers.current[id] = setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={removeToast} accent={accent} soft={soft} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5 L6.5 12 L13 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8" y1="7.2" x2="8" y2="11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="4.6" r="0.9" fill="currentColor" />
    </svg>
  ),
  undo: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6 L4 3 M4 6 L1 6 M4 6 C7 3 12 4 12 8.5 C12 12 8.5 13.5 5.5 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
};

const ERROR_COLOR = '#b91c1c';
const ERROR_SOFT = '#fbe7e7';

/* Keyframes injected once so the pop-in / backdrop-fade / progress-shrink
   animations work even if no external CSS is loaded at all. */
const KEYFRAMES = `
@keyframes cm-toast-pop { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
@keyframes cm-backdrop-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cm-toast-shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }
`;

const viewportStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 2147483000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 10,
  pointerEvents: 'none',
  width: 'min(400px, calc(100vw - 32px))',
};

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 2147482999,
  background: 'rgba(20, 14, 10, 0.22)',
  pointerEvents: 'none',
  animation: 'cm-backdrop-fade 0.2s ease both',
};

const ToastViewport = ({ toasts, onDismiss, accent, soft }) => {
  return (
    <>
      <style>{KEYFRAMES}</style>
      {toasts.length > 0 && (
        <div style={viewportStyle} aria-live="polite" aria-atomic="true">
          <div style={backdropStyle} />
          {toasts.map((t) => {
            const isError = t.type === 'error';
            const barColor = isError ? ERROR_COLOR : accent;
            const iconBg = isError ? ERROR_SOFT : soft;

            return (
              <div
                key={t.id}
                role="status"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: '#ffffff',
                  color: '#2b1a14',
                  padding: 'clamp(14px, 4vw, 18px) 42px clamp(14px, 4vw, 18px) 18px',
                  borderRadius: 14,
                  border: '1px solid #e5e7eb',
                  borderLeft: `5px solid ${barColor}`,
                  boxShadow: '0 24px 48px rgba(43, 26, 20, 0.32)',
                  fontSize: 'clamp(13.5px, 3.6vw, 15px)',
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  pointerEvents: 'auto',
                  width: '100%',
                  boxSizing: 'border-box',
                  animation: 'cm-toast-pop 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <span
                  style={{
                    flex: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    color: barColor,
                    backgroundColor: iconBg,
                  }}
                >
                  {ICONS[t.type] || ICONS.success}
                </span>

                <span style={{ flex: 1, fontWeight: 600, minWidth: 0, wordBreak: 'break-word' }}>{t.message}</span>

                {t.actionLabel && t.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      t.onAction();
                      onDismiss(t.id);
                    }}
                    style={{
                      flex: 'none',
                      background: 'transparent',
                      border: 'none',
                      color: barColor,
                      fontWeight: 800,
                      fontSize: 'clamp(12px, 3.2vw, 13px)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      cursor: 'pointer',
                      padding: '4px 6px',
                    }}
                  >
                    {t.actionLabel}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDismiss(t.id)}
                  aria-label="Dismiss"
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    background: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    fontSize: 18,
                    lineHeight: 1,
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  &times;
                </button>

                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    height: 3,
                    width: '100%',
                    backgroundColor: barColor,
                    opacity: 0.4,
                    transformOrigin: 'left',
                    animation: `cm-toast-shrink ${t.duration}ms linear forwards`,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
