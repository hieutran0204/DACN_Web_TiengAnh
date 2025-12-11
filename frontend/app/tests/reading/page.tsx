"use client";

import { useState, useEffect } from "react";
import Link from "next/link";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ChevronRight, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Exam {
  _id: string;
  title: string;
  description?: string;
  questionCount: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    total: number;
  };
}

export default function ReadingListPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/exam?isPublished=true")
      .then((res: any) => {
        const data = res?.success && Array.isArray(res?.data) ? res.data : [];

        // 🟩 CHỈ LẤY ĐỀ CÓ READING — GIỐNG LISTENING
        const readingExams = data.filter(
          (exam: Exam) => exam.questionCount.reading > 0
        );

        console.log("Đề Reading load:", readingExams);
        setExams(readingExams);
      })
      .catch(() => {
        setExams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-2xl text-slate-600 dark:text-slate-400">Đang tải đề Reading...</p>
      </div>
    );
  }

  return (
    <>

      <main className="min-h-screen pt-20 pb-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              IELTS Reading Practice Tests
            </h1>
            <p className="text-2xl text-slate-600 dark:text-slate-400">
              Các đề Reading chính thức – chuẩn Cambridge
            </p>
          </div>

          {exams.length === 0 ? (
            <div className="text-center py-32">
              <Lock className="w-20 h-20 mx-auto mb-8 text-slate-400 dark:text-slate-600" />
              <p className="text-4xl font-bold text-slate-500 dark:text-slate-400 mb-6">
                Chưa có đề Reading nào
              </p>
              <p className="text-lg text-slate-400 dark:text-slate-500">
                Admin đang cập nhật thêm đề mới...
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {exams.map((exam) => (
                <Card
                  key={exam._id}
                  className="group hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 border-2 border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 p-0 gap-0 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-600" />
                  <CardHeader className="pt-6 pb-4">
                    <CardTitle className="text-2xl font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-slate-900 dark:text-slate-100">
                      {exam.title}
                    </CardTitle>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50">
                        Reading Test
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-6 space-y-6">
                    <CardDescription className="text-slate-600 dark:text-slate-400 min-h-[3rem] line-clamp-2">
                      {exam.description ||
                        "Đề Reading chuẩn IELTS – 3 passages"}
                    </CardDescription>

                    <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-bold border-t border-emerald-100 dark:border-emerald-900/50 pt-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        <span className="text-lg">
                          {exam.questionCount.reading} câu
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="text-lg">60 phút</span>
                      </div>
                    </div>

                    <Button
                      asChild
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold py-6 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none group-hover:scale-[1.02] transition-transform">
                      <Link
                        href={`/tests/reading/exam/${exam._id}`}
                        className="flex items-center justify-center gap-2">
                        Làm bài ngay
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

    </>
  );
}
