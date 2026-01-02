import { useState, useRef } from "react";
import { Cloud, Music, Play, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MusicRecommendation {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  lyric: string;
  confidence: number;
}

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MusicRecommendation[]>([]);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

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
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock recommendations data
    const mockRecommendations: MusicRecommendation[] = [
      {
        id: "1",
        title: "Midnight Dreams",
        artist: "Luna Echo",
        albumArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
        lyric: "Let the waves wash over me...",
        confidence: 0.95,
      },
      {
        id: "2",
        title: "Neon Lights",
        artist: "Synthetic Wave",
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        lyric: "In the glow of city nights...",
        confidence: 0.88,
      },
      {
        id: "3",
        title: "Ethereal Journey",
        artist: "Ambient Souls",
        albumArt: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
        lyric: "Float beyond the endless sky...",
        confidence: 0.82,
      },
      {
        id: "4",
        title: "Pulse of Life",
        artist: "Rhythm Masters",
        albumArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
        lyric: "Feel the heartbeat of the world...",
        confidence: 0.79,
      },
      {
        id: "5",
        title: "Serenity",
        artist: "Peaceful Minds",
        albumArt: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop",
        lyric: "In silence, we find our truth...",
        confidence: 0.75,
      },
    ];

    setRecommendations(mockRecommendations);
    setShowResults(true);
    setIsLoading(false);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setRecommendations([]);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="gradient-bg" />

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
                  JPG, PNG, or MP4 • Max 100MB
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
                  className="glass p-6 hover:bg-white/15 transition-all duration-300 group"
                  style={{
                    animation: `slide-up 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Album Art */}
                  <div className="mb-4 rounded-xl overflow-hidden relative">
                    <img
                      src={rec.albumArt}
                      alt={rec.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 fill-white" />
                    </button>
                  </div>

                  {/* Song Info */}
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {rec.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">{rec.artist}</p>

                  {/* Lyric */}
                  <p className="text-white/80 italic text-sm mb-4 leading-relaxed">
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
