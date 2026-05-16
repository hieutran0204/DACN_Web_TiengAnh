"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Headphones, Plus, Trash2, AlertCircle, ChevronLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiFetch } from "@/lib/api";

interface SubQuestion {
  question: string;
  correctAnswers: string[];
  options?: string[];
}

interface Segment {
  start: number;
  end: number;
  text: string;
}

export default function NewListeningQuestion() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [type, setType] = useState<string>("dictation");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [explanation, setExplanation] = useState("");

  // Fill / Note / Sentence
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState<string[]>([""]);

  // Multiple Choice & Matching
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    { question: "", correctAnswers: [], options: ["", "", "", ""] },
  ]);
  const [matchingOptions, setMatchingOptions] = useState<string[]>([
    "",
    "",
    "",
  ]);

  // Dictation
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addSubQuestion = () => {
    setSubQuestions([
      ...subQuestions,
      type === "multiple_choice"
        ? { question: "", correctAnswers: [], options: ["", "", "", ""] }
        : { question: "", correctAnswers: [""] },
    ]);
  };

  const removeSubQuestion = (index: number) => {
    if (subQuestions.length === 1) {
      setError("Phải có ít nhất 1 câu hỏi!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
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

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...subQuestions];
    if (!updated[qIndex].options) updated[qIndex].options = ["", "", "", ""];
    updated[qIndex].options![optIndex] = value;
    setSubQuestions(updated);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Chỉ chấp nhận file âm thanh!");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File quá lớn! Tối đa 50MB");
      return;
    }
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleAutoGenerate = async () => {
    if (!audioFile) {
      alert("Vui lòng chọn file audio trước!");
      return;
    }
    
    alert("Vui lòng LƯU câu hỏi trước, sau đó vào chế độ CHỈNH SỬA để dùng tính năng AI tạo Transcript!");
  };

  const validate = () => {
    if (!title.trim()) return "Tiêu đề không được để trống!";
    if (!section) return "Chọn Section!";
    if (!audioFile) return "Upload file audio!";

    if (type === "dictation") {
        if (segments.length === 0) return "Chưa có nội dung cho phần nghe chép!";
    } else if (
      ["fill_in_the_blank", "note_completion", "sentence_completion"].includes(
        type
      )
    ) {
      if (!questionText.trim()) return "Nhập đoạn văn/note có chỗ trống!";
      const validAnswers = answers.map((a) => a.trim()).filter(Boolean);
      if (validAnswers.length === 0) return "Phải có ít nhất 1 đáp án đúng!";
    } else {
      for (let i = 0; i < subQuestions.length; i++) {
        const sq = subQuestions[i];
        if (!sq.question.trim()) return `Câu ${i + 1}: Nội dung câu hỏi trống!`;
        if (type === "multiple_choice") {
          if (!sq.options?.every((o) => o.trim()))
            return `Câu ${i + 1}: Điền đủ 4 đáp án!`;
          if (!sq.correctAnswers[0]) return `Câu ${i + 1}: Chọn đáp án đúng!`;
        } else {
          if (sq.correctAnswers.filter(Boolean).length === 0)
            return `Câu ${i + 1}: Nhập đáp án đúng!`;
        }
      }
    }

    if (type === "matching" && matchingOptions.filter(Boolean).length < 3)
      return "Matching cần ít nhất 3 lựa chọn!";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const err = validate();
    if (err) {
      setError(err);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("section", section);
    formData.append("type", type);
    formData.append("transcript", transcript.trim());
    formData.append("explanation", explanation.trim());

    if (type === "dictation") {
       formData.append("segments", JSON.stringify(segments));
       formData.append("subQuestions", "[]");
    }
    else if (
      ["fill_in_the_blank", "note_completion", "sentence_completion"].includes(
        type
      )
    ) {
      formData.append(
        "subQuestions",
        JSON.stringify([
          {
            question: questionText.trim(),
            correctAnswers: answers.map((a) => a.trim()).filter(Boolean),
          },
        ])
      );
    } else {
      const cleaned = subQuestions.map((sq) => ({
        question: sq.question.trim(),
        correctAnswers:
          type === "multiple_choice"
            ? [sq.correctAnswers[0]]
            : sq.correctAnswers.map((a) => a.trim()).filter(Boolean),
        options: type === "multiple_choice" ? sq.options : undefined,
      }));
      formData.append("subQuestions", JSON.stringify(cleaned));
    }

    if (type === "matching") {
      formData.append(
        "matchingOptions",
        JSON.stringify(matchingOptions.map((o) => o.trim()).filter(Boolean))
      );
    }

    formData.append("audio", audioFile!);

    try {
      await apiFetch("/admin/questions/listening/listening-questions", {
        method: "POST",
        body: formData,
      });

      alert("TẠO CÂU HỎI THÀNH CÔNG!");
      router.push("/admin/skills/listening/questions");
    } catch (err: any) {
      setError(err.message || "Lỗi hệ thống!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Create Listening Question
          </h1>
          <p className="text-slate-500 mt-1">Design a new listening practice exercise.</p>
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
          {/* CỘT TRÁI */}
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-medium text-slate-800">Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cambridge 18 Test 1 - Section 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4"].map((s) => (
                        <SelectItem key={s} value={`Section ${s}`}>
                          Section {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => {
                      setType(v);
                      if (v === "dictation") setSegments([]);
                    }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dictation">⭐ Dictation</SelectItem>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="fill_in_the_blank">Fill in the Blank</SelectItem>
                      <SelectItem value="note_completion">Note Completion</SelectItem>
                      <SelectItem value="sentence_completion">Sentence Completion</SelectItem>
                      <SelectItem value="matching">Matching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center gap-2">
                <Headphones className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg font-medium text-slate-800">Audio Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                />
                {audioFile && (
                  <div className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                    <p className="font-medium text-slate-700 truncate">{audioFile.name}</p>
                    <p className="text-xs text-slate-400">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                {audioPreview && (
                  <audio controls className="w-full h-8">
                    <source src={audioPreview} />
                  </audio>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-2 space-y-8">
            {type === "dictation" && (
                <Card className="border-blue-200 shadow-md overflow-hidden">
                    <CardHeader className="bg-blue-50/50 border-b border-blue-100 py-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
                                Transcript Editor 
                            </CardTitle>
                            <Button 
                                type="button" 
                                onClick={handleAutoGenerate}
                                variant="secondary"
                                size="sm"
                                className="bg-white text-blue-700 hover:bg-blue-50 border border-blue-200"
                            >
                                ✨ Auto-Generate (AI)
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        {segments.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <p className="text-slate-500 mb-4">No segments yet. Enter manually or use AI.</p>
                                <Button type="button" onClick={() => setSegments([{start: 0, end: 0, text: ""}])} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" /> Add First Segment
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {segments.map((seg, idx) => (
                                    <div key={idx} className="flex gap-2 items-start group">
                                        <div className="flex flex-col gap-1 w-24 shrink-0">
                                            <Input 
                                                type="number" step="0.1" 
                                                value={seg.start} 
                                                onChange={e => {
                                                    const newSegs = [...segments];
                                                    newSegs[idx].start = parseFloat(e.target.value);
                                                    setSegments(newSegs);
                                                }}
                                                className="h-9 text-xs font-mono"
                                                placeholder="Start"
                                            />
                                            <Input 
                                                type="number" step="0.1" 
                                                value={seg.end} 
                                                onChange={e => {
                                                    const newSegs = [...segments];
                                                    newSegs[idx].end = parseFloat(e.target.value);
                                                    setSegments(newSegs);
                                                }}
                                                className="h-9 text-xs font-mono"
                                                placeholder="End"
                                            />
                                        </div>
                                        <Textarea 
                                            value={seg.text} 
                                            onChange={e => {
                                                const newSegs = [...segments];
                                                newSegs[idx].text = e.target.value;
                                                setSegments(newSegs);
                                            }}
                                            className="flex-1 min-h-[5rem]"
                                            rows={2}
                                            placeholder="Transcript text..."
                                        />
                                        <Button 
                                            variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setSegments(segments.filter((_, i) => i !== idx))}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => setSegments([...segments, {start: 0, end: 0, text: ""}])} className="w-full border-dashed">
                                    <Plus className="w-4 h-4 mr-2" /> Add Segment
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {[
              "fill_in_the_blank",
              "note_completion",
              "sentence_completion",
            ].includes(type) && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-medium">Question Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label className="text-base">Text / Note / Sentence</Label>
                    <Textarea
                      rows={10}
                      placeholder="Enter text with blanks, e.g.:\nThe library opens at ___ on weekdays.\nProtein comes from ___ and ___."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="font-mono text-base bg-slate-50"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      Correct Answers <span className="text-slate-400 font-normal text-sm ml-2">(In order of blanks)</span>
                    </Label>
                    <div className="space-y-3">
                      {answers.map((ans, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-center">
                          <span className="text-sm font-mono text-slate-400 w-6 text-right">{index + 1}.</span>
                          <Input
                            value={ans}
                            onChange={(e) => {
                              const updated = [...answers];
                              updated[index] = e.target.value;
                              setAnswers(updated);
                            }}
                            placeholder={`Answer for blank ${index + 1}`}
                          />
                          {answers.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-red-500"
                              onClick={() =>
                                setAnswers(
                                  answers.filter((_, i) => i !== index)
                                )
                              }>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAnswers([...answers, ""])}
                        className="ml-9 border-dashed"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Answer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {![
              "fill_in_the_blank",
              "note_completion",
              "sentence_completion",
              "dictation"
            ].includes(type) && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row justify-between items-center">
                  <CardTitle className="text-lg font-medium">
                    Questions ({subQuestions.length})
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubQuestion}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Question
                  </Button>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {subQuestions.map((sq, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-6 relative bg-slate-50/50">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-base font-bold text-slate-700">Question {i + 1}</h3>
                        {subQuestions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-500 h-8 w-8"
                            onClick={() => removeSubQuestion(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea
                          value={sq.question}
                          onChange={(e) =>
                            updateSubQuestion(i, "question", e.target.value)
                          }
                          rows={2}
                          className="bg-white"
                        />
                      </div>

                      {type === "multiple_choice" && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {["A", "B", "C", "D"].map((l, idx) => (
                              <div key={l}>
                                <Label className="text-xs text-slate-500 mb-1.5 block">Option {l}</Label>
                                <Input
                                  value={sq.options?.[idx] || ""}
                                  onChange={(e) =>
                                    updateOption(i, idx, e.target.value)
                                  }
                                  className="bg-white"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="mt-4">
                            <Label>Correct Answer</Label>
                            <Select
                              value={sq.correctAnswers[0] || ""}
                              onValueChange={(v) => {
                                const updated = [...subQuestions];
                                updated[i].correctAnswers = [v];
                                setSubQuestions(updated);
                              }}>
                              <SelectTrigger className="w-full md:w-48 bg-white mt-1">
                                <SelectValue placeholder="Select Answer" />
                              </SelectTrigger>
                              <SelectContent>
                                {["A", "B", "C", "D"].map((x) => (
                                  <SelectItem key={x} value={x}>
                                    Option {x}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {type === "matching" && (
                        <div className="mt-4">
                          <Label>Correct Answer Sequence (e.g. A, C)</Label>
                          <Input
                            value={sq.correctAnswers.join(", ")}
                            onChange={(e) => {
                              const vals = e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              const updated = [...subQuestions];
                              updated[i].correctAnswers = vals;
                              setSubQuestions(updated);
                            }}
                            placeholder="A, C"
                            className="bg-white mt-1"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {type === "matching" && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-medium">Matching Options (A, B, C...)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {matchingOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm border border-slate-200">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const updated = [...matchingOptions];
                          updated[idx] = e.target.value;
                          setMatchingOptions(updated);
                        }}
                        className="flex-1"
                      />
                      {matchingOptions.length > 3 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-500"
                          onClick={() =>
                            setMatchingOptions(
                              matchingOptions.filter((_, i) => i !== idx)
                            )
                          }>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-11 border-dashed"
                    onClick={() =>
                      setMatchingOptions([...matchingOptions, ""])
                    }>
                    <Plus className="w-4 h-4 mr-2" /> Add Option
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-medium">Full Transcript</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 p-0">
                  <Textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={8}
                    className="font-mono text-sm border-0 focus-visible:ring-0 resize-none p-4"
                    placeholder="Enter full transcript here..."
                  />
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-medium">Explanation</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 p-0">
                  <Textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    rows={8}
                    className="border-0 focus-visible:ring-0 resize-none p-4"
                    placeholder="Enter explanation/key notes..."
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-4 pt-6 pb-20">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 min-w-[200px]"
                disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Creating...
                    </>
                ) : (
                    "Create Question"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
