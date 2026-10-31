import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { apiRequest } from '../api/client';
import PixelAvatar from './PixelAvatar';
import { Check, ArrowRight, ArrowLeft, Shield, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    question: "How do you react if your investments drop 10% in a single week?",
    options: [
      { text: "Panic sell everything to cut losses", value: 0 },
      { text: "Feel very anxious but wait and watch", value: 1 },
      { text: "Ignore the short-term noise", value: 2 },
      { text: "Celebrate the discount and buy more units", value: 3 }
    ]
  },
  {
    question: "When you receive unexpected cash or a bonus, what is your first instinct?",
    options: [
      { text: "Spend it on shopping or partying with friends", value: 3 },
      { text: "Upgrade a gadget or buy something on my wishlist", value: 2 },
      { text: "Split 50% for fun, 50% for savings", value: 1 },
      { text: "Transfer all into my emergency fund or SIP", value: 0 }
    ]
  },
  {
    question: "A friend shows you a 500% gain on a secret crypto Telegram channel. You:",
    options: [
      { text: "Transfer money immediately so I don't miss out", value: 3 },
      { text: "Ask for the group link and watch closely", value: 2 },
      { text: "Feel tempted but check if it's SEBI registered", value: 1 },
      { text: "Know that guaranteed 500% returns are 100% scam", value: 0 }
    ]
  },
  {
    question: "What is your main financial priority right now?",
    options: [
      { text: "Surviving month-to-month and managing daily expenses", value: 2 },
      { text: "Saving for a specific goal (laptop, bike, trip)", value: 1 },
      { text: "Building an emergency buffer so I can sleep peacefully", value: 0 },
      { text: "Growing long-term compounding wealth for the future", value: 2 }
    ]
  }
];

export default function Onboarding() {
  const { fetchProfile, fetchCoins, setShowOnboarding, triggerRewardFx, setMentorMessage } = useGameStore();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('student');
  const [incomeType, setIncomeType] = useState('monthly');
  const [monthlyIncome, setMonthlyIncome] = useState(25000);
  const [fixedExpenses, setFixedExpenses] = useState(8000);
  const [goalName, setGoalName] = useState('Emergency Fund');
  const [goalTarget, setGoalTarget] = useState(50000);
  const [quizAnswers, setQuizAnswers] = useState([1, 1, 1, 1]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleQuizAnswer = (qIndex, val) => {
    const updated = [...quizAnswers];
    updated[qIndex] = val;
    setQuizAnswers(updated);
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
        quiz_answers: quizAnswers
      };

      const res = await apiRequest('/profile/onboard', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setResult(res);
      triggerRewardFx();
      setMentorMessage(`Welcome aboard, ${res.personality}! I've deposited your +${res.starting_coins} starting coins.`);
      await fetchProfile();
      await fetchCoins();
      setStep(5); // reveal step
    } catch (e) {
      alert("Failed to complete onboarding: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '40px auto', padding: '0 20px' }}>
      <div className="pixel-box" style={{ padding: '32px 24px', backgroundColor: '#131b29' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-pixel" style={{ fontSize: '10px', color: '#38bdf8' }}>
              STEP {step} OF 5
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {step === 1 && "Select Category"}
              {step === 2 && "Income & Expenses"}
              {step === 3 && "Primary Goal"}
              {step === 4 && "Risk & Personality Quiz"}
              {step === 5 && "Level 1 Unlocked!"}
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <div style={{ height: '100%', width: `${(step / 5) * 100}%`, backgroundColor: '#10b981', transition: 'width 0.3s' }}></div>
          </div>
        </div>

        {/* Step 1: Category */}
        {step === 1 && (
          <div>
            <h2 className="font-pixel" style={{ fontSize: '14px', color: '#34d399', marginBottom: '16px' }}>
              CHOOSE YOUR PROFILE
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
              We tailor your budgeting rules and mentor feedback based on your earning journey.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '24px' }}>
              {[
                { id: 'student', title: 'Student', desc: 'Managing pocket money, stipend, or part-time savings. Zero or low rent.' },
                { id: 'professional', title: 'First-Job Professional', desc: 'Steady monthly salary with rent, bills, and tax considerations.' },
                { id: 'gig_worker', title: 'Gig Worker / Freelancer', desc: 'Fluctuating income. Requires baseline buffering and daily spend limits.' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  className={`pixel-box ${category === item.id ? 'pixel-box-green' : ''}`}
                  style={{ padding: '16px', cursor: 'pointer', backgroundColor: category === item.id ? '#064e3b33' : '#1a2233' }}
                >
                  <div className="font-pixel" style={{ fontSize: '12px', color: category === item.id ? '#34d399' : '#f1f5f9', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <button onClick={() => setStep(2)} className="pixel-btn pixel-btn-green" style={{ width: '100%' }}>
              NEXT STEP <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Step 2: Income & Expenses */}
        {step === 2 && (
          <div>
            <h2 className="font-pixel" style={{ fontSize: '14px', color: '#34d399', marginBottom: '16px' }}>
              YOUR CASH FLOW (MONTHLY)
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
              All numbers stay private in your browser. Approximate figures work fine.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Income Type:</label>
                <select
                  value={incomeType}
                  onChange={(e) => setIncomeType(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a2233', color: '#fff', border: '2px solid #334155' }}
                >
                  <option value="monthly">Steady Monthly Salary / Allowance</option>
                  <option value="irregular">Irregular / Gig Payouts</option>
                  <option value="stipend">College Stipend</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Average Monthly Income (₹):
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a2233', color: '#fff', border: '2px solid #334155' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Fixed Monthly Expenses (Rent, EMI, fees, subscriptions) (₹):
                </label>
                <input
                  type="number"
                  value={fixedExpenses}
                  onChange={(e) => setFixedExpenses(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a2233', color: '#fff', border: '2px solid #334155' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(1)} className="pixel-btn" style={{ flex: 1 }}>
                <ArrowLeft size={14} /> BACK
              </button>
              <button onClick={() => setStep(3)} className="pixel-btn pixel-btn-green" style={{ flex: 2 }}>
                NEXT: SET GOAL <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goal */}
        {step === 3 && (
          <div>
            <h2 className="font-pixel" style={{ fontSize: '14px', color: '#34d399', marginBottom: '16px' }}>
              SET YOUR FIRST GOAL
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
              What milestone are you saving toward?
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['Emergency Fund', 'Laptop Upgrade', 'Electric Bike', 'Trip with Friends'].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGoalName(g);
                    if (g === 'Emergency Fund') setGoalTarget(fixedExpenses * 3 || 30000);
                    if (g === 'Laptop Upgrade') setGoalTarget(65000);
                    if (g === 'Electric Bike') setGoalTarget(110000);
                    if (g === 'Trip with Friends') setGoalTarget(20000);
                  }}
                  className="pixel-btn"
                  style={{ fontSize: '9px', backgroundColor: goalName === g ? '#059669' : '#1f2937' }}
                >
                  {g}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Goal Name:</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a2233', color: '#fff', border: '2px solid #334155' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Target Amount (₹):</label>
                <input
                  type="number"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a2233', color: '#fff', border: '2px solid #334155' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(2)} className="pixel-btn" style={{ flex: 1 }}>
                <ArrowLeft size={14} /> BACK
              </button>
              <button onClick={() => setStep(4)} className="pixel-btn pixel-btn-green" style={{ flex: 2 }}>
                NEXT: RISK QUIZ <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 4-Question Risk Quiz */}
        {step === 4 && (
          <div>
            <h2 className="font-pixel" style={{ fontSize: '13px', color: '#34d399', marginBottom: '12px' }}>
              4-QUESTION RISK & MONEY QUIZ
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
              Reveals your Money Personality: Safe Saver, Impulsive Spender, FOMO Investor, or Calculated Builder.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '380px', overflowY: 'auto', paddingRight: '6px', marginBottom: '20px' }}>
              {QUIZ_QUESTIONS.map((q, qIdx) => (
                <div key={qIdx} className="pixel-box" style={{ padding: '14px', backgroundColor: '#1a2233' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', marginBottom: '10px' }}>
                    Q{qIdx + 1}: {q.question}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          backgroundColor: quizAnswers[qIdx] === opt.value ? '#064e3b55' : '#131b29',
                          border: `1px solid ${quizAnswers[qIdx] === opt.value ? '#10b981' : '#334155'}`,
                          cursor: 'pointer',
                          fontSize: '12px',
                          borderRadius: '2px'
                        }}
                      >
                        <input
                          type="radio"
                          name={`quiz_${qIdx}`}
                          checked={quizAnswers[qIdx] === opt.value}
                          onChange={() => handleQuizAnswer(qIdx, opt.value)}
                        />
                        <span style={{ color: quizAnswers[qIdx] === opt.value ? '#ecfdf5' : '#cbd5e1' }}>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(3)} className="pixel-btn" style={{ flex: 1 }}>
                <ArrowLeft size={14} /> BACK
              </button>
              <button 
                onClick={handleFinish} 
                disabled={isSubmitting}
                className="pixel-btn pixel-btn-gold" 
                style={{ flex: 2 }}
              >
                {isSubmitting ? "CALCULATING PERSONALITY..." : "REVEAL MY PROFILE & CLAIM COINS (+100)"}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Reveal & Start Playing */}
        {step === 5 && result && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div className="animate-mentor" style={{ display: 'inline-block', marginBottom: '12px' }}>
              <PixelAvatar size={72} />
            </div>

            <div className="pixel-badge" style={{ color: '#fbbf24', borderColor: '#fbbf24', marginBottom: '8px' }}>
              PROFILE UNLOCKED
            </div>

            <h2 className="font-pixel" style={{ fontSize: '18px', color: '#fef08a', marginBottom: '12px' }}>
              {result.personality}
            </h2>

            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 20px' }}>
              {result.personality_description}
            </p>

            <div className="pixel-box-gold" style={{ padding: '16px', display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: '#281c06', marginBottom: '24px' }}>
              <img src="/pixel_coin.svg" alt="Coins" style={{ width: '28px', height: '28px' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600 }}>REWARD UNLOCKED</div>
                <div className="font-pixel" style={{ fontSize: '14px', color: '#fef08a' }}>+{result.starting_coins} COINS</div>
              </div>
            </div>

            <div>
              <button 
                onClick={() => setShowOnboarding(false)} 
                className="pixel-btn pixel-btn-green"
                style={{ fontSize: '12px', padding: '12px 28px' }}
              >
                ENTER DASHBOARD & START PLAYING <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

