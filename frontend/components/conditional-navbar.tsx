"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";

export default function ConditionalNavbar() {
    const pathname = usePathname();
    // Don't show global navbar on admin pages, auth pages, or exam pages
    if (
        pathname?.startsWith("/admin") ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname?.includes("/exam/") // Hide on all exam pages
    ) {
        return null;
    }
    return <Navbar />;
}
