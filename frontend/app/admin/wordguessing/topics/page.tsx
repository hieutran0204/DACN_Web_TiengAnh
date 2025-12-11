"use client";

import { useState, useEffect } from "react";

interface WordTopic {
  _id: string;
  name: string;
  description?: string;
  totalCards: number;
  createdAt: string;
}

export default function AdminWordTopicsPage() {
  const [topics, setTopics] = useState<WordTopic[]>([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingTopic, setEditingTopic] = useState<WordTopic | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      // FIX: URL đúng theo backend routes
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
    if (!formData.name.trim()) {
      alert("Tên topic là bắt buộc!");
      return;
    }

    setIsLoading(true);
    try {
      // FIX: URL đúng theo backend routes
      const url = editingTopic
        ? `http://localhost:3000/api/admin/wordguessing/topics/${editingTopic._id}`
        : "http://localhost:3000/api/admin/wordguessing/topics";

      const method = editingTopic ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setFormData({ name: "", description: "" });
        setEditingTopic(null);
        await fetchTopics();
        alert(editingTopic ? "Cập nhật thành công!" : "Tạo topic thành công!");
      } else {
        alert(result.message || "Lỗi khi lưu");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (topic: WordTopic) => {
    setEditingTopic(topic);
    setFormData({ name: topic.name, description: topic.description || "" });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Bạn có chắc muốn xóa topic này? Tất cả cards trong topic cũng sẽ bị xóa!"
      )
    )
      return;

    setIsLoading(true);
    try {
      // FIX: URL đúng theo backend routes
      const response = await fetch(
        `http://localhost:3000/api/admin/wordguessing/topics/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchTopics();
        alert("Xóa thành công!");
      } else {
        const result = await response.json();
        alert(result.message || "Lỗi khi xóa");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Quản lý Chủ đề Từ vựng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingTopic ? "Chỉnh sửa Topic" : "Tạo Topic Mới"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tên Topic *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Ví dụ: Animals, Food, Travel..."
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Mô tả về chủ đề này..."
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={isLoading}>
                  {editingTopic ? "Cập nhật" : "Tạo mới"}
                </button>

                {editingTopic && (
                  <button
                    onClick={() => {
                      setEditingTopic(null);
                      setFormData({ name: "", description: "" });
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
              <h2 className="text-xl font-semibold mb-4">
                Danh sách Topics ({topics.length})
              </h2>

              <div className="space-y-3">
                {topics.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Chưa có topic nào
                  </p>
                ) : (
                  topics.map((topic) => (
                    <div
                      key={topic._id}
                      className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {topic.name}
                          </h3>
                          {topic.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {topic.description}
                            </p>
                          )}
                          <div className="flex gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              📝 {topic.totalCards} cards
                            </span>
                            <span className="text-xs text-gray-500">
                              📅{" "}
                              {new Date(topic.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(topic)}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            disabled={isLoading}>
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(topic._id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            disabled={isLoading}>
                            Xóa
                          </button>
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
