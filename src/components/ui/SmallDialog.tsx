import type { JSX } from "preact";

interface SmallDialogProps {
	isOpen: boolean;
	title: string;
	children: JSX.Element;
	onClose?: () => void;
}

export function SmallDialog({
	isOpen,
	title,
	children,
}: SmallDialogProps): JSX.Element | null {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-background border border-border rounded-lg shadow-lg max-w-sm w-full mx-4">
				<div className="p-6 border-b border-border">
					<h2 className="text-lg font-semibold text-foreground">{title}</h2>
				</div>
				{children}
			</div>
		</div>
	);
}
