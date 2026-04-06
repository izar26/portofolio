"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Save, X, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface SkillCategory {
    id: number;
    category_name: string;
    items: string[];
    sort_order: number;
}

export default function SkillsDashboard() {
    const [categories, setCategories] = useState<SkillCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for Add/Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);

    // Form fields
    const [categoryName, setCategoryName] = useState("");
    const [itemsText, setItemsText] = useState("");
    const [sortOrder, setSortOrder] = useState<number>(0);

    const fetchSkills = async () => {
        try {
            const res = await fetch("/api/skills");
            const json = await res.json();
            if (json.success) {
                setCategories(json.data);
            } else {
                toast.error("Gagal memuat data keahlian.");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan jaringan.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentId(null);
        setCategoryName("");
        setItemsText("");
        setSortOrder(categories.length + 1);
        setIsModalOpen(true);
    };

    const openEditModal = (category: SkillCategory) => {
        setIsEditing(true);
        setCurrentId(category.id);
        setCategoryName(category.category_name);
        setItemsText(category.items.join(", "));
        setSortOrder(category.sort_order);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus kategori ini?")) return;

        try {
            const res = await fetch(`/api/skills?id=${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                toast.success("Berhasil dihapus!");
                setCategories(categories.filter((c) => c.id !== id));
            } else {
                toast.error(json.message || "Gagal menghapus.");
            }
        } catch {
            toast.error("Terjadi kesalahan saat menghapus.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) return toast.error("Nama kategori wajib diisi.");
        if (!itemsText.trim()) return toast.error("Item keahlian wajib diisi.");

        setIsSaving(true);
        const parsedItems = itemsText.split(",").map(i => i.trim()).filter(i => i !== "");

        const payload = {
            id: currentId,
            category_name: categoryName,
            items: parsedItems,
            sort_order: sortOrder
        };

        try {
            const res = await fetch("/api/skills", {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (json.success) {
                toast.success(isEditing ? "Berhasil diperbarui!" : "Kategori baru ditambahkan!");
                setIsModalOpen(false);
                fetchSkills(); // Refresh data
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
                    <h2 className="text-2xl font-bold font-sans tracking-tight">Kelola Keahlian</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body mt-1">
                        Atur teknologi dan alat yang akan ditampilkan di portofolio Anda.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={16} /> Tambah Kategori
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh]">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <p className="text-zinc-500">Memuat data keahlian...</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border-dashed border-zinc-300 dark:border-white/10">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-obsidian-800 flex items-center justify-center mb-4 text-zinc-400">
                        <Plus size={24} />
                    </div>
                    <h3 className="text-lg font-bold font-sans mb-2">Belum ada keahlian</h3>
                    <p className="text-zinc-500 font-body max-w-sm">
                        Mulai tambahkan kategori keahlian seperti "Frontend" atau "Backend" dengan menekan tombol tambah di atas.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <motion.div
                            layout
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card rounded-2xl p-6 relative group overflow-hidden border border-zinc-200 dark:border-white/5 hover:border-emerald-500/30 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-obsidian-800 flex items-center justify-center text-zinc-400 cursor-move hover:text-foreground dark:hover:text-white transition-colors">
                                        <GripVertical size={16} />
                                    </div>
                                    <h3 className="text-lg font-bold font-sans">{category.category_name}</h3>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(category)}
                                        className="p-1.5 rounded-md text-zinc-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {category.items.map((item, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-100/80 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg bg-white dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 relative"
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold font-sans mb-6">
                            {isEditing ? "Edit Kategori" : "Tambah Kategori Baru"}
                        </h3>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="Misal: Frontend, Backend..."
                                    autoFocus
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">
                                    Daftar Keahlian (Pisahkan dengan koma)
                                </label>
                                <textarea
                                    value={itemsText}
                                    onChange={(e) => setItemsText(e.target.value)}
                                    placeholder="React, Vue, Tailwind CSS..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40 resize-none"
                                />
                                <p className="text-xs text-zinc-500 mt-2 font-body">Contoh: React, Next.js, Node.js</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">
                                    Urutan Tampil (Opsional)
                                </label>
                                <input
                                    type="number"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-zinc-200 dark:border-white/5">
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
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
