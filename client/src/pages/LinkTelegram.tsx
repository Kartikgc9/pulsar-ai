/**
 * Link Telegram Page
 * Allows users to connect their Telegram account for chat-based recommendations
 * Apple iOS style - white background, black text
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Link2, Unlink, Loader2, Check, ExternalLink, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import BokehBackground from "@/components/BokehBackground";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { TelegramIcon } from "@/components/TelegramButton";
import { MouseTrail } from "@/components/framer";

interface TelegramStatus {
  is_linked: boolean;
  telegram_username?: string;
  telegram_first_name?: string;
  linked_at?: string;
}

interface LinkResponse {
  link_url: string;
  token: string;
  expires_in_minutes: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Telegram brand color
const TELEGRAM_BLUE = "#0088cc";

export default function LinkTelegram() {
  const [, setLocation] = useLocation();
  const { user, token } = useAuth();
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  // Fetch Telegram status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/telegram/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch Telegram status:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/telegram/link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: LinkResponse = await response.json();
        setLinkUrl(data.link_url);
        toast.success("Link generated!", {
          description: `Valid for ${data.expires_in_minutes} minutes`,
        });
      } else {
        const error = await response.json();
        toast.error("Failed to generate link", {
          description: error.detail || "Please try again",
        });
      }
    } catch (error) {
      console.error("Failed to generate link:", error);
      toast.error("Failed to generate link");
    } finally {
      setGenerating(false);
    }
  };

  const unlinkAccount = async () => {
    setUnlinking(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/telegram/unlink`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setStatus({ is_linked: false });
        setLinkUrl(null);
        toast.success("Telegram account unlinked");
      } else {
        toast.error("Failed to unlink account");
      }
    } catch (error) {
      console.error("Failed to unlink:", error);
      toast.error("Failed to unlink account");
    } finally {
      setUnlinking(false);
    }
  };

  const openTelegramLink = () => {
    if (linkUrl) {
      window.open(linkUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Bokeh Background */}
      <BokehBackground />

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          onClick={() => setLocation("/app")}
          variant="ghost"
          className="text-white/90 bg-white/50 hover:bg-white/70 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${TELEGRAM_BLUE} 0%, #00a8e8 100%)`,
              }}
            >
              <TelegramIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl text-wing-display text-white mb-2">Link Telegram</h1>
            <p className="text-white/80 text-wing-body">
              Connect your Telegram to get music recommendations via chat
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="glass-strong p-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-white/60" />
              <p className="text-white/70 mt-4">Loading status...</p>
            </div>
          )}

          {/* Linked State */}
          {!loading && status?.is_linked && (
            <div className="glass-strong p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Check className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl text-wing-heading text-white mb-2">
                  Telegram Connected
                </h2>
                <p className="text-white/80">
                  Your account is linked to Telegram
                </p>
              </div>

              {/* Linked Account Info */}
              <div className="bg-white/10 rounded-2xl p-4 mb-6 border border-white/20">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${TELEGRAM_BLUE}20` }}
                  >
                    <TelegramIcon className="w-5 h-5" style={{ color: TELEGRAM_BLUE }} />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {status.telegram_first_name || "Telegram User"}
                    </p>
                    {status.telegram_username && (
                      <p className="text-white/70 text-sm">
                        @{status.telegram_username}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* How to Use */}
              <div className="mb-6">
                <p className="text-white/70 text-sm mb-3">How to use:</p>
                <ol className="text-white/80 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 text-white"
                      style={{ background: TELEGRAM_BLUE }}
                    >
                      1
                    </span>
                    Open Telegram and find your Pulsar AI bot
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 text-white"
                      style={{ background: TELEGRAM_BLUE }}
                    >
                      2
                    </span>
                    Send any image to the bot
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 text-white"
                      style={{ background: TELEGRAM_BLUE }}
                    >
                      3
                    </span>
                    Receive personalized music recommendations!
                  </li>
                </ol>
              </div>

              {/* Unlink Button */}
              <Button
                onClick={unlinkAccount}
                disabled={unlinking}
                variant="outline"
                className="w-full h-12 border-red-300 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl"
              >
                {unlinking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Unlinking...
                  </>
                ) : (
                  <>
                    <Unlink className="w-4 h-4 mr-2" />
                    Unlink Telegram
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Not Linked State */}
          {!loading && !status?.is_linked && (
            <div className="glass-strong p-8">
              {/* New Phone-Based Flow Info */}
              <div className="mb-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white/90" />
                </div>
                <h2 className="text-xl text-wing-heading text-white mb-2">
                  Easy Phone-Based Linking
                </h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Our new system uses Telegram's secure contact sharing.
                  Just open the bot and share your phone number!
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {[
                  "Open the Telegram bot",
                  "Click 'Share My Phone Number'",
                  "Start sending images for recommendations!",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/80 text-sm">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0"
                      style={{ background: TELEGRAM_BLUE }}
                    >
                      {i + 1}
                    </span>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Open Telegram Bot Button */}
              <Button
                onClick={() => window.open("https://t.me/mussiyiy010_bot", "_blank")}
                className="w-full h-14 text-white font-semibold rounded-full transition-all mb-4"
                style={{
                  background: `linear-gradient(135deg, ${TELEGRAM_BLUE} 0%, #00a8e8 100%)`,
                }}
              >
                <TelegramIcon className="w-5 h-5 mr-2" />
                Open Telegram Bot
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>

              {/* Refresh Status */}
              <Button
                onClick={() => {
                  fetchStatus();
                  toast.info("Checking status...");
                }}
                className="w-full h-12 btn-wing-secondary !rounded-full"
              >
                I've linked my account
              </Button>

              {/* Alternative: Old Link Method */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-white/70 text-xs text-center mb-3">
                  Alternative: Generate a one-time link
                </p>
                <Button
                  onClick={generateLink}
                  disabled={generating}
                  variant="outline"
                  className="w-full h-10 text-sm border-gray-300 text-white/80 hover:bg-white/10 rounded-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Generate Link Instead
                    </>
                  )}
                </Button>
              </div>

              {/* Link Generated Modal */}
              {linkUrl && (
                <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-blue-700 text-sm text-center mb-3">
                    Link generated! Click below to open Telegram:
                  </p>
                  <Button
                    onClick={openTelegramLink}
                    className="w-full h-12 text-white font-semibold rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${TELEGRAM_BLUE} 0%, #00a8e8 100%)`,
                    }}
                  >
                    <TelegramIcon className="w-5 h-5 mr-2" />
                    Open Link in Telegram
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mouse Trail Effect */}
      <MouseTrail
        variant="line"
        trailColor="#0088cc"
        trailLength={18}
        lineWidth={2}
        fadeOut={true}
        autoFade={true}
        fadeDuration={1.5}
      />
    </div>
  );
}
