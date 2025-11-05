"use client"
import Header from "@/components/header"
import Hero from "@/components/hero"
import SkillsSection from "@/components/skills-section"
import ArticlesSection from "@/components/articles-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <SkillsSection />
      <ArticlesSection />
      <Footer />
    </main>
  )
}
