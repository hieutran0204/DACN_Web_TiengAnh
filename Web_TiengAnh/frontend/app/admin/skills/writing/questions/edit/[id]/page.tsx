"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface WritingQuestion {
  _id: string;
  task: string;
  type: string;
  topic: string;
  question: string;
  image?: string;
  sampleAnswer?: string;
  difficulty?: string;
}

export default function EditWritingQuestion() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [question, setQuestion] = useState<WritingQuestion | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/api/admin/questions/writing/${id}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const q = res.data;
          setQuestion(q);
          if (q.image) {
            setImagePreview(
              q.image.startsWith("http") ? q.image : `${API_URL}${q.image}`
            );
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi load đề:", err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question) return;

    setSaving(true);
    const formData = new FormData(e.currentTarget);
    if (removeImage) formData.append("removeImage", "true");

    try {
      const res = await fetch(`${API_URL}/api/admin/questions/writing/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        alert("CẬP NHẬT THÀNH CÔNG – ĐỀ ĐÃ ĐẸP HƠN BAND 9.5 LUÔN!!!");
        router.push("/admin/skills/writing/questions");
      } else {
        alert("Lỗi khi lưu: " + (result.message || "Không rõ"));
      }
    } catch (err) {
      alert("Lỗi mạng rồi con ơi!");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-24 h-24 animate-spin text-purple-600 mx-auto mb-8" />
          <p className="text-5xl font-black text-purple-600">
            Đang tải đề xịn xò...
          </p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <p className="text-6xl font-black text-red-600 mb-8">
            KHÔNG TÌM THẤY ĐỀ!
          </p>
          <Button size="lg" asChild>
            <Link href="/admin/skills/writing/questions">
              <ArrowLeft className="mr-3" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <Navbar />

      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        <div className="flex justify-between items-center mb-12">
          <Button variant="ghost" size="lg" asChild>
            <Link
              href="/admin/skills/writing/questions"
              className="text-xl hover:scale-105 transition">
              <ArrowLeft className="mr-4 w-8 h-8" />
              Quay lại danh sách
            </Link>
          </Button>

          <h1 className="text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent text-center">
            CHỈNH SỬA ĐỀ WRITING
          </h1>

          <div className="w-32" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* CỘT TRÁI */}
            <div className="space-y-8">
              <Card className="shadow-3xl border-4 border-purple-300">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="text-4xl font-black">
                    THÔNG TIN ĐỀ
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                  {/* Task */}
                  <div>
                    <Label className="text-xl font-bold">Task</Label>
                    <Select name="task" defaultValue={question.task}>
                      <SelectTrigger className="h-14 text-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Task 1">Task 1</SelectItem>
                        <SelectItem value="Task 2">Task 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Loại đề – ĐÃ SỬA HOÀN HẢO 100% */}
                  <div>
                    <Label className="text-xl font-bold">Loại đề</Label>
                    <Select name="type" defaultValue={question.type}>
                      <SelectTrigger className="h-14 text-xl">
                        <SelectValue placeholder="Chọn loại đề..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-96">
                        {/* TASK 1 */}
                        <div className="px-4 py-2 text-xs font-extrabold text-purple-700 bg-purple-100 border-b border-purple-300">
                          TASK 1 – Charts & Diagrams
                        </div>
                        <SelectItem value="bar_chart">Bar Chart</SelectItem>
                        <SelectItem value="line_graph">Line Graph</SelectItem>
                        <SelectItem value="pie_chart">Pie Chart</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="process">Process Diagram</SelectItem>
                        <SelectItem value="map">Map</SelectItem>
                        <SelectItem value="mixed_chart">
                          Mixed Charts
                        </SelectItem>

                        {/* TASK 2 */}
                        <div className="px-4 py-2 mt-3 text-xs font-extrabold text-pink-700 bg-pink-100 border-b border-pink-300">
                          TASK 2 – Essay Types
                        </div>
                        <SelectItem value="opinion">Opinion Essay</SelectItem>
                        <SelectItem value="discussion">
                          Discussion Essay
                        </SelectItem>
                        <SelectItem value="problem_solution">
                          Problem & Solution
                        </SelectItem>
                        <SelectItem value="cause_effect">
                          Cause & Effect
                        </SelectItem>
                        <SelectItem value="advantage_disadvantage">
                          Advantages/Disadvantages
                        </SelectItem>
                        <SelectItem value="two_part_question">
                          Two-Part Question
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic */}
                  <div>
                    <Label className="text-xl font-bold">Chủ đề (Topic)</Label>
                    <Input
                      name="topic"
                      defaultValue={question.topic}
                      required
                      className="h-14 text-xl"
                      placeholder="Ví dụ: Education, Environment..."
                    />
                  </div>

                  {/* Hình ảnh */}
                  <div>
                    <Label className="text-xl font-bold mb-4 block">
                      Hình ảnh (Task 1)
                    </Label>

                    {imagePreview && !removeImage && (
                      <div className="relative mb-6 rounded-xl overflow-hidden border-4 border-purple-200 shadow-xl">
                        <img
                          src={imagePreview}
                          alt="Current"
                          className="w-full object-contain max-h-96"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setRemoveImage(true);
                            setImagePreview(null);
                          }}
                          className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition">
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    )}

                    {removeImage && (
                      <p className="text-red-600 font-bold text-center py-8 border-4 border-dashed border-red-300 rounded-xl bg-red-50">
                        Đã xóa ảnh cũ – Upload ảnh mới nếu muốn
                      </p>
                    )}

                    <Input
                      type="file"
                      name="image"
                      accept="image/*"
                      className="mt-6 file:mr-6 file:py-4 file:px-8 file:rounded-full file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:text-white hover:file:from-purple-700 hover:file:to-pink-700 cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CỘT PHẢI */}
            <div className="lg:col-span-2 space-y-10">
              <Card className="shadow-3xl border-8 border-cyan-500">
                <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
                  <CardTitle className="text-6xl font-black">
                    ĐỀ BÀI IELTS
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-10">
                  <Textarea
                    name="question"
                    defaultValue={question.question}
                    required
                    rows={14}
                    className="text-2xl leading-relaxed resize-none font-medium"
                    placeholder="Nhập đề bài đầy đủ ở đây..."
                  />
                </CardContent>
              </Card>

              <Card className="shadow-3xl border-8 border-emerald-500">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
                  <CardTitle className="text-6xl font-black">
                    SAMPLE ANSWER – BAND 9.0
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-10">
                  <Textarea
                    name="sampleAnswer"
                    defaultValue={question.sampleAnswer || ""}
                    rows={28}
                    className="text-xl font-serif leading-9 resize-none"
                    placeholder="Viết bài mẫu band 9.0 ở đây... (tùy chọn)"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-center pt-10">
                <Button
                  type="submit"
                  size="lg"
                  disabled={saving}
                  className="text-5xl px-32 py-16 font-black rounded-3xl shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all duration-300">
                  {saving ? (
                    <>
                      <Loader2 className="mr-6 w-16 h-16 animate-spin" />
                      ĐANG LƯU...
                    </>
                  ) : (
                    <>
                      <Save className="mr-6 w-16 h-16" />
                      LƯU THAY ĐỔI NGAY
                    </>
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
