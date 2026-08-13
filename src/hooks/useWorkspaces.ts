import type { Workspace } from "@/lib/db/workspaceDb";
import {
	createWorkspace as dbCreateWorkspace,
	deleteWorkspace as dbDeleteWorkspace,
	getAllWorkspaces,
	getActiveWorkspace,
	renameWorkspace as dbRenameWorkspace,
	setActiveWorkspace as dbSetActiveWorkspace,
} from "@/lib/db/workspaceDb";
import { useEffect, useState } from "preact/hooks";

export function useWorkspaces() {
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [activeWorkspace, setActiveWorkspace] = useState<Workspace | undefined>(
		undefined,
	);
	const [loading, setLoading] = useState(true);

	// Load initial data
	useEffect(() => {
		const loadWorkspaces = async () => {
			try {
				const allWorkspaces = await getAllWorkspaces();
				setWorkspaces(allWorkspaces);

				const active = await getActiveWorkspace();
				setActiveWorkspace(active);

				// If no active workspace and there are workspaces, make the first one active
				if (!active && allWorkspaces.length > 0 && allWorkspaces[0].id) {
					await dbSetActiveWorkspace(allWorkspaces[0].id);
					setActiveWorkspace(allWorkspaces[0]);
				}
			} catch (error) {
				console.error("Error loading workspaces:", error);
			} finally {
				setLoading(false);
			}
		};

		loadWorkspaces();
	}, []);

	const createWorkspace = async (name: string) => {
		try {
			const id = await dbCreateWorkspace(name);
			const updatedWorkspaces = await getAllWorkspaces();
			setWorkspaces(updatedWorkspaces);

			// If this is the first workspace, set it as active
			if (updatedWorkspaces.length === 1) {
				const workspace = updatedWorkspaces[0];
				if (workspace.id) {
					setActiveWorkspace(workspace);
				}
			}

			return id;
		} catch (error) {
			console.error("Error creating workspace:", error);
			throw error;
		}
	};

	const setWorkspaceActive = async (workspaceId: number) => {
		try {
			await dbSetActiveWorkspace(workspaceId);
			const updatedWorkspaces = await getAllWorkspaces();
			setWorkspaces(updatedWorkspaces);

			const active = await getActiveWorkspace();
			setActiveWorkspace(active);
		} catch (error) {
			console.error("Error setting active workspace:", error);
			throw error;
		}
	};

	const renameWorkspace = async (workspaceId: number, newName: string) => {
		try {
			await dbRenameWorkspace(workspaceId, newName);
			const updatedWorkspaces = await getAllWorkspaces();
			setWorkspaces(updatedWorkspaces);

			// Update active workspace if it was renamed
			if (activeWorkspace?.id === workspaceId) {
				setActiveWorkspace({
					...activeWorkspace,
					name: newName,
				});
			}
		} catch (error) {
			console.error("Error renaming workspace:", error);
			throw error;
		}
	};

	const deleteWorkspace = async (workspaceId: number) => {
		try {
			await dbDeleteWorkspace(workspaceId);
			const updatedWorkspaces = await getAllWorkspaces();
			setWorkspaces(updatedWorkspaces);

			// Update active workspace if it was deleted
			if (activeWorkspace?.id === workspaceId) {
				const active = await getActiveWorkspace();
				setActiveWorkspace(active);
			}
		} catch (error) {
			console.error("Error deleting workspace:", error);
			throw error;
		}
	};

	return {
		workspaces,
		activeWorkspace,
		loading,
		createWorkspace,
		setWorkspaceActive,
		renameWorkspace,
		deleteWorkspace,
	};
}
