"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Question {
  _id: string;
  question: string;
  options: string[];
}

interface News {
  _id: string;
  title: string;
  image: string;
  content: string;
  questions: Question[];
  author: string;
  createdAt: string;
}

interface CheckResult {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: number;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchNews();
    }
  }, [params.id]);

  const fetchNews = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/news/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }
      const data = await response.json();
      setNews(data.data);
      // Initialize answers array with -1 (unanswered)
      if (data.data.questions) {
        setAnswers(new Array(data.data.questions.length).fill(-1));
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (showResult) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmitAnswer = async () => {
    if (answers.some(a => a === -1)) {
      alert("Vui lòng trả lời tất cả các câu hỏi!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/user/news/${params.id}/check-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answers })
      });

      const data = await response.json();
      setResults(data.results);
      setTotalCorrect(data.totalCorrect);
      setShowResult(true);
    } catch (error) {
      alert("Lỗi khi kiểm tra đáp án");
    }
  };

  const handleTryAgain = () => {
    if (news) {
      setAnswers(new Array(news.questions.length).fill(-1));
    }
    setShowResult(false);
    setResults([]);
    setTotalCorrect(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy bài báo</h2>
          <button
            onClick={() => router.push('/articles')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-600 to-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
<button
  onClick={() => router.push('/articles')}
  className="mb-4 px-4 py-2 bg-white/20 text-black rounded-lg hover:bg-white/30 transition"
>
  ← Quay lại
</button>

        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {news.title}
            </h1>
            <img 
              src={`http://localhost:3000${news.image}`}
              alt={news.title}
              className="w-full h-auto object-cover rounded-lg mb-6"
            />

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b">
              <span className="flex items-center gap-2">
                👤 <span className="font-medium">{news.author}</span>
              </span>
              <span className="flex items-center gap-2">
                📅 <span>{new Date(news.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </span>
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {news.content}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-600">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                📝 Comprehension Questions
              </h2>
              
              <div className="space-y-8">
                {news.questions.map((q, qIndex) => {
                   const result = showResult ? results.find(r => r.questionId === q._id) : null;
                   const isCorrect = result?.isCorrect;
                   const correctAnswer = result?.correctAnswer;

                   return (
                    <div key={qIndex} className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        {qIndex + 1}. {q.question}
                      </h3>
                      
                      <div className="space-y-3">
                        {q.options.map((option, oIndex) => {
                          let optionClass = "border-gray-200 hover:border-blue-300 hover:bg-gray-50"; // default
                          
                          if (showResult) {
                             if (oIndex === correctAnswer) {
                               optionClass = "border-green-600 bg-green-50"; // Correct answer styling
                             } else if (answers[qIndex] === oIndex && !isCorrect) {
                               optionClass = "border-red-600 bg-red-50"; // User wrong answer
                             } else {
                               optionClass = "border-gray-100 opacity-60"; // Other options
                             }
                          } else if (answers[qIndex] === oIndex) {
                             optionClass = "border-blue-600 bg-blue-50"; // Selected
                          }

                          return (
                            <button
                              key={oIndex}
                              onClick={() => handleAnswerSelect(qIndex, oIndex)}
                              disabled={showResult}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${optionClass} ${
                                showResult ? 'cursor-default' : 'cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>
                                  <span className="font-semibold mr-3 text-gray-500">
                                    {String.fromCharCode(65 + oIndex)}.
                                  </span>
                                  {option}
                                </span>
                                {showResult && oIndex === correctAnswer && (
                                  <span className="text-green-600 font-bold">✓</span>
                                )}
                                {showResult && answers[qIndex] === oIndex && !isCorrect && (
                                  <span className="text-red-600 font-bold">✗</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!showResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:bg-gray-400 shadow-md transition-transform active:scale-95"
                  disabled={answers.some(a => a === -1)}
                >
                  Kiểm tra đáp án
                </button>
              ) : (
                <div className="mt-8 animate-fade-in-up">
                  <div className={`p-6 rounded-lg mb-6 text-center ${
                    totalCorrect === news.questions.length ? 'bg-green-100 border-green-500' : 'bg-orange-100 border-orange-500'
                  } border-2`}>
                    <p className="text-2xl font-bold mb-2">
                       Kết quả: {totalCorrect} / {news.questions.length}
                    </p>
                    <p className={`font-medium ${
                      totalCorrect === news.questions.length ? 'text-green-800' : 'text-orange-800'
                    }`}>
                      {totalCorrect === news.questions.length 
                        ? '🎉 Xuất sắc! Bạn đã trả lời đúng tất cả!' 
                        : '💪 Cố gắng lên! Hãy xem lại các câu sai nhé.'}
                    </p>
                  </div>
                  <button
                    onClick={handleTryAgain}
                    className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 font-semibold shadow-md transition-transform active:scale-95"
                  >
                    Làm lại
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}