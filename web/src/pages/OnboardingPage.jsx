import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { apiRequest } from '../api/client';
import Mentor from '../components/pixel/Mentor';
import PixelButton from '../components/pixel/PixelButton';
import PixelCard from '../components/pixel/PixelCard';
import ProgressBar from '../components/pixel/ProgressBar';
import DialogueBox from '../components/pixel/DialogueBox';
import { ArrowRight, ArrowLeft, CheckCircle, ShieldAlert, Sparkles, Coins } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    question: "How do you react if your investments drop 10% in a single week?",
    options: [
      { text: "Panic sell everything to cut losses", value: 0, mentorComment: "Selling during a drop locks in temporary paper drops as real losses!" },
      { text: "Feel anxious but wait and watch", value: 1, mentorComment: "A normal reaction! Staying calm is a key superpower." },
      { text: "Ignore the short-term noise", value: 2, mentorComment: "Solid emotional discipline! Focus on the long-term horizon." },
      { text: "Celebrate the discount and buy more units", value: 3, mentorComment: "The master investor mindset! Dips are discount sales." }
    ]
  },
  {
    question: "When you receive unexpected cash or a bonus, what is your first instinct?",
    options: [
      { text: "Transfer all into emergency fund or SIP", value: 0, mentorComment: "Disciplined! Paying your future self first builds true wealth." },
      { text: "Split 50% for fun, 50% for savings", value: 1, mentorComment: "A healthy balance of enjoying today while preparing for tomorrow." },
      { text: "Upgrade a gadget or buy on my wishlist", value: 2, mentorComment: "Wishlists are fun, just ensure your emergency armor is intact." },
      { text: "Spend it on shopping or partying with friends", value: 3, mentorComment: "Treating friends feels great, but small leaks drain big ponds." }
    ]
  },
  {
    question: "A friend shows you a 500% gain on a secret crypto Telegram channel. You:",
    options: [
      { text: "Know that guaranteed 500% returns are 100% scam", value: 0, mentorComment: "Sharp eye! Guaranteed high returns do not exist in genuine markets." },
      { text: "Feel tempted but check if it's SEBI registered", value: 1, mentorComment: "Spot on! Always verify registration before risking hard-earned cash." },
      { text: "Ask for the group link and watch closely", value: 2, mentorComment: "Curiosity is natural, but private chat channels are classic traps." },
      { text: "Transfer money immediately so I don't miss out", value: 3, mentorComment: "FOMO alert! Unsolicited hot tips are the #1 way new earners lose money." }
    ]
  },
  {
    question: "What is your main financial priority right now?",
    options: [
      { text: "Building an emergency buffer for peace of mind", value: 0, mentorComment: "Rule #1: Armor first! An emergency cushion prevents debt." },
      { text: "Saving for a specific goal (laptop, bike, trip)", value: 1, mentorComment: "Goal-based saving gives your money a clear target mission." },
      { text: "Growing long-term compounding wealth for the future", value: 2, mentorComment: "Compounding is the 8th wonder! Time does the heavy lifting." },
      { text: "Surviving month-to-month and managing daily expenses", value: 3, mentorComment: "We will build a clear daily safe-to-spend limit to give you breathing room." }
    ]
  }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, fetchProfile, fetchCoins, triggerRewardFx } = useGameStore();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('student');
  const [incomeType, setIncomeType] = useState('monthly');
  const [monthlyIncome, setMonthlyIncome] = useState(25000);
  const [fixedExpenses, setFixedExpenses] = useState(7000);
  const [goalName, setGoalName] = useState('Emergency Fund');
  const [goalTarget, setGoalTarget] = useState(50000);
  const [goalDate, setGoalDate] = useState('2027-10-31');
  const [quizAnswers, setQuizAnswers] = useState([1, 1, 1, 1]);
  const [mentorDialogue, setMentorDialogue] = useState("Greetings! Let's build your financial profile step-by-step.");
  const [mentorMood, setMentorMood] = useState('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardResult, setOnboardResult] = useState(null);

  // If user has already completed onboarding, redirect to /dashboard
  if (user && user.onboarding_completed && !onboardResult) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleQuizAnswer = (qIdx, opt) => {
    const updated = [...quizAnswers];
    updated[qIdx] = opt.value;
    setQuizAnswers(updated);
    setMentorDialogue(opt.mentorComment);
    setMentorMood(opt.value === 3 && qIdx === 2 ? 'worried' : opt.value === 0 ? 'happy' : 'thinking');
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        category,
        income_type: incomeType,
        monthly_income: Number(monthlyIncome),
        fixed_expenses: Number(fixedExpenses),
        goal_name: goalName,
        goal_target_amount: Number(goalTarget),
        goal_target_date: goalDate,
        quiz_answers: quizAnswers
      };

      const res = await apiRequest('/profile', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setOnboardResult(res);
      triggerRewardFx();
      await fetchProfile();
      await fetchCoins();
      setStep(6); // Reveal screen
    } catch (err) {
      alert("Onboarding failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '30px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Wizard HUD */}
      <div className="pixel-box" style={{ padding: '16px 20px', backgroundColor: '#131b28' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span className="font-pixel" style={{ fontSize: '11px', color: '#38bdf8' }}>
            ONBOARDING WIZARD • STEP {Math.min(5, step)} OF 5
          </span>
          <span className="pixel-badge" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>
            BONUS: +100 COINS
          </span>
        </div>
        <ProgressBar value={step} max={5} variant="green" showValueText={false} height={8} />
      </div>

      {/* Reactive Mentor Dialogue Box */}
      {step <= 5 && (
        <DialogueBox 
          key={mentorDialogue}
          speaker="PIXEL MENTOR"
          mood={mentorMood}
          text={mentorDialogue}
          speed={20}
        />
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <PixelCard title="CHOOSE YOUR JOURNEY" variant="default">
          <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '20px' }}>
            Pixel Mentor customizes budgeting ratios, difficulty, and advice based on your earning category:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {[
              { id: 'student', title: 'Student', desc: 'Managing pocket money, stipend, or part-time savings. Zero or minimal rent.' },
              { id: 'professional', title: 'First-Job Professional', desc: 'Steady monthly salary with rent, bills, and tax-saving considerations.' },
              { id: 'gig_worker', title: 'Gig Worker / Freelancer', desc: 'Fluctuating income requiring baseline buffering and daily spend limits.' }
            ].map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setMentorDialogue(`Ah, a ${cat.title}! We will tune your rules and simulations specifically for this path.`);
                  setMentorMood('happy');
                }}
                className={`pixel-box ${category === cat.id ? 'pixel-box-green' : ''}`}
                style={{ padding: '16px', cursor: 'pointer', backgroundColor: category === cat.id ? '#064e3b33' : '#161f30' }}
              >
                <div className="font-pixel" style={{ fontSize: '12px', color: category === cat.id ? '#34d399' : '#f1f5f9', marginBottom: '4px' }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{cat.desc}</div>
              </div>
            ))}
          </div>

          <PixelButton variant="success" size="lg" style={{ width: '100%' }} onClick={() => {
            setStep(2);
            setMentorDialogue("Next, enter your cash flow so our Python budget engine can compute your safe ratios.");
            setMentorMood('thinking');
          }}>
            NEXT: CASH FLOW <ArrowRight size={14} />
          </PixelButton>
        </PixelCard>
      )}

      {/* STEP 2: INCOME TYPE & AMOUNT */}
      {step === 2 && (
        <PixelCard title="MONTHLY EARNINGS" variant="default">
          <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '20px' }}>
            Enter your average monthly income. Private in your browser.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Income Frequency / Type:</label>
              <select
                value={incomeType}
                onChange={(e) => setIncomeType(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', color: '#fff', border: '2px solid #334155' }}
              >
                <option value="monthly">Steady Monthly Salary / Fixed Allowance</option>
                <option value="irregular">Irregular / Gig-based Payouts</option>
                <option value="stipend">College Internship / Stipend</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Average Monthly Amount (₹):</label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', color: '#fff', border: '2px solid #334155' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <PixelButton variant="ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> BACK
            </PixelButton>
            <PixelButton variant="success" style={{ flex: 2 }} onClick={() => {
              setStep(3);
              setMentorDialogue("Now, what are your mandatory fixed commitments (rent, EMI, recharge)?");
              setMentorMood('thinking');
            }}>
              NEXT: FIXED EXPENSES <ArrowRight size={14} />
            </PixelButton>
          </div>
        </PixelCard>
      )}

      {/* STEP 3: FIXED EXPENSES */}
      {step === 3 && (
        <PixelCard title="MANDATORY FIXED EXPENSES" variant="default">
          <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '20px' }}>
            Monthly fixed costs: Rent, EMI, mobile recharge, WiFi, and subscriptions.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Total Fixed Expenses (₹/month):
            </label>
            <input
              type="number"
              value={fixedExpenses}
              onChange={(e) => setFixedExpenses(Number(e.target.value))}
              style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', color: '#fff', border: '2px solid #334155' }}
            />
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
              Fixed Share: {monthlyIncome > 0 ? Math.round((fixedExpenses / monthlyIncome) * 100) : 0}% of income
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <PixelButton variant="ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>
              <ArrowLeft size={14} /> BACK
            </PixelButton>
            <PixelButton variant="success" style={{ flex: 2 }} onClick={() => {
              setStep(4);
              setMentorDialogue("Every great quest needs a milestone! What target are you building toward?");
              setMentorMood('happy');
            }}>
              NEXT: SET GOAL <ArrowRight size={14} />
            </PixelButton>
          </div>
        </PixelCard>
      )}

      {/* STEP 4: GOAL TARGET */}
      {step === 4 && (
        <PixelCard title="SET YOUR PRIMARY FINANCIAL GOAL" variant="default">
          <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '16px' }}>
            Give your compounding journey a clear mission.
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {[
              { name: 'Emergency Fund', target: fixedExpenses * 3 || 30000 },
              { name: 'Laptop Upgrade', target: 55000 },
              { name: 'Electric Bike', target: 110000 },
              { name: 'Trip with Batchmates', target: 20000 }
            ].map((preset) => (
              <PixelButton
                key={preset.name}
                size="sm"
                variant={goalName === preset.name ? 'success' : 'ghost'}
                onClick={() => {
                  setGoalName(preset.name);
                  setGoalTarget(preset.target);
                }}
              >
                {preset.name} (₹{preset.target.toLocaleString('en-IN')})
              </PixelButton>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Goal Name:</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', color: '#fff', border: '2px solid #334155' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Target Amount (₹):</label>
              <input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', color: '#fff', border: '2px solid #334155' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <PixelButton variant="ghost" style={{ flex: 1 }} onClick={() => setStep(3)}>
              <ArrowLeft size={14} /> BACK
            </PixelButton>
            <PixelButton variant="success" style={{ flex: 2 }} onClick={() => {
              setStep(5);
              setMentorDialogue("Finally, the 4-question risk quiz! Answer truthfully so I can assign your Money Personality.");
              setMentorMood('thinking');
            }}>
              NEXT: RISK QUIZ <ArrowRight size={14} />
            </PixelButton>
          </div>
        </PixelCard>
      )}

      {/* STEP 5: 4 RISK-SCENARIO QUESTIONS */}
      {step === 5 && (
        <PixelCard title="4-QUESTION RISK & MONEY QUIZ" variant="default">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {QUIZ_QUESTIONS.map((q, qIdx) => (
              <div key={qIdx} className="pixel-box" style={{ padding: '14px', backgroundColor: '#131924' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', marginBottom: '10px' }}>
                  Q{qIdx + 1}: {q.question}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {q.options.map((opt, oIdx) => {
                    const isSelected = quizAnswers[qIdx] === opt.value;
                    return (
                      <label
                        key={oIdx}
                        onClick={() => handleQuizAnswer(qIdx, opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          backgroundColor: isSelected ? '#064e3b44' : '#1b2436',
                          border: `1px solid ${isSelected ? '#10b981' : '#2d3b4e'}`,
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name={`q_${qIdx}`}
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ accentColor: '#10b981' }}
                        />
                        <span style={{ fontSize: '12px', color: isSelected ? '#34d399' : '#cbd5e1' }}>
                          {opt.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <PixelButton variant="ghost" style={{ flex: 1 }} onClick={() => setStep(4)}>
              <ArrowLeft size={14} /> BACK
            </PixelButton>
            <PixelButton 
              variant="warning" 
              size="lg"
              style={{ flex: 2 }} 
              disabled={isSubmitting}
              onClick={handleFinish}
            >
              {isSubmitting ? "CALCULATING..." : "SUBMIT & REVEAL (+100 COINS)"}
            </PixelButton>
          </div>
        </PixelCard>
      )}

      {/* STEP 6: REVEAL SCREEN */}
      {step === 6 && onboardResult && (
        <PixelCard variant="green" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <Mentor mood="happy" size={80} animated={true} />
          
          <div className="pixel-badge" style={{ color: '#fbbf24', borderColor: '#fbbf24', margin: '14px 0 8px' }}>
            MONEY PERSONALITY REVEALED
          </div>

          <h2 className="font-pixel" style={{ fontSize: '20px', color: '#fef08a', marginBottom: '12px' }}>
            {onboardResult.personality_type || onboardResult.personality}
          </h2>

          <p style={{ fontSize: '14px', color: '#cbd5e1', maxWidth: '540px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            {onboardResult.personality_description}
          </p>

          <div className="pixel-box-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '14px 20px', backgroundColor: '#291b06', marginBottom: '24px' }}>
            <img src="/pixel_coin.svg" alt="Coins" style={{ width: '28px', height: '28px' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600 }}>REWARD CREDITED VIA LEDGER</div>
              <div className="font-pixel" style={{ fontSize: '14px', color: '#fef08a' }}>+100 COINS</div>
            </div>
          </div>

          <div>
            <PixelButton 
              variant="success" 
              size="lg" 
              onClick={() => navigate('/dashboard')}
            >
              ENTER DASHBOARD <ArrowRight size={16} />
            </PixelButton>
          </div>
        </PixelCard>
      )}
    </div>
  );
}

