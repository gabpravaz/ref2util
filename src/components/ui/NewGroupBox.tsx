import type { JSX } from "preact";
import { Plus } from "lucide-react";

interface NewGroupBoxProps {
	onDrop: (files: FileList) => void;
}

export function NewGroupBox({ onDrop }: NewGroupBoxProps): JSX.Element {
	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		(e.currentTarget as HTMLDivElement).classList.add("drag-over");
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		(e.currentTarget as HTMLDivElement).classList.remove("drag-over");
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		(e.currentTarget as HTMLDivElement).classList.remove("drag-over");

		if (e.dataTransfer?.files) {
			onDrop(e.dataTransfer.files);
		}
	};

	return (
		<div
			className="reference-new-group bg-white border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center hover:border-blue-400 transition-colors min-h-12"
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<div className="flex items-center gap-2 text-gray-400 hover:text-blue-600 cursor-pointer">
				<Plus className="w-4 h-4" />
				<span className="text-sm">Drag media here to create new group</span>
			</div>
		</div>
	);
}
