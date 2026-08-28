import { useCallback, useState } from "preact/hooks";
import type { WaveformData } from "@/lib/audioTrimmer";
import {
	formatTime,
	generateWaveformData,
	loadAudioFile,
	trimAudio,
} from "@/lib/audioTrimmer";

export interface UseAudioTrimState {
	audioBuffer: AudioBuffer | null;
	waveformData: WaveformData | null;
	startTime: number;
	endTime: number;
	isLoading: boolean;
	isProcessing: boolean;
	error: string | null;
}

export interface UseAudioTrimReturn extends UseAudioTrimState {
	loadAudio: (file: File) => Promise<void>;
	setTrimStart: (time: number) => void;
	setTrimEnd: (time: number) => void;
	downloadTrimmedAudio: () => Promise<void>;
	reset: () => void;
	clearError: () => void;
	formatTime: (seconds: number) => string;
}

/**
 * Hook for managing audio trimming functionality.
 * Handles loading, trimming, and downloading audio files.
 */
export function useAudioTrim(): UseAudioTrimReturn {
	const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
	const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
	const [startTime, setStartTime] = useState(0);
	const [endTime, setEndTime] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadAudio = useCallback(async (file: File): Promise<void> => {
		// Reset state
		setAudioBuffer(null);
		setWaveformData(null);
		setStartTime(0);
		setEndTime(0);
		setError(null);
		setIsLoading(true);

		try {
			// Validate file is audio
			if (!file.type.startsWith("audio/")) {
				throw new Error("Please upload a valid audio file");
			}

			// Validate file size (reasonable limit, e.g., 500MB)
			const maxFileSize = 500 * 1024 * 1024;
			if (file.size > maxFileSize) {
				throw new Error("Audio file is too large (max 500MB)");
			}

			// Load and decode audio
			const buffer = await loadAudioFile(file);
			setAudioBuffer(buffer);

			// Generate waveform data
			const waveform = generateWaveformData(buffer);
			setWaveformData(waveform);

			// Set default trim times (full audio)
			setStartTime(0);
			setEndTime(buffer.duration);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to load audio file";
			setError(errorMessage);
			setAudioBuffer(null);
			setWaveformData(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const setTrimStartCallback = useCallback(
		(time: number): void => {
			const minGap = 0.1; // Minimum 100ms gap between start and end
			setStartTime(Math.max(0, Math.min(time, endTime - minGap)));
		},
		[endTime],
	);

	const setTrimEndCallback = useCallback(
		(time: number): void => {
			const minGap = 0.1; // Minimum 100ms gap between start and end
			const maxTime = audioBuffer?.duration || 0;
			setEndTime(Math.max(Math.min(time, maxTime), startTime + minGap));
		},
		[audioBuffer, startTime],
	);

	const downloadTrimmedAudio = useCallback(async (): Promise<void> => {
		if (!audioBuffer) {
			throw new Error("No audio loaded");
		}

		setIsProcessing(true);
		setError(null);

		try {
			// Trim audio
			const result = await trimAudio(audioBuffer, startTime, endTime);

			// Create download link
			const url = URL.createObjectURL(result.blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `trimmed-audio-${Date.now()}.wav`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to download audio";
			setError(errorMessage);
		} finally {
			setIsProcessing(false);
		}
	}, [audioBuffer, startTime, endTime]);

	const reset = useCallback((): void => {
		setAudioBuffer(null);
		setWaveformData(null);
		setStartTime(0);
		setEndTime(0);
		setError(null);
		setIsLoading(false);
		setIsProcessing(false);
	}, []);

	const clearError = useCallback((): void => {
		setError(null);
	}, []);

	return {
		audioBuffer,
		waveformData,
		startTime,
		endTime,
		isLoading,
		isProcessing,
		error,
		loadAudio,
		setTrimStart: setTrimStartCallback,
		setTrimEnd: setTrimEndCallback,
		downloadTrimmedAudio,
		reset,
		clearError,
		formatTime,
	};
}
