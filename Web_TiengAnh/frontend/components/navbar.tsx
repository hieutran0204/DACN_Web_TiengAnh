"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import styles from "../styles/navbar.module.css";

const navLinks = [
  { href: "/tests", label: "Đề thi" },
  { href: "/skills", label: "Kỹ năng" },
  { href: "/vocabulary", label: "Từ vựng" },
  { href: "/articles", label: "Bài viết" },
  { href: "/games", label: "Games" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                T
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              <Link href="/">TestKiller</Link>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  // 2. Áp dụng class từ CSS Module
                  className={`
                    ${styles.navLink}
                    ${isActive ? styles.active : ""}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <Button
            asChild
            className="bg-primary hover:bg-accent text-primary-foreground"
          >
            <Link href="/login">Đăng nhập</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
