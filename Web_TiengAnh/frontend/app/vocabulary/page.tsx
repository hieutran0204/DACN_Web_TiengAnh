"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Book, GraduationCap, Globe, MessageCircle, Brain, ArrowRight } from "lucide-react";

export default function VocabularyPage() {
  const vocabularySets = [
    {
      id: 1,
      title: "Basic Conversational Words",
      description: "Essential vocabulary for everyday conversations",
      words: 200,
      level: "Beginner",
      icon: MessageCircle,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      id: 2,
      title: "Business English Vocabulary",
      description: "Professional terms and corporate communication",
      words: 350,
      level: "Intermediate",
      icon: Globe,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      id: 3,
      title: "Academic English",
      description: "University-level vocabulary for essays and presentations",
      words: 450,
      level: "Advanced",
      icon: GraduationCap,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      gradient: "from-orange-500/20 to-red-500/20",
    },
    {
      id: 4,
      title: "IELTS Vocabulary",
      description: "High-frequency words for IELTS exam preparation",
      words: 500,
      level: "Advanced",
      icon: Book,
      color: "text-green-500",
      bg: "bg-green-500/10",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      id: 5,
      title: "Phrasal Verbs",
      description: "Master common phrasal verbs and their meanings",
      words: 150,
      level: "Intermediate",
      icon: Brain,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      gradient: "from-pink-500/20 to-rose-500/20",
    },
    {
      id: 6,
      title: "Idioms & Slang",
      description: "Learn popular idioms and colloquial expressions",
      words: 200,
      level: "Intermediate",
      icon: Sparkles,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      gradient: "from-yellow-500/20 to-amber-500/20",
    },
  ];

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
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
                <Book className="w-4 h-4" />
                <span>Vocabulary Builder</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
                Expand Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Word Power
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Build a robust vocabulary with our themed lessons, mnemonics, and spaced repetition techniques.
              </p>
            </motion.div>
          </div>

          {/* Vocabulary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vocabularySets.map((set, index) => {
              const Icon = set.icon;
              return (
                <motion.div
                  key={set.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="group relative h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    {/* Card Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${set.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    <div className="relative p-8 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className={`p-4 rounded-2xl ${set.bg} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`w-8 h-8 ${set.color}`} />
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-bold border border-border/50 bg-background/50 backdrop-blur-md">
                          {set.level}
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {set.title}
                      </h3>
                      <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">
                        {set.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/10">
                        <div className="text-sm font-medium text-muted-foreground">
                          {set.words} words
                        </div>
                        <Button
                          variant="ghost"
                          className="group-hover:text-primary p-0 hover:bg-transparent"
                        >
                          Start Learning <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
