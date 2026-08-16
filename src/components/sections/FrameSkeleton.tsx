import type { JSX } from "preact";

export function FrameSkeleton(): JSX.Element {
	return (
		<div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden border border-border">
			<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
		</div>
	);
}
