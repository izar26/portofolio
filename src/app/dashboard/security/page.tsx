"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function SecurityPage() {
    const [is2FAEnabled, setIs2FAEnabled] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // For enabling
    const [isRequestingEnable, setIsRequestingEnable] = useState(false);
    const [enablePassword, setEnablePassword] = useState("");
    
    // For disabling
    const [isDisabling, setIsDisabling] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch("/api/auth/2fa/status");
            const data = await res.json();
            if (data.success) {
                setIs2FAEnabled(data.is2FAEnabled);
            }
        } catch {
            toast.error("Gagal mengambil status keamanan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnableRequest = async () => {
        if (!enablePassword) {
            toast.error("Password wajib diisi");
            return;
        }
        setIsRequestingEnable(true);
        try {
            const res = await fetch("/api/auth/2fa/request-enable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: enablePassword }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setEnablePassword("");
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Gagal memproses permintaan setup 2FA");
        } finally {
            setIsRequestingEnable(false);
        }
    };

    const handleDisableRequest = async () => {
        if (!disablePassword) {
            toast.error("Password wajib diisi");
            return;
        }
        setIsDisabling(true);
        try {
            const res = await fetch("/api/auth/2fa/request-disable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: disablePassword }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setDisablePassword("");
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Gagal memproses permintaan");
        } finally {
            setIsDisabling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-8"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${is2FAEnabled ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        {is2FAEnabled ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> : <ShieldAlert className="w-6 h-6 text-red-500" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-sans">Google Authenticator (2FA)</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Status: <span className={is2FAEnabled ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>{is2FAEnabled ? "Aktif" : "Tidak Aktif"}</span>
                        </p>
                    </div>
                </div>

                {!is2FAEnabled && (
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl">
                            <h3 className="text-emerald-600 dark:text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Aktifkan 2FA
                            </h3>
                            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mb-4">
                                Tingkatkan keamanan akun Anda dengan autentikasi dua faktor. Untuk memulai pengaturan, silakan masukkan password akun Anda saat ini. Kami akan mengirimkan instruksi setup ke email Anda.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1 max-w-sm">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="password"
                                        value={enablePassword}
                                        onChange={(e) => setEnablePassword(e.target.value)}
                                        placeholder="Password saat ini"
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                </div>
                                <button
                                    onClick={handleEnableRequest}
                                    disabled={isRequestingEnable || !enablePassword}
                                    className="inline-flex justify-center items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isRequestingEnable ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Email Setup"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {is2FAEnabled && (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-xl">
                            <h3 className="text-red-600 dark:text-red-400 font-semibold mb-2 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" />
                                Nonaktifkan 2FA
                            </h3>
                            <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                                Jika Anda menonaktifkan fitur ini, akun Anda akan menjadi kurang aman. Untuk melanjutkan, masukkan password Anda saat ini. Sistem akan mengirim email konfirmasi.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1 max-w-sm">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="password"
                                        value={disablePassword}
                                        onChange={(e) => setDisablePassword(e.target.value)}
                                        placeholder="Password saat ini"
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                    />
                                </div>
                                <button
                                    onClick={handleDisableRequest}
                                    disabled={isDisabling || !disablePassword}
                                    className="inline-flex justify-center items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isDisabling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Konfirmasi"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
