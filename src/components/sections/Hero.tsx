"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};

export function Hero() {
    const [cvUrl, setCvUrl] = useState<string>("/resume.pdf");

    useEffect(() => {
        fetch("/api/about")
            .then(res => res.json())
            .then(json => {
                if (json.success && json.data?.cv_url) {
                    setCvUrl(json.data.cv_url);
                }
            })
            .catch(console.error);
    }, []);

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 bg-background">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-teal-500/10 blur-[90px] rounded-full pointer-events-none" />
            </div>

            <div className="container relative z-10 px-6 mx-auto max-w-5xl">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center"
                >
                    {/* Badge */}
                    <motion.div variants={itemVariants} className="mb-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-zinc-100 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Terbuka untuk Peluang Baru
                        </span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold font-sans tracking-tighter mb-6 leading-tight"
                    >
                        Menciptakan <br className="hidden md:block" />
                        Pengalaman <span className="text-gradient">Digital.</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed font-body"
                    >
                        Saya membangun pengalaman digital yang luar biasa dan dapat diakses untuk web.
                        Berfokus pada rekayasa <span className="font-medium text-emerald-500">pixel-perfect</span>, animasi yang mulus, dan arsitektur yang kuat.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
                        <a
                            href="#projects"
                            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-px font-medium text-sm shadow-xl w-full sm:w-auto"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-100 transition-opacity duration-300"></span>
                            <span className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 rounded-full group-hover:bg-opacity-0 transition-all duration-300 w-full">
                                <span className="text-white font-semibold">Lihat Proyek</span>
                                <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                            </span>
                        </a>

                        <a
                            href={cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium text-sm shadow-xl w-full sm:w-auto"
                        >
                            <span className="relative flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 dark:hover:bg-obsidian-800 px-8 py-3 rounded-full transition-all duration-300 w-full">
                                <span className="text-zinc-700 dark:text-zinc-300 group-hover:text-foreground dark:group-hover:text-white transition-colors font-semibold">Unduh CV</span>
                                <Download size={18} className="text-zinc-500 dark:text-zinc-400 group-hover:text-foreground dark:group-hover:text-white transition-colors" />
                            </span>
                        </a>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium font-sans">Gulir</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-zinc-500 to-transparent" />
            </motion.div>
        </section>
    );
}
