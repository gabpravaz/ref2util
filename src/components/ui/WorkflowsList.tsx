import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import type { Workflow } from "@/lib/db/workflowDb";
import { WorkflowItem } from "./WorkflowItem";
import "./workflows-list.css";

interface WorkflowsListProps {
	workflows: Workflow[];
	onImport: (name: string, content: string) => Promise<void>;
	onDelete: (name: string) => Promise<void>;
	loading?: boolean;
	error?: string | null;
}

export function WorkflowsList({
	workflows,
	onImport,
	onDelete,
	loading = false,
	error = null,
}: WorkflowsListProps): JSX.Element {
	const dropZoneRef = useRef<HTMLDivElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);
	const [draggedItem, setDraggedItem] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
			setIsDragOver(false);
		}
	};

	const handleDrop = async (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
		setActionError(null);

		const files = e.dataTransfer?.files;
		if (!files) return;

		for (const file of Array.from(files)) {
			// Only accept JSON files
			if (!file.name.endsWith(".json")) {
				setActionError(
					`Skipped non-JSON file: ${file.name}. Only .json files are supported.`,
				);
				continue;
			}

			try {
				const content = await file.text();
				// Validate that it's valid JSON
				JSON.parse(content);

				// Use the filename without extension as the workflow name
				const workflowName = file.name.replace(/\.json$/, "");
				await onImport(workflowName, content);
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: `Failed to import ${file.name}`;
				setActionError(`Error importing ${file.name}: ${message}`);
			}
		}
	};

	const handleDeleteWorkflow = async (name: string) => {
		try {
			setActionError(null);
			await onDelete(name);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete workflow";
			setActionError(message);
		}
	};

	const handleDragStart = (workflowName: string) => (e: DragEvent) => {
		setDraggedItem(workflowName);

		const workflow = workflows.find((w) => w.name === workflowName);
		if (workflow && e.dataTransfer) {
			e.dataTransfer.effectAllowed = "copy";

			// Create a File object from the JSON content for proper file export
			const blob = new Blob([workflow.content], {
				type: "application/json",
			});
			const filename = `${workflowName}.json`;

			// Always provide text-based MIME types for compatibility with applications
			// that consume JSON/text data directly
			e.dataTransfer.setData("application/json", workflow.content);
			e.dataTransfer.setData("text/plain", workflow.content);

			// Try to use the modern DataTransferItem API for file drag-and-drop
			// This allows dragging the file to file systems, email clients, etc.
			// in browsers that support it. Applications that don't support File objects
			// will fall back to the text MIME types set above.
			try {
				const file = new File([blob], filename, { type: "application/json" });
				e.dataTransfer.items.add(file);
			} catch (_error) {
				// Ignored: browsers without DataTransferItem support will use text data instead
			}
		}
	};

	const handleDragEnd = () => {
		setDraggedItem(null);
	};

	return (
		<div className="workflows-list-container">
			{error && (
				<div className="workflows-error-banner">
					<p>Error loading workflows: {error}</p>
				</div>
			)}

			{actionError && (
				<div className="workflows-import-error">
					<p>{actionError}</p>
				</div>
			)}

			<section
				ref={dropZoneRef}
				className={`workflows-drop-zone ${isDragOver ? "drag-over" : ""}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				aria-label="Workflows drop zone"
			>
				{loading ? (
					<div className="workflows-loading">
						<p>Loading workflows...</p>
					</div>
				) : workflows.length === 0 ? (
					<div className="workflows-empty">
						<p className="workflows-empty-title">No workflows yet</p>
						<p className="workflows-empty-subtitle">
							Drag and drop JSON workflow files here to get started
						</p>
					</div>
				) : (
					<div className="workflows-grid">
						{workflows.map((workflow) => (
							<WorkflowItem
								key={workflow.name}
								workflow={workflow}
								isDragging={draggedItem === workflow.name}
								onDelete={handleDeleteWorkflow}
								draggable={true}
								onDragStart={handleDragStart(workflow.name)}
								onDragEnd={handleDragEnd}
							/>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
