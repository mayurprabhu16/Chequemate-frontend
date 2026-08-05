import React from 'react';

// The ChequeMate mark: a torn cheque stub with a stamped checkmark —
// a visual pun on "cheque" (the bill) and "mate" (checkmate).
const Logo = ({ size = 26, color = '#e8d9ab', accent = '#b9902f' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="2" y="6" width="28" height="20" rx="3" stroke={color} strokeWidth="2" />
    <path d="M2 11 H30" stroke={color} strokeWidth="1.4" strokeDasharray="1.6 2.4" />
    <path d="M8 20 L13.5 25 L24 13" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default Logo;
