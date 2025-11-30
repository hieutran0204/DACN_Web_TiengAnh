"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// Band score Reading chuẩn IELTS 2025
const readingBandScore: Record<number, number> = {
  40: 9.0,
  39: 8.5,
  38: 8.5,
  37: 8.0,
  36: 8.0,
  35: 7.5,
  34: 7.5,
  33: 7.0,
  32: 7.0,
  31: 6.5,
  30: 6.5,
  29: 6.0,
  28: 6.0,
  27: 5.5,
  26: 5.5,
  25: 5.0,
  23: 5.0,
  21: 4.5,
  19: 4.0,
  17: 3.5,
  15: 3.0,
};

interface SubQuestion {
  _id: string;
  question: string;
  correctAnswer?: string;
  correctAnswers?: string[];
  options?: string[];
}

interface ReadingPassage {
  _id: string;
  title: string;
  passage: string;
  type:
  | "multiple_choice"
  | "true_false_not_given"
  | "yes_no_not_given"
  | "matching_headings"
  | "fill_in_the_blank"
  | "summary_completion"
  | "sentence_completion";
  subQuestions: SubQuestion[];
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  skills: { reading: ReadingPassage[] };
}

export default function ReadingExamPage() {
  const { id } = useParams();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { toast } = useToast();

  const totalQuestions =
    exam?.skills.reading.reduce((acc, p) => acc + p.subQuestions.length, 0) ||
    0;

  useEffect(() => {
    if (!id) return;

    apiFetch(`/exam/${id}?populate=true`)
      .then((res: any) => {
        const data = res?.success ? res.data : res;
        if (!data?.skills?.reading?.length) {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không có phần Reading",
          });
          return;
        }
        setExam(data);
        toast({
          title: "Thành công",
          description: "Đã tải đề Reading – làm thoải mái nhé bro!",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không tải được đề thi",
        });
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  const currentPassage = exam?.skills.reading[currentPassageIndex];
  const progress = exam
    ? ((currentPassageIndex + 1) / exam.skills.reading.length) * 100
    : 0;

  const handleAnswer = (subQId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [subQId]: answer }));
  };

  const calculateScore = () => {
    if (!exam) return 0;
    let correct = 0;

    exam.skills.reading.forEach((passage) => {
      passage.subQuestions.forEach((sq) => {
        const userAns = userAnswers[sq._id]?.trim().toUpperCase() || "";

        if (sq.correctAnswers && sq.correctAnswers.length > 0) {
          const correctSet = new Set(
            sq.correctAnswers.map((a) => a.trim().toUpperCase())
          );
          if (correctSet.has(userAns)) correct++;
        } else if (sq.correctAnswer) {
          if (userAns === sq.correctAnswer.trim().toUpperCase()) correct++;
        }
      });
    });
    return correct;
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setFinalScore(score);
    setShowResult(true);
    const band = readingBandScore[score] || 0;
    toast({
      title: "HOÀN THÀNH READING!",
      description: `Đúng ${score}/${totalQuestions} → Band ${band.toFixed(1)}`,
    });
  };

  if (loading) return <LoadingScreen />;
  if (!exam || !currentPassage) return <NotFoundScreen />;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">

      <div className="pt-20 pb-16 max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            {exam.title}
          </h1>
          <p className="text-xl text-gray-600">
            IELTS Reading – 3 passages, 40 câu, 60 phút
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <Badge variant="secondary" className="text-lg px-8 py-3">
            <BookOpen className="w-5 h-5 mr-2" />
            Reading
          </Badge>
          <Badge variant="outline" className="text-lg px-8 py-3">
            <Clock className="w-5 h-5 mr-2" />
            60 phút
          </Badge>
          <Badge variant="outline" className="text-lg px-8 py-3">
            {totalQuestions} câu hỏi
          </Badge>
        </div>

        {showResult ? (
          <ResultScreen score={finalScore} total={totalQuestions} />
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* PASSAGE */}
            <Card className="shadow-xl h-fit sticky top-24">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <CardTitle className="text-2xl">
                  Passage {currentPassageIndex + 1}: {currentPassage.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 prose prose-lg max-w-none">
                <div className="leading-relaxed text-gray-800 whitespace-pre-line">
                  {currentPassage.passage}
                </div>
              </CardContent>
            </Card>

            {/* QUESTIONS */}
            <Card className="shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white">
                <div className="flex justify-between">
                  <CardTitle className="text-2xl">Câu hỏi</CardTitle>
                  <span className="text-2xl font-bold">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="mt-3 h-5 bg-white/30" />
              </CardHeader>

              <CardContent className="p-8 space-y-10">
                <div className="space-y-8">
                  {currentPassage.subQuestions.map((sq, idx) => (
                    <div
                      key={sq._id}
                      className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
                      <Label className="text-xl font-semibold mb-6 block">
                        {idx + 1}. {sq.question}
                      </Label>

                      {/* Multiple Choice */}
                      {(currentPassage.type === "multiple_choice" ||
                        currentPassage.type === "true_false_not_given" ||
                        currentPassage.type === "yes_no_not_given") &&
                        sq.options && (
                          <div className="grid grid-cols-1 gap-4">
                            {sq.options.map((opt) => (
                              <Button
                                key={opt}
                                variant={
                                  userAnswers[sq._id] === opt
                                    ? "default"
                                    : "outline"
                                }
                                size="lg"
                                className="h-16 text-lg justify-start"
                                onClick={() => handleAnswer(sq._id, opt)}>
                                {opt}
                              </Button>
                            ))}
                          </div>
                        )}

                      {/* Fill in the blank / Summary / Sentence Completion */}
                      {(currentPassage.type === "fill_in_the_blank" ||
                        currentPassage.type === "summary_completion" ||
                        currentPassage.type === "sentence_completion") && (
                          <Input
                            type="text"
                            placeholder="Nhập đáp án (ví dụ: 25, the internet, NOT GIVEN...)"
                            value={userAnswers[sq._id] || ""}
                            onChange={(e) => handleAnswer(sq._id, e.target.value)}
                            className="text-xl h-16"
                          />
                        )}
                    </div>
                  ))}
                </div>

                {/* NAVIGATION */}
                <div className="flex justify-between items-center pt-8 border-t-2">
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={currentPassageIndex === 0}
                    onClick={() => setCurrentPassageIndex((i) => i - 1)}>
                    <ChevronLeft className="mr-2" /> Passage trước
                  </Button>

                  {currentPassageIndex === exam.skills.reading.length - 1 ? (
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-xl px-16"
                      onClick={handleSubmit}>
                      <CheckCircle2 className="mr-3" /> Nộp Bài & Xem Band
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="text-xl px-16"
                      onClick={() => setCurrentPassageIndex((i) => i + 1)}>
                      Passage tiếp theo <ChevronRight className="ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

    </main>
  );
}

// Component phụ đẹp như Listening
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
    <div className="text-center">
      <div className="w-24 h-24 border-8 border-emerald-600 border-t-transparent rounded-full animate-spin mb-8" />
      <p className="text-3xl font-bold text-emerald-800">
        Đang tải đề Reading...
      </p>
    </div>
  </div>
);

const NotFoundScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
    <p className="text-6xl font-bold text-red-600">Không tìm thấy đề thi</p>
  </div>
);

const ResultScreen = ({ score, total }: { score: number; total: number }) => {
  const band = readingBandScore[score] || 0;
  const message =
    band >= 8
      ? "THẦN ĐỌC!"
      : band >= 7
        ? "XUẤT SẮC!"
        : band >= 6
          ? "TỐT!"
          : "CỐ LÊN BRO!";

  return (
    <Card className="max-w-3xl mx-auto text-center py-20 shadow-3xl border-4 border-emerald-500">
      <CardHeader>
        <CardTitle className="text-7xl font-bold text-emerald-600">
          HOÀN THÀNH READING!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-9xl font-black text-teal-600">
          {score}
          <span className="text-5xl text-gray-600">/{total}</span>
        </div>
        <div className="text-5xl font-bold">
          Band ước tính:{" "}
          <span className="text-8xl text-emerald-600">{band.toFixed(1)}</span>
        </div>
        <div className="text-4xl font-bold text-purple-600">{message}</div>

        <div className="flex gap-8 justify-center mt-16">
          <Button asChild size="lg" className="text-2xl px-12 py-8">
            <Link href="/tests/reading">Làm đề khác</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-2xl px-12 py-8">
            <Link href="/tests">Trang chủ</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
