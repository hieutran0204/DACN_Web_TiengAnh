"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mic,
  Loader2,
  Trash2,
  Plus,
  ChevronLeft,
  Image as ImageIcon,
  AlertCircle,
  Save,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function NewSpeakingQuestion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subQuestions, setSubQuestions] = useState<string[]>([""]);
  const [suggestedIdeas, setSuggestedIdeas] = useState<string[]>([""]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    // Process subQuestions & suggestedIdeas
    const cleanSubQuestions = subQuestions
      .map((q) => q.trim())
      .filter((q) => q);
    const cleanIdeas = suggestedIdeas.map((i) => i.trim()).filter((i) => i);

    formData.append("subQuestions", JSON.stringify(cleanSubQuestions));
    formData.append("suggestedIdeas", JSON.stringify(cleanIdeas));
    
    // Explicitly set difficult and type if they are not in form due to being Select components
    // Actually standard HTML Form submission will miss Select values if they are not hidden inputs.
    // Shadcn Select does not render a hidden input by default.
    // We need to ensure we capture them.
    // However, I see "name" props on the Select components in the UI below, but standard Select from Shadcn relies on onValueChange to update state, it doesn't just work with FormData unless we add a hidden input.
    // Wait, the previous code had Select with name="part", name="topic" (Input), name="type".
    // Shadcn Select definitely needs special handling or a hidden input.
    // The previous implementation might have been broken or relied on a version that injects hidden input?
    // To be safe, I will implement hidden inputs for the selects.
    
    // Actually, I'll rely on reading the Select values if I had state for them.
    // But wait, there is no state for `topic`, `part`, `type` etc in this component yet (except what I might add).
    // The previous code had `Select name="part"`. 
    // If I use `name` on Select from my previous knowledge, it doesn't automatically add a hidden input unless the wrapping Form handles it or it's a native Select.
    // But wait, usually `Select` from `@/components/ui/select` is Radix UI based.
    // Radix UI Select adds a hidden input with the name if provided!
    // So `name="part"` should work.
    
    try {
      await apiFetch("/admin/questions/speaking", {
        method: "POST",
        body: formData,
      });

      alert("Created Speaking Question successfully!");
      router.push("/admin/skills/speaking/questions");
    } catch (err: any) {
      console.error("Error creating question:", err);
      setError(err.message || "Connection error - please check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Create New Speaking Question
          </h1>
          <p className="text-slate-500 mt-1">
            Add a new topic for speaking practice
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

      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Metadata & Image */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
                  <Mic className="w-4 h-4" /> Basic Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Part</Label>
                  <Select name="part" required>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Part 1">Part 1</SelectItem>
                      <SelectItem value="Part 2">Part 2</SelectItem>
                      <SelectItem value="Part 3">Part 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input
                    name="topic"
                    required
                    placeholder="e.g., Hometown, Travel..."
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select name="type" required>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal_experience">
                        Personal Experience
                      </SelectItem>
                      <SelectItem value="descriptive">Descriptive</SelectItem>
                      <SelectItem value="comparative">Comparative</SelectItem>
                      <SelectItem value="opinion_based">Opinion</SelectItem>
                      <SelectItem value="cause_effect">
                        Cause & Effect
                      </SelectItem>
                      <SelectItem value="hypothetical">Hypothetical</SelectItem>
                      <SelectItem value="advantage_disadvantage">
                        Adv/Disadv
                      </SelectItem>
                      <SelectItem value="problem_solution">
                        Problem & Solution
                      </SelectItem>
                      <SelectItem value="prediction">Prediction</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select name="difficulty" defaultValue="medium">
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
                  <ImageIcon className="w-4 h-4" /> Image (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {imagePreview && (
                  <div className="rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto object-cover max-h-[200px]"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImagePreview(URL.createObjectURL(file));
                    else setImagePreview(null);
                  }}
                  className="cursor-pointer bg-white"
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-medium text-slate-800">
                  Main Question
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  name="question"
                  required
                  rows={4}
                  placeholder="e.g., Describe a time when you..."
                  className="text-base resize-none bg-white font-medium"
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
                <CardTitle className="text-lg font-medium text-slate-800">
                  Suggested Ideas / Keywords
                </CardTitle>
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
                <CardTitle className="text-lg font-medium text-slate-800">
                  Sample Answer
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 p-0">
                <Textarea
                  name="sampleAnswer"
                  rows={8}
                  placeholder="Write a sample answer here..."
                  className="text-base font-serif leading-relaxed border-0 focus-visible:ring-0 resize-none p-4"
                />
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
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 w-5 h-5" /> Create Question
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
