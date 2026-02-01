/**
 * BokehBackground Component
 * Full-page background image with optional overlay
 */

import { memo } from 'react';

interface BokehBackgroundProps {
  /** Overlay opacity for content readability (default: 0) */
  overlayOpacity?: number;
  /** Enable interactive mouse tracking (not used with image) */
  interactive?: boolean;
  /** Background variant (not used with image) */
  variant?: 'minimal' | 'ambient' | 'dynamic';
}

function BokehBackground({
  overlayOpacity = 0,
}: BokehBackgroundProps) {
  return (
    <>
      {/* Full-page background image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Content overlay for readability (optional) */}
      {overlayOpacity > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-[1]"
          style={{
            background: `rgba(255, 255, 255, ${overlayOpacity})`
          }}
        />
      )}
    </>
  );
}

export default memo(BokehBackground);
