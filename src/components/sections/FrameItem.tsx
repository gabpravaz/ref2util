import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import type { ExtractedFrame } from "@/lib/frameExtractor";

interface FrameItemProps {
	frame: ExtractedFrame;
	index: number;
}

export function FrameItem({ frame, index }: FrameItemProps): JSX.Element {
	const imgRef = useRef<HTMLImageElement>(null);

	const handleDragStart = (e: DragEvent): void => {
		if (e.dataTransfer && imgRef.current) {
			e.dataTransfer.effectAllowed = "copy";
			e.dataTransfer.setData("text/uri-list", frame.dataUrl);

			// Create and append drag image to DOM for proper rendering
			const dragImage = new Image();
			dragImage.src = frame.dataUrl;
			dragImage.style.position = "fixed";
			dragImage.style.top = "-9999px";
			dragImage.style.opacity = "0";
			document.body.appendChild(dragImage);

			e.dataTransfer.setDragImage(dragImage, 48, 48);

			// Clean up after drag ends
			const handleDragEnd = (): void => {
				document.body.removeChild(dragImage);
				window.removeEventListener("dragend", handleDragEnd);
			};
			window.addEventListener("dragend", handleDragEnd);
		}
	};

	return (
		<div
			className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-border bg-muted cursor-grab active:cursor-grabbing transition-transform hover:scale-105"
			draggable={true}
			onDragStart={handleDragStart}
			role="img"
			aria-label={`Video frame ${index + 1} - ${(frame.timestamp || 0).toFixed(2)}s`}
		>
			<img
				ref={imgRef}
				src={frame.dataUrl}
				alt=""
				className="w-full h-full object-cover"
			/>
			<div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
				{index + 1}
			</div>
		</div>
	);
}
