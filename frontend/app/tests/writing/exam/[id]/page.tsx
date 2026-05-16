
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Timer,
  AlertCircle,
  Send,
  Loader2,
  Copy,
  Check,
  ChevronLeft,
  Clock,
  PenTool,
  FileText,
  Maximize2,
  Minimize2
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface WritingQuestion {
  _id: string;
  task: "Task 1" | "Task 2";
  type: string;
  topic: string;
  question: string;
  image?: string;
}

interface Exam {
  _id: string;
  title: string;
  skills: {
    writing?: WritingQuestion[];
  };
}

export default function WritingExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [activeTab, setActiveTab] = useState<string>("");
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Exam
  useEffect(() => {
    apiFetch(`/exam/${id}?populate=skills.writing`)
      .then((res: any) => {
        if (res?.success && res.data) {
          setExam(res.data);
          // Set active tab to the first question ID
          if (res.data.skills?.writing?.length > 0) {
            setActiveTab(res.data.skills.writing[0]._id);
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Exam not found!",
          });
          router.push("/tests/writing");
        }
      })
      .catch((e) => {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load exam data.",
        });
        router.push("/tests/writing");
      })
      .finally(() => setLoading(false));
  }, [id, router, toast]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  // Auto save draft
  useEffect(() => {
    if (!exam) return;
    const saved = localStorage.getItem(`writing-draft-${id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setAnswers(parsed.answers || {});
      setTimeLeft(parsed.timeLeft || 60 * 60);
    }
  }, [exam, id]);

  useEffect(() => {
    if (!exam || timeLeft === 60 * 60) return;
    localStorage.setItem(
      `writing-draft-${id}`,
      JSON.stringify({ answers, timeLeft })
    );
  }, [answers, timeLeft, id, exam]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = (text: string, questionId: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [questionId]: true });
    setTimeout(() => setCopied({ ...copied, [questionId]: false }), 2000);
  };

  const handleSubmit = async () => {
    if (!exam || submitting) return;

    const writingQuestions = exam.skills.writing || [];
    if (writingQuestions.length === 0) return;

    // Kiểm tra xem có bài nào quá ngắn không
    const tooShort = writingQuestions.some(q => {
      const ans = answers[q._id] || "";
      return ans.trim().length > 0 && ans.trim().length < 50;
    });

    if (tooShort) {
      if (!confirm("Một số bài viết của bạn hơi ngắn. Bạn có chắc chắn muốn nộp không?")) {
        return;
      }
    }

    setSubmitting(true);

    try {
      // Nộp từng Task một vì Backend đã decoupled
      // Lưu kết quả ID của câu cuối cùng để redirect (hoặc có thể cải tiến sau)
      let lastResultId = "";

      for (const q of writingQuestions) {
        const answer = answers[q._id];
        if (!answer?.trim()) continue;

        const res = await apiFetch("/user/writing-exam/submit", {
          method: "POST",
          body: JSON.stringify({
            examId: id,
            questionId: q._id,
            answer: answer,
            taskType: q.task,
          }),
        });

        if (res.success) {
          lastResultId = res.data.resultId;
        }
      }

      if (lastResultId) {
        localStorage.removeItem(`writing-draft-${id}`);
        toast({ 
          title: "Nộp bài thành công!", 
          description: "Bài làm của bạn đã được gửi đi chấm. Bạn có thể xem kết quả trong phần Lịch sử sau vài phút.",
          duration: 5000 
        });
        // Quay lại trang danh sách đề thi để làm bài khác
        router.push("/tests/writing");
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "Please write something before submitting.",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: err.message || "Failed to submit. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!exam) return <NotFoundScreen />;

  const writingQuestions = exam.skills.writing || [];

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-t-4 border-t-primary shadow-sm dark:border-b-slate-800">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tests" className="flex items-center text-muted-foreground hover:text-primary transition-colors font-medium">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px] md:max-w-md">
              {exam.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-md border shadow-sm ${timeLeft < 300 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>
              <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
              <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
            </div>
            <Button size="sm" onClick={handleSubmit} disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 max-w-7xl mx-auto">
        <Tabs defaultValue={writingQuestions[0]?._id} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className={`grid w-full max-w-[400px] bg-slate-200/50 dark:bg-slate-800/50 p-1`} style={{ gridTemplateColumns: `repeat(${writingQuestions.length}, 1fr)` }}>
              {writingQuestions.map((q, idx) => (
                <TabsTrigger key={q._id} value={q._id} className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm font-medium transition-all">
                  {q.task || `Task ${idx + 1}`}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="hidden md:flex items-center text-sm text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900">
              <AlertCircle className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
              <span>Auto-saving enabled</span>
            </div>
          </div>

          {writingQuestions.map((q) => (
            <TabsContent key={q._id} value={q._id} className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
                {/* LEFT: PROMPT */}
                <Card className="h-full flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${q.task === "Task 1" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"} px-3`}>{q.task}</Badge>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {q.type.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(q.question, q._id)}>
                        {copied[q._id] ? <Check className="w-3.5 h-3.5 mr-1 text-green-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-slate-900">
                    {q.image && (
                      <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                        <img
                          src={q.image.startsWith("http") ? q.image : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${q.image}`}
                          alt="Writing Visual"
                          className="w-full h-auto object-contain bg-slate-50 dark:bg-slate-950"
                        />
                      </div>
                    )}
                    <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-100">Question</h3>
                    <p className="text-base leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">{q.question}</p>
                  </CardContent>
                </Card>

                {/* RIGHT: EDITOR */}
                <Card className="h-full flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-primary/20">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 py-3">
                    <div className="flex items-center justify-between">
                       <span className="font-semibold text-slate-800 dark:text-slate-100">Your Response</span>
                       <Badge>{(answers[q._id] || "").trim().split(/\s+/).filter(w => w).length} words</Badge>
                    </div>
                  </CardHeader>
                  <div className="flex-1 relative bg-white dark:bg-slate-950">
                    <Textarea
                      placeholder="Write your response here..."
                      className="absolute inset-0 w-full h-full resize-none p-6 text-base leading-relaxed border-0 focus:ring-0"
                      value={answers[q._id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                    />
                  </div>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Footer />
    </main>
  );
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Loading exam...</p>
    </div>
  </div>
);

const NotFoundScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
    <AlertCircle className="w-16 h-16 text-red-500" />
    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Exam Not Found</h2>
    <Button asChild variant="outline">
      <Link href="/tests">Back to Tests</Link>
    </Button>
  </div>
);
