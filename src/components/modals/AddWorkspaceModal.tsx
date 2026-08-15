import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import { useWorkspaceContext } from "../context/WorkspaceContext";
import { SmallDialog } from "../ui/SmallDialog";

interface AddWorkspaceModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AddWorkspaceModal({
	isOpen,
	onClose,
}: AddWorkspaceModalProps): JSX.Element | null {
	const { createWorkspace } = useWorkspaceContext();
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		const name = inputRef.current?.value.trim();

		if (!name) {
			alert("Please enter a workspace name");
			return;
		}

		try {
			await createWorkspace(name);
			if (inputRef.current) {
				inputRef.current.value = "";
			}
			onClose();
		} catch (error) {
			alert(`Error creating workspace: ${error}`);
		}
	};

	return (
		<SmallDialog isOpen={isOpen} title="Add Workspace" onClose={onClose}>
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
						Create
					</button>
				</div>
			</form>
		</SmallDialog>
	);
}
