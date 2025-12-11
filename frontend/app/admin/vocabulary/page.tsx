"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Book } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function AdminVocabularyPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await apiFetch("/user/vocabulary")
      setCategories(res.data)
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

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Vocabulary Topics</h1>
        <button 
          onClick={() => router.push("/admin/vocabulary/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" /> New Topic
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
             />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Level</th>
              <th className="p-4">Words</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cat => (
              <tr key={cat._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{cat.level}</span>
                </td>
                <td className="p-4 text-slate-500">{cat.wordCount} words</td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => router.push(`/admin/vocabulary/${cat._id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
