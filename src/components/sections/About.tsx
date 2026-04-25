"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Trophy, Users, Briefcase, Mail, User, Terminal } from "lucide-react";

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

export function About() {
    const [data, setData] = useState<AboutData | null>(null);

    useEffect(() => {
        fetch("/api/about")
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data);
            })
            .catch(console.error);
    }, []);

    if (!data) return null; // Or a skeleton loader if preferred

    return (
        <section id="about" className="relative py-24 md:py-32 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />

            <div className="container px-6 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className="flex flex-col gap-12"
                >
                    {/* Header */}
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4 inline-flex flex-col">
                            Tentang Saya
                            <span className="w-12 h-1 bg-emerald-500 rounded-full mt-4 self-center md:self-start"></span>
                        </h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-start">
                        {/* Visual / Image Column */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="w-full lg:w-1/2 relative"
                        >
                            <div className="relative aspect-square md:aspect-[3/4] w-full rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-2xl group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                {/* Image Placeholder */}
                                <img
                                    src={data.image_url}
                                    alt="Profile"
                                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                />

                                {/* Overlay Card Location */}
                                <div className="absolute bottom-6 left-6 z-20 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                        <MapPin className="text-emerald-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-300 font-medium uppercase tracking-wider mb-1">Berbasis Di</p>
                                        <div className="flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <p className="text-white font-semibold font-sans">{data.location_badge}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative dots / background pattern */}
                            <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]" />
                        </motion.div>

                        {/* Content Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="w-full lg:w-1/2 flex flex-col justify-center"
                        >
                            <div className="prose prose-invert max-w-none prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:font-body prose-p:text-lg">
                                <p className="mb-6 whitespace-pre-wrap">{data.description_1}</p>
                            </div>

                            {/* Personal Biodata Card */}
                            <div className="bg-white/50 dark:bg-obsidian-800/50 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-2xl p-6 mb-8 mt-2 shadow-sm">
                                <h3 className="text-xl font-bold font-sans text-foreground dark:text-white mb-6 border-b border-zinc-200 dark:border-white/10 pb-4">
                                    Informasi Personal
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                                            <User size={16} /> Nama Lengkap
                                        </div>
                                        <p className="text-foreground dark:text-white font-semibold font-sans">{data.full_name}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                                            <Terminal size={16} /> Peran
                                        </div>
                                        <p className="text-foreground dark:text-white font-semibold font-sans">{data.role}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                                            <Mail size={16} /> Email
                                        </div>
                                        <a href={`mailto:${data.email}`} className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold font-sans transition-colors truncate">
                                            {data.email}
                                        </a>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                                            <MapPin size={16} /> Lokasi
                                        </div>
                                        <p className="text-foreground dark:text-white font-semibold font-sans">{data.location_detail}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-200 dark:border-white/10">
                                {[
                                    { icon: <Briefcase size={22} className="text-emerald-500" />, value: data.stats_1_value, label: data.stats_1_label },
                                    { icon: <Trophy size={22} className="text-teal-500" />, value: data.stats_2_value, label: data.stats_2_label },
                                    { icon: <Users size={22} className="text-emerald-400" />, value: data.stats_3_value, label: data.stats_3_label },
                                ].map((stat, idx) => (
                                    <div key={idx} className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3 mb-1">
                                            {stat.icon}
                                            <h4 className="text-3xl lg:text-4xl font-bold text-foreground dark:text-white font-sans truncate">{stat.value}</h4>
                                        </div>
                                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide truncate">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
