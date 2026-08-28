/**
 * Audio trimming and processing utilities using Web Audio API.
 * Provides functionality for waveform visualization, audio trimming, and encoding.
 */

export interface WaveformData {
	peaks: number[];
	duration: number;
	sampleRate: number;
}

export interface TrimmedAudioResult {
	blob: Blob;
	duration: number;
}

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
	// Check if context exists and is not closed
	if (audioContext && audioContext.state !== "closed") {
		return audioContext;
	}

	if (typeof window === "undefined") {
		throw new Error("Web Audio API is not available");
	}
	const AudioContextConstructor = (window.AudioContext ||
		(window as unknown as Record<string, unknown>)
			.webkitAudioContext) as typeof AudioContext;
	if (!AudioContextConstructor) {
		throw new Error("Web Audio API is not supported in this browser");
	}
	audioContext = new AudioContextConstructor();
	return audioContext;
}

/**
 * Load and decode an audio file into PCM data.
 */
export async function loadAudioFile(file: File): Promise<AudioBuffer> {
	const ctx = getAudioContext();
	const arrayBuffer = await file.arrayBuffer();
	return ctx.decodeAudioData(arrayBuffer);
}

/**
 * Generate waveform data for visualization.
 * Downsamples the audio to a manageable number of samples for display.
 */
export function generateWaveformData(
	audioBuffer: AudioBuffer,
	samplesPerPixel: number = 512,
): WaveformData {
	const rawData = audioBuffer.getChannelData(0); // Get mono data or first channel
	const blockSize = Math.floor(rawData.length / samplesPerPixel);
	const peaks: number[] = [];

	for (let i = 0; i < samplesPerPixel; i++) {
		let sumSquares = 0;
		for (let j = 0; j < blockSize; j++) {
			const sample = rawData[i * blockSize + j];
			sumSquares += sample * sample;
		}
		// RMS (root mean square) represents the amplitude
		peaks.push(Math.sqrt(sumSquares / blockSize));
	}

	return {
		peaks,
		duration: audioBuffer.duration,
		sampleRate: audioBuffer.sampleRate,
	};
}

/**
 * Trim audio between two time points and return as a Blob.
 */
export async function trimAudio(
	audioBuffer: AudioBuffer,
	startTime: number,
	endTime: number,
): Promise<TrimmedAudioResult> {
	const ctx = getAudioContext();

	// Validate times
	if (startTime < 0 || endTime > audioBuffer.duration || startTime >= endTime) {
		throw new Error("Invalid trim times");
	}

	const sampleRate = audioBuffer.sampleRate;
	const startSample = Math.floor(startTime * sampleRate);
	const endSample = Math.floor(endTime * sampleRate);
	const length = endSample - startSample;

	// Create a new audio buffer for the trimmed audio
	const trimmedBuffer = ctx.createBuffer(
		audioBuffer.numberOfChannels,
		length,
		sampleRate,
	);

	// Copy the trimmed data to the new buffer
	for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
		const sourceData = audioBuffer.getChannelData(channel);
		const targetData = trimmedBuffer.getChannelData(channel);
		targetData.set(sourceData.subarray(startSample, endSample));
	}

	// Convert to WAV blob
	const blob = audioBufferToWav(trimmedBuffer);

	return {
		blob,
		duration: endTime - startTime,
	};
}

/**
 * Convert AudioBuffer to WAV format.
 * This uses the WAV format which is lossless and widely supported.
 */
function audioBufferToWav(audioBuffer: AudioBuffer): Blob {
	const length = audioBuffer.length * audioBuffer.numberOfChannels * 2 + 44;
	const arrayBuffer = new ArrayBuffer(length);
	const view = new DataView(arrayBuffer);
	const channels: Float32Array[] = [];

	let offset = 0;
	let pos = 44;

	// Write WAVE header
	const setUint16 = (data: number) => {
		view.setUint16(offset, data, true);
		offset += 2;
	};

	const setUint32 = (data: number) => {
		view.setUint32(offset, data, true);
		offset += 4;
	};

	// "RIFF" chunk descriptor
	setUint32(0x46464952); // "RIFF"
	setUint32(length - 8); // file length - 8
	setUint32(0x45564157); // "WAVE"

	// "fmt " sub-chunk
	setUint32(0x20746d66); // "fmt "
	setUint32(16); // chunkSize
	setUint16(1); // audioFormat (1 = PCM)
	setUint16(audioBuffer.numberOfChannels);
	setUint32(audioBuffer.sampleRate);
	setUint32(audioBuffer.sampleRate * 2 * audioBuffer.numberOfChannels); // avgByteRate
	setUint16(audioBuffer.numberOfChannels * 2); // blockAlign
	setUint16(16); // bitsPerSample

	// "data" sub-chunk
	setUint32(0x61746164); // "data"
	setUint32(length - pos); // chunkSize

	// Write the actual audio data
	for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
		channels.push(audioBuffer.getChannelData(channel));
	}

	// Interleave channels
	let index = 0;
	while (pos < length) {
		for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
			let s = Math.max(-1, Math.min(1, channels[channel][index]));
			s = s < 0 ? s * 0x8000 : s * 0x7fff;
			view.setInt16(pos, s, true);
			pos += 2;
		}
		index++;
	}

	return new Blob([arrayBuffer], { type: "audio/wav" });
}

/**
 * Convert time in seconds to a formatted string (MM:SS or HH:MM:SS).
 */
export function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) {
		return "00:00";
	}

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	}

	return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
