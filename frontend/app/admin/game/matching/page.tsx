"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Puzzle, PenSquare, Trash2, Plus, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface MatchingGame {
  _id: string;
  category: Category;
  words: string[];
  meanings: string[];
  difficulty: "easy" | "medium" | "hard";
  status: "active" | "inactive";
  createdAt: string;
}

interface FormData {
  category: string;
  words: string[];
  meanings: string[];
  difficulty: "easy" | "medium" | "hard";
  status: "active" | "inactive";
}

export default function AdminMatchingGamePage() {
  const [games, setGames] = useState<MatchingGame[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    category: "",
    words: ["", "", "", ""],
    meanings: ["", "", "", ""],
    difficulty: "medium",
    status: "active",
  });
  const [editingGame, setEditingGame] = useState<MatchingGame | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchGames();
    fetchCategories();
  }, []);

  const fetchGames = async () => {
    try {
      const data = await apiFetch<any>("/admin/game/matching");
      setGames(data.data || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiFetch<any>("/admin/game/categories");
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...formData.words];
    newWords[index] = value;
    setFormData({ ...formData, words: newWords });
  };

  const handleMeaningChange = (index: number, value: string) => {
    const newMeanings = [...formData.meanings];
    newMeanings[index] = value;
    setFormData({ ...formData, meanings: newMeanings });
  };

  const handleSubmit = async () => {
    if (!formData.category) {
      alert("Category is required!");
      return;
    }
    if (formData.words.some((w) => !w.trim())) {
      alert("Please fill all 4 words!");
      return;
    }
    if (formData.meanings.some((m) => !m.trim())) {
      alert("Please fill all 4 meanings!");
      return;
    }

    setIsLoading(true);
    try {
      const url = editingGame
        ? `/admin/game/matching/${editingGame._id}`
        : "/admin/game/matching";

      const method = editingGame ? "PUT" : "POST";

      const result = await apiFetch<any>(url, {
        method,
        body: JSON.stringify(formData),
      });

      const updatedGame = result.data; 

      if (editingGame) {
        setGames((prev) =>
          prev.map((g) => (g._id === editingGame._id ? updatedGame : g))
        );
      } else {
        setGames((prev) => [updatedGame, ...prev]);
      }

      setFormData({
        category: "",
        words: ["", "", "", ""],
        meanings: ["", "", "", ""],
        difficulty: "medium",
        status: "active",
      });
      setEditingGame(null);

      alert(editingGame ? "Updated successfully!" : "Created successfully!");
    } catch (error: any) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (game: MatchingGame) => {
    setEditingGame(game);
    setFormData({
      category: game.category._id,
      words: [...game.words],
      meanings: [...game.meanings],
      difficulty: game.difficulty,
      status: game.status,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;

    setIsLoading(true);
    try {
      await apiFetch(`/admin/game/matching/${id}`, {
        method: "DELETE",
      });

      await fetchGames();
      alert("Deleted successfully!");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGames = filterCategory
    ? games.filter((g) => g.category._id === filterCategory)
    : games;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  };

  if(!mounted) return null;

  return (
    <div className="container mx-auto p-8 max-w-7xl">
       <div className="flex items-center gap-3 mb-8">
         <Puzzle className="w-8 h-8 text-cyan-500" />
         <h1 className="text-3xl font-bold text-slate-800">Matching Game Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="lg:col-span-1">
           <Card className="border-slate-200 shadow-sm h-fit sticky top-8">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
               <CardTitle className="text-lg">
                 {editingGame ? "Edit Game Set" : "Create New Set"}
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category: v })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="mt-1.5 bg-white">
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (
                           <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(v: "easy" | "medium" | "hard") =>
                           setFormData({ ...formData, difficulty: v })
                        }
                        disabled={isLoading}
                      >
                         <SelectTrigger className="mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                         </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v: "active" | "inactive") =>
                            setFormData({ ...formData, status: v })
                        }
                        disabled={isLoading}
                      >
                         <SelectTrigger className="mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                         </SelectContent>
                      </Select>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2">
                  <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">4 Pairs (Word - Meaning)</h3>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="mb-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                       <div className="grid grid-cols-1 gap-2">
                          <Input
                            value={formData.words[i]}
                            onChange={(e) => handleWordChange(i, e.target.value)}
                            placeholder={`English Word ${i + 1}`}
                            className="h-8 text-sm bg-white"
                            disabled={isLoading}
                          />
                          <Input
                            value={formData.meanings[i]}
                            onChange={(e) => handleMeaningChange(i, e.target.value)}
                            placeholder={`Vietnamese Meaning ${i + 1}`}
                             className="h-8 text-sm bg-white"
                             disabled={isLoading}
                          />
                       </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                    <Button onClick={handleSubmit} className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={isLoading}>
                       {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Plus className="w-4 h-4 mr-2"/> }
                       {editingGame ? "Update Game Set" : "Create Game Set"}
                    </Button>
                    
                    {editingGame && (
                        <Button
                            variant="outline"
                            onClick={() => {
                            setEditingGame(null);
                            setFormData({
                                category: "",
                                words: ["", "", "", ""],
                                meanings: ["", "", "", ""],
                                difficulty: "medium",
                                status: "active",
                            });
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2">
           <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>Game Sets ({filteredGames.length})</CardTitle>
                   <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950 min-w-[180px]">
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
               </div>
            </CardHeader>
             <CardContent className="p-6">
                {filteredGames.length === 0 ? (
                   <div className="text-center py-20">
                     <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                       <Puzzle className="w-8 h-8 text-slate-300" />
                     </div>
                     <h3 className="text-slate-900 font-medium">No game sets found</h3>
                     <p className="text-slate-500 text-sm mt-1">Select a different category or create a new set.</p>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 gap-4">
                     {filteredGames.map((game) => (
                       <div key={game._id} className="group border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-cyan-200 transition-all bg-white relative">
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(game)}>
                                 <PenSquare className="w-4 h-4 text-slate-500" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => handleDelete(game._id)}>
                                 <Trash2 className="w-4 h-4" />
                              </Button>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                             <Badge variant="outline" className="bg-slate-50 font-normal text-slate-600 border-slate-200">
                                {game.category.name}
                             </Badge>
                             <Badge variant="outline" className={`font-normal capitalize ${getDifficultyColor(game.difficulty)}`}>
                                {game.difficulty}
                             </Badge>
                             <Badge variant="outline" className={`font-normal ${getStatusColor(game.status)}`}>
                                {game.status === 'active' ? 'Active' : 'Inactive'}
                             </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                             <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">English</h4>
                                <ul className="space-y-1.5">
                                   {game.words.map((w, i) => (
                                     <li key={i} className="text-sm font-medium text-slate-700 border-l-2 border-slate-200 pl-2">
                                        {w}
                                     </li>
                                   ))}
                                </ul>
                             </div>
                             <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vietnamese</h4>
                                <ul className="space-y-1.5">
                                   {game.meanings.map((m, i) => (
                                     <li key={i} className="text-sm text-slate-600 border-l-2 border-slate-100 pl-2">
                                        {m}
                                     </li>
                                   ))}
                                </ul>
                             </div>
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
