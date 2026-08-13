import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { useWorkspaceContext } from "../context/WorkspaceContext";

interface RenameWorkspaceModalProps {
	isOpen: boolean;
	workspaceId: number | null;
	currentName: string;
	onClose: () => void;
}

export function RenameWorkspaceModal({
	isOpen,
	workspaceId,
	currentName,
	onClose,
}: RenameWorkspaceModalProps): JSX.Element | null {
	const { renameWorkspace } = useWorkspaceContext();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.value = currentName;
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isOpen, currentName]);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		const newName = inputRef.current?.value.trim();

		if (!newName) {
			alert("Please enter a workspace name");
			return;
		}

		if (newName === currentName) {
			onClose();
			return;
		}

		try {
			if (workspaceId) {
				await renameWorkspace(workspaceId, newName);
				onClose();
			}
		} catch (error) {
			alert(`Error renaming workspace: ${error}`);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-background border border-border rounded-lg shadow-lg max-w-sm w-full mx-4">
				<div className="p-6 border-b border-border">
					<h2 className="text-xl font-semibold text-foreground">
						Rename Workspace
					</h2>
				</div>

				<form onSubmit={handleSubmit} className="p-6">
					<div className="mb-4">
						<label className="block text-sm font-medium text-foreground mb-2">
							Workspace Name
						</label>
						<input
							ref={inputRef}
							type="text"
							placeholder="Enter workspace name"
							className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
						/>
					</div>

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 rounded-lg text-foreground border border-border hover:bg-muted transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
						>
							Rename
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
