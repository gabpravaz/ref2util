import { Upload } from "lucide-react";
import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";

interface AudioDragDropProps {
	onFileSelect: (file: File) => void;
	disabled?: boolean;
}

export function AudioDragDrop({
	onFileSelect,
	disabled = false,
}: AudioDragDropProps): JSX.Element {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const dragCounterRef = useRef(0);

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
	};

	const handleDragEnter = (e: DragEvent): void => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current++;
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent): void => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current--;
		if (dragCounterRef.current === 0) {
			setIsDragging(false);
		}
	};

	const handleDrop = (e: DragEvent): void => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current = 0;
		setIsDragging(false);
		handleFileSelect(e.dataTransfer?.files || null);
	};

	const handleClick = (): void => {
		if (!disabled && inputRef.current) {
			inputRef.current.click();
		}
	};

	const handleKeyDown = (e: KeyboardEvent): void => {
		if (!disabled && (e.key === "Enter" || e.key === " ")) {
			e.preventDefault();
			handleClick();
		}
	};

	return (
		<div>
			<button
				type="button"
				disabled={disabled}
				onDragOver={handleDragOver}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				className={`
					relative flex flex-col items-center justify-center
					p-8 border-2 border-dashed rounded-lg
					transition-all duration-200 w-full
					${
						isDragging
							? "border-primary bg-primary/10 cursor-copy"
							: disabled
								? "bg-muted/50 border-border/50 cursor-not-allowed opacity-60"
								: "bg-muted border-border cursor-pointer hover:border-primary hover:bg-muted/80"
					}
				`}
			>
				<Upload className="w-8 h-8 mb-2 text-muted-foreground" />
				<p className="text-sm font-medium text-foreground">
					Drop your audio here
				</p>
				<p className="text-xs text-muted-foreground mt-1">or click to browse</p>
			</button>
			<input
				ref={inputRef}
				type="file"
				accept="audio/*"
				onChange={handleInputChange}
				disabled={disabled}
				className="hidden"
				aria-label="Upload audio file"
			/>
		</div>
	);
}
