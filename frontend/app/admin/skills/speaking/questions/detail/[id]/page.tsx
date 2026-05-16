"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mic,
  Edit,
  ChevronLeft,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  FileText
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface SpeakingQuestion {
  _id: string;
  topic: string;
  type: string;
  question: string;
  subQuestions: string[];
  suggestedIdeas: string[];
  sampleAnswer: string;
  image?: string;
  difficulty: string;
  createdAt: string;
}

export default function SpeakingQuestionDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [question, setQuestion] = useState<SpeakingQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
        try {
            const res = await apiFetch(`/admin/questions/speaking/${id}`);
            if (res.success && res.data) {
                setQuestion(res.data);
            } else {
                throw new Error(res.message || "Invalid Data");
            }
        } catch (err: any) {
            console.error("Error loading speaking question:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    if (id) fetchQuestion();
  }, [id]);

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      personal_experience: "Personal Experience",
      descriptive: "Descriptive",
      comparative: "Comparative",
      opinion_based: "Opinion",
      cause_effect: "Cause & Effect",
      hypothetical: "Hypothetical",
      advantage_disadvantage: "Advantages/Disadvantages",
      problem_solution: "Problem & Solution",
      prediction: "Prediction",
      abstract: "Abstract",
    };
    return (
      map[type] ||
      type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
        case "easy": return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
        case "hard": return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
        default: return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <div className="text-center space-y-4 w-full max-w-3xl px-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
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
                        Speaking Question Details
                     </h1>
                     <p className="text-sm text-slate-500">ID: {question._id}</p>
                </div>
            </div>
        </div>
        <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
            <Link href={`/admin/skills/speaking/questions/edit/${id}`}>
                <Edit className="mr-2 w-4 h-4" />
                Edit Question
            </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
        {/* LEFT: METADATA */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Topic</p>
                  <p className="text-slate-800 font-medium text-lg">
                    {question.topic}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Type</p>
                  <Badge variant="outline" className="text-sm font-normal">
                    {getTypeLabel(question.type)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Difficulty</p>
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty.toUpperCase()}
                  </Badge>
                </div>
            </CardContent>
          </Card>

          {question.image && (
            <Card className="shadow-sm border-slate-200 overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                 <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Illustration
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 <img
                    src={`${BACKEND_URL}${question.image}`}
                    alt="Speaking illustration"
                    className="w-full h-auto object-cover max-h-[300px]"
                 />
               </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: CONTENT */}
        <div className="lg:col-span-2 space-y-6">
           {/* MAIN QUESTION */}
           <Card className="shadow-sm border-slate-200">
             <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
               <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Main Question
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
                <p className="text-xl font-medium text-slate-800 leading-relaxed">
                  {question.question}
                </p>
             </CardContent>
           </Card>

           {/* SUB QUESTIONS */}
           {question.subQuestions && question.subQuestions.length > 0 && (
             <Card className="shadow-sm border-slate-200">
               <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                 <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                   <HelpCircle className="w-4 h-4" /> Follow-up Questions / Cue Card
                 </CardTitle>
               </CardHeader>
               <CardContent className="pt-6">
                 <ul className="space-y-3">
                   {question.subQuestions.map((q, i) => (
                     <li key={i} className="flex gap-3 text-slate-700">
                       <span className="font-bold text-slate-400 select-none">{i + 1}.</span>
                       <span className="leading-relaxed">{q}</span>
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
           )}

           {/* SUGGESTED IDEAS */}
           {question.suggestedIdeas && question.suggestedIdeas.length > 0 && (
             <Card className="shadow-sm border-slate-200">
               <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                 <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                   <Lightbulb className="w-4 h-4 text-amber-500" /> Suggested Ideas
                 </CardTitle>
               </CardHeader>
               <CardContent className="pt-6">
                 <div className="flex flex-wrap gap-2">
                   {question.suggestedIdeas.map((idea, i) => (
                     <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 px-3 py-1 text-sm font-normal">
                       {idea}
                     </Badge>
                   ))}
                 </div>
               </CardContent>
             </Card>
           )}

           {/* SAMPLE ANSWER */}
           {question.sampleAnswer && (
             <Card className="shadow-sm border-slate-200">
               <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                 <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                   <FileText className="w-4 h-4" /> Sample Answer (Band 8.0+)
                 </CardTitle>
               </CardHeader>
               <CardContent className="pt-6">
                 <div className="prose prose-slate max-w-none bg-slate-50/50 p-6 rounded-lg border border-slate-100">
                    <p className="whitespace-pre-wrap text-slate-700 font-serif leading-relaxed text-lg">
                        {question.sampleAnswer}
                    </p>
                 </div>
               </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}
