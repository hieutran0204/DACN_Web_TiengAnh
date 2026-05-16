"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Edit, Trash2, Image as ImageIcon, Mic, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { PaginationControl } from "@/components/PaginationControl";

interface SpeakingQuestion {
  _id: string;
  topic: string;
  type: string;
  question: string;
  subQuestions: string[];
  suggestedIdeas: string[];
  image?: string;
  difficulty: string;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SpeakingQuestionsList() {
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearch) {
        setDebouncedSearch(searchTerm);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [pagination.page, debouncedSearch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: debouncedSearch,
      });

      const res = await apiFetch(`/admin/questions/speaking?${queryParams.toString()}`);
      
      if (res.success) {
        setQuestions(res.data || []);
        if (res.total !== undefined) {
             setPagination(prev => ({
                 ...prev,
                 total: res.total || 0,
                 totalPages: res.totalPages || 1,
                 page: res.page || prev.page,
                 limit: res.limit || prev.limit
             }));
        }
      }
    } catch (err) {
      console.error("Lỗi fetch Speaking:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("XÓA THẬT HẢ KHÔNG LẤY LẠI ĐƯỢC ĐÂU NHÉ!")) return;

    try {
      await apiFetch(`/admin/questions/speaking/${id}`, {
        method: "DELETE",
      });

      setQuestions((prev) => prev.filter((q) => q._id !== id));
      alert("ĐÃ XÓA THÀNH CÔNG !!");
      fetchData(); // Refresh to update pagination
    } catch (err: any) {
      alert("LỖI: " + err.message);
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      personal_experience: "Personal Experience",
      descriptive: "Descriptive",
      comparative: "Comparative",
      opinion_based: "Opinion",
      cause_effect: "Cause & Effect",
      hypothetical: "Hypothetical",
      advantage_disadvantage: "Adv/Disadv",
      problem_solution: "Problem & Solution",
      prediction: "Prediction",
      abstract: "Abstract",
    };
    return map[type] || type.replace(/_/g, " ");
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Mic className="w-12 h-12 animate-pulse text-purple-600 mx-auto mb-4" />
          <p className="text-xl font-medium text-slate-600">Loading Speaking Questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
       <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Speaking Questions</h1>
            <p className="text-slate-500 mt-1">Manage your speaking test database</p>
          </div>
          <Link href="/admin/skills/speaking/questions/new">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm gap-2">
              <Plus className="w-4 h-4" />
              New Question
            </Button>
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by topic or question..."
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500">
             Total: <span className="font-bold text-slate-700">{pagination.total}</span>
          </div>
        </div>

        {questions.length === 0 && !loading ? (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No questions found</h3>
            <p className="text-slate-500 mb-6">{searchTerm ? `No results for "${searchTerm}"` : "Create your first speaking question to get started."}</p>
            {!searchTerm && (
                <Link href="/admin/skills/speaking/questions/new">
                <Button className="bg-purple-600">Create Question</Button>
                </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
             <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[50px] text-center font-semibold">#</TableHead>
                  <TableHead className="w-[150px] font-semibold">Topic</TableHead>
                  <TableHead className="font-semibold">Question</TableHead>
                  <TableHead className="w-[150px] font-semibold">Type</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold">Difficulty</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold">Sub-Questions</TableHead>
                  <TableHead className="w-[80px] text-center font-semibold">Image</TableHead>
                  <TableHead className="w-[120px] text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q, i) => (
                  <TableRow key={q._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-center font-medium text-slate-500">
                      {(pagination.page - 1) * pagination.limit + i + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {q.topic}
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2 text-sm text-slate-600">{q.question}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200">
                        {getTypeLabel(q.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge
                            className={`text-[10px] uppercase font-medium border-0 px-2 py-0.5 ${
                              q.difficulty === "hard"
                                ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                : q.difficulty === "easy"
                                ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                : "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                            }`}
                          >
                        {q.difficulty.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-xs font-mono text-slate-500">
                           {q.subQuestions.length > 0 ? q.subQuestions.length : "-"}
                       </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {q.image ? (
                        <div className="flex justify-center">
                             <ImageIcon className="w-4 h-4 text-slate-400" />
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                          <Link href={`/admin/skills/speaking/questions/detail/${q._id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                          <Link href={`/admin/skills/speaking/questions/edit/${q._id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-slate-500 hover:text-red-600"
                          onClick={() => handleDelete(q._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           </div>
            {/* Pagination */ }
            <div className="p-4 border-t border-slate-200">
                <PaginationControl
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
