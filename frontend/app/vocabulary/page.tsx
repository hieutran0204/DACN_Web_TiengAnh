"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Book, Trophy, ArrowRight, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

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
  const [activeLevel, setActiveLevel] = useState<string>("All")
  const [progressData, setProgressData] = useState<Record<string, number>>({})
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  // Load progress indicators for each category from localStorage
  useEffect(() => {
    if (categories.length > 0) {
      const progressMap: Record<string, number> = {}
      categories.forEach(cat => {
        const learned = JSON.parse(localStorage.getItem(`learned_words_${cat._id}`) || "[]")
        const percent = cat.wordCount > 0 ? Math.min(Math.round((learned.length / cat.wordCount) * 100), 100) : 0
        progressMap[cat._id] = percent
      })
      setProgressData(progressMap)
    }
  }, [categories])

  const fetchCategories = async () => {
    try {
      let res = await apiFetch("/user/vocabulary")
      if (res.data && res.data.length === 0) {
         await apiFetch("/user/vocabulary/seed", { method: "POST" })
         res = await apiFetch("/user/vocabulary")
      }
      setCategories(res.data || [])
    } catch (error) {
      console.error("Failed to fetch categories", error)
    } finally {
      setLoading(false)
    }
  }

  // Smart filter combinations
  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = activeLevel === "All" || c.level.toLowerCase() === activeLevel.toLowerCase()
    return matchesSearch && matchesLevel
  })

  // Thống kê tổng quan xịn mịn (Light Mode)
  const totalWordsInSystem = categories.reduce((acc, cat) => acc + cat.wordCount, 0)
  const totalWordsLearned = Object.keys(progressData).reduce((acc, catId) => {
    const cat = categories.find(c => c._id === catId)
    if (!cat) return acc
    const learnedCount = JSON.parse(localStorage.getItem(`learned_words_${catId}`) || "[]").length
    return acc + Math.min(learnedCount, cat.wordCount)
  }, 0)

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "intermediate": return "bg-sky-50 text-sky-700 border-sky-200"
      case "advanced": return "bg-purple-50 text-purple-700 border-purple-200"
      default: return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const levels = ["All", "Beginner", "Intermediate", "Advanced"]

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden pt-20 text-slate-800">
      {/* Dynamic Glowing Background (Luxury Aura in Light Mode) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse duration-[8s]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse duration-[10s] delay-2000" />
      </div>

      <div className="relative z-10 pt-10 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold mb-6 backdrop-blur-md shadow-sm">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-sm tracking-wide">Interactive Vocabulary Builder</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Lộ Trình{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600">
                  Từ Vựng
                </span>
              </h1>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
                Nâng cấp vốn từ vựng IELTS của bạn theo chủ đề học thuật chuyên sâu. Tích hợp Flashcard tương tác 3D và lưu trữ tiến độ thông minh.
              </p>
            </motion.div>
          </div>

          {/* Statistics Dashboard Widget (Wow Factor - Light Mode) */}
          {!loading && categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/30 backdrop-blur-xl"
            >
              <div className="text-center sm:border-r border-slate-100 py-2">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Tổng Số Topic</p>
                <p className="text-3xl font-black text-slate-800">{categories.length}</p>
              </div>
              <div className="text-center sm:border-r border-slate-100 py-2">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Từ Vựng Học Thuật</p>
                <p className="text-3xl font-black text-indigo-600">{totalWordsInSystem} từ</p>
              </div>
              <div className="text-center py-2">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Tiến Độ Của Bạn</p>
                <p className="text-3xl font-black text-emerald-600">
                  {totalWordsLearned} <span className="text-sm font-normal text-slate-400">/ {totalWordsInSystem} từ</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* Filters & Search Control Bar */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 max-w-5xl mx-auto">
            {/* Level Pill Filters */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-2 bg-slate-100 border border-slate-200/60 p-1.5 rounded-2xl backdrop-blur-md"
            >
              {levels.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setActiveLevel(lvl)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                    activeLevel === lvl 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </motion.div>

            {/* Premium Search Field */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full md:w-80 relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm chủ đề từ vựng..."
                className="pl-11 h-12 rounded-2xl border-slate-200 bg-white text-slate-850 placeholder-slate-400 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>

          {/* Grid Layout */}
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-72 bg-white border border-slate-100 rounded-3xl animate-pulse shadow-sm" />
                ))}
             </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.4 }}
                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredCategories.map((cat, index) => {
                  const percent = progressData[cat._id] || 0
                  return (
                    <motion.div
                      key={cat._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      whileHover={{ y: -10 }}
                      onClick={() => router.push(`/vocabulary/${cat._id}`)}
                      className="bg-white hover:bg-slate-50/50 rounded-3xl p-6 border border-slate-200/50 hover:border-slate-200 shadow-lg hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-[310px]"
                    >
                      {/* Glow Highlight Effect on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-indigo-50/0 to-indigo-50/0 group-hover:to-indigo-50/10 transition-all duration-500" />
                      
                      {/* Decorative Background Icon */}
                      <div className="absolute top-[-10px] right-[-10px] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300 pointer-events-none">
                         <Book className="w-36 h-36 text-indigo-600 rotate-12" />
                      </div>

                      <div className="relative z-10">
                        {/* Upper row: Icon & Level Badge */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                            {cat.image ? (
                              <img src={cat.image} className="w-8 h-8 object-contain" alt={cat.name} />
                            ) : (
                              <BookOpen className="text-indigo-600 w-6 h-6" />
                            )}
                          </div>
                          <Badge variant="outline" className={`px-3.5 py-1 rounded-full text-xs font-black tracking-wide border uppercase ${getLevelColor(cat.level)}`}>
                            {cat.level}
                          </Badge>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 truncate group-hover:text-indigo-600 transition-colors" title={cat.name}>
                          {cat.name}
                        </h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-1 leading-relaxed" title={cat.description || "Tìm hiểu các từ vựng học thuật quan trọng để nâng cao band điểm viết bài."}>
                          {cat.description || "Tìm hiểu các từ vựng học thuật quan trọng để nâng cao band điểm viết bài."}
                        </p>
                      </div>

                      {/* Lower row: Progress Bar & Word Count */}
                      <div className="relative z-10 pt-4 border-t border-slate-100 mt-auto">
                        {/* Real-time Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Tiến độ học
                            </span>
                            <span className="font-bold text-slate-700">{percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-slate-600 text-xs font-black tracking-wide uppercase">
                            <GraduationCap className="w-4 h-4 mr-1.5 text-indigo-600" />
                            <span>{cat.wordCount} Từ Vựng</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:scale-105 transition-all duration-300 shadow-sm">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Empty Search Result State */}
          {!loading && filteredCategories.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white border border-slate-100 shadow-sm rounded-3xl max-w-lg mx-auto"
            >
              <BookOpen className="w-16 h-16 text-slate-350 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Không Tìm Thấy Topic</h3>
              <p className="text-slate-500 text-sm">Hãy thử tìm kiếm với các từ khóa hoặc cấp độ khác nhé.</p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}

