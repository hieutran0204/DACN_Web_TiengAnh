"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  PenTool,
  Image as ImageIcon,
  FileText,
  Edit,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface WritingQuestion {
  _id: string;
  task: "Task 1" | "Task 2";
  type: string;
  topic: string;
  question: string;
  image?: string;
  sampleAnswer?: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function WritingQuestionDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [question, setQuestion] = useState<WritingQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/admin/questions/writing/${id}`)
      .then((res) => {
        if (res.success && res.data) {
          setQuestion(res.data);
        }
      })
      .catch((err) => {
        console.error("Error loading writing question:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      bar_chart: "Bar Chart",
      line_graph: "Line Graph",
      pie_chart: "Pie Chart",
      table: "Table",
      process: "Process",
      map: "Map",
      mixed_chart: "Mixed Chart",
      opinion: "Opinion Essay",
      discussion: "Discussion Essay",
      problem_solution: "Problem & Solution",
      cause_effect: "Cause & Effect",
      advantage_disadvantage: "Advantages/Disadvantages",
      two_part_question: "Two-Part Question",
    };
    return map[type] || type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
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

  if (!question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-4">
          <p className="text-xl font-medium text-slate-600">
            Question not found
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to List
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
                        Writing Question Details
                     </h1>
                     <p className="text-sm text-slate-500">ID: {question._id}</p>
                </div>
            </div>
        </div>
        <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
            <Link href={`/admin/skills/writing/questions/edit/${question._id}`}>
                <Edit className="mr-2 w-4 h-4" />
                Edit Question
            </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
        {/* LEFT COLUMN - METADATA */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Task</p>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 text-base px-3 py-1">
                        {question.task}
                    </Badge>
                </div>
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

              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Topic</p>
                <p className="text-slate-800 font-medium">
                    {question.topic}
                </p>
              </div>
            </CardContent>
          </Card>

          {question.image && (
            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Task 1 Image
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-slate-100 flex items-center justify-center">
                    <img
                        src={
                        question.image.startsWith("http")
                            ? question.image
                            : `${BACKEND_URL}${question.image}`
                        }
                        alt="Task 1"
                        className="max-h-[300px] w-auto h-auto object-contain"
                    />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN - CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* QUESTION PROMPT */}
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Question Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base">
                  {question.question}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SAMPLE ANSWER */}
          {question.sampleAnswer && (
             <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg font-medium text-slate-800">
                        Sample Answer (Band 9.0)
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
