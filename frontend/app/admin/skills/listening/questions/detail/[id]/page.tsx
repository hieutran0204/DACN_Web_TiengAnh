"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Headphones,
  Edit3,
  ChevronLeft,
  Volume2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ListeningQuestionDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);

  const API_BASE = "http://localhost:3000/api/admin/questions/listening";

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`${API_BASE}/listening-questions/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Không tải được câu hỏi");
        const result = await res.json();
        setQuestion(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuestion();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Volume2 className="w-16 h-16 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-2xl font-bold">Đang tải câu hỏi Listening...</p>
        </div>
      </main>
    );
  }

  if (error || !question) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mt-20 text-center py-20">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertDescription className="text-lg">
              {error || "Không tìm thấy câu hỏi!"}
            </AlertDescription>
          </Alert>
          <Button className="mt-8" onClick={() => router.back()}>
            <ChevronLeft className="mr-2" /> Quay lại
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  // CHỈ DÙNG q.audio || "" → CHUẨN NHẤT, KHÔNG CỘNG DOMAIN, CHẠY NGON MỌI NƠI
  const audioUrl = question.audio || null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />

      <div className="mt-16 py-10 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              {question.title || "Không có tiêu đề"}
            </h1>
            <div className="flex flex-wrap gap-4 text-lg">
              <span className="font-semibold text-primary">
                {question.section}
              </span>
              <span className="bg-primary/10 px-4 py-2 rounded-full text-primary font-medium">
                {question.type.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowAnswers(!showAnswers)}
              className="whitespace-nowrap">
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
                router.push(`/admin/skills/listening/questions/${id}`)
              }>
              <Edit3 className="mr-2" /> Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Audio Player - SIÊU ĐẸP */}
        {audioUrl && (
          <Card className="mb-12 border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Headphones className="w-9 h-9 text-primary" />
                File Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <audio
                controls
                controlsList="nodownload"
                className="w-full h-16 rounded-lg shadow-md"
                src={audioUrl}>
                Trình duyệt không hỗ trợ audio.
              </audio>
            </CardContent>
          </Card>
        )}

        {/* Câu hỏi theo loại */}
        <div className="space-y-10">
          {/* MULTIPLE CHOICE */}
          {question.type === "multiple_choice" &&
            question.subQuestions?.map((sq: any, i: number) => (
              <Card key={i} className="border-l-4 border-l-primary shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Câu {i + 1}: {sq.question || "(Không có nội dung câu hỏi)"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {["A", "B", "C", "D"].map((letter, idx) => {
                      const option = sq.options?.[idx] || "(Trống)";
                      const isCorrect =
                        sq.correctAnswer === letter ||
                        sq.correctAnswers?.includes(letter);

                      return (
                        <div
                          key={letter}
                          className={`p-5 rounded-xl border-2 transition-all ${
                            showAnswers && isCorrect
                              ? "border-green-500 bg-green-50 shadow-md"
                              : "border-muted bg-card"
                          }`}>
                          <div className="flex items-start gap-3">
                            <span className="font-bold text-xl text-primary">
                              {letter}.
                            </span>
                            <span className="text-lg">{option}</span>
                          </div>
                          {showAnswers && isCorrect && (
                            <div className="mt-3 text-green-600 font-bold flex items-center gap-2">
                              <span className="text-2xl">Correct</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

          {/* FILL / NOTE / SENTENCE */}
          {[
            "fill_in_the_blank",
            "note_completion",
            "sentence_completion",
          ].includes(question.type) && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Nội dung bài</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-10 rounded-2xl font-mono text-lg leading-relaxed text-foreground/90">
                  {question.subQuestions?.[0]?.question ||
                    "(Không có nội dung)"}
                </div>

                {showAnswers &&
                  question.subQuestions?.[0]?.correctAnswers?.length > 0 && (
                    <div className="mt-10 p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl">
                      <p className="font-bold text-green-800 text-2xl mb-6 text-center">
                        Đáp án đúng
                      </p>
                      <ol className="space-y-4 max-w-2xl mx-auto">
                        {question.subQuestions[0].correctAnswers.map(
                          (ans: string, i: number) => (
                            <li
                              key={i}
                              className="text-xl font-bold text-green-900 bg-white/80 px-6 py-4 rounded-lg shadow">
                              {i + 1}. {ans}
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* MATCHING */}
          {question.type === "matching" && (
            <div className="grid md:grid-cols-2 gap-10">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Câu hỏi</CardTitle>
                </CardHeader>
                <CardContent>
                  {question.subQuestions?.map((sq: any, i: number) => (
                    <div
                      key={i}
                      className="flex gap-5 items-center mb-8 text-lg font-medium">
                      <span className="font-bold text-xl w-10 text-primary">
                        {i + 1}.
                      </span>
                      <span>{sq.question || "(Trống)"}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Lựa chọn</CardTitle>
                </CardHeader>
                <CardContent>
                  {question.matchingOptions?.map((opt: string, i: number) => (
                    <div
                      key={i}
                      className="flex gap-5 items-center mb-8 text-lg font-medium">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shadow-lg">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span>{opt || "(Trống)"}</span>
                    </div>
                  ))}

                  {showAnswers && (
                    <div className="mt-10 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-2xl">
                      <p className="font-bold text-blue-800 text-2xl mb-6 text-center">
                        Ghép đúng
                      </p>
                      <div className="space-y-4 max-w-xs mx-auto">
                        {question.subQuestions?.map((sq: any, i: number) => (
                          <div
                            key={i}
                            className="text-xl font-bold text-indigo-900 bg-white/80 px-6 py-4 rounded-lg shadow text-center">
                            {i + 1} → {sq.correctAnswers?.[0] || "?"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Transcript & Explanation */}
        {(question.transcript || question.explanation) && (
          <div className="mt-16 grid md:grid-cols-2 gap-10">
            {question.transcript && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-foreground/90">
                    {question.transcript}
                  </pre>
                </CardContent>
              </Card>
            )}

            {question.explanation && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Giải thích</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none text-foreground/90">
                    {question.explanation}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="text-center mt-20">
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/admin/skills/listening/questions")}
            className="text-xl px-12 py-6">
            <ChevronLeft className="mr-2" /> Quay lại danh sách câu hỏi
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
