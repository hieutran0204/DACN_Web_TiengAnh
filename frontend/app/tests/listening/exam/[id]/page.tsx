"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Headphones,
  Clock,
  CheckCircle2,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  AlertCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Slider } from "@/components/ui/slider";

// Band score chuẩn IELTS Listening 2025
const listeningBandScore: Record<number, number> = {
  39: 9.0, 38: 8.5, 37: 8.5, 36: 8.0, 35: 8.0, 34: 7.5, 33: 7.5,
  32: 7.0, 31: 7.0, 30: 6.5, 29: 6.5, 28: 6.0, 27: 6.0, 26: 5.5,
  25: 5.5, 24: 5.0, 23: 5.0, 22: 5.0, 21: 4.5, 20: 4.5, 19: 4.0,
  18: 4.0, 17: 3.5, 16: 3.5,
};

interface SubQuestion {
  _id: string;
  question: string;
  correctAnswer?: string;
  correctAnswers?: string[];
  options?: string[];
}

interface ListeningQuestion {
  _id: string;
  section: string;
  type: "multiple_choice" | "fill_in_the_blank" | "note_completion" | "sentence_completion" | "matching";
  title: string;
  audio?: string;
  subQuestions: SubQuestion[];
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  skills: { listening: ListeningQuestion[] };
}

export default function ListeningExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes default
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch Exam
  useEffect(() => {
    if (!id) return;

    apiFetch(`/exam/${id}?populate=true`)
      .then((res: any) => {
        const data = res?.success ? res.data : res;

        if (!data?.skills?.listening?.length) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No Listening section found.",
          });
          router.push("/tests");
          return;
        }

        // Fix audio URL
        const fixedData = {
          ...data,
          skills: {
            listening: data.skills.listening.map((q: any) => ({
              ...q,
              audio: q.audio?.startsWith("http")
                ? q.audio
                : `http://localhost:3000${q.audio || ""}`,
            })),
          },
        };

        setExam(fixedData);
        if (fixedData.durationMinutes) {
          setTimeLeft(fixedData.durationMinutes * 60);
        }
      })
      .catch((err) => {
        console.error("Error loading exam:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load exam data.",
        });
      })
      .finally(() => setLoading(false));
  }, [id, toast, router]);

  // Timer
  useEffect(() => {
    if (showResult || loading) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult, loading]);

  // Audio Handling
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioProgress(0);
      // Auto-play when switching sections if desired, or let user control it.
      // Let's let user control it to avoid annoyance, or maybe auto-play is better for exams?
      // Standard behavior: User clicks play.
    }
  }, [currentQIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setAudioProgress(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (subQId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [subQId]: answer }));
  };

  const calculateScore = () => {
    if (!exam) return 0;
    let correct = 0;

    exam.skills.listening.forEach((q) => {
      q.subQuestions.forEach((sq) => {
        const userAns = userAnswers[sq._id]?.trim().toLowerCase() || "";
        if (sq.correctAnswers && sq.correctAnswers.length > 0) {
          const normalized = sq.correctAnswers.map((a) => a.trim().toLowerCase());
          if (normalized.includes(userAns)) correct++;
        } else if (sq.correctAnswer) {
          if (userAns === sq.correctAnswer.trim().toLowerCase()) correct++;
        }
      });
    });
    return correct;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log("[FE-DEBUG] Submitting answers:", userAnswers);
      const res: any = await apiFetch(`/exam/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers: userAnswers }),
      });

      if (res.success || res.status === 200) {
        // Handle response structure depending on how apiFetch parses it.
        // Assuming res is the parsed JSON body:
        const result = res.success ? res.data : res; 
        setFinalScore(result.score);
        setShowResult(true);
        toast({
          title: "Test Completed!",
          description: `You scored ${result.score}/${result.totalQuestions}`,
        });
        
        // Optional: Highlight correct/incorrect answers in UI if design permits
        // For now just show result screen
      } else {
         toast({
          variant: "destructive",
          title: "Submission Failed",
          description: res.message || "Could not submit exam.",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while submitting.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!exam) return <NotFoundScreen />;

  const currentQuestion = exam.skills.listening[currentQIndex];
  const totalQuestions = exam.skills.listening.reduce((acc, q) => acc + q.subQuestions.length, 0);
  const progressPercentage = ((currentQIndex + 1) / exam.skills.listening.length) * 100;

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
            <Button size="sm" onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
              Submit
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-7xl mx-auto">
        {showResult ? (
          <ResultScreen score={finalScore} total={totalQuestions} />
        ) : (
          <div className="space-y-6">
            {/* PROGRESS & NAVIGATION */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((i) => i - 1)}
                  className="h-9 w-9 p-0 rounded-full dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section {currentQIndex + 1}</h2>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{currentQuestion.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Progress</span>
                  <p className="font-bold text-primary">{Math.round(progressPercentage)}%</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQIndex === exam.skills.listening.length - 1}
                  onClick={() => setCurrentQIndex((i) => i + 1)}
                  className="h-9 w-9 p-0 rounded-full dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* QUESTIONS CARD */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 py-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800">
                    {currentQuestion.type.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
                    {currentQuestion.subQuestions.length} Questions
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-8">
                {/* AUDIO PLAYER */}
                {currentQuestion.audio && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6 flex items-center gap-4">
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-full shadow-sm bg-primary hover:bg-primary/90 text-white flex-none"
                      onClick={togglePlay}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
                    </Button>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>{formatTime(audioProgress)}</span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                      <Slider
                        value={[audioProgress]}
                        max={audioDuration}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio</span>
                    </div>

                    <audio
                      ref={audioRef}
                      src={currentQuestion.audio}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleAudioEnded}
                      onLoadedMetadata={handleTimeUpdate}
                      className="hidden"
                    />
                  </div>
                )}

                {currentQuestion.subQuestions.map((sq, idx) => (
                  <div key={sq._id} className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-none w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm border border-slate-200 dark:border-slate-700">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-4">
                        <Label className="text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed block">
                          {sq.question}
                        </Label>

                        {/* Multiple Choice */}
                        {currentQuestion.type === "multiple_choice" && sq.options && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {sq.options.map((opt, i) => (
                              <div
                                key={`${opt}-${i}`}
                                onClick={() => handleAnswer(sq._id, opt)}
                                className={`cursor-pointer p-4 rounded-lg border transition-all flex items-center gap-3 ${userAnswers[sq._id] === opt
                                  ? "bg-primary/5 dark:bg-primary/10 border-primary ring-1 ring-primary"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                                  }`}
                              >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${userAnswers[sq._id] === opt ? "border-primary bg-primary text-white" : "border-slate-300 dark:border-slate-600"
                                  }`}>
                                  {userAnswers[sq._id] === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className={`text-base ${userAnswers[sq._id] === opt ? "text-primary font-medium" : "text-slate-700 dark:text-slate-300"}`}>
                                  {opt}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Text Input */}
                        {(currentQuestion.type === "fill_in_the_blank" ||
                          currentQuestion.type === "note_completion" ||
                          currentQuestion.type === "sentence_completion") && (
                            <Input
                              type="text"
                              placeholder="Type your answer..."
                              value={userAnswers[sq._id] || ""}
                              onChange={(e) => handleAnswer(sq._id, e.target.value)}
                              className="max-w-md text-lg h-12 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-primary/20"
                            />
                          )}
                      </div>
                    </div>
                    {idx < currentQuestion.subQuestions.length - 1 && <div className="h-px bg-slate-100 dark:bg-slate-800 my-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
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

const ResultScreen = ({ score, total }: { score: number; total: number }) => {
  const band = listeningBandScore[score] || 0;

  return (
    <Card className="max-w-2xl mx-auto text-center border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
      <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 py-8">
        <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Test Completed!
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Your Score</p>
            <div className="text-5xl font-black text-primary">
              {score}<span className="text-2xl text-slate-400 dark:text-slate-600 font-medium">/{total}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">IELTS Band</p>
            <div className="text-5xl font-black text-blue-600 dark:text-blue-400">
              {band.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto shadow-md">
            <Link href="/tests/listening">Practice Another Test</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto dark:border-slate-700 dark:hover:bg-slate-800">
            <Link href="/tests">Back to Home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
