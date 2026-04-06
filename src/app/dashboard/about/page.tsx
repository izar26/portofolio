"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { Save, User, MapPin, Briefcase, Mail, Link as LinkIcon, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AboutData {
    description_1: string;
    image_url: string;
    location_badge: string;
    full_name: string;
    role: string;
    email: string;
    location_detail: string;
    stats_1_value: string;
    stats_1_label: string;
    stats_2_value: string;
    stats_2_label: string;
    stats_3_value: string;
    stats_3_label: string;
}

export default function AboutDashboard() {
    const router = useRouter();
    const [data, setData] = useState<AboutData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/about")
            .then((res) => {
                if (!res.ok) throw new Error("Gagal mengambil data");
                return res.json();
            })
            .then((json) => {
                if (json.success) {
                    setData(json.data);
                    setPreviewUrl(json.data.image_url);
                }
            })
            .catch((err) => {
                toast.error("Gagal memuat data Tentang Saya.");
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleChange = (field: keyof AboutData, value: string) => {
        setData((prev) => prev ? { ...prev, [field]: value } : null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!data) return;

        setIsSaving(true);
        try {
            let finalImageUrl = data.image_url;

            // 1. Upload image if a new file is selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const uploadJson = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadJson.message || "Gagal mengunggah gambar.");
                if (uploadJson.success) {
                    finalImageUrl = uploadJson.url;
                }
            }

            // 2. Save all data to DB
            const payloadToSave = { ...data, image_url: finalImageUrl };

            const res = await fetch("/api/about", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadToSave),
            });

            const json = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error("Sesi telah berakhir. Silakan login kembali.");
                    router.push("/login");
                    return;
                }
                throw new Error(json.message || "Gagal menyimpan data.");
            }

            if (json.success) {
                toast.success("Berhasil!", {
                    description: "Data 'Tentang Saya' telah diperbarui.",
                });
            } else {
                throw new Error(json.message);
            }
        } catch (error: any) {
            toast.error("Gagal", {
                description: error.message || "Gagal menyimpan perubahan.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400 font-body">Memuat data...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] glass-card rounded-2xl p-8 border-dashed border-red-500/30">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold font-sans mb-2">Data Tidak Ditemukan</h2>
                <p className="text-zinc-500 text-center max-w-md font-body">
                    Sistem tidak dapat menemukan data seeder. Pastikan script seed-about.msj sudah dijalankan di database.
                </p>
            </div>
        );
    }

    return (
        <div className="pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-sans tracking-tight">Kelola Tentang Saya</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body mt-1">
                        Ubah deskripsi profil, informasi kontak, dan statistik pencapaian.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Section 1: Profil Utama */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-6 md:p-8"
                >
                    <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-white/10 pb-4 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <User size={18} />
                        </div>
                        <h3 className="text-lg font-bold font-sans">Biografi & Visual</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-2">
                                <User size={14} /> Foto Profil (Aspek Rasio 4:3)
                            </label>

                            <div className="flex flex-col md:flex-row gap-6 mt-2">
                                {/* Preview Card */}
                                <div className="shrink-0 w-32 h-40 sm:w-48 sm:h-64 rounded-xl border border-dashed border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-obsidian-900/50 flex flex-col items-center justify-center overflow-hidden relative">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-zinc-400 flex flex-col items-center">
                                            <User size={32} className="opacity-50 mb-2" />
                                            <span className="text-xs font-medium">Bujur sangkar/4:3</span>
                                        </div>
                                    )}
                                </div>

                                {/* Upload Controls */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <input
                                        type="file"
                                        id="profileImage"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="profileImage"
                                        className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors shadow-sm w-full md:w-auto self-start"
                                    >
                                        <LinkIcon size={16} /> Pilih File Gambar...
                                    </label>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 font-body">Maksimal 2MB. Format: JPG, PNG, WEBP. Gambar akan ditampilkan proporsional pada bagian profil.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">Deskripsi</label>
                            <textarea
                                value={data.description_1}
                                onChange={(e) => handleChange("description_1", e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/50 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40 min-h-[120px] resize-y"
                            />
                        </div>


                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-2">
                                <MapPin size={14} /> Teks Badge Foto (ex: Jakarta, ID)
                            </label>
                            <input
                                type="text"
                                value={data.location_badge}
                                onChange={(e) => handleChange("location_badge", e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/50 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Section 2: Informasi Personal */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-2xl p-6 md:p-8"
                >
                    <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-white/10 pb-4 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-500">
                            <Briefcase size={18} />
                        </div>
                        <h3 className="text-lg font-bold font-sans">Informasi Kontak & Peran</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">Nama Lengkap</label>
                            <input
                                type="text"
                                value={data.full_name}
                                onChange={(e) => handleChange("full_name", e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/50 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">Peran / Posisi</label>
                            <input
                                type="text"
                                value={data.role}
                                onChange={(e) => handleChange("role", e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/50 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-2">
                                <Mail size={14} /> Email Publik
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/50 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-2">
                                <MapPin size={14} /> Teks Lokasi Lengkap
                            </label>
                            <input
                                type="text"
                                value={data.location_detail}
                                onChange={(e) => handleChange("location_detail", e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/50 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Section 3: Statistik */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-2xl p-6 md:p-8"
                >
                    <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-white/10 pb-4 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <span className="font-bold">#</span>
                        </div>
                        <h3 className="text-lg font-bold font-sans">Statistik Pencapaian</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Stat 1 */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-obsidian-900/50 border border-zinc-200 dark:border-white/5 space-y-4">
                            <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 font-sans">Statistik 1</h4>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Nilai (ex: 5+)</label>
                                <input
                                    type="text"
                                    value={data.stats_1_value}
                                    onChange={(e) => handleChange("stats_1_value", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Label</label>
                                <input
                                    type="text"
                                    value={data.stats_1_label}
                                    onChange={(e) => handleChange("stats_1_label", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>
                        </div>

                        {/* Stat 2 */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-obsidian-900/50 border border-zinc-200 dark:border-white/5 space-y-4">
                            <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 font-sans">Statistik 2</h4>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Nilai (ex: 50+)</label>
                                <input
                                    type="text"
                                    value={data.stats_2_value}
                                    onChange={(e) => handleChange("stats_2_value", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Label</label>
                                <input
                                    type="text"
                                    value={data.stats_2_label}
                                    onChange={(e) => handleChange("stats_2_label", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>
                        </div>

                        {/* Stat 3 */}
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-obsidian-900/50 border border-zinc-200 dark:border-white/5 space-y-4">
                            <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 font-sans">Statistik 3</h4>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Nilai (ex: 100%)</label>
                                <input
                                    type="text"
                                    value={data.stats_3_value}
                                    onChange={(e) => handleChange("stats_3_value", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Label</label>
                                <input
                                    type="text"
                                    value={data.stats_3_label}
                                    onChange={(e) => handleChange("stats_3_label", e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-4 mt-8">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl p-px font-medium text-sm shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 rounded-xl transition-all duration-300 group-hover:bg-opacity-0">
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 text-white" />
                            )}
                            <span className="text-white font-semibold">Simpan Perubahan</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
}
