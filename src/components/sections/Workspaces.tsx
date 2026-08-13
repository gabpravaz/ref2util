import type { JSX } from "preact";
import { useWorkspaceContext } from "../context/WorkspaceContext";
import "./section.css";

export function Workspaces(): JSX.Element {
	const { workspaces, loading } = useWorkspaceContext();

	if (loading) {
		return (
			<div className="section">
				<h2 className="section-title">Workspaces</h2>
				<div className="section-placeholder">
					<p>Loading workspaces...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="section">
			<h2 className="section-title">Workspaces</h2>
			{workspaces.length === 0 ? (
				<div className="section-placeholder">
					<p>No workspaces yet</p>
					<p className="placeholder-subtitle">
						Create a workspace to get started
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{workspaces.map((workspace) => (
						<div
							key={workspace.id}
							className="p-4 border border-border rounded-lg bg-muted/30"
						>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold text-foreground">
										{workspace.name}
									</h3>
									<p className="text-sm text-muted-foreground">
										debug: {workspace.name} was created on{" "}
										{workspace.createdAt instanceof Date
											? workspace.createdAt.toLocaleString()
											: new Date(workspace.createdAt).toLocaleString()}
									</p>
								</div>
								{workspace.isActive && (
									<span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
										Active
									</span>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
