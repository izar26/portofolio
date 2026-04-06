"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulasi waktu loading untuk memunculkan efek
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    key="loading"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-50 dark:bg-obsidian-900"
                >
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="text-5xl md:text-7xl font-bold font-sans tracking-tighter text-foreground dark:text-white relative z-10"
                        >
                            NN<span className="text-emerald-500">.</span>
                        </motion.div>

                        {/* Glow effect */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.2, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-emerald-500/30 blur-3xl w-32 h-32 rounded-full -z-0"
                        />

                        {/* Loading Bar */}
                        <div className="w-48 h-1 bg-zinc-200 dark:bg-white/10 mt-8 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.8, ease: "easeInOut" }}
                                className="h-full bg-emerald-500 rounded-full"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
