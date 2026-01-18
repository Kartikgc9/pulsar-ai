/**
 * Onboarding Page
 * User selects 5 favorite songs to create their taste profile
 * iOS-style glassmorphism design
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search, Music, X, Check, Loader2, ArrowRight, Play, Pause, LogOut, User, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import VideoBackground from "@/components/VideoBackground";
import { useAuth } from "@/contexts/AuthContext";

// Types matching Backend CatalogTrack
interface Track {
    track_id: string;
    title: string;
    artist: string;
    release_year?: number;
    artwork_url?: string;
    preview_url?: string;
    source: "itunes";
}

export default function Onboarding() {
    const [, setLocation] = useLocation();
    const { user, token, logout, getAuthHeaders } = useAuth();

    // State
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Track[]>([]);
    const [selectedSongs, setSelectedSongs] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Check if onboarding is already complete
        const isComplete = localStorage.getItem("pulsar_profile_complete");
        if (isComplete === "true") {
            setLocation("/");
            return;
        }
    }, [setLocation]);

    const handleLogout = () => {
        logout();
        setLocation("/login");
    };

    // Audio Playback Logic
    const togglePreview = (e: React.MouseEvent, trackId: string, url?: string) => {
        e.stopPropagation();

        if (!url) return;

        if (playingTrackId === trackId) {
            audioRef.current?.pause();
            setPlayingTrackId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(url);
            audioRef.current.volume = 0.5;
            audioRef.current.play();
            audioRef.current.onended = () => setPlayingTrackId(null);
            setPlayingTrackId(trackId);
        }
    };

    // Cleanup audio
    useEffect(() => {
        return () => {
            audioRef.current?.pause();
        };
    }, []);

    // Debounced Search
    useEffect(() => {
        const searchMusic = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`/api/v1/music/search?q=${encodeURIComponent(query)}&limit=5`);
                const data = await res.json();

                if (Array.isArray(data.results)) {
                    setResults(data.results);
                } else {
                    setResults([]);
                }
            } catch (error) {
                toast.error("Failed to search music: Network error");
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchMusic, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    // Handlers
    const addSong = (track: Track) => {
        if (selectedSongs.length >= 5) {
            toast.warning("Maximum 5 songs allowed");
            return;
        }

        if (selectedSongs.some(s => s.track_id === track.track_id)) {
            toast.info("Song already selected");
            return;
        }

        setSelectedSongs([...selectedSongs, track]);
        setQuery("");
        setResults([]);
    };

    const removeSong = (trackId: string) => {
        setSelectedSongs(selectedSongs.filter(s => s.track_id !== trackId));
    };

    const handleSubmit = async () => {
        if (selectedSongs.length < 5) {
            toast.error("Please select 5 songs to continue");
            return;
        }

        setIsSubmitting(true);
        setProgress(5);

        try {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + (Math.random() * 10);
                });
            }, 800);

            const uniqueArtists = Array.from(new Set(selectedSongs.map(s => s.artist)));

            const payload = {
                tracks: selectedSongs,
                artists: uniqueArtists
            };

            const res = await fetch(`/api/v1/onboarding/music`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(payload),
            });

            clearInterval(interval);

            if (!res.ok) {
                const err = await res.json();
                const errorMessage = Array.isArray(err.detail)
                    ? err.detail.map((e: any) => `${e.loc.join('.')} ( ${e.msg} )`).join(', ')
                    : (err.detail || "Onboarding failed");

                throw new Error(errorMessage);
            }

            const data = await res.json();

            if (data.profile_complete) {
                setProgress(100);
                localStorage.setItem("pulsar_profile_complete", "true");
                toast.success("Profile created successfully!");

                setTimeout(() => {
                    setLocation("/");
                }, 1000);
            } else {
                throw new Error("Server did not confirm profile completion");
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create profile");
            setProgress(0);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Video Background */}
            <VideoBackground opacity={0.3} overlay={true} />

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

            {/* Main Content */}
            <div className="w-full max-w-2xl z-10 animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Tune Into Your Vibe
                    </h1>
                    <p className="text-white/70 font-light">
                        Select 5 songs that define your taste
                    </p>
                </div>

                {/* Glass Card */}
                <div className="glass p-6 md:p-8 space-y-6">
                    {/* Progress Indicator */}
                    <div className="flex justify-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <div
                                key={num}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                    selectedSongs.length >= num
                                        ? 'bg-white text-black'
                                        : 'bg-white/10 text-white/50 border border-white/20'
                                }`}
                            >
                                {selectedSongs.length >= num ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    num
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-white/60 text-sm">
                        {selectedSongs.length}/5 songs selected
                    </p>

                    {/* Search Section */}
                    <div className="relative">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white/70 transition-colors" />
                            <Input
                                placeholder="Search your favorite songs..."
                                className="pl-12 h-14 text-base bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-2xl focus:border-white/30 focus:bg-white/10 transition-all"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                disabled={isSubmitting || selectedSongs.length >= 5}
                                aria-label="Search music"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-white/60" />
                            )}
                        </div>

                        {/* Dropdown Results */}
                        {results.length > 0 && (
                            <div className="absolute mt-2 w-full glass overflow-hidden z-50 !rounded-2xl">
                                <ScrollArea className="max-h-[280px]">
                                    {results.map((track) => (
                                        <div
                                            key={track.track_id}
                                            className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors group"
                                            onClick={() => addSong(track)}
                                        >
                                            <div className="relative w-12 h-12 flex-shrink-0">
                                                <img
                                                    src={track.artwork_url || "/placeholder.png"}
                                                    alt={track.title}
                                                    className="w-full h-full rounded-xl object-cover"
                                                />
                                                {track.preview_url && (
                                                    <button
                                                        onClick={(e) => togglePreview(e, track.track_id, track.preview_url)}
                                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                                                        aria-label="Preview song"
                                                    >
                                                        {playingTrackId === track.track_id ? (
                                                            <Pause className="w-5 h-5 text-white fill-current" />
                                                        ) : (
                                                            <Play className="w-5 h-5 text-white fill-current" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate text-white">{track.title}</p>
                                                <p className="text-sm text-white/60 truncate">{track.artist} {track.release_year && `(${track.release_year})`}</p>
                                            </div>
                                            {selectedSongs.some(s => s.track_id === track.track_id) && (
                                                <Check className="h-5 w-5 text-green-400" />
                                            )}
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        )}
                    </div>

                    {/* Selected Songs Grid */}
                    <div className="relative z-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedSongs.map((song, index) => (
                            <div
                                key={song.track_id}
                                className="glass-dark group relative flex items-center gap-3 p-3 !rounded-2xl hover:bg-white/15 transition-all animate-in fade-in zoom-in-95"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <img
                                    src={song.artwork_url || "/placeholder.png"}
                                    alt="art"
                                    className="w-12 h-12 rounded-xl object-cover shadow-md flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate text-white">{song.title}</p>
                                    <p className="text-xs text-white/60 truncate">{song.artist}</p>
                                </div>
                                <button
                                    onClick={() => removeSong(song.track_id)}
                                    className="bg-red-500/20 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
                                    aria-label="Remove song"
                                >
                                    <X className="h-4 w-4 text-red-400" />
                                </button>
                            </div>
                        ))}

                        {/* Empty slots placeholders */}
                        {Array.from({ length: Math.max(0, 5 - selectedSongs.length) }).map((_, i) => (
                            <div
                                key={i}
                                className="h-[72px] rounded-2xl border border-dashed border-white/20 flex items-center justify-center gap-2"
                            >
                                <Music className="h-5 w-5 text-white/20" />
                                <span className="text-white/30 text-sm">Add song</span>
                            </div>
                        ))}
                    </div>

                    {/* Submit Progress Section */}
                    {isSubmitting && (
                        <div className="glass-dark !rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex justify-between text-sm text-white/70">
                                <span>Analyzing your music taste...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-white/50 text-center">
                                Reading lyrics & Detecting emotions & Building taste vector
                            </p>
                        </div>
                    )}

                    {/* Action Button */}
                    <Button
                        className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-white/90 rounded-2xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedSongs.length < 5 || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Building Profile...
                            </>
                        ) : (
                            <>
                                Complete Profile
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
