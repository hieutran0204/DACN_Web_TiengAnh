"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
    Loader2, 
    ChevronLeft, 
    Save, 
    Book, 
    AlertCircle, 
    Trash2, 
    Plus,
    X,
    Image as ImageIcon
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function EditVocabularyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    level: "Intermediate",
    description: "",
    image: "",
  });
  const [words, setWords] = useState<string[]>([]);
  const [newWordsInput, setNewWordsInput] = useState("");

  useEffect(() => {
    if(!id) return;
    const fetchData = async () => {
        try {
            const json = await apiFetch(`/user/vocabulary/${id}`);
             if(!json.success && !json.data) throw new Error("Failed to load topic");
             
             const data = json.data || json;
             setFormData({
                 name: data.name || "",
                 level: data.level || "Intermediate",
                 description: data.description || "",
                 image: data.image || ""
             });
             setWords(data.words || []);
        } catch (err: any) {
            setError(err.message || "Failed to load topic");
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // 1. Update Topic Metadata
      await apiFetch(`/user/vocabulary/${id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      // 2. Add New Words if input not empty
      if (newWordsInput.trim()) {
         const list = newWordsInput.split(",").map(s => s.trim()).filter(Boolean);
         if(list.length > 0) {
             await apiFetch(`/user/vocabulary/${id}/words`, {
                method: "PUT",
                body: JSON.stringify({ action: 'add', words: list }),
            });
         }
      }

      alert("Updated successfully!");
      // Refresh words or redirect? Let's refresh
      // Actually redirect is safer to clear state
      router.push("/admin/vocabulary");

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWord = async (word: string) => {
      // Optimistic update
      const oldWords = [...words];
      setWords(words.filter(w => w !== word));
      
      try {
         await apiFetch(`/user/vocabulary/${id}/words`, {
            method: "PUT",
            body: JSON.stringify({ action: 'remove', words: [word] }),
        });
      } catch (e) {
          // Revert if failed
          setWords(oldWords);
          alert("Failed to remove word");
      }
  }

  if (loading) {
     return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
     )
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Edit Vocabulary Topic
          </h1>
          <p className="text-slate-500 mt-1">ID: {id}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to List
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
         {/* LEFT: Metadata Form */}
         <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                 <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                             <Book className="w-4 h-4" /> Topic Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label>Topic Name</Label>
                            <Input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Level</Label>
                                <Select 
                                    value={formData.level} 
                                    onValueChange={(v) => setFormData({...formData, level: v})}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Image URL (Optional)</Label>
                                <Input 
                                    value={formData.image}
                                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={4}
                                className="bg-white resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                     <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add New Words
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                         <div className="space-y-2">
                            <Label>Add Words (Comma separated)</Label>
                            <Textarea 
                                value={newWordsInput}
                                onChange={(e) => setNewWordsInput(e.target.value)}
                                placeholder="e.g. apple, banana, cherry..."
                                rows={3}
                                className="bg-white font-mono text-sm"
                            />
                            <p className="text-xs text-slate-500">
                                Click 'Save Changes' below to add these words to the list.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                     <Button
                        type="submit"
                        size="lg"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 min-w-[200px]"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 w-5 h-5 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 w-5 h-5" /> Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
         </div>

         {/* RIGHT: Word Management */}
         <div className="lg:col-span-1 border-l pl-0 lg:pl-8 border-slate-200 lg:border-l lg:border-t-0 border-t pt-8 lg:pt-0">
             <div className="sticky top-6 space-y-4">
                <div className="flex items-center justify-between">
                     <h2 className="font-semibold text-slate-800">
                        Words List
                        <Badge variant="secondary" className="ml-2">{words.length}</Badge>
                     </h2>
                </div>
                
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm max-h-[600px] overflow-y-auto p-2">
                    {words.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            No words yet.
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {words.map(w => (
                                <Badge key={w} variant="outline" className="pl-3 pr-1 py-1 flex items-center gap-1 hover:bg-slate-50 transition-colors">
                                    {w}
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveWord(w)}
                                        className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 text-slate-400 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                 {formData.image && (
                    <div className="mt-6 rounded-lg overflow-hidden border border-slate-200">
                        <img 
                            src={formData.image} 
                            alt="Topic Preview" 
                            className="w-full h-auto object-cover max-h-[200px]"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                         <p className="text-xs text-center p-2 bg-slate-50 text-slate-500">Image Preview</p>
                    </div>
                )}
             </div>
         </div>
      </div>
    </div>
  );
}
