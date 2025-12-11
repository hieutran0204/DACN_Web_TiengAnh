"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Clock, ChevronRight, MessageSquare, Lock, Trophy } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Exam {
  _id: string;
  title: string;
  description?: string;
  questionCount: {
    speaking: number;
  };
  totalAttempts?: number;
  skills?: {
    speaking?: {
      part: "Part 1" | "Part 2" | "Part 3";
      question: string;
    }[];
  };
}

export default function SpeakingListPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/exam?isPublished=true")
      .then((res: any) => {
        const data = res?.success && Array.isArray(res?.data) ? res.data : [];

        // 🔥 Chỉ lấy đề có Speaking
        const speakingExams = data.filter(
          (exam: Exam) => exam.questionCount.speaking > 0
        );

        setExams(speakingExams);
      })
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
          <p className="text-2xl font-semibold text-foreground">
            Đang tải đề Speaking...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mt-16 pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-8">
              <div className="p-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-2xl shadow-orange-500/20">
                <Mic className="w-20 h-20 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Speaking Practice Tests
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Bộ đề chuẩn Cambridge • Part 1, 2 & 3 • Luyện nói cùng AI
            </p>
          </motion.div>

          {/* Test Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          >
            {exams.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Lock className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-50" />
                <p className="text-2xl font-semibold text-muted-foreground mb-2">
                  Chưa có đề Speaking nào được công khai
                </p>
                <p className="text-lg text-muted-foreground">
                  Admin đang cập nhật thêm đề...
                </p>
              </div>
            ) : (
              exams.map((exam) => (
                <motion.div key={exam._id} variants={item}>
                  <Link href={`/tests/speaking/exam/${exam._id}`}>
                    <Card className="group h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 hover:border-orange-500/50 cursor-pointer overflow-hidden bg-card/50 backdrop-blur-sm p-0 gap-0">
                      <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500" />
                      <CardHeader className="pb-4 pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="secondary" className="font-medium bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">
                            Speaking Test
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            3 Parts
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground group-hover:text-orange-600 transition-colors line-clamp-2">
                          {exam.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-3 line-clamp-2">
                          {exam.description || "Full Speaking Test gồm 3 phần Part 1 – Part 2 – Part 3"}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-5 pb-6">
                        {/* Task Preview */}
                        <div className="space-y-3">
                          {/* Simplified preview logic for Speaking */}
                          <div className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/10">
                            <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                              <MessageSquare className="w-4 h-4" />
                              <span>3 Parts: Interview, Cue Card, Discussion</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-muted-foreground pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-500" />
                            <span className="text-sm font-medium">11-14 phút</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {exam.totalAttempts?.toLocaleString() || "0"} thi
                            </span>
                          </div>
                        </div>

                        <Button className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-all">
                          Bắt đầu nói
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
