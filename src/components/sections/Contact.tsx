"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContactSettings {
    email: string;
    phone: string;
    location: string;
}

export function Contact() {
    const [settings, setSettings] = useState<ContactSettings>({
        email: "Memuat...",
        phone: "Memuat...",
        location: "Memuat...",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/contact-settings")
            .then(res => res.json())
            .then(json => {
                if (json.success && json.data.email) {
                    setSettings(json.data);
                }
            })
            .catch(err => console.error("Failed to load contact settings:", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !subject || !message) {
            return toast.error("Harap isi semua kolom formulir.");
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message }),
            });

            const json = await res.json();

            if (json.success) {
                toast.success("Pesan terkirim!", {
                    description: "Terima kasih telah menghubungi saya. Saya akan membalas pesan Anda secepatnya.",
                    duration: 5000,
                });
                // Reset form
                setName("");
                setEmail("");
                setSubject("");
                setMessage("");
            } else {
                toast.error(json.message || "Gagal mengirim pesan.");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan. Coba lagi nanti.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="relative py-24 md:py-32">
            <div className="container px-6 mx-auto max-w-6xl">
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
                            Hubungi Saya
                            <span className="w-12 h-1 bg-emerald-500 rounded-full mt-4 self-center"></span>
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-4 max-w-2xl mx-auto text-lg">
                            Punya pertanyaan atau ingin bekerja sama? Tinggalkan rincian Anda dan saya akan segera membalasnya.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
                        {/* Contact Info */}
                        <div className="flex flex-col gap-8">
                            <h3 className="text-2xl font-bold text-foreground dark:text-white font-sans mb-4">Informasi Kontak</h3>

                            <div className="flex flex-col gap-6">
                                {[
                                    { icon: <Mail className="text-emerald-500 dark:text-emerald-400" size={24} />, title: "Email", info: settings.email },
                                    { icon: <Phone className="text-emerald-500 dark:text-emerald-400" size={24} />, title: "Telepon", info: settings.phone },
                                    { icon: <MapPin className="text-emerald-500 dark:text-emerald-400" size={24} />, title: "Lokasi", info: settings.location },
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="p-3 rounded-xl bg-white dark:bg-obsidian-800 border border-zinc-200 dark:border-white/5 group-hover:border-emerald-500/30 transition-colors shadow-sm dark:shadow-none">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-zinc-500 dark:text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">{item.title}</h4>
                                            <p className="text-foreground dark:text-white text-lg font-medium">{item.info}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/50 dark:bg-obsidian-800/50 backdrop-blur-sm p-8 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-xl dark:shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />

                            <form className="relative z-10 flex flex-col gap-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="name" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Nama</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="bg-zinc-50/80 dark:bg-obsidian-900/80 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="email" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="bg-zinc-50/80 dark:bg-obsidian-900/80 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="subject" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Subjek</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Pertanyaan tentang proyek..."
                                        className="bg-zinc-50/80 dark:bg-obsidian-900/80 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="message" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Pesan</label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Halo, saya ingin mendiskusikan..."
                                        className="bg-zinc-50/80 dark:bg-obsidian-900/80 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-2 group relative inline-flex items-center justify-center overflow-hidden rounded-xl p-px font-medium text-sm shadow-xl w-full disabled:opacity-70"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    <span className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 rounded-xl group-hover:bg-opacity-0 transition-all duration-300 w-full">
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin text-white" size={20} />
                                        ) : (
                                            <span className="text-white font-bold tracking-wide text-base">Kirim Pesan</span>
                                        )}
                                    </span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
