import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { AudioTrim } from "../sections/AudioTrim";
import { CharacterSheet } from "../sections/CharacterSheet";
import { References } from "../sections/References";
import { VideoEndFrame } from "../sections/VideoEndFrame";
import { Workflows } from "../sections/Workflows";
import { Workspaces } from "../sections/Workspaces";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import {
	WorkspaceProvider,
	type WorkspaceContextType,
} from "../context/WorkspaceContext";
import { useWorkspaces } from "@/hooks/useWorkspaces";

const SECTIONS = {
	workflows: Workflows,
	references: References,
	"character-sheet": CharacterSheet,
	"video-end-frame": VideoEndFrame,
	"audio-trim": AudioTrim,
	workspaces: Workspaces,
};

function LayoutContent(): JSX.Element {
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

export function Layout(): JSX.Element {
	const workspacesHook = useWorkspaces();

	const contextValue: WorkspaceContextType = {
		workspaces: workspacesHook.workspaces,
		activeWorkspace: workspacesHook.activeWorkspace,
		loading: workspacesHook.loading,
		createWorkspace: workspacesHook.createWorkspace,
		setWorkspaceActive: workspacesHook.setWorkspaceActive,
		renameWorkspace: workspacesHook.renameWorkspace,
		deleteWorkspace: workspacesHook.deleteWorkspace,
	};

	return (
		<WorkspaceProvider value={contextValue}>
			<LayoutContent />
		</WorkspaceProvider>
	);
}
