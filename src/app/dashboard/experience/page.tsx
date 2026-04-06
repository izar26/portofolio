"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Save, X, Loader2, GripVertical, Building2, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Experience {
    id: number;
    role: string;
    company: string;
    period: string;
    description: string;
    sort_order: number;
}

export default function ExperienceDashboard() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for Add/Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);

    // Form fields
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [period, setPeriod] = useState("");
    const [description, setDescription] = useState("");
    const [sortOrder, setSortOrder] = useState<number>(0);

    const fetchExperiences = async () => {
        try {
            const res = await fetch("/api/experience");
            const json = await res.json();
            if (json.success) {
                setExperiences(json.data);
            } else {
                toast.error("Gagal memuat data pengalaman.");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan jaringan.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentId(null);
        setRole("");
        setCompany("");
        setPeriod("");
        setDescription("");
        setSortOrder(experiences.length + 1);
        setIsModalOpen(true);
    };

    const openEditModal = (exp: Experience) => {
        setIsEditing(true);
        setCurrentId(exp.id);
        setRole(exp.role);
        setCompany(exp.company);
        setPeriod(exp.period);
        setDescription(exp.description);
        setSortOrder(exp.sort_order);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus ini dari riwayat pengalaman?")) return;

        try {
            const res = await fetch(`/api/experience?id=${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                toast.success("Berhasil dihapus!");
                setExperiences(experiences.filter((e) => e.id !== id));
            } else {
                toast.error(json.message || "Gagal menghapus.");
            }
        } catch {
            toast.error("Terjadi kesalahan saat menghapus.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role.trim()) return toast.error("Jabatan/posisi wajib diisi.");
        if (!company.trim()) return toast.error("Nama perusahaan wajib diisi.");
        if (!period.trim()) return toast.error("Periode kerja wajib diisi.");
        if (!description.trim()) return toast.error("Deskripsi tugas wajib diisi.");

        setIsSaving(true);

        const payload = {
            id: currentId,
            role,
            company,
            period,
            description,
            sort_order: sortOrder
        };

        try {
            const res = await fetch("/api/experience", {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (json.success) {
                toast.success(isEditing ? "Pengalaman berhasil diperbarui!" : "Pengalaman baru ditambahkan!");
                setIsModalOpen(false);
                fetchExperiences(); // Refresh data
            } else {
                toast.error(json.message || "Gagal menyimpan data.");
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan saat menyimpan.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-sans tracking-tight">Kelola Pengalaman</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body mt-1">
                        Tambahkan riwayat pekerjaan atau pendidikan dalam bentuk *timeline*.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={16} /> Tambah Pengalaman
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh]">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <p className="text-zinc-500">Memuat riwayat...</p>
                </div>
            ) : experiences.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border-dashed border-zinc-300 dark:border-white/10">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-obsidian-800 flex items-center justify-center mb-4 text-zinc-400">
                        <Plus size={24} />
                    </div>
                    <h3 className="text-lg font-bold font-sans mb-2">Belum ada pengalaman</h3>
                    <p className="text-zinc-500 font-body max-w-sm">
                        Ceritakan rekam jejak karir Anda dengan menekan tombol tambah pengalaman di atas.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {experiences.map((exp) => (
                        <motion.div
                            layout
                            key={exp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/5 hover:border-emerald-500/30 transition-colors flex flex-col md:flex-row gap-6 relative group"
                        >

                            <div className="hidden md:flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-600">
                                <GripVertical size={24} className="cursor-move hover:text-emerald-500 transition-colors" />
                                <span className="text-[10px] font-bold mt-1">#{exp.sort_order}</span>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-bold font-sans">{exp.role}</h3>
                                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(exp)}
                                            className="p-1.5 rounded-md text-zinc-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exp.id)}
                                            className="p-1.5 rounded-md text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium font-body mb-4">
                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                        <Building2 size={14} />
                                        {exp.company}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2.5 py-1.5 rounded-full text-xs">
                                        <Calendar size={14} />
                                        {exp.period}
                                    </div>
                                </div>

                                <p className="text-zinc-600 dark:text-zinc-400 font-body text-sm leading-relaxed max-w-3xl">
                                    {exp.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-xl bg-white dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 relative my-8"
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold font-sans mb-6 pr-8">
                            {isEditing ? "Edit Pengalaman" : "Tambah Riwayat Pengalaman"}
                        </h3>

                        <form onSubmit={handleSave} className="space-y-5">

                            <div>
                                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">
                                    Jabatan / Posisi (Role)
                                </label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="Senior Frontend Engineer..."
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-1.5">
                                        <Building2 size={14} /> Nama Perusahaan / Institusi
                                    </label>
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="TechNova Solutions"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-1.5">
                                        <Calendar size={14} /> Periode Waktu
                                    </label>
                                    <input
                                        type="text"
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                        placeholder="2022 - Sekarang"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">
                                    Tugas dan Pencapaian (Deskripsi)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Sebutkan hal penting atau inovasi yang Anda capai di sini..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">
                                    Urutan Tampil Paling Atas
                                </label>
                                <input
                                    type="number"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                                    className="w-1/3 px-4 py-3 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                />
                                <p className="text-xs text-zinc-500 font-body mt-2">Gunakan angka yang lebih kecil agar tampil paling pertama (di atas).</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-zinc-200 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Simpan Pengalaman
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
