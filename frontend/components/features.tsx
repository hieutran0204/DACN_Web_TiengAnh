"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Zap,
  MessageSquare,
  Newspaper,
  Gamepad2,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    id: "tests",
    icon: BookOpen,
    title: "Mock Tests",
    description:
      "Realistic practice exams for TOEFL, IELTS, and more. Get ready to ace your certification.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    href: "/tests",
    colSpan: "md:col-span-1 lg:col-span-3",
  },
  {
    id: "skills",
    icon: Zap,
    title: "Skill Assessment",
    description: "Targeted practice for Listening, Reading, Writing, and Speaking.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    href: "/skills",
    colSpan: "md:col-span-1 lg:col-span-3",
  },
  {
    id: "games",
    icon: Gamepad2,
    title: "Gamified Learning",
    description: "Learn while having fun with interactive challenges.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    href: "/games",
    colSpan: "md:col-span-1 lg:col-span-2",
  },
  {
    id: "vocabulary",
    icon: MessageSquare,
    title: "Vocabulary Builder",
    description: "Expand your word bank with spaced repetition.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    href: "/vocabulary",
    colSpan: "md:col-span-1 lg:col-span-2",
  },
  {
    id: "articles",
    icon: Newspaper,
    title: "Daily Articles",
    description: "Read news and stories tailored to your level.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    href: "/articles",
    colSpan: "md:col-span-2 lg:col-span-2",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything you need to excel
          </h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive tools and resources designed to take your English skills
            to the next level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`${feature.colSpan} group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                {feature.description}
              </p>

              <Link
                href={feature.href}
                className="absolute inset-0 z-10 focus:outline-none"
              >
                <span className="sr-only">View {feature.title}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
