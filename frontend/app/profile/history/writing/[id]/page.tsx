"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, ChevronRight, AlertTriangle, BookOpen, ThumbsUp, ThumbsDown, Lightbulb, Loader2, Activity, Zap, BrainCircuit, Network, FileText, Search, Scissors, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { AIPipelineVisualizer } from "@/components/writing/AIPipelineVisualizer";

export default function WritingHistoryDetail() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    
    apiFetch(`/user/history/writing/${params.id}`)
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy chi tiết writing:", err);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Không tìm thấy dữ liệu</h2>
        <Button onClick={() => router.push("/profile")}>Quay lại trang cá nhân</Button>
      </div>
    );
  }

  const renderFeedback = (submission: any) => {
    if (!submission || !submission.result) return <div className="text-center py-10 text-muted-foreground">Không có dữ liệu chấm điểm</div>;
    const { result, answer, question } = submission;
    const bd = result.band_breakdown || {};
    const fm = result.feature_map || {};

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Điểm thành phần */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="col-span-2 lg:col-span-1 border rounded-xl flex flex-col justify-center items-center p-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl">
             <div className="text-sm opacity-90 mb-1 font-medium text-center uppercase tracking-tighter">OVERALL BAND</div>
             <div className="text-6xl font-black">{result.overall_band}</div>
          </div>
          
          {[
            { label: "Task Response", val: bd.task_response || bd.task_achievement },
            { label: "Coherence & Cohesion", val: bd.coherence_cohesion },
            { label: "Lexical Resource", val: bd.lexical_resource },
            { label: "Grammar & Accuracy", val: bd.grammatical_range_accuracy }
          ].map((item, idx) => (
            <Card key={idx} className="border-muted bg-card shadow-sm hover:shadow-md transition-shadow">
               <CardContent className="p-4 flex flex-col justify-center items-center h-full">
                 <div className="text-[10px] text-muted-foreground text-center mb-2 uppercase tracking-widest font-bold">{item.label}</div>
                 <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{item.val || "-"}</div>
               </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="annotated">Soi lỗi chi tiết</TabsTrigger>
            <TabsTrigger value="grammar">Thống kê Ngữ pháp</TabsTrigger>
            <TabsTrigger value="vocabulary">Từ vựng & Vocabulary</TabsTrigger>
            <TabsTrigger value="corrected">Bài sửa mẫu</TabsTrigger>
            <TabsTrigger value="rag">GraphRAG</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Nhận xét tổng quát
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                      {result.feedback_vn}
                    </p>
                  </CardContent>
                </Card>

                {result.evidence_based_justification_vn && (
                  <Card className="border-blue-100 bg-blue-50/20 dark:bg-blue-950/10 dark:border-blue-900/30">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <CheckCircle2 className="w-5 h-5" />
                        Lý giải điểm số (Evidence-based)
                      </CardTitle>
                      <CardDescription>Tại sao bạn đạt được mức điểm này?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(result.evidence_based_justification_vn).map(([criteria, reason]: any) => (
                        <div key={criteria} className="space-y-1">
                          <h4 className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">{criteria.replace(/_/g, ' ')}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{reason}"</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* SCAFFOLDING SUGGESTIONS (REASONING LAYER) */}
                {result.scaffolding_suggestions && result.scaffolding_suggestions.length > 0 && (
                  <Card className="border-indigo-100 bg-indigo-50/10 dark:bg-indigo-950/10">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Tư duy lập luận (Reasoning & Scaffolding)
                      </CardTitle>
                      <CardDescription>Gợi ý nâng cấp tư duy từ chuyên gia</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.scaffolding_suggestions.map((sug: any, i: number) => (
                        <div key={i} className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-800 shadow-sm space-y-3">
                           <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Cách bạn viết</span>
                              <p className="text-sm line-through opacity-60 italic">{sug.original}</p>
                           </div>
                           <div className="space-y-1">
                              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Gợi ý nâng cấp</span>
                              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{sug.improved}</p>
                           </div>
                           <div className="pt-2 border-t border-indigo-50 dark:border-indigo-900">
                              <p className="text-xs text-slate-500 leading-relaxed">
                                 <strong className="text-indigo-600 dark:text-indigo-400">Tư duy:</strong> {sug.logic}
                              </p>
                           </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                 <Card>
                   <CardHeader className="pb-3 border-b">
                     <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600">
                       <ThumbsUp className="w-4 h-4" /> Điểm mạnh
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="pt-4 space-y-2">
                     {result.strengths?.map((s: string, i: number) => (
                       <div key={i} className="text-xs flex gap-2 items-start bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                         <span>{s}</span>
                       </div>
                     ))}
                   </CardContent>
                 </Card>

                 <Card>
                   <CardHeader className="pb-3 border-b">
                     <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
                       <ThumbsDown className="w-4 h-4" /> Cần cải thiện
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="pt-4 space-y-2">
                     {result.weaknesses?.map((w: string, i: number) => (
                       <div key={i} className="text-xs flex gap-2 items-start bg-red-50 dark:bg-red-900/20 p-2 rounded">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                         <span>{w}</span>
                       </div>
                     ))}
                   </CardContent>
                 </Card>
              </div>
            </div>
          </TabsContent>

          {/* ANNOTATED TEXT TAB */}
          <TabsContent value="annotated" className="mt-0 space-y-6">
             <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Phân tích lỗi sai từng câu</CardTitle>
                  <CardDescription>Di chuột vào các phần được đánh dấu để xem giải thích.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 leading-loose text-lg">
                      <div className="space-y-4">
                        {(result.annotated_text || result.detailed_errors)?.map((item: any, idx: number) => (
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
                        {(!result.annotated_text || result.annotated_text.length === 0) && (
                          <div className="text-center py-10">
                             <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                             <p className="text-muted-foreground italic">Dữ liệu phân tích chi tiết không khả dụng cho bài viết này (Dữ liệu cũ).</p>
                          </div>
                        )}
                      </div>
                   </div>
                </CardContent>
             </Card>

             {result.hard_caps_applied && Object.keys(result.hard_caps_applied).length > 0 && (
               <Card className="border-amber-200 bg-amber-50/30">
                  <CardContent className="pt-6 flex gap-4">
                     <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                     <div>
                        <h4 className="font-bold text-amber-800">Lưu ý về quy tắc chấm điểm (Hard Caps)</h4>
                        <p className="text-sm text-amber-700">Điểm số của bạn bị giới hạn trần do mắc các lỗi nghiêm trọng:</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                           {Object.entries(result.hard_caps_applied).map(([criterion, reason]: any) => (
                             <Badge key={criterion} variant="outline" className="bg-white border-amber-200 text-amber-700">
                                {criterion}: {reason}
                             </Badge>
                           ))}
                        </div>
                     </div>
                  </CardContent>
               </Card>
             )}
          </TabsContent>

          {/* GRAMMAR STATS TAB */}
          <TabsContent value="grammar" className="mt-0 space-y-6">
             {(!fm || Object.keys(fm).length === 0 || fm.sentence_count === 0) ? (
                <Card>
                  <CardContent className="py-20 text-center">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-bold">Không có thống kê chi tiết</h3>
                    <p className="text-muted-foreground italic">Tính năng này chỉ áp dụng cho các bài viết mới từ hệ thống GraphRAG v2.</p>
                  </CardContent>
                </Card>
             ) : (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                  { label: "Tổng số câu", val: fm.sentence_structure?.total_sentences || 0 },
                  { label: "Số lỗi ngữ pháp", val: fm.grammar?.total_errors || 0 },
                  { label: "Số câu phức/ghép", val: (fm.sentence_structure?.complex || 0) + (fm.sentence_structure?.compound || 0) },
                  { label: "Độ đa dạng (TTR)", val: fm.lexical_resource?.type_token_ratio ? (fm.lexical_resource.type_token_ratio * 100).toFixed(1) + "%" : "0%" }
                ].map((stat, i) => (
                      <Card key={i}>
                        <CardContent className="pt-6 text-center">
                           <div className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">{stat.label}</div>
                           <div className="text-2xl font-black mt-1">{stat.val}</div>
                        </CardContent>
                      </Card>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Cấu trúc câu sử dụng</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                     {Object.entries(fm.sentence_structure || {}).filter(([key]) => ["simple", "compound", "complex", "fragments"].includes(key)).map(([type, count]: any) => (
                       <div key={type} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium uppercase">
                            <span>{type} sentences</span>
                            <span>{count}</span>
                          </div>
                          <Progress value={(count / (fm.sentence_structure?.total_sentences || 1)) * 100} className="h-1.5" />
                       </div>
                     ))}
                  </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Phân bổ lỗi theo nhóm</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                     {Object.entries(fm.grammar?.severity_breakdown || {}).map(([type, count]: any) => (
                       <div key={type} className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400 capitalize">{type} errors</span>
                          <Badge variant="secondary">{count} lỗi</Badge>
                       </div>
                     ))}
                     {(!fm.grammar?.severity_breakdown || fm.grammar?.total_errors === 0) && (
                       <p className="text-sm text-muted-foreground italic text-center py-4">Chúc mừng! Không phát hiện lỗi ngữ pháp nào.</p>
                     )}
                  </CardContent>
                    </Card>
                 </div>
               </>
             )}
          </TabsContent>

          {/* VOCABULARY TAB */}
          <TabsContent value="vocabulary" className="mt-0 space-y-6">
             <Card>
               <CardHeader>
                 <CardTitle className="text-lg">Từ vựng nâng cao (Academic Vocabulary)</CardTitle>
                 <CardDescription>Những từ/cụm từ giúp bạn ghi điểm Lexical Resource.</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {result.advanced_vocabulary?.map((vocab: any, i: number) => (
                       <div key={i} className="p-4 border rounded-xl hover:border-primary/50 transition-colors bg-white dark:bg-slate-950">
                          <div className="flex justify-between items-start mb-2">
                             <span className="font-bold text-primary">{vocab.word}</span>
                             <Badge className="bg-purple-500">{vocab.level || "C1"}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground italic mb-2">"{vocab.context || vocab.meaning_vn}"</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Ý nghĩa: {vocab.meaning_vn || vocab.reason}</p>
                       </div>
                     ))}
                  </div>
                  {(!result.advanced_vocabulary || result.advanced_vocabulary.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground italic">
                      Không tìm thấy từ vựng học thuật nổi bật. Hãy cố gắng sử dụng nhiều từ C1/C2 hơn.
                    </div>
                  )}
               </CardContent>
             </Card>
          </TabsContent>

          {/* CORRECTED ESSAY TAB */}
          <TabsContent value="corrected" className="mt-0 space-y-6">
             <Card className="border-indigo-200 border-dashed bg-slate-50/50">
                <CardContent className="py-20 text-center space-y-4">
                   <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                      <Zap className="w-8 h-8 text-indigo-600 animate-pulse" />
                   </div>
                   <h3 className="text-xl font-bold text-indigo-900">Tính năng đang phát triển</h3>
                   <p className="text-muted-foreground max-w-sm mx-auto">
                      Chúng tôi đang hoàn thiện AI Model chuyên biệt để viết bài sửa mẫu (Sample Essay) đạt chuẩn Band 9.0 cho riêng bạn.
                   </p>
                   <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-white">
                      COMING SOON
                   </Badge>
                </CardContent>
             </Card>
          </TabsContent>

          {/* GRAPHRAG TAB */}
          <TabsContent value="rag" className="mt-0 space-y-6">
             <Card className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
                <div className="flex flex-col items-center text-center mb-8">
                   <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">GraphRAG Processing View</Badge>
                   <h3 className="text-xl font-bold">Lược đồ luồng xử lý (Pipeline)</h3>
                   <p className="text-sm text-muted-foreground max-w-lg">Minh họa các bước hệ thống AI đã thực hiện để phân tích bài viết này.</p>
                </div>
                <AIPipelineVisualizer currentStatus="done" />
             </Card>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                   <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                         <Network className="w-4 h-4 text-primary" /> Tham chiếu tri thức
                      </CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="space-y-3">
                         {result.rag_debug_info?.knowledge_base_chunks?.map((chunk: any, i: number) => (
                            <div key={i} className="p-3 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono leading-relaxed">
                               {chunk.text}
                            </div>
                         ))}
                         {(!result.rag_debug_info?.knowledge_base_chunks || result.rag_debug_info?.knowledge_base_chunks.length === 0) && (
                            <p className="text-xs text-muted-foreground italic">Không có dữ liệu tham chiếu bổ sung.</p>
                         )}
                      </div>
                   </CardContent>
                </Card>

                <Card>
                   <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                         <BrainCircuit className="w-4 h-4 text-indigo-500" /> Student Memory
                      </CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="flex flex-wrap gap-2">
                         {result.rag_debug_info?.student_memory?.past_errors?.map((err: string, i: number) => (
                            <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-100">
                               {err}
                            </Badge>
                         ))}
                         {(!result.rag_debug_info?.student_memory?.past_errors || result.rag_debug_info?.student_memory?.past_errors.length === 0) && (
                            <p className="text-xs text-muted-foreground italic">Chưa ghi nhận lịch sử lỗi liên quan.</p>
                         )}
                      </div>
                   </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top bar */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{data.exam?.title || "Bài Viết Tự Do"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Đã nộp vào: {new Date(data.submittedAt).toLocaleString("vi-VN")}
            </p>
          </div>
          <div className="ml-auto text-right">
             <div className="text-xs tracking-wider uppercase text-muted-foreground font-semibold mb-1">Total Band</div>
             <div className="text-3xl font-black text-primary">{data.result?.overall_band || 0}</div>
          </div>
        </div>

        <Separator />
        
        {renderFeedback(data)}
      </div>
    </div>
  );
}
