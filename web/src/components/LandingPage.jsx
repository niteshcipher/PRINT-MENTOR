import React from 'react';
import { useGameStore } from '../store/useGameStore';
import PixelAvatar from './PixelAvatar';
import { ShieldCheck, PlayCircle, Coins, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { setShowOnboarding, apiStatus } = useGameStore();

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      {/* Hero Box */}
      <div className="pixel-box-green" style={{ padding: '40px 32px', textAlign: 'center', backgroundColor: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
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
        <div className="animate-mentor" style={{ display: 'inline-block', marginBottom: '16px' }}>
          <PixelAvatar size={80} />
        </div>

        <h1 className="font-pixel" style={{ fontSize: '22px', color: '#34d399', marginBottom: '12px', lineHeight: '1.4' }}>
          PIXEL MENTOR
        </h1>

        <p style={{ fontSize: '15px', color: '#cbd5e1', maxWidth: '640px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          The pixel-art financial literacy game and AI coach built for students, first-job professionals, and gig workers across India.
        </p>

        {/* Start Button */}
        <button 
          onClick={() => setShowOnboarding(true)}
          className="pixel-btn pixel-btn-gold" 
          style={{ fontSize: '12px', padding: '14px 28px', cursor: 'pointer' }}
        >
          <PlayCircle size={18} />
          START 60-SEC ONBOARDING (+100 COINS)
          <ArrowRight size={16} />
        </button>

        {/* Safety Disclaimer Banner */}
        <div style={{ marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            <strong>EDUCATION ONLY</strong> — Never regulated financial advice. All simulations use illustrative math.
          </span>
        </div>
      </div>

      {/* 3-Step Feature Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div className="pixel-box" style={{ padding: '24px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Coins size={22} color="#34d399" />
          </div>
          <h3 className="font-pixel" style={{ fontSize: '11px', color: '#f1f5f9', marginBottom: '8px' }}>1. LEARN BY PLAYING</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
            Ditch boring spreadsheets. Play SIP Farm, survive market crashes, and replay your mistakes against optimal strategies.
          </p>
        </div>

        <div className="pixel-box" style={{ padding: '24px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Sparkles size={22} color="#a78bfa" />
          </div>
          <h3 className="font-pixel" style={{ fontSize: '11px', color: '#f1f5f9', marginBottom: '8px' }}>2. AI COACH WITH MEMORY</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
            Get personalized insights based on your category (Student, Pro, or Gig Earner). Your mentor remembers your habits and flags spending leaks.
          </p>
        </div>

        <div className="pixel-box" style={{ padding: '24px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#7f1d1d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <AlertTriangle size={22} color="#f87171" />
          </div>
          <h3 className="font-pixel" style={{ fontSize: '11px', color: '#f1f5f9', marginBottom: '8px' }}>3. SCAM SHIELD</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
            Paste suspicious WhatsApp or Telegram stock tips. Detect guaranteed return traps and discover safe SEBI-regulated alternatives.
          </p>
        </div>
      </div>
    </div>
  );
}

