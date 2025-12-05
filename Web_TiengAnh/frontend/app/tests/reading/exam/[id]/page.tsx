"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trophy,
  Home,
  RotateCcw,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// Band score Reading chuẩn IELTS 2025
const readingBandScore: Record<number, number> = {
  40: 9.0, 39: 8.5, 38: 8.5, 37: 8.0, 36: 8.0, 35: 7.5, 34: 7.5,
  33: 7.0, 32: 7.0, 31: 6.5, 30: 6.5, 29: 6.0, 28: 6.0, 27: 5.5,
  26: 5.5, 25: 5.0, 23: 5.0, 21: 4.5, 19: 4.0, 17: 3.5, 15: 3.0,
};

interface SubQuestion {
  _id: string;
  question: string;
  correctAnswer?: string;
  correctAnswers?: string[];
  options?: string[];
}

interface ReadingPassage {
  _id: string;
  title: string;
  passage: string;
  type:
  | "multiple_choice"
  | "true_false_not_given"
  | "yes_no_not_given"
  | "matching_headings"
  | "fill_in_the_blank"
  | "summary_completion"
  | "sentence_completion";
  subQuestions: SubQuestion[];
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  skills: { reading: ReadingPassage[] };
}

export default function ReadingExamPage() {
  const { id } = useParams();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { toast } = useToast();

  const totalQuestions =
    exam?.skills.reading.reduce((acc, p) => acc + p.subQuestions.length, 0) || 0;

  useEffect(() => {
    if (!id) return;

    apiFetch(`/exam/${id}?populate=true`)
      .then((res: any) => {
        const data = res?.success ? res.data : res;
        if (!data?.skills?.reading?.length) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No Reading section found.",
          });
          return;
        }
        setExam(data);
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load exam data.",
        });
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  const currentPassage = exam?.skills.reading[currentPassageIndex];
  const progress = exam
    ? ((currentPassageIndex + 1) / exam.skills.reading.length) * 100
    : 0;

  const handleAnswer = (subQId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [subQId]: answer }));
  };

  const calculateScore = () => {
    if (!exam) return 0;
    let correct = 0;

    exam.skills.reading.forEach((passage) => {
      passage.subQuestions.forEach((sq) => {
        const userAns = userAnswers[sq._id]?.trim().toUpperCase() || "";

        if (sq.correctAnswers && sq.correctAnswers.length > 0) {
          const correctSet = new Set(
            sq.correctAnswers.map((a) => a.trim().toUpperCase())
          );
          if (correctSet.has(userAns)) correct++;
        } else if (sq.correctAnswer) {
          if (userAns === sq.correctAnswer.trim().toUpperCase()) correct++;
        }
      });
    });
    return correct;
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setFinalScore(score);
    setShowResult(true);
    const band = readingBandScore[score] || 0;
    toast({
      title: "Reading Test Completed!",
      description: `Score: ${score}/${totalQuestions} → Band ${band.toFixed(1)}`,
    });
  };

  if (loading) return <LoadingScreen />;
  if (!exam || !currentPassage) return <NotFoundScreen />;

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
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate max-w-[300px] md:max-w-md">
              {exam.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:flex h-9 items-center gap-2 px-4 text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900">
              <Clock className="w-4 h-4" />
              <span>60:00</span>
            </Badge>
            <Button size="sm" onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
              Submit Test
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 max-w-7xl mx-auto">
        {showResult ? (
          <ResultScreen score={finalScore} total={totalQuestions} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">

            {/* LEFT COLUMN: PASSAGE */}
            <div className="lg:col-span-6 xl:col-span-7 h-full overflow-y-auto pr-2 custom-scrollbar rounded-xl border bg-white dark:bg-slate-900 shadow-md dark:border-slate-800">
              <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-6 border-b dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1">
                    Passage {currentPassageIndex + 1}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPassageIndex === 0}
                      onClick={() => setCurrentPassageIndex((i) => i - 1)}
                      className="h-8 px-3 lg:px-4 w-28 justify-between border-primary/30 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary dark:border-primary/50 dark:hover:bg-primary/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden lg:inline text-xs font-semibold">PREV</span>
                      <span className="lg:hidden" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPassageIndex === exam.skills.reading.length - 1}
                      onClick={() => setCurrentPassageIndex((i) => i + 1)}
                      className="h-8 px-3 lg:px-4 w-28 justify-between border-primary/30 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary dark:border-primary/50 dark:hover:bg-primary/10"
                    >
                      <span className="hidden lg:inline text-xs font-semibold">NEXT</span>
                      <span className="lg:hidden" />
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                  {currentPassage.title}
                </h2>
              </div>

              <div className="p-6 md:p-8 bg-slate-50/30 dark:bg-slate-950/30 min-h-full">
                <article className="prose prose-slate dark:prose-invert max-w-none prose-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="whitespace-pre-line">
                    {currentPassage.passage}
                  </div>
                </article>
              </div>
            </div>

            {/* RIGHT COLUMN: QUESTIONS */}
            <div className="lg:col-span-6 xl:col-span-5 h-full flex flex-col rounded-xl border bg-white dark:bg-slate-900 shadow-md overflow-hidden dark:border-slate-800">
              <div className="p-5 border-b bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Questions
                  </h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm">
                    {Math.round(progress)}% Done
                  </span>
                </div>
                <Progress value={progress} className="h-2.5 bg-slate-200 dark:bg-slate-700" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
                {currentPassage.subQuestions.map((sq, idx) => (
                  <Card key={sq._id} className="border shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow duration-200 dark:border-slate-800">
                    <CardContent className="p-5">
                      <div className="flex gap-4 mb-4">
                        <span className="flex-none flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
                          {idx + 1}
                        </span>
                        <Label className="text-base font-medium leading-relaxed pt-1 text-slate-800 dark:text-slate-200">
                          {sq.question}
                        </Label>
                      </div>

                      {/* Multiple Choice */}
                      {(currentPassage.type === "multiple_choice" ||
                        currentPassage.type === "true_false_not_given" ||
                        currentPassage.type === "yes_no_not_given") &&
                        sq.options && (
                          <div className="grid grid-cols-1 gap-2.5 pl-12">
                            {sq.options.map((opt) => (
                              <Button
                                key={opt}
                                variant={
                                  userAnswers[sq._id] === opt
                                    ? "default"
                                    : "outline"
                                }
                                size="lg"
                                className={`justify-start h-auto py-3.5 px-5 text-left whitespace-normal transition-all duration-200 ${userAnswers[sq._id] === opt
                                  ? "bg-primary text-primary-foreground shadow-md scale-[1.01]"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 hover:border-primary/50 text-slate-600 dark:text-slate-400 dark:border-slate-700"
                                  }`}
                                onClick={() => handleAnswer(sq._id, opt)}
                              >
                                {opt}
                              </Button>
                            ))}
                          </div>
                        )}

                      {/* Text Input */}
                      {(currentPassage.type === "fill_in_the_blank" ||
                        currentPassage.type === "summary_completion" ||
                        currentPassage.type === "sentence_completion") && (
                          <div className="pl-12">
                            <Input
                              type="text"
                              placeholder="Type your answer..."
                              value={userAnswers[sq._id] || ""}
                              onChange={(e) => handleAnswer(sq._id, e.target.value)}
                              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-colors h-11 text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-4 border-t bg-white dark:bg-slate-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {currentPassage.subQuestions.length} questions
                  </span>
                  {currentPassageIndex === exam.skills.reading.length - 1 ? (
                    <Button onClick={handleSubmit} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-md">
                      Finish Test <CheckCircle2 className="ml-2 w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPassageIndex((i) => i + 1)}
                      className="text-primary hover:text-primary hover:bg-primary/5 font-medium"
                    >
                      Next Passage <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-lg font-medium text-muted-foreground">Loading exam...</p>
    </div>
  </div>
);

const NotFoundScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
    <AlertCircle className="w-16 h-16 text-destructive" />
    <h2 className="text-2xl font-bold">Exam Not Found</h2>
    <p className="text-muted-foreground">The exam you are looking for does not exist or has been removed.</p>
    <Button asChild variant="outline">
      <Link href="/tests">Back to Tests</Link>
    </Button>
  </div>
);

const ResultScreen = ({ score, total }: { score: number; total: number }) => {
  const band = readingBandScore[score] || 0;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="border-none shadow-xl bg-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Test Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-6 rounded-2xl bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground mb-1">Score</p>
              <div className="text-4xl font-bold text-foreground">
                {score}<span className="text-xl text-muted-foreground">/{total}</span>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-primary mb-1">IELTS Band</p>
              <div className="text-4xl font-bold text-primary">{band.toFixed(1)}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" variant="outline" className="flex-1">
              <Link href="/tests">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild size="lg" className="flex-1">
              <Link href="/tests/reading">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Another Test
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
