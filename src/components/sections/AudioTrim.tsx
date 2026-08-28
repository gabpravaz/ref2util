import { AlertCircle, Download } from "lucide-react";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useAudioTrim } from "@/hooks/useAudioTrim";
import { AudioDragDrop } from "./AudioDragDrop";
import "./section.css";
import "./audioTrim.css";

function drawWaveform(
	canvas: HTMLCanvasElement,
	peaks: number[],
	startTime: number,
	endTime: number,
	duration: number,
): void {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	const width = canvas.width;
	const height = canvas.height;

	// Clear canvas
	ctx.fillStyle = "hsl(var(--muted))";
	ctx.fillRect(0, 0, width, height);

	// Draw waveform
	const centerY = height / 2;
	const barWidth = Math.max(1, width / peaks.length);
	const barGap = Math.max(0, barWidth * 0.1);
	const actualBarWidth = barWidth - barGap;

	// Get the primary color from CSS
	const primaryColor = "hsl(var(--primary))";
	const dimmedColor = "hsl(var(--primary) / 0.3)";

	for (let i = 0; i < peaks.length; i++) {
		const peak = peaks[i];
		const x = i * barWidth;
		const barHeight = peak * (height / 2) * 0.8;

		// Determine if this bar is in the trim range
		const barTime = (i / peaks.length) * duration;
		const isInTrimRange = barTime >= startTime && barTime <= endTime;

		ctx.fillStyle = isInTrimRange ? primaryColor : dimmedColor;
		ctx.fillRect(x, centerY - barHeight / 2, actualBarWidth, barHeight);
	}
}

export function AudioTrim(): JSX.Element {
	const {
		audioBuffer,
		waveformData,
		startTime,
		endTime,
		isLoading,
		isProcessing,
		error,
		loadAudio,
		setTrimStart,
		setTrimEnd,
		downloadTrimmedAudio,
		reset,
		clearError,
		formatTime,
	} = useAudioTrim();

	const [isDraggingStart, setIsDraggingStart] = useState(false);
	const [isDraggingEnd, setIsDraggingEnd] = useState(false);
	const waveformContainerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Draw waveform when waveformData or trim times change
	useEffect(() => {
		if (!canvasRef.current || !waveformData) return;

		// Set canvas size to match container
		const container = waveformContainerRef.current;
		if (container) {
			canvasRef.current.width = container.offsetWidth;
			canvasRef.current.height = 150;
		}

		drawWaveform(
			canvasRef.current,
			waveformData.peaks,
			startTime,
			endTime,
			waveformData.duration,
		);
	}, [waveformData, startTime, endTime]);

	const handleFileSelect = (file: File): void => {
		loadAudio(file);
	};

	const handleMouseDown = (type: "start" | "end") => {
		if (type === "start") {
			setIsDraggingStart(true);
		} else {
			setIsDraggingEnd(true);
		}
	};

	const handleMouseUp = (): void => {
		setIsDraggingStart(false);
		setIsDraggingEnd(false);
	};

	const handleMouseMove = (e: MouseEvent): void => {
		if (!waveformContainerRef.current || !waveformData) return;

		const rect = waveformContainerRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = Math.max(0, Math.min(1, x / rect.width));
		const time = percentage * waveformData.duration;

		if (isDraggingStart) {
			setTrimStart(Math.min(time, endTime - 0.1));
		} else if (isDraggingEnd) {
			setTrimEnd(Math.max(time, startTime + 0.1));
		}
	};

	const duration = audioBuffer?.duration || 0;
	const trimmedDuration = endTime - startTime;
	const canDownload = audioBuffer && trimmedDuration > 0;

	return (
		<div className="section">
			<h2 className="section-title">Audio Trim</h2>

			{/* Audio drag-drop area */}
			<AudioDragDrop
				onFileSelect={handleFileSelect}
				disabled={isLoading || isProcessing}
			/>

			{/* Error message */}
			{error && (
				<div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
					<AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
					<div className="flex-1">
						<h3 className="text-sm font-medium text-destructive">
							Error loading audio
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

			{/* Audio loaded state - show trim interface */}
			{audioBuffer && waveformData && !isLoading && (
				<div className="space-y-4">
					{/* Trim info */}
					<div className="flex items-center justify-between px-4">
						<div className="flex gap-4">
							<div className="flex flex-col">
								<span className="text-xs text-muted-foreground">Duration</span>
								<span className="text-sm font-medium text-foreground">
									{formatTime(duration)}
								</span>
							</div>
							<div className="flex flex-col">
								<span className="text-xs text-muted-foreground">Trimmed</span>
								<span className="text-sm font-medium text-foreground">
									{formatTime(trimmedDuration)}
								</span>
							</div>
						</div>

						<button
							type="button"
							onClick={reset}
							className="text-xs px-3 py-1 bg-muted hover:bg-muted-foreground/20 text-muted-foreground rounded transition-colors"
						>
							Reset
						</button>
					</div>

					{/* Waveform visualization with trim handles */}
					<section
						ref={waveformContainerRef}
						className="audio-trim-container"
						aria-label="Audio waveform with trim handles"
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
					>
						<canvas
							ref={canvasRef}
							className="audio-waveform"
							width={800}
							height={150}
						/>

						{/* Trim overlay */}
						<div className="audio-trim-overlay">
							{/* Left handle */}
							<div
								className="audio-trim-handle audio-trim-handle-start"
								style={{
									left: `${(startTime / waveformData.duration) * 100}%`,
								}}
								onMouseDown={() => handleMouseDown("start")}
								role="slider"
								aria-label={`Start time: ${formatTime(startTime)}`}
								aria-valuenow={startTime}
								aria-valuemin={0}
								aria-valuemax={endTime}
								tabIndex={0}
							/>

							{/* Right handle */}
							<div
								className="audio-trim-handle audio-trim-handle-end"
								style={{
									right: `${100 - (endTime / waveformData.duration) * 100}%`,
								}}
								onMouseDown={() => handleMouseDown("end")}
								role="slider"
								aria-label={`End time: ${formatTime(endTime)}`}
								aria-valuenow={endTime}
								aria-valuemin={startTime}
								aria-valuemax={waveformData.duration}
								tabIndex={0}
							/>

							{/* Trim range highlight */}
							<div
								className="audio-trim-range"
								style={{
									left: `${(startTime / waveformData.duration) * 100}%`,
									right: `${100 - (endTime / waveformData.duration) * 100}%`,
								}}
							/>

							{/* Dim areas outside trim range */}
							<div
								className="audio-trim-dim-start"
								style={{
									width: `${(startTime / waveformData.duration) * 100}%`,
								}}
							/>
							<div
								className="audio-trim-dim-end"
								style={{
									width: `${100 - (endTime / waveformData.duration) * 100}%`,
								}}
							/>
						</div>

						{/* Time labels */}
						<div className="audio-time-labels">
							<span className="audio-time-label-start">
								{formatTime(startTime)}
							</span>
							<span className="audio-time-label-end">
								{formatTime(endTime)}
							</span>
						</div>
					</section>

					{/* Download button */}
					<div className="flex gap-2 justify-end">
						<button
							type="button"
							onClick={downloadTrimmedAudio}
							disabled={!canDownload || isProcessing}
							className={`
								flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
								${
									canDownload && !isProcessing
										? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
										: "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
								}
							`}
						>
							<Download className="w-4 h-4" />
							{isProcessing ? "Processing..." : "Download"}
						</button>
					</div>
				</div>
			)}

			{/* Empty state */}
			{!audioBuffer && !isLoading && !error && (
				<div className="text-center py-4">
					<p className="text-sm text-muted-foreground">
						Upload an audio file to get started
					</p>
				</div>
			)}
		</div>
	);
}
