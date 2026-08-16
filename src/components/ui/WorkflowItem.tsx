import { FileJson } from "lucide-react";
import type { JSX } from "preact";
import type { Workflow } from "@/lib/db/workflowDb";
import "./workflow-item.css";

interface WorkflowItemProps {
	workflow: Workflow;
	isDragging?: boolean;
	onDelete?: (name: string) => void;
	draggable?: boolean;
	onDragStart?: (e: DragEvent) => void;
	onDragEnd?: (e: DragEvent) => void;
}

export function WorkflowItem({
	workflow,
	isDragging = false,
	onDelete,
	draggable = true,
	onDragStart,
	onDragEnd,
}: WorkflowItemProps): JSX.Element {
	const formattedDate = new Date(workflow.createdAt).toLocaleDateString(
		"en-US",
		{
			month: "short",
			day: "numeric",
			year: "numeric",
		},
	);

	return (
		<article
			className={`workflow-item ${isDragging ? "dragging" : ""}`}
			draggable={draggable}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
		>
			<div className="workflow-item-icon">
				<FileJson className="w-6 h-6" />
			</div>
			<div className="workflow-item-content">
				<div className="workflow-item-name">{workflow.name}</div>
				<div className="workflow-item-meta">{formattedDate}</div>
			</div>
			{onDelete && (
				<button
					type="button"
					className="workflow-item-delete"
					onClick={() => onDelete(workflow.name)}
					title="Delete workflow"
				>
					×
				</button>
			)}
		</article>
	);
}
