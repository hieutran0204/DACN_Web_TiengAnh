
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
  Share2,
  Download,
  BarChart,
  Loader2,
  Clock
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function WritingResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("task1");

  useEffect(() => {
    if (!id) return;
    
    // FETCH RESULT FROM BACKEND
    apiFetch(`/user/writing-exam/submission/${id}`)
        .then(res => {
            if (res.success && res.data) {
                setResult(res.data);
            } else {
                console.error("Failed to load result");
            }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));

  }, [id]);

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Result Not Found</h2>
          <Button asChild>
            <Link href="/tests/writing">Back to Tests</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Extract feedback for Task 1 and Task 2 directly from Submission model structure
  // The Backend 'exam.route.js' returns:
  // {
  //   data: {
  //     task1: { result: { ... } },
  //     task2: { result: { ... } },
  //     overallBand: number
  //   }
  // }
  // OR if referencing 'task1.result' directly as per schema.
  
  // Let's look at the response from 'submission/:id':
  // res.json({ success: true, data: submission });
  // submission has task1: { result: ... }
  
  const task1Feedback = result.task1?.result;
  const task2Feedback = result.task2?.result;
  
  // Helper to render a score card
  const ScoreCard = ({ title, score, color = "bg-primary" }: any) => (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
      <span className="text-muted-foreground text-sm font-medium mb-1">{title}</span>
      <div className={`text-3xl font-bold ${color.replace('bg-', 'text-')}`}>{score}</div>
    </div>
  );

  // Helper to render feedback section
  const FeedbackSection = ({ data, title }: { data: any, title: string }) => {
    if (!data) return <div className="p-8 text-center text-muted-foreground">No feedback available for {title}</div>;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* OVERALL BAND */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ScoreCard title="Overall Band" score={data.overall_band || "N/A"} color="bg-blue-600" />
          <ScoreCard title="Task Response" score={data.band_breakdown?.task_response || data.band_breakdown?.task_achievement || "N/A"} color="bg-green-600" />
          <ScoreCard title="Coherence" score={data.band_breakdown?.coherence_cohesion || "N/A"} color="bg-purple-600" />
          <ScoreCard title="Lexical" score={data.band_breakdown?.lexical_resource || "N/A"} color="bg-amber-600" />
        </div>

        {/* FEEDBACK */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              General Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              {data.feedback_vn || data.overall_comment_vn}
            </p>
          </CardContent>
        </Card>

        {/* RECOMMENDATIONS */}
        {data.recommendations_vn && (
             <Card className="bg-amber-50/50 border-amber-200">
                <CardHeader>
                 <CardTitle className="text-amber-800 flex items-center gap-2">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-amber-900">{data.recommendations_vn}</p>
                </CardContent>
             </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* STRENGTHS */}
          <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.strengths?.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* WEAKNESSES */}
          <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
         {/* VOCABULARY */}
         {data.advanced_vocabulary && (
            <Card>
                <CardHeader><CardTitle>Advanced Vocabulary Used</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.advanced_vocabulary.map((v: any, i:number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                                <div>
                                    <span className="font-bold">{v.word}</span>
                                    <span className="text-xs text-muted-foreground ml-2">({v.level})</span>
                                </div>
                                <span className="text-sm text-slate-600">{v.meaning_vn}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
         )}

        {/* CORRECTED ESSAY */}
        {data.corrected_essay && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-indigo-500" />
                Improved Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg font-serif text-lg leading-relaxed text-slate-800 dark:text-slate-200 border whitespace-pre-line">
                {data.corrected_essay}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/tests/writing" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
               <ArrowLeft className="w-5 h-5 mr-1" /> Back
             </Link>
             <div className="h-6 w-px bg-border" />
             <h1 className="font-bold text-lg">Exam Result</h1>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link href="/tests/writing/history">
                  <Clock className="w-4 h-4" /> History
                </Link>
             </Button>
             <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" /> Share
             </Button>
             <Button variant="default" size="sm" className="gap-2">
                <Download className="w-4 h-4" /> PDF
             </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto py-8">
        <Tabs defaultValue="task1" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white dark:bg-slate-900 p-1 border shadow-sm">
              <TabsTrigger value="task1" className="px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Task 1 Feedback</TabsTrigger>
              <TabsTrigger value="task2" className="px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Task 2 Feedback</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="task1">
             <FeedbackSection data={task1Feedback} title="Task 1" />
          </TabsContent>
          
          <TabsContent value="task2">
             <FeedbackSection data={task2Feedback} title="Task 2" />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
