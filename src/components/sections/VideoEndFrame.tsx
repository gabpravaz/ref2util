import type { JSX } from "preact";
import { AlertCircle } from "lucide-react";
import { useVideoFrameExtraction } from "@/hooks/useVideoFrameExtraction";
import { VideoDragDrop } from "./VideoDragDrop";
import { FrameItem } from "./FrameItem";
import { FrameSkeleton } from "./FrameSkeleton";
import "./section.css";
import "./videoEndFrame.css";

export function VideoEndFrame(): JSX.Element {
	const { frames, isLoading, error, extractFrames, clearFrames, clearError } =
		useVideoFrameExtraction();

	const handleFileSelect = (file: File): void => {
		extractFrames(file);
	};

	return (
		<div className="section">
			<h2 className="section-title">Video End Frame</h2>

			{/* Video drag-drop area */}
			<VideoDragDrop
				onFileSelect={handleFileSelect}
				disabled={isLoading}
			/>

			{/* Error message */}
			{error && (
				<div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
					<AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
					<div className="flex-1">
						<h3 className="text-sm font-medium text-destructive">
							Error extracting frames
						</h3>
						<p className="text-sm text-destructive/80 mt-1">{error}</p>
						<button
							type="button"
							onClick={clearError}
							className="text-xs mt-2 px-3 py-1 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded transition-colors"
						>
							Dismiss
						</button>
					</div>
				</div>
			)}

			{/* Loading state - show skeletons */}
			{isLoading && (
				<div className="space-y-2">
					<p className="text-sm text-muted-foreground text-center">
						Extracting frames...
					</p>
					<div className="flex gap-3 justify-center flex-wrap">
						{Array.from({ length: 4 }).map((_, i) => (
							<FrameSkeleton key={i} />
						))}
					</div>
				</div>
			)}

			{/* Extracted frames */}
			{frames.length > 0 && !isLoading && (
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-foreground">
							Extracted Frames
						</h3>
						<button
							type="button"
							onClick={clearFrames}
							className="text-xs px-3 py-1 bg-muted hover:bg-muted-foreground/20 text-muted-foreground rounded transition-colors"
						>
							Clear
						</button>
					</div>
					<div className="flex gap-3 flex-wrap">
						{frames.map((frame, index) => (
							<FrameItem key={index} frame={frame} index={index} />
						))}
					</div>
					<p className="text-xs text-muted-foreground">
						💡 Frames are draggable - drag them into other sections to use
					</p>
				</div>
			)}

			{/* Empty state */}
			{frames.length === 0 && !isLoading && !error && (
				<div className="text-center py-4">
					<p className="text-sm text-muted-foreground">
						No frames extracted yet
					</p>
				</div>
			)}
		</div>
	);
}
