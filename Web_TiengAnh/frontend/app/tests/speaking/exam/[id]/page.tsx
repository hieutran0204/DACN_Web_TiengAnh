"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  ChevronRight,
  ChevronLeft,
  Play,
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";

interface SpeakingQuestion {
  _id: string;
  question: string;
  subQuestions?: string[];
  suggestedIdeas?: string[];
  image?: string | null;
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  skills: {
    speaking: string[]; // mảng ObjectId
  };
}

export default function SpeakingExamPage() {
  const { id } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPart, setCurrentPart] = useState<1 | 2 | 3>(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch Data
  useEffect(() => {
    if (!id) return;

    const loadFullTest = async () => {
      try {
        setLoading(true);

        // 1. Lấy Exam
        const examRes = await fetch(`http://localhost:3000/api/exam/${id}`);
        const examData = await examRes.json();

        if (!examData.success || !examData.data) {
          alert("Exam not found!");
          setLoading(false);
          return;
        }

        const examInfo: Exam = examData.data;
        setExam(examInfo);

        // 2. Lấy danh sách speaking IDs
        const speakingIds = examInfo.skills?.speaking || [];
        const validIds = speakingIds.map((item: any) => {
          if (!item) return null;
          if (item.$oid) return item.$oid;
          if (item._id) return item._id;
          if (typeof item === "string") return item;
          if (typeof item === "object" && item.toHexString) return item.toHexString();
          return null;
        }).filter(Boolean);

        if (validIds.length === 0) {
          setLoading(false);
          return;
        }

        // 3. Fetch từng câu hỏi Speaking
        const fetchPromises = validIds.map((qid: string) =>
          fetch(`http://localhost:3000/api/admin/questions/speaking/${qid}`)
            .then((r) => r.json())
            .then((res) => (res.success ? res.data : null))
            .catch(() => null)
        );

        const results = await Promise.all(fetchPromises);
        const validQuestions = results.filter(Boolean);
        setQuestions(validQuestions);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFullTest();
  }, [id]);

  // Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone permission required!");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const playRecording = () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
    }
  };

  if (loading) return <LoadingScreen />;
  if (!exam || questions.length === 0) return <NotFoundScreen />;

  const part1Questions = questions.slice(0, 4);
  const part2Question = questions[4] || questions[0];
  const part3Questions = questions.slice(5);

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
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

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 dark:bg-primary/10 text-primary border-primary/20 px-3 py-1">
              Speaking Test
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex-1 container py-8 max-w-4xl mx-auto">
        {/* PART 1 */}
        {currentPart === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800 px-4 py-1 text-sm">PART 1</Badge>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Introduction & Interview</h2>
              <p className="text-slate-500 dark:text-slate-400">Answer the following questions about yourself.</p>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-10 flex flex-col items-center space-y-10">
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <h3 className="text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                    {part1Questions[currentIndex]?.question || "No question"}
                  </h3>
                </div>

                <div className="relative">
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-red-100 dark:bg-red-900/30 opacity-75"></div>
                  )}
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className={`w-24 h-24 rounded-full shadow-xl transition-all duration-300 ${isRecording ? 'scale-110' : 'hover:scale-105'}`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <MicOff className="w-10 h-10" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                  </Button>
                </div>

                {isRecording && <p className="text-red-500 font-medium animate-pulse">Recording...</p>}

                {audioBlob && !isRecording && (
                  <div className="flex flex-col items-center gap-4 w-full animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/50">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Response Recorded</span>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={playRecording} className="gap-2 dark:border-slate-700 dark:hover:bg-slate-800">
                        <Play className="w-4 h-4" /> Playback
                      </Button>
                      <Button
                        onClick={() => {
                          if (currentIndex < part1Questions.length - 1) {
                            setCurrentIndex((i) => i + 1);
                            setAudioBlob(null);
                            setAudioUrl(null);
                          } else {
                            setCurrentPart(2);
                            setCurrentIndex(0);
                            setAudioBlob(null);
                            setAudioUrl(null);
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md"
                      >
                        {currentIndex < part1Questions.length - 1 ? "Next Question" : "Start Part 2"}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* PART 2 */}
        {currentPart === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-800 px-4 py-1 text-sm">PART 2</Badge>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Long Turn</h2>
              <p className="text-slate-500 dark:text-slate-400">Speak for 1-2 minutes on the topic below.</p>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-8 md:p-10 space-y-8">
                <div className="bg-purple-50 dark:bg-purple-900/10 p-8 rounded-2xl border border-purple-100 dark:border-purple-900/30 space-y-6">
                  <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-300 text-center">
                    {part2Question.question}
                  </h3>

                  {part2Question.subQuestions && part2Question.subQuestions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {part2Question.subQuestions.map((q, i) => (
                        <div key={i} className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center flex-none text-xs font-bold mt-0.5">{i + 1}</div>
                          <p className="text-purple-800 dark:text-purple-200 font-medium">{q}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    {isRecording && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-red-100 dark:bg-red-900/30 opacity-75"></div>
                    )}
                    <Button
                      size="lg"
                      variant={isRecording ? "destructive" : "default"}
                      className={`w-24 h-24 rounded-full shadow-xl transition-all duration-300 ${isRecording ? 'scale-110' : 'hover:scale-105'}`}
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? (
                        <MicOff className="w-10 h-10" />
                      ) : (
                        <Mic className="w-10 h-10" />
                      )}
                    </Button>
                  </div>

                  {isRecording && <p className="text-red-500 font-medium animate-pulse">Recording...</p>}

                  {audioBlob && !isRecording && (
                    <div className="flex flex-col items-center gap-4 w-full animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/50">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Response Recorded</span>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={playRecording} className="gap-2 dark:border-slate-700 dark:hover:bg-slate-800">
                          <Play className="w-4 h-4" /> Playback
                        </Button>
                        <Button
                          onClick={() => {
                            setCurrentPart(3);
                            setAudioBlob(null);
                            setAudioUrl(null);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-md"
                        >
                          Start Part 3
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* PART 3 */}
        {currentPart === 3 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <Badge className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50 border-pink-200 dark:border-pink-800 px-4 py-1 text-sm">PART 3</Badge>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Discussion</h2>
              <p className="text-slate-500 dark:text-slate-400">Discuss abstract questions related to Part 2.</p>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-10 flex flex-col items-center space-y-10">
                <div className="w-full bg-pink-50 dark:bg-pink-900/10 p-8 rounded-2xl border border-pink-100 dark:border-pink-900/30 text-center">
                  <h3 className="text-2xl font-medium text-pink-900 dark:text-pink-300 leading-relaxed">
                    {part3Questions[currentIndex]?.question || "No more questions"}
                  </h3>
                </div>

                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => router.push('/tests')}
                >
                  Complete Speaking Test
                </Button>
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
