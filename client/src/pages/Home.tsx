/**
 * Home Page
 * Upload images and get personalized music recommendations
 * Apple iOS style - white background, black text
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Music, Play, Pause, Loader2, RotateCcw, LogOut, User, Upload, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage, analyzeImage, getRecommendations, submitFeedback, ApiError } from "@/lib/api";
import BokehBackground from "@/components/BokehBackground";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import TelegramButton from "@/components/TelegramButton";
import { MouseTrail, NumberCounter, GlassyButton } from "@/components/framer";

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

  // Feedback and loading state
  const [feedbackState, setFeedbackState] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<'uploading' | 'analyzing' | 'matching' | 'ranking' | null>(null);

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

  // Feedback Handler
  const handleFeedback = async (recId: string, type: 'like' | 'dislike') => {
    if (!currentImageId || !user) return;

    // Optimistic update
    setFeedbackState(prev => ({ ...prev, [recId]: type }));

    try {
      await submitFeedback({
        user_id: user.id,
        image_id: currentImageId,
        recommendation_id: recId,
        feedback_type: type,
      });
    } catch (error) {
      // Revert on error
      setFeedbackState(prev => ({ ...prev, [recId]: null }));
      toast.error("Failed to save feedback");
    }
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
    setFeedbackState({}); // Reset feedback for new analysis

    try {
      setLoadingStage('uploading');
      const uploadResult = await uploadImage(uploadedFile);
      console.log("Upload successful:", uploadResult);
      setCurrentImageId(uploadResult.image_id);

      setLoadingStage('analyzing');
      const analysisResult = await analyzeImage(uploadResult.image_id);
      console.log("Analysis complete:", analysisResult);

      setLoadingStage('matching');
      // Small delay for visual feedback
      await new Promise(r => setTimeout(r, 500));

      setLoadingStage('ranking');
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
      setLoadingStage(null);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setRecommendations([]);
    setShowResults(false);
    setFeedbackState({});
    setCurrentImageId(null);
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
      {/* Bokeh Background */}
      <BokehBackground overlayOpacity={0} />

      {/* User Header */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        {user && (
          <>
            <div className="glass flex items-center gap-2 px-4 py-2 !rounded-full">
              <User className="w-4 h-4 text-white/80" />
              <span className="text-white text-sm font-medium">
                {user.name || user.email.split('@')[0]}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
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
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-lg animate-glow-pulse">
                <Music className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl text-wing-display text-white mb-2">
              PULSAR AI
            </h1>
            <p className="text-lg md:text-xl text-white/70 text-wing-body">
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
                role="button"
                aria-label="Upload image or video file"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleClickUpload()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClickUpload}
                className="glass-strong cursor-pointer p-8 md:p-12 text-center transition-all duration-300 hover:bg-gray-50/50 group focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,video/mp4"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-gray-200 flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <Upload className="w-10 h-10 text-white/60 group-hover:text-white/80 transition-colors" />
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl text-wing-heading text-white mb-2">
                  Upload Your Moment
                </h2>
                <p className="text-white/70 mb-4 text-sm md:text-base">
                  Drag and drop your photo or video here
                </p>
                <p className="text-white/60 text-xs md:text-sm">
                  JPG, PNG, or MP4 - Max 10MB
                </p>
              </div>
            ) : null}

            {/* Telegram Alternative */}
            {!previewUrl && (
              <div className="mt-6 text-center">
                <p className="text-white/60 text-sm mb-3">Or try via Telegram</p>
                <TelegramButton className="mx-auto !rounded-2xl" />
              </div>
            )}

            {/* Preview Section */}
            {previewUrl ? (
              <div className="glass-strong p-6 md:p-8">
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
                  <p className="text-white/70 text-xs mb-1">File selected</p>
                  <p className="text-white font-medium truncate">
                    {uploadedFile?.name}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="flex-1 h-14 btn-wing-primary !rounded-2xl transition-all duration-300"
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
                    className="flex-1 h-14 btn-wing-secondary !rounded-2xl"
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
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl text-wing-display text-white mb-2">
                Your Music
              </h2>
              <p className="text-white/70 text-wing-body">
                Based on your uploaded moment
              </p>
            </div>

            {/* Empty State */}
            {recommendations.length === 0 && (
              <div className="glass-strong p-8 text-center max-w-md mx-auto mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Music className="w-8 h-8 text-white/60" />
                </div>
                <h3 className="text-xl text-wing-heading text-white mb-2">No matches found</h3>
                <p className="text-white/70 mb-4">
                  We couldn't find music that matches this image. Try uploading a different photo with clearer mood or scenery.
                </p>
                <Button
                  onClick={handleReset}
                  className="btn-wing-primary !rounded-2xl"
                >
                  Try Another Image
                </Button>
              </div>
            )}

            {/* Recommendations Grid */}
            {recommendations.length > 0 && (
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
                    <div className="mb-4 rounded-2xl overflow-hidden relative aspect-video bg-white/10">
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
                          aria-label={playingTrackId === rec.id ? `Pause ${rec.title}` : `Play preview of ${rec.title}`}
                          className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-lg/0 group-hover:bg-white/20 backdrop-blur-lg/40 transition-colors duration-300 cursor-pointer"
                        >
                          {playingTrackId === rec.id ? (
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-lg">
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
                        <h3 className="text-lg text-wing-heading text-white leading-tight truncate">
                          {rec.title}
                        </h3>
                        <p className="text-white/70 text-sm">{rec.artist}</p>

                        {/* Explanation Text */}
                        <p className="text-xs text-white/80 mt-1 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {getExplanation(rec)}
                        </p>
                      </div>

                      {playingTrackId === rec.id && (
                        <div className="flex space-x-1 items-end h-4 mt-1 ml-2">
                          <div className="w-1 bg-gray-600 animate-music-bar-1 h-2 rounded-full"></div>
                          <div className="w-1 bg-gray-800 animate-music-bar-2 h-4 rounded-full"></div>
                          <div className="w-1 bg-gray-500 animate-music-bar-3 h-3 rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Lyric */}
                    <p className="text-white/70 italic text-sm mb-4 leading-relaxed line-clamp-2 mt-3">
                      "{rec.lyric}"
                    </p>

                    {/* Confidence Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/20 backdrop-blur-lg rounded-full transition-all duration-500"
                          style={{ width: `${rec.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-white/70 text-xs font-medium min-w-[40px] text-right">
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>

                    {/* Feedback Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleFeedback(rec.id, 'like')}
                        disabled={feedbackState[rec.id] !== undefined && feedbackState[rec.id] !== null}
                        className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 transition-all
                          ${feedbackState[rec.id] === 'like'
                            ? 'bg-gray-900 text-white border border-gray-900'
                            : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        aria-label={`Like ${rec.title}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {feedbackState[rec.id] === 'like' && <span className="text-xs">Liked</span>}
                      </button>
                      <button
                        onClick={() => handleFeedback(rec.id, 'dislike')}
                        disabled={feedbackState[rec.id] !== undefined && feedbackState[rec.id] !== null}
                        className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 transition-all
                          ${feedbackState[rec.id] === 'dislike'
                            ? 'bg-red-500/20 text-red-600 border border-red-500/50'
                            : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        aria-label={`Dislike ${rec.title}`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        {feedbackState[rec.id] === 'dislike' && <span className="text-xs">Not for me</span>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleReset}
                className="h-14 btn-wing-accent !rounded-2xl px-8 flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Upload Another Moment
              </Button>
            </div>
          </div>
        )}

        {/* Loading Overlay with Stages and NumberCounter */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/15 backdrop-blur-sm">
            <div className="glass-strong p-8 text-center animate-fade-in max-w-sm mx-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center animate-glow-pulse">
                <NumberCounter
                  from={0}
                  to={loadingStage === 'uploading' ? 25 : loadingStage === 'analyzing' ? 50 : loadingStage === 'matching' ? 75 : 100}
                  duration={1.5}
                  suffix="%"
                  className="text-white font-bold text-2xl"
                />
              </div>
              <p className="text-white font-medium text-lg mb-2">
                {loadingStage === 'uploading' && 'Uploading image...'}
                {loadingStage === 'analyzing' && 'Analyzing mood & colors...'}
                {loadingStage === 'matching' && 'Finding matching tracks...'}
                {loadingStage === 'ranking' && 'Ranking your music...'}
                {!loadingStage && 'Processing...'}
              </p>

              {/* Progress Steps */}
              <div className="flex justify-center gap-2 mt-4">
                {(['uploading', 'analyzing', 'matching', 'ranking'] as const).map((stage, i) => (
                  <div
                    key={stage}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      loadingStage && ['uploading', 'analyzing', 'matching', 'ranking'].indexOf(loadingStage) >= i
                        ? 'bg-white/20 backdrop-blur-lg'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Screen reader announcements */}
        <div aria-live="polite" className="sr-only">
          {loadingStage && `${loadingStage.charAt(0).toUpperCase() + loadingStage.slice(1)} in progress`}
        </div>
      </div>

      {/* Mouse Trail Effect */}
      <MouseTrail
        variant="dots"
        trailColor="#000000"
        trailLength={15}
        dotSize={4}
        fadeOut={true}
        autoFade={true}
        fadeDuration={1.5}
      />
    </div>
  );
}
