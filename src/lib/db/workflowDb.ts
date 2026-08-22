import {
	deleteWorkspaceData,
	getWorkspaceData,
	setWorkspaceData,
} from "./workspaceDb";

export interface Workflow {
	name: string;
	content: string; // JSON string of the workflow
	createdAt: number; // timestamp in milliseconds
}

const WORKFLOWS_KEY = "workflows";

/**
 * Get all workflows for a specific workspace
 */
export async function getWorkflows(workspaceId: number): Promise<Workflow[]> {
	try {
		const data = await getWorkspaceData(workspaceId, WORKFLOWS_KEY);
		if (!data) return [];
		const workflows = JSON.parse(data);
		return Array.isArray(workflows)
			? workflows.sort((a, b) => a.name.localeCompare(b.name))
			: [];
	} catch (error) {
		console.error("Error parsing workflows:", error);
		return [];
	}
}

/**
 * Save a new workflow to the workspace
 */
export async function saveWorkflow(
	workspaceId: number,
	name: string,
	content: string,
): Promise<void> {
	try {
		// Validate that content is valid JSON
		JSON.parse(content);

		const workflows = await getWorkflows(workspaceId);

		// Check if workflow already exists
		const existingIndex = workflows.findIndex((w) => w.name === name);
		if (existingIndex !== -1) {
			workflows[existingIndex] = {
				name,
				content,
				createdAt: workflows[existingIndex].createdAt,
			};
		} else {
			workflows.push({
				name,
				content,
				createdAt: Date.now(),
			});
		}

		// Sort by name before saving
		workflows.sort((a, b) => a.name.localeCompare(b.name));

		await setWorkspaceData(
			workspaceId,
			WORKFLOWS_KEY,
			JSON.stringify(workflows),
		);
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error("Invalid JSON content for workflow");
		}
		throw error;
	}
}

/**
 * Delete a workflow from the workspace
 */
export async function deleteWorkflow(
	workspaceId: number,
	name: string,
): Promise<void> {
	const workflows = await getWorkflows(workspaceId);
	const filtered = workflows.filter((w) => w.name !== name);

	if (filtered.length === workflows.length) {
		throw new Error(`Workflow "${name}" not found`);
	}

	await setWorkspaceData(workspaceId, WORKFLOWS_KEY, JSON.stringify(filtered));
}

/**
 * Get a specific workflow by name
 */
export async function getWorkflow(
	workspaceId: number,
	name: string,
): Promise<Workflow | undefined> {
	const workflows = await getWorkflows(workspaceId);
	return workflows.find((w) => w.name === name);
}

/**
 * Clear all workflows from a workspace
 */
export async function clearWorkflows(workspaceId: number): Promise<void> {
	await deleteWorkspaceData(workspaceId, WORKFLOWS_KEY);
}
