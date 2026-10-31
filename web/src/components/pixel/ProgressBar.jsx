import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  variant = 'green', // 'green' | 'gold' | 'cyan' | 'red'
  height = 10,
  label,
  showValueText = true,
  style = {}
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const getColor = () => {
    switch (variant) {
      case 'gold': return '#f59e0b';
      case 'cyan': return '#06b6d4';
      case 'red':  return '#ef4444';
      default:     return '#10b981';
    }
  };

  return (
    <div style={{ width: '100%', ...style }}>
      {(label || showValueText) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '11px', 
          color: '#cbd5e1', 
          marginBottom: '6px' 
        }}>
          {label && <span>{label}</span>}
          {showValueText && (
            <span className="font-pixel" style={{ fontSize: '9px', color: getColor() }}>
              {percentage}%
            </span>
          )}
        </div>
      )}

      {/* Outer Beveled Pixel Track */}
      <div style={{
        height: `${height}px`,
        backgroundColor: '#090d14',
        border: '2px solid #2d3b4e',
        boxShadow: 'inset 2px 2px 0px 0px #000',
        borderRadius: '1px',
        overflow: 'hidden'
      }}>
        {/* Fill Bar */}
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: getColor(),
          boxShadow: `inset -2px 0px 0px 0px rgba(0, 0, 0, 0.4), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.3)`,
          transition: 'width 0.4s ease-out'
        }} />
      </div>
    </div>
  );
}

