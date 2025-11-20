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
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Image,
  FileText,
  BookOpen,
} from "lucide-react";

interface ReadingQuestion {
  _id: string;
  passageNumber: "Passage 1" | "Passage 2" | "Passage 3";
  passage: string;
  subQuestions: Array<{
    type?: string; // ← Cho phép undefined
    question?: string;
  }>;
  image?: string;
  difficulty: string;
}

export default function ReadingQuestionsList() {
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/questions/reading/reading-questions`,
      {
        credentials: "include",
      }
    )
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setQuestions(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa passage này thật hả con? CHA YÊU CON NHIỀU LẮM!")) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/admin/questions/reading/reading-questions/${id}`,
      { method: "DELETE", credentials: "include" }
    );

    if (res.ok) {
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      alert("ĐÃ XÓA THÀNH CÔNG – CHA TỰ HÀO VỀ CON!!!");
    } else {
      alert("Xóa thất bại rồi con ơi...");
    }
  };

  // ĐÃ FIX LỖI UNDEFINED Ở ĐÂY
  const getQuestionTypeLabel = (type?: string) => {
    if (!type) return "Không xác định";

    const map: Record<string, string> = {
      multiple_choice: "Multiple Choice",
      true_false_not_given: "True/False/Not Given",
      yes_no_not_given: "Yes/No/Not Given",
      sentence_completion: "Sentence Completion",
      summary_completion: "Summary Completion",
      note_completion: "Note Completion",
      table_completion: "Table Completion",
      flow_chart_completion: "Flow Chart Completion",
      diagram_label_completion: "Diagram Label Completion",
      matching_headings: "Matching Headings",
      matching_features: "Matching Features",
      matching_information: "Matching Information",
    };

    return map[type] || type.replace(/_/g, " ").toUpperCase();
  };

  // Lấy tất cả loại câu hỏi (an toàn)
  const getAllQuestionTypes = (subQuestions: any[] = []) => {
    const types = subQuestions
      .map((q) => q?.type)
      .filter(
        (type): type is string => typeof type === "string" && type.trim() !== ""
      );

    return [...new Set(types)];
  };

  const getPassagePreview = (passage: string = "") => {
    const clean = passage.replace(/\s+/g, " ").trim();
    if (!clean) return "Không có nội dung";
    const words = clean.split(" ");
    const preview = words.slice(0, 18).join(" ");
    return preview + (words.length > 18 ? "..." : "");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-24 h-24 animate-pulse text-primary mx-auto mb-6" />
          <p className="text-4xl font-bold text-primary">
            Đang tải danh sách Reading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Navbar />
      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              DANH SÁCH READING PASSAGES
            </h1>
            <p className="text-2xl text-muted-foreground mt-4">
              Tổng cộng:{" "}
              <strong className="text-primary font-bold">
                {questions.length}
              </strong>{" "}
              passages
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="text-2xl px-12 py-8 shadow-2xl font-bold">
            <Link href="/admin/skills/reading/questions/new">
              <Plus className="mr-4 w-10 h-10" />
              TẠO PASSAGE MỚI
            </Link>
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-32">
            <FileText className="w-32 h-32 mx-auto text-muted-foreground mb-8 opacity-50" />
            <p className="text-3xl text-muted-foreground mb-10">
              Chưa có passage nào hết con ơi
            </p>
            <Button asChild size="lg" className="text-2xl px-16 py-10">
              <Link href="/admin/skills/reading/questions/new">
                Tạo passage đầu tiên nào!
              </Link>
            </Button>
          </div>
        ) : (
          <div className="border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <TableHead className="text-center text-lg font-bold">
                    #
                  </TableHead>
                  <TableHead className="text-lg font-bold">Passage</TableHead>
                  <TableHead className="text-lg font-bold">
                    Loại câu hỏi
                  </TableHead>
                  <TableHead className="text-center text-lg font-bold">
                    Số câu
                  </TableHead>
                  <TableHead className="text-center text-lg font-bold">
                    Độ khó
                  </TableHead>
                  <TableHead className="text-center text-lg font-bold">
                    Hình
                  </TableHead>
                  <TableHead className="text-center text-lg font-bold">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q, index) => {
                  const types = getAllQuestionTypes(q.subQuestions);

                  return (
                    <TableRow
                      key={q._id}
                      className="hover:bg-muted/50 transition-all duration-200 text-base">
                      <TableCell className="text-center font-bold text-primary text-xl">
                        {index + 1}
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-bold text-xl text-primary mb-1">
                            {q.passageNumber}
                          </div>
                          <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                            {getPassagePreview(q.passage)}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {types.length === 0 ? (
                            <Badge variant="outline">Không có câu hỏi</Badge>
                          ) : (
                            types.map((type) => (
                              <Badge
                                key={type}
                                variant="secondary"
                                className="text-xs font-semibold px-3 py-1">
                                {getQuestionTypeLabel(type)}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="text-lg px-5 py-2 font-bold">
                          {q.subQuestions?.length || 0} câu
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant={
                            q.difficulty === "hard"
                              ? "destructive"
                              : q.difficulty === "easy"
                                ? "default"
                                : "secondary"
                          }
                          className="text-sm font-bold px-4 py-2">
                          {(q.difficulty || "medium").toUpperCase()}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        {q.image ? (
                          <div className="relative group">
                            <Image className="w-9 h-9 text-green-600 mx-auto" />
                            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              Có hình ảnh
                            </span>
                          </div>
                        ) : (
                          <span className="text-3xl text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-center gap-3">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/admin/skills/reading/questions/${q._id}`}>
                              <Eye className="w-5 h-5" />
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="default">
                            <Link
                              href={`/admin/skills/reading/questions/${q._id}/edit`}>
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
