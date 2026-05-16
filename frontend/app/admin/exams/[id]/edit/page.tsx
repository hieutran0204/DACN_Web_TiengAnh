"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  AlertCircle,
  ChevronLeft,
  Loader2,
  Save,
  Search
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Question = Record<string, any>;
type Skill = "listening" | "reading" | "writing" | "speaking";

export default function EditExamPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("180");
  const [error, setError] = useState("");

  const [selectedQuestions, setSelectedQuestions] = useState<{
    listening: string[];
    reading: string[];
    writing: string[];
    speaking: string[];
  }>({
    listening: [],
    reading: [],
    writing: [],
    speaking: [],
  });

  const [allQuestions, setAllQuestions] = useState<{
    listening: Question[];
    reading: Question[];
    writing: Question[];
    speaking: Question[];
  }>({
    listening: [],
    reading: [],
    writing: [],
    speaking: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
        try {
            const [examRes, listeningRes, readingRes, writingRes, speakingRes] = await Promise.all([
                apiFetch(`/admin/exam/${id}`),
                apiFetch(`/admin/questions/listening/listening-questions?limit=500`),
                apiFetch(`/admin/questions/reading/reading-questions?limit=500`),
                apiFetch(`/admin/questions/writing?limit=500`),
                apiFetch(`/admin/questions/speaking?limit=500`),
            ]);

            const examData = examRes.data || examRes;
            setExam(examData);
            setTitle(examData.title || "");
            setDescription(examData.description || "");
            setDuration(String(examData.durationMinutes || 180));

            const skills = examData.skills || {};
            setSelectedQuestions({
                listening: (skills.listening || []).map((q: any) => q._id || q),
                reading: (skills.reading || []).map((q: any) => q._id || q),
                writing: (skills.writing || []).map((q: any) => q._id || q),
                speaking: (skills.speaking || []).map((q: any) => q._id || q),
            });

            setAllQuestions({
                listening: listeningRes.data || [],
                reading: readingRes.data || [],
                writing: writingRes.data || [],
                speaking: speakingRes.data || [],
            });

        } catch (err: any) {
            console.error("Error loading data:", err);
            setError("Failed to load exam data");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id]);

  const toggleQuestion = (
    skill: Skill,
    qid: string
  ) => {
    setSelectedQuestions((prev) => ({
      ...prev,
      [skill]: prev[skill].includes(qid)
        ? prev[skill].filter((id) => id !== qid)
        : [...prev[skill], qid],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
        setError("Title is required");
        return;
    }
    setError("");
    setSaving(true);
    
    try {
      await apiFetch(`/admin/exam/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          durationMinutes: Number(duration) || 180,
          skills: selectedQuestions,
        }),
      });

      alert("Exam updated successfully!");
      router.push("/admin/exams");
    } catch (err: any) {
      setError(err.message || "Failed to update exam");
    } finally {
      setSaving(false);
    }
  };

  const skillConfig = {
    listening: { icon: Headphones, color: "text-blue-600", label: "Listening" },
    reading: { icon: BookOpen, color: "text-green-600", label: "Reading" },
    writing: { icon: PenTool, color: "text-purple-600", label: "Writing" },
    speaking: { icon: Mic, color: "text-orange-600", label: "Speaking" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-3xl px-6">
           <Skeleton className="h-12 w-1/2 mx-auto" />
           <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!exam) return <div className="p-10 text-center">Exam not found</div>;

  const renderTable = (skill: Skill) => {
    const questions = allQuestions[skill] || [];
    if (questions.length === 0) {
      return (
        <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No questions available for {skill}</p>
        </div>
      );
    }

    return (
      <div className="rounded-md border border-slate-200 mt-4 max-h-[600px] overflow-y-auto">
        <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10">
            <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Content / Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {questions.map((q: Question) => (
                <TableRow key={q._id} className="hover:bg-slate-50">
                <TableCell>
                    <Checkbox
                    checked={selectedQuestions[skill].includes(q._id)}
                    onCheckedChange={() => toggleQuestion(skill, q._id)}
                    />
                </TableCell>
                <TableCell className="font-medium max-w-md">
                    <div className="truncate" title={q.title || q.question || q.passageNumber}>
                         {q.title || q.question || q.topic || q.passageNumber || q.passage || "Untitled"}
                    </div>
                </TableCell>
                <TableCell>
                     <Badge variant="outline" className="font-normal text-slate-600">
                         {q.type ? q.type.replace(/_/g, " ") : "—"}
                    </Badge>
                </TableCell>
                <TableCell>
                     <Badge
                        className={
                            q.difficulty === "easy"
                            ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                            : q.difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                        }
                    >
                        {(q.difficulty || "medium").toUpperCase()}
                    </Badge>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Edit Exam
          </h1>
          <p className="text-slate-500 mt-1">ID: {id}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to List
        </Button>
      </div>

       {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 pb-10">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-medium text-slate-800">Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label>Title <span className="text-red-500">*</span></Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Exam Title"
                        className="bg-white"
                    />
                  </div>
                   <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="10"
                        className="bg-white"
                    />
                  </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Exam description..."
                  className="bg-white resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-medium text-slate-800">Select Questions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="listening" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    {Object.entries(skillConfig).map(([key, config]) => (
                         <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                            <config.icon className={`w-4 h-4 ${config.color}`} />
                            {config.label}
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem]">
                                {selectedQuestions[key as Skill].length}
                            </Badge>
                         </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="listening">{renderTable("listening")}</TabsContent>
                <TabsContent value="reading">{renderTable("reading")}</TabsContent>
                <TabsContent value="writing">{renderTable("writing")}</TabsContent>
                <TabsContent value="speaking">{renderTable("speaking")}</TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
            >
                Cancel
            </Button>
            <Button type="submit" size="lg" disabled={saving} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
              {saving ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving...
                  </>
              ) : (
                  <>
                    <Save className="mr-2 w-4 h-4" /> Save Changes
                  </>
              )}
            </Button>
          </div>
      </form>
    </div>
  );
}
