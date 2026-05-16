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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trophy,
  BrainCircuit,
  Lightbulb,
  Play,
  GraduationCap,
  ChevronLeft,
  Target,
  Search,
} from "lucide-react";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface MatchingGame {
  _id: string;
  category: string;
  words: string[];
  meanings: string[];
  difficulty: "easy" | "medium" | "hard";
  status: "active" | "inactive";
}

interface WordObj {
  word: string;
  index: number;
}

interface MeaningObj {
  meaning: string;
  index: number;
}

interface Match {
  wordIndex: number;
  meaningIndex: number;
}

export default function MatchingGamePlay() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [game, setGame] = useState<MatchingGame | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordObj | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [shuffledWords, setShuffledWords] = useState<WordObj[]>([]);
  const [shuffledMeanings, setShuffledMeanings] = useState<MeaningObj[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination and Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/user/game/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    }
  };

  const startGame = async (categoryId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/user/game/matching/category/${categoryId}/random`
      );
      const data = await res.json();

      if (data.success) {
        const gameData: MatchingGame = data.data;
        setGame(gameData);
        setSelectedCategory(categoryId);

        const wordsWithIndex = gameData.words.map((w, i) => ({
          word: w,
          index: i,
        }));
        const meaningsWithIndex = gameData.meanings.map((m, i) => ({
          meaning: m,
          index: i,
        }));

        setShuffledWords(shuffleArray(wordsWithIndex));
        setShuffledMeanings(shuffleArray(meaningsWithIndex));

        // Reset game
        setMatches([]);
        setSelectedWord(null);
        setIsChecked(false);
        setCorrectCount(0);
      } else {
        alert(data.message || "Không thể tải game");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleWordClick = (wordObj: WordObj) => {
    if (isChecked) return;
    if (isMatched(wordObj.index, "word")) return;
    setSelectedWord(wordObj);
  };

  const handleMeaningClick = (meaningObj: MeaningObj) => {
    if (isChecked) return;
    if (isMatched(meaningObj.index, "meaning")) return;
    if (!selectedWord) return;

    const newMatch: Match = {
      wordIndex: selectedWord.index,
      meaningIndex: meaningObj.index,
    };

    setMatches([...matches, newMatch]);
    setSelectedWord(null);
  };

  const isMatched = (index: number, type: "word" | "meaning"): boolean => {
    return matches.some((m) =>
      type === "word" ? m.wordIndex === index : m.meaningIndex === index
    );
  };

  const checkAllAnswers = () => {
    if (!game || matches.length !== game.words.length) return;

    const correct = matches.filter(
      (m) => m.wordIndex === m.meaningIndex
    ).length;
    setCorrectCount(correct);
    setIsChecked(true);
  };

  // Auto-check when all pairs are matched
  useEffect(() => {
    if (game && matches.length === game.words.length && matches.length > 0) {
      checkAllAnswers();
    }
  }, [matches, game]);

  const isCorrectMatch = (wordIndex: number, meaningIndex: number): boolean => {
    if (!isChecked) return false;
    const match = matches.find(
      (m) => m.wordIndex === wordIndex && m.meaningIndex === meaningIndex
    );
    return match ? match.wordIndex === match.meaningIndex : false;
  };

  const isWrongMatch = (wordIndex: number, meaningIndex: number): boolean => {
    if (!isChecked) return false;
    const match = matches.find(
      (m) => m.wordIndex === wordIndex && m.meaningIndex === meaningIndex
    );
    return match ? match.wordIndex !== match.meaningIndex : false;
  };

  const resetGame = () => {
    setGame(null);
    setSelectedCategory(null);
  };

  const playAgain = () => {
    if (selectedCategory) {
      startGame(selectedCategory);
    }
  };

  // Filter and Pagination Logic
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // --- Render Components ---

  if (!game) {
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
              <GraduationCap className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Luyện Tập Từ Vựng
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
              Chọn chủ đề để bắt đầu bài tập ghép từ
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            {loading && categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                 {/* Search Bar */}
                 <div className="max-w-md mx-auto mb-8 relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        placeholder="Tìm kiếm chủ đề..." 
                        className="pl-10 h-12 rounded-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-visible:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                 </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentCategories.length > 0 ? (
                    currentCategories.map((category, index) => (
                      <motion.button
                        key={category._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startGame(category._id)}
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
                            {category.name}
                          </h3>
                          <p className="text-base text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed mb-6">
                            {category.description || "Bài tập rèn luyện kỹ năng ghi nhớ từ vựng"}
                          </p>

                          <div className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                            Bắt đầu ngay <ArrowRight className="w-4 h-4 ml-2" />
                          </div>
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        Không tìm thấy chủ đề nào phù hợp.
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="gap-1 pl-2.5"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                            <PaginationItem key={page}>
                            <PaginationLink
                                isActive={currentPage === page}
                                onClick={() => handlePageChange(page)}
                                className="cursor-pointer"
                            >
                                {page}
                            </PaginationLink>
                            </PaginationItem>
                        )
                        )}
                        <PaginationItem>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                            handlePageChange(Math.min(totalPages, currentPage + 1))
                            }
                            disabled={currentPage === totalPages}
                            className="gap-1 pr-2.5"
                        >
                            <span className="sr-only">Next</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        </PaginationItem>
                    </PaginationContent>
                    </Pagination>
                )}
              </>
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

      {/* Game HUD */}
      <div className="sticky top-16 z-30 px-4 py-4 mb-4">
        <div className="max-w-5xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-800 p-4 flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => setGame(null)}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Chọn chủ đề khác
          </Button>

          <div className="flex items-center gap-6 md:gap-12">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ĐÃ GHÉP</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {matches.length}/{game.words.length}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KẾT QUẢ</span>
              <div className={`text-2xl font-black ${matches.length === game.words.length
                ? "text-green-500"
                : "text-orange-500"
                }`}>
                {matches.length}/{game.words.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={playAgain}
              className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Chơi lại
            </Button>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 h-full">

          {/* Words Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Từ vựng</h2>
            </div>

            <div className="grid gap-3">
              {shuffledWords.map((wordObj) => {
                const match = matches.find((p) => p.wordIndex === wordObj.index);
                const isSelected = selectedWord?.index === wordObj.index;
                const matchedMeaning = match
                  ? shuffledMeanings.find((m) => m.index === match.meaningIndex)
                  : null;

                // Determine Card Style
                let cardStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-1 hover:shadow-md";
                let textStyle = "text-slate-700 dark:text-slate-200";

                if (match) {
                  if (isChecked) {
                    if (isCorrectMatch(match.wordIndex, match.meaningIndex)) {
                      cardStyle = "bg-green-50 dark:bg-green-900/20 border-green-500 shadow-sm opacity-60";
                      textStyle = "text-green-700 dark:text-green-400";
                    } else {
                      cardStyle = "bg-red-50 dark:bg-red-900/20 border-red-500 shadow-sm";
                      textStyle = "text-red-700 dark:text-red-400";
                    }
                  } else {
                    cardStyle = "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700";
                    textStyle = "text-indigo-700 dark:text-indigo-300";
                  }
                } else if (isSelected) {
                  cardStyle = "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 shadow-md -translate-y-1 ring-2 ring-indigo-500/20";
                  textStyle = "text-indigo-800 dark:text-indigo-300";
                }

                return (
                  <motion.button
                    key={wordObj.index}
                    layoutId={`word-${wordObj.index}`}
                    onClick={() => handleWordClick(wordObj)}
                    disabled={!!match || isChecked}
                    className={`w-full text-left p-4 md:p-5 rounded-xl border-b-4 transition-all duration-200 relative overflow-hidden group active:border-b-0 active:translate-y-1 ${cardStyle}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-lg md:text-xl font-bold ${textStyle}`}>{wordObj.word}</span>
                      {match && matchedMeaning && (
                        <span className="text-slate-400 mx-2">→</span>
                      )}
                      {match && matchedMeaning && (
                        <span className={`text-lg md:text-xl font-medium ${textStyle}`}>{matchedMeaning.meaning}</span>
                      )}
                    </div>

                    {/* Status Icon */}
                    {isChecked && match && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {isCorrectMatch(match.wordIndex, match.meaningIndex) ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="w-6 h-6 text-green-600 fill-green-100" />
                          </motion.div>
                        ) : (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <XCircle className="w-6 h-6 text-red-600 fill-red-100" />
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Meanings Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Nghĩa</h2>
            </div>

            <div className="grid gap-3">
              {shuffledMeanings.map((meaningObj) => {
                const match = matches.find((p) => p.meaningIndex === meaningObj.index);

                // Determine Card Style
                let cardStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:-translate-y-1 hover:shadow-md";
                let textStyle = "text-slate-700 dark:text-slate-200";

                if (match) {
                  if (isChecked) {
                    if (isCorrectMatch(match.wordIndex, match.meaningIndex)) {
                      cardStyle = "bg-green-50 dark:bg-green-900/20 border-green-500 shadow-sm opacity-60";
                      textStyle = "text-green-700 dark:text-green-400";
                    } else {
                      cardStyle = "bg-red-50 dark:bg-red-900/20 border-red-500 shadow-sm";
                      textStyle = "text-red-700 dark:text-red-400";
                    }
                  } else {
                    cardStyle = "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700";
                    textStyle = "text-indigo-700 dark:text-indigo-300";
                  }
                } else if (selectedWord && !match) {
                  // Hint that this is clickable
                  cardStyle += " cursor-pointer";
                }

                return (
                  <motion.button
                    key={meaningObj.index}
                    layoutId={`meaning-${meaningObj.index}`}
                    onClick={() => handleMeaningClick(meaningObj)}
                    disabled={!!match || isChecked || !selectedWord}
                    className={`w-full text-left p-4 md:p-5 rounded-xl border-b-4 transition-all duration-200 relative overflow-hidden active:border-b-0 active:translate-y-1 ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className={`text-lg font-medium ${textStyle}`}>
                        {meaningObj.meaning}
                      </span>

                      {isChecked && match && isWrongMatch(match.wordIndex, match.meaningIndex) && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-600 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg"
                        >
                          <span className="uppercase text-[10px] tracking-wider opacity-70">Đúng:</span>
                          {game.words[meaningObj.index]}
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Result Overlay */}
      <AnimatePresence>
        {isChecked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border-2 border-primary/20 relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 pointer-events-none" />

              <div className="relative z-10 flex flex-col min-h-0 flex-1">
                <div className="flex-shrink-0">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${correctCount === game.words.length ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                    {correctCount === game.words.length ? (
                      <Trophy className="w-10 h-10" />
                    ) : (
                      <Target className="w-10 h-10" />
                    )}
                  </div>

                  <h2 className="text-2xl font-bold mb-2">
                    {correctCount === game.words.length ? "Xuất sắc!" : "Hoàn thành!"}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Bạn đã trả lời đúng <span className="font-bold text-primary">{correctCount}/{game.words.length}</span> câu hỏi
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-3 text-left custom-scrollbar">
                  {matches.map((match, index) => {
                    const isCorrect = match.wordIndex === match.meaningIndex;
                    const word = game.words[match.wordIndex];
                    const userMeaning = game.meanings[match.meaningIndex];
                    const correctMeaning = game.meanings[match.wordIndex];

                    return (
                      <div key={index} className={`p-4 rounded-xl border ${isCorrect
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
                        : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30"
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-foreground">{word}</span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground min-w-[70px]">Bạn chọn:</span>
                            <span className={`font-medium ${isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                              {userMeaning}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground min-w-[70px]">Đáp án:</span>
                              <span className="text-green-700 dark:text-green-400 font-medium">
                                {correctMeaning}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  <Button onClick={playAgain} className="flex-1 h-12 text-lg">
                    Chơi lại
                  </Button>
                  <Button onClick={resetGame} variant="outline" className="flex-1 h-12 text-lg">
                    Thoát
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
