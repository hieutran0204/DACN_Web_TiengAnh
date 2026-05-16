"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  ChevronLeft,
  Eye,
  EyeOff,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface SubQuestion {
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  headings?: string[];
  paragraphLabel?: string;
  wordLimit?: number;
}

interface ReadingPassage {
  _id: string;
  passageNumber: "Passage 1" | "Passage 2" | "Passage 3";
  passage: string;
  image?: string;
  subQuestions: SubQuestion[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
}

export default function ReadingPassageDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const fetchPassage = async () => {
      try {
        const result = await apiFetch(`/admin/questions/reading/reading-questions/${id}`);

        if (result.success && result.data) {
          setPassage(result.data);
        } else {
          throw new Error(result.message || "Invalid data");
        }
      } catch (err: any) {
        setError(err.message || "Error loading passage");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPassage();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <div className="text-center space-y-4 w-full max-w-4xl px-6">
             <div className="flex gap-6">
                 <Skeleton className="h-[600px] w-1/2" />
                 <div className="w-1/2 space-y-4">
                     <Skeleton className="h-12 w-full" />
                     <Skeleton className="h-[200px] w-full" />
                     <Skeleton className="h-[300px] w-full" />
                 </div>
             </div>
         </div>
      </div>
    );
  }

  if (error || !passage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-4">
             <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {error || "Passage not found"}
                </AlertDescription>
            </Alert>
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 w-4 h-4" /> Back to List
          </Button>
        </div>
      </div>
    );
  }

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
                        {passage.passageNumber}
                     </h1>
                     <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${
                            passage.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                            passage.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                        } border-transparent`}>
                             {passage.difficulty.toUpperCase()}
                        </Badge>
                         <Badge variant="outline" className="text-slate-600">
                             {passage.subQuestions.length} Questions
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
                <Link href={`/admin/skills/reading/questions/edit/${id}`}>
                    <Edit className="mr-2 w-4 h-4" />
                    Edit Passage
                </Link>
            </Button>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
           {/* LEFT: PASSAGE TEXT */}
           <Card className="shadow-sm border-slate-200 flex flex-col h-full overflow-hidden">
             <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
               <CardTitle className="text-sm font-medium text-slate-800 flex items-center gap-2">
                 <BookOpen className="w-4 h-4" />
                 Passage Content
               </CardTitle>
             </CardHeader>
             <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
               {passage.image && (
                 <div className="mb-6 rounded-lg overflow-hidden border border-slate-100">
                    <img
                        src={passage.image.startsWith("http") ? passage.image : `${BACKEND_URL}${passage.image}`}
                        alt="Illustration"
                        className="w-full object-cover"
                    />
                 </div>
               )}
               <div className="prose prose-slate max-w-none">
                 <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base font-serif">
                   {passage.passage}
                 </p>
               </div>
             </CardContent>
           </Card>

           {/* RIGHT: QUESTIONS */}
           <div className="flex flex-col h-full overflow-hidden gap-6">
                <div className="flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-2">
                    {passage.subQuestions.map((sq, idx) => (
                         <Card key={idx} className="shadow-sm border-slate-200">
                             <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                                <CardTitle className="text-sm font-medium text-slate-800 flex justify-between">
                                    <span>Question {idx + 1}: {sq.type.replace(/_/g, " ").toUpperCase()}</span>
                                </CardTitle>
                             </CardHeader>
                             <CardContent className="pt-4 space-y-4">
                                <div className="text-slate-800 font-medium whitespace-pre-wrap">
                                    {sq.question}
                                </div>

                                {/* Multiple Choice */}
                                {sq.type === "multiple_choice" && sq.options && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {sq.options.map((opt, i) => {
                                             const letter = String.fromCharCode(65 + i);
                                             const isCorrect = sq.correctAnswer === letter || sq.correctAnswers?.includes(letter);
                                             return (
                                                 <div key={i} className={`p-3 rounded border text-sm flex items-start gap-2 ${
                                                     showAnswers && isCorrect ? "bg-green-50 border-green-200" : "bg-white border-slate-200"
                                                 }`}>
                                                     <span className={`font-bold ${showAnswers && isCorrect ? "text-green-700" : "text-slate-500"}`}>{letter}.</span>
                                                     <span className={showAnswers && isCorrect ? "text-green-900" : "text-slate-700"}>{opt}</span>
                                                     {showAnswers && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
                                                 </div>
                                             )
                                        })}
                                    </div>
                                )}

                                {/* True/False/NG */}
                                {["true_false_not_given", "yes_no_not_given"].includes(sq.type) && (
                                     <div className="grid grid-cols-3 gap-2">
                                        {["True", "False", "Not Given"].map((opt) => {
                                             const display = sq.type === "yes_no_not_given" ? opt.replace("True", "Yes").replace("False", "No") : opt;
                                             const isCorrect = sq.correctAnswers?.includes(display);
                                             return (
                                                 <div key={opt} className={`p-2 text-center border rounded text-sm font-medium ${
                                                     showAnswers && isCorrect ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-slate-200 text-slate-600"
                                                 }`}>
                                                     {display}
                                                 </div>
                                             )
                                        })}
                                     </div>
                                )}

                                {/* Fill in Blanks */}
                                {showAnswers && sq.correctAnswers && sq.correctAnswers.length > 0 && !["multiple_choice", "true_false_not_given", "yes_no_not_given"].includes(sq.type) && (
                                     <div className="mt-2 text-sm bg-green-50 text-green-800 p-3 rounded border border-green-100">
                                         <span className="font-semibold block mb-1">Answer Key:</span>
                                         <div className="flex flex-wrap gap-2">
                                            {sq.correctAnswers.map((ans, k) => (
                                                <Badge key={k} variant="secondary" className="bg-white text-green-700 border-green-200">
                                                    {ans}
                                                </Badge>
                                            ))}
                                         </div>
                                     </div>
                                )}
                             </CardContent>
                         </Card>
                    ))}

                    {passage.explanation && (
                      <Card className="shadow-sm border-slate-200 bg-blue-50/30">
                        <CardHeader className="bg-transparent border-b border-blue-100 py-3">
                          <CardTitle className="text-sm font-medium text-blue-800">Explanation</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="prose prose-sm max-w-none text-slate-700">
                            {passage.explanation}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                </div>
           </div>
       </div>
    </div>
  );
}
