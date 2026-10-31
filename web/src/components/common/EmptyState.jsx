import React from 'react';
import Mentor from '../pixel/Mentor';
import PixelButton from '../pixel/PixelButton';

export default function EmptyState({
  title = 'NO DATA LOGGED YET',
  message = 'Nothing recorded here yet. Start your journey by logging an entry or running a simulation!',
  actionText,
  onAction,
  mood = 'idle'
}) {
  return (
    <div className="pixel-box" style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#131b28' }}>
      <Mentor mood={mood} size={56} animated={false} />
      <h3 className="font-pixel" style={{ fontSize: '12px', color: '#f8fafc', marginTop: '12px', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '420px', margin: '0 auto 18px', lineHeight: '1.5' }}>
        {message}
      </p>
      {actionText && onAction && (
        <PixelButton variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </PixelButton>
      )}
    </div>
  );
}

