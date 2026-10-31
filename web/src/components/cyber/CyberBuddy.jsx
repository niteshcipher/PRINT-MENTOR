import React, { useState, useEffect } from 'react';

export default function CyberBuddy({ onInteract }) {
  const [position, setPosition] = useState({ x: 75, y: 15 }); // Percentages
  const [targetPos, setTargetPos] = useState({ x: 75, y: 15 });
  const [mood, setMood] = useState("normal"); // normal | scan | alert | happy
  const [isHovered, setIsHovered] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Autonomous waypoint patrol
  useEffect(() => {
    const waypoints = [
      { x: 82, y: 12 },
      { x: 18, y: 18 },
      { x: 70, y: 32 },
      { x: 88, y: 48 },
      { x: 22, y: 42 },
      { x: 50, y: 15 }
    ];

    let currentWaypoint = 0;
    const patrolInterval = setInterval(() => {
      currentWaypoint = (currentWaypoint + 1) % waypoints.length;
      // Slight jitter for natural flight
      const jitterX = (Math.random() - 0.5) * 6;
      const jitterY = (Math.random() - 0.5) * 6;
      setTargetPos({
        x: Math.max(10, Math.min(88, waypoints[currentWaypoint].x + jitterX)),
        y: Math.max(8, Math.min(65, waypoints[currentWaypoint].y + jitterY))
      });
      setMood(Math.random() > 0.6 ? "scan" : "normal");
    }, 4500);

    return () => clearInterval(patrolInterval);
  }, []);

  // Smooth interpolation toward targetPos
  useEffect(() => {
    let animId;
    const updateMotion = () => {
      setPosition(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const factor = isHovered ? 0.04 : 0.025;
        const newX = prev.x + dx * factor;
        const newY = prev.y + dy * factor;
        return { x: newX, y: newY };
      });
      animId = requestAnimationFrame(updateMotion);
    };
    animId = requestAnimationFrame(updateMotion);
    return () => cancelAnimationFrame(animId);
  }, [targetPos, isHovered]);

  const handleBuddyClick = () => {
    setIsSpinning(true);
    setMood("happy");
    setTimeout(() => {
      setIsSpinning(false);
      setMood("normal");
    }, 900);
    if (onInteract) onInteract();
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 40,
        pointerEvents: 'auto',
        transition: 'filter 0.3s ease',
        cursor: 'pointer',
        userSelect: 'none'
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        setMood("happy");
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setMood("normal");
      }}
      onClick={handleBuddyClick}
      title="Cyber Companion Drone (Click to interact)"
    >
      {/* Cyber Drone Graphic SVG */}
      <div style={{
        position: 'relative',
        width: '90px',
        height: '90px',
        animation: isSpinning ? 'cyber-spin 0.8s ease-in-out' : 'cyber-float 3.5s ease-in-out infinite'
      }}>
        {/* Anti-Gravity Energy Halo */}
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(255, 0, 127, 0.1) 50%, transparent 75%)',
            animation: 'cyber-halo 2.5s infinite linear',
            zIndex: 0
          }}
        />

        <svg width="90" height="90" viewBox="0 0 100 100" fill="none" style={{ position: 'relative', zIndex: 1 }}>
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="neonCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <linearGradient id="neonPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff007f" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left Jet Wing */}
          <path d="M 22 45 L 8 52 L 14 62 L 26 56 Z" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
          {/* Left Wing Plasma Flame */}
          <path d="M 8 57 Q 2 64 6 72 Q 12 65 14 62 Z" fill="url(#neonPinkGrad)" filter="url(#neonGlow)" />

          {/* Right Jet Wing */}
          <path d="M 78 45 L 92 52 L 86 62 L 74 56 Z" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
          {/* Right Wing Plasma Flame */}
          <path d="M 92 57 Q 98 64 94 72 Q 88 65 86 62 Z" fill="url(#neonPinkGrad)" filter="url(#neonGlow)" />

          {/* Main Aerodynamic Sphere Chassis */}
          <circle cx="50" cy="50" r="32" fill="url(#bodyGrad)" stroke="#00f0ff" strokeWidth="2.5" />

          {/* Tech Panel Inset Ring */}
          <circle cx="50" cy="50" r="28" stroke="#334155" strokeWidth="1" strokeDasharray="4 2" />

          {/* Cyber Visor Mask */}
          <path 
            d="M 28 42 Q 50 36 72 42 Q 74 58 50 62 Q 26 58 28 42 Z" 
            fill="#050811" 
            stroke="#ff007f" 
            strokeWidth="1.5" 
          />

          {/* Glowing Visor Screen / Optics */}
          <path 
            d="M 31 44 Q 50 39 69 44 Q 70 55 50 58 Q 30 55 31 44 Z" 
            fill="rgba(0, 240, 255, 0.2)" 
          />

          {/* High-Tech Animated Eyes / HUD Target */}
          {mood === 'happy' ? (
            <g stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" filter="url(#neonGlow)">
              {/* Happy curves ^ ^ */}
              <path d="M 38 52 Q 43 45 47 52" />
              <path d="M 53 52 Q 57 45 62 52" />
            </g>
          ) : mood === 'alert' ? (
            <g fill="#ff0055" filter="url(#neonGlow)">
              <circle cx="42" cy="49" r="4" />
              <circle cx="58" cy="49" r="4" />
            </g>
          ) : (
            <g filter="url(#neonGlow)">
              {/* Left Eye */}
              <rect x="38" y="47" width="8" height="5" rx="2" fill="#00f0ff" />
              <circle cx="42" cy="49" r="1.5" fill="#ffffff" />
              {/* Right Eye */}
              <rect x="54" y="47" width="8" height="5" rx="2" fill="#00f0ff" />
              <circle cx="58" cy="49" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Holographic Antenna with Pulsing Beacon */}
          <line x1="50" y1="18" x2="50" y2="8" stroke="#00f0ff" strokeWidth="2" />
          <circle cx="50" cy="7" r="3.5" fill="#ff007f" filter="url(#neonGlow)">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite" />
          </circle>

          {/* Center Power Core Indicator */}
          <circle cx="50" cy="72" r="3" fill="#00f0ff" filter="url(#neonGlow)">
            <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* HUD Crosshair markings */}
          <line x1="16" y1="50" x2="22" y2="50" stroke="#00f0ff" strokeWidth="1.5" opacity="0.6" />
          <line x1="78" y1="50" x2="84" y2="50" stroke="#00f0ff" strokeWidth="1.5" opacity="0.6" />
        </svg>

        {/* Thruster exhaust glow below */}
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '26px',
            height: '14px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, #00f0ff 0%, #ff007f 60%, transparent 90%)',
            filter: 'blur(3px)',
            opacity: 0.85,
            animation: 'thruster-burn 0.3s infinite alternate'
          }}
        />
      </div>
    </div>
  );
}
