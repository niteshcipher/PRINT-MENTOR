import React from 'react';
import Mentor from '../pixel/Mentor';
import PixelButton from '../pixel/PixelButton';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'COMMUNICATION PAUSE',
  message = 'Failed to load data from server. Please check your connection and retry.',
  onRetry
}) {
  return (
    <div className="pixel-box-red" style={{ textAlign: 'center', padding: '36px 20px', backgroundColor: '#1c1318' }}>
      <Mentor mood="worried" size={56} animated={false} />
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f87171', margin: '12px 0 6px' }}>
        <AlertTriangle size={16} />
        <h3 className="font-pixel" style={{ fontSize: '12px' }}>{title}</h3>
      </div>
      <p style={{ fontSize: '13px', color: '#fca5a5', maxWidth: '420px', margin: '0 auto 18px', lineHeight: '1.5' }}>
        {message}
      </p>
      {onRetry && (
        <PixelButton variant="danger" size="sm" onClick={onRetry}>
          <RefreshCw size={12} /> RETRY CONNECTION
        </PixelButton>
      )}
    </div>
  );
}

