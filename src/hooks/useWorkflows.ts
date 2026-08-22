import { useEffect, useState } from "preact/hooks";
import type { Workflow } from "@/lib/db/workflowDb";
import {
	deleteWorkflow as dbDeleteWorkflow,
	getWorkflows as dbGetWorkflows,
	saveWorkflow as dbSaveWorkflow,
} from "@/lib/db/workflowDb";

export function useWorkflows(workspaceId: number | undefined) {
	const [workflows, setWorkflows] = useState<Workflow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Load workflows when workspace changes
	useEffect(() => {
		const loadWorkflows = async () => {
			if (!workspaceId) {
				setWorkflows([]);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);
				const data = await dbGetWorkflows(workspaceId);
				setWorkflows(data);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to load workflows";
				setError(message);
				console.error("Error loading workflows:", err);
			} finally {
				setLoading(false);
			}
		};

		loadWorkflows();
	}, [workspaceId]);

	const saveWorkflow = async (name: string, content: string): Promise<void> => {
		if (!workspaceId) {
			throw new Error("No active workspace");
		}

		try {
			setError(null);
			await dbSaveWorkflow(workspaceId, name, content);
			const updated = await dbGetWorkflows(workspaceId);
			setWorkflows(updated);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to save workflow";
			setError(message);
			throw err;
		}
	};

	const deleteWorkflow = async (name: string): Promise<void> => {
		if (!workspaceId) {
			throw new Error("No active workspace");
		}

		try {
			setError(null);
			await dbDeleteWorkflow(workspaceId, name);
			const updated = await dbGetWorkflows(workspaceId);
			setWorkflows(updated);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to delete workflow";
			setError(message);
			throw err;
		}
	};

	return {
		workflows,
		loading,
		error,
		saveWorkflow,
		deleteWorkflow,
	};
}
