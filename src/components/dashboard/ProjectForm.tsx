"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Loader2, Image as ImageIcon, ExternalLink, Github, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const PREDEFINED_TAGS = [
    "React", "Next.js", "Vue.js", "Nuxt.js", "Tailwind CSS", "Bootstrap", 
    "Node.js", "Express", "NestJS", "Laravel", "CodeIgniter", "PHP", 
    "Python", "Django", "Flask", "Java", "Spring Boot", "Go", 
    "MySQL", "PostgreSQL", "MongoDB", "Firebase", "Supabase", 
    "Docker", "AWS", "Vercel", "Figma", "TypeScript", "JavaScript"
];

interface ProjectMedia {
    id?: number;
    media_type: 'image' | 'youtube';
    media_url: string;
}

export interface Project {
    id: number;
    title: string;
    description: string;
    image_url: string;
    tags: string[];
    live_url: string;
    github_url: string;
    sort_order: number;
    media: ProjectMedia[];
}

interface ProjectFormProps {
    initialData?: Project;
    defaultSortOrder?: number;
}

export function ProjectForm({ initialData, defaultSortOrder = 0 }: ProjectFormProps) {
    const router = useRouter();
    const isEditing = !!initialData;
    const [isSaving, setIsSaving] = useState(false);

    // Form fields
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
    const [customTagInput, setCustomTagInput] = useState("");
    const [liveUrl, setLiveUrl] = useState(initialData?.live_url || "");
    const [githubUrl, setGithubUrl] = useState(initialData?.github_url || "");
    const [sortOrder, setSortOrder] = useState<number>(initialData?.sort_order ?? defaultSortOrder);

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null);
    const [existingImageUrl, setExistingImageUrl] = useState(initialData?.image_url || "");

    // Additional Media State
    const [mediaList, setMediaList] = useState<ProjectMedia[]>(initialData?.media || []);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddYoutubeMedia = () => {
        const url = prompt("Masukkan URL Video YouTube:");
        if (!url) return;
        
        let embedUrl = url;
        if (url.includes("watch?v=")) {
            const videoId = new URL(url).searchParams.get("v");
            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes("youtu.be/")) {
            const videoId = url.split("youtu.be/")[1]?.split("?")[0];
            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        setMediaList([...mediaList, { media_type: 'youtube', media_url: embedUrl }]);
    };

    const handleAddImageMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        
        setIsUploadingMedia(true);
        try {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const uploadJson = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadJson.message || "Gagal mengunggah foto.");
            if (uploadJson.success) {
                setMediaList([...mediaList, { media_type: 'image', media_url: uploadJson.url }]);
            }
        } catch (err: any) {
            toast.error(err.message || "Gagal mengunggah gambar.");
        } finally {
            setIsUploadingMedia(false);
            e.target.value = ''; // reset input
        }
    };

    const handleRemoveMedia = (index: number) => {
        setMediaList(mediaList.filter((_, i) => i !== index));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return toast.error("Judul proyek wajib diisi.");
        if (!description.trim()) return toast.error("Deskripsi proyek wajib diisi.");
        if (selectedTags.length === 0) return toast.error("Pilih minimal satu teknologi.");
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

            // 2. Tags are already an array
            const parsedTags = selectedTags;

            // 3. Save Project Data
            const payload = {
                id: initialData?.id,
                title,
                description,
                image_url: finalImageUrl,
                tags: parsedTags,
                live_url: liveUrl,
                github_url: githubUrl,
                sort_order: sortOrder,
                media: mediaList
            };

            const res = await fetch("/api/projects", {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (json.success) {
                toast.success(isEditing ? "Proyek berhasil diperbarui!" : "Proyek baru ditambahkan!");
                router.push("/dashboard/projects");
                router.refresh();
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
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
            <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-6">
                    <h3 className="text-xl font-bold font-sans">
                        {isEditing ? "Edit Proyek" : "Tambah Proyek Baru"}
                    </h3>
                </div>

                {/* Image Upload Area */}
                <div>
                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-2">
                        <ImageIcon size={14} /> Foto Utama / Thumbnail (Wajib)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="shrink-0 w-full sm:w-64 aspect-video rounded-xl border border-dashed border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-obsidian-800/50 flex flex-col items-center justify-center overflow-hidden relative">
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
                            Deskripsi Lengkap
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Jelaskan fitur utama, masalah yang diselesaikan, dll..."
                            rows={5}
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40 resize-y"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-3 font-sans">
                            Teknologi yang Digunakan
                        </label>
                        
                        <div className="bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl p-4">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {PREDEFINED_TAGS.map(tag => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedTags(selectedTags.filter(t => t !== tag));
                                                } else {
                                                    setSelectedTags([...selectedTags, tag]);
                                                }
                                            }}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                                                isSelected 
                                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                                                : 'bg-white dark:bg-obsidian-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-emerald-500/50'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-200 dark:border-white/10">
                                {selectedTags.filter(t => !PREDEFINED_TAGS.includes(t)).map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-white border border-emerald-500">
                                        {tag}
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                                            className="hover:bg-white/20 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <input
                                    type="text"
                                    value={customTagInput}
                                    onChange={(e) => setCustomTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
                                                setSelectedTags([...selectedTags, customTagInput.trim()]);
                                                setCustomTagInput("");
                                            }
                                        }
                                    }}
                                    placeholder="Tambah teknologi lain (Ketik lalu Enter)"
                                    className="flex-1 px-4 py-2 bg-white dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
                                            setSelectedTags([...selectedTags, customTagInput.trim()]);
                                            setCustomTagInput("");
                                        }
                                    }}
                                    className="px-4 py-2 bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-white rounded-lg text-sm font-semibold hover:bg-zinc-300 dark:hover:bg-white/20 transition-colors"
                                >
                                    Tambah
                                </button>
                            </div>
                        </div>
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
            </div>

            {/* Additional Media Section */}
            <div className="glass-card rounded-2xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
                    <div>
                        <h3 className="text-lg font-bold font-sans">Galeri & Media Tambahan</h3>
                        <p className="text-sm text-zinc-500 font-body">Tambahkan foto lain atau video YouTube opsional.</p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            id="addMediaImage"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleAddImageMedia}
                            className="hidden"
                        />
                        <label
                            htmlFor="addMediaImage"
                            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 transition-colors shadow-sm ${isUploadingMedia ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {isUploadingMedia ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />} Tambah Foto
                        </label>
                        <button
                            type="button"
                            onClick={handleAddYoutubeMedia}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> YouTube
                        </button>
                    </div>
                </div>

                {mediaList.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-white/20 rounded-xl bg-zinc-50 dark:bg-obsidian-900/50">
                        <ImageIcon size={32} className="mx-auto text-zinc-400 mb-3 opacity-50" />
                        <h4 className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 font-sans mb-1">Belum ada media</h4>
                        <p className="text-xs text-zinc-500 font-body">Unggah foto atau sematkan video dari YouTube.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {mediaList.map((item, idx) => (
                            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 group shadow-md">
                                {item.media_type === 'image' ? (
                                    <img src={item.media_url} alt="Media" className="w-full h-full object-cover" />
                                ) : (
                                    <iframe src={item.media_url} className="w-full h-full pointer-events-none" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMedia(idx)}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transform scale-90 group-hover:scale-100 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard/projects")}
                    className="px-6 py-2.5 text-sm font-medium rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isEditing ? "Simpan Perubahan" : "Simpan Proyek Baru"}
                </button>
            </div>
        </form>
    );
}
