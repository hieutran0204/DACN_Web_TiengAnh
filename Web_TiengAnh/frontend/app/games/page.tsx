"use client";

import Navbar from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Zap, Brain, Trophy } from "lucide-react";

export default function GamesPage() {
  const games = [
    {
      id: 1,
      icon: Brain,
      title: "Word Matching",
      description:
        "Match words with their correct definitions and improve your vocabulary retention",
      players: 15234,
      difficulty: "Easy",
    },
    {
      id: 2,
      icon: Zap,
      title: "Speed Typing",
      description:
        "Type English sentences as fast and accurately as possible to earn high scores",
      players: 22451,
      difficulty: "Medium",
    },
    {
      id: 3,
      icon: Trophy,
      title: "Trivia Master",
      description:
        "Answer challenging English language and culture trivia questions to climb the leaderboard",
      players: 18976,
      difficulty: "Hard",
    },
    {
      id: 4,
      icon: Gamepad2,
      title: "Grammar Quest",
      description:
        "Solve grammar puzzles and correct sentences while advancing through different levels",
      players: 12543,
      difficulty: "Medium",
    },
    {
      id: 5,
      icon: Brain,
      title: "Sentence Builder",
      description:
        "Arrange words to form correct sentences and learn proper English grammar",
      players: 19872,
      difficulty: "Easy",
    },
    {
      id: 6,
      icon: Zap,
      title: "Pronunciation Challenge",
      description:
        "Practice and record your pronunciation compared to native speakers",
      players: 8765,
      difficulty: "Medium",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
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
              Learning Games
            </h1>
            <p className="text-lg text-muted-foreground">
              Master English through interactive games, word puzzles, and
              language challenges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <Card
                  key={game.id}
                  className="p-6 hover:shadow-lg transition-shadow flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {game.title}
                    </h3>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 flex-1">
                    {game.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {game.players.toLocaleString()} players
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(game.difficulty)}`}>
                        {game.difficulty}
                      </span>
                    </div>
                    <Button className="w-full bg-primary hover:bg-accent text-primary-foreground">
                      Play Now
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
