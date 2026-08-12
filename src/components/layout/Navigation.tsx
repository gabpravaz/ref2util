import type { JSX } from "preact";
import "./navigation.css";

interface NavItem {
	id: string;
	label: string;
}

const NAV_ITEMS: NavItem[] = [
	{ id: "workflows", label: "Workflows" },
	{ id: "references", label: "References" },
	{ id: "character-sheet", label: "Character Sheet" },
	{ id: "video-end-frame", label: "Video End Frame" },
	{ id: "audio-trim", label: "Audio Trim" },
];

interface NavigationProps {
	onNavChange: (sectionId: string) => void;
	activeSection: string;
}

export function Navigation({
	onNavChange,
	activeSection,
}: NavigationProps): JSX.Element {
	const itemWidth = 100 / NAV_ITEMS.length;

	return (
		<nav className="navigation">
			<ul className="nav-list">
				{NAV_ITEMS.map((item) => (
					<li
						key={item.id}
						className="nav-item"
						style={{ flex: `0 0 ${itemWidth}%` }}
					>
						<button
							className={`nav-button ${
								activeSection === item.id ? "active" : ""
							}`}
							onClick={() => onNavChange(item.id)}
							type="button"
						>
							{item.label}
						</button>
					</li>
				))}
			</ul>
		</nav>
	);
}
