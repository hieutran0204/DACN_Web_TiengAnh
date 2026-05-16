"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, Plus, ChevronLeft, Save, Book, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function NewVocabularyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    level: "Intermediate",
    description: "",
    image: "",
  });
  const [initialWords, setInitialWords] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create Topic
      // Use apiFetch for proper auth
      const json = await apiFetch("/user/vocabulary", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const newTopicId = json.data._id;

      // 2. Add Initial Words if any
      if (initialWords.trim()) {
         const wordsList = initialWords.split(",").map(s => s.trim()).filter(Boolean);
         if (wordsList.length > 0) {
            await apiFetch(`/user/vocabulary/${newTopicId}/words`, {
                method: "PUT",
                body: JSON.stringify({ action: 'add', words: wordsList }),
            });
         }
      }

      alert("Topic created successfully!");
      router.push("/admin/vocabulary");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Create Vocabulary Topic
          </h1>
          <p className="text-slate-500 mt-1">
            Add a new vocabulary set
          </p>
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

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                    <Book className="w-4 h-4" /> Topic Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label>Topic Name <span className="text-red-500">*</span></Label>
                    <Input 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Travel, Business, Technology..."
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
                            placeholder="https://example.com/image.jpg"
                            className="bg-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Short description of this vocabulary set..."
                        rows={4}
                        className="bg-white resize-none"
                    />
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-medium text-slate-800">Initial Words (Optional)</CardTitle>
            </CardHeader>
             <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                    <Label>Words List (Comma separated)</Label>
                    <Textarea 
                        value={initialWords}
                        onChange={(e) => setInitialWords(e.target.value)}
                        placeholder="e.g. apple, banana, cherry, date..."
                        rows={3}
                        className="bg-white font-mono text-sm leading-relaxed"
                    />
                    <p className="text-xs text-slate-500">You can add more words later.</p>
                </div>
             </CardContent>
        </Card>

        <div className="flex justify-end pt-4 pb-20">
             <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 min-w-[200px]"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" /> Creating...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 w-5 h-5" /> Create Topic
                    </>
                )}
            </Button>
        </div>
      </form>
    </div>
  );
}
