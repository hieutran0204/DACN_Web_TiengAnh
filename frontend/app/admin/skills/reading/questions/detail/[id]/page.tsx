"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Edit3,
  ChevronLeft,
  Eye,
  EyeOff,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

interface SubQuestion {
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[]; // ← Đã chắc chắn là mảng hoặc undefined
  headings?: string[];
  paragraphLabel?: string;
  wordLimit?: number;
}

interface ReadingPassage {
  _id: string;
  passageNumber: "Passage 1" | "Passage 2" | "Passage 3";
  passage: string;
  image?: string;
  subQuestions: SubQuestion[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
}

export default function ReadingPassageDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchPassage = async () => {
      try {
        // ĐÚNG ROUTE CỦA BACKEND CON ĐÃ CÓ
        const res = await fetch(
          `${API_BASE}/api/admin/questions/reading/reading-questions/${id}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();

        if (result.success && result.data) {
          setPassage(result.data);
        } else {
          throw new Error(result.message || "Dữ liệu không hợp lệ");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi tải passage");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPassage();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-2xl font-bold">Đang tải Passage...</p>
        </div>
      </main>
    );
  }

  if (error || !passage) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mt-20 text-center py-20">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertDescription className="text-lg">
              {error || "Không tìm thấy passage!"}
            </AlertDescription>
          </Alert>
          <Button className="mt-8" onClick={() => router.back()}>
            <ChevronLeft className="mr-2" />
            Quay lại
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />

      <div className="mt-16 py-10 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              {passage.passageNumber}
            </h1>
            <div className="flex flex-wrap gap-4 text-lg">
              <span className="font-semibold text-primary">
                Độ khó: {(passage.difficulty || "medium").toUpperCase()}
              </span>
              <span className="bg-primary/10 px-4 py-2 rounded-full text-primary font-medium">
                {passage.subQuestions.length} câu hỏi
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowAnswers(!showAnswers)}>
              {showAnswers ? (
                <EyeOff className="mr-2" />
              ) : (
                <Eye className="mr-2" />
              )}
              {showAnswers ? "Ẩn đáp án" : "Hiện đáp án"}
            </Button>
            <Button
              size="lg"
              onClick={() =>
                router.push(`/admin/skills/reading/questions/${id}/edit`)
              }>
              <Edit3 className="mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Hình ảnh */}
        {passage.image && (
          <Card className="mb-12 border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <ImageIcon className="w-9 h-9 text-primary" />
                Hình ảnh minh họa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <img
                src={`${API_BASE}${passage.image}`}
                alt="Illustration"
                className="w-full max-h-96 object-contain rounded-lg shadow-md"
              />
            </CardContent>
          </Card>
        )}

        {/* Đoạn văn */}
        <Card className="mb-12 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              Đoạn văn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none leading-relaxed text-foreground/90">
              <pre className="whitespace-pre-wrap font-sans text-base">
                {passage.passage}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Câu hỏi */}
        <div className="space-y-12">
          {passage.subQuestions.map((sq, idx) => {
            const qNum = idx + 1;
            const type = sq.type;

            return (
              <Card key={idx} className="shadow-lg border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Câu {qNum}: {type.replace(/_/g, " ").toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-lg font-medium bg-muted/50 p-6 rounded-xl">
                    {sq.question}
                  </div>

                  {/* Multiple Choice */}
                  {type === "multiple_choice" && sq.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {sq.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const isCorrect =
                          sq.correctAnswer === letter ||
                          sq.correctAnswers?.includes(letter);

                        return (
                          <div
                            key={i}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              showAnswers && isCorrect
                                ? "border-green-500 bg-green-50 shadow-lg"
                                : "border-muted bg-card"
                            }`}>
                            <div className="flex items-start gap-4">
                              <span className="font-bold text-2xl text-primary">
                                {letter}.
                              </span>
                              <span className="text-lg">{opt}</span>
                            </div>
                            {showAnswers && isCorrect && (
                              <div className="mt-4 flex items-center gap-2 text-green-600 font-bold">
                                <CheckCircle2 className="w-6 h-6" />
                                Đáp án đúng
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* True/False/Not Given & Yes/No/Not Given */}
                  {(type === "true_false_not_given" ||
                    type === "yes_no_not_given") && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {["True", "False", "Not Given"].map((opt) => {
                        const display =
                          type === "yes_no_not_given"
                            ? opt.replace("True", "Yes").replace("False", "No")
                            : opt;
                        const isCorrect = sq.correctAnswers?.includes(display);

                        return (
                          <div
                            key={opt}
                            className={`p-8 text-center rounded-xl border-2 font-bold text-xl transition-all ${
                              showAnswers && isCorrect
                                ? "border-green-500 bg-green-50 shadow-lg"
                                : "border-muted bg-card"
                            }`}>
                            {display}
                            {showAnswers && isCorrect && (
                              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mt-4" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Completion types – ĐÃ FIX HOÀN TOÀN LỖI UNDEFINED */}
                  {[
                    "sentence_completion",
                    "summary_completion",
                    "note_completion",
                    "table_completion",
                    "flow_chart_completion",
                    "diagram_label_completion",
                  ].includes(type) &&
                    showAnswers &&
                    sq.correctAnswers && // ← Kiểm tra tồn tại
                    sq.correctAnswers.length > 0 && ( // ← Kiểm tra có phần tử
                      <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl">
                        <p className="text-2xl font-bold text-green-800 text-center mb-6">
                          Đáp án đúng
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {sq.correctAnswers.map((ans, i) => (
                            <div
                              key={i}
                              className="bg-white px-8 py-5 rounded-xl shadow-lg text-xl font-bold text-green-900 text-center">
                              {qNum + i}. {ans}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Matching Headings – cũng đã an toàn */}
                  {type === "matching_headings" &&
                    sq.headings &&
                    showAnswers &&
                    sq.correctAnswers?.length && (
                      <div className="bg-blue-50 p-8 rounded-xl border-2 border-blue-400">
                        <p className="font-bold text-xl text-blue-800 mb-6">
                          Ghép đúng
                        </p>
                        <div className="space-y-4">
                          {sq.correctAnswers.map((ans, i) => (
                            <div
                              key={i}
                              className="text-lg font-bold text-blue-900">
                              Đoạn {qNum + i} → {ans}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Giải thích chung */}
        {passage.explanation && (
          <Card className="mt-16 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Giải thích chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none text-foreground/90">
                {passage.explanation}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-20">
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/admin/skills/reading/questions")}
            className="text-xl px-12 py-6">
            <ChevronLeft className="mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
