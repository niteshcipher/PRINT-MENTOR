import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import CoinCounter from '../components/pixel/CoinCounter';
import MentorDock from '../components/MentorDock';
import Modal from '../components/pixel/Modal';
import LoadingState from '../components/common/LoadingState';
import landingBg from '../assets/landing-bg.jpg';
import { 
  LayoutDashboard,
  Gamepad2,
  Building2,
  Bot,
  Clock,
  GraduationCap,
  Wallet,
  ShieldAlert,
  HelpCircle,
  Newspaper,
  Coins,
  User,
  Sparkles,
  ArrowLeft,
  Menu,
  X,
  Compass,
  Cpu,
  Home,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function DashboardShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, coins, coinHistory, fetchCoins, fetchProfile, isLoading } = useGameStore();
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchCoins();
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (isLoading && !user) {
    return <LoadingState message="INITIALIZING FINANCIAL OS..." />;
  }

  // Route guard: If user profile not completed, redirect to /onboarding
  if (!user || !user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleOpenLedger = () => {
    fetchCoins();
    setHistoryModalOpen(true);
  };

  const isGameMap = location.pathname === '/dashboard/map';

  // Navigation tabs: Minimalist pill buttons with short keywords matching reference UI
  const tabs = [
    { path: '/dashboard/overview', label: 'Dashboard', Icon: LayoutDashboard, desc: 'Net Worth & Analytics' },
    { path: '/dashboard/budget', label: 'Budget', Icon: Wallet, desc: 'Cashflow & Quotas' },
    { path: '/dashboard/goals', label: 'Goals', Icon: Clock, desc: 'Goals & Compounding' },
    { path: '/dashboard/coach', label: 'AI Coach', Icon: Bot, desc: 'Autonomous Advisor' },
    { path: '/dashboard/games', label: 'Games', Icon: Gamepad2, desc: '5 Survival Sims' },
    { path: '/dashboard/learn', label: 'Learn', Icon: GraduationCap, desc: 'Jargon-Free Guides' },
    { path: '/dashboard/scam', label: 'Scam Shield', Icon: ShieldAlert, desc: 'Zero-Trust Scanner' },
    { path: '/dashboard/news', label: 'News', Icon: Newspaper, desc: 'Daily Market Intel & Scraped Feeds' },
    { path: '/dashboard/map', label: 'Town Map', Icon: Compass, desc: '2.5D / 3D Town View' },
    { path: '/dashboard/help', label: 'Help', Icon: HelpCircle, desc: 'Design System & Component Specs' }
  ];

  const currentTab = tabs.find(t => location.pathname === t.path) || tabs[0];

  // Ledger Modal
  const renderLedgerModal = () => (
    <Modal
      isOpen={historyModalOpen}
      onClose={() => setHistoryModalOpen(false)}
      title="IMMUTABLE COIN LEDGER"
      variant="gold"
    >
      <div style={{
        marginBottom: '16px',
        padding: '14px 18px',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={16} color="#fbbf24" />
          <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>Sum Balance:</span>
        </div>
        <span className="font-pixel" style={{ fontSize: '14px', color: '#fef08a', textShadow: '0 0 10px rgba(251, 191, 36, 0.4)' }}>
          {coins} COINS
        </span>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {coinHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '12px' }}>
            No ledger transactions recorded yet.
          </div>
        ) : (
          coinHistory.map((entry, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: entry.delta > 0 ? 'rgba(6, 78, 59, 0.25)' : 'rgba(127, 29, 29, 0.25)',
                border: `1px solid ${entry.delta > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderLeft: `4px solid ${entry.delta > 0 ? '#10b981' : '#ef4444'}`,
                borderRadius: '6px'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#f8fafc', fontWeight: 600 }}>
                  {entry.reason.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  {new Date(entry.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </div>
              <span className="font-pixel" style={{ fontSize: '12px', color: entry.delta > 0 ? '#34d399' : '#f87171' }}>
                {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
              </span>
            </div>
          ))
        )}
      </div>
    </Modal>
  );

  // =========================================================================
  // OPTION 1: GAME MODE MAP (Interactive 2.5D / 3D Town Map)
  // =========================================================================
  if (isGameMap) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: '#070a14' }}>
        <Outlet />
        <MentorDock />
        {renderLedgerModal()}
      </div>
    );
  }

  // =========================================================================
  // OPTION 2: LOCKED SCREEN DASHBOARD (DARK & CYBERPUNK THEME)
  // Outer shell is locked to 100vh with overflow: hidden so screen never slides away
  // =========================================================================
  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      display: 'flex',
      backgroundColor: '#070a14',
      color: '#f8fafc',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Cyber Cityscape Background Texture */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url(${landingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        opacity: 0.18,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Atmospheric Vignette & Grid */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(8, 12, 24, 0.6) 0%, rgba(7, 10, 20, 0.88) 50%, rgba(4, 6, 12, 0.97) 100%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Cyber Grid Pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 240, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 90
          }}
        />
      )}

      {/* =====================================================================
          LEFT SIDE NAVBAR: VERTICAL AS IN TRADITIONAL WEBSITES
          ===================================================================== */}
      <aside style={{
        width: '264px',
        minWidth: '264px',
        height: '100vh',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'rgba(9, 13, 24, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(56, 189, 248, 0.16)',
        boxShadow: '4px 0 30px rgba(0, 0, 0, 0.65)',
        zIndex: 100,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: mobileMenuOpen ? 'translateX(0)' : undefined
      }}
      className="dashboard-sidebar"
      >
        {/* SIDEBAR TOP: BRAND & LOGO */}
        <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid rgba(56, 189, 248, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 900,
                letterSpacing: '2px',
                color: '#f8fafc',
                textTransform: 'uppercase',
                textShadow: '0 0 20px rgba(0, 240, 255, 0.6)'
              }}>
                PIXEL<span style={{ color: '#00f0ff' }}>MENTOR</span>
              </span>
            </Link>

            {/* Mobile close button */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
              className="mobile-close-btn"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* SIDEBAR CENTER: MODERN PILL NAVIGATION (MATCHING REFERENCE UI) */}
        <div style={{ flex: 1, padding: '16px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="pill-nav-container">
            {tabs.map((tab) => {
              const Icon = tab.Icon;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `pill-nav-item ${isActive ? 'active' : ''}`}
                >
                  {({ isActive }) => (
                    <>
                      <div className="pill-nav-icon">
                        {isActive ? (
                          <div className="pill-active-badge">
                            <Icon size={14} color="#0c0f17" strokeWidth={2.5} />
                          </div>
                        ) : (
                          <Icon size={18} strokeWidth={1.8} />
                        )}
                      </div>
                      <span style={{ fontSize: '13.5px', fontWeight: isActive ? 600 : 500 }}>
                        {tab.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR BOTTOM: USER IDENTITY & COIN WALLET */}
        <div style={{
          padding: '14px 16px 18px',
          borderTop: '1px solid rgba(56, 189, 248, 0.12)',
          background: 'rgba(6, 9, 18, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* User Profile Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(56, 189, 248, 0.18)',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={16} color="#ffffff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {user.category}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.personality}
              </div>
            </div>
          </div>

          {/* Interactive Coin Counter & Ledger Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CoinCounter 
              amount={coins} 
              onClick={handleOpenLedger} 
              showHistoryIndicator={true}
            />

            <Link 
              to="/" 
              style={{
                fontSize: '10px',
                color: '#94a3b8',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.2s ease'
              }}
              title="Return to Landing Page"
            >
              <Home size={11} />
              <span>Portal</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          MAIN DASHBOARD CONTENT AREA: SCREEN LOCKED
          Header stays fixed, only the inner main container scrolls smoothly
          ===================================================================== */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        minWidth: 0,
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden'
      }}>

        {/* TOP BAR: Breadcrumbs, Game Mode Switch, Stats */}
        <header style={{
          flexShrink: 0,
          zIndex: 40,
          background: 'rgba(8, 12, 24, 0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Left: Mobile Toggle & Breadcrumb Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'none',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              className="mobile-hamburger-btn"
            >
              <Menu size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-pixel)',
                  color: '#00f0ff',
                  letterSpacing: '1px'
                }}>
                  PIXELMENTOR
                </span>
                <span style={{ color: '#475569', fontSize: '11px' }}>//</span>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>
                  {currentTab.label}
                </h2>
              </div>
              {currentTab.desc && (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                  {currentTab.desc}
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Security Protocol Badge */}
            <div className="cyber-badge" style={{ display: 'none', lg: 'inline-flex' }}>
              <span className="cyber-dot" />
              <span>ENCRYPTION // 256-BIT</span>
            </div>

            {/* Quick Game Mode Switcher Button */}
            <button
              onClick={() => navigate('/dashboard/map')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(244, 63, 94, 0.2)',
                transition: 'all 0.2s ease'
              }}
              title="Launch 2.5D / 3D Interactive Town Map"
            >
              <Gamepad2 size={14} color="#f43f5e" />
              <span>GAME MAP</span>
              <span style={{
                fontSize: '8px',
                fontFamily: 'var(--font-pixel)',
                background: 'rgba(244, 63, 94, 0.2)',
                color: '#f43f5e',
                padding: '2px 4px',
                borderRadius: '3px'
              }}>
                3D
              </span>
            </button>

            {/* Coin Counter */}
            <CoinCounter 
              amount={coins} 
              onClick={handleOpenLedger} 
              showHistoryIndicator={true}
            />
          </div>
        </header>

        {/* MAIN TAB CONTENT CONTAINER: ONLY THIS INNER SCROLLS */}
        <main style={{ 
          flex: 1, 
          maxWidth: '1380px', 
          width: '100%', 
          margin: '0 auto', 
          padding: '24px 28px 40px',
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain'
        }}>
          <Outlet />
        </main>
      </div>

      {/* FLOATING MENTOR DOCK */}
      <MentorDock />

      {/* COIN LEDGER MODAL */}
      {renderLedgerModal()}

      {/* Responsive Style Overrides */}
      <style>{`
        @media (max-width: 900px) {
          .dashboard-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: 10px 0 40px rgba(0, 0, 0, 0.9) !important;
          }
          .mobile-hamburger-btn {
            display: inline-flex !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
