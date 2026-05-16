"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Loader2,
  Trash2,
  Plus,
  FileText,
  ChevronLeft,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type QuestionType =
  | "multiple_choice"
  | "true_false_not_given"
  | "yes_no_not_given"
  | "matching_headings"
  | "sentence_completion"
  | "summary_completion"
  | "diagram_label_completion";

interface SubQuestion {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  headings?: string[];
}

export default function EditReadingQuestion() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [passageNumber, setPassageNumber] = useState<
    "Passage 1" | "Passage 2" | "Passage 3"
  >("Passage 1");
  const [passage, setPassage] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [explanation, setExplanation] = useState("");
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([]);

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // LOAD DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const json = await apiFetch(`/admin/questions/reading/reading-questions/${id}`);

        if (!json.success) throw new Error(json.message || "Data error");

        const d = json.data;
        setPassageNumber(d.passageNumber);
        setPassage(d.passage || "");
        setDifficulty(d.difficulty || "medium");
        setExplanation(d.explanation || "");
        setCurrentImage(d.image ? `${BACKEND_URL}${d.image}` : null);

        if (Array.isArray(d.subQuestions)) {
          setSubQuestions(
            d.subQuestions.map((q: any) => ({
              question: q.question || "",
              type: q.type || "multiple_choice",
              options:
                q.type === "multiple_choice"
                  ? q.options || ["", "", "", ""]
                  : undefined,
              correctAnswer: q.correctAnswer || "",
              correctAnswers: q.correctAnswers || [],
              headings: q.headings || [],
            }))
          );
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Preview Image
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(imageFile);
    } else {
      setPreviewImage(null);
    }
  }, [imageFile]);

  const addSubQuestion = (type: QuestionType = "multiple_choice") => {
    const newQ: SubQuestion = {
      type,
      question: "",
      ...(type === "multiple_choice" && {
        options: ["", "", "", ""],
        correctAnswer: "A",
      }),
      ...(type === "true_false_not_given" && { correctAnswers: ["Not Given"] }),
      ...(type === "yes_no_not_given" && { correctAnswers: ["Not Given"] }),
      ...(type === "sentence_completion" && { correctAnswers: [""] }),
      ...(type === "summary_completion" && { correctAnswers: [""] }),
      ...(type === "diagram_label_completion" && { correctAnswers: [""] }),
      ...(type === "matching_headings" && { headings: [""] }),
    };
    setSubQuestions([...subQuestions, newQ]);
  };

  const removeSubQuestion = (index: number) => {
    if (subQuestions.length === 1) return;
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
  };

  const updateSubQuestion = (
    index: number,
    field: keyof SubQuestion,
    value: any
  ) => {
    setSubQuestions((prev) => {
      const updated = [...prev];
      // @ts-ignore
      updated[index][field] = value;
      return updated;
    });
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...subQuestions];
    if (!updated[qIdx].options) updated[qIdx].options = ["", "", "", ""];
    updated[qIdx].options![optIdx] = value;
    setSubQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData();
    formData.append("passageNumber", passageNumber);
    formData.append("passage", passage);
    formData.append("difficulty", difficulty);
    formData.append("explanation", explanation || "");
    
    // Process subQuestions similar to "New" page logic could be added here if needed,
    // but relying on backend to clean up is also fine if backend is robust.
    // Let's do some client-side cleanup for safety if we changed types mid-way.
    const processed = subQuestions.map((sq) => {
        const base = { type: sq.type, question: sq.question.trim() };
        if (sq.type === "multiple_choice")
          return {
            ...base,
            options: sq.options?.filter(Boolean),
            correctAnswer: sq.correctAnswer,
          };
        if (["true_false_not_given", "yes_no_not_given"].includes(sq.type))
          return { ...base, correctAnswers: sq.correctAnswers };
        if (
          [
            "sentence_completion",
            "summary_completion",
            "diagram_label_completion",
          ].includes(sq.type)
        )
          return {
            ...base,
            correctAnswers: sq.correctAnswers?.filter(Boolean),
          };
        if (sq.type === "matching_headings")
          return { ...base, headings: sq.headings?.filter(Boolean), correctAnswers: sq.correctAnswers };
        return { ...base, ...sq }; // Default fallback
    });

    formData.append("subQuestions", JSON.stringify(processed));

    if (imageFile) formData.append("image", imageFile);
    if (removeImage && currentImage) formData.append("removeImage", "true");

    try {
      await apiFetch(`/admin/questions/reading/reading-questions/${id}`, {
        method: "PUT",
        body: formData,
      });

      alert("Updated successfully!");
      router.push("/admin/skills/reading/questions");
    } catch (err: any) {
      setError(err.message || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-600">Loading Passage...</p>
        </div>
      </div>
    );
  }

  const displayImage = previewImage || (currentImage && !removeImage ? currentImage : null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Edit Reading Passage
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
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Metadata & Passage */}
            <div className="space-y-6 lg:col-span-1">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800">Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Passage Number</Label>
                            <Select
                                value={passageNumber}
                                onValueChange={(v) => setPassageNumber(v as any)}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Passage 1">Passage 1</SelectItem>
                                    <SelectItem value="Passage 2">Passage 2</SelectItem>
                                    <SelectItem value="Passage 3">Passage 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <Select
                                value={difficulty}
                                onValueChange={(v) => setDifficulty(v as any)}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                             <ImageIcon className="w-4 h-4" /> Image
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                         {displayImage && (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200">
                                <img
                                    src={displayImage}
                                    alt="Preview"
                                    className="w-full h-auto object-cover max-h-[300px]"
                                />
                                {currentImage && !previewImage && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2 h-8"
                                        onClick={() => {
                                            setRemoveImage(true);
                                            setImageFile(null);
                                            setPreviewImage(null);
                                        }}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                                    </Button>
                                )}
                            </div>
                        )}
                        <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setImageFile(file);
                                    setRemoveImage(false);
                                }
                            }}
                            className="cursor-pointer bg-white" 
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800">Passage Content</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 p-0">
                        <Textarea
                            rows={20}
                            value={passage}
                            onChange={(e) => setPassage(e.target.value)}
                            placeholder="Paste your reading passage here..."
                            className="text-base font-serif leading-relaxed border-0 focus-visible:ring-0 resize-none p-4 min-h-[500px]"
                            required
                        />
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN: Questions */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row justify-between items-center">
                        <CardTitle className="text-lg font-medium text-slate-800">
                            Questions ({subQuestions.length})
                        </CardTitle>
                        
                        <div className="flex gap-2">
                            <Select onValueChange={(v) => addSubQuestion(v as QuestionType)}>
                                <SelectTrigger className="w-[200px] h-9 bg-white">
                                    <Plus className="w-4 h-4 mr-2" /> Add Question Type
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                    <SelectItem value="true_false_not_given">True/False/Not Given</SelectItem>
                                    <SelectItem value="yes_no_not_given">Yes/No/Not Given</SelectItem>
                                    <SelectItem value="sentence_completion">Sentence Completion</SelectItem>
                                    <SelectItem value="summary_completion">Summary Completion</SelectItem>
                                    <SelectItem value="diagram_label_completion">Diagram Label Label</SelectItem>
                                    <SelectItem value="matching_headings">Matching Headings</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        {subQuestions.map((sq, i) => (
                            <div key={i} className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 relative hover:border-slate-300 transition-colors">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 bg-white border-slate-200 text-slate-600">
                                            {sq.type?.replace(/_/g, " ").toUpperCase()}
                                        </Badge>
                                        <span className="text-sm font-medium text-slate-400">Question {i + 1}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-400 hover:text-red-500 h-8 w-8"
                                        onClick={() => removeSubQuestion(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {/* Allow changing type on the fly */}
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <Label className="text-xs text-slate-500 font-semibold uppercase">Question / Statement</Label>
                                            <Textarea
                                                placeholder="Enter the question text or statement here..."
                                                value={sq.question}
                                                onChange={(e) => updateSubQuestion(i, "question", e.target.value)}
                                                rows={2}
                                                className="bg-white resize-none"
                                            />
                                        </div>
                                        <div className="w-[200px] space-y-1.5">
                                             <Label className="text-xs text-slate-500 font-semibold uppercase">Type</Label>
                                             <Select 
                                                value={sq.type} 
                                                onValueChange={(v: QuestionType) => updateSubQuestion(i, "type", v)}
                                             >
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                                    <SelectItem value="true_false_not_given">True/False/Not Given</SelectItem>
                                                    <SelectItem value="yes_no_not_given">Yes/No/Not Given</SelectItem>
                                                    <SelectItem value="sentence_completion">Sentence Completion</SelectItem>
                                                    <SelectItem value="summary_completion">Summary Completion</SelectItem>
                                                    <SelectItem value="diagram_label_completion">Diagram Label</SelectItem>
                                                    <SelectItem value="matching_headings">Matching Headings</SelectItem>
                                                </SelectContent>
                                             </Select>
                                        </div>
                                    </div>

                                    {/* Multiple Choice */}
                                    {sq.type === "multiple_choice" && (
                                        <div className="space-y-4 pt-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {["A", "B", "C", "D"].map((l, idx) => (
                                                    <div key={l} className="space-y-1">
                                                        <Label className="text-xs text-slate-500">Option {l}</Label>
                                                        <Input
                                                            placeholder={`Option ${l}`}
                                                            value={sq.options?.[idx] || ""}
                                                            onChange={(e) => updateOption(i, idx, e.target.value)}
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-slate-500">Correct Answer</Label>
                                                <Select
                                                    value={sq.correctAnswer || "A"}
                                                    onValueChange={(v) => updateSubQuestion(i, "correctAnswer", v)}>
                                                    <SelectTrigger className="w-[180px] bg-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {["A", "B", "C", "D"].map((x) => (
                                                            <SelectItem key={x} value={x}>{x}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}

                                    {/* True/False/Not Given & Yes/No/Not Given */}
                                    {(sq.type === "true_false_not_given" || sq.type === "yes_no_not_given") && (
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs text-slate-500">Correct Answer</Label>
                                            <div className="flex gap-2">
                                                 {(sq.type === "true_false_not_given"
                                                        ? ["True", "False", "Not Given"]
                                                        : ["Yes", "No", "Not Given"]
                                                    ).map((opt) => {
                                                        const isSelected = sq.correctAnswers?.includes(opt);
                                                        return (
                                                             <Button
                                                                key={opt}
                                                                type="button"
                                                                variant={isSelected ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => updateSubQuestion(i, "correctAnswers", [opt])}
                                                                className={isSelected ? "bg-blue-600 hover:bg-blue-700" : "bg-white"}
                                                             >
                                                                {opt}
                                                             </Button>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Completion Types */}
                                    {[
                                        "sentence_completion",
                                        "summary_completion",
                                        "diagram_label_completion",
                                    ].includes(sq.type) && (
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs text-slate-500">Correct Answers (press + to add alternative answers)</Label>
                                            <Textarea
                                                rows={4}
                                                value={(sq.correctAnswers || []).join("\n")}
                                                onChange={(e) => {
                                                    updateSubQuestion(i, "correctAnswers", e.target.value.split("\n"));
                                                }}
                                                className="font-mono bg-white"
                                                placeholder="Answer 1&#10;Answer 2"
                                            />
                                            <p className="text-[10px] text-slate-400">Put each correct answer on a new line.</p>
                                        </div>
                                    )}

                                    {/* Matching Headings */}
                                    {sq.type === "matching_headings" && (
                                         <div className="space-y-4 pt-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-slate-500">List of Headings</Label>
                                                <Textarea
                                                    rows={6}
                                                    value={(sq.headings || []).join("\n")}
                                                    onChange={(e) => updateSubQuestion(i, "headings", e.target.value.split("\n"))}
                                                    placeholder="i. History&#10;ii. Future..."
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-slate-500">Correct Matches (e.g. i, iv, v)</Label>
                                                <Input
                                                    value={(sq.correctAnswers || []).join(", ")}
                                                    onChange={(e) => updateSubQuestion(i, "correctAnswers", e.target.value.split(",").map(s => s.trim()))}
                                                    placeholder="i, iv, v"
                                                    className="bg-white"
                                                />
                                            </div>
                                         </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800">Explanation</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 p-0">
                        <Textarea
                            rows={6}
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Provide a detailed explanation for the answers..."
                            className="border-0 focus-visible:ring-0 resize-none p-4"
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4 pb-20">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 min-w-[200px]"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 w-5 h-5 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 w-5 h-5" /> Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}
