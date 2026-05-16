"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  ChevronLeft,
  Square as StopIcon,
  Volume2,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  XCircle
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

interface Message {
    id: string;
    role: "user" | "ai";
    content?: string; // Text content
    audioUrl?: string; // Audio content
}

export default function SpeakingExamPage() {
  const { id } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Grading State
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);

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

        // Initialize Chat with First Question
        if (validQuestions.length > 0) {
             setMessages([{
                id: "welcome",
                role: "ai",
                content: `Let's discuss: "${validQuestions[0].question}"`
             }]);
        }

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
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        await handleSendAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone permission required!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    setIsChatLoading(true);
    
    // Create temporary URL for user audio
    const userAudioUrl = URL.createObjectURL(audioBlob);
    
    // Add user message immediately
    const userMsgId = Date.now().toString();
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      audioUrl: userAudioUrl
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to backend
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    try {
      const response = await fetch("http://localhost:3000/api/user/speaking/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send audio");
      }

      const result = await response.json();
      
      // Update User Message with Text
      if (result.success && result.data && result.data.user_text) {
        setMessages(prev => prev.map(msg => 
            msg.id === userMsgId ? { ...msg, content: result.data.user_text } : msg
        ));
      }

      // Add AI response
      if (result.success && result.data) {
        const COLAB_URL = "https://stereotyped-corkier-camelia.ngrok-free.dev";
        const replyAudioPath = result.data.reply_audio;
        const aiAudioUrl = replyAudioPath.startsWith("http") ? replyAudioPath : `${COLAB_URL}${replyAudioPath}`;

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: result.data.reply_text, 
          audioUrl: aiAudioUrl
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Auto play AI audio
        if (aiAudioUrl) {
            console.log("🔥 AI Audio URL:", aiAudioUrl);
            const audio = new Audio(aiAudioUrl);
            audio.load(); // Force browser to load from server
            audio.play().catch(e => {
                console.error("❌ Auto play error:", e);
            });
        }
      }

    } catch (error) {
      console.error("Error sending audio:", error);
      alert("Lỗi khi gửi âm thanh lên server.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFinishSession = async () => {
    if (messages.length < 2) {
      alert("Hãy nói chuyện thêm một chút trước khi kết thúc nhé!");
      return;
    }

    setIsGrading(true);
    try {
        const response = await fetch("http://localhost:3000/api/user/speaking/grade", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ messages })
        });

        if (!response.ok) {
            throw new Error("Failed to grade conversation");
        }

        const result = await response.json();
        if (result.success && result.data) {
            setGradeResult(result.data);
            setShowResultModal(true);
        }
    } catch (error) {
        console.error("Error grading conversation:", error);
        alert("Có lỗi khi chấm điểm. Vui lòng thử lại sau.");
    } finally {
        setIsGrading(false);
    }
  };


  if (loading) return <LoadingScreen />;
  if (!exam || questions.length === 0) return <NotFoundScreen />;

  const currentQuestion = questions[0]; // Currently focusing on the first question/topic

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
              {exam.title} - AI Practice
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 dark:bg-primary/10 text-primary border-primary/20 px-3 py-1">
              AI Speaking
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex-1 container py-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
         {/* TOPIC CARD */}
         <div className="bg-white dark:bg-slate-900 py-6 px-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 mb-6 text-center shrink-0">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">Current Topic</p>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                "{currentQuestion.question}"
            </h2>
            {currentQuestion.subQuestions && (
                <p className="text-slate-500 mt-2 text-sm">
                    {currentQuestion.subQuestions.join(" • ")}
                </p>
            )}
         </div>

         {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 rounded-2xl border border-slate-200 shadow-inner mb-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                }`}
              >
                {msg.content && <p className="mb-2 text-base leading-relaxed">{msg.content}</p>}
                {!msg.content && msg.role === "user" && <p className="mb-2 italic opacity-80">Listening...</p>}
                {msg.audioUrl && (
                  <div className={`flex items-center gap-2 ${msg.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    <Volume2 className="w-4 h-4" />
                    <audio controls src={msg.audioUrl} className="h-8 w-full max-w-[200px] accent-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex justify-start">
               <div className="bg-white rounded-2xl p-4 rounded-bl-none border border-gray-200 shadow-sm">
                 <div className="flex gap-1.5 items-center text-gray-400">
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-center gap-8 shrink-0 relative">

            <div className="flex flex-col items-center gap-2">
           {isRecording ? (
             <div className="relative">
                <span className="absolute -inset-4 rounded-full bg-red-100 animate-ping"></span>
                <button
                    onClick={stopRecording}
                    className="relative w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-red-500/30 shadow-xl hover:bg-red-600 transition-all transform hover:scale-105 active:scale-95"
                    title="Stop Recording"
                >
                    <StopIcon className="w-8 h-8 text-white fill-current" />
                </button>
             </div>
           ) : (
             <button
                onClick={startRecording}
                disabled={isChatLoading || isGrading}
                className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-blue-600/30 shadow-xl hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed"
                title="Start Recording"
             >
               <Mic className="w-8 h-8 text-white" />
             </button>
           )}
           <p className="text-gray-500 font-medium whitespace-nowrap">
             {isRecording ? "Listening..." : isChatLoading ? "Thinking..." : "Tap to Speak"}
           </p>
           </div>

           {/* Finish Button */}
           {!isRecording && messages.length > 2 && ( // Show only if conversation has started
             <div className="flex flex-col items-center gap-2 absolute right-8 md:static">
                <button
                    onClick={handleFinishSession}
                    disabled={isGrading}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-green-500/30 shadow-lg hover:bg-green-600 transition-all transform hover:scale-105 active:scale-95 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    title="Finish & Grade"
                >
                    {isGrading ? (
                         <RefreshCw className="w-6 h-6 text-white animate-spin" />
                    ) : (
                        <CheckCircle className="w-6 h-6 text-white" />
                    )}
                </button>
                <p className="text-green-600 font-medium text-xs">Finish</p>
             </div>
           )}
        </div>

      </div>

      {/* Grading Result Modal */}
      {showResultModal && gradeResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
            <div className="p-6 relative">
              <button 
                onClick={() => setShowResultModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🏆</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Session Evaluation</h2>
                <p className="text-gray-500">Here is your feedback</p>
              </div>

              <div className="space-y-6">
                 {/* Overall Score */}
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Overall Score</p>
                    <p className="text-4xl font-extrabold text-blue-600">{gradeResult.score || "N/A"}/10</p>
                 </div>

                 {/* Detailed Feedback */}
                 <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Detailed Feedback</h3>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {gradeResult.feedback || "No feedback provided."}
                    </div>
                 </div>

                  {/* Corrections (if any) */}
                 {gradeResult.corrections && gradeResult.corrections.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Better Ways to Say</h3>
                        <ul className="space-y-2">
                            {gradeResult.corrections.map((item: any, idx: number) => (
                                <li key={idx} className="bg-gray-50 p-3 rounded-lg text-sm">
                                    <span className="block text-red-500 line-through text-xs mb-1">"{item.original}"</span>
                                    <span className="block text-green-600 font-medium">"{item.improved}"</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
              </div>

              <div className="mt-8">
                <button
                    onClick={() => {
                        setShowResultModal(false);
                         // Reload or Next Question logic can be added here
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

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
