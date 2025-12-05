"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface News {
  _id: string;
  title: string;
  image: string;
  content: string;
  question: string;
  options: string[];
  correctAnswer: number;
  author: string;
  createdAt: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchNews();
    }
  }, [params.id]);

  const fetchNews = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/news/${params.id}`);
      const data = await response.json();
      setNews(data.data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) {
      alert("Vui lòng chọn đáp án!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/user/news/${params.id}/check-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: selectedAnswer })
      });

      const data = await response.json();
      setIsCorrect(data.correct);
      setShowResult(true);
    } catch (error) {
      alert("Lỗi khi kiểm tra đáp án");
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
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
            onClick={() => router.push('/news')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => router.push('/news')}
            className="mb-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
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
            className="w-full h-96 object-cover"
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📝 Comprehension Question
              </h2>
              <p className="text-lg text-gray-800 mb-6 font-medium">
                {news.question}
              </p>

              <div className="space-y-3">
                {news.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showResult && setSelectedAnswer(index)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === index && !showResult
                        ? 'border-blue-600 bg-blue-50'
                        : showResult && index === news.correctAnswer
                        ? 'border-green-600 bg-green-50'
                        : showResult && selectedAnswer === index && !isCorrect
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="font-semibold mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                    {showResult && index === news.correctAnswer && (
                      <span className="ml-2 text-green-600">✓ Đúng</span>
                    )}
                    {showResult && selectedAnswer === index && !isCorrect && (
                      <span className="ml-2 text-red-600">✗ Sai</span>
                    )}
                  </button>
                ))}
              </div>

              {!showResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:bg-gray-400"
                  disabled={selectedAnswer === null}
                >
                  Kiểm tra đáp án
                </button>
              ) : (
                <div className="mt-6">
                  <div className={`p-4 rounded-lg mb-4 ${
                    isCorrect ? 'bg-green-100 border-l-4 border-green-600' : 'bg-red-100 border-l-4 border-red-600'
                  }`}>
                    <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? '🎉 Chính xác! Bạn đã trả lời đúng!' : '❌ Chưa chính xác. Hãy thử lại!'}
                    </p>
                  </div>
                  <button
                    onClick={handleTryAgain}
                    className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold"
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
