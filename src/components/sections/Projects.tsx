"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Tilt from "react-parallax-tilt";

interface ProjectMedia {
    id: number;
    media_type: 'image' | 'youtube';
    media_url: string;
}

interface Project {
    id: number;
    title: string;
    description: string;
    image_url: string;
    tags: string[];
    live_url: string;
    github_url: string;
    media?: ProjectMedia[];
}

export function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

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
                                        
                                        {/* Overlay Hover Info */}
                                        <div 
                                            onClick={() => { setSelectedProject(project); setActiveMediaIndex(0); }}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center backdrop-blur-sm cursor-pointer"
                                        >
                                            <span className="px-6 py-3 bg-emerald-500 text-white font-semibold font-sans rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                                                Lihat Detail
                                            </span>
                                        </div>
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

            {/* Project Details Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
                        onClick={() => setSelectedProject(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-white dark:bg-obsidian-900 w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-full text-zinc-600 dark:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            {/* Left Side: Media Gallery */}
                            <div className="w-full lg:w-3/5 bg-zinc-100 dark:bg-black relative flex flex-col">
                                {(() => {
                                    // Combine main image with additional media
                                    const allMedia = [
                                        { type: 'image', url: selectedProject.image_url },
                                        ...(selectedProject.media || []).map(m => ({ type: m.media_type, url: m.media_url }))
                                    ];
                                    
                                    const currentMedia = allMedia[activeMediaIndex];

                                    return (
                                        <>
                                            {/* Main Viewer */}
                                            <div className="relative aspect-video lg:aspect-auto lg:flex-1 bg-black overflow-hidden flex items-center justify-center">
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={activeMediaIndex}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="w-full h-full"
                                                    >
                                                        {currentMedia.type === 'image' ? (
                                                            <img src={currentMedia.url} alt="Project Media" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <iframe src={currentMedia.url} allowFullScreen className="w-full h-full border-0" />
                                                        )}
                                                    </motion.div>
                                                </AnimatePresence>

                                                {/* Navigation Arrows */}
                                                {allMedia.length > 1 && (
                                                    <>
                                                        <button 
                                                            onClick={() => setActiveMediaIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1))}
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-emerald-500 text-white rounded-full backdrop-blur-sm transition-colors"
                                                        >
                                                            <ChevronLeft size={24} />
                                                        </button>
                                                        <button 
                                                            onClick={() => setActiveMediaIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1))}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-emerald-500 text-white rounded-full backdrop-blur-sm transition-colors"
                                                        >
                                                            <ChevronRight size={24} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Thumbnail Strip */}
                                            {allMedia.length > 1 && (
                                                <div className="h-24 bg-zinc-900 border-t border-white/10 p-4 flex gap-3 overflow-x-auto overflow-y-hidden snap-x hide-scrollbar">
                                                    {allMedia.map((media, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setActiveMediaIndex(idx)}
                                                            className={`shrink-0 h-full aspect-video rounded-lg overflow-hidden border-2 transition-all relative snap-center ${activeMediaIndex === idx ? 'border-emerald-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                        >
                                                            {media.type === 'image' ? (
                                                                <img src={media.url} alt="Thumbnail" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                                                    <Play className="text-white opacity-70" size={20} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Right Side: Info */}
                            <div className="w-full lg:w-2/5 p-8 lg:p-10 flex flex-col max-h-[50vh] lg:max-h-none overflow-y-auto custom-scrollbar">
                                <span className="text-emerald-500 font-sans font-semibold mb-2 tracking-wide text-sm uppercase">Detail Proyek</span>
                                <h3 className="text-3xl font-bold text-foreground dark:text-white mb-6 font-sans leading-tight">
                                    {selectedProject.title}
                                </h3>

                                <div className="prose prose-sm dark:prose-invert text-zinc-600 dark:text-zinc-300 font-body leading-relaxed mb-8">
                                    <p className="whitespace-pre-wrap">{selectedProject.description}</p>
                                </div>

                                <div className="mt-auto">
                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Teknologi</h4>
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {selectedProject.tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 pt-6 border-t border-zinc-200 dark:border-white/10">
                                        {selectedProject.live_url && (
                                            <a href={selectedProject.live_url} target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-500/20">
                                                <ExternalLink size={18} /> Live Preview
                                            </a>
                                        )}
                                        {selectedProject.github_url && (
                                            <a href={selectedProject.github_url} target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-xl font-semibold transition-colors">
                                                <Github size={18} /> Source Code
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
