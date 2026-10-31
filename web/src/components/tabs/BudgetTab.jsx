import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { apiRequest } from '../../api/client';
import PixelButton from '../pixel/PixelButton';
import PixelCard from '../pixel/PixelCard';
import ProgressBar from '../pixel/ProgressBar';
import DialogueBox from '../pixel/DialogueBox';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';
import { 
  PlusCircle, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  Briefcase, 
  Calendar,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';

const CATEGORY_COLORS = {
  Food: '#10b981',
  Transport: '#06b6d4',
  Bills: '#f59e0b',
  Entertainment: '#8b5cf6',
  Shopping: '#ec4899',
  Investments: '#3b82f6',
  Other: '#64748b'
};

export default function BudgetTab() {
  const { user, updateCoinsLocally, fetchCoins } = useGameStore();

  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, expRes] = await Promise.all([
        apiRequest('/budget/summary'),
        apiRequest('/expenses?limit=30')
      ]);
      setSummary(sumRes);
      setExpenses(expRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(amount),
          category,
          description: note || 'Variable expense'
        })
      });

      if (res.coins_earned > 0) {
        updateCoinsLocally(res.coins_earned);
        setFeedbackMsg(`Logged ₹${amount}! Earned +${res.coins_earned} Coins!`);
      } else {
        setFeedbackMsg(`Logged ₹${amount}! (Daily 5-log coin limit reached)`);
      }

      setAmount('');
      setNote('');

      // Refresh data inline without full reload
      const [newSum, newExp] = await Promise.all([
        apiRequest('/budget/summary'),
        apiRequest('/expenses?limit=30')
      ]);
      setSummary(newSum);
      setExpenses(newExp);
      fetchCoins();
    } catch (err) {
      setFeedbackMsg("Failed to add: " + err.message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await apiRequest(`/expenses/${id}`, { method: 'DELETE' });
      // Remove from list and update summary
      setExpenses(prev => prev.filter(e => e.id !== id));
      const newSum = await apiRequest('/budget/summary');
      setSummary(newSum);
    } catch (err) {
      alert("Failed to delete expense: " + err.message);
    }
  };

  if (loading && !summary) {
    return <LoadingState message="COMPUTING PYTHON BUDGET RATIOS..." />;
  }

  if (error && !summary) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  // Prepare donut chart data
  const donutData = summary?.categories
    ?.filter(c => c.spent > 0)
    ?.map(c => ({
      name: c.category,
      value: c.spent,
      color: CATEGORY_COLORS[c.category] || '#94a3b8'
    })) || [];

  const isGig = summary?.gig_mode?.is_gig;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Mentor Overbudget Warning Banner */}
      {summary?.has_overbudget && (
        <DialogueBox
          speaker="PIXEL MENTOR"
          mood="worried"
          text={summary.mentor_alert || "Warning: One or more categories have exceeded your planned limit!"}
          speed={15}
        />
      )}

      {/* TOP GIG-MODE OR REGULAR HERO CARD */}
      <PixelCard 
        variant={isGig ? 'gold' : 'green'} 
        title={isGig ? "GIG-WORKER & FREELANCE MODE" : "MONTHLY 50/30/20 BUDGET DASHBOARD"}
        badge={isGig ? "ACTIVE LEAN-BUFFER" : "SALARIED STANDARD"}
        badgeColor={isGig ? "#fbbf24" : "#34d399"}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '640px', lineHeight: '1.5' }}>
              {isGig 
                ? "Your baseline uses your lean-month earnings. Surpluses from good gigs are locked into a cushion buffer so slow months never force you into high-interest debt."
                : "Tracking your needs, wants, and savings. Aim to keep non-negotiable living costs below 50% and allocate 20% into compounding investments."}
            </p>
          </div>

          {/* Safe To Spend Today metric */}
          <div className="pixel-box" style={{ padding: '14px 20px', backgroundColor: '#111827', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>
              SAFE TO SPEND TODAY
            </div>
            <div className="font-pixel" style={{ fontSize: '18px', color: isGig ? '#fbbf24' : '#38bdf8', marginTop: '4px' }}>
              ₹{summary?.gig_mode?.safe_to_spend_today?.toLocaleString('en-IN') || 0}
            </div>
            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
              Post-rent & buffer allocation
            </div>
          </div>
        </div>
      </PixelCard>

      {/* GRID: QUICK-ADD EXPENSE FORM + DONUT CHART */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* QUICK ADD EXPENSE FORM */}
        <PixelCard title="LOG EXPENSE (+5 COINS)" variant="default">
          <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Amount (₹):</label>
                <input
                  type="number"
                  placeholder="e.g. 180"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', border: '1px solid #334155', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', border: '1px solid #334155', color: '#fff', fontSize: '13px' }}
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Transport">Transport / Metro</option>
                  <option value="Bills">Bills & Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Investments">Investments / SIP</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Note / Memo:</label>
              <input
                type="text"
                placeholder="e.g. Metro card recharge or college chai"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', border: '1px solid #334155', color: '#fff', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#131b29', border: '1px solid #334155', color: '#fff', fontSize: '13px' }}
              />
            </div>

            <PixelButton
              type="submit"
              variant="success"
              size="md"
              disabled={isSubmitting}
              style={{ marginTop: '4px' }}
            >
              <PlusCircle size={14} /> {isSubmitting ? "LOGGING..." : "RECORD EXPENSE"}
            </PixelButton>

            {feedbackMsg && (
              <div style={{ padding: '8px 12px', backgroundColor: '#064e3b', color: '#a7f3d0', fontSize: '12px', borderLeft: '3px solid #10b981' }}>
                {feedbackMsg}
              </div>
            )}
          </form>
        </PixelCard>

        {/* DONUT BREAKDOWN CHART */}
        <PixelCard title="SPENDING BREAKDOWN" variant="default">
          {donutData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '12px' }}>
              No expenses recorded for this month yet. Log your first expense on the left to activate visual charts!
            </div>
          ) : (
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#161f30" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#131b29', borderColor: '#334155', fontSize: '11px' }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </PixelCard>
      </div>

      {/* BUDGET-VS-ACTUAL BARS */}
      <PixelCard title="BUDGET ALLOCATIONS VS ACTUAL SPENT" variant="default">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {summary?.categories?.map((cat) => {
            const isOver = cat.is_overbudget;
            return (
              <div key={cat.category} className="pixel-box" style={{ padding: '14px', backgroundColor: '#151d2a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="font-pixel" style={{ fontSize: '11px', color: '#f8fafc' }}>{cat.category}</span>
                  {isOver ? (
                    <span className="pixel-badge" style={{ color: '#ef4444', borderColor: '#ef4444' }}>OVER LIMIT</span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#10b981' }}>{cat.percentage_used}% used</span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>
                  <span>Spent: ₹{cat.spent.toLocaleString('en-IN')}</span>
                  <span>Limit: ₹{cat.allocated.toLocaleString('en-IN')}</span>
                </div>

                <ProgressBar 
                  value={cat.spent} 
                  max={cat.allocated || 1} 
                  variant={isOver ? 'red' : cat.percentage_used > 80 ? 'gold' : 'green'}
                  showValueText={false}
                  height={8}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  <span>Remaining:</span>
                  <span style={{ color: isOver ? '#f87171' : '#34d399', fontWeight: 600 }}>
                    ₹{cat.remaining.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </PixelCard>

      {/* RECENT EXPENSES WITH DELETE */}
      <PixelCard title="RECENT EXPENSE TRANSACTIONS" variant="default">
        {expenses.length === 0 ? (
          <EmptyState 
            title="NO TRANSACTIONS LOGGED"
            message="Your ledger is currently empty. Use the quick-add form above to start tracking."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {expenses.slice(0, 10).map((item) => (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: '#161f30',
                  borderLeft: `3px solid ${CATEGORY_COLORS[item.category] || '#38bdf8'}`
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                    {item.category} • <span style={{ color: '#cbd5e1', fontWeight: 400 }}>{item.description}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                    {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span className="font-pixel" style={{ fontSize: '12px', color: '#f87171' }}>
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                    title="Delete expense"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PixelCard>
    </div>
  );
}
