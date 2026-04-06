import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login — Portofolio Admin",
    description: "Halaman login admin portofolio.",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
