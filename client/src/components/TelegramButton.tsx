/**
 * Telegram Button Component
 * Links users to Telegram Bot for image-based music recommendations
 * Navigates to link page if account not linked
 */

import { useLocation } from "wouter";

interface TelegramButtonProps {
  botUsername?: string;
  className?: string;
  variant?: 'full' | 'icon';
  isLinked?: boolean;
}

export default function TelegramButton({
  botUsername = "mussiyiy010_bot", // Default bot username
  className = "",
  variant = 'full',
  isLinked = false
}: TelegramButtonProps) {
  const [, setLocation] = useLocation();

  // Handle click - navigate to link page if not linked
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isLinked && botUsername) {
      // Already linked - open Telegram directly
      window.open(`https://t.me/${botUsername}`, "_blank");
    } else {
      // Not linked - navigate to link page
      setLocation("/profile/link-telegram");
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`w-12 h-12 rounded-2xl bg-[#0088cc]/20 border border-[#0088cc]/30 flex items-center justify-center hover:bg-[#0088cc]/30 transition-all duration-300 cursor-pointer ${className}`}
        title={isLinked ? "Chat on Telegram" : "Link Telegram Account"}
      >
        <TelegramIcon className="w-6 h-6 text-[#0088cc]" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`glass flex items-center gap-3 px-6 py-3 hover:bg-white/15 transition-all duration-300 group cursor-pointer ${className}`}
    >
      <TelegramIcon className="w-6 h-6 text-[#0088cc] group-hover:scale-110 transition-transform" />
      <div className="flex flex-col text-left">
        <span className="text-white font-medium">Chat on Telegram</span>
        <span className="text-white/70 text-xs">
          {isLinked ? "Send images, get music" : "Link account to start"}
        </span>
      </div>
    </button>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

// Also export the icon separately for flexibility
export { TelegramIcon };
