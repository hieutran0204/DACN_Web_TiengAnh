"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic } from "lucide-react";

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
  createdAt: string;
}

export default function SpeakingQuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState<SpeakingQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ĐÃ SỬA ĐÚNG URL – KHÔNG CÒN /speaking-questions NỮA!!!
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/questions/speaking/${id}`
    )
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setQuestion(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải chi tiết Speaking:", err);
        setLoading(false);
      });
  }, [id]);

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      personal_experience: "Personal Experience",
      descriptive: "Descriptive",
      comparative: "Comparative",
      opinion_based: "Opinion",
      cause_effect: "Cause & Effect",
      hypothetical: "Hypothetical",
      advantage_disadvantage: "Advantages/Disadvantages",
      problem_solution: "Problem & Solution",
      prediction: "Prediction",
      abstract: "Abstract",
    };
    return (
      map[type] ||
      type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === "easy") return "bg-green-100 text-green-800 border-green-300";
    if (diff === "hard") return "bg-red-100 text-red-800 border-red-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Mic className="w-24 h-24 animate-pulse text-purple-600 mx-auto mb-6" />
          <p className="text-4xl font-bold text-purple-600">
            Đang tải câu hỏi...
          </p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <p className="text-4xl font-bold text-red-600">
          Không tìm thấy câu hỏi
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Navbar />
      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        <Button
          variant="ghost"
          size="lg"
          className="mb-10 text-xl font-bold"
          onClick={() => window.history.back()}>
          <ArrowLeft className="mr-3 w-8 h-8" />
          Quay lại danh sách
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* CỘT TRÁI - THÔNG TIN */}
          <div className="space-y-8">
            <Card className="shadow-2xl border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                <CardTitle className="text-4xl font-black flex items-center gap-4">
                  <Mic className="w-12 h-12 text-purple-600" />
                  Thông tin câu hỏi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Topic
                  </p>
                  <p className="text-3xl font-black text-purple-700 mt-2">
                    {question.topic}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Loại câu hỏi
                  </p>
                  <Badge variant="secondary" className="text-xl px-6 py-3 mt-2">
                    {getTypeLabel(question.type)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Độ khó
                  </p>
                  <Badge
                    className={`text-xl px-8 py-4 mt-3 border-2 ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* HÌNH ẢNH */}
            {question.image && (
              <Card className="shadow-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold">
                    Hình minh họa
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${question.image}`}
                    alt="Speaking illustration"
                    className="w-full h-96 object-cover"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* CỘT PHẢI - NỘI DUNG */}
          <div className="lg:col-span-2 space-y-10">
            {/* CÂU HỎI CHÍNH */}
            <Card className="shadow-2xl border-4 border-purple-300">
              <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
                <CardTitle className="text-5xl font-black text-purple-800">
                  Câu hỏi chính
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-10">
                <p className="text-3xl leading-relaxed font-medium text-gray-800">
                  {question.question}
                </p>
              </CardContent>
            </Card>

            {/* CUE CARD / FOLLOW-UP */}
            {question.subQuestions.length > 0 && (
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-purple-700">
                    Cue Card / Follow-up Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-6 text-2xl">
                    {question.subQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="text-purple-600 font-black text-3xl">
                          {i + 1}.
                        </span>
                        <span className="leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* GỢI Ý Ý TƯỞNG */}
            {question.suggestedIdeas.length > 0 && (
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">
                    Suggested Ideas & Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {question.suggestedIdeas.map((idea, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xl px-8 py-4 border-2 border-purple-400 bg-purple-50">
                        {idea}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SAMPLE ANSWER */}
            {question.sampleAnswer && (
              <Card className="shadow-2xl border-2 border-purple-300">
                <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100">
                  <CardTitle className="text-5xl font-black text-indigo-800">
                    Sample Answer (Band 8.0+)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <p className="text-xl leading-relaxed whitespace-pre-wrap font-serif text-gray-700 tracking-wide">
                    {question.sampleAnswer}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
