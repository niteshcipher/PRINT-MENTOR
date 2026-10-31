import React, { useState } from 'react';
import PixelAvatar from '../PixelAvatar';
import { Play, RotateCcw, Award, CheckCircle, ShieldAlert, ArrowRight, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function GameShell({
  game,
  gameState, // rules | playing | finished | replay
  coins,
  loading,
  gameResult,
  replayData,
  onStartGame,
  onBackToMenu,
  onViewReplay,
  children
}) {
  const [understoodGate, setUnderstoodGate] = useState(false);

  // STATE 1: RULES BRIEFING SCREEN & "I UNDERSTAND" GATE
  if (gameState === 'rules' && game) {
    const canAfford = coins >= game.entry_cost;

    return (
      <div className="pixel-box" style={{ maxWidth: '680px', margin: '20px auto', padding: '30px', backgroundColor: '#131b28' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="font-pixel" style={{ fontSize: '14px', color: '#34d399' }}>
            {game.name.toUpperCase()} • BRIEFING
          </h3>
          <span className="pixel-badge" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>
            ENTRY: {game.entry_cost} 🪙
          </span>
        </div>

        <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '20px', lineHeight: '1.5' }}>
          {game.tagline}
        </p>

        <div style={{ backgroundColor: '#1c2436', padding: '16px', borderLeft: '4px solid #38bdf8', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '12px', color: '#93c5fd', marginBottom: '10px', textTransform: 'uppercase' }}>Simulation Rules:</h4>
          <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {game.rules?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        {/* "I Understand" Gate */}
        <div style={{ padding: '12px', backgroundColor: '#1f293d', borderRadius: '4px', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '12px', color: '#f1f5f9' }}>
            <input
              type="checkbox"
              checked={understoodGate}
              onChange={(e) => setUnderstoodGate(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
            />
            <span>I understand the simulation mechanics and want to test my financial decisions!</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onBackToMenu} className="pixel-btn" style={{ flex: 1 }}>
            BACK TO ARCADE
          </button>
          <button
            onClick={onStartGame}
            disabled={!understoodGate || loading || !canAfford}
            className="pixel-btn pixel-btn-green"
            style={{ flex: 2, opacity: (!understoodGate || !canAfford) ? 0.5 : 1 }}
          >
            {loading ? "STARTING..." : (!canAfford ? `NEED ${game.entry_cost} COINS (YOU HAVE ${coins})` : `PAY ${game.entry_cost} COINS & ENTER`)}
          </button>
        </div>
      </div>
    );
  }

  // STATE 2: PLAYING SLOT
  if (gameState === 'playing') {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            onClick={onBackToMenu}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ← EXIT GAME & RETURN TO ARCADE
          </button>
          <span className="font-pixel" style={{ fontSize: '9px', color: '#fbbf24' }}>
            {game?.name?.toUpperCase()} • SIMULATION ACTIVE
          </span>
        </div>
        {children}
      </div>
    );
  }

  // STATE 3: RESULT & MISTAKE REPLAY
  if (gameState === 'finished' && gameResult) {
    const replay = gameResult.replay || {};

    return (
      <div className="pixel-box-green" style={{ maxWidth: '780px', margin: '20px auto', padding: '32px', backgroundColor: '#0f1f1a' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="animate-mentor" style={{ display: 'inline-block', marginBottom: '10px' }}>
            <PixelAvatar size={64} mood={gameResult.score >= 60 ? 'happy' : 'worried'} />
          </div>
          <h3 className="font-pixel" style={{ fontSize: '16px', color: '#34d399', marginBottom: '6px' }}>
            MISTAKE REPLAY & DEBRIEF
          </h3>
          <div className="font-pixel" style={{ fontSize: '12px', color: '#fbbf24' }}>
            SCORE: {gameResult.score} / 100 • EARNED +{gameResult.coins_awarded} COINS
          </div>
        </div>

        {/* Decision Comparison Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="pixel-box" style={{ padding: '16px', backgroundColor: '#1a1926', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 600, marginBottom: '6px' }}>
              YOUR DECISION PATH:
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
              {replay.user_result || replay.user_summary}
            </p>
          </div>

          <div className="pixel-box" style={{ padding: '16px', backgroundColor: '#11221b', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600, marginBottom: '6px' }}>
              OPTIMAL STRATEGY PATH:
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
              {replay.optimal_result || replay.optimal_summary}
            </p>
          </div>
        </div>

        {/* Mentor Lesson */}
        <div style={{ padding: '16px', backgroundColor: '#17273d', border: '1px solid #3b82f6', borderRadius: '4px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600, marginBottom: '4px' }}>
            🧙 MENTOR LESSON:
          </div>
          <p style={{ fontSize: '13px', color: '#f8fafc', lineHeight: '1.5' }}>
            "{replay.mentor_lesson}"
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={onViewReplay} className="pixel-btn pixel-btn-gold" style={{ fontSize: '10px', padding: '10px 20px' }}>
            <BarChart2 size={13} /> VIEW COMPARISON CHART
          </button>
          <button onClick={onBackToMenu} className="pixel-btn pixel-btn-green" style={{ fontSize: '10px', padding: '10px 20px' }}>
            RETURN TO ARCADE
          </button>
        </div>
      </div>
    );
  }

  // STATE 4: REPLAY CHART VIEW
  if (gameState === 'replay' && replayData) {
    return (
      <div className="pixel-box" style={{ maxWidth: '820px', margin: '20px auto', padding: '30px', backgroundColor: '#111827' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span className="font-pixel" style={{ fontSize: '14px', color: '#38bdf8' }}>
              MISTAKE REPLAY SIMULATION: {replayData.game_type?.toUpperCase()}
            </span>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Compare your decision trajectory with the optimal strategy curve.
            </p>
          </div>
          <button onClick={onBackToMenu} className="pixel-btn" style={{ fontSize: '9px', padding: '6px 12px' }}>
            BACK TO ARCADE
          </button>
        </div>

        {/* Recharts Chart */}
        <div style={{ width: '100%', height: 260, backgroundColor: '#1a2233', padding: '16px', borderRadius: '4px', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={replayData.comparison_curve || []}>
              <XAxis dataKey="round" stroke="#64748b" tickFormatter={(r) => `Round ${r}`} />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="user_path" name="Your Decisions" stroke="#f87171" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="optimal_path" name="Optimal Strategy" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#1e293b', borderLeft: '4px solid #fbbf24', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600, marginBottom: '4px' }}>
            🎓 STRATEGY GAP BREAKDOWN:
          </div>
          <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
            {replayData.mentor_explanation}
          </p>
        </div>

        <button onClick={onBackToMenu} className="pixel-btn pixel-btn-green" style={{ width: '100%', padding: '12px', fontSize: '11px' }}>
          CHOOSE ANOTHER GAME
        </button>
      </div>
    );
  }

  return null;
}

