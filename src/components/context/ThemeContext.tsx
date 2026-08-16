import type { JSX } from "preact";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { useTheme } from "@/hooks/useTheme";

interface ThemeContextType {
	theme: "light" | "dark";
	toggleTheme: () => void;
	mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: JSX.Element;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
	const { theme, toggleTheme, mounted } = useTheme();

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useThemeContext(): ThemeContextType {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useThemeContext must be used within ThemeProvider");
	}
	return context;
}
