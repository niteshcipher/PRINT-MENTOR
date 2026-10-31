import React from 'react';

export default function PixelCard({
  title,
  badge,
  badgeColor,
  variant = 'default', // 'default' | 'green' | 'gold' | 'cyan' | 'red'
  children,
  footer,
  style = {},
  className = '',
  ...props
}) {
  const getBoxClass = () => {
    switch (variant) {
      case 'green': return 'pixel-box-green';
      case 'gold':  return 'pixel-box-gold';
      case 'cyan':  return 'pixel-box-cyan';
      case 'red':   return 'pixel-box-red';
      default:      return 'pixel-box';
    }
  };

  return (
    <div
      className={`${getBoxClass()} ${className}`}
      style={{
        padding: '20px',
        ...style
      }}
      {...props}
    >
      {(title || badge) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '2px solid rgba(255, 255, 255, 0.08)'
        }}>
          {title && (
            <h3 className="font-pixel" style={{ fontSize: '12px', color: 'var(--color-text)' }}>
              {title}
            </h3>
          )}
          {badge && (
            <span
              className="pixel-badge"
              style={{
                color: badgeColor || 'var(--color-green-light)',
                borderColor: badgeColor || 'var(--color-green-light)'
              }}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '2px solid rgba(255, 255, 255, 0.08)'
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}

