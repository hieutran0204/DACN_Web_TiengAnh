"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  Mic,
  Image as ImageIcon,
  AlertCircle,
  Save,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SpeakingQuestion {
  _id: string;
  topic: string;
  type: string;
  question: string;
  subQuestions: string[];
  suggestedIdeas: string[];
  sampleAnswer: string;
  image?: string;
  difficulty: string;
}

export default function EditSpeakingQuestion() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState<SpeakingQuestion | null>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [subQuestions, setSubQuestions] = useState<string[]>([""]);
  const [suggestedIdeas, setSuggestedIdeas] = useState<string[]>([""]);

  // LOAD DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch<any>(`/admin/questions/speaking/${id}`);
        // json is returned directly if using apiFetch util usually, wait apiFetch implementation returns res.json() if content-type is json
        // The implementation I assumed: returns parsed JSON if 200 OK and type JSON.

        if (res.success && res.data) {
             const q = res.data;
             setQuestion(q);
             setSubQuestions(q.subQuestions?.length > 0 ? q.subQuestions : [""]);
             setSuggestedIdeas(
               q.suggestedIdeas?.length > 0 ? q.suggestedIdeas : [""]
             );
             if (q.image) {
                // Determine full URL for preview
               setImagePreview(
                 q.image.startsWith("http") 
                    ? q.image 
                    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${q.image}`
               );
             }
        } else {
             throw new Error("Could not load question data");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Preview Image from File
  useEffect(() => {
    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(imageFile);
    } 
  }, [imageFile]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question) return;

    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    // Filter empty values
    const cleanedSubQuestions = subQuestions.filter((q) => q.trim());
    const cleanedIdeas = suggestedIdeas.filter((i) => i.trim());

    formData.append("subQuestions", JSON.stringify(cleanedSubQuestions));
    formData.append("suggestedIdeas", JSON.stringify(cleanedIdeas));
    
    // Controlled Selects need explicit append if not using hidden inputs
    // We will assume hidden inputs technique or manual append if question state is updated
    if (question.type) formData.set("type", question.type);
    if (question.difficulty) formData.set("difficulty", question.difficulty);

    if (imageFile) {
        formData.append("image", imageFile);
    }
    if (removeImage && question.image) {
        formData.append("removeImage", "true");
    }

    try {
      await apiFetch(`/admin/questions/speaking/${id}`, {
        method: "PUT",
        body: formData,
      });

      alert("Updated successfully!");
      router.push("/admin/skills/speaking/questions");
    } catch (err: any) {
      console.error("Error:", err);
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
            Edit Speaking Question
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
                            <Mic className="w-4 h-4" /> Basic Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
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
                            <Label>Question Type</Label>
                            <Select 
                                value={question.type} 
                                onValueChange={(v) => setQuestion({...question, type: v})}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="personal_experience">Personal Experience</SelectItem>
                                    <SelectItem value="descriptive">Descriptive</SelectItem>
                                    <SelectItem value="comparative">Comparative</SelectItem>
                                    <SelectItem value="opinion_based">Opinion</SelectItem>
                                    <SelectItem value="cause_effect">Cause & Effect</SelectItem>
                                    <SelectItem value="hypothetical">Hypothetical</SelectItem>
                                    <SelectItem value="advantage_disadvantage">Adv/Disadv</SelectItem>
                                    <SelectItem value="problem_solution">Problem & Solution</SelectItem>
                                    <SelectItem value="prediction">Prediction</SelectItem>
                                    <SelectItem value="abstract">Abstract</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <Select 
                                value={question.difficulty}
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
                             <ImageIcon className="w-4 h-4" /> Image
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {imagePreview && !removeImage && (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-auto object-cover max-h-[200px]"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 h-8"
                                    onClick={() => {
                                        setRemoveImage(true);
                                        setImagePreview(null);
                                        setImageFile(null);
                                    }}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                                </Button>
                            </div>
                        )}
                        <Input 
                            type="file" 
                            name="image" 
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setImageFile(file);
                                    setRemoveImage(false);
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
                        <CardTitle className="text-lg font-medium text-slate-800">Main Question</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Textarea
                            name="question"
                            defaultValue={question.question}
                            required
                            rows={4}
                            placeholder="Type the main question..."
                            className="text-base font-medium resize-none bg-white"
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800">
                            Cue Card / Follow-up Questions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {subQuestions.map((q, i) => (
                            <div key={i} className="flex gap-2">
                                <Badge variant="secondary" className="h-9 w-9 flex items-center justify-center shrink-0 bg-slate-100 text-slate-600">
                                    {i + 1}
                                </Badge>
                                <Input
                                    value={q}
                                    onChange={(e) => {
                                        const updated = [...subQuestions];
                                        updated[i] = e.target.value;
                                        setSubQuestions(updated);
                                    }}
                                    placeholder={`Line ${i + 1}...`}
                                    className="bg-white"
                                />
                                {subQuestions.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-400 hover:text-red-500"
                                        onClick={() =>
                                            setSubQuestions((prev) =>
                                                prev.filter((_, idx) => idx !== i)
                                            )
                                        }
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSubQuestions([...subQuestions, ""])}
                            className="w-full border-dashed"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Line
                        </Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800">Suggested Ideas / Keywords</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {suggestedIdeas.map((idea, i) => (
                            <div key={i} className="flex gap-2">
                                <Input
                                    value={idea}
                                    onChange={(e) => {
                                        const updated = [...suggestedIdeas];
                                        updated[i] = e.target.value;
                                        setSuggestedIdeas(updated);
                                    }}
                                    placeholder="Keyword or idea..."
                                    className="bg-white"
                                />
                                {suggestedIdeas.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-400 hover:text-red-500"
                                        onClick={() =>
                                            setSuggestedIdeas((prev) =>
                                                prev.filter((_, idx) => idx !== i)
                                            )
                                        }
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSuggestedIdeas([...suggestedIdeas, ""])}
                            className="w-full border-dashed"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Idea
                        </Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-medium text-slate-800">Sample Answer</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 p-0">
                        <Textarea
                            name="sampleAnswer"
                            defaultValue={question.sampleAnswer}
                            rows={12}
                            placeholder="Write a sample answer..."
                            className="text-base font-serif leading-relaxed border-0 focus-visible:ring-0 resize-none p-4"
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
