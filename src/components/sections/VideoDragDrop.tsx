import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import { Upload } from "lucide-react";

interface VideoDragDropProps {
	onFileSelect: (file: File) => void;
	disabled?: boolean;
}

export function VideoDragDrop({
	onFileSelect,
	disabled = false,
}: VideoDragDropProps): JSX.Element {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = (files: FileList | null): void => {
		if (!files || files.length === 0) return;
		const file = files[0];
		onFileSelect(file);
	};

	const handleInputChange = (e: Event): void => {
		const target = e.target as HTMLInputElement;
		handleFileSelect(target.files);
	};

	const handleDragOver = (e: DragEvent): void => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent): void => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent): void => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		handleFileSelect(e.dataTransfer?.files || null);
	};

	const handleClick = (): void => {
		if (!disabled && inputRef.current) {
			inputRef.current.click();
		}
	};

	return (
		<div>
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
				className={`
					relative flex flex-col items-center justify-center
					p-8 border-2 border-dashed rounded-lg
					transition-all duration-200
					${
						isDragging
							? "drag-over"
							: disabled
								? "bg-muted/50 border-border/50 cursor-not-allowed opacity-60"
								: "bg-muted border-border cursor-pointer hover:border-primary hover:bg-muted/80"
					}
				`}
			>
				<Upload className="w-8 h-8 mb-2 text-muted-foreground" />
				<p className="text-sm font-medium text-foreground">
					Drop your video here
				</p>
				<p className="text-xs text-muted-foreground mt-1">
					or click to browse
				</p>
				<input
					ref={inputRef}
					type="file"
					accept="video/*"
					onChange={handleInputChange}
					disabled={disabled}
					className="hidden"
					aria-label="Upload video file"
				/>
			</div>
		</div>
	);
}
