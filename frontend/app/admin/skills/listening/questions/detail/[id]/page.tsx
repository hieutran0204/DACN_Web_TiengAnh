"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Headphones,
  Edit,
  ChevronLeft,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ListeningQuestionDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const result = await apiFetch(`/admin/questions/listening/listening-questions/${id}`);
        setQuestion(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuestion();
  }, [id]);

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-4 w-full max-w-3xl px-6">
                <Skeleton className="h-12 w-2/3 mx-auto" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
     );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-4">
             <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {error || "Question not found"}
                </AlertDescription>
            </Alert>
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 w-4 h-4" /> Back to List
          </Button>
        </div>
      </div>
    );
  }

  const audioUrl = question.audio 
    ? (question.audio.startsWith("http") ? question.audio : `${BACKEND_URL}${question.audio}`)
    : null;

  return (
    <div className="space-y-6">
        {/* HEADER */}
       <div className="flex items-center justify-between">
        <div className="space-y-1">
             <div className="flex items-center gap-4">
                <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => router.back()}
                    className="h-9 w-9 border-slate-200"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                </Button>
                <div>
                     <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {question.title || "Untitled Question"}
                     </h1>
                     <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                             {question.section}
                        </Badge>
                         <Badge variant="outline" className="text-slate-600">
                             {question.type.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                     </div>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                onClick={() => setShowAnswers(!showAnswers)}
                className="gap-2"
            >
                {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAnswers ? "Hide Answers" : "Show Answers"}
            </Button>

            <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
                <Link href={`/admin/skills/listening/questions/edit/${id}`}>
                    <Edit className="mr-2 w-4 h-4" />
                    Edit Question
                </Link>
            </Button>
        </div>
      </div>

       {/* AUDIO PLAYER */}
       {audioUrl && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                Audio Track
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <audio
                controls
                controlsList="nodownload"
                className="w-full h-12"
                src={audioUrl}
              >
                Your browser does not support the audio element.
              </audio>
            </CardContent>
          </Card>
        )}

        {/* QUESTIONS */}
        <div className="grid gap-6">
             {/* MULTIPLE CHOICE */}
             {question.type === "multiple_choice" &&
                 question.subQuestions?.map((sq: any, i: number) => (
                    <Card key={i} className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                            <CardTitle className="text-base font-medium text-slate-800">
                                Question {i + 1}: {sq.question || "(No question text)"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {["A", "B", "C", "D"].map((letter, idx) => {
                                    const option = sq.options?.[idx] || "";
                                    const isCorrect = sq.correctAnswer === letter || sq.correctAnswers?.includes(letter);
                                    
                                    return (
                                        <div 
                                            key={letter}
                                            className={`p-4 rounded-lg border flex items-start gap-3 transition-colors ${
                                                showAnswers && isCorrect
                                                 ? "bg-green-50 border-green-200"
                                                 : "bg-white border-slate-200"
                                            }`}
                                        >
                                            <span className={`font-bold flex-shrink-0 ${
                                                showAnswers && isCorrect ? "text-green-700" : "text-slate-500"
                                            }`}>
                                                {letter}.
                                            </span>
                                            <span className={`${showAnswers && isCorrect ? "text-green-900 font-medium" : "text-slate-700"}`}>
                                                 {option}
                                            </span>
                                            {showAnswers && isCorrect && (
                                                <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto flex-shrink-0" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                 ))
             }

             {/* FILL / NOTE / SENTENCE COMPLETION */}
             {["fill_in_the_blank", "note_completion", "sentence_completion", "dictation"].includes(question.type) && (
                 <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                             <FileText className="w-4 h-4" /> Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {question.subQuestions?.[0]?.question || "(No content)"}
                        </div>

                         {showAnswers && (
                             <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                 <h3 className="text-green-800 font-semibold mb-3 flex items-center gap-2">
                                     <CheckCircle2 className="w-4 h-4" /> Correct Answers
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {question.subQuestions?.[0]?.correctAnswers?.map((ans: string, i: number) => (
                                          <div key={i} className="bg-white px-3 py-2 rounded border border-green-100 text-green-900 font-medium shadow-sm">
                                              <span className="text-green-500 mr-2">{i+1}.</span>
                                              {ans}
                                          </div>
                                      ))}
                                 </div>
                             </div>
                         )}
                    </CardContent>
                 </Card>
             )}

             {/* MATCHING */}
             {question.type === "matching" && (
                 <div className="grid md:grid-cols-2 gap-6">
                      <Card className="shadow-sm border-slate-200">
                         <CardHeader className="bg-slate-50 border-b border-slate-100">
                             <CardTitle className="text-base font-medium">Questions</CardTitle>
                         </CardHeader>
                         <CardContent className="pt-4 space-y-4">
                             {question.subQuestions?.map((sq: any, i: number) => (
                                 <div key={i} className="flex gap-3 items-start p-3 bg-white border border-slate-100 rounded-md">
                                     <span className="font-bold text-slate-400 w-6 flex-shrink-0">{i+1}.</span>
                                     <span className="text-slate-800">{sq.question}</span>
                                 </div>
                             ))}
                         </CardContent>
                      </Card>

                       <Card className="shadow-sm border-slate-200">
                         <CardHeader className="bg-slate-50 border-b border-slate-100">
                             <CardTitle className="text-base font-medium">Options</CardTitle>
                         </CardHeader>
                         <CardContent className="pt-4 space-y-4">
                             {question.matchingOptions?.map((opt: string, i: number) => (
                                 <div key={i} className="flex gap-3 items-start p-3 bg-white border border-slate-100 rounded-md">
                                     <span className="font-bold text-blue-600 bg-blue-50 w-6 h-6 flex items-center justify-center rounded flex-shrink-0">
                                         {String.fromCharCode(65 + i)}
                                     </span>
                                     <span className="text-slate-800">{opt}</span>
                                 </div>
                             ))}

                             {showAnswers && (
                                 <div className="mt-6 pt-6 border-t border-slate-100">
                                     <h4 className="font-semibold text-green-700 mb-3">Correct Matches</h4>
                                      <div className="grid grid-cols-3 gap-2">
                                          {question.subQuestions?.map((sq: any, i: number) => (
                                              <div key={i} className="bg-green-50 text-green-800 px-3 py-2 rounded text-center border border-green-100 font-bold">
                                                  {i+1} → {sq.correctAnswers?.[0]}
                                              </div>
                                          ))}
                                      </div>
                                 </div>
                             )}
                         </CardContent>
                      </Card>
                 </div>
             )}
        </div>

        {/* TRANSCRIPT & EXPLANATION */}
        {(question.transcript || question.explanation) && (
            <div className="grid md:grid-cols-2 gap-6 pt-4">
                 {question.transcript && (
                      <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b border-slate-100">
                             <CardTitle className="text-base font-medium">Transcript</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 max-h-[300px] overflow-y-auto">
                            <p className="whitespace-pre-wrap text-slate-600 leading-relaxed text-sm">
                                {question.transcript}
                            </p>
                        </CardContent>
                      </Card>
                 )}
                 {question.explanation && (
                      <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b border-slate-100">
                             <CardTitle className="text-base font-medium">Explanation</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 max-h-[300px] overflow-y-auto">
                             <div className="prose prose-sm max-w-none text-slate-600">
                                {question.explanation}
                             </div>
                        </CardContent>
                      </Card>
                 )}
            </div>
        )}
    </div>
  );
}
