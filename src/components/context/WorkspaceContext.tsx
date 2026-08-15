import type { JSX } from "preact";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { Workspace } from "@/lib/db/workspaceDb";

export interface WorkspaceContextType {
	workspaces: Workspace[];
	activeWorkspace: Workspace | undefined;
	loading: boolean;
	createWorkspace: (name: string) => Promise<number>;
	setWorkspaceActive: (workspaceId: number) => Promise<void>;
	renameWorkspace: (workspaceId: number, newName: string) => Promise<void>;
	deleteWorkspace: (workspaceId: number) => Promise<void>;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
	undefined,
);

export function useWorkspaceContext(): WorkspaceContextType {
	const context = useContext(WorkspaceContext);
	if (!context) {
		throw new Error(
			"useWorkspaceContext must be used within a WorkspaceProvider",
		);
	}
	return context;
}

interface WorkspaceProviderProps {
	children: JSX.Element;
	value: WorkspaceContextType;
}

export function WorkspaceProvider({
	children,
	value,
}: WorkspaceProviderProps): JSX.Element {
	return (
		<WorkspaceContext.Provider value={value}>
			{children}
		</WorkspaceContext.Provider>
	);
}
