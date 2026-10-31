import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { apiRequest } from '../../api/client';
import PixelAvatar from '../PixelAvatar';
import DialogueBox from '../pixel/DialogueBox';
import { Send, Bot, ShieldAlert, Sparkles, User, HelpCircle, Award, CheckCircle, Trash2, RotateCcw } from 'lucide-react';

const QUICK_CHIPS = [
  "Explain SIP",
  "Review my budget",
  "Is this tip safe?",
  "Emergency Fund armor"
];

export default function CoachTab() {
  const { user, updateCoinsLocally } = useGameStore();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Greetings, ${user?.personality || 'adventurer'}! I am Pixel Mentor, your personal financial guide. Ask me anything about budgeting, emergency funds, compounding, or evaluating risks!`,
      disclaimer: 'Educational commentary only, never financial advice.',
      mood: 'idle'
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentMood, setCurrentMood] = useState('idle'); // idle | thinking | happy | worried
  const chatBottomRef = useRef(null);

  // Part 14: Dashboard Analysis Q&A state
  const [qaQuestions, setQaQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [qaAnswers, setQaAnswers] = useState({});
  const [customAnswer, setCustomAnswer] = useState('');
  const [qaCompleted, setQaCompleted] = useState(false);
  const [qaSummary, setQaSummary] = useState(null);
  const [showQAModal, setShowQAModal] = useState(false);

  const fetchHistoryAndQuestions = async () => {
    try {
      const [hist, qData] = await Promise.all([
        apiRequest('/coach/history'),
        apiRequest('/coach/questions')
      ]);
      if (hist && hist.length > 0) {
        setMessages(hist);
      }
      if (qData?.questions) {
        setQaQuestions(qData.questions);
      }
    } catch (e) {
      console.warn("Could not load coach data", e);
    }
  };

  const [clearingChat, setClearingChat] = useState(false);

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear your AI chat history? This will reset the conversation with your Pixel Mentor.")) {
      return;
    }
    setClearingChat(true);
    try {
      await apiRequest('/coach/history', { method: 'DELETE' });
      setMessages([
        {
          role: 'assistant',
          content: `Chat memory reset! Greetings, ${user?.personality || 'adventurer'}! I am Pixel Mentor, your personal financial guide. Ask me anything!`,
          disclaimer: 'Educational commentary only, never financial advice.',
          mood: 'idle'
        }
      ]);
      setCurrentMood('idle');
    } catch (e) {
      console.warn("Could not delete from server, clearing local state", e);
      setMessages([
        {
          role: 'assistant',
          content: `Chat memory reset! Greetings, ${user?.personality || 'adventurer'}! Ask me anything about budgeting or investing!`,
          disclaimer: 'Educational commentary only, never financial advice.',
          mood: 'idle'
        }
      ]);
      setCurrentMood('idle');
    } finally {
      setClearingChat(false);
    }
  };

  useEffect(() => {
    fetchHistoryAndQuestions();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isSending) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);
    setCurrentMood('thinking');

    try {
      const res = await apiRequest('/coach/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });

      const replyMood = res.mood || 'idle';
      setCurrentMood(replyMood);

      // Add response with typing / streaming feel
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.reply, disclaimer: res.disclaimer, mood: replyMood }
      ]);
    } catch (err) {
      setCurrentMood('worried');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "System pause: Mentor is reviewing the financial scrolls. Try asking again!",
          disclaimer: 'Educational commentary only.'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Part 14: Answer Q&A question
  const handleSelectQAAnswer = async (answerText) => {
    const currentQ = qaQuestions[currentQIndex];
    const newAnswers = { ...qaAnswers, [currentQ.id]: answerText };
    setQaAnswers(newAnswers);
    setCustomAnswer('');

    if (currentQIndex + 1 < qaQuestions.length) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Completed all questions! Submit to backend
      try {
        const res = await apiRequest('/coach/answers', {
          method: 'POST',
          body: JSON.stringify({ answers: newAnswers })
        });
        if (res.coins_awarded > 0) {
          updateCoinsLocally(res.coins_awarded);
        }
        setQaSummary(res);
        setQaCompleted(true);
        setCurrentMood('happy');
      } catch (e) {
        alert("Failed to save insights: " + e.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner & Status */}
      <div className="pixel-box" style={{ padding: '16px 20px', backgroundColor: '#181b33', borderColor: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="animate-mentor">
            <PixelAvatar size={42} mood={currentMood} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="font-pixel" style={{ fontSize: '13px', color: '#c7d2fe' }}>
                AI COACH • PIXEL MENTOR
              </h2>
              <span className="pixel-badge" style={{ color: '#38bdf8', borderColor: '#38bdf8', fontSize: '8px' }}>
                MOOD: {currentMood.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Profile Context: {user?.category || 'Student'} • {user?.personality || 'Safe Saver'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleClearChat}
            disabled={clearingChat}
            className="pixel-btn pixel-btn-danger"
            style={{ fontSize: '9px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            title="Clear AI Coach chat history"
          >
            <Trash2 size={12} /> {clearingChat ? "CLEARING..." : "CLEAR CHAT"}
          </button>

          <button
            onClick={() => setShowQAModal(true)}
            className="pixel-btn pixel-btn-gold"
            style={{ fontSize: '9px', padding: '6px 12px' }}
          >
            <HelpCircle size={12} /> {qaCompleted ? "VIEW MENTOR INSIGHTS" : "TAKE ANALYSIS Q&A (+25 🪙)"}
          </button>
        </div>
      </div>

      {/* Part 14: Analysis Q&A Dialogue Walkthrough Box */}
      {showQAModal && (
        <div className="pixel-box-gold" style={{ padding: '20px', backgroundColor: '#1e1b12' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="font-pixel" style={{ fontSize: '11px', color: '#fbbf24' }}>
              🧙 MENTOR ANALYSIS Q&A ({currentQIndex + 1}/{qaQuestions.length || 4})
            </span>
            <button onClick={() => setShowQAModal(false)} className="pixel-btn" style={{ fontSize: '8px', padding: '2px 8px' }}>
              CLOSE
            </button>
          </div>

          {!qaCompleted && qaQuestions.length > 0 ? (
            <div>
              <DialogueBox
                speaker="Pixel Mentor"
                text={qaQuestions[currentQIndex]?.text || "Analyzing numbers..."}
                mood="thinking"
              />

              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '11px', color: '#fde68a', marginBottom: '8px' }}>SELECT AN ANSWER CHIP:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {qaQuestions[currentQIndex]?.chips?.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectQAAnswer(chip)}
                      className="pixel-btn"
                      style={{ fontSize: '10px', padding: '8px 12px', backgroundColor: '#1e293b' }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    placeholder="Or type custom answer..."
                    style={{ flex: 1, padding: '8px 12px', backgroundColor: '#131b29', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                  />
                  <button
                    disabled={!customAnswer.trim()}
                    onClick={() => handleSelectQAAnswer(customAnswer)}
                    className="pixel-btn pixel-btn-green"
                    style={{ fontSize: '9px', padding: '0 14px' }}
                  >
                    SUBMIT
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉🪙✨</div>
              <h4 className="font-pixel" style={{ fontSize: '12px', color: '#34d399', marginBottom: '6px' }}>
                INSIGHTS CALIBRATED! +25 COINS AWARDED
              </h4>
              <p style={{ fontSize: '12px', color: '#fef08a', lineHeight: '1.5', maxWidth: '600px', margin: '0 auto 14px' }}>
                "{qaSummary?.summary || "Your answers are now woven into the mentor's coaching scrolls."}"
              </p>
              <button onClick={() => setShowQAModal(false)} className="pixel-btn pixel-btn-green" style={{ fontSize: '10px' }}>
                CONTINUE TO COACH CHAT
              </button>
            </div>
          )}
        </div>
      )}

      {/* Part 13: Quick-Reply Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="pixel-btn"
            style={{ fontSize: '9px', whiteSpace: 'nowrap', padding: '6px 12px', backgroundColor: '#1e293b' }}
          >
            <Sparkles size={11} color="#f59e0b" />
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="pixel-box" style={{ 
        height: '460px', 
        padding: '20px', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '14px',
        backgroundColor: '#0f1422'
      }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {!isUser && (
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  <PixelAvatar size={30} mood={msg.mood || 'idle'} />
                </div>
              )}

              <div>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: isUser ? '#1e3a8a' : '#1e293b',
                  border: `2px solid ${isUser ? '#3b82f6' : '#334155'}`,
                  borderRadius: '4px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  boxShadow: '2px 2px 0px 0px #000'
                }}>
                  {msg.content}
                </div>

                {msg.disclaimer && (
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px', textAlign: isUser ? 'right' : 'left' }}>
                    ⚖️ {msg.disclaimer}
                  </div>
                )}
              </div>

              {isUser && (
                <div style={{ flexShrink: 0, width: '28px', height: '28px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                  <User size={16} color="#fff" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <PixelAvatar size={30} mood="thinking" />
            <div style={{ padding: '10px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#94a3b8', fontSize: '12px' }}>
              <span className="font-pixel" style={{ fontSize: '9px' }}>MENTOR IS THINKING & CONSULTING SCROLLS...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{ display: 'flex', gap: '10px' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask mentor: 'How much in emergency fund?' or 'Explain SIP vs FD'..."
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: '#131b29',
            border: '2px solid #334155',
            color: '#fff',
            fontSize: '13px',
            borderRadius: '2px'
          }}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="pixel-btn pixel-btn-green"
          style={{ padding: '0 20px', fontSize: '10px' }}
        >
          <Send size={14} /> SEND
        </button>
      </form>
    </div>
  );
}
