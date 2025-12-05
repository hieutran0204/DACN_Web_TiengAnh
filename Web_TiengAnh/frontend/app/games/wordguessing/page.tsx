"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  HelpCircle,
  Eye,
  Play,
  Target,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface WordTopic {
  _id: string;
  name: string;
  description?: string;
  totalCards: number;
}

interface WordCard {
  _id: string;
  topic: { _id: string; name: string };
  keyword: string;
  hintSentence: string;
  sentenceWithBlank: string;
}

export default function WordGuessingGame() {
  const [topics, setTopics] = useState<WordTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [card, setCard] = useState<WordCard | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintLevel, setHintLevel] = useState(0); // 0, 1, 2, 3
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/admin/wordguessing/topics"
      );
      const data = await response.json();
      setTopics(data.data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const startGame = async (topicId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/user/wordguessing/cards/topic/${topicId}/random`
      );
      const data = await response.json();

      if (data.success) {
        setCard(data.data);
        setSelectedTopic(topicId);
        resetCardState();
      } else {
        alert(data.message || "Không thể tải card");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  const resetCardState = () => {
    setUserAnswer("");
    setHintLevel(0);
    setShowAnswer(false);
    setFeedback(null);
  };

  const getMaskedWord = () => {
    if (!card) return "";
    const keyword = card.keyword;
    const revealed = hintLevel;

    return keyword
      .split("")
      .map((char, index) => {
        if (index < revealed) return char;
        if (char === " ") return " ";
        return "*";
      })
      .join("");
  };

  const useHint = () => {
    if (hintLevel < 3 && card) {
      setHintLevel((prev) =>
        Math.min(prev + 1, card.keyword.replace(/\s/g, "").length)
      );
    }
  };

  const handleDontKnow = () => {
    setShowAnswer(true);
    setFeedback(null);
    setTotalAttempts((prev) => prev + 1);
  };

  const checkAnswer = () => {
    if (!card || !userAnswer.trim()) {
      return;
    }

    const correct =
      userAnswer.trim().toLowerCase() === card.keyword.toLowerCase();
    setFeedback(correct ? "correct" : "incorrect");
    setTotalAttempts((prev) => prev + 1);

    if (correct) {
      setScore((prev) => prev + 1);
      setShowAnswer(true);
    }
  };

  const nextCard = () => {
    if (selectedTopic) {
      startGame(selectedTopic);
    }
  };

  const resetGame = () => {
    setCard(null);
    setSelectedTopic(null);
    setScore(0);
    setTotalAttempts(0);
    resetCardState();
  };

  // --- Render Components ---

  if (!card) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden pt-24">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <Card className="w-full max-w-5xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl relative z-10">
          {/* Back Button */}
          <div className="absolute top-6 left-6 z-20">
            <Link href="/games">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-bold">Games</span>
              </Button>
            </Link>
          </div>

          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
              <Brain className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Word Guessing
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
              Đoán từ vựng dựa trên gợi ý và ngữ cảnh
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic, index) => (
                  <motion.button
                    key={topic._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startGame(topic._id)}
                    className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-8 text-left shadow-lg hover:shadow-2xl hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-500"
                  >
                    {/* Decorative Gradients */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-150 group-hover:from-indigo-500/20 group-hover:to-purple-500/20" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-tr-full -ml-6 -mb-6 transition-all group-hover:scale-125" />

                    <div className="absolute top-6 right-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Play className="w-6 h-6" />
                    </div>

                    <div className="relative z-10 pt-4">
                      <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors mb-3">
                        {topic.name}
                      </h3>
                      <p className="text-base text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed mb-6">
                        {topic.description || "Chủ đề từ vựng thú vị"}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                          <Target className="w-3.5 h-3.5 mr-1.5" />
                          {topic.totalCards} từ
                        </div>
                        <div className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                          Bắt đầu <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col pt-24">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50/0 to-slate-50/0 dark:from-indigo-950/40 dark:via-slate-950/0 dark:to-slate-950/0" />
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-4 md:left-8 z-20">
        <Link href="/games">
          <Button variant="ghost" className="gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-slate-800/50">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold">Games</span>
          </Button>
        </Link>
      </div>

      {/* Game HUD */}
      <div className="sticky top-16 z-30 px-4 py-4 mb-8">
        <div className="max-w-4xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-800 p-4 flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={resetGame}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Chọn chủ đề khác
          </Button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm border border-green-200 dark:border-green-800">
                <Trophy className="w-5 h-5" />
                <span>{score}/{totalAttempts}</span>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
              Độ chính xác: {totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 pb-12 relative z-10 mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
        >
          <div className="p-8 md:p-12">
            <div className="flex justify-between items-center mb-8">
              <Badge variant="secondary" className="text-lg px-4 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50">
                {card.topic.name}
              </Badge>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Gợi ý: {hintLevel}/3
              </div>
            </div>

            <div className="space-y-8">
              {/* Definition Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h3 className="text-sm uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 font-bold flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Định nghĩa
                </h3>
                <p className="text-lg md:text-xl text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {card.hintSentence}
                </p>
              </div>

              {/* Example Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h3 className="text-sm uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 font-bold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Ví dụ
                </h3>
                <p className="text-lg md:text-xl text-slate-800 dark:text-slate-200 font-medium italic">
                  "{card.sentenceWithBlank}"
                </p>
              </div>

              {/* Word Mask */}
              <div className="text-center py-6">
                <div className="inline-block px-8 py-4 bg-white dark:bg-slate-950 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 shadow-sm">
                  <span className="text-4xl md:text-5xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-[0.5em]">
                    {getMaskedWord()}
                  </span>
                </div>
              </div>

              {/* Controls */}
              {!showAnswer ? (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={useHint}
                      disabled={hintLevel >= 3}
                      variant="outline"
                      className="border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Gợi ý ({3 - hintLevel})
                    </Button>
                  </div>

                  <div className="relative">
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                      placeholder="Nhập từ vựng..."
                      className="text-center text-xl h-14 rounded-xl border-2 focus-visible:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      autoFocus
                    />
                  </div>

                  {feedback === "incorrect" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-red-500 font-medium flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Sai rồi, thử lại xem!
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleDontKnow}
                      variant="secondary"
                      className="flex-1 h-12 text-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Không biết
                    </Button>
                    <Button
                      onClick={checkAnswer}
                      disabled={!userAnswer.trim()}
                      className="flex-1 h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 text-white"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Kiểm tra
                    </Button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 text-center"
                >
                  <div
                    className={`p-6 rounded-2xl border-2 ${feedback === "correct"
                      ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      }`}
                  >
                    <div className="flex items-center justify-center gap-3 mb-2">
                      {feedback === "correct" ? (
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      ) : (
                        <HelpCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      )}
                      <span
                        className={`text-2xl font-bold ${feedback === "correct" ? "text-green-700 dark:text-green-400" : "text-indigo-700 dark:text-indigo-400"
                          }`}
                      >
                        {feedback === "correct" ? "Chính xác! 🎉" : "Đáp án đúng là:"}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-4 tracking-wider">
                      {card.keyword}
                    </p>
                  </div>

                  <Button
                    onClick={nextCard}
                    className="w-full max-w-md h-14 text-lg rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 text-white"
                  >
                    <ArrowRight className="w-6 h-6 mr-2" />
                    Từ tiếp theo
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
