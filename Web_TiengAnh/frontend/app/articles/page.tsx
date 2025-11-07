"use client";

import Navbar from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, Bookmark } from "lucide-react";

export default function ArticlesPage() {
  const articles = [
    {
      id: 1,
      title: "The Art of Effective Communication",
      author: "Sarah Johnson",
      date: "Dec 15, 2024",
      level: "Intermediate",
      readTime: "8 min read",
      excerpt:
        "Discover the key principles of effective communication in modern workplaces and how to master them.",
    },
    {
      id: 2,
      title: "Climate Change: A Global Perspective",
      author: "Dr. Michael Chen",
      date: "Dec 10, 2024",
      level: "Advanced",
      readTime: "12 min read",
      excerpt:
        "An in-depth analysis of climate change impacts and innovative solutions being implemented worldwide.",
    },
    {
      id: 3,
      title: "Technology in Education",
      author: "Emily Davis",
      date: "Dec 5, 2024",
      level: "Intermediate",
      readTime: "7 min read",
      excerpt:
        "How digital tools and online platforms are revolutionizing the way students learn and grow.",
    },
    {
      id: 4,
      title: "Health Benefits of Regular Exercise",
      author: "Dr. Robert Wilson",
      date: "Nov 28, 2024",
      level: "Beginner",
      readTime: "6 min read",
      excerpt:
        "Learn why regular physical activity is essential for maintaining a healthy body and mind.",
    },
    {
      id: 5,
      title: "The Future of Artificial Intelligence",
      author: "Alex Turner",
      date: "Nov 22, 2024",
      level: "Advanced",
      readTime: "11 min read",
      excerpt:
        "Exploring the latest developments in AI and what the future holds for this transformative technology.",
    },
    {
      id: 6,
      title: "Sustainable Living Tips",
      author: "Green Earth Team",
      date: "Nov 18, 2024",
      level: "Beginner",
      readTime: "5 min read",
      excerpt:
        "Simple yet effective ways to reduce your environmental footprint and live more sustainably.",
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-blue-100 text-blue-800";
      case "Advanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mt-16 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Articles
            </h1>
            <p className="text-lg text-muted-foreground">
              Read engaging articles and news stories tailored to your English
              level
            </p>
          </div>

          <div className="space-y-6">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${getLevelColor(article.level)}`}>
                        {article.level}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {article.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {article.title}
                    </h3>
                  </div>
                  <Bookmark className="w-5 h-5 text-border flex-shrink-0 mt-1" />
                </div>

                <p className="text-muted-foreground mb-4">{article.excerpt}</p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{article.date}</span>
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-accent text-primary-foreground">
                    Read Article
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
