import React, { useState } from 'react';

export default function Tooltip({
  content,
  position = 'top', // 'top' | 'bottom' | 'left' | 'right'
  children
}) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom':
        return {
          top: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          right: 'calc(100% + 8px)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          left: 'calc(100% + 8px)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
      default: // 'top'
        return {
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
    }
  };

  return (
    <div
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}

      {isVisible && (
        <div
          className="pixel-box"
          style={{
            position: 'absolute',
            zIndex: 50,
            whiteSpace: 'nowrap',
            padding: '6px 10px',
            fontSize: '11px',
            color: '#f8fafc',
            backgroundColor: '#151c28',
            borderColor: '#38bdf8',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            ...getPositionStyles()
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

