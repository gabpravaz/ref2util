import type { JSX } from "preact";
import { ChevronDown, Trash2 } from "lucide-react";
import { useState } from "preact/hooks";
import type { ReferenceGroup } from "@/lib/db/referenceDb";
import { MediaFileItem } from "./MediaFileItem";

interface ReferenceGroupProps {
	group: ReferenceGroup;
	onDeleteFile: (fileId: string) => void;
	onDeleteGroup: () => void;
	onDrop?: (files: FileList) => void;
}

export function ReferenceGroupComponent({
	group,
	onDeleteFile,
	onDeleteGroup,
	onDrop,
}: ReferenceGroupProps): JSX.Element {
	const [isExpanded, setIsExpanded] = useState(true);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleDeleteGroup = (e: Event) => {
		e.preventDefault();
		if (confirm(`Delete entire group "${group.name}"?`)) {
			onDeleteGroup();
		}
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const target = e.currentTarget as HTMLElement;
		if (!target?.contains(e.relatedTarget as Node)) {
			setIsDragOver(false);
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);

		if (e.dataTransfer?.files && onDrop) {
			onDrop(e.dataTransfer.files);
		}
	};

	return (
		<div
			className={`reference-group bg-white rounded-lg shadow-md overflow-hidden transition-all ${
				isDragOver ? "border-2 border-blue-500 shadow-lg" : "border border-gray-200"
			}`}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<div
				className="reference-group-header bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center gap-3">
					<ChevronDown
						className={`w-5 h-5 text-white transition-transform ${
							isExpanded ? "rotate-0" : "-rotate-90"
						}`}
					/>
					<h3 className="text-white font-semibold">{group.name}</h3>
					<span className="text-blue-100 text-sm">({group.files.length})</span>
				</div>

				<button
					type="button"
					onClick={handleDeleteGroup}
					className="p-1.5 text-white hover:bg-red-600 rounded-md transition-colors"
					title="Delete group"
				>
					<Trash2 className="w-5 h-5" />
				</button>
			</div>

			{isExpanded && (
				<div className="reference-group-content p-4">
					{group.files.length === 0 ? (
						<p className="text-gray-500 text-center py-8">No files in this group</p>
					) : (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{group.files.map((file) => (
								<MediaFileItem
									key={file.id}
									file={file}
									onDelete={onDeleteFile}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
