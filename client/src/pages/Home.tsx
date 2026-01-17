import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Cloud, Music, Play, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage, analyzeImage, getRecommendations, ApiError } from "@/lib/api";
import VideoBackground from "@/components/VideoBackground";

interface MusicRecommendation {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  previewUrl?: string; // Added
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
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null); // Track Playing State

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Audio Ref

  const [, setLocation] = useLocation();

  // Check onboarding status
  useEffect(() => {
    const isProfileComplete = localStorage.getItem("pulsar_profile_complete");
    if (isProfileComplete !== "true") {
      setLocation("/onboarding");
    }
  }, [setLocation]);

  // Audio Playback Logic
  const togglePreview = (trackId: string, url?: string) => {
    if (!url) return;

    if (playingTrackId === trackId) {
      // Pause
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      // Play New
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.volume = 0.5; // 50% volume
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

  // Explanation Helper (Phase 11.1)
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
      alert("Please upload a JPG, PNG image or MP4 video");
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
      // Step 1: Upload the file
      const uploadResult = await uploadImage(uploadedFile);
      console.log("Upload successful:", uploadResult);

      // Step 2: Analyze the image
      const analysisResult = await analyzeImage(uploadResult.image_id);
      console.log("Analysis complete:", analysisResult);

      // Step 3: Get recommendations with personalization
      const userId = localStorage.getItem("pulsar_user_id") || undefined;
      const recommendationsResult = await getRecommendations(uploadResult.image_id, 5, userId);
      console.log("Recommendations received:", recommendationsResult);

      // Map backend response to UI format
      // Re-map strictly:
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

      // Show user-friendly error message
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

      alert(errorMessage);
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
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <VideoBackground opacity={0.35} overlay={true} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Header Section */}
        {!showResults && (
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <Music className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              PULSAR AI
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-light">
              Music that feels your moment.
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

                <div className="flex justify-center mb-4">
                  <Cloud className="w-12 h-12 text-white/70 group-hover:text-white transition-colors" />
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                  Upload Your Moment
                </h2>
                <p className="text-white/70 mb-4 text-sm md:text-base">
                  Drag and drop your photo or video here
                </p>
                <p className="text-white/50 text-xs md:text-sm">
                  JPG, PNG, or MP4 • Max 10MB
                </p>
              </div>
            ) : (
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
                <div className="mb-6">
                  <p className="text-white/70 text-sm mb-1">File selected</p>
                  <p className="text-white font-medium truncate">
                    {uploadedFile?.name}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="flex-1 bg-white text-black hover:bg-white/90 font-semibold py-2 rounded-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>Analyze</>
                    )}
                  </Button>
                  <Button
                    onClick={() => setPreviewUrl(null)}
                    variant="outline"
                    className="flex-1 border-white/30 text-white hover:bg-white/10 font-semibold py-2 rounded-xl"
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Results Section */}
        {showResults && (
          <div className="w-full max-w-4xl animate-slide-up">
            {/* Results Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Your Music Recommendations
              </h2>
              <p className="text-white/70 font-light">
                Based on your uploaded moment
              </p>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className="glass p-6 hover:bg-white/15 transition-all duration-300 group relative"
                  style={{
                    animation: `slide-up 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Album Art with Play Overlay */}
                  <div className="mb-4 rounded-xl overflow-hidden relative aspect-video bg-black/20">
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
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50">
                            <div className="w-4 h-4 bg-white rounded-sm" /> {/* Pause Icon */}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                            <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                          </div>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white leading-tight">
                        {rec.title}
                      </h3>
                      <p className="text-white/70 text-sm">{rec.artist}</p>

                      {/* Explanation Text */}
                      <p className="text-xs text-white/60 mt-1 font-medium flex items-center gap-1">
                        ✨ {getExplanation(rec)}
                      </p>
                    </div>

                    {playingTrackId === rec.id && (
                      <div className="flex space-x-1 items-end h-4 mt-1">
                        <div className="w-1 bg-blue-400 animate-music-bar-1 h-2"></div>
                        <div className="w-1 bg-purple-400 animate-music-bar-2 h-4"></div>
                        <div className="w-1 bg-pink-400 animate-music-bar-3 h-3"></div>
                      </div>
                    )}
                  </div>

                  {/* Lyric */}
                  <p className="text-white/80 italic text-sm mb-4 leading-relaxed line-clamp-2 mt-2">
                    "{rec.lyric}"
                  </p>

                  {/* Confidence Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                        style={{ width: `${rec.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-white/60 text-xs font-medium">
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
                className="bg-white text-black hover:bg-white/90 font-semibold py-3 px-8 rounded-xl transition-all duration-300 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Upload Another Moment
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="glass p-8 text-center animate-fade-in">
              <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
              <p className="text-white font-light text-lg">
                Finding music that matches your moment...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
