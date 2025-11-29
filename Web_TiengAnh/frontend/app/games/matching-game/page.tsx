"use client";
import { useState, useEffect } from "react";

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
    if (isChecked) return; // Đã kiểm tra rồi thì không cho chọn nữa
    if (isMatched(wordObj.index, "word")) return; // Đã ghép rồi

    setSelectedWord(wordObj);
  };

  const handleMeaningClick = (meaningObj: MeaningObj) => {
    if (isChecked) return;
    if (isMatched(meaningObj.index, "meaning")) return;

    if (!selectedWord) return;

    // Tạo cặp ghép mới
    const newMatch: Match = {
      wordIndex: selectedWord.index,
      meaningIndex: meaningObj.index,
    };

    setMatches([...matches, newMatch]);
    setSelectedWord(null); // Reset để chọn từ tiếp theo
  };

  const isMatched = (index: number, type: "word" | "meaning"): boolean => {
    return matches.some((m) =>
      type === "word" ? m.wordIndex === index : m.meaningIndex === index
    );
  };

  const checkAllAnswers = () => {
    if (matches.length !== 4) {
      alert("Bạn cần ghép đủ 4 cặp!");
      return;
    }

    const correct = matches.filter(
      (m) => m.wordIndex === m.meaningIndex
    ).length;
    setCorrectCount(correct);
    setIsChecked(true);
  };

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

  const removeMatch = (wordIndex: number) => {
    if (isChecked) return;
    setMatches(matches.filter((m) => m.wordIndex !== wordIndex));
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
            🎯 Ghép Từ Với Nghĩa
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Chọn một chủ đề để bắt đầu!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => startGame(cat._id)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg">
                <h3 className="text-xl font-bold">{cat.name}</h3>
                {cat.description && (
                  <p className="text-sm mt-2 opacity-90">{cat.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex justify-between items-center flex-wrap gap-4">
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
            ← Quay lại
          </button>

          <div className="flex gap-6 items-center text-sm md:text-base">
            <div className="text-center">
              <div className="text-gray-600">Đã ghép</div>
              <div className="text-2xl font-bold text-purple-600">
                {matches.length}/4
              </div>
            </div>
            {isChecked && (
              <div className="text-center">
                <div className="text-gray-600">Đúng</div>
                <div className="text-2xl font-bold text-green-600">
                  {correctCount}
                </div>
              </div>
            )}
          </div>

          {!isChecked ? (
            <button
              onClick={checkAllAnswers}
              disabled={matches.length !== 4}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                matches.length === 4
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}>
              Kiểm tra
            </button>
          ) : (
            <button
              onClick={playAgain}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition">
              Chơi tiếp
            </button>
          )}
        </div>

        {/* Result Message */}
        {isChecked && (
          <div
            className={`mb-6 p-4 rounded-xl text-center font-bold text-lg ${
              correctCount === 4
                ? "bg-green-100 text-green-800 border-2 border-green-300"
                : "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
            }`}>
            {correctCount === 4 ? (
              <>🎉 Hoàn hảo! Bạn đã ghép đúng tất cả!</>
            ) : (
              <>Bạn ghép đúng {correctCount}/4 cặp. Hãy thử lại!</>
            )}
          </div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Từ vựng */}
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold text-center mb-4">
              📝 Từ vựng
            </h3>
            {shuffledWords.map((wordObj) => {
              const match = matches.find((m) => m.wordIndex === wordObj.index);
              const isSelected = selectedWord?.index === wordObj.index;
              const matchedMeaning = match
                ? shuffledMeanings.find((m) => m.index === match.meaningIndex)
                : null;

              return (
                <div key={wordObj.index} className="relative">
                  <button
                    onClick={() => handleWordClick(wordObj)}
                    disabled={!!match || isChecked}
                    className={`w-full p-6 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 ${
                      isChecked
                        ? match &&
                          isCorrectMatch(match.wordIndex, match.meaningIndex)
                          ? "bg-green-500 text-white"
                          : match &&
                              isWrongMatch(match.wordIndex, match.meaningIndex)
                            ? "bg-red-500 text-white"
                            : "bg-white text-gray-800"
                        : match
                          ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                          : isSelected
                            ? "bg-blue-600 text-white shadow-xl scale-105"
                            : "bg-white text-gray-800 hover:bg-blue-50 shadow-lg"
                    }`}>
                    <div className="flex justify-between items-center">
                      <span>{wordObj.word}</span>
                    </div>
                    {match && matchedMeaning && (
                      <div className="text-sm mt-2 opacity-80">
                        → {matchedMeaning.meaning}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Nghĩa */}
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold text-center mb-4">
              💡 Nghĩa
            </h3>
            {shuffledMeanings.map((meaningObj) => {
              const match = matches.find(
                (m) => m.meaningIndex === meaningObj.index
              );

              return (
                <button
                  key={meaningObj.index}
                  onClick={() => handleMeaningClick(meaningObj)}
                  disabled={!!match || isChecked}
                  className={`w-full p-6 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 ${
                    isChecked
                      ? match &&
                        isCorrectMatch(match.wordIndex, match.meaningIndex)
                        ? "bg-green-500 text-white"
                        : match &&
                            isWrongMatch(match.wordIndex, match.meaningIndex)
                          ? "bg-red-500 text-white"
                          : "bg-white text-gray-800"
                      : match
                        ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                        : selectedWord
                          ? "bg-white text-gray-800 hover:bg-blue-50 shadow-lg cursor-pointer"
                          : "bg-gray-100 text-gray-500 cursor-not-allowed"
                  }`}>
                  {meaningObj.meaning}
                  {isChecked &&
                    match &&
                    isWrongMatch(match.wordIndex, match.meaningIndex) && (
                      <div className="text-sm mt-2 text-green-200">
                        ✓ Đáp án đúng: {game.words[meaningObj.index]}
                      </div>
                    )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Complete Modal */}
        {isChecked && correctCount === 4 && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Hoàn hảo!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Bạn đã ghép đúng tất cả 4 cặp!
              </p>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 mb-6 border-2 border-green-200">
                <div className="text-5xl font-bold text-green-600">
                  100 điểm
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Độ chính xác: 100%
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={playAgain}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition">
                  Chơi tiếp
                </button>
                <button
                  onClick={resetGame}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold transition">
                  Chủ đề khác
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
