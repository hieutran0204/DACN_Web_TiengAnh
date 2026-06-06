"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
  Share2,
  BarChart3,
  Loader2,
  Clock,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  BrainCircuit,
  MessageSquare,
  FileText,
  Lightbulb,
  ListChecks,
  SearchCode,
  Network
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { AIPipelineVisualizer } from "@/components/writing/AIPipelineVisualizer";

export default function WritingResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkedRecoms, setCheckedRecoms] = useState<number[]>([]);

  const toggleRecom = (idx: number) => {
    if (checkedRecoms.includes(idx)) {
      setCheckedRecoms(checkedRecoms.filter((i) => i !== idx));
    } else {
      setCheckedRecoms([...checkedRecoms, idx]);
    }
  };

  const fetchResult = async () => {
    try {
      const res = await apiFetch(`/user/writing-exam/submission/${id}`);
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.status !== "processing") {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch result:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchResult();
  }, [id]);

  useEffect(() => {
    if (result?.status === "processing") {
      const interval = setInterval(() => fetchResult(), 3000);
      return () => clearInterval(interval);
    }
  }, [result?.status]);

  if (loading && !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center max-w-sm">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy kết quả</h2>
          <p className="text-muted-foreground mb-6">Bài làm này có thể đã bị xóa hoặc đường dẫn không hợp lệ.</p>
          <Button asChild className="w-full">
            <Link href="/tests/writing">Quay lại danh sách bài tập</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (result.status === "processing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md p-8 text-center shadow-2xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-500">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BrainCircuit className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">AI Đang Chấm Bài...</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Hệ thống GraphRAG đang phân tích cấu trúc, ngữ pháp và sự logic trong bài viết của bạn.
          </p>

          <div className="mb-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <AIPipelineVisualizer currentStatus="processing" autoProgressing={true} />
          </div>

          <div className="space-y-4">
            <Progress value={45} className="h-2" />
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              <span>Đang trích xuất tri thức...</span>
              <span>Vui lòng không đóng trình duyệt</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const feedbackData = result.result;
  const questionInfo = result.question;
  const featureMap = result.feature_map || feedbackData?.feature_map;
  const justification = feedbackData?.evidence_based_justification_vn;

  const ScoreBadge = ({ title, score, colorClass }: any) => (
    <div className="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-slate-900 border shadow-sm transition-all hover:shadow-md">
      <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{title}</span>
      <div className={`text-3xl font-black ${colorClass}`}>{score}</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container max-w-6xl mx-auto h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/tests/writing">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="h-6 w-px bg-border hidden md:block" />
            <div>
              <h1 className="font-bold text-sm md:text-lg line-clamp-1">
                {questionInfo?.title || "IELTS Writing Result"}
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Badge variant="outline" className="text-[9px] h-4 uppercase">
                  {result.type || "Task 2"}
                </Badge>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{new Date(result.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2" asChild>
              <Link href="/tests/writing/history">
                <Clock className="w-4 h-4" /> Lịch sử
              </Link>
            </Button>
            <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
              <Share2 className="w-4 h-4" /> Chia sẻ
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* SCORE SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20 shadow-xl overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <CardContent className="p-8 flex flex-col items-center justify-center text-center relative z-10">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary/80 mb-2">Overall IELTS Band</h2>
              <div className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 drop-shadow-md">
                {feedbackData?.overall_band}
              </div>
              <Badge className="px-4 py-1 text-md font-bold bg-primary hover:bg-primary uppercase tracking-wider">
                {feedbackData?.overall_band >= 7.0 ? "Good User" : feedbackData?.overall_band >= 6.0 ? "Competent" : "Modest"}
              </Badge>
            </CardContent>
          </Card>

          <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreBadge title="Task Response" score={feedbackData?.band_breakdown?.task_response} colorClass="text-green-600" />
            <ScoreBadge title="Coherence" score={feedbackData?.band_breakdown?.coherence_cohesion} colorClass="text-purple-600" />
            <ScoreBadge title="Lexical" score={feedbackData?.band_breakdown?.lexical_resource} colorClass="text-amber-600" />
            <ScoreBadge title="Grammar" score={feedbackData?.band_breakdown?.grammatical_range_accuracy} colorClass="text-blue-600" />

            <Card className="col-span-2 lg:col-span-4 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Nhận xét tổng quát</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed text-sm">
                "{feedbackData?.feedback_vn}"
              </p>
            </Card>
          </div>
        </section>

        <Tabs defaultValue="analysis" className="w-full space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full h-auto p-1 bg-white dark:bg-slate-900 border">
            <TabsTrigger value="analysis" className="py-2 gap-2"><Zap className="w-4 h-4" /> Phân tích</TabsTrigger>
            <TabsTrigger value="rationale" className="py-2 gap-2"><Info className="w-4 h-4" /> Giải thích</TabsTrigger>
            <TabsTrigger value="vocab" className="py-2 gap-2"><BarChart3 className="w-4 h-4" /> Thống kê</TabsTrigger>
            <TabsTrigger value="improved" className="py-2 gap-2"><Sparkles className="w-4 h-4" /> Bản sửa</TabsTrigger>
            <TabsTrigger value="recom" className="py-2 gap-2"><Lightbulb className="w-4 h-4" /> Lời khuyên</TabsTrigger>
            <TabsTrigger value="rag" className="py-2 gap-2 text-[10px] uppercase font-bold"><BrainCircuit className="w-4 h-4" /> GraphRAG</TabsTrigger>
          </TabsList>

          {/* TAB: ANALYSIS */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle>Sentence Analysis</CardTitle>
                    <CardDescription>Phân tích chi tiết từng câu trong bài viết của bạn</CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    {feedbackData?.annotated_text?.length || 0} câu
                  </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {(feedbackData?.annotated_text || feedbackData?.detailed_errors)?.map((item: any, idx: number) => (
                      <div key={idx} className="group relative p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                        <div className="flex items-start gap-3">
                          <span className="text-[10px] font-mono text-muted-foreground bg-slate-100 dark:bg-slate-800 w-5 h-5 flex items-center justify-center rounded shrink-0 mt-1">
                            {idx + 1}
                          </span>
                          <div className="space-y-2 flex-1">
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                              {item.sentence}
                            </p>
                            {item.annotations?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.annotations.map((ann: any, aidx: number) => (
                                  <div key={aidx} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-2 rounded-lg text-xs space-y-1 w-full animate-in slide-in-from-top-1">
                                    <div className="flex items-center justify-between">
                                      <Badge variant="destructive" className="text-[9px] uppercase h-4">
                                        {ann.label || ann.type}
                                      </Badge>
                                      {ann.severity && (
                                        <span className={`text-[8px] font-bold uppercase ${ann.severity === 'major' ? 'text-red-500' : 'text-orange-500'}`}>
                                          {ann.severity}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex gap-1 items-baseline">
                                      <span className="font-semibold text-red-900 dark:text-red-400">Lỗi:</span>
                                      <span className="text-red-700 dark:text-red-300 line-through opacity-70 italic">
                                        {ann.span ? `"${ann.span}"` : "(Không xác định rõ vị trí từ sai)"}
                                      </span>
                                    </div>
                                    <div className="flex gap-1 items-baseline">
                                      <span className="font-semibold text-green-700 dark:text-green-400">Gợi ý:</span>
                                      <span className="text-green-800 dark:text-green-300 font-bold">{ann.suggestion || "(Gợi ý viết lại cấu trúc)"}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 border-t border-red-100 dark:border-red-900/20 pt-1">
                                      {ann.explanation_vn || "Lỗi về ngữ pháp/từ vựng cần điều chỉnh theo gợi ý để câu văn tự nhiên hơn."}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-green-100 bg-green-50/30 dark:bg-green-900/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Điểm mạnh
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feedbackData?.strengths?.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-green-800 dark:text-green-300">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 rounded-full h-5 w-5 p-0 flex items-center justify-center shrink-0">
                            {i+1}
                          </Badge>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-red-100 bg-red-50/30 dark:bg-red-900/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Cần cải thiện
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feedbackData?.weaknesses?.map((w: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-red-800 dark:text-red-300">
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 rounded-full h-5 w-5 p-0 flex items-center justify-center shrink-0">
                            {i+1}
                          </Badge>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB: RATIONALE */}
          <TabsContent value="rationale">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'task_response', label: 'Task Response', icon: <FileText className="w-4 h-4" />, color: 'border-l-green-500' },
                { id: 'coherence_cohesion', label: 'Coherence & Cohesion', icon: <Zap className="w-4 h-4" />, color: 'border-l-purple-500' },
                { id: 'lexical_resource', label: 'Lexical Resource', icon: <BookOpen className="w-4 h-4" />, color: 'border-l-amber-500' },
                { id: 'grammatical_range_accuracy', label: 'Grammar Accuracy', icon: <SearchCode className="w-4 h-4" />, color: 'border-l-blue-500' }
              ].map((crit) => (
                <Card key={crit.id} className={`border-l-4 ${crit.color} shadow-sm overflow-hidden`}>
                  <CardHeader className="pb-2 flex flex-row items-center gap-2 bg-slate-50 dark:bg-slate-900/50">
                    <div className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-muted-foreground">
                      {crit.icon}
                    </div>
                    <CardTitle className="text-sm">{crit.label}</CardTitle>
                    <Badge className="ml-auto bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      Band {feedbackData?.band_breakdown?.[crit.id]}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {justification?.[crit.id] || "Không có giải thích chi tiết."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB: VOCAB & STATS */}
          <TabsContent value="vocab" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" /> Advanced Vocabulary
                  </CardTitle>
                  <CardDescription>Các từ vựng C1/C2 bạn đã sử dụng</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedbackData?.advanced_vocabulary?.map((v: any, i: number) => (
                      <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">{v.word}</span>
                          <Badge variant="outline" className="text-[9px] h-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200">
                            {v.level}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{v.meaning_vn}</span>
                      </div>
                    ))}
                    {!feedbackData?.advanced_vocabulary?.length && (
                      <p className="text-center text-sm text-muted-foreground py-10">Chưa ghi nhận từ vựng nâng cao.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" /> Linguistic Metrics
                  </CardTitle>
                  <CardDescription>Các chỉ số thống kê về bài viết</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cấu trúc câu</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs mb-1"><span>Simple Sentences</span><span className="font-bold">{featureMap?.sentence_structure?.simple}</span></div>
                          <Progress value={(featureMap?.sentence_structure?.simple / featureMap?.sentence_structure?.total_sentences) * 100} className="h-1.5" />
                          
                          <div className="flex justify-between text-xs mb-1"><span>Compound Sentences</span><span className="font-bold">{featureMap?.sentence_structure?.compound}</span></div>
                          <Progress value={(featureMap?.sentence_structure?.compound / featureMap?.sentence_structure?.total_sentences) * 100} className="h-1.5" />
                          
                          <div className="flex justify-between text-xs mb-1"><span>Complex Sentences</span><span className="font-bold">{featureMap?.sentence_structure?.complex}</span></div>
                          <Progress value={(featureMap?.sentence_structure?.complex / featureMap?.sentence_structure?.total_sentences) * 100} className="h-1.5" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mật độ & Độ dài</h4>
                        <div className="grid grid-cols-1 gap-3">
                           {[
                             { label: 'Total Words', value: featureMap?.sentence_structure?.total_words, icon: <FileText className="w-3 h-3"/> },
                             { label: 'Linking Words', value: featureMap?.cohesion?.total_linking_words, icon: <Zap className="w-3 h-3"/> },
                             { label: 'Error Density', value: `${(featureMap?.grammar?.error_density * 100).toFixed(1)}%`, icon: <AlertTriangle className="w-3 h-3"/> },
                             { label: 'Paragraphs', value: featureMap?.sentence_structure?.paragraph_count, icon: <ListChecks className="w-3 h-3"/> }
                           ].map((stat, i) => (
                             <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-200">
                               <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                 {stat.icon} {stat.label}
                               </div>
                               <span className="text-sm font-black">{stat.value}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: IMPROVED */}
          <TabsContent value="improved">
            <Card className="border-t-4 border-t-indigo-500 shadow-xl overflow-hidden">
               <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/10">
                 <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                        <Sparkles className="w-6 h-6" /> Improved Version
                      </CardTitle>
                      <CardDescription>Bản viết lại lý tưởng do AI đề xuất dựa trên bài của bạn</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        navigator.clipboard.writeText(feedbackData?.corrected_essay);
                        alert("Đã copy bản sửa!");
                    }}>Copy</Button>
                 </div>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border font-serif text-lg leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line shadow-inner">
                    {feedbackData?.corrected_essay || "Đang cập nhật bản sửa..."}
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: RECOMMENDATIONS */}
          <TabsContent value="recom">
            <Card className="border-none bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-8">
               <div className="max-w-3xl mx-auto space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-400">Lộ trình cải thiện Band Score</h2>
                    <p className="text-amber-800/70 dark:text-amber-500/70">Những hành động cụ thể bạn cần thực hiện cho bài viết tiếp theo</p>
                  </div>

                  <div className="space-y-4">
                    {Array.isArray(feedbackData?.recommendations_vn) ? (
                      feedbackData.recommendations_vn.map((rec: any, idx: number) => {
                        const isChecked = checkedRecoms.includes(idx);
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleRecom(idx)}
                            className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                              isChecked
                                ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 shadow-inner"
                                : "bg-white dark:bg-slate-900 border-amber-100 dark:border-amber-900/30 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                            }`}
                          >
                            <div className="flex gap-4">
                              <div className="mt-1 shrink-0">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isChecked
                                      ? "bg-amber-500 border-amber-500 text-white"
                                      : "border-slate-300 dark:border-slate-600"
                                  }`}
                                >
                                  {isChecked && <CheckCircle className="w-4 h-4" />}
                                </div>
                              </div>
                              <div className={`space-y-3 flex-1 transition-opacity ${isChecked ? "opacity-60" : "opacity-100"}`}>
                                <div>
                                  <Badge className="mb-2 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
                                    {rec.focus || rec.focus_area || `Mục tiêu ${idx + 1}`}
                                  </Badge>
                                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                                    {rec.action || rec.actionable_step || rec}
                                  </h3>
                                </div>
                                {(rec.current_issue || rec.student_current_issue) && (
                                  <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20 text-sm">
                                    <span className="font-semibold text-red-800 dark:text-red-400 block mb-1">Thói quen hiện tại:</span>
                                    <span className="text-red-600 dark:text-red-300 italic">"{rec.current_issue || rec.student_current_issue}"</span>
                                  </div>
                                )}
                                {rec.expected_outcome && (
                                  <div className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400 mt-2">
                                    <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p><span className="font-semibold">Kết quả mong đợi:</span> {rec.expected_outcome}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/30">
                        <p className="text-lg leading-loose text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {feedbackData?.recommendations_vn || "Chưa có lời khuyên cụ thể."}
                        </p>
                      </div>
                    )}
                  </div>
               </div>
            </Card>
          </TabsContent>

          {/* TAB: RAG DEBUG */}
          <TabsContent value="rag" className="space-y-6">
            <Card className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
               <div className="flex flex-col items-center text-center mb-8">
                  <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">GraphRAG Processing View</Badge>
                  <h3 className="text-xl font-bold">Lược đồ luồng xử lý thực tế</h3>
                  <p className="text-sm text-muted-foreground max-w-lg">Đây là các bước mà hệ thống AI đã thực hiện để đưa ra kết quả đánh giá cho bài viết này.</p>
               </div>
               <AIPipelineVisualizer currentStatus="done" />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle className="text-sm flex items-center gap-2 text-primary">
                     <BrainCircuit className="w-4 h-4" /> Knowledge Base Retrieved
                   </CardTitle>
                   <CardDescription>Các khối tri thức AI đã tham khảo để chấm bài này</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                       {result.rag_debug_info?.knowledge_base_chunks?.map((chunk: any, i: number) => (
                         <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border text-[10px] font-mono leading-relaxed relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1 bg-primary/10 text-primary rounded-bl">
                               Score: {chunk.score.toFixed(3)}
                            </div>
                            <div className="mt-2 text-slate-600 dark:text-slate-400">
                               {chunk.text}
                            </div>
                         </div>
                       ))}
                    </div>
                 </CardContent>
               </Card>

               <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2 text-indigo-500">
                        <HistoryIcon className="w-4 h-4" /> Student Memory
                      </CardTitle>
                      <CardDescription>Lịch sử các lỗi phổ biến của bạn trong quá khứ</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="flex flex-wrap gap-2">
                          {result.rag_debug_info?.student_memory?.past_errors?.map((err: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                               {err}
                            </Badge>
                          ))}
                       </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2 text-orange-500">
                        <Zap className="w-4 h-4" /> Hard Caps Applied
                      </CardTitle>
                      <CardDescription>Các giới hạn điểm nghiêm ngặt dựa trên quy tắc</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-2">
                          {Object.entries(result.hard_caps_applied || {}).map(([key, val]: any, i: number) => (
                            key !== 'reasons' && (
                              <div key={i} className="flex justify-between items-center text-xs">
                                <span className="capitalize">{key.replace('_', ' ')}</span>
                                <Badge variant={val < 9 ? "destructive" : "outline"}>{val}</Badge>
                              </div>
                            )
                          ))}
                       </div>
                    </CardContent>
                  </Card>
               </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* BOTTOM ACTION */}
        <div className="flex justify-center pt-10 border-t">
           <Button variant="outline" size="lg" className="rounded-full px-10" asChild>
             <Link href="/tests/writing">Luyện tập bài khác</Link>
           </Button>
        </div>
      </div>
    </main>
  );
}

function HistoryIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}
