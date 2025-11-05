"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"

const VOCABULARY_SETS = [
  {
    id: 1,
    title: "Business Vocabulary",
    description: "Essential words and phrases for professional environments",
    words: 45,
    difficulty: "Intermediate",
    color: "from-primary/80 to-primary/60",
  },
  {
    id: 2,
    title: "Daily Conversations",
    description: "Common words used in everyday English conversations",
    words: 60,
    difficulty: "Beginner",
    color: "from-accent/80 to-accent/60",
  },
  {
    id: 3,
    title: "Academic Vocabulary",
    description: "Advanced words for academic writing and discussions",
    words: 55,
    difficulty: "Advanced",
    color: "from-primary/70 to-primary/50",
  },
  {
    id: 4,
    title: "Phrasal Verbs Mastery",
    description: "Complete guide to common phrasal verbs in English",
    words: 40,
    difficulty: "Intermediate",
    color: "from-accent/70 to-accent/50",
  },
  {
    id: 5,
    title: "Travel & Tourism",
    description: "Useful vocabulary for traveling and tourism situations",
    words: 35,
    difficulty: "Beginner",
    color: "from-primary/75 to-primary/55",
  },
  {
    id: 6,
    title: "Technical English",
    description: "Specialized vocabulary for technical and IT discussions",
    words: 50,
    difficulty: "Advanced",
    color: "from-accent/75 to-accent/55",
  },
]

export default function VocabularyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-5xl font-bold text-foreground">Vocabulary Sets</h1>
            <p className="text-lg text-foreground/60">Build your vocabulary with themed word sets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VOCABULARY_SETS.map((vocab) => (
              <Card
                key={vocab.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30"
              >
                <div className={`h-24 bg-gradient-to-br ${vocab.color} opacity-90`} />

                <div className="p-6 space-y-4 -mt-8 relative">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {vocab.title}
                    </h3>
                    <p className="text-sm text-foreground/60">{vocab.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                    <div className="space-y-1">
                      <p className="text-sm text-foreground/60">
                        <span className="font-semibold text-foreground">{vocab.words}</span> words
                      </p>
                      <p className="text-xs text-primary font-medium">{vocab.difficulty}</p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Study</Button>
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
