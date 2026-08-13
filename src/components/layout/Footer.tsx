import type { JSX } from "preact";

export function Footer(): JSX.Element {
	return (
		<footer className="border-t border-border px-6 py-4 mt-auto text-center">
			<p className="m-0 text-xs text-muted-foreground">
				© 2026 gabpravaz. All rights reserved.
			</p>
		</footer>
	);
}
