/**
 * Backend API Types for Musik FastAPI Integration
 */

export interface UploadResponse {
    image_id: string;
    filename: string;
    status: string;
    message: string;
    metadata: {
        filename: string;
        size_bytes: number;
        width?: number;
        height?: number;
        format?: string;
    };
}

export interface AnalysisResponse {
    image_id: string;
    status: string;
    moods: Record<string, number>; // e.g., { "happy": 0.8, "energetic": 0.6 }
    embedding_index: number;
    analysis_complete: boolean;
}

export interface ScoreBreakdown {
    base_score: number;
    image_semantic: number;
    user_semantic: number;
    artist_affinity: number;
    diversity_penalty: number;
}

export interface TrackRecommendation {
    track_id: string;
    title: string;
    artist: string;
    album?: string;
    genre: string;
    sub_genre?: string;
    release_year?: number;
    era?: string;
    style_tags?: string;
    artwork_url?: string;
    preview_url?: string;
    final_score: number;
    score_breakdown?: ScoreBreakdown;
    lyric_sample?: string;
    source?: string;
}

export interface RecommendationResponse {
    recommendation_id: string;
    image_id: string;
    results: TrackRecommendation[];
    generated_at: string;
}
