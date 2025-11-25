// app/admin/skills/speaking/questions/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Mic } from "lucide-react";

export default function NewSpeakingQuestion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subQuestions, setSubQuestions] = useState<string[]>([""]);
  const [suggestedIdeas, setSuggestedIdeas] = useState<string[]>([""]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Xử lý subQuestions & suggestedIdeas
    const cleanSubQuestions = subQuestions
      .map((q) => q.trim())
      .filter((q) => q);
    const cleanIdeas = suggestedIdeas.map((i) => i.trim()).filter((i) => i);

    formData.append("subQuestions", JSON.stringify(cleanSubQuestions));
    formData.append("suggestedIdeas", JSON.stringify(cleanIdeas));

    try {
      // ĐÚNG 100% THEO CẤU TRÚC CỦA CON
      const res = await fetch(
        "http://localhost:3000/api/admin/questions/speaking",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Lỗi từ backend:", res.status, text);
        alert(`Lỗi ${res.status}: ${text.substring(0, 300)}`);
        return;
      }

      await res.json();
      alert("TẠO CÂU HỎI SPEAKING THÀNH CÔNG – ĐỈNH CAO NHƯ CAMBRIDGE 20!!!");
      router.push("/admin/skills/speaking/questions");
    } catch (err) {
      console.error("Lỗi mạng:", err);
      alert("Không kết nối được backend – kiểm tra server có chạy không!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Navbar />
      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            TẠO CÂU HỎI SPEAKING MỚI
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CỘT TRÁI */}
            <div className="space-y-8">
              <Card className="shadow-2xl border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Mic className="w-10 h-10 text-purple-600" />
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-lg">Part</Label>
                    <select
                      name="part"
                      required
                      className="w-full mt-2 p-4 border-2 rounded-xl text-lg bg-white">
                      <option value="">Chọn Part</option>
                      <option value="Part 1">Part 1</option>
                      <option value="Part 2">Part 2</option>
                      <option value="Part 3">Part 3</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-lg">Topic</Label>
                    <Input
                      name="topic"
                      required
                      placeholder="Hometown, Travel..."
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg">Loại câu hỏi</Label>
                    <select
                      name="type"
                      required
                      className="w-full mt-2 p-4 border-2 rounded-xl text-lg bg-white">
                      <option value="personal_experience">
                        Personal Experience
                      </option>
                      <option value="descriptive">Descriptive</option>
                      <option value="comparative">Comparative</option>
                      <option value="opinion_based">Opinion</option>
                      <option value="cause_effect">Cause & Effect</option>
                      <option value="hypothetical">Hypothetical</option>
                      <option value="advantage_disadvantage">Adv/Disadv</option>
                      <option value="problem_solution">
                        Problem & Solution
                      </option>
                      <option value="prediction">Prediction</option>
                      <option value="abstract">Abstract</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-lg">Độ khó</Label>
                    <select
                      name="difficulty"
                      defaultValue="medium"
                      className="w-full mt-2 p-4 border-2 rounded-xl text-lg bg-white">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Hình minh họa (tùy chọn)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }}
                    className="file:mr-6 file:py-6 file:px-10 file:rounded-xl file:bg-purple-600 file:text-white file:font-bold text-lg"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-6 w-full h-80 object-cover rounded-xl border-4 border-purple-300"
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* CỘT PHẢI */}
            <div className="lg:col-span-2 space-y-10">
              <Card className="shadow-2xl border-4 border-purple-300">
                <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
                  <CardTitle className="text-4xl font-black">
                    CÂU HỎI CHÍNH
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <Textarea
                    name="question"
                    required
                    rows={6}
                    placeholder="Describe a time when..."
                    className="text-xl font-medium resize-none"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl">
                    Cue Card / Follow-up Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subQuestions.map((q, i) => (
                    <div key={i} className="flex gap-3">
                      <Input
                        value={q}
                        onChange={(e) => {
                          const updated = [...subQuestions];
                          updated[i] = e.target.value;
                          setSubQuestions(updated);
                        }}
                        placeholder={`Dòng ${i + 1}...`}
                        className="text-lg"
                      />
                      {subQuestions.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            setSubQuestions((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }>
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSubQuestions([...subQuestions, ""])}
                    className="w-full">
                    <Plus className="mr-2" /> Thêm dòng
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl">
                    Suggested Ideas / Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestedIdeas.map((idea, i) => (
                    <div key={i} className="flex gap-3">
                      <Input
                        value={idea}
                        onChange={(e) => {
                          const updated = [...suggestedIdeas];
                          updated[i] = e.target.value;
                          setSuggestedIdeas(updated);
                        }}
                        placeholder="Từ khóa hoặc ý tưởng..."
                      />
                      {suggestedIdeas.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            setSuggestedIdeas((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }>
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSuggestedIdeas([...suggestedIdeas, ""])}
                    className="w-full">
                    <Plus className="mr-2" /> Thêm ý tưởng
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl">Sample Answer</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="sampleAnswer"
                    rows={12}
                    placeholder="Viết đáp án mẫu ở đây..."
                    className="text-lg font-serif leading-relaxed"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-center gap-10 pt-10">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="text-5xl px-40 py-16 font-black bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl">
                  {loading ? "ĐANG TẠO..." : "TẠO CÂU HỎI"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    router.push("/admin/skills/speaking/questions")
                  }
                  className="text-5xl px-32 py-16 border-4 font-black">
                  QUAY LẠI
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
