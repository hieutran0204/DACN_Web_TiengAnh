"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, PenTool, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function HistoryPanel() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/user/history/me")
      .then((res) => {
        if (res.data) {
          setHistory(res.data);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy lịch sử:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold">Chưa có dữ liệu</h3>
          <p className="text-muted-foreground mt-2">
            Bạn chưa thực hiện bài thi hoặc luyện tập Writing nào.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record) => (
        <Card key={record._id} className="hover:border-primary transition-colors">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${record.type === "writing" ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                {record.type === "writing" ? <PenTool className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={record.type === "writing" ? "default" : "secondary"}>
                    {record.type === "writing" ? "AI Writing" : "IELTS Exam"}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(record.completedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{record.examTitle}</h3>
                {record.type === "writing" && record.task1Preview && (
                  <p className="text-sm text-muted-foreground max-w-md truncate">
                    {record.task1Preview}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  {record.type === "writing" ? "Band Score" : "Score"}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {record.score}
                  {record.type === "exam" && record.totalQuestions && (
                    <span className="text-sm text-muted-foreground font-normal">
                      /{record.totalQuestions}
                    </span>
                  )}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => router.push(`/profile/history/${record.type}/${record._id}`)}
              >
                Chi tiết
              </Button>
            </div>
            
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
