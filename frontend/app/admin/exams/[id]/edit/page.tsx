"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { notFound } from "next/navigation";

// Dùng kiểu linh hoạt, không lỗi TS
type Question = Record<string, any>;
type ExamResponse = { data?: any } | any;

export default function EditExamPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [exam, setExam] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("180");

  const [selectedQuestions, setSelectedQuestions] = useState<{
    listening: string[];
    reading: string[];
    writing: string[];
    speaking: string[];
  }>({
    listening: [],
    reading: [],
    writing: [],
    speaking: [],
  });

  const [allQuestions, setAllQuestions] = useState<{
    listening: Question[];
    reading: Question[];
    writing: Question[];
    speaking: Question[];
  }>({
    listening: [],
    reading: [],
    writing: [],
    speaking: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      apiFetch(`/admin/exam/${id}`),
      apiFetch("/admin/questions/listening/listening-questions?limit=500"),
      apiFetch("/admin/questions/reading/reading-questions?limit=500"),
      apiFetch("/admin/questions/writing?limit=500"),
      apiFetch("/admin/questions/speaking?limit=500"),
    ])
      .then(
        ([examRes, listeningRes, readingRes, writingRes, speakingRes]: [
          ExamResponse,
          any,
          any,
          any,
          any,
        ]) => {
          const examData = (examRes as any).data || examRes;
          setExam(examData);
          setTitle(examData.title || "");
          setDescription(examData.description || "");
          setDuration(String(examData.durationMinutes || 180));

          const skills = examData.skills || {};
          setSelectedQuestions({
            listening: (skills.listening || []).map((q: any) => q._id || q),
            reading: (skills.reading || []).map((q: any) => q._id || q),
            writing: (skills.writing || []).map((q: any) => q._id || q),
            speaking: (skills.speaking || []).map((q: any) => q._id || q),
          });

          setAllQuestions({
            listening: (listeningRes as any).data || [],
            reading: (readingRes as any).data || [],
            writing: (writingRes as any).data || [],
            speaking: (speakingRes as any).data || [],
          });
        }
      )
      .catch(() => notFound())
      .finally(() => setLoading(false));
  }, [id]);

  const toggleQuestion = (
    skill: keyof typeof selectedQuestions,
    qid: string
  ) => {
    setSelectedQuestions((prev) => ({
      ...prev,
      [skill]: prev[skill].includes(qid)
        ? prev[skill].filter((id) => id !== qid)
        : [...prev[skill], qid],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Tiêu đề không được để trống",
      });
      return;
    }

    setSaving(true);
    try {
      await apiFetch(`/admin/exam/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          durationMinutes: Number(duration) || 180,
          skills: selectedQuestions,
        }),
      });

      toast({ title: "Thành công!", description: "Đã cập nhật đề thi" });
      router.push("/admin/exams");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.message || "Không thể lưu",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-bold">Đang tải đề thi...</div>
      </div>
    );
  }

  if (!exam) return notFound();

  const renderTable = (skill: keyof typeof allQuestions) => {
    const questions = allQuestions[skill] || [];
    if (questions.length === 0) {
      return (
        <p className="text-center py-8 text-muted-foreground">
          Chưa có câu hỏi nào
        </p>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Tiêu đề / Câu hỏi</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Độ khó</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q: Question) => (
            <TableRow key={q._id}>
              <TableCell>
                <Checkbox
                  checked={selectedQuestions[skill].includes(q._id)}
                  onCheckedChange={() => toggleQuestion(skill, q._id)}
                />
              </TableCell>
              <TableCell className="font-medium max-w-md truncate">
                {(
                  q.title ||
                  q.question ||
                  q.topic ||
                  q.passageNumber ||
                  q.passage ||
                  "Chưa có nội dung"
                ).toString()}
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
        <h1 className="text-5xl font-bold mb-8">Sửa Đề Thi</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đề thi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Tiêu đề *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="IELTS Test #01"
                />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Mô tả ngắn về đề thi..."
                />
              </div>
              <div>
                <Label>Thời gian (phút)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="60"
                  max="300"
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chỉnh sửa câu hỏi trong đề</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="listening" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="listening">Listening</TabsTrigger>
                  <TabsTrigger value="reading">Reading</TabsTrigger>
                  <TabsTrigger value="writing">Writing</TabsTrigger>
                  <TabsTrigger value="speaking">Speaking</TabsTrigger>
                </TabsList>

                <TabsContent value="listening">
                  {renderTable("listening")}
                </TabsContent>
                <TabsContent value="reading">
                  {renderTable("reading")}
                </TabsContent>
                <TabsContent value="writing">
                  {renderTable("writing")}
                </TabsContent>
                <TabsContent value="speaking">
                  {renderTable("speaking")}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/admin/exams")}>
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
