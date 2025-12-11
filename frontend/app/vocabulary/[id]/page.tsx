"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Volume2, BookOpen, Loader2 } from "lucide-react"

interface Category {
  _id: string
  name: string
  words: string[]
}

interface Definition {
  word: string
  phonetic?: string
  phonetics?: { text?: string, audio?: string }[]
  meanings: {
    partOfSpeech: string
    definitions: { definition: string, example?: string }[]
  }[]
}

export default function VocabularyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [loadingDef, setLoadingDef] = useState(false)

  useEffect(() => {
    if (id) fetchCategory()
  }, [id])

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
      const audioSrc = definition.phonetics.find(p => p.audio)?.audio
      if (audioSrc) {
        new Audio(audioSrc).play()
      } else {
        alert("No audio available for this word.")
      }
    }
  }

  if (!category) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* LEFT: Word List */}
      <div className="w-full md:w-1/3 border-r border-slate-200 bg-white h-screen flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-slate-500 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
          <h2 className="text-2xl font-bold text-slate-800">{category.name}</h2>
          <p className="text-sm text-slate-500">{category.words.length} words to learn</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {category.words.map((word) => (
            <button
              key={word}
              onClick={() => handleWordClick(word)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                selectedWord === word 
                  ? "bg-blue-50 text-blue-600 border border-blue-100" 
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Definition Area */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {loadingDef ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Looking up "{selectedWord}"...</p>
          </div>
        ) : definition ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            {/* Header */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-5xl font-bold text-slate-800">{definition.word}</h1>
                <button 
                  onClick={playAudio}
                  className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
              <p className="text-xl text-slate-500 font-serif italic">{definition.phonetic}</p>
            </div>

            {/* Meanings */}
            <div className="space-y-8">
              {definition.meanings.map((meaning, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold mb-4 uppercase tracking-wider">
                    {meaning.partOfSpeech}
                  </span>
                  
                  <ul className="space-y-4">
                    {meaning.definitions.slice(0, 3).map((def, dIdx) => (
                      <li key={dIdx} className="text-slate-700">
                        <div className="flex gap-3">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{def.definition}</span>
                        </div>
                        {def.example && (
                          <p className="mt-1 ml-6 text-slate-400 text-sm italic">"{def.example}"</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Select a word to view its definition</p>
          </div>
        )}
      </div>
    </div>
  )
}
