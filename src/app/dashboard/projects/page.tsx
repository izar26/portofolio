"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Save, X, Loader2, GripVertical, Image as ImageIcon, ExternalLink, Github } from "lucide-react";
import { toast } from "sonner";

interface Project {
    id: number;
    title: string;
    description: string;
    image_url: string;
    tags: string[];
    live_url: string;
    github_url: string;
    sort_order: number;
}

export default function ProjectsDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for Add/Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);

    // Form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tagsText, setTagsText] = useState("");
    const [liveUrl, setLiveUrl] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [sortOrder, setSortOrder] = useState<number>(0);

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState("");

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            const json = await res.json();
            if (json.success) {
                setProjects(json.data);
            } else {
                toast.error("Gagal memuat data proyek.");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan jaringan.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentId(null);
        setTitle("");
        setDescription("");
        setTagsText("");
        setLiveUrl("");
        setGithubUrl("");
        setSortOrder(projects.length + 1);
        setSelectedFile(null);
        setPreviewUrl(null);
        setExistingImageUrl("");
        setIsModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setIsEditing(true);
        setCurrentId(project.id);
        setTitle(project.title);
        setDescription(project.description);
        setTagsText(project.tags.join(", "));
        setLiveUrl(project.live_url || "");
        setGithubUrl(project.github_url || "");
        setSortOrder(project.sort_order);
        setSelectedFile(null);
        setPreviewUrl(project.image_url);
        setExistingImageUrl(project.image_url);
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus proyek ini?")) return;

        try {
            const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                toast.success("Berhasil dihapus!");
                setProjects(projects.filter((p) => p.id !== id));
            } else {
                toast.error(json.message || "Gagal menghapus.");
            }
        } catch {
            toast.error("Terjadi kesalahan saat menghapus.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return toast.error("Judul proyek wajib diisi.");
        if (!description.trim()) return toast.error("Deskripsi proyek wajib diisi.");
        if (!tagsText.trim()) return toast.error("Teknologi (Tags) wajib diisi.");
        if (!existingImageUrl && !selectedFile) return toast.error("Gambar proyek wajib diunggah.");

        setIsSaving(true);

        try {
            let finalImageUrl = existingImageUrl;

            // 1. Upload file if selected
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

            // 2. Parse Tags
            const parsedTags = tagsText.split(",").map(i => i.trim()).filter(i => i !== "");

            // 3. Save Project Data
            const payload = {
                id: currentId,
                title,
                description,
                image_url: finalImageUrl,
                tags: parsedTags,
                live_url: liveUrl,
                github_url: githubUrl,
                sort_order: sortOrder
            };

            const res = await fetch("/api/projects", {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (json.success) {
                toast.success(isEditing ? "Proyek berhasil diperbarui!" : "Proyek baru ditambahkan!");
                setIsModalOpen(false);
                fetchProjects();
            } else {
                toast.error(json.message || "Gagal menyimpan data proyek.");
            }
        } catch (err: any) {
            toast.error(err.message || "Terjadi kesalahan jaringan saat menyimpan.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-sans tracking-tight">Kelola Proyek</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body mt-1">
                        Tambahkan atau perbarui portofolio proyek unggulan Anda.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={16} /> Tambah Proyek
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh]">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <p className="text-zinc-500">Memuat data proyek...</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border-dashed border-zinc-300 dark:border-white/10">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-obsidian-800 flex items-center justify-center mb-4 text-zinc-400">
                        <Plus size={24} />
                    </div>
                    <h3 className="text-lg font-bold font-sans mb-2">Belum ada proyek</h3>
                    <p className="text-zinc-500 font-body max-w-sm">
                        Mulai pamerkan hasil karya Anda dengan menekan tombol tambah proyek di atas.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <motion.div
                            layout
                            key={project.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card rounded-2xl overflow-hidden group border border-zinc-200 dark:border-white/5 hover:border-emerald-500/30 transition-colors flex flex-col"
                        >
                            <div className="relative aspect-video w-full bg-zinc-100 dark:bg-obsidian-800 border-b border-zinc-200 dark:border-white/5">
                                {project.image_url ? (
                                    <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImageIcon size={32} /></div>
                                )}

                                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-obsidian-900/90 backdrop-blur-sm p-1.5 rounded-lg shadow-lg">
                                    <button
                                        onClick={() => openEditModal(project)}
                                        className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="absolute top-3 left-3 bg-white/90 dark:bg-obsidian-900/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                                    <GripVertical size={12} className="text-zinc-400" /> #{project.sort_order}
                                </div>
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-lg font-bold font-sans line-clamp-1 mb-2">{project.title}</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 font-body mb-4 flex-1">
                                    {project.description}
                                </p>

                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {project.tags.slice(0, 3).map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-100 dark:bg-obsidian-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/5"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {project.tags.length > 3 && (
                                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-100 dark:bg-obsidian-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/5">
                                            +{project.tags.length - 3} lagi
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-white/5">
                                    {project.github_url && (
                                        <a href={project.github_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-emerald-500 transition-colors" title="GitHub">
                                            <Github size={18} />
                                        </a>
                                    )}
                                    {project.live_url && (
                                        <a href={project.live_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-emerald-500 transition-colors" title="Live Preview">
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </div>
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
                        className="w-full max-w-2xl bg-white dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 relative my-8"
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors absolute z-10 bg-white/80 dark:bg-obsidian-900/80 backdrop-blur-sm"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold font-sans mb-6">
                            {isEditing ? "Edit Proyek" : "Belum Punya Proyek? Tambahkan Baru!"}
                        </h3>

                        <form onSubmit={handleSave} className="space-y-5">

                            {/* Image Upload Area */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-2">
                                    <ImageIcon size={14} /> Foto / Screenshot Proyek (Wajib)
                                </label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="shrink-0 w-full sm:w-48 aspect-video rounded-xl border border-dashed border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-obsidian-800/50 flex flex-col items-center justify-center overflow-hidden relative">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-zinc-400 flex flex-col items-center p-4 text-center">
                                                <ImageIcon size={24} className="opacity-50 mb-2" />
                                                <span className="text-[10px] sm:text-xs">Rasio 16:9 disarankan</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <input
                                            type="file"
                                            id="projectImage"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="projectImage"
                                            className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors w-full sm:w-auto self-start"
                                        >
                                            Upload Gambar Baru...
                                        </label>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-body">Maksimal 2MB. Format: JPG, PNG, WEBP.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">
                                        Judul Proyek
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Nama aplikasi atau website..."
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">
                                        Deskripsi Singkat
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Jelaskan fitur utama dari proyek ini..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40 resize-none"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">
                                        Teknologi yang digunakan (Pisahkan dengan koma)
                                    </label>
                                    <input
                                        type="text"
                                        value={tagsText}
                                        onChange={(e) => setTagsText(e.target.value)}
                                        placeholder="React, Tailwind, Node.js, dll."
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-1.5">
                                        <ExternalLink size={14} /> URL Live Preview
                                    </label>
                                    <input
                                        type="url"
                                        value={liveUrl}
                                        onChange={(e) => setLiveUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-1.5">
                                        <Github size={14} /> URL GitHub Opsional
                                    </label>
                                    <input
                                        type="url"
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl(e.target.value)}
                                        placeholder="https://github.com/..."
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans">
                                        Urutan Tampil
                                    </label>
                                    <input
                                        type="number"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                                        className="w-1/3 px-4 py-2.5 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                    <p className="text-xs text-zinc-500 font-body mt-1">Angka terkecil tampil paling atas.</p>
                                </div>
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
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Simpan Proyek
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
