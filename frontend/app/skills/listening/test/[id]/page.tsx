"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Segment {
  start: number;
  end: number;
  text: string;
}

interface QuestionData {
  _id: string;
  title: string;
  audio: string;
  type: string;
  transcript: string;
  segments: Segment[];
  section?: string; // Added section property based on usage in the new code
}

export default function DictationPlayerPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();

  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Audio State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Dictation State
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [results, setResults] = useState<{status: 'correct' | 'incorrect' | 'pending'}[]>([]);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'incorrect'; message: string } | null>(null);

  // Load Data
  useEffect(() => {
    fetch(`http://localhost:3000/api/listening-questions/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) throw new Error(data.message);
        const q = data.data;
        // Transform audio URL if needed
        if (q.audio && !q.audio.startsWith("http")) {
            q.audio = `http://localhost:3000${q.audio}`;
        }
        setQuestion(q);
        // Initialize results array based on segments length
        setResults(new Array(q.segments?.length || 0).fill({ status: 'pending' }));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Audio Events
  const onTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      // Loop Logic for Current Segment
      if (question && question.segments && question.segments.length > 0 && isLooping && !showFullTranscript) {
           const seg = question.segments[currentSegmentIndex];
           if (seg && time >= seg.end) {
               audioRef.current.currentTime = seg.start;
               audioRef.current.play();
           }
      }
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  // Handlers
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSegmentChange = (index: number) => {
    if (!question?.segments) return;
    if (index < 0 || index >= question.segments.length) return;

    setCurrentSegmentIndex(index);
    setUserInput(""); // Reset input for new segment
    setFeedback(null); // Clear feedback
    
    // Jump audio to start of new segment
    if (audioRef.current) {
        audioRef.current.currentTime = question.segments[index].start;
        if (!isPlaying) {
             audioRef.current.play();
             setIsPlaying(true);
        }
    }
  };

  const checkAnswer = () => {
      if (!question?.segments) return;
      
      // If already correct, move next
      if (feedback?.status === 'correct') {
          handleSegmentChange(currentSegmentIndex + 1);
          return;
      }

      const targetText = question.segments[currentSegmentIndex].text.trim().toLowerCase().replace(/[.,?!]/g, "");
      const userText = userInput.trim().toLowerCase().replace(/[.,?!]/g, "");

      if (userText === targetText) {
          // Correct
          setFeedback({ status: 'correct', message: "Bạn đã nghe rất tốt! Nhấn Enter hoặc nút Tiếp tục để qua câu tiếp theo." });
          const newResults = [...results];
          newResults[currentSegmentIndex] = { status: 'correct' };
          setResults(newResults);
          
          // Optional: Auto move logic could start here if desired, but user might want to see the green result first.
          // Let's keep manual advance for now or auto after a longer delay?
          // User asked for "show result", so manual advance with clear button is safer UX.
      } else {
          // Incorrect
          setFeedback({ status: 'incorrect', message: "Hãy nghe lại kỹ hơn nhé. Chú ý các âm đuôi và mạo từ." });
      }
  };
  
  const handleReveal = () => {
      if (!question?.segments) return;
      setUserInput(question.segments[currentSegmentIndex].text);
  };

  if (loading) return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
      </div>
  );

  if (error || !question) return (
      <div className="h-screen flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
              <AlertDescription>{error || "Không tìm thấy bài tập"}</AlertDescription>
          </Alert>
      </div>
  );

  const currentSegment = question.segments?.[currentSegmentIndex];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
       <Navbar />

       <div className="flex-1 container mx-auto px-4 py-8 mt-16 max-w-5xl">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                     <Badge variant="outline" className="mb-2 text-blue-600 border-blue-200 bg-blue-50">
                        {question.section || "Dictation Practice"}
                     </Badge>
                     <h1 className="text-3xl font-bold text-slate-800">{question.title}</h1>
                </div>
                <Button variant="outline" onClick={() => router.back()}>Thoát</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Player & Input */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-lg border-slate-200 overflow-hidden">
                        <div className="bg-slate-900 p-8 text-center relative overflow-hidden group">
                           {/* Audio Visualization / Decoration */}
                           <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center gap-1 opacity-30">
                              {[...Array(20)].map((_, i) => (
                                  <div key={i} className="w-2 bg-blue-500 h-10 animate-pulse" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }} />
                              ))}
                           </div>

                           <div className="relative z-10">
                                <Button 
                                    size="icon" 
                                    className="w-20 h-20 rounded-full text-white bg-blue-600 hover:bg-blue-500 shadow-xl transition-transform hover:scale-105"
                                    onClick={handlePlayPause}
                                >
                                    {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 pl-1" />}
                                </Button>
                                <p className="mt-4 text-blue-200 font-mono text-sm">
                                    {new Date(currentTime * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
                                </p>
                           </div>

                           <audio 
                                ref={audioRef}
                                src={question.audio}
                                onTimeUpdate={onTimeUpdate}
                                onLoadedMetadata={onLoadedMetadata}
                           />
                        </div>

                        {/* Progress Bar for whole audio */}
                        <Progress value={(currentTime / duration) * 100} className="h-1 rounded-none bg-slate-100" />
                        
                        <CardContent className="p-8">
                             {/* Segment Navigation */}
                             <div className="flex justify-between items-center mb-8">
                                 <Button 
                                    variant="ghost" 
                                    onClick={() => handleSegmentChange(currentSegmentIndex - 1)}
                                    disabled={currentSegmentIndex === 0}
                                 >
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Câu trước
                                 </Button>
                                 <div className="text-center">
                                     <span className="text-sm text-slate-400 uppercase font-bold tracking-wider">Câu {currentSegmentIndex + 1} / {question.segments?.length || 0}</span>
                                     <div className="flex gap-1 justify-center mt-2">
                                         {question.segments?.map((_, idx) => (
                                             <div 
                                                key={idx} 
                                                className={cn(
                                                    "w-2 h-2 rounded-full cursor-pointer transition-colors",
                                                    idx === currentSegmentIndex ? "bg-blue-600 scale-125" : 
                                                    results[idx]?.status === 'correct' ? "bg-green-400" : "bg-slate-200"
                                                )}
                                                onClick={() => handleSegmentChange(idx)}
                                             />
                                         ))}
                                     </div>
                                 </div>
                                 <Button 
                                    variant="ghost"
                                    onClick={() => handleSegmentChange(currentSegmentIndex + 1)}
                                    disabled={currentSegmentIndex === (question.segments?.length || 0) - 1}
                                 >
                                    Câu sau <ArrowRight className="ml-2 w-4 h-4" />
                                 </Button>
                             </div>

                             {/* Dictation Input Area */}
                             <div className="space-y-6">
                                  {!currentSegment ? (
                                      <div className="text-center py-10 text-slate-400">
                                          Không có dữ liệu segments cho bài này.
                                      </div>
                                  ) : (
                                      <>
                                          <div className="space-y-4">
                                              <p className="text-sm font-medium text-slate-500 flex justify-between">
                                                  <span>Nghe và chép lại câu này:</span>
                                                  <span className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800" onClick={() => setIsLooping(!isLooping)}>
                                                      <RotateCcw className={cn("w-4 h-4", isLooping && "text-blue-600")} /> 
                                                      {isLooping ? "Tự động lặp lại" : "Không lặp"}
                                                  </span>
                                              </p>
                                              
                                              <Input 
                                                  value={userInput}
                                                  onChange={e => {
                                                      setUserInput(e.target.value);
                                                      setFeedback(null); // Clear feedback on type
                                                  }}
                                                  onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                                                  placeholder="Type what you hear..."
                                                  className={cn(
                                                      "text-lg p-6 h-16 border-2 focus-visible:ring-blue-500 transition-all",
                                                      feedback?.status === 'correct' ? "border-green-500 bg-green-50" : 
                                                      feedback?.status === 'incorrect' ? "border-red-500 bg-red-50" : ""
                                                  )}
                                                  autoFocus
                                              />

                                              {/* Inline Feedback */}
                                              {feedback && (
                                                  <div className={cn(
                                                      "p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2",
                                                      feedback.status === 'correct' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                  )}>
                                                      {feedback.status === 'correct' ? (
                                                          <CheckCircle2 className="w-6 h-6 shrink-0 text-green-600" />
                                                      ) : (
                                                          <HelpCircle className="w-6 h-6 shrink-0 text-red-600" />
                                                      )}
                                                      <div className="flex-1">
                                                          <p className="font-bold text-lg mb-1">
                                                              {feedback.status === 'correct' ? "Chính xác! 🎉" : "Chưa đúng"}
                                                          </p>
                                                          <p>{feedback.message}</p>
                                                      </div>
                                                  </div>
                                              )}
                                          </div>

                                          <div className="flex gap-4">
                                              <Button 
                                                  size="lg" 
                                                  className={cn(
                                                      "flex-1 h-12 text-lg transition-colors",
                                                      feedback?.status === 'correct' ? "bg-green-600 hover:bg-green-700" : 
                                                      feedback?.status === 'incorrect' ? "bg-red-600 hover:bg-red-700" : ""
                                                  )} 
                                                  onClick={checkAnswer}
                                              >
                                                  {feedback?.status === 'correct' ? "Tiếp tục" : 
                                                   feedback?.status === 'incorrect' ? "Thử lại" : "Check Answer"}
                                              </Button>
                                              <Button size="lg" variant="secondary" className="h-12 w-12 p-0" onClick={handleReveal} title="Reveal Answer">
                                                  <HelpCircle className="w-6 h-6 text-slate-600" />
                                              </Button>
                                          </div>
                                      </>
                                  )}
                             </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Transcript / Playlist */}
                <div className="space-y-6 h-full flex flex-col">
                     <Card className="flex-1 border-slate-200 flex flex-col shadow-sm">
                         <CardHeader className="border-b border-slate-100 bg-slate-50">
                             <CardTitle className="text-lg flex justify-between items-center">
                                 Full Transcript
                                 <Button variant="ghost" size="sm" onClick={() => setShowFullTranscript(!showFullTranscript)}>
                                     {showFullTranscript ? "Hide" : "Show"}
                                 </Button>
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="p-0 flex-1 overflow-y-auto max-h-[calc(100vh-200px)] relative">
                             {showFullTranscript ? (
                                 <div className="p-6 space-y-4">
                                     {question.transcript ? (
                                         <p className="leading-relaxed text-slate-700 whitespace-pre-wrap">{question.transcript}</p>
                                     ) : (
                                         question.segments?.map((seg, idx) => (
                                             <div key={idx} className={cn("p-2 rounded hover:bg-slate-100 cursor-pointer transition-colors", currentSegmentIndex === idx && "bg-blue-50 border-l-4 border-blue-500 pl-3")} onClick={() => handleSegmentChange(idx)}>
                                                 <span className="text-xs text-blue-400 font-bold mr-2">{new Date(seg.start * 1000).toISOString().substr(14, 5)}</span>
                                                 <span className={cn(currentSegmentIndex === idx ? "font-medium text-slate-900" : "text-slate-600")}>{seg.text}</span>
                                             </div>
                                         ))
                                     )}
                                 </div>
                             ) : (
                                 <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
                                     <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                         <span className="text-2xl">🔒</span>
                                     </div>
                                     <p>Transcript is hidden to help you practice.<br/>Focus on listening!</p>
                                     <Button variant="outline" onClick={() => setShowFullTranscript(true)}>Peek Transcript</Button>
                                 </div>
                             )}
                         </CardContent>
                     </Card>
                </div>
            </div>
       </div>
    </main>
  );
}
