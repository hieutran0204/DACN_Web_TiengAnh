"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gamepad2, Zap, Brain, Trophy, Play, Star } from "lucide-react";

export default function GamesPage() {
  const games = [
    {
      id: 1,
      icon: Brain,
      title: "Word Matching",
      description:
        "Match words with their correct definitions. Test your vocabulary and memory in this classic matching game.",
      players: "15k+",
      difficulty: "Easy",
      href: "/games/matching-game",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      id: 2,
      icon: Zap,
      title: "Word Scramble",
      description:
        "Unscramble the jumbled letters to form valid English words. Race against the clock!",
      players: "22k+",
      difficulty: "Medium",
      href: "/games/word-scramble",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      id: 3,
      icon: Trophy,
      title: "Word Guessing",
      description:
        "Guess the hidden word letter by letter. Be careful, you only have a few attempts!",
      players: "18k+",
      difficulty: "Hard",
      href: "/games/wordguessing",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      gradient: "from-orange-500/20 to-red-500/20",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
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
                <Gamepad2 className="w-4 h-4" />
                <span>Gamified Learning</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
                Play & Learn{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  English
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Master new vocabulary and grammar through interactive challenges.
                Learning has never been this fun!
              </p>
            </motion.div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => {
              const Icon = game.icon;
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="group relative h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    {/* Card Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    <div className="relative p-8 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className={`w-14 h-14 rounded-2xl ${game.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`w-7 h-7 ${game.color}`} />
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(
                            game.difficulty
                          )}`}
                        >
                          {game.difficulty}
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">
                        {game.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{game.players} players</span>
                        </div>
                        <Button
                          className="rounded-full px-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          asChild
                        >
                          <Link href={game.href}>
                            Play Now <Play className="w-4 h-4 ml-2 fill-current" />
                          </Link>
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
