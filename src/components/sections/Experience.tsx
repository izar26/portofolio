"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ExperienceData {
    id: number;
    role: string;
    company: string;
    period: string;
    description: string;
}

export function Experience() {
    const [experiences, setExperiences] = useState<ExperienceData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/experience")
            .then(res => res.json())
            .then(json => {
                if (json.success) setExperiences(json.data);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    // Hindari render loncat-loncat saat loading awal
    if (isLoading && experiences.length === 0) return null;

    return (
        <section id="experience" className="relative py-24 md:py-32 bg-zinc-50/50 dark:bg-obsidian-900/50">
            <div className="container px-6 mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className="flex flex-col gap-12"
                >
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4 inline-flex flex-col">
                            Pengalaman Kerja
                            <span className="w-12 h-1 bg-emerald-500 rounded-full mt-4 self-center"></span>
                        </h2>
                    </div>

                    {/* Timeline */}
                    <div className="relative mt-8">
                        {/* Vertical Line */}
                        <div className="absolute left-0 md:left-1/2 -translate-x-px md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />

                        <div className="flex flex-col gap-16">
                            {experiences.map((exp, idx) => (
                                <div key={exp.id} className="relative flex flex-col md:flex-row items-center justify-between group">

                                    {/* Timeline Dot */}
                                    <div className="absolute left-0 md:left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-obsidian-800 border-2 border-emerald-500/30 group-hover:border-emerald-500 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-300 z-10">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    </div>
                                    {/* Mobile Dot */}
                                    <div className="absolute left-[-5px] top-1 md:hidden flex items-center justify-center w-3 h-3 rounded-full bg-emerald-500 z-10 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />

                                    {/* Left Content (or top on mobile) */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className={`w-full md:w-5/12 ml-6 md:ml-0 ${idx % 2 === 0 ? "md:text-right" : "md:order-2 md:text-left"}`}
                                    >
                                        <h3 className="text-xl md:text-2xl font-bold text-foreground dark:text-white font-sans">{exp.role}</h3>
                                        <div className="text-emerald-500 dark:text-emerald-400 font-medium font-body mt-1 mb-2">{exp.company}</div>
                                        <div className="text-sm text-zinc-600 dark:text-zinc-500 font-mono inline-block px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 mb-4 md:hidden">
                                            {exp.period}
                                        </div>
                                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-body whitespace-pre-wrap">
                                            {exp.description}
                                        </p>
                                    </motion.div>

                                    {/* Right Content (or hidden on mobile - just the date for desktop) */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className={`hidden md:block w-5/12 ${idx % 2 === 0 ? "md:order-2 md:text-left" : "md:text-right"}`}
                                    >
                                        <div className="text-sm text-zinc-600 dark:text-zinc-500 font-mono inline-block px-4 py-2 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 group-hover:bg-zinc-200 dark:group-hover:bg-white/10 transition-colors">
                                            {exp.period}
                                        </div>
                                    </motion.div>

                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
