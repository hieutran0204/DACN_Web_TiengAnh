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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl">Đang tải đề Reading...</p>
      </div>
    );
  }

  return (
    <>

      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4">
              IELTS Reading Practice Tests
            </h1>
            <p className="text-2xl text-gray-600">
              Các đề Reading chính thức – chuẩn Cambridge
            </p>
          </div>

          {exams.length === 0 ? (
            <div className="text-center py-32">
              <Lock className="w-20 h-20 mx-auto mb-8 text-gray-400" />
              <p className="text-4xl font-bold text-gray-500 mb-6">
                Chưa có đề Reading nào
              </p>
              <p className="text-lg text-gray-400">
                Admin đang cập nhật thêm đề mới...
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {exams.map((exam) => (
                <Card
                  key={exam._id}
                  className="hover:shadow-2xl transition-all hover:scale-105 duration-300 border-2 border-emerald-200 bg-white">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-xl">
                    <CardTitle className="text-2xl font-bold">
                      {exam.title}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-2 bg-white/20">
                      Reading Test
                    </Badge>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <CardDescription className="text-gray-600 mb-6 min-h-20">
                      {exam.description ||
                        "Đề Reading chuẩn IELTS – 3 passages"}
                    </CardDescription>

                    <div className="flex justify-between items-center mb-8 text-emerald-700 font-bold">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-7 h-7" />
                        <span className="text-2xl">
                          {exam.questionCount.reading} câu
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-7 h-7" />
                        <span className="text-2xl">60 phút</span>
                      </div>
                    </div>

                    <Button
                      asChild
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold py-8 rounded-xl">
                      <Link
                        href={`/tests/reading/exam/${exam._id}`}
                        className="flex items-center justify-center gap-4">
                        Làm bài ngay
                        <ChevronRight className="w-7 h-7" />
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
