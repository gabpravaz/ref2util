import { Search } from "lucide-react";
import type { JSX } from "preact";

export function Header(): JSX.Element {
	return (
		<header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-border">
			<div className="flex-shrink-0 min-w-[150px]">
				<h1 className="text-2xl font-bold m-0 text-foreground font-heading tracking-wide">
					ref2util
				</h1>
			</div>

			<div className="flex-1 flex justify-center max-w-[400px] mx-auto">
				<div className="flex items-center gap-2 px-4 py-2 bg-input border border-border rounded hover:border-muted-foreground transition-colors duration-200 w-full focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2">
					<Search className="text-muted-foreground flex-shrink-0" size={20} />
					<input
						type="text"
						placeholder="Search..."
						className="flex-1 border-0 bg-transparent outline-none text-foreground text-sm placeholder:text-muted-foreground"
					/>
				</div>
			</div>

			<div className="flex-shrink-0 min-w-[150px]" />
		</header>
	);
}
