import React from 'react';

/**
 * Pixel Mentor - Pure Inline SVG Pixel Art Avatar
 * Supports 4 distinct mood states: 'idle', 'happy', 'worried', 'thinking'
 * No external image files required.
 */
export default function Mentor({ mood = 'idle', size = 64, animated = true, showLabel = false }) {
  const getMoodTitle = () => {
    switch (mood) {
      case 'happy': return 'Delighted';
      case 'worried': return 'Concerned';
      case 'thinking': return 'Analyzing';
      default: return 'Observing';
    }
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div className={animated ? 'animate-mentor' : ''} style={{ display: 'inline-block' }}>
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* --- Wizard / Mentor Robe & Hat --- */}
          <rect x="5" y="1" width="6" height="2" fill="#8B5CF6" />
          <rect x="4" y="3" width="8" height="2" fill="#8B5CF6" />
          <rect x="3" y="5" width="10" height="2" fill="#7C3AED" />
          <rect x="2" y="7" width="12" height="1" fill="#FBBF24" />

          {/* --- Face Tone --- */}
          <rect x="4" y="8" width="8" height="4" fill="#FDE047" />

          {/* --- MOOD SPECIFIC EYES & EXPRESSIONS --- */}
          {mood === 'happy' && (
            <>
              {/* Joyful squinting closed smile eyes ^ ^ */}
              <rect x="5" y="9" width="2" height="1" fill="#0F172A" />
              <rect x="4" y="10" width="1" height="1" fill="#0F172A" />
              <rect x="9" y="9" width="2" height="1" fill="#0F172A" />
              <rect x="11" y="10" width="1" height="1" fill="#0F172A" />
              {/* Rosy cheeks */}
              <rect x="4" y="11" width="1" height="1" fill="#F43F5E" />
              <rect x="11" y="11" width="1" height="1" fill="#F43F5E" />
              {/* Extra gold stars */}
              <rect x="13" y="3" width="2" height="2" fill="#FBBF24" />
            </>
          )}

          {mood === 'worried' && (
            <>
              {/* Wide anxious pupils + sweat drop */}
              <rect x="5" y="9" width="2" height="2" fill="#0F172A" />
              <rect x="9" y="9" width="2" height="2" fill="#0F172A" />
              {/* Eyebrows slanted in worry */}
              <rect x="4" y="8" width="2" height="1" fill="#78350F" />
              <rect x="10" y="8" width="2" height="1" fill="#78350F" />
              {/* Sweat drop on forehead / side */}
              <rect x="12" y="8" width="1" height="2" fill="#38BDF8" />
              <rect x="12" y="10" width="1" height="1" fill="#0284C7" />
            </>
          )}

          {mood === 'thinking' && (
            <>
              {/* Asymmetric eyebrow and looking up-right */}
              <rect x="5" y="8" width="2" height="1" fill="#78350F" />
              <rect x="9" y="7" width="2" height="1" fill="#78350F" />
              {/* Eyes shifted */}
              <rect x="6" y="9" width="1" height="2" fill="#0F172A" />
              <rect x="10" y="9" width="1" height="2" fill="#0F172A" />
              <rect x="7" y="9" width="1" height="1" fill="#FFFFFF" />
              {/* Thought spark */}
              <rect x="13" y="2" width="2" height="2" fill="#F59E0B" />
              <rect x="14" y="1" width="1" height="1" fill="#FEF08A" />
            </>
          )}

          {mood === 'idle' && (
            <>
              {/* Calm standard eyes with white sparkle */}
              <rect x="5" y="9" width="2" height="2" fill="#0F172A" />
              <rect x="9" y="9" width="2" height="2" fill="#0F172A" />
              <rect x="6" y="9" width="1" height="1" fill="#FFFFFF" />
              <rect x="10" y="9" width="1" height="1" fill="#FFFFFF" />
            </>
          )}

          {/* --- Beard & Moustache (Universal) --- */}
          <rect x="5" y="12" width="6" height="2" fill="#E2E8F0" />
          <rect x="6" y="14" width="4" height="2" fill="#E2E8F0" />
          <rect x="7" y="15" width="2" height="1" fill="#CBD5E1" />

          {/* --- Wizard Cloak & Arms --- */}
          <rect x="3" y="12" width="2" height="4" fill="#6D28D9" />
          <rect x="11" y="12" width="2" height="4" fill="#6D28D9" />

          {/* Sparkle icon */}
          <rect x="13" y="5" width="1" height="2" fill="#38BDF8" />
          <rect x="14" y="4" width="2" height="1" fill="#38BDF8" />
        </svg>
      </div>

      {showLabel && (
        <span 
          className="pixel-badge" 
          style={{ 
            fontSize: '7px', 
            padding: '2px 6px',
            color: mood === 'happy' ? '#34d399' : mood === 'worried' ? '#f87171' : mood === 'thinking' ? '#38bdf8' : '#fbbf24',
            borderColor: 'currentColor'
          }}
        >
          {mood.toUpperCase()}
        </span>
      )}
    </div>
  );
}

