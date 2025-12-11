"use client";

import { useState, useEffect } from "react";

interface WordTopic {
  _id: string;
  name: string;
}

interface WordCard {
  _id: string;
  topic: WordTopic;
  keyword: string;
  hintSentence: string;
  sentenceWithBlank: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
}

interface FormData {
  topic: string;
  keyword: string;
  hintSentence: string;
  sentenceWithBlank: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function AdminWordCardsPage() {
  const [cards, setCards] = useState<WordCard[]>([]);
  const [topics, setTopics] = useState<WordTopic[]>([]);
  const [formData, setFormData] = useState<FormData>({
    topic: "",
    keyword: "",
    hintSentence: "",
    sentenceWithBlank: "",
    difficulty: "medium",
  });
  const [editingCard, setEditingCard] = useState<WordCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterTopic, setFilterTopic] = useState("");

  useEffect(() => {
    fetchCards();
    fetchTopics();
  }, []);

  const fetchCards = async () => {
    try {
      // FIX: Đổi từ /wordcards sang /cards
      const response = await fetch(
        "http://localhost:3000/api/admin/wordguessing/cards"
      );
      const data = await response.json();
      setCards(data.data || []);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  const fetchTopics = async () => {
    try {
      // FIX: Đổi từ /wordtopics sang /topics
      const response = await fetch(
        "http://localhost:3000/api/admin/wordguessing/topics"
      );
      const data = await response.json();
      setTopics(data.data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.topic ||
      !formData.keyword ||
      !formData.hintSentence ||
      !formData.sentenceWithBlank
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setIsLoading(true);
    try {
      // FIX: Đổi từ /wordcards sang /cards
      const url = editingCard
        ? `http://localhost:3000/api/admin/wordguessing/cards/${editingCard._id}`
        : "http://localhost:3000/api/admin/wordguessing/cards";

      const method = editingCard ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setFormData({
          topic: "",
          keyword: "",
          hintSentence: "",
          sentenceWithBlank: "",
          difficulty: "medium",
        });
        setEditingCard(null);
        await fetchCards();
        await fetchTopics();
        alert(editingCard ? "Cập nhật thành công!" : "Tạo card thành công!");
      } else {
        alert(result.message || "Lỗi khi lưu");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (card: WordCard) => {
    setEditingCard(card);
    setFormData({
      topic: card.topic._id,
      keyword: card.keyword,
      hintSentence: card.hintSentence,
      sentenceWithBlank: card.sentenceWithBlank,
      difficulty: card.difficulty,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa card này?")) return;

    setIsLoading(true);
    try {
      // FIX: Đổi từ /wordcards sang /cards
      const response = await fetch(
        `http://localhost:3000/api/admin/wordguessing/cards/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchCards();
        await fetchTopics();
        alert("Xóa thành công!");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCards = filterTopic
    ? cards.filter((c) => c.topic._id === filterTopic)
    : cards;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Quản lý Word Cards</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingCard ? "Chỉnh sửa Card" : "Tạo Card Mới"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Topic *
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isLoading}>
                    <option value="">Chọn topic</option>
                    {topics.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Từ cần đoán (Keyword) *
                  </label>
                  <input
                    type="text"
                    value={formData.keyword}
                    onChange={(e) =>
                      setFormData({ ...formData, keyword: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Ví dụ: beautiful"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Câu gợi ý (Hint) *
                  </label>
                  <textarea
                    value={formData.hintSentence}
                    onChange={(e) =>
                      setFormData({ ...formData, hintSentence: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                    placeholder="Ví dụ: Pleasing to the eye; attractive"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Câu có chỗ trống *
                  </label>
                  <textarea
                    value={formData.sentenceWithBlank}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sentenceWithBlank: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                    placeholder="Ví dụ: The sunset is ___."
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dùng ___ để đánh dấu chỗ trống
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={isLoading}>
                  {editingCard ? "Cập nhật" : "Tạo mới"}
                </button>

                {editingCard && (
                  <button
                    onClick={() => {
                      setEditingCard(null);
                      setFormData({
                        topic: "",
                        keyword: "",
                        hintSentence: "",
                        sentenceWithBlank: "",
                        difficulty: "medium",
                      });
                    }}
                    className="w-full border py-2 rounded-lg hover:bg-gray-50"
                    disabled={isLoading}>
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Danh sách Cards ({filteredCards.length})
                </h2>
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="border rounded-lg px-3 py-2">
                  <option value="">Tất cả topics</option>
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {filteredCards.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Chưa có card nào
                  </p>
                ) : (
                  filteredCards.map((card) => (
                    <div key={card._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {card.topic.name}
                          </span>
                          <span
                            className={`ml-2 inline-block text-xs px-2 py-1 rounded ${
                              card.difficulty === "easy"
                                ? "bg-green-100 text-green-800"
                                : card.difficulty === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}>
                            {card.difficulty}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(card)}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            disabled={isLoading}>
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(card._id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            disabled={isLoading}>
                            Xóa
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-sm">
                            Keyword:
                          </span>
                          <span className="ml-2 text-lg font-bold text-blue-600">
                            {card.keyword}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-sm">Hint:</span>
                          <p className="text-gray-700 text-sm italic">
                            {card.hintSentence}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-sm">
                            Sentence:
                          </span>
                          <p className="text-gray-700 text-sm">
                            {card.sentenceWithBlank}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
