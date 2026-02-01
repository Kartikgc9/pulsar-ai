/**
 * GlassyButton Component
 * Inspired by Framer Glassy Button - Glass morphism with interactive states
 * Features: Gradient backgrounds, inset/drop shadows, spring animations, click sound
 */

import { motion } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface GlassyButtonProps {
  children?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withSound?: boolean;
}

export default function GlassyButton({
  children,
  icon,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  className = '',
  withSound = false
}: GlassyButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = () => {
    if (disabled) return;

    // Play click sound if enabled
    if (withSound) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleS09teleaS09tel');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}
    }

    onClick?.();
  };

  const sizeStyles = {
    sm: { padding: '10px 20px', fontSize: '14px', minHeight: '40px' },
    md: { padding: '14px 28px', fontSize: '16px', minHeight: '52px' },
    lg: { padding: '18px 36px', fontSize: '18px', minHeight: '64px' }
  };

  const variantStyles = {
    default: {
      background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      border: '1px solid rgba(255,255,255,0.6)',
      color: '#000000',
      boxShadow: `
        0 1px 2px rgba(0,0,0,0.05),
        0 4px 12px rgba(0,0,0,0.08),
        inset 0 1px 0 rgba(255,255,255,0.8),
        inset 0 -1px 0 rgba(0,0,0,0.05)
      `
    },
    dark: {
      background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#ffffff',
      boxShadow: `
        0 1px 2px rgba(0,0,0,0.2),
        0 4px 12px rgba(0,0,0,0.3),
        inset 0 1px 0 rgba(255,255,255,0.1),
        inset 0 -1px 0 rgba(0,0,0,0.2)
      `
    },
    light: {
      background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.9) 100%)',
      border: '1px solid rgba(0,0,0,0.08)',
      color: '#000000',
      boxShadow: `
        0 1px 2px rgba(0,0,0,0.04),
        0 4px 12px rgba(0,0,0,0.06),
        inset 0 1px 0 rgba(255,255,255,1),
        inset 0 -1px 0 rgba(0,0,0,0.03)
      `
    }
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={className}
      style={{
        ...currentSize,
        ...currentVariant,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        outline: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
      whileHover={disabled ? {} : {
        scale: 1.02,
        boxShadow: `
          0 2px 4px rgba(0,0,0,0.08),
          0 8px 24px rgba(0,0,0,0.12),
          inset 0 1px 0 rgba(255,255,255,0.9),
          inset 0 -1px 0 rgba(0,0,0,0.05)
        `
      }}
      whileTap={disabled ? {} : {
        scale: 0.98,
        opacity: 0.9
      }}
      transition={{
        type: 'spring',
        duration: 0.4,
        bounce: 0.1
      }}
    >
      {/* Shine effect overlay */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
          borderRadius: 'inherit',
          pointerEvents: 'none'
        }}
        initial={{ opacity: 0.5 }}
        whileHover={{ opacity: 0.8 }}
      />

      {/* Content */}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        {children}
      </span>
    </motion.button>
  );
}
