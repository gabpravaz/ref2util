/**
 * Convert a File object to data URL
 */
export async function fileToDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result as string);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

/**
 * Generate a thumbnail from an image file
 */
export async function generateImageThumbnail(
	file: File,
	maxWidth: number = 200,
	maxHeight: number = 200,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(new Error("Failed to get canvas context"));
					return;
				}

				// Calculate dimensions maintaining aspect ratio
				let width = img.width;
				let height = img.height;

				if (width > maxWidth || height > maxHeight) {
					const aspectRatio = width / height;
					if (width > height) {
						width = maxWidth;
						height = maxWidth / aspectRatio;
					} else {
						height = maxHeight;
						width = maxHeight * aspectRatio;
					}
				}

				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0, width, height);

				const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
				resolve(base64);
			};
			img.onerror = () =>
				reject(new Error("Failed to load image for thumbnail"));
			img.src = e.target?.result as string;
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

/**
 * Generate a thumbnail from a video file (first frame)
 */
export async function generateVideoThumbnail(
	file: File,
	maxWidth: number = 200,
	maxHeight: number = 200,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			reject(new Error("Failed to get canvas context"));
			return;
		}

		video.crossOrigin = "anonymous";

		video.onloadedmetadata = () => {
			// Calculate dimensions maintaining aspect ratio
			let width = video.videoWidth;
			let height = video.videoHeight;

			if (width > maxWidth || height > maxHeight) {
				const aspectRatio = width / height;
				if (width > height) {
					width = maxWidth;
					height = maxWidth / aspectRatio;
				} else {
					height = maxHeight;
					width = maxHeight * aspectRatio;
				}
			}

			canvas.width = width;
			canvas.height = height;

			// Seek to first frame and capture
			video.currentTime = 0.1;
		};

		video.onseeked = () => {
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
			resolve(base64);
		};

		video.onerror = () => reject(new Error("Failed to load video file"));

		const blob = file.slice(0, file.size);
		video.src = URL.createObjectURL(blob);
	});
}

/**
 * Get the appropriate icon name for audio files
 */
export function getAudioIconName(): string {
	return "Music";
}

/**
 * Create a data URL from base64 string
 */
export function base64ToDataUrl(
	base64: string,
	mimeType: string = "image/jpeg",
): string {
	return `data:${mimeType};base64,${base64}`;
}

/**
 * Check if file is a supported media type
 */
export function isSupportedMediaFile(file: File): boolean {
	const supportedTypes = [
		// Images
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/svg+xml",
		// Videos
		"video/mp4",
		"video/webm",
		"video/quicktime",
		"video/x-msvideo",
		"video/x-matroska",
		// Audio
		"audio/mpeg",
		"audio/wav",
		"audio/ogg",
		"audio/aac",
		"audio/flac",
		"audio/mp4",
	];

	return supportedTypes.some((type) =>
		file.type.startsWith(type.split("/")[0]),
	);
}

/**
 * Create a temporary URL for a media file blob
 * IMPORTANT: Remember to call revokeMediaFileUrl() when done
 */
export function createMediaFileUrl(blob: Blob): string {
	return URL.createObjectURL(blob);
}

/**
 * Revoke a temporary URL to free resources
 */
export function revokeMediaFileUrl(url: string): void {
	URL.revokeObjectURL(url);
}
