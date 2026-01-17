/**
 * VideoBackground Component
 * Full-screen looping video background for all pages
 */

interface VideoBackgroundProps {
  opacity?: number;
  overlay?: boolean;
}

export default function VideoBackground({
  opacity = 0.4,
  overlay = true
}: VideoBackgroundProps) {
  return (
    <>
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full w-auto h-auto object-cover"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: opacity,
          }}
        >
          <source src="/bg-video.mp4" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Dark overlay for better text readability */}
      {overlay && (
        <div
          className="fixed inset-0 z-0 bg-gradient-to-br from-black/60 via-purple-900/30 to-black/60"
          aria-hidden="true"
        />
      )}
    </>
  );
}
