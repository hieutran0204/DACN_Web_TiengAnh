"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { PaginationControl } from "@/components/PaginationControl";

type Skill = "listening" | "reading" | "writing" | "speaking";

interface Question {
  _id: string;
  title?: string;
  question?: string;
  passageNumber?: string;
  type: string;
  difficulty: string;
}

export default function NewExamPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("180");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Load questions when skill or params change
  useEffect(() => {
    if (!selectedSkill) {
      setQuestions([]);
      setQuestionsLoading(false);
      return;
    }

    setQuestionsLoading(true);
    
    const fetchQuestions = async () => {
        try {
            let baseUrl = "";
            switch (selectedSkill) {
               case "listening": baseUrl = "/admin/questions/listening/listening-questions"; break;
               case "reading": baseUrl = "/admin/questions/reading/reading-questions"; break;
               case "writing": baseUrl = "/admin/questions/writing"; break;
               case "speaking": baseUrl = "/admin/questions/speaking"; break;
            }

            const query = `?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
            const res = await apiFetch(baseUrl + query);
            
            setQuestions(res.data || []);
            setTotalPages(res.totalPages || 1);
        } catch (err: any) {
             console.error(err);
             setError(`Failed to load ${selectedSkill} questions`);
             setQuestions([]);
        } finally {
            setQuestionsLoading(false);
        }
    }
    
    // Debounce search a bit if needed, but for now direct call is fine or use a timeout
    const timer = setTimeout(() => {
        fetchQuestions();
    }, 300);

    return () => clearTimeout(timer);

  }, [selectedSkill, page, search]);

  // Reset page and search when skill changes
  useEffect(() => {
      setPage(1);
      setSearch("");
  }, [selectedSkill]);

  const handleQuestionToggle = (id: string, checked: boolean) => {
    setSelectedQuestions((prev) =>
      checked ? [...prev, id] : prev.filter((q) => q !== id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter an exam title");
      return;
    }

    if (!selectedSkill) {
      setError("Please select a skill");
      return;
    }

    if (selectedQuestions.length === 0) {
      setError("Please select at least one question");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        title,
        description: description.trim() || undefined,
        durationMinutes: Number(duration),
        skills: {
          listening: [],
          reading: [],
          writing: [],
          speaking: [],
        },
      };
      payload.skills[selectedSkill] = selectedQuestions;

      // Use apiFetch for correct Token Auth
      await apiFetch("/admin/exam", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("Exam created successfully!");
      router.push("/admin/exams");
    } catch (err: any) {
      setError(err.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  const skillConfig = {
    listening: {
      icon: Headphones,
      color: "text-blue-600",
      label: "Listening",
      bg: "bg-blue-50 border-blue-200",
    },
    reading: {
      icon: BookOpen,
      color: "text-green-600",
      label: "Reading",
      bg: "bg-green-50 border-green-200",
    },
    writing: {
      icon: PenTool,
      color: "text-purple-600",
      label: "Writing",
      bg: "bg-purple-50 border-purple-200",
    },
    speaking: {
      icon: Mic,
      color: "text-orange-600",
      label: "Speaking",
      bg: "bg-orange-50 border-orange-200",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Create New Exam
          </h1>
          <p className="text-slate-500 mt-1">
            Create a skill-specific practice exam
          </p>
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

      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Metadata & Skill */}
            <div className="space-y-6 lg:col-span-1">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800">
                            Exam Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Listening Practice Test #1"
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Textarea
                                id="desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Short description..."
                                rows={3}
                                className="bg-white resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes) <span className="text-red-500">*</span></Label>
                            <Input
                                id="duration"
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                min="10"
                                className="bg-white"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800">
                            Select Skill
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <RadioGroup
                            value={selectedSkill || ""}
                            onValueChange={(v) => setSelectedSkill(v as Skill)}
                            className="grid grid-cols-2 gap-4"
                        >
                             {Object.entries(skillConfig).map(([key, config]) => {
                                const Icon = config.icon;
                                const isSelected = selectedSkill === key;
                                return (
                                    <Label
                                        key={key}
                                        className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                                            isSelected 
                                                ? `${config.bg} border-2 ring-1 ring-offset-2 ring-blue-500` 
                                                : "bg-white border-slate-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        <RadioGroupItem value={key} className="sr-only" />
                                        <Icon className={`w-8 h-8 ${config.color} mb-2`} />
                                        <span className={`font-medium ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                            {config.label}
                                        </span>
                                    </Label>
                                );
                             })}
                        </RadioGroup>
                    </CardContent>
                </Card>

                 <Button
                    type="submit"
                    size="lg"
                    disabled={loading || !selectedSkill || selectedQuestions.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                >
                    {loading ? (
                         <>
                            <Loader2 className="mr-2 w-5 h-5 animate-spin" /> Creating...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 w-5 h-5" /> Create Exam
                        </>
                    )}
                </Button>
            </div>

            {/* RIGHT COLUMN: Questions */}
            <div className="lg:col-span-2">
                 {selectedSkill ? (
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                                {(() => {
                                    const Icon = skillConfig[selectedSkill].icon;
                                    return <Icon className={`w-5 h-5 ${skillConfig[selectedSkill].color}`} />;
                                })()}
                                Pick {skillConfig[selectedSkill].label} Questions
                            </CardTitle>
                             <Badge variant="secondary" className="text-slate-600">
                                {selectedQuestions.length} selected
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Search Bar */}
                            <div className="p-4 border-b border-slate-100 bg-white">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input 
                                        placeholder="Search questions..." 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 bg-slate-50 border-slate-200"
                                    />
                                </div>
                            </div>

                            {questionsLoading ? (
                                <div className="p-6 space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : questions.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                    <p>No questions found for this skill.</p>
                                </div>
                            ) : (
                                <div className="max-h-[800px] overflow-y-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead className="w-[50px]"></TableHead>
                                                <TableHead>Question/Title</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Difficulty</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {questions.map((q) => (
                                                <TableRow key={q._id} className="hover:bg-slate-50">
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedQuestions.includes(q._id)}
                                                            onCheckedChange={(c) =>
                                                                handleQuestionToggle(q._id, c as boolean)
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <div className="line-clamp-2" title={q.title || q.question || q.passageNumber}>
                                                            {q.title || q.question || q.passageNumber || "Untitled"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-normal">
                                                            {q.type}
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
                                                            {q.difficulty}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="px-4 pb-4">
                                        <PaginationControl 
                                            currentPage={page}
                                            totalPages={totalPages}
                                            onPageChange={setPage}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 ) : (
                    <Card className="border-dashed border-2 bg-slate-50/50 h-full flex items-center justify-center min-h-[400px]">
                        <CardContent className="text-center text-muted-foreground p-10">
                             <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Select a Skill</h3>
                            <p className="mt-2">Choose a skill on the left to see available questions.</p>
                        </CardContent>
                    </Card>
                 )}
            </div>
        </div>
      </form>
    </div>
  );
}
