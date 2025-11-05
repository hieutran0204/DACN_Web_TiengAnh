"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"

const SKILLS = [
  {
    id: 1,
    title: "Grammar Basics",
    description: "Master fundamental grammar rules and sentence structures",
    lessons: 12,
    difficulty: "Beginner",
    color: "bg-primary",
  },
  {
    id: 2,
    title: "Vocabulary Building",
    description: "Expand your vocabulary across different topics and contexts",
    lessons: 18,
    difficulty: "Intermediate",
    color: "bg-accent",
  },
  {
    id: 3,
    title: "Business English",
    description: "Learn professional communication and business terminology",
    lessons: 15,
    difficulty: "Advanced",
    color: "bg-primary/80",
  },
  {
    id: 4,
    title: "Pronunciation",
    description: "Perfect your accent and improve spoken English skills",
    lessons: 10,
    difficulty: "Beginner",
    color: "bg-accent/80",
  },
  {
    id: 5,
    title: "Writing Skills",
    description: "Write clear, concise, and professional English documents",
    lessons: 14,
    difficulty: "Intermediate",
    color: "bg-primary/70",
  },
  {
    id: 6,
    title: "Listening Comprehension",
    description: "Understand native speakers and improve listening abilities",
    lessons: 16,
    difficulty: "Intermediate",
    color: "bg-accent/70",
  },
]

export default function SkillsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-5xl font-bold text-foreground">Learning Skills</h1>
            <p className="text-lg text-foreground/60">
              Choose your skill level and master English with structured lessons
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SKILLS.map((skill) => (
              <Card
                key={skill.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30"
              >
                <div className={`h-2 ${skill.color}`} />

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {skill.title}
                    </h3>
                    <p className="text-sm text-foreground/60">{skill.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                    <div className="space-y-1">
                      <p className="text-sm text-foreground/60">
                        <span className="font-semibold text-foreground">{skill.lessons}</span> lessons
                      </p>
                      <p className="text-xs text-primary font-medium">{skill.difficulty}</p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Learn</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
