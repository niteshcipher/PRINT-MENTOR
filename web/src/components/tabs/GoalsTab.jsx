import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { apiRequest } from '../../api/client';
import PixelButton from '../pixel/PixelButton';
import PixelCard from '../pixel/PixelCard';
import ProgressBar from '../pixel/ProgressBar';
import DialogueBox from '../pixel/DialogueBox';
import Modal from '../pixel/Modal';
import LoadingState from '../common/LoadingState';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend, 
  CartesianGrid,
  ReferenceLine 
} from 'recharts';
import { 
  FastForward, 
  Target, 
  Sparkles, 
  Calendar, 
  PlusCircle, 
  CheckCircle2, 
  Coffee, 
  Utensils, 
  Smartphone,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Zap
} from 'lucide-react';

export default function GoalsTab() {
  const { user } = useGameStore();
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New Goal Form
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(50000);
  const [newGoalDate, setNewGoalDate] = useState('2027-12-31');

  // Sliders for What If Time Machine
  const [baseMonthly, setBaseMonthly] = useState(3000);
  const [durationYears, setDurationYears] = useState(5);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);

  // Lifestyle Tweaks (Orders/week, Lunches/week, Plan saves)
  const [deliverySkips, setDeliverySkips] = useState(2); // ~₹200/order * 4 = ₹1600/mo
  const [lunchPacks, setLunchPacks] = useState(2);     // ~₹150/day * 4 = ₹1200/mo
  const [cheaperPlan, setCheaperPlan] = useState(1);    // ₹300/mo

  // Simulation output
  const [simData, setSimData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch Goals
  const loadGoals = async () => {
    try {
      setLoadingGoals(true);
      const data = await apiRequest('/goals');
      setGoals(data || []);
      if (data && data.length > 0 && !selectedGoal) {
        setSelectedGoal(data[0]);
      }
    } catch (e) {
      console.warn("Goals load failed", e);
    } finally {
      setLoadingGoals(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // Compute total lifestyle savings
  const deliverySavings = deliverySkips * 200 * 4; // ₹200 per order
  const lunchSavings = lunchPacks * 150 * 4;       // ₹150 per meal
  const planSavings = cheaperPlan * 300;           // ₹300 plan cut
  const totalLifestyleExtra = deliverySavings + lunchSavings + planSavings;
  const effectiveMonthly = baseMonthly + totalLifestyleExtra;

  const currentGoalAmount = selectedGoal ? selectedGoal.target_amount : 55000;

  // Run What If simulation (debounced ~150ms)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSimulating(true);
      try {
        const res = await apiRequest('/sim/whatif', {
          method: 'POST',
          body: JSON.stringify({
            monthly: effectiveMonthly,
            years: Number(durationYears),
            annual_rate: Number(annualReturn),
            inflation_rate: Number(inflationRate),
            goal_amount: Number(currentGoalAmount),
            lump_sum: selectedGoal?.current_amount || 0.0
          })
        });
        setSimData(res);
      } catch (err) {
        console.warn("Simulation failed", err);
      } finally {
        setIsSimulating(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [effectiveMonthly, durationYears, annualReturn, inflationRate, currentGoalAmount, selectedGoal]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;

    try {
      const res = await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify({
          name: newGoalName,
          target_amount: Number(newGoalTarget),
          current_amount: 0.0,
          target_date: newGoalDate
        })
      });
      setGoals(prev => [...prev, res]);
      setSelectedGoal(res);
      setModalOpen(false);
      setNewGoalName('');
    } catch (err) {
      alert("Failed to create goal: " + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. TOP HEADER BANNER */}
      <div className="pixel-box-green" style={{ padding: '20px 24px', backgroundColor: '#0c221a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div className="pixel-badge" style={{ color: '#10b981', borderColor: '#10b981', marginBottom: '6px' }}>
              TIME MACHINE ENGINE • DEBOUNCED LIVE SIMULATION
            </div>
            <h2 className="font-pixel" style={{ fontSize: '15px', color: '#f8fafc' }}>
              GOALS TRACKER & WHAT IF TIME MACHINE
            </h2>
            <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
              Select a goal to simulate. Tweak your regular savings and lifestyle habits to watch your compounding curve accelerate live!
            </p>
          </div>

          <PixelButton variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <PlusCircle size={14} /> NEW CUSTOM GOAL
          </PixelButton>
        </div>
      </div>

      {/* 2. GOAL CARDS STRIP */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 className="font-pixel" style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={16} /> YOUR FINANCIAL GOALS ({goals.length})
          </h3>
          
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {goals.map((g) => {
            const isSelected = selectedGoal?.id === g.id;
            const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));

            return (
              <div
                key={g.id}
                onClick={() => setSelectedGoal(g)}
                className={`pixel-box ${isSelected ? 'pixel-box-cyan' : ''}`}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#08334433' : '#141d2c',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="font-pixel" style={{ fontSize: '11px', color: isSelected ? '#38bdf8' : '#f1f5f9' }}>
                    {g.name}
                  </span>
                  <span className="pixel-badge" style={{ color: isSelected ? '#38bdf8' : '#fbbf24', borderColor: 'currentColor' }}>
                    {pct}% SAVED
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
                  <span>₹{g.current_amount.toLocaleString('en-IN')}</span>
                  <span>Target: ₹{g.target_amount.toLocaleString('en-IN')}</span>
                </div>

                <ProgressBar 
                  value={g.current_amount} 
                  max={g.target_amount} 
                  variant={isSelected ? 'cyan' : 'green'} 
                  showValueText={false}
                  height={8}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>
                  <span>Target Date: {g.target_date || 'Ongoing'}</span>
                  {isSelected && <span style={{ color: '#38bdf8', fontWeight: 600 }}>Active in Time Machine</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2.5 SYSTEM ADVISOR // WHAT TO DO ACCORDING TO USER */}
      {(() => {
        const target = selectedGoal?.target_amount || 50000;
        const current = selectedGoal?.current_amount || 0;
        const deficit = Math.max(0, target - current);
        const personality = user?.personality || 'Balanced Planner';
        const category = user?.category || 'Student';

        let personalityAdvice = "";
        let recommendedMonthly = Math.max(1000, Math.round(deficit / 12 / 500) * 500);

        if (personality === 'Safe Saver') {
          personalityAdvice = "You naturally avoid volatility. Ensure your base emergency buffer is in a liquid account, but allocate 30-40% of this goal's monthly contribution into a low-cost Nifty 50 Index Fund to ensure inflation doesn't diminish your purchasing power.";
        } else if (personality === 'FOMO Investor') {
          personalityAdvice = "Resist the urge to trade high-volatility tips or speculative crypto to hit this goal faster. Automated regular SIPs beat emotional timing 9 times out of 10. Stay on the designated road!";
        } else if (personality === 'Impulsive Spender') {
          personalityAdvice = "Apply the 24-hour cooling-off rule on shopping carts. Skimming just 2 food deliveries per week saves ₹1,600/month, directly cutting 4 months off this goal!";
        } else {
          personalityAdvice = "Your allocation balance is healthy. Consider activating an annual 10% step-up SIP to achieve this goal 25% ahead of your estimated target date.";
        }

        const handleApplyRecommendation = () => {
          setBaseMonthly(recommendedMonthly);
          setDeliverySkips(2);
          setLunchPacks(2);
          setCheaperPlan(1);
        };

        return (
          <div className="pixel-box-green" style={{ padding: '20px 24px', backgroundColor: '#091b15', border: '1px solid #10b981', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10b981', color: '#091b15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="font-pixel" style={{ fontSize: '12.5px', color: '#34d399', letterSpacing: '0.5px' }}>
                    SYSTEM ADVISOR // ACTION DIRECTIVE FOR {personality.toUpperCase()}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Personalized strategy to complete <strong>{selectedGoal?.name || 'Selected Goal'}</strong>
                  </div>
                </div>
              </div>

              <span className="pixel-badge" style={{ color: '#34d399', borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                CALIBRATED: {personality} • {category}
              </span>
            </div>

            {/* Recommendations Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  1. MATHEMATICAL TARGET PACING:
                </div>
                <p style={{ fontSize: '12.5px', color: '#f1f5f9', lineHeight: '1.5' }}>
                  You need <strong>₹{deficit.toLocaleString('en-IN')}</strong> to reach 100%. Allocating an optimal <strong>₹{recommendedMonthly.toLocaleString('en-IN')}/mo</strong> achieves completion in approximately <strong>~{Math.max(1, Math.ceil(deficit / (recommendedMonthly + 1400)))} months</strong>.
                </p>
              </div>

              <div style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  2. BEHAVIORAL PROTOCOL ({personality}):
                </div>
                <p style={{ fontSize: '12.5px', color: '#fef08a', lineHeight: '1.5' }}>
                  {personalityAdvice}
                </p>
              </div>
            </div>

            {/* Quick Actions Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <span style={{ fontSize: '11px', color: '#6ee7b7' }}>
                💡 Click below to auto-calibrate Time Machine sliders with this verified mathematical pacing:
              </span>
              <button
                onClick={handleApplyRecommendation}
                className="pixel-btn pixel-btn-green"
                style={{ fontSize: '10px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>APPLY RECOMMENDED PACING (₹{recommendedMonthly.toLocaleString('en-IN')}/mo)</span>
                <CheckCircle2 size={13} />
              </button>
            </div>
          </div>
        );
      })()}

      {/* 3. WHAT IF TIME MACHINE CONTROLS & LIVE GROWTH CURVE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* TIME MACHINE SLIDERS PANEL */}
        <PixelCard title="WHAT IF TIME MACHINE CONTROLS" variant="default">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Active Target Banner */}
            <div style={{ padding: '10px 14px', backgroundColor: '#162338', borderLeft: '3px solid #38bdf8', borderRadius: '2px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>SIMULATING GOAL:</div>
              <div className="font-pixel" style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>
                {selectedGoal?.name || 'Emergency Fund'} (₹{currentGoalAmount.toLocaleString('en-IN')})
              </div>
            </div>

            {/* Slider 1: Base Monthly SIP */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Base Monthly Investment:</span>
                <span className="font-pixel" style={{ color: '#10b981' }}>₹{baseMonthly.toLocaleString('en-IN')}/mo</span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={baseMonthly}
                onChange={(e) => setBaseMonthly(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Slider 2: Duration */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Horizon Duration:</span>
                <span className="font-pixel" style={{ color: '#38bdf8' }}>{durationYears} Years ({durationYears * 12} mos)</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            {/* Slider 3: Expected Return */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Assumed Return Rate:</span>
                <span className="font-pixel" style={{ color: '#f59e0b' }}>{annualReturn}% p.a.</span>
              </div>
              <input
                type="range"
                min="6"
                max="18"
                step="0.5"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Slider 4: Assumed Inflation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Assumed Inflation:</span>
                <span className="font-pixel" style={{ color: '#f87171' }}>{inflationRate}% p.a.</span>
              </div>
              <input
                type="range"
                min="3"
                max="9"
                step="0.5"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f87171' }}
              />
            </div>

            {/* LIFESTYLE SLIDERS (USP) */}
            <div style={{ borderTop: '2px solid #233045', paddingTop: '16px' }}>
              <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> LIFESTYLE TWEAKS ACCELERATOR:
              </div>

              {/* Tweak A: Skip Delivery */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#cbd5e1' }}>🛵 Skip Food Delivery:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{deliverySkips}x/week (+₹{deliverySavings.toLocaleString('en-IN')}/mo)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  step="1"
                  value={deliverySkips}
                  onChange={(e) => setDeliverySkips(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              {/* Tweak B: Pack Lunch */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#cbd5e1' }}>🍱 Pack Home Lunch:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{lunchPacks} days/week (+₹{lunchSavings.toLocaleString('en-IN')}/mo)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={lunchPacks}
                  onChange={(e) => setLunchPacks(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              {/* Tweak C: Cheaper Phone/Data Plan */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#cbd5e1' }}>📱 Trim OTT / Mobile Plan:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{cheaperPlan} plan (+₹{planSavings}/mo)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={cheaperPlan}
                  onChange={(e) => setCheaperPlan(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              {/* Total combined monthly */}
              <div style={{ marginTop: '14px', padding: '10px', backgroundColor: '#091f16', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#6ee7b7' }}>Effective Monthly SIP:</span>
                <span className="font-pixel" style={{ fontSize: '13px', color: '#34d399' }}>
                  ₹{effectiveMonthly.toLocaleString('en-IN')}/mo
                </span>
              </div>
            </div>
          </div>
        </PixelCard>

        {/* LIVE GROWTH CURVE & RESULTS PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Key Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div className="pixel-box" style={{ padding: '12px', backgroundColor: '#131b29' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>TOTAL INVESTED</div>
              <div className="font-pixel" style={{ fontSize: '12px', color: '#f1f5f9', marginTop: '4px' }}>
                ₹{simData?.total_invested?.toLocaleString('en-IN') || 0}
              </div>
            </div>

            <div className="pixel-box-green" style={{ padding: '12px', backgroundColor: '#0c221a' }}>
              <div style={{ fontSize: '9px', color: '#6ee7b7' }}>NOMINAL FUTURE VALUE</div>
              <div className="font-pixel" style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>
                ₹{simData?.future_value_nominal?.toLocaleString('en-IN') || 0}
              </div>
            </div>

            <div className="pixel-box-gold" style={{ padding: '12px', backgroundColor: '#211806' }}>
              <div style={{ fontSize: '9px', color: '#fcd34d' }}>REAL PURCHASING POWER</div>
              <div className="font-pixel" style={{ fontSize: '12px', color: '#fef08a', marginTop: '4px' }}>
                ₹{simData?.future_value_real?.toLocaleString('en-IN') || 0}
              </div>
            </div>
          </div>

          {/* PROJECTED GOAL DATE CALLOUT */}
          <div className="pixel-box-cyan" style={{ padding: '14px 18px', backgroundColor: '#082530', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={20} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '10px', color: '#38bdf8', textTransform: 'uppercase' }}>PROJECTED TARGET COMPLETION</div>
                <div className="font-pixel" style={{ fontSize: '14px', color: '#f8fafc', marginTop: '2px' }}>
                  REACH GOAL BY: {simData?.projected_date || 'Calculating...'}
                </div>
              </div>
            </div>

            <span className="pixel-badge" style={{ color: '#38bdf8', borderColor: '#38bdf8' }}>
              IN ~{simData?.estimated_months_to_goal || 0} MONTHS
            </span>
          </div>

          {/* LIVE RECHARTS GROWTH CURVE */}
          <PixelCard title="LIVE COMPOUNDING CURVE" variant="default">
            {simData?.chart_points && (
              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simData.chart_points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232d42" />
                    <XAxis dataKey="year" stroke="#64748b" tickFormatter={(v) => `Yr ${v}`} />
                    <YAxis stroke="#64748b" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#131b29', borderColor: '#334155', fontSize: '11px' }}
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceLine 
                      y={currentGoalAmount} 
                      stroke="#38bdf8" 
                      strokeDasharray="4 4" 
                      label={{ value: `Goal: ₹${(currentGoalAmount/1000).toFixed(0)}k`, fill: '#38bdf8', fontSize: 10, position: 'top' }} 
                    />
                    <Area type="monotone" dataKey="nominal" name="Nominal Future Value" stroke="#10b981" fillOpacity={1} fill="url(#colorNominal)" />
                    <Area type="monotone" dataKey="real" name="Inflation Adjusted" stroke="#f59e0b" fillOpacity={1} fill="url(#colorReal)" />
                    <Area type="monotone" dataKey="invested" name="Principal Invested" stroke="#94a3b8" fill="#334155" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* MANDATORY DISCLAIMER NOTE */}
            <div style={{ marginTop: '12px', fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #233045', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#f59e0b" />
              <span>
                <strong>Permanent Note:</strong> Simulation for learning, not a prediction. Assumed mathematical rates, not promised returns.
              </span>
            </div>
          </PixelCard>

          {/* MENTOR EVALUATION DIALOGUE */}
          {simData?.mentor_comment && (
            <DialogueBox
              speaker="PIXEL MENTOR"
              mood="happy"
              text={simData.mentor_comment}
              speed={15}
            />
          )}
        </div>
      </div>

      {/* CREATE GOAL MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="CREATE NEW FINANCIAL GOAL"
        variant="cyan"
      >
        <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Goal Name:</label>
            <input
              type="text"
              placeholder="e.g. Electric Scooter or Certifications"
              required
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', border: '1px solid #334155', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Target Amount (₹):</label>
            <input
              type="number"
              placeholder="e.g. 75000"
              required
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', border: '1px solid #334155', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Target Date:</label>
            <input
              type="date"
              value={newGoalDate}
              onChange={(e) => setNewGoalDate(e.target.value)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', border: '1px solid #334155', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <PixelButton variant="ghost" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
              CANCEL
            </PixelButton>
            <PixelButton type="submit" variant="primary" style={{ flex: 2 }}>
              SAVE & ACTIVATE GOAL
            </PixelButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
