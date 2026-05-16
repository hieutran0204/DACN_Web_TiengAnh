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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  ChevronLeft,
  Image as ImageIcon,
  AlertCircle,
  Save,
  PenTool,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function NewWritingQuestion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      await apiFetch("/admin/questions/writing", {
        method: "POST",
        body: formData,
      });

      alert("Created Writing data successfully!");
      router.push("/admin/skills/writing/questions");
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
            Create New Writing Question
          </h1>
          <p className="text-slate-500 mt-1">
            Add a new Task 1 or Task 2 prompt
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
          {/* LEFT COLUMN: Metadata */}
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
                  <Select name="task" required>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Task 1">Task 1 (Academic)</SelectItem>
                      <SelectItem value="Task 2">Task 2 (Essay)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select name="type" required>
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
                        <SelectItem value="problem_solution">
                          Problem & Solution
                        </SelectItem>
                        <SelectItem value="cause_effect">
                          Causes & Effects
                        </SelectItem>
                        <SelectItem value="advantage_disadvantage">
                          Adv/Disadv
                        </SelectItem>
                        <SelectItem value="two_part_question">
                          Two-part Question
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input
                    name="topic"
                    required
                    placeholder="e.g. Environment, Technology..."
                    className="bg-white"
                  />
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
                  <ImageIcon className="w-4 h-4" /> Images (Task 1)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviews.map((url, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-auto object-cover max-h-[150px]"
                        />
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
                        const urls = Array.from(files).map(file => URL.createObjectURL(file));
                        setImagePreviews(urls);
                    } else {
                        setImagePreviews([]);
                    }
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
                  Question Prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  name="question"
                  required
                  rows={8}
                  placeholder="Enter the question description here..."
                  className="text-base font-medium resize-none bg-white leading-relaxed"
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-medium text-slate-800">
                  Sample Answer (Band 9.0)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 p-0">
                <Textarea
                  name="sampleAnswer"
                  rows={15}
                  className="text-base font-serif leading-relaxed border-0 focus-visible:ring-0 resize-none p-4"
                  placeholder="Write a sample answer here..."
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
