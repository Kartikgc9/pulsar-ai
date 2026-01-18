/**
 * Home Page
 * Upload images and get personalized music recommendations
 * iOS-style glassmorphism design
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Cloud, Music, Play, Pause, Loader2, RotateCcw, LogOut, User, Upload, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage, analyzeImage, getRecommendations, ApiError } from "@/lib/api";
import VideoBackground from "@/components/VideoBackground";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import WhatsAppButton from "@/components/WhatsAppButton";

interface MusicRecommendation {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  previewUrl?: string;
  lyric: string;
  confidence: number;
  scoreBreakdown?: {
    image_semantic: number;
    user_semantic: number;
    artist_affinity: number;
  };
}

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MusicRecommendation[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  // Check onboarding status
  useEffect(() => {
    const isProfileComplete = localStorage.getItem("pulsar_profile_complete");
    if (isProfileComplete !== "true") {
      setLocation("/onboarding");
    }
  }, [setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  // Audio Playback Logic
  const togglePreview = (trackId: string, url?: string) => {
    if (!url) return;

    if (playingTrackId === trackId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.volume = 0.5;
      audio.onended = () => setPlayingTrackId(null);
      audio.onerror = () => {
        console.error("Failed to load audio preview");
        setPlayingTrackId(null);
      };
      audio.play().catch((err) => {
        console.error("Audio playback failed:", err);
        setPlayingTrackId(null);
      });
      audioRef.current = audio;
      setPlayingTrackId(trackId);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Explanation Helper
  const getExplanation = (rec: MusicRecommendation) => {
    if (!rec.scoreBreakdown) return "Recommended for you";

    const { image_semantic, artist_affinity, user_semantic } = rec.scoreBreakdown;

    if (artist_affinity >= 1.0) return `Because you like ${rec.artist}`;
    if (artist_affinity >= 0.7) return "Similar to artists you like";
    if (image_semantic > 0.65) return "Strong visual vibe match";
    if (user_semantic > 0.65) return "Matches your taste profile";
    if (image_semantic > 0.5) return "Fits the image mood";

    return "Balanced recommendation";
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "video/mp4"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a JPG, PNG image or MP4 video",
        duration: 5000
      });
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = false;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);

    try {
      const uploadResult = await uploadImage(uploadedFile);
      console.log("Upload successful:", uploadResult);

      const analysisResult = await analyzeImage(uploadResult.image_id);
      console.log("Analysis complete:", analysisResult);

      const recommendationsResult = await getRecommendations(uploadResult.image_id, 5);
      console.log("Recommendations received:", recommendationsResult);

      const strictMapped: MusicRecommendation[] = recommendationsResult.results.map((track: any) => ({
        id: track.track_id,
        title: track.title,
        artist: track.artist,
        albumArt: track.artwork_url || "/fallback-cover.png",
        previewUrl: track.preview_url,
        lyric: track.lyric_sample || "No lyrics available",
        confidence: track.final_score || track.score || 0,
        scoreBreakdown: track.score_breakdown
      }));

      setRecommendations(strictMapped);
      setShowResults(true);
    } catch (error) {
      console.error("Error during analysis:", error);

      let errorMessage = "An error occurred while analyzing your image.";

      if (error instanceof ApiError) {
        if (error.status === 503) {
          errorMessage = "The music recommendation system is still initializing. Please try again in a few moments.";
        } else if (error.status === 404) {
          errorMessage = "Image not found. Please try uploading again.";
        } else if (error.status === 400) {
          errorMessage = error.message || "Invalid request. Please check your image and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error("Analysis Failed", {
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setRecommendations([]);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <VideoBackground opacity={0.35} overlay={true} />

      {/* User Header */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        {user && (
          <>
            <div className="glass-dark flex items-center gap-2 px-4 py-2 !rounded-full">
              <User className="w-4 h-4 text-white/70" />
              <span className="text-white/90 text-sm font-medium">
                {user.name || user.email.split('@')[0]}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Header Section */}
        {!showResults && (
          <div className="text-center mb-10 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg">
                <Music className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              PULSAR AI
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light">
              Music that feels your moment
            </p>
          </div>
        )}

        {/* Upload Section */}
        {!showResults ? (
          <div className="w-full max-w-md animate-slide-up">
            {/* Upload Box */}
            {!previewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClickUpload}
                className="glass cursor-pointer p-8 md:p-12 text-center transition-all duration-300 hover:bg-white/15 hover:border-white/30 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,video/mp4"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Upload className="w-10 h-10 text-white/70 group-hover:text-white transition-colors" />
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                  Upload Your Moment
                </h2>
                <p className="text-white/60 mb-4 text-sm md:text-base">
                  Drag and drop your photo or video here
                </p>
                <p className="text-white/40 text-xs md:text-sm">
                  JPG, PNG, or MP4 - Max 10MB
                </p>
              </div>
            ) : null}

            {/* WhatsApp Alternative */}
            {!previewUrl && (
              <div className="mt-6 text-center">
                <p className="text-white/50 text-sm mb-3">Or try via WhatsApp</p>
                <WhatsAppButton
                  phoneNumber={import.meta.env.VITE_WHATSAPP_NUMBER || ""}
                  message="pulsar"
                  className="mx-auto !rounded-2xl"
                />
              </div>
            )}

            {/* Preview Section */}
            {previewUrl ? (
              <div className="glass p-6 md:p-8">
                {/* Preview */}
                <div className="mb-6 rounded-2xl overflow-hidden">
                  {uploadedFile?.type.startsWith("image") ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      className="w-full h-64 object-cover"
                      controls
                    />
                  )}
                </div>

                {/* File Info */}
                <div className="mb-6 glass-dark !rounded-2xl p-4">
                  <p className="text-white/50 text-xs mb-1">File selected</p>
                  <p className="text-white font-medium truncate">
                    {uploadedFile?.name}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="flex-1 h-14 bg-white text-black hover:bg-white/90 font-semibold rounded-2xl transition-all duration-300 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setPreviewUrl(null)}
                    variant="outline"
                    className="flex-1 h-14 border-white/20 bg-white/5 text-white hover:bg-white/10 font-semibold rounded-2xl"
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Results Section */}
        {showResults && (
          <div className="w-full max-w-4xl animate-slide-up">
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Your Music
              </h2>
              <p className="text-white/60 font-light">
                Based on your uploaded moment
              </p>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className="glass p-5 hover:bg-white/15 transition-all duration-300 group"
                  style={{
                    animation: `slide-up 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Album Art with Play Overlay */}
                  <div className="mb-4 rounded-2xl overflow-hidden relative aspect-video bg-black/20">
                    <img
                      src={rec.albumArt}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop";
                      }}
                    />

                    {/* Play Button Overlay */}
                    {rec.previewUrl && (
                      <button
                        onClick={() => togglePreview(rec.id, rec.previewUrl)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-300 cursor-pointer"
                      >
                        {playingTrackId === rec.id ? (
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50">
                            <Pause className="w-6 h-6 text-white fill-current" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                            <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                          </div>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white leading-tight truncate">
                        {rec.title}
                      </h3>
                      <p className="text-white/60 text-sm">{rec.artist}</p>

                      {/* Explanation Text */}
                      <p className="text-xs text-white/50 mt-1 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {getExplanation(rec)}
                      </p>
                    </div>

                    {playingTrackId === rec.id && (
                      <div className="flex space-x-1 items-end h-4 mt-1 ml-2">
                        <div className="w-1 bg-blue-400 animate-music-bar-1 h-2 rounded-full"></div>
                        <div className="w-1 bg-purple-400 animate-music-bar-2 h-4 rounded-full"></div>
                        <div className="w-1 bg-pink-400 animate-music-bar-3 h-3 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Lyric */}
                  <p className="text-white/70 italic text-sm mb-4 leading-relaxed line-clamp-2 mt-3">
                    "{rec.lyric}"
                  </p>

                  {/* Confidence Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500"
                        style={{ width: `${rec.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-white/50 text-xs font-medium min-w-[40px] text-right">
                      {Math.round(rec.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleReset}
                className="h-14 bg-white text-black hover:bg-white/90 font-semibold px-8 rounded-2xl transition-all duration-300 shadow-lg flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Upload Another Moment
              </Button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
            <div className="glass p-8 text-center animate-fade-in max-w-sm mx-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-white font-medium text-lg mb-2">
                Finding your music...
              </p>
              <p className="text-white/60 text-sm">
                Analyzing mood, colors, and emotions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
