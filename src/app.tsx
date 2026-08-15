import type { JSX } from "preact";
import { Layout } from "./components/layout/Layout";
import { ThemeProvider } from "./components/context/ThemeContext";
import "./app.css";

export function App(): JSX.Element {
	return (
		<ThemeProvider>
			<Layout />
		</ThemeProvider>
	);
}
