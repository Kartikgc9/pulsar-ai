/**
 * Dock Component
 * Inspired by Framer Dock - macOS-style dock with hover animations
 * Features: Icon scaling on hover, glass morphism, spring animations
 */

import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface DockItemProps {
  icon: ReactNode;
  label?: string;
  onClick?: () => void;
  active?: boolean;
}

interface DockProps {
  items: DockItemProps[];
  backgroundColor?: string;
  backgroundBlur?: number;
  className?: string;
  position?: 'bottom' | 'top';
}

function DockItem({ icon, label, onClick, active, index, hoveredIndex, setHoveredIndex }: DockItemProps & {
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}) {
  // Calculate scale based on distance from hovered item
  const getScale = () => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.4;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.05;
    return 1;
  };

  const scale = getScale();

  return (
    <motion.div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Label tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{
          opacity: hoveredIndex === index ? 1 : 0,
          y: hoveredIndex === index ? -8 : 10,
          scale: hoveredIndex === index ? 1 : 0.8
        }}
        transition={{ type: 'spring', duration: 0.2, bounce: 0.3 }}
        className="absolute -top-10 whitespace-nowrap pointer-events-none"
        style={{
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          backdropFilter: 'blur(10px)'
        }}
      >
        {label}
      </motion.div>

      {/* Icon container */}
      <motion.div
        animate={{ scale, y: hoveredIndex === index ? -8 : 0 }}
        transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: active
            ? 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.85) 100%)',
          boxShadow: active
            ? '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
          border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
          color: active ? '#ffffff' : '#000000'
        }}
      >
        {icon}
      </motion.div>

      {/* Active indicator dot */}
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#000000',
            marginTop: 6
          }}
        />
      )}
    </motion.div>
  );
}

export default function Dock({
  items,
  backgroundColor = 'rgba(255,255,255,0.7)',
  backgroundBlur = 40,
  className = '',
  position = 'bottom'
}: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      className={className}
      initial={{ y: position === 'bottom' ? 100 : -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
      style={{
        position: 'fixed',
        [position]: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        padding: '10px 16px 14px',
        borderRadius: 24,
        background: backgroundColor,
        backdropFilter: `blur(${backgroundBlur}px)`,
        WebkitBackdropFilter: `blur(${backgroundBlur}px)`,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        zIndex: 1000
      }}
    >
      {items.map((item, index) => (
        <DockItem
          key={index}
          {...item}
          index={index}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
        />
      ))}
    </motion.div>
  );
}
