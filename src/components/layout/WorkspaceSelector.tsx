import { ChevronDown, MoreVertical } from "lucide-react";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { useWorkspaceContext } from "../context/WorkspaceContext";
import { AddWorkspaceModal } from "../modals/AddWorkspaceModal";
import { DeleteWorkspaceModal } from "../modals/DeleteWorkspaceModal";
import { RenameWorkspaceModal } from "../modals/RenameWorkspaceModal";

export function WorkspaceSelector(): JSX.Element {
	const { workspaces, activeWorkspace, setWorkspaceActive, loading } =
		useWorkspaceContext();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showRenameModal, setShowRenameModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(
		null,
	);
	const [selectedWorkspaceName, setSelectedWorkspaceName] = useState("");
	const [openMenuId, setOpenMenuId] = useState<number | null>(null);

	const handleWorkspaceSelect = async (workspaceId: number) => {
		await setWorkspaceActive(workspaceId);
		setIsDropdownOpen(false);
	};

	const handleRenameClick = (workspaceId: number, name: string) => {
		setSelectedWorkspaceId(workspaceId);
		setSelectedWorkspaceName(name);
		setShowRenameModal(true);
		setOpenMenuId(null);
	};

	const handleDeleteClick = (workspaceId: number, name: string) => {
		setSelectedWorkspaceId(workspaceId);
		setSelectedWorkspaceName(name);
		setShowDeleteModal(true);
		setOpenMenuId(null);
	};

	if (loading) {
		return (
			<div className="px-4 py-2 rounded-lg border border-border text-muted-foreground">
				Loading...
			</div>
		);
	}

	return (
		<>
			<div className="relative">
				<button
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-input hover:bg-muted transition-colors text-foreground"
				>
					<span className="max-w-[150px] truncate">
						{activeWorkspace?.name || "No Workspace"}
					</span>
					<ChevronDown
						size={16}
						className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
					/>
				</button>

				{isDropdownOpen && (
					<div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-40">
						<div className="max-h-64 overflow-y-auto">
							{workspaces.length === 0 ? (
								<div className="p-4 text-center text-muted-foreground">
									No workspaces yet
								</div>
							) : (
								workspaces.map((workspace) => (
									<div
										key={workspace.id}
										className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 border-b border-border last:border-b-0"
									>
										<button
											onClick={() =>
												workspace.id &&
												handleWorkspaceSelect(workspace.id)
											}
											className="flex-1 text-left text-foreground hover:font-medium transition-all truncate"
										>
											{workspace.name}
											{workspace.isActive && (
												<span className="ml-2 text-xs text-primary">
													(active)
												</span>
											)}
										</button>

										<div className="relative">
											<button
												onClick={(e) => {
													e.stopPropagation();
													setOpenMenuId(
														openMenuId === workspace.id
															? null
															: workspace.id || null,
													);
												}}
												className="p-1 hover:bg-muted rounded transition-colors"
											>
												<MoreVertical size={16} className="text-muted-foreground" />
											</button>

											{openMenuId === workspace.id && workspace.id && (
												<div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
													<button
														onClick={() =>
															handleRenameClick(
																workspace.id!,
																workspace.name,
															)
														}
														className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted/50 border-b border-border"
													>
														Rename
													</button>
													<button
														onClick={() =>
															handleDeleteClick(
																workspace.id!,
																workspace.name,
															)
														}
														className="block w-full text-left px-4 py-2 text-destructive hover:bg-muted/50"
													>
														Delete
													</button>
												</div>
											)}
										</div>
									</div>
								))
							)}
						</div>

						<button
							onClick={() => {
								setShowAddModal(true);
								setIsDropdownOpen(false);
							}}
							className="w-full px-4 py-3 text-left text-primary hover:bg-muted/50 border-t border-border font-medium"
						>
							+ Add Workspace
						</button>
					</div>
				)}
			</div>

			<AddWorkspaceModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
			/>
			<RenameWorkspaceModal
				isOpen={showRenameModal}
				workspaceId={selectedWorkspaceId}
				currentName={selectedWorkspaceName}
				onClose={() => {
					setShowRenameModal(false);
					setSelectedWorkspaceId(null);
					setSelectedWorkspaceName("");
				}}
			/>
			<DeleteWorkspaceModal
				isOpen={showDeleteModal}
				workspaceId={selectedWorkspaceId}
				workspaceName={selectedWorkspaceName}
				onClose={() => {
					setShowDeleteModal(false);
					setSelectedWorkspaceId(null);
					setSelectedWorkspaceName("");
				}}
			/>
		</>
	);
}
