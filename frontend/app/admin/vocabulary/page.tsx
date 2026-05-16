"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Book } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PaginationControl } from "@/components/PaginationControl"

interface Category {
  _id: string
  name: string
  level: string
  wordCount: number
}

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminVocabularyPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
        if (search !== debouncedSearch) {
             setDebouncedSearch(search);
             setPagination(prev => ({ ...prev, page: 1 }));
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData()
  }, [pagination.page, debouncedSearch])

  const fetchData = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: debouncedSearch,
      });

      const res = await apiFetch(`/user/vocabulary?${queryParams.toString()}`)
      
      if (res && res.data) {
        setCategories(res.data)
        if (res.pagination) {
            setPagination(res.pagination)
        }
      } else if (Array.isArray(res)) {
        setCategories(res)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await apiFetch(`/user/vocabulary/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      alert("Failed to delete")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Vocabulary Topics</h1>
            <p className="text-slate-500 mt-1">Manage vocabulary lists and levels</p>
          </div>
          <Button 
            onClick={() => router.push("/admin/vocabulary/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2"
          >
            <Plus className="w-4 h-4" /> New Topic
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search topics..."
                        className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                    />
                </div>
                 <div className="text-sm text-slate-500 ml-4">
                    Total: <span className="font-bold text-slate-700">{pagination.total}</span>
                </div>
            </div>

            {/* Table */}
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="font-semibold px-6">Name</TableHead>
                        <TableHead className="font-semibold">Level</TableHead>
                        <TableHead className="font-semibold">Word Count</TableHead>
                        <TableHead className="font-semibold text-right px-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-40 text-center">
                                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                    <Book className="w-8 h-8 animate-pulse text-blue-200" />
                                    Loading...
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : categories.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Search className="w-8 h-8 opacity-20" />
                                    No topics found.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        categories.map(cat => (
                            <TableRow key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-6 font-medium text-slate-900">
                                    {cat.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 uppercase text-[10px] tracking-wide font-bold px-2 py-0.5">
                                        {cat.level}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 font-mono text-sm">
                                    {cat.wordCount} words
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={() => router.push(`/admin/vocabulary/${cat._id}`)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(cat._id)}
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
            
            <div className="p-4 border-t border-slate-100">
                 <PaginationControl 
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
            </div>
        </div>
      </div>
    </div>
  )
}
