import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Compass, Check, ArrowRight, CornerDownLeft, Volume2, Move } from 'lucide-react';

export default function PixelArena({ onEnterBuilding }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 7 Distinct Financial Town Buildings
  const buildings = [
    {
      id: 'hq',
      name: 'HEADQUARTERS',
      subtitle: 'Overview & Net Worth',
      path: '/dashboard',
      pos: { x: 50, y: 18 },
      door: { x: 50, y: 34 },
      color: '#10b981',
      accent: '#34d399',
      icon: '🏛️',
      description: 'The central town hall of your financial kingdom. View income, burn rate, and health.'
    },
    {
      id: 'vault',
      name: 'THE VAULT',
      subtitle: 'Budget & Cashflow',
      path: '/dashboard/budget',
      pos: { x: 20, y: 16 },
      door: { x: 22, y: 32 },
      color: '#f59e0b',
      accent: '#fbbf24',
      icon: '🏦',
      description: 'Ironclad treasury. Allocate category limits, gig-mode buffers, and daily allowances.'
    },
    {
      id: 'chrono',
      name: 'CHRONO TOWER',
      subtitle: 'Time Machine & Goals',
      path: '/dashboard/goals',
      pos: { x: 80, y: 16 },
      door: { x: 78, y: 32 },
      color: '#06b6d4',
      accent: '#38bdf8',
      icon: '⏳',
      description: 'Compounding portal. Test market drops, inflation, and future milestones.'
    },
    {
      id: 'dojo',
      name: "MENTOR'S DOJO",
      subtitle: 'AI Financial Coach',
      path: '/dashboard/coach',
      pos: { x: 12, y: 55 },
      door: { x: 18, y: 64 },
      color: '#8b5cf6',
      accent: '#a78bfa',
      icon: '🧙‍♂️',
      description: 'The ancient wisdom chamber. Chat with Pixel Mentor about real-world scenarios.'
    },
    {
      id: 'arcade',
      name: 'ARCADE COLISEUM',
      subtitle: '5 Simulation Games',
      path: '/dashboard/games',
      pos: { x: 88, y: 55 },
      door: { x: 82, y: 64 },
      color: '#ec4899',
      accent: '#f43f5e',
      icon: '🕹️',
      description: 'Test your survival instincts in SIP Farm, Crash Survivor, and Scam Detective.'
    },
    {
      id: 'bunker',
      name: 'DEFENSE BUNKER',
      subtitle: 'Scam Shield & Threat Lab',
      path: '/dashboard/scam',
      pos: { x: 28, y: 80 },
      door: { x: 34, y: 75 },
      color: '#ef4444',
      accent: '#f87171',
      icon: '🛡️',
      description: 'Zero-trust radar lab. Scan suspicious WhatsApp/Telegram tips and unmask frauds.'
    },
    {
      id: 'library',
      name: 'GRAND ACADEMY',
      subtitle: 'ELI15 Glossary & Lessons',
      path: '/dashboard/learn',
      pos: { x: 72, y: 80 },
      door: { x: 66, y: 75 },
      color: '#3b82f6',
      accent: '#60a5fa',
      icon: '📚',
      description: 'The great archive. 30 Indian finance concepts broken down into cricket analogies.'
    }
  ];

  // Map active route to building
  const getActiveBuildingId = () => {
    const current = location.pathname;
    if (current === '/dashboard' || current === '/dashboard/') return 'hq';
    if (current.includes('budget')) return 'vault';
    if (current.includes('goals')) return 'chrono';
    if (current.includes('coach')) return 'dojo';
    if (current.includes('games')) return 'arcade';
    if (current.includes('learn')) return 'library';
    if (current.includes('scam')) return 'bunker';
    return 'hq';
  };

  const activeBuilding = buildings.find(b => b.id === getActiveBuildingId()) || buildings[0];

  // Character State
  const [playerPos, setPlayerPos] = useState({ x: activeBuilding.door.x, y: activeBuilding.door.y });
  const [targetPos, setTargetPos] = useState(null);
  const [facing, setFacing] = useState('down'); // 'left' | 'right' | 'up' | 'down'
  const [isWalking, setIsWalking] = useState(false);
  const [stepCycle, setStepCycle] = useState(0);
  const [nearbyBuilding, setNearbyBuilding] = useState(activeBuilding);
  const [enterNotification, setEnterNotification] = useState(null);
  const arenaRef = useRef(null);

  // Sync player position when active route changes
  useEffect(() => {
    const b = buildings.find(item => item.id === getActiveBuildingId());
    if (b) {
      setNearbyBuilding(b);
      setPlayerPos({ x: b.door.x, y: b.door.y });
    }
  }, [location.pathname]);

  // Keyboard Movement Listener (Arrow Keys & WASD)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't hijack keys when user is typing in an input/textarea
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const step = 2.5; // movement distance in %
      let dx = 0;
      let dy = 0;
      let newFacing = facing;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        dy = -step;
        newFacing = 'up';
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        dy = step;
        newFacing = 'down';
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        dx = -step;
        newFacing = 'left';
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        dx = step;
        newFacing = 'right';
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (nearbyBuilding) {
          e.preventDefault();
          handleEnterBuilding(nearbyBuilding);
        }
        return;
      } else {
        return;
      }

      e.preventDefault();
      setFacing(newFacing);
      setIsWalking(true);
      setStepCycle(prev => (prev + 1) % 4);

      setPlayerPos(prev => {
        const nextX = Math.max(6, Math.min(94, prev.x + dx));
        const nextY = Math.max(12, Math.min(90, prev.y + dy));
        return { x: nextX, y: nextY };
      });
    };

    const handleKeyUp = () => {
      setIsWalking(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [facing, nearbyBuilding]);

  // Click-to-Move interpolation loop
  useEffect(() => {
    if (!targetPos) return;

    let animId;
    const moveSpeed = 0.8; // speed multiplier

    const animateWalk = () => {
      setPlayerPos(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1.0) {
          // Arrived!
          setIsWalking(false);
          setTargetPos(null);
          if (targetPos.building) {
            handleEnterBuilding(targetPos.building);
          }
          return { x: targetPos.x, y: targetPos.y };
        }

        // Determine facing
        if (Math.abs(dx) > Math.abs(dy)) {
          setFacing(dx > 0 ? 'right' : 'left');
        } else {
          setFacing(dy > 0 ? 'down' : 'up');
        }

        setIsWalking(true);
        setStepCycle(s => (s + 1) % 4);

        const moveX = (dx / dist) * moveSpeed;
        const moveY = (dy / dist) * moveSpeed;
        return { x: prev.x + moveX, y: prev.y + moveY };
      });

      animId = requestAnimationFrame(animateWalk);
    };

    animId = requestAnimationFrame(animateWalk);
    return () => cancelAnimationFrame(animId);
  }, [targetPos]);

  // Check proximity to buildings
  useEffect(() => {
    let closest = null;
    let minDist = 14; // proximity threshold in %

    buildings.forEach(b => {
      const dx = playerPos.x - b.door.x;
      const dy = playerPos.y - b.door.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closest = b;
      }
    });

    setNearbyBuilding(closest);
  }, [playerPos]);

  // Walk toward building on click
  const handleBuildingClick = (building) => {
    setTargetPos({ x: building.door.x, y: building.door.y, building });
  };

  const handleEnterBuilding = (building) => {
    setEnterNotification(`ENTERED ${building.name}`);
    setTimeout(() => setEnterNotification(null), 2500);
    navigate(building.path);
    if (onEnterBuilding) onEnterBuilding(building);
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '24px' }}>
      
      {/* Arena Frame Container */}
      <div 
        ref={arenaRef}
        className="pixel-box"
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          background: '#090d16',
          border: '3px solid #38bdf8',
          boxShadow: '0 0 25px rgba(0, 240, 255, 0.25), inset 0 0 40px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        {/* =========================================================================
            1. PIXEL ARENA GROUND & COBBLESTONE PATHWAY TILES
            ========================================================================= */}
        {/* Grass / Ground Texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 70%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 20px 20px, 20px 20px',
          zIndex: 1
        }} />

        {/* Cobblestone Crossroad Pathways */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
          {/* Main Road: Central Plaza to HQ */}
          <path d="M 50% 54% L 50% 34%" stroke="#1e293b" strokeWidth="28" strokeLinecap="round" />
          <path d="M 50% 54% L 50% 34%" stroke="#334155" strokeWidth="24" strokeDasharray="4 4" />

          {/* Road to Vault */}
          <path d="M 50% 54% L 22% 32%" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />
          <path d="M 50% 54% L 22% 32%" stroke="#334155" strokeWidth="20" strokeDasharray="4 4" />

          {/* Road to Chrono Tower */}
          <path d="M 50% 54% L 78% 32%" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />
          <path d="M 50% 54% L 78% 32%" stroke="#334155" strokeWidth="20" strokeDasharray="4 4" />

          {/* Road to Mentor Dojo */}
          <path d="M 50% 54% L 18% 64%" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />
          <path d="M 50% 54% L 18% 64%" stroke="#334155" strokeWidth="20" strokeDasharray="4 4" />

          {/* Road to Arcade Coliseum */}
          <path d="M 50% 54% L 82% 64%" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />
          <path d="M 50% 54% L 82% 64%" stroke="#334155" strokeWidth="20" strokeDasharray="4 4" />

          {/* Road to Defense Bunker */}
          <path d="M 50% 54% L 34% 75%" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />
          <path d="M 50% 54% L 34% 75%" stroke="#334155" strokeWidth="20" strokeDasharray="4 4" />

          {/* Road to Grand Academy */}
          <path d="M 50% 54% L 66% 75%" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />
          <path d="M 50% 54% L 66% 75%" stroke="#334155" strokeWidth="20" strokeDasharray="4 4" />

          {/* Central Fountain Stone Roundabout */}
          <circle cx="50%" cy="54%" r="32" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 3" />
          <circle cx="50%" cy="54%" r="20" fill="#0284c7" opacity="0.6" />
          <circle cx="50%" cy="54%" r="10" fill="#38bdf8" />
        </svg>

        {/* =========================================================================
            2. THE 7 PIXEL BUILDINGS
            ========================================================================= */}
        {buildings.map((b) => {
          const isCurrentActive = b.id === getActiveBuildingId();
          const isPlayerNear = nearbyBuilding?.id === b.id;

          return (
            <div
              key={b.id}
              onClick={() => handleBuildingClick(b)}
              style={{
                position: 'absolute',
                left: `${b.pos.x}%`,
                top: `${b.pos.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: Math.round(b.pos.y),
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              title={`Click to walk to ${b.name}`}
            >
              {/* Building Pixel Card */}
              <div
                style={{
                  position: 'relative',
                  padding: '8px 12px',
                  background: isCurrentActive ? 'rgba(16, 24, 39, 0.95)' : 'rgba(15, 23, 42, 0.85)',
                  border: `2px solid ${isPlayerNear ? '#00f0ff' : isCurrentActive ? b.accent : '#334155'}`,
                  borderRadius: '6px',
                  boxShadow: isPlayerNear 
                    ? '0 0 20px #00f0ff, inset 0 0 10px rgba(0, 240, 255, 0.3)' 
                    : isCurrentActive 
                    ? `0 0 15px ${b.color}55` 
                    : '0 4px 12px rgba(0, 0, 0, 0.6)',
                  textAlign: 'center',
                  backdropFilter: 'blur(6px)',
                  transform: isPlayerNear ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Pixel Icon & Building Badge */}
                <div style={{ fontSize: b.id === 'hq' ? '28px' : '22px', marginBottom: '2px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                  {b.icon}
                </div>

                <div 
                  className="font-pixel" 
                  style={{ 
                    fontSize: b.id === 'hq' ? '10px' : '8px', 
                    color: isPlayerNear ? '#00f0ff' : isCurrentActive ? b.accent : '#f1f5f9',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {b.name}
                </div>

                <div style={{ fontSize: '8px', color: '#94a3b8', whiteSpace: 'nowrap', marginTop: '1px' }}>
                  {b.subtitle}
                </div>

                {/* Doorway Marker Tile */}
                <div style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '16px',
                  height: '6px',
                  backgroundColor: isCurrentActive ? b.accent : '#475569',
                  borderRadius: '2px',
                  boxShadow: `0 0 6px ${isCurrentActive ? b.accent : '#000'}`
                }} />
              </div>

              {/* ACTIVE HUD TAG */}
              {isCurrentActive && (
                <div style={{
                  marginTop: '10px',
                  padding: '2px 6px',
                  backgroundColor: b.color,
                  color: '#050811',
                  fontSize: '7px',
                  fontFamily: 'var(--font-pixel)',
                  borderRadius: '2px',
                  fontWeight: 'bold',
                  boxShadow: `0 0 8px ${b.color}`
                }}>
                  CURRENT INTERIOR
                </div>
              )}
            </div>
          );
        })}

        {/* =========================================================================
            3. CONTROLLABLE ANIMATED PIXEL CHARACTER GUY
            ========================================================================= */}
        <div
          style={{
            position: 'absolute',
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            transform: 'translate(-50%, -80%)',
            zIndex: 99,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: targetPos ? 'none' : 'transform 0.1s ease'
          }}
        >
          {/* Action Prompt Bubble when near a building */}
          {nearbyBuilding && (
            <div
              style={{
                position: 'absolute',
                bottom: '105%',
                padding: '4px 8px',
                background: '#0284c7',
                border: '1px solid #38bdf8',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '8px',
                fontFamily: 'var(--font-pixel)',
                whiteSpace: 'nowrap',
                boxShadow: '0 0 12px #38bdf8',
                marginBottom: '4px',
                animation: 'cyber-pulse 1.2s infinite alternate',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>ENTER {nearbyBuilding.name}</span>
            </div>
          )}

          {/* Pixel Character Guy Sprite (16x16 Pure Pixel SVG) */}
          <div style={{
            width: '32px',
            height: '32px',
            transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.8))'
          }}>
            <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated' }}>
              {/* Adventurer Headgear / Cap */}
              <rect x="5" y="1" width="6" height="2" fill="#e11d48" />
              <rect x="4" y="3" width="8" height="2" fill="#be123c" />
              <rect x="3" y="4" width="2" height="1" fill="#f43f5e" />

              {/* Face Tone */}
              <rect x="5" y="5" width="6" height="4" fill="#fed7aa" />

              {/* Eyes */}
              {facing !== 'up' && (
                <>
                  <rect x="6" y="6" width="1" height="1" fill="#0f172a" />
                  <rect x="9" y="6" width="1" height="1" fill="#0f172a" />
                </>
              )}

              {/* Tunic / Body */}
              <rect x="4" y="9" width="8" height="4" fill="#0284c7" />
              {/* Belt & Gold Buckle */}
              <rect x="4" y="11" width="8" height="1" fill="#475569" />
              <rect x="7" y="11" width="2" height="1" fill="#fbbf24" />

              {/* Backpack Straps */}
              <rect x="4" y="9" width="1" height="3" fill="#78350f" />
              <rect x="11" y="9" width="1" height="3" fill="#78350f" />

              {/* Animated Walking Legs & Boots */}
              {isWalking ? (
                stepCycle % 2 === 0 ? (
                  <>
                    {/* Left Leg Forward */}
                    <rect x="4" y="13" width="3" height="2" fill="#1e293b" />
                    <rect x="3" y="15" width="4" height="1" fill="#78350f" />
                    {/* Right Leg Back */}
                    <rect x="9" y="13" width="3" height="1" fill="#1e293b" />
                    <rect x="9" y="14" width="3" height="1" fill="#78350f" />
                  </>
                ) : (
                  <>
                    {/* Left Leg Back */}
                    <rect x="4" y="13" width="3" height="1" fill="#1e293b" />
                    <rect x="4" y="14" width="3" height="1" fill="#78350f" />
                    {/* Right Leg Forward */}
                    <rect x="9" y="13" width="3" height="2" fill="#1e293b" />
                    <rect x="9" y="15" width="4" height="1" fill="#78350f" />
                  </>
                )
              ) : (
                <>
                  {/* Standing Still */}
                  <rect x="5" y="13" width="2" height="2" fill="#1e293b" />
                  <rect x="5" y="15" width="3" height="1" fill="#78350f" />
                  <rect x="9" y="13" width="2" height="2" fill="#1e293b" />
                  <rect x="8" y="15" width="3" height="1" fill="#78350f" />
                </>
              )}
            </svg>
          </div>

          {/* Player Name Pill */}
          <div style={{
            fontSize: '7px',
            fontFamily: 'var(--font-pixel)',
            color: '#fef08a',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '1px 4px',
            borderRadius: '2px',
            marginTop: '2px'
          }}>
            YOU
          </div>
        </div>

        {/* =========================================================================
            4. HUD OVERLAY: CONTROLS & ARENA TELEMETRY
            ========================================================================= */}
        {/* Top-Left Telemetry Pill */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid #334155',
          padding: '6px 10px',
          borderRadius: '4px',
          backdropFilter: 'blur(4px)'
        }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
          <span className="font-pixel" style={{ fontSize: '8px', color: '#e2e8f0' }}>
            FINANCIAL TOWN ARENA
          </span>
        </div>

        {/* Top-Right Quick Walk Instructions */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid #334155',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '8px',
          color: '#94a3b8'
        }}>
          <Move size={11} color="#38bdf8" />
          <span>Use <strong>WASD / Arrow Keys</strong> or <strong>Click Any Building</strong> to Walk!</span>
        </div>

        {/* Enter Transition Toast Banner */}
        {enterNotification && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 120,
            padding: '12px 24px',
            background: 'rgba(2, 132, 199, 0.95)',
            border: '2px solid #38bdf8',
            borderRadius: '4px',
            color: '#f8fafc',
            fontFamily: 'var(--font-pixel)',
            fontSize: '11px',
            boxShadow: '0 0 30px #38bdf8',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'cyber-pulse 0.4s ease'
          }}>
            <Sparkles size={16} />
            <span>{enterNotification}</span>
          </div>
        )}
      </div>

      {/* Arena Doorway Status Bar */}
      <div style={{
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '10px 16px',
        backgroundColor: '#121824',
        border: '1px solid #334155',
        borderRadius: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{activeBuilding.icon}</span>
          <div>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>CURRENT ACTIVE BUILDING</div>
            <div className="font-pixel" style={{ fontSize: '11px', color: activeBuilding.accent }}>
              {activeBuilding.name} ({activeBuilding.subtitle})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {buildings.map(b => (
            <button
              key={b.id}
              onClick={() => handleBuildingClick(b)}
              className="pixel-btn"
              style={{
                padding: '4px 8px',
                fontSize: '8px',
                backgroundColor: b.id === activeBuilding.id ? b.color : '#1e293b',
                color: b.id === activeBuilding.id ? '#050811' : '#94a3b8',
                borderColor: b.id === activeBuilding.id ? b.accent : '#334155'
              }}
              title={b.description}
            >
              {b.icon} {b.name}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

