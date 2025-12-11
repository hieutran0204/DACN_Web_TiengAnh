"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Book, Trophy, Star, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

interface Category {
  _id: string
  name: string
  level: string
  wordCount: number
  image: string
  description: string
}

export default function VocabularyPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      // Try to fetch, if empty try to seed
      let res = await apiFetch("/user/vocabulary")
      if (res.data && res.data.length === 0) {
         await apiFetch("/user/vocabulary/seed", { method: "POST" })
         res = await apiFetch("/user/vocabulary")
      }
      setCategories(res.data)
    } catch (error) {
      console.error("Failed to fetch categories", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-700 border-green-200"
      case "intermediate": return "bg-blue-100 text-blue-700 border-blue-200"
      case "advanced": return "bg-purple-100 text-purple-700 border-purple-200"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Vocabulary Topics</h1>
            <p className="text-slate-500">Expand your word bank with curated topic lists.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
              ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat, index) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => router.push(`/vocabulary/${cat._id}`)}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {/* Placeholder icon if image fails or is empty, else img */}
                    {cat.image ? <img src={cat.image} className="w-8 h-8" alt={cat.name} /> : <Book className="text-blue-500" />}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(cat.level)}`}>
                    {cat.level}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2 truncate" title={cat.name}>{cat.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{cat.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center text-slate-400 text-sm">
                    <Trophy className="w-4 h-4 mr-1" />
                    <span>{cat.wordCount} words</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
