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
import { Plus, Edit, Trash2, Search, Type, Loader2 } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select"; 
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Category {
  _id: string;
  name: string;
}

interface Word {
  _id: string;
  word: string;
  category: Category[];
  hint: string;
  meaning: string;
  usage: string;
  example: string;
  createdAt: string;
}

export default function AdminWordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategory, setFilteredCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    word: "",
    category: [] as string[],
    hint: "",
    meaning: "",
    usage: "",
    example: "",
  });
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchWords();
    fetchCategories();
  }, []);

  const fetchWords = async () => {
    try {
      const data = await apiFetch<any>("/admin/game/words");
      setWords(data.data || data || []);
    } catch (error: any) {
      alert("Lỗi tải từ vựng: " + error.message);
      setWords([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiFetch<any>("/admin/game/categories");
      setCategories(data.data || []);
    } catch (error: any) {
       console.error("Failed to load categories", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.word.trim()) {
      alert("Từ vựng là bắt buộc!");
      return;
    }
    if (formData.category.length === 0) {
      alert("Vui lòng chọn ít nhất 1 category!");
      return;
    }

    setIsLoading(true);
    try {
      const url = editingWord
        ? `/admin/game/words/${editingWord._id}`
        : "/admin/game/words";

      const method = editingWord ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      setFormData({
        word: "",
        category: [],
        hint: "",
        meaning: "",
        usage: "",
        example: "",
      });
      setEditingWord(null);
      fetchWords();
      alert(editingWord ? "Cập nhật thành công!" : "Tạo từ thành công!");
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (word: Word) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      category: word.category.map((c) => c._id),
      hint: word.hint,
      meaning: word.meaning,
      usage: word.usage,
      example: word.example,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa từ này?")) return;
    try {
      await apiFetch(`/admin/game/words/${id}`, {
        method: "DELETE",
      });
      fetchWords();
      alert("Xóa thành công!");
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    }
  };

  // Filter logic
  const filteredWords = words.filter((word) => {
    const matchesSearch = word.word
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filteredCategory ||
      word.category.some((c) => c._id === filteredCategory);
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c._id,
  }));

  if (!mounted) return null;

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
         <Type className="w-8 h-8 text-pink-600" />
         <h1 className="text-3xl font-bold text-slate-800">Word Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FORM */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm h-fit sticky top-8">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
             <CardTitle className="text-lg">
                {editingWord ? "Edit Word" : "New Word"}
             </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="word">Word *</Label>
                <Input
                  id="word"
                  value={formData.word}
                  onChange={(e) =>
                    setFormData({ ...formData, word: e.target.value })
                  }
                  placeholder="e.g. rain, computer"
                  required
                  disabled={isLoading}
                   className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="category">Categories *</Label>
                <MultiSelect
                  options={categoryOptions}
                  selected={formData.category}
                  onChange={(selected) =>
                    setFormData({ ...formData, category: selected })
                  }
                  placeholder="Select categories..."
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="hint">Hint *</Label>
                <Input
                  id="hint"
                  value={formData.hint}
                  onChange={(e) =>
                    setFormData({ ...formData, hint: e.target.value })
                  }
                  placeholder="e.g. Falls from sky..."
                  required
                  disabled={isLoading}
                   className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="meaning">Meaning (VN) *</Label>
                <Input
                  id="meaning"
                  value={formData.meaning}
                  onChange={(e) =>
                    setFormData({ ...formData, meaning: e.target.value })
                  }
                  placeholder="e.g. cơn mưa"
                  required
                  disabled={isLoading}
                   className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="usage">Usage / Context *</Label>
                <Textarea
                  id="usage"
                  value={formData.usage}
                  onChange={(e) =>
                    setFormData({ ...formData, usage: e.target.value })
                  }
                  placeholder="e.g. Noun, weather related"
                  required
                  disabled={isLoading}
                   className="bg-white resize-none"
                   rows={2}
                />
              </div>

              <div>
                <Label htmlFor="example">Example Sentence *</Label>
                <Textarea
                  id="example"
                  value={formData.example}
                  onChange={(e) =>
                    setFormData({ ...formData, example: e.target.value })
                  }
                  placeholder="e.g. The rain is heavy today."
                  required
                  disabled={isLoading}
                   className="bg-white resize-none"
                   rows={2}
                />
              </div>

              <div className="pt-2">
                  <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {editingWord ? "Update Word" : "Add Word"}
                  </Button>
    
                  {editingWord && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => {
                        setEditingWord(null);
                        setFormData({
                          word: "",
                          category: [],
                          hint: "",
                          meaning: "",
                          usage: "",
                          example: "",
                        });
                      }}
                      disabled={isLoading}>
                      Cancel
                    </Button>
                  )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* LIST */}
        <Card className="lg:col-span-3 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Word List ({filteredWords.length})</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <Input
                    placeholder="Search word..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full md:w-48 bg-white"
                  />
                </div>
                <select
                  value={filteredCategory}
                  onChange={(e) => setFilteredCategory(e.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950">
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredWords.length === 0 ? (
               <div className="text-center py-20">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Type className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-medium">No words found</h3>
                <p className="text-slate-500 text-sm mt-1">Try changing filters or add a new word.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-50/50">
                    <TableHead className="pl-6">Word</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Meaning</TableHead>
                    <TableHead className="w-[150px] text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWords.map((word) => (
                    <TableRow key={word._id} className="hover:bg-slate-50">
                      <TableCell className="pl-6">
                        <div>
                            <span className="font-bold text-slate-800">{word.word}</span>
                            <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">{word.hint}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                            {word.category.map((c) => (
                                <Badge key={c._id} variant="secondary" className="font-normal bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">
                                    {c.name}
                                </Badge>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{word.meaning}</TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-pink-600"
                            onClick={() => handleEdit(word)}
                            disabled={isLoading}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => handleDelete(word._id)}
                            disabled={isLoading}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
