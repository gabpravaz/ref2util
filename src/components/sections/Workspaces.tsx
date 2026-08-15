import type { JSX } from "preact";
import { useWorkspaceContext } from "../context/WorkspaceContext";
import "./section.css";

export function Workspaces(): JSX.Element {
	const { activeWorkspace, loading } = useWorkspaceContext();

	if (loading) {
		return (
			<div className="section">
				<h2 className="section-title">Workspaces</h2>
				<div className="section-placeholder">
					<p>Loading workspace...</p>
				</div>
			</div>
		);
	}

	if (!activeWorkspace) {
		return (
			<div className="section">
				<h2 className="section-title">Workspaces</h2>
				<div className="section-placeholder">
					<p>No active workspace</p>
				</div>
			</div>
		);
	}

	return (
		<div className="section">
			<h2 className="section-title">Workspaces</h2>
			<div className="space-y-4">
				<div className="p-4 border border-border rounded-lg bg-muted/30">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold text-foreground">
								{activeWorkspace.name}
							</h3>
							<p className="text-sm text-muted-foreground">
								debug: {activeWorkspace.name} was created on{" "}
								{new Date(activeWorkspace.createdAt).toLocaleString()}
							</p>
						</div>
						<span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
							Active
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
