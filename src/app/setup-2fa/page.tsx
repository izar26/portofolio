"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function Setup2FAContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [isLoading, setIsLoading] = useState(true);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [totpCode, setTotpCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            handleGenerate();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const handleGenerate = async () => {
        try {
            const res = await fetch(`/api/auth/2fa/generate?token=${token}`);
            const data = await res.json();
            if (data.success) {
                setQrCodeUrl(data.qrCodeUrl);
                setSecret(data.secret);
            } else {
                setPageError(data.message || "Gagal menghasilkan kode QR");
            }
        } catch {
            setPageError("Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnable = async () => {
        if (!totpCode || totpCode.length !== 6) {
            toast.error("Masukkan 6 digit kode yang valid");
            return;
        }
        setIsVerifying(true);
        try {
            const res = await fetch("/api/auth/2fa/enable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ secret, totpCode, token }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setIsSuccess(true);
                setTimeout(() => {
                    router.push("/dashboard/security");
                }, 2000);
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Gagal memverifikasi kode");
        } finally {
            setIsVerifying(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="text-center p-6 text-zinc-500">
                Tautan setup tidak valid. Harap periksa kembali tautan di email Anda.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="text-center p-10">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                <p className="mt-4 text-zinc-500 text-sm">Menyiapkan kode rahasia...</p>
            </div>
        );
    }

    if (pageError) {
        return (
            <div className="text-center p-6 space-y-6">
                <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-500/20">
                    {pageError}
                </div>
                <button onClick={() => router.push("/dashboard/security")} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors rounded-xl text-sm font-medium">
                    Kembali ke Dashboard Keamanan
                </button>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="text-center space-y-6 p-4">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm border border-emerald-200 dark:border-emerald-500/20">
                    Google Authenticator berhasil diaktifkan! Anda akan dialihkan ke dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-white/5 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-white/10 flex justify-center">
                {qrCodeUrl && (
                    <Image src={qrCodeUrl} alt="QR Code" width={180} height={180} className="rounded-lg" />
                )}
            </div>
            <div className="space-y-5 text-left">
                <div>
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">1. Buka Aplikasi Authenticator</h3>
                    <p className="text-sm text-zinc-500">Gunakan Google Authenticator atau Authy, lalu pilih ikon "+" untuk menambah akun.</p>
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">2. Scan Kode QR</h3>
                    <p className="text-sm text-zinc-500">Scan kode QR di atas. Jika kamera tidak bisa digunakan, masukkan kode rahasia berikut secara manual:</p>
                    <code className="mt-2 block p-3 bg-zinc-100 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-xl font-mono text-sm tracking-wider text-center text-zinc-800 dark:text-zinc-200">{secret}</code>
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">3. Verifikasi Kode</h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            maxLength={6}
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            className="w-32 px-4 py-3 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                        <button
                            onClick={handleEnable}
                            disabled={isVerifying || totpCode.length !== 6}
                            className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verifikasi & Aktifkan"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Setup2FAPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12">
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
                <div className="glass-card rounded-2xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/30">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                        className="text-center mb-6"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 mb-5 shadow-lg shadow-emerald-500/25">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold font-sans tracking-tight mb-2">
                            Setup Google Authenticator
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Selesaikan pengaturan 2FA Anda
                        </p>
                    </motion.div>

                    <Suspense fallback={<div className="text-center p-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" /></div>}>
                        <Setup2FAContent />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
}
