"use client";

import Navbar from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function VocabularyPage() {
  const vocabularySets = [
    {
      id: 1,
      title: "Basic Conversational Words",
      description: "Essential vocabulary for everyday conversations",
      words: 200,
      level: "Beginner",
      color: "bg-blue-50",
    },
    {
      id: 2,
      title: "Business English Vocabulary",
      description: "Professional terms and corporate communication",
      words: 350,
      level: "Intermediate",
      color: "bg-cyan-50",
    },
    {
      id: 3,
      title: "Academic English",
      description: "University-level vocabulary for essays and presentations",
      words: 450,
      level: "Advanced",
      color: "bg-indigo-50",
    },
    {
      id: 4,
      title: "IELTS Vocabulary",
      description: "High-frequency words for IELTS exam preparation",
      words: 500,
      level: "Advanced",
      color: "bg-purple-50",
    },
    {
      id: 5,
      title: "Phrasal Verbs",
      description: "Master common phrasal verbs and their meanings",
      words: 150,
      level: "Intermediate",
      color: "bg-pink-50",
    },
    {
      id: 6,
      title: "Idioms & Slang",
      description: "Learn popular idioms and colloquial expressions",
      words: 200,
      level: "Intermediate",
      color: "bg-rose-50",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mt-16 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Vocabulary
            </h1>
            <p className="text-lg text-muted-foreground">
              Build your vocabulary with themed lessons, mnemonics, and spaced
              repetition techniques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vocabularySets.map((set) => (
              <Card
                key={set.id}
                className={`${set.color} p-6 hover:shadow-lg transition-shadow border-0`}>
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {set.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {set.description}
                  </p>
                </div>

                <div className="mb-4 pt-4 border-t border-border/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {set.words} words
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-white/50 text-foreground">
                      {set.level}
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-accent text-primary-foreground">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Learn Now
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
