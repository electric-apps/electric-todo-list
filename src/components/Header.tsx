import { Flex, IconButton, Text } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { ThemePicker } from "./ThemePicker";

export function Header() {
	const { darkMode, toggleDarkMode } = useTheme();
	return (
		<header style={{ borderBottom: "1px solid var(--gray-6)" }}>
			<Flex align="center" justify="between" py="3" px="4">
				<Link to="/" style={{ textDecoration: "none" }}>
					<Text size="5" weight="bold">
						Todo App
					</Text>
				</Link>
				<Flex gap="2" align="center">
					<ThemePicker />
					<IconButton
						size="2"
						variant="ghost"
						color="gray"
						onClick={toggleDarkMode}
						aria-label="Toggle dark mode"
					>
						{darkMode ? <Sun size={16} /> : <Moon size={16} />}
					</IconButton>
				</Flex>
			</Flex>
		</header>
	);
}
