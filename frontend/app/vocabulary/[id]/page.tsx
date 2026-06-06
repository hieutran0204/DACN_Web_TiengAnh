"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Volume2, BookOpen, Loader2, Search, GraduationCap, CheckCircle2, Bookmark, BookmarkCheck, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface Category {
  _id: string
  name: string
  words: string[]
  level?: string
  description?: string
}

interface Definition {
  word: string
  phonetic?: string
  phonetics?: { text?: string, audio?: string }[]
  meanings: {
    partOfSpeech: string
    definitions: { 
        definition: string, 
        example?: string,
        synonyms?: string[],
        antonyms?: string[]
    }[]
    synonyms?: string[]
    antonyms?: string[]
  }[]
  license?: { name: string, url: string }
  sourceUrls?: string[]
  translation?: string
}

// Vietnamese Translation Helper dictionary for top-tier academic vocabulary used in IELTS
const VIETNAMESE_DICTIONARY: Record<string, { definition: string, translation: string, exampleTranslation: string }> = {
  automation: {
    translation: "sự tự động hóa",
    definition: "Việc sử dụng các thiết bị điều khiển tự động thay thế con người trong các quy trình sản xuất hoặc dịch vụ.",
    exampleTranslation: "Tự động hóa trong các nhà máy đã giúp cắt giảm đáng kể chi phí vận hành."
  },
  sustainability: {
    translation: "sự phát triển bền vững",
    definition: "Khả năng duy trì hoặc bảo tồn một quy trình hoặc tài nguyên trong dài hạn mà không gây tổn hại môi trường.",
    exampleTranslation: "Nông nghiệp bền vững là chìa khóa để bảo vệ an ninh lương thực toàn cầu."
  },
  inequality: {
    translation: "sự bất bình đẳng",
    definition: "Tình trạng không công bằng, khác biệt quá lớn về cơ hội, thu nhập hoặc quyền lợi giữa các nhóm xã hội.",
    exampleTranslation: "Bất bình đẳng thu nhập là một rào cản lớn đối với sự gắn kết xã hội."
  },
  displacement: {
    translation: "sự dịch chuyển / sự mất chỗ",
    definition: "Tình trạng con người hoặc đồ vật bị ép buộc phải rời khỏi vị trí cũ hoặc nơi cư trú của họ.",
    exampleTranslation: "Chiến tranh đã gây ra sự di tản quy mô lớn của hàng violent người tị nạn."
  },
  productivity: {
    translation: "năng suất",
    definition: "Hiệu suất sản xuất hoặc làm việc, đo lường bằng tỷ lệ đầu ra trên mỗi đơn vị đầu vào.",
    exampleTranslation: "Đầu tư vào công nghệ mới đã làm tăng đáng kể năng suất của công ty."
  },
  innovation: {
    translation: "sự đổi mới / sáng kiến",
    definition: "Việc áp dụng các ý tưởng, phương pháp hoặc thiết bị mới mang lại giá trị thực tiễn vượt trội.",
    exampleTranslation: "Đổi mới công nghệ là động cơ thúc đẩy sự phát triển của nền kinh tế hiện đại."
  },
  remuneration: {
    translation: "tiền thù lao / lương thưởng",
    definition: "Khoản thanh toán hoặc bồi thường cho công việc hoặc dịch vụ đã thực hiện.",
    exampleTranslation: "Họ đòi hỏi mức thù lao cao hơn tương xứng với trách nhiệm công việc."
  },
  inevitable: {
    translation: "không thể tránh khỏi / tất yếu",
    definition: "Chắc chắn sẽ xảy ra, không có cách nào ngăn cản hoặc né tránh được.",
    exampleTranslation: "Sự thay đổi là tất yếu trong một thị trường năng động."
  },
  comprehend: {
    translation: "thấu hiểu / lĩnh hội",
    definition: "Hiểu một cách sâu sắc và toàn diện về một vấn đề hoặc một khái niệm phức tạp.",
    exampleTranslation: "Cậu ấy quá nhỏ để có thể thấu hiểu hết độ nghiêm trọng của tình huống này."
  },
  consequence: {
    translation: "hệ quả / hậu quả",
    definition: "Kết quả tất yếu xảy ra sau một hành động hoặc quyết định nào đó (thường mang tính tiêu cực).",
    exampleTranslation: "Mất đa dạng sinh học là hậu quả trực tiếp của việc tàn phá rừng."
  },
  acquire: {
    translation: "đạt được / thu được / tích lũy",
    definition: "Học hỏi được (kỹ năng) hoặc có được (tài sản, kiến thức) thông qua nỗ lực hoặc trải nghiệm.",
    exampleTranslation: "Trẻ em tích lũy ngôn ngữ một cách tự nhiên thông qua giao tiếp hàng ngày."
  }
}

export default function VocabularyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [loadingDef, setLoadingDef] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [learnedWords, setLearnedWords] = useState<string[]>([])
  
  // Tabs: "dictionary" or "flashcard"
  const [activeTab, setActiveTab] = useState<"dictionary" | "flashcard">("dictionary")
  // Flashcard flip state: false = front, true = back
  const [isFlipped, setIsFlipped] = useState(false)

  // Filtering for learned / unlearned words inside sidebar
  const [filterMode, setFilterMode] = useState<"all" | "unlearned" | "learned">("all")
  const [sidebarPage, setSidebarPage] = useState(1)

  useEffect(() => {
    if (id) {
      fetchCategory()
      const stored = JSON.parse(localStorage.getItem(`learned_words_${id}`) || "[]")
      setLearnedWords(stored)
    }
  }, [id])

  const fetchCategory = async () => {
    try {
      const res = await apiFetch(`/user/vocabulary/${id}`)
      setCategory(res.data)
      // Select first word by default
      if (res.data.words && res.data.words.length > 0) {
        handleWordClick(res.data.words[0])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleWordClick = async (word: string) => {
    setSelectedWord(word)
    setLoadingDef(true)
    setDefinition(null)
    setIsFlipped(false) // reset card flip status when selecting a new word
    try {
      const res = await apiFetch(`/user/vocabulary/lookup/${word}`)
      if (res.data && res.data.length > 0) {
        const def = res.data[0]
        if (res.translation) def.translation = res.translation
        setDefinition(def)
      }
    } catch (error) {
      console.error("Dict error", error)
    } finally {
      setLoadingDef(false)
    }
  }

  // Toggle "learned" status for the selected word
  const toggleLearned = (word: string) => {
    if (!id) return
    let updated: string[] = []
    if (learnedWords.includes(word)) {
      updated = learnedWords.filter(w => w !== word)
    } else {
      updated = [...learnedWords, word]
    }
    setLearnedWords(updated)
    localStorage.setItem(`learned_words_${id}`, JSON.stringify(updated))
  }

  const playAudio = () => {
    if (definition?.phonetics) {
      const audioSrc = definition.phonetics.find(p => p.audio && p.audio.length > 0)?.audio
      if (audioSrc) {
        new Audio(audioSrc).play()
      }
    }
  }

  // Helper removed, using backend API translation

  // Filter words inside Sidebar
  const allFilteredWords = (category?.words || []).filter(w => {
    const matchesSearch = w.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterMode === "learned") return matchesSearch && learnedWords.includes(w)
    if (filterMode === "unlearned") return matchesSearch && !learnedWords.includes(w)
    return matchesSearch
  })

  // Pagination for Sidebar
  useEffect(() => {
    setSidebarPage(1)
  }, [searchTerm, filterMode])

  const PAGE_SIZE = 10
  const totalSidebarPages = Math.max(1, Math.ceil(allFilteredWords.length / PAGE_SIZE))
  const paginatedWords = allFilteredWords.slice((sidebarPage - 1) * PAGE_SIZE, sidebarPage * PAGE_SIZE)

  // Get colors depending on partOfSpeech (Light Mode)
  const getPartOfSpeechColor = (pos: string) => {
    switch (pos.toLowerCase()) {
      case "noun": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "verb": return "bg-sky-50 text-sky-700 border-sky-200"
      case "adjective": case "adj": return "bg-purple-50 text-purple-700 border-purple-200"
      case "adverb": case "adv": return "bg-amber-50 text-amber-700 border-amber-200"
      default: return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  if (!category) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-semibold tracking-wide">Đang tải học liệu học thuật...</p>
        </div>
    </div>
  )

  const progressPercent = category.words.length > 0 ? Math.round((learnedWords.length / category.words.length) * 100) : 0
  const currentIndex = selectedWord ? category.words.indexOf(selectedWord) : -1

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white flex flex-col md:flex-row pt-16 text-slate-800 relative overflow-x-hidden">
      
      {/* Soft Light Mode Glow Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* LEFT SIDEBAR: Premium Word List with filters (Light Mode) */}
      <div className="w-full md:w-80 lg:w-[360px] border-r border-slate-200 bg-white flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-6">
               <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()} 
                  className="h-9 w-9 text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 rounded-xl transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Học từ vựng</span>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight mb-2">{category.name}</h2>
          
          {/* Progress Tracker in Sidebar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
              <span>Đã thuộc: {learnedWords.length}/{category.words.length} từ</span>
              <span className="text-emerald-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
                placeholder="Tìm từ vựng..." 
                className="pl-10 h-10 bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus-visible:ring-indigo-500 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Smart filter tabs inside sidebar */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 border border-slate-200/50 rounded-xl text-xs font-bold mb-2">
            {(["all", "unlearned", "learned"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  filterMode === mode 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
              >
                {mode === "all" ? "Tất cả" : mode === "unlearned" ? "Chưa học" : "Đã học"}
              </button>
            ))}
          </div>
        </div>
        
        {/* Word List */}
        <div className="flex-1 px-4">
           <div className="space-y-1 pb-24">
            {paginatedWords.map((word, index) => {
              const isLearned = learnedWords.includes(word)
              return (
                <button
                  key={`${word}-${index}`}
                  onClick={() => handleWordClick(word)}
                  className={`w-full text-left py-3 rounded-2xl font-bold transition-all duration-250 flex items-center justify-between group ${
                      selectedWord === word 
                      ? "bg-indigo-50/80 border-l-4 border-indigo-600 text-indigo-700 shadow-md shadow-indigo-100/50 translate-x-1.5 pl-3.5 pr-4" 
                      : "border-l-4 border-transparent text-slate-650 hover:bg-slate-100/50 hover:text-slate-900 pl-4 pr-4"
                  }`}
                >
                  <span className="capitalize tracking-wide">{word}</span>
                  <div className="flex items-center gap-2">
                    {isLearned && (
                      <CheckCircle2 className={`w-4 h-4 ${selectedWord === word ? "text-indigo-600" : "text-emerald-500"}`} />
                    )}
                    {selectedWord === word && (
                      <motion.div layoutId="active-dot" className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    )}
                  </div>
                </button>
              )
            })}
            {paginatedWords.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm italic">
                  Không tìm thấy từ phù hợp.
              </div>
            )}
           </div>
        </div>
        
        {/* Sidebar Pagination Controls */}
        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50 flex items-center justify-between mt-auto">
           <Button
             variant="ghost"
             size="sm"
             onClick={() => setSidebarPage(p => Math.max(1, p - 1))}
             disabled={sidebarPage === 1}
             className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-700"
           >
             <ChevronLeft className="w-4 h-4" />
           </Button>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">
             Trang {sidebarPage} / {totalSidebarPages}
           </span>
           <Button
             variant="ghost"
             size="sm"
             onClick={() => setSidebarPage(p => Math.min(totalSidebarPages, p + 1))}
             disabled={sidebarPage === totalSidebarPages}
             className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-700"
           >
             <ChevronRight className="w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* RIGHT MAIN AREA: Premium Study Hub (Light Mode) */}
      <div className="flex-1 p-6 md:p-9 scroll-smooth relative z-10 min-h-[calc(100vh-4rem)] bg-slate-50/50">
        <div className="w-full mx-auto">
          <AnimatePresence mode="wait">
            {loadingDef ? (
                <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[60vh] flex flex-col items-center justify-center text-slate-400"
                >
                    <div className="relative">
                        <Loader2 className="w-14 h-14 animate-spin text-indigo-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full" />
                        </div>
                    </div>
                    <p className="mt-4 text-sm font-semibold tracking-wider uppercase text-slate-500">Đang tra cứu từ điển...</p>
                </motion.div>
            ) : definition ? (
                <motion.div 
                    key={definition.word}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8 pb-20"
                >
                    {/* Header bar controls: Switch Tabs (Framer Motion) & Learned Button */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/85 border border-slate-200/60 p-2 rounded-2xl backdrop-blur-md shadow-sm">
                      {/* Interactive Tab Switcher */}
                      <div className="flex gap-1 bg-slate-100/80 border border-slate-200/40 p-1 rounded-xl w-full sm:w-auto">
                        {(["dictionary", "flashcard"] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                              activeTab === tab 
                                ? "bg-white text-indigo-700 shadow-md shadow-slate-200/60 scale-105" 
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {tab === "dictionary" ? "Từ Điển Học Thuật" : "Thẻ Flashcard 3D"}
                          </button>
                        ))}
                      </div>

                      {/* "Mark as Learned" Button with checkmark animation */}
                      <Button
                        onClick={() => toggleLearned(definition.word)}
                        variant="outline"
                        className={`w-full sm:w-auto rounded-xl border-slate-200 text-sm font-bold tracking-wide transition-all h-10 ${
                          learnedWords.includes(definition.word)
                            ? "bg-emerald-50/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100/60"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                      >
                        {learnedWords.includes(definition.word) ? (
                          <>
                            <BookmarkCheck className="w-4 h-4 mr-2 text-emerald-600" />
                            Đã Thuộc Từ Này
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4 mr-2 text-slate-400" />
                            Đánh Dấu Đã Học
                          </>
                        )}
                      </Button>
                    </div>

                    <Separator className="bg-slate-200" />

                    {/* TAB CONTENT: Dictionary Mode */}
                    {activeTab === "dictionary" && (
                      <div className="space-y-10 w-full">
                        {/* Word Title & Pronunciation Area */}
                        <div>
                          <div className="flex items-center gap-6 mb-4">
                               <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight capitalize selection:bg-indigo-100 font-sans">
                                  {definition.word}
                               </h1>
                               <button 
                                  onClick={playAudio}
                                  className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-650 flex items-center justify-center shadow-md transition-all hover:bg-indigo-600 hover:text-white hover:scale-105 active:scale-95 group"
                               >
                                  <Volume2 className="w-5 h-5 group-hover:animate-pulse" />
                               </button>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3">
                               {definition.phonetic && (
                                  <span className="font-sans font-medium text-indigo-600 text-base px-4 py-1 bg-indigo-50/50 border border-indigo-100 rounded-full shadow-sm">
                                      {definition.phonetic}
                                  </span>
                                )}
                               
                               {/* Vietnamese Translation helper badge */}
                               {definition.translation && (
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-sm py-1 px-3 shadow-sm font-sans">
                                    Nghĩa Việt: {definition.translation}
                                  </Badge>
                                )}
                          </div>
                        </div>

                        {/* Vietnamese helper details box (Super Useful EdTech Feature) */}
                        {definition.translation && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-[2rem] bg-emerald-500/[0.02] border border-emerald-500/10 shadow-sm"
                          >
                            <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <HelpCircle className="w-4 h-4" />
                              Nghĩa Tiếng Việt
                            </h4>
                            <p className="text-slate-800 font-extrabold text-xl mb-2 capitalize">
                              {definition.translation}
                            </p>
                            <p className="text-slate-600 text-sm leading-relaxed mb-3">
                              Bản dịch tự động. Vui lòng xem phần từ điển Anh-Anh bên dưới để hiểu sâu hơn về ngữ cảnh học thuật!
                            </p>
                          </motion.div>
                        )}

                        <Separator className="bg-slate-200/80" />

                        {/* Standard Meanings & Examples Section */}
                        <div className="space-y-8">
                            {definition.meanings.map((meaning, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white/70 backdrop-blur-md border border-slate-200/50 hover:border-indigo-100/50 p-6 sm:p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 group/card relative overflow-hidden"
                                >
                                    {/* Subtle decorative glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-indigo-50/0 to-indigo-50/5 pointer-events-none" />

                                    <div className="flex items-center gap-4 mb-5 relative z-10">
                                        <Badge variant="outline" className={`px-4 py-1 rounded-xl text-xs font-black tracking-wider uppercase border shadow-sm ${getPartOfSpeechColor(meaning.partOfSpeech)}`}>
                                            {meaning.partOfSpeech}
                                        </Badge>
                                        <div className="h-px flex-1 bg-slate-100 group-hover/card:bg-slate-200 transition-colors" />
                                    </div>

                                    <ul className="space-y-6 pl-4 md:pl-6 border-l border-slate-200/80 group-hover/card:border-indigo-200 transition-colors relative z-10">
                                        {meaning.definitions.map((def, dIdx) => (
                                            <li key={dIdx} className="relative">
                                                <div className="text-base text-slate-700 leading-relaxed font-semibold">
                                                    {def.definition}
                                                </div>
                                                
                                                {def.example && (
                                                    <div className="mt-2.5 pl-4 border-l-2 border-indigo-500/50 bg-indigo-50/50 p-3 rounded-r-2xl text-slate-600 italic text-sm leading-relaxed">
                                                        "{def.example}"
                                                    </div>
                                                )}

                                                {(def.synonyms && def.synonyms.length > 0) && (
                                                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Từ Đồng Nghĩa:</span>
                                                        {def.synonyms.slice(0, 5).map(s => (
                                                            <span 
                                                              key={s} 
                                                              className="text-xs font-bold text-indigo-600 hover:text-indigo-750 hover:underline cursor-pointer transition-colors" 
                                                              onClick={() => handleWordClick(s)}
                                                            >
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>

                        {/* Interactive Pagination / Sequential Study Navigator */}
                        <div className="flex justify-between items-center pt-8 border-t border-slate-200/60 mt-12 w-full">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              if (currentIndex > 0) {
                                handleWordClick(category.words[currentIndex - 1])
                              }
                            }}
                            disabled={currentIndex === 0}
                            className="rounded-xl border border-slate-200/50 hover:bg-slate-100 font-bold transition-all text-slate-650 h-10 px-4 disabled:opacity-30 flex items-center gap-2"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Từ Trước Đó
                          </Button>
                          
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans">
                            {currentIndex + 1} / {category.words.length} từ
                          </span>

                          <Button
                            onClick={() => {
                              if (currentIndex < category.words.length - 1) {
                                handleWordClick(category.words[currentIndex + 1])
                              }
                            }}
                            disabled={currentIndex === category.words.length - 1}
                            className="bg-indigo-50 border border-indigo-200 text-indigo-650 hover:bg-indigo-600 hover:text-white rounded-xl font-bold transition-all h-10 px-4 disabled:opacity-30 flex items-center gap-2"
                          >
                            Từ Tiếp Theo
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT: 3D Flipping Flashcard Mode (Extremely Premium Design) */}
                    {activeTab === "flashcard" && (
                      <div className="flex flex-col items-center py-6">
                        {/* Perspective Container */}
                        <div 
                          className="w-full max-w-md h-[340px] cursor-pointer"
                          style={{ perspective: "1000px" }}
                          onClick={() => setIsFlipped(!isFlipped)}
                        >
                          {/* Inner Card Wrapper with Flip state classes */}
                          <div 
                            className="w-full h-full relative transition-transform duration-700 select-none shadow-xl rounded-3xl"
                            style={{ 
                              transformStyle: "preserve-3d",
                              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                            }}
                          >
                            
                            {/* FRONT FACE of the card (Light Theme) */}
                            <div 
                              className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 border border-indigo-100 flex flex-col justify-between items-center text-center shadow-lg shadow-indigo-100/50"
                              style={{ 
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden"
                              }}
                            >
                              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold uppercase tracking-widest text-xs px-3 py-1 shadow-sm">
                                {definition.meanings[0]?.partOfSpeech || "Vocabulary"}
                              </Badge>
                              
                              <div className="space-y-4">
                                <h2 className="text-4xl md:text-5xl font-black text-slate-800 capitalize tracking-wide select-text" onClick={e => e.stopPropagation()}>
                                  {definition.word}
                                </h2>
                                {definition.phonetic && (
                                  <p className="font-serif text-indigo-600 italic text-lg select-text" onClick={e => e.stopPropagation()}>
                                    {definition.phonetic}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation() // prevent flip when playing audio
                                    playAudio()
                                  }}
                                  className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95"
                                >
                                  <Volume2 className="w-5 h-5" />
                                </button>
                                <span className="text-xs text-slate-450 font-bold uppercase tracking-widest">Click để lật thẻ</span>
                              </div>
                            </div>

                            {/* BACK FACE of the card (Light Theme) */}
                            <div 
                              className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-slate-50/80 border border-emerald-100 flex flex-col justify-between shadow-lg shadow-emerald-50/50"
                              style={{ 
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                transform: "rotateY(180deg)"
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase tracking-widest text-xs px-3 py-1 shadow-sm">
                                  Dịch Nghĩa Việt - Anh
                                </Badge>
                                <Badge variant="outline" className="text-slate-400 border-slate-200 uppercase font-bold text-[10px]">
                                  {definition.word}
                                </Badge>
                              </div>

                              <div className="space-y-3 flex-1 flex flex-col justify-center select-text" onClick={e => e.stopPropagation()}>
                                {definition.translation ? (
                                  <>
                                    <h3 className="text-2xl font-extrabold text-slate-800 capitalize leading-tight">
                                      {definition.translation}
                                    </h3>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1 mt-4">Định nghĩa chính</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                                      {definition.meanings[0]?.definitions[0]?.definition}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Định nghĩa chính</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                                      {definition.meanings[0]?.definitions[0]?.definition}
                                    </p>
                                  </>
                                )}
                              </div>

                              {/* Example if exists */}
                              <div className="border-t border-slate-100 pt-3 select-text" onClick={e => e.stopPropagation()}>
                                <p className="text-xs text-slate-400 font-black uppercase mb-1">Ví Dụ Minh Họa</p>
                                <p className="text-xs text-indigo-600 italic line-clamp-2 leading-relaxed">
                                  "{definition.meanings[0]?.definitions.find(d => d.example)?.example || "No example available"}"
                                </p>
                              </div>
                            </div>

                          </div>
                        </div>

                        <p className="text-slate-400 text-xs mt-6 font-semibold flex items-center gap-1.5">
                          💡 Mẹo: Nhấp trực tiếp vào chiếc thẻ để chuyển đổi giữa mặt trước và mặt sau.
                        </p>

                        {/* Flashcard study navigation */}
                        <div className="flex justify-between items-center w-full max-w-md mt-8 border-t border-slate-200/50 pt-6">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              if (currentIndex > 0) {
                                setIsFlipped(false) // reset flip
                                handleWordClick(category.words[currentIndex - 1])
                              }
                            }}
                            disabled={currentIndex === 0}
                            className="rounded-xl border border-slate-200/50 hover:bg-slate-100 font-bold transition-all text-slate-650 h-10 px-4 disabled:opacity-30 flex items-center gap-1.5"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Trước
                          </Button>

                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans">
                            {currentIndex + 1} / {category.words.length} từ
                          </span>

                          <Button
                            onClick={() => {
                              if (currentIndex < category.words.length - 1) {
                                setIsFlipped(false) // reset flip
                                handleWordClick(category.words[currentIndex + 1])
                              }
                            }}
                            disabled={currentIndex === category.words.length - 1}
                            className="bg-indigo-50 border border-indigo-200 text-indigo-650 hover:bg-indigo-600 hover:text-white rounded-xl font-bold transition-all h-10 px-4 disabled:opacity-30 flex items-center gap-1.5"
                          >
                            Tiếp
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Footer Source */}
                    {definition.sourceUrls && definition.sourceUrls.length > 0 && (
                        <div className="pt-8 mt-10 border-t border-slate-100 text-slate-450 text-xs flex gap-2 justify-center">
                             <span>Nguồn: Wiktionary</span>
                             <a href={definition.sourceUrls[0]} target="_blank" rel="noreferrer" className="underline hover:text-slate-600 truncate max-w-[200px] sm:max-w-md">
                                {definition.sourceUrls[0]}
                             </a>
                        </div>
                    )}

                </motion.div>
            ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
                    <BookOpen className="w-24 h-24 mb-6 opacity-10" />
                    <p className="text-2xl font-light text-slate-450">Chọn một từ vựng ở danh mục bên trái để bắt đầu bài học</p>
                </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

