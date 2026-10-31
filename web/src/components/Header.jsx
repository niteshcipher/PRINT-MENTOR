import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { 
  Coins, 
  History, 
  ShieldAlert, 
  Gamepad2, 
  LineChart, 
  PieChart, 
  BookOpen, 
  Bot, 
  Home,
  X
} from 'lucide-react';

export default function Header() {
  const { user, coins, coinHistory, activeTab, setTab, fetchCoins, apiStatus } = useGameStore();
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'goals', label: 'Time Machine', icon: LineChart },
    { id: 'coach', label: 'AI Coach', icon: Bot },
    { id: 'games', label: 'Arcade Games', icon: Gamepad2 },
    { id: 'learn', label: 'Learn & ELI15', icon: BookOpen },
    { id: 'scam', label: 'Scam Shield', icon: ShieldAlert },
  ];

  const handleOpenHistory = () => {
    fetchCoins();
    setShowHistoryModal(true);
  };

  return (
    <>
      <header className="pixel-box" style={{ margin: '16px auto', maxWidth: '1240px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setTab('overview')}>
            <span style={{
              fontSize: '18px',
              fontWeight: 900,
              letterSpacing: '2px',
              color: '#f8fafc',
              textTransform: 'uppercase',
              textShadow: '0 0 16px rgba(0, 240, 255, 0.5)'
            }}>
              PIXEL<span style={{ color: '#00f0ff' }}>MENTOR</span>
            </span>
            <span 
              className="pixel-badge" 
              style={{ 
                color: apiStatus === 'ok' ? '#10b981' : '#f59e0b', 
                borderColor: apiStatus === 'ok' ? '#10b981' : '#f59e0b',
                backgroundColor: apiStatus === 'ok' ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
              }}
            >
              API: {apiStatus}
            </span>
          </div>

          {/* User Personality Badge & Coin Balance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user && (
              <div 
                className="pixel-box" 
                style={{ 
                  padding: '6px 12px', 
                  backgroundColor: '#1e1b4b', 
                  borderColor: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '12px' }}>🧙</span>
                <div>
                  <div style={{ fontSize: '9px', color: '#a5b4fc', textTransform: 'uppercase' }}>Profile</div>
                  <div className="font-pixel" style={{ fontSize: '9px', color: '#e0e7ff' }}>{user.personality || 'New Learner'}</div>
                </div>
              </div>
            )}

            {/* Coin Balance Pill */}
            <div 
              onClick={handleOpenHistory}
              className="pixel-box-gold" 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#271b05', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              title="Click to view Coin Ledger history"
            >
              <img src="/pixel_coin.svg" alt="Coins" style={{ width: '22px', height: '22px' }} />
              <div>
                <div style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 600 }}>COINS</div>
                <div className="font-pixel" style={{ fontSize: '13px', color: '#fef08a' }}>{coins}</div>
              </div>
              <History size={14} color="#f59e0b" style={{ marginLeft: '4px' }} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #212b3d' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`pixel-btn ${isActive ? 'pixel-btn-green' : ''}`}
                style={{
                  fontSize: '9px',
                  padding: '8px 12px',
                  whiteSpace: 'nowrap',
                  opacity: isActive ? 1 : 0.85
                }}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Coin History Modal */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="pixel-box-gold" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#131924', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/pixel_coin.svg" alt="Coins" style={{ width: '24px', height: '24px' }} />
                <h3 className="font-pixel" style={{ fontSize: '12px', color: '#fbbf24' }}>COIN LEDGER HISTORY</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="pixel-btn" style={{ padding: '4px 8px' }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: '#1f293d', borderRadius: '4px' }}>
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Current Balance: </span>
              <span className="font-pixel" style={{ fontSize: '13px', color: '#fef08a' }}>{coins} Coins</span>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {coinHistory.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '20px' }}>No transactions recorded yet.</p>
              ) : (
                coinHistory.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px', 
                    backgroundColor: item.delta > 0 ? '#064e3b33' : '#7f1d1d33',
                    borderLeft: `4px solid ${item.delta > 0 ? '#10b981' : '#ef4444'}`
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>{item.reason.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="font-pixel" style={{ fontSize: '11px', color: item.delta > 0 ? '#34d399' : '#f87171' }}>
                      {item.delta > 0 ? `+${item.delta}` : item.delta}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

