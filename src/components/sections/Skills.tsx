"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

interface SkillCategory {
    id: number;
    category_name: string;
    items: string[];
}

export function Skills() {
    const [skills, setSkills] = useState<SkillCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/skills")
            .then(res => res.json())
            .then(json => {
                if (json.success) setSkills(json.data);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    // Jangan render jika belum ada data agar layout tidak jomplang
    if (isLoading && skills.length === 0) return null;

    return (
        <section id="skills" className="relative py-24 md:py-32 bg-zinc-50/50 dark:bg-obsidian-900/50">
            <div className="container px-6 mx-auto max-w-5xl">
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
                            Teknologi
                            <span className="w-12 h-1 bg-teal-500 rounded-full mt-4 self-center md:self-start"></span>
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-4 max-w-2xl text-lg">
                            Teknologi dan alat bantu yang saya gunakan untuk mewujudkan ide.
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {skills.map((skillGroup, idx) => (
                            <motion.div
                                key={skillGroup.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * idx, duration: 0.5 }}
                                className="h-full"
                            >
                                <Tilt
                                    tiltMaxAngleX={10}
                                    tiltMaxAngleY={10}
                                    perspective={1000}
                                    transitionSpeed={1500}
                                    scale={1.02}
                                    gyroscope={true}
                                    className="group relative flex flex-col p-6 md:p-8 rounded-3xl bg-white dark:bg-obsidian-900 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-colors overflow-hidden shadow-sm dark:shadow-none h-full"
                                >
                                    {/* Subtle gradient hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <h3 className="text-xl font-bold text-foreground dark:text-white mb-6 font-sans relative z-10">
                                        {skillGroup.category_name}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 relative z-10">
                                        {skillGroup.items.map((item, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 group-hover:border-emerald-500/50 dark:group-hover:border-emerald-500/30 transition-colors duration-300"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </Tilt>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
