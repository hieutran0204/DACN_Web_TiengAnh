"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Book, Trophy, ArrowRight, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { Input } from "@/components/ui/input"

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
    <div className="min-h-screen bg-background relative overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-20">
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                <span>Vocabulary Builder</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
                Vocabulary{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                  Topics
                </span>
              </h1>
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md mx-auto mb-16 relative"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search topics..."
                className="pl-10 h-12 rounded-full border-gray-200 shadow-sm focus-visible:ring-emerald-500 bg-white/80 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Grid */}
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
                ))}
             </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredCategories.map((cat, index) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => router.push(`/vocabulary/${cat._id}`)}
                  className="bg-card hover:bg-card/80 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-border/50 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Book className="w-24 h-24 text-primary rotate-12" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                        {cat.image ? <img src={cat.image} className="w-8 h-8" alt={cat.name} /> : <Book className="text-primary w-7 h-7" />}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelColor(cat.level)}`}>
                        {cat.level}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-foreground mb-3 truncate group-hover:text-primary transition-colors" title={cat.name}>{cat.name}</h3>
                    <p className="text-muted-foreground mb-6 line-clamp-2 h-10 leading-relaxed">{cat.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center text-muted-foreground text-sm font-medium">
                        <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>{cat.wordCount} words</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
