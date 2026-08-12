import { useState } from "preact/hooks";
import type { JSX } from "preact";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Workflows } from "../sections/Workflows";
import { References } from "../sections/References";
import { CharacterSheet } from "../sections/CharacterSheet";
import { VideoEndFrame } from "../sections/VideoEndFrame";
import { AudioTrim } from "../sections/AudioTrim";
import "./layout.css";

const SECTIONS = {
	workflows: Workflows,
	references: References,
	"character-sheet": CharacterSheet,
	"video-end-frame": VideoEndFrame,
	"audio-trim": AudioTrim,
};

export function Layout(): JSX.Element {
	const [activeSection, setActiveSection] = useState<string>("workflows");

	const SectionComponent = SECTIONS[activeSection as keyof typeof SECTIONS];

	return (
		<div className="layout">
			<Header />
			<Navigation onNavChange={setActiveSection} activeSection={activeSection} />
			<main className="content">
				{SectionComponent && <SectionComponent />}
			</main>
			<Footer />
		</div>
	);
}
