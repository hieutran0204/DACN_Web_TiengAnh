"use client";

import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api"; // ← DÙNG CHÍNH CÁI NÀY
import {
  Clock,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Exam {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  isPublished?: boolean;
  createdAt?: string;
  // keep flexible because backend may return different shapes
  skills?: any;
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // ------- Helpers -------
  // Normalize array entries that come as Extended JSON from MongoDB
  const normalizeIds = (arr: any): any[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => {
      if (item && typeof item === "object") {
        if ("$oid" in item) return item.$oid; // { $oid: '...' }
        if ("_id" in item && typeof item._id === "object" && "$oid" in item._id)
          return item._id.$oid; // sometimes items are objects with {_id: {$oid: '...'}}
      }
      return item; // string id or object
    });
  };

  // If the list API returns exams without full `skills` populated, try to fetch details for those exams.
  const fetchMissingSkills = async (list: Exam[]) => {
    try {
      const needFetch = list.filter((e) => {
        // if skills is missing OR it's an object but each skill array is empty/undefined
        if (!e.skills) return true;
        if (typeof e.skills !== "object") return true;
        const s = e.skills as any;
        const hasAny =
          (Array.isArray(s.listening) && s.listening.length > 0) ||
          (Array.isArray(s.reading) && s.reading.length > 0) ||
          (Array.isArray(s.writing) && s.writing.length > 0) ||
          (Array.isArray(s.speaking) && s.speaking.length > 0);
        return !hasAny; // if none populated, consider fetching
      });

      if (needFetch.length === 0) return;

      // Fetch details in parallel but limit concurrency lightly (simple approach)
      const promises = needFetch.map((ex) =>
        apiFetch(`/admin/exam/${ex._id}`)
          .then((res) => {
            const data = res.data ?? res;
            return { id: ex._id, data };
          })
          .catch(() => null)
      );

      const results = await Promise.all(promises);
      const merged = [...list];
      results.forEach((r) => {
        if (!r) return;
        const idx = merged.findIndex((m) => m._id === r.id);
        if (idx === -1) return;
        // Merge skills if present
        if (r.data && r.data.skills) {
          merged[idx] = { ...merged[idx], ...r.data };
        }
      });

      setExams(merged);
    } catch (err) {
      // silently ignore; it's just a best-effort enhancement
      console.error("fetchMissingSkills error", err);
    }
  };

  // Load danh sách đề thi
  useEffect(() => {
    let mounted = true;
    apiFetch("/admin/exam")
      .then((res) => {
        const data = res.data ?? res;
        console.log("DỮ LIỆU TỪ BACKEND:", data);

        if (!Array.isArray(data)) {
          console.error("Dữ liệu không phải mảng:", data);
          if (mounted) setExams([]);
          return;
        }

        if (mounted) setExams(data);
        // best-effort: fetch details for exams missing skills
        fetchMissingSkills(data);
      })
      .catch((err) => {
        console.error("Lỗi API:", err);
        const msg =
          err.message && err.message.includes && err.message.includes("404")
            ? "API không tồn tại! Kiểm tra route: /api/admin/exam"
            : err.message && err.message.includes && err.message.includes("401")
              ? "Bạn không phải admin hoặc token hết hạn!"
              : "Không kết nối được server";
        if (mounted) setError(msg);
        toast({
          variant: "destructive",
          title: "Lỗi tải đề thi",
          description: msg,
        });
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [toast]);

  // Publish / Unpublish
  const handlePublish = async (id: string, current: boolean) => {
    if (!confirm(current ? "Ẩn đề thi này?" : "Công khai đề thi này?")) return;

    try {
      await apiFetch(`/admin/exam/${id}/publish`, { method: "PATCH" });
      setExams((prev) =>
        prev.map((e) => (e._id === id ? { ...e, isPublished: !current } : e))
      );
      toast({
        title: "Thành công",
        description: current ? "Đã ẩn" : "Đã công khai",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Thất bại",
        description: err.message || "Có lỗi xảy ra",
      });
    }
  };

  // Xóa đề thi
  const handleDelete = async (id: string) => {
    if (!confirm("XÓA VĨNH VIỄN đề thi này? Không thể khôi phục!")) return;

    try {
      await apiFetch(`/admin/exam/${id}`, { method: "DELETE" });
      setExams((prev) => prev.filter((e) => e._id !== id));
      toast({ title: "Đã xóa", description: "Đề thi đã bị xóa vĩnh viễn" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Xóa thất bại",
        description: err.message,
      });
    }
  };

  const safeArrayLen = (arr: any) => normalizeIds(arr).length;

  const getTotalQuestions = (exam: Exam) => {
    const skills = exam.skills || {};

    // Convert Extended JSON to simple arrays of ids then count
    const listening = safeArrayLen(skills.listening);
    const reading = safeArrayLen(skills.reading);
    const writing = safeArrayLen(skills.writing);
    const speaking = safeArrayLen(skills.speaking);

    const total = listening + reading + writing + speaking;

    console.log(
      `[Exam: ${exam.title}] L:${listening} R:${reading} W:${writing} S:${speaking} → Total:${total}`
    );

    return total;
  };

  const getSkillIcons = (exam: Exam) => {
    const skills = exam.skills || {};

    const counts = {
      listening: safeArrayLen(skills.listening),
      reading: safeArrayLen(skills.reading),
      writing: safeArrayLen(skills.writing),
      speaking: safeArrayLen(skills.speaking),
    };

    const icons = [
      { Icon: Headphones, color: "text-blue-600", count: counts.listening },
      { Icon: BookOpen, color: "text-green-600", count: counts.reading },
      { Icon: PenTool, color: "text-purple-600", count: counts.writing },
      { Icon: Mic, color: "text-orange-600", count: counts.speaking },
    ];

    return icons
      .filter((i) => i.count > 0)
      .map(({ Icon, color, count }, i) => (
        <div key={i} className="flex flex-col items-center">
          <Icon className={`w-7 h-7 ${color}`} />
          <span className="text-xs font-bold text-muted-foreground mt-1">
            {count}
          </span>
        </div>
      ));
  };

  // ================== RENDER ==================
  if (loading) {
    return (
      <main className="min-h-screen bg-background">

        <div className="mt-16 py-10 max-w-7xl mx-auto px-4">
          <div className="flex justify-between mb-10">
            <Skeleton className="h-12 w-96" />
            <Skeleton className="h-12 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full mb-4" />
                  <div className="flex gap-3">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">

        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Không thể tải dữ liệu</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mt-16 pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-3">
                Quản Lý Đề Thi IELTS
              </h1>
              <p className="text-xl text-muted-foreground">
                Tổng cộng:{" "}
                <strong className="text-primary font-bold">
                  {exams.length}
                </strong>{" "}
                đề thi
              </p>
            </div>
            <Button asChild size="lg" className="px-8 py-6">
              <Link href="/admin/exams/new">
                <Plus className="w-6 h-6 mr-3" />
                Tạo Đề Thi Mới
              </Link>
            </Button>
          </div>

          {/* Empty state */}
          {exams.length === 0 ? (
            <Card className="text-center py-20 border-dashed">
              <CardContent>
                <div className="w-32 h-32 mx-auto mb-8 bg-muted rounded-full flex items-center justify-center">
                  <FileText className="w-16 h-16 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Chưa có đề thi nào</h3>
                <p className="text-muted-foreground mb-8">
                  Tạo đề thi đầu tiên ngay nào!
                </p>
                <Button asChild size="lg">
                  <Link href="/admin/exams/new">Tạo Đề Thi Đầu Tiên</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exams.map((exam) => (
                <Card
                  key={exam._id}
                  className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 overflow-hidden">
                  <div
                    className={`h-2 bg-gradient-to-r ${exam.isPublished ? "from-green-500 to-emerald-500" : "from-gray-400 to-gray-600"}`}
                  />
                  <CardHeader>
                    <div className="flex justify-between items-start mb-4">
                      <CardTitle className="text-2xl font-bold line-clamp-2 group-hover:text-primary">
                        {exam.title}
                      </CardTitle>
                      <Badge
                        variant={exam.isPublished ? "default" : "secondary"}>
                        {exam.isPublished ? (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Draft
                          </>
                        )}
                      </Badge>
                    </div>
                    {exam.description && (
                      <CardDescription className="line-clamp-2">
                        {exam.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">
                          {exam.durationMinutes} phút
                        </span>
                      </div>
                      <div className="flex gap-2">{getSkillIcons(exam)}</div>
                    </div>

                    <div className="text-center py-3 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">
                        {getTotalQuestions(exam)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        tổng số câu hỏi
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/admin/exams/${exam._id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" /> Sửa
                        </Link>
                      </Button>

                      <Button
                        variant={exam.isPublished ? "secondary" : "default"}
                        className="flex-1"
                        onClick={() =>
                          handlePublish(exam._id, !!exam.isPublished)
                        }>
                        {exam.isPublished ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Ẩn Đi
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Public
                          </>
                        )}
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(exam._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
