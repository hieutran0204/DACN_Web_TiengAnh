"use client";
import { useState, useEffect } from "react";

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface MatchingGame {
  _id: string;
  category: Category;
  words: string[];
  meanings: string[];
  difficulty: "easy" | "medium" | "hard";
  status: "active" | "inactive";
  createdAt: string;
}

interface FormData {
  category: string;
  words: string[];
  meanings: string[];
  difficulty: "easy" | "medium" | "hard";
  status: "active" | "inactive";
}

export default function AdminMatchingGamePage() {
  const [games, setGames] = useState<MatchingGame[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    category: "",
    words: ["", "", "", ""],
    meanings: ["", "", "", ""],
    difficulty: "medium",
    status: "active"
  });
  const [editingGame, setEditingGame] = useState<MatchingGame | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    fetchGames();
    fetchCategories();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/game/matching");
      const data = await response.json();
      setGames(data.data || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/game/categories");
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...formData.words];
    newWords[index] = value;
    setFormData({ ...formData, words: newWords });
  };

  const handleMeaningChange = (index: number, value: string) => {
    const newMeanings = [...formData.meanings];
    newMeanings[index] = value;
    setFormData({ ...formData, meanings: newMeanings });
  };

  // ... (giữ nguyên phần đầu)

const handleSubmit = async () => {
  if (!formData.category) {
    alert("Vui lòng chọn category!");
    return;
  }
  if (formData.words.some(w => !w.trim())) {
    alert("Vui lòng nhập đầy đủ 4 từ!");
    return;
  }
  if (formData.meanings.some(m => !m.trim())) {
    alert("Vui lòng nhập đầy đủ 4 nghĩa!");
    return;
  }

  setIsLoading(true);
  try {
    const url = editingGame
      ? `http://localhost:3000/api/admin/game/matching/${editingGame._id}`
      : "http://localhost:3000/api/admin/game/matching";

    const method = editingGame ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      const updatedGame = result.data; // Dữ liệu mới nhất từ server

      if (editingGame) {
        // Cập nhật ngay trong state mà không cần refresh
        setGames(prev => prev.map(g =>
          g._id === editingGame._id ? updatedGame : g
        ));
      } else {
        // Thêm game mới vào đầu danh sách
        setGames(prev => [updatedGame, ...prev]);
      }

      // Reset form
      setFormData({
        category: "",
        words: ["", "", "", ""],
        meanings: ["", "", "", ""],
        difficulty: "medium",
        status: "active"
      });
      setEditingGame(null);

      alert(editingGame ? "Cập nhật thành công!" : "Tạo game thành công!");
    } else {
      alert(result.message || "Lỗi khi lưu");
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối server");
  } finally {
    setIsLoading(false);
  }
};

  const handleEdit = (game: MatchingGame) => {
    setEditingGame(game);
    setFormData({
      category: game.category._id,
      words: [...game.words],
      meanings: [...game.meanings],
      difficulty: game.difficulty,
      status: game.status
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa game này?")) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/admin/game/matching/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        // Refresh danh sách ngay lập tức
        await fetchGames();
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

  const filteredGames = filterCategory 
    ? games.filter(g => g.category._id === filterCategory)
    : games;

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Đang hoạt động' : 'Tạm ẩn';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Quản lý Matching Game</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingGame ? "Chỉnh sửa Game" : "Tạo Game Mới"}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isLoading}
                  >
                    <option value="">Chọn category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Độ khó</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isLoading}
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isLoading}
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Tạm ẩn</option>
                  </select>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">4 Từ và Nghĩa</h3>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium mb-1">Từ tiếng Anh {i + 1} *</label>
                      <input
                        type="text"
                        value={formData.words[i]}
                        onChange={(e) => handleWordChange(i, e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-2"
                        placeholder="Ví dụ: cat, dog, apple..."
                        disabled={isLoading}
                      />
                      <label className="block text-xs font-medium mb-1">Nghĩa tiếng Việt {i + 1} *</label>
                      <input
                        type="text"
                        value={formData.meanings[i]}
                        onChange={(e) => handleMeaningChange(i, e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Ví dụ: con mèo, con chó, quả táo..."
                        disabled={isLoading}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {editingGame ? "Cập nhật" : "Tạo mới"}
                </button>

                {editingGame && (
                  <button
                    onClick={() => {
                      setEditingGame(null);
                      setFormData({
                        category: "",
                        words: ["", "", "", ""],
                        meanings: ["", "", "", ""],
                        difficulty: "medium",
                        status: "active"
                      });
                    }}
                    className="w-full border py-2 rounded-lg hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Danh sách Games ({filteredGames.length})
                </h2>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="">Tất cả categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {filteredGames.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Chưa có game nào</p>
                ) : (
                  filteredGames.map(game => (
                    <div key={game._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {game.category.name}
                          </span>
                          <span className={`ml-2 inline-block text-xs px-2 py-1 rounded ${getDifficultyColor(game.difficulty)}`}>
                            {game.difficulty}
                          </span>
                          <span className={`ml-2 inline-block text-xs px-2 py-1 rounded ${getStatusColor(game.status)}`}>
                            {getStatusText(game.status)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(game)}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            disabled={isLoading}
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(game._id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            disabled={isLoading}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Từ tiếng Anh:</h4>
                          <ul className="text-sm space-y-1">
                            {game.words.map((word, i) => (
                              <li key={i} className="text-gray-700">• {word}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Nghĩa tiếng Việt:</h4>
                          <ul className="text-sm space-y-1">
                            {game.meanings.map((meaning, i) => (
                              <li key={i} className="text-gray-700">• {meaning}</li>
                            ))}
                          </ul>
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