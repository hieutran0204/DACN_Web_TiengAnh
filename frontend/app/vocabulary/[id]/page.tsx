"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Volume2, BookOpen, Loader2, Search, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
}

export default function VocabularyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [loadingDef, setLoadingDef] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const WORDS_PER_PAGE = 6

  useEffect(() => {
    if (id) fetchCategory()
  }, [id])

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const fetchCategory = async () => {
    try {
      const res = await apiFetch(`/user/vocabulary/${id}`)
      setCategory(res.data)
      // Select first word by default
      if (res.data.words.length > 0) {
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
    try {
      const res = await apiFetch(`/user/vocabulary/lookup/${word}`)
      if (res.data && res.data.length > 0) {
        setDefinition(res.data[0])
      }
    } catch (error) {
      console.error("Dict error", error)
    } finally {
      setLoadingDef(false)
    }
  }

  const playAudio = () => {
    if (definition?.phonetics) {
      const audioSrc = definition.phonetics.find(p => p.audio && p.audio.length > 0)?.audio
      if (audioSrc) {
        new Audio(audioSrc).play()
      } else {
        // Fallback or toast
      }
    }
  }

  const allFilteredWords = category?.words.filter(w => w.toLowerCase().includes(searchTerm.toLowerCase())) || []
  const totalPages = Math.ceil(allFilteredWords.length / WORDS_PER_PAGE)
  const displayedWords = allFilteredWords.slice((page - 1) * WORDS_PER_PAGE, page * WORDS_PER_PAGE)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage)
    }
  }

  if (!category) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium">Loading vocabulary...</p>
        </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white flex flex-col md:flex-row pt-20">
      
      {/* LEFT SIDEBAR: Word List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/60 bg-white/70 backdrop-blur-xl md:h-[calc(100vh-5rem)] flex flex-col sticky top-20 z-10 shadow-lg shadow-slate-200/50">
        <div className="p-6 pb-4">
            <div className="flex items-center gap-2 mb-6">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.back()} 
                    className="h-8 w-8 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Topic</span>
            </div>
          
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight mb-2">{category.name}</h2>
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
             <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold shadow-sm">
                {category.level || "General"}
             </Badge>
             <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                {allFilteredWords.length} words
             </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
                placeholder="Find a word..." 
                className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl transition-all focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-4">
           <div className="space-y-1 pb-4">
            {displayedWords.map((word, index) => (
                <button
                key={`${word}-${index}`}
                onClick={() => handleWordClick(word)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-between group ${
                    selectedWord === word 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 translate-x-1" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                >
                <span className="capitalize">{word}</span>
                {selectedWord === word && (
                    <motion.div layoutId="active-dot" className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
                </button>
            ))}
            {displayedWords.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                    No words found.
                </div>
            )}
           </div>
        </ScrollArea>

        {/* Sidebar Pagination Footer */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-white/50 backdrop-blur flex items-center justify-between text-sm">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="text-slate-500 hover:text-indigo-600"
                >
                    Previous
                </Button>
                <span className="text-slate-400 font-medium">
                    {page} / {totalPages}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="text-slate-500 hover:text-indigo-600"
                >
                    Next
                </Button>
            </div>
        )}
      </div>

      {/* RIGHT MAIN AREA: Definition */}
      <div className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto md:h-[calc(100vh-5rem)] scroll-smooth relative">
        <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
            {loadingDef ? (
                <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[60vh] flex flex-col items-center justify-center text-slate-300"
                >
                    <div className="relative">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-200" />
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        </div>
                    </div>
                </motion.div>
            ) : definition ? (
                <motion.div 
                    key={definition.word}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-10 pb-20"
                >
                    {/* Header Section */}
                    <div className="relative">
                        <div className="flex items-end gap-6 mb-4">
                             <h1 className="text-6xl md:text-7xl font-bold text-slate-900 tracking-tighter capitalize selection:bg-indigo-100">
                                {definition.word}
                             </h1>
                             <button 
                                onClick={playAudio}
                                className="mb-2 w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all group"
                             >
                                <Volume2 className="w-6 h-6 group-hover:animate-pulse" />
                             </button>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-lg">
                             {definition.phonetic && (
                                <span className="font-serif italic text-slate-500 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                                    {definition.phonetic}
                                </span>
                             )}
                        </div>
                    </div>

                    <Separator className="bg-slate-200/60" />

                    {/* Meanings Section */}
                    <div className="space-y-12">
                        {definition.meanings.map((meaning, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-xl font-bold italic font-serif text-slate-400">
                                        {meaning.partOfSpeech}
                                    </span>
                                    <div className="h-px flex-1 bg-slate-100 group-hover:bg-slate-200 transition-colors" />
                                </div>

                                <ul className="space-y-8 pl-4 md:pl-8 border-l-2 border-indigo-100 group-hover:border-indigo-200 transition-colors">
                                    {meaning.definitions.map((def, dIdx) => (
                                        <li key={dIdx} className="relative">
                                            <div className="text-xl text-slate-700 leading-relaxed font-medium">
                                                {def.definition}
                                            </div>
                                            
                                            {def.example && (
                                                <div className="mt-3 pl-4 border-l-4 border-indigo-500/30 bg-indigo-50/50 p-3 rounded-r-lg text-slate-600 italic font-medium">
                                                    "{def.example}"
                                                </div>
                                            )}

                                            {(def.synonyms && def.synonyms.length > 0) && (
                                                <div className="mt-3 flex flex-wrap gap-2 items-center">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Similar:</span>
                                                    {def.synonyms.slice(0, 5).map(s => (
                                                        <span key={s} className="text-sm text-indigo-600 hover:underline cursor-pointer decoration-indigo-200 underline-offset-2" onClick={() => handleWordClick(s)}>
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

                    {/* Footer Source */}
                    {definition.sourceUrls && definition.sourceUrls.length > 0 && (
                        <div className="pt-10 mt-10 border-t border-slate-100 text-slate-400 text-sm flex gap-2">
                             <span>Source:</span>
                             <a href={definition.sourceUrls[0]} target="_blank" rel="noreferrer" className="underline hover:text-slate-600 truncate max-w-md">
                                {definition.sourceUrls[0]}
                             </a>
                        </div>
                    )}

                </motion.div>
            ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300">
                    <BookOpen className="w-24 h-24 mb-6 opacity-10" />
                    <p className="text-2xl font-light text-slate-400">Select a word to begin</p>
                </div>
            )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
