import type { JSX } from "preact";
import { Music, Trash2 } from "lucide-react";
import type { MediaFile } from "@/lib/db/referenceDb";
import { base64ToDataUrl } from "@/lib/mediaUtils";

interface MediaFileItemProps {
	file: MediaFile;
	onDelete: (fileId: string) => void;
}

export function MediaFileItem({
	file,
	onDelete,
}: MediaFileItemProps): JSX.Element {
	const handleDelete = (e: Event) => {
		e.preventDefault();
		if (confirm(`Delete "${file.name}"?`)) {
			onDelete(file.id);
		}
	};

	const handleDragStart = (e: DragEvent) => {
		e.dataTransfer!.effectAllowed = "copy";
		// Set file path for dragging
		e.dataTransfer!.setData("text/uri-list", file.filePath);
		e.dataTransfer!.setData("text/plain", file.filePath);
	};

	return (
		<div className="media-file-item group" draggable onDragStart={handleDragStart}>
			<div className="media-file-thumbnail-container relative cursor-grab active:cursor-grabbing">
				{file.type === "audio" ? (
					<div className="w-full h-40 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center rounded-lg">
						<Music className="w-12 h-12 text-white" />
					</div>
				) : file.thumbnail ? (
					<img
						src={base64ToDataUrl(file.thumbnail, "image/jpeg")}
						alt={file.name}
						className="w-full h-40 object-cover rounded-lg"
					/>
				) : (
					<div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-lg">
						<span className="text-sm text-gray-500">No thumbnail</span>
					</div>
				)}

				<button
					type="button"
					onClick={handleDelete}
					className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
					title="Delete file"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			</div>

			<p className="media-file-name text-sm font-medium mt-2 text-center truncate">
				{file.name}
			</p>
		</div>
	);
}
