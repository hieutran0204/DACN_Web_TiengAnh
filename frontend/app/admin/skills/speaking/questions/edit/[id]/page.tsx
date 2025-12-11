"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";

interface SpeakingQuestion {
  _id: string;
  topic: string;
  type: string;
  question: string;
  subQuestions: string[];
  suggestedIdeas: string[];
  sampleAnswer: string;
  image?: string;
  difficulty: string;
}

export default function EditSpeakingQuestion() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [question, setQuestion] = useState<SpeakingQuestion | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [subQuestions, setSubQuestions] = useState<string[]>([""]);
  const [suggestedIdeas, setSuggestedIdeas] = useState<string[]>([""]);

  // LOAD DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/questions/speaking/${id}`
        );
        const json = await res.json();
        if (!json.success) throw new Error("Không tải được");

        const q = json.data;
        setQuestion(q);
        setSubQuestions(q.subQuestions.length > 0 ? q.subQuestions : [""]);
        setSuggestedIdeas(
          q.suggestedIdeas.length > 0 ? q.suggestedIdeas : [""]
        );
        if (q.image) {
          setImagePreview(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${q.image}`
          );
        }
      } catch (err) {
        alert("Lỗi tải dữ liệu câu hỏi!");
        router.push("/admin/skills/speaking/questions");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question) return;

    setSaving(true);
    const formData = new FormData(e.currentTarget);

    // Lọc dữ liệu rỗng
    const cleanedSubQuestions = subQuestions.filter((q) => q.trim());
    const cleanedIdeas = suggestedIdeas.filter((i) => i.trim());

    formData.append("subQuestions", JSON.stringify(cleanedSubQuestions));
    formData.append("suggestedIdeas", JSON.stringify(cleanedIdeas));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/questions/speaking/${id}`,
        {
          method: "PUT", // CHỈNH SỬA = PUT
          body: formData,
          credentials: "include",
        }
      );

      const result = await res.json();

      if (res.ok && result.success) {
        alert("CẬP NHẬT THÀNH CÔNG – ĐỈNH CAO NHƯ IELTS 9.0!!!");
        router.push("/admin/skills/speaking/questions");
      } else {
        alert("Lỗi: " + (result.message || "Không thể cập nhật"));
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
      alert("Lỗi kết nối – Backend có chạy không con?");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-24 h-24 animate-spin text-purple-600" />
          <p className="text-4xl font-bold mt-8 text-purple-700">
            Đang tải câu hỏi...
          </p>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Navbar />
      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-7xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              CHỈNH SỬA SPEAKING QUESTION
            </h1>
            <p className="text-3xl mt-4 text-purple-700">
              ID: <Badge className="text-2xl px-6 py-3">{id}</Badge>
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/admin/skills/speaking/questions")}
            className="text-2xl px-10 py-8 border-4 font-bold">
            <ArrowLeft className="mr-4 w-10 h-10" />
            Quay lại danh sách
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* CỘT TRÁI */}
            <div className="space-y-8">
              <Card className="shadow-2xl border-2 border-purple-300">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                  <CardTitle className="text-3xl font-black">
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div>
                    <Label className="text-xl font-bold">Topic</Label>
                    <Input
                      name="topic"
                      defaultValue={question.topic}
                      required
                      className="text-xl mt-3 h-14"
                      placeholder="Ví dụ: Technology, Environment..."
                    />
                  </div>

                  <div>
                    <Label className="text-xl font-bold">Loại câu hỏi</Label>
                    <select
                      name="type"
                      defaultValue={question.type}
                      required
                      className="w-full mt-3 p-5 border-2 rounded-xl text-xl bg-white">
                      <option value="personal_experience">
                        Personal Experience
                      </option>
                      <option value="descriptive">Descriptive</option>
                      <option value="comparative">Comparative</option>
                      <option value="opinion_based">Opinion</option>
                      <option value="cause_effect">Cause & Effect</option>
                      <option value="hypothetical">Hypothetical</option>
                      <option value="advantage_disadvantage">
                        Advantages/Disadvantages
                      </option>
                      <option value="problem_solution">
                        Problem & Solution
                      </option>
                      <option value="prediction">Prediction</option>
                      <option value="abstract">Abstract</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xl font-bold">Độ khó</Label>
                    <select
                      name="difficulty"
                      defaultValue={question.difficulty}
                      className="w-full mt-3 p-5 border-2 rounded-xl text-xl bg-white">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* HÌNH ẢNH */}
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold">
                    Hình minh họa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {imagePreview && !removeImage && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Current"
                        className="w-full h-80 object-cover rounded-xl border-4 border-purple-300"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="lg"
                        className="absolute top-4 right-4"
                        onClick={() => {
                          setRemoveImage(true);
                          setImagePreview(null);
                        }}>
                        <Trash2 className="w-6 h-6 mr-2" />
                        Xóa ảnh
                      </Button>
                    </div>
                  )}

                  <Input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImagePreview(URL.createObjectURL(file)); // ĐÃ SỬA ĐÚNG RỒI!!!
                        setRemoveImage(false);
                      }
                    }}
                    className="file:mr-6 file:py-8 file:px-12 file:rounded-xl file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:text-white file:font-bold text-xl cursor-pointer"
                  />
                </CardContent>
              </Card>
            </div>

            {/* CỘT PHẢI */}
            <div className="lg:col-span-2 space-y-10">
              <Card className="shadow-2xl border-4 border-purple-400">
                <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
                  <CardTitle className="text-5xl font-black text-purple-800">
                    CÂU HỎI CHÍNH
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-10">
                  <Textarea
                    name="question"
                    defaultValue={question.question}
                    required
                    rows={8}
                    className="text-2xl font-medium resize-none leading-relaxed"
                    placeholder="Nhập câu hỏi chính ở đây..."
                  />
                </CardContent>
              </Card>

              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-purple-700">
                    Cue Card / Follow-up Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {subQuestions.map((q, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <span className="text-2xl font-bold text-purple-600">
                        {i + 1}.
                      </span>
                      <Input
                        value={q}
                        onChange={(e) => {
                          const updated = [...subQuestions];
                          updated[i] = e.target.value;
                          setSubQuestions(updated);
                        }}
                        placeholder={`Dòng ${i + 1}...`}
                        className="text-xl flex-1"
                      />
                      {subQuestions.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-14 w-14"
                          onClick={() =>
                            setSubQuestions((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }>
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setSubQuestions([...subQuestions, ""])}
                    className="w-full text-xl py-8 border-4 font-bold">
                    <Plus className="mr-3 w-10 h-10" />
                    Thêm dòng mới
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-purple-700">
                    Suggested Ideas & Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {suggestedIdeas.map((idea, i) => (
                    <div key={i} className="flex gap-4">
                      <Input
                        value={idea}
                        onChange={(e) => {
                          const updated = [...suggestedIdeas];
                          updated[i] = e.target.value;
                          setSuggestedIdeas(updated);
                        }}
                        placeholder="Từ khóa hoặc ý tưởng..."
                        className="text-xl"
                      />
                      {suggestedIdeas.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-14 w-14"
                          onClick={() =>
                            setSuggestedIdeas((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }>
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setSuggestedIdeas([...suggestedIdeas, ""])}
                    className="w-full text-xl py-8 border-4 font-bold">
                    <Plus className="mr-3 w-10 h-10" />
                    Thêm ý tưởng
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100">
                  <CardTitle className="text-5xl font-black text-indigo-800">
                    Sample Answer (Band 8.0+)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <Textarea
                    name="sampleAnswer"
                    defaultValue={question.sampleAnswer}
                    rows={16}
                    className="text-xl font-serif leading-relaxed resize-none"
                    placeholder="Viết mẫu trả lời đỉnh cao ở đây..."
                  />
                </CardContent>
              </Card>

              {/* NÚT LƯU */}
              <div className="flex justify-center gap-12 pt-12">
                <Button
                  type="submit"
                  size="lg"
                  disabled={saving}
                  className="text-6xl px-48 py-20 font-black bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-3xl transform hover:scale-105 transition-all">
                  {saving ? (
                    <>
                      <Loader2 className="w-20 h-20 mr-8 animate-spin" />
                      ĐANG LƯU...
                    </>
                  ) : (
                    "LƯU THAY ĐỔI"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
