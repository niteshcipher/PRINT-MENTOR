import React from 'react';

export default function PixelButton({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  type = 'button',
  style = {},
  className = '',
  ...props
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'success': return 'pixel-btn-green';
      case 'warning': return 'pixel-btn-gold';
      case 'danger':  return 'pixel-btn-danger';
      case 'primary': return 'pixel-btn-cyan';
      case 'ghost':   return '';
      default:        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { fontSize: '8px', padding: '6px 10px' };
      case 'lg':
        return { fontSize: '12px', padding: '14px 24px' };
      default: // 'md'
        return { fontSize: '10px', padding: '10px 16px' };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`pixel-btn ${getVariantClass()} ${className}`}
      style={{
        ...getSizeStyles(),
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
}

