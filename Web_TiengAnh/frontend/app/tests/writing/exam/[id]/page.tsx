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
  const [activeTab, setActiveTab] = useState("task1");
  const [copied, setCopied] = useState<{ task1: boolean; task2: boolean }>({
    task1: false,
    task2: false,
  });

  const [answers, setAnswers] = useState({
    task1: "",
    task2: "",
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Exam
  useEffect(() => {
    apiFetch(`/exam/${id}?populate=skills.writing`)
      .then((res: any) => {
        if (res?.success && res.data) {
          setExam(res.data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Exam not found!",
          });
          router.push("/tests/writing");
        }
      })
      .catch(() => {
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
      setAnswers(parsed.answers || { task1: "", task2: "" });
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

  const handleCopy = (text: string, task: "task1" | "task2") => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [task]: true });
    setTimeout(() => setCopied({ ...copied, [task]: false }), 2000);
  };

  const handleSubmit = async () => {
    if (!exam || submitting) return;

    const task1 = exam.skills.writing?.find((q) => q.task === "Task 1");
    const task2 = exam.skills.writing?.find((q) => q.task === "Task 2");

    if (!task1 || !task2) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid exam data.",
      });
      return;
    }

    if (
      answers.task1.trim().length < 100 ||
      answers.task2.trim().length < 200
    ) {
      if (!confirm("Your essay seems short. Are you sure you want to submit?")) {
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/ai/writing-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: id,
          task1Question: task1.question,
          task1Type: task1.type,
          task1Image: task1.image,
          task1Answer: answers.task1,
          task2Question: task2.question,
          task2Type: task2.type,
          task2Answer: answers.task2,
        }),
      });

      const result = await res.json();

      if (result.success && result.submissionId) {
        localStorage.removeItem(`writing-draft-${id}`);
        router.push(`/tests/writing/result/${result.submissionId}`);
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: result.message || "Unknown error occurred.",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to AI server. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!exam) return <NotFoundScreen />;

  const task1 = exam.skills.writing?.find((q) => q.task === "Task 1");
  const task2 = exam.skills.writing?.find((q) => q.task === "Task 2");

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
        <Tabs defaultValue="task1" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-slate-200/50 dark:bg-slate-800/50 p-1">
              <TabsTrigger value="task1" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm font-medium transition-all">Task 1</TabsTrigger>
              <TabsTrigger value="task2" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm font-medium transition-all">Task 2</TabsTrigger>
            </TabsList>
            <div className="hidden md:flex items-center text-sm text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900">
              <AlertCircle className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
              <span>Auto-saving enabled</span>
            </div>
          </div>

          {/* TASK 1 CONTENT */}
          <TabsContent value="task1" className="mt-0">
            {task1 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
                {/* LEFT: PROMPT */}
                <Card className="h-full flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-3">Task 1</Badge>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {task1.type.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        onClick={() => handleCopy(task1.question, "task1")}
                      >
                        {copied.task1 ? <Check className="w-3.5 h-3.5 mr-1 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                        {copied.task1 ? <span className="text-green-600 dark:text-green-400">Copied</span> : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-slate-900">
                    {task1.image && (
                      <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                        <img
                          src={task1.image}
                          alt="Task 1 Visual"
                          className="w-full h-auto object-contain bg-slate-50 dark:bg-slate-950"
                        />
                      </div>
                    )}
                    <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-100">Question</h3>
                    <p className="text-base leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {task1.question}
                    </p>
                  </CardContent>
                </Card>

                {/* RIGHT: EDITOR */}
                <Card className="h-full flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 ring-offset-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                          <PenTool className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">Your Response</span>
                      </div>
                      <Badge variant={answers.task1.trim().split(/\s+/).length < 150 ? "destructive" : "default"} className="font-mono shadow-sm">
                        {answers.task1.trim() ? answers.task1.trim().split(/\s+/).length : 0} words
                      </Badge>
                    </div>
                  </CardHeader>
                  <div className="flex-1 relative bg-white dark:bg-slate-950">
                    <Textarea
                      placeholder="Write your response here (min. 150 words)..."
                      className="absolute inset-0 w-full h-full resize-none p-6 text-base leading-relaxed border-0 focus-visible:ring-0 rounded-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:bg-slate-950 focus:ring-0 focus:outline-none"
                      value={answers.task1}
                      onChange={(e) => setAnswers({ ...answers, task1: e.target.value })}
                      spellCheck={false}
                    />
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
                    Minimum 150 words required
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">Task 1 not found</div>
            )}
          </TabsContent>

          {/* TASK 2 CONTENT */}
          <TabsContent value="task2" className="mt-0">
            {task2 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
                {/* LEFT: PROMPT */}
                <Card className="h-full flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-3">Task 2</Badge>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">ESSAY</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        onClick={() => handleCopy(task2.question, "task2")}
                      >
                        {copied.task2 ? <Check className="w-3.5 h-3.5 mr-1 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                        {copied.task2 ? <span className="text-green-600 dark:text-green-400">Copied</span> : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-slate-900">
                    <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-100">Question</h3>
                    <p className="text-base leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {task2.question}
                    </p>
                    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
                      <h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-400">
                        <FileText className="w-4 h-4" />
                        Writing Tips
                      </h4>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
                        <li>Analyze the question carefully.</li>
                        <li>Structure your essay with an introduction, body paragraphs, and a conclusion.</li>
                        <li>Use a variety of vocabulary and sentence structures.</li>
                        <li>Check your grammar and spelling.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* RIGHT: EDITOR */}
                <Card className="h-full flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 ring-offset-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                          <PenTool className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">Your Response</span>
                      </div>
                      <Badge variant={answers.task2.trim().split(/\s+/).length < 250 ? "destructive" : "default"} className="font-mono shadow-sm">
                        {answers.task2.trim() ? answers.task2.trim().split(/\s+/).length : 0} words
                      </Badge>
                    </div>
                  </CardHeader>
                  <div className="flex-1 relative bg-white dark:bg-slate-950">
                    <Textarea
                      placeholder="Write your response here (min. 250 words)..."
                      className="absolute inset-0 w-full h-full resize-none p-6 text-base leading-relaxed border-0 focus-visible:ring-0 rounded-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:bg-slate-950 focus:ring-0 focus:outline-none"
                      value={answers.task2}
                      onChange={(e) => setAnswers({ ...answers, task2: e.target.value })}
                      spellCheck={false}
                    />
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
                    Minimum 250 words required
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">Task 2 not found</div>
            )}
          </TabsContent>
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
    <p className="text-slate-600 dark:text-slate-400">The exam you are looking for does not exist.</p>
    <Button asChild variant="outline">
      <Link href="/tests">Back to Tests</Link>
    </Button>
  </div>
);

