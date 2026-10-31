import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { apiRequest } from '../../api/client';
import GameShell from '../games/GameShell';
import PixelAvatar from '../PixelAvatar';
import { 
  Gamepad2, 
  Coins, 
  Play, 
  CheckCircle, 
  RotateCcw, 
  Award, 
  ArrowRight,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Activity,
  Search,
  Zap,
  Sparkles,
  Clock,
  Flame,
  CloudRain,
  Sun,
  Sprout,
  CheckCircle2,
  Layers,
  ChevronRight,
  Info,
  DollarSign,
  Heart,
  Briefcase
} from 'lucide-react';

export default function GamesTab() {
  const { coins, updateCoinsLocally } = useGameStore();
  const [games, setGames] = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [gameState, setGameState] = useState('menu'); // menu | rules | playing | finished | replay
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [replayData, setReplayData] = useState(null);

  // Common Simulation State
  const [currentRound, setCurrentRound] = useState(1);
  const [decisions, setDecisions] = useState([]);

  // ==========================================
  // GAME 1: SIP FARM (10-Season Compounding Simulation)
  // ==========================================
  const [farmHarvest, setFarmHarvest] = useState(0);
  const [farmPlantedCount, setFarmPlantedCount] = useState(0);
  const [farmStreak, setFarmStreak] = useState(0);
  const [farmLog, setFarmLog] = useState([]);

  // ==========================================
  // GAME 2: CRASH SURVIVOR (4-Phase Crisis Timeline)
  // ==========================================
  const [crashPhase, setCrashPhase] = useState(1); // 1: Rumors, 2: Crash, 3: Bear Market, 4: Recovery
  const [crashPortfolio, setCrashPortfolio] = useState(100000);
  const [crashAction, setCrashAction] = useState('hold');
  const [crashPhaseHistory, setCrashPhaseHistory] = useState([]);

  // ==========================================
  // GAME 3: SCAM DETECTIVE (Multi-Stage Forensic Desk)
  // ==========================================
  const [scamTipIndex, setScamTipIndex] = useState(0);
  const [scamScore, setScamScore] = useState(0);
  const [scamStep, setScamStep] = useState('inspect'); // inspect | tools | verdict | debrief
  const [scamToolResults, setScamToolResults] = useState({});
  const [lastScamResult, setLastScamResult] = useState(null);

  // ==========================================
  // GAME 4: BUDGET BAZAAR (4-Week Life Survival Simulator)
  // ==========================================
  const [bazaarWeek, setBazaarWeek] = useState(0);
  const [bazaarDecisions, setBazaarDecisions] = useState([]);
  const [bazaarStats, setBazaarStats] = useState({
    cash: 28000,
    emergency: 15000,
    stress: 20,
    debt: 0
  });
  const [bazaarFeedback, setBazaarFeedback] = useState(null);

  // ==========================================
  // GAME 5: INFLATION ISLAND (4-Era Time Machine)
  // ==========================================
  const [inflationStep, setInflationStep] = useState(0);
  const [inflationStrategy, setInflationStrategy] = useState(null);

  const fetchGames = async () => {
    try {
      const data = await apiRequest('/games');
      setGames(data.games || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleSelectGame = (game) => {
    setActiveGame(game);
    setGameState('rules');
    setGameResult(null);
    setReplayData(null);
  };

  const handleStartGame = async () => {
    if (!activeGame) return;
    if (coins < activeGame.entry_cost) {
      alert(`Insufficient coins! You have ${coins} coins, but this game costs ${activeGame.entry_cost} coins.`);
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/games/start', {
        method: 'POST',
        body: JSON.stringify({ game_id: activeGame.id })
      });

      updateCoinsLocally(-activeGame.entry_cost);
      setSessionId(res.session_id);
      setGameState('playing');
      setCurrentRound(1);
      setDecisions([]);

      // Reset individual simulation states
      setFarmHarvest(0);
      setFarmPlantedCount(0);
      setFarmStreak(0);
      setFarmLog([]);

      setCrashPhase(1);
      setCrashPortfolio(100000);
      setCrashAction('hold');
      setCrashPhaseHistory([]);

      setScamTipIndex(0);
      setScamScore(0);
      setScamStep('inspect');
      setScamToolResults({});
      setLastScamResult(null);

      setBazaarWeek(0);
      setBazaarDecisions([]);
      setBazaarStats({
        cash: 28000,
        emergency: 15000,
        stress: 20,
        debt: 0
      });
      setBazaarFeedback(null);

      setInflationStep(0);
      setInflationStrategy(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const finishGameOnServer = async (finalDecisions) => {
    try {
      setLoading(true);
      const res = await apiRequest('/games/submit', {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          decisions: finalDecisions
        })
      });

      updateCoinsLocally(res.coins_awarded);
      setGameResult(res);
      setGameState('finished');
      fetchGames(); // refresh best scores
    } catch (e) {
      alert("Failed to submit simulation: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReplay = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const data = await apiRequest(`/games/${sessionId}/replay`);
      setReplayData(data);
      setGameState('replay');
    } catch (e) {
      alert("Could not load replay: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SIMULATION 1: SIP FARM LOGIC
  // ==========================================
  const handleFarmSeason = (action) => {
    const updated = [...decisions, { round: currentRound, action }];
    setDecisions(updated);

    const weatherList = ['sunny', 'sunny', 'monsoon', 'storm', 'sunny', 'monsoon', 'golden', 'sunny', 'golden', 'harvest'];
    const weather = weatherList[currentRound - 1] || 'sunny';

    if (action === 'plant') {
      const addedValue = currentRound * 1800;
      setFarmHarvest(prev => prev + addedValue + 3000);
      setFarmPlantedCount(prev => prev + 1);
      setFarmStreak(prev => prev + 1);
      setFarmLog(prev => [...prev, { season: currentRound, action: 'plant', weather, added: addedValue + 3000 }]);
    } else {
      setFarmStreak(0);
      setFarmLog(prev => [...prev, { season: currentRound, action: 'skip', weather, added: 0 }]);
    }

    if (currentRound >= 10) {
      finishGameOnServer(updated);
    } else {
      setCurrentRound(prev => prev + 1);
    }
  };

  // ==========================================
  // SIMULATION 2: CRASH SURVIVOR LOGIC
  // ==========================================
  const handleCrashNextPhase = (actionChosen) => {
    if (crashPhase === 1) {
      // Rumor Phase: markets dip 8%
      setCrashPortfolio(92000);
      setCrashPhaseHistory(prev => [...prev, { phase: 1, action: actionChosen, text: "Checked fundamentals. Nifty dipped -8%." }]);
      setCrashPhase(2);
    } else if (crashPhase === 2) {
      // Black Swan Phase: critical crash choice
      setCrashAction(actionChosen);
      if (actionChosen === 'sell') {
        setCrashPortfolio(68400); // locked loss
        setCrashPhaseHistory(prev => [...prev, { phase: 2, action: 'sell', text: "Sold everything in fear! Salvaged ₹68,400 in cash." }]);
      } else if (actionChosen === 'hold') {
        setCrashPortfolio(70000); // paper drop
        setCrashPhaseHistory(prev => [...prev, { phase: 2, action: 'hold', text: "Stood firm through the -30% collapse. Paper value ₹70,000." }]);
      } else {
        setCrashPortfolio(70000); // buy dip
        setCrashPhaseHistory(prev => [...prev, { phase: 2, action: 'buy', text: "Bought the dip! Deployed cash into premier companies at -30% discount." }]);
      }
      setCrashPhase(3);
    } else if (crashPhase === 3) {
      // Bear Market Winter: 6 months flat
      setCrashPhaseHistory(prev => [...prev, { phase: 3, action: actionChosen, text: "Endured the 6-month winter. Market base formed." }]);
      setCrashPhase(4);
    } else if (crashPhase === 4) {
      // Recovery Phase
      let finalVal = 70000;
      if (crashAction === 'sell') {
        finalVal = 68400; // no recovery
      } else if (crashAction === 'hold') {
        finalVal = 114000; // full recovery
      } else {
        finalVal = 128000; // max recovery alpha
      }
      setCrashPortfolio(finalVal);
      finishGameOnServer([{ round: 1, action: crashAction }]);
    }
  };

  // ==========================================
  // SIMULATION 3: SCAM DETECTIVE FORENSIC DESK
  // ==========================================
  const runForensicTool = (toolName) => {
    const currentTip = activeGame?.tips?.[scamTipIndex];
    if (!currentTip) return;

    if (toolName === 'sebi') {
      setScamToolResults(prev => ({
        ...prev,
        sebi: currentTip.is_scam 
          ? "🚨 REGISTRY SCAN: FAKE / UNREGISTERED. Domain registered recently with masked proxy."
          : "✅ REGISTRY SCAN: VERIFIED SEBI REGISTERED ENTITY. Reg #INP000005423 active."
      }));
    } else if (toolName === 'returns') {
      setScamToolResults(prev => ({
        ...prev,
        returns: currentTip.is_scam 
          ? "⚠️ ROI AUDIT: Promising guaranteed or high short-term returns. Mathematically unsustainable Ponzi flag!"
          : "✅ ROI AUDIT: Realistic market-linked return expectation matching regulatory risk parameters."
      }));
    } else if (toolName === 'urgency') {
      setScamToolResults(prev => ({
        ...prev,
        urgency: currentTip.is_scam 
          ? "⚡ PSYCHOLOGY DETECTOR: Extreme artificial scarcity and emotional coercion detected ('Hurry', 'Last seats')."
          : "✅ PSYCHOLOGY DETECTOR: Standard factual information with clear disclosures."
      }));
    }
  };

  const handleScamVerdict = (isScamVote) => {
    const currentTip = activeGame?.tips?.[scamTipIndex];
    if (!currentTip) return;

    const isCorrect = (isScamVote === currentTip.is_scam);
    const updated = [...decisions, { tip_id: currentTip.id, vote: isScamVote, correct: isCorrect }];
    setDecisions(updated);

    if (isCorrect) setScamScore(prev => prev + 1);

    setLastScamResult({
      isCorrect,
      explanation: currentTip.explanation,
      isScam: currentTip.is_scam
    });
    setScamStep('debrief');
  };

  const handleNextScamCase = () => {
    if (scamTipIndex + 1 >= (activeGame?.tips?.length || 0)) {
      finishGameOnServer(decisions);
    } else {
      setScamTipIndex(prev => prev + 1);
      setScamStep('inspect');
      setScamToolResults({});
      setLastScamResult(null);
    }
  };

  // ==========================================
  // SIMULATION 4: BUDGET BAZAAR LOGIC
  // ==========================================
  const handleBazaarChoice = (choice) => {
    const events = activeGame?.events || [];
    const currentEvent = events[bazaarEventIndex] || {};

    let cashDelta = -3000;
    let emergencyDelta = 0;
    let stressDelta = 5;
    let debtDelta = 0;

    if (choice.id === 'debt') {
      debtDelta = 8000;
      stressDelta = 25;
      cashDelta = 0;
    } else if (choice.id === 'emergency') {
      emergencyDelta = -5000;
      stressDelta = 5;
      cashDelta = 0;
    } else if (choice.id === 'save') {
      cashDelta = 2000;
      stressDelta = -10;
    }

    setBazaarStats(prev => ({
      cash: Math.max(0, prev.cash + cashDelta),
      emergency: Math.max(0, prev.emergency + emergencyDelta),
      stress: Math.min(100, Math.max(0, prev.stress + stressDelta)),
      debt: prev.debt + debtDelta
    }));

    const updated = [
      ...bazaarDecisions,
      {
        week: currentEvent.week || (bazaarWeek + 1),
        is_emergency: currentEvent.is_emergency,
        choice_id: choice.id,
        score: choice.score
      }
    ];
    setBazaarDecisions(updated);

    setBazaarFeedback({
      choiceTitle: choice.label,
      feedback: choice.hint || "Decision recorded in monthly cashflow ledger."
    });

    if (bazaarWeek + 1 >= events.length) {
      setTimeout(() => {
        finishGameOnServer(updated);
      }, 1500);
    } else {
      setTimeout(() => {
        setBazaarWeek(prev => prev + 1);
        setBazaarFeedback(null);
      }, 1200);
    }
  };

  // ==========================================
  // SIMULATION 5: INFLATION ISLAND LOGIC
  // ==========================================
  const handleSelectInflationStrategy = (strategy) => {
    setInflationStrategy(strategy);
    setInflationStep(1);
  };

  const handleInflationNext = () => {
    const timeline = activeGame?.timeline || [];
    if (inflationStep + 1 >= timeline.length) {
      finishGameOnServer([{ strategy: inflationStrategy, completed: true }]);
    } else {
      setInflationStep(prev => prev + 1);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ARCADE HEADER */}
      <div className="pixel-box-gold" style={{ padding: '20px 24px', backgroundColor: '#16140d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="pixel-badge" style={{ color: '#fbbf24', borderColor: '#fbbf24', marginBottom: '6px' }}>
              INTERACTIVE SIMULATION ARENA
            </div>
            <h2 className="font-pixel" style={{ fontSize: '16px', color: '#fef08a' }}>
              PIXEL FINANCIAL SIMULATOR
            </h2>
            <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
              Realistic multi-stage scenarios: weather economic storms, cultivate compounding farms, and unmask scammers in forensic investigation desks.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', backgroundColor: '#261b07', border: '1px solid #78350f', borderRadius: '8px' }}>
            <Coins size={18} color="#f59e0b" />
            <span style={{ fontSize: '11px', color: '#fde68a' }}>Your Balance: </span>
            <span className="font-pixel" style={{ fontSize: '14px', color: '#fbbf24' }}>{coins} Coins</span>
          </div>
        </div>
      </div>

      {/* STATE 1: MENU LISTING */}
      {gameState === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {games.map((g) => {
            const isAffordable = coins >= g.entry_cost;
            return (
              <div 
                key={g.id} 
                className="pixel-box" 
                style={{ 
                  padding: '22px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  backgroundColor: '#121826',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="font-pixel" style={{ fontSize: '13px', color: '#38bdf8' }}>{g.name}</span>
                    <span className="pixel-badge" style={{ color: isAffordable ? '#fbbf24' : '#ef4444', borderColor: isAffordable ? '#fbbf24' : '#ef4444' }}>
                      {g.entry_cost} 🪙
                    </span>
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#f1f5f9', fontWeight: 600, marginBottom: '8px' }}>{g.tagline}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '16px' }}>{g.learning_goal || g.rules?.[0]}</p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px', color: '#64748b' }}>
                    <span>Best Score: <strong style={{ color: '#f8fafc' }}>{g.best_score !== null && g.best_score !== undefined ? `${g.best_score}/100` : 'Not played'}</strong></span>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>Prize: +{g.reward_coins} 🪙</span>
                  </div>

                  <button
                    onClick={() => handleSelectGame(g)}
                    disabled={!isAffordable}
                    className="pixel-btn pixel-btn-green"
                    style={{ width: '100%', fontSize: '10px', padding: '12px', opacity: isAffordable ? 1 : 0.6 }}
                  >
                    {isAffordable ? <><Play size={12} /> ENTER SIMULATION</> : <><Lock size={12} /> NEED {g.entry_cost} COINS</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STATE 2: ACTIVE MULTI-STAGE SIMULATION ARENA */}
      {gameState !== 'menu' && (
        <GameShell
          game={activeGame}
          gameState={gameState}
          coins={coins}
          loading={loading}
          gameResult={gameResult}
          replayData={replayData}
          onStartGame={handleStartGame}
          onBackToMenu={() => setGameState('menu')}
          onViewReplay={handleViewReplay}
        >
          <div className="pixel-box" style={{ maxWidth: '880px', margin: '16px auto', padding: '28px', backgroundColor: '#0f1524' }}>
            
            {/* SIMULATION 1: SIP FARM (10 Seasons Compounding Simulator) */}
            {activeGame?.id === 'sip_farm' && (
              <div>
                {/* Header HUD */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '14px' }}>
                  <div>
                    <span className="font-pixel" style={{ fontSize: '13px', color: '#34d399' }}>🌾 COMPOUNDING SEASONS // DISCIPLINE SIM</span>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Epoch {currentRound <= 3 ? "1: Sowing & Roots" : (currentRound <= 7 ? "2: Bear Market Monsoons" : "3: Exponential Harvest")}
                    </div>
                  </div>
                  <div className="font-pixel" style={{ fontSize: '11px', color: '#fbbf24', background: '#1c190f', padding: '6px 12px', borderRadius: '4px', border: '1px solid #78350f' }}>
                    SEASON {currentRound} / 10
                  </div>
                </div>

                {/* Simulation Metrics HUD */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>TOTAL SOWN (INVESTED):</div>
                    <div className="font-pixel" style={{ fontSize: '14px', color: '#f8fafc', marginTop: '4px' }}>
                      ₹{(farmPlantedCount * 3000).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#6ee7b7' }}>COMPOUNDED HARVEST:</div>
                    <div className="font-pixel" style={{ fontSize: '14px', color: '#34d399', marginTop: '4px' }}>
                      ₹{farmHarvest.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#fde68a' }}>DISCIPLINE STREAK:</div>
                    <div className="font-pixel" style={{ fontSize: '14px', color: '#fbbf24', marginTop: '4px' }}>
                      {farmStreak} SEASONS 🔥
                    </div>
                  </div>
                </div>

                {/* 10-Plot Visual Compounding Farm */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>PLOT STATUS ACROSS 10 SEASONS:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const seasonNum = idx + 1;
                      const isPast = seasonNum < currentRound;
                      const isCurrent = seasonNum === currentRound;
                      const decision = decisions.find(d => d.round === seasonNum);
                      const planted = decision?.action === 'plant';

                      return (
                        <div 
                          key={idx}
                          style={{
                            padding: '14px 8px',
                            textAlign: 'center',
                            borderRadius: '6px',
                            background: isCurrent ? 'rgba(56, 189, 248, 0.15)' : (isPast ? (planted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)') : 'rgba(30, 41, 59, 0.4)'),
                            border: `1px solid ${isCurrent ? '#38bdf8' : (isPast ? (planted ? '#10b981' : '#ef4444') : 'rgba(255, 255, 255, 0.08)')}`
                          }}
                        >
                          <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                            {isPast ? (planted ? (seasonNum >= 8 ? '🌟🌳' : '🌿') : '🍂') : (isCurrent ? '🌱' : '🕳️')}
                          </div>
                          <div className="font-pixel" style={{ fontSize: '8px', color: isCurrent ? '#38bdf8' : '#94a3b8' }}>
                            Y{seasonNum}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Season Scenario Prompt */}
                <div style={{ background: '#161e2e', padding: '18px 20px', borderRadius: '8px', borderLeft: '4px solid #34d399', marginBottom: '24px' }}>
                  <h4 className="font-pixel" style={{ fontSize: '12px', color: '#34d399', marginBottom: '6px' }}>
                    SEASON {currentRound} SCENARIO:
                  </h4>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {currentRound <= 3 && "Early roots season! Markets are tranquil. Modest seeds sown today form the root system for 10-year exponential compounding."}
                    {currentRound > 3 && currentRound <= 7 && "Bear market monsoon! Market prices dipped 15%. Seeds are effectively on discount — rupee cost averaging lets you buy more units per rupee."}
                    {currentRound > 7 && "The Compounding Flywheel! The annual return on your accumulated harvest is now generating more income than your yearly deposits!"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleFarmSeason('plant')} 
                    className="pixel-btn pixel-btn-green" 
                    style={{ flex: 1, padding: '14px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Sprout size={16} /> PLANT MONTHLY SEED (₹3,000)
                  </button>
                  <button 
                    onClick={() => handleFarmSeason('skip')} 
                    className="pixel-btn pixel-btn-danger" 
                    style={{ flex: 1, padding: '14px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    💤 SKIP THIS SEASON (BREAK DISCIPLINE)
                  </button>
                </div>
              </div>
            )}

            {/* SIMULATION 2: CRASH SURVIVOR (4-Phase Crisis Timeline) */}
            {activeGame?.id === 'crash_survivor' && (
              <div>
                {/* Timeline Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '14px' }}>
                  <div>
                    <span className="font-pixel" style={{ fontSize: '13px', color: '#f87171' }}>MARKET FLASH CRASH // 4-PHASE SIMULATION</span>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Testing psychological resilience through an economic panic cycle
                    </div>
                  </div>
                  <div className="font-pixel" style={{ fontSize: '11px', color: '#f87171', background: '#2e1215', padding: '6px 12px', borderRadius: '4px', border: '1px solid #7f1d1d' }}>
                    PHASE {crashPhase} OF 4
                  </div>
                </div>

                {/* Portfolio Status Ticker */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#fca5a5' }}>PORTFOLIO VALUATION:</div>
                    <div className="font-pixel" style={{ fontSize: '16px', color: crashPortfolio >= 100000 ? '#34d399' : '#f87171', marginTop: '4px' }}>
                      ₹{crashPortfolio.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>FEAR & GREED INDEX:</div>
                    <div className="font-pixel" style={{ fontSize: '14px', color: crashPhase === 2 ? '#ef4444' : '#fbbf24', marginTop: '4px' }}>
                      {crashPhase === 1 ? "NEUTRAL (52/100)" : (crashPhase === 2 ? "EXTREME FEAR (9/100) ⚡" : (crashPhase === 3 ? "DESPAIR (14/100)" : "RECOVERY (78/100) 🚀"))}
                    </div>
                  </div>
                </div>

                {/* PHASE 1: WARNING SIGNS */}
                {crashPhase === 1 && (
                  <div>
                    <div className="pixel-box" style={{ padding: '20px', backgroundColor: '#1c2130', marginBottom: '20px' }}>
                      <div className="pixel-badge" style={{ color: '#fbbf24', borderColor: '#fbbf24', marginBottom: '8px' }}>
                        DAY 0 • EARLY TREMORS
                      </div>
                      <h3 className="font-pixel" style={{ fontSize: '13px', color: '#fef08a', marginBottom: '8px' }}>
                        GLOBAL HEADWINDS: INFLATION SPIKES & YIELD CURVE INVERTS
                      </h3>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                        Headlines predict an impending rate hike. SENSEX slips -8% from all-time highs. Your initial ₹1,00,000 dips to ₹92,000. Your co-workers are starting to get nervous.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button 
                        onClick={() => handleCrashNextPhase('hold')}
                        className="pixel-btn"
                        style={{ textAlign: 'left', padding: '14px', fontSize: '11px', backgroundColor: '#172338' }}
                      >
                        <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>
                          🛡️ AUDIT PORTFOLIO & MAINTAIN LONG-TERM DISCIPLINE
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          Verify company fundamentals and keep existing monthly investment plans running.
                        </div>
                      </button>
                      <button 
                        onClick={() => handleCrashNextPhase('sell')}
                        className="pixel-btn"
                        style={{ textAlign: 'left', padding: '14px', fontSize: '11px', backgroundColor: '#211a20' }}
                      >
                        <div style={{ fontWeight: 600, color: '#fca5a5', marginBottom: '2px' }}>
                          ⚡ SPECULATE & ATTEMPT TO TIME THE MARKET
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          Try pulling out to re-enter at the absolute bottom.
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* PHASE 2: BLACK SWAN FLASH CRASH */}
                {crashPhase === 2 && (
                  <div>
                    <div className="pixel-box" style={{ padding: '20px', backgroundColor: '#2c1417', borderLeft: '4px solid #ef4444', marginBottom: '20px' }}>
                      <div className="pixel-badge" style={{ color: '#ef4444', borderColor: '#ef4444', marginBottom: '8px' }}>
                        DAY 14 • BLACK SWAN EMERGENCY
                      </div>
                      <h3 className="font-pixel" style={{ fontSize: '13px', color: '#f87171', marginBottom: '8px' }}>
                        CIRCUIT BREAKER HIT: MARKETS COLLAPSE -30%!
                      </h3>
                      <p style={{ fontSize: '13px', color: '#fecaca', lineHeight: '1.5' }}>
                        Panic grips Dalal Street. Media channels stream flashing red sirens: "WORST SELLOFF IN A DECADE". Your portfolio has plunged to ₹70,000. Friends text you telling you to dump everything before it goes to zero.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button 
                        onClick={() => handleCrashNextPhase('sell')}
                        className="pixel-btn pixel-btn-danger"
                        style={{ textAlign: 'left', padding: '14px', fontSize: '11px' }}
                      >
                        <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '2px' }}>
                          😱 PANIC SELL EVERYTHING (LOCK IN ₹70,000 CASH)
                        </div>
                        <div style={{ fontSize: '10px', color: '#fecaca' }}>
                          Converts temporary paper drop into a permanent 30% financial loss.
                        </div>
                      </button>
                      <button 
                        onClick={() => handleCrashNextPhase('hold')}
                        className="pixel-btn"
                        style={{ textAlign: 'left', padding: '14px', fontSize: '11px', backgroundColor: '#17273d' }}
                      >
                        <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '2px' }}>
                          🛡️ DIAMOND HANDS: HOLD FIRM (STICK TO 10-YEAR HORIZON)
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          Refuse to panic-sell quality productive enterprises during emotional turmoil.
                        </div>
                      </button>
                      <button 
                        onClick={() => handleCrashNextPhase('buy')}
                        className="pixel-btn pixel-btn-green"
                        style={{ textAlign: 'left', padding: '14px', fontSize: '11px' }}
                      >
                        <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '2px' }}>
                          💎 BUY THE DIP (TREAT THE CRASH AS A 30% FESTIVAL SALE!)
                        </div>
                        <div style={{ fontSize: '10px', color: '#d1fae5' }}>
                          Be greedy when others are fearful. Acquire premier assets at depressed valuations.
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* PHASE 3: THE COLD BEAR MARKET WINTER */}
                {crashPhase === 3 && (
                  <div>
                    <div className="pixel-box" style={{ padding: '20px', backgroundColor: '#182030', marginBottom: '20px' }}>
                      <div className="pixel-badge" style={{ color: '#38bdf8', borderColor: '#38bdf8', marginBottom: '8px' }}>
                        MONTH 6 • THE SIDEWAYS GRIND
                      </div>
                      <h3 className="font-pixel" style={{ fontSize: '13px', color: '#93c5fd', marginBottom: '8px' }}>
                        APATHY & SILENCE: THE MARKET GOES SIDEWAYS
                      </h3>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                        Six months have passed. Volume has dried up. People stop talking about stocks. This is the boredom phase where 70% of retail investors quit and stop investing.
                      </p>
                    </div>

                    <button 
                      onClick={() => handleCrashNextPhase('continue')}
                      className="pixel-btn pixel-btn-green"
                      style={{ width: '100%', padding: '14px', fontSize: '11px' }}
                    >
                      FAST-FORWARD TO ECONOMIC RECOVERY SURGE ⏩
                    </button>
                  </div>
                )}

                {/* PHASE 4: THE HISTORIC RECOVERY */}
                {crashPhase === 4 && (
                  <div>
                    <div className="pixel-box" style={{ padding: '20px', backgroundColor: '#10281c', borderLeft: '4px solid #10b981', marginBottom: '20px' }}>
                      <div className="pixel-badge" style={{ color: '#34d399', borderColor: '#34d399', marginBottom: '8px' }}>
                        MONTH 18 • THE PHOENIX REBOUND
                      </div>
                      <h3 className="font-pixel" style={{ fontSize: '13px', color: '#34d399', marginBottom: '8px' }}>
                        CORPORATE PROFITS SURGE: MARKETS RALLY +42% TO NEW HIGHS!
                      </h3>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                        Central banks stimulated growth, consumer spending bounced back, and businesses innovated. Those who stayed invested or bought discounts are rewarded with compounding wealth.
                      </p>
                    </div>

                    <button 
                      onClick={() => handleCrashNextPhase('finalize')}
                      className="pixel-btn pixel-btn-gold"
                      style={{ width: '100%', padding: '14px', fontSize: '11px' }}
                    >
                      SUBMIT DECISIONS & VIEW COMPREHENSIVE DEBRIEF
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SIMULATION 3: SCAM DETECTIVE (Forensic Cyber Crime Desk) */}
            {activeGame?.id === 'scam_detective' && activeGame.tips && (
              <div>
                {/* Header Track */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '14px' }}>
                  <div>
                    <span className="font-pixel" style={{ fontSize: '13px', color: '#38bdf8' }}>FORENSIC DESK // ZERO-TRUST AUDITOR</span>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Case {scamTipIndex + 1} of {activeGame.tips.length} • Intercepted communications
                    </div>
                  </div>
                  <div className="font-pixel" style={{ fontSize: '11px', color: '#fbbf24', background: '#1c190f', padding: '6px 12px', borderRadius: '4px', border: '1px solid #78350f' }}>
                    SCORE: {scamScore} / {activeGame.tips.length}
                  </div>
                </div>

                {/* The Intercepted Dossier Card */}
                <div className="pixel-box" style={{ padding: '22px', backgroundColor: '#131b2c', marginBottom: '20px', borderLeft: '4px solid #38bdf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>INCOMING ENCRYPTED TELEGRAM / WHATSAPP TRANSMISSION:</span>
                    <span className="pixel-badge" style={{ color: '#38bdf8', borderColor: '#38bdf8', fontSize: '8px' }}>CASE #{scamTipIndex + 1}</span>
                  </div>
                  <p style={{ fontSize: '14.5px', color: '#f8fafc', lineHeight: '1.6', fontWeight: 500, margin: '8px 0' }}>
                    "{activeGame.tips[scamTipIndex].text}"
                  </p>
                </div>

                {/* Forensic Tool Scanners */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>RUN FORENSIC TOOLKIT CHECKS:</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <button 
                      onClick={() => runForensicTool('sebi')}
                      className="pixel-btn"
                      style={{ fontSize: '10px', padding: '8px 12px', backgroundColor: scamToolResults.sebi ? '#1e293b' : '#0f172a' }}
                    >
                      🔍 RUN SEBI REGISTRY SCAN
                    </button>
                    <button 
                      onClick={() => runForensicTool('returns')}
                      className="pixel-btn"
                      style={{ fontSize: '10px', padding: '8px 12px', backgroundColor: scamToolResults.returns ? '#1e293b' : '#0f172a' }}
                    >
                      📊 AUDIT PROMISED ROI %
                    </button>
                    <button 
                      onClick={() => runForensicTool('urgency')}
                      className="pixel-btn"
                      style={{ fontSize: '10px', padding: '8px 12px', backgroundColor: scamToolResults.urgency ? '#1e293b' : '#0f172a' }}
                    >
                      ⚡ SCAN URGENCY COERCION
                    </button>
                  </div>

                  {/* Tool Output Log */}
                  {Object.keys(scamToolResults).length > 0 && (
                    <div style={{ background: '#0a0e18', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(scamToolResults).map(([k, val]) => (
                        <div key={k} style={{ fontSize: '11px', color: val.includes('🚨') || val.includes('⚠️') ? '#fca5a5' : '#86efac' }}>
                          {val}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verdict Actions or Post-Verdict Debrief */}
                {scamStep !== 'debrief' ? (
                  <div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '10px', fontWeight: 600 }}>ISSUE OFFICIAL VERDICT:</div>
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <button 
                        onClick={() => handleScamVerdict(false)} 
                        className="pixel-btn pixel-btn-green" 
                        style={{ flex: 1, padding: '14px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <ShieldCheck size={16} /> VERIFIED LEGITIMATE FINANCIAL INSTRUMENT
                      </button>
                      <button 
                        onClick={() => handleScamVerdict(true)} 
                        className="pixel-btn pixel-btn-danger" 
                        style={{ flex: 1, padding: '14px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <AlertTriangle size={16} /> 🚨 SCAM / COERCION / FRAUDULENT SCHEME
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: lastScamResult?.isCorrect ? '#0f291e' : '#2e1215', padding: '18px', borderRadius: '8px', border: `1px solid ${lastScamResult?.isCorrect ? '#10b981' : '#ef4444'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {lastScamResult?.isCorrect ? <CheckCircle size={18} color="#34d399" /> : <AlertTriangle size={18} color="#ef4444" />}
                      <span className="font-pixel" style={{ fontSize: '12px', color: lastScamResult?.isCorrect ? '#34d399' : '#f87171' }}>
                        {lastScamResult?.isCorrect ? "VERDICT ACCURATE! +1 FORENSIC POINT" : "VERDICT FLAWED: FORENSIC MISJUDGMENT"}
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#f1f5f9', lineHeight: '1.5', marginBottom: '16px' }}>
                      {lastScamResult?.explanation}
                    </p>
                    <button 
                      onClick={handleNextScamCase} 
                      className="pixel-btn pixel-btn-gold" 
                      style={{ width: '100%', padding: '12px', fontSize: '10px' }}
                    >
                      {scamTipIndex + 1 >= activeGame.tips.length ? "COMPLETE DOSSIER & VIEW REPLAY" : "INSPECT NEXT SUSPECT CASE ➔"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SIMULATION 4: BUDGET BAZAAR (4-Week Life Survival Simulator) */}
            {activeGame?.id === 'budget_bazaar' && activeGame.events && (
              <div>
                {/* Header Track */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '14px' }}>
                  <div>
                    <span className="font-pixel" style={{ fontSize: '13px', color: '#38bdf8' }}>MONTHLY FINANCIAL SURVIVAL SIMULATOR</span>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Navigate 4 weeks of cashflow, temptations, and emergencies
                    </div>
                  </div>
                  <div className="font-pixel" style={{ fontSize: '11px', color: '#fbbf24', background: '#1c190f', padding: '6px 12px', borderRadius: '4px', border: '1px solid #78350f' }}>
                    WEEK {bazaarWeek + 1} OF {activeGame.events.length}
                  </div>
                </div>

                {/* Life Status HUD */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '22px' }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>💵 CASH IN HAND:</div>
                    <div className="font-pixel" style={{ fontSize: '13px', color: '#38bdf8', marginTop: '2px' }}>
                      ₹{bazaarStats.cash.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '9px', color: '#6ee7b7' }}>🛡️ EMERGENCY SHIELD:</div>
                    <div className="font-pixel" style={{ fontSize: '13px', color: '#34d399', marginTop: '2px' }}>
                      ₹{bazaarStats.emergency.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '9px', color: '#fca5a5' }}>💳 CREDIT DEBT:</div>
                    <div className="font-pixel" style={{ fontSize: '13px', color: bazaarStats.debt > 0 ? '#ef4444' : '#94a3b8', marginTop: '2px' }}>
                      ₹{bazaarStats.debt.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Active Event Card */}
                {(() => {
                  const ev = activeGame.events[bazaarWeek] || activeGame.events[0];
                  return (
                    <div>
                      <div className="pixel-box" style={{ padding: '20px', backgroundColor: '#182030', borderLeft: `4px solid ${ev.is_emergency ? '#ef4444' : '#fbbf24'}`, marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span className="pixel-badge" style={{ color: ev.is_emergency ? '#ef4444' : '#fbbf24', borderColor: ev.is_emergency ? '#ef4444' : '#fbbf24' }}>
                            {ev.is_emergency ? '🚨 CRITICAL EMERGENCY' : '✨ LIFESTYLE OPPORTUNITY'}
                          </span>
                        </div>
                        <h4 className="font-pixel" style={{ fontSize: '13px', color: '#fef08a', marginBottom: '8px' }}>
                          {ev.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                          {ev.description}
                        </p>
                      </div>

                      {/* Event Feedback Toast */}
                      {bazaarFeedback && (
                        <div style={{ padding: '10px 16px', background: '#0f291e', border: '1px solid #10b981', borderRadius: '6px', marginBottom: '16px', fontSize: '12px', color: '#6ee7b7' }}>
                          ✓ {bazaarFeedback.feedback}
                        </div>
                      )}

                      {/* Choices */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {ev.choices.map((choice) => (
                          <button
                            key={choice.id}
                            onClick={() => handleBazaarChoice(choice)}
                            className="pixel-btn"
                            style={{ textAlign: 'left', padding: '14px', fontSize: '11px', backgroundColor: choice.id === 'debt' ? '#2e1215' : '#1a2538' }}
                          >
                            <div style={{ fontWeight: 600, color: choice.id === 'debt' ? '#fca5a5' : '#f8fafc', marginBottom: '4px' }}>
                              {choice.label}
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{choice.hint}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SIMULATION 5: INFLATION ISLAND (4-Era Time Machine) */}
            {activeGame?.id === 'inflation_island' && activeGame.timeline && (
              <div>
                {/* Header Track */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '14px' }}>
                  <div>
                    <span className="font-pixel" style={{ fontSize: '13px', color: '#38bdf8' }}>INFLATION ISLAND // 15-YEAR TIME CAPSULE</span>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Testing how different asset classes preserve purchasing power over 15 years
                    </div>
                  </div>
                  <div className="font-pixel" style={{ fontSize: '11px', color: '#fbbf24', background: '#1c190f', padding: '6px 12px', borderRadius: '4px', border: '1px solid #78350f' }}>
                    ERA {inflationStep + 1} OF {activeGame.timeline.length}
                  </div>
                </div>

                {inflationStep === 0 ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '42px', marginBottom: '12px' }}>🏝️⏳💰</div>
                    <h3 className="font-pixel" style={{ fontSize: '14px', color: '#38bdf8', marginBottom: '8px' }}>
                      YEAR 2010: YOU INHERIT ₹1,00,000 SEED CAPITAL
                    </h3>
                    <p style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '520px', margin: '0 auto 24px', lineHeight: '1.5' }}>
                      Choose your wealth preservation strategy for the next 15 years before the inflation storm begins:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                      <div className="pixel-box" style={{ padding: '16px', backgroundColor: '#182030' }}>
                        <div className="font-pixel" style={{ fontSize: '11px', color: '#fbbf24', marginBottom: '6px' }}>CASH UNDER MATTRESS</div>
                        <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '12px' }}>Paper money kept in physical locker. Zero nominal volatility, 100% inflation exposure.</p>
                        <button onClick={() => handleSelectInflationStrategy('cash')} className="pixel-btn pixel-btn-danger" style={{ width: '100%', fontSize: '9px' }}>
                          HOLD 100% CASH
                        </button>
                      </div>
                      <div className="pixel-box" style={{ padding: '16px', backgroundColor: '#182030' }}>
                        <div className="font-pixel" style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '6px' }}>BALANCED 50 / 50</div>
                        <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '12px' }}>Half in bank fixed deposit, half in diversified equities.</p>
                        <button onClick={() => handleSelectInflationStrategy('balanced')} className="pixel-btn" style={{ width: '100%', fontSize: '9px' }}>
                          BALANCED ALLOCATION
                        </button>
                      </div>
                      <div className="pixel-box" style={{ padding: '16px', backgroundColor: '#182030' }}>
                        <div className="font-pixel" style={{ fontSize: '11px', color: '#34d399', marginBottom: '6px' }}>NIFTY 50 INDEX FUND</div>
                        <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '12px' }}>100% invested in top 50 revenue-generating enterprises of India.</p>
                        <button onClick={() => handleSelectInflationStrategy('index')} className="pixel-btn pixel-btn-green" style={{ width: '100%', fontSize: '9px' }}>
                          EQUITY INDEX FUND
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {(() => {
                      const stepData = activeGame.timeline[inflationStep] || activeGame.timeline[0];
                      return (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span className="font-pixel" style={{ fontSize: '13px', color: '#38bdf8' }}>{stepData.milestone.toUpperCase()}</span>
                            <span className="pixel-badge" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>
                              SELECTED: {inflationStrategy ? inflationStrategy.toUpperCase() : 'CASH'}
                            </span>
                          </div>

                          {/* Era Inflation Impact Metrics */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                            <div className="pixel-box" style={{ padding: '16px', backgroundColor: '#211618', borderLeft: '4px solid #ef4444' }}>
                              <div style={{ fontSize: '10px', color: '#fca5a5' }}>CASH PURCHASING POWER:</div>
                              <div className="font-pixel" style={{ fontSize: '16px', color: '#f87171', margin: '4px 0' }}>
                                ₹{stepData.cash_purchasing_power.toLocaleString('en-IN')}
                              </div>
                              <div style={{ fontSize: '10px', color: '#fca5a5' }}>Can buy {Math.round(stepData.cash_purchasing_power / 25000)} grocery carts</div>
                            </div>
                            <div className="pixel-box" style={{ padding: '16px', backgroundColor: '#11221b', borderLeft: '4px solid #10b981' }}>
                              <div style={{ fontSize: '10px', color: '#6ee7b7' }}>EQUITY PORTFOLIO VALUE:</div>
                              <div className="font-pixel" style={{ fontSize: '16px', color: '#34d399', margin: '4px 0' }}>
                                ₹{stepData.index_value.toLocaleString('en-IN')}
                              </div>
                              <div style={{ fontSize: '10px', color: '#6ee7b7' }}>Can buy {Math.round(stepData.index_value / 25000)} grocery carts 🛒</div>
                            </div>
                          </div>

                          <button onClick={handleInflationNext} className="pixel-btn pixel-btn-green" style={{ width: '100%', padding: '14px', fontSize: '11px' }}>
                            {inflationStep + 1 >= activeGame.timeline.length ? "COMPLETE SIMULATION & VIEW 15-YEAR DEBRIEF" : "FAST-FORWARD 5 YEARS ⏩"}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* SIMULATION 6: DUMMY TEST */}
            {activeGame?.id === 'dummy_test' && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>🧪⚙️🎮</div>
                <h3 className="font-pixel" style={{ fontSize: '14px', color: '#38bdf8', marginBottom: '10px' }}>
                  FRAMEWORK LOOP VERIFICATION
                </h3>
                <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '20px' }}>
                  Execute one test action to verify the complete entry, execution, and score loop.
                </p>
                <button 
                  onClick={() => finishGameOnServer([{ step: 1, action: "execute_dummy_loop" }])} 
                  className="pixel-btn pixel-btn-green" 
                  style={{ fontSize: '11px', padding: '12px 24px' }}
                >
                  EXECUTE TEST ACTION
                </button>
              </div>
            )}

          </div>
        </GameShell>
      )}
    </div>
  );
}
