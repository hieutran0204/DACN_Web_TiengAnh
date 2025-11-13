"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                E
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">English Hub</h1>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="tests"
              className="text-foreground hover:text-primary transition">
              Tests
            </Link>
            <Link
              href="skills"
              className="text-foreground hover:text-primary transition">
              Skills
            </Link>
            <Link
              href="vocabulary"
              className="text-foreground hover:text-primary transition">
              Vocabulary
            </Link>
            <Link
              href="articles"
              className="text-foreground hover:text-primary transition">
              Articles
            </Link>
            <Link
              href="games"
              className="text-foreground hover:text-primary transition">
              Games
            </Link>
          </div>

          <Button
            asChild
            className="bg-primary hover:bg-accent text-primary-foreground">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
