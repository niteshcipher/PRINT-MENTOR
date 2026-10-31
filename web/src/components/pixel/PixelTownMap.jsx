import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { 
  Building2,
  Bot,
  Gamepad2,
  Clock,
  GraduationCap,
  Wallet,
  ShieldAlert,
  Mail,
  Coins,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  X,
  Compass,
  ArrowRight,
  ArrowLeft,
  User,
  LayoutDashboard
} from 'lucide-react';

// 8 Individual pixel buildings
import stockMarketImg from '../../assets/buildings/stock_market.png';
import centralBankImg from '../../assets/buildings/central_bank.png';
import arcadeCasinoImg from '../../assets/buildings/arcade_casino.png';
import postOfficeImg from '../../assets/buildings/post_office.png';
import foodStoreImg from '../../assets/buildings/food_store.png';
import policeStationImg from '../../assets/buildings/police_station.png';
import hospitalImg from '../../assets/buildings/hospital.png';
import bankVaultImg from '../../assets/buildings/bank_vault.png';

export default function PixelTownMap() {
  const navigate = useNavigate();
  const { user, coins } = useGameStore();
  const [postOfficeOpen, setPostOfficeOpen] = useState(false);

  // Zoom & Camera
  const [zoom, setZoom] = useState(1.0);
  const [is3D, setIs3D] = useState(false);
  const [camPos, setCamPos] = useState({ x: 50, y: 50 });
  const mapRef = useRef(null);

  // Responsive device state
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
        setIsTablet(window.innerWidth < 1024);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 8 Town Buildings with clean Lucide icons and cohesive modern palette
  const buildings = [
    {
      id: 'coach',
      name: "MENTOR'S SANCTUM",
      sub: 'AI Financial Coach',
      path: '/dashboard/coach',
      img: hospitalImg,
      pos: { x: 20, y: 18 },
      door: { x: 20, y: 32 },
      Icon: Bot,
      color: '#a855f7',
      badge: 'AI COACH',
      desc: 'Interactive chat guidance on savings, emergency buffers, and budgeting.'
    },
    {
      id: 'overview',
      name: 'STOCK EXCHANGE HQ',
      sub: 'Dashboard & Net Worth',
      path: '/dashboard/overview',
      img: stockMarketImg,
      pos: { x: 50, y: 16 },
      door: { x: 50, y: 31 },
      Icon: Building2,
      color: '#00f0ff',
      badge: 'DASHBOARD',
      desc: 'Central dashboard of your monthly income, safe burn rate, and asset allocation.'
    },
    {
      id: 'games',
      name: 'ARCADE COLISEUM',
      sub: '5 Simulation Games',
      path: '/dashboard/games',
      img: arcadeCasinoImg,
      pos: { x: 80, y: 18 },
      door: { x: 80, y: 32 },
      Icon: Gamepad2,
      color: '#f43f5e',
      badge: 'SIMULATIONS',
      desc: 'Play Crash Survivor, SIP Compounding Farm, and Scam Detective.'
    },
    {
      id: 'goals',
      name: 'CHRONO TOWER',
      sub: 'Goals & Time Machine',
      path: '/dashboard/goals',
      img: foodStoreImg,
      pos: { x: 18, y: 52 },
      door: { x: 30, y: 52 },
      Icon: Clock,
      color: '#14b8a6',
      badge: 'TIME MACHINE',
      desc: 'Model future savings milestones and stress-test market drawdown timelines.'
    },
    {
      id: 'learn',
      name: 'CENTRAL ACADEMY',
      sub: 'ELI15 Knowledge Base',
      path: '/dashboard/learn',
      img: centralBankImg,
      pos: { x: 82, y: 52 },
      door: { x: 70, y: 52 },
      Icon: GraduationCap,
      color: '#3b82f6',
      badge: 'ARCHIVE',
      desc: 'Simplified explanations of Indian mutual funds, taxation, and compounding.'
    },
    {
      id: 'budget',
      name: 'THE VAULT & ATM',
      sub: 'Budget & Daily Allowance',
      path: '/dashboard/budget',
      img: bankVaultImg,
      pos: { x: 20, y: 82 },
      door: { x: 20, y: 68 },
      Icon: Wallet,
      color: '#f59e0b',
      badge: 'TREASURY',
      desc: 'Set category quotas, gig-worker income buffers, and track expenses.'
    },
    {
      id: 'scam',
      name: 'DEFENSE BUREAU',
      sub: 'Scam Shield Radar',
      path: '/dashboard/scam',
      img: policeStationImg,
      pos: { x: 50, y: 82 },
      door: { x: 50, y: 68 },
      Icon: ShieldAlert,
      color: '#ef4444',
      badge: 'CYBER DEFENSE',
      desc: 'Zero-trust verification scanner for suspicious investment tips and frauds.'
    },
    {
      id: 'post',
      name: 'POST & DISPATCH',
      sub: 'Telegrams & Regulatory Alerts',
      path: 'modal',
      img: postOfficeImg,
      pos: { x: 80, y: 82 },
      door: { x: 80, y: 68 },
      Icon: Mail,
      color: '#fb7185',
      badge: 'DISPATCH',
      desc: 'Official regulatory updates, investor education briefs, and announcements.'
    }
  ];

  // Player Character State (Spawn at center crossroads)
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 52 });
  const [targetPos, setTargetPos] = useState(null);
  const [facing, setFacing] = useState('down');
  const [isWalking, setIsWalking] = useState(false);
  const [stepCycle, setStepCycle] = useState(0);
  const [nearbyBuilding, setNearbyBuilding] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Ambient NPCs
  const npcs = [
    {
      id: 'npc1',
      x: 35,
      y: 31,
      color: '#94a3b8',
      speech: 'Learning finance through play hits different.',
      facing: 'right'
    },
    {
      id: 'npc2',
      x: 50,
      y: 45,
      color: '#e2e8f0',
      speech: 'Central Plaza • Daily streak bonus claimed.',
      facing: 'down'
    },
    {
      id: 'npc3',
      x: 65,
      y: 69,
      color: '#64748b',
      speech: 'Automated index SIPs beat emotional timing.',
      facing: 'left'
    }
  ];

  // Smooth Camera Follow (Responsive on desktop and mobile)
  useEffect(() => {
    if (!isMobile && zoom <= 1.0) {
      setCamPos({ x: 50, y: 50 });
      return;
    }
    const effectiveZoom = isMobile ? Math.max(1.15, zoom) : zoom;
    const maxOffset = (1 - 1 / effectiveZoom) * 50;
    const clampedX = Math.max(50 - maxOffset, Math.min(50 + maxOffset, playerPos.x));
    const clampedY = Math.max(50 - maxOffset, Math.min(50 + maxOffset, playerPos.y));
    setCamPos({ x: clampedX, y: clampedY });
  }, [playerPos, zoom, isMobile]);

  // Touch & Directional Helper
  const movePlayer = (dir) => {
    const step = 4.0;
    setFacing(dir);
    setIsWalking(true);
    setStepCycle((s) => (s + 1) % 4);
    setPlayerPos((prev) => {
      let dx = 0;
      let dy = 0;
      if (dir === 'up') dy = -step;
      if (dir === 'down') dy = step;
      if (dir === 'left') dx = -step;
      if (dir === 'right') dx = step;
      return {
        x: Math.max(6, Math.min(94, prev.x + dx)),
        y: Math.max(8, Math.min(92, prev.y + dy))
      };
    });
    setTimeout(() => setIsWalking(false), 160);
  };

  // Mouse Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((prev) => {
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      return Math.max(1.0, Math.min(2.4, +(prev + delta).toFixed(2)));
    });
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const step = 2.0;
      let dx = 0;
      let dy = 0;
      let newFacing = facing;

      if (e.key === 'Escape') {
        navigate('/dashboard/overview');
        return;
      }

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
      } else if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(2)));
        return;
      } else if (e.key === '-' || e.key === '_') {
        setZoom((z) => Math.max(1.0, +(z - 0.2).toFixed(2)));
        return;
      } else {
        return;
      }

      e.preventDefault();
      setFacing(newFacing);
      setIsWalking(true);
      setStepCycle((s) => (s + 1) % 4);

      setPlayerPos((prev) => ({
        x: Math.max(6, Math.min(94, prev.x + dx)),
        y: Math.max(8, Math.min(92, prev.y + dy))
      }));
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
    const moveSpeed = 1.1;

    const animateWalk = () => {
      setPlayerPos((prev) => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1.2) {
          setIsWalking(false);
          setTargetPos(null);
          if (targetPos.building) {
            handleEnterBuilding(targetPos.building);
          }
          return { x: targetPos.x, y: targetPos.y };
        }

        if (Math.abs(dx) > Math.abs(dy)) {
          setFacing(dx > 0 ? 'right' : 'left');
        } else {
          setFacing(dy > 0 ? 'down' : 'up');
        }

        setIsWalking(true);
        setStepCycle((s) => (s + 1) % 4);

        const moveX = (dx / dist) * moveSpeed;
        const moveY = (dy / dist) * moveSpeed;
        return { x: prev.x + moveX, y: prev.y + moveY };
      });

      animId = requestAnimationFrame(animateWalk);
    };

    animId = requestAnimationFrame(animateWalk);
    return () => cancelAnimationFrame(animId);
  }, [targetPos]);

  // Proximity Detection
  useEffect(() => {
    let closest = null;
    let minDist = 11;

    buildings.forEach((b) => {
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

  // Map Click
  const handleMapClick = (e) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    setTargetPos({ x: Math.max(6, Math.min(94, clickX)), y: Math.max(8, Math.min(92, clickY)) });
  };

  const handleBuildingClick = (building, e) => {
    e.stopPropagation();
    setTargetPos({ x: building.door.x, y: building.door.y, building });
  };

  const handleEnterBuilding = (building) => {
    if (building.id === 'post') {
      setPostOfficeOpen(true);
      return;
    }
    setToastMessage(`ENTERING ${building.name}...`);
    setTimeout(() => {
      navigate(building.path);
    }, 380);
  };

  const dPadBtnStyle = {
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '6px',
    color: '#38bdf8',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation'
  };

  return (
    <div 
      onWheel={handleWheel}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#070b14', // Deep obsidian
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: is3D ? '1100px' : 'none'
      }}
    >

      {/* =========================================================================
          1. STRUCTURED 2.5D TOWN WORLD (ORGANIZED CITY BLOCKS & REFINED PALETTE)
          ========================================================================= */}
      <div
        ref={mapRef}
        onClick={handleMapClick}
        style={{
          position: 'relative',
          width: isMobile ? '960px' : '100%',
          height: isMobile ? '640px' : '100%',
          minWidth: isMobile ? '960px' : '100%',
          minHeight: isMobile ? '640px' : '100%',
          maxWidth: isMobile ? 'none' : '100vw',
          maxHeight: isMobile ? 'none' : '100vh',
          backgroundColor: '#0b1329', // Sophisticated Midnight Navy
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 75%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px',
          cursor: 'crosshair',
          overflow: 'hidden',
          transformOrigin: `${camPos.x}% ${camPos.y}%`,
          transform: `${is3D ? (isMobile ? 'rotateX(12deg)' : 'rotateX(16deg)') : ''} scale(${zoom})`,
          transition: isWalking ? 'transform 0.08s ease-out' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >

        {/* 4 Green Landscaped Turf Quadrants */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          {/* Top-Left Park Zone */}
          <div style={{
            position: 'absolute',
            left: '6%',
            top: '6%',
            width: '28%',
            height: '24%',
            backgroundColor: '#0c281e',
            border: '1px solid #14532d',
            borderRadius: '16px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
          }} />

          {/* Top-Right Park Zone */}
          <div style={{
            position: 'absolute',
            left: '66%',
            top: '6%',
            width: '28%',
            height: '24%',
            backgroundColor: '#0c281e',
            border: '1px solid #14532d',
            borderRadius: '16px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
          }} />

          {/* Bottom-Left Park Zone */}
          <div style={{
            position: 'absolute',
            left: '6%',
            top: '70%',
            width: '28%',
            height: '24%',
            backgroundColor: '#0c281e',
            border: '1px solid #14532d',
            borderRadius: '16px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
          }} />

          {/* Bottom-Right Park Zone */}
          <div style={{
            position: 'absolute',
            left: '66%',
            top: '70%',
            width: '28%',
            height: '24%',
            backgroundColor: '#0c281e',
            border: '1px solid #14532d',
            borderRadius: '16px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
          }} />
        </div>

        {/* =========================================================================
            2. REFINED ASPHALT ROADS, SIDEWALKS & CROSSWALKS
            ========================================================================= */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
          {/* North Main Highway */}
          <rect x="0" y="28%" width="100%" height="8%" fill="#1e293b" />
          <rect x="0" y="29%" width="100%" height="6%" fill="#0f172a" />
          <line x1="0" y1="32%" x2="100%" y2="32%" stroke="#475569" strokeWidth="2" strokeDasharray="14 10" />

          {/* South Main Highway */}
          <rect x="0" y="64%" width="100%" height="8%" fill="#1e293b" />
          <rect x="0" y="65%" width="100%" height="6%" fill="#0f172a" />
          <line x1="0" y1="68%" x2="100%" y2="68%" stroke="#475569" strokeWidth="2" strokeDasharray="14 10" />

          {/* West Boulevard */}
          <rect x="26%" y="0" width="8%" height="100%" fill="#1e293b" />
          <rect x="27%" y="0" width="6%" height="100%" fill="#0f172a" />
          <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#475569" strokeWidth="2" strokeDasharray="14 10" />

          {/* East Boulevard */}
          <rect x="66%" y="0" width="8%" height="100%" fill="#1e293b" />
          <rect x="67%" y="0" width="6%" height="100%" fill="#0f172a" />
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#475569" strokeWidth="2" strokeDasharray="14 10" />

          {/* Center Connector */}
          <rect x="46%" y="28%" width="8%" height="44%" fill="#1e293b" />
          <rect x="47%" y="28%" width="6%" height="44%" fill="#0f172a" />

          {/* Elegant Crosswalks */}
          <line x1="26%" y1="28%" x2="34%" y2="28%" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4" />
          <line x1="26%" y1="36%" x2="34%" y2="36%" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4" />
          <line x1="66%" y1="28%" x2="74%" y2="28%" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4" />
          <line x1="66%" y1="36%" x2="74%" y2="36%" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4" />
          <line x1="26%" y1="64%" x2="34%" y2="64%" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4" />
          <line x1="26%" y1="72%" x2="34%" y2="72%" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4" />
          <line x1="66%" y1="64%" x2="74%" y2="64%" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4" />
          <line x1="66%" y1="72%" x2="74%" y2="72%" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4" />
        </svg>

        {/* Central Roundabout & Kinetic Landmark */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '16vw',
          height: '16vw',
          maxWidth: '160px',
          maxHeight: '160px',
          borderRadius: '50%',
          backgroundColor: '#0f172a',
          border: '4px solid #334155',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Inner Ring */}
          <div style={{
            width: '76%',
            height: '76%',
            borderRadius: '50%',
            backgroundColor: '#0b1329',
            border: '2px solid #0284c7',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 15px rgba(2, 132, 199, 0.4), 0 0 20px rgba(2, 132, 199, 0.2)'
          }}>
            <Compass size={22} color="#38bdf8" style={{ animation: 'spin 12s linear infinite' }} />
            <span style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: '#38bdf8', marginTop: '4px', letterSpacing: '1px' }}>
              PLAZA
            </span>
          </div>
        </div>

        {/* =========================================================================
            3. THE 8 CLEAN PIXEL BUILDING CARDS (ORGANIZED & ELEVATED)
            ========================================================================= */}
        {buildings.map((b) => {
          const isNear = nearbyBuilding?.id === b.id;
          const IconComponent = b.Icon;

          return (
            <React.Fragment key={b.id}>
              {/* Elevated Building Card */}
              <div
                onClick={(e) => handleBuildingClick(b, e)}
                style={{
                  position: 'absolute',
                  left: `${b.pos.x}%`,
                  top: `${b.pos.y}%`,
                  transform: `translate(-50%, -50%) ${isNear ? 'translateY(-6px) scale(1.04)' : 'translateY(0) scale(1)'}`,
                  zIndex: 25,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                title={`Click to walk to ${b.name}`}
              >
                {/* Header Tag with Clean Vector Icon (No Emojis) */}
                <div style={{
                  padding: isMobile ? '2px 5px' : '4px 8px',
                  backgroundColor: '#090d16',
                  border: `1.5px solid ${isNear ? '#ffffff' : b.color}`,
                  borderRadius: '6px',
                  color: isNear ? '#ffffff' : '#f8fafc',
                  fontSize: isMobile ? '7px' : '8px',
                  fontFamily: 'var(--font-pixel)',
                  whiteSpace: 'nowrap',
                  boxShadow: isNear ? `0 0 16px ${b.color}` : '0 4px 10px rgba(0,0,0,0.6)',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '3px' : '5px'
                }}>
                  <IconComponent size={isMobile ? 9 : 11} color={isNear ? '#ffffff' : b.color} />
                  <span>{b.name}</span>
                </div>

                {/* Pixel Tile Graphic with Crisp Border */}
                <div style={{
                  position: 'relative',
                  width: isMobile ? '82px' : 'clamp(70px, 12vw, 130px)',
                  height: isMobile ? '82px' : 'clamp(70px, 12vw, 130px)',
                  maxWidth: '135px',
                  maxHeight: '135px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: `2px solid ${isNear ? '#ffffff' : 'rgba(255, 255, 255, 0.12)'}`,
                  boxShadow: isNear 
                    ? `0 0 25px ${b.color}, 0 10px 20px rgba(0,0,0,0.8)` 
                    : `0 6px 16px rgba(0,0,0,0.5)`,
                  backgroundColor: '#0a0f1d'
                }}>
                  <img
                    src={b.img}
                    alt={b.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      imageRendering: 'pixelated'
                    }}
                  />
                </div>

                {/* Subtitle Badge */}
                <div style={{
                  marginTop: '4px',
                  padding: '2px 6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: `1px solid ${b.color}66`,
                  color: b.color,
                  fontSize: '7px',
                  fontFamily: 'var(--font-pixel)',
                  borderRadius: '3px',
                  whiteSpace: 'nowrap'
                }}>
                  {b.badge}
                </div>
              </div>

              {/* Glowing Doorstep Portal on Road */}
              <div
                onClick={(e) => handleBuildingClick(b, e)}
                style={{
                  position: 'absolute',
                  left: `${b.door.x}%`,
                  top: `${b.door.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '28px',
                  height: '10px',
                  borderRadius: '20px',
                  backgroundColor: isNear ? b.color : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${isNear ? '#ffffff' : b.color}`,
                  boxShadow: isNear ? `0 0 20px ${b.color}, 0 0 8px #ffffff` : `0 0 6px ${b.color}44`,
                  zIndex: 10,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Ambient NPCs */}
        {npcs.map((npc) => (
          <div
            key={npc.id}
            style={{
              position: 'absolute',
              left: `${npc.x}%`,
              top: `${npc.y}%`,
              transform: 'translate(-50%, -85%)',
              zIndex: 35,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <div style={{
              padding: '3px 8px',
              backgroundColor: '#090d16',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#cbd5e1',
              fontSize: '8px',
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              whiteSpace: 'nowrap',
              marginBottom: '3px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
            }}>
              {npc.speech}
            </div>

            <div style={{ width: '24px', height: '28px', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.7))' }}>
              <svg viewBox="0 0 16 18" width="24" height="28" style={{ imageRendering: 'pixelated' }}>
                <rect x="5" y="1" width="6" height="3" fill={npc.color} />
                <rect x="4" y="3" width="8" height="3" fill={npc.color} />
                <rect x="5" y="5" width="6" height="3" fill="#0f172a" />
                <rect x="6" y="6" width="1" height="1" fill="#38bdf8" />
                <rect x="9" y="6" width="1" height="1" fill="#38bdf8" />
                <rect x="3" y="8" width="10" height="6" fill={npc.color} />
                <rect x="4" y="14" width="2" height="2" fill={npc.color} />
                <rect x="7" y="14" width="2" height="2" fill={npc.color} />
                <rect x="10" y="14" width="2" height="2" fill={npc.color} />
                <ellipse cx="8" cy="17" rx="4" ry="1" fill="rgba(0,0,0,0.35)" />
              </svg>
            </div>
          </div>
        ))}

        {/* Player Character */}
        <div
          style={{
            position: 'absolute',
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            transform: 'translate(-50%, -85%)',
            zIndex: 45,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Action indicator above head */}
          {nearbyBuilding && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleEnterBuilding(nearbyBuilding);
              }}
              style={{
                position: 'absolute',
                bottom: '120%',
                padding: '5px 10px',
                backgroundColor: '#0284c7',
                border: '1.5px solid #38bdf8',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '8.5px',
                fontFamily: 'var(--font-pixel)',
                whiteSpace: 'nowrap',
                boxShadow: '0 0 16px #38bdf8',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
              title={`Click to enter ${nearbyBuilding.name}`}
            >
              <span>{isMobile ? `[ TAP TO ENTER: ${nearbyBuilding.badge} ]` : `[ PRESS ENTER: ${nearbyBuilding.name} ]`}</span>
            </div>
          )}

          {/* Player Sprite */}
          <div style={{
            width: '30px',
            height: '32px',
            transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.85))'
          }}>
            <svg viewBox="0 0 16 18" width="30" height="32" style={{ imageRendering: 'pixelated' }}>
              <rect x="5" y="1" width="6" height="2" fill="#38bdf8" />
              <rect x="4" y="3" width="8" height="3" fill="#f8fafc" />
              <rect x="5" y="5" width="6" height="3" fill="#0f172a" />
              {facing !== 'up' && (
                <>
                  <rect x="6" y="6" width="1" height="1" fill="#00f0ff" />
                  <rect x="9" y="6" width="1" height="1" fill="#00f0ff" />
                </>
              )}
              <rect x="3" y="8" width="10" height="6" fill="#f8fafc" />
              <rect x="3" y="12" width="10" height="1" fill="#38bdf8" />
              {isWalking ? (
                stepCycle % 2 === 0 ? (
                  <>
                    <rect x="3" y="14" width="2" height="2" fill="#f8fafc" />
                    <rect x="7" y="14" width="2" height="3" fill="#f8fafc" />
                    <rect x="11" y="14" width="2" height="1" fill="#f8fafc" />
                  </>
                ) : (
                  <>
                    <rect x="3" y="14" width="2" height="1" fill="#f8fafc" />
                    <rect x="7" y="14" width="2" height="2" fill="#f8fafc" />
                    <rect x="11" y="14" width="2" height="3" fill="#f8fafc" />
                  </>
                )
              ) : (
                <>
                  <rect x="4" y="14" width="2" height="2" fill="#f8fafc" />
                  <rect x="7" y="14" width="2" height="2" fill="#f8fafc" />
                  <rect x="10" y="14" width="2" height="2" fill="#f8fafc" />
                </>
              )}
              <ellipse cx="8" cy="17" rx="5" ry="1.5" fill="rgba(0,0,0,0.4)" />
            </svg>
          </div>

          <div style={{
            fontSize: '7.5px',
            fontFamily: 'var(--font-pixel)',
            color: '#f8fafc',
            backgroundColor: '#090d16',
            border: '1px solid #334155',
            padding: '1px 5px',
            borderRadius: '2px',
            marginTop: '2px'
          }}>
            YOU
          </div>
        </div>

      </div>

      {/* =========================================================================
          4. SLEEK RESPONSIVE HUD (NO CLASHING ELEMENTS, ADAPTIVE ON MOBILE/TABLET)
          ========================================================================= */}
      <header style={{
        position: 'absolute',
        top: isMobile ? '8px' : '12px',
        left: isMobile ? '8px' : '14px',
        right: isMobile ? '8px' : '14px',
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        {/* Left Controls: Back Button + 3D Toggle + Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard/overview')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMobile ? '6px 10px' : '7px 14px',
              background: 'rgba(9, 13, 24, 0.94)',
              border: '1.5px solid #00f0ff',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 18px rgba(0, 240, 255, 0.35)',
              transition: 'all 0.2s ease'
            }}
            title="Return to Traditional Dashboard [ESC]"
          >
            <ArrowLeft size={14} color="#00f0ff" />
            <span>BACK</span>
            {!isMobile && (
              <span style={{
                fontSize: '7.5px',
                fontFamily: 'var(--font-pixel)',
                background: 'rgba(0, 240, 255, 0.2)',
                color: '#00f0ff',
                padding: '2px 5px',
                borderRadius: '3px'
              }}>
                ESC
              </span>
            )}
          </button>

          {/* 3D View Toggle */}
          <button
            onClick={() => setIs3D(!is3D)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: is3D ? '#0284c7' : 'rgba(9, 13, 22, 0.92)',
              border: `1px solid ${is3D ? '#38bdf8' : '#334155'}`,
              color: '#f8fafc',
              padding: isMobile ? '6px 8px' : '6px 12px',
              borderRadius: '8px',
              fontSize: isMobile ? '9px' : '10px',
              fontFamily: 'var(--font-pixel)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
              boxShadow: is3D ? '0 0 14px rgba(2, 132, 199, 0.6)' : 'none'
            }}
          >
            <Layers size={12} />
            <span>{is3D ? '3D: ON' : '3D: OFF'}</span>
          </button>

          {/* Zoom Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: 'rgba(9, 13, 22, 0.92)',
            border: '1px solid #334155',
            padding: '3px 6px',
            borderRadius: '8px',
            backdropFilter: 'blur(8px)'
          }}>
            <button
              onClick={() => setZoom((z) => Math.max(1.0, +(z - 0.2).toFixed(2)))}
              title="Zoom Out"
              style={{ background: 'none', border: 'none', color: zoom <= 1.0 ? '#475569' : '#38bdf8', cursor: 'pointer', padding: '3px', display: 'flex' }}
            >
              <ZoomOut size={12} />
            </button>

            <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-pixel)', color: '#f8fafc', minWidth: isMobile ? '24px' : '28px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(2)))}
              title="Zoom In"
              style={{ background: 'none', border: 'none', color: zoom >= 2.4 ? '#475569' : '#38bdf8', cursor: 'pointer', padding: '3px', display: 'flex' }}
            >
              <ZoomIn size={12} />
            </button>

            {!isMobile && (
              <button
                onClick={() => setZoom(1.0)}
                title="Reset Zoom"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: '2px', display: 'flex' }}
              >
                <RotateCcw size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Navigation Hint, Profile & Coins */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px', pointerEvents: 'auto' }}>
          {/* Navigation Hint (Desktop only) */}
          {!isTablet && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(9, 13, 22, 0.92)',
              border: '1px solid #334155',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '9px',
              color: '#94a3b8',
              backdropFilter: 'blur(8px)'
            }}>
              <Move size={12} color="#38bdf8" />
              <span>WASD • Click to Walk</span>
            </div>
          )}

          {/* Profile Pill (Desktop & Tablet) */}
          {!isMobile && user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(9, 13, 22, 0.92)',
              border: '1px solid #334155',
              padding: '5px 10px',
              borderRadius: '6px',
              backdropFilter: 'blur(8px)'
            }}>
              <User size={12} color="#818cf8" />
              <div>
                <div style={{ fontSize: '7px', color: '#94a3b8', textTransform: 'uppercase' }}>{user.category}</div>
                <div className="font-pixel" style={{ fontSize: '8px', color: '#f8fafc' }}>{user.personality}</div>
              </div>
            </div>
          )}

          {/* Coins Pill */}
          <div style={{
            background: 'rgba(9, 13, 22, 0.92)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '5px 10px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
          }}>
            <Coins size={13} color="#f59e0b" />
            <span className="font-pixel" style={{ fontSize: isMobile ? '9.5px' : '11px', color: '#fef08a' }}>{coins}</span>
          </div>
        </div>
      </header>

      {/* Bottom Teleport Bar (Responsive) */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? '8px' : '14px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '4px' : '6px',
        background: 'rgba(9, 13, 22, 0.95)',
        border: '1px solid #334155',
        borderRadius: '30px',
        padding: isMobile ? '4px 8px' : '6px 14px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        overflowX: 'auto',
        maxWidth: isMobile ? 'calc(100vw - 120px)' : 'calc(100vw - 24px)',
        scrollbarWidth: 'none'
      }}>
        <span style={{ fontSize: isMobile ? '7px' : '8px', color: '#64748b', marginRight: '2px', whiteSpace: 'nowrap', fontFamily: 'var(--font-pixel)' }}>
          {isMobile ? 'GOTO:' : 'TELEPORT:'}
        </span>
        {buildings.map((b) => {
          const Icon = b.Icon;
          const dPadBtnStyle = {
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '6px',
    color: '#38bdf8',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation'
  };

  return (
            <button
              key={b.id}
              onClick={() => handleEnterBuilding(b)}
              className="pixel-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: isMobile ? '2px 6px' : '3px 8px',
                fontSize: isMobile ? '7px' : '8px',
                backgroundColor: '#111827',
                borderColor: b.color,
                color: '#f8fafc',
                whiteSpace: 'nowrap'
              }}
              title={b.name}
            >
              <Icon size={isMobile ? 9 : 10} color={b.color} />
              <span>{isMobile ? b.badge : b.name}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Touch Controller (Virtual D-pad) */}
      {isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          zIndex: 85,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 30px)',
          gridTemplateRows: 'repeat(3, 30px)',
          gap: '2px',
          background: 'rgba(9, 13, 24, 0.88)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '10px',
          padding: '4px',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.7)'
        }}>
          <div />
          <button
            onClick={() => movePlayer('up')}
            style={dPadBtnStyle}
            title="Move Up"
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => movePlayer('left')}
            style={dPadBtnStyle}
            title="Move Left"
          >
            ◀
          </button>
          <button
            onClick={() => nearbyBuilding && handleEnterBuilding(nearbyBuilding)}
            style={{
              ...dPadBtnStyle,
              background: nearbyBuilding ? '#00f0ff' : 'rgba(255,255,255,0.08)',
              color: nearbyBuilding ? '#070a14' : '#64748b'
            }}
            title="Action"
          >
            ●
          </button>
          <button
            onClick={() => movePlayer('right')}
            style={dPadBtnStyle}
            title="Move Right"
          >
            ▶
          </button>
          <div />
          <button
            onClick={() => movePlayer('down')}
            style={dPadBtnStyle}
            title="Move Down"
          >
            ▼
          </button>
          <div />
        </div>
      )}

      {/* Post Office Modal (No Emojis) */}
      {postOfficeOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '460px',
            maxWidth: '100%',
            backgroundColor: '#090d16',
            border: '1.5px solid #fb7185',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 0 40px rgba(251, 113, 133, 0.3)',
            color: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="#fb7185" />
                <span className="font-pixel" style={{ fontSize: '12px', color: '#fb7185' }}>POST & DISPATCH HUB</span>
              </div>
              <button 
                onClick={() => setPostOfficeOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
              <div style={{ padding: '10px', background: '#111827', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontWeight: 600, color: '#34d399' }}>Official Dispatch from SEBI & RBI Education</div>
                <div style={{ color: '#94a3b8', marginTop: '4px', fontSize: '10px' }}>
                  No regulated advisor or fund guarantees 30% monthly profits. Always check broker registrations on official portals.
                </div>
              </div>

              <div style={{ padding: '10px', background: '#111827', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                <div style={{ fontWeight: 600, color: '#38bdf8' }}>Daily Compounding Principle</div>
                <div style={{ color: '#94a3b8', marginTop: '4px', fontSize: '10px' }}>
                  Starting a ₹2,000 monthly SIP at age 22 beats starting ₹5,000 at age 32 due to the exponential power of compounding years.
                </div>
              </div>

              <div style={{ padding: '10px', background: '#111827', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                <div style={{ fontWeight: 600, color: '#f59e0b' }}>Dhaniverse Ledger Balance</div>
                <div style={{ color: '#94a3b8', marginTop: '4px', fontSize: '10px' }}>
                  Current balance: {coins} Dhaniverse Coins. Earn additional coins by completing simulations in the Coliseum.
                </div>
              </div>
            </div>

            <button
              onClick={() => setPostOfficeOpen(false)}
              className="pixel-btn"
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '8px',
                backgroundColor: '#fb7185',
                color: '#070b14',
                fontSize: '9px',
                fontWeight: 700
              }}
            >
              ACKNOWLEDGE & CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Enter Toast Banner (No Emoji) */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 150,
          padding: '14px 28px',
          background: 'rgba(2, 132, 199, 0.95)',
          border: '2px solid #38bdf8',
          borderRadius: '8px',
          color: '#ffffff',
          fontFamily: 'var(--font-pixel)',
          fontSize: '12px',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
