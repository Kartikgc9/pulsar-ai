/**
 * NumberCounter Component
 * Inspired by Framer NumberCounter - Animated number counting
 * Features: Configurable easing, decimal precision, prefix/suffix
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface NumberCounterProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: boolean;
  autoStart?: boolean;
  loop?: boolean;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
};

export default function NumberCounter({
  from = 0,
  to,
  duration = 2,
  delay = 0,
  easing = 'easeOut',
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = true,
  autoStart = true,
  loop = false,
  onComplete,
  className = '',
  style
}: NumberCounterProps) {
  const [displayValue, setDisplayValue] = useState(from);
  const [isAnimating, setIsAnimating] = useState(false);
  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const formatNumber = useCallback((num: number): string => {
    const fixed = num.toFixed(decimals);
    if (separator) {
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    return fixed;
  }, [decimals, separator]);

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = (timestamp - startTimeRef.current) / 1000;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFunctions[easing](progress);
    const currentValue = from + (to - from) * easedProgress;

    setDisplayValue(currentValue);

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setDisplayValue(to);
      setIsAnimating(false);
      onComplete?.();

      if (loop) {
        setTimeout(() => {
          startTimeRef.current = 0;
          setDisplayValue(from);
          rafRef.current = requestAnimationFrame(animate);
          setIsAnimating(true);
        }, 500);
      }
    }
  }, [from, to, duration, easing, loop, onComplete]);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    startTimeRef.current = 0;
    setDisplayValue(from);

    setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, delay * 1000);
  }, [animate, delay, from, isAnimating]);

  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [autoStart, startAnimation]);

  // Restart animation when 'to' value changes
  useEffect(() => {
    if (autoStart && to !== displayValue) {
      startTimeRef.current = 0;
      setIsAnimating(false);
      setTimeout(() => startAnimation(), 50);
    }
  }, [to]);

  return (
    <motion.span
      className={className}
      style={{
        fontVariantNumeric: 'tabular-nums',
        ...style
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{formatNumber(displayValue)}{suffix}
    </motion.span>
  );
}
