"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Send, Square as StopIcon, RefreshCw, Volume2, CheckCircle, XCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  content?: string; // Text content
  audioUrl?: string; // Audio content
}

export default function SpeakingPage() {
  const [topic, setTopic] = useState("What do you usually do in your free time?");
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hello! I'm your English tutor. Let's practice speaking. What do you want to talk about today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);

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
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Không tìm thấy micro! Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    // Create temporary URL for user audio
    const userAudioUrl = URL.createObjectURL(audioBlob);
    const userMsgId = Date.now().toString();
    
    // Add user message immediately
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: "user",
      audioUrl: userAudioUrl
    }]);

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    formData.append("topic", topic); // Send the topic

    try {
      const response = await fetch("http://localhost:3000/api/user/speaking/chat", {
        method: "POST",
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true' // Bypass ngrok warning
        }
      });

      if (!response.ok) {
        throw new Error("Failed to send audio");
      }

      const result = await response.json();
      
      // Update User Message with Text (if backend returns it)
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
        
        // Add timestamp to prevent caching
        const finalAudioUrl = `${aiAudioUrl}?t=${Date.now()}`;

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: result.data.reply_text, 
          audioUrl: finalAudioUrl
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Auto play AI audio
        if (finalAudioUrl) {
            console.log("🔥 AI Audio URL:", finalAudioUrl);
            const audio = new Audio();
            audio.src = finalAudioUrl;
            audio.load();
            
            audio.oncanplaythrough = () => {
                audio.play().catch(e => console.error("❌ Link AI Play error:", e));
            };
        }
      }

    } catch (error) {
      console.error("Error sending audio:", error);
      alert("Lỗi khi gửi âm thanh lên server.");
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-100 to-teal-100 flex flex-col items-center justify-center p-4">
      {/* Main Glass Container */}
      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col h-[85vh] relative">
        
        {/* Header */}
        <div className="bg-white/40 backdrop-blur-md p-6 border-b border-white/50 flex justify-between items-center z-10 sticky top-0">
          <div>
              <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-blue-600/10 rounded-xl">
                    <Mic className="w-6 h-6 text-blue-600" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight">AI Speaking Tutor</h1>
              </div>
              <p className="text-slate-500 text-sm font-medium ml-1">Practice English naturally</p>
          </div>
          <div className="px-4 py-2 bg-white/60 rounded-2xl border border-white/60 shadow-sm">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Topic</span>
             <span className="text-slate-700 font-semibold">{topic}</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] p-5 shadow-sm relative group transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-[2rem] rounded-br-none hover:shadow-lg hover:shadow-blue-500/20"
                    : "bg-white text-slate-700 rounded-[2rem] rounded-bl-none border border-slate-100 hover:shadow-lg hover:shadow-slate-200/40"
                }`}
              >
                {/* Role Label */}
                <span className={`text-[10px] font-bold uppercase tracking-widest absolute -top-5 ${
                    msg.role === "user" ? "right-2 text-blue-600/80" : "left-2 text-slate-400"
                }`}>
                    {msg.role === "user" ? "You" : "AI Tutor"}
                </span>

                {msg.content && <p className="text-[15px] leading-relaxed font-medium">{msg.content}</p>}
                {!msg.content && msg.role === "user" && (
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        <p className="italic opacity-90 font-medium">Listening...</p>
                    </div>
                )}
                
                {msg.audioUrl && (
                  <div className={`mt-3 pt-3 border-t ${msg.role === "user" ? "border-white/20" : "border-slate-100"} flex items-center gap-3`}>
                    <div className={`p-2 rounded-full ${msg.role === "user" ? "bg-white/20" : "bg-slate-100"}`}>
                        <Volume2 className="w-4 h-4" />
                    </div>
                    <audio controls src={msg.audioUrl} className="h-8 w-full max-w-[220px] opacity-90 contrast-200" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-pulse">
               <div className="bg-white/80 p-5 rounded-[2rem] rounded-bl-none border border-white/50 shadow-sm">
                 <div className="flex gap-2 items-center">
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                 </div>
               </div>
            </div>
          )}
          <div className="h-4" /> {/* Spacer */}
        </div>

        {/* Controls Bar */}
        <div className="bg-white/60 backdrop-blur-xl border-t border-white/50 p-6 flex items-center justify-center gap-12 relative z-20">
           
           {/* Recording Area */}
           <div className="flex flex-col items-center gap-3 transition-all duration-300">
             {isRecording ? (
                <div className="group relative cursor-pointer" onClick={stopRecording}>
                    {/* Ripple Effects */}
                    <span className="absolute -inset-6 rounded-full bg-red-500/20 animate-ping duration-1000"></span>
                    <span className="absolute -inset-10 rounded-full bg-red-500/10 animate-pulse duration-2000"></span>
                    
                    <button className="relative w-20 h-20 bg-gradient-to-tr from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-xl shadow-red-500/40 transform transition-transform group-hover:scale-105 active:scale-95">
                        <StopIcon className="w-8 h-8 text-white fill-current" />
                    </button>
                    <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-red-500 font-bold text-sm tracking-wide bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">Stop Recording</p>
                </div>
             ) : (
                <div className="group relative cursor-pointer" onClick={isLoading || isGrading ? undefined : startRecording}>
                    <button 
                        disabled={isLoading || isGrading}
                        className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 transform transition-all group-hover:scale-110 group-active:scale-95 disabled:grayscale disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <Mic className="w-9 h-9 text-white group-hover:animate-wiggle" />
                    </button>
                    <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-slate-500 font-semibold text-sm tracking-wide bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap transition-colors group-hover:text-blue-600">
                        {isLoading ? "Thinking..." : "Tap to Speak"}
                    </p>
                </div>
             )}
           </div>

           {/* Finish Button (Floating) */}
           {!isRecording && messages.length > 2 && (
             <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 animate-in fade-in zoom-in duration-300">
                <button
                    onClick={handleFinishSession}
                    disabled={isGrading}
                    className="w-14 h-14 bg-white border-2 border-green-100 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-green-500/10 hover:border-green-400 hover:bg-green-50 transition-all active:scale-95 disabled:opacity-50"
                    title="Finish & Grade"
                >
                    {isGrading ? (
                         <RefreshCw className="w-6 h-6 text-green-600 animate-spin" />
                    ) : (
                        <CheckCircle className="w-7 h-7 text-green-500" />
                    )}
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Finish</span>
             </div>
           )}
        </div>
      </div>

      {/* Premium Gradient Result Modal */}
      {showResultModal && gradeResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center">
                <button 
                    onClick={() => setShowResultModal(false)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
                >
                    <XCircle className="w-6 h-6" />
                </button>
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner ring-4 ring-white/10">
                  <span className="text-4xl">🏆</span>
                </div>
                <h2 className="text-3xl font-bold mb-1">Session Report</h2>
                <p className="text-blue-100 font-medium">Here's how you performed</p>
            </div>

            <div className="p-8 space-y-8">
                 {/* Overall Score */}
                 <div className="relative overflow-hidden bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center group hover:border-blue-200 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="w-24 h-24 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Overall Proficiency Score</p>
                    <div className="flex justify-center items-baseline gap-1">
                        <span className="text-5xl font-black text-slate-800 tracking-tighter">{gradeResult.score || "N/A"}</span>
                        <span className="text-xl font-medium text-slate-400">/10</span>
                    </div>
                 </div>

                 {/* Detailed Feedback */}
                 <div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3 ml-1">
                        <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                        Detailed Feedback
                    </h3>
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {gradeResult.feedback || "No feedback provided."}
                    </div>
                 </div>

                  {/* Corrections */}
                 {gradeResult.corrections && gradeResult.corrections.length > 0 && (
                    <div>
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3 ml-1">
                            <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
                            Smart Improvements
                        </h3>
                        <ul className="space-y-3">
                            {gradeResult.corrections.map((item: any, idx: number) => (
                                <li key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-teal-200 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 min-w-[4px] h-[4px] bg-red-400 rounded-full" />
                                        <span className="block text-red-500/80 line-through text-xs mb-1 font-medium">{item.original}</span>
                                    </div>
                                    <div className="flex items-start gap-3 mt-1">
                                        <div className="mt-1 min-w-[4px] h-[4px] bg-teal-500 rounded-full" />
                                        <span className="block text-teal-700 font-semibold text-sm">{item.improved}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
              </div>

              <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100">
                <button
                    onClick={() => {
                        setShowResultModal(false);
                        setMessages([{
                            id: "welcome",
                            role: "ai",
                            content: "Hello! I'm your English tutor. Let's practice speaking. What do you want to talk about today?"
                        }]);
                        setTopic("Free Talk"); // Reset topic or keep it
                    }}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98] transition-all transform"
                >
                    Start New Session
                </button>
              </div>

          </div>
        </div>
      )}
    </div>
  );
}
