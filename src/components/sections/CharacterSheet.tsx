import type { JSX } from "preact";
import "./section.css";

export function CharacterSheet(): JSX.Element {
	return (
		<div className="section">
			<h2 className="section-title">Character Sheet</h2>
			<div className="section-placeholder">
				<p>Character Sheet section - coming soon</p>
				<p className="placeholder-subtitle">
					Create and manage character sheets for your projects
				</p>
			</div>
		</div>
	);
}
