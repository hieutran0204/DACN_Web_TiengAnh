"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footer";

export default function ConditionalFooter() {
    const pathname = usePathname();
    // Don't show global footer on admin pages, auth pages, or exam pages
    if (
        pathname?.startsWith("/admin") ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname?.includes("/exam/")
    ) {
        return null;
    }
    return <Footer />;
}
