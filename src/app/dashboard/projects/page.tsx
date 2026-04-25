"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Loader2, GripVertical, Image as ImageIcon, ExternalLink, Github } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Project } from "@/components/dashboard/ProjectForm";

export default function ProjectsDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className="pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-sans tracking-tight">Kelola Proyek</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body mt-1">
                        Tambahkan atau perbarui portofolio proyek unggulan Anda.
                    </p>
                </div>
                <Link
                    href="/dashboard/projects/create"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={16} /> Tambah Proyek
                </Link>
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
                    <p className="text-zinc-500 font-body max-w-sm mb-6">
                        Mulai pamerkan hasil karya Anda dengan menekan tombol tambah proyek di atas.
                    </p>
                    <Link
                        href="/dashboard/projects/create"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors"
                    >
                        <Plus size={16} /> Tambah Proyek Pertama
                    </Link>
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
                                    <Link
                                        href={`/dashboard/projects/${project.id}`}
                                        className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </Link>
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
                                
                                {project.media && project.media.length > 0 && (
                                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-semibold text-white flex items-center gap-1.5">
                                        <ImageIcon size={10} /> +{project.media.length} Media
                                    </div>
                                )}
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
        </div>
    );
}
