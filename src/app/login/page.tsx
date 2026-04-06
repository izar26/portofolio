"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showTOTP, setShowTOTP] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    ...(showTOTP && { totpCode }),
                }),
            });

            const data = await res.json();

            if (data.requireTOTP && !showTOTP) {
                setShowTOTP(true);
                toast.info("Masukkan kode dari Google Authenticator.");
                setIsLoading(false);
                return;
            }

            if (!data.success) {
                toast.error(data.message);
                setIsLoading(false);
                return;
            }

            toast.success("Login berhasil! Mengalihkan...");
            setTimeout(() => {
                router.push("/dashboard");
            }, 800);
        } catch {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-background">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-teal-500/8 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-emerald-600/6 blur-[80px] rounded-full pointer-events-none" />
            </div>

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 z-0 opacity-[0.015] dark:opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-card rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/5 dark:shadow-black/30">
                    {/* Header */}
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
                            Selamat Datang
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body">
                            Masuk ke panel admin portofolio
                        </p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25, duration: 0.4 }}
                        >
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 font-sans"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                                <input
                                    id="email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Masukkan email"
                                    required
                                    disabled={isLoading}
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200 disabled:opacity-50"
                                />
                            </div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                        >
                            <label
                                htmlFor="password"
                                className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 font-sans"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
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
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </motion.div>

                        {/* TOTP Field — conditional */}
                        <AnimatePresence>
                            {showTOTP && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.35, ease: "easeInOut" }}
                                >
                                    <label
                                        htmlFor="totp"
                                        className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 font-sans"
                                    >
                                        Kode Autentikasi
                                    </label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <input
                                            id="totp"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={totpCode}
                                            onChange={(e) =>
                                                setTotpCode(e.target.value.replace(/\D/g, ""))
                                            }
                                            placeholder="000000"
                                            required
                                            autoFocus
                                            disabled={isLoading}
                                            className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-obsidian-900 border border-emerald-300 dark:border-emerald-500/30 rounded-xl text-sm font-mono tracking-[0.35em] text-center placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200 disabled:opacity-50"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 font-body">
                                        Buka Google Authenticator dan masukkan kode 6 digit
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
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
                                        <>
                                            <span className="text-white font-semibold">
                                                {showTOTP ? "Verifikasi & Masuk" : "Masuk"}
                                            </span>
                                            <ShieldCheck className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </motion.div>
                    </form>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="mt-8 pt-6 border-t border-zinc-200/60 dark:border-white/5"
                    >
                        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 dark:text-zinc-600 font-body">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Dilindungi oleh autentikasi dua faktor</span>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative bottom glow */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
            </motion.div>
        </div>
    );
}
