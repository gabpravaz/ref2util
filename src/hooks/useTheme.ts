import { useEffect, useState } from "preact/hooks";

type Theme = "light" | "dark";

export function useTheme() {
	const [theme, setThemeState] = useState<Theme>("light");
	const [mounted, setMounted] = useState(false);

	// Initialize theme on mount
	useEffect(() => {
		// Check localStorage first
		const storedTheme = localStorage.getItem("theme") as Theme | null;

		if (storedTheme) {
			setThemeState(storedTheme);
			applyTheme(storedTheme);
		} else {
			// Check system preference
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches;
			const systemTheme: Theme = prefersDark ? "dark" : "light";
			setThemeState(systemTheme);
			applyTheme(systemTheme);
		}

		setMounted(true);
	}, []);

	// Listen for system preference changes
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = (e: MediaQueryListEvent) => {
			// Only apply system preference if user hasn't set a theme
			if (!localStorage.getItem("theme")) {
				const newTheme: Theme = e.matches ? "dark" : "light";
				setThemeState(newTheme);
				applyTheme(newTheme);
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	const toggleTheme = () => {
		const newTheme: Theme = theme === "light" ? "dark" : "light";
		setThemeState(newTheme);
		applyTheme(newTheme);
		localStorage.setItem("theme", newTheme);
	};

	return { theme, toggleTheme, mounted };
}

function applyTheme(theme: Theme) {
	const html = document.documentElement;
	if (theme === "dark") {
		html.classList.add("dark");
	} else {
		html.classList.remove("dark");
	}
}
