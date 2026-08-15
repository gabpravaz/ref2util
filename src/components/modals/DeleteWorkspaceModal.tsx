import type { JSX } from "preact";
import { useWorkspaceContext } from "../context/WorkspaceContext";
import { SmallDialog } from "../ui/SmallDialog";

interface DeleteWorkspaceModalProps {
	isOpen: boolean;
	workspaceId: number | null;
	workspaceName: string;
	onClose: () => void;
}

export function DeleteWorkspaceModal({
	isOpen,
	workspaceId,
	workspaceName,
	onClose,
}: DeleteWorkspaceModalProps): JSX.Element | null {
	const { deleteWorkspace } = useWorkspaceContext();

	const handleDelete = async () => {
		try {
			if (workspaceId) {
				await deleteWorkspace(workspaceId);
				onClose();
			}
		} catch (error) {
			alert(`Error deleting workspace: ${error}`);
		}
	};

	return (
		<SmallDialog isOpen={isOpen} title="Delete Workspace" onClose={onClose}>
			<div className="p-6">
				<p className="text-foreground mb-6">
					Are you sure you want to delete the workspace "{workspaceName}"? This
					action cannot be undone and all data in this workspace will be
					permanently deleted.
				</p>

				<div className="flex justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-lg text-foreground border border-border hover:bg-muted transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleDelete}
						className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
					>
						Delete
					</button>
				</div>
			</div>
		</SmallDialog>
	);
}
