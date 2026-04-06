import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export const metadata: Metadata = {
    title: "Dashboard — Portofolio Admin",
    description: "Panel admin portofolio.",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar - hidden on mobile, fixed width on desktop */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <Header />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
                    <div className="max-w-6xl mx-auto h-full w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
