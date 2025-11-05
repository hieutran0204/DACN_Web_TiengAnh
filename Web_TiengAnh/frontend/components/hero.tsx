"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background pt-20 pb-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-balance">
              Master <span className="text-primary">English</span> Today
            </h1>
            <p className="text-xl text-foreground/70 text-balance max-w-2xl mx-auto">
              Learn English skills through interactive lessons and curated articles. Build your confidence step by step
              with our structured curriculum.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/skills">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                Start Learning Now
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="px-8 border-primary/20 hover:border-primary/40 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-primary/10">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary">50+</p>
              <p className="text-sm text-foreground/60">Skill Levels</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary">200+</p>
              <p className="text-sm text-foreground/60">Articles</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary">10K+</p>
              <p className="text-sm text-foreground/60">Active Learners</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
