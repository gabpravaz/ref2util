import { cva } from "class-variance-authority";
import type { JSX } from "preact";

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

const navButtonVariants = cva(
	"flex-1 px-2 py-4 text-sm font-medium text-muted-foreground transition-all duration-200 ease-in-out hover:text-foreground hover:bg-muted/50 cursor-pointer text-center whitespace-nowrap overflow-hidden text-ellipsis relative focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			isActive: {
				true: "text-foreground font-semibold border-b-2 border-primary hover:bg-muted/70",
				false: "",
			},
		},
		defaultVariants: {
			isActive: false,
		},
	},
);

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
		<nav className="border-b border-border">
			<ul className="flex h-full list-none m-0 p-0">
				{NAV_ITEMS.map((item, index) => (
					<li
						key={item.id}
						className={`flex items-stretch flex-1 ${
							index !== NAV_ITEMS.length - 1 ? "border-r border-border" : ""
						}`}
						style={{ flex: `0 0 ${itemWidth}%` }}
					>
						<button
							className={navButtonVariants({
								isActive: activeSection === item.id,
							})}
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
