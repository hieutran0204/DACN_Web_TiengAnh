"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { notFound } from "next/navigation";
import { Headphones, BookOpen, PenTool, Mic } from "lucide-react";
import Link from "next/link";

type Question = Record<string, any>;

export default function ExamDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/admin/exam/${id}`)
      .then((res) => {
        const data = res.data || res;
        setExam(data);
      })
      .catch(() => notFound())
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-bold">Đang tải đề thi...</div>
      </div>
    );
  }

  if (!exam) return notFound();

  const skills = exam.skills || {};
  const totalQuestions =
    (skills.listening?.length || 0) +
    (skills.reading?.length || 0) +
    (skills.writing?.length || 0) +
    (skills.speaking?.length || 0);

  const skillIcons = [
    {
      Icon: Headphones,
      label: "Listening",
      data: skills.listening || [],
      color: "text-blue-600",
    },
    {
      Icon: BookOpen,
      label: "Reading",
      data: skills.reading || [],
      color: "text-green-600",
    },
    {
      Icon: PenTool,
      label: "Writing",
      data: skills.writing || [],
      color: "text-purple-600",
    },
    {
      Icon: Mic,
      label: "Speaking",
      data: skills.speaking || [],
      color: "text-orange-600",
    },
  ];

  const renderQuestions = (questions: Question[], skillName: string) => {
    if (!questions || questions.length === 0) {
      return (
        <p className="text-muted-foreground italic py-4">Không có câu hỏi</p>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Độ khó</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q: Question, idx: number) => (
            <TableRow key={q._id}>
              <TableCell className="font-medium">{idx + 1}</TableCell>
              <TableCell className="max-w-md">
                <div className="truncate">
                  {q.title ||
                    q.question ||
                    q.topic ||
                    q.passageNumber ||
                    q.passage ||
                    "Không có nội dung"}
                </div>
              </TableCell>
              <TableCell>
                {q.type
                  ? q.type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    q.difficulty === "easy"
                      ? "default"
                      : q.difficulty === "hard"
                        ? "destructive"
                        : "secondary"
                  }>
                  {(q.difficulty || "medium").toUpperCase()}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-16 py-12 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold mb-4">{exam.title}</h1>
            {exam.description && (
              <p className="text-xl text-muted-foreground max-w-4xl">
                {exam.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">
              {totalQuestions}
            </div>
            <div className="text-muted-foreground">câu hỏi</div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Thời gian làm bài</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">
                {exam.durationMinutes || 180} phút
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={exam.isPublished ? "default" : "secondary"}
                className="text-lg px-4 py-2">
                {exam.isPublished ? "Đã công bố" : "Bản nháp"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Kỹ năng có trong đề</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {skillIcons
                  .filter((s) => s.data.length > 0)
                  .map(({ Icon, color, label }) => (
                    <div key={label} className="text-center">
                      <Icon className={`w-10 h-10 ${color}`} />
                      <div className="text-xs mt-1">{label}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danh sách câu hỏi từng kỹ năng */}
        <div className="space-y-10">
          {skillIcons.map(
            ({ label, data, Icon, color }) =>
              data.length > 0 && (
                <Card key={label}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Icon className={`w-8 h-8 ${color}`} />
                      {label} ({data.length} câu)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>{renderQuestions(data, label)}</CardContent>
                </Card>
              )
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex gap-4 mt-12">
          <Button asChild size="lg">
            <Link href={`/admin/exam/${id}/edit`}>Sửa đề thi</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/admin/exams")}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    </div>
  );
}
