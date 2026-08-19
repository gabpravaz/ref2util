/**
 * Extracts frames from a video file using Canvas API.
 * Supports any video format that the browser's HTMLVideoElement can play.
 */

export interface ExtractedFrame {
	dataUrl: string;
	timestamp: number;
}

/**
 * Extract the last 4 frames from a video file.
 * Processes the video by seeking to specific timestamps and capturing frames via canvas.
 */
export async function extractLast4Frames(
	videoFile: File,
): Promise<ExtractedFrame[]> {
	const videoUrl = URL.createObjectURL(videoFile);

	try {
		// Create a video element to load the video
		const video = document.createElement("video");
		video.src = videoUrl;
		video.crossOrigin = "anonymous";

		// Wait for the video metadata to load (to get duration)
		await new Promise<void>((resolve, reject) => {
			const handleLoadedMetadata = (): void => {
				video.removeEventListener("loadedmetadata", handleLoadedMetadata);
				resolve();
			};

			const handleError = (): void => {
				video.removeEventListener("error", handleError);
				reject(new Error("Failed to load video metadata"));
			};

			video.addEventListener("loadedmetadata", handleLoadedMetadata);
			video.addEventListener("error", handleError);
		});

		const duration = video.duration;
		if (!Number.isFinite(duration) || duration <= 0) {
			throw new Error("Invalid video duration");
		}

		// Calculate timestamps for the last 4 frames
		// Sample from the last 20% of the video for better frame variety
		const frameCount = 4;
		const timestamps: number[] = [];

		// Start sampling from 80% of the video onwards
		const sampleStartTime = Math.max(0, duration * 0.8);
		const sampleEndTime = Math.max(duration * 0.9999, sampleStartTime + 0.1);
		const timeDelta = (sampleEndTime - sampleStartTime) / (frameCount - 1);

		for (let i = 0; i < frameCount; i++) {
			timestamps.push(sampleStartTime + i * timeDelta);
		}

		// Extract frames at the calculated timestamps
		const frames: ExtractedFrame[] = [];

		for (const timestamp of timestamps) {
			const frame = await captureFrameAtTime(video, timestamp);
			frames.push(frame);
		}

		return frames;
	} finally {
		URL.revokeObjectURL(videoUrl);
	}
}

/**
 * Capture a single frame from a video at a specific timestamp.
 */
async function captureFrameAtTime(
	video: HTMLVideoElement,
	timestamp: number,
): Promise<ExtractedFrame> {
	return new Promise<ExtractedFrame>((resolve, reject) => {
		// Set the current time to seek to the frame
		video.currentTime = timestamp;

		// Create a one-time listener for when the frame is ready
		const handleSeeked = (): void => {
			video.removeEventListener("seeked", handleSeeked);
			video.removeEventListener("error", handleError);

			try {
				// Create a canvas and draw the current frame
				const canvas = document.createElement("canvas");
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;

				const context = canvas.getContext("2d");
				if (!context) {
					throw new Error("Failed to get canvas context");
				}

				// Draw the video frame onto the canvas
				context.drawImage(video, 0, 0);

				// Convert canvas to data URL (PNG format for quality)
				const dataUrl = canvas.toDataURL("image/png");
				resolve({ dataUrl, timestamp });
			} catch (error) {
				reject(
					error instanceof Error ? error : new Error("Failed to capture frame"),
				);
			}
		};

		const handleError = (): void => {
			video.removeEventListener("seeked", handleSeeked);
			video.removeEventListener("error", handleError);
			reject(new Error("Failed to seek to frame"));
		};

		video.addEventListener("seeked", handleSeeked, { once: true });
		video.addEventListener("error", handleError, { once: true });
	});
}
