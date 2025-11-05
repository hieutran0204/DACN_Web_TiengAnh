"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-lg text-foreground">EnglishMastery</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground/70 hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/skills" className="text-foreground/70 hover:text-primary transition-colors font-medium">
              Skills
            </Link>
            <Link href="/articles" className="text-foreground/70 hover:text-primary transition-colors font-medium">
              Articles
            </Link>
            <Link href="/vocabulary" className="text-foreground/70 hover:text-primary transition-colors font-medium">
              Vocabulary
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden sm:flex bg-transparent">
              Sign In
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Start Free</Button>
          </div>
        </div>
      </div>
    </header>
  )
}
