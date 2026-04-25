"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Semua field wajib diisi");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Konfirmasi password baru tidak cocok");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password baru minimal 6 karakter");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            
            const data = await res.json();
            
            if (data.success) {
                toast.success(data.message);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Terjadi kesalahan sistem saat mengubah password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-8"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                        <KeyRound className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-sans">Ganti Password</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Perbarui kata sandi admin Anda secara berkala untuk keamanan.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Password Saat Ini
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Password Baru
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                placeholder="Min. 6 karakter"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Konfirmasi Password Baru
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                placeholder="Ketik ulang password baru"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan Password
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
