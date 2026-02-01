/**
 * GlassmorphicBackground Component
 * Inspired by Framer GlassmorphicPlayer - Audio player style background
 * Features: Floating orbs, glass layers, subtle animations
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import HaloEffect from './HaloEffect';

interface GlassmorphicBackgroundProps {
  variant?: 'minimal' | 'ambient' | 'dynamic';
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  showOrbs?: boolean;
  showNoise?: boolean;
  className?: string;
}

export default function GlassmorphicBackground({
  variant = 'ambient',
  primaryColor = 'rgba(120, 120, 180, 0.25)',
  secondaryColor = 'rgba(180, 140, 200, 0.2)',
  tertiaryColor = 'rgba(140, 180, 220, 0.18)',
  showOrbs = true,
  showNoise = true,
  className = ''
}: GlassmorphicBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (variant !== 'dynamic') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [variant]);

  const orbConfig = {
    minimal: { count1: 2, count2: 2, count3: 1, size: 350, speed: 15, blur: 100 },
    ambient: { count1: 3, count2: 3, count3: 2, size: 400, speed: 10, blur: 80 },
    dynamic: { count1: 4, count2: 4, count3: 3, size: 300, speed: 6, blur: 70 }
  };

  const config = orbConfig[variant];

  return (
    <div
      className={`fixed inset-0 overflow-hidden ${className}`}
      style={{ background: '#ffffff', zIndex: 0 }}
    >
      {/* Base gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background: variant === 'dynamic'
            ? `radial-gradient(ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(0,0,0,0.02) 0%, transparent 50%)`
            : 'transparent'
        }}
      />

      {/* Halo orbs */}
      {showOrbs && (
        <HaloEffect
          count1={config.count1}
          count2={config.count2}
          count3={config.count3}
          size={config.size}
          speed={config.speed}
          blur={config.blur}
          color1={primaryColor}
          color2={secondaryColor}
          color3={tertiaryColor}
        />
      )}

      {/* Floating glass panels for depth */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: '40%',
          height: '30%',
          left: '5%',
          top: '10%',
          background: 'linear-gradient(135deg, rgba(160, 140, 200, 0.4) 0%, rgba(100, 150, 220, 0.2) 100%)',
          borderRadius: '40px',
          filter: 'blur(60px)',
          opacity: 0.7
        }}
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -15, 10, 0],
          scale: [1, 1.05, 0.98, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: '35%',
          height: '40%',
          right: '10%',
          bottom: '15%',
          background: 'linear-gradient(225deg, rgba(200, 160, 180, 0.35) 0%, rgba(120, 180, 200, 0.15) 100%)',
          borderRadius: '50px',
          filter: 'blur(70px)',
          opacity: 0.65
        }}
        animate={{
          x: [0, -15, 20, 0],
          y: [0, 20, -10, 0],
          scale: [1, 0.95, 1.03, 1]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
      />

      {/* Central ambient glow */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: '60%',
          height: '60%',
          left: '20%',
          top: '20%',
          background: 'radial-gradient(circle, rgba(150, 130, 190, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Noise texture overlay */}
      {showNoise && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
      )}

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.03) 100%)'
        }}
      />
    </div>
  );
}
