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
  description?: string;
  durationMinutes: number;
  totalAttempts?: number;
  questionCount: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    total: number;
  };
}

export default function ListeningTestsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // GỌI ĐÚNG ROUTE + LỌC CHỈ CÁC ĐỀ CÓ LISTENING
    apiFetch("/exam?isPublished=true")
      .then((res: any) => {
        const data = res?.success && Array.isArray(res?.data) ? res.data : [];
        const listeningExams = (Array.isArray(data) ? data : []).filter(
          (exam: Exam) => exam.questionCount.listening > 0
        );

        console.log("Đề Listening đã load:", listeningExams);
        setExams(listeningExams);
      })
      .catch((err) => {
        console.error("Lỗi load đề Listening:", err);
        setExams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalListeningQuestions = exams.reduce(
    (sum, e) => sum + e.questionCount.listening,
    0
  );
  const totalAttempts = exams.reduce(
    (sum, e) => sum + (e.totalAttempts || 0),
    0
  );

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
            Đang tải đề thi Listening...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
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
              <div className="p-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-2xl shadow-blue-500/20">
                <Headphones className="w-20 h-20 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Listening Practice Tests
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Luyện nghe chuẩn IELTS với audio chất lượng cao từ British Council
              & Cambridge • 4 phần đầy đủ • Chấm điểm tự động • Giải thích chi
              tiết từng câu
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
                  Chưa có đề thi Listening nào được công khai
                </p>
                <p className="text-lg text-muted-foreground">
                  Admin đang chuẩn bị thêm đề mới • Hãy quay lại sau nhé!
                </p>
              </div>
            ) : (
              exams.map((exam) => (
                <motion.div key={exam._id} variants={item}>
                  <Link href={`/tests/listening/exam/${exam._id}`}>
                    <Card className="group h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 hover:border-blue-500/50 cursor-pointer overflow-hidden bg-card/50 backdrop-blur-sm">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="secondary" className="font-medium bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                            IELTS Official
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {exam.questionCount.listening} câu
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2">
                          {exam.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-3 line-clamp-2">
                          {exam.description ||
                            "Đề thi Listening chuẩn IELTS • Audio chất lượng cao"}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="font-semibold text-foreground">
                                ~30 phút
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Thời gian
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="font-semibold text-foreground">
                                {exam.questionCount.listening} câu
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Câu hỏi
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm font-medium">
                            <strong className="text-foreground text-base">
                              {exam.totalAttempts?.toLocaleString() || "1.2k+"}
                            </strong>{" "}
                            lượt thi
                          </span>
                        </div>

                        <Button className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
                          <PlayCircle className="w-5 h-5 mr-2" />
                          Bắt Đầu Nghe Ngay
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Stats Banner */}
          {exams.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-600/10 rounded-3xl p-12 text-center border border-blue-500/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                    {exams.length}
                  </span>{" "}
                  đề Listening •{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                    {totalListeningQuestions}
                  </span>{" "}
                  câu hỏi •{" "}
                  <span className="text-blue-600">
                    {totalAttempts.toLocaleString()}
                  </span>{" "}
                  lượt luyện tập
                </h2>
                <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
                  Audio chuẩn British Council • Chấm điểm tức thì • Giải thích
                  từng từ vựng • Theo dõi band nghe
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
