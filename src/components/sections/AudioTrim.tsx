import type { JSX } from "preact";
import "./section.css";

export function AudioTrim(): JSX.Element {
	return (
		<div className="section">
			<h2 className="section-title">Audio Trim</h2>
			<div className="section-placeholder">
				<p>Audio Trim section - coming soon</p>
				<p className="placeholder-subtitle">
					Trim and edit audio files with precision
				</p>
			</div>
		</div>
	);
}
