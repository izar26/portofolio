"use client";

import { useEffect, useState } from "react";
import { ProjectForm, Project } from "@/components/dashboard/ProjectForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function EditProjectPage() {
    const params = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!params.id) return;

        fetch(`/api/projects/${params.id}`)
            .then(res => res.json())
            .then(json => {
                if (json.success && json.data) {
                    setProject(json.data);
                } else {
                    toast.error("Proyek tidak ditemukan.");
                }
            })
            .catch(() => toast.error("Gagal memuat data proyek."))
            .finally(() => setIsLoading(false));
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-500">Memuat data proyek...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <h3 className="text-xl font-bold mb-2">Proyek Tidak Ditemukan</h3>
                <p className="text-zinc-500 mb-6">Proyek yang Anda cari mungkin telah dihapus.</p>
                <Link href="/dashboard/projects" className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium">
                    Kembali
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-12 max-w-4xl mx-auto">
            <Link 
                href="/dashboard/projects" 
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-emerald-500 transition-colors mb-6"
            >
                <ArrowLeft size={16} /> Kembali ke Daftar Proyek
            </Link>

            <div className="mb-8">
                <h2 className="text-2xl font-bold font-sans tracking-tight">Edit Proyek</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body mt-1">
                    Perbarui detail untuk proyek <strong>{project.title}</strong>.
                </p>
            </div>

            <ProjectForm initialData={project} />
        </div>
    );
}
