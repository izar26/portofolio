"use client";

import { useState, FormEvent, Suspense } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!token || !email) {
        return (
            <div className="text-center p-6 text-zinc-500">
                Token atau email tidak valid. Silakan minta tautan reset baru.
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Password tidak cocok.");
            return;
        }

        if (password.length < 8) {
            toast.error("Password minimal 8 karakter.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Terjadi kesalahan.");
                setIsLoading(false);
                return;
            }

            toast.success(data.message);
            setTimeout(() => {
                router.push("/login");
            }, 1500);
        } catch {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
            >
                <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 font-sans"
                >
                    Password Baru
                </label>
                <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password baru"
                        required
                        disabled={isLoading}
                        className="w-full pl-11 pr-12 py-3 bg-zinc-50 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200 disabled:opacity-50"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
            >
                <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 font-sans"
                >
                    Konfirmasi Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        required
                        disabled={isLoading}
                        className="w-full pl-11 pr-12 py-3 bg-zinc-50 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200 disabled:opacity-50"
                    />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="pt-2"
            >
                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full inline-flex items-center justify-center overflow-hidden rounded-xl p-px font-medium text-sm shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 w-full px-6 py-3.5 rounded-xl transition-all duration-300">
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                            <span className="text-white font-semibold">Ubah Password</span>
                        )}
                    </span>
                </button>
            </motion.div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
            <div className="absolute inset-0 z-0 bg-background">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            </div>

            <div
                className="absolute inset-0 z-0 opacity-[0.015] dark:opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-card rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/5 dark:shadow-black/30">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-5 shadow-lg shadow-emerald-500/25">
                            <Lock className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold font-sans tracking-tight mb-2">
                            Buat Password Baru
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body">
                            Masukkan password baru Anda di bawah ini.
                        </p>
                    </motion.div>

                    <Suspense fallback={<div className="text-center p-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
}
