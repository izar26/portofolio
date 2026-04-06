import { Navbar } from "@/components/layout/Navbar";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { BackToTop } from "@/components/ui/BackToTop";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <LoadingScreen />
            <ScrollProgress />
            <CustomCursor />
            <Navbar />
            {children}
            <BackToTop />
        </>
    );
}
