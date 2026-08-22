import type { JSX } from "preact";
import { useWorkflows } from "@/hooks/useWorkflows";
import { useWorkspaceContext } from "../context/WorkspaceContext";
import { WorkflowsList } from "../ui/WorkflowsList";
import "./section.css";

export function Workflows(): JSX.Element {
	const { activeWorkspace } = useWorkspaceContext();
	const { workflows, loading, error, saveWorkflow, deleteWorkflow } =
		useWorkflows(activeWorkspace?.id);

	return (
		<div className="section">
			<h2 className="section-title">Workflows</h2>
			{activeWorkspace ? (
				<WorkflowsList
					workflows={workflows}
					onImport={saveWorkflow}
					onDelete={deleteWorkflow}
					loading={loading}
					error={error}
				/>
			) : (
				<div className="section-placeholder">
					<p>No workspace selected</p>
					<p className="placeholder-subtitle">
						Create or select a workspace to manage workflows
					</p>
				</div>
			)}
		</div>
	);
}
