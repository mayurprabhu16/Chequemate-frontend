import React from 'react';
import { useTheme } from './ThemeContext';

/**
 * Renders a full-viewport, fixed, click-through decorative scene that matches
 * the currently selected trip theme (see themes.js). Mount this ONCE near the
 * root of the app — e.g. in App.jsx, right after <ThemeProvider> opens:
 *
 *   <ThemeProvider>
 *     <ThemeBackground />
 *     <Routes>...</Routes>
 *   </ThemeProvider>
 *
 * It paints behind everything (z-index: -1) so it shows through the gaps
 * around your existing white cards/header rather than fighting with them.
 */
const bgStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  overflow: 'hidden',
  pointerEvents: 'none',
};

const ThemeBackground = () => {
  const { themeId } = useTheme();
  const Scene = SCENES[themeId] || SCENES.classic;

  return (
    <div className="cm-theme-bg" aria-hidden="true" style={bgStyle}>
      <Scene />
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* Individual scenes                                                      */
/* ---------------------------------------------------------------------- */

const wrap = (children) => (
  <svg
    viewBox="0 0 1200 800"
    preserveAspectRatio="xMidYMax slice"
    width="100%"
    height="100%"
  >
    {children}
  </svg>
);

const Classic = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="classic-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3e7c9" />
          <stop offset="100%" stopColor="#e8d5a3" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#classic-sky)" />
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={i} x1="0" y1={60 + i * 54} x2="1200" y2={60 + i * 54} stroke="#c9ad6e" strokeWidth="1" opacity="0.35" />
      ))}
      <line x1="120" y1="0" x2="120" y2="800" stroke="#b9542f" strokeWidth="2" opacity="0.25" />
      <circle cx="1040" cy="640" r="120" fill="none" stroke="#b9902f" strokeWidth="3" opacity="0.18" />
      <path d="M980 650 L1015 690 L1090 610" fill="none" stroke="#b9902f" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
    </>
  );

const Mountains = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="mtn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe1f2" />
          <stop offset="100%" stopColor="#eef7fb" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#mtn-sky)" />
      <circle cx="980" cy="180" r="70" fill="#fff3c4" opacity="0.9" />
      <path d="M0 520 L200 340 L340 480 L520 300 L720 520 Z" fill="#a9c3d6" opacity="0.55" />
      <path d="M300 560 L560 360 L760 560 L980 380 L1200 560 L1200 800 L0 800 Z" fill="#7f9fb8" opacity="0.75" />
      <path d="M0 620 L260 460 L480 620 L760 440 L1000 620 L1200 500 L1200 800 L0 800 Z" fill="#54728a" />
      {[[150, 200], [220, 230], [900, 150]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} q10 -12 20 0 q10 -12 20 0`} stroke="#3b4a56" strokeWidth="3" fill="none" opacity="0.5" />
      ))}
    </>
  );

const Beach = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="beach-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fd7e8" />
          <stop offset="100%" stopColor="#e9f8ee" />
        </linearGradient>
        <linearGradient id="beach-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1fa2b8" />
          <stop offset="100%" stopColor="#5fd3c4" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#beach-sky)" />
      <circle cx="1000" cy="150" r="70" fill="#ffe27a" />
      <rect y="420" width="1200" height="220" fill="url(#beach-sea)" />
      {[440, 480, 520, 560].map((y, i) => (
        <path key={i} d={`M0 ${y} Q60 ${y - 10} 120 ${y} T240 ${y} T360 ${y} T480 ${y} T600 ${y} T720 ${y} T840 ${y} T960 ${y} T1080 ${y} T1200 ${y}`} stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.5" />
      ))}
      <rect y="630" width="1200" height="170" fill="#f4dfa6" />
      <path d="M0 630 Q600 590 1200 630 L1200 660 Q600 630 0 660 Z" fill="#f0d183" />
      {/* palm trees */}
      {[[140, 640, 1], [1090, 660, -1]].map(([x, y, dir], i) => (
        <g key={i}>
          <path d={`M${x} ${y} C ${x + 10 * dir} ${y - 60} ${x - 5 * dir} ${y - 120} ${x + 8 * dir} ${y - 170}`} stroke="#7a5230" strokeWidth="10" fill="none" strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map((j) => (
            <path
              key={j}
              d={`M${x + 8 * dir} ${y - 170} q ${40 * Math.cos((j * 1.2) - 1) * dir} ${-20 - j * 4} ${70 * Math.cos((j * 1.2) - 1) * dir} ${10 + j * 6}`}
              stroke="#2f7d4f"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}
    </>
  );

const Waterpark = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fbdf0" />
          <stop offset="100%" stopColor="#cdf1ff" />
        </linearGradient>
        <linearGradient id="wp-pool" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f96c9" />
          <stop offset="100%" stopColor="#3fd0e0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#wp-sky)" />
      <circle cx="130" cy="130" r="55" fill="#fff6c8" />
      {/* clouds */}
      {[[520, 110, 46], [640, 90, 34], [980, 150, 40]].map(([x, y, r], i) => (
        <g key={i} opacity="0.85">
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.6} fill="#ffffff" />
          <ellipse cx={x + r * 0.8} cy={y + 8} rx={r * 0.7} ry={r * 0.45} fill="#ffffff" />
          <ellipse cx={x - r * 0.7} cy={y + 6} rx={r * 0.6} ry={r * 0.4} fill="#ffffff" />
        </g>
      ))}
      {/* slide tower */}
      <g transform="translate(230,120)">
        <rect x="-46" y="0" width="92" height="230" fill="#e8edf1" />
        <rect x="-46" y="0" width="92" height="230" fill="#ffffff" opacity="0.25" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1="-46" y1={i * 40} x2="46" y2={i * 40} stroke="#c3ccd2" strokeWidth="3" />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`s${i}`} x1={-40 + (i % 2) * 70} y1={i * 40} x2={-40 + (i % 2) * 70 + 6} y2={i * 40 + 40} stroke="#c3ccd2" strokeWidth="3" />
        ))}
        <rect x="-54" y="-18" width="108" height="20" rx="6" fill="#ff8a3d" />
      </g>
      {/* two flumes twisting down from the tower */}
      <path d="M262 130 C 460 150 380 300 620 330 C 830 358 780 470 1010 500" stroke="#ff8a3d" strokeWidth="36" fill="none" strokeLinecap="round" />
      <path d="M262 130 C 460 150 380 300 620 330 C 830 358 780 470 1010 500" stroke="#ffc088" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M204 150 C 120 220 260 300 160 380 C 80 445 220 480 260 560" stroke="#1fb6c9" strokeWidth="32" fill="none" strokeLinecap="round" />
      <path d="M204 150 C 120 220 260 300 160 380 C 80 445 220 480 260 560" stroke="#7fe3ec" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.85" />
      {/* pool */}
      <rect y="560" width="1200" height="240" fill="url(#wp-pool)" />
      {[590, 625, 660, 695].map((y, i) => (
        <path key={i} d={`M0 ${y} Q60 ${y - 8} 120 ${y} T240 ${y} T360 ${y} T480 ${y} T600 ${y} T720 ${y} T840 ${y} T960 ${y} T1080 ${y} T1200 ${y}`} stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.4" />
      ))}
      {/* floats */}
      {[[520, 640, '#ff6f91'], [780, 690, '#ffd166'], [900, 615, '#8ee3ff']].map(([x, y, c], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="30" fill="none" stroke={c} strokeWidth="14" opacity="0.9" />
          <circle cx={x} cy={y} r="30" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.6" />
        </g>
      ))}
      {/* splash at the flume landings */}
      {[[1010, 500], [260, 560]].map(([x, y], i) => (
        <g key={i}>
          {[[-30, -18], [0, -32], [30, -20], [-14, -34], [18, -30]].map(([dx, dy], j) => (
            <circle key={j} cx={x + dx} cy={y + dy} r="5" fill="#ffffff" opacity="0.85" />
          ))}
        </g>
      ))}
      {/* poolside umbrella + palm */}
      <g transform="translate(1090,600)">
        <line x1="0" y1="-10" x2="0" y2="60" stroke="#7a5230" strokeWidth="6" />
        <path d="M-55 -10 Q0 -70 55 -10 Z" fill="#ff8a3d" />
        <path d="M-55 -10 Q-28 -30 0 -10 Z" fill="#ffb46b" />
        <path d="M0 -10 Q28 -30 55 -10 Z" fill="#ffb46b" />
      </g>
      <g transform="translate(60,640)">
        <path d="M0 0 C 8 -40 -4 -80 6 -120" stroke="#7a5230" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M6 -120 q35 -8 60 18 M6 -120 q-28 -18 -55 2 M6 -120 q10 -26 38 -34" stroke="#2f7d4f" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>
    </>
  );

const Desert = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="des-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb27a" />
          <stop offset="100%" stopColor="#ffe3b0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#des-sky)" />
      <circle cx="950" cy="220" r="90" fill="#ffcf6b" opacity="0.9" />
      <path d="M0 560 Q200 480 420 560 T900 560 T1200 540 L1200 800 L0 800 Z" fill="#e0a25c" opacity="0.7" />
      <path d="M0 640 Q220 570 460 640 T940 630 T1200 650 L1200 800 L0 800 Z" fill="#c98444" />
      {/* cactus */}
      <g transform="translate(180,470)">
        <rect x="-14" y="0" width="28" height="150" rx="14" fill="#3f7d51" />
        <rect x="-60" y="40" width="55" height="20" rx="10" fill="#3f7d51" />
        <rect x="-60" y="20" width="20" height="70" rx="10" fill="#3f7d51" />
        <rect x="30" y="70" width="55" height="20" rx="10" fill="#3f7d51" />
        <rect x="65" y="50" width="20" height="70" rx="10" fill="#3f7d51" />
      </g>
    </>
  );

const Forest = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="for-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef2c9" />
          <stop offset="55%" stopColor="#cbe6c6" />
          <stop offset="100%" stopColor="#eef8ee" />
        </linearGradient>
        <radialGradient id="for-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7c9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff7c9" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#for-sky)" />
      {/* sun glow + light rays through the canopy */}
      <circle cx="620" cy="260" r="180" fill="url(#for-glow)" />
      {[-30, -14, 2, 18, 34].map((deg, i) => (
        <polygon
          key={i}
          points="620,260 570,800 700,800"
          fill="#fff7c9"
          opacity="0.12"
          transform={`rotate(${deg} 620 260)`}
        />
      ))}
      {/* distant misty ridge */}
      <path d="M0 460 L260 330 L520 460 L800 320 L1050 460 L1200 400 L1200 500 L0 500 Z" fill="#9db9a3" opacity="0.45" />
      {/* back tree row (atmospheric, lighter) */}
      {[[90, 560, 130], [300, 540, 110], [520, 570, 150], [760, 545, 120], [980, 565, 140], [1160, 540, 110]].map(([x, y, h], i) => (
        <g key={`b${i}`} opacity="0.55">
          <polygon points={`${x},${y - h} ${x - h * 0.38},${y} ${x + h * 0.38},${y}`} fill="#8fae93" />
        </g>
      ))}
      <rect y="540" width="1200" height="36" fill="#ffffff" opacity="0.35" />
      {/* mid row: mixed pines and round deciduous trees */}
      {[[70, 640, 150, 'pine'], [220, 660, 110, 'round'], [400, 630, 170, 'pine'], [600, 665, 120, 'round'], [800, 620, 160, 'pine'], [980, 660, 115, 'round'], [1140, 630, 150, 'pine']].map(([x, y, h, kind], i) =>
        kind === 'pine' ? (
          <g key={i}>
            <polygon points={`${x},${y - h} ${x - h * 0.42},${y} ${x + h * 0.42},${y}`} fill="#2f6b47" />
            <polygon points={`${x},${y - h * 0.68} ${x - h * 0.34},${y - h * 0.12} ${x + h * 0.34},${y - h * 0.12}`} fill="#3c7f54" />
            <rect x={x - 5} y={y} width="10" height="18" fill="#5a3d24" />
          </g>
        ) : (
          <g key={i}>
            <rect x={x - 6} y={y - h * 0.3} width="12" height={h * 0.3 + 16} fill="#5a3d24" />
            <circle cx={x} cy={y - h * 0.55} r={h * 0.32} fill="#3c7f54" />
            <circle cx={x - h * 0.22} cy={y - h * 0.4} r={h * 0.24} fill="#2f6b47" />
            <circle cx={x + h * 0.22} cy={y - h * 0.4} r={h * 0.24} fill="#357350" />
          </g>
        )
      )}
      {/* low fog drifting between trunks */}
      <rect y="700" width="1200" height="30" fill="#ffffff" opacity="0.3" />
      {/* a deer on the trail */}
      <g transform="translate(520,710)" opacity="0.85">
        <rect x="-2" y="-30" width="6" height="30" fill="#4a3320" />
        <rect x="18" y="-30" width="6" height="30" fill="#4a3320" />
        <ellipse cx="10" cy="-40" rx="26" ry="14" fill="#5a4028" />
        <circle cx="34" cy="-46" r="9" fill="#5a4028" />
        <path d="M40 -54 l6 -10 M44 -50 l8 -6" stroke="#4a3320" strokeWidth="2" fill="none" />
      </g>
      {/* birds distant */}
      {[[220, 200], [260, 220], [980, 180]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} q10 -10 20 0 q10 -10 20 0`} stroke="#3b4a3e" strokeWidth="2.5" fill="none" opacity="0.5" />
      ))}
    </>
  );

const Snow = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="snow-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe6f7" />
          <stop offset="100%" stopColor="#f6fbff" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#snow-sky)" />
      <circle cx="1000" cy="150" r="60" fill="#ffffff" opacity="0.9" />
      <path d="M0 560 L220 340 L340 460 L520 300 L680 460 L860 320 L1000 460 L1200 360 L1200 800 L0 800 Z" fill="#c4d9e8" />
      <path d="M0 620 L260 480 L420 600 L620 440 L820 600 L1020 460 L1200 580 L1200 800 L0 800 Z" fill="#e8f2fb" />
      {[[220, 340], [520, 300], [860, 320]].map(([x, y], i) => (
        <polygon key={i} points={`${x},${y} ${x - 22},${y + 40} ${x + 22},${y + 40}`} fill="#ffffff" />
      ))}
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={(i * 137) % 1200} cy={(i * 91) % 700} r={i % 3 === 0 ? 4 : 2.5} fill="#ffffff" opacity="0.8" />
      ))}
    </>
  );

const Lake = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="lake-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b6fa8" />
          <stop offset="100%" stopColor="#d7c2e0" />
        </linearGradient>
        <linearGradient id="lake-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5a8f" />
          <stop offset="100%" stopColor="#7789bd" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#lake-sky)" />
      <circle cx="900" cy="180" r="55" fill="#fdf6e3" opacity="0.85" />
      <path d="M0 460 L260 300 L460 460 L700 260 L940 460 L1200 320 L1200 480 L0 480 Z" fill="#4a5f82" opacity="0.85" />
      <rect y="480" width="1200" height="320" fill="url(#lake-water)" />
      <path d="M0 480 L260 400 L460 480 L700 380 L940 480 L1200 420 L1200 480 Z" fill="#3c4d70" opacity="0.55" />
      {[540, 580, 620, 660].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="1200" y2={y} stroke="#c7d3ec" strokeWidth="2" opacity="0.25" />
      ))}
      {[[120, 470, 70], [1080, 470, 60]].map(([x, y, h], i) => (
        <polygon key={i} points={`${x},${y - h} ${x - 22},${y} ${x + 22},${y}`} fill="#2f4030" />
      ))}
    </>
  );

const Nightlife = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="night-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#160f38" />
          <stop offset="55%" stopColor="#3c1f52" />
          <stop offset="100%" stopColor="#6b2f5e" />
        </linearGradient>
        <radialGradient id="night-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9b0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffe9b0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#night-sky)" />
      {/* stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={(i * 173) % 1200} cy={(i * 67) % 260} r={i % 4 === 0 ? 2.2 : 1.2} fill="#ffffff" opacity="0.75" />
      ))}
      {/* moon with soft glow */}
      <circle cx="1030" cy="140" r="80" fill="url(#night-glow)" />
      <circle cx="1030" cy="140" r="42" fill="#fdf3c8" />
      <circle cx="1050" cy="128" r="38" fill="#2c1c46" />
      {/* skyline with irregular lit windows */}
      {[
        [20, 420, 60, 300], [100, 460, 80, 260], [200, 380, 70, 340], [290, 500, 60, 220],
        [370, 340, 90, 380], [480, 470, 65, 250], [560, 400, 75, 320], [650, 520, 55, 200],
        [720, 360, 85, 360], [820, 460, 65, 260], [900, 400, 80, 320], [990, 500, 60, 220],
        [1070, 430, 70, 290], [1150, 480, 55, 240],
      ].map(([x, y, w, h], i) => {
        const cols = Math.max(2, Math.floor(w / 20));
        const rows = Math.max(2, Math.floor(h / 30));
        return (
          <g key={i}>
            <rect x={x} y={800 - h} width={w} height={h} fill="#211636" />
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((_, c) =>
                (r * cols + c + i) % 3 !== 0 ? (
                  <rect
                    key={`${r}-${c}`}
                    x={x + 6 + c * 20}
                    y={800 - h + 8 + r * 30}
                    width="8"
                    height="10"
                    fill={(r + c) % 5 === 0 ? '#8fe3ff' : '#ffd66b'}
                    opacity="0.9"
                  />
                ) : null
              )
            )}
            {h > 340 && <line x1={x + w / 2} y1={800 - h} x2={x + w / 2} y2={800 - h - 24} stroke="#241a3d" strokeWidth="3" />}
          </g>
        );
      })}
      {/* neon sign */}
      <g transform="translate(360,470)">
        <rect x="-46" y="-16" width="92" height="32" rx="16" fill="none" stroke="#ff9fd0" strokeWidth="10" opacity="0.22" />
        <rect x="-46" y="-16" width="92" height="32" rx="16" fill="none" stroke="#ff6fb0" strokeWidth="4" />
        <circle cx="-30" cy="0" r="4" fill="#ffd7ec" />
        <circle cx="0" cy="0" r="4" fill="#ffd7ec" />
        <circle cx="30" cy="0" r="4" fill="#ffd7ec" />
      </g>
      {/* street level with light reflections */}
      <rect y="760" width="1200" height="40" fill="#150e2c" />
      {[[80, '#ffd66b'], [260, '#8fe3ff'], [520, '#ff9fd0'], [780, '#ffd66b'], [1020, '#8fe3ff']].map(([x, c], i) => (
        <rect key={i} x={x} y="760" width="4" height="40" fill={c} opacity="0.5" />
      ))}
      {/* lamppost */}
      <g transform="translate(180,760)">
        <line x1="0" y1="0" x2="0" y2="-90" stroke="#241a3d" strokeWidth="4" />
        <circle cx="0" cy="-94" r="16" fill="#ffe9b0" opacity="0.3" />
        <circle cx="0" cy="-94" r="8" fill="#ffe9b0" />
      </g>
    </>
  );

const Countryside = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe4f5" />
          <stop offset="100%" stopColor="#f3fbe8" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#cs-sky)" />
      <circle cx="180" cy="150" r="60" fill="#fff3b0" />
      {[[520, 160, 60], [620, 130, 50], [700, 170, 45]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill="#ffffff" opacity="0.85" />
      ))}
      <path d="M0 560 Q300 460 600 560 T1200 540 L1200 800 L0 800 Z" fill="#8fbf5e" />
      <path d="M0 640 Q300 580 600 640 T1200 620 L1200 800 L0 800 Z" fill="#6fa347" />
      {/* windmill */}
      <g transform="translate(950,430)">
        <rect x="-6" y="0" width="12" height="180" fill="#8a7a63" />
        <circle cx="0" cy="0" r="8" fill="#5a4d3c" />
        {[0, 90, 180, 270].map((deg, i) => (
          <rect key={i} x="-4" y="-70" width="8" height="70" fill="#f2ede1" transform={`rotate(${deg})`} />
        ))}
      </g>
    </>
  );

const Cruise = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="cr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9d76" />
          <stop offset="100%" stopColor="#ffd9a0" />
        </linearGradient>
        <linearGradient id="cr-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e08a5c" />
          <stop offset="100%" stopColor="#2f6b8a" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#cr-sky)" />
      <circle cx="950" cy="230" r="70" fill="#ffe9a8" opacity="0.9" />
      <rect y="500" width="1200" height="300" fill="url(#cr-sea)" />
      {[540, 580, 620].map((y, i) => (
        <path key={i} d={`M0 ${y} Q60 ${y - 8} 120 ${y} T240 ${y} T360 ${y} T480 ${y} T600 ${y} T720 ${y} T840 ${y} T960 ${y} T1080 ${y} T1200 ${y}`} stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.35" />
      ))}
      {/* ship */}
      <g transform="translate(560,470)">
        <path d="M-140 60 L140 60 L110 100 L-110 100 Z" fill="#e8edf1" />
        <rect x="-90" y="10" width="180" height="50" fill="#ffffff" />
        <rect x="-60" y="-30" width="120" height="40" fill="#f3f6f8" />
        <rect x="-20" y="-70" width="40" height="40" fill="#dfe6ea" />
        <rect x="-6" y="-100" width="12" height="30" fill="#c0472e" />
        {[-70, -30, 10, 50].map((x, i) => (
          <rect key={i} x={x} y="20" width="16" height="16" fill="#5c7c8f" />
        ))}
      </g>
    </>
  );

const Roadtrip = () =>
  wrap(
    <>
      <defs>
        <linearGradient id="rt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9d66" />
          <stop offset="55%" stopColor="#ffc98a" />
          <stop offset="100%" stopColor="#fff2d0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#rt-sky)" />
      <circle cx="230" cy="220" r="130" fill="#ffdb87" opacity="0.25" />
      <circle cx="230" cy="220" r="80" fill="#ffdb87" />
      {/* clouds */}
      {[[520, 130, 40], [700, 100, 30]].map(([x, y, r], i) => (
        <g key={i} opacity="0.8">
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.55} fill="#ffffff" />
          <ellipse cx={x + r * 0.8} cy={y + 6} rx={r * 0.6} ry={r * 0.4} fill="#ffffff" />
        </g>
      ))}
      {/* hazy distant mountains */}
      <path d="M0 460 L220 380 L420 460 L640 370 L860 460 L1080 390 L1200 440 L1200 500 L0 500 Z" fill="#c98f6d" opacity="0.4" />
      {/* rolling roadside hills */}
      <path d="M0 520 Q300 450 600 520 T1200 500 L1200 620 L0 620 Z" fill="#c98f52" opacity="0.65" />
      <path d="M0 560 Q300 500 600 560 T1200 540 L1200 620 L0 620 Z" fill="#b17843" opacity="0.55" />
      {/* road, converging to a vanishing point */}
      <path d="M0 800 L520 560 L680 560 L1200 800 Z" fill="#5c6068" />
      <path d="M0 800 L520 560 L560 560 L110 800 Z" fill="#4a4e55" />
      <path d="M1090 800 L680 560 L640 560 L1200 800 Z" fill="#4a4e55" />
      {/* dashed centre line receding into the distance */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const t = i / 7;
        const yBottom = 800 - t * 240;
        const yTop = 800 - (t + 0.06) * 240;
        const w = 26 - t * 22;
        return <rect key={i} x={600 - w / 2} y={yTop} width={w} height={yBottom - yTop} fill="#f4e7c5" opacity={1 - t * 0.5} />;
      })}
      {/* telephone poles receding on both shoulders, linked by sagging wire */}
      {[[760, 700, 130], [860, 650, 95], [935, 615, 68], [985, 592, 48]].map(([x, y, h], i) => (
        <g key={`r${i}`}>
          <line x1={x} y1={y} x2={x} y2={y - h} stroke="#4a3d2c" strokeWidth={Math.max(2, 5 - i)} />
          <line x1={x - h * 0.18} y1={y - h + h * 0.12} x2={x + h * 0.18} y2={y - h + h * 0.12} stroke="#4a3d2c" strokeWidth={Math.max(1.5, 3 - i * 0.5)} />
        </g>
      ))}
      {[[440, 700, 130], [340, 650, 95], [265, 615, 68], [215, 592, 48]].map(([x, y, h], i) => (
        <g key={`l${i}`}>
          <line x1={x} y1={y} x2={x} y2={y - h} stroke="#4a3d2c" strokeWidth={Math.max(2, 5 - i)} />
          <line x1={x - h * 0.18} y1={y - h + h * 0.12} x2={x + h * 0.18} y2={y - h + h * 0.12} stroke="#4a3d2c" strokeWidth={Math.max(1.5, 3 - i * 0.5)} />
        </g>
      ))}
      <path d="M760 588 Q600 636 440 588" stroke="#4a3d2c" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M860 605 Q600 648 340 605" stroke="#4a3d2c" strokeWidth="1.5" fill="none" opacity="0.6" />
      {/* road sign */}
      <g transform="translate(700,608)">
        <line x1="0" y1="0" x2="0" y2="55" stroke="#5a4d3c" strokeWidth="4" />
        <rect x="-26" y="-24" width="52" height="30" rx="4" fill="#2f6b47" stroke="#f4e7c5" strokeWidth="2" />
      </g>
    </>
  );

const SCENES = {
  classic: Classic,
  mountains: Mountains,
  beach: Beach,
  waterpark: Waterpark,
  desert: Desert,
  forest: Forest,
  snow: Snow,
  lake: Lake,
  nightlife: Nightlife,
  countryside: Countryside,
  cruise: Cruise,
  roadtrip: Roadtrip,
};

export default ThemeBackground;
