/**
 * HaloEffect Component
 * Extracted from Framer - Creates animated floating halo circles
 * Multiple color sets with blur effects
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface HaloEffectProps {
  count1?: number;
  count2?: number;
  count3?: number;
  size?: number;
  speed?: number;
  blur?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  className?: string;
}

interface Circle {
  id: number;
  initialX: number;
  initialY: number;
  x: number;
  y: number;
  color: string;
}

export default function HaloEffect({
  count1 = 3,
  count2 = 3,
  count3 = 3,
  size = 300,
  speed = 8,
  blur = 80,
  color1 = 'rgba(120, 120, 180, 0.25)',
  color2 = 'rgba(180, 140, 200, 0.2)',
  color3 = 'rgba(140, 180, 220, 0.18)',
  className
}: HaloEffectProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0) return;

    const createCircles = (count: number, color: string): Circle[] => {
      return Array.from({ length: count }, (_, i) => ({
        id: Math.random() + i,
        initialX: Math.random() * (dimensions.width - size),
        initialY: Math.random() * (dimensions.height - size),
        x: Math.random() * (dimensions.width - size),
        y: Math.random() * (dimensions.height - size),
        color
      }));
    };

    const initialCircles = [
      ...createCircles(count1, color1),
      ...createCircles(count2, color2),
      ...createCircles(count3, color3)
    ];

    setCircles(initialCircles);

    const interval = setInterval(() => {
      setCircles(prevCircles =>
        prevCircles.map(circle => ({
          ...circle,
          x: Math.random() * (dimensions.width - size),
          y: Math.random() * (dimensions.height - size)
        }))
      );
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [size, speed, count1, count2, count3, color1, color2, color3, dimensions]);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {circles.map(circle => (
        <motion.div
          key={circle.id}
          animate={{ x: circle.x, y: circle.y }}
          initial={{ x: circle.initialX, y: circle.initialY }}
          transition={{ duration: speed, ease: 'easeInOut' }}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: circle.color,
            position: 'absolute',
            filter: `blur(${blur}px)`,
            willChange: 'transform'
          }}
        />
      ))}
    </div>
  );
}
