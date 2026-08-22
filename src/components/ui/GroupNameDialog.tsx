import { useRef, useState } from "preact/hooks";
import type { JSX } from "preact";

interface GroupNameDialogProps {
	isOpen: boolean;
	suggestedName?: string;
	onConfirm: (name: string) => void;
	onCancel: () => void;
}

export function GroupNameDialog({
	isOpen,
	suggestedName = "",
	onConfirm,
	onCancel,
}: GroupNameDialogProps): JSX.Element {
	const [name, setName] = useState(suggestedName);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const trimmed = name.trim();

		if (!trimmed) {
			setError("Group name cannot be empty");
			return;
		}

		if (trimmed.length > 50) {
			setError("Group name must be 50 characters or less");
			return;
		}

		setError(null);
		onConfirm(trimmed);
		setName("");
	};

	const handleCancel = () => {
		setError(null);
		setName("");
		onCancel();
	};

	if (!isOpen) return <></>;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-lg p-6 w-96">
				<h2 className="text-lg font-semibold mb-4">Create New Group</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="group-name" className="block text-sm font-medium mb-2">
							Group Name
						</label>
						<input
							ref={inputRef}
							id="group-name"
							type="text"
							value={name}
							onInput={(e) => {
								setName((e.target as HTMLInputElement).value);
								setError(null);
							}}
							placeholder="e.g., Scene, Characters, Props..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							autoFocus
						/>
						{error && <p className="text-red-600 text-sm mt-1">{error}</p>}
					</div>

					<div className="flex gap-2 justify-end">
						<button
							type="button"
							onClick={handleCancel}
							className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							Create
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
