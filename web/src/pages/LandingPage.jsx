import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CyberBuddy from '../components/cyber/CyberBuddy';
import landingBg from '../assets/landing-bg.jpg';
import { 
  Play, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Gamepad2, 
  RotateCcw, 
  Briefcase, 
  BookOpen,
  Cpu,
  Layers,
  TrendingUp,
  Target,
  Terminal,
  Radio,
  Sliders,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function LandingPage() {
  // Interactive mini-simulator for the landing page
  const [sipAmount, setSipAmount] = useState(2000);
  const [sipYears, setSipYears] = useState(10);
  const rate = 0.12; // 12% p.a.
  const n = sipYears * 12;
  const i = rate / 12;
  const invested = sipAmount * n;
  const futureValue = Math.round(sipAmount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
  const wealthGained = futureValue - invested;

  const uspList = [
    {
      code: "SYS-01",
      title: "Autonomous AI Coach with Memory",
      icon: Cpu,
      color: "#00f0ff",
      desc: "A neural companion that tracks your cash flow, remembers your risk tolerances, and alerts you before budget breaches happen."
    },
    {
      code: "SYS-02",
      title: "Money Personality Profiling",
      icon: Target,
      color: "#ff007f",
      desc: "A 60-second interactive behavioral quiz classifying you into Safe Saver, Impulsive Spender, FOMO Investor, or Balanced Planner."
    },
    {
      code: "SYS-03",
      title: "What-If Compounding Time Machine",
      icon: Zap,
      color: "#ffd600",
      desc: "Live mathematical simulations exposing the power of micro-savings. See how ₹500 weekly coffee cuts turn into ₹14 Lakhs."
    },
    {
      code: "SYS-04",
      title: "Zero-Trust Scam Shield",
      icon: ShieldAlert,
      color: "#f43f5e",
      desc: "AI-powered regex + LLM analyzer for WhatsApp/Telegram stock tips. Flags red flags with character-level accuracy."
    },
    {
      code: "SYS-05",
      title: "5 Arcade Simulation Arenas",
      icon: Gamepad2,
      color: "#a855f7",
      desc: "Interactive gamified scenarios: SIP Farm, Market Crash Survivor (-30% dip), Scam Detective, Budget Bazaar, and Inflation Island."
    },
    {
      code: "SYS-06",
      title: "Ledger-Backed Coin Economy",
      icon: Coins,
      color: "#38bdf8",
      desc: "Strict append-only double-entry ledger. Earn coins for daily expense tracking discipline and spend them on simulation access."
    },
    {
      code: "SYS-07",
      title: "Optimal Mistake Replays",
      icon: RotateCcw,
      color: "#ec4899",
      desc: "Compare your emotional decisions directly against mathematical best choices with personalized post-run mentor debriefs."
    },
    {
      code: "SYS-08",
      title: "Gig-Worker & Freelance Mode",
      icon: Briefcase,
      color: "#10b981",
      desc: "Custom algorithm for irregular earners: lean-month baseline calculation, volatility buffers, and daily safe-to-spend quotas."
    },
    {
      code: "SYS-09",
      title: "Zero-Jargon Financial Glossary",
      icon: BookOpen,
      color: "#06b6d4",
      desc: "Over 30 Indian finance concepts (UPI, SIP, NIFTY, PPF, DICGC, Index Funds) translated with cricket and street-food analogies."
    }
  ];

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#070a14',
      color: '#f8fafc',
      overflowX: 'hidden'
    }}>

      {/* 1. Cyber Cityscape Fixed Background Layer */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url(${landingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* 2. Cyber Atmospheric Depth & Contrast Tint */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(10, 8, 24, 0.32) 0%, rgba(8, 10, 22, 0.6) 40%, rgba(5, 7, 16, 0.92) 100%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* 3. Cyber Grid Accent Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Top Cyber Navigation Bar */}
      <header style={{
        position: 'relative',
        zIndex: 20,
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(56, 189, 248, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{
            fontSize: '20px',
            fontWeight: 900,
            letterSpacing: '2px',
            color: '#f8fafc',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(0, 240, 255, 0.6)'
          }}>
            PIXEL<span style={{ color: '#00f0ff' }}>MENTOR</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="cyber-badge" style={{ display: 'none', md: 'inline-flex' }}>
            <span className="cyber-dot" />
            <span>NEURAL GRID: ONLINE</span>
          </div>

          <Link to="/onboarding" style={{ textDecoration: 'none' }}>
            <button className="cyber-btn-primary" style={{ padding: '10px 18px', fontSize: '12px' }}>
              START APP <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </header>

      {/* Main Page Container */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1240px', margin: '0 auto', padding: '30px 24px 80px', display: 'flex', flexDirection: 'column', gap: '70px' }}>

        {/* =========================================================================
            1. HERO SECTION WITH PATROLLING CYBER BUDDY
            ========================================================================= */}
        <section style={{ position: 'relative', minHeight: '520px', padding: '40px 0 20px', textAlign: 'center' }}>
          
          {/* THE PATROLLING CYBER BUDDY */}
          <CyberBuddy />

          <div style={{ maxWidth: '840px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            
            {/* Status Pill */}
            <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
              <div className="cyber-badge">
                <span className="cyber-dot" />
                <span>GEN-AI COACH • FIRST-TIME EARNERS IN INDIA</span>
              </div>
            </div>

            {/* Main Cyberpunk Headline */}
            <h1 style={{
              fontSize: 'clamp(32px, 5.5vw, 62px)',
              fontWeight: 900,
              lineHeight: '1.1',
              letterSpacing: '-1px',
              textTransform: 'uppercase',
              marginBottom: '22px'
            }}>
              HACK YOUR <span style={{ 
                color: '#00f0ff',
                textShadow: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 40px rgba(0, 240, 255, 0.3)'
              }}>WEALTH</span>.<br />
              SHIELD YOUR <span style={{
                color: '#ff007f',
                textShadow: '0 0 20px rgba(255, 0, 127, 0.6), 0 0 40px rgba(255, 0, 127, 0.3)'
              }}>FUTURE</span>.
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: '#94a3b8',
              lineHeight: '1.6',
              maxWidth: '680px',
              margin: '0 auto 34px'
            }}>
              Master budgeting, saving, and compounding through hands-on simulations and an autonomous AI companion. Engineered specifically for students, young professionals, and gig workers.
            </p>

            {/* CTA Button Group */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/onboarding" style={{ textDecoration: 'none' }}>
                <button className="cyber-btn-primary">
                  <Play size={16} fill="#050811" /> INITIALIZE ONBOARDING [60s]
                </button>
              </Link>

              <Link to="/dashboard?demo=1" style={{ textDecoration: 'none' }}>
                <button className="cyber-btn-secondary">
                  ENTER DEMO GRID <ArrowRight size={16} />
                </button>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
              marginTop: '50px',
              padding: '16px 20px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SIMULATION WORLDS</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#00f0ff' }}>5 ARCADE ARENAS</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>REGULATORY STATUS</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>100% SEBI-SAFE</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>AI ARCHITECTURE</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#ff007f' }}>PERSONA-AWARE</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>LEDGER SYSTEM</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffd600' }}>APPEND-ONLY</div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            2. INTERACTIVE HOLOGRAPHIC COMPOUNDING MATRIX
            ========================================================================= */}
        <section className="cyber-card" style={{ padding: '36px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f0ff', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
                <Sliders size={16} />
                <span>INTERACTIVE MATRIX</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                LIVE COMPOUNDING TIME MACHINE
              </h2>
            </div>
            <div className="cyber-badge" style={{ borderColor: 'rgba(255, 214, 0, 0.4)', color: '#ffd600' }}>
              ASSUMED RATE: 12% P.A. (NIFTY 50 HISTORICAL)
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
            
            {/* Sliders Input Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Monthly SIP Investment</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#00f0ff' }}>₹{sipAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="15000" 
                  step="500" 
                  value={sipAmount} 
                  onChange={(e) => setSipAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Time Horizon</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#ff007f' }}>{sipYears} Years</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="25" 
                  step="1" 
                  value={sipYears} 
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ff007f', cursor: 'pointer' }}
                />
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                💡 <em>Notice how the compounding gains (neon pink) outstrip your actual principal deposited (cyan) as the timeline expands!</em>
              </div>
            </div>

            {/* Live Holographic Output Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TOTAL INVESTED</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#00f0ff', marginTop: '6px' }}>
                  ₹{(invested / 100000).toFixed(2)} L
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>₹{invested.toLocaleString()}</div>
              </div>

              <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 0, 127, 0.3)', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>COMPOUND GAINS</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#ff007f', marginTop: '6px' }}>
                  +₹{(wealthGained / 100000).toFixed(2)} L
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Pure Interest Growth</div>
              </div>

              <div style={{ gridColumn: 'span 2', padding: '20px', background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(255, 0, 127, 0.1))', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>PROJECTED FINAL PORTFOLIO</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>
                  ₹{(futureValue / 100000).toFixed(2)} Lakhs
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Illustrative simulation at 12% annual return. Not a guaranteed return.
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            3. HOW IT WORKS (3-PHASE PROTOCOL)
            ========================================================================= */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="cyber-badge" style={{ marginBottom: '8px' }}>
              SYSTEM PIPELINE
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, textTransform: 'uppercase' }}>
              THE 3-PHASE NEURAL JOURNEY
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            
            <div className="cyber-card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#00f0ff', letterSpacing: '1px', marginBottom: '12px' }}>
                PHASE 01 // CALIBRATE
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
                DISCOVER MONEY PERSONALITY
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
                Take a rapid 60-second quiz that maps your fixed expenses, discretionary cash flow, and risk appetite. Receive your starting coins and unlock your custom dashboard.
              </p>
            </div>

            <div className="cyber-card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#ff007f', letterSpacing: '1px', marginBottom: '12px' }}>
                PHASE 02 // SIMULATE
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
                BATTLE MARKET ARENAS
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
                Face simulated market drops (-30% crash), test inflation resistance, and scan suspicious telegram tips in Scam Shield. Practice without burning real money.
              </p>
            </div>

            <div className="cyber-card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffd600', letterSpacing: '1px', marginBottom: '12px' }}>
                PHASE 03 // EVOLVE
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
                REPLAY MISTAKES & LEVEL UP
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
                Compare your actual decisions against mathematical optimums. Build lasting daily logging habits and ask your AI coach for personalized advice anytime.
              </p>
            </div>

          </div>
        </section>

        {/* =========================================================================
            4. THE NINE CYBER SUBSYSTEMS (USPs)
            ========================================================================= */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="cyber-badge" style={{ marginBottom: '8px' }}>
              ENGINE ARCHITECTURE
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, textTransform: 'uppercase' }}>
              THE NINE CORE SUBSYSTEMS
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {uspList.map((usp, idx) => {
              const Icon = usp.icon;
              return (
                <div key={idx} className="cyber-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '10px', 
                      background: `rgba(${parseInt(usp.color.slice(1,3),16)}, ${parseInt(usp.color.slice(3,5),16)}, ${parseInt(usp.color.slice(5,7),16)}, 0.15)`,
                      border: `1px solid ${usp.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 15px ${usp.color}33`
                    }}>
                      <Icon size={20} color={usp.color} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '1px' }}>
                      {usp.code}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                    {usp.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                    {usp.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            5. CYBER HUD INTERFACE SHOWCASE
            ========================================================================= */}
        <section className="cyber-card" style={{ padding: '36px 30px' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 30px' }}>
            <div className="cyber-badge" style={{ marginBottom: '8px' }}>
              LIVE TELEMETRY
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800 }}>
              CYBERPUNK DASHBOARD HUD
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>
              Sleek telemetry designed to make financial discipline thrilling and crystal clear.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* HUD Preview 1: Safe-to-Spend & Health */}
            <div style={{ padding: '20px', background: 'rgba(10, 15, 28, 0.85)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#00f0ff' }}>TELEMETRY • BUDGET MATRIX</span>
                <span className="cyber-badge" style={{ padding: '2px 8px', fontSize: '9px' }}>145 COINS</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid #10b981', borderRadius: '4px' }}>
                  <div style={{ fontSize: '11px', color: '#6ee7b7' }}>SAVINGS EFFICIENCY RATE</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>75.0% • OPTIMAL</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255, 214, 0, 0.1)', borderLeft: '3px solid #ffd600', borderRadius: '4px' }}>
                  <div style={{ fontSize: '11px', color: '#fde047' }}>DAILY DISCRETIONARY QUOTA</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffd600' }}>₹500 / DAY SAFE</div>
                </div>
              </div>
            </div>

            {/* HUD Preview 2: Scam Shield Scanner */}
            <div style={{ padding: '20px', background: 'rgba(10, 15, 28, 0.85)', border: '1px solid rgba(255, 0, 127, 0.3)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff007f' }}>SCAM SHIELD • THREAT SCANNER</span>
                <span className="cyber-badge" style={{ borderColor: '#ef4444', color: '#ef4444', padding: '2px 8px', fontSize: '9px' }}>DANGER 99%</span>
              </div>
              <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: '1.5', marginBottom: '12px' }}>
                "Guaranteed 25% weekly profit in VIP Telegram group..."
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '3px 8px', borderRadius: '4px' }}>
                  🚩 Unrealistic Returns
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '3px 8px', borderRadius: '4px' }}>
                  🚩 Unregulated Channel
                </span>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <Link to="/onboarding" style={{ textDecoration: 'none' }}>
              <button className="cyber-btn-primary">
                INITIALIZE YOUR ACCOUNT NOW <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            6. FOOTER & COMPLIANCE SEAL
            ========================================================================= */}
        <footer style={{ borderTop: '1px solid rgba(56, 189, 248, 0.2)', paddingTop: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
          </div>

          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
            Built for first-time earners across India. Master cash flow, leverage compounding math, and protect yourself against fraudulent schemes.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 18px',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '6px',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            <Lock size={14} color="#f87171" />
            <span style={{ fontSize: '11px', color: '#fca5a5' }}>
              <strong>COMPLIANCE NOTICE:</strong> Pixel Mentor provides financial literacy and mathematical simulations only, never regulated investment advice.
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
}
