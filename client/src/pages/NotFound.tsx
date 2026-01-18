import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import VideoBackground from "@/components/VideoBackground";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Video Background */}
      <VideoBackground opacity={0.3} overlay={true} />

      {/* Content */}
      <div className="glass w-full max-w-lg mx-4 z-10 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <AlertCircle className="relative h-10 w-10 text-red-400" />
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-2">404</h1>

        <h2 className="text-xl font-semibold text-white/80 mb-4">
          Page Not Found
        </h2>

        <p className="text-white/60 mb-8 leading-relaxed">
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>

        <div
          id="not-found-button-group"
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            onClick={handleGoHome}
            className="h-12 bg-white text-black hover:bg-white/90 font-semibold px-6 rounded-2xl transition-all duration-300 shadow-lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
