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
import { Headphones, Plus, Trash2, AlertCircle, Loader2, ChevronLeft } from "lucide-react";
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

export default function EditListeningQuestion() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // ===== TRẠNG THÁI CHÍNH =====
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [type, setType] = useState<string>(""); 
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [transcript, setTranscript] = useState("");
  const [explanation, setExplanation] = useState("");

  // Fill / Note / Sentence
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState<string[]>([""]);

  // Multiple Choice & Matching
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([]);
  const [matchingOptions, setMatchingOptions] = useState<string[]>([
    "",
    "",
    "",
  ]);

  // Dictation
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===== TẢI DỮ LIỆU – HOÀN HẢO 100% =====
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const json = await apiFetch(`/admin/questions/listening/listening-questions/${id}`);
        // apiFetch throws if !ok, returns json if ok
        
        const q = json.data;

        // GÁN THEO ĐÚNG THỨ TỰ – type phải gán TRƯỚC để form render đúng
        setType(q.type || "multiple_choice");
        setTitle(q.title || "");
        setSection(q.section || "");
        setCurrentAudioUrl(q.audio || "");
        setTranscript(q.transcript || "");
        setExplanation(q.explanation || "");

        // Gán Segments (nếu có)
        if (q.segments && Array.isArray(q.segments)) {
           setSegments(q.segments);
        }

        // XỬ LÝ SUBQUESTIONS
        if (q.subQuestions && q.subQuestions.length > 0) {
          const normalized = q.subQuestions.map((sq: any) => {
            const correctAns = sq.correctAnswer
              ? [sq.correctAnswer]
              : Array.isArray(sq.correctAnswers)
                ? sq.correctAnswers
                : [];

            return {
              question: sq.question || "",
              correctAnswers: correctAns,
              options: sq.options || ["", "", "", ""],
            };
          });

          if (
            [
              "fill_in_the_blank",
              "note_completion",
              "sentence_completion",
            ].includes(q.type)
          ) {
            setQuestionText(normalized[0]?.question || "");
            setAnswers(normalized[0]?.correctAnswers || [""]);
          } else {
            setSubQuestions(normalized);
          }
        }

        if (q.matchingOptions && q.matchingOptions.length > 0) {
          setMatchingOptions(q.matchingOptions);
        }
      } catch (err: any) {
        setError("Lỗi tải dữ liệu: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuestion();
  }, [id]);

  // ===== XỬ LÝ AUDIO MỚI =====
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
      // Reset generate status if audio changed
    }
  };

  // 🔥 AUTO GENERATE TRANSCRIPT (REAL)
  const handleAutoGenerate = async () => {
     if (!currentAudioUrl) {
         alert("Không tìm thấy audio trên server. Nếu bạn vừa upload file mới, hãy BẤM LƯU trước!");
         return;
     }

     if (!confirm("Hệ thống sẽ dùng AI để nghe và tạo transcript. Việc này tốn khoảng 10-30 giây. Tiếp tục?")) return;

     setIsGenerating(true);
     try {
         const urlObj = new URL(currentAudioUrl.startsWith('http') ? currentAudioUrl : `http://localhost${currentAudioUrl}`); // Basic fix for URL
         const relativePath = urlObj.pathname;

         const result = await apiFetch(`/admin/questions/listening/listening-questions/generate-transcript`, {
             method: "POST",
             body: JSON.stringify({ audioUrl: relativePath }),
         });

         setSegments(result.data);
         alert("Đã tạo lời thoại thành công! Hãy kiểm tra và chỉnh sửa nếu cần.");
     } catch (err: any) {
         alert("Lỗi AI: " + err.message);
     } finally {
         setIsGenerating(false);
     }
  };

  // 🔥 AUTO GENERATE FULL TRANSCRIPT (TEXT)
  const handleAutoGenerateFullTranscript = async () => {
    if (!currentAudioUrl) {
      alert("Không tìm thấy audio trên server. Hãy lưu file audio trước khi dùng AI!");
      return;
    }

    if (!confirm("AI sẽ nghe và tạo transcript tự động. Sẽ mất khoảng 10-20 giây. Tiếp tục?")) return;

    setIsGenerating(true);
    try {
      const urlObj = new URL(currentAudioUrl.startsWith('http') ? currentAudioUrl : `http://localhost${currentAudioUrl}`);
      const relativePath = urlObj.pathname;

      const result = await apiFetch(`/admin/questions/listening/listening-questions/generate-transcript`, {
        method: "POST",
        body: JSON.stringify({ audioUrl: relativePath }),
      });

      // Convert segments to full text
      if (Array.isArray(result.data)) {
        const fullText = result.data.map((s: any) => s.text).join(" ");
        setTranscript(fullText);
        alert("Đã tạo Transcript thành công!");
      }

    } catch (err: any) {
      alert("Lỗi AI: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ===== THÊM CÂU HỎI CON (Multiple Choice) =====
  const addSubQuestion = () => {
    setSubQuestions([
      ...subQuestions,
      { question: "", correctAnswers: [], options: ["", "", "", ""] },
    ]);
  };

  const removeSubQuestion = (index: number) => {
    if (subQuestions.length === 1) return;
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
  };

  // ===== LƯU THAY ĐỔI =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("section", section);
    formData.append("type", type);
    formData.append("transcript", transcript);
    formData.append("explanation", explanation);

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
            question: questionText,
            correctAnswers: answers.map((a) => a.trim()).filter(Boolean),
          },
        ])
      );
    } else {
      const cleaned = subQuestions.map((sq) => ({
        question: sq.question.trim(),
        correctAnswers: sq.correctAnswers,
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

    if (audioFile) formData.append("audio", audioFile);

    try {
      await apiFetch(`/admin/questions/listening/listening-questions/${id}`, {
        method: "PUT",
        body: formData,
      });

      alert("Cập nhật thành công!");
      router.push("/admin/skills/listening/questions");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-600">Loading Question Details...</p>
        </div>
      </div>
    );
  }

  const audioSrc = audioPreview || (
    currentAudioUrl 
        ? (currentAudioUrl.startsWith('http') ? currentAudioUrl : `${process.env.NEXT_PUBLIC_API_URL}${currentAudioUrl}`)
        : undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Edit Listening Question
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
                    placeholder="Cambridge 18 Test 1 - Section 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Input value={section} disabled className="bg-slate-50 text-slate-500" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    value={type.replace(/_/g, " ").toUpperCase()}
                    disabled
                    className="bg-slate-50 text-slate-500 font-medium"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center gap-2">
                <Headphones className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg font-medium text-slate-800">Audio Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {currentAudioUrl && !audioFile && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Current Audio</p>
                    <audio
                      controls
                      src={audioSrc}
                      className="w-full h-8"
                    />
                  </div>
                )}
                <div className="space-y-2">
                    <Label>Replace Audio</Label>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioChange}
                    />
                </div>
                {audioFile && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="font-medium text-green-700 text-sm mb-1">
                      New Audio: {audioFile.name}
                    </p>
                    <audio
                      controls
                      src={audioPreview!}
                      className="w-full h-8"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI – TỰ ĐỘNG CHUYỂN THEO TYPE */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* DICTATION - EDITOR UI */}
            {type === "dictation" && (
                <Card className="border-blue-200 shadow-md">
                    <CardHeader className="bg-blue-50/50 border-b border-blue-100 py-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
                                Transcript Editor {segments.length > 0 && `(${segments.length} segments)`}
                            </CardTitle>
                            <Button 
                                type="button" 
                                onClick={handleAutoGenerate}
                                disabled={isGenerating}
                                variant="secondary"
                                size="sm"
                                className="bg-white text-blue-700 hover:bg-blue-50 border border-blue-200"
                            >
                                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : "✨"}
                                {isGenerating ? "Listening..." : "Auto-Generate (AI)"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        {segments.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <p className="text-slate-500 mb-4">No content yet. Click Auto-Generate or add manually.</p>
                                <Button type="button" onClick={() => setSegments([{start: 0, end: 0, text: ""}])} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" /> Add Manually
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {segments.map((seg, idx) => (
                                    <div key={idx} className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg border border-slate-200 group hover:border-blue-300 transition-colors">
                                        <div className="text-slate-400 font-mono text-xs w-6 pt-2.5 text-center">{idx + 1}</div>
                                        <div className="flex flex-col gap-1 w-24 shrink-0">
                                            <Input 
                                                type="number" step="0.1" 
                                                value={seg.start} 
                                                onChange={e => {
                                                    const newSegs = [...segments];
                                                    newSegs[idx].start = parseFloat(e.target.value);
                                                    setSegments(newSegs);
                                                }}
                                                className="h-8 text-xs font-mono bg-white"
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
                                                className="h-8 text-xs font-mono bg-white"
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
                                            className="flex-1 min-h-[4.5rem] bg-white resize-y"
                                            rows={2}
                                        />
                                        <Button 
                                            variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                            onClick={() => setSegments(segments.filter((_, i) => i !== idx))}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => setSegments([...segments, {start: 0, end: 0, text: ""}])} className="w-full border-dashed mt-4">
                                    <Plus className="w-4 h-4 mr-2" /> Add Segment
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* FILL / NOTE / SENTENCE */}
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
                      rows={12}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="font-mono text-base bg-white"
                      placeholder="Input text with blanks..."
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      Correct Answers <span className="text-slate-400 font-normal text-sm ml-2">(In order)</span>
                    </Label>
                    <div className="space-y-3">
                      {answers.map((ans, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <span className="text-sm font-mono text-slate-400 w-6 text-right">{i + 1}.</span>
                          <Input
                            value={ans}
                            onChange={(e) => {
                              const updated = [...answers];
                              updated[i] = e.target.value;
                              setAnswers(updated);
                            }}
                            placeholder={`Answer ${i + 1}`}
                          />
                          {answers.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-red-500"
                              onClick={() =>
                                setAnswers(
                                  answers.filter((_, idx) => idx !== i)
                                )
                              }>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
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

            {/* MULTIPLE CHOICE */}
            {type === "multiple_choice" && (
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
                          onChange={(e) => {
                            const updated = [...subQuestions];
                            updated[i].question = e.target.value;
                            setSubQuestions(updated);
                          }}
                          rows={2}
                          className="bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {["A", "B", "C", "D"].map((letter, idx) => (
                          <div key={letter}>
                            <Label className="text-xs text-slate-500 mb-1.5 block">Option {letter}</Label>
                            <Input
                              value={sq.options?.[idx] || ""}
                              onChange={(e) => {
                                const updated = [...subQuestions];
                                if (!updated[i].options)
                                  updated[i].options = ["", "", "", ""];
                                updated[i].options![idx] = e.target.value;
                                setSubQuestions(updated);
                              }}
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
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* MATCHING */}
            {type === "matching" && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-medium">Matching Pairs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {subQuestions.map((sq, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <span className="font-bold text-lg w-8 text-slate-400">
                        {i + 1}.
                      </span>
                      <Textarea
                        value={sq.question}
                        onChange={(e) => {
                          const updated = [...subQuestions];
                          updated[i].question = e.target.value;
                          setSubQuestions(updated);
                        }}
                        rows={2}
                        className="flex-1 bg-white"
                      />
                      <Input
                        value={sq.correctAnswers.join(", ")}
                        onChange={(e) => {
                          const updated = [...subQuestions];
                          updated[i].correctAnswers = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setSubQuestions(updated);
                        }}
                        placeholder="Answer (e.g. A, C)"
                        className="w-40 bg-white"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* MATCHING OPTIONS UI */}
            {type === "matching" && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-medium">Matching Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {matchingOptions.map((opt, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const updated = [...matchingOptions];
                          updated[i] = e.target.value;
                          setMatchingOptions(updated);
                        }}
                        className="flex-1 bg-white"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* TRANSCRIPT & EXPLANATION */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">Transcript</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAutoGenerateFullTranscript}
                      disabled={isGenerating}
                      className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "✨"}
                      Auto-Gen Full Text
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 p-0">
                  <Textarea
                    rows={8}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="font-mono text-sm border-0 focus-visible:ring-0 resize-none p-4"
                    placeholder="Enter full transcript..."
                  />
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-medium">Explanation</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 p-0">
                  <Textarea
                    rows={8}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="border-0 focus-visible:ring-0 resize-none p-4"
                    placeholder="Enter explanation..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* NÚT LƯU */}
            <div className="flex justify-end gap-4 pt-6 pb-20">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 min-w-[200px]"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
