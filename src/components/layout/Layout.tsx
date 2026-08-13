import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { AudioTrim } from "../sections/AudioTrim";
import { CharacterSheet } from "../sections/CharacterSheet";
import { References } from "../sections/References";
import { VideoEndFrame } from "../sections/VideoEndFrame";
import { Workflows } from "../sections/Workflows";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Navigation } from "./Navigation";

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
		<div className="flex flex-col h-screen w-full">
			<Header />
			<Navigation
				onNavChange={setActiveSection}
				activeSection={activeSection}
			/>
			<main className="flex-1 overflow-y-auto px-6 py-8">
				{SectionComponent && <SectionComponent />}
			</main>
			<Footer />
		</div>
	);
}
