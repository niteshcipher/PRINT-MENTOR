import React, { useState } from 'react';
import PixelButton from '../components/pixel/PixelButton';
import PixelCard from '../components/pixel/PixelCard';
import DialogueBox from '../components/pixel/DialogueBox';
import CoinCounter from '../components/pixel/CoinCounter';
import Modal from '../components/pixel/Modal';
import ProgressBar from '../components/pixel/ProgressBar';
import Tooltip from '../components/pixel/Tooltip';
import Mentor from '../components/pixel/Mentor';
import { Sparkles, Coins, Info, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Styleguide() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogueMood, setDialogueMood] = useState('idle');
  const [coins, setCoins] = useState(250);
  const [dialogueKey, setDialogueKey] = useState(0);

  const colors = [
    { name: 'Deep Obsidian', varName: '--color-dark', hex: '#0c0f17', desc: 'Canvas background' },
    { name: 'Terminal Slate', varName: '--color-card', hex: '#161f30', desc: 'Panels & cards' },
    { name: 'Emerald Pixel', varName: '--color-green', hex: '#10b981', desc: 'Compounding & success' },
    { name: 'Arcade Coin Gold', varName: '--color-gold', hex: '#f59e0b', desc: 'Coins & wealth rewards' },
    { name: 'Cyber Cyan', varName: '--color-cyan', hex: '#06b6d4', desc: 'Projections & data' },
    { name: 'Hazard Red', varName: '--color-red', hex: '#ef4444', desc: 'Scams & risk alerts' }
  ];

  const mentorDialoguePresets = {
    idle: "Greetings player! As your Pixel Mentor, I'm here to level up your compounding armor.",
    happy: "Level up! You resisted panic selling and your harvest grew by +24%!",
    worried: "Caution! That Telegram tip guarantees 30% weekly returns. That's a classic Ponzi red flag!",
    thinking: "Analyzing your monthly food spend... Let me calculate if skipping 2 orders unlocks your laptop goal."
  };

  const handleMoodSelect = (mood) => {
    setDialogueMood(mood);
    setDialogueKey(prev => prev + 1);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '10px auto 30px', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Navigation Back Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px' }}>
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/dashboard/overview');
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            color: '#38bdf8',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00f0ff';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateX(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
            e.currentTarget.style.color = '#38bdf8';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <ArrowLeft size={16} /> BACK
        </button>

        <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-pixel)', letterSpacing: '1px' }}>
          HELP // DESIGN SYSTEM SPECIFICATION
        </span>
      </div>

      {/* Top Header */}
      <div className="pixel-box-green" style={{ padding: '24px', backgroundColor: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="pixel-badge" style={{ color: '#10b981', borderColor: '#10b981', marginBottom: '8px' }}>
              HELP & COMPONENT SPECIFICATION
            </div>
            <h1 className="font-pixel" style={{ fontSize: '18px', color: '#34d399' }}>
              PIXEL MENTOR STYLEGUIDE
            </h1>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>
              Showcasing the 6-colour palette, typography, reusable pixel components, and all 4 mentor mood states.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard/overview')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={14} /> BACK TO DASHBOARD
          </button>
        </div>
      </div>

      {/* 1. The 6-Colour Palette */}
      <section>
        <h2 className="font-pixel" style={{ fontSize: '14px', color: '#fbbf24', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} /> 1. THE 6-COLOUR PALETTE
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
          {colors.map((c) => (
            <div key={c.hex} className="pixel-box" style={{ padding: '14px', backgroundColor: '#131924' }}>
              <div style={{
                height: '48px',
                backgroundColor: c.hex,
                border: '2px solid #000',
                marginBottom: '10px',
                boxShadow: 'inset 2px 2px 0px 0px rgba(255,255,255,0.2)'
              }} />
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>{c.name}</div>
              <div className="font-pixel" style={{ fontSize: '9px', color: c.hex, marginTop: '2px' }}>{c.hex}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Mentor Avatar & 4 Mood States */}
      <section>
        <h2 className="font-pixel" style={{ fontSize: '14px', color: '#38bdf8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🧙 2. MENTOR AVATAR: ALL 4 MOOD STATES (SVG PIXEL ART)
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
          Rendered entirely with inline SVGs (no external images). Click a state to test reactive dialogue!
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { id: 'idle', title: 'Idle (Observing)', desc: 'Calm standard eyes with white glint.' },
            { id: 'happy', title: 'Happy (Delighted)', desc: 'Joyful closed eyes, rosy cheeks, gold stars.' },
            { id: 'worried', title: 'Worried (Concerned)', desc: 'Tilted anxious eyebrows and sweat drop.' },
            { id: 'thinking', title: 'Thinking (Analyzing)', desc: 'Asymmetric brow, shifted eyes & spark.' }
          ].map((m) => (
            <div 
              key={m.id} 
              onClick={() => handleMoodSelect(m.id)}
              className={`pixel-box ${dialogueMood === m.id ? 'pixel-box-green' : ''}`} 
              style={{ 
                padding: '18px', 
                textAlign: 'center', 
                cursor: 'pointer',
                backgroundColor: dialogueMood === m.id ? '#064e3b33' : '#141d2c'
              }}
            >
              <Mentor mood={m.id} size={72} animated={true} showLabel={true} />
              <div className="font-pixel" style={{ fontSize: '10px', color: '#f1f5f9', marginTop: '12px' }}>
                {m.title}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DialogueBox (Typewriter Effect) */}
      <section>
        <h2 className="font-pixel" style={{ fontSize: '14px', color: '#c4b5fd', marginBottom: '14px' }}>
          💬 3. DIALOGUE BOX WITH TYPEWRITER EFFECT
        </h2>
        <DialogueBox 
          key={dialogueKey}
          speaker={`PIXEL MENTOR [${dialogueMood.toUpperCase()}]`}
          mood={dialogueMood}
          text={mentorDialoguePresets[dialogueMood]}
          speed={22}
          actions={
            <>
              <PixelButton size="sm" variant="success" onClick={() => handleMoodSelect('happy')}>
                Trigger Happy Mood
              </PixelButton>
              <PixelButton size="sm" variant="danger" onClick={() => handleMoodSelect('worried')}>
                Trigger Worried Mood
              </PixelButton>
              <PixelButton size="sm" variant="primary" onClick={() => handleMoodSelect('thinking')}>
                Trigger Thinking Mood
              </PixelButton>
            </>
          }
        />
      </section>

      {/* 4. Pixel Buttons & Variants */}
      <section>
        <h2 className="font-pixel" style={{ fontSize: '14px', color: '#10b981', marginBottom: '14px' }}>
          🎮 4. PIXEL BUTTONS (VARIANTS & SIZES)
        </h2>
        <div className="pixel-box" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>Variants:</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <PixelButton variant="primary">Primary (Cyan)</PixelButton>
              <PixelButton variant="success">Success (Green)</PixelButton>
              <PixelButton variant="warning">Warning (Gold)</PixelButton>
              <PixelButton variant="danger">Danger (Red)</PixelButton>
              <PixelButton variant="ghost">Ghost (Neutral)</PixelButton>
              <PixelButton disabled>Disabled</PixelButton>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>Sizes:</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <PixelButton size="sm" variant="success">Small Button</PixelButton>
              <PixelButton size="md" variant="success">Medium Button</PixelButton>
              <PixelButton size="lg" variant="success">Large Action Button</PixelButton>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pixel Cards & Border Variants */}
      <section>
        <h2 className="font-pixel" style={{ fontSize: '14px', color: '#38bdf8', marginBottom: '14px' }}>
          🃏 5. PIXEL CARDS (BORDER & GLOW VARIANTS)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <PixelCard title="DEFAULT SLATE" badge="INFO">
            <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Standard card for dashboards, logs, and menus.</p>
          </PixelCard>

          <PixelCard variant="green" title="EMERALD GLOW" badge="GROWTH" badgeColor="#34d399">
            <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Emphasizes savings rate, SIP compounding, and wins.</p>
          </PixelCard>

          <PixelCard variant="gold" title="ARCADE GOLD" badge="COINS" badgeColor="#fbbf24">
            <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Used for rewards, arcade entries, and balances.</p>
          </PixelCard>

          <PixelCard variant="red" title="HAZARD RED" badge="ALERT" badgeColor="#f87171">
            <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Used for scam detection flags and panic alerts.</p>
          </PixelCard>
        </div>
      </section>

      {/* 6. CoinCounter & Tooltip & ProgressBar & Modal */}
      <section>
        <h2 className="font-pixel" style={{ fontSize: '14px', color: '#fbbf24', marginBottom: '14px' }}>
          🪙 6. COIN COUNTER, PROGRESS BARS, TOOLTIPS & MODAL
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Coin Counters */}
          <div className="pixel-box" style={{ padding: '20px' }}>
            <h3 className="font-pixel" style={{ fontSize: '11px', color: '#fbbf24', marginBottom: '12px' }}>
              COIN COUNTERS
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <CoinCounter amount={coins} size="sm" onClick={() => setCoins(c => c + 10)} />
              <CoinCounter amount={coins} size="md" onClick={() => setCoins(c => c + 25)} />
              <CoinCounter amount={coins} size="lg" onClick={() => setCoins(c => c + 50)} />
            </div>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '10px' }}>Click counter to add bonus coins!</p>
          </div>

          {/* Progress Bars */}
          <div className="pixel-box" style={{ padding: '20px' }}>
            <h3 className="font-pixel" style={{ fontSize: '11px', color: '#10b981', marginBottom: '12px' }}>
              PROGRESS BARS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ProgressBar value={75} variant="green" label="Compounding Goal" />
              <ProgressBar value={45} variant="gold" label="Emergency Buffer" />
              <ProgressBar value={88} variant="red" label="Budget Depletion" />
            </div>
          </div>

          {/* Tooltips & Modal Trigger */}
          <div className="pixel-box" style={{ padding: '20px' }}>
            <h3 className="font-pixel" style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '12px' }}>
              TOOLTIPS & MODALS
            </h3>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Tooltip content="Rupee-Cost Averaging buys more units in down markets!">
                <PixelButton variant="primary" size="sm">
                  Hover for Tooltip (Top)
                </PixelButton>
              </Tooltip>

              <PixelButton variant="warning" size="sm" onClick={() => setModalOpen(true)}>
                Open Pixel Modal
              </PixelButton>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Demo */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title="RETRO MODAL WINDOW"
        variant="gold"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <Mentor mood="happy" size={64} />
          <h4 className="font-pixel" style={{ fontSize: '13px', color: '#fef08a', margin: '14px 0 8px' }}>
            LEVEL COMPLETED!
          </h4>
          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '20px' }}>
            You've explored all components of the Pixel Mentor Design System.
          </p>
          <PixelButton variant="success" onClick={() => setModalOpen(false)}>
            AWESOME, CLOSE MODAL
          </PixelButton>
        </div>
      </Modal>
    </div>
  );
}

