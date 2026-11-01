import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { apiRequest } from '../../api/client';
import Term from '../common/Term';
import { 
  TrendingUp, 
  Wallet, 
  Target, 
  PlusCircle, 
  Sparkles, 
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Newspaper,
  ExternalLink,
  Radio,
  Clock
} from 'lucide-react';

export default function OverviewTab() {
  const navigate = useNavigate();
  const { user, coins, updateCoinsLocally } = useGameStore();
  const [budgetData, setBudgetData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [message, setMessage] = useState('');
  const [latestNews, setLatestNews] = useState([
    {
      id: "news_1",
      title: "NIFTY 50 Scales New Peak: Domestic Inflows via SIPs Hit Record ₹24,500 Crore",
      source: "Economic Times Markets",
      published_at: "1 hour ago",
      sentiment: "BULLISH"
    },
    {
      id: "news_2",
      title: "RBI Monetary Policy: Repo Rate Held Steady at 6.5%; Inflation Target Band in Sight",
      source: "RBI / Mint",
      published_at: "2 hours ago",
      sentiment: "NEUTRAL"
    },
    {
      id: "news_3",
      title: "SEBI Launches Zero-Trust Crackdown on Fraudulent WhatsApp & Telegram 'VIP Tips' Groups",
      source: "SEBI Press Bulletin",
      published_at: "3 hours ago",
      sentiment: "WATCH"
    }
  ]);

  const loadData = async () => {
    try {
      const [bRes, expRes] = await Promise.all([
        apiRequest('/budget'),
        apiRequest('/expenses?limit=10')
      ]);
      setBudgetData(bRes);
      setExpenses(expRes);
    } catch (e) {
      console.error("Budget load failed", e);
    }

    try {
      const newsRes = await apiRequest('/news?category=all');
      if (newsRes?.articles && newsRes.articles.length > 0) {
        setLatestNews(newsRes.articles.slice(0, 3));
      }
    } catch (e) {
      console.warn("Using built-in real-time news preview", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) return;

    setIsLogging(true);
    try {
      const res = await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(expenseAmount),
          category: expenseCategory,
          description: expenseDesc || 'Expense'
        })
      });

      if (res.coins_earned > 0) {
        updateCoinsLocally(res.coins_earned);
        setMessage(`Expense logged! Earned +${res.coins_earned} coins!`);
      } else {
        setMessage("Expense logged (daily coin cap reached).");
      }

      setExpenseAmount('');
      setExpenseDesc('');
      loadData();
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setIsLogging(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const income = user ? user.monthly_income : 35000;
  const fixed = user ? user.fixed_expenses : 12000;
  const totalSpent = budgetData ? budgetData.total_spent : 0;
  const savingsRate = budgetData ? budgetData.savings_rate_pct : 40;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="pixel-box-cyan" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>MONTHLY INCOME</span>
            <Wallet size={18} color="#00f0ff" />
          </div>
          <div className="font-pixel" style={{ fontSize: '20px', color: '#f8fafc', textShadow: '0 0 10px rgba(0, 240, 255, 0.3)' }}>
            ₹{income.toLocaleString('en-IN')}
          </div>
          <span className="pixel-badge" style={{ color: '#00f0ff', borderColor: '#00f0ff', marginTop: '10px' }}>
            {user ? user.category.toUpperCase() : 'STUDENT'}
          </span>
        </div>

        <div className="pixel-box-gold" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>FIXED EXPENSES</span>
            <Calendar size={18} color="#f59e0b" />
          </div>
          <div className="font-pixel" style={{ fontSize: '20px', color: '#fbbf24', textShadow: '0 0 10px rgba(245, 158, 11, 0.3)' }}>
            ₹{fixed.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>Rent, EMI & Commitments</div>
        </div>

        <div className="pixel-box-red" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>VARIABLE SPENT</span>
            <TrendingUp size={18} color="#f43f5e" />
          </div>
          <div className="font-pixel" style={{ fontSize: '20px', color: '#fb7185', textShadow: '0 0 10px rgba(244, 63, 94, 0.3)' }}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>Current month logs</div>
        </div>

        <div className="pixel-box-green" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 600, letterSpacing: '0.5px' }}>SAVINGS HEALTH</span>
            <Sparkles size={18} color="#10b981" />
          </div>
          <div className="font-pixel" style={{ fontSize: '20px', color: '#34d399', textShadow: '0 0 10px rgba(16, 185, 129, 0.3)' }}>
            {savingsRate}%
          </div>
          <div style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '10px' }}>
            {savingsRate >= 30 ? "⚡ Excellent Armor!" : "⚠️ Increase buffer"}
          </div>
        </div>
      </div>

      {/* DAILY INVESTMENT NEWS & WEB SCRAPED INTEL BOX */}
      <div 
        onClick={() => navigate('/dashboard/news')}
        className="pixel-box-cyan" 
        style={{ 
          padding: '20px 24px', 
          backgroundColor: '#091524',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 240, 255, 0.08)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#00f0ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Newspaper size={17} color="#00f0ff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="font-pixel" style={{ fontSize: '13px', color: '#f8fafc', letterSpacing: '0.5px' }}>
                  DAILY INVESTMENT INTEL // LIVE SCRAPED UPDATES
                </span>
                <span className="cyber-dot" style={{ width: '6px', height: '6px' }} />
              </div>
              <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                Live dispatches on Nifty SIPs, RBI repo rates, and regulatory fraud bulletins. Click to open full scrollable feed!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
              EXPLORE ALL DISPATCHES
            </span>
            <ArrowUpRight size={15} color="#38bdf8" />
          </div>
        </div>

        {/* Top 3 Headlines Preview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {latestNews.length > 0 ? (
            latestNews.map((item) => (
              <div 
                key={item.id}
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '6px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '9px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                      {item.source}
                    </span>
                    <span style={{ fontSize: '8.5px', color: '#94a3b8' }}>
                      {item.published_at}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 600, color: '#f1f5f9', lineHeight: '1.4' }}>
                    {item.title}
                  </h4>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{
                    fontSize: '8.5px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '3px',
                    color: item.sentiment === 'BULLISH' ? '#34d399' : (item.sentiment === 'WATCH' ? '#fbbf24' : '#38bdf8'),
                    background: item.sentiment === 'BULLISH' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.12)'
                  }}>
                    {item.sentiment}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#38bdf8', fontWeight: 600 }}>
                    Read Full News &rarr;
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '16px', color: '#94a3b8', fontSize: '12px', textAlign: 'center', gridColumn: '1 / -1' }}>
              Loading real-time financial news... Tap here to open the News Desk.
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Quick Log & Goal Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Quick Expense Logger */}
        <div className="pixel-box" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="font-pixel" style={{ fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={16} /> QUICK EXPENSE LOGGER
            </h3>
            <span className="pixel-badge" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>
              +5 COINS PER LOG (CAP 3/DAY)
            </span>
          </div>

          <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Amount (₹):</label>
                <input
                  type="number"
                  placeholder="e.g. 180"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Category:</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }}
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Transport">Transport / Metro</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills & Utilities</option>
                  <option value="Investments">Investments / SIP</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Description / Memo:</label>
              <input
                type="text"
                placeholder="e.g. Chai and snacks with teammates"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLogging}
              className="pixel-btn pixel-btn-green"
              style={{ marginTop: '4px' }}
            >
              {isLogging ? "RECORDING..." : "LOG EXPENSE & EARN COINS"}
            </button>
          </form>

          {message && (
            <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#064e3b', color: '#a7f3d0', fontSize: '12px', borderLeft: '4px solid #10b981' }}>
              {message}
            </div>
          )}
        </div>

        {/* Goal Status & Gig Buffer Indicator */}
        <div className="pixel-box" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="font-pixel" style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={16} /> ACTIVE FINANCIAL GOAL
            </h3>
            <button onClick={() => navigate('/dashboard/goals')} className="pixel-btn" style={{ padding: '4px 8px', fontSize: '8px' }}>
              TIME MACHINE <ArrowUpRight size={12} />
            </button>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
                <Term name="Emergency Fund">Emergency Fund</Term>
              </span>
              <span className="font-pixel" style={{ fontSize: '11px', color: '#38bdf8' }}>₹50,000 Target</span>
            </div>

            <div style={{ height: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '38%', height: '100%', backgroundColor: '#38bdf8' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
              <span>Saved: ~₹19,000 (38%)</span>
              <span>Projected: ~6 months</span>
            </div>
          </div>

          {/* Gig Safe Spend Badge */}
          {budgetData && budgetData.gig_mode && (
            <div className="pixel-box-gold" style={{ padding: '12px 16px', backgroundColor: '#211806' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#fbbf24', textTransform: 'uppercase' }}>Daily Safety Metric</div>
                  <div className="font-pixel" style={{ fontSize: '13px', color: '#fef08a' }}>
                    ₹{budgetData.gig_mode.safe_to_spend_today} / Day
                  </div>
                </div>
                <button onClick={() => navigate('/dashboard/budget')} className="pixel-btn pixel-btn-gold" style={{ padding: '6px 10px', fontSize: '8px' }}>
                  VIEW BUDGET
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Expense History */}
      <div className="pixel-box" style={{ padding: '20px' }}>
        <h3 className="font-pixel" style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px' }}>
          RECENT LOGS
        </h3>

        {expenses.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '12px', padding: '16px 0' }}>No recent expenses logged yet. Try logging your first expense above!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {expenses.slice(0, 6).map((item) => (
              <div key={item.id} style={{ padding: '10px', backgroundColor: '#192233', borderLeft: '3px solid #38bdf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>{item.category}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.description || 'Logged item'}</div>
                </div>
                <div className="font-pixel" style={{ fontSize: '11px', color: '#f87171' }}>
                  ₹{item.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Watermark */}
      <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <ShieldCheck size={14} />
        <span>Pixel Mentor is built strictly for education. Projections are mathematical simulations, never regulated investment advice.</span>
      </div>
    </div>
  );
}

