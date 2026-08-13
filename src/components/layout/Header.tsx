import type { JSX } from "preact";
import { Search } from "lucide-react";
import "./header.css";

export function Header(): JSX.Element {
	return (
		<header className="header">
			<div className="header-left">
				<h1 className="app-name">ref2util</h1>
			</div>

			<div className="header-center">
				<div className="search-bar">
					<Search className="search-icon" size={20} />
					<input
						type="text"
						placeholder="Search..."
						className="search-input"
					/>
				</div>
			</div>

			<div className="header-right" />
		</header>
	);
}
