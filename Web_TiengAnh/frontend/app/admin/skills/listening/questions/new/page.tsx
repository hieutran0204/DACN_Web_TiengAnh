"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Headphones, Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubQuestion {
  question: string;
  correctAnswers: string[];
  options?: string[];
}

export default function NewListeningQuestion() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [type, setType] = useState<string>("multiple_choice");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [explanation, setExplanation] = useState("");

  // Riêng cho Fill / Note / Sentence: 1 đoạn văn + nhiều đáp án
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState<string[]>([""]);

  // Cho Multiple Choice & Matching
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    { question: "", correctAnswers: [], options: ["", "", "", ""] },
  ]);
  const [matchingOptions, setMatchingOptions] = useState<string[]>([
    "",
    "",
    "",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addSubQuestion = () => {
    setSubQuestions([
      ...subQuestions,
      type === "multiple_choice"
        ? { question: "", correctAnswers: [], options: ["", "", "", ""] }
        : { question: "", correctAnswers: [""] },
    ]);
  };

  const removeSubQuestion = (index: number) => {
    if (subQuestions.length === 1) {
      setError("Phải có ít nhất 1 câu hỏi!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
  };

  const updateSubQuestion = (
    index: number,
    field: keyof SubQuestion,
    value: any
  ) => {
    const updated = [...subQuestions];
    // @ts-ignore
    updated[index][field] = value;
    setSubQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...subQuestions];
    if (!updated[qIndex].options) updated[qIndex].options = ["", "", "", ""];
    updated[qIndex].options![optIndex] = value;
    setSubQuestions(updated);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Chỉ chấp nhận file âm thanh!");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File quá lớn! Tối đa 50MB");
      return;
    }
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
    setError("");
  };

  const validate = () => {
    if (!title.trim()) return "Tiêu đề không được để trống!";
    if (!section) return "Chọn Section!";
    if (!audioFile) return "Upload file audio!";

    if (
      ["fill_in_the_blank", "note_completion", "sentence_completion"].includes(
        type
      )
    ) {
      if (!questionText.trim()) return "Nhập đoạn văn/note có chỗ trống!";
      const validAnswers = answers.map((a) => a.trim()).filter(Boolean);
      if (validAnswers.length === 0) return "Phải có ít nhất 1 đáp án đúng!";
    } else {
      for (let i = 0; i < subQuestions.length; i++) {
        const sq = subQuestions[i];
        if (!sq.question.trim()) return `Câu ${i + 1}: Nội dung câu hỏi trống!`;
        if (type === "multiple_choice") {
          if (!sq.options?.every((o) => o.trim()))
            return `Câu ${i + 1}: Điền đủ 4 đáp án!`;
          if (!sq.correctAnswers[0]) return `Câu ${i + 1}: Chọn đáp án đúng!`;
        } else {
          if (sq.correctAnswers.filter(Boolean).length === 0)
            return `Câu ${i + 1}: Nhập đáp án đúng!`;
        }
      }
    }

    if (type === "matching" && matchingOptions.filter(Boolean).length < 3)
      return "Matching cần ít nhất 3 lựa chọn!";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const err = validate();
    if (err) {
      setError(err);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("section", section);
    formData.append("type", type);
    formData.append("transcript", transcript.trim());
    formData.append("explanation", explanation.trim());

    if (
      ["fill_in_the_blank", "note_completion", "sentence_completion"].includes(
        type
      )
    ) {
      // GỬI ĐÚNG FORMAT BẠN MUỐN: 1 object duy nhất
      formData.append(
        "subQuestions",
        JSON.stringify([
          {
            question: questionText.trim(),
            correctAnswers: answers.map((a) => a.trim()).filter(Boolean),
          },
        ])
      );
    } else {
      // Multiple Choice & Matching
      const cleaned = subQuestions.map((sq) => ({
        question: sq.question.trim(),
        correctAnswers:
          type === "multiple_choice"
            ? [sq.correctAnswers[0]]
            : sq.correctAnswers.map((a) => a.trim()).filter(Boolean),
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

    formData.append("audio", audioFile!);

    try {
      const res = await fetch(
        "http://localhost:3000/api/admin/questions/listening/listening-questions",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const text = await res.text();
      if (text.includes("<html") || text.includes("<!DOCTYPE"))
        throw new Error("Phiên hết hạn! Đăng nhập lại.");

      const result = JSON.parse(text);
      if (!res.ok) throw new Error(result.message || "Tạo thất bại");

      alert("TẠO CÂU HỎI LISTENING THÀNH CÔNG!");
      router.push("/admin/skills/listening/questions");
    } catch (err: any) {
      setError(err.message || "Lỗi hệ thống!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mt-16 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Tạo Câu Hỏi Listening Mới
            </h1>
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
                      <Select value={section} onValueChange={setSection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {["1", "2", "3", "4"].map((s) => (
                            <SelectItem key={s} value={`Section ${s}`}>
                              Section {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-lg">Loại câu hỏi</Label>
                      <Select
                        value={type}
                        onValueChange={(v) => {
                          setType(v);
                          if (
                            [
                              "fill_in_the_blank",
                              "note_completion",
                              "sentence_completion",
                            ].includes(v)
                          ) {
                            setQuestionText("");
                            setAnswers([""]);
                          }
                          if (v !== "matching")
                            setMatchingOptions(["", "", ""]);
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="fill_in_the_blank">
                            Fill in the Blank
                          </SelectItem>
                          <SelectItem value="note_completion">
                            Note Completion
                          </SelectItem>
                          <SelectItem value="sentence_completion">
                            Sentence Completion
                          </SelectItem>
                          <SelectItem value="matching">Matching</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-primary/30">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Headphones className="w-8 h-8 text-primary" />
                    <CardTitle className="text-2xl">File Audio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioChange}
                    />
                    {audioFile && (
                      <div className="bg-muted p-4 rounded-lg text-sm">
                        <p className="font-medium">{audioFile.name}</p>
                        <p className="text-muted-foreground">
                          {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                    {audioPreview && (
                      <audio controls className="w-full mt-4">
                        <source src={audioPreview} />
                      </audio>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* CỘT PHẢI */}
              <div className="lg:col-span-2 space-y-10">
                {/* 3 LOẠI MỚI: DÙNG 1 ĐOẠN VĂN + NHIỀU ĐÁP ÁN */}
                {[
                  "fill_in_the_blank",
                  "note_completion",
                  "sentence_completion",
                ].includes(type) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Nội dung bài</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label className="text-lg">Đoạn văn / câu / note</Label>
                        <Textarea
                          rows={10}
                          placeholder="Nhập đoạn văn có chỗ trống, ví dụ:\nThe library opens at ___ on weekdays.\nProtein comes from ___ and ___."
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          className="text-lg font-mono"
                        />
                      </div>

                      <div>
                        <Label className="text-lg font-semibold">
                          Danh sách đáp án đúng (theo thứ tự chỗ trống)
                        </Label>
                        <div className="space-y-4 mt-4">
                          {answers.map((ans, index) => (
                            <div
                              key={index}
                              className="flex gap-4 items-center">
                              <Input
                                value={ans}
                                onChange={(e) => {
                                  const updated = [...answers];
                                  updated[index] = e.target.value;
                                  setAnswers(updated);
                                }}
                                placeholder={`Đáp án ${index + 1} (có thể nhiều: fish OR meat)`}
                              />
                              {answers.length > 1 && (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() =>
                                    setAnswers(
                                      answers.filter((_, i) => i !== index)
                                    )
                                  }>
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => setAnswers([...answers, ""])}>
                            <Plus className="w-4 h-4 mr-2" /> Thêm đáp án
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Multiple Choice & Matching: giữ nguyên */}
                {![
                  "fill_in_the_blank",
                  "note_completion",
                  "sentence_completion",
                ].includes(type) && (
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
                            onChange={(e) =>
                              updateSubQuestion(i, "question", e.target.value)
                            }
                            rows={3}
                            className="mt-2"
                          />

                          {/* Multiple Choice */}
                          {type === "multiple_choice" && (
                            <>
                              <div className="grid grid-cols-2 gap-4 mt-6">
                                {["A", "B", "C", "D"].map((l, idx) => (
                                  <div key={l}>
                                    <Label>Đáp án {l}</Label>
                                    <Input
                                      value={sq.options?.[idx] || ""}
                                      onChange={(e) =>
                                        updateOption(i, idx, e.target.value)
                                      }
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
                                    <SelectValue placeholder="Chọn" />
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

                          {/* Matching */}
                          {type === "matching" && (
                            <div className="mt-6">
                              <Label>Đáp án đúng (A, B, C...)</Label>
                              <Input
                                value={sq.correctAnswers.join(", ")}
                                onChange={(e) => {
                                  const vals = e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  const updated = [...subQuestions];
                                  updated[i].correctAnswers = vals;
                                  setSubQuestions(updated);
                                }}
                                placeholder="B, A, C"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Matching Options */}
                {type === "matching" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Lựa chọn (A, B, C...)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {matchingOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <div className="w-10 font-bold">
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const updated = [...matchingOptions];
                              updated[idx] = e.target.value;
                              setMatchingOptions(updated);
                            }}
                          />
                          {matchingOptions.length > 3 && (
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() =>
                                setMatchingOptions(
                                  matchingOptions.filter((_, i) => i !== idx)
                                )
                              }>
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() =>
                          setMatchingOptions([...matchingOptions, ""])
                        }>
                        <Plus className="w-4 h-4 mr-2" /> Thêm lựa chọn
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Transcript</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows={10}
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
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        rows={10}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center gap-8 pt-10">
                  <Button
                    type="submit"
                    size="lg"
                    className="text-2xl px-20 py-8 font-bold"
                    disabled={isSubmitting}>
                    {isSubmitting ? "ĐANG TẠO..." : "TẠO CÂU HỎI NGAY"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.back()}
                    disabled={isSubmitting}>
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
