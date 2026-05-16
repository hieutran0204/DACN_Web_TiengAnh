"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, PenSquare, Trash2, Plus, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface WordTopic {
  _id: string;
  name: string;
  description?: string;
  totalCards: number;
  createdAt: string;
}

export default function AdminWordTopicsPage() {
  const [topics, setTopics] = useState<WordTopic[]>([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingTopic, setEditingTopic] = useState<WordTopic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await apiFetch<any>("/admin/wordguessing/topics");
      setTopics(data.data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Topic name is required!");
      return;
    }

    setIsLoading(true);
    try {
      const url = editingTopic
        ? `/admin/wordguessing/topics/${editingTopic._id}`
        : "/admin/wordguessing/topics";

      const method = editingTopic ? "PUT" : "POST";

      await apiFetch<any>(url, {
        method,
        body: JSON.stringify(formData),
      });

      setFormData({ name: "", description: "" });
      setEditingTopic(null);
      await fetchTopics();
      alert(editingTopic ? "Updated successfully!" : "Created successfully!");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (topic: WordTopic) => {
    setEditingTopic(topic);
    setFormData({ name: topic.name, description: topic.description || "" });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this topic? All cards in this topic will also be deleted!"
      )
    )
      return;

    setIsLoading(true);
    try {
      await apiFetch(`/admin/wordguessing/topics/${id}`, {
        method: "DELETE",
      });

      await fetchTopics();
      alert("Deleted successfully!");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if(!mounted) return null;

  return (
    <div className="container mx-auto p-8 max-w-7xl">
       <div className="flex items-center gap-3 mb-8">
         <Gamepad2 className="w-8 h-8 text-amber-500" />
         <h1 className="text-3xl font-bold text-slate-800">WordGuessing Topics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="lg:col-span-1">
             <Card className="border-slate-200 shadow-sm h-fit sticky top-8">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">
                    {editingTopic ? "Edit Topic" : "Create New Topic"}
                </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                        <Label>Name *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g. Animals, Food..."
                            disabled={isLoading}
                             className="bg-white"
                        />
                        </div>

                        <div>
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Topic description..."
                            rows={3}
                            disabled={isLoading}
                             className="bg-white"
                        />
                        </div>

                        <div className="pt-2">
                            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Plus className="w-4 h-4 mr-2"/> }
                                {editingTopic ? "Update Topic" : "Create Topic"}
                            </Button>
                            
                            {editingTopic && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => {
                                        setEditingTopic(null);
                                        setFormData({ name: "", description: "" });
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle>Topics ({topics.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {topics.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Gamepad2 className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-medium">No topics yet</h3>
                            <p className="text-slate-500 text-sm mt-1">Create a topic to get started.</p>
                        </div>
                    ) : (
                         <div className="divide-y divide-slate-100">
                            {topics.map((topic) => (
                                <div key={topic._id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between group">
                                     <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-slate-800">{topic.name}</h3>
                                            <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100 h-5 px-1.5 font-normal text-[10px]">
                                                {topic.totalCards} cards
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{topic.description || "No description"}</p>
                                        <div className="text-xs text-slate-400">Created: {new Date(topic.createdAt).toLocaleDateString("vi-VN")}</div>
                                     </div>
                                     
                                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-600" onClick={() => handleEdit(topic)}>
                                            <PenSquare className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(topic._id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                     </div>
                                </div>
                            ))}
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
