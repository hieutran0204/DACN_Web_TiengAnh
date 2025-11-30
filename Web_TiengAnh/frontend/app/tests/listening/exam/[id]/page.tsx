"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// Band score chuẩn IELTS Listening 2025
const listeningBandScore: Record<number, number> = {
  39: 9.0,
  38: 8.5,
  37: 8.5,
  36: 8.0,
  35: 8.0,
  34: 7.5,
  33: 7.5,
  32: 7.0,
  31: 7.0,
  30: 6.5,
  29: 6.5,
  28: 6.0,
  27: 6.0,
  26: 5.5,
  25: 5.5,
  24: 5.0,
  23: 5.0,
  22: 5.0,
  21: 4.5,
  20: 4.5,
  19: 4.0,
  18: 4.0,
  17: 3.5,
  16: 3.5,
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
  type:
  | "multiple_choice"
  | "fill_in_the_blank"
  | "note_completion"
  | "sentence_completion"
  | "matching";
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
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Tổng số câu hỏi thực tế (tính theo subQuestions)
  const totalQuestions =
    exam?.skills.listening.reduce((acc, q) => acc + q.subQuestions.length, 0) ||
    0;

  useEffect(() => {
    if (!id) return;

    apiFetch(`/exam/${id}?populate=true`)
      .then((res: any) => {
        const data = res?.success ? res.data : res;

        if (!data?.skills?.listening?.length) {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Đề không có phần Listening",
          });
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
        toast({ title: "Thành công", description: "Đã tải đề Listening!" });
      })
      .catch((err) => {
        console.error("Lỗi tải đề:", err);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không tải được đề thi",
        });
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  // Tự động phát audio khi chuyển câu
  useEffect(() => {
    if (audioRef.current && exam?.skills.listening[currentQIndex]?.audio) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    }
  }, [currentQIndex, exam]);

  const currentQuestion = exam?.skills.listening[currentQIndex];
  const progress = exam
    ? ((currentQIndex + 1) / exam.skills.listening.length) * 100
    : 0;

  const handleAnswer = (subQId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [subQId]: answer }));
  };

  const calculateScore = () => {
    if (!exam) return 0;
    let correct = 0;

    exam.skills.listening.forEach((q) => {
      q.subQuestions.forEach((sq) => {
        const userAns = userAnswers[sq._id]?.trim().toLowerCase() || "";

        // Trường hợp có nhiều đáp án đúng (fill in the blank, note, sentence completion)
        if (sq.correctAnswers && sq.correctAnswers.length > 0) {
          const normalized = sq.correctAnswers.map((a) =>
            a.trim().toLowerCase()
          );
          if (normalized.includes(userAns)) correct++;
        }
        // Trường hợp chỉ có 1 đáp án đúng (multiple choice)
        else if (sq.correctAnswer) {
          if (userAns === sq.correctAnswer.trim().toLowerCase()) correct++;
        }
      });
    });

    return correct;
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setFinalScore(score);
    setShowResult(true);

    const band = listeningBandScore[score] || 0;
    toast({
      title: "HOÀN THÀNH XUẤT SẮC!",
      description: `Bạn đúng ${score}/${totalQuestions} câu → Band ${band.toFixed(1)}`,
    });
  };

  if (loading) return <LoadingScreen />;
  if (!exam || !currentQuestion) return <NotFoundScreen />;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">

      <div className="pt-20 pb-16 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            {exam.title}
          </h1>
          <p className="text-xl text-gray-600">IELTS Listening Practice Test</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <Badge variant="secondary" className="text-lg px-8 py-3">
            <Headphones className="w-5 h-5 mr-2" />
            Listening
          </Badge>
          <Badge variant="outline" className="text-lg px-8 py-3">
            <Clock className="w-5 h-5 mr-2" />
            ~30 phút
          </Badge>
          <Badge variant="outline" className="text-lg px-8 py-3">
            {totalQuestions} câu hỏi
          </Badge>
        </div>

        {showResult ? (
          <ResultScreen score={finalScore} total={totalQuestions} />
        ) : (
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {currentQuestion.section} - {currentQuestion.title}
                  </CardTitle>
                  <p className="text-blue-100 mt-2">
                    Câu {currentQIndex + 1} / {exam.skills.listening.length}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <Progress value={progress} className="mt-4 h-5 bg-white/30" />
            </CardHeader>

            <CardContent className="p-8 space-y-10">
              {/* Audio Player */}
              {currentQuestion.audio && (
                <div className="bg-black/90 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Volume2 className="w-10 h-10 text-white" />
                    <audio
                      ref={audioRef}
                      controls
                      className="w-full max-w-2xl h-14">
                      <source src={currentQuestion.audio} type="audio/mpeg" />
                      Trình duyệt không hỗ trợ audio.
                    </audio>
                  </div>
                  <p className="text-center text-white/80 text-sm">
                    Phát 1 lần duy nhất – giống thi thật
                  </p>
                </div>
              )}

              {/* Sub Questions */}
              <div className="space-y-8">
                {currentQuestion.subQuestions.map((sq, idx) => (
                  <div
                    key={sq._id}
                    className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
                    <Label className="text-xl font-semibold mb-6 block">
                      {idx + 1}. {sq.question}
                    </Label>

                    {/* Multiple Choice */}
                    {currentQuestion.type === "multiple_choice" &&
                      sq.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sq.options.map((opt) => (
                            <Button
                              key={opt}
                              variant={
                                userAnswers[sq._id] === opt
                                  ? "default"
                                  : "outline"
                              }
                              size="lg"
                              className="h-16 text-lg font-medium justify-start"
                              onClick={() => handleAnswer(sq._id, opt)}>
                              {opt}
                            </Button>
                          ))}
                        </div>
                      )}

                    {/* Fill in the blank / Note / Sentence Completion */}
                    {(currentQuestion.type === "fill_in_the_blank" ||
                      currentQuestion.type === "note_completion" ||
                      currentQuestion.type === "sentence_completion") && (
                        <Input
                          type="text"
                          placeholder="Nhập đáp án của bạn..."
                          value={userAnswers[sq._id] || ""}
                          onChange={(e) => handleAnswer(sq._id, e.target.value)}
                          className="text-xl h-16"
                          autoFocus
                        />
                      )}
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-8 border-t-2">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((i) => i - 1)}>
                  <ChevronLeft className="mr-2" /> Câu trước
                </Button>

                {currentQIndex === exam.skills.listening.length - 1 ? (
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-xl px-12"
                    onClick={handleSubmit}>
                    <CheckCircle2 className="mr-3" /> Nộp Bài & Xem Band
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="text-xl px-12"
                    onClick={() => setCurrentQIndex((i) => i + 1)}>
                    Câu tiếp theo <ChevronRight className="ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </main>
  );
}

// Component phụ đẹp lung linh
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
    <div className="text-center">
      <div className="w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-8" />
      <p className="text-3xl font-bold text-blue-800">
        Đang tải đề thi Listening...
      </p>
    </div>
  </div>
);

const NotFoundScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
    <div className="text-center">
      <p className="text-6xl font-bold text-red-600 mb-4">
        Không tìm thấy đề thi
      </p>
      <Button asChild size="lg">
        <Link href="/tests/listening">Quay lại danh sách</Link>
      </Button>
    </div>
  </div>
);

const ResultScreen = ({ score, total }: { score: number; total: number }) => {
  const band = listeningBandScore[score] || 0;
  const message =
    band >= 8
      ? "THIÊN TÀI!"
      : band >= 7
        ? "XUẤT SẮC!"
        : band >= 6
          ? "TỐT!"
          : "CỐ GẮNG THÊM NHÉ!";

  return (
    <Card className="max-w-3xl mx-auto text-center py-20 shadow-3xl border-4 border-green-500">
      <CardHeader>
        <CardTitle className="text-7xl font-bold text-green-600">
          HOÀN THÀNH!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-9xl font-black text-blue-600">
          {score}
          <span className="text-5xl text-gray-600">/{total}</span>
        </div>
        <div className="text-5xl font-bold">
          Band ước tính:{" "}
          <span className="text-8xl text-green-600">{band.toFixed(1)}</span>
        </div>
        <div className="text-4xl font-bold text-purple-600">{message}</div>

        <div className="flex gap-8 justify-center mt-16">
          <Button asChild size="lg" className="text-2xl px-12 py-8">
            <Link href="/tests/listening">Làm đề khác</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-2xl px-12 py-8">
            <Link href="/tests">Trang chủ</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useParams } from "next/navigation";
// import Link from "next/link";
// import Navbar from "@/components/navbar";
// import Footer from "@/components/footer";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/components/ui/use-toast";
// import {
//   Headphones,
//   Clock,
//   CheckCircle2,
//   Volume2,
//   ChevronLeft,
//   ChevronRight,
//   RotateCw,
// } from "lucide-react";
// import { apiFetch } from "@/lib/api";

// // Band score chuẩn IELTS Listening
// const listeningBandScore: Record<number, number> = {
//   39: 9.0,
//   38: 8.5,
//   37: 8.5,
//   36: 8.0,
//   35: 8.0,
//   34: 7.5,
//   33: 7.5,
//   32: 7.0,
//   31: 7.0,
//   30: 6.5,
//   29: 6.5,
//   28: 6.0,
//   27: 6.0,
//   26: 5.5,
//   25: 5.5,
//   24: 5.0,
//   23: 5.0,
//   22: 5.0,
//   21: 4.5,
//   20: 4.5,
//   19: 4.0,
//   18: 4.0,
//   17: 3.5,
//   16: 3.5,
// };

// interface SubQuestion {
//   _id: string;
//   question: string;
//   correctAnswer?: string;
//   correctAnswers?: string[];
//   options?: string[];
// }

// interface ListeningQuestion {
//   _id: string;
//   section: string;
//   type:
//     | "multiple_choice"
//     | "fill_in_the_blank"
//     | "note_completion"
//     | "sentence_completion"
//     | "matching";
//   title: string;
//   audio?: string;
//   subQuestions: SubQuestion[];
// }

// interface Exam {
//   _id: string;
//   title: string;
//   description?: string;
//   skills: { listening: ListeningQuestion[] };
// }

// export default function ListeningExamPage() {
//   const { id } = useParams();
//   const [exam, setExam] = useState<Exam | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentQIndex, setCurrentQIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
//   const [showResult, setShowResult] = useState(false);
//   const [finalScore, setFinalScore] = useState(0);
//   const { toast } = useToast();
//   const audioRef = useRef<HTMLAudioElement>(null);

//   const totalQuestions =
//     exam?.skills.listening.reduce((acc, q) => acc + q.subQuestions.length, 0) ||
//     0;

//   useEffect(() => {
//     if (!id) return;

//     apiFetch(`/exam/${id}?populate=true`)
//       .then((res: any) => {
//         const data = res?.success ? res.data : res;
//         if (!data?.skills?.listening?.length) {
//           toast({
//             variant: "destructive",
//             title: "Lỗi",
//             description: "Không có phần Listening",
//           });
//           return;
//         }

//         const fixedData = {
//           ...data,
//           skills: {
//             listening: data.skills.listening.map((q: any) => ({
//               ...q,
//               audio: q.audio?.startsWith("http")
//                 ? q.audio
//                 : `http://localhost:3000${q.audio || ""}`,
//             })),
//           },
//         };

//         setExam(fixedData);
//         toast({
//           title: "Thành công",
//           description: "Đề đã tải xong – bạn có thể nghe lại thoải mái!",
//         });
//       })
//       .catch(() => {
//         toast({
//           variant: "destructive",
//           title: "Lỗi",
//           description: "Không tải được đề thi",
//         });
//       })
//       .finally(() => setLoading(false));
//   }, [id, toast]);

//   const currentQuestion = exam?.skills.listening[currentQIndex];
//   const progress = exam
//     ? ((currentQIndex + 1) / exam.skills.listening.length) * 100
//     : 0;

//   const handleAnswer = (subQId: string, answer: string) => {
//     setUserAnswers((prev) => ({ ...prev, [subQId]: answer }));
//   };

//   const replayAudio = () => {
//     if (audioRef.current) {
//       audioRef.current.currentTime = 0;
//       audioRef.current.play();
//     }
//   };

//   const calculateScore = () => {
//     if (!exam) return 0;
//     let correct = 0;

//     exam.skills.listening.forEach((q) => {
//       q.subQuestions.forEach((sq) => {
//         const userAns = userAnswers[sq._id]?.trim().toLowerCase() || "";
//         if (sq.correctAnswers && sq.correctAnswers.length > 0) {
//           const correctSet = new Set(
//             sq.correctAnswers.map((a) => a.trim().toLowerCase())
//           );
//           if (correctSet.has(userAns)) correct++;
//         } else if (sq.correctAnswer) {
//           if (userAns === sq.correctAnswer.trim().toLowerCase()) correct++;
//         }
//       });
//     });
//     return correct;
//   };

//   const handleSubmit = () => {
//     const score = calculateScore();
//     setFinalScore(score);
//     setShowResult(true);
//     const band = listeningBandScore[score] || 0;
//     toast({
//       title: "HOÀN THÀNH!",
//       description: `Đúng ${score}/${totalQuestions} → Band ${band.toFixed(1)}`,
//     });
//   };

//   if (loading) return <LoadingScreen />;
//   if (!exam || !currentQuestion) return <NotFoundScreen />;

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
//       <Navbar />
//       <div className="pt-20 pb-16 max-w-7xl mx-auto px-4">
//         <div className="text-center mb-10">
//           <h1 className="text-5xl font-bold text-gray-800 mb-3">
//             {exam.title}
//           </h1>
//           <p className="text-xl text-gray-600">
//             IELTS Listening – Luyện tập thoải mái, nghe lại không giới hạn
//           </p>
//         </div>

//         <div className="flex flex-wrap justify-center gap-4 mb-6 mb-10">
//           <Badge variant="secondary" className="text-lg px-8 py-3">
//             <Headphones className="w-5 h-5 mr-2" />
//             Listening
//           </Badge>
//           <Badge variant="outline" className="text-lg px-8 py-3">
//             <Clock className="w-5 h-5 mr-2" />
//             ~30 phút
//           </Badge>
//           <Badge variant="outline" className="text-lg px-8 py-3">
//             {totalQuestions} câu
//           </Badge>
//         </div>

//         {showResult ? (
//           <ResultScreen score={finalScore} total={totalQuestions} />
//         ) : (
//           <Card className="shadow-2xl border-0 overflow-hidden">
//             <CardHeader className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <CardTitle className="text-3xl font-bold">
//                     {currentQuestion.section} - {currentQuestion.title}
//                   </CardTitle>
//                   <p className="text-blue-100 mt-2">
//                     Câu {currentQIndex + 1} / {exam.skills.listening.length}
//                   </p>
//                 </div>
//                 <span className="text-3xl font-bold">
//                   {Math.round(progress)}%
//                 </span>
//               </div>
//               <Progress value={progress} className="mt-4 h-5 bg-white/30" />
//             </CardHeader>

//             <CardContent className="p-8 space-y-10">
//               {/* AUDIO PLAYER – NGHE LẠI THOẢI MÁI */}
//               {currentQuestion.audio && (
//                 <div className="bg-black/90 rounded-2xl p-8 shadow-2xl text-center">
//                   <div className="flex items-center justify-center gap-6 mb-6">
//                     <Button
//                       size="lg"
//                       variant="secondary"
//                       onClick={replayAudio}
//                       className="rounded-full w-16 h-16 p-0">
//                       <RotateCw className="w-8 h-8" />
//                     </Button>
//                     <audio
//                       ref={audioRef}
//                       controls
//                       controlsList="nodownload"
//                       className="w-full max-w-3xl h-16 text-white">
//                       <source src={currentQuestion.audio} type="audio/mpeg" />
//                       Trình duyệt không hỗ trợ.
//                     </audio>
//                   </div>
//                   <p className="text-white/90 text-lg font-medium">
//                     Nghe lại thoải mái – luyện tập mà bro!
//                   </p>
//                 </div>
//               )}

//               {/* SUB QUESTIONS */}
//               <div className="space-y-8">
//                 {currentQuestion.subQuestions.map((sq, idx) => (
//                   <div
//                     key={sq._id}
//                     className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
//                     <Label className="text-xl font-semibold mb-6 block">
//                       {idx + 1}. {sq.question}
//                     </Label>

//                     {/* Multiple Choice */}
//                     {currentQuestion.type === "multiple_choice" &&
//                       sq.options && (
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           {sq.options.map((opt) => (
//                             <Button
//                               key={opt}
//                               variant={
//                                 userAnswers[sq._id] === opt
//                                   ? "default"
//                                   : "outline"
//                               }
//                               size="lg"
//                               className="h-16 text-lg justify-start"
//                               onClick={() => handleAnswer(sq._id, opt)}>
//                               {opt}
//                             </Button>
//                           ))}
//                         </div>
//                       )}

//                     {/* Fill / Note / Sentence Completion */}
//                     {(currentQuestion.type === "fill_in_the_blank" ||
//                       currentQuestion.type === "note_completion" ||
//                       currentQuestion.type === "sentence_completion") && (
//                       <Input
//                         type="text"
//                         placeholder="Gõ đáp án vào đây..."
//                         value={userAnswers[sq._id] || ""}
//                         onChange={(e) => handleAnswer(sq._id, e.target.value)}
//                         className="text-xl h-16"
//                       />
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {/* NAVIGATION */}
//               <div className="flex justify-between items-center pt-8 border-t-2">
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   disabled={currentQIndex === 0}
//                   onClick={() => setCurrentQIndex((i) => i - 1)}>
//                   <ChevronLeft className="mr-2" /> Câu trước
//                 </Button>

//                 {currentQIndex === exam.skills.listening.length - 1 ? (
//                   <Button
//                     size="lg"
//                     className="bg-green-600 hover:bg-green-700 text-xl px-16"
//                     onClick={handleSubmit}>
//                     <CheckCircle2 className="mr-3" /> Nộp Bài & Xem Band
//                   </Button>
//                 ) : (
//                   <Button
//                     size="lg"
//                     className="text-xl px-16"
//                     onClick={() => setCurrentQIndex((i) => i + 1)}>
//                     Câu tiếp theo <ChevronRight className="ml-2" />
//                   </Button>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//       <Footer />
//     </main>
//   );
// }

// // Các screen phụ giữ nguyên đẹp như cũ
// const LoadingScreen = () => (
//   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
//     <div className="text-center">
//       <div className="w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-8" />
//       <p className="text-3xl font-bold text-blue-800">Đang tải đề thi...</p>
//     </div>
//   </div>
// );

// const NotFoundScreen = () => (
//   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
//     <p className="text-6xl font-bold text-red-600">Không tìm thấy đề thi</p>
//   </div>
// );

// const ResultScreen = ({ score, total }: { score: number; total: number }) => {
//   const band = listeningBandScore[score] || 0;
//   const message =
//     band >= 8
//       ? "THIÊN TÀI!"
//       : band >= 7
//         ? "XUẤT SẮC!"
//         : band >= 6
//           ? "TỐT!"
//           : "CỐ GẮNG THÊM NHÉ!";

//   return (
//     <Card className="max-w-3xl mx-auto text-center py-20 shadow-3xl border-4 border-green-500">
//       <CardHeader>
//         <CardTitle className="text-7xl font-bold text-green-600">
//           HOÀN THÀNH!
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-8">
//         <div className="text-9xl font-black text-blue-600">
//           {score}
//           <span className="text-5xl text-gray-600">/{total}</span>
//         </div>
//         <div className="text-5xl font-bold">
//           Band ước tính:{" "}
//           <span className="text-8xl text-green-600">{band.toFixed(1)}</span>
//         </div>
//         <div className="text-4xl font-bold text-purple-600">{message}</div>

//         <div className="flex gap-8 justify-center mt-16">
//           <Button asChild size="lg" className="text-2xl px-12 py-8">
//             <Link href="/tests/listening">Làm đề khác</Link>
//           </Button>
//           <Button
//             asChild
//             size="lg"
//             variant="outline"
//             className="text-2xl px-12 py-8">
//             <Link href="/tests">Trang chủ</Link>
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };
