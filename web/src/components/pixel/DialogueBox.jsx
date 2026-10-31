import React, { useState, useEffect } from 'react';
import Mentor from './Mentor';

export default function DialogueBox({
  speaker = 'PIXEL MENTOR',
  text = '',
  speed = 25,
  mood = 'idle',
  onComplete,
  actions,
  style = {}
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  const handleSkip = () => {
    setDisplayedText(text);
    setIsTyping(false);
    if (onComplete) onComplete();
  };

  return (
    <div
      className="pixel-box"
      onClick={isTyping ? handleSkip : undefined}
      style={{
        padding: '18px 20px',
        backgroundColor: '#121826',
        borderColor: '#7c3aed',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(124, 58, 237, 0.2)',
        cursor: isTyping ? 'pointer' : 'default',
        ...style
      }}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {/* Character Portrait with Mood */}
        <div style={{ flexShrink: 0 }}>
          <Mentor mood={mood} size={48} animated={true} />
        </div>

        {/* Dialogue Text Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-pixel" style={{ fontSize: '11px', color: '#c4b5fd' }}>
              {speaker}
            </span>
            {isTyping && (
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>
                [Click to skip]
              </span>
            )}
          </div>

          <p style={{
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#f8fafc',
            minHeight: '40px'
          }}>
            {displayedText}
            {isTyping && <span className="typewriter-cursor">|</span>}
            {!isTyping && <span className="typewriter-cursor">▼</span>}
          </p>

          {actions && !isTyping && (
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

