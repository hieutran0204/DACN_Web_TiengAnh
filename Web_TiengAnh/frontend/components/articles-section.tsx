"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const ARTICLES = [
  {
    id: 1,
    title: "Understanding English Phrasal Verbs",
    excerpt:
      "Learn the most common phrasal verbs used in everyday English conversations and how to use them correctly.",
    category: "Grammar",
    readTime: 8,
    difficulty: "Intermediate",
    date: "2024-11-20",
  },
  {
    id: 2,
    title: "Common Mistakes English Learners Make",
    excerpt: "Discover the top 10 mistakes that non-native English speakers often make and how to avoid them.",
    category: "Tips & Tricks",
    readTime: 6,
    difficulty: "Beginner",
    date: "2024-11-18",
  },
  {
    id: 3,
    title: "Improving Your English Speaking Fluency",
    excerpt: "Practical strategies to boost your confidence and fluency when speaking English with native speakers.",
    category: "Speaking",
    readTime: 10,
    difficulty: "Intermediate",
    date: "2024-11-15",
  },
  {
    id: 4,
    title: "Business English Email Writing Guide",
    excerpt: "Master the art of writing professional emails in English with clear structure and appropriate tone.",
    category: "Business",
    readTime: 12,
    difficulty: "Advanced",
    date: "2024-11-12",
  },
]

export default function ArticlesSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">Latest Articles</h2>
            <p className="text-lg text-foreground/60">Read curated content to enhance your learning</p>
          </div>
          <Link href="/articles" className="hidden md:flex">
            <Button
              variant="outline"
              className="border-primary/20 hover:border-primary/40 text-primary hover:text-primary bg-transparent"
            >
              View All Articles →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARTICLES.map((article) => (
            <Card
              key={article.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {article.category}
                  </span>
                  <span className="text-xs text-foreground/50">{article.difficulty}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-foreground/70 line-clamp-2">{article.excerpt}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                  <div className="flex items-center gap-4 text-sm text-foreground/60">
                    <span>{article.readTime} min read</span>
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                    Read →
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex md:hidden">
          <Link href="/articles" className="w-full">
            <Button
              variant="outline"
              className="w-full border-primary/20 hover:border-primary/40 text-primary hover:text-primary bg-transparent"
            >
              View All Articles →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
