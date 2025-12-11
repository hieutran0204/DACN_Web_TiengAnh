"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, User, Bookmark, ArrowUpRight, Newspaper, Clock } from "lucide-react";
import Image from "next/image";

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
      category: "Business",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
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
      category: "Science",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
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
      category: "Education",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
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
      category: "Health",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
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
      category: "Technology",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
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
      category: "Lifestyle",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Intermediate":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Advanced":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
                <Newspaper className="w-4 h-4" />
                <span>Featured Stories</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
                Read, Learn &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-600">
                  Grow
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore engaging articles tailored to your English level. Improve your reading comprehension while staying informed.
              </p>
            </motion.div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group relative h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-black backdrop-blur-md">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-md border ${getLevelColor(
                          article.level
                        )}`}
                      >
                        {article.level}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-1">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground">
                            {article.author}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {article.date}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full hover:bg-primary/10 hover:text-primary"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
