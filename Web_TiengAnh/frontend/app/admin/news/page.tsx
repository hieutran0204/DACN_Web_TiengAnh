"use client";

import { useState, useEffect } from "react";

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

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    question: "",
    option0: "",
    option1: "",
    option2: "",
    correctAnswer: 0,
    author: "Admin"
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/news");
      const data = await response.json();
      setNewsList(data.data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.question) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!formData.option0 || !formData.option1 || !formData.option2) {
      alert("Vui lòng điền đầy đủ 3 đáp án!");
      return;
    }

    if (!editingNews && !imageFile) {
      alert("Vui lòng chọn ảnh!");
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("question", formData.question);
      formDataToSend.append("options", JSON.stringify([formData.option0, formData.option1, formData.option2]));
      formDataToSend.append("correctAnswer", formData.correctAnswer.toString());
      formDataToSend.append("author", formData.author);
      
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const url = editingNews 
        ? `http://localhost:3000/api/admin/news/${editingNews._id}`
        : "http://localhost:3000/api/admin/news";
      
      const method = editingNews ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const result = await response.json();
      
      if (response.ok) {
        setFormData({
          title: "",
          content: "",
          question: "",
          option0: "",
          option1: "",
          option2: "",
          correctAnswer: 0,
          author: "Admin"
        });
        setImageFile(null);
        setImagePreview("");
        setEditingNews(null);
        await fetchNews();
        alert(editingNews ? "Cập nhật thành công!" : "Tạo bài báo thành công!");
      } else {
        alert(result.message || "Lỗi khi lưu");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (news: News) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      content: news.content,
      question: news.question,
      option0: news.options[0],
      option1: news.options[1],
      option2: news.options[2],
      correctAnswer: news.correctAnswer,
      author: news.author
    });
    setImagePreview(`http://localhost:3000${news.image}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài báo này?")) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/admin/news/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchNews();
        alert("Xóa thành công!");
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
        <h1 className="text-3xl font-bold mb-6">Quản lý Tin tức</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingNews ? "Chỉnh sửa Bài báo" : "Tạo Bài báo Mới"}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tiêu đề *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Tiêu đề bài báo..."
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ảnh bìa *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isLoading}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 w-full h-40 object-cover rounded" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nội dung *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={5}
                    placeholder="Nội dung bài báo..."
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Câu hỏi *</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Câu hỏi trắc nghiệm..."
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Đáp án A *</label>
                  <input
                    type="text"
                    value={formData.option0}
                    onChange={(e) => setFormData({ ...formData, option0: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Đáp án B *</label>
                  <input
                    type="text"
                    value={formData.option1}
                    onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Đáp án C *</label>
                  <input
                    type="text"
                    value={formData.option2}
                    onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Đáp án đúng *</label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isLoading}
                  >
                    <option value={0}>A</option>
                    <option value={1}>B</option>
                    <option value={2}>C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tác giả</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {editingNews ? "Cập nhật" : "Tạo mới"}
                </button>

                {editingNews && (
                  <button
                    onClick={() => {
                      setEditingNews(null);
                      setFormData({
                        title: "",
                        content: "",
                        question: "",
                        option0: "",
                        option1: "",
                        option2: "",
                        correctAnswer: 0,
                        author: "Admin"
                      });
                      setImageFile(null);
                      setImagePreview("");
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

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Danh sách Tin tức ({newsList.length})
              </h2>

              <div className="space-y-4">
                {newsList.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Chưa có bài báo nào</p>
                ) : (
                  newsList.map(news => (
                    <div key={news._id} className="border rounded-lg p-4 flex gap-4">
                      <img 
                        src={`http://localhost:3000${news.image}`} 
                        alt={news.title}
                        className="w-32 h-32 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{news.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{news.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span>👤 {news.author}</span>
                          <span>📅 {new Date(news.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(news)}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            disabled={isLoading}
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(news._id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            disabled={isLoading}
                          >
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