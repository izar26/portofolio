"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function Disable2FAConfirm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!token || !email) {
        return (
            <div className="text-center p-6 text-zinc-500">
                Tautan tidak valid. Harap periksa kembali tautan di email Anda.
            </div>
        );
    }

    const handleConfirm = async () => {
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/2fa/confirm-disable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Terjadi kesalahan.");
                setIsLoading(false);
                return;
            }

            toast.success(data.message);
            setIsSuccess(true);
            setTimeout(() => {
                router.push("/dashboard/security");
            }, 2000);
        } catch {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm border border-emerald-200 dark:border-emerald-500/20">
                    Google Authenticator berhasil dinonaktifkan. Anda akan dialihkan ke dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
                Anda meminta untuk menonaktifkan fitur Google Authenticator untuk akun <strong>{email}</strong>. 
                Jika Anda melanjutkan, akun Anda akan menjadi kurang aman.
            </p>
            
            <div className="flex flex-col gap-3">
                <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ya, Nonaktifkan 2FA"}
                </button>
                <Link href="/login" className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 font-medium rounded-xl transition-colors">
                    Batalkan
                </Link>
            </div>
        </div>
    );
}

export default function Disable2FAPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
            <div className="absolute inset-0 z-0 bg-background">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
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
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 mb-5 shadow-lg shadow-red-500/25">
                            <ShieldAlert className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold font-sans tracking-tight mb-2">
                            Konfirmasi Penonaktifan
                        </h1>
                    </motion.div>

                    <Suspense fallback={<div className="text-center p-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-red-500" /></div>}>
                        <Disable2FAConfirm />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
}
