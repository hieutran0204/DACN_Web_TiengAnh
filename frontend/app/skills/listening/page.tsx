"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar"; // Updated import path based on context
import Footer from "@/components/footer"; // Updated import path based on context
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Loader2, PlayCircle, BookOpen } from "lucide-react";

interface Question {
  _id: string;
  title: string;
  section: string;
  type: string;
  createdAt: string;
}

export default function DictationListPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user-exposed listening questions
    fetch("http://localhost:3000/api/listening-questions", { // Using the new public route
        credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
            // Filter only dictation or show all? 
            // User said "converted to Dictation", but maybe show all?
            // Let's prioritze Dictation but show others if they exist, or just filtering 'dictation' might be safer 
            // if the player page ONLY supports dictation now. 
            // However, the player page I'm about to write will handle Dictation specifically.
            // Let's filter for 'dictation' to be safe and matching the user's request "Listening -> Dictation".
            const dictationOnly = data.data.filter((q: any) => q.type === 'dictation');
            setQuestions(dictationOnly.length > 0 ? dictationOnly : data.data); // Fallback to all if no dictation found (for testing)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-12 container mx-auto px-4 mt-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4 flex items-center justify-center gap-3">
                <Headphones className="w-10 h-10 text-blue-600" />
                Luyện Nghe Chép Chính Tả
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Phương pháp học tiếng Anh hiệu quả nhất. Nghe từng câu, chép lại và so sánh kết quả để cải thiện kỹ năng nghe và vốn từ vựng.
            </p>
        </div>

        {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        ) : questions.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-white">
                <p className="text-xl text-slate-400">Chưa có bài tập nào được đăng.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questions.map((q) => (
                    <Link href={`/skills/listening/test/${q._id}`} key={q._id} className="group">
                        <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-blue-300 group-hover:-translate-y-1">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant={q.type === 'dictation' ? "default" : "secondary"} className="uppercase">
                                        {q.type === 'dictation' ? 'Nghe Chép' : q.type.replace(/_/g, " ")}
                                    </Badge>
                                    <span className="text-xs font-mono text-slate-400">
                                        {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 line-clamp-2 min-h-[3.5rem]">
                                    {q.title}
                                </h3>
                                
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{q.section}</span>
                                </div>

                                <Button className="w-full group-hover:bg-blue-600 transition-colors">
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Luyện Tập Ngay
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
