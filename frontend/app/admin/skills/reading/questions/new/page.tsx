"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  X,
  Loader2,
  Save,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type QuestionType =
  | "multiple_choice"
  | "true_false_not_given"
  | "yes_no_not_given"
  | "matching_headings"
  | "sentence_completion"
  | "summary_completion"
  | "diagram_label_completion";

type PassageNumber = "Passage 1" | "Passage 2" | "Passage 3";
type Difficulty = "easy" | "medium" | "hard";

interface SubQuestion {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  headings?: string[];
}

export default function NewReadingQuestion() {
  const router = useRouter();

  const [passageNumber, setPassageNumber] =
    useState<PassageNumber>("Passage 1");
  const [passage, setPassage] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [explanation, setExplanation] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    {
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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

  const updateSubQuestion = (
    index: number,
    field: keyof SubQuestion,
    value: any
  ) => {
    const updated = [...subQuestions];
    // @ts-ignore
    updated[index][field] = value;
    setSubQuestions(updated);
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...subQuestions];
    if (!updated[qIdx].options) updated[qIdx].options = ["", "", "", ""];
    updated[qIdx].options![optIdx] = value;
    setSubQuestions(updated);
  };

  const removeSubQuestion = (index: number) => {
    if (subQuestions.length === 1) return alert("Phải có ít nhất 1 câu hỏi!");
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage.trim()) return alert("Passage không được để trống!");
    if (!subQuestions.some((sq) => sq.question.trim()))
      return alert("Phải có ít nhất 1 câu hỏi hợp lệ!");

    setLoading(true);
    const formData = new FormData();
    formData.append("passageNumber", passageNumber);
    formData.append("passage", passage);
    formData.append("difficulty", difficulty);
    if (explanation.trim()) formData.append("explanation", explanation);
    if (imageFile) formData.append("image", imageFile);

    const processed = subQuestions
      .filter((sq) => sq.question.trim())
      .map((sq) => {
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
          return { ...base, headings: sq.headings?.filter(Boolean) };
        return base;
      });

    formData.append("subQuestions", JSON.stringify(processed));

    try {
      await apiFetch("/admin/questions/reading/reading-questions", {
        method: "POST",
        body: formData,
      });

      alert("Create Passage Success!");
      router.push("/admin/skills/reading/questions");
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Create New Reading Passage
          </h1>
          <p className="text-slate-500 mt-1">Add a new reading text and questions</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to List
        </Button>
      </div>

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
                             <ImageIcon className="w-4 h-4" /> Image (Optional)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <Input type="file" accept="image/*" onChange={handleImage} className="cursor-pointer" />
                        {imagePreview && (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-auto object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={() => {
                                        setImageFile(null);
                                        setImagePreview(null);
                                    }}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
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
                                    <SelectItem value="diagram_label_completion">Diagram Label Completion</SelectItem>
                                    <SelectItem value="matching_headings">Matching Headings</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        {subQuestions.map((sq, i) => (
                            <div key={i} className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 relative hover:border-slate-300 transition-colors">
                                <div className="flex justify-between items-center mb-4">
                                    <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 bg-white border-slate-200 text-slate-600">
                                        {sq.type.replace(/_/g, " ").toUpperCase()}
                                    </Badge>
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
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-slate-500 font-semibold uppercase">Question / Statement</Label>
                                        <Textarea
                                            placeholder="Enter the question text or statement here..."
                                            value={sq.question}
                                            onChange={(e) => updateSubQuestion(i, "question", e.target.value)}
                                            rows={2}
                                            className="bg-white resize-none"
                                        />
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
                                        <div className="space-y-1 w-[200px]">
                                            <Label className="text-xs text-slate-500">Correct Answer</Label>
                                            <Select
                                                value={sq.correctAnswers?.[0] || ""}
                                                onValueChange={(v) => updateSubQuestion(i, "correctAnswers", [v])}>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(sq.type === "true_false_not_given"
                                                        ? ["True", "False", "Not Given"]
                                                        : ["Yes", "No", "Not Given"]
                                                    ).map((x) => (
                                                        <SelectItem key={x} value={x}>{x}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Completion Types */}
                                    {[
                                        "sentence_completion",
                                        "summary_completion",
                                        "diagram_label_completion",
                                    ].includes(sq.type) && (
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-500">Correct Answers (press + to add alternative answers)</Label>
                                            {(sq.correctAnswers || []).map((ans, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <Input
                                                        value={ans}
                                                        onChange={(e) => {
                                                            const updated = [...subQuestions];
                                                            updated[i].correctAnswers![idx] = e.target.value;
                                                            setSubQuestions(updated);
                                                        }}
                                                        placeholder={`Answer ${idx + 1}`}
                                                        className="bg-white"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-400 hover:text-red-500"
                                                        onClick={() => {
                                                            const updated = [...subQuestions];
                                                            updated[i].correctAnswers = updated[i].correctAnswers!.filter((_, j) => j !== idx);
                                                            setSubQuestions(updated);
                                                        }}>
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="border-dashed mt-2"
                                                onClick={() => {
                                                    const updated = [...subQuestions];
                                                    updated[i].correctAnswers = [...(updated[i].correctAnswers || []), ""];
                                                    setSubQuestions(updated);
                                                }}>
                                                <Plus className="w-3 h-3 mr-2" /> Add Answer Variant
                                            </Button>
                                        </div>
                                    )}

                                    {/* Matching Headings - Placeholder if needed, simplified for now usually uses dropdowns or similar logic */}
                                    {sq.type === "matching_headings" && (
                                         <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded border border-amber-200">
                                            Note: For matching headings, ensure the question text helps identify the paragraph (e.g., "Paragraph A").
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
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 min-w-[200px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 w-5 h-5 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 w-5 h-5" /> Save Passage
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
