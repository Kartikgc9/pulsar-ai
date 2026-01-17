import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search, Music, X, Check, Loader2, ArrowRight, Play, Pause, AlertCircle, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

    // Audio Playback Logic (Copy from Home.tsx)
    const togglePreview = (e: React.MouseEvent, trackId: string, url?: string) => {
        e.stopPropagation(); // Prevent selection when clicking play

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
            // Simulated smooth progress
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + (Math.random() * 10);
                });
            }, 800);

            // Extract Artists explicitly
            const uniqueArtists = Array.from(new Set(selectedSongs.map(s => s.artist)));

            const payload = {
                tracks: selectedSongs,
                artists: uniqueArtists
            };

            // Use auth token for the request (user ID is extracted from token on backend)
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
                // Handle Pydantic validation errors (array)
                const errorMessage = Array.isArray(err.detail)
                    ? err.detail.map((e: any) => `${e.loc.join('.')} ( ${e.msg} )`).join(', ')
                    : (err.detail || "Onboarding failed");

                throw new Error(errorMessage);
            }

            const data = await res.json();

            // Server Confirmation Check
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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Video Background */}
            <VideoBackground opacity={0.3} overlay={true} />

            {/* User Header */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
                {user && (
                    <>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                            <User className="w-4 h-4 text-white/70" />
                            <span className="text-white/90 text-sm font-medium">
                                {user.name || user.email.split('@')[0]}
                            </span>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </>
                )}
            </div>

            <Card className="w-full max-w-2xl z-10 border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Tune Into Your Vibe
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        Select 5 songs that define your taste ({selectedSongs.length}/5)
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Search Section */}
                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search favorite songs..."
                                className="pl-10 h-12 text-lg bg-background/50 border-white/10 focus:border-purple-500 transition-all"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                disabled={isSubmitting || selectedSongs.length >= 5}
                                aria-label="Search music"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-purple-500" />
                            )}
                        </div>

                        {/* Dropdown Results */}
                        {results.length > 0 && (
                            <div className="absolute mt-2 w-full bg-popover/95 backdrop-blur-md rounded-lg border border-white/10 shadow-xl overflow-hidden z-50">
                                <ScrollArea className="max-h-[300px]">
                                    {results.map((track) => (
                                        <div
                                            key={track.track_id}
                                            className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors group"
                                            onClick={() => addSong(track)}
                                        >
                                            <div className="relative w-10 h-10 flex-shrink-0">
                                                <img
                                                    src={track.artwork_url || "/placeholder.png"}
                                                    alt={track.title}
                                                    className="w-full h-full rounded object-cover"
                                                />
                                                {/* Preview Button */}
                                                {track.preview_url ? (
                                                    <button
                                                        onClick={(e) => togglePreview(e, track.track_id, track.preview_url)}
                                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                                                        aria-label="Preview song"
                                                    >
                                                        {playingTrackId === track.track_id ? (
                                                            <Pause className="w-4 h-4 text-white fill-current" />
                                                        ) : (
                                                            <Play className="w-4 h-4 text-white fill-current" />
                                                        )}
                                                    </button>
                                                ) : null}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate text-foreground">{track.title}</p>
                                                <p className="text-sm text-muted-foreground truncate">{track.artist} • {track.release_year}</p>
                                            </div>
                                            <Check className={`h-4 w-4 ${selectedSongs.some(s => s.track_id === track.track_id) ? "text-green-500" : "opacity-0"}`} />
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        )}
                    </div>

                    {/* Selected Songs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedSongs.map((song) => (
                            <div
                                key={song.track_id}
                                className="glass group relative flex items-center gap-4 p-4 hover:bg-white/15 transition-all animate-in fade-in zoom-in-95"
                            >
                                <img
                                    src={song.artwork_url || "/placeholder.png"}
                                    alt="art"
                                    className="w-14 h-14 rounded-xl object-cover shadow-md"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate text-foreground">{song.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                                </div>
                                <button
                                    onClick={() => removeSong(song.track_id)}
                                    className="bg-red-500/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                    aria-label="Remove song"
                                >
                                    <X className="h-4 w-4 text-red-500" />
                                </button>
                            </div>
                        ))}

                        {/* Empty slots placeholders */}
                        {Array.from({ length: Math.max(0, 5 - selectedSongs.length) }).map((_, i) => (
                            <div key={i} className="h-[88px] rounded-3xl border border-dashed border-white/20 flex items-center justify-center">
                                <Music className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                        ))}
                    </div>

                    {/* Submit Progress Section */}
                    {isSubmitting && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Analyzing music taste...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground text-center pt-2">
                                Reading lyrics • Detecting emotions • Building taste vector
                            </p>
                        </div>
                    )}

                    {/* Action Button */}
                    <Button
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-900/20"
                        disabled={selectedSongs.length < 5 || isSubmitting}
                        onClick={handleSubmit}
                        aria-disabled={selectedSongs.length < 5 || isSubmitting}
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
                </CardContent>
            </Card>
        </div>
    );
}
