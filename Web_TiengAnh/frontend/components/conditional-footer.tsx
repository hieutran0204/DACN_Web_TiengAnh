"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footer";

export default function ConditionalFooter() {
    const pathname = usePathname();
    // Don't show global footer on admin pages or auth pages
    if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
        return null;
    }
    return <Footer />;
}
