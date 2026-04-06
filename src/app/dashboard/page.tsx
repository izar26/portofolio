"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (data.authenticated) {
                    setUserEmail(data.user.email);
                }
            });
    }, []);

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
        <div className="relative min-h-screen overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 bg-background">
                <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />
            </div>

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 border-b border-zinc-200/60 dark:border-white/5"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold font-sans tracking-tight">
                                Dashboard
                            </h1>
                            {userEmail && (
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-body">
                                    {userEmail}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all duration-200 disabled:opacity-50"
                    >
                        {isLoggingOut ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <LogOut className="w-4 h-4" />
                        )}
                        <span>Logout</span>
                    </button>
                </div>
            </motion.header>

            {/* Content */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative z-10 max-w-7xl mx-auto px-6 py-12"
            >
                <div className="glass-card rounded-2xl p-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-6">
                        <LayoutDashboard className="w-9 h-9 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold font-sans tracking-tight mb-3">
                        Selamat Datang di Dashboard
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-body max-w-md mx-auto">
                        Panel admin ini akan segera diisi dengan fitur pengelolaan konten
                        portofolio. Nantikan pembaruan selanjutnya.
                    </p>
                </div>
            </motion.main>
        </div>
    );
}
