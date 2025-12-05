"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface News {
  _id: string;
  title: string;
  image: string;
  createdAt: string;
}

export default function NewsListPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, [page]);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/user/news?page=${page}&limit=9`);
      const data = await response.json();
      setNewsList(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsClick = (id: string) => {
    router.push(`/news/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">📰 English News</h1>
          <p className="text-blue-100">Đọc tin tức và trả lời câu hỏi để cải thiện tiếng Anh</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : newsList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có bài báo nào</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsList.map(news => (
                <div
                  key={news._id}
                  onClick={() => handleNewsClick(news._id)}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all cursor-pointer overflow-hidden transform hover:scale-105"
                >
                  <div className="relative h-48">
                    <img 
                      src={`http://localhost:3000${news.image}`}
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-800">
                      {news.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>📅</span>
                      <span className="ml-2">
                        {new Date(news.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Trước
                </button>
                <span className="px-4 py-2 border rounded-lg bg-blue-50 text-blue-600 font-semibold">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
