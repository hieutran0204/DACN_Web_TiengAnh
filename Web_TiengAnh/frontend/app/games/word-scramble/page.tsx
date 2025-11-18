
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, RotateCcw, CheckCircle, XCircle } from "lucide-react";

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
      const response = await fetch("http://localhost:3000/api/user/game/categories");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const startGame = async () => {
    if (!selectedCategory) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/user/game/random-word/${selectedCategory}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCurrentWord(data.data);
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
      const response = await fetch("http://localhost:3000/api/user/game/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: currentWord._id, userAnswer }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIsCorrect(data.isCorrect);
      setShowResult(true);
      if (data.isCorrect) setScore(score + 1);
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
        <h1 className="text-3xl font-bold mb-8 text-center">Trò chơi Xếp chữ</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Chọn Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn category" />
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
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Bắt đầu trò chơi
              </Button>
            </CardContent>
          </Card>

          {currentWord && (
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Từ xáo trộn
                  <span className="text-sm text-muted-foreground">Điểm: {score}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold mb-2">{currentWord.shuffledWord}</p>
                  <p className="text-muted-foreground">Gợi ý: {currentWord.hint}</p>
                </div>

                {!showResult ? (
                  <div className="space-y-4">
                    <Label htmlFor="answer">Đáp án của bạn</Label>
                    <Input
                      id="answer"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Nhập từ đúng..."
                    />
                    <Button onClick={checkAnswer} className="w-full" disabled={!userAnswer}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Kiểm tra
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${
                      isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${
                          isCorrect ? "text-green-800" : "text-red-800"
                        }`}>
                          {isCorrect ? "Chính xác! 🎉" : "Sai rồi! 😔"}
                        </span>
                      </div>
                      {!isCorrect && (
                        <p className="text-red-700">
                          <strong>Đáp án đúng:</strong> {currentWord.originalWord}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <strong>Nghĩa:</strong> {currentWord.meaning}
                      </div>
                      <div>
                        <strong>Cách dùng:</strong> {currentWord.usage}
                      </div>
                      <div>
                        <strong>Ví dụ:</strong> {currentWord.example}
                      </div>
                    </div>

                    <Button onClick={nextWord} className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Từ tiếp theo
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