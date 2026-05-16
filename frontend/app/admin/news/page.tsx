"use client";

import { useState, useEffect } from "react";

interface Question {
  question: string;
  options: [string, string, string];
  correctAnswer: number;
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

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "Admin"
  });
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", ""], correctAnswer: 0 }
  ]);
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

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", ""], correctAnswer: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert("Vui lòng điền tiêu đề và nội dung!");
      return;
    }

    if (!editingNews && !imageFile) {
      alert("Vui lòng chọn ảnh!");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || q.options.some(o => !o)) {
        alert(`Vui lòng điền đầy đủ thông tin cho câu hỏi ${i + 1}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("author", formData.author);
      formDataToSend.append("questions", JSON.stringify(questions));
      
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
          author: "Admin"
        });
        setQuestions([{ question: "", options: ["", "", ""], correctAnswer: 0 }]);
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
      author: news.author
    });
    // Ensure compatibility with old news format if any (though we changed schema, old docs might still exist)
    // Assuming backend returns questions array now. If old doc, might be missing questions or have old fields.
    // Ideally backend migration handles this, but frontend should be safe.
    if (Array.isArray(news.questions) && news.questions.length > 0) {
      setQuestions(news.questions);
    } else {
      // Fallback or empty
       setQuestions([{ question: "", options: ["", "", ""], correctAnswer: 0 }]);
    }
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6 max-h-[90vh] overflow-y-auto">
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

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Danh sách câu hỏi</h3>
                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-50 p-4 rounded-lg mb-4 border relative">
                      <button 
                        onClick={() => removeQuestion(qIndex)}
                        className="absolute top-2 right-2 text-red-500 text-sm hover:underline"
                        title="Xóa câu hỏi"
                      >
                        Xóa
                      </button>
                      <div className="mb-2">
                        <label className="block text-xs font-medium mb-1">Câu hỏi {qIndex + 1}</label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Nhập câu hỏi..."
                        />
                      </div>
                      <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex gap-2 items-center">
                            <span className="text-xs w-20">Đáp án {String.fromCharCode(65 + oIndex)}</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="flex-1 border rounded px-2 py-1 text-sm"
                              placeholder={`Lựa chọn ${oIndex + 1}`}
                            />
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correctAnswer === oIndex}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addQuestion}
                    className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    + Thêm câu hỏi
                  </button>
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

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={isLoading}
                  >
                    {editingNews ? "Cập nhật" : "Tạo mới"}
                  </button>
                  {editingNews && (
                    <button
                      onClick={() => {
                        setEditingNews(null);
                        setFormData({ title: "", content: "", author: "Admin" });
                        setQuestions([{ question: "", options: ["", "", ""], correctAnswer: 0 }]);
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      disabled={isLoading}
                    >
                      Hủy & Tạo mới
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
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
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{news.title}</h3>
                        <p className="text-xs text-gray-500 mb-2">
                           {Array.isArray(news.questions) ? news.questions.length : 0} câu hỏi
                        </p>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{news.content}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleEdit(news)}
                            className="text-sm text-blue-600 hover:underline"
                            disabled={isLoading}
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => handleDelete(news._id)}
                            className="text-sm text-red-600 hover:underline"
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