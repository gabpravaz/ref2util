import Dexie, { type Table } from "dexie";

export interface Workspace {
	id?: number;
	name: string;
	createdAt: number; // timestamp in milliseconds
	isActive: boolean;
}

export interface WorkspaceData {
	id?: number;
	workspaceId: number;
	key: string;
	value: string;
}

export class WorkspaceDatabase extends Dexie {
	workspaces!: Table<Workspace>;
	workspaceData!: Table<WorkspaceData>;

	constructor() {
		super("Ref2UtilDB");
		this.version(1).stores({
			workspaces: "++id, &name",
			workspaceData: "++id, workspaceId, [workspaceId+key]",
		});
	}
}

export const db = new WorkspaceDatabase();

export async function getActiveWorkspace(): Promise<Workspace | undefined> {
	const workspaces = await db.workspaces.toArray();
	return workspaces.find((w) => w.isActive);
}

export async function createWorkspace(name: string): Promise<number> {
	const existing = await db.workspaces.where("name").equals(name).first();
	if (existing) {
		throw new Error(`Workspace "${name}" already exists`);
	}

	const allWorkspaces = await db.workspaces.toArray();
	const id = await db.workspaces.add({
		name,
		createdAt: Date.now(),
		isActive: allWorkspaces.length === 0, // First workspace is active by default
	});

	return id;
}

export async function setActiveWorkspace(workspaceId: number): Promise<void> {
	// Deactivate all workspaces and activate the selected one using bulk modification
	await db.workspaces.toCollection().modify((workspace) => {
		workspace.isActive = workspace.id === workspaceId;
	});
}

export async function renameWorkspace(
	workspaceId: number,
	newName: string,
): Promise<void> {
	const existing = await db.workspaces.where("name").equals(newName).first();
	if (existing && existing.id !== workspaceId) {
		throw new Error(`Workspace "${newName}" already exists`);
	}

	await db.workspaces.update(workspaceId, { name: newName });
}

export async function deleteWorkspace(workspaceId: number): Promise<void> {
	const workspace = await db.workspaces.get(workspaceId);
	if (!workspace) {
		throw new Error("Workspace not found");
	}

	// Delete all data associated with this workspace
	await db.workspaceData.where("workspaceId").equals(workspaceId).delete();

	// Delete the workspace
	await db.workspaces.delete(workspaceId);

	// If this was the active workspace, activate another one
	if (workspace.isActive) {
		const remaining = await db.workspaces.toArray();
		if (remaining.length > 0 && remaining[0].id) {
			await setActiveWorkspace(remaining[0].id);
		}
	}
}

export async function getAllWorkspaces(): Promise<Workspace[]> {
	return db.workspaces.toArray();
}

export async function setWorkspaceData(
	workspaceId: number,
	key: string,
	value: string,
): Promise<void> {
	const existing = await db.workspaceData
		.where("[workspaceId+key]")
		.equals([workspaceId, key])
		.first();

	if (existing) {
		await db.workspaceData.update(existing.id!, { value });
	} else {
		await db.workspaceData.add({
			workspaceId,
			key,
			value,
		});
	}
}

export async function getWorkspaceData(
	workspaceId: number,
	key: string,
): Promise<string | undefined> {
	const data = await db.workspaceData
		.where("[workspaceId+key]")
		.equals([workspaceId, key])
		.first();

	return data?.value;
}

export async function deleteWorkspaceData(
	workspaceId: number,
	key: string,
): Promise<void> {
	await db.workspaceData
		.where("[workspaceId+key]")
		.equals([workspaceId, key])
		.delete();
}

export async function getWorkspaceDataByWorkspaceId(
	workspaceId: number,
): Promise<WorkspaceData[]> {
	return db.workspaceData.where("workspaceId").equals(workspaceId).toArray();
}
