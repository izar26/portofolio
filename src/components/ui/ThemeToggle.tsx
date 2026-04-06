"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    // Prevent hydration mismatch
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-obsidian-800/50 border border-white/5" />
        );
    }

    const isDark = theme === "dark" || theme === "system";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-obsidian-800 dark:hover:bg-obsidian-700 border border-zinc-300 dark:border-white/5 transition-colors overflow-hidden"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{
                    y: isDark ? 0 : -30,
                    opacity: isDark ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute"
            >
                {/* Moon is visible in dark mode, so it should be light colored */}
                <Moon size={18} className="text-zinc-600 dark:text-zinc-300" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    y: isDark ? 30 : 0,
                    opacity: isDark ? 0 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute"
            >
                {/* Sun is visible in light mode, so it should be dark colored */}
                <Sun size={18} className="text-zinc-700 dark:text-zinc-300" />
            </motion.div>
        </button>
    );
}
