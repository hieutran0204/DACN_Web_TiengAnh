"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";

export default function ConditionalNavbar() {
    const pathname = usePathname();
    // Don't show global navbar on admin pages or auth pages
    if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
        return null;
    }
    return <Navbar />;
}
