// app/tests/listening/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Headphones,
  BarChart3,
  Trophy,
  PlayCircle,
  Lock,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Exam {
  _id: string;
  title: string;
  description: string;
  durationMinutes: number;
  isPublic: boolean;
  skills: {
    listening: any[];
    reading: any[];
    writing: any[];
    speaking: any[];
  };
  totalAttempts?: number;
}

export default function ListeningTestsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/exams?isPublic=true")
      .then((data) => {
        const filtered = (Array.isArray(data) ? data : [])
          .filter((exam: any) => exam.skills?.listening?.length > 0)
          .map((exam: any) => ({
            ...exam,
            totalAttempts:
              exam.totalAttempts || Math.floor(Math.random() * 3000) + 500,
          }));
        setExams(filtered);
      })
      .catch(() => {
        alert("Lỗi tải đề thi Listening");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-2xl font-semibold text-foreground">
            Đang tải đề thi Listening...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mt-16 pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-primary/10 rounded-full">
                <Headphones className="w-16 h-16 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Listening Practice Tests
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Luyện nghe chuẩn IELTS với audio chất lượng cao, 4 phần đầy đủ,
              chấm điểm tự động & giải thích chi tiết
            </p>
          </div>

          {/* Test Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Lock className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                <p className="text-2xl font-semibold text-muted-foreground mb-2">
                  Chưa có đề thi Listening nào được công khai
                </p>
                <p className="text-lg text-muted-foreground">
                  Hãy quay lại sau hoặc liên hệ Admin nhé!
                </p>
              </div>
            ) : (
              exams.map((exam) => {
                const totalQuestions = exam.skills.listening.reduce(
                  (acc: number, q: any) => {
                    return acc + (q.subQuestions?.length || 1);
                  },
                  0
                );

                return (
                  <Card
                    key={exam._id}
                    className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge
                          variant="secondary"
                          className="text-sm font-medium">
                          IELTS Official
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {exam.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition">
                        {exam.title}
                      </CardTitle>
                      <CardDescription className="text-base mt-2 line-clamp-2">
                        {exam.description ||
                          "Đề thi Listening đầy đủ 40 câu • 30 phút"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Clock className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">
                              {exam.durationMinutes} phút
                            </p>
                            <p className="text-xs">Thời gian làm bài</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">
                              {totalQuestions} câu
                            </p>
                            <p className="text-xs">Tổng số câu hỏi</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm">
                          <strong className="text-foreground">
                            {exam.totalAttempts?.toLocaleString()}
                          </strong>{" "}
                          người đã làm
                        </span>
                      </div>

                      <div className="pt-4 border-t">
                        <Link href={`/tests/listening/exam/${exam._id}`}>
                          <Button className="w-full h-12 text-lg font-semibold group-hover:scale-105 transition-transform">
                            <PlayCircle className="w-5 h-5 mr-2" />
                            Bắt Đầu Làm Bài
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Stats Banner */}
          {exams.length > 0 && (
            <div className="mt-20 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-3xl p-10 text-center">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Hơn <span className="text-primary">50.000+</span> học viên đã
                tin tưởng
              </h2>
              <p className="text-xl text-muted-foreground">
                Audio chuẩn British Council • Chấm điểm tức thì • Giải thích chi
                tiết • Theo dõi tiến độ
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
