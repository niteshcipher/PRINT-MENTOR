import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import PixelButton from './PixelButton';

export default function Modal({
  isOpen = false,
  onClose,
  title = 'DIALOGUE',
  children,
  maxWidth = '520px',
  variant = 'gold' // 'gold' | 'green' | 'cyan' | 'default'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getBoxClass = () => {
    switch (variant) {
      case 'green': return 'pixel-box-green';
      case 'gold':  return 'pixel-box-gold';
      case 'cyan':  return 'pixel-box-cyan';
      default:      return 'pixel-box';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className={getBoxClass()} 
        style={{ 
          width: '100%', 
          maxWidth, 
          backgroundColor: '#131924', 
          padding: '22px' 
        }}
      >
        {/* Title Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
          paddingBottom: '10px',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 className="font-pixel" style={{ fontSize: '12px', color: '#fbbf24' }}>
            {title}
          </h3>

          <PixelButton
            onClick={onClose}
            size="sm"
            style={{ padding: '4px 8px' }}
          >
            <X size={12} />
          </PixelButton>
        </div>

        {/* Modal Body */}
        <div>{children}</div>
      </div>
    </div>
  );
}

