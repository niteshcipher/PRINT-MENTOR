import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { apiRequest } from '../api/client';
import PixelAvatar from './PixelAvatar';
import { 
  Send, 
  ChevronDown, 
  Sparkles, 
  Cloud, 
  Maximize2, 
  MessageSquare
} from 'lucide-react';

export default function MentorDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mentorMessage, mentorQuestions } = useGameStore();
  
  // By default, keep it as a clean stationary cloud button docked at bottom-right
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState(mentorMessage || "Welcome to Pixel Mentor! I'm your guide to compounding, budgeting, and avoiding scams.");
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [botMood, setBotMood] = useState('idle');

  // If user is already on the full Coach page, hide floating dock to prevent overlay collision
  if (location.pathname.includes('/coach')) {
    return null;
  }

  // Directly navigate to full chat
  const handleGoToChat = () => {
    navigate('/dashboard/coach');
  };

  const handleSendQuestion = async (textToSend) => {
    const text = textToSend || input;
    if (!text || !text.trim() || isSending) return;

    setInput('');
    setIsSending(true);
    setBotMood('thinking');
    setChatMessage(`Consulting mentor on: "${text}"...`);

    try {
      const res = await apiRequest('/coach/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });

      if (res && res.reply) {
        setChatMessage(res.reply);
        setBotMood(res.mood || 'happy');
      } else {
        setChatMessage("I've analyzed your quest! Click to open the full Coach view.");
        setBotMood('idle');
      }
    } catch (e) {
      setChatMessage("Connection drifted. Tap below to chat directly in Coach!");
      setBotMood('worried');
    } finally {
      setIsSending(false);
    }
  };

  // 1. Minimized State: Clean, Normal, Stationary Docked Button (NO FLOATING/BOBBING)
  // Clicking directly opens the full chat as requested!
  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '24px',
        zIndex: 90
      }}>
        <button
          onClick={handleGoToChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 18px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.95) 0%, rgba(79, 70, 229, 0.95) 100%)',
            border: '2px solid #c4b5fd',
            borderRadius: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 15px rgba(139, 92, 246, 0.35)',
            backdropFilter: 'blur(10px)',
            color: '#f8fafc',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(124, 58, 237, 0.6), 0 0 20px rgba(56, 189, 248, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 15px rgba(139, 92, 246, 0.35)';
          }}
          title="Click to open AI Coach Chat"
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PixelAvatar size={26} mood={botMood} />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: '#fef08a' }}>
              <Cloud size={13} fill="#fef08a" />
              <span>PIXEL MENTOR</span>
            </div>
            <div style={{ fontSize: '9px', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MessageSquare size={10} />
              <span>Click to open chat &rarr;</span>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // 2. Expanded State (Stationary, Clean Cloud Widget)
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '24px',
      zIndex: 90,
      maxWidth: '380px',
      width: 'calc(100% - 48px)'
    }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(145deg, rgba(23, 17, 48, 0.96) 0%, rgba(39, 22, 75, 0.94) 50%, rgba(15, 23, 42, 0.98) 100%)',
        border: '2px solid rgba(196, 181, 253, 0.6)',
        borderRadius: '24px 24px 14px 24px',
        padding: '16px 18px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(124, 58, 237, 0.3)',
        backdropFilter: 'blur(16px)',
        color: '#f8fafc'
      }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(196, 181, 253, 0.2)',
          paddingBottom: '10px'
        }}>
          <div 
            onClick={handleGoToChat}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            title="Click to open full chat"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed 0%, #38bdf8 100%)',
              border: '2px solid #e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PixelAvatar size={26} mood={botMood} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cloud size={13} color="#38bdf8" fill="#38bdf8" />
                <span className="font-pixel" style={{ fontSize: '10px', color: '#c4b5fd' }}>
                  PIXEL MENTOR
                </span>
              </div>
              <div style={{ fontSize: '9px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#34d399', borderRadius: '50%', display: 'inline-block' }} />
                <span>ONLINE • CLICK TO OPEN CHAT</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleGoToChat}
              title="Open Full Chat View"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#bae6fd',
                borderRadius: '6px',
                padding: '4px 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Maximize2 size={12} />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              title="Shrink to button"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#bae6fd',
                borderRadius: '6px',
                padding: '4px 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Speech Bubble (Clicking routes directly to full chat) */}
        <div 
          onClick={handleGoToChat}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1.5px solid rgba(167, 139, 250, 0.35)',
            borderRadius: '16px',
            padding: '12px 14px',
            fontSize: '12px',
            lineHeight: '1.5',
            color: '#f1f5f9',
            marginBottom: '12px',
            maxHeight: '140px',
            overflowY: 'auto',
            cursor: 'pointer'
          }}
          title="Click to continue conversation in Coach"
        >
          {isSending ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c4b5fd' }}>
              <span>☁️ Thinking...</span>
            </div>
          ) : (
            <div>"{chatMessage}"</div>
          )}
        </div>

        {/* Suggested Question Chips (Clicking routes directly to full chat with question) */}
        {mentorQuestions && mentorQuestions.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#c4b5fd', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} color="#fbbf24" />
              <span>Suggested Topics:</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {mentorQuestions.slice(0, 2).map((q, idx) => {
                const qText = typeof q === 'string' ? q : (q?.text || q?.question || 'Ask Mentor');
                return (
                  <button
                    key={q?.id || idx}
                    onClick={handleGoToChat}
                    style={{
                      textAlign: 'left',
                      fontSize: '11px',
                      padding: '7px 10px',
                      background: 'rgba(124, 58, 237, 0.18)',
                      border: '1px solid rgba(196, 181, 253, 0.35)',
                      color: '#e0e7ff',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    title="Click to ask in Coach"
                  >
                    <span>💬</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{qText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuestion();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid rgba(167, 139, 250, 0.5)',
            borderRadius: '20px',
            padding: '4px 6px 4px 14px'
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask mentor anything..."
            disabled={isSending}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '12px',
              fontFamily: 'inherit'
            }}
          />

          <button
            type="submit"
            disabled={isSending || !input.trim()}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: input.trim() && !isSending 
                ? 'linear-gradient(135deg, #7c3aed 0%, #38bdf8 100%)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isSending ? 'pointer' : 'default'
            }}
          >
            <Send size={12} />
          </button>
        </form>

      </div>
    </div>
  );
}
