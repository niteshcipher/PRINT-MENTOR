import React from 'react';
import { History } from 'lucide-react';

export default function CoinCounter({
  amount = 0,
  label = 'COINS',
  onClick,
  showHistoryIndicator = true,
  size = 'md',
  style = {}
}) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <div
      onClick={onClick}
      className="pixel-box-gold"
      style={{
        padding: isSmall ? '4px 8px' : isLarge ? '12px 20px' : '8px 14px',
        backgroundColor: '#271b05',
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '6px' : '10px',
        userSelect: 'none',
        ...style
      }}
      title={onClick ? 'Click to inspect Coin Ledger' : undefined}
    >
      <img 
        src="/pixel_coin.svg" 
        alt="Coins" 
        style={{ 
          width: isSmall ? '16px' : isLarge ? '28px' : '20px', 
          height: isSmall ? '16px' : isLarge ? '28px' : '20px' 
        }} 
      />

      <div>
        {label && (
          <div style={{ 
            fontSize: isSmall ? '7px' : isLarge ? '10px' : '8px', 
            color: '#fbbf24', 
            fontWeight: 600,
            lineHeight: 1
          }}>
            {label}
          </div>
        )}
        <div 
          className="font-pixel" 
          style={{ 
            fontSize: isSmall ? '10px' : isLarge ? '16px' : '12px', 
            color: '#fef08a',
            marginTop: '2px'
          }}
        >
          {Number(amount).toLocaleString('en-IN')}
        </div>
      </div>

      {showHistoryIndicator && onClick && (
        <History 
          size={isSmall ? 10 : 13} 
          color="#f59e0b" 
          style={{ marginLeft: '2px', opacity: 0.8 }} 
        />
      )}
    </div>
  );
}

