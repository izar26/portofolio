"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Save, Loader2, MessageSquare, Trash2, Check, CheckCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ContactSettings {
    email: string;
    phone: string;
    location: string;
}

interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: number; // MySQL tinyint
    created_at: string;
}

export default function ContactDashboard() {
    const [activeTab, setActiveTab] = useState<"settings" | "inbox">("settings");

    // Settings State
    const [settings, setSettings] = useState<ContactSettings>({ email: "", phone: "", location: "" });
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Inbox State
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    // Fetch Settings
    const fetchSettings = async () => {
        setIsLoadingSettings(true);
        try {
            const res = await fetch("/api/contact-settings");
            const json = await res.json();
            if (json.success) {
                setSettings(json.data);
            }
        } catch {
            toast.error("Gagal memuat pengaturan kontak.");
        } finally {
            setIsLoadingSettings(false);
        }
    };

    // Fetch Messages
    const fetchMessages = async () => {
        setIsLoadingMessages(true);
        try {
            const res = await fetch("/api/messages");
            const json = await res.json();
            if (json.success) {
                setMessages(json.data);
            }
        } catch {
            toast.error("Gagal memuat kotak masuk.");
        } finally {
            setIsLoadingMessages(false);
        }
    };

    useEffect(() => {
        if (activeTab === "settings") {
            fetchSettings();
        } else {
            fetchMessages();
        }
    }, [activeTab]);

    // Save Settings
    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings.email || !settings.phone || !settings.location) {
            return toast.error("Semua field kontak wajib diisi.");
        }

        setIsSavingSettings(true);
        try {
            const res = await fetch("/api/contact-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const json = await res.json();
            if (json.success) {
                toast.success("Pengaturan kontak berhasil disimpan!");
            } else {
                toast.error(json.message || "Gagal menyimpan.");
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan.");
        } finally {
            setIsSavingSettings(false);
        }
    };

    // Mark Message as Read
    const handleMarkAsRead = async (message: Message, markRead: boolean) => {
        try {
            const res = await fetch("/api/messages", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: message.id, is_read: markRead }),
            });

            if (res.ok) {
                setMessages(messages.map(m => m.id === message.id ? { ...m, is_read: markRead ? 1 : 0 } : m));
                if (selectedMessage && selectedMessage.id === message.id) {
                    setSelectedMessage({ ...selectedMessage, is_read: markRead ? 1 : 0 });
                }
            }
        } catch {
            toast.error("Gagal mengubah status pesan.");
        }
    };

    // Select Message opens modal & marks as read
    const handleOpenMessage = (message: Message) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            handleMarkAsRead(message, true);
        }
    };

    // Delete Message
    const handleDeleteMessage = async (id: number) => {
        if (!confirm("Yakin ingin menghapus pesan ini?")) return;

        try {
            const res = await fetch(`/api/messages?id=${id}`, { method: "DELETE" });
            const json = await res.json();

            if (json.success) {
                toast.success("Pesan dihapus.");
                setMessages(messages.filter(m => m.id !== id));
                if (selectedMessage?.id === id) setSelectedMessage(null);
            } else {
                toast.error(json.message || "Gagal menghapus pesan.");
            }
        } catch {
            toast.error("Terjadi kesalahan sistem.");
        }
    };

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <div className="pb-12 h-auto min-h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-sans tracking-tight">Hubungi Saya</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body mt-1">
                        Atur informasi kontak Anda dan baca pesan dari pengunjung.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-obsidian-800 p-1.5 rounded-xl border border-zinc-200 dark:border-white/5">
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === "settings"
                                ? "bg-white dark:bg-obsidian-900 shadow-sm text-emerald-600 dark:text-emerald-400"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/5"
                            }`}
                    >
                        <Save size={16} /> Pengaturan
                    </button>
                    <button
                        onClick={() => setActiveTab("inbox")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === "inbox"
                                ? "bg-white dark:bg-obsidian-900 shadow-sm text-emerald-600 dark:text-emerald-400"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/5"
                            }`}
                    >
                        <MessageSquare size={16} /> Kotak Masuk
                        {unreadCount > 0 && (
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1">
                {activeTab === "settings" ? (
                    /* --- TAB PENGATURAN KONTAK --- */
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl bg-white dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 md:p-8"
                    >
                        <div className="mb-6 border-b border-zinc-100 dark:border-white/5 pb-6">
                            <h3 className="text-lg font-bold font-sans">Informasi Kontak Publik</h3>
                            <p className="text-sm text-zinc-500 font-body mt-1">
                                Data ini akan ditampilkan secara publik di halaman utama Anda.
                            </p>
                        </div>

                        {isLoadingSettings ? (
                            <div className="flex items-center justify-center p-8 text-emerald-500">
                                <Loader2 className="animate-spin" size={24} />
                            </div>
                        ) : (
                            <form onSubmit={handleSaveSettings} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-1.5">
                                        <Mail size={16} /> Alamat Email
                                    </label>
                                    <input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        placeholder="nama@email.com"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-1.5">
                                        <Phone size={16} /> Nomor Telepon / WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.phone}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        placeholder="+62 812 3456 7890"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2 font-sans flex items-center gap-1.5">
                                        <MapPin size={16} /> Lokasi / Domisili
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.location}
                                        onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                                        placeholder="Jakarta, Indonesia"
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-obsidian-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-body focus:ring-2 focus:ring-emerald-500/40"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSavingSettings}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                ) : (
                    /* --- TAB KOTAK MASUK (INBOX) --- */
                    <motion.div
                        key="inbox"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full"
                    >
                        {isLoadingMessages ? (
                            <div className="flex flex-col items-center justify-center p-12 text-emerald-500">
                                <Loader2 className="animate-spin mb-2" size={32} />
                                <span className="text-zinc-500 text-sm">Memuat pesan masuk...</span>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border-dashed border-zinc-300 dark:border-white/10">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-obsidian-800 flex items-center justify-center mb-4 text-emerald-500/50">
                                    <CheckCheck size={32} />
                                </div>
                                <h3 className="text-lg font-bold font-sans mb-2">Inbox Bersih!</h3>
                                <p className="text-zinc-500 font-body max-w-sm">
                                    Belum ada pesan masuk dari pengunjung website Anda.
                                </p>
                                <button onClick={fetchMessages} className="mt-6 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-500">
                                    <RefreshCw size={14} /> Refresh
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-obsidian-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[500px]">

                                {/* Message List Sidebar */}
                                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-obsidian-800/20 max-h-[300px] md:max-h-none overflow-y-auto">
                                    {messages.map((msg) => (
                                        <button
                                            key={msg.id}
                                            onClick={() => handleOpenMessage(msg)}
                                            className={`w-full text-left p-4 border-b border-zinc-100 dark:border-white/5 transition-colors group relative ${selectedMessage?.id === msg.id
                                                    ? "bg-emerald-50/50 dark:bg-emerald-500/10"
                                                    : "hover:bg-zinc-100 dark:hover:bg-obsidian-800"
                                                }`}
                                        >
                                            {!msg.is_read && (
                                                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                                            )}
                                            <div className="flex items-center justify-between mb-1 pr-4">
                                                <div className={`font-sans font-bold text-sm truncate ${!msg.is_read ? "text-foreground dark:text-white" : "text-zinc-600 dark:text-zinc-400"}`}>
                                                    {msg.name}
                                                </div>
                                                <div className="text-xs text-zinc-400 font-mono shrink-0">
                                                    {new Date(msg.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                            <div className={`text-sm truncate mb-1 ${!msg.is_read ? "font-semibold text-zinc-800 dark:text-zinc-200" : "text-zinc-600 dark:text-zinc-400"}`}>
                                                {msg.subject}
                                            </div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-500 truncate font-body">
                                                {msg.message}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Message View Area */}
                                <div className="flex-1 min-h-[400px] bg-white dark:bg-obsidian-900 overflow-y-auto flex flex-col">
                                    {selectedMessage ? (
                                        <div className="p-6 md:p-8 flex flex-col h-full">
                                            <div className="flex items-start justify-between border-b border-zinc-100 dark:border-white/5 pb-6 mb-6">
                                                <div className="flex-1">
                                                    <h2 className="text-2xl font-bold font-sans mb-4">{selectedMessage.subject}</h2>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-lg">
                                                                {selectedMessage.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-sm">{selectedMessage.name}</div>
                                                                <a href={`mailto:${selectedMessage.email}`} className="text-emerald-600 dark:text-emerald-400 text-xs hover:underline">
                                                                    {selectedMessage.email}
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-zinc-400 font-mono text-right">
                                                            {new Date(selectedMessage.created_at).toLocaleString("id-ID", {
                                                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto">
                                                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed whitespace-pre-wrap font-body text-zinc-700 dark:text-zinc-300">
                                                    {selectedMessage.message}
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                                                <button
                                                    onClick={() => handleMarkAsRead(selectedMessage, !selectedMessage.is_read)}
                                                    className="text-sm font-medium text-zinc-500 hover:text-emerald-600 transition-colors flex items-center gap-2"
                                                >
                                                    {selectedMessage.is_read ? (
                                                        <><Mail size={16} /> Tandai Belum Dibaca</>
                                                    ) : (
                                                        <><Check size={16} /> Tandai Sudah Dibaca</>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 size={16} /> Hapus Pesan
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-12 text-center">
                                            <MessageSquare size={48} className="mb-4 opacity-20" />
                                            <p className="font-medium">Pilih pesan untuk dibaca</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
