import React from 'react';
import Mentor from '../pixel/Mentor';

export default function LoadingState({ message = 'LOADING PIXEL ENGINE...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <Mentor mood="thinking" size={64} animated={true} />
      <div className="font-pixel" style={{ fontSize: '11px', color: '#38bdf8' }}>
        {message}
      </div>
      <div style={{ width: '120px', height: '6px', backgroundColor: '#161f30', border: '1px solid #334155', borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{ width: '60%', height: '100%', backgroundColor: '#10b981', animation: 'cursor-blink 1s infinite' }} />
      </div>
    </div>
  );
}

