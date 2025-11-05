"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"

const ARTICLES = [
  {
    id: 1,
    title: "10 Common English Mistakes and How to Avoid Them",
    category: "Grammar",
    readTime: "8 min",
    difficulty: "Beginner",
    excerpt: "Learn about the most common English mistakes made by learners and tips to avoid them.",
  },
  {
    id: 2,
    title: "Advanced Vocabulary for Professional Settings",
    category: "Vocabulary",
    readTime: "12 min",
    difficulty: "Advanced",
    excerpt: "Master sophisticated vocabulary used in business and professional environments.",
  },
  {
    id: 3,
    title: "British vs American English: Key Differences",
    category: "Culture",
    readTime: "10 min",
    difficulty: "Intermediate",
    excerpt: "Discover the main differences between British and American English pronunciations and spellings.",
  },
  {
    id: 4,
    title: "Phrasal Verbs Explained: Common Expressions",
    category: "Grammar",
    readTime: "15 min",
    difficulty: "Intermediate",
    excerpt: "Understand and master the use of phrasal verbs in everyday English conversation.",
  },
  {
    id: 5,
    title: "Writing Effective Business Emails",
    category: "Writing",
    readTime: "9 min",
    difficulty: "Intermediate",
    excerpt: "Learn the structure and tone needed to write professional and effective business emails.",
  },
  {
    id: 6,
    title: "Idioms and Expressions You Need to Know",
    category: "Vocabulary",
    readTime: "11 min",
    difficulty: "Advanced",
    excerpt: "Explore popular English idioms and expressions to sound more natural when speaking.",
  },
]

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Grammar: "bg-primary/10 text-primary",
    Vocabulary: "bg-accent/10 text-accent",
    Culture: "bg-primary/10 text-primary",
    Writing: "bg-accent/10 text-accent",
  }
  return colors[category] || "bg-secondary text-foreground"
}

export default function ArticlesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-5xl font-bold text-foreground">English Articles</h1>
            <p className="text-lg text-foreground/60">Read insightful articles to improve your English skills</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ARTICLES.map((article) => (
              <Card
                key={article.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30 flex flex-col"
              >
                <div className="p-6 space-y-4 flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}
                      >
                        {article.category}
                      </span>
                      <span className="text-xs text-foreground/50">{article.difficulty}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-foreground/60">{article.excerpt}</p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-primary/10 flex items-center justify-between">
                  <span className="text-xs text-foreground/50">{article.readTime} read</span>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                    Read More
                  </Button>
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
