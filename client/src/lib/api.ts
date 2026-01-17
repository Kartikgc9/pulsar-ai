/**
 * API Client for Musik FastAPI Backend
 * Handles all HTTP communication with the backend
 */

import type {
    UploadResponse,
    AnalysisResponse,
    RecommendationResponse,
} from "@/types/backend";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds

class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public data?: any
    ) {
        super(message);
        this.name = "ApiError";
    }
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new ApiError(408, "Request timed out. Please try again.");
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Upload an image file to the backend
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/v1/upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            error.detail || "Failed to upload image",
            error
        );
    }

    return response.json();
}

/**
 * Analyze an uploaded image
 */
export async function analyzeImage(imageId: string): Promise<AnalysisResponse> {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/v1/analyze`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ image_id: imageId }),
        },
        60000 // 60 seconds for analysis (ML processing takes longer)
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            error.detail || "Failed to analyze image",
            error
        );
    }

    return response.json();
}

/**
 * Get music recommendations for an analyzed image
 */
export async function getRecommendations(
    imageId: string,
    limit: number = 10,
    userId?: string
): Promise<RecommendationResponse> {
    let url = `${API_BASE_URL}/api/v1/recommendations/images/${imageId}?limit=${limit}`;
    if (userId) {
        url += `&user_id=${encodeURIComponent(userId)}`;
    }

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        // Special handling for missing embeddings (503)
        if (response.status === 503) {
            throw new ApiError(
                503,
                "Music embeddings are not ready yet. Please contact support or wait for the system to initialize.",
                error
            );
        }

        throw new ApiError(
            response.status,
            error.detail || "Failed to get recommendations",
            error
        );
    }

    return response.json();
}

export { ApiError };
