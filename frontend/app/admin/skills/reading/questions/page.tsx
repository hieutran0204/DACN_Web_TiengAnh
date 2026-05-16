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
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Search,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { PaginationControl } from "@/components/PaginationControl";

interface ReadingQuestion {
  _id: string;
  passageNumber: "Passage 1" | "Passage 2" | "Passage 3";
  passage: string;
  subQuestions: Array<{
    type?: string;
    question?: string;
  }>;
  image?: string;
  difficulty: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ReadingQuestionsList() {
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
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
      });

      const res = await apiFetch(
        `/admin/questions/reading/reading-questions?${queryParams.toString()}`
      );

      if (res.success) {
         // Backend returns { success: true, data: [...], pagination: {...} } OR old format
         // Based on my backend changes: Reading Controller returns { success, data, pagination: { total, page, limit, totalPages } }
         // Wait, checking Reading Controller again...
         // ReadingController:
         // res.json({ success: true, data: result.data, pagination: { total, ... } })
         
        if (res.data) {
          setQuestions(res.data);
        }
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error("Error fetching reading questions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa passage này thật hả?")) return;

    try {
      await apiFetch(`/admin/questions/reading/reading-questions/${id}`, {
        method: "DELETE",
      });

      setQuestions((prev) => prev.filter((q) => q._id !== id));
      alert("ĐÃ XÓA THÀNH CÔNG !!");
      // Could also refetch to update pagination counts, but this is fine for now
      fetchQuestions();
    } catch (err) {
      alert("Xóa thất bại rồi ...");
    }
  };

  const getQuestionTypeLabel = (type?: string) => {
    if (!type) return "Không xác định";

    const map: Record<string, string> = {
      multiple_choice: "Multiple Choice",
      true_false_not_given: "True/False/Not Given",
      yes_no_not_given: "Yes/No/Not Given",
      sentence_completion: "Sentence Completion",
      summary_completion: "Summary Completion",
      note_completion: "Note Completion",
      table_completion: "Table Completion",
      flow_chart_completion: "Flow Chart Completion",
      diagram_label_completion: "Diagram Label Completion",
      matching_headings: "Matching Headings",
      matching_features: "Matching Features",
      matching_information: "Matching Information",
    };

    return map[type] || type.replace(/_/g, " ").toUpperCase();
  };

  const getAllQuestionTypes = (subQuestions: any[] = []) => {
    const types = subQuestions
      .map((q) => q?.type)
      .filter(
        (type): type is string => typeof type === "string" && type.trim() !== ""
      );

    return [...new Set(types)];
  };

  const getPassagePreview = (passage: string = "") => {
    const clean = passage.replace(/\s+/g, " ").trim();
    if (!clean) return "Không có nội dung";
    const words = clean.split(" ");
    const preview = words.slice(0, 18).join(" ");
    return preview + (words.length > 18 ? "..." : "");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Reading Passages
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your reading test database
            </p>
          </div>
          <Link href="/admin/skills/reading/questions/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
              <Plus className="w-4 h-4" />
              New Passage
            </Button>
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search passages..."
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500">
             Total: <span className="font-bold text-slate-700">{pagination.total}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <BookOpen className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-4" />
              <p className="text-xl font-medium text-slate-600">
                Loading Reading Passages...
              </p>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No passages found
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? `No results for "${searchTerm}"` : "Create your first reading passage to get started."}
            </p>
            {!searchTerm && (
                <Link href="/admin/skills/reading/questions/new">
                <Button>Create Passage</Button>
                </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[50px] text-center font-semibold">
                      #
                    </TableHead>
                    <TableHead className="font-semibold">Passage</TableHead>
                    <TableHead className="w-[200px] font-semibold">
                      Question Types
                    </TableHead>
                    <TableHead className="w-[100px] text-center font-semibold">
                      Items
                    </TableHead>
                    <TableHead className="w-[120px] text-center font-semibold">
                      Difficulty
                    </TableHead>
                    <TableHead className="w-[80px] text-center font-semibold">
                      Image
                    </TableHead>
                    <TableHead className="w-[150px] text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((q, index) => {
                    const types = getAllQuestionTypes(q.subQuestions);

                    return (
                      <TableRow
                        key={q._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="text-center font-medium text-slate-500">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-slate-900 mb-1">
                            {q.passageNumber}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 max-w-md">
                            {getPassagePreview(q.passage)}
                          </p>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {types.length === 0 ? (
                              <span className="text-xs text-slate-400 italic">
                                No questions
                              </span>
                            ) : (
                              types.map((type) => (
                                <Badge
                                  key={type}
                                  variant="secondary"
                                  className="text-[10px] font-normal px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                                >
                                  {getQuestionTypeLabel(type)}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {q.subQuestions?.length || 0}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            className={`text-[10px] uppercase font-medium border-0 ${
                              q.difficulty === "hard"
                                ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                : q.difficulty === "easy"
                                ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                : "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                            }`}
                          >
                            {q.difficulty || "medium"}
                          </Badge>
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
                            <Button
                              asChild
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-500 hover:text-blue-600"
                            >
                              <Link
                                href={`/admin/skills/reading/questions/detail/${q._id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              asChild
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-500 hover:text-blue-600"
                            >
                              <Link
                                href={`/admin/skills/reading/questions/edit/${q._id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-500 hover:text-red-600"
                              onClick={() => handleDelete(q._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
             {/* PAGINATION */}
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
