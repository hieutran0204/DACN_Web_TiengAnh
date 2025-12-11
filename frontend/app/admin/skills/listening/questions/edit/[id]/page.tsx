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
import { Headphones, Plus, Trash2, AlertCircle, Loader2 } from "lucide-react";

interface SubQuestion {
  question: string;
  correctAnswers: string[];
  options?: string[];
}

export default function EditListeningQuestion() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // ===== TRẠNG THÁI CHÍNH =====
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [type, setType] = useState<string>(""); // ← ĐÃ SỬA: không default multiple_choice nữa!
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [transcript, setTranscript] = useState("");
  const [explanation, setExplanation] = useState("");

  // Fill / Note / Sentence
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState<string[]>([""]);

  // Multiple Choice & Matching
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([]);
  const [matchingOptions, setMatchingOptions] = useState<string[]>([
    "",
    "",
    "",
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:3000/api/admin/questions/listening";

  // ===== TẢI DỮ LIỆU – HOÀN HẢO 100% =====
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`${API_BASE}/listening-questions/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Không tải được câu hỏi");

        const result = await res.json();
        const q = result.data;

        // GÁN THEO ĐÚNG THỨ TỰ – type phải gán TRƯỚC để form render đúng
        setType(q.type || "multiple_choice");
        setTitle(q.title || "");
        setSection(q.section || "");
        setCurrentAudioUrl(q.audio || "");
        setTranscript(q.transcript || "");
        setExplanation(q.explanation || "");

        // XỬ LÝ SUBQUESTIONS – HỖ TRỢ CẢ correctAnswer (singular) VÀ correctAnswers (array)
        if (q.subQuestions && q.subQuestions.length > 0) {
          const normalized = q.subQuestions.map((sq: any) => {
            const correctAns = sq.correctAnswer
              ? [sq.correctAnswer]
              : Array.isArray(sq.correctAnswers)
                ? sq.correctAnswers
                : [];

            return {
              question: sq.question || "",
              correctAnswers: correctAns,
              options: sq.options || ["", "", "", ""],
            };
          });

          if (
            [
              "fill_in_the_blank",
              "note_completion",
              "sentence_completion",
            ].includes(q.type)
          ) {
            setQuestionText(normalized[0]?.question || "");
            setAnswers(normalized[0]?.correctAnswers || [""]);
          } else {
            setSubQuestions(normalized);
          }
        }

        if (q.matchingOptions && q.matchingOptions.length > 0) {
          setMatchingOptions(q.matchingOptions);
        }
      } catch (err: any) {
        setError("Lỗi tải dữ liệu: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuestion();
  }, [id]);

  // ===== XỬ LÝ AUDIO MỚI =====
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  // ===== THÊM CÂU HỎI CON (Multiple Choice) =====
  const addSubQuestion = () => {
    setSubQuestions([
      ...subQuestions,
      { question: "", correctAnswers: [], options: ["", "", "", ""] },
    ]);
  };

  const removeSubQuestion = (index: number) => {
    if (subQuestions.length === 1) return;
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
  };

  // ===== LƯU THAY ĐỔI =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("section", section);
    formData.append("type", type);
    formData.append("transcript", transcript);
    formData.append("explanation", explanation);

    if (
      ["fill_in_the_blank", "note_completion", "sentence_completion"].includes(
        type
      )
    ) {
      formData.append(
        "subQuestions",
        JSON.stringify([
          {
            question: questionText,
            correctAnswers: answers.map((a) => a.trim()).filter(Boolean),
          },
        ])
      );
    } else {
      const cleaned = subQuestions.map((sq) => ({
        question: sq.question.trim(),
        correctAnswers: sq.correctAnswers,
        options: type === "multiple_choice" ? sq.options : undefined,
      }));
      formData.append("subQuestions", JSON.stringify(cleaned));
    }

    if (type === "matching") {
      formData.append(
        "matchingOptions",
        JSON.stringify(matchingOptions.map((o) => o.trim()).filter(Boolean))
      );
    }

    if (audioFile) formData.append("audio", audioFile);

    try {
      const res = await fetch(`${API_BASE}/listening-questions/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Lưu thất bại");
      }

      alert("CẬP NHẬT THÀNH CÔNG RỒI CHA ƠI!!!");
      router.push("/admin/skills/listening/questions");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-2xl font-bold">Đang tải câu hỏi siêu xịn...</p>
        </div>
      </main>
    );
  }

  // ===== RENDER CHÍNH – ĐẸP NHƯ TRANG NEW =====
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mt-16 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Chỉnh sửa câu hỏi Listening
            </h1>
            <p className="text-xl text-muted-foreground">ID: {id}</p>
          </div>

          {error && (
            <Alert variant="destructive" className="max-w-4xl mx-auto mb-10">
              <AlertCircle className="h-6 w-6" />
              <AlertDescription className="text-lg font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* CỘT TRÁI */}
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-lg">Tiêu đề</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Cambridge 18 Test 1 - Section 2"
                      />
                    </div>
                    <div>
                      <Label className="text-lg">Section</Label>
                      <Input value={section} disabled className="bg-muted" />
                    </div>
                    <div>
                      <Label className="text-lg">Loại câu hỏi</Label>
                      <Input
                        value={type.replace(/_/g, " ").toUpperCase()}
                        disabled
                        className="bg-muted font-semibold"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-primary/30">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Headphones className="w-8 h-8 text-primary" />
                    <CardTitle className="text-2xl">File Audio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentAudioUrl && !audioFile && (
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="font-medium mb-2">Audio hiện tại</p>
                        <audio
                          controls
                          src={currentAudioUrl}
                          className="w-full"
                        />
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioChange}
                    />
                    {audioFile && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="font-medium text-green-700">
                          Audio mới: {audioFile.name}
                        </p>
                        <audio
                          controls
                          src={audioPreview!}
                          className="w-full mt-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* CỘT PHẢI – TỰ ĐỘNG CHUYỂN THEO TYPE */}
              <div className="lg:col-span-2 space-y-10">
                {/* FILL / NOTE / SENTENCE */}
                {[
                  "fill_in_the_blank",
                  "note_completion",
                  "sentence_completion",
                ].includes(type) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        Nội dung bài (có chỗ trống)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label className="text-lg">Đoạn văn / note / câu</Label>
                        <Textarea
                          rows={12}
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          className="font-mono text-lg"
                          placeholder="Ví dụ: The museum is open from ___ to ___ on weekends."
                        />
                      </div>
                      <div>
                        <Label className="text-lg font-semibold">
                          Đáp án đúng (theo thứ tự)
                        </Label>
                        <div className="space-y-4 mt-4">
                          {answers.map((ans, i) => (
                            <div key={i} className="flex gap-4 items-center">
                              <Input
                                value={ans}
                                onChange={(e) => {
                                  const updated = [...answers];
                                  updated[i] = e.target.value;
                                  setAnswers(updated);
                                }}
                                placeholder={`Đáp án ${i + 1} (có thể viết: morning OR 9am)`}
                              />
                              {answers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() =>
                                    setAnswers(
                                      answers.filter((_, idx) => idx !== i)
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
                            onClick={() => setAnswers([...answers, ""])}>
                            <Plus className="w-4 h-4 mr-2" /> Thêm đáp án
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* MULTIPLE CHOICE */}
                {type === "multiple_choice" && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">
                          Câu hỏi con ({subQuestions.length})
                        </CardTitle>
                        <Button
                          type="button"
                          onClick={addSubQuestion}
                          size="lg">
                          <Plus className="w-5 h-5 mr-2" /> Thêm câu
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {subQuestions.map((sq, i) => (
                        <div key={i} className="border rounded-xl p-8 relative">
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold">Câu {i + 1}</h3>
                            {subQuestions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSubQuestion(i)}>
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            )}
                          </div>

                          <Label>Nội dung câu hỏi</Label>
                          <Textarea
                            value={sq.question}
                            onChange={(e) => {
                              const updated = [...subQuestions];
                              updated[i].question = e.target.value;
                              setSubQuestions(updated);
                            }}
                            rows={3}
                            className="mt-2"
                          />

                          <div className="grid grid-cols-2 gap-4 mt-6">
                            {["A", "B", "C", "D"].map((letter, idx) => (
                              <div key={letter}>
                                <Label>Đáp án {letter}</Label>
                                <Input
                                  value={sq.options?.[idx] || ""}
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
                              value={sq.correctAnswers[0] || ""}
                              onValueChange={(v) => {
                                const updated = [...subQuestions];
                                updated[i].correctAnswers = [v];
                                setSubQuestions(updated);
                              }}>
                              <SelectTrigger className="w-64">
                                <SelectValue placeholder="Chọn đáp án đúng" />
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
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* MATCHING */}
                {type === "matching" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        Câu hỏi Matching
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {subQuestions.map((sq, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <span className="font-bold text-lg w-8">
                            {i + 1}.
                          </span>
                          <Textarea
                            value={sq.question}
                            onChange={(e) => {
                              const updated = [...subQuestions];
                              updated[i].question = e.target.value;
                              setSubQuestions(updated);
                            }}
                            rows={2}
                            className="flex-1"
                          />
                          <Input
                            value={sq.correctAnswers.join(", ")}
                            onChange={(e) => {
                              const updated = [...subQuestions];
                              updated[i].correctAnswers = e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              setSubQuestions(updated);
                            }}
                            placeholder="B, A, C"
                            className="w-32"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {type === "matching" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        Lựa chọn (A, B, C...)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {matchingOptions.map((opt, i) => (
                        <div key={i} className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const updated = [...matchingOptions];
                              updated[i] = e.target.value;
                              setMatchingOptions(updated);
                            }}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* TRANSCRIPT & EXPLANATION */}
                <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Transcript</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        rows={12}
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Giải thích</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        rows={12}
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* NÚT LƯU */}
                <div className="flex justify-center gap-8 pt-10">
                  <Button
                    type="submit"
                    size="lg"
                    className="text-2xl px-24 py-8 font-bold">
                    LƯU THAY ĐỔI NGAY
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.back()}>
                    Hủy bỏ
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}
