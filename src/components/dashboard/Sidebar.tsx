"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    User,
    Wrench,
    FolderGit2,
    BriefcaseBusiness,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tentang Saya", href: "/dashboard/about", icon: User },
    { name: "Keahlian", href: "/dashboard/skills", icon: Wrench },
    { name: "Proyek", href: "/dashboard/projects", icon: FolderGit2 },
    { name: "Pengalaman", href: "/dashboard/experience", icon: BriefcaseBusiness },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 glass border-r hidden md:flex flex-col">
            <div className="p-6 flex items-center justify-center border-b border-zinc-200/50 dark:border-white/5">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold font-sans text-xl">N</span>
                    </div>
                    <span className="font-bold font-sans text-xl tracking-tight">Admin<span className="text-emerald-500">.</span></span>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
                <p className="px-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 font-sans">
                    Menu Utama
                </p>

                {navigation.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 font-body group",
                                isActive
                                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-indicator"
                                    className="absolute inset-y-0 left-0 w-1 bg-emerald-500 rounded-r-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-500" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-200/50 dark:border-white/5 mb-4 mx-4 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <User className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-foreground dark:text-white truncate font-sans">Administrator</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-body">admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
