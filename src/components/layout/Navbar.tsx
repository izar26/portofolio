"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
    { name: "Beranda", href: "#home" },
    { name: "Tentang", href: "#about" },
    { name: "Keahlian", href: "#skills" },
    { name: "Proyek", href: "#projects" },
    { name: "Pengalaman", href: "#experience" },
];

function Magnet({ children }: { children: React.ReactNode }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = e.currentTarget.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            style={{ position: "relative" }}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
        >
            {children}
        </motion.div>
    );
}

const mobileMenuVars: Variants = {
    initial: { opacity: 0, height: 0 },
    animate: {
        opacity: 1,
        height: "auto",
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    },
    exit: { opacity: 0, height: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

const mobileLinkVars: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, x: -20 }
};

export function Navbar() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [active, setActive] = useState("Beranda");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }

        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
            setMobileMenuOpen(false); // Close mobile menu on scroll down
        } else {
            setHidden(false);
        }
    });

    // Scroll Spy Logic
    useEffect(() => {
        const handleScroll = () => {
            // Get all sections
            const sectionElements = navItems
                .map((item) => {
                    const id = item.href.replace("#", "");
                    return document.getElementById(id);
                })
                .filter(Boolean) as HTMLElement[];

            // Find the current section in view
            // Add a small offset (e.g., 200px) so it triggers slightly before hitting the exact top
            const scrollPosition = window.scrollY + 200;

            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const section = sectionElements[i];
                if (section.offsetTop <= scrollPosition) {
                    setActive(navItems[i].name);
                    break;
                }
            }
        };

        // Add event listener
        window.addEventListener("scroll", handleScroll);

        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <motion.header
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={cn(
                "fixed left-0 right-0 z-50 mx-auto transition-all duration-500 ease-out",
                isScrolled
                    ? "top-4 w-[90%] md:w-[65%] max-w-3xl glass px-4 py-2 rounded-full border border-white/10 dark:border-white/5 shadow-lg"
                    : "top-6 w-[95%] md:w-[75%] max-w-4xl glass px-6 py-4 rounded-full border border-transparent shadow-md"
            )}
        >
            <nav className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <span className="font-sans text-xl font-bold tracking-tighter text-foreground">
                        NN<span className="text-emerald-500">.</span>
                    </span>
                </div>

                {/* Desktop Links */}
                <ul className="hidden md:flex items-center gap-1 relative">
                    {navItems.map((item) => (
                        <li key={item.name} className="relative">
                            <Magnet>
                                <a
                                    href={item.href}
                                    onClick={() => setActive(item.name)}
                                    className={cn(
                                        "relative px-4 py-2 text-sm font-medium transition-colors z-10 block",
                                        active === item.name ? "text-foreground dark:text-white" : "text-zinc-600 hover:text-foreground dark:text-zinc-400 dark:hover:text-white"
                                    )}
                                >
                                    {item.name}
                                </a>
                            </Magnet>
                            {/* Active Pill Animation */}
                            {active === item.name && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-full -z-0"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </li>
                    ))}
                </ul>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />
                    <Magnet>
                        <a
                            href="#contact"
                            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-px font-medium text-sm shadow-xl"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <span className="relative flex items-center gap-2 bg-white dark:bg-obsidian-900 px-6 py-2 rounded-full border border-zinc-200 dark:border-white/10 group-hover:bg-zinc-50 dark:group-hover:bg-obsidian-800 transition-all duration-300">
                                <span className="text-foreground dark:text-white group-hover:text-foreground dark:group-hover:text-white transition-colors font-semibold">Mari Diskusi</span>
                            </span>
                        </a>
                    </Magnet>
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        className="text-zinc-600 dark:text-zinc-300 hover:text-foreground dark:hover:text-white p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        variants={mobileMenuVars}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="md:hidden overflow-hidden mt-4 bg-white/95 dark:bg-obsidian-800/80 rounded-2xl border border-zinc-200 dark:border-white/5 backdrop-blur-xl"
                    >
                        <ul className="flex flex-col py-4 px-2 tracking-tight">
                            {navItems.map((item) => (
                                <motion.li variants={mobileLinkVars} key={item.name}>
                                    <a
                                        href={item.href}
                                        onClick={() => {
                                            setActive(item.name);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={cn(
                                            "block px-4 py-3 text-sm font-semibold transition-colors rounded-lg",
                                            active === item.name
                                                ? "bg-zinc-100 dark:bg-white/10 text-foreground dark:text-white"
                                                : "text-zinc-600 dark:text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        {item.name}
                                    </a>
                                </motion.li>
                            ))}
                            <motion.li variants={mobileLinkVars} className="mt-4 px-4">
                                <a
                                    href="#contact"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex w-full justify-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md"
                                >
                                    Mari Diskusi
                                </a>
                            </motion.li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
