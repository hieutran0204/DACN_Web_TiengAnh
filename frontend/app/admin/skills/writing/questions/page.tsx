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
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  FileText,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { PaginationControl } from "@/components/PaginationControl";
import { useToast } from "@/components/ui/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface WritingQuestion {
  _id: string;
  task: "Task 1" | "Task 2";
  type: string;
  topic: string;
  question: string;
  image?: string;
  sampleAnswer?: string;
  difficulty?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function WritingQuestionsList() {
  const [questions, setQuestions] = useState<WritingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearch) {
        setDebouncedSearch(searchTerm);
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchQuestions();
  }, [pagination.page, debouncedSearch]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: debouncedSearch,
      });

      const res = await apiFetch(`/admin/questions/writing?${queryParams.toString()}`);
      
      if (res.success && res.data) {
        setQuestions(res.data);
         if (res.total !== undefined) {
             setPagination({
                 page: res.page || 1,
                 limit: res.limit || 10,
                 total: res.total || 0,
                 totalPages: res.totalPages || 0
             });
         }
      } else {
         setQuestions([]);
      }
    } catch (err) {
      console.error("Lỗi fetch Writing:", err);
      toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load writing questions."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("XÓA THẬT HẢ? KHÔNG LẤY LẠI ĐƯỢC ĐÂU NHÉ!")) return;

    try {
      await apiFetch(`/admin/questions/writing/${id}`, {
        method: "DELETE",
      });

      toast({ title: "Đã xóa thành công!" });
      fetchQuestions(); // Reload to update list/pagination
    } catch (err) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa câu hỏi." });
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      bar_chart: "Bar Chart",
      line_graph: "Line Graph",
      pie_chart: "Pie Chart",
      table: "Table",
      process: "Process",
      map: "Map",
      opinion: "Opinion",
      discussion: "Discussion",
      problem_solution: "Problem & Solution",
      advantage_disadvantage: "Advantages/Disadvantages",
    };
    return map[type] || type.replace(/_/g, " ");
  };

  const getImageUrl = (imagePath?: string): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Writing Questions
            </h1>
            <p className="text-slate-500 mt-1">
              Manage writing tasks, charts, and essays
            </p>
          </div>
          <Button
            asChild
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm gap-2">
            <Link href="/admin/skills/writing/questions/new">
              <Plus className="w-4 h-4" /> New Question
            </Link>
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <Input 
                        placeholder="Search by topic, question, or type..." 
                        className="pl-9 bg-slate-50 border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                </div>
                <div className="text-sm text-slate-500">
                    Total: <span className="font-bold text-slate-800">{pagination.total}</span> questions
                </div>
            </div>
        </div>

        {loading ? (
             <div className="min-h-[400px] flex items-center justify-center bg-white rounded-xl border border-slate-200">
                <div className="text-center">
                    <FileText className="w-12 h-12 animate-pulse text-teal-600 mx-auto mb-4" />
                    <p className="text-xl font-medium text-slate-600">
                        Loading Questions...
                    </p>
                </div>
            </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
             <h3 className="text-lg font-medium text-slate-900">No questions found</h3>
            <p className="text-slate-500 mb-6">
                {debouncedSearch ? `No results for "${debouncedSearch}"` : "Create your first writing task to get started."}
            </p>
            {!debouncedSearch && (
                <Button asChild>
                <Link href="/admin/skills/writing/questions/new">
                    Create Question
                </Link>
                </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[50px] text-center font-semibold">
                    #
                  </TableHead>
                  <TableHead className="font-semibold">Task</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Topic</TableHead>
                  <TableHead className="text-center font-semibold">
                    Preview
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Sample
                  </TableHead>
                  <TableHead className="text-right font-semibold pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q, i) => (
                  <TableRow
                    key={q._id}
                    className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-center font-medium text-slate-600">
                      {(pagination.page - 1) * pagination.limit + i + 1}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={q.task === "Task 1" ? "default" : "secondary"}
                        className={`${
                          q.task === "Task 1" 
                            ? "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200" 
                            : "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                        } border shadow-none font-medium`}>
                        {q.task}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium text-sm">
                      {getTypeLabel(q.type)}
                    </TableCell>
                    <TableCell className="max-w-xs text-slate-600 text-sm line-clamp-2" title={q.topic}>
                        {q.topic}
                    </TableCell>

                    {/* CỘT HÌNH ẢNH */}
                    <TableCell className="text-center">
                      {q.image ? (
                        <div className="relative group inline-block">
                          <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-white p-2 rounded-lg shadow-xl border border-slate-200 w-64">
                              <img
                                src={getImageUrl(q.image)}
                                alt="Preview"
                                className="w-full h-auto rounded-md bg-slate-50"
                              />
                            </div>
                            <div className="w-2 h-2 rotate-45 bg-white border-r border-b border-slate-200 absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white"></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {q.sampleAnswer ? (
                        <div className="flex justify-center">
                             <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                          <Link
                            href={`/admin/skills/writing/questions/detail/${q._id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50">
                          <Link
                            href={`/admin/skills/writing/questions/edit/${q._id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(q._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
             <div className="p-4 border-t border-slate-200">
                <PaginationControl 
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckCircleIcon({className}: {className?: string}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
    )
}
