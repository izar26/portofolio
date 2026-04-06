"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Tilt from "react-parallax-tilt";

interface Project {
    id: number;
    title: string;
    description: string;
    image_url: string;
    tags: string[];
    live_url: string;
    github_url: string;
}

export function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/projects")
            .then(res => res.json())
            .then(json => {
                if (json.success) setProjects(json.data);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    // Hindari render loncat-loncat saat loading awal
    if (isLoading && projects.length === 0) return null;

    return (
        <section id="projects" className="relative py-24 md:py-32">
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
                            Proyek Unggulan
                            <span className="w-12 h-1 bg-emerald-500 rounded-full mt-4 self-center md:self-start"></span>
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-4 max-w-2xl text-lg">
                            Pilihan beberapa karya terbaru yang saya banggakan.
                        </p>
                    </div>

                    {/* Project List */}
                    <div className="flex flex-col gap-16 md:gap-24 mt-8">
                        {projects.map((project, idx) => (
                            <div
                                key={project.id}
                                className={`flex flex-col gap-8 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                                    } items-center`}
                            >
                                {/* Image Area */}
                                <motion.div
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                    className="w-full md:w-3/5 relative z-10"
                                >
                                    <Tilt
                                        tiltMaxAngleX={8}
                                        tiltMaxAngleY={8}
                                        perspective={1000}
                                        transitionSpeed={1500}
                                        scale={1.02}
                                        gyroscope={true}
                                        className="group relative rounded-2xl overflow-hidden aspect-video border border-transparent dark:border-white/10 shadow-2xl"
                                    >
                                        <div className="absolute inset-0 bg-emerald-500/20 mix-blend-overlay group-hover:bg-transparent transition-colors duration-500 z-10" />
                                        <img
                                            src={project.image_url}
                                            alt={project.title}
                                            className="object-cover w-full h-full transform transition-transform duration-700 ease-out"
                                        />
                                    </Tilt>
                                </motion.div>

                                {/* Content Area */}
                                <motion.div
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className={`w-full md:w-2/5 flex flex-col ${idx % 2 !== 0 ? 'md:items-start md:text-left' : 'md:items-end md:text-right'
                                        }`}
                                >
                                    <span className="text-emerald-400 font-sans font-medium mb-2 tracking-wide text-sm">Proyek Pilihan</span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-6 font-sans">
                                        {project.title}
                                    </h3>

                                    <div className="bg-white/80 dark:bg-obsidian-900/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-xl md:-ml-12 md:mr-0 z-20 relative">
                                        <p className="text-zinc-700 dark:text-zinc-300 font-body leading-relaxed text-left">
                                            {project.description}
                                        </p>
                                    </div>

                                    <ul className={`flex flex-wrap gap-x-4 gap-y-2 mt-6 text-sm text-zinc-600 dark:text-zinc-400 font-mono ${idx % 2 !== 0 ? 'justify-start' : 'md:justify-end justify-start'
                                        }`}>
                                        {project.tags.map((tag, i) => (
                                            <li key={i}>{tag}</li>
                                        ))}
                                    </ul>

                                    <div className={`flex items-center gap-4 mt-8 ${idx % 2 !== 0 ? 'justify-start' : 'md:justify-end justify-start'
                                        }`}>
                                        {project.github_url && (
                                            <a href={project.github_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-emerald-400 transition-colors p-2 hover:bg-white/5 rounded-full">
                                                <Github size={22} />
                                            </a>
                                        )}
                                        {project.live_url && (
                                            <a href={project.live_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-emerald-400 transition-colors p-2 hover:bg-white/5 rounded-full">
                                                <ExternalLink size={22} />
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
