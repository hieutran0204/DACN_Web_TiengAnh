"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Edit2, Eye, FileText, CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";

interface Exam {
  _id: string;
  title: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  questionCount: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
  };
  totalAttempts?: number;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/admin/exam"); // Use admin route
      if (res && res.success && Array.isArray(res.data)) {
        setExams(res.data);
      } else if (Array.isArray(res)) {
         setExams(res);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load exams",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      const res = await apiFetch(`/admin/exam/${id}`, { method: "DELETE" });
      if (res.success) {
        toast({ title: "Exam deleted" });
        fetchExams();
      } else {
        toast({ variant: "destructive", title: "Failed", description: res.message });
      }
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete exam" });
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
      try {
          const res = await apiFetch(`/admin/exam/${id}/publish`, { 
              method: "PATCH",
              body: JSON.stringify({ isPublished: !currentStatus }) 
          });
          
          if (res.success) {
               toast({ title: `Exam ${!currentStatus ? "published" : "unpublished"}` });
               fetchExams();
          }
      } catch (e) {
          toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
      }
  }

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Exam Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create, edit, and manage examination papers.</p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20">
          <Link href="/admin/exams/new">
            <Plus className="w-4 h-4 mr-2" /> Create New Exam
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <CardContent className="p-6">
          {/* TOOLBAR */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search exams..." 
                className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 text-sm text-slate-500">
                <span>Total: <span className="font-bold text-slate-700 dark:text-slate-300">{exams.length}</span></span>
            </div>
          </div>

          {/* TABLE */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300 pl-6">Title</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Composition</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Created</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                             <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                             Loading exams...
                        </div>
                    </TableCell>
                  </TableRow>
                ) : filteredExams.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                             <FileText className="w-8 h-8 opacity-20" />
                             No exams found.
                        </div>
                     </TableCell>
                  </TableRow>
                ) : (
                  filteredExams.map((exam) => (
                    <TableRow key={exam._id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 transition-colors">
                                {exam.title}
                            </span>
                             <span className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{exam.description || "No description"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex gap-2">
                            {exam.questionCount?.reading > 0 && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">R: {exam.questionCount.reading}</Badge>}
                            {exam.questionCount?.listening > 0 && <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">L: {exam.questionCount.listening}</Badge>}
                            {exam.questionCount?.writing > 0 && <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">W: {exam.questionCount.writing}</Badge>}
                            {exam.questionCount?.speaking > 0 && <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">S: {exam.questionCount.speaking}</Badge>}
                            {Object.values(exam.questionCount || {}).every(v => !v) && <span className="text-xs text-slate-400">Empty</span>}
                         </div>
                      </TableCell>
                      <TableCell>
                         <div 
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => togglePublish(exam._id, exam.isPublished)}
                         >
                            {exam.isPublished ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Published
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-slate-200">
                                    <XCircle className="w-3 h-3 mr-1" /> Draft
                                </Badge>
                            )}
                         </div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {exam.createdAt ? format(new Date(exam.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                             <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                <Link href={`/admin/exams/${exam._id}`}>
                                    <Edit2 className="w-4 h-4" />
                                </Link>
                             </Button>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(exam._id)}
                             >
                                <Trash2 className="w-4 h-4" />
                             </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
