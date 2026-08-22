import {
	deleteWorkspaceData,
	getWorkspaceData,
	setWorkspaceData,
} from "./workspaceDb";

export type MediaType = "image" | "video" | "audio";

export interface MediaFile {
	id: string; // unique identifier
	name: string; // original filename
	type: MediaType;
	filePath: string; // local file path (file:///) or data URL for images
	thumbnail?: string; // base64 encoded thumbnail (small, for display)
	addedAt: number; // timestamp in milliseconds
}

export interface ReferenceGroup {
	name: string; // group name
	files: MediaFile[];
	createdAt: number; // timestamp in milliseconds
}

export interface References {
	groups: ReferenceGroup[];
}

const REFERENCES_KEY = "references";

/**
 * Get all reference groups for a workspace
 */
export async function getReferences(workspaceId: number): Promise<References> {
	try {
		const data = await getWorkspaceData(workspaceId, REFERENCES_KEY);
		if (!data) {
			return { groups: [] };
		}
		const references = JSON.parse(data);
		if (!references.groups) return { groups: [] };

		// Sort groups alphabetically
		references.groups.sort((a: ReferenceGroup, b: ReferenceGroup) =>
			a.name.localeCompare(b.name),
		);

		return references;
	} catch (error) {
		console.error("Error parsing references:", error);
		return { groups: [] };
	}
}

/**
 * Extract prefix from filename (e.g., "scene-01.jpg" → "scene")
 */
export function extractPrefix(filename: string): string | null {
	const match = filename.match(/^([a-zA-Z0-9_-]+)-[^-]/);
	return match ? match[1] : null;
}

/**
 * Determine media type from file extension
 */
export function getMediaType(filename: string): MediaType | null {
	const ext = filename.split(".").pop()?.toLowerCase();
	if (!ext) return null;

	const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
	const videoExts = ["mp4", "webm", "mov", "avi", "mkv", "flv"];
	const audioExts = ["mp3", "wav", "ogg", "aac", "flac", "m4a"];

	if (imageExts.includes(ext)) return "image";
	if (videoExts.includes(ext)) return "video";
	if (audioExts.includes(ext)) return "audio";

	return null;
}

/**
 * Add a media file to a reference group
 * If groupName doesn't exist, create it
 */
export async function addMediaFile(
	workspaceId: number,
	groupName: string,
	file: {
		name: string;
		type: MediaType;
		filePath: string; // local file path (file:///) or data URL
		thumbnail?: string;
	},
): Promise<void> {
	const references = await getReferences(workspaceId);

	// Find or create group
	let group = references.groups.find((g) => g.name === groupName);
	if (!group) {
		group = {
			name: groupName,
			files: [],
			createdAt: Date.now(),
		};
		references.groups.push(group);
	}

	// Create unique ID
	const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	// Store metadata only (no actual file data)
	const newFile: MediaFile = {
		id: fileId,
		name: file.name,
		type: file.type,
		filePath: file.filePath,
		thumbnail: file.thumbnail,
		addedAt: Date.now(),
	};

	group.files.push(newFile);

	// Sort groups alphabetically and files by date (newest first)
	references.groups.sort((a, b) => a.name.localeCompare(b.name));
	references.groups.forEach((g) => {
		g.files.sort((a, b) => b.addedAt - a.addedAt);
	});

	await setWorkspaceData(
		workspaceId,
		REFERENCES_KEY,
		JSON.stringify(references),
	);
}

/**
 * Delete a media file from a group
 */
export async function deleteMediaFile(
	workspaceId: number,
	groupName: string,
	fileId: string,
): Promise<void> {
	const references = await getReferences(workspaceId);

	const groupIndex = references.groups.findIndex((g) => g.name === groupName);
	if (groupIndex === -1) {
		throw new Error(`Group "${groupName}" not found`);
	}

	const group = references.groups[groupIndex];
	const fileIndex = group.files.findIndex((f) => f.id === fileId);
	if (fileIndex === -1) {
		throw new Error(`File "${fileId}" not found in group "${groupName}"`);
	}

	// Delete from references metadata (no file deletion needed - just metadata)
	group.files.splice(fileIndex, 1);

	// Delete group if empty
	if (group.files.length === 0) {
		references.groups.splice(groupIndex, 1);
	}

	await setWorkspaceData(
		workspaceId,
		REFERENCES_KEY,
		JSON.stringify(references),
	);
}

/**
 * Rename a reference group
 */
export async function renameGroup(
	workspaceId: number,
	oldName: string,
	newName: string,
): Promise<void> {
	const references = await getReferences(workspaceId);

	const group = references.groups.find((g) => g.name === oldName);
	if (!group) {
		throw new Error(`Group "${oldName}" not found`);
	}

	// Check if new name already exists
	if (references.groups.some((g) => g.name === newName)) {
		throw new Error(`Group "${newName}" already exists`);
	}

	group.name = newName;

	// Sort groups alphabetically
	references.groups.sort((a, b) => a.name.localeCompare(b.name));

	await setWorkspaceData(
		workspaceId,
		REFERENCES_KEY,
		JSON.stringify(references),
	);
}

/**
 * Get the blob for a media file (for dragging, playback, etc.)
 */
export async function getMediaFilePath(fileId: string, groupName: string, workspaceId: number): Promise<string | undefined> {
	const references = await getReferences(workspaceId);
	const group = references.groups.find((g) => g.name === groupName);
	const file = group?.files.find((f) => f.id === fileId);
	return file?.filePath;
}

/**
 * Delete an entire reference group
 */
export async function deleteGroup(
	workspaceId: number,
	groupName: string,
): Promise<void> {
	const references = await getReferences(workspaceId);

	const filtered = references.groups.filter((g) => g.name !== groupName);

	if (filtered.length === references.groups.length) {
		throw new Error(`Group "${groupName}" not found`);
	}

	await setWorkspaceData(
		workspaceId,
		REFERENCES_KEY,
		JSON.stringify({ groups: filtered }),
	);
}

/**
 * Clear all references from a workspace
 */
export async function clearReferences(workspaceId: number): Promise<void> {
	await deleteWorkspaceData(workspaceId, REFERENCES_KEY);
}
