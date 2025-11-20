"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
} from "lucide-react";

type QuestionType =
  | "multiple_choice"
  | "true_false_not_given"
  | "yes_no_not_given"
  | "matching_headings"
  | "sentence_completion"
  | "summary_completion"
  | "diagram_label_completion";

type PassageNumber = "Passage 1" | "Passage 2" | "Passage 3";
type Difficulty = "easy" | "medium" | "hard";

interface SubQuestion {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  headings?: string[];
}

export default function NewReadingQuestion() {
  const router = useRouter();

  const [passageNumber, setPassageNumber] =
    useState<PassageNumber>("Passage 1");
  const [passage, setPassage] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [explanation, setExplanation] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    {
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSubQuestion = (type: QuestionType = "multiple_choice") => {
    const newQ: SubQuestion = {
      type,
      question: "",
      ...(type === "multiple_choice" && {
        options: ["", "", "", ""],
        correctAnswer: "A",
      }),
      ...(type === "true_false_not_given" && { correctAnswers: ["Not Given"] }),
      ...(type === "yes_no_not_given" && { correctAnswers: ["Not Given"] }),
      ...(type === "sentence_completion" && { correctAnswers: [""] }),
      ...(type === "summary_completion" && { correctAnswers: [""] }),
      ...(type === "diagram_label_completion" && { correctAnswers: [""] }),
      ...(type === "matching_headings" && { headings: [""] }),
    };
    setSubQuestions([...subQuestions, newQ]);
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

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...subQuestions];
    if (!updated[qIdx].options) updated[qIdx].options = ["", "", "", ""];
    updated[qIdx].options![optIdx] = value;
    setSubQuestions(updated);
  };

  const removeSubQuestion = (index: number) => {
    if (subQuestions.length === 1) return alert("Phải có ít nhất 1 câu hỏi!");
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage.trim()) return alert("Passage không được để trống!");
    if (!subQuestions.some((sq) => sq.question.trim()))
      return alert("Phải có ít nhất 1 câu hỏi hợp lệ!");

    setLoading(true);
    const formData = new FormData();
    formData.append("passageNumber", passageNumber);
    formData.append("passage", passage);
    formData.append("difficulty", difficulty);
    if (explanation.trim()) formData.append("explanation", explanation);
    if (imageFile) formData.append("image", imageFile);

    const processed = subQuestions
      .filter((sq) => sq.question.trim())
      .map((sq) => {
        const base = { type: sq.type, question: sq.question.trim() };
        if (sq.type === "multiple_choice")
          return {
            ...base,
            options: sq.options?.filter(Boolean),
            correctAnswer: sq.correctAnswer,
          };
        if (["true_false_not_given", "yes_no_not_given"].includes(sq.type))
          return { ...base, correctAnswers: sq.correctAnswers };
        if (
          [
            "sentence_completion",
            "summary_completion",
            "diagram_label_completion",
          ].includes(sq.type)
        )
          return {
            ...base,
            correctAnswers: sq.correctAnswers?.filter(Boolean),
          };
        if (sq.type === "matching_headings")
          return { ...base, headings: sq.headings?.filter(Boolean) };
        return base;
      });

    formData.append("subQuestions", JSON.stringify(processed));

    try {
      const res = await fetch(
        "http://localhost:3000/api/admin/questions/reading/reading-questions",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (res.ok) {
        alert("TẠO PASSAGE THÀNH CÔNG – ĐẸP NHƯ IELTS CAMBRIDGE 21!!!");
        router.push("/admin/skills/reading/questions");
      } else {
        const err = await res.text();
        alert("Lỗi: " + err);
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            TẠO PASSAGE READING MỚI – NHIỀU LOẠI CÂU HỎI
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Passage Number</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Độ khó</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <ImageIcon className="w-8 h-8" /> Hình ảnh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input type="file" accept="image/*" onChange={handleImage} />
                {imagePreview && (
                  <div className="mt-4 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 rounded-xl shadow-xl"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-2xl border-4 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-100">
              <CardTitle className="text-4xl font-black">PASSAGE</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <Textarea
                rows={22}
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                placeholder="Dán đoạn văn Reading ở đây..."
                className="text-lg font-serif leading-relaxed"
                required
              />
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-4 border-primary/30">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl">
                  Câu hỏi con ({subQuestions.length})
                </CardTitle>
                <div className="flex gap-3">
                  <Select
                    onValueChange={(v) => addSubQuestion(v as QuestionType)}>
                    <SelectTrigger className="w-64">
                      + Thêm loại câu hỏi
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
                      <SelectItem value="diagram_label_completion">
                        Diagram Label Completion
                      </SelectItem>
                      <SelectItem value="matching_headings">
                        Matching Headings
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {subQuestions.map((sq, i) => (
                <div
                  key={i}
                  className="p-8 border-2 border-primary/20 rounded-xl bg-muted/30 space-y-6">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {sq.type.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSubQuestion(i)}>
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Câu hỏi / statement..."
                    value={sq.question}
                    onChange={(e) =>
                      updateSubQuestion(i, "question", e.target.value)
                    }
                    rows={3}
                  />

                  {/* Multiple Choice */}
                  {sq.type === "multiple_choice" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {["A", "B", "C", "D"].map((l, idx) => (
                          <Input
                            key={l}
                            placeholder={`${l}.`}
                            value={sq.options?.[idx] || ""}
                            onChange={(e) =>
                              updateOption(i, idx, e.target.value)
                            }
                          />
                        ))}
                      </div>
                      <Select
                        value={sq.correctAnswer || "A"}
                        onValueChange={(v) =>
                          updateSubQuestion(i, "correctAnswer", v)
                        }>
                        <SelectTrigger className="w-48">
                          Đáp án đúng
                        </SelectTrigger>
                        <SelectContent>
                          {["A", "B", "C", "D"].map((x) => (
                            <SelectItem key={x} value={x}>
                              {x}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  {/* True/False/Not Given */}
                  {(sq.type === "true_false_not_given" ||
                    sq.type === "yes_no_not_given") && (
                    <Select
                      value={sq.correctAnswers?.[0] || ""}
                      onValueChange={(v) =>
                        updateSubQuestion(i, "correctAnswers", [v])
                      }>
                      <SelectTrigger>Đáp án</SelectTrigger>
                      <SelectContent>
                        {(sq.type === "true_false_not_given"
                          ? ["True", "False", "Not Given"]
                          : ["Yes", "No", "Not Given"]
                        ).map((x) => (
                          <SelectItem key={x} value={x}>
                            {x}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Completion */}
                  {[
                    "sentence_completion",
                    "summary_completion",
                    "diagram_label_completion",
                  ].includes(sq.type) && (
                    <div className="space-y-3">
                      {(sq.correctAnswers || []).map((ans, idx) => (
                        <div key={idx} className="flex gap-3">
                          <Input
                            value={ans}
                            onChange={(e) => {
                              const updated = [...subQuestions];
                              updated[i].correctAnswers![idx] = e.target.value;
                              setSubQuestions(updated);
                            }}
                            placeholder="Đáp án"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updated = [...subQuestions];
                              updated[i].correctAnswers = updated[
                                i
                              ].correctAnswers!.filter((_, j) => j !== idx);
                              setSubQuestions(updated);
                            }}>
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updated = [...subQuestions];
                          updated[i].correctAnswers = [
                            ...(updated[i].correctAnswers || []),
                            "",
                          ];
                          setSubQuestions(updated);
                        }}>
                        <Plus className="w-4 h-4 mr-2" /> Thêm đáp án
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Giải thích</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={8}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Giải thích chi tiết..."
              />
            </CardContent>
          </Card>

          <div className="text-center pt-10">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="text-4xl px-48 py-16 font-black bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-3xl">
              {loading ? (
                <>
                  <Loader2 className="mr-6 w-12 h-12 animate-spin" /> ĐANG
                  TẠO...
                </>
              ) : (
                <>
                  <Upload className="mr-6 w-12 h-12" /> TẠO PASSAGE NGAY
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
