"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Trash2, Image, Mic } from "lucide-react";

interface SpeakingQuestion {
  _id: string;
  topic: string;
  type: string;
  question: string;
  subQuestions: string[];
  suggestedIdeas: string[];
  image?: string;
  difficulty: string;
  createdAt: string;
}

export default function SpeakingQuestionsList() {
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ĐÃ SỬA ĐÚNG URL – CHỈ LÀ /speaking THÔI!!!
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/questions/speaking`
    )
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setQuestions(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch Speaking:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("XÓA THẬT HẢ CON? KHÔNG LẤY LẠI ĐƯỢC ĐÂU NHÉ!")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/questions/speaking/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok || res.status === 204) {
        setQuestions((prev) => prev.filter((q) => q._id !== id));
        alert("ĐÃ XÓA THÀNH CÔNG – ĐỈNH CAO NHƯ IELTS 9.0!!!");
      } else {
        let errorMsg = "Xóa thất bại!";
        try {
          const err = await res.json();
          errorMsg += " " + (err.message || "");
        } catch {}
        alert(errorMsg);
      }
    } catch (err) {
      alert("LỖI MẠNG HOẶC CHƯA LOGIN ADMIN!");
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      personal_experience: "Personal Experience",
      descriptive: "Descriptive",
      comparative: "Comparative",
      opinion_based: "Opinion",
      cause_effect: "Cause & Effect",
      hypothetical: "Hypothetical",
      advantage_disadvantage: "Adv/Disadv",
      problem_solution: "Problem & Solution",
      prediction: "Prediction",
      abstract: "Abstract",
    };
    return map[type] || type.replace(/_/g, " ");
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === "easy") return "bg-green-100 text-green-800";
    if (diff === "hard") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Mic className="w-24 h-24 animate-pulse text-purple-600 mx-auto mb-6" />
          <p className="text-4xl font-bold">Đang tải Speaking Questions...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Navbar />
      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              SPEAKING QUESTIONS
            </h1>
            <p className="text-2xl mt-4">
              Tổng:{" "}
              <strong className="text-purple-600 font-bold">
                {questions.length}
              </strong>{" "}
              câu hỏi
            </p>
          </div>
          <Button asChild size="lg" className="text-2xl px-12 py-8 shadow-2xl">
            <Link href="/admin/skills/speaking/questions/new">
              <Plus className="mr-4 w-10 h-10" />
              TẠO CÂU HỎI MỚI
            </Link>
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-32">
            <Mic className="w-32 h-32 mx-auto text-gray-300 mb-8" />
            <p className="text-3xl text-gray-500 mb-10">
              Chưa có câu hỏi Speaking nào
            </p>
            <Button asChild size="lg">
              <Link href="/admin/skills/speaking/questions/new">
                Tạo câu hỏi đầu tiên
              </Link>
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-pink-100 to-purple-100">
                  <TableHead className="text-center font-bold">#</TableHead>
                  <TableHead className="font-bold">Topic</TableHead>
                  <TableHead className="font-bold">Câu hỏi</TableHead>
                  <TableHead className="text-center font-bold">Loại</TableHead>
                  <TableHead className="text-center font-bold">
                    Độ khó
                  </TableHead>
                  <TableHead className="text-center font-bold">
                    Cue Card
                  </TableHead>
                  <TableHead className="text-center font-bold">Hình</TableHead>
                  <TableHead className="text-center font-bold">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q, i) => (
                  <TableRow
                    key={q._id}
                    className="hover:bg-purple-50 transition-colors">
                    <TableCell className="text-center font-bold text-purple-600 text-lg">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {q.topic}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="line-clamp-2 text-sm">{q.question}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(q.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`px-3 py-1 ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {q.subQuestions.length > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800">
                          {q.subQuestions.length} dòng
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {q.image ? (
                        <Image className="w-8 h-8 text-green-600 mx-auto" />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-3">
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/admin/skills/speaking/questions/detail/${q._id}`}>
                            <Eye className="w-5 h-5" />
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link
                            href={`/admin/skills/speaking/questions/edit/${q._id}`}>
                            <Edit className="w-5 h-5" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(q._id)}>
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
