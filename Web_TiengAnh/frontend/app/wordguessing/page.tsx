"use client";

import { useState, useEffect } from "react";

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
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/wordguessing/topics");
      const data = await response.json();
      setTopics(data.data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const startGame = async (topicId: string) => {
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
      setHintLevel(prev => Math.min(prev + 1, card.keyword.replace(/\s/g, "").length));
    }
  };

  const handleDontKnow = () => {
    setShowAnswer(true);
    setFeedback(null);
    setTotalAttempts(prev => prev + 1);
  };

  const checkAnswer = () => {
    if (!card || !userAnswer.trim()) {
      alert("Vui lòng nhập câu trả lời!");
      return;
    }

    const correct = userAnswer.trim().toLowerCase() === card.keyword.toLowerCase();
    setFeedback(correct ? "correct" : "incorrect");
    setTotalAttempts(prev => prev + 1);

    if (correct) {
      setScore(prev => prev + 1);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showAnswer && userAnswer.trim()) {
      checkAnswer();
    }
  };

  // Màn hình chọn chủ đề
  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-purple-500">
          <h1 className="text-4xl font-bold text-center mb-2 text-white">
            🎯 Word Guessing Game
          </h1>
          <p className="text-center text-gray-300 mb-8">
            Choose a topic to start playing
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map(topic => (
              <button
                key={topic._id}
                onClick={() => startGame(topic._id)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl text-left"
              >
                <h3 className="text-xl font-bold mb-2">{topic.name}</h3>
                {topic.description && (
                  <p className="text-sm opacity-90 mb-2">{topic.description}</p>
                )}
                <p className="text-xs opacity-75 bg-white bg-opacity-20 px-3 py-1 rounded-full inline-block">
                  📝 {topic.totalCards} cards
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Màn hình chơi game
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-4 mb-6 flex justify-between items-center border border-purple-500">
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            ← Back to Topics
          </button>
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-sm text-gray-400">Score</div>
              <div className="text-2xl font-bold text-green-400">{score}/{totalAttempts}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Accuracy</div>
              <div className="text-2xl font-bold text-blue-400">
                {totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Game Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-purple-500">
          <div className="mb-6 flex justify-between items-center">
            <span className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">
              {card.topic.name}
            </span>
            <span className="text-gray-400 text-sm">
              Hints used: {hintLevel}/3
            </span>
          </div>

          {/* English Definition */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-purple-300 mb-2">English Definition:</h3>
            <p className="text-lg text-gray-200 bg-slate-700 p-4 rounded-xl border-l-4 border-purple-400">
              {card.hintSentence}
            </p>
          </div>

          {/* Example Sentence */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-purple-300 mb-2">Example:</h3>
            <p className="text-xl text-gray-100 bg-slate-700 p-4 rounded-xl border-l-4 border-blue-400 font-medium">
              {card.sentenceWithBlank}
            </p>
          </div>

          {/* Hint Display */}
          <div className="mb-6 text-center">
            <div className="inline-block bg-blue-900 px-6 py-3 rounded-xl border-2 border-blue-500">
              <span className="text-3xl font-mono font-bold text-blue-200 tracking-widest">
                {getMaskedWord()}
              </span>
            </div>
          </div>

          {/* Hint Button */}
          <div className="mb-6 text-center">
            <button
              onClick={useHint}
              disabled={hintLevel >= 3 || showAnswer}
              className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition font-semibold"
            >
              💡 Hint ({3 - hintLevel} left)
            </button>
          </div>

          {/* Input Field - Chỉ hiện khi chưa show answer */}
          {!showAnswer && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Enter English word:
              </label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
                className="w-full bg-slate-700 border-2 border-gray-600 text-white rounded-xl px-5 py-4 text-xl focus:border-purple-500 focus:outline-none transition"
                placeholder="Type your answer..."
              />
            </div>
          )}

          {/* Feedback Messages */}
          {feedback === "incorrect" && !showAnswer && (
            <div className="mb-6 bg-red-900 bg-opacity-50 p-4 rounded-xl border-l-4 border-red-500">
              <p className="text-xl font-bold text-red-300 text-center">
                ❌ Incorrect! Try again or use a hint.
              </p>
            </div>
          )}

          {feedback === "correct" && showAnswer && (
            <div className="mb-6 bg-green-900 bg-opacity-50 p-4 rounded-xl border-l-4 border-green-500">
              <p className="text-xl font-bold text-green-300 text-center">
                ✅ Correct! The answer is: <span className="underline">{card.keyword}</span>
              </p>
            </div>
          )}

          {showAnswer && feedback === null && (
            <div className="mb-6 bg-gray-900 bg-opacity-50 p-4 rounded-xl border-l-4 border-gray-500">
              <p className="text-xl font-bold text-gray-300 text-center">
                The correct answer is: <span className="text-yellow-300 underline text-2xl">{card.keyword}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!showAnswer ? (
              <>
                <button
                  onClick={handleDontKnow}
                  className="flex-1 bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 font-bold text-lg transition"
                >
                  👁️ Don't Know
                </button>
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 font-bold text-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition"
                >
                  ✓ Check Answer
                </button>
              </>
            ) : (
              <button
                onClick={nextCard}
                className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 font-bold text-lg transition"
              >
                Next Word →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}