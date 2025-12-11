"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Loader2,
  Trash2,
  Plus,
  FileText,
  CheckCircle2,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface SubQuestion {
  question: string;
  type?: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  headings?: string[];
}

export default function EditReadingQuestion() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [passageNumber, setPassageNumber] = useState<
    "Passage 1" | "Passage 2" | "Passage 3"
  >("Passage 1");
  const [passage, setPassage] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [explanation, setExplanation] = useState("");
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([]);

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // LOAD DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/admin/questions/reading/reading-questions/${id}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Không tải được dữ liệu");
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Lỗi dữ liệu");

        const d = json.data;
        setPassageNumber(d.passageNumber);
        setPassage(d.passage || "");
        setDifficulty(d.difficulty || "medium");
        setExplanation(d.explanation || "");
        setCurrentImage(d.image ? `${BACKEND_URL}${d.image}` : null);

        if (Array.isArray(d.subQuestions)) {
          setSubQuestions(
            d.subQuestions.map((q: any) => ({
              question: q.question || "",
              type: q.type || "multiple_choice",
              options:
                q.type === "multiple_choice"
                  ? q.options || ["", "", "", ""]
                  : undefined,
              correctAnswer: q.correctAnswer || "",
              correctAnswers: q.correctAnswers || [],
              headings: q.headings || [],
            }))
          );
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Preview ảnh
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(imageFile);
    } else {
      setPreviewImage(null);
    }
  }, [imageFile]);

  const addSubQuestion = () => {
    const newQ: SubQuestion = {
      question: "",
      type: subQuestions[0]?.type || "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "A",
      correctAnswers: [],
      headings: [],
    };
    setSubQuestions([...subQuestions, newQ]);
  };

  const removeSubQuestion = (index: number) => {
    if (subQuestions.length === 1) return;
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
  };

  const updateSubQuestion = (
    index: number,
    field: keyof SubQuestion,
    value: any
  ) => {
    setSubQuestions((prev) => {
      const updated = [...prev];
      // @ts-ignore
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData();
    formData.append("passageNumber", passageNumber);
    formData.append("passage", passage);
    formData.append("difficulty", difficulty);
    formData.append("explanation", explanation || "");
    formData.append("subQuestions", JSON.stringify(subQuestions));

    if (imageFile) formData.append("image", imageFile);
    if (removeImage && currentImage) formData.append("removeImage", "true");

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/admin/questions/reading/reading-questions/${id}`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Lưu thất bại");
      }

      alert("CẬP NHẬT THÀNH CÔNG – ĐẸP NHƯ CAMBRIDGE 20!!!");
      router.push("/admin/skills/reading/questions");
    } catch (err: any) {
      setError(err.message || "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-20 h-20 animate-spin text-primary" />
          <p className="text-3xl font-bold mt-6">Đang tải passage...</p>
        </div>
      </div>
    );
  }

  const displayImage =
    previewImage || (currentImage && !removeImage ? currentImage : null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Navbar />
      <div className="mt-16 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              CHỈNH SỬA READING PASSAGE
            </h1>
            <Badge className="text-2xl px-8 py-4 mt-4">ID: {id}</Badge>
          </div>

          {error && (
            <Alert variant="destructive" className="max-w-4xl mx-auto mb-8">
              <AlertDescription className="text-xl font-bold">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* CỘT TRÁI - Thông tin + Ảnh */}
            <div className="space-y-8">
              <Card className="shadow-xl border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <FileText className="w-8 h-8" />
                    Thông tin chung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Passage Number</Label>
                    <Select
                      value={passageNumber}
                      onValueChange={(v) => setPassageNumber(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Passage 1">Passage 1</SelectItem>
                        <SelectItem value="Passage 2">Passage 2</SelectItem>
                        <SelectItem value="Passage 3">Passage 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Độ khó</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(v) => setDifficulty(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-2 border-dashed border-primary/30">
                <CardHeader className="flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl">Hình minh họa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {displayImage && (
                    <div className="relative">
                      <img
                        src={displayImage}
                        alt="Preview"
                        className="w-full h-80 object-contain rounded-xl border-4 border-primary/20"
                      />
                      {currentImage && !previewImage && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-4 right-4"
                          onClick={() => {
                            setRemoveImage(true);
                            setImageFile(null);
                            setPreviewImage(null);
                          }}>
                          <Trash2 className="w-5 h-5 mr-2" /> Xóa ảnh
                        </Button>
                      )}
                    </div>
                  )}

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setRemoveImage(false);
                      }
                    }}
                    className="file:mr-6 file:py-4 file:px-8 file:rounded-xl file:bg-primary file:text-white file:font-bold"
                  />
                  {imageFile && (
                    <p className="text-green-600 font-bold">
                      Đã chọn: {imageFile.name}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* CỘT PHẢI */}
            <div className="lg:col-span-2 space-y-10">
              {/* Passage */}
              <Card className="border-4 border-primary/20 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                  <CardTitle className="text-4xl font-black flex items-center gap-4">
                    <FileText className="w-12 h-12" /> PASSAGE
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <Textarea
                    rows={18}
                    value={passage}
                    onChange={(e) => setPassage(e.target.value)}
                    className="text-lg font-serif leading-relaxed resize-none"
                    placeholder="Dán đoạn văn Reading ở đây..."
                  />
                </CardContent>
              </Card>

              {/* Câu hỏi con */}
              <Card className="shadow-2xl">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle className="text-3xl">
                    Câu hỏi con ({subQuestions.length})
                  </CardTitle>
                  <Button type="button" onClick={addSubQuestion} size="lg">
                    <Plus className="w-6 h-6 mr-2" /> Thêm câu hỏi
                  </Button>
                </CardHeader>
                <CardContent className="space-y-8">
                  {subQuestions.map((q, i) => {
                    const qType = q.type || "multiple_choice";

                    return (
                      <div
                        key={i}
                        className="border-2 border-primary/20 rounded-xl p-8 bg-card">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-bold text-primary">
                            Câu {i + 1}
                          </h3>
                          {subQuestions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSubQuestion(i)}>
                              <Trash2 className="w-6 h-6 text-red-600" />
                            </Button>
                          )}
                        </div>

                        {/* Loại câu hỏi */}
                        <div className="mb-6">
                          <Label>Loại câu hỏi</Label>
                          <Select
                            value={qType}
                            onValueChange={(v) =>
                              updateSubQuestion(i, "type", v)
                            }>
                            <SelectTrigger className="w-full mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">
                                Multiple Choice
                              </SelectItem>
                              <SelectItem value="true_false_not_given">
                                True/False/Not Given
                              </SelectItem>
                              <SelectItem value="yes_no_not_given">
                                Yes/No/Not Given
                              </SelectItem>
                              <SelectItem value="sentence_completion">
                                Sentence Completion
                              </SelectItem>
                              <SelectItem value="summary_completion">
                                Summary Completion
                              </SelectItem>
                              <SelectItem value="matching_headings">
                                Matching Headings
                              </SelectItem>
                              <SelectItem value="diagram_label_completion">
                                Diagram Label Completion
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="mb-6">
                          <Label>Nội dung câu hỏi</Label>
                          <Textarea
                            rows={3}
                            value={q.question}
                            onChange={(e) =>
                              updateSubQuestion(i, "question", e.target.value)
                            }
                            className="mt-2"
                          />
                        </div>

                        {/* Multiple Choice */}
                        {qType === "multiple_choice" && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              {["A", "B", "C", "D"].map((letter, idx) => (
                                <div key={letter}>
                                  <Label>Đáp án {letter}</Label>
                                  <Input
                                    value={q.options?.[idx] || ""}
                                    onChange={(e) => {
                                      const updated = [...subQuestions];
                                      if (!updated[i].options)
                                        updated[i].options = ["", "", "", ""];
                                      updated[i].options![idx] = e.target.value;
                                      setSubQuestions(updated);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="mt-6">
                              <Label>Đáp án đúng</Label>
                              <Select
                                value={q.correctAnswer || ""}
                                onValueChange={(v) =>
                                  updateSubQuestion(i, "correctAnswer", v)
                                }>
                                <SelectTrigger className="w-64">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {["A", "B", "C", "D"].map((x) => (
                                    <SelectItem key={x} value={x}>
                                      {x}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        {/* True/False/Not Given */}
                        {(qType === "true_false_not_given" ||
                          qType === "yes_no_not_given") && (
                          <div className="mt-6">
                            <Label>Đáp án đúng</Label>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              {["True", "False", "Not Given"].map((opt) => {
                                const display =
                                  qType === "yes_no_not_given"
                                    ? opt
                                        .replace("True", "Yes")
                                        .replace("False", "No")
                                    : opt;
                                const isSelected =
                                  q.correctAnswers?.includes(display);

                                return (
                                  <Button
                                    key={opt}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    onClick={() => {
                                      const updated = [...subQuestions];
                                      if (!updated[i].correctAnswers)
                                        updated[i].correctAnswers = [];
                                      if (isSelected) {
                                        updated[i].correctAnswers = updated[
                                          i
                                        ].correctAnswers!.filter(
                                          (a) => a !== display
                                        );
                                      } else {
                                        updated[i].correctAnswers!.push(
                                          display
                                        );
                                      }
                                      setSubQuestions(updated);
                                    }}
                                    className="h-16 text-lg font-bold">
                                    {display}
                                    {isSelected && (
                                      <CheckCircle2 className="ml-2" />
                                    )}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Completion */}
                        {[
                          "sentence_completion",
                          "summary_completion",
                          "diagram_label_completion",
                        ].includes(qType) && (
                          <div className="mt-6">
                            <Label>Đáp án đúng (mỗi dòng 1 đáp án)</Label>
                            <Textarea
                              rows={6}
                              value={(q.correctAnswers || []).join("\n")}
                              onChange={(e) => {
                                const values = e.target.value
                                  .split("\n")
                                  .map((s) => s.trim())
                                  .filter(Boolean);
                                updateSubQuestion(i, "correctAnswers", values);
                              }}
                              className="font-mono"
                              placeholder="morning&#10;9am&#10;London"
                            />
                          </div>
                        )}

                        {/* Matching Headings */}
                        {qType === "matching_headings" && (
                          <div className="mt-6 space-y-6">
                            <div>
                              <Label>Danh sách tiêu đề</Label>
                              <Textarea
                                rows={8}
                                value={(q.headings || []).join("\n")}
                                onChange={(e) => {
                                  const headings = e.target.value
                                    .split("\n")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  updateSubQuestion(i, "headings", headings);
                                }}
                                placeholder="The history of coffee&#10;Health benefits..."
                              />
                            </div>
                            <div>
                              <Label>
                                Ghép đúng (Đoạn 1 → i, Đoạn 2 → v...)
                              </Label>
                              <Input
                                value={(q.correctAnswers || []).join(", ")}
                                onChange={(e) => {
                                  const answers = e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  updateSubQuestion(
                                    i,
                                    "correctAnswers",
                                    answers
                                  );
                                }}
                                placeholder="i, v, iii"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Giải thích */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Giải thích chi tiết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    rows={10}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Giải thích chi tiết cho cả passage..."
                  />
                </CardContent>
              </Card>

              {/* Nút lưu */}
              <div className="flex justify-center gap-10 pt-10">
                <Button
                  type="submit"
                  size="lg"
                  disabled={saving}
                  className="text-4xl px-32 py-12 font-black bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl">
                  {saving ? (
                    <>
                      <Loader2 className="w-12 h-12 mr-4 animate-spin" /> ĐANG
                      LƯU...
                    </>
                  ) : (
                    "LƯU THAY ĐỔI"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/admin/skills/reading/questions")}
                  className="text-4xl px-24 py-12 border-4 font-black">
                  QUAY LẠI
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}
