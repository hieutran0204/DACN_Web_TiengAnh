"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Headphones, BookOpen, PenTool, Mic, ChevronLeft, Clock, Activity, Layers, Edit } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Question = Record<string, any>;

export default function ExamDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchExam = async () => {
        try {
            const res = await apiFetch(`/admin/exam/${id}`);
            const data = res.data || res;
            setExam(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchExam();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="space-y-4 w-full max-w-3xl px-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-3 gap-6 pt-8">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
         </div>
      </div>
    );
  }

  if (!exam) return <div className="p-10 text-center">Exam not found</div>;

  const skills = exam.skills || {};
  const totalQuestions =
    (skills.listening?.length || 0) +
    (skills.reading?.length || 0) +
    (skills.writing?.length || 0) +
    (skills.speaking?.length || 0);

  const skillIcons = [
    {
      Icon: Headphones,
      label: "Listening",
      data: skills.listening || [],
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      Icon: BookOpen,
      label: "Reading",
      data: skills.reading || [],
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
    },
    {
      Icon: PenTool,
      label: "Writing",
      data: skills.writing || [],
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
    },
    {
      Icon: Mic,
      label: "Speaking",
      data: skills.speaking || [],
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-200",
    },
  ];

  const renderQuestions = (questions: Question[]) => {
    if (!questions || questions.length === 0) {
      return (
        <p className="text-slate-500 italic py-4">No questions added.</p>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Content / Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Difficulty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q: Question, idx: number) => (
            <TableRow key={q._id}>
              <TableCell className="font-medium text-slate-500">{idx + 1}</TableCell>
              <TableCell className="max-w-md">
                <div className="truncate font-medium text-slate-800" title={q.title || q.question || q.passageNumber}>
                  {q.title ||
                    q.question ||
                    q.topic ||
                    q.passageNumber ||
                    q.passage ||
                    "—"}
                </div>
              </TableCell>
              <TableCell>
                 <Badge variant="outline" className="font-normal text-slate-600">
                    {q.type
                    ? q.type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l: string) => l.toUpperCase())
                    : "—"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    q.difficulty === "easy"
                      ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                      : q.difficulty === "hard"
                        ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                  }>
                  {(q.difficulty || "medium").toUpperCase()}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
             <Button 
                variant="outline" 
                size="icon"
                onClick={() => router.push("/admin/exams")}
                className="h-10 w-10 border-slate-200"
            >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {exam.title}
                </h1>
                 <div className="flex items-center gap-2 mt-1">
                    <Badge variant={exam.isPublished ? "default" : "secondary"} className="rounded-sm px-2 font-normal">
                        {exam.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <span className="text-slate-400 text-sm">•</span>
                    <span className="text-slate-500 text-sm">ID: {id}</span>
                </div>
            </div>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={`/admin/exams/${id}/edit`}>
                <Edit className="w-4 h-4 mr-2" /> Edit Exam
            </Link>
        </Button>
      </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Duration</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {exam.durationMinutes || 180} <span className="text-sm font-normal text-slate-500">min</span>
              </div>
            </CardContent>
          </Card>

           <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Questions</CardTitle>
              <Layers className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {totalQuestions}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Skills Included</CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
               <div className="flex gap-2">
                {skillIcons
                  .filter((s) => s.data.length > 0)
                  .map(({ Icon, color, label, bg }) => (
                    <div key={label} className={`p-2 rounded-lg ${bg}`} title={label}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                  ))}
                  {skillIcons.every(s => s.data.length === 0) && (
                      <span className="text-slate-400 text-sm">No skills added</span>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        {exam.description && (
             <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
                    <CardTitle className="text-sm font-medium text-slate-700">Description</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <p className="text-slate-600 leading-relaxed">{exam.description}</p>
                </CardContent>
            </Card>
        )}

        {/* Question Lists */}
        <div className="space-y-8 pb-10">
          {skillIcons.map(
            ({ label, data, Icon, color }) =>
              data.length > 0 && (
                <Card key={label} className="shadow-sm border-slate-200 overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800">
                      <Icon className={`w-5 h-5 ${color}`} />
                      {label} Questions
                      <Badge variant="secondary" className="ml-2 bg-white border border-slate-200">
                        {data.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <div className="border-t border-slate-100">
                    {renderQuestions(data)}
                  </div>
                </Card>
              )
          )}
        </div>
    </div>
  );
}
