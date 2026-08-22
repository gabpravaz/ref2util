import { useEffect, useState, useCallback } from "preact/hooks";
import type { JSX } from "preact";
import type { References } from "@/lib/db/referenceDb";
import {
	getReferences,
	addMediaFile,
	deleteMediaFile,
	deleteGroup,
	extractPrefix,
	getMediaType,
} from "@/lib/db/referenceDb";
import {
	generateImageThumbnail,
	generateVideoThumbnail,
	isSupportedMediaFile,
	fileToDataUrl,
} from "@/lib/mediaUtils";
import { useWorkspaceContext } from "@/components/context/WorkspaceContext";
import { ReferenceGroupComponent } from "@/components/ui/ReferenceGroup";
import { GroupNameDialog } from "@/components/ui/GroupNameDialog";
import { NewGroupBox } from "@/components/ui/NewGroupBox";
import "./section.css";

export function References(): JSX.Element {
	const { activeWorkspace } = useWorkspaceContext();
	const [references, setReferences] = useState<References>({ groups: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showDialog, setShowDialog] = useState(false);
	const [suggestedName, setSuggestedName] = useState("");
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);

	// Load references
	useEffect(() => {
		if (!activeWorkspace) return;

		const loadRefs = async () => {
			try {
				setLoading(true);
				const data = await getReferences(activeWorkspace.id!);
				setReferences(data);
				setError(null);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to load references";
				setError(message);
				console.error("Error loading references:", err);
			} finally {
				setLoading(false);
			}
		};

		loadRefs();
	}, [activeWorkspace]);

	// Handle new files from drag-and-drop (for creating new groups)
	const handleNewFiles = useCallback(
		async (files: FileList) => {
			if (!activeWorkspace) return;

			const validFiles: File[] = [];
			for (const file of Array.from(files)) {
				if (isSupportedMediaFile(file)) {
					validFiles.push(file);
				} else {
					setError(
						`Skipped unsupported file: ${file.name}. Only images, videos, and audio files are supported.`,
					);
				}
			}

			if (validFiles.length === 0) return;

			// Check if files have common prefix
			const prefixes = validFiles
				.map((f) => extractPrefix(f.name))
				.filter((p) => p !== null);
			const commonPrefix =
				prefixes.length > 0 && prefixes.every((p) => p === prefixes[0])
					? prefixes[0]
					: null;

			// Check if group with this prefix already exists
			if (commonPrefix) {
				const existingGroup = references.groups.find(
					(g) => g.name === commonPrefix,
				);
				if (existingGroup) {
					// Add files directly to existing group
					await addFilesToGroup(activeWorkspace.id!, commonPrefix, validFiles);
					return;
				}
			}

			// Need to ask for group name
			setSuggestedName(commonPrefix || "");
			setPendingFiles(validFiles);
			setShowDialog(true);
		},
		[activeWorkspace, references.groups],
	);

	// Handle files dropped on existing group
	const handleDropOnGroup = useCallback(
		async (groupName: string, files: FileList) => {
			if (!activeWorkspace) return;

			const validFiles: File[] = [];
			for (const file of Array.from(files)) {
				if (isSupportedMediaFile(file)) {
					validFiles.push(file);
				} else {
					setError(
						`Skipped unsupported file: ${file.name}. Only images, videos, and audio files are supported.`,
					);
				}
			}

			if (validFiles.length === 0) return;

			// Directly add files to the group
			await addFilesToGroup(activeWorkspace.id!, groupName, validFiles);
		},
		[activeWorkspace],
	);

	// Add files to a group
	const addFilesToGroup = useCallback(
		async (workspaceId: number, groupName: string, filesToAdd: File[]) => {
			try {
				for (const file of filesToAdd) {
					const mediaType = getMediaType(file.name);
					if (!mediaType) continue;

					// Generate thumbnail if applicable
					let thumbnail: string | undefined;
					try {
						if (mediaType === "image") {
							thumbnail = await generateImageThumbnail(file);
							// For images, store as data URL since they're already thumbnails
							const imageDataUrl = await fileToDataUrl(file);
							await addMediaFile(workspaceId, groupName, {
								name: file.name,
								type: mediaType,
								filePath: imageDataUrl,
								thumbnail,
							});
						} else {
							// For videos and audio, generate thumbnail
							if (mediaType === "video") {
								thumbnail = await generateVideoThumbnail(file);
							}
							// Create blob URL as file path
							const filePath = URL.createObjectURL(file);
							await addMediaFile(workspaceId, groupName, {
								name: file.name,
								type: mediaType,
								filePath,
								thumbnail,
							});
						}
					} catch (err) {
						console.warn(`Failed to process ${file.name}:`, err);
					}
				}

				// Reload references
				const updatedRefs = await getReferences(workspaceId);
				setReferences(updatedRefs);
				setError(null);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to add files";
				setError(message);
				console.error("Error adding files:", err);
			}
		},
		[],
	);

	// Handle dialog confirmation
	const handleDialogConfirm = useCallback(
		async (groupName: string) => {
			if (!activeWorkspace) return;

			setShowDialog(false);
			await addFilesToGroup(activeWorkspace.id!, groupName, pendingFiles);
			setPendingFiles([]);
			setSuggestedName("");
		},
		[activeWorkspace, pendingFiles, addFilesToGroup],
	);

	// Handle file deletion from group
	const handleDeleteFile = useCallback(
		async (groupName: string, fileId: string) => {
			if (!activeWorkspace) return;

			try {
				await deleteMediaFile(activeWorkspace.id!, groupName, fileId);
				const updatedRefs = await getReferences(activeWorkspace.id!);
				setReferences(updatedRefs);
				setError(null);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to delete file";
				setError(message);
				console.error("Error deleting file:", err);
			}
		},
		[activeWorkspace],
	);

	// Handle group deletion
	const handleDeleteGroup = useCallback(
		async (groupName: string) => {
			if (!activeWorkspace) return;

			try {
				await deleteGroup(activeWorkspace.id!, groupName);
				const updatedRefs = await getReferences(activeWorkspace.id!);
				setReferences(updatedRefs);
				setError(null);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to delete group";
				setError(message);
				console.error("Error deleting group:", err);
			}
		},
		[activeWorkspace],
	);

	if (!activeWorkspace) {
		return (
			<div className="section">
				<h2 className="section-title">References</h2>
				<div className="section-placeholder">
					<p>No workspace selected</p>
				</div>
			</div>
		);
	}

	return (
		<div className="section">
			<h2 className="section-title">References</h2>

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
					{error}
				</div>
			)}

			<div className="space-y-3">
				{/* New group box */}
				<NewGroupBox onDrop={handleNewFiles} />

				{/* Groups list */}
				{loading ? (
					<div className="text-center py-12 text-gray-500">
						<p>Loading references...</p>
					</div>
				) : references.groups.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						<p className="font-medium">No reference groups yet</p>
						<p className="text-sm">Drag and drop media files to get started</p>
					</div>
				) : (
					references.groups.map((group) => (
						<ReferenceGroupComponent
							key={group.name}
							group={group}
							onDeleteFile={(fileId) =>
								handleDeleteFile(group.name, fileId)
							}
							onDeleteGroup={() => handleDeleteGroup(group.name)}
							onDrop={(files) => handleDropOnGroup(group.name, files)}
						/>
					))
				)}
			</div>

			<GroupNameDialog
				isOpen={showDialog}
				suggestedName={suggestedName}
				onConfirm={handleDialogConfirm}
				onCancel={() => {
					setShowDialog(false);
					setPendingFiles([]);
					setSuggestedName("");
				}}
			/>
		</div>
	);
}
