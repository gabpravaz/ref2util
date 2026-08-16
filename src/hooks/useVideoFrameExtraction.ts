import { useCallback, useState } from "preact/hooks";
import type { ExtractedFrame } from "@/lib/frameExtractor";
import { extractLast4Frames } from "@/lib/frameExtractor";

export interface UseVideoFrameExtractionState {
	frames: ExtractedFrame[];
	isLoading: boolean;
	error: string | null;
}

export interface UseVideoFrameExtractionReturn
	extends UseVideoFrameExtractionState {
	extractFrames: (file: File) => Promise<void>;
	clearFrames: () => void;
	clearError: () => void;
}

/**
 * Hook for extracting frames from video files.
 * Manages loading states, errors, and frame data.
 */
export function useVideoFrameExtraction(): UseVideoFrameExtractionReturn {
	const [frames, setFrames] = useState<ExtractedFrame[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const extractFrames = useCallback(async (file: File): Promise<void> => {
		// Reset state
		setFrames([]);
		setError(null);
		setIsLoading(true);

		try {
			// Validate file is a video
			if (!file.type.startsWith("video/")) {
				throw new Error("Please upload a valid video file");
			}

			// Validate file size (reasonable limit, e.g., 1GB)
			const maxFileSize = 1024 * 1024 * 1024; // 1GB
			if (file.size > maxFileSize) {
				throw new Error("Video file is too large");
			}

			// Extract frames
			const extractedFrames = await extractLast4Frames(file);
			setFrames(extractedFrames);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to extract frames";
			setError(errorMessage);
			setFrames([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const clearFrames = useCallback(() => {
		setFrames([]);
		setError(null);
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		frames,
		isLoading,
		error,
		extractFrames,
		clearFrames,
		clearError,
	};
}
