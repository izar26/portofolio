"use client";

import { useEffect, useState } from "react";
import { ProjectForm } from "@/components/dashboard/ProjectForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateProjectPage() {
    const [sortOrder, setSortOrder] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch existing projects just to get the next sort_order
        fetch("/api/projects")
            .then(res => res.json())
            .then(json => {
                if (json.success && json.data) {
                    setSortOrder(json.data.length + 1);
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-500">Memuat data form...</p>
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
                <h2 className="text-2xl font-bold font-sans tracking-tight">Tambah Proyek Baru</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body mt-1">
                    Silakan isi detail proyek di bawah ini.
                </p>
            </div>

            <ProjectForm defaultSortOrder={sortOrder} />
        </div>
    );
}
