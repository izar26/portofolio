"use client";

import { useState } from "react";
import { LogOut, Menu, Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navigationMap: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/about": "Tentang Saya",
    "/dashboard/skills": "Keahlian",
    "/dashboard/projects": "Proyek",
    "/dashboard/experience": "Pengalaman",
    "/dashboard/settings": "Pengaturan",
};

export function Header() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const currentPage = navigationMap[pathname] || "Dashboard";

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            toast.success("Logout berhasil.");
            setTimeout(() => {
                router.push("/login");
            }, 500);
        } catch {
            toast.error("Gagal logout.");
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full glass border-b border-zinc-200/50 dark:border-white/5 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 md:hidden transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col">
                        <h1 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-foreground dark:text-white">
                            {currentPage}
                        </h1>
                        <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 font-body">
                            Kelola konten portofolio Anda
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 sm:p-2.5 rounded-full bg-zinc-100 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <Link
                        href="/"
                        target="_blank"
                        className="hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                    >
                        Lihat Web
                    </Link>

                    <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1 sm:mx-2 hidden sm:block"></div>

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all duration-200 disabled:opacity-50"
                    >
                        {isLoggingOut ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <LogOut className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 z-50 w-64 glass border-r flex flex-col md:hidden"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-zinc-200/50 dark:border-white/5">
                                <Link href="/dashboard" className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <span className="text-white font-bold text-xl">N</span>
                                    </div>
                                    <span className="font-bold text-xl tracking-tight">Admin<span className="text-emerald-500">.</span></span>
                                </Link>
                            </div>
                            <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
                                {Object.entries(navigationMap).map(([href, name]) => {
                                    const isActive = pathname === href;
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                                                    : "text-zinc-600 dark:text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                                                }`}
                                        >
                                            {name}
                                        </Link>
                                    );
                                })}
                                <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-white/10">
                                    <Link
                                        href="/"
                                        target="_blank"
                                        className="flex justify-center px-4 py-3 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
                                    >
                                        Lihat Website Portfolio
                                    </Link>
                                </div>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
