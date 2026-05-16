"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, PenSquare, AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { PaginationControl } from "@/components/PaginationControl";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminListeningQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const router = useRouter();

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
    fetchQuestions();
  }, [pagination.page, debouncedSearch]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: debouncedSearch,
        populate: "section" // Keep this parameter
      });

      const data = await apiFetch(
        `/admin/questions/listening/listening-questions?${queryParams.toString()}`
      );

      if (data.success) {
          setQuestions(data.data || []);
          // Backend Listening now returns: { success: true, data, total, totalPages, page, limit }
          // Or just object with these props.
          if (data.totalPages !== undefined) {
             setPagination(prev => ({
                 ...prev,
                 total: data.total || 0,
                 totalPages: data.totalPages || 1,
                 page: data.page || prev.page,
                 limit: data.limit || prev.limit
             }));
          }
      } else {
        // Fallback for older format if any
         setQuestions(data.data || []);
      }

    } catch (err: any) {
      console.error("Lỗi fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("XÓA THẬT HẢ ? Không cứu được đâu đấy!")) return;

    try {
      await apiFetch(`/admin/questions/listening/listening-questions/${id}`, {
        method: "DELETE",
      });

      setQuestions((prev) => prev.filter((q) => q._id !== id));
      alert("XÓA THÀNH CÔNG!");
      fetchQuestions(); // Refresh pagination
    } catch (err: any) {
      alert("Lỗi xóa: " + err.message);
    }
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xl font-medium text-slate-600 animate-pulse">
          Loading Listening Questions...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Listening Questions</h1>
            <p className="text-slate-500 mt-1">Manage your listening test database</p>
          </div>
          <Link href="/admin/skills/listening/questions/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
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
              placeholder="Search by title or section..."
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
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
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No questions found</h3>
            <p className="text-slate-500 mb-6">{searchTerm ? `No results for "${searchTerm}"` : "Create your first listening question to get started."}</p>
            {!searchTerm && (
                <Link href="/admin/skills/listening/questions/new">
                <Button>Create Question</Button>
                </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 w-[100px]">Section</th>
                    <th className="px-6 py-4 w-[150px]">Type</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4 w-[100px] text-center">Items</th>
                    <th className="px-6 py-4 w-[250px]">Preview</th>
                    <th className="px-6 py-4 w-[120px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {questions.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {q.section?.name || q.section || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="font-normal capitalize bg-slate-100 text-slate-600 hover:bg-slate-200">
                          {formatType(q.type)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 line-clamp-1">{q.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{q._id}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <Badge variant="outline" className="font-mono">
                            {q.type === 'dictation' ? q.segments?.length || 0 : q.subQuestions?.length || 0}
                         </Badge>
                      </td>
                      <td className="px-6 py-4">
                         {q.audio ? (
                            <audio controls className="h-8 w-48 opacity-80 hover:opacity-100 transition-opacity">
                                <source src={q.audio.startsWith('http') ? q.audio : `${BACKEND_URL}${q.audio}`} type="audio/mpeg" />
                            </audio>
                         ) : (
                            <span className="text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> No Audio
                            </span>
                         )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                            <Link href={`/admin/skills/listening/questions/edit/${q._id}`}>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                                    <PenSquare className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-slate-500 hover:text-red-600"
                                onClick={() => handleDelete(q._id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
