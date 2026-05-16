"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, Activity, AlertTriangle, CheckCircle2, Award, Zap, Loader2 } from "lucide-react";

export function OverviewPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/user/history/overview")
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy overview:", err);
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

  if (!data) {
    return <div className="text-center py-8 text-muted-foreground">Không có dữ liệu đánh giá</div>;
  }

  const { totalCompleted, writingAverage, examAverage, aiEvaluation } = data;

  return (
    <div className="space-y-6">
      {/* 3 Thẻ Stats Phía Trên */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testing Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground">Tests & Submissions Total</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Writing Band Average</CardTitle>
             <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{writingAverage || "0.0"}</div>
             <p className="text-xs text-muted-foreground">Based on recently evaluated essays</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Reading / Listening Avg</CardTitle>
             <BookOpen className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{examAverage || "0.0%"}</div>
             <p className="text-xs text-muted-foreground">Accuracy across multi-choice exams</p>
          </CardContent>
        </Card>
      </div>

      {/* AI SKILL EVALUATION - (Phần GraphRAG Tương Lai) */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                AI Skill Profile & Recommendations
              </CardTitle>
              <CardDescription>
                Hệ thống tự động tổng hợp từ tất cả các bài làm trong Lịch sử (GraphRAG Analytics Layer).
              </CardDescription>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1 uppercase font-bold tracking-wider">Hiệu suất rèn luyện</div>
              <Badge variant="outline" className="text-base px-3 py-1 font-semibold text-primary border-primary/50">
                 {aiEvaluation.currentLevel}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Điểm Mạnh */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-emerald-600">
                 <CheckCircle2 className="w-5 h-5" /> 
                 Common Strengths
              </h3>
              <div className="space-y-2">
                 {aiEvaluation.strengths.map((str: string, index: number) => (
                    <div key={index} className="flex gap-2 items-start text-sm bg-emerald-50 p-2 rounded border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/20">
                       <Award className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                       <span className="font-medium text-emerald-800 dark:text-emerald-300">{str}</span>
                    </div>
                 ))}
                 {aiEvaluation.strengths.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Cần thực hiện bài thi Writing để AI có dữ liệu đánh giá Điểm mạnh.</p>
                 )}
              </div>
            </div>

            {/* Điểm Yếu */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-destructive">
                 <AlertTriangle className="w-5 h-5" /> 
                 Areas for Improvement
              </h3>
              <div className="space-y-2">
                 {aiEvaluation.weaknesses.map((weak: string, index: number) => (
                    <div key={index} className="flex gap-2 items-start text-sm bg-red-50 p-2 rounded border border-red-100 dark:bg-red-900/10 dark:border-red-800/20">
                       <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                       <span className="font-medium text-red-800 dark:text-red-300">{weak}</span>
                    </div>
                 ))}
                 {aiEvaluation.weaknesses.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Cần thực hiện bài thi Writing để AI có dữ liệu phân tích Điểm yếu.</p>
                 )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="pt-4 text-xs text-muted-foreground/50 text-center italic">
         *The AI Graph Engine continuously updates your metrics as you submit new assignments.
      </div>
    </div>
  );
}
