"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Trash2,
  ChevronLeft,
  Save,
  PenTool,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface WritingQuestion {
  _id: string;
  task: string;
  type: string;
  topic: string;
  question: string;
  images?: string[];
  image?: string; // Legacy
  sampleAnswer?: string;
  difficulty?: string;
}

export default function EditWritingQuestion() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [question, setQuestion] = useState<WritingQuestion | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const json = await apiFetch(`/admin/questions/writing/${id}`);
        if (json.success && json.data) {
          const q = json.data;
          setQuestion(q);
          if (q.images && q.images.length > 0) {
              setExistingImages(q.images.map((img: string) => img.startsWith("http") ? img : `${BACKEND_URL}${img}`));
          } else if (q.image) {
              // Backward compat
              setExistingImages([q.image.startsWith("http") ? q.image : `${BACKEND_URL}${q.image}`]);
          }
        } else {
            throw new Error(json.message || "Failed to load question");
        }
      } catch (err: any) {
        console.error("Error loading question:", err);
        setError(err.message || "Failed to load question");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question) return;

    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    // Append existing images (relative paths? need to strip domain if we added it?)
    // Actually backend stores relative paths usually.
    // If we updated setExistingImages with Full URL, we should revert or backend handles full URL.
    // Let's assume backend needs relative path if possible, or we just send what we have.
    // BUT wait, if we send full URL back, backend might need to handle it.
    // Let's just strip BACKEND_URL if present to keep it clean.
    
    existingImages.forEach(img => {
        let val = img;
        if (val.startsWith(BACKEND_URL)) val = val.replace(BACKEND_URL, "");
        formData.append("existingImages", val);
    });

    // New images are automatically in 'images' field if input name="images"
    // But we need to make sure we don't double append if we manipulate them.
    // Actually e.currentTarget contains 'images' file input. 
    // If user selected files, they are in there.
    
    // NOTE: 'removeImage' legacy logic is gone.

    try {
      await apiFetch(`/admin/questions/writing/${id}`, {
        method: "PUT",
        body: formData,
      });

      alert("Updated successfully!");
      router.push("/admin/skills/writing/questions");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-600">Loading Question...</p>
        </div>
      </div>
    );
  }

  if (!question) return <div className="p-10 text-center">Question not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Edit Writing Question
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
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="space-y-6 lg:col-span-1">
                 <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                            <PenTool className="w-4 h-4" /> Question Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Task</Label>
                            <input type="hidden" name="task" value={question.task} />
                            <Select 
                                defaultValue={question.task}
                                onValueChange={(v) => setQuestion({...question, task: v})}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Task 1">Task 1 (Academic)</SelectItem>
                                    <SelectItem value="Task 2">Task 2 (Essay)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                         <div className="space-y-2">
                            <Label>Question Type</Label>
                            <input type="hidden" name="type" value={question.type} />
                             <Select 
                                defaultValue={question.type}
                                onValueChange={(v) => setQuestion({...question, type: v})}
                             >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Task 1</SelectLabel>
                                        <SelectItem value="bar_chart">Bar Chart</SelectItem>
                                        <SelectItem value="line_graph">Line Graph</SelectItem>
                                        <SelectItem value="pie_chart">Pie Chart</SelectItem>
                                        <SelectItem value="table">Table</SelectItem>
                                        <SelectItem value="process">Process</SelectItem>
                                        <SelectItem value="map">Map</SelectItem>
                                        <SelectItem value="mixed_chart">Mixed Chart</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Task 2</SelectLabel>
                                        <SelectItem value="opinion">Opinion</SelectItem>
                                        <SelectItem value="discussion">Discussion</SelectItem>
                                        <SelectItem value="problem_solution">Problem & Solution</SelectItem>
                                        <SelectItem value="cause_effect">Causes & Effects</SelectItem>
                                        <SelectItem value="advantage_disadvantage">Adv/Disadv</SelectItem>
                                        <SelectItem value="two_part_question">Two-part Question</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                         <div className="space-y-2">
                            <Label>Topic</Label>
                            <Input
                                name="topic"
                                defaultValue={question.topic}
                                required
                                className="bg-white"
                            />
                        </div>

                         <div className="space-y-2">
                            <Label>Difficulty</Label>
                             <input type="hidden" name="difficulty" value={question.difficulty} />
                             <Select 
                                defaultValue={question.difficulty} 
                                onValueChange={(v) => setQuestion({...question, difficulty: v})}
                             >
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                 </Card>

                 <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                             <ImageIcon className="w-4 h-4" /> Images (Task 1)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                             <div className="grid grid-cols-2 gap-2">
                                {existingImages.map((img, idx) => (
                                    <div key={`exist-${idx}`} className="relative rounded-lg overflow-hidden border border-slate-200 group">
                                         <img src={img} alt="Existing" className="w-full h-auto object-cover max-h-[150px]" />
                                         <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                setExistingImages(prev => prev.filter((_, i) => i !== idx));
                                            }}
                                         >
                                            <Trash2 className="w-3 h-3" />
                                         </Button>
                                    </div>
                                ))}
                             </div>
                        )}
                        
                        {/* New Image Previews */}
                        {newImagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                               {newImagePreviews.map((url, idx) => (
                                   <div key={`new-${idx}`} className="rounded-lg overflow-hidden border border-blue-200">
                                        <img src={url} alt="New" className="w-full h-auto object-cover max-h-[150px]" />
                                   </div>
                               ))}
                            </div>
                        )}

                        <Input 
                            type="file" 
                            name="images" 
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                    const urls = Array.from(files).map(f => URL.createObjectURL(f));
                                    setNewImagePreviews(urls);
                                } else {
                                    setNewImagePreviews([]);
                                }
                            }}
                            className="bg-white cursor-pointer"
                        />
                    </CardContent>
                 </Card>
            </div>

            {/* RIGHT COLUMN */}
             <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800">
                            Question Prompt
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Textarea
                            name="question"
                            defaultValue={question.question}
                            required
                            rows={8}
                            className="text-base font-medium resize-none bg-white leading-relaxed"
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800">
                            Sample Answer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 p-0">
                         <Textarea
                            name="sampleAnswer"
                            defaultValue={question.sampleAnswer || ""}
                            rows={15}
                            className="text-base font-serif leading-relaxed border-0 focus-visible:ring-0 resize-none p-4"
                            placeholder="Write a sample answer..."
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4 pb-20">
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
             </div>
        </div>
      </form>
    </div>
  );
}
