"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, CheckCircle, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface GameWord {
  _id: string;
  shuffledWord: string;
  hint: string;
  originalWord: string;
  meaning: string;
  usage: string;
  example: string;
  category: Category;
}

export default function WordScrambleGame() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentWord, setCurrentWord] = useState<GameWord | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch<any>("/user/game/categories");
      const data = res.data || res || [];
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const startGame = async () => {
    if (!selectedCategory) return;

    setIsLoading(true);
    try {
      const res = await apiFetch<any>(`/user/game/random-word/${selectedCategory}`);
      const data = res.data || res;
      setCurrentWord(data);
      setUserAnswer("");
      setShowResult(false);
    } catch (error) {
      console.error("Error fetching word:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnswer = async () => {
    if (!currentWord || !userAnswer) return;

    try {
      const res = await apiFetch<any>("/user/game/check-answer", {
        method: "POST",
        body: JSON.stringify({ wordId: currentWord._id, userAnswer }),
      });
      
      const data = res.data || res; // Assuming backend returns { isCorrect: boolean } directly or in data
      // Check if data has isCorrect, usually it's nested or direct
      const correct = data.isCorrect ?? false;
      
      setIsCorrect(correct);
      setShowResult(true);
      if (correct) setScore(score + 1);
    } catch (error) {
      console.error("Error checking answer:", error);
    }
  };

  const nextWord = async () => {
    await startGame();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Word Scramble Game
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={startGame}
                disabled={!selectedCategory || isLoading}
                className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            </CardContent>
          </Card>

          {currentWord && (
            <Card className="md:col-span-1 border-2 border-slate-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Scrambled Word
                  <span className="text-sm font-normal px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                    Score: {score}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-3xl font-black text-slate-800 tracking-widest uppercase mb-2">
                    {currentWord.shuffledWord}
                  </p>
                  <p className="text-slate-500 italic text-sm">
                    Hint: {currentWord.hint}
                  </p>
                </div>

                {!showResult ? (
                  <div className="space-y-4">
                    <Label htmlFor="answer">Your Answer</Label>
                    <Input
                      id="answer"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type the correct word..."
                      className="text-lg bg-white"
                      onKeyDown={(e) => {
                          if(e.key === "Enter") checkAnswer();
                      }}
                    />
                    <Button
                      onClick={checkAnswer}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!userAnswer}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Check Answer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-lg flex items-start gap-3 ${
                        isCorrect
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}>
                         {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                        )}
                        <div>
                             <span
                                className={`font-bold block text-lg ${
                                    isCorrect ? "text-green-800" : "text-red-800"
                                }`}>
                                {isCorrect ? "Correct! 🎉" : "Incorrect 😔"}
                            </span>
                             {!isCorrect && (
                                <p className="text-red-700 mt-1">
                                    The correct word was: <strong className="font-mono text-lg">{currentWord.originalWord}</strong>
                                </p>
                             )}
                        </div>
                    </div>

                    <div className="space-y-3 p-4 bg-blue-50/50 rounded-lg text-sm border border-blue-100">
                      <div>
                        <strong className="text-blue-900">Meaning:</strong> <span className="text-blue-800">{currentWord.meaning}</span>
                      </div>
                      <div>
                        <strong className="text-blue-900">Usage:</strong> <span className="text-blue-800">{currentWord.usage}</span>
                      </div>
                      <div>
                        <strong className="text-blue-900">Example:</strong> <span className="text-blue-800 italic">"{currentWord.example}"</span>
                      </div>
                    </div>

                    <Button onClick={nextWord} className="w-full" variant="outline">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Next Word
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
