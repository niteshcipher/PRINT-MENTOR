import React from 'react';

export default function PixelAvatar({ size = 64, emotion = 'happy' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
      className="filter drop-shadow-md"
    >
      {/* Wizard / Mentor Robe & Hat */}
      <rect x="5" y="1" width="6" height="2" fill="#8B5CF6" />
      <rect x="4" y="3" width="8" height="2" fill="#8B5CF6" />
      <rect x="3" y="5" width="10" height="2" fill="#7C3AED" />
      <rect x="2" y="7" width="12" height="1" fill="#FBBF24" />

      {/* Face */}
      <rect x="4" y="8" width="8" height="4" fill="#FDE047" />

      {/* Eyes */}
      {emotion === 'thinking' ? (
        <>
          <rect x="5" y="9" width="2" height="1" fill="#1E293B" />
          <rect x="9" y="9" width="2" height="2" fill="#1E293B" />
        </>
      ) : (
        <>
          <rect x="5" y="9" width="2" height="2" fill="#0F172A" />
          <rect x="9" y="9" width="2" height="2" fill="#0F172A" />
          <rect x="6" y="9" width="1" height="1" fill="#FFFFFF" />
          <rect x="10" y="9" width="1" height="1" fill="#FFFFFF" />
        </>
      )}

      {/* Beard & Mustache */}
      <rect x="5" y="12" width="6" height="2" fill="#E2E8F0" />
      <rect x="6" y="14" width="4" height="2" fill="#E2E8F0" />
      <rect x="7" y="15" width="2" height="1" fill="#CBD5E1" />

      {/* Magic Cloak & Sparkle */}
      <rect x="3" y="12" width="2" height="4" fill="#6D28D9" />
      <rect x="11" y="12" width="2" height="4" fill="#6D28D9" />
      <rect x="13" y="4" width="2" height="2" fill="#38BDF8" />
      <rect x="14" y="3" width="1" height="1" fill="#F8FAFC" />
    </svg>
  );
}

