import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { apiRequest } from '../../api/client';
import Term from '../common/Term';
import { BookOpen, Search, Sparkles, CheckCircle2, Coins, ArrowRight, HelpCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export default function LearnTab() {
  const navigate = useNavigate();
  const { user, updateCoinsLocally, setMentorMessage } = useGameStore();
  const [glossary, setGlossary] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('glossary'); // glossary | lessons
  const [level, setLevel] = useState('beginner'); // beginner | intermediate
  
  // Quiz state
  const [activeQuizLesson, setActiveQuizLesson] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [claimingLesson, setClaimingLesson] = useState(null);

  useEffect(() => {
    apiRequest('/glossary').then(data => setGlossary(data || [])).catch(console.error);
    apiRequest('/learn/lessons').then(data => setLessons(data || [])).catch(console.error);
  }, []);

  const handleCompleteLesson = async (lessonId) => {
    setClaimingLesson(lessonId);
    try {
      const res = await apiRequest('/learn/complete', {
        method: 'POST',
        body: JSON.stringify({ lesson_id: lessonId })
      });

      if (res.coins_awarded > 0) {
        updateCoinsLocally(res.coins_awarded);
        setMentorMessage(`Lesson master! You earned +${res.coins_awarded} coins.`);
      }

      // Refresh lessons
      const updated = await apiRequest('/learn/lessons');
      setLessons(updated);
      setActiveQuizLesson(null);
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setClaimingLesson(null);
    }
  };

  const handleStartQuiz = (lesson) => {
    setActiveQuizLesson(lesson);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  const filteredGlossary = glossary.filter(g => 
    g.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.simple && g.simple.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (g.simple_def && g.simple_def.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="pixel-box" style={{ padding: '20px', backgroundColor: '#131929', borderColor: '#38bdf8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="pixel-badge" style={{ color: '#38bdf8', borderColor: '#38bdf8', marginBottom: '6px' }}>
              EXPLAIN-LIKE-I'M-15 & ZERO-LLM GLOSSARY
            </div>
            <h2 className="font-pixel" style={{ fontSize: '15px', color: '#f1f5f9' }}>
              LEARN & DECODE FINANCIAL JARGON
            </h2>
            <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
              Master foundational Indian financial concepts with real-world analogies. Take mini-quizzes on 8 lessons to earn bonus coins!
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Beginner / Intermediate Level Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', padding: '6px 12px', borderRadius: '4px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Mode:</span>
              <button
                onClick={() => setLevel(prev => prev === 'beginner' ? 'intermediate' : 'beginner')}
                className="pixel-btn"
                style={{ fontSize: '9px', padding: '4px 8px', backgroundColor: level === 'beginner' ? '#047857' : '#1e3a8a' }}
              >
                {level === 'beginner' ? '🟢 BEGINNER (ELI15)' : '🔵 INTERMEDIATE'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveSubTab('glossary')}
                className={`pixel-btn ${activeSubTab === 'glossary' ? 'pixel-btn-green' : ''}`}
                style={{ fontSize: '9px' }}
              >
                📚 GLOSSARY ({glossary.length || 30} TERMS)
              </button>
              <button
                onClick={() => setActiveSubTab('lessons')}
                className={`pixel-btn ${activeSubTab === 'lessons' ? 'pixel-btn-green' : ''}`}
                style={{ fontSize: '9px' }}
              >
                ⭐ 8 LESSONS & QUIZZES
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: GLOSSARY */}
      {activeSubTab === 'glossary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search Bar */}
          <div className="pixel-box" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#161f30' }}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search terms: 'SIP', 'Index Fund', 'Inflation', 'SEBI', 'Emergency Fund'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '14px', outline: 'none' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="pixel-btn" style={{ padding: '2px 8px', fontSize: '8px' }}>
                CLEAR
              </button>
            )}
          </div>

          {/* Cards Grid */}
          {filteredGlossary.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredGlossary.map((item, idx) => {
                const defText = level === 'beginner' 
                  ? (item.simple || item.simple_def) 
                  : (item.intermediate || item.intermediate_def);

                return (
                  <div key={idx} className="pixel-box" style={{ padding: '20px', backgroundColor: '#131b28', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 className="font-pixel" style={{ fontSize: '12px', color: '#38bdf8' }}>
                          {item.term}
                        </h3>
                        <span className="pixel-badge" style={{ color: level === 'beginner' ? '#34d399' : '#60a5fa', borderColor: level === 'beginner' ? '#34d399' : '#60a5fa', fontSize: '7px' }}>
                          {level.toUpperCase()}
                        </span>
                      </div>

                      {/* Dynamic definition according to level */}
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ fontSize: '13px', color: '#f1f5f9', lineHeight: '1.5' }}>
                          {defText}
                        </p>
                      </div>

                      {/* Analogy */}
                      {item.analogy && (
                        <div style={{ padding: '10px 12px', backgroundColor: '#1d273a', borderLeft: '3px solid #fbbf24', marginBottom: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600, marginBottom: '2px' }}>
                            💡 REAL LIFE ANALOGY:
                          </div>
                          <p style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: '1.4' }}>
                            "{item.analogy}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #233045', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate('/dashboard/coach')}
                        className="pixel-btn"
                        style={{ fontSize: '8px', padding: '4px 8px' }}
                      >
                        ASK MENTOR ABOUT THIS <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pixel-box" style={{ padding: '32px', textAlign: 'center', backgroundColor: '#131b28' }}>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
                No glossary entry matched "{searchQuery}".
              </p>
              <button
                onClick={() => navigate('/dashboard/coach')}
                className="pixel-btn pixel-btn-gold"
                style={{ fontSize: '10px', padding: '10px 20px' }}
              >
                ASK PIXEL MENTOR ABOUT "{searchQuery}" <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: BITE-SIZED LESSONS & QUIZZES */}
      {activeSubTab === 'lessons' && (
        <div>
          {/* Active Mini-Quiz Modal / Box */}
          {activeQuizLesson && activeQuizLesson.quiz && (
            <div className="pixel-box-gold" style={{ padding: '24px', backgroundColor: '#1b1b26', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="font-pixel" style={{ fontSize: '12px', color: '#fbbf24' }}>
                  🎯 MINI-QUIZ: {activeQuizLesson.title.toUpperCase()}
                </span>
                <button onClick={() => setActiveQuizLesson(null)} className="pixel-btn" style={{ fontSize: '8px', padding: '2px 8px' }}>
                  CANCEL
                </button>
              </div>

              <h4 style={{ fontSize: '14px', color: '#f8fafc', fontWeight: 600, marginBottom: '16px' }}>
                {activeQuizLesson.quiz.question}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {activeQuizLesson.quiz.options.map((option, idx) => {
                  let btnBg = '#1e293b';
                  if (quizSubmitted) {
                    if (idx === activeQuizLesson.quiz.correct) btnBg = '#065f46';
                    else if (idx === selectedQuizOption) btnBg = '#7f1d1d';
                  } else if (idx === selectedQuizOption) {
                    btnBg = '#1e3a8a';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizSubmitted}
                      onClick={() => setSelectedQuizOption(idx)}
                      className="pixel-btn"
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontSize: '12px',
                        backgroundColor: btnBg
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted ? (
                <div>
                  <div style={{ padding: '12px', backgroundColor: selectedQuizOption === activeQuizLesson.quiz.correct ? '#064e3b' : '#7f1d1d', borderRadius: '4px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                      {selectedQuizOption === activeQuizLesson.quiz.correct ? "✅ Correct Answer!" : "❌ Incorrect Answer"}
                    </div>
                    <div style={{ fontSize: '11px', color: '#e2e8f0' }}>
                      {activeQuizLesson.quiz.explanation}
                    </div>
                  </div>

                  {selectedQuizOption === activeQuizLesson.quiz.correct ? (
                    <button
                      onClick={() => handleCompleteLesson(activeQuizLesson.id)}
                      disabled={claimingLesson === activeQuizLesson.id}
                      className="pixel-btn pixel-btn-green"
                      style={{ width: '100%', padding: '12px', fontSize: '11px' }}
                    >
                      {claimingLesson === activeQuizLesson.id ? "CLAIMING REWARD..." : `CLAIM +${activeQuizLesson.coins_reward} COINS`}
                    </button>
                  ) : (
                    <button
                      onClick={() => { setQuizSubmitted(false); setSelectedQuizOption(null); }}
                      className="pixel-btn"
                      style={{ width: '100%', padding: '10px', fontSize: '10px' }}
                    >
                      TRY AGAIN
                    </button>
                  )}
                </div>
              ) : (
                <button
                  disabled={selectedQuizOption === null}
                  onClick={() => setQuizSubmitted(true)}
                  className="pixel-btn pixel-btn-gold"
                  style={{ width: '100%', padding: '12px', fontSize: '11px', opacity: selectedQuizOption === null ? 0.5 : 1 }}
                >
                  SUBMIT ANSWER
                </button>
              )}
            </div>
          )}

          {/* 8 Lessons Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {lessons.map((lesson) => (
              <div key={lesson.id} className="pixel-box" style={{ padding: '22px', backgroundColor: '#141d2c', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="pixel-badge" style={{ color: '#38bdf8', borderColor: '#38bdf8' }}>
                      {lesson.category} • {lesson.duration}
                    </span>
                    {lesson.completed ? (
                      <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> COMPLETED
                      </span>
                    ) : (
                      <span className="pixel-badge" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>
                        +{lesson.coins_reward} COINS
                      </span>
                    )}
                  </div>

                  <h3 className="font-pixel" style={{ fontSize: '13px', color: '#f1f5f9', marginBottom: '12px' }}>
                    {lesson.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '16px' }}>
                    {lesson.content}
                  </p>

                  <div style={{ padding: '10px', backgroundColor: '#1b263b', borderLeft: '3px solid #10b981', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 600 }}>KEY TAKEAWAY: </span>
                    <span style={{ fontSize: '11px', color: '#e2e8f0' }}>{lesson.takeaway}</span>
                  </div>
                </div>

                <div>
                  {lesson.completed ? (
                    <button disabled className="pixel-btn" style={{ width: '100%', opacity: 0.6, cursor: 'default' }}>
                      COMPLETED (REWARD CLAIMED)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(lesson)}
                      className="pixel-btn pixel-btn-gold"
                      style={{ width: '100%' }}
                    >
                      TAKE MINI-QUIZ & CLAIM +{lesson.coins_reward} COINS
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
