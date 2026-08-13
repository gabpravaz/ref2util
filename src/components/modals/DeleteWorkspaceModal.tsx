import type { JSX } from "preact";
import { useWorkspaceContext } from "../context/WorkspaceContext";

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

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-background border border-border rounded-lg shadow-lg max-w-sm w-full mx-4">
				<div className="p-6 border-b border-border">
					<h2 className="text-xl font-semibold text-foreground">
						Delete Workspace
					</h2>
				</div>

				<div className="p-6">
					<p className="text-foreground mb-4">
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
			</div>
		</div>
	);
}
