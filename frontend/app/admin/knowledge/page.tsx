"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Database, UploadCloud, BookOpen, Search, RefreshCw, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function KnowledgeIngestionPage() {
  // Mount state to fix hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  // Ingest State
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Ngữ pháp (Grammar)");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Explorer State
  const [explorerCategory, setExplorerCategory] = useState("Tất cả (All)");
  const [explorerData, setExplorerData] = useState<any[]>([]);
  const [explorerLoading, setExplorerLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const categories = [
    "Tất cả (All)",
    "Bài mẫu (Sample Essay)",
    "Ngữ pháp (Grammar)",
    "Từ vựng (Vocabulary)",
    "Thành ngữ (Idiom)",
    "Tiêu chí chấm điểm (Grading Rubric)",
    "Khác (Other)"
  ];

  const handleIngest = async () => {
    if (!text.trim()) {
      alert("Vui lòng nhập nội dung tri thức.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:5000/api/graph/ingest/master", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, category })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      setResult(data);
      alert(data.message || "Nạp tri thức thành công!");
      setText(""); 
      // Refresh explorer if on same category
      if (category === explorerCategory) fetchExistingKnowledge();
    } catch (err: any) {
      alert("Thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingKnowledge = async () => {
    setExplorerLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/graph/knowledge?category=${encodeURIComponent(explorerCategory)}`);
      const data = await res.json();
      setExplorerData(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setExplorerLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) fetchExistingKnowledge();
  }, [explorerCategory, isMounted]);

  if (!isMounted) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="text-purple-600" /> Hệ Thống Tri Thức GraphRAG
        </h1>
        <p className="text-slate-500 mt-2">
          Xây dựng và quản lý bộ khung kiến thức IELTS chuyên sâu để cung cấp dữ liệu cho AI chấm bài.
        </p>
      </div>

      <Tabs defaultValue="ingest" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-4">
          <TabsTrigger value="ingest" className="flex items-center gap-2">
            <UploadCloud size={16} /> Nạp Tri Thức
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-2" onClick={fetchExistingKnowledge}>
            <BookOpen size={16} /> Thư Viện Tri Thức
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingest">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-slate-200/60 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <UploadCloud size={20} /> Input Phân Loại
                </CardTitle>
                <CardDescription>
                  Hệ thống AI sẽ tự động trích xuất các quy tắc dựa trên loại tri thức bạn chọn.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phân loại kiến thức</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nội dung chi tiết</label>
                  <Textarea 
                    placeholder="Ví dụ: Passive voice là gì, các trường hợp sử dụng trong Task 1..."
                    className="min-h-[300px] resize-y p-4 text-base bg-white dark:bg-slate-950"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 p-4">
                <Button 
                    onClick={handleIngest} 
                    disabled={loading || !text.trim()} 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> AI đang trích xuất & gắn nhãn...
                    </>
                  ) : (
                    "Xử lý & Cấy vào GraphRAG"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col">
              <CardHeader>
                <CardTitle className="text-purple-600 flex items-center justify-between">
                  Kết Quả Vừa Nạp
                  {result && <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">{category}</Badge>}
                </CardTitle>
                <CardDescription>
                  Tóm tắt các bộ ba (triplets) AI đã học được từ văn bản trên.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
                {result ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg whitespace-pre-wrap text-sm border border-green-200 dark:border-green-800 italic">
                       <strong>AI Summary: </strong> {result.summary}
                    </div>
                    <div className="flex gap-4 mb-2">
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                         {result.chunksAdded} Vector Chunks
                      </div>
                      <div className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">
                         {result.tripletsAdded} Triplets
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {result.data?.map((t: any, i: number) => (
                        <li key={i} className="p-3 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700 text-xs flex flex-col gap-1">
                          <span className="font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-tighter opacity-70">[{t.subject.label}]</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t.subject.name}</span>
                          <div className="flex items-center gap-2 my-1">
                             <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-700" />
                             <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">{t.relationship}</span>
                             <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-700" />
                          </div>
                          <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-tighter opacity-70">[{t.object.label}]</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t.object.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-20">
                       <UploadCloud size={48} className="opacity-20 animate-pulse" />
                       <p className="text-sm font-medium">Dữ liệu sau khi xử lý sẽ hiện ở đây.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="explore">
          <Card className="shadow-lg border-slate-200/60 dark:border-slate-800 min-h-[600px]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-6 mb-6">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Search className="text-purple-600" size={24} /> Khám Phá Thư Viện
                </CardTitle>
                <CardDescription>
                  Xem danh sách các Thực thể (Entities) đã được đồng bộ hóa trong đồ thị tri thức.
                </CardDescription>
              </div>
              <div className="flex gap-4">
                <select 
                  className="w-64 h-10 rounded-md border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-purple-500"
                  value={explorerCategory}
                  onChange={(e) => setExplorerCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Button variant="outline" size="icon" onClick={fetchExistingKnowledge}>
                  <RefreshCw size={18} className={explorerLoading ? "animate-spin" : ""} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {explorerLoading ? (
                 <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                    <p className="text-slate-500 animate-pulse">Đang lục tìm trong Neo4j...</p>
                 </div>
              ) : explorerData.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {explorerData.map((item: any, idx: number) => (
                      <div key={idx} className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 transition-all shadow-sm hover:shadow-md flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <Badge className="bg-slate-100 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                            {item.category}
                          </Badge>
                          <Database size={14} className="text-slate-200" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-purple-500 font-bold uppercase tracking-tighter opacity-70">[{item.subject?.label || 'Concept'}]</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm italic">{item.subject?.name}</span>
                          </div>

                          {!item.isNodeOnly ? (
                            <>
                              <div className="flex items-center gap-2">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                                <span className="text-[9px] font-mono bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100 italic">
                                  {item.relationship}
                                </span>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                              </div>

                              <div className="flex flex-col">
                                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter opacity-70">[{item.object?.label}]</span>
                                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.object?.name}</span>
                              </div>
                            </>
                          ) : (
                            <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded text-[10px] text-slate-400 italic">
                               Thực thể đơn lẻ chưa có quan hệ.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-slate-400">
                  <Database size={64} className="opacity-10 mb-4" />
                  <p>Chưa có tri thức nào trong danh mục <strong>{explorerCategory}</strong></p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
