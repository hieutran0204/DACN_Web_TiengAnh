"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { ArrowLeft, Plus, X, Save } from "lucide-react"

export default function EditVocabularyPage() {
  const { id } = useParams()
  const isNew = id === 'new'
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: "",
    level: "Intermediate",
    description: "",
    image: ""
  })
  const [words, setWords] = useState<string[]>([])
  const [newWordsInput, setNewWordsInput] = useState("")

  useEffect(() => {
    if (!isNew && id) fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const res = await apiFetch(`/user/vocabulary/${id}`)
      const { name, level, description, image, words } = res.data
      setFormData({ name, level, description, image: image || "" })
      setWords(words)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let targetId = id;

      if (isNew) {
        const res = await apiFetch("/user/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
        targetId = res.data._id
      } else {
        await apiFetch(`/user/vocabulary/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
      }

      if (newWordsInput.trim()) {
         const list = newWordsInput.split(",").map(s => s.trim()).filter(Boolean)
         await apiFetch(`/user/vocabulary/${targetId}/words`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: 'add', words: list })
         })
      }

      router.push("/admin/vocabulary")
    } catch (error) {
      alert("Error saving")
    }
  }

  const handleRemoveWord = async (word: string) => {
    if (isNew) return;
    setWords(words.filter(w => w !== word))
    try {
        await apiFetch(`/user/vocabulary/${id}/words`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: 'remove', words: [word] })
         })
    } catch(e) {}
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => router.back()} className="mb-6 flex items-center text-slate-500">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6">{isNew ? "Create Topic" : "Edit Topic"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Topic Name</label>
            <input 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full border p-2 rounded"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value})}
                    className="w-full border p-2 rounded"
                >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                <input 
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full border p-2 rounded"
                  placeholder="https://..."
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full border p-2 rounded h-24"
            />
          </div>
        </div>

        {!isNew && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                <h3 className="font-bold">Manage Words ({words.length})</h3>
                
                <div className="flex gap-2">
                    <input 
                        value={newWordsInput}
                        onChange={e => setNewWordsInput(e.target.value)}
                        placeholder="Add words (comma separated)... e.g. apple, banana"
                        className="flex-1 border p-2 rounded"
                    />
                </div>
                <p className="text-xs text-slate-500">Enter words above and click Save to add them.</p>

                <div className="flex flex-wrap gap-2 mt-4">
                    {words.map(w => (
                        <span key={w} className="bg-slate-100 px-3 py-1 rounded-full flex items-center text-sm">
                            {w}
                            <button type="button" onClick={() => handleRemoveWord(w)} className="ml-2 text-red-400 hover:text-red-600">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        )}

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center">
            <Save className="w-4 h-4 mr-2" /> Save Changes
        </button>
      </form>
    </div>
  )
}
